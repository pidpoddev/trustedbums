import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

interface ClaimsResponse { sub?: string }
interface ProfileRow { id: string; role: string | null; is_admin: boolean }
type Action = "list" | "approve" | "deny";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const clerkFrontendApiUrl = Deno.env.get("CLERK_FRONTEND_API_URL");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
}

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeDomain(value?: string | null) {
  if (!value) return null;
  const withoutProtocol = value.trim().toLowerCase().replace(/^https?:\/\//, "");
  const host = withoutProtocol.split("/")[0]?.replace(/^www\./, "").replace(/\.$/, "").split(":")[0];
  return host || null;
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

async function getCurrentAdmin(token: string) {
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
    .select("id, role, is_admin")
    .eq("id", currentUserId)
    .maybeSingle<ProfileRow>();
  if (error || !data) throw new Error("Unable to verify the current Trusted Bums profile.");
  if (!data.is_admin && data.role !== "ADMIN") throw new Error("Only admins can review company access requests.");
  return data;
}

async function listRequests() {
  const { data, error } = await supabaseAdmin
    .from("client_company_access_requests")
    .select("*, companies(id, name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function approveRequest(admin: ProfileRow, requestId: string) {
  const { data: accessRequest, error: readError } = await supabaseAdmin
    .from("client_company_access_requests")
    .select("*")
    .eq("id", requestId)
    .eq("status", "pending")
    .maybeSingle<Record<string, string | null>>();
  if (readError) throw readError;
  if (!accessRequest) throw new Error("Choose a pending access request.");

  let companyId = accessRequest.company_id;
  if (accessRequest.request_type === "PUBLIC_EMAIL_COMPANY") {
    const companyName = accessRequest.requested_company_name;
    if (!companyName) throw new Error("Public-email company requests need a company name.");
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({ name: companyName, relationship_stage: "CLIENT" })
      .select("id")
      .single<{ id: string }>();
    if (companyError) throw companyError;
    companyId = company.id;
  }

  if (accessRequest.request_type === "RELATED_DOMAIN") {
    if (!companyId || !accessRequest.requested_domain) throw new Error("Related-domain requests need a company and domain.");
    const domain = normalizeDomain(accessRequest.requested_domain);
    if (!domain) throw new Error("Related-domain request has an invalid domain.");
    const { error: domainError } = await supabaseAdmin
      .from("company_domains")
      .insert({ company_id: companyId, domain, is_primary: false });
    if (domainError) throw domainError;
  }

  if (accessRequest.requester_profile_id && (accessRequest.request_type === "PUBLIC_EMAIL_COMPANY" || accessRequest.request_type === "SAME_DOMAIN_ACCESS")) {
    if (!companyId) throw new Error("Client access requests need a company.");
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        company_id: companyId,
        role: "CLIENT",
        is_admin: false,
        client_access_role: accessRequest.requested_role ?? "CLIENT_MEMBER",
        access_status: "APPROVED",
        disabled_at: null,
        disabled_by: null,
      })
      .eq("id", accessRequest.requester_profile_id);
    if (profileError) throw profileError;
  }

  if (accessRequest.requester_profile_id && accessRequest.request_type === "BUM_SIGNUP") {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role: "BUM", is_admin: false, company_id: null, access_status: "APPROVED", disabled_at: null, disabled_by: null })
      .eq("id", accessRequest.requester_profile_id);
    if (profileError) throw profileError;
  }

  const { error: reviewError } = await supabaseAdmin
    .from("client_company_access_requests")
    .update({ status: "approved", company_id: companyId, reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
    .eq("id", requestId);
  if (reviewError) throw reviewError;

  await supabaseAdmin.from("audit_events").insert({
    company_id: companyId,
    user_id: admin.id,
    event_type: "admin_access_request_approved",
    entity_type: "client_company_access_requests",
    entity_id: requestId,
    event_data: { requestId, requestType: accessRequest.request_type, requesterProfileId: accessRequest.requester_profile_id },
  });
}

async function denyRequest(admin: ProfileRow, requestId: string, reviewNote?: string | null) {
  const { data: accessRequest, error: readError } = await supabaseAdmin
    .from("client_company_access_requests")
    .select("id, company_id, requester_profile_id, request_type")
    .eq("id", requestId)
    .eq("status", "pending")
    .maybeSingle<{ id: string; company_id: string | null; requester_profile_id: string | null; request_type: string }>();
  if (readError) throw readError;
  if (!accessRequest) throw new Error("Choose a pending access request.");

  if (accessRequest.requester_profile_id) {
    await supabaseAdmin.from("profiles").update({ access_status: "DENIED" }).eq("id", accessRequest.requester_profile_id).is("role", null);
  }

  const { error } = await supabaseAdmin
    .from("client_company_access_requests")
    .update({ status: "denied", reviewed_by: admin.id, reviewed_at: new Date().toISOString(), review_note: reviewNote ?? null })
    .eq("id", requestId);
  if (error) throw error;

  await supabaseAdmin.from("audit_events").insert({
    company_id: accessRequest.company_id,
    user_id: admin.id,
    event_type: "admin_access_request_denied",
    entity_type: "client_company_access_requests",
    entity_id: requestId,
    event_data: { requestId, requestType: accessRequest.request_type, requesterProfileId: accessRequest.requester_profile_id },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });

  try {
    const admin = await getCurrentAdmin(getBearerToken(request));
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = cleanString(body.action) as Action | null;

    if (action === "list") return json(200, { requests: await listRequests() });

    const requestId = cleanString(body.requestId);
    if (!requestId) return json(400, { error: "Choose an access request." });
    if (action === "approve") {
      await approveRequest(admin, requestId);
      return json(200, { approved: true, requests: await listRequests() });
    }
    if (action === "deny") {
      await denyRequest(admin, requestId, cleanString(body.reviewNote));
      return json(200, { denied: true, requests: await listRequests() });
    }

    return json(400, { error: "Choose a valid access request action." });
  } catch (error) {
    return json(400, { error: error instanceof Error ? error.message : "Unable to review access requests." });
  }
});
