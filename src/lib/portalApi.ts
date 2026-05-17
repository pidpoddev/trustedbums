import { FALLBACK_TERMS_VERSION, DEFAULT_COMMISSION_DURATION, type TermsFallbackVersion } from "@/data/partnerTerms";
import { supabase, supabasePublishableKey, supabaseUrl } from "@/lib/supabase";
import type { AuthUser } from "@/data/authData";

export type RegistrationStatus =
  | "Draft"
  | "Submitted"
  | "Accepted"
  | "Disputed"
  | "Closed Won"
  | "Closed Lost"
  | "Rejected"
  | "Needs Clarification";

export const REGISTRATION_STATUSES: RegistrationStatus[] = [
  "Draft",
  "Submitted",
  "Accepted",
  "Disputed",
  "Closed Won",
  "Closed Lost",
  "Rejected",
  "Needs Clarification",
];

export interface CompanyRecord {
  id: string;
  name: string;
  website: string | null;
  created_at: string;
}

export interface ProfileRecord {
  id: string;
  company_id: string | null;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_admin: boolean;
  created_at: string;
  companies?: Pick<CompanyRecord, "id" | "name"> | null;
}

export interface TermsVersion {
  id: string;
  version: string;
  title: string;
  body: string;
  faq_body: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TermsAcceptance {
  id: string;
  user_id: string;
  company_id: string | null;
  terms_version_id: string;
  accepted_at: string;
  ip_address: string | null;
  user_agent: string | null;
  companies?: Pick<CompanyRecord, "name"> | null;
  profiles?: Pick<ProfileRecord, "full_name" | "email"> | null;
  terms_versions?: Pick<TermsVersion, "version" | "title"> | null;
}

export interface OpportunityRegistration {
  id: string;
  company_id: string | null;
  created_by: string;
  target_account_name: string;
  business_unit: string | null;
  opportunity_description: string | null;
  client_contact: string | null;
  trusted_bums_contact: string | null;
  expected_product_service: string | null;
  estimated_deal_value: number | null;
  expected_timeline: string | null;
  commission_rate: number;
  commission_duration: string;
  notes: string | null;
  status: RegistrationStatus;
  created_at: string;
  updated_at: string;
  companies?: Pick<CompanyRecord, "name"> | null;
  profiles?: Pick<ProfileRecord, "full_name" | "email"> | null;
}

export interface OpportunityInput {
  target_account_name: string;
  business_unit?: string;
  opportunity_description?: string;
  client_contact?: string;
  trusted_bums_contact?: string;
  expected_product_service?: string;
  estimated_deal_value?: number | null;
  expected_timeline?: string;
  commission_rate?: number;
  commission_duration?: string;
  notes?: string;
  status?: RegistrationStatus;
}

export interface AuditEvent {
  id: string;
  company_id: string | null;
  user_id: string | null;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  event_data: Record<string, unknown> | null;
  created_at: string;
  companies?: Pick<CompanyRecord, "name"> | null;
  profiles?: Pick<ProfileRecord, "full_name" | "email"> | null;
}

export interface TrainingMaterial {
  id: string;
  company_id: string;
  created_by: string;
  title: string;
  description: string | null;
  technology: string | null;
  resource_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  companies?: Pick<CompanyRecord, "name"> | null;
  profiles?: Pick<ProfileRecord, "full_name" | "email"> | null;
}

export interface TrainingMaterialInput {
  title: string;
  description?: string;
  technology?: string;
  resource_url?: string;
  is_published?: boolean;
}

export type BumAvailabilityStatus = "open" | "selective" | "unavailable";
export type BumVerificationStatus = "self_reported" | "reviewed" | "verified";

export interface BumProfileRecord {
  user_id: string;
  headline: string | null;
  bio: string | null;
  linkedin_url: string | null;
  years_experience: number | null;
  availability_status: BumAvailabilityStatus;
  home_region: string | null;
  industries: string[];
  regions: string[];
  products_sold: string[];
  buyer_personas: string[];
  worked_with_companies: string[];
  relationship_companies: string[];
  certifications: string[];
  skills: string[];
  notable_wins: string | null;
  verification_status: BumVerificationStatus;
  is_visible_to_clients: boolean;
  last_linkedin_imported_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Pick<ProfileRecord, "full_name" | "email" | "created_at"> | null;
}

export interface BumProfileInput {
  headline?: string;
  bio?: string;
  linkedin_url?: string;
  years_experience?: number | null;
  availability_status?: BumAvailabilityStatus;
  home_region?: string;
  industries?: string[];
  regions?: string[];
  products_sold?: string[];
  buyer_personas?: string[];
  worked_with_companies?: string[];
  relationship_companies?: string[];
  certifications?: string[];
  skills?: string[];
  notable_wins?: string;
  verification_status?: BumVerificationStatus;
  is_visible_to_clients?: boolean;
  last_linkedin_imported_at?: string | null;
}

interface ImpersonationFunctionProfile {
  id: string;
  email: string | null;
  role: string | null;
}

export interface ImpersonationTicketResponse {
  action: "start" | "stop";
  ticket: string;
  url?: string;
  target?: ImpersonationFunctionProfile;
  actorUserId?: string;
}

function toNullableString(value?: string) {
  return value?.trim() ? value.trim() : null;
}

function toUniqueTrimmedArray(values?: string[]) {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

async function getProfileRecord(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, companies(id, name)")
    .eq("id", userId)
    .maybeSingle<ProfileRecord>();

  if (error) {
    throw error;
  }

  return data;
}

async function ensureCompany(companyName: string) {
  const { data: existing, error: existingError } = await supabase
    .from("companies")
    .select("*")
    .eq("name", companyName)
    .limit(1)
    .maybeSingle<CompanyRecord>();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({ name: companyName })
    .select("*")
    .single<CompanyRecord>();

  if (error) {
    throw error;
  }

  return data;
}

export async function ensureSupabaseProfileForAuthUser(user: AuthUser) {
  const existing = await getProfileRecord(user.id);
  const companyId =
    existing?.company_id ??
    (user.role === "CLIENT" && user.companyName ? (await ensureCompany(user.companyName)).id : null);

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        company_id: companyId,
        full_name: user.name,
        email: user.email,
        role: user.role,
        is_admin: user.role === "ADMIN",
      },
      { onConflict: "id" },
    )
    .select("*, companies(id, name)")
    .single<ProfileRecord>();

  if (error) {
    throw error;
  }

  return data;
}

export async function getActiveTermsVersion() {
  const { data, error } = await supabase
    .from("terms_versions")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<TermsVersion>();

  if (error || !data) {
    return FALLBACK_TERMS_VERSION;
  }

  return data;
}

export async function getTermsVersionByVersion(version: string, fallbackTerms: TermsFallbackVersion) {
  const { data, error } = await supabase
    .from("terms_versions")
    .select("*")
    .eq("version", version)
    .limit(1)
    .maybeSingle<TermsVersion>();

  if (error || !data) {
    return fallbackTerms;
  }

  return data;
}

export async function getCurrentTermsAcceptance(userId: string, companyId: string | undefined, termsVersionId: string) {
  let query = supabase
    .from("terms_acceptances")
    .select("*")
    .eq("user_id", userId)
    .eq("terms_version_id", termsVersionId);

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query.order("accepted_at", { ascending: false }).limit(1).maybeSingle<TermsAcceptance>();

  if (error) {
    throw error;
  }

  return data;
}

export async function createAuditEvent(
  user: Pick<AuthUser, "id" | "clientId">,
  eventType: string,
  entityType?: string,
  entityId?: string,
  eventData?: Record<string, unknown>,
) {
  const { error } = await supabase.from("audit_events").insert({
    company_id: user.clientId ?? null,
    user_id: user.id,
    event_type: eventType,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    event_data: eventData ?? {},
  });

  if (error) {
    throw error;
  }
}

export async function acceptPartnerTerms(user: AuthUser, terms: TermsVersion, userAgent: string | null) {
  const existingAcceptance = await getCurrentTermsAcceptance(user.id, user.clientId, terms.id);
  if (existingAcceptance) {
    return existingAcceptance;
  }

  const { data, error } = await supabase
    .from("terms_acceptances")
    .insert({
      user_id: user.id,
      company_id: user.clientId ?? null,
      terms_version_id: terms.id,
      ip_address: null,
      user_agent: userAgent,
    })
    .select("*")
    .single<TermsAcceptance>();

  if (error) {
    const isDuplicateAcceptance =
      error.code === "23505" ||
      error.code === "409" ||
      /duplicate key|already exists|unique/i.test(error.message);

    if (isDuplicateAcceptance) {
      const duplicateAcceptance = await getCurrentTermsAcceptance(user.id, user.clientId, terms.id);
      if (duplicateAcceptance) {
        return duplicateAcceptance;
      }
    }

    throw error;
  }

  try {
    await createAuditEvent(user, "terms_accepted", "terms_versions", terms.id, {
      version: terms.version,
      user_agent: userAgent,
    });
  } catch (auditError) {
    console.error("Unable to record terms acceptance audit event", auditError);
  }

  return data;
}

export async function createOpportunityRegistration(user: AuthUser, input: OpportunityInput) {
  const status = input.status ?? "Submitted";
  const { data, error } = await supabase
    .from("opportunity_registrations")
    .insert({
      company_id: user.clientId ?? null,
      created_by: user.id,
      target_account_name: input.target_account_name.trim(),
      business_unit: toNullableString(input.business_unit),
      opportunity_description: toNullableString(input.opportunity_description),
      client_contact: toNullableString(input.client_contact),
      trusted_bums_contact: toNullableString(input.trusted_bums_contact),
      expected_product_service: toNullableString(input.expected_product_service),
      estimated_deal_value: input.estimated_deal_value ?? null,
      expected_timeline: toNullableString(input.expected_timeline),
      commission_rate: input.commission_rate ?? 10,
      commission_duration: input.commission_duration?.trim() || DEFAULT_COMMISSION_DURATION,
      notes: toNullableString(input.notes),
      status,
    })
    .select("*")
    .single<OpportunityRegistration>();

  if (error) {
    throw error;
  }

  await supabase.from("opportunity_status_history").insert({
    opportunity_id: data.id,
    old_status: null,
    new_status: status,
    changed_by: user.id,
  });
  await createAuditEvent(user, "opportunity_created", "opportunity_registrations", data.id, {
    target_account_name: data.target_account_name,
    status,
  });
  await createAuditEvent(user, "admin_notification_queued", "opportunity_registrations", data.id, {
    message: "New opportunity registration submitted for admin review.",
  });

  return data;
}

export async function listOpportunityRegistrations(status?: string) {
  let query = supabase
    .from("opportunity_registrations")
    .select("*, companies(name)")
    .order("created_at", { ascending: false });

  if (status && status !== "All") {
    query = query.eq("status", status);
  }

  const { data, error } = await query.returns<OpportunityRegistration[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listMarketplaceOpportunities() {
  const { data, error } = await supabase
    .from("opportunity_registrations")
    .select("*, companies(name)")
    .eq("status", "Accepted")
    .order("created_at", { ascending: false })
    .returns<OpportunityRegistration[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getMarketplaceOpportunity(id: string) {
  const { data, error } = await supabase
    .from("opportunity_registrations")
    .select("*, companies(name)")
    .eq("id", id)
    .eq("status", "Accepted")
    .maybeSingle<OpportunityRegistration>();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateOpportunityRegistration(
  user: AuthUser,
  opportunity: OpportunityRegistration,
  updates: Partial<Pick<OpportunityRegistration, "status" | "commission_rate" | "commission_duration" | "notes">>,
) {
  const { data, error } = await supabase
    .from("opportunity_registrations")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", opportunity.id)
    .select("*")
    .single<OpportunityRegistration>();

  if (error) {
    throw error;
  }

  if (updates.status && updates.status !== opportunity.status) {
    await supabase.from("opportunity_status_history").insert({
      opportunity_id: opportunity.id,
      old_status: opportunity.status,
      new_status: updates.status,
      changed_by: user.id,
    });
    await createAuditEvent(user, "opportunity_status_changed", "opportunity_registrations", opportunity.id, {
      old_status: opportunity.status,
      new_status: updates.status,
    });
  }

  if (
    updates.commission_rate !== undefined ||
    updates.commission_duration !== undefined ||
    updates.notes !== undefined
  ) {
    await createAuditEvent(user, "admin_override", "opportunity_registrations", opportunity.id, {
      commission_rate: updates.commission_rate,
      commission_duration: updates.commission_duration,
      notes: updates.notes,
    });
  }

  return data;
}

export async function listTermsVersions() {
  const { data, error } = await supabase
    .from("terms_versions")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<TermsVersion[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createTermsVersion(user: AuthUser, input: Pick<TermsVersion, "version" | "title" | "body" | "faq_body" | "is_active">) {
  if (input.is_active) {
    await supabase.from("terms_versions").update({ is_active: false }).eq("is_active", true);
  }

  const { data, error } = await supabase.from("terms_versions").insert(input).select("*").single<TermsVersion>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "terms_version_created", "terms_versions", data.id, { version: data.version });
  return data;
}

export async function activateTermsVersion(user: AuthUser, terms: TermsVersion) {
  await supabase.from("terms_versions").update({ is_active: false }).eq("is_active", true);
  const { data, error } = await supabase
    .from("terms_versions")
    .update({ is_active: true })
    .eq("id", terms.id)
    .select("*")
    .single<TermsVersion>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "terms_version_activated", "terms_versions", terms.id, { version: terms.version });
  return data;
}

export async function listTermsAcceptances() {
  const { data, error } = await supabase
    .from("terms_acceptances")
    .select("*, companies(name), terms_versions(version, title)")
    .order("accepted_at", { ascending: false })
    .returns<TermsAcceptance[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listCompanies() {
  const { data, error } = await supabase.from("companies").select("*").order("created_at", { ascending: false }).returns<CompanyRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, companies(id, name)")
    .order("created_at", { ascending: false })
    .returns<ProfileRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listAuditEvents() {
  const { data, error } = await supabase
    .from("audit_events")
    .select("*, companies(name)")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<AuditEvent[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listClientTrainingMaterials(user: AuthUser) {
  const { data, error } = await supabase
    .from("training_materials")
    .select("*, companies(name)")
    .eq("company_id", user.clientId ?? "")
    .order("updated_at", { ascending: false })
    .returns<TrainingMaterial[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listMarketplaceTrainingMaterials() {
  const { data, error } = await supabase
    .from("training_materials")
    .select("*, companies(name)")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .returns<TrainingMaterial[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createTrainingMaterial(user: AuthUser, input: TrainingMaterialInput) {
  if (!user.clientId) {
    throw new Error("This client user is not linked to a company yet.");
  }

  const { data, error } = await supabase
    .from("training_materials")
    .insert({
      company_id: user.clientId,
      created_by: user.id,
      title: input.title.trim(),
      description: toNullableString(input.description),
      technology: toNullableString(input.technology),
      resource_url: toNullableString(input.resource_url),
      is_published: input.is_published ?? true,
    })
    .select("*, companies(name)")
    .single<TrainingMaterial>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "training_material_created", "training_materials", data.id, {
    title: data.title,
    company_id: data.company_id,
  });

  return data;
}

export async function getOwnBumProfile(userId: string) {
  const { data, error } = await supabase
    .from("bum_profiles")
    .select("*, profiles!bum_profiles_user_id_fkey(full_name, email, created_at)")
    .eq("user_id", userId)
    .maybeSingle<BumProfileRecord>();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertOwnBumProfile(user: AuthUser, input: BumProfileInput) {
  const payload: Record<string, unknown> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (input.headline !== undefined) {
    payload.headline = toNullableString(input.headline);
  }

  if (input.bio !== undefined) {
    payload.bio = toNullableString(input.bio);
  }

  if (input.linkedin_url !== undefined) {
    payload.linkedin_url = toNullableString(input.linkedin_url);
  }

  if (input.years_experience !== undefined) {
    payload.years_experience = input.years_experience;
  }

  if (input.availability_status !== undefined) {
    payload.availability_status = input.availability_status;
  }

  if (input.home_region !== undefined) {
    payload.home_region = toNullableString(input.home_region);
  }

  if (input.industries !== undefined) {
    payload.industries = toUniqueTrimmedArray(input.industries);
  }

  if (input.regions !== undefined) {
    payload.regions = toUniqueTrimmedArray(input.regions);
  }

  if (input.products_sold !== undefined) {
    payload.products_sold = toUniqueTrimmedArray(input.products_sold);
  }

  if (input.buyer_personas !== undefined) {
    payload.buyer_personas = toUniqueTrimmedArray(input.buyer_personas);
  }

  if (input.worked_with_companies !== undefined) {
    payload.worked_with_companies = toUniqueTrimmedArray(input.worked_with_companies);
  }

  if (input.relationship_companies !== undefined) {
    payload.relationship_companies = toUniqueTrimmedArray(input.relationship_companies);
  }

  if (input.certifications !== undefined) {
    payload.certifications = toUniqueTrimmedArray(input.certifications);
  }

  if (input.skills !== undefined) {
    payload.skills = toUniqueTrimmedArray(input.skills);
  }

  if (input.notable_wins !== undefined) {
    payload.notable_wins = toNullableString(input.notable_wins);
  }

  if (input.verification_status !== undefined) {
    payload.verification_status = input.verification_status;
  }

  if (input.is_visible_to_clients !== undefined) {
    payload.is_visible_to_clients = input.is_visible_to_clients;
  }

  if (input.last_linkedin_imported_at !== undefined) {
    payload.last_linkedin_imported_at = input.last_linkedin_imported_at;
  }

  const { data, error } = await supabase
    .from("bum_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*, profiles!bum_profiles_user_id_fkey(full_name, email, created_at)")
    .single<BumProfileRecord>();

  if (error) {
    throw error;
  }

  return data;
}

export async function listAdminBumProfiles() {
  const { data, error } = await supabase
    .from("bum_profiles")
    .select("*, profiles!bum_profiles_user_id_fkey(full_name, email, created_at)")
    .order("updated_at", { ascending: false })
    .returns<BumProfileRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listVisibleBumProfiles() {
  const { data, error } = await supabase
    .from("bum_profiles")
    .select("*, profiles!bum_profiles_user_id_fkey(full_name, email, created_at)")
    .eq("is_visible_to_clients", true)
    .order("verification_status", { ascending: false })
    .order("updated_at", { ascending: false })
    .returns<BumProfileRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function invokeImpersonationFunction(accessToken: string, body: Record<string, unknown>) {
  const response = await fetch(`${supabaseUrl}/functions/v1/clerk-impersonation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as
    | ImpersonationTicketResponse
    | { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Unable to complete impersonation.");
  }

  if (!("ticket" in payload) || typeof payload.ticket !== "string" || !payload.ticket) {
    throw new Error("The impersonation service returned an incomplete response.");
  }

  return payload;
}

export async function requestUserImpersonation(accessToken: string, targetUserId: string) {
  return invokeImpersonationFunction(accessToken, {
    action: "start",
    targetUserId,
  });
}

export async function exitUserImpersonation(accessToken: string) {
  return invokeImpersonationFunction(accessToken, {
    action: "stop",
  });
}
