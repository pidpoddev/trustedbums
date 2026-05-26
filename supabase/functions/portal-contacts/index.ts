import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

interface ClaimsResponse { sub?: string }
interface ProfileRow { id: string; role: string | null; is_admin: boolean }
interface CompanyRow { name: string | null }
interface OpportunityRow { id: string; target_account_name: string | null; company_id: string | null; companies?: CompanyRow | null }
interface CustomerTargetRow {
  id: string;
  target_account_name: string | null;
  client_companies?: CompanyRow | null;
  target_companies?: CompanyRow | null;
}
interface ClaimRow {
  id: string;
  contact_name: string;
  contact_email: string | null;
  contact_company: string | null;
  relationship_strength: string | null;
  status: string;
  note: string | null;
  created_at: string;
  opportunity_registration_id: string | null;
  opportunity_registrations?: OpportunityRow | null;
}
interface ProspectRecommendationRow {
  id: string;
  bum_user_id: string;
  status: string;
  notes: string | null;
  companies?: { id: string; name: string | null } | null;
}
interface ProspectContactRow {
  id: string;
  recommendation_id: string | null;
  full_name: string;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
  is_primary: boolean;
  created_at: string;
  prospect_recommendations?: Pick<ProspectRecommendationRow, "id" | "bum_user_id"> | null;
}
interface TargetResponseRow {
  id: string;
  contact_name: string;
  contact_email: string | null;
  relationship_strength: string | null;
  status: string;
  note: string | null;
  created_at: string;
  customer_targets?: CustomerTargetRow | null;
}
interface ExtensionCaptureRow {
  id: string;
  source_url: string;
  page_title: string | null;
  selected_text: string | null;
  note: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  opportunity_registration_id: string | null;
  customer_target_id: string | null;
  opportunity_registrations?: OpportunityRow | null;
  customer_targets?: CustomerTargetRow | null;
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
  auth: { autoRefreshToken: false, persistSession: false },
});

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
    .select("id, role, is_admin")
    .eq("id", currentUserId)
    .maybeSingle<ProfileRow>();
  if (error || !data) throw new Error("Unable to verify the current Trusted Bums profile.");
  return data;
}

function cleanLinkedInProfileName(value?: string | null) {
  return (value ?? "")
    .replace(/\s*\|\s*LinkedIn\s*$/i, "")
    .replace(/\s+LinkedIn\s*$/i, "")
    .split("·")[0]
    .trim();
}

function stringMetadataValue(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function inferLinkedInHeadline(capture: ExtensionCaptureRow, name: string) {
  const metadataHeadline = stringMetadataValue(capture.metadata, "headline");
  if (metadataHeadline) return metadataHeadline;

  let text = capture.selected_text?.trim() ?? "";
  if (name && text.toLowerCase().startsWith(name.toLowerCase())) {
    text = text.slice(name.length).trim();
  }
  text = text.replace(/^(?:[·\s]*(?:1st|2nd|3rd)[·\s]*)+/i, "").trim();
  const atMatch = text.match(/^(.{1,120}?\bat\b[^,·.\n]+)/i);
  if (atMatch?.[1]) return atMatch[1].trim();
  return text.split(/[\n·]/)[0]?.trim().slice(0, 120) || null;
}

function inferCompanyFromHeadline(headline?: string | null) {
  const match = headline?.match(/\bat\s+([^,·.\n]+)/i);
  return match?.[1]?.trim() || null;
}

function extensionCaptureContactName(capture: ExtensionCaptureRow) {
  return (
    cleanLinkedInProfileName(stringMetadataValue(capture.metadata, "profileName")) ||
    cleanLinkedInProfileName(capture.page_title) ||
    "LinkedIn contact"
  );
}

function extensionCaptureContextLabel(capture: ExtensionCaptureRow) {
  if (capture.opportunity_registrations?.target_account_name) {
    return "Opportunity: " + capture.opportunity_registrations.target_account_name;
  }
  const targetName = capture.customer_targets?.target_companies?.name ?? capture.customer_targets?.target_account_name;
  if (targetName) return "Client target: " + targetName;
  return "LinkedIn page capture";
}

function extensionCaptureDetailUrl(capture: ExtensionCaptureRow, companyName: string) {
  if (capture.opportunity_registration_id) return "/bum/opportunities/" + capture.opportunity_registration_id;
  if (capture.customer_target_id) return "/bum/opportunities?search=" + encodeURIComponent(companyName);
  return "/bum/contacts";
}

async function listContacts(userId: string) {
  const [claimsResult, recommendationsResult, contactsResult, targetResponsesResult, extensionCapturesResult] = await Promise.all([
    supabaseAdmin
      .from("opportunity_claims")
      .select("*, opportunity_registrations(id, target_account_name, company_id, companies(name))")
      .eq("bum_user_id", userId)
      .order("created_at", { ascending: false })
      .returns<ClaimRow[]>(),
    supabaseAdmin
      .from("prospect_recommendations")
      .select("*, companies(id, name)")
      .eq("bum_user_id", userId)
      .order("created_at", { ascending: false })
      .returns<ProspectRecommendationRow[]>(),
    supabaseAdmin
      .from("prospect_contacts")
      .select("*, prospect_recommendations(id, bum_user_id)")
      .order("created_at", { ascending: false })
      .returns<ProspectContactRow[]>(),
    supabaseAdmin
      .from("customer_target_responses")
      .select("*, customer_targets(id, target_account_name, client_companies:companies!customer_targets_client_company_id_fkey(name), target_companies:companies!customer_targets_target_company_id_fkey(name))")
      .eq("bum_user_id", userId)
      .order("created_at", { ascending: false })
      .returns<TargetResponseRow[]>(),
    supabaseAdmin
      .from("extension_page_captures")
      .select("*, opportunity_registrations(id, target_account_name, company_id, companies(name)), customer_targets(id, target_account_name, client_companies:companies!customer_targets_client_company_id_fkey(name), target_companies:companies!customer_targets_target_company_id_fkey(name))")
      .eq("created_by", userId)
      .eq("capture_type", "LINKEDIN_PROFILE")
      .order("created_at", { ascending: false })
      .returns<ExtensionCaptureRow[]>(),
  ]);

  for (const result of [claimsResult, recommendationsResult, contactsResult, targetResponsesResult, extensionCapturesResult]) {
    if (result.error) throw result.error;
  }

  const recommendations = recommendationsResult.data ?? [];
  const recommendationById = new Map(recommendations.map((recommendation) => [recommendation.id, recommendation]));
  const ownRecommendationIds = new Set(recommendations.map((recommendation) => recommendation.id));

  const claimContacts = (claimsResult.data ?? []).map((claim) => ({
    id: "claim:" + claim.id,
    source: "OPPORTUNITY_CLAIM",
    name: claim.contact_name,
    title: null,
    email: claim.contact_email,
    companyName: claim.contact_company || claim.opportunity_registrations?.companies?.name || claim.opportunity_registrations?.target_account_name || "Unknown company",
    relationshipStrength: claim.relationship_strength,
    status: claim.status,
    contextLabel: claim.opportunity_registrations?.target_account_name ? "Opportunity: " + claim.opportunity_registrations.target_account_name : "Opportunity claim",
    detailUrl: claim.opportunity_registration_id ? "/bum/opportunities/" + claim.opportunity_registration_id : "/bum/claims",
    linkedinUrl: null,
    note: claim.note,
    created_at: claim.created_at,
  }));

  const prospectContacts = (contactsResult.data ?? [])
    .filter((contact) => contact.recommendation_id && ownRecommendationIds.has(contact.recommendation_id))
    .map((contact) => {
      const recommendation = contact.recommendation_id ? recommendationById.get(contact.recommendation_id) : null;
      return {
        id: "prospect:" + contact.id,
        source: "PROSPECT",
        name: contact.full_name,
        title: contact.title,
        email: contact.email,
        companyName: recommendation?.companies?.name ?? "Prospected company",
        relationshipStrength: contact.is_primary ? "PRIMARY" : null,
        status: recommendation?.status ?? "PROSPECT",
        contextLabel: "Prospect recommendation",
        detailUrl: "/bum/prospects",
        linkedinUrl: contact.linkedin_url,
        note: recommendation?.notes ?? null,
        created_at: contact.created_at,
      };
    });

  const targetContacts = (targetResponsesResult.data ?? []).map((response) => {
    const targetName = response.customer_targets?.target_companies?.name ?? response.customer_targets?.target_account_name ?? "Target account";
    return {
      id: "target:" + response.id,
      source: "TARGET_RESPONSE",
      name: response.contact_name,
      title: null,
      email: response.contact_email,
      companyName: targetName,
      relationshipStrength: response.relationship_strength,
      status: response.status,
      contextLabel: response.customer_targets?.client_companies?.name ? "Client target for " + response.customer_targets.client_companies.name : "Client target response",
      detailUrl: "/bum/opportunities?search=" + encodeURIComponent(targetName),
      linkedinUrl: null,
      note: response.note,
      created_at: response.created_at,
    };
  });

  const extensionCaptureContacts = (extensionCapturesResult.data ?? []).map((capture) => {
    const name = extensionCaptureContactName(capture);
    const headline = inferLinkedInHeadline(capture, name);
    const companyName =
      inferCompanyFromHeadline(headline) ??
      capture.customer_targets?.target_companies?.name ??
      capture.customer_targets?.target_account_name ??
      capture.opportunity_registrations?.target_account_name ??
      capture.opportunity_registrations?.companies?.name ??
      "LinkedIn contact";

    return {
      id: "extension:" + capture.id,
      source: "EXTENSION_CAPTURE",
      name,
      title: headline,
      email: null,
      companyName,
      relationshipStrength: null,
      status: capture.status,
      contextLabel: extensionCaptureContextLabel(capture),
      detailUrl: extensionCaptureDetailUrl(capture, companyName),
      linkedinUrl: capture.source_url,
      note: capture.note ?? capture.selected_text,
      created_at: capture.created_at,
    };
  });

  return [...claimContacts, ...prospectContacts, ...targetContacts, ...extensionCaptureContacts]
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

Deno.serve(async (request) => {
  try {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method !== "POST") return json(405, { error: "Method not allowed." });

    const profile = await getCurrentProfile(getBearerToken(request));
    if (profile.role !== "BUM" && !profile.is_admin) {
      return json(403, { error: "Only Bums can load represented contacts." });
    }

    const contacts = await listContacts(profile.id);
    return json(200, { contacts });
  } catch (error) {
    return json(400, { error: error instanceof Error ? error.message : "Unable to load contacts." });
  }
});
