import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

interface ClaimsResponse { sub?: string }
interface ProfileRow {
  id: string;
  company_id: string | null;
  full_name: string | null;
  email: string | null;
  role: PortalRole | null;
  is_admin: boolean;
  last_sign_in_at: string | null;
  created_at: string;
  companies?: { id: string; name: string } | null;
}
interface CompanyRow { id: string; name: string; website: string | null; relationship_stage: string }
interface ClerkEmailAddress { id?: string; email_address?: string }
interface ClerkUser {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
  public_metadata?: Record<string, unknown>;
  private_metadata?: Record<string, unknown>;
  unsafe_metadata?: Record<string, unknown>;
  created_at?: number;
  updated_at?: number;
  last_sign_in_at?: number | null;
}

type PortalRole = "ADMIN" | "CLIENT" | "BUM";
type Action = "list" | "sync" | "update_access" | "create_support_link";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const sharedEmailDomains = new Set(["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "aol.com", "live.com", "msn.com", "proton.me"]);
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const clerkSecretKey = Deno.env.get("CLERK_SECRET_KEY");
const clerkFrontendApiUrl = Deno.env.get("CLERK_FRONTEND_API_URL");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) throw new Error("Missing bearer token.");
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) throw new Error("Missing bearer token.");
  return token;
}

function decodeBase64Url(segment: string) {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(normalized + padding);
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
  if (!configuredIssuer) throw new Error("The allowed Clerk issuer is not configured for Clerk troubleshooting tools.");
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
    .select("id, company_id, full_name, email, role, is_admin, last_sign_in_at, created_at")
    .eq("id", currentUserId)
    .maybeSingle<ProfileRow>();
  if (error || !data) throw new Error("Unable to verify the current Trusted Bums profile.");
  if (!data.is_admin && data.role !== "ADMIN") throw new Error("Only admins can use Clerk troubleshooting tools.");
  return data;
}

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readRole(value: unknown): PortalRole | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return normalized === "ADMIN" || normalized === "CLIENT" || normalized === "BUM" ? normalized : null;
}

function readMetadata(user: ClerkUser) {
  const publicMetadata = user.public_metadata ?? {};
  const unsafeMetadata = user.unsafe_metadata ?? {};
  const role = readRole(publicMetadata.role) ?? readRole(publicMetadata.signupIntent) ?? readRole(unsafeMetadata.role) ?? readRole(unsafeMetadata.signupIntent);
  const companyId = cleanString(publicMetadata.companyId) ?? cleanString(publicMetadata.clientCompanyId) ?? cleanString(unsafeMetadata.companyId) ?? cleanString(unsafeMetadata.clientCompanyId);
  const companyName =
    cleanString(publicMetadata.clientCompanyName) ??
    cleanString(publicMetadata.companyName) ??
    cleanString(unsafeMetadata.clientCompanyName) ??
    cleanString(unsafeMetadata.companyName);
  const companyWebsite = cleanString(publicMetadata.companyWebsite) ?? cleanString(publicMetadata.clientCompanyWebsite) ?? cleanString(unsafeMetadata.companyWebsite) ?? cleanString(unsafeMetadata.clientCompanyWebsite);
  return { role, companyId, companyName, companyWebsite };
}

function primaryEmail(user: ClerkUser) {
  const primary = (user.email_addresses ?? []).find((email) => email.id && email.id === user.primary_email_address_id);
  return (primary?.email_address ?? user.email_addresses?.[0]?.email_address ?? "").trim().toLowerCase();
}

function displayName(user: ClerkUser, email: string) {
  const fullName = cleanString(user.full_name) ?? [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return fullName || email;
}

function timestampMsToIso(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? new Date(value).toISOString() : null;
}

function normalizeDomain(value?: string | null) {
  if (!value) return null;
  const withoutProtocol = value.trim().toLowerCase().replace(/^https?:\/\//, "");
  const host = withoutProtocol.split("/")[0]?.replace(/^www\./, "").replace(/\.$/, "");
  return host || null;
}

function businessDomainFromEmail(email: string) {
  const domain = normalizeDomain(email.split("@")[1]);
  return domain && !sharedEmailDomains.has(domain) ? domain : null;
}

async function clerkFetch(path: string, init: RequestInit = {}) {
  if (!clerkSecretKey) throw new Error("Set CLERK_SECRET_KEY in Supabase Edge Function secrets before using Clerk tools.");
  const response = await fetch("https://api.clerk.com/v1" + path, {
    ...init,
    headers: {
      Authorization: "Bearer " + clerkSecretKey,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = Array.isArray(payload?.errors)
      ? payload.errors[0]?.long_message || payload.errors[0]?.message
      : undefined;
    throw new Error(error || `Clerk rejected the request with HTTP ${response.status}.`);
  }
  return payload;
}

async function listClerkUsers(input: { emails?: string[]; userIds?: string[]; query?: string | null; limit?: number }) {
  const params = new URLSearchParams({ limit: String(input.limit ?? 50), offset: "0", order_by: "-created_at" });
  for (const email of input.emails ?? []) params.append("email_address[]", email);
  for (const userId of input.userIds ?? []) params.append("user_id[]", userId);
  if (input.query) params.set("query", input.query);
  const payload = await clerkFetch("/users?" + params.toString());
  return (Array.isArray(payload) ? payload : payload.data ?? []) as ClerkUser[];
}

async function getClerkUser(userId: string) {
  return (await clerkFetch("/users/" + encodeURIComponent(userId))) as ClerkUser;
}

async function updateClerkMetadata(userId: string, publicMetadata: Record<string, unknown>, privateMetadata?: Record<string, unknown>) {
  return (await clerkFetch("/users/" + encodeURIComponent(userId) + "/metadata", {
    method: "PATCH",
    body: JSON.stringify({ public_metadata: publicMetadata, private_metadata: privateMetadata }),
  })) as ClerkUser;
}

async function createSignInToken(userId: string, expiresInSeconds: number) {
  return (await clerkFetch("/sign_in_tokens", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, expires_in_seconds: expiresInSeconds }),
  })) as { id?: string; token?: string; url?: string; status?: string };
}

async function getCompanyById(companyId?: string | null) {
  if (!companyId) return null;
  const { data, error } = await supabaseAdmin
    .from("companies")
    .select("id, name, website, relationship_stage")
    .eq("id", companyId)
    .maybeSingle<CompanyRow>();
  if (error) throw error;
  return data;
}

async function getCompanyByName(companyName?: string | null) {
  if (!companyName) return null;
  const { data, error } = await supabaseAdmin
    .from("companies")
    .select("id, name, website, relationship_stage")
    .ilike("name", companyName.trim())
    .limit(1)
    .maybeSingle<CompanyRow>();
  if (error) throw error;
  return data;
}

async function ensureCompany(input: { companyId?: string | null; companyName?: string | null; companyWebsite?: string | null; email?: string | null }) {
  const byId = await getCompanyById(input.companyId);
  if (byId) {
    await supabaseAdmin.from("companies").update({ relationship_stage: "CLIENT" }).eq("id", byId.id);
    return byId;
  }

  const companyName = input.companyName?.trim();
  if (!companyName) return null;
  const byName = await getCompanyByName(companyName);
  if (byName) {
    await supabaseAdmin.from("companies").update({ relationship_stage: "CLIENT" }).eq("id", byName.id);
    return byName;
  }

  const website = normalizeDomain(input.companyWebsite) ?? businessDomainFromEmail(input.email ?? "");
  const { data, error } = await supabaseAdmin
    .from("companies")
    .insert({ name: companyName, website, relationship_stage: "CLIENT" })
    .select("id, name, website, relationship_stage")
    .single<CompanyRow>();
  if (error) throw error;
  return data;
}

async function loadProfilesForUsers(users: ClerkUser[]) {
  const ids = users.map((user) => user.id).filter((id): id is string => Boolean(id));
  if (!ids.length) return new Map<string, ProfileRow>();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, company_id, full_name, email, role, is_admin, last_sign_in_at, created_at, companies(id, name)")
    .in("id", ids)
    .returns<ProfileRow[]>();
  if (error) throw error;
  return new Map((data ?? []).map((profile) => [profile.id, profile]));
}

function summarizeUser(user: ClerkUser, profile?: ProfileRow | null) {
  const email = primaryEmail(user);
  const metadata = readMetadata(user);
  return {
    id: user.id ?? null,
    email,
    name: displayName(user, email),
    createdAt: timestampMsToIso(user.created_at),
    updatedAt: timestampMsToIso(user.updated_at),
    lastSignInAt: timestampMsToIso(user.last_sign_in_at),
    publicMetadata: user.public_metadata ?? {},
    privateMetadata: user.private_metadata ?? {},
    unsafeMetadata: user.unsafe_metadata ?? {},
    metadata,
    profile: profile
      ? {
          id: profile.id,
          companyId: profile.company_id,
          companyName: profile.companies?.name ?? null,
          fullName: profile.full_name,
          email: profile.email,
          role: profile.role,
          isAdmin: profile.is_admin,
          createdAt: profile.created_at,
          lastSignInAt: profile.last_sign_in_at,
        }
      : null,
  };
}

async function syncOneUser(user: ClerkUser, override?: { role?: PortalRole; companyId?: string | null; companyName?: string | null; companyWebsite?: string | null }) {
  const id = user.id?.trim();
  const email = primaryEmail(user);
  const metadata = readMetadata(user);
  const role = override?.role ?? metadata.role;
  const company = role === "CLIENT"
    ? await ensureCompany({
        companyId: override?.companyId ?? metadata.companyId,
        companyName: override?.companyName ?? metadata.companyName,
        companyWebsite: override?.companyWebsite ?? metadata.companyWebsite,
        email,
      })
    : null;

  if (!id || !email) return { synced: false, id, email, reason: "Missing Clerk user ID or primary email." };
  if (!role) return { synced: false, id, email, reason: "Missing Client/Bum/Admin metadata." };
  if (role === "CLIENT" && !company) return { synced: false, id, email, reason: "Client user needs a company metadata value or selected client." };

  const payload = {
    id,
    company_id: role === "CLIENT" ? company?.id ?? null : null,
    full_name: displayName(user, email),
    email,
    role,
    is_admin: role === "ADMIN",
    created_at: timestampMsToIso(user.created_at) ?? undefined,
    last_sign_in_at: timestampMsToIso(user.last_sign_in_at) ?? new Date().toISOString(),
  };
  const { error } = await supabaseAdmin.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  return { synced: true, id, email, role, companyId: company?.id ?? null, companyName: company?.name ?? null };
}

function inputStrings(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => cleanString(item)).filter((item): item is string => Boolean(item))
    : [];
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });

  try {
    const currentProfile = await getCurrentProfile(getBearerToken(request));
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = cleanString(body.action) as Action | null;

    if (action === "list") {
      const users = await listClerkUsers({
        emails: inputStrings(body.emails).map((email) => email.toLowerCase()),
        userIds: inputStrings(body.userIds),
        query: cleanString(body.query),
        limit: typeof body.limit === "number" ? Math.min(Math.max(Math.floor(body.limit), 1), 100) : 50,
      });
      const profiles = await loadProfilesForUsers(users);
      return json(200, { users: users.map((user) => summarizeUser(user, user.id ? profiles.get(user.id) : null)) });
    }

    if (action === "sync") {
      const users = await listClerkUsers({
        emails: inputStrings(body.emails).map((email) => email.toLowerCase()),
        userIds: inputStrings(body.userIds),
        query: cleanString(body.query),
        limit: typeof body.limit === "number" ? Math.min(Math.max(Math.floor(body.limit), 1), 100) : 50,
      });
      const results = [];
      for (const user of users) results.push(await syncOneUser(user));
      await supabaseAdmin.from("audit_events").insert({
        user_id: currentProfile.id,
        event_type: "clerk_users_synced",
        entity_type: "profiles",
        event_data: { source: "clerk_user_tools", syncedCount: results.filter((result) => result.synced).length, skippedCount: results.filter((result) => !result.synced).length },
      });
      return json(200, { results });
    }

    if (action === "update_access") {
      const userId = cleanString(body.userId);
      const role = readRole(body.role);
      if (!userId || !role) return json(400, { error: "Choose a Clerk user and role." });
      const clerkUser = await getClerkUser(userId);
      const email = primaryEmail(clerkUser);
      const company = role === "CLIENT"
        ? await ensureCompany({
            companyId: cleanString(body.companyId),
            companyName: cleanString(body.companyName),
            companyWebsite: cleanString(body.companyWebsite),
            email,
          })
        : null;
      if (role === "CLIENT" && !company) return json(400, { error: "Select or enter a client company before assigning Client access." });

      const updatedUser = await updateClerkMetadata(userId, {
        role,
        signupIntent: role,
        companyId: role === "CLIENT" ? company?.id ?? null : null,
        clientCompanyId: role === "CLIENT" ? company?.id ?? null : null,
        companyName: role === "CLIENT" ? company?.name ?? null : null,
        clientCompanyName: role === "CLIENT" ? company?.name ?? null : null,
      }, {
        trustedBumsUpdatedBy: currentProfile.id,
        trustedBumsUpdatedAt: new Date().toISOString(),
      });
      const syncResult = await syncOneUser(updatedUser, {
        role,
        companyId: role === "CLIENT" ? company?.id ?? null : null,
        companyName: role === "CLIENT" ? company?.name ?? null : null,
      });
      await supabaseAdmin.from("audit_events").insert({
        user_id: currentProfile.id,
        event_type: "clerk_user_access_updated",
        entity_type: "profiles",
        event_data: { clerkUserId: userId, email, role, companyId: company?.id ?? null, companyName: company?.name ?? null },
      });
      return json(200, { user: summarizeUser(updatedUser, null), syncResult });
    }

    if (action === "create_support_link") {
      const userId = cleanString(body.userId);
      if (!userId) return json(400, { error: "Choose a Clerk user before creating a support link." });
      const expiresInSeconds = typeof body.expiresInSeconds === "number" ? Math.min(Math.max(Math.floor(body.expiresInSeconds), 300), 86400) : 1800;
      const token = await createSignInToken(userId, expiresInSeconds);
      await supabaseAdmin.from("audit_events").insert({
        user_id: currentProfile.id,
        event_type: "clerk_support_link_created",
        entity_type: "clerk_users",
        event_data: { clerkUserId: userId, expiresInSeconds, signInTokenId: token.id ?? null },
      });
      return json(200, { url: token.url ?? null, token: token.token ?? null, expiresInSeconds });
    }

    return json(400, { error: "Choose a valid Clerk troubleshooting action." });
  } catch (error) {
    return json(400, { error: error instanceof Error ? error.message : "Unable to run Clerk troubleshooting tool." });
  }
});
