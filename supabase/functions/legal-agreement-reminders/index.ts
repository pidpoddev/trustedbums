import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

interface ScrumItemRow {
  id: string;
  tracking_id: string;
  title: string;
  status: string;
  priority: string;
  evidence_links: string[] | null;
}

interface MailboxMessageRow {
  id: string;
  subject: string | null;
  from_email: string | null;
  from_name: string | null;
  received_at: string | null;
  web_link: string | null;
}

interface LegalAgreementReviewRow {
  id: string;
  scrum_item_id: string;
  mailbox_message_id: string | null;
  counterparty: string;
  agreement_subject: string;
  review_status: string;
  risk_posture: "SPEED_TO_MARKET" | "BALANCED" | "STRICT";
  must_have_terms: string[];
  recommended_changes: string[];
  acceptable_tradeoffs: string[];
  owner_emails: string[];
  owner_question: string | null;
  next_owner_prompt_at: string | null;
  reminder_count: number;
  admin_scrum_items: ScrumItemRow | null;
  admin_shared_mailbox_messages: MailboxMessageRow | null;
}

interface GraphErrorPayload {
  error?: { code?: string; message?: string };
}

const responseHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-legal-queue-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const legalQueueReminderSecret = Deno.env.get("LEGAL_QUEUE_REMINDER_SECRET") ?? "";
const microsoftTenantId = Deno.env.get("MICROSOFT_TENANT_ID");
const microsoftClientId = Deno.env.get("MICROSOFT_CLIENT_ID");
const microsoftClientSecret = Deno.env.get("MICROSOFT_CLIENT_SECRET");
const microsoftSenderEmail = Deno.env.get("MICROSOFT_ORGANIZER_EMAIL") ?? "bums@trustedbums.com";
const defaultOwnerEmails = [
  "ryanmp29@gmail.com",
  "bscott@ourcassell.com",
  "tomwatsonuscga@gmail.com",
  "cpetersonluv@gmail.com",
  "bums@trustedbums.com",
];

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), { status, headers: responseHeaders });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function uniqueEmails(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim().toLowerCase()).filter(isEmail)));
}

function configuredOwnerEmails() {
  return uniqueEmails([
    ...defaultOwnerEmails,
    ...(Deno.env.get("LEGAL_QUEUE_OWNER_EMAILS") ?? "")
      .split(/[;,]/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  ]);
}

function isTrustedCaller(request: Request) {
  if (getBearerToken(request) === supabaseServiceRoleKey) return true;
  return Boolean(legalQueueReminderSecret && request.headers.get("x-legal-queue-secret") === legalQueueReminderSecret);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderList(items: string[]) {
  if (!items.length) return "<p>None recorded yet.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function speedPostureText(posture: LegalAgreementReviewRow["risk_posture"]) {
  if (posture === "STRICT") return "Strict: do not proceed until the listed must-haves are fixed and an owner approves the residual risk.";
  if (posture === "BALANCED") return "Balanced: fix the must-haves, accept ordinary commercial boilerplate when it does not change the economics or risk profile.";
  return "Speed to market: fix only the must-haves, avoid broad perfection passes, and use a side letter or short rider when that moves faster.";
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
    throw new Error(detail || `Microsoft rejected the Graph credentials with HTTP ${response.status}.`);
  }
  return payload.access_token;
}

function microsoftGraphErrorMessage(payload: GraphErrorPayload, fallback: string, status: number) {
  return [payload.error?.code, payload.error?.message].filter(Boolean).join(": ") || `${fallback} failed with HTTP ${status}.`;
}

function buildReminderEmail(review: LegalAgreementReviewRow, recipients: string[]) {
  const scrum = review.admin_scrum_items;
  const message = review.admin_shared_mailbox_messages;
  const subject = `Legal status needed: ${scrum?.tracking_id ?? "Legal queue"} - ${review.counterparty}`;
  const itemUrl = "https://trustedbums.com/admin/scrum";
  const mailboxLink = message?.web_link;
  const evidenceLinks = scrum?.evidence_links ?? [];
  const intro = review.reminder_count > 0
    ? `This is reminder ${review.reminder_count + 1} for an unhandled legal agreement.`
    : "This legal agreement is still waiting for an owner status.";

  const bodyHtml = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.55;">
      <h2 style="margin:0 0 12px;">${escapeHtml(subject)}</h2>
      <p>${escapeHtml(intro)}</p>
      <p><strong>Owner question:</strong> ${escapeHtml(review.owner_question || "Should this be redlined, signed with must-have fixes, marked superseded, or declined?")}</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;"><strong>Counterparty</strong></td><td style="padding:6px 8px;border:1px solid #e2e8f0;">${escapeHtml(review.counterparty)}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;"><strong>Agreement</strong></td><td style="padding:6px 8px;border:1px solid #e2e8f0;">${escapeHtml(review.agreement_subject)}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;"><strong>Status</strong></td><td style="padding:6px 8px;border:1px solid #e2e8f0;">${escapeHtml(review.review_status)}</td></tr>
        <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;"><strong>Scrum item</strong></td><td style="padding:6px 8px;border:1px solid #e2e8f0;">${escapeHtml(scrum?.tracking_id ?? review.scrum_item_id)} ${scrum ? escapeHtml(scrum.title) : ""}</td></tr>
        ${message ? `<tr><td style="padding:6px 8px;border:1px solid #e2e8f0;"><strong>Mailbox source</strong></td><td style="padding:6px 8px;border:1px solid #e2e8f0;">${escapeHtml(message.subject || "Shared mailbox message")} from ${escapeHtml(message.from_email || message.from_name || "unknown sender")}</td></tr>` : ""}
      </table>
      <p><strong>Legal bot posture:</strong> ${escapeHtml(speedPostureText(review.risk_posture))}</p>
      <h3>Must-haves before approval</h3>
      ${renderList(review.must_have_terms)}
      <h3>Recommended changes</h3>
      ${renderList(review.recommended_changes)}
      <h3>Acceptable tradeoffs</h3>
      ${renderList(review.acceptable_tradeoffs)}
      <p><strong>Next action:</strong> reply with the current status or update the scrum item. Daily reminders continue until the review is signed, declined, superseded, or the scrum item is closed.</p>
      <p><a href="${itemUrl}">Open Legal Queue in Scrum</a>${mailboxLink ? ` | <a href="${escapeHtml(mailboxLink)}">Open source email</a>` : ""}</p>
      ${evidenceLinks.length ? `<p><strong>Evidence:</strong><br>${evidenceLinks.map((link) => `<a href="${escapeHtml(link)}">${escapeHtml(link)}</a>`).join("<br>")}</p>` : ""}
      <p style="font-size:12px;color:#64748b;">Sent to: ${escapeHtml(recipients.join(", "))}</p>
    </div>
  `;

  return { subject, bodyHtml };
}

async function sendMicrosoftEmail(input: { accessToken: string; recipients: string[]; subject: string; bodyHtml: string }) {
  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(microsoftSenderEmail)}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject: input.subject,
        body: { contentType: "HTML", content: input.bodyHtml },
        toRecipients: input.recipients.map((address) => ({ emailAddress: { address } })),
        replyTo: [{ emailAddress: { address: "bums@trustedbums.com" } }],
      },
      saveToSentItems: true,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as GraphErrorPayload;
    throw new Error(microsoftGraphErrorMessage(payload, "Send legal queue reminder", response.status));
  }
}

function isDue(review: LegalAgreementReviewRow, nowMs: number) {
  const scrumStatus = review.admin_scrum_items?.status;
  if (scrumStatus === "CLOSED" || scrumStatus === "WONT_FIX") return false;
  if (["SIGNED", "DECLINED", "SUPERSEDED"].includes(review.review_status)) return false;
  if (!review.next_owner_prompt_at) return true;
  return Date.parse(review.next_owner_prompt_at) <= nowMs;
}

function nextDailyOwnerReminderAt(now: Date) {
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    13,
    0,
    0,
    0,
  )).toISOString();
}

async function loadDueReviews() {
  const { data, error } = await supabaseAdmin
    .from("legal_agreement_reviews")
    .select("*, admin_scrum_items(id, tracking_id, title, status, priority, evidence_links), admin_shared_mailbox_messages(id, subject, from_email, from_name, received_at, web_link)")
    .not("review_status", "in", "(SIGNED,DECLINED,SUPERSEDED)")
    .order("next_owner_prompt_at", { ascending: true })
    .returns<LegalAgreementReviewRow[]>();
  if (error) throw error;
  const nowMs = Date.now();
  return (data ?? []).filter((review) => isDue(review, nowMs));
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: responseHeaders });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });
  if (!isTrustedCaller(request)) return json(403, { error: "Legal queue reminders require a trusted internal caller." });

  try {
    const dueReviews = await loadDueReviews();
    const accessToken = dueReviews.length ? await getMicrosoftAccessToken() : "";
    const results: Array<{ reviewId: string; status: "SENT" | "FAILED"; error?: string }> = [];

    for (const review of dueReviews) {
      const recipients = uniqueEmails([...(review.owner_emails ?? []), ...configuredOwnerEmails()]);
      try {
        const email = buildReminderEmail(review, recipients);
        await sendMicrosoftEmail({ accessToken, recipients, ...email });
        const now = new Date();
        const nextPrompt = nextDailyOwnerReminderAt(now);
        await supabaseAdmin
          .from("legal_agreement_reviews")
          .update({
            review_status: review.review_status === "NEEDS_REVIEW" ? "AWAITING_OWNER" : review.review_status,
            last_owner_ping_at: now.toISOString(),
            next_owner_prompt_at: nextPrompt,
            reminder_count: review.reminder_count + 1,
          })
          .eq("id", review.id);
        await supabaseAdmin.from("legal_agreement_review_events").insert({
          legal_agreement_review_id: review.id,
          event_type: "OWNER_REMINDER_SENT",
          event_note: email.subject,
          recipient_emails: recipients,
        });
        results.push({ reviewId: review.id, status: "SENT" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to send reminder.";
        await supabaseAdmin.from("legal_agreement_review_events").insert({
          legal_agreement_review_id: review.id,
          event_type: "OWNER_REMINDER_FAILED",
          event_note: message,
          recipient_emails: recipients,
        });
        results.push({ reviewId: review.id, status: "FAILED", error: message });
      }
    }

    return json(200, {
      scanned: dueReviews.length,
      sent: results.filter((result) => result.status === "SENT").length,
      failed: results.filter((result) => result.status === "FAILED").length,
      results,
    });
  } catch (error) {
    console.error("Unable to process legal agreement reminders", error);
    return json(500, { error: error instanceof Error ? error.message : "Unable to process legal agreement reminders." });
  }
});
