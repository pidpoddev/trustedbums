import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

interface ClaimsResponse {
  sub?: string;
}

interface ProfileRow {
  id: string;
  role: string | null;
  is_admin: boolean;
}

interface DuplicateRow {
  id: string;
  status: string;
  customer_name: string;
  customer_domain: string | null;
  source: string;
}

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
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  if (!authorization.startsWith("Bearer ")) {
    throw new Error("Missing bearer token.");
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw new Error("Missing bearer token.");
  }

  return token;
}

function decodeBase64Url(segment: string) {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
}

function parseJwtPayload(token: string) {
  const payloadSegment = token.split(".")[1] ?? "";

  if (!payloadSegment) {
    throw new Error("The current session token is malformed.");
  }

  return JSON.parse(decodeBase64Url(payloadSegment)) as ClaimsResponse & {
    iss?: string;
  };
}

function resolveClerkJwksUrl(issuer?: string) {
  const candidate = issuer?.trim() || clerkFrontendApiUrl?.trim();

  if (!candidate) {
    throw new Error("Unable to determine the Clerk JWKS endpoint for this session.");
  }

  return new URL("/.well-known/jwks.json", candidate).toString();
}

async function getCurrentProfile(token: string) {
  const payload = parseJwtPayload(token);
  const { payload: verifiedPayload } = await jose.jwtVerify(
    token,
    jose.createRemoteJWKSet(new URL(resolveClerkJwksUrl(payload.iss))),
    payload.iss
      ? {
          issuer: payload.iss,
        }
      : undefined,
  );
  const currentUserId = (verifiedPayload as ClaimsResponse).sub?.trim();

  if (!currentUserId) {
    throw new Error("The verified Clerk session did not include a user ID.");
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, role, is_admin")
    .eq("id", currentUserId)
    .maybeSingle<ProfileRow>();

  if (error || !data) {
    throw new Error("Unable to verify the current Trusted Bums profile.");
  }

  return data;
}

function normalizeRole(profile: ProfileRow) {
  return profile.role?.trim().toUpperCase() ?? "";
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });

  try {
    const profile = await getCurrentProfile(getBearerToken(request));
    if (!profile.is_admin && normalizeRole(profile) !== "BUM") {
      return json(403, { error: "Only Bums can check customer lead duplicates." });
    }

    const input = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const vendorCompanyId = cleanText(input.vendorCompanyId, 80);
    const customerDomain = cleanText(input.customerDomain, 255);

    if (!vendorCompanyId || !customerDomain) {
      return json(400, { error: "vendorCompanyId and customerDomain are required." });
    }

    const { data, error } = await supabaseAdmin
      .rpc("find_customer_lead_duplicate", {
        p_vendor_company_id: vendorCompanyId,
        p_customer_domain: customerDomain,
      })
      .returns<DuplicateRow[]>();

    if (error) throw error;

    return json(200, { duplicate: data?.[0] ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to check customer lead duplicates.";
    const status = /missing bearer|session token|verify|jwt|profile/i.test(message) ? 401 : 500;
    return json(status, { error: message });
  }
});
