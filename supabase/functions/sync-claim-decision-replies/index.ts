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

interface GraphMessage {
  id: string;
  internetMessageId?: string;
  receivedDateTime?: string;
  subject?: string;
  from?: GraphEmailAddress;
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
  status: string;
  decline_reason_code: DeclineReasonCode | null;
  client_decision_token: string | null;
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
const syncSecret = Deno.env.get("CLAIM_DECISION_SYNC_SECRET");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
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

async function alreadyProcessed(messageId: string) {
  const { data, error } = await supabaseAdmin
    .from("claim_decision_email_events")
    .select("id")
    .eq("graph_message_id", messageId)
    .maybeSingle<{ id: string }>();
  if (error) throw error;
  return Boolean(data);
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
    .select("id, opportunity_registration_id, company_id, status, decline_reason_code, client_decision_token");

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

async function applyDecision(message: GraphMessage, claim: ClaimRow, decision: Decision, text: string) {
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
  await recordEvent(message, {
    claimId: claim.id,
    decision,
    reasonCode: decision === "DECLINED" ? reason.code : null,
    reasonNote: decision === "DECLINED" ? reason.note : null,
    status: "PROCESSED",
    note: "Claim decision applied.",
  });
  return "processed";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });

  try {
    if (syncSecret && request.headers.get("x-sync-secret") !== syncSecret) {
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
        if (await alreadyProcessed(message.id)) {
          skipped += 1;
          continue;
        }

        const text = messageText(message);
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

        const result = await applyDecision(message, claim, decision, text);
        if (result === "processed") processed += 1;
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
