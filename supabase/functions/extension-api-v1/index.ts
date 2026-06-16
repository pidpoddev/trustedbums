import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

type CaptureType = "LINKEDIN_PROFILE" | "LINKEDIN_COMPANY" | "WEB_PAGE" | "OTHER";
type DestinationType = "OPPORTUNITY_REGISTRATION" | "CUSTOMER_TARGET";

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
interface OpportunityRow {
  id: string;
  company_id: string | null;
  target_account_name: string;
  status: string;
  companies?: { id: string; name: string; linkedin_company_url?: string | null } | null;
}
interface CustomerTargetRow {
  id: string;
  client_company_id: string;
  target_account_name: string;
  status: string;
  client_companies?: { id: string; name: string } | null;
  target_companies?: { id: string; name: string; linkedin_company_url?: string | null } | null;
}
interface CaptureRow {
  id: string;
  api_version: string;
  created_by: string;
  company_id: string | null;
  opportunity_registration_id: string | null;
  customer_target_id: string | null;
  client_request_id: string | null;
  capture_type: CaptureType;
  source_url: string;
  page_title: string | null;
  selected_text: string | null;
  note: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const API_VERSION = "v1";
const CAPTURE_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const captureRateLimitPerHour = Number.parseInt(Deno.env.get("EXTENSION_API_CAPTURE_LIMIT_PER_HOUR") ?? "60", 10);
const allowedCorsOrigins = new Set(
  (Deno.env.get("EXTENSION_API_ALLOWED_ORIGINS") ?? "chrome-extension://eemjcjegjdmeghobmfdbaiammapaefde")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const allowedCaptureTypes: CaptureType[] = ["LINKEDIN_PROFILE", "LINKEDIN_COMPANY", "WEB_PAGE", "OTHER"];

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const clerkFrontendApiUrl = Deno.env.get("CLERK_FRONTEND_API_URL");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

class ExtensionApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ExtensionApiError";
    this.status = status;
  }
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin")?.trim();
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-trustedbums-client",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
    Vary: "Origin",
  };

  if (origin && allowedCorsOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function json(request: Request, status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify({ apiVersion: API_VERSION, ...payload }), {
    status,
    headers: corsHeaders(request),
  });
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
    .select("id, company_id, full_name, email, role, is_admin, client_access_role")
    .eq("id", currentUserId)
    .maybeSingle<ProfileRow>();
  if (error || !data) throw new Error("Unable to verify the current Trusted Bums profile.");
  return data;
}

function isAdmin(profile: ProfileRow) {
  return profile.is_admin || profile.role?.toUpperCase() === "ADMIN";
}

function normalizeRole(profile: ProfileRow) {
  return profile.role?.toUpperCase() ?? "";
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function nullableCleanString(value: unknown, maxLength: number) {
  const cleaned = cleanString(value, maxLength);
  return cleaned || null;
}

function readCaptureType(value: unknown): CaptureType {
  const candidate = cleanString(value, 80).toUpperCase() as CaptureType;
  return allowedCaptureTypes.includes(candidate) ? candidate : "WEB_PAGE";
}

function readDestinationType(value: unknown): DestinationType | null {
  const candidate = cleanString(value, 80).toUpperCase();
  return candidate === "OPPORTUNITY_REGISTRATION" || candidate === "CUSTOMER_TARGET" ? candidate : null;
}

function readMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function normalizeSourceUrl(value: unknown) {
  const raw = cleanString(value, 2048);
  if (!raw) throw new Error("sourceUrl is required.");

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("sourceUrl must be a valid absolute URL.");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("sourceUrl must use http or https.");
  }

  return parsed.toString();
}

function routePath(request: Request) {
  const pathname = new URL(request.url).pathname;
  const parts = pathname.split("/").filter(Boolean);
  const functionIndex = parts.indexOf("extension-api-v1");
  return functionIndex >= 0 ? "/" + parts.slice(functionIndex + 1).join("/") : "/";
}

function canAccessOpportunity(profile: ProfileRow, opportunity: OpportunityRow) {
  if (isAdmin(profile)) return true;
  if (normalizeRole(profile) === "CLIENT") return Boolean(profile.company_id && opportunity.company_id === profile.company_id);
  if (normalizeRole(profile) === "BUM") return opportunity.status === "Accepted";
  return false;
}

function canAccessCustomerTarget(profile: ProfileRow, target: CustomerTargetRow) {
  if (isAdmin(profile)) return true;
  if (normalizeRole(profile) === "CLIENT") return Boolean(profile.company_id && target.client_company_id === profile.company_id);
  return false;
}

async function listContext(request: Request, profile: ProfileRow) {
  let opportunityQuery = supabaseAdmin
    .from("opportunity_registrations")
    .select("id, company_id, target_account_name, status, companies(id, name, linkedin_company_url)")
    .order("created_at", { ascending: false })
    .limit(100);

  let targetQuery = supabaseAdmin
    .from("customer_targets")
    .select("id, client_company_id, target_account_name, status, client_companies:companies!customer_targets_client_company_id_fkey(id, name), target_companies:companies!customer_targets_target_company_id_fkey(id, name, linkedin_company_url)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (!isAdmin(profile)) {
    if (normalizeRole(profile) === "CLIENT" && profile.company_id) {
      opportunityQuery = opportunityQuery.eq("company_id", profile.company_id);
      targetQuery = targetQuery.eq("client_company_id", profile.company_id);
    } else if (normalizeRole(profile) === "BUM") {
      opportunityQuery = opportunityQuery.eq("status", "Accepted");
      targetQuery = targetQuery.limit(0);
    } else {
      opportunityQuery = opportunityQuery.limit(0);
      targetQuery = targetQuery.limit(0);
    }
  }

  const [{ data: opportunities, error: opportunityError }, { data: targets, error: targetError }] = await Promise.all([
    opportunityQuery.returns<OpportunityRow[]>(),
    targetQuery.returns<CustomerTargetRow[]>(),
  ]);
  if (opportunityError) throw opportunityError;
  if (targetError) throw targetError;

  return json(request, 200, {
    profile: {
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      role: normalizeRole(profile),
      companyId: profile.company_id,
      clientAccessRole: profile.client_access_role,
    },
    destinations: {
      opportunities: (opportunities ?? []).filter((opportunity) => canAccessOpportunity(profile, opportunity)).map((opportunity) => ({
        id: opportunity.id,
        destinationType: "OPPORTUNITY_REGISTRATION",
        companyId: opportunity.company_id,
        companyName: opportunity.companies?.name ?? null,
        targetAccountName: opportunity.target_account_name,
        status: opportunity.status,
      })),
      customerTargets: (targets ?? []).filter((target) => canAccessCustomerTarget(profile, target)).map((target) => ({
        id: target.id,
        destinationType: "CUSTOMER_TARGET",
        companyId: target.client_company_id,
        clientCompanyName: target.client_companies?.name ?? null,
        targetAccountName: target.target_companies?.name ?? target.target_account_name,
        linkedinCompanyUrl: target.target_companies?.linkedin_company_url ?? null,
        status: target.status,
      })),
    },
  });
}

async function getOpportunityForCapture(profile: ProfileRow, id: string) {
  const { data, error } = await supabaseAdmin
    .from("opportunity_registrations")
    .select("id, company_id, target_account_name, status, companies(id, name, linkedin_company_url)")
    .eq("id", id)
    .maybeSingle<OpportunityRow>();
  if (error) throw error;
  if (!data || !canAccessOpportunity(profile, data)) throw new Error("You do not have access to that opportunity.");
  return data;
}

async function getCustomerTargetForCapture(profile: ProfileRow, id: string) {
  const { data, error } = await supabaseAdmin
    .from("customer_targets")
    .select("id, client_company_id, target_account_name, status, client_companies:companies!customer_targets_client_company_id_fkey(id, name), target_companies:companies!customer_targets_target_company_id_fkey(id, name, linkedin_company_url)")
    .eq("id", id)
    .maybeSingle<CustomerTargetRow>();
  if (error) throw error;
  if (!data || !canAccessCustomerTarget(profile, data)) throw new Error("You do not have access to that customer target.");
  return data;
}

function serializeCapture(row: CaptureRow) {
  return {
    id: row.id,
    status: row.status,
    captureType: row.capture_type,
    sourceUrl: row.source_url,
    pageTitle: row.page_title,
    selectedText: row.selected_text,
    note: row.note,
    companyId: row.company_id,
    opportunityId: row.opportunity_registration_id,
    customerTargetId: row.customer_target_id,
    clientRequestId: row.client_request_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findExistingCapture(profile: ProfileRow, clientRequestId: string | null) {
  if (!clientRequestId) return null;
  const { data, error } = await supabaseAdmin
    .from("extension_page_captures")
    .select("*")
    .eq("created_by", profile.id)
    .eq("client_request_id", clientRequestId)
    .maybeSingle<CaptureRow>();
  if (error) throw error;
  return data;
}

async function enforceCaptureRateLimit(profile: ProfileRow) {
  if (isAdmin(profile) || !Number.isFinite(captureRateLimitPerHour) || captureRateLimitPerHour <= 0) return;

  const since = new Date(Date.now() - CAPTURE_RATE_LIMIT_WINDOW_MS).toISOString();
  const { count, error } = await supabaseAdmin
    .from("extension_page_captures")
    .select("id", { count: "exact", head: true })
    .eq("created_by", profile.id)
    .gte("created_at", since);
  if (error) throw error;
  if ((count ?? 0) >= captureRateLimitPerHour) {
    throw new ExtensionApiError(429, "Extension capture rate limit reached. Please try again later.");
  }
}

async function createPageCapture(request: Request, profile: ProfileRow) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const opportunityId = nullableCleanString(body.opportunityId, 80);
  const customerTargetId = nullableCleanString(body.customerTargetId, 80);
  const destinationType = readDestinationType(body.destinationType) ?? (opportunityId ? "OPPORTUNITY_REGISTRATION" : customerTargetId ? "CUSTOMER_TARGET" : null);
  const clientRequestId = nullableCleanString(body.clientRequestId, 128);

  if (!destinationType) throw new Error("destinationType, opportunityId, or customerTargetId is required.");
  if (opportunityId && customerTargetId) throw new ExtensionApiError(400, "Choose either opportunityId or customerTargetId, not both.");
  if (destinationType === "OPPORTUNITY_REGISTRATION" && !opportunityId) throw new Error("opportunityId is required for opportunity captures.");
  if (destinationType === "OPPORTUNITY_REGISTRATION" && customerTargetId) throw new ExtensionApiError(400, "customerTargetId is not valid for opportunity captures.");
  if (destinationType === "CUSTOMER_TARGET" && !customerTargetId) throw new Error("customerTargetId is required for customer target captures.");
  if (destinationType === "CUSTOMER_TARGET" && opportunityId) throw new ExtensionApiError(400, "opportunityId is not valid for customer target captures.");

  const existing = await findExistingCapture(profile, clientRequestId);
  if (existing) return json(request, 200, { capture: serializeCapture(existing), idempotent: true });
  await enforceCaptureRateLimit(profile);

  let companyId: string | null = null;
  let destinationSummary: Record<string, unknown> = {};

  if (destinationType === "OPPORTUNITY_REGISTRATION") {
    const opportunity = await getOpportunityForCapture(profile, opportunityId!);
    companyId = opportunity.company_id;
    destinationSummary = { type: destinationType, id: opportunity.id, targetAccountName: opportunity.target_account_name };
  } else {
    const target = await getCustomerTargetForCapture(profile, customerTargetId!);
    companyId = target.client_company_id;
    destinationSummary = { type: destinationType, id: target.id, targetAccountName: target.target_companies?.name ?? target.target_account_name };
  }

  const captureType = readCaptureType(body.captureType);
  const sourceUrl = normalizeSourceUrl(body.sourceUrl);
  const pageTitle = nullableCleanString(body.pageTitle, 300);
  const selectedText = nullableCleanString(body.selectedText, 4000);
  const note = nullableCleanString(body.note, 2000);
  const metadata = readMetadata(body.metadata);

  const { data, error } = await supabaseAdmin
    .from("extension_page_captures")
    .insert({
      api_version: API_VERSION,
      created_by: profile.id,
      company_id: companyId,
      opportunity_registration_id: destinationType === "OPPORTUNITY_REGISTRATION" ? opportunityId : null,
      customer_target_id: destinationType === "CUSTOMER_TARGET" ? customerTargetId : null,
      client_request_id: clientRequestId,
      capture_type: captureType,
      source_url: sourceUrl,
      page_title: pageTitle,
      selected_text: selectedText,
      note,
      status: "DRAFT",
      metadata,
      user_agent: nullableCleanString(request.headers.get("user-agent"), 500),
    })
    .select("*")
    .single<CaptureRow>();
  if (error) throw error;

  await supabaseAdmin.from("audit_events").insert({
    company_id: companyId,
    user_id: profile.id,
    event_type: "extension_page_capture_created",
    entity_type: "extension_page_captures",
    entity_id: data.id,
    event_data: {
      api_version: API_VERSION,
      capture_type: captureType,
      source_url: sourceUrl,
      page_title: pageTitle,
      destination: destinationSummary,
    },
  });

  return json(request, 201, { capture: serializeCapture(data) });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin")?.trim();

    return new Response(null, {
      status: origin && !allowedCorsOrigins.has(origin) ? 403 : 204,
      headers: corsHeaders(request),
    });
  }

  try {
    const profile = await getCurrentProfile(getBearerToken(request));
    const path = routePath(request);

    if (request.method === "GET" && (path === "/context" || path === "/")) {
      return await listContext(request, profile);
    }

    if (request.method === "POST" && path === "/page-captures") {
      return await createPageCapture(request, profile);
    }

    return json(request, 404, { error: "Unknown extension API endpoint." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process extension API request.";
    const status = error instanceof ExtensionApiError
      ? error.status
      : /missing bearer|session token|verify|jwt|profile/i.test(message)
      ? 401
      : /do not have access/i.test(message)
        ? 403
        : /required|valid|destination/i.test(message)
          ? 400
          : 500;
    return json(request, status, { error: message });
  }
});
