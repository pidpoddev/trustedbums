import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

interface ClaimsResponse { sub?: string }
interface ProfileRow { id: string; role: string | null; is_admin: boolean }
interface CompanyRow { name: string | null }
interface OpportunityRow { id: string; target_account_name: string | null; company_id?: string | null; status?: string | null; companies?: CompanyRow | null }
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
  opportunity_claim_contacts?: Array<{
    is_inner_circle: boolean | null;
    is_primary: boolean | null;
    sort_order: number | null;
  }> | null;
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
  customer_target_id: string | null;
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
interface BumContactRow {
  id: string;
  bum_user_id: string;
  source_type: BumContactSource;
  source_id: string | null;
  extension_page_capture_id: string | null;
  opportunity_registration_id: string | null;
  customer_target_id: string | null;
  full_name: string;
  title: string | null;
  company_name: string | null;
  email: string | null;
  phone_numbers: unknown;
  linkedin_url: string | null;
  relationship_strength: string | null;
  status: string;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  is_inner_circle: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  opportunity_registrations?: OpportunityRow | null;
}

type BumContactSource = "OPPORTUNITY_CLAIM" | "PROSPECT" | "TARGET_RESPONSE" | "EXTENSION_CAPTURE" | "MANUAL";

type SourceContactInput = Pick<
  BumContactRow,
  | "source_type"
  | "source_id"
  | "extension_page_capture_id"
  | "opportunity_registration_id"
  | "customer_target_id"
  | "full_name"
  | "title"
  | "company_name"
  | "email"
  | "linkedin_url"
  | "relationship_strength"
  | "status"
  | "notes"
  | "metadata"
  | "is_inner_circle"
  | "last_synced_at"
  | "created_at"
>;

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

function normalizeIssuer(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function resolveAllowedClerkIssuer(issuer?: string) {
  const configuredIssuer = clerkFrontendApiUrl?.trim();
  if (!configuredIssuer) throw new Error("The portal contacts Clerk issuer is not configured.");
  const allowedIssuer = normalizeIssuer(configuredIssuer);
  if (issuer && normalizeIssuer(issuer) !== allowedIssuer) throw new Error("This Clerk session was issued by an unapproved tenant.");
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

function normalizeText(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function normalizePhoneNumbers(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean)
    .slice(0, 10);
}

function contactCompany(row: BumContactRow) {
  return row.company_name || row.opportunity_registrations?.companies?.name || row.opportunity_registrations?.target_account_name || "Unknown company";
}

function contactContextLabel(row: BumContactRow) {
  if (row.opportunity_registrations?.target_account_name) return "Opportunity: " + row.opportunity_registrations.target_account_name;
  const metadataContextLabel = typeof row.metadata?.contextLabel === "string" ? row.metadata.contextLabel.trim() : "";
  if (metadataContextLabel && !(metadataContextLabel.startsWith("Opportunity:") && !row.opportunity_registration_id)) return metadataContextLabel;
  if (row.source_type === "OPPORTUNITY_CLAIM") return "Opportunity claim";
  if (row.source_type === "PROSPECT") return "Prospect recommendation";
  if (row.source_type === "TARGET_RESPONSE") return "Client target response";
  if (row.source_type === "EXTENSION_CAPTURE") return "LinkedIn page capture";
  return "Contact";
}

function mapContact(row: BumContactRow) {
  return {
    id: row.id,
    source: row.source_type,
    name: row.full_name,
    title: row.title,
    email: row.email,
    phoneNumbers: normalizePhoneNumbers(row.phone_numbers),
    companyName: contactCompany(row),
    relationshipStrength: row.relationship_strength,
    status: row.status,
    contextLabel: contactContextLabel(row),
    detailUrl: "/bum/contacts/" + row.id,
    linkedinUrl: row.linkedin_url,
    note: row.notes,
    isInnerCircle: Boolean(row.is_inner_circle),
    opportunityRegistrationId: row.opportunity_registration_id,
    customerTargetId: row.customer_target_id,
    lastSyncedAt: row.last_synced_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function buildSourceContacts(userId: string): Promise<SourceContactInput[]> {
  const [claimsResult, recommendationsResult, contactsResult, targetResponsesResult, extensionCapturesResult] = await Promise.all([
    supabaseAdmin
      .from("opportunity_claims")
      .select("*, opportunity_claim_contacts(is_inner_circle, is_primary, sort_order), opportunity_registrations(id, target_account_name, company_id, companies(name))")
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

  const claimContacts: SourceContactInput[] = (claimsResult.data ?? []).map((claim) => {
    const primaryClaimContact = (claim.opportunity_claim_contacts ?? [])
      .slice()
      .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
      .find((contact) => contact.is_primary) ?? claim.opportunity_claim_contacts?.[0];

    return {
      source_type: "OPPORTUNITY_CLAIM",
      source_id: claim.id,
      extension_page_capture_id: null,
      opportunity_registration_id: claim.opportunity_registration_id,
      customer_target_id: null,
      full_name: claim.contact_name,
      title: null,
      email: claim.contact_email,
      company_name: claim.contact_company || claim.opportunity_registrations?.companies?.name || claim.opportunity_registrations?.target_account_name || null,
      linkedin_url: null,
      relationship_strength: claim.relationship_strength,
      status: claim.status,
      notes: claim.note,
      metadata: {
        contextLabel: claim.opportunity_registrations?.target_account_name ? "Opportunity: " + claim.opportunity_registrations.target_account_name : "Opportunity claim",
      },
      is_inner_circle: Boolean(primaryClaimContact?.is_inner_circle),
      last_synced_at: null,
      created_at: claim.created_at,
    };
  });

  const prospectContacts: SourceContactInput[] = (contactsResult.data ?? [])
    .filter((contact) => contact.recommendation_id && ownRecommendationIds.has(contact.recommendation_id))
    .map((contact) => {
      const recommendation = contact.recommendation_id ? recommendationById.get(contact.recommendation_id) : null;
      return {
        source_type: "PROSPECT",
        source_id: contact.id,
        extension_page_capture_id: null,
        opportunity_registration_id: null,
        customer_target_id: null,
        full_name: contact.full_name,
        title: contact.title,
        email: contact.email,
        company_name: recommendation?.companies?.name ?? null,
        linkedin_url: contact.linkedin_url,
        relationship_strength: contact.is_primary ? "PRIMARY" : null,
        status: recommendation?.status ?? "PROSPECT",
        notes: recommendation?.notes ?? null,
        metadata: { contextLabel: "Prospect recommendation", recommendationId: contact.recommendation_id },
        is_inner_circle: false,
        last_synced_at: null,
        created_at: contact.created_at,
      };
    });

  const targetContacts: SourceContactInput[] = (targetResponsesResult.data ?? []).map((response) => {
    const targetName = response.customer_targets?.target_companies?.name ?? response.customer_targets?.target_account_name ?? null;
    return {
      source_type: "TARGET_RESPONSE",
      source_id: response.id,
      extension_page_capture_id: null,
      opportunity_registration_id: null,
      customer_target_id: response.customer_target_id,
      full_name: response.contact_name,
      title: null,
      email: response.contact_email,
      company_name: targetName,
      linkedin_url: null,
      relationship_strength: response.relationship_strength,
      status: response.status,
      notes: response.note,
      metadata: {
        contextLabel: response.customer_targets?.client_companies?.name ? "Client target for " + response.customer_targets.client_companies.name : "Client target response",
      },
      is_inner_circle: false,
      last_synced_at: null,
      created_at: response.created_at,
    };
  });

  const extensionCaptureContacts: SourceContactInput[] = (extensionCapturesResult.data ?? []).map((capture) => {
    const name = extensionCaptureContactName(capture);
    const headline = inferLinkedInHeadline(capture, name);
    const companyName =
      inferCompanyFromHeadline(headline) ??
      capture.customer_targets?.target_companies?.name ??
      capture.customer_targets?.target_account_name ??
      capture.opportunity_registrations?.target_account_name ??
      capture.opportunity_registrations?.companies?.name ??
      null;

    return {
      source_type: "EXTENSION_CAPTURE",
      source_id: capture.id,
      extension_page_capture_id: capture.id,
      opportunity_registration_id: capture.opportunity_registration_id,
      customer_target_id: capture.customer_target_id,
      full_name: name,
      title: headline,
      email: null,
      company_name: companyName,
      linkedin_url: capture.source_url,
      relationship_strength: null,
      status: capture.status,
      notes: capture.note ?? capture.selected_text,
      metadata: {
        ...(capture.metadata ?? {}),
        contextLabel: extensionCaptureContextLabel(capture),
        selectedText: capture.selected_text,
        pageTitle: capture.page_title,
      },
      is_inner_circle: false,
      last_synced_at: capture.created_at,
      created_at: capture.created_at,
    };
  });

  return [...claimContacts, ...prospectContacts, ...targetContacts, ...extensionCaptureContacts].filter((contact) => contact.full_name.trim());
}

async function syncSourceContacts(userId: string) {
  const sources = await buildSourceContacts(userId);
  if (!sources.length) return;

  const { data: existingRows, error: existingError } = await supabaseAdmin
    .from("bum_contacts")
    .select("source_type, source_id")
    .eq("bum_user_id", userId)
    .not("source_id", "is", null)
    .returns<Array<Pick<BumContactRow, "source_type" | "source_id">>>();
  if (existingError) throw existingError;

  const existingKeys = new Set((existingRows ?? []).map((row) => row.source_type + ":" + row.source_id));
  const newRows = sources
    .filter((source) => source.source_id && !existingKeys.has(source.source_type + ":" + source.source_id))
    .map((source) => ({
      ...source,
      bum_user_id: userId,
      phone_numbers: [],
    }));

  if (!newRows.length) return;

  const { error } = await supabaseAdmin.from("bum_contacts").insert(newRows);
  if (error && error.code !== "23505") throw error;
}

async function fetchContact(userId: string, contactId: string) {
  const { data, error } = await supabaseAdmin
    .from("bum_contacts")
    .select("*, opportunity_registrations(id, target_account_name, status, companies(name))")
    .eq("bum_user_id", userId)
    .eq("id", contactId)
    .maybeSingle<BumContactRow>();
  if (error) throw error;
  if (!data) throw new Error("Contact not found.");
  return data;
}

async function assertOpportunityEntitlement(userId: string, opportunityRegistrationId: string) {
  const { data, error } = await supabaseAdmin
    .from("opportunity_claims")
    .select("id")
    .eq("bum_user_id", userId)
    .eq("opportunity_registration_id", opportunityRegistrationId)
    .limit(1)
    .maybeSingle<{ id: string }>();
  if (error) throw error;
  if (!data) throw new Error("Opportunity not found or not available for this contact.");
}

async function assertCustomerTargetEntitlement(userId: string, customerTargetId: string) {
  const { data, error } = await supabaseAdmin
    .from("customer_target_responses")
    .select("id")
    .eq("bum_user_id", userId)
    .eq("customer_target_id", customerTargetId)
    .in("status", ["ACCEPTED", "CONTACTED", "MEETING_SET"])
    .limit(1)
    .maybeSingle<{ id: string }>();
  if (error) throw error;
  if (!data) throw new Error("Client target not found or not available for this contact.");
}

async function listOpportunityOptions(userId: string, currentOpportunityId?: string | null) {
  const { data, error } = await supabaseAdmin
    .from("opportunity_claims")
    .select("opportunity_registrations(id, target_account_name, status, companies(name))")
    .eq("bum_user_id", userId)
    .returns<Array<{ opportunity_registrations?: OpportunityRow | null }>>();
  if (error) throw error;

  const optionsById = new Map<string, OpportunityRow>();
  for (const row of data ?? []) {
    const opportunity = row.opportunity_registrations;
    if (opportunity?.id) optionsById.set(opportunity.id, opportunity);
  }

  if (currentOpportunityId && !optionsById.has(currentOpportunityId)) {
    await assertOpportunityEntitlement(userId, currentOpportunityId);
  }

  return [...optionsById.values()].sort((a, b) => (a.target_account_name ?? "").localeCompare(b.target_account_name ?? ""));
}

async function listContacts(userId: string) {
  await syncSourceContacts(userId);
  const { data, error } = await supabaseAdmin
    .from("bum_contacts")
    .select("*, opportunity_registrations(id, target_account_name, status, companies(name))")
    .eq("bum_user_id", userId)
    .order("created_at", { ascending: false })
    .returns<BumContactRow[]>();
  if (error) throw error;
  return (data ?? []).map(mapContact);
}

async function getContactDetail(userId: string, contactId: string) {
  await syncSourceContacts(userId);
  const contact = await fetchContact(userId, contactId);
  const opportunities = await listOpportunityOptions(userId, contact.opportunity_registration_id);
  return { contact: mapContact(contact), opportunities };
}

async function contactPayloadFromPatch(userId: string, patch: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  if ("name" in patch) payload.full_name = normalizeText(patch.name);
  if ("title" in patch) payload.title = normalizeText(patch.title);
  if ("companyName" in patch) payload.company_name = normalizeText(patch.companyName);
  if ("email" in patch) payload.email = normalizeText(patch.email);
  if ("linkedinUrl" in patch) payload.linkedin_url = normalizeText(patch.linkedinUrl);
  if ("relationshipStrength" in patch) payload.relationship_strength = normalizeText(patch.relationshipStrength);
  if ("note" in patch) payload.notes = normalizeText(patch.note);
  if ("phoneNumbers" in patch) payload.phone_numbers = normalizePhoneNumbers(patch.phoneNumbers);
  if ("isInnerCircle" in patch) payload.is_inner_circle = patch.isInnerCircle === true;

  if ("opportunityRegistrationId" in patch) {
    const opportunityRegistrationId = normalizeText(patch.opportunityRegistrationId);
    if (opportunityRegistrationId) {
      await assertOpportunityEntitlement(userId, opportunityRegistrationId);
    }
    payload.opportunity_registration_id = opportunityRegistrationId;
  }

  if ("customerTargetId" in patch) {
    const customerTargetId = normalizeText(patch.customerTargetId);
    if (customerTargetId) {
      await assertCustomerTargetEntitlement(userId, customerTargetId);
      const { data, error } = await supabaseAdmin
        .from("customer_targets")
        .select("id, target_account_name, target_companies:companies!customer_targets_target_company_id_fkey(name)")
        .eq("id", customerTargetId)
        .maybeSingle<CustomerTargetRow>();
      if (error) throw error;
      if (!data) throw new Error("Client target not found.");
      const targetName = data.target_companies?.name ?? data.target_account_name ?? "Target account";
      payload.metadata = { contextLabel: "Client target: " + targetName };
    }
    payload.customer_target_id = customerTargetId;
  }

  return payload;
}

async function updateContact(userId: string, contactId: string, patch: Record<string, unknown>) {
  const payload = await contactPayloadFromPatch(userId, patch);
  if (payload.full_name === null) throw new Error("Contact name is required.");
  if (!Object.keys(payload).length) return getContactDetail(userId, contactId);

  const { error } = await supabaseAdmin
    .from("bum_contacts")
    .update(payload)
    .eq("bum_user_id", userId)
    .eq("id", contactId);
  if (error) throw error;

  return getContactDetail(userId, contactId);
}

async function createContact(userId: string, patch: Record<string, unknown>) {
  const payload = await contactPayloadFromPatch(userId, patch);
  if (!payload.full_name) throw new Error("Contact name is required.");

  const { data, error } = await supabaseAdmin
    .from("bum_contacts")
    .insert({
      bum_user_id: userId,
      source_type: "MANUAL",
      full_name: payload.full_name,
      title: payload.title ?? null,
      company_name: payload.company_name ?? null,
      email: payload.email ?? null,
      phone_numbers: payload.phone_numbers ?? [],
      linkedin_url: payload.linkedin_url ?? null,
      relationship_strength: payload.relationship_strength ?? null,
      notes: payload.notes ?? null,
      opportunity_registration_id: payload.opportunity_registration_id ?? null,
      customer_target_id: payload.customer_target_id ?? null,
      is_inner_circle: payload.is_inner_circle ?? false,
      status: "ACTIVE",
      metadata: payload.metadata ?? { contextLabel: "Contact" },
    })
    .select("id")
    .single<{ id: string }>();
  if (error) throw error;

  return getContactDetail(userId, data.id);
}

async function deleteContact(userId: string, contactId: string) {
  const contact = await fetchContact(userId, contactId);
  if (contact.source_type === "OPPORTUNITY_CLAIM") {
    throw new Error("Contacts attached to a Claim cannot be deleted.");
  }

  const { error } = await supabaseAdmin
    .from("bum_contacts")
    .delete()
    .eq("bum_user_id", userId)
    .eq("id", contactId);
  if (error) throw error;

  return { deleted: true, contactId };
}

function captureUpdates(capture: ExtensionCaptureRow) {
  const name = extensionCaptureContactName(capture);
  const headline = inferLinkedInHeadline(capture, name);
  const companyName =
    inferCompanyFromHeadline(headline) ??
    capture.customer_targets?.target_companies?.name ??
    capture.customer_targets?.target_account_name ??
    capture.opportunity_registrations?.target_account_name ??
    capture.opportunity_registrations?.companies?.name ??
    null;

  return {
    full_name: name,
    title: headline,
    company_name: companyName,
    linkedin_url: capture.source_url,
    extension_page_capture_id: capture.id,
    last_synced_at: capture.created_at,
    metadata: {
      ...(capture.metadata ?? {}),
      contextLabel: extensionCaptureContextLabel(capture),
      selectedText: capture.selected_text,
      pageTitle: capture.page_title,
      resyncedFromCaptureId: capture.id,
    },
  };
}

async function resyncContact(userId: string, contactId: string) {
  const contact = await fetchContact(userId, contactId);
  let capture: ExtensionCaptureRow | null = null;

  if (contact.linkedin_url) {
    const byUrl = await supabaseAdmin
      .from("extension_page_captures")
      .select("*, opportunity_registrations(id, target_account_name, company_id, companies(name)), customer_targets(id, target_account_name, client_companies:companies!customer_targets_client_company_id_fkey(name), target_companies:companies!customer_targets_target_company_id_fkey(name))")
      .eq("created_by", userId)
      .eq("capture_type", "LINKEDIN_PROFILE")
      .eq("source_url", contact.linkedin_url)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<ExtensionCaptureRow>();
    if (byUrl.error) throw byUrl.error;
    capture = byUrl.data ?? null;
  }

  if (!capture && contact.extension_page_capture_id) {
    const byId = await supabaseAdmin
      .from("extension_page_captures")
      .select("*, opportunity_registrations(id, target_account_name, company_id, companies(name)), customer_targets(id, target_account_name, client_companies:companies!customer_targets_client_company_id_fkey(name), target_companies:companies!customer_targets_target_company_id_fkey(name))")
      .eq("created_by", userId)
      .eq("id", contact.extension_page_capture_id)
      .maybeSingle<ExtensionCaptureRow>();
    if (byId.error) throw byId.error;
    capture = byId.data ?? null;
  }

  if (!capture) throw new Error("No saved LinkedIn capture was found for this contact yet.");

  const { error } = await supabaseAdmin
    .from("bum_contacts")
    .update(captureUpdates(capture))
    .eq("bum_user_id", userId)
    .eq("id", contactId);
  if (error) throw error;

  return getContactDetail(userId, contactId);
}

Deno.serve(async (request) => {
  try {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method !== "POST") return json(405, { error: "Method not allowed." });

    const profile = await getCurrentProfile(getBearerToken(request));
    if (profile.role !== "BUM" && !profile.is_admin) {
      return json(403, { error: "Only Bums can manage represented contacts." });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "list";
    const contactId = typeof body.contactId === "string" ? body.contactId : "";

    if (action === "list") return json(200, { contacts: await listContacts(profile.id) });
    if (action === "create") return json(200, await createContact(profile.id, (body.patch as Record<string, unknown>) ?? {}));
    if (!contactId) return json(400, { error: "Contact ID is required." });
    if (action === "get") return json(200, await getContactDetail(profile.id, contactId));
    if (action === "update") return json(200, await updateContact(profile.id, contactId, (body.patch as Record<string, unknown>) ?? {}));
    if (action === "delete") return json(200, await deleteContact(profile.id, contactId));
    if (action === "resync") return json(200, await resyncContact(profile.id, contactId));

    return json(400, { error: "Unsupported contacts action." });
  } catch (error) {
    return json(400, { error: error instanceof Error ? error.message : "Unable to manage contacts." });
  }
});
