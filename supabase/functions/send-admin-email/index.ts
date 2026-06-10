import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

interface ClaimsResponse { sub?: string }
interface ProfileRow { id: string | null; company_id: string | null; full_name: string | null; email: string | null; role: string | null; is_admin: boolean }
interface EmailTemplateRow { id: string; slug: string; name: string; recipient_group: RecipientGroup; trigger_event: string | null; subject: string; body: string; is_active: boolean; category: EmailCategory; reply_to: string | null; rate_limit_per_hour: number }
interface BrandSettingsRow { sender_name: string; logo_url: string; accent_color: string; footer_text: string; physical_address: string | null }
interface BumProfileRow { user_id: string; industries: string[] | null; profiles: Pick<ProfileRow, "id" | "full_name" | "email"> | null }

type RecipientGroup = "ALL_USERS" | "CLIENT_COMPANY" | "ALL_CLIENTS" | "ALL_BUMS" | "BUM_INDUSTRY_MATCH" | "ADMINS" | "CUSTOM";
type EmailCategory = "transactional" | "opportunity_updates" | "client_alerts" | "bum_marketplace_alerts" | "admin_announcements" | "onboarding" | "marketing";
type SendMode = "manual" | "action" | "preview" | "test";
type AdminEmailOperation =
  | "list_templates"
  | "create_template"
  | "update_template"
  | "list_deliveries"
  | "list_engagement"
  | "list_campaigns"
  | "list_trigger_rules"
  | "create_trigger_rule"
  | "update_trigger_rule"
  | "list_schedules"
  | "create_schedule"
  | "update_schedule"
  | "get_brand_settings"
  | "save_brand_settings";

interface SendAdminEmailRequest { operation?: AdminEmailOperation; payload?: Record<string, unknown>; mode?: SendMode; templateId?: string; templateSlug?: string; recipientGroup?: RecipientGroup; recipientEmails?: string[]; testRecipientEmail?: string; subject?: string; body?: string; metadata?: Record<string, unknown>; triggeredBy?: string }
interface Recipient { profileId?: string | null; email: string; name?: string | null; suppressed?: boolean; suppressionReason?: string }

const corsHeaders = { "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const clerkFrontendApiUrl = Deno.env.get("CLERK_FRONTEND_API_URL");
const microsoftTenantId = Deno.env.get("MICROSOFT_TENANT_ID");
const microsoftClientId = Deno.env.get("MICROSOFT_CLIENT_ID");
const microsoftClientSecret = Deno.env.get("MICROSOFT_CLIENT_SECRET");
const microsoftSenderEmail = Deno.env.get("MICROSOFT_ORGANIZER_EMAIL") ?? "bums@trustedbums.com";
const emailTrackingBaseUrl = Deno.env.get("EMAIL_TRACKING_BASE_URL") ?? `${supabaseUrl ?? ""}/functions/v1/email-track`;

if (!supabaseUrl || !supabaseServiceRoleKey) throw new Error("Supabase function environment is missing required project credentials.");
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

function json(status: number, payload: Record<string, unknown>) { return new Response(JSON.stringify(payload), { status, headers: corsHeaders }) }
function getBearerToken(request: Request) { const authorization = request.headers.get("authorization") ?? ""; if (!authorization.startsWith("Bearer ")) throw new Error("Missing bearer token."); return authorization.slice("Bearer ".length).trim() }
function decodeBase64Url(segment: string) { const normalized = segment.replace(/-/g, "+").replace(/_/g, "/"); const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4)); return atob(`${normalized}${padding}`) }
function parseJwtPayload(token: string) { const payloadSegment = token.split(".")[1] ?? ""; if (!payloadSegment) throw new Error("The current session token is malformed."); return JSON.parse(decodeBase64Url(payloadSegment)) as ClaimsResponse & { iss?: string } }
function resolveClerkJwksUrl(issuer?: string) { const candidate = issuer?.trim() || clerkFrontendApiUrl?.trim(); if (!candidate) throw new Error("Unable to determine the Clerk JWKS endpoint for this session."); return new URL("/.well-known/jwks.json", candidate).toString() }
async function getCurrentProfile(token: string) { const payload = parseJwtPayload(token); const jwksUrl = resolveClerkJwksUrl(payload.iss); const { payload: verifiedPayload } = await jose.jwtVerify(token, jose.createRemoteJWKSet(new URL(jwksUrl)), payload.iss ? { issuer: payload.iss } : undefined); const currentUserId = (verifiedPayload as ClaimsResponse).sub?.trim(); if (!currentUserId) throw new Error("The verified Clerk session did not include a user ID."); const { data, error } = await supabaseAdmin.from("profiles").select("id, company_id, full_name, email, role, is_admin").eq("id", currentUserId).maybeSingle<ProfileRow>(); if (error || !data) throw new Error("Unable to verify the current Trusted Bums profile."); return data }
function isAdmin(profile: ProfileRow) { return profile.is_admin || profile.role?.toUpperCase() === "ADMIN" }
function cleanString(value: unknown, maxLength: number) { return typeof value === "string" ? value.trim().slice(0, maxLength) : "" }
function isEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) }
function isSelfOnlyCustomAction(input: SendAdminEmailRequest, currentProfile: ProfileRow) {
  const currentEmail = currentProfile.email?.trim().toLowerCase();
  const recipients = (input.recipientEmails ?? []).map((email) => email.trim().toLowerCase()).filter(isEmail);
  return Boolean(currentEmail && recipients.length === 1 && recipients[0] === currentEmail);
}
function isInternalEmailRequest(request: Request) {
  return request.headers.get("authorization") === `Bearer ${supabaseServiceRoleKey}` &&
    request.headers.get("x-internal-email") === "trustedbums-edge";
}
function normalizeMetadata(metadata?: Record<string, unknown>) { return Object.fromEntries(Object.entries(metadata ?? {}).map(([key, value]) => [key, typeof value === "string" ? value.trim() : String(value ?? "")])) }
function renderTemplate(template: string, metadata: Record<string, string>) { return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => metadata[key] ?? "") }
function escapeHtml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;") }
function normalizeBrandUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return "https://trustedbums.com" + (value.startsWith("/") ? value : "/" + value);
}

async function getBrandSettings(): Promise<BrandSettingsRow> {
  const { data, error } = await supabaseAdmin
    .from("admin_email_brand_settings")
    .select("sender_name, logo_url, accent_color, footer_text, physical_address")
    .eq("id", true)
    .maybeSingle<BrandSettingsRow>();

  if (error) console.warn("Unable to load email brand settings", error);
  return data ?? {
    sender_name: "Trusted Bums",
    logo_url: "https://trustedbums.com/logo-mark.svg",
    accent_color: "#ea580c",
    footer_text: "Trusted Bums connects relationship-led sellers with companies that need warm introductions.",
    physical_address: null,
  };
}

function trackedUrl(url: string, deliveryId?: string) {
  return deliveryId ? emailTrackingBaseUrl + "/click?d=" + encodeURIComponent(deliveryId) + "&u=" + encodeURIComponent(url) : url;
}

function renderEmailLine(line: string, deliveryId?: string) {
  const image = line.trim().match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/);
  if (image) {
    const alt = escapeHtml(image[1] || "Email image");
    const src = escapeHtml(image[2]);
    return '<img src="' + src + '" alt="' + alt + '" style="display:block;max-width:100%;height:auto;border:0;border-radius:8px;margin:16px 0;" />';
  }

  return escapeHtml(line).replace(/https?:\/\/[^\s<]+/g, (url) => '<a href="' + trackedUrl(url, deliveryId) + '" style="color:#ea580c;text-decoration:underline;">' + url + '</a>');
}

function htmlFromText(value: string, deliveryId: string | undefined, brand: BrandSettingsRow) {
  const accent = /^#[0-9a-f]{6}$/i.test(brand.accent_color) ? brand.accent_color : "#ea580c";
  const body = value.split("\n").map((line) => renderEmailLine(line, deliveryId)).join("<br>");
  const pixel = deliveryId ? '<img src="' + emailTrackingBaseUrl + '/open?d=' + encodeURIComponent(deliveryId) + '" width="1" height="1" alt="" style="display:none" />' : "";
  const address = brand.physical_address ? '<div style="margin-top:8px;">' + escapeHtml(brand.physical_address) + '</div>' : "";

  return '<!doctype html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:24px 12px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;"><tr><td style="background:#0f172a;padding:0;"><div style="height:6px;background:' + accent + ';"></div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:22px 28px;"><img src="' + escapeHtml(normalizeBrandUrl(brand.logo_url)) + '" alt="' + escapeHtml(brand.sender_name) + '" style="display:block;max-height:46px;width:auto;border:0;background:#ffffff;border-radius:10px;padding:8px;" /></td><td align="right" style="padding:22px 28px;color:#e2e8f0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">Trusted Bums</td></tr></table></td></tr><tr><td style="padding:30px 28px;font-size:15px;line-height:1.65;color:#334155;">' + body + '</td></tr><tr><td style="background:#0f172a;padding:20px 28px;border-top:6px solid ' + accent + ';font-size:12px;line-height:1.55;color:#cbd5e1;">' + escapeHtml(brand.footer_text) + address + '</td></tr></table></td></tr></table>' + pixel + '</body></html>';
}

async function getMicrosoftAccessToken() { if (!microsoftTenantId || !microsoftClientId || !microsoftClientSecret) throw new Error("Microsoft Graph credentials are not configured in Supabase Edge Function secrets."); const response = await fetch(`https://login.microsoftonline.com/${microsoftTenantId}/oauth2/v2.0/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: microsoftClientId, client_secret: microsoftClientSecret, grant_type: "client_credentials", scope: "https://graph.microsoft.com/.default" }) }); const payload = await response.json().catch(() => ({})) as { access_token?: string; error?: string; error_description?: string }; if (!response.ok || !payload.access_token) { const detail = [payload.error, payload.error_description].filter(Boolean).join(": "); throw new Error(detail || `Microsoft rejected the email credentials with HTTP ${response.status}.`) } return payload.access_token }
async function getTemplate(input: SendAdminEmailRequest) { let query = supabaseAdmin.from("admin_email_templates").select("*"); if (input.templateId) query = query.eq("id", input.templateId); else if (input.templateSlug) query = query.eq("slug", input.templateSlug); else throw new Error("Choose an email template."); const { data, error } = await query.maybeSingle<EmailTemplateRow>(); if (error || !data) throw new Error("Email template not found."); if (!data.is_active) throw new Error("Email template is inactive."); return data }
function profileToRecipient(profile: Pick<ProfileRow, "id" | "full_name" | "email">): Recipient | null { const email = profile.email?.trim().toLowerCase(); if (!email || !isEmail(email)) return null; return { profileId: profile.id, email, name: profile.full_name } }
async function resolveRecipients(group: RecipientGroup, input: SendAdminEmailRequest, metadata: Record<string, string>) {
  if (group === "CUSTOM") {
    return Array.from(new Map((input.recipientEmails ?? []).map((email) => email.trim().toLowerCase()).filter(isEmail).map((email) => [email, { email } as Recipient])).values());
  }

  if (group === "ALL_USERS") {
    const { data, error } = await supabaseAdmin.from("profiles").select("id, full_name, email");
    if (error) throw error;
    return (data ?? []).map(profileToRecipient).filter(Boolean) as Recipient[];
  }

  if (group === "CLIENT_COMPANY") {
    const companyId = metadata.company_id;
    if (!companyId) throw new Error("CLIENT_COMPANY emails require metadata.company_id.");
    const { data, error } = await supabaseAdmin.from("profiles").select("id, full_name, email").eq("company_id", companyId).eq("role", "CLIENT");
    if (error) throw error;
    return (data ?? []).map(profileToRecipient).filter(Boolean) as Recipient[];
  }

  if (group === "ALL_CLIENTS" || group === "ALL_BUMS") {
    const role = group === "ALL_CLIENTS" ? "CLIENT" : "BUM";
    const { data, error } = await supabaseAdmin.from("profiles").select("id, full_name, email").eq("role", role);
    if (error) throw error;
    return (data ?? []).map(profileToRecipient).filter(Boolean) as Recipient[];
  }

  if (group === "ADMINS") {
    const { data, error } = await supabaseAdmin.from("profiles").select("id, full_name, email").or("is_admin.eq.true,role.eq.ADMIN");
    if (error) throw error;
    return (data ?? []).map(profileToRecipient).filter(Boolean) as Recipient[];
  }

  const industry = metadata.industry?.toLowerCase();
  if (!industry) throw new Error("BUM_INDUSTRY_MATCH emails require metadata.industry.");
  const { data, error } = await supabaseAdmin.from("bum_profiles").select("user_id, industries, profiles!bum_profiles_user_id_fkey(id, full_name, email)").eq("is_visible_to_clients", true).returns<BumProfileRow[]>();
  if (error) throw error;
  return (data ?? []).filter((bum) => (bum.industries ?? []).some((item) => item.toLowerCase() === industry)).map((bum) => bum.profiles && profileToRecipient(bum.profiles)).filter(Boolean) as Recipient[];
}
async function applySuppressions(recipients: Recipient[], category: EmailCategory, includeSuppressed: boolean) { if (!recipients.length || category === "transactional") return recipients; const emails = recipients.map((recipient) => recipient.email); const [{ data: suppressions, error: suppressionError }, { data: preferences, error: preferenceError }] = await Promise.all([supabaseAdmin.from("admin_email_suppressions").select("email, reason").in("email", emails), supabaseAdmin.from("admin_email_preferences").select("email, category").eq("category", category).eq("opted_out", true).in("email", emails)]); if (suppressionError) throw suppressionError; if (preferenceError) throw preferenceError; const suppressionByEmail = new Map((suppressions ?? []).map((row) => [row.email.toLowerCase(), row.reason])); const optedOutEmails = new Set((preferences ?? []).map((row) => row.email.toLowerCase())); return recipients.map((recipient) => { const reason = suppressionByEmail.get(recipient.email) ?? (optedOutEmails.has(recipient.email) ? "OPTED_OUT" : undefined); return reason ? { ...recipient, suppressed: true, suppressionReason: reason } : recipient }).filter((recipient) => includeSuppressed || !recipient.suppressed) }
async function sendMicrosoftEmail(accessToken: string, recipient: string, subject: string, body: string, deliveryId: string, replyTo: string | null, brand: BrandSettingsRow) { const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(microsoftSenderEmail)}/sendMail`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ message: { subject, body: { contentType: "HTML", content: htmlFromText(body, deliveryId, brand) }, toRecipients: [{ emailAddress: { address: recipient } }], replyTo: replyTo ? [{ emailAddress: { address: replyTo } }] : undefined }, saveToSentItems: true }) }); if (!response.ok) { const payload = await response.json().catch(() => ({})) as { error?: { code?: string; message?: string } }; const detail = [payload.error?.code, payload.error?.message].filter(Boolean).join(": "); throw new Error(detail || `Microsoft Graph sendMail failed with HTTP ${response.status}.`) } }

function stringValue(value: unknown, fallback = "") { return typeof value === "string" ? value.trim() : fallback }
function nullableString(value: unknown) { const text = stringValue(value); return text ? text : null }
function booleanValue(value: unknown, fallback = false) { return typeof value === "boolean" ? value : fallback }
function numberValue(value: unknown, fallback = 0) { return typeof value === "number" && Number.isFinite(value) ? value : fallback }
function recordValue(value: unknown) { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {} }
function stringArrayValue(value: unknown) { return Array.isArray(value) ? value.map((item) => stringValue(item)).filter(Boolean) : [] }
function slugifyEmailTemplateName(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || `template-${Date.now()}` }
function requireId(payload: Record<string, unknown>) { const id = stringValue(payload.id); if (!id) throw new Error("A record id is required."); return id }
function requireText(payload: Record<string, unknown>, key: string) { const value = stringValue(payload[key]); if (!value) throw new Error(`${key} is required.`); return value }

async function auditAdminEmailEvent(profile: ProfileRow, eventType: string, entityType?: string, entityId?: string, eventData: Record<string, unknown> = {}) {
  const { error } = await supabaseAdmin.from("audit_events").insert({
    user_id: profile.id,
    event_type: eventType,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    event_data: eventData,
  });
  if (error) console.warn("Unable to write admin email audit event", error);
}

function templateInput(payload: Record<string, unknown>, profile: ProfileRow, includeCreatedBy: boolean) {
  const name = requireText(payload, "name");
  const values: Record<string, unknown> = {
    name,
    description: nullableString(payload.description),
    recipient_group: requireText(payload, "recipient_group"),
    trigger_event: nullableString(payload.trigger_event),
    subject: requireText(payload, "subject"),
    body: requireText(payload, "body"),
    metadata_fields: stringArrayValue(payload.metadata_fields),
    category: requireText(payload, "category"),
    reply_to: nullableString(payload.reply_to),
    rate_limit_per_hour: numberValue(payload.rate_limit_per_hour, 120),
    is_active: booleanValue(payload.is_active, true),
    updated_by: profile.id,
  };
  if (includeCreatedBy) {
    values.slug = stringValue(payload.slug) || slugifyEmailTemplateName(name);
    values.created_by = profile.id;
  }
  return values;
}

function triggerRuleInput(payload: Record<string, unknown>) {
  return {
    name: requireText(payload, "name"),
    trigger_event: requireText(payload, "trigger_event"),
    template_id: requireText(payload, "template_id"),
    is_active: booleanValue(payload.is_active, true),
    delay_minutes: numberValue(payload.delay_minutes, 0),
    conditions: recordValue(payload.conditions),
  };
}

function scheduleInput(payload: Record<string, unknown>, profile: ProfileRow, includeCreatedBy: boolean) {
  const values: Record<string, unknown> = {
    name: requireText(payload, "name"),
    template_id: requireText(payload, "template_id"),
    is_active: booleanValue(payload.is_active, true),
    cron_expression: requireText(payload, "cron_expression"),
    recipient_group: requireText(payload, "recipient_group"),
    recipient_emails: stringArrayValue(payload.recipient_emails),
    metadata: recordValue(payload.metadata),
    category: requireText(payload, "category"),
    next_run_at: nullableString(payload.next_run_at),
    updated_by: profile.id,
  };
  if (includeCreatedBy) values.created_by = profile.id;
  return values;
}

function brandSettingsDefaults() {
  const now = new Date().toISOString();
  return {
    id: true,
    sender_name: "Trusted Bums",
    logo_url: "https://trustedbums.com/logo-mark.svg",
    accent_color: "#ea580c",
    footer_text: "Trusted Bums connects relationship-led sellers with companies that need warm introductions.",
    physical_address: null,
    updated_by: null,
    created_at: now,
    updated_at: now,
  };
}

async function handleAdminEmailOperation(operation: AdminEmailOperation, payload: Record<string, unknown>, currentProfile: ProfileRow) {
  if (!currentProfile.id) return json(403, { error: "Internal email sends cannot manage email tools." });
  if (!isAdmin(currentProfile)) return json(403, { error: "Only admins can manage email tools." });

  switch (operation) {
    case "list_templates": {
      const { data, error } = await supabaseAdmin.from("admin_email_templates").select("*").order("name", { ascending: true });
      if (error) throw error;
      return json(200, { data: data ?? [] });
    }
    case "create_template": {
      const { data, error } = await supabaseAdmin.from("admin_email_templates").insert(templateInput(payload, currentProfile, true)).select("*").single();
      if (error) throw error;
      await auditAdminEmailEvent(currentProfile, "admin_email_template_created", "admin_email_templates", data.id, { slug: data.slug, recipient_group: data.recipient_group, trigger_event: data.trigger_event });
      return json(200, { data });
    }
    case "update_template": {
      const id = requireId(payload);
      const { data, error } = await supabaseAdmin.from("admin_email_templates").update(templateInput(payload, currentProfile, false)).eq("id", id).select("*").single();
      if (error) throw error;
      await auditAdminEmailEvent(currentProfile, "admin_email_template_updated", "admin_email_templates", data.id, { slug: data.slug, recipient_group: data.recipient_group, trigger_event: data.trigger_event });
      return json(200, { data });
    }
    case "list_deliveries": {
      const { data, error } = await supabaseAdmin.from("admin_email_deliveries").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return json(200, { data: data ?? [] });
    }
    case "list_engagement": {
      const { data, error } = await supabaseAdmin.from("admin_email_engagement_summary").select("*").order("engagement_score", { ascending: false }).limit(50);
      if (error) throw error;
      return json(200, { data: data ?? [] });
    }
    case "list_campaigns": {
      const { data, error } = await supabaseAdmin.from("admin_email_campaigns").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return json(200, { data: data ?? [] });
    }
    case "list_trigger_rules": {
      const { data, error } = await supabaseAdmin.from("admin_email_trigger_rules").select("*, admin_email_templates(id, name, slug)").order("created_at", { ascending: false });
      if (error) throw error;
      return json(200, { data: data ?? [] });
    }
    case "create_trigger_rule": {
      const { data, error } = await supabaseAdmin.from("admin_email_trigger_rules").insert({ ...triggerRuleInput(payload), created_by: currentProfile.id }).select("*, admin_email_templates(id, name, slug)").single();
      if (error) throw error;
      await auditAdminEmailEvent(currentProfile, "admin_email_trigger_rule_created", "admin_email_trigger_rules", data.id, { trigger_event: data.trigger_event });
      return json(200, { data });
    }
    case "update_trigger_rule": {
      const id = requireId(payload);
      const { data, error } = await supabaseAdmin.from("admin_email_trigger_rules").update(triggerRuleInput(payload)).eq("id", id).select("*, admin_email_templates(id, name, slug)").single();
      if (error) throw error;
      await auditAdminEmailEvent(currentProfile, "admin_email_trigger_rule_updated", "admin_email_trigger_rules", data.id, { trigger_event: data.trigger_event, is_active: data.is_active });
      return json(200, { data });
    }
    case "list_schedules": {
      const { data, error } = await supabaseAdmin.from("admin_email_schedules").select("*, admin_email_templates(id, name, slug)").order("created_at", { ascending: false });
      if (error) throw error;
      return json(200, { data: data ?? [] });
    }
    case "create_schedule": {
      const { data, error } = await supabaseAdmin.from("admin_email_schedules").insert(scheduleInput(payload, currentProfile, true)).select("*, admin_email_templates(id, name, slug)").single();
      if (error) throw error;
      await auditAdminEmailEvent(currentProfile, "admin_email_schedule_created", "admin_email_schedules", data.id, { cron_expression: data.cron_expression, template_id: data.template_id });
      return json(200, { data });
    }
    case "update_schedule": {
      const id = requireId(payload);
      const { data, error } = await supabaseAdmin.from("admin_email_schedules").update(scheduleInput(payload, currentProfile, false)).eq("id", id).select("*, admin_email_templates(id, name, slug)").single();
      if (error) throw error;
      await auditAdminEmailEvent(currentProfile, "admin_email_schedule_updated", "admin_email_schedules", data.id, { cron_expression: data.cron_expression, is_active: data.is_active });
      return json(200, { data });
    }
    case "get_brand_settings": {
      const { data, error } = await supabaseAdmin.from("admin_email_brand_settings").select("*").eq("id", true).maybeSingle();
      if (error) throw error;
      return json(200, { data: data ?? brandSettingsDefaults() });
    }
    case "save_brand_settings": {
      const { data, error } = await supabaseAdmin.from("admin_email_brand_settings").upsert({
        id: true,
        sender_name: requireText(payload, "sender_name"),
        logo_url: requireText(payload, "logo_url"),
        accent_color: requireText(payload, "accent_color"),
        footer_text: requireText(payload, "footer_text"),
        physical_address: nullableString(payload.physical_address),
        updated_by: currentProfile.id,
      }, { onConflict: "id" }).select("*").single();
      if (error) throw error;
      await auditAdminEmailEvent(currentProfile, "admin_email_brand_settings_updated", "admin_email_brand_settings", undefined, { sender_name: data.sender_name });
      return json(200, { data });
    }
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });
  try {
    const input = await request.json().catch(() => ({})) as SendAdminEmailRequest;
    const currentProfile = isInternalEmailRequest(request)
      ? { id: null, company_id: null, full_name: "Trusted Bums", email: null, role: "ADMIN", is_admin: true }
      : await getCurrentProfile(getBearerToken(request));
    if (input.operation) return await handleAdminEmailOperation(input.operation, recordValue(input.payload), currentProfile);
    const mode: SendMode = input.mode === "action" || input.mode === "preview" || input.mode === "test" ? input.mode : "manual";
    if (!currentProfile.id && mode !== "action") return json(403, { error: "Internal email sends must use action mode." });
    const template = await getTemplate(input);
    const metadata = normalizeMetadata(input.metadata);
    const group = input.recipientGroup ?? template.recipient_group;
    if ((mode === "manual" || mode === "preview" || mode === "test") && !isAdmin(currentProfile)) return json(403, { error: "Only admins can use manual messaging tools." });
    if (mode === "action" && template.trigger_event === "MANUAL") return json(403, { error: "Manual-only templates cannot be action triggered." });
    if (mode === "action" && template.recipient_group === "CUSTOM" && !isAdmin(currentProfile) && !isSelfOnlyCustomAction(input, currentProfile)) return json(403, { error: "Custom action-triggered email requires an admin." });
    if (mode === "action" && input.recipientGroup && input.recipientGroup !== template.recipient_group) return json(400, { error: "Action-triggered email cannot override the template recipient group." });
    const subjectTemplate = mode === "manual" || mode === "preview" || mode === "test" ? cleanString(input.subject, 240) || template.subject : template.subject;
    const bodyTemplate = mode === "manual" || mode === "preview" || mode === "test" ? cleanString(input.body, 8000) || template.body : template.body;
    const rawRecipients = mode === "test" ? [{ email: cleanString(input.testRecipientEmail || currentProfile.email, 180).toLowerCase(), name: "Test recipient" }] : await resolveRecipients(group, input, metadata);
    const recipients = await applySuppressions(rawRecipients, template.category, mode === "preview" || mode === "test");
    const suppressedCount = rawRecipients.length - recipients.filter((recipient) => !recipient.suppressed).length;
    if (!recipients.length) return json(400, { error: "No matching email recipients were found." });
    const previewRecipients = recipients.slice(0, 100).map((recipient) => ({ email: recipient.email, name: recipient.name, suppressed: Boolean(recipient.suppressed), suppressionReason: recipient.suppressionReason }));
    if (mode === "preview") return json(200, { mode, count: recipients.filter((recipient) => !recipient.suppressed).length, suppressed: suppressedCount, recipients: previewRecipients });
    const sendableRecipients = recipients.filter((recipient) => !recipient.suppressed);
    if (!sendableRecipients.length) return json(400, { error: "All matching recipients are suppressed or opted out." });
    const accessToken = await getMicrosoftAccessToken();
    const brand = await getBrandSettings();
    const { data: campaign, error: campaignError } = await supabaseAdmin.from("admin_email_campaigns").insert({ template_id: template.id, template_slug: template.slug, name: `${template.name}${mode === "test" ? " test" : ""}`, status: "DRAFT", recipient_group: group, recipient_count: sendableRecipients.length, category: template.category, subject_snapshot: subjectTemplate, body_snapshot: bodyTemplate, metadata, created_by: currentProfile.id }).select("id").single<{ id: string }>();
    if (campaignError) throw campaignError;
    const results: Array<{ email: string; status: "SENT" | "FAILED"; error?: string }> = [];
    for (const recipient of sendableRecipients) {
      const recipientMetadata = { ...metadata, recipient_email: recipient.email, recipient_name: recipient.name ?? recipient.email, client_name: metadata.client_name || recipient.name || recipient.email, bum_name: metadata.bum_name || recipient.name || recipient.email };
      const subject = renderTemplate(subjectTemplate, recipientMetadata);
      const body = renderTemplate(bodyTemplate, recipientMetadata);
      const { data: deliveryRow, error: deliveryError } = await supabaseAdmin.from("admin_email_deliveries").insert({ campaign_id: campaign.id, template_id: template.id, template_slug: template.slug, recipient_group: group, recipient_profile_id: recipient.profileId ?? null, recipient_email: recipient.email, subject, body, metadata: recipientMetadata, status: "QUEUED", triggered_by: cleanString(input.triggeredBy, 120) || (mode === "manual" ? "MANUAL" : template.trigger_event ?? "ACTION"), category: template.category, created_by: currentProfile.id, is_test: mode === "test" }).select("id").single<{ id: string }>();
      if (deliveryError) throw deliveryError;
      try { await sendMicrosoftEmail(accessToken, recipient.email, subject, body, deliveryRow.id, template.reply_to, brand); await supabaseAdmin.from("admin_email_deliveries").update({ status: "SENT", sent_at: new Date().toISOString(), error: null }).eq("id", deliveryRow.id); results.push({ email: recipient.email, status: "SENT" }); } catch (error) { const message = error instanceof Error ? error.message : "Unable to send email."; await supabaseAdmin.from("admin_email_deliveries").update({ status: "FAILED", error: message }).eq("id", deliveryRow.id); results.push({ email: recipient.email, status: "FAILED", error: message }); }
    }
    const failed = results.filter((result) => result.status === "FAILED").length;
    await supabaseAdmin.from("admin_email_campaigns").update({ status: failed ? "FAILED" : "SENT", sent_at: new Date().toISOString() }).eq("id", campaign.id);
    return json(200, { mode, campaignId: campaign.id, sent: results.filter((result) => result.status === "SENT").length, failed, suppressed: suppressedCount, results });
  } catch (error) {
    console.error("Unable to process admin email request", error);
    return json(500, { error: error instanceof Error ? error.message : "Unable to process admin email request." });
  }
});
