import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

interface ClaimsResponse { sub?: string }
interface ProfileRow { id: string; email: string | null; role: string | null; is_admin: boolean }
interface CompanyRow { id: string; name: string }
interface ClerkEmailAddress { id?: string; email_address?: string }
interface ClerkUser {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
  public_metadata?: Record<string, unknown>;
  unsafe_metadata?: Record<string, unknown>;
  created_at?: number;
  last_sign_in_at?: number | null;
}

type PortalRole = "ADMIN" | "CLIENT" | "BUM";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

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

function resolveClerkJwksUrl(issuer?: string) {
  const candidate = issuer?.trim() || clerkFrontendApiUrl?.trim();
  if (!candidate) throw new Error("Unable to determine the Clerk JWKS endpoint for this session.");
  return new URL("/.well-known/jwks.json", candidate).toString();
}

async function getCurrentProfile(token: string) {
  const payload = parseJwtPayload(token);
  const { payload: verifiedPayload } = await jose.jwtVerify(
    token,
    jose.createRemoteJWKSet(new URL(resolveClerkJwksUrl(payload.iss))),
    payload.iss ? { issuer: payload.iss } : undefined,
  );
  const currentUserId = (verifiedPayload as ClaimsResponse).sub?.trim();
  if (!currentUserId) throw new Error("The verified Clerk session did not include a user ID.");

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role, is_admin")
    .eq("id", currentUserId)
    .maybeSingle<ProfileRow>();
  if (error || !data) throw new Error("Unable to verify the current Trusted Bums profile.");
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
  const role = readRole(publicMetadata.role) ?? readRole(publicMetadata.signupIntent);
  const companyName =
    cleanString(publicMetadata.clientCompanyName) ??
    cleanString(publicMetadata.companyName);
  return { role, companyName };
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

function businessDomainFromEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domain || ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "aol.com"].includes(domain)) {
    return null;
  }
  return domain;
}

async function ensureCompany(companyName: string, email: string) {
  const { data: existing, error: readError } = await supabaseAdmin
    .from("companies")
    .select("id, name")
    .ilike("name", companyName)
    .limit(1)
    .maybeSingle<CompanyRow>();
  if (readError) throw readError;
  if (existing) {
    await supabaseAdmin.from("companies").update({ relationship_stage: "CLIENT" }).eq("id", existing.id);
    return existing.id;
  }

  const { data, error } = await supabaseAdmin
    .from("companies")
    .insert({ name: companyName, website: businessDomainFromEmail(email), relationship_stage: "CLIENT" })
    .select("id, name")
    .single<CompanyRow>();
  if (error) throw error;
  return data.id;
}

async function listClerkUsers(input: { emails: string[]; limit: number }) {
  if (!clerkSecretKey) throw new Error("Set CLERK_SECRET_KEY in Supabase Edge Function secrets before syncing Clerk users.");
  const params = new URLSearchParams({ limit: String(input.limit), offset: "0", order_by: "-created_at" });
  for (const email of input.emails) params.append("email_address[]", email);
  const response = await fetch("https://api.clerk.com/v1/users?" + params.toString(), {
    headers: { Authorization: "Bearer " + clerkSecretKey, Accept: "application/json" },
  });
  const payload = (await response.json().catch(() => ({}))) as ClerkUser[] | { data?: ClerkUser[]; errors?: Array<{ message?: string; long_message?: string }> };
  if (!response.ok) {
    const apiError = Array.isArray(payload) ? null : payload.errors?.[0]?.long_message || payload.errors?.[0]?.message;
    throw new Error(apiError || "Clerk rejected the user sync request with HTTP " + response.status + ".");
  }
  return Array.isArray(payload) ? payload : payload.data ?? [];
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });

  try {
    const token = getBearerToken(request);
    const currentProfile = await getCurrentProfile(token);
    if (!currentProfile.is_admin && currentProfile.role !== "ADMIN") {
      return json(403, { error: "Only admins can sync Clerk users." });
    }

    const body = (await request.json().catch(() => ({}))) as { emails?: unknown; limit?: unknown };
    const emails = Array.isArray(body.emails)
      ? body.emails.map((email) => cleanString(email)?.toLowerCase()).filter((email): email is string => Boolean(email))
      : [];
    const limit = typeof body.limit === "number" && Number.isFinite(body.limit) ? Math.min(Math.max(Math.floor(body.limit), 1), 100) : 25;
    const users = await listClerkUsers({ emails, limit });
    const synced: Array<{ id: string; email: string; role: PortalRole; companyName?: string | null }> = [];
    const skipped: Array<{ id?: string; email?: string; reason: string }> = [];

    for (const clerkUser of users) {
      const id = clerkUser.id?.trim();
      const email = primaryEmail(clerkUser);
      const { role, companyName } = readMetadata(clerkUser);

      if (!id || !email) {
        skipped.push({ id, email, reason: "Missing Clerk user ID or primary email." });
        continue;
      }
      if (!role || role === "ADMIN") {
        skipped.push({ id, email, reason: "Missing Client/Bum signup metadata." });
        continue;
      }
      if (role === "CLIENT" && !companyName) {
        skipped.push({ id, email, reason: "Client signup is missing company metadata." });
        continue;
      }

      const companyId = role === "CLIENT" && companyName ? await ensureCompany(companyName, email) : null;
      const { error } = await supabaseAdmin.from("profiles").upsert(
        {
          id,
          company_id: companyId,
          full_name: displayName(clerkUser, email),
          email,
          role,
          is_admin: false,
          created_at: timestampMsToIso(clerkUser.created_at) ?? undefined,
          last_sign_in_at: timestampMsToIso(clerkUser.last_sign_in_at) ?? new Date().toISOString(),
        },
        { onConflict: "id" },
      );
      if (error) throw error;
      synced.push({ id, email, role, companyName: companyName ?? null });
    }

    await supabaseAdmin.from("audit_events").insert({
      user_id: currentProfile.id,
      event_type: "clerk_users_synced",
      entity_type: "profiles",
      event_data: { syncedCount: synced.length, skippedCount: skipped.length, emails: emails.length ? emails : null },
    });

    return json(200, { synced, skipped });
  } catch (error) {
    return json(400, { error: error instanceof Error ? error.message : "Unable to sync Clerk users." });
  }
});
