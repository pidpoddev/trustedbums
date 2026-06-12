import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

interface ClaimsResponse { sub?: string }
interface ProfileRow { id: string; role: string | null; is_admin: boolean; full_name: string | null; email: string | null }
interface GraphErrorPayload { error?: { code?: string; message?: string } }
interface GraphCollection<T> { value?: T[]; "@odata.nextLink"?: string }
interface GraphEmailAddress { emailAddress?: { address?: string; name?: string } }
interface GraphBody { contentType?: string; content?: string }
interface GraphMessage {
  id: string;
  conversationId?: string;
  internetMessageId?: string;
  subject?: string;
  bodyPreview?: string;
  body?: GraphBody;
  from?: GraphEmailAddress;
  sender?: GraphEmailAddress;
  toRecipients?: GraphEmailAddress[];
  ccRecipients?: GraphEmailAddress[];
  receivedDateTime?: string;
  sentDateTime?: string;
  hasAttachments?: boolean;
  isRead?: boolean;
  importance?: string;
  webLink?: string;
}

type MailboxOperation = "sync" | "list_messages" | "get_message" | "send_message" | "update_status";
type SendAction = "NEW" | "REPLY" | "REPLY_ALL";

interface MailboxRequest {
  operation?: MailboxOperation;
  mailbox?: string;
  top?: number;
  days?: number;
  status?: string;
  category?: string;
  messageId?: string;
  action?: SendAction;
  to?: string[];
  cc?: string[];
  subject?: string;
  body?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const clerkFrontendApiUrl = Deno.env.get("CLERK_FRONTEND_API_URL");
const microsoftTenantId = Deno.env.get("MICROSOFT_TENANT_ID");
const microsoftClientId = Deno.env.get("MICROSOFT_CLIENT_ID");
const microsoftClientSecret = Deno.env.get("MICROSOFT_CLIENT_SECRET");
const defaultMailbox =
  Deno.env.get("SHARED_MAILBOX_EMAIL") ??
  Deno.env.get("DMARC_REPORT_MAILBOX") ??
  Deno.env.get("MICROSOFT_ORGANIZER_EMAIL") ??
  "bums@trustedbums.com";

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
  return authorization.slice("Bearer ".length).trim();
}

function decodeBase64Url(segment: string) {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
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
  if (!configuredIssuer) throw new Error("The allowed Clerk issuer is not configured for shared mailbox access.");
  const allowedIssuer = normalizeIssuer(configuredIssuer);
  if (issuer && normalizeIssuer(issuer) !== allowedIssuer) {
    throw new Error("This Clerk session was issued by an unapproved tenant.");
  }
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
    .select("id, role, is_admin, full_name, email")
    .eq("id", currentUserId)
    .maybeSingle<ProfileRow>();

  if (error || !data) throw new Error("Unable to verify the current Trusted Bums profile.");
  return data;
}

function isAdmin(profile: ProfileRow) {
  return profile.is_admin || profile.role?.toUpperCase() === "ADMIN";
}

function cleanMailbox(value: unknown) {
  const email = typeof value === "string" && value.trim() ? value.trim().toLowerCase() : defaultMailbox.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Choose a valid mailbox.");
  if (email !== defaultMailbox.toLowerCase()) throw new Error("Only the approved shared mailbox can be opened here.");
  return email;
}

function safeNumber(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.floor(value)))
    : fallback;
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanEmail(value: unknown) {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function cleanEmailList(value: unknown, max = 25) {
  if (!Array.isArray(value)) return [] as string[];
  return Array.from(new Set(value.map(cleanEmail).filter(Boolean) as string[])).slice(0, max);
}

function graphRecipients(recipients: string[]) {
  return recipients.map((address) => ({ emailAddress: { address } }));
}

function normalizeRecipients(recipients?: GraphEmailAddress[]) {
  return (recipients ?? []).map((recipient) => ({
    email: recipient.emailAddress?.address?.trim().toLowerCase() ?? "",
    name: recipient.emailAddress?.name?.trim() ?? null,
  })).filter((recipient) => recipient.email);
}

function classifyMessage(message: Pick<GraphMessage, "subject" | "bodyPreview" | "from">) {
  const haystack = [
    message.subject,
    message.bodyPreview,
    message.from?.emailAddress?.address,
    message.from?.emailAddress?.name,
  ].filter(Boolean).join(" ").toLowerCase();

  if (haystack.includes("dmarc") || haystack.includes("aggregate report") || haystack.includes("rua")) return "dmarc";
  if (haystack.includes("privacy") || haystack.includes("delete my data") || haystack.includes("data request")) return "privacy";
  if (haystack.includes("abuse") || haystack.includes("spam") || haystack.includes("phishing")) return "abuse";
  if (haystack.includes("complaint") || haystack.includes("concern")) return "complaint";
  if (haystack.includes("terms") || haystack.includes("agreement") || haystack.includes("legal")) return "legal";
  if (haystack.includes("criteria") || haystack.includes("blackcurrant")) return "client_criteria";
  if (haystack.includes("support") || haystack.includes("help")) return "support";
  if (haystack.includes("?") || haystack.includes("question")) return "question";
  return "uncategorized";
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

  const payload = await response.json().catch(() => ({})) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!response.ok || !payload.access_token) {
    const detail = [payload.error, payload.error_description].filter(Boolean).join(": ");
    throw new Error(detail || `Microsoft rejected the Graph credentials with HTTP ${response.status}.`);
  }
  return payload.access_token;
}

function microsoftGraphErrorMessage(payload: GraphErrorPayload, fallback: string, status: number) {
  return [payload.error?.code, payload.error?.message].filter(Boolean).join(": ") || `${fallback} failed with HTTP ${status}.`;
}

async function graphGetJson<T>(url: string, accessToken: string, context: string) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } });
  const payload = await response.json().catch(() => ({})) as T & GraphErrorPayload;
  if (!response.ok) throw new Error(microsoftGraphErrorMessage(payload, context, response.status));
  return payload;
}

async function graphPostJson(url: string, accessToken: string, body: Record<string, unknown>, context: string) {
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as GraphErrorPayload;
    throw new Error(microsoftGraphErrorMessage(payload, context, response.status));
  }
}

function messageRow(mailbox: string, message: GraphMessage) {
  const from = message.from ?? message.sender;
  const bodyType = message.body?.contentType?.toLowerCase() === "html" ? "html" : "text";
  return {
    mailbox,
    graph_message_id: message.id,
    internet_message_id: message.internetMessageId ?? null,
    graph_conversation_id: message.conversationId ?? null,
    direction: "INBOUND",
    subject: cleanText(message.subject, 500) || "(no subject)",
    body_preview: cleanText(message.bodyPreview, 1000) || null,
    body_content: cleanText(message.body?.content, 20000) || null,
    body_content_type: bodyType,
    from_email: from?.emailAddress?.address?.trim().toLowerCase() ?? null,
    from_name: from?.emailAddress?.name?.trim() ?? null,
    to_recipients: normalizeRecipients(message.toRecipients),
    cc_recipients: normalizeRecipients(message.ccRecipients),
    received_at: message.receivedDateTime ?? null,
    sent_at: message.sentDateTime ?? null,
    has_attachments: Boolean(message.hasAttachments),
    is_read: Boolean(message.isRead),
    importance: message.importance ?? null,
    web_link: message.webLink ?? null,
    category: classifyMessage(message),
    last_synced_at: new Date().toISOString(),
  };
}

async function syncMailbox(mailbox: string, input: MailboxRequest, profile: ProfileRow) {
  const accessToken = await getMicrosoftAccessToken();
  const top = safeNumber(input.top, 50, 10, 100);
  const days = safeNumber(input.days, 30, 1, 180);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const messagesUrl =
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}/mailFolders/inbox/messages` +
    `?$top=${top}` +
    "&$orderby=receivedDateTime desc" +
    "&$select=id,conversationId,internetMessageId,subject,bodyPreview,body,from,sender,toRecipients,ccRecipients,receivedDateTime,sentDateTime,hasAttachments,isRead,importance,webLink";
  const payload = await graphGetJson<GraphCollection<GraphMessage>>(messagesUrl, accessToken, "Read shared mailbox messages");
  const messages = (payload.value ?? []).filter((message) => {
    const receivedAt = message.receivedDateTime ? Date.parse(message.receivedDateTime) : Date.now();
    return !receivedAt || receivedAt >= cutoff;
  });
  const rows = messages.map((message) => messageRow(mailbox, message));

  if (rows.length) {
    const { error } = await supabaseAdmin
      .from("admin_shared_mailbox_messages")
      .upsert(rows, { onConflict: "mailbox,graph_message_id" });
    if (error) throw error;
  }

  await auditMailboxEvent(profile, "admin_shared_mailbox_synced", undefined, {
    mailbox,
    scanned: payload.value?.length ?? 0,
    synced: rows.length,
    nextLinkPresent: Boolean(payload["@odata.nextLink"]),
  });

  return { mailbox, scanned: payload.value?.length ?? 0, synced: rows.length, nextLinkPresent: Boolean(payload["@odata.nextLink"]) };
}

async function listMessages(mailbox: string, input: MailboxRequest) {
  let query = supabaseAdmin
    .from("admin_shared_mailbox_messages")
    .select("*")
    .eq("mailbox", mailbox)
    .order("received_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(safeNumber(input.top, 50, 10, 100));

  if (input.status && input.status !== "ALL") query = query.eq("status", input.status);
  if (input.category && input.category !== "ALL") query = query.eq("category", input.category);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function getMessage(mailbox: string, messageId: string) {
  const { data, error } = await supabaseAdmin
    .from("admin_shared_mailbox_messages")
    .select("*, admin_shared_mailbox_send_events(*)")
    .eq("mailbox", mailbox)
    .eq("id", messageId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Shared mailbox message was not found.");
  return data;
}

async function updateStatus(mailbox: string, input: MailboxRequest, profile: ProfileRow) {
  const messageId = cleanText(input.messageId, 80);
  if (!messageId) throw new Error("Choose a shared mailbox message.");
  const status = cleanText(input.status, 40);
  const allowed = new Set(["OPEN", "IN_PROGRESS", "HANDLED", "ARCHIVED"]);
  if (!allowed.has(status)) throw new Error("Choose a valid mailbox status.");
  const patch: Record<string, unknown> = { status };
  if (status === "HANDLED") {
    patch.handled_by = profile.id;
    patch.handled_at = new Date().toISOString();
  }
  const { data, error } = await supabaseAdmin
    .from("admin_shared_mailbox_messages")
    .update(patch)
    .eq("mailbox", mailbox)
    .eq("id", messageId)
    .select("*")
    .single();
  if (error) throw error;
  await auditMailboxEvent(profile, "admin_shared_mailbox_status_updated", messageId, { status, mailbox });
  return data;
}

async function sendMessage(mailbox: string, input: MailboxRequest, profile: ProfileRow) {
  const action = input.action === "REPLY" || input.action === "REPLY_ALL" ? input.action : "NEW";
  const body = cleanText(input.body, 8000);
  if (!body) throw new Error("Write a reply or message body.");
  const accessToken = await getMicrosoftAccessToken();
  const messageId = cleanText(input.messageId, 80);
  const toRecipients = cleanEmailList(input.to);
  const ccRecipients = cleanEmailList(input.cc);
  const subject = cleanText(input.subject, 240);
  let mailboxMessage: { id: string; graph_message_id: string; subject?: string } | null = null;

  if (action === "NEW") {
    if (!toRecipients.length) throw new Error("Add at least one recipient.");
    if (!subject) throw new Error("Add a subject.");
  } else {
    if (!messageId) throw new Error("Choose a shared mailbox message to reply to.");
    const { data, error } = await supabaseAdmin
      .from("admin_shared_mailbox_messages")
      .select("id, graph_message_id, subject")
      .eq("mailbox", mailbox)
      .eq("id", messageId)
      .maybeSingle<{ id: string; graph_message_id: string; subject?: string }>();
    if (error) throw error;
    if (!data) throw new Error("Shared mailbox message was not found.");
    mailboxMessage = data;
  }

  const { data: sendEvent, error: sendEventError } = await supabaseAdmin
    .from("admin_shared_mailbox_send_events")
    .insert({
      mailbox_message_id: mailboxMessage?.id ?? null,
      action,
      from_mailbox: mailbox,
      to_recipients: toRecipients,
      cc_recipients: ccRecipients,
      subject: action === "NEW" ? subject : mailboxMessage?.subject ?? null,
      body,
      status: "QUEUED",
      sent_by: profile.id,
    })
    .select("id")
    .single<{ id: string }>();
  if (sendEventError) throw sendEventError;

  try {
    if (action === "NEW") {
      const sendUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}/sendMail`;
      await graphPostJson(sendUrl, accessToken, {
        message: {
          subject,
          body: { contentType: "Text", content: body },
          toRecipients: graphRecipients(toRecipients),
          ccRecipients: graphRecipients(ccRecipients),
        },
        saveToSentItems: true,
      }, "Send shared mailbox message");

      await supabaseAdmin.from("admin_shared_mailbox_messages").insert({
        mailbox,
        graph_message_id: `local-sent-${sendEvent.id}`,
        direction: "OUTBOUND",
        subject,
        body_preview: body.slice(0, 500),
        body_content: body,
        body_content_type: "text",
        from_email: mailbox,
        from_name: "Trusted Bums",
        to_recipients: toRecipients.map((email) => ({ email, name: null })),
        cc_recipients: ccRecipients.map((email) => ({ email, name: null })),
        sent_at: new Date().toISOString(),
        is_read: true,
        category: "support",
        status: "HANDLED",
        handled_by: profile.id,
        handled_at: new Date().toISOString(),
      });
    } else {
      const replyUrl =
        `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}` +
        `/messages/${encodeURIComponent(mailboxMessage!.graph_message_id)}` +
        `/${action === "REPLY_ALL" ? "replyAll" : "reply"}`;
      await graphPostJson(replyUrl, accessToken, { comment: body }, `Send shared mailbox ${action === "REPLY_ALL" ? "reply all" : "reply"}`);
      await supabaseAdmin
        .from("admin_shared_mailbox_messages")
        .update({ status: "HANDLED", handled_by: profile.id, handled_at: new Date().toISOString() })
        .eq("id", mailboxMessage!.id);
    }

    await supabaseAdmin
      .from("admin_shared_mailbox_send_events")
      .update({ status: "SENT", sent_at: new Date().toISOString(), error: null })
      .eq("id", sendEvent.id);
    await auditMailboxEvent(profile, "admin_shared_mailbox_message_sent", mailboxMessage?.id, { action, mailbox, toCount: toRecipients.length, ccCount: ccRecipients.length });
    return { sent: true, action, eventId: sendEvent.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send mailbox message.";
    await supabaseAdmin.from("admin_shared_mailbox_send_events").update({ status: "FAILED", error: message }).eq("id", sendEvent.id);
    throw error;
  }
}

async function auditMailboxEvent(profile: ProfileRow, eventType: string, entityId?: string, eventData: Record<string, unknown> = {}) {
  const { error } = await supabaseAdmin.from("audit_events").insert({
    user_id: profile.id,
    event_type: eventType,
    entity_type: "admin_shared_mailbox_messages",
    entity_id: entityId ?? null,
    event_data: eventData,
  });
  if (error) console.warn("Unable to write shared mailbox audit event", error);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Use POST for shared mailbox operations." });

  try {
    const currentProfile = await getCurrentProfile(getBearerToken(request));
    if (!isAdmin(currentProfile)) return json(403, { error: "Only admins can use the shared mailbox." });
    const input = await request.json().catch(() => ({})) as MailboxRequest;
    const mailbox = cleanMailbox(input.mailbox);
    const operation = input.operation ?? "list_messages";

    switch (operation) {
      case "sync":
        return json(200, { data: await syncMailbox(mailbox, input, currentProfile) });
      case "list_messages":
        return json(200, { data: await listMessages(mailbox, input) });
      case "get_message":
        return json(200, { data: await getMessage(mailbox, cleanText(input.messageId, 80)) });
      case "send_message":
        return json(200, { data: await sendMessage(mailbox, input, currentProfile) });
      case "update_status":
        return json(200, { data: await updateStatus(mailbox, input, currentProfile) });
      default:
        return json(400, { error: "Unknown shared mailbox operation." });
    }
  } catch (error) {
    console.error("Unable to process shared mailbox request", error);
    return json(500, { error: error instanceof Error ? error.message : "Unable to process shared mailbox request." });
  }
});
