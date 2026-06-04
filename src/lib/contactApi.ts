import { supabase } from "@/lib/supabase";
import type { AuthUser } from "@/data/authData";

export type ContactInterest = "CLIENT" | "BUM" | "GENERAL";
export type ContactSubmissionStatus = "NEW" | "REVIEWED" | "INVITED" | "REPLIED" | "ESCALATED" | "ARCHIVED";
export type ContactEscalationType = "CLIENT_TARGET" | "BUM_PROFILE" | "BUM_INVITE";

export interface ContactSubmissionInput {
  name: string;
  email: string;
  companyName?: string;
  interest: ContactInterest;
  targetAccounts?: string;
  message: string;
  website?: string;
  turnstileToken?: string;
  idempotencyKey?: string;
}

export interface ContactSubmissionRecord {
  id: string;
  name: string;
  email: string;
  company_name: string | null;
  interest: ContactInterest;
  target_accounts: string | null;
  message: string;
  source: string;
  user_agent: string | null;
  status: ContactSubmissionStatus;
  admin_notes: string | null;
  admin_owner_id: string | null;
  admin_next_action: string | null;
  admin_priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  notification_sent_at: string | null;
  notification_error: string | null;
  escalated_to: ContactEscalationType | null;
  escalated_entity_id: string | null;
  escalated_at: string | null;
  escalated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactClientTargetInput {
  clientCompanyId: string;
  targetAccountName: string;
  targetCompanyWebsite?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  expectedProductService?: string;
  estimatedDealValue?: number | null;
  notes?: string;
}

function toNullableString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function assertAdmin(user: AuthUser) {
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can manage contact submissions.");
  }
}

function normalizeCompanyName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function createProspectiveBumId(submissionId: string) {
  return `contact-bum-${submissionId}`;
}

function splitList(value?: string | null) {
  return Array.from(
    new Set(
      (value ?? "")
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

async function createAuditEvent(user: AuthUser, eventType: string, entityType: string, entityId: string | null, eventData: Record<string, unknown>) {
  const { error } = await supabase.from("audit_events").insert({
    company_id: user.clientId ?? null,
    user_id: user.id,
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    event_data: eventData,
  });

  if (error) {
    throw error;
  }
}

async function findCompanyByName(companyName: string) {
  const normalizedName = normalizeCompanyName(companyName);
  const { data, error } = await supabase.from("companies").select("*").ilike("name", companyName.trim());

  if (error) {
    throw error;
  }

  return (data ?? []).find((company) => normalizeCompanyName(company.name) === normalizedName) ?? null;
}

async function ensureContactCompany(companyName: string, website?: string | null) {
  const existing = await findCompanyByName(companyName);

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({
      name: companyName.trim(),
      website: toNullableString(website),
      relationship_stage: "INACTIVE",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function submitContactSubmission(input: ContactSubmissionInput) {
  if (input.website?.trim()) {
    return { submitted: true };
  }

  const { data, error } = await supabase.functions.invoke<{ submitted: boolean; notificationSent?: boolean }>("submit-contact", {
    body: {
      ...input,
      idempotencyKey: input.idempotencyKey ?? crypto.randomUUID(),
    },
  });

  if (error) {
    throw error;
  }

  return data ?? { submitted: true };
}

export async function listContactSubmissions() {
  const { data, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<ContactSubmissionRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function updateContactSubmission(
  user: AuthUser,
  submissionId: string,
  updates: {
    status?: ContactSubmissionStatus;
    adminNotes?: string;
    escalatedTo?: ContactEscalationType | null;
    escalatedEntityId?: string | null;
  },
) {
  assertAdmin(user);

  const payload: Record<string, unknown> = {};

  if (updates.status !== undefined) {
    payload.status = updates.status;
  }

  if (updates.adminNotes !== undefined) {
    payload.admin_notes = toNullableString(updates.adminNotes);
  }

  if (updates.escalatedTo !== undefined) {
    payload.escalated_to = updates.escalatedTo;
  }

  if (updates.escalatedEntityId !== undefined) {
    payload.escalated_entity_id = updates.escalatedEntityId;
  }

  if (updates.escalatedTo || updates.escalatedEntityId || updates.status === "ESCALATED" || updates.status === "INVITED") {
    payload.escalated_at = new Date().toISOString();
    payload.escalated_by = user.id;
  }

  const { data, error } = await supabase
    .from("contact_submissions")
    .update(payload)
    .eq("id", submissionId)
    .select("*")
    .single<ContactSubmissionRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "contact_submission_updated", "contact_submissions", submissionId, {
    status: updates.status,
    escalated_to: updates.escalatedTo,
  });

  return data;
}

export async function claimContactSubmission(user: AuthUser, submissionId: string) {
  assertAdmin(user);

  const { data, error } = await supabase
    .from("contact_submissions")
    .update({
      admin_owner_id: user.id,
      admin_next_action: "Admin follow-up in progress",
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .select("*")
    .single<ContactSubmissionRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "contact_submission_claimed", "contact_submissions", submissionId, {
    admin_owner_id: user.id,
  });

  return data;
}

export async function escalateContactToClientTarget(
  user: AuthUser,
  submission: ContactSubmissionRecord,
  input: ContactClientTargetInput,
) {
  assertAdmin(user);

  const targetCompany = await ensureContactCompany(input.targetAccountName, input.targetCompanyWebsite);
  const notes = [
    input.notes,
    `Escalated from contact submission ${submission.id}.`,
    `Submitted by: ${submission.name} <${submission.email}>`,
    submission.company_name ? `Submitter company: ${submission.company_name}` : null,
    submission.target_accounts ? `Original target notes: ${submission.target_accounts}` : null,
    `Original message: ${submission.message}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const { data, error } = await supabase
    .from("customer_targets")
    .upsert(
      {
        client_company_id: input.clientCompanyId,
        target_company_id: targetCompany.id,
        created_by: user.id,
        status: "PROSPECT",
        priority: input.priority ?? "MEDIUM",
        target_account_name: input.targetAccountName.trim(),
        expected_product_service: toNullableString(input.expectedProductService),
        estimated_deal_value: input.estimatedDealValue ?? null,
        notes,
      },
      { onConflict: "client_company_id,target_company_id" },
    )
    .select("id")
    .single<{ id: string }>();

  if (error) {
    throw error;
  }

  const updated = await updateContactSubmission(user, submission.id, {
    status: "ESCALATED",
    adminNotes: notes,
    escalatedTo: "CLIENT_TARGET",
    escalatedEntityId: data.id,
  });

  await createAuditEvent(user, "contact_submission_escalated_to_client_target", "customer_targets", data.id, {
    contact_submission_id: submission.id,
    target_account_name: input.targetAccountName,
  });

  return { targetId: data.id, submission: updated };
}

export async function escalateContactToProspectiveBum(user: AuthUser, submission: ContactSubmissionRecord) {
  assertAdmin(user);

  const prospectiveBumId = createProspectiveBumId(submission.id);

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: prospectiveBumId,
      full_name: submission.name.trim(),
      email: submission.email.trim().toLowerCase(),
      role: "BUM",
      is_admin: false,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw profileError;
  }

  const relatedCompanies = splitList(submission.target_accounts ?? submission.company_name);
  const { error: bumError } = await supabase.from("bum_profiles").upsert(
    {
      user_id: prospectiveBumId,
      headline: "Bum Prospect from contact form",
      bio: submission.message,
      relationship_companies: relatedCompanies,
      worked_with_companies: relatedCompanies,
      verification_status: "self_reported",
      is_visible_to_clients: false,
    },
    { onConflict: "user_id" },
  );

  if (bumError) {
    throw bumError;
  }

  const updated = await updateContactSubmission(user, submission.id, {
    status: "ESCALATED",
    adminNotes: "Created a Bum Prospect profile from this contact submission. Keep hidden from clients until reviewed.",
    escalatedTo: "BUM_PROFILE",
    escalatedEntityId: prospectiveBumId,
  });

  await createAuditEvent(user, "contact_submission_escalated_to_bum_profile", "profiles", null, {
    contact_submission_id: submission.id,
    prospective_bum_id: prospectiveBumId,
  });

  return { prospectiveBumId, submission: updated };
}

export async function markContactBumInvited(user: AuthUser, submission: ContactSubmissionRecord, notes?: string) {
  assertAdmin(user);

  const updated = await updateContactSubmission(user, submission.id, {
    status: "INVITED",
    adminNotes: notes || "Marked as invited to become a Bum. Send the invite through the normal Clerk/sign-up flow.",
    escalatedTo: "BUM_INVITE",
    escalatedEntityId: submission.email.trim().toLowerCase(),
  });

  await createAuditEvent(user, "contact_submission_bum_invited", "contact_submissions", submission.id, {
    contact_email: submission.email,
  });

  return updated;
}
