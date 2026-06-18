import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type Decision = "APPROVED" | "DECLINED";
type DeclineReasonCode =
  | "ALREADY_CONNECTED"
  | "NO_LONGER_OPPORTUNITY"
  | "WRONG_CONTACT_LEVEL"
  | "NOT_RELEVANT"
  | "DUPLICATE"
  | "OTHER";

interface GraphEmailAddress {
  emailAddress?: {
    address?: string;
    name?: string;
  };
}

interface GraphHeader {
  name?: string;
  value?: string;
}

interface GraphMessage {
  id: string;
  internetMessageId?: string;
  receivedDateTime?: string;
  subject?: string;
  from?: GraphEmailAddress;
  internetMessageHeaders?: GraphHeader[];
  bodyPreview?: string;
  body?: {
    content?: string;
    contentType?: string;
  };
}

interface GraphCollection<T> {
  value?: T[];
}

interface ClaimRow {
  id: string;
  opportunity_registration_id: string;
  company_id: string | null;
  bum_user_id: string;
  contact_name: string;
  contact_company: string;
  note: string | null;
  status: string;
  decline_reason_code: DeclineReasonCode | null;
  client_decision_token: string | null;
  opportunity_registrations?: {
    id: string;
    target_account_name: string | null;
    companies?: { id: string; name: string | null } | null;
  } | null;
  profiles?: { id: string; full_name: string | null; email: string | null } | null;
}

interface BumSignupRequestRow {
  id: string;
  requester_profile_id: string | null;
  email: string | null;
  request_type: string | null;
  status: string | null;
}

interface AdminProfileRow {
  id: string;
  email: string | null;
  role: string | null;
  is_admin: boolean;
}

interface AdminEmailTemplateRow {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body: string;
  recipient_group: string;
  category: string;
  reply_to: string | null;
}

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sync-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const microsoftTenantId = Deno.env.get("MICROSOFT_TENANT_ID");
const microsoftClientId = Deno.env.get("MICROSOFT_CLIENT_ID");
const microsoftClientSecret = Deno.env.get("MICROSOFT_CLIENT_SECRET");
const defaultMailbox = Deno.env.get("CLAIM_DECISION_MAILBOX") ?? Deno.env.get("MICROSOFT_ORGANIZER_EMAIL") ?? "bums@trustedbums.com";
const microsoftSenderEmail = Deno.env.get("MICROSOFT_ORGANIZER_EMAIL") ?? "bums@trustedbums.com";
const portalBaseUrl = (Deno.env.get("PORTAL_BASE_URL") ?? "https://trustedbums.com").replace(/\/+$/, "");
const syncSecretEnv = Deno.env.get("CLAIM_DECISION_SYNC_SECRET")?.trim();

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
}

async function getSyncSecret() {
  if (syncSecretEnv) return syncSecretEnv;

  const { data, error } = await supabaseAdmin.rpc("claim_decision_sync_secret");
  if (error) throw error;

  return typeof data === "string" ? data.trim() : "";
}

function cleanMailbox(value: unknown) {
  const email = typeof value === "string" && value.trim() ? value.trim().toLowerCase() : defaultMailbox;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Choose a valid mailbox.");
  return email;
}

function safeNumber(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.floor(value)))
    : fallback;
}

function stripHtml(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
}

function messageText(message: GraphMessage) {
  const body = message.body?.content ? stripHtml(message.body.content) : "";
  return [message.subject ?? "", message.bodyPreview ?? "", body].filter(Boolean).join("\n");
}

const safeDiagnosticHeaderNames = new Set([
  "authentication-results",
  "received-spf",
  "x-forefront-antispam-report",
  "x-ms-exchange-organization-authas",
  "x-ms-exchange-organization-pcl",
  "x-ms-exchange-organization-scl",
  "x-ms-publictraffictype",
]);

function safeHeaderDiagnostics(message: GraphMessage) {
  const headers = (message.internetMessageHeaders ?? [])
    .map((header) => ({
      name: header.name?.trim().toLowerCase() ?? "",
      value: header.value?.replace(/\s+/g, " ").trim() ?? "",
    }))
    .filter((header) => header.name && header.value && safeDiagnosticHeaderNames.has(header.name))
    .map((header) => `${header.name}=${header.value.slice(0, 320)}`)
    .slice(0, 6);

  return headers.length ? `Safe headers: ${headers.join(" | ")}` : null;
}

function noteWithHeaderDiagnostics(message: GraphMessage, note: string) {
  const headerDiagnostics = safeHeaderDiagnostics(message);
  return headerDiagnostics ? `${note} ${headerDiagnostics}` : note;
}

function extractDecisionToken(text: string) {
  return (
    text.match(/claim\s+decision\s+token\s*:\s*([a-f0-9]{16,64})/i)?.[1]?.toLowerCase() ??
    text.match(/claim\s+token\s*:\s*([a-f0-9]{16,64})/i)?.[1]?.toLowerCase() ??
    null
  );
}

function extractClaimId(text: string) {
  return text.match(/claim\s+id\s*:\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)?.[1] ?? null;
}

function extractBumSignupRequestId(text: string) {
  return (
    text.match(/approval\s+request\s+id\s*:\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)?.[1] ??
    text.match(/request\s+id\s*:\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)?.[1] ??
    null
  );
}

function extractDecision(text: string): Decision | null {
  const normalized = text.toLowerCase();
  const approved = /\bapproved\b|\bapprove\b|\baccept(ed)?\b/.test(normalized);
  const declined = /\bdeclined\b|\bdecline\b|\breject(ed)?\b|\bno\b/.test(normalized);
  if (approved && !declined) return "APPROVED";
  if (declined && !approved) return "DECLINED";
  const firstDecision = normalized.match(/\b(approved|approve|accepted|accept|declined|decline|rejected|reject)\b/)?.[1];
  if (!firstDecision) return null;
  return firstDecision.startsWith("app") || firstDecision.startsWith("acc") ? "APPROVED" : "DECLINED";
}

function reasonFromText(text: string): { code: DeclineReasonCode; note: string | null } {
  const explicit = text.match(/(?:why|reason)\s*:\s*([^\n]+)/i)?.[1]?.trim() ?? "";
  const haystack = `${explicit}\n${text}`.toLowerCase();
  if (/already\s+(connected|know|knew|relationship)|existing\s+(connection|relationship)/.test(haystack)) {
    return { code: "ALREADY_CONNECTED", note: explicit || "Already connected." };
  }
  if (/no\s+longer\s+(an\s+)?opportunity|not\s+an\s+opportunity|closed|paused|cancelled|canceled/.test(haystack)) {
    return { code: "NO_LONGER_OPPORTUNITY", note: explicit || "No longer an opportunity." };
  }
  if (/not\s+the\s+right\s+level|wrong\s+level|too\s+junior|not\s+senior|not\s+decision/.test(haystack)) {
    return { code: "WRONG_CONTACT_LEVEL", note: explicit || "Not the right level of contact." };
  }
  if (/not\s+relevant|poor\s+fit|bad\s+fit|not\s+a\s+fit/.test(haystack)) {
    return { code: "NOT_RELEVANT", note: explicit || "Not relevant." };
  }
  if (/duplicate|already\s+submitted|same\s+contact/.test(haystack)) {
    return { code: "DUPLICATE", note: explicit || "Duplicate." };
  }
  return { code: "OTHER", note: explicit || null };
}

async function getMicrosoftAccessToken() {
  if (!microsoftTenantId || !microsoftClientId || !microsoftClientSecret) {
    throw new Error("Microsoft Graph credentials are not configured in Supabase Edge Function secrets.");
  }
  const response = await fetch(`https://login.microsoftonline.com/${microsoftTenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: microsoftClientId,
      client_secret: microsoftClientSecret,
      grant_type: "client_credentials",
      scope: "https://graph.microsoft.com/.default",
    }),
  });
  const payload = await response.json().catch(() => ({})) as { access_token?: string; error?: string; error_description?: string };
  if (!response.ok || !payload.access_token) {
    const detail = [payload.error, payload.error_description].filter(Boolean).join(": ");
    throw new Error(detail || `Microsoft rejected the email credentials with HTTP ${response.status}.`);
  }
  return payload.access_token;
}

async function listRecentMessages(accessToken: string, mailbox: string, top: number, since: string) {
  const params = new URLSearchParams({
    "$top": String(top),
    "$orderby": "receivedDateTime desc",
    "$filter": `receivedDateTime ge ${since}`,
    "$select": "id,internetMessageId,receivedDateTime,subject,from,bodyPreview,body",
  });
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}/mailFolders/inbox/messages?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}`, Prefer: 'outlook.body-content-type="text"' } },
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: { code?: string; message?: string } };
    const detail = [payload.error?.code, payload.error?.message].filter(Boolean).join(": ");
    throw new Error(detail || `Microsoft Graph messages request failed with HTTP ${response.status}.`);
  }
  const payload = await response.json() as GraphCollection<GraphMessage>;
  return payload.value ?? [];
}

async function messageWithHeaderDiagnostics(accessToken: string, mailbox: string, message: GraphMessage) {
  if (message.internetMessageHeaders?.length) {
    return message;
  }

  const params = new URLSearchParams({ "$select": "id,internetMessageHeaders" });
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}/messages/${encodeURIComponent(message.id)}?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) {
    console.warn("Unable to load message headers for claim decision diagnostics", response.status);
    return message;
  }

  const payload = await response.json().catch(() => ({})) as Pick<GraphMessage, "internetMessageHeaders">;
  return { ...message, internetMessageHeaders: payload.internetMessageHeaders ?? [] };
}

async function alreadyProcessed(messageId: string) {
  const { data, error } = await supabaseAdmin
    .from("claim_decision_email_events")
    .select("id")
    .eq("graph_message_id", messageId)
    .maybeSingle<{ id: string }>();
  if (error) throw error;
  return Boolean(data);
}

async function bumApprovalAlreadyProcessed(messageId: string) {
  const { data, error } = await supabaseAdmin
    .from("bum_signup_approval_email_events")
    .select("id")
    .eq("graph_message_id", messageId)
    .maybeSingle<{ id: string }>();
  if (error) throw error;
  return Boolean(data);
}

async function recordBumApprovalEvent(message: GraphMessage, input: {
  requestId?: string | null;
  adminProfileId?: string | null;
  decision?: "APPROVED" | "IGNORED" | null;
  status: "PROCESSED" | "SKIPPED" | "FAILED";
  note?: string;
}) {
  const { error } = await supabaseAdmin.from("bum_signup_approval_email_events").insert({
    graph_message_id: message.id,
    internet_message_id: message.internetMessageId ?? null,
    access_request_id: input.requestId ?? null,
    admin_profile_id: input.adminProfileId ?? null,
    decision: input.decision ?? "IGNORED",
    sender_email: message.from?.emailAddress?.address?.trim().toLowerCase() ?? null,
    subject: message.subject ?? null,
    received_at: message.receivedDateTime ?? null,
    processing_status: input.status,
    processing_note: input.note ?? null,
  });
  if (error && error.code !== "23505") throw error;
}

async function recordEvent(message: GraphMessage, input: {
  claimId?: string | null;
  decision?: Decision | "IGNORED" | null;
  reasonCode?: DeclineReasonCode | null;
  reasonNote?: string | null;
  status: "PROCESSED" | "SKIPPED" | "FAILED";
  note?: string;
}) {
  const { error } = await supabaseAdmin.from("claim_decision_email_events").insert({
    graph_message_id: message.id,
    internet_message_id: message.internetMessageId ?? null,
    opportunity_claim_id: input.claimId ?? null,
    decision: input.decision ?? "IGNORED",
    decline_reason_code: input.reasonCode ?? null,
    decline_reason_note: input.reasonNote ?? null,
    sender_email: message.from?.emailAddress?.address?.trim().toLowerCase() ?? null,
    subject: message.subject ?? null,
    received_at: message.receivedDateTime ?? null,
    processing_status: input.status,
    processing_note: input.note ?? null,
  });
  if (error && error.code !== "23505") throw error;
}

async function loadClaim(token: string | null, claimId: string | null) {
  let query = supabaseAdmin
    .from("opportunity_claims")
    .select("id, opportunity_registration_id, company_id, bum_user_id, contact_name, contact_company, note, status, decline_reason_code, client_decision_token, opportunity_registrations(id, target_account_name, companies(id, name)), profiles(id, full_name, email)");

  if (token) {
    query = query.eq("client_decision_token", token);
  } else if (claimId) {
    query = query.eq("id", claimId);
  } else {
    return null;
  }

  const { data, error } = await query.maybeSingle<ClaimRow>();
  if (error) throw error;
  return data;
}

async function notifyBumClaimApproved(accessToken: string, claim: ClaimRow) {
  const recipientEmail = claim.profiles?.email?.trim();
  if (!recipientEmail) {
    throw new Error("Approved claim has no Bum email for the next-step notification.");
  }

  await sendTemplateEmail(accessToken, "opportunity_claim_accepted_bum", recipientEmail, {
    claim_id: claim.id,
    opportunity_registration_id: claim.opportunity_registration_id,
    company_id: claim.company_id ?? "",
    bum_name: claim.profiles?.full_name?.trim() || recipientEmail,
    target_account_name: claim.opportunity_registrations?.target_account_name ?? "this opportunity",
    contact_name: claim.contact_name,
    contact_company: claim.contact_company,
    client_name: claim.opportunity_registrations?.companies?.name ?? "the client",
    admin_note: claim.note ?? "",
    intro_setup_url: `${portalBaseUrl}/bum/opportunities/${encodeURIComponent(claim.opportunity_registration_id)}?claimId=${encodeURIComponent(claim.id)}`,
  }, "OPPORTUNITY_CLAIM_ACCEPTED");
}

async function loadAdminBySender(message: GraphMessage) {
  const senderEmail = message.from?.emailAddress?.address?.trim().toLowerCase();
  if (!senderEmail) return null;
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role, is_admin")
    .ilike("email", senderEmail)
    .maybeSingle<AdminProfileRow>();
  if (error) throw error;
  if (!data?.is_admin && data?.role !== "ADMIN") return null;
  return data;
}

async function loadBumSignupRequest(requestId: string) {
  const { data, error } = await supabaseAdmin
    .from("client_company_access_requests")
    .select("id, requester_profile_id, email, request_type, status")
    .eq("id", requestId)
    .maybeSingle<BumSignupRequestRow>();
  if (error) throw error;
  return data;
}

function renderTemplate(template: string, metadata: Record<string, string>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => metadata[key] ?? "");
}

function textToHtml(value: string) {
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  return escaped.replace(/\n/g, "<br>");
}

async function sendTemplateEmail(accessToken: string, slug: string, recipientEmail: string, metadata: Record<string, string>, triggeredBy: string) {
  const { data: template, error: templateError } = await supabaseAdmin
    .from("admin_email_templates")
    .select("id, slug, name, subject, body, recipient_group, category, reply_to")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<AdminEmailTemplateRow>();
  if (templateError) throw templateError;
  if (!template) return;

  const subject = renderTemplate(template.subject, metadata);
  const body = renderTemplate(template.body, metadata);
  const { data: campaign, error: campaignError } = await supabaseAdmin.from("admin_email_campaigns").insert({
    template_id: template.id,
    template_slug: template.slug,
    name: template.name,
    status: "DRAFT",
    recipient_group: template.recipient_group,
    recipient_count: 1,
    category: template.category,
    subject_snapshot: template.subject,
    body_snapshot: template.body,
    metadata,
    created_by: null,
  }).select("id").single<{ id: string }>();
  if (campaignError) throw campaignError;

  const { data: delivery, error: deliveryError } = await supabaseAdmin.from("admin_email_deliveries").insert({
    campaign_id: campaign.id,
    template_id: template.id,
    template_slug: template.slug,
    recipient_group: template.recipient_group,
    recipient_email: recipientEmail,
    subject,
    body,
    metadata,
    status: "QUEUED",
    triggered_by: triggeredBy,
    category: template.category,
    created_by: null,
  }).select("id").single<{ id: string }>();
  if (deliveryError) throw deliveryError;

  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(microsoftSenderEmail)}/sendMail`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "HTML", content: textToHtml(body) },
        toRecipients: [{ emailAddress: { address: recipientEmail } }],
        replyTo: template.reply_to ? [{ emailAddress: { address: template.reply_to } }] : undefined,
      },
      saveToSentItems: true,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: { code?: string; message?: string } };
    const detail = [payload.error?.code, payload.error?.message].filter(Boolean).join(": ");
    await supabaseAdmin.from("admin_email_deliveries").update({ status: "FAILED", error: detail || `Microsoft Graph sendMail failed with HTTP ${response.status}` }).eq("id", delivery.id);
    await supabaseAdmin.from("admin_email_campaigns").update({ status: "FAILED", sent_at: new Date().toISOString() }).eq("id", campaign.id);
    throw new Error(detail || `Microsoft Graph sendMail failed with HTTP ${response.status}`);
  }

  await supabaseAdmin.from("admin_email_deliveries").update({ status: "SENT", sent_at: new Date().toISOString(), error: null }).eq("id", delivery.id);
  await supabaseAdmin.from("admin_email_campaigns").update({ status: "SENT", sent_at: new Date().toISOString() }).eq("id", campaign.id);
}

async function applyBumSignupApproval(message: GraphMessage, requestId: string, text: string, accessToken: string) {
  const decision = extractDecision(text);
  if (decision !== "APPROVED") {
    await recordBumApprovalEvent(message, { requestId, decision: "IGNORED", status: "SKIPPED", note: "No clear Approve reply found." });
    return "skipped";
  }

  const admin = await loadAdminBySender(message);
  if (!admin) {
    await recordBumApprovalEvent(message, { requestId, decision: "IGNORED", status: "SKIPPED", note: "Reply sender is not an admin profile." });
    return "skipped";
  }

  const accessRequest = await loadBumSignupRequest(requestId);
  if (!accessRequest || accessRequest.request_type !== "BUM_SIGNUP") {
    await recordBumApprovalEvent(message, { requestId, adminProfileId: admin.id, decision: "IGNORED", status: "SKIPPED", note: "No matching Bum signup request found." });
    return "skipped";
  }
  if (accessRequest.status !== "pending") {
    await recordBumApprovalEvent(message, { requestId, adminProfileId: admin.id, decision: "IGNORED", status: "SKIPPED", note: `Request is already ${accessRequest.status}.` });
    return "skipped";
  }
  if (!accessRequest.requester_profile_id) {
    await recordBumApprovalEvent(message, { requestId, adminProfileId: admin.id, decision: "IGNORED", status: "SKIPPED", note: "Request has no profile to approve." });
    return "skipped";
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ role: "BUM", is_admin: false, company_id: null, access_status: "APPROVED", disabled_at: null, disabled_by: null })
    .eq("id", accessRequest.requester_profile_id);
  if (profileError) throw profileError;

  const reviewNote = `Approved by email reply from ${message.from?.emailAddress?.address ?? "unknown sender"}.`;
  const { error: requestError } = await supabaseAdmin
    .from("client_company_access_requests")
    .update({
      status: "approved",
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote,
    })
    .eq("id", accessRequest.id);
  if (requestError) throw requestError;

  await supabaseAdmin.from("audit_events").insert({
    user_id: admin.id,
    event_type: "admin_access_request_approved_by_email",
    entity_type: "client_company_access_requests",
    entity_id: accessRequest.id,
    event_data: {
      requestId: accessRequest.id,
      requestType: accessRequest.request_type,
      requesterProfileId: accessRequest.requester_profile_id,
      graphMessageId: message.id,
      senderEmail: message.from?.emailAddress?.address ?? null,
      resultingState: { role: "BUM" },
    },
  });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email")
    .eq("id", accessRequest.requester_profile_id)
    .maybeSingle<{ full_name: string | null; email: string | null }>();
  const recipientEmail = profile?.email?.trim() || accessRequest.email?.trim();
  if (recipientEmail) {
    await sendTemplateEmail(accessToken, "bum_approved_login", recipientEmail, {
      recipient_name: profile?.full_name?.trim() || recipientEmail,
      bum_name: profile?.full_name?.trim() || recipientEmail,
      login_url: "https://trustedbums.com/login",
    }, "BUM_APPROVED");
  }

  await recordBumApprovalEvent(message, { requestId, adminProfileId: admin.id, decision: "APPROVED", status: "PROCESSED", note: "Bum signup approved by email reply." });
  return "processed";
}

async function applyDecision(message: GraphMessage, claim: ClaimRow, decision: Decision, text: string, accessToken: string, mailbox: string) {
  if (claim.status !== "PROPOSED") {
    await recordEvent(message, {
      claimId: claim.id,
      decision: "IGNORED",
      status: "SKIPPED",
      note: `Claim is already ${claim.status}.`,
    });
    return "skipped";
  }

  const reason: { code: DeclineReasonCode | null; note: string | null } =
    decision === "DECLINED" ? reasonFromText(text) : { code: null, note: null };
  const update = decision === "APPROVED"
    ? {
      status: "APPROVED",
      decline_reason_code: null,
      decline_reason_note: null,
      client_decision_source: "email_reply",
      client_decision_received_at: message.receivedDateTime ?? new Date().toISOString(),
      client_decision_email_message_id: message.id,
      client_decision_email_from: message.from?.emailAddress?.address?.trim().toLowerCase() ?? null,
    }
    : {
      status: "DECLINED",
      decline_reason_code: reason.code,
      decline_reason_note: reason.note,
      client_decision_source: "email_reply",
      client_decision_received_at: message.receivedDateTime ?? new Date().toISOString(),
      client_decision_email_message_id: message.id,
      client_decision_email_from: message.from?.emailAddress?.address?.trim().toLowerCase() ?? null,
    };

  const { error } = await supabaseAdmin.from("opportunity_claims").update(update).eq("id", claim.id);
  if (error) throw error;

  await supabaseAdmin.from("opportunity_claim_public_summaries").update({ status: decision }).eq("id", claim.id);
  await supabaseAdmin.from("audit_events").insert({
    company_id: claim.company_id,
    user_id: null,
    event_type: "opportunity_claim_email_decision_processed",
    entity_type: "opportunity_claims",
    entity_id: claim.id,
    event_data: {
      decision,
      decline_reason_code: decision === "DECLINED" ? reason.code : null,
      graph_message_id: message.id,
      sender_email: message.from?.emailAddress?.address ?? null,
    },
  });
  let processingStatus: "PROCESSED" | "FAILED" = "PROCESSED";
  let processingNote = "Claim decision applied.";
  if (decision === "APPROVED") {
    try {
      await notifyBumClaimApproved(accessToken, claim);
      processingNote = "Claim decision applied and Bum notification sent.";
    } catch (error) {
      processingStatus = "FAILED";
      processingNote = `Claim approved, but Bum notification failed: ${error instanceof Error ? error.message : "Unable to send notification."}`;
    }
  }
  const diagnosticMessage = await messageWithHeaderDiagnostics(accessToken, mailbox, message);
  await recordEvent(diagnosticMessage, {
    claimId: claim.id,
    decision,
    reasonCode: decision === "DECLINED" ? reason.code : null,
    reasonNote: decision === "DECLINED" ? reason.note : null,
    status: processingStatus,
    note: noteWithHeaderDiagnostics(diagnosticMessage, processingNote),
  });
  return processingStatus === "FAILED" ? "failed" : "processed";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });

  try {
    const syncSecret = await getSyncSecret();

    if (!syncSecret) {
      return json(503, { error: "CLAIM_DECISION_SYNC_SECRET is not configured." });
    }

    if (request.headers.get("x-sync-secret") !== syncSecret) {
      return json(403, { error: "Invalid sync secret." });
    }

    const input = await request.json().catch(() => ({})) as { mailbox?: unknown; top?: unknown; days?: unknown };
    const mailbox = cleanMailbox(input.mailbox);
    const top = safeNumber(input.top, 25, 1, 100);
    const days = safeNumber(input.days, 2, 1, 14);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const accessToken = await getMicrosoftAccessToken();
    const messages = await listRecentMessages(accessToken, mailbox, top, since);

    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const message of messages) {
      try {
        const text = messageText(message);
        const bumSignupRequestId = extractBumSignupRequestId(text);
        if (bumSignupRequestId) {
          if (await bumApprovalAlreadyProcessed(message.id)) {
            skipped += 1;
            continue;
          }

          const result = await applyBumSignupApproval(message, bumSignupRequestId, text, accessToken);
          if (result === "processed") processed += 1;
          else skipped += 1;
          continue;
        }

        if (await alreadyProcessed(message.id)) {
          skipped += 1;
          continue;
        }

        const token = extractDecisionToken(text);
        const claimId = extractClaimId(text);
        if (!token && !claimId) {
          continue;
        }

        const decision = extractDecision(text);
        if (!decision) {
          await recordEvent(message, { claimId, decision: "IGNORED", status: "SKIPPED", note: "No clear Approved or Declined decision found." });
          skipped += 1;
          continue;
        }

        const claim = await loadClaim(token, claimId);
        if (!claim) {
          await recordEvent(message, { claimId, decision, status: "SKIPPED", note: "No matching claim found." });
          skipped += 1;
          continue;
        }

        const result = await applyDecision(message, claim, decision, text, accessToken, mailbox);
        if (result === "processed") processed += 1;
        else if (result === "failed") failed += 1;
        else skipped += 1;
      } catch (error) {
        failed += 1;
        await recordEvent(message, {
          decision: "IGNORED",
          status: "FAILED",
          note: error instanceof Error ? error.message : "Unable to process message.",
        }).catch(() => undefined);
      }
    }

    return json(200, { mailbox, scanned: messages.length, processed, skipped, failed });
  } catch (error) {
    console.error("Unable to sync claim decision replies", error);
    return json(500, { error: error instanceof Error ? error.message : "Unable to sync claim decision replies." });
  }
});
