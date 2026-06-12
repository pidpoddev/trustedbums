import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

type ApiAccessOperation =
  | "list_self"
  | "create_self"
  | "refresh_self"
  | "revoke_self"
  | "list_admin"
  | "create_for_profile"
  | "refresh_admin"
  | "revoke_admin";

interface ClaimsResponse { sub?: string }
interface ProfileRow {
  id: string;
  company_id: string | null;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_admin: boolean;
  client_access_role: string | null;
}
interface ApiAccessKeyRow {
  id: string;
  clerk_api_key_id: string;
  subject_user_id: string;
  company_id: string;
  name: string;
  description: string | null;
  scopes: string[];
  claims: Record<string, unknown>;
  token_prefix: string | null;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  expires_at: string | null;
  revoked_at: string | null;
  revocation_reason: string | null;
  created_by: string | null;
  refreshed_from_id: string | null;
  created_at: string;
  updated_at: string;
}

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const clerkFrontendApiUrl = Deno.env.get("CLERK_FRONTEND_API_URL");
const clerkSecretKey = Deno.env.get("CLERK_SECRET_KEY");
const apiKeyLifetimeSeconds = Number(Deno.env.get("API_ACCESS_KEY_LIFETIME_SECONDS") ?? 180 * 24 * 60 * 60);
const allowedScopes = [
  "trustedbums:client:read",
  "trustedbums:client:write",
  "trustedbums:inbox:read",
  "trustedbums:inbox:send",
];

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) throw new Error("Missing bearer token.");
  return authorization.slice("Bearer ".length).trim();
}

function decodeBase64Url(segment: string) {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
}

function parseJwtPayload(token: string) {
  const payloadSegment = token.split(".")[1] ?? "";
  if (!payloadSegment) throw new Error("The current session token is malformed.");
  return JSON.parse(decodeBase64Url(payloadSegment)) as ClaimsResponse & { iss?: string };
}

function normalizeIssuer(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function resolveAllowedClerkIssuer(issuer?: string) {
  const configuredIssuer = clerkFrontendApiUrl?.trim();
  if (!configuredIssuer) throw new Error("The allowed Clerk issuer is not configured for API access keys.");
  const allowedIssuer = normalizeIssuer(configuredIssuer);
  if (issuer && normalizeIssuer(issuer) !== allowedIssuer) {
    throw new Error("This Clerk session was issued by an unapproved tenant.");
  }
  return allowedIssuer;
}

async function getCurrentProfile(token: string) {
  const payload = parseJwtPayload(token);
  const allowedIssuer = resolveAllowedClerkIssuer(payload.iss);
  const jwksUrl = new URL("/.well-known/jwks.json", allowedIssuer).toString();
  const { payload: verifiedPayload } = await jose.jwtVerify(
    token,
    jose.createRemoteJWKSet(new URL(jwksUrl)),
    { issuer: allowedIssuer },
  );
  const currentUserId = (verifiedPayload as ClaimsResponse).sub?.trim();
  if (!currentUserId) throw new Error("The verified Clerk session did not include a user ID.");

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, company_id, full_name, email, role, is_admin, client_access_role")
    .eq("id", currentUserId)
    .maybeSingle<ProfileRow>();

  if (error || !data) throw new Error("Unable to verify the current Trusted Bums profile.");
  return data;
}

function isAdmin(profile: ProfileRow) {
  return profile.is_admin || profile.role?.toUpperCase() === "ADMIN";
}

function canManageClientApiAccess(profile: ProfileRow) {
  return (
    profile.role?.toUpperCase() === "CLIENT" &&
    Boolean(profile.company_id) &&
    (profile.client_access_role === "CLIENT_ADMIN" || profile.client_access_role === "CLIENT_IT")
  );
}

function requireClerkSecret() {
  if (!clerkSecretKey) throw new Error("CLERK_SECRET_KEY is not configured for API key management.");
  return clerkSecretKey;
}

function cleanScopes(value: unknown) {
  if (!Array.isArray(value)) return allowedScopes;
  const scopes = Array.from(new Set(value.filter((scope): scope is string => typeof scope === "string" && allowedScopes.includes(scope))));
  return scopes.length ? scopes : allowedScopes;
}

function secretPrefix(secret?: unknown) {
  if (typeof secret !== "string" || !secret.trim()) return null;
  const value = secret.trim();
  return value.length <= 12 ? value : `${value.slice(0, 8)}...${value.slice(-4)}`;
}

async function clerkRequest<T>(path: string, init: RequestInit, context: string) {
  const response = await fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${requireClerkSecret()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T & { errors?: Array<{ message?: string; long_message?: string }>; error?: string; message?: string };
  if (!response.ok) {
    const clerkMessage = payload.errors?.map((error) => error.long_message ?? error.message).filter(Boolean).join("; ");
    throw new Error(clerkMessage || payload.message || payload.error || `${context} failed with HTTP ${response.status}.`);
  }
  return payload;
}

async function createClerkApiKey(input: {
  subject: string;
  name: string;
  description: string;
  scopes: string[];
  claims: Record<string, unknown>;
  createdBy: string;
}) {
  return await clerkRequest<Record<string, unknown>>(
    "/api_keys",
    {
      method: "POST",
      body: JSON.stringify({
        subject: input.subject,
        name: input.name,
        description: input.description,
        scopes: input.scopes,
        claims: input.claims,
        createdBy: input.createdBy,
        secondsUntilExpiration: Number.isFinite(apiKeyLifetimeSeconds) ? apiKeyLifetimeSeconds : 180 * 24 * 60 * 60,
      }),
    },
    "Clerk API key creation",
  );
}

async function revokeClerkApiKey(clerkApiKeyId: string, reason: string) {
  return await clerkRequest<Record<string, unknown>>(
    `/api_keys/${encodeURIComponent(clerkApiKeyId)}/revoke`,
    { method: "POST", body: JSON.stringify({ revocationReason: reason }) },
    "Clerk API key revocation",
  );
}

function clerkString(payload: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function clerkDate(payload: Record<string, unknown>, ...keys: string[]) {
  const value = clerkString(payload, ...keys);
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

async function markActiveKeysRevoked(subjectUserId: string, companyId: string, reason: string) {
  const { data: activeKeys, error } = await supabaseAdmin
    .from("api_access_keys")
    .select("*")
    .eq("subject_user_id", subjectUserId)
    .eq("company_id", companyId)
    .eq("status", "ACTIVE")
    .returns<ApiAccessKeyRow[]>();
  if (error) throw error;

  for (const key of activeKeys ?? []) {
    await revokeClerkApiKey(key.clerk_api_key_id, reason).catch((error) => console.warn("Clerk key revoke failed", error));
    await supabaseAdmin
      .from("api_access_keys")
      .update({ status: "REVOKED", revoked_at: new Date().toISOString(), revocation_reason: reason })
      .eq("id", key.id);
  }

  return activeKeys?.[0] ?? null;
}

async function insertApiKeyRecord(input: {
  clerkPayload: Record<string, unknown>;
  subject: ProfileRow;
  actor: ProfileRow;
  companyId: string;
  name: string;
  description: string;
  scopes: string[];
  claims: Record<string, unknown>;
  refreshedFromId?: string | null;
}) {
  const clerkApiKeyId = clerkString(input.clerkPayload, "id", "api_key_id", "apiKeyId");
  if (!clerkApiKeyId) throw new Error("Clerk did not return an API key ID.");

  const secret = clerkString(input.clerkPayload, "secret", "token", "api_key", "apiKey");
  const { data, error } = await supabaseAdmin
    .from("api_access_keys")
    .insert({
      clerk_api_key_id: clerkApiKeyId,
      subject_user_id: input.subject.id,
      company_id: input.companyId,
      name: input.name,
      description: input.description,
      scopes: input.scopes,
      claims: input.claims,
      token_prefix: secretPrefix(secret) ?? clerkString(input.clerkPayload, "token_prefix", "tokenPrefix"),
      expires_at: clerkDate(input.clerkPayload, "expires_at", "expiresAt", "expiration"),
      created_by: input.actor.id,
      refreshed_from_id: input.refreshedFromId ?? null,
    })
    .select("*")
    .single<ApiAccessKeyRow>();

  if (error) throw error;
  return { key: data, secret };
}

async function auditApiKeyEvent(profile: ProfileRow, eventType: string, entityId?: string | null, companyId?: string | null, eventData: Record<string, unknown> = {}) {
  const { error } = await supabaseAdmin.from("audit_events").insert({
    company_id: companyId ?? profile.company_id ?? null,
    user_id: profile.id,
    event_type: eventType,
    entity_type: "api_access_keys",
    entity_id: entityId ?? null,
    event_data: eventData,
  });
  if (error) console.warn("Unable to write API access key audit event", error);
}

async function getProfileById(profileId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, company_id, full_name, email, role, is_admin, client_access_role")
    .eq("id", profileId)
    .maybeSingle<ProfileRow>();
  if (error || !data) throw new Error("Choose a valid client profile.");
  return data;
}

function requireEligibleSubject(subject: ProfileRow) {
  if (subject.role?.toUpperCase() !== "CLIENT" || !subject.company_id) {
    throw new Error("API keys can only be issued to client profiles linked to a company.");
  }
  if (subject.client_access_role !== "CLIENT_ADMIN" && subject.client_access_role !== "CLIENT_IT") {
    throw new Error("Only Client Admin and Client IT profiles can own API keys.");
  }
}

async function issueKey(actor: ProfileRow, subject: ProfileRow, requestedScopes: unknown, reason: string) {
  requireEligibleSubject(subject);
  const scopes = cleanScopes(requestedScopes);
  const companyId = subject.company_id!;
  const refreshedFrom = await markActiveKeysRevoked(subject.id, companyId, reason);
  const name = `TrustedBums API - ${subject.full_name ?? subject.email ?? subject.id}`;
  const description = "Trusted Bums client API access key";
  const claims = {
    trustedbums: {
      company_id: companyId,
      subject_profile_id: subject.id,
      client_access_role: subject.client_access_role,
      issued_by_profile_id: actor.id,
    },
  };
  const clerkPayload = await createClerkApiKey({
    subject: subject.id,
    name,
    description,
    scopes,
    claims,
    createdBy: actor.id,
  });
  const result = await insertApiKeyRecord({ clerkPayload, subject, actor, companyId, name, description, scopes, claims, refreshedFromId: refreshedFrom?.id ?? null });
  await auditApiKeyEvent(actor, refreshedFrom ? "api_access_key_refreshed" : "api_access_key_created", result.key.id, companyId, {
    subjectUserId: subject.id,
    scopes,
    refreshedFromId: refreshedFrom?.id ?? null,
  });
  return result;
}

async function revokeLocalKey(actor: ProfileRow, keyId: string, reason: string, selfOnly: boolean) {
  const { data: key, error } = await supabaseAdmin
    .from("api_access_keys")
    .select("*")
    .eq("id", keyId)
    .maybeSingle<ApiAccessKeyRow>();
  if (error || !key) throw new Error("Choose a valid API key.");
  if (selfOnly && (key.subject_user_id !== actor.id || key.company_id !== actor.company_id)) {
    throw new Error("You can only revoke your own company API key.");
  }
  await revokeClerkApiKey(key.clerk_api_key_id, reason);
  const { data, error: updateError } = await supabaseAdmin
    .from("api_access_keys")
    .update({ status: "REVOKED", revoked_at: new Date().toISOString(), revocation_reason: reason })
    .eq("id", key.id)
    .select("*")
    .single<ApiAccessKeyRow>();
  if (updateError) throw updateError;
  await auditApiKeyEvent(actor, "api_access_key_revoked", data.id, data.company_id, { subjectUserId: data.subject_user_id, reason });
  return data;
}

async function listSelf(profile: ProfileRow) {
  if (!canManageClientApiAccess(profile)) throw new Error("Only Client Admin and Client IT users can manage API access.");
  const { data, error } = await supabaseAdmin
    .from("api_access_keys")
    .select("*, profiles:subject_user_id(id, full_name, email, client_access_role), companies(id, name)")
    .eq("company_id", profile.company_id)
    .eq("subject_user_id", profile.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function listAdmin() {
  const [{ data: keys, error: keyError }, { data: eligibleProfiles, error: profileError }] = await Promise.all([
    supabaseAdmin
      .from("api_access_keys")
      .select("*, profiles:subject_user_id(id, full_name, email, client_access_role), companies(id, name)")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("profiles")
      .select("id, company_id, full_name, email, role, is_admin, client_access_role, companies(id, name)")
      .eq("role", "CLIENT")
      .in("client_access_role", ["CLIENT_ADMIN", "CLIENT_IT"])
      .is("disabled_at", null)
      .order("email", { ascending: true }),
  ]);
  if (keyError) throw keyError;
  if (profileError) throw profileError;
  return { keys: keys ?? [], eligibleProfiles: eligibleProfiles ?? [] };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Use POST for API access key operations." });

  try {
    const profile = await getCurrentProfile(getBearerToken(request));
    const body = (await request.json().catch(() => ({}))) as { operation?: ApiAccessOperation; keyId?: string; profileId?: string; scopes?: string[] };
    const operation = body.operation;
    if (!operation) throw new Error("Choose an API access key operation.");

    if (operation === "list_self") return json(200, { data: await listSelf(profile) });
    if (operation === "create_self" || operation === "refresh_self") {
      if (!canManageClientApiAccess(profile)) throw new Error("Only Client Admin and Client IT users can manage API access.");
      return json(200, { data: await issueKey(profile, profile, body.scopes, operation === "refresh_self" ? "self_refresh" : "self_create") });
    }
    if (operation === "revoke_self") {
      if (!body.keyId) throw new Error("Choose the API key to revoke.");
      if (!canManageClientApiAccess(profile)) throw new Error("Only Client Admin and Client IT users can manage API access.");
      return json(200, { data: await revokeLocalKey(profile, body.keyId, "self_revoke", true) });
    }

    if (!isAdmin(profile)) throw new Error("Admin access is required.");
    if (operation === "list_admin") return json(200, { data: await listAdmin() });
    if (operation === "create_for_profile") {
      if (!body.profileId) throw new Error("Choose the client profile that will own this key.");
      const subject = await getProfileById(body.profileId);
      return json(200, { data: await issueKey(profile, subject, body.scopes, "admin_create") });
    }
    if (operation === "refresh_admin") {
      if (!body.keyId) throw new Error("Choose the API key to refresh.");
      const { data: key, error } = await supabaseAdmin.from("api_access_keys").select("*").eq("id", body.keyId).maybeSingle<ApiAccessKeyRow>();
      if (error || !key) throw new Error("Choose a valid API key.");
      const subject = await getProfileById(key.subject_user_id);
      return json(200, { data: await issueKey(profile, subject, key.scopes, "admin_refresh") });
    }
    if (operation === "revoke_admin") {
      if (!body.keyId) throw new Error("Choose the API key to revoke.");
      return json(200, { data: await revokeLocalKey(profile, body.keyId, "admin_revoke", false) });
    }

    throw new Error("Unknown API access key operation.");
  } catch (error) {
    console.error("API access key operation failed", error);
    return json(400, { error: error instanceof Error ? error.message : "Unable to manage API access keys." });
  }
});
