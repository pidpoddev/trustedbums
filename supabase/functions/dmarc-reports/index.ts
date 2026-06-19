import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { XMLParser } from "npm:fast-xml-parser@4.5.0";
import { gunzipSync, strFromU8, unzipSync } from "npm:fflate@0.8.2";
import * as jose from "jsr:@panva/jose@6";

interface ClaimsResponse {
  sub?: string;
}

interface ProfileRow {
  id: string;
  role: string | null;
  is_admin: boolean;
}

interface GraphErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
}

interface GraphCollection<T> {
  value?: T[];
  "@odata.nextLink"?: string;
}

interface GraphEmailAddress {
  emailAddress?: {
    address?: string;
    name?: string;
  };
}

interface GraphMessage {
  id: string;
  receivedDateTime?: string;
  subject?: string;
  from?: GraphEmailAddress;
  sender?: GraphEmailAddress;
  hasAttachments?: boolean;
  internetMessageId?: string;
}

interface GraphAttachment {
  id: string;
  name?: string;
  contentType?: string;
  size?: number;
  isInline?: boolean;
  "@odata.type"?: string;
  contentBytes?: string;
}

interface DmarcReportRequest {
  mailbox?: string;
  days?: number;
  top?: number;
}

interface DmarcParsedReport {
  sourceFile: string;
  organizationName: string | null;
  reportId: string | null;
  contactEmail: string | null;
  policyDomain: string | null;
  policy: string | null;
  subdomainPolicy: string | null;
  percentage: number | null;
  dateRange: {
    begin: string | null;
    end: string | null;
  };
  totalMessages: number;
  alignedPassCount: number;
  fullFailCount: number;
  dispositionCounts: Record<string, number>;
  topSourceIps: Array<{
    ip: string;
    count: number;
    disposition: string | null;
    dkimAligned: string | null;
    spfAligned: string | null;
    headerFrom: string | null;
    dkimAuthResults: Array<{
      domain: string | null;
      selector: string | null;
      result: string | null;
    }>;
    spfAuthResults: Array<{
      domain: string | null;
      scope: string | null;
      result: string | null;
    }>;
  }>;
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
  Deno.env.get("DMARC_REPORT_MAILBOX") ??
  Deno.env.get("MICROSOFT_ORGANIZER_EMAIL") ??
  "bums@trustedbums.com";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const dmarcXmlParser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
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
  if (!configuredIssuer) throw new Error("The allowed Clerk issuer is not configured for DMARC reports.");
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
    .select("id, role, is_admin")
    .eq("id", currentUserId)
    .maybeSingle<ProfileRow>();

  if (error || !data) throw new Error("Unable to verify the current Trusted Bums profile.");
  return data;
}

function isAdmin(profile: ProfileRow) {
  return profile.is_admin || profile.role?.toUpperCase() === "ADMIN";
}

function cleanMailbox(value: unknown) {
  const email = typeof value === "string" ? value.trim().toLowerCase() : defaultMailbox;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Choose a valid mailbox.");
  return email;
}

function safeNumber(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.floor(value)))
    : fallback;
}

function asArray<T>(value: T | T[] | undefined | null) {
  if (value === undefined || value === null) return [] as T[];
  return Array.isArray(value) ? value : [value];
}

function stringValue(value: unknown) {
  if (value === undefined || value === null) return null;
  return String(value).trim() || null;
}

function numberValue(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function unixSecondsToIso(value: unknown) {
  const seconds = numberValue(value);
  return seconds === null ? null : new Date(seconds * 1000).toISOString();
}

function isXmlAttachment(attachment: GraphAttachment) {
  const name = attachment.name ?? "";
  const contentType = attachment.contentType ?? "";
  return (
    /\.(xml|gz|zip)$/i.test(name) ||
    /(?:xml|gzip|zip|compressed)/i.test(contentType)
  );
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function extractXmlDocuments(attachment: GraphAttachment) {
  if (!attachment.contentBytes) return [] as Array<{ fileName: string; xml: string }>;
  const name = attachment.name ?? "dmarc-report";
  const contentType = attachment.contentType ?? "";
  const bytes = base64ToBytes(attachment.contentBytes);

  if (/\.gz$/i.test(name) || /(?:^|\/)(?:x-)?gzip$/i.test(contentType)) {
    const xmlName = name.replace(/\.gz$/i, "");
    return [{ fileName: xmlName || name, xml: strFromU8(gunzipSync(bytes)) }];
  }

  if (/\.zip$/i.test(name) || /(?:^|\/)(?:x-)?zip(?:$|[+;-])/i.test(contentType)) {
    const entries = unzipSync(bytes);
    return Object.entries(entries)
      .filter(([entryName]) => /\.xml$/i.test(entryName))
      .map(([entryName, entryBytes]) => ({ fileName: `${name}/${entryName}`, xml: strFromU8(entryBytes) }));
  }

  return [{ fileName: name, xml: strFromU8(bytes) }];
}

function parseDmarcXml(sourceFile: string, xml: string): DmarcParsedReport {
  const document = dmarcXmlParser.parse(xml) as {
    feedback?: {
      report_metadata?: Record<string, unknown>;
      policy_published?: Record<string, unknown>;
      record?: Array<Record<string, unknown>> | Record<string, unknown>;
    };
  };
  const feedback = document.feedback;
  if (!feedback) throw new Error("Attachment is not a DMARC aggregate feedback document.");

  const metadata = feedback.report_metadata ?? {};
  const policy = feedback.policy_published ?? {};
  const records = asArray(feedback.record);
  const dispositionCounts: Record<string, number> = {};
  let totalMessages = 0;
  let alignedPassCount = 0;
  let fullFailCount = 0;

  const sourceRows = records.map((record) => {
    const row = (record.row ?? {}) as Record<string, unknown>;
    const policyEvaluated = (row.policy_evaluated ?? {}) as Record<string, unknown>;
    const identifiers = (record.identifiers ?? {}) as Record<string, unknown>;
    const authResults = (record.auth_results ?? {}) as Record<string, unknown>;
    const count = numberValue(row.count) ?? 0;
    const disposition = stringValue(policyEvaluated.disposition);
    const dkimAligned = stringValue(policyEvaluated.dkim);
    const spfAligned = stringValue(policyEvaluated.spf);

    totalMessages += count;
    if (dkimAligned === "pass" || spfAligned === "pass") alignedPassCount += count;
    if (dkimAligned !== "pass" && spfAligned !== "pass") fullFailCount += count;
    if (disposition) dispositionCounts[disposition] = (dispositionCounts[disposition] ?? 0) + count;

    return {
      ip: stringValue(row.source_ip) ?? "(unknown)",
      count,
      disposition,
      dkimAligned,
      spfAligned,
      headerFrom: stringValue(identifiers.header_from),
      dkimAuthResults: asArray(authResults.dkim as Record<string, unknown> | Record<string, unknown>[] | undefined).map((dkim) => ({
        domain: stringValue(dkim.domain),
        selector: stringValue(dkim.selector),
        result: stringValue(dkim.result),
      })),
      spfAuthResults: asArray(authResults.spf as Record<string, unknown> | Record<string, unknown>[] | undefined).map((spf) => ({
        domain: stringValue(spf.domain),
        scope: stringValue(spf.scope),
        result: stringValue(spf.result),
      })),
    };
  });

  const dateRange = (metadata.date_range ?? {}) as Record<string, unknown>;
  return {
    sourceFile,
    organizationName: stringValue(metadata.org_name),
    reportId: stringValue(metadata.report_id),
    contactEmail: stringValue(metadata.email),
    policyDomain: stringValue(policy.domain),
    policy: stringValue(policy.p),
    subdomainPolicy: stringValue(policy.sp),
    percentage: numberValue(policy.pct),
    dateRange: {
      begin: unixSecondsToIso(dateRange.begin),
      end: unixSecondsToIso(dateRange.end),
    },
    totalMessages,
    alignedPassCount,
    fullFailCount,
    dispositionCounts,
    topSourceIps: sourceRows.sort((left, right) => right.count - left.count).slice(0, 20),
  };
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

  const payload = (await response.json().catch(() => ({}))) as {
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
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T & GraphErrorPayload;
  if (!response.ok) throw new Error(microsoftGraphErrorMessage(payload, context, response.status));
  return payload;
}

function isLikelyDmarcMessage(message: GraphMessage, attachments: GraphAttachment[]) {
  const haystack = [
    message.subject,
    message.from?.emailAddress?.address,
    message.sender?.emailAddress?.address,
    ...attachments.map((attachment) => attachment.name),
    ...attachments.map((attachment) => attachment.contentType),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    haystack.includes("dmarc") ||
    haystack.includes("aggregate report") ||
    haystack.includes("report domain") ||
    haystack.includes("rua") ||
    attachments.some((attachment) => /\.(xml|zip|gz)$/i.test(attachment.name ?? ""))
  );
}

async function listMessageAttachments(accessToken: string, mailbox: string, messageId: string) {
  const url =
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}` +
    `/messages/${encodeURIComponent(messageId)}/attachments` +
    "?$select=id,name,contentType,size,isInline";
  const payload = await graphGetJson<GraphCollection<GraphAttachment>>(url, accessToken, "Read message attachments");
  return payload.value ?? [];
}

async function getMessageAttachment(accessToken: string, mailbox: string, messageId: string, attachmentId: string) {
  const url =
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}` +
    `/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachmentId)}`;
  return await graphGetJson<GraphAttachment>(url, accessToken, "Read DMARC report attachment");
}

async function parseDmarcAttachments(accessToken: string, mailbox: string, messageId: string, attachments: GraphAttachment[]) {
  const parsedReports: DmarcParsedReport[] = [];
  const parseErrors: Array<{ attachment: string; error: string }> = [];

  for (const attachment of attachments.filter(isXmlAttachment)) {
    if (attachment.isInline) continue;
    if (attachment["@odata.type"] && attachment["@odata.type"] !== "#microsoft.graph.fileAttachment") {
      parseErrors.push({
        attachment: attachment.name ?? attachment.id,
        error: "Only file attachments can be parsed as DMARC XML.",
      });
      continue;
    }

    try {
      const fullAttachment = await getMessageAttachment(accessToken, mailbox, messageId, attachment.id);
      for (const document of extractXmlDocuments(fullAttachment)) {
        parsedReports.push(parseDmarcXml(document.fileName, document.xml));
      }
    } catch (error) {
      parseErrors.push({
        attachment: attachment.name ?? attachment.id,
        error: error instanceof Error ? error.message : "Unable to parse DMARC XML attachment.",
      });
    }
  }

  return { parsedReports, parseErrors };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Use POST for DMARC report review." });

  try {
    const token = getBearerToken(request);
    const currentProfile = await getCurrentProfile(token);
    if (!isAdmin(currentProfile)) return json(403, { error: "Only admins can review DMARC report emails." });

    const input = (await request.json().catch(() => ({}))) as DmarcReportRequest;
    const mailbox = cleanMailbox(input.mailbox);
    const days = safeNumber(input.days, 14, 1, 90);
    const top = safeNumber(input.top, 50, 10, 100);
    const accessToken = await getMicrosoftAccessToken();
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const messagesUrl =
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}/mailFolders/inbox/messages` +
      `?$top=${top}` +
      "&$orderby=receivedDateTime desc" +
      "&$select=id,receivedDateTime,subject,from,sender,hasAttachments,internetMessageId";
    const payload = await graphGetJson<GraphCollection<GraphMessage>>(messagesUrl, accessToken, "Read mailbox messages");
    const messages = payload.value ?? [];
    const results = [];

    for (const message of messages) {
      const receivedAt = message.receivedDateTime ? Date.parse(message.receivedDateTime) : 0;
      if (receivedAt && receivedAt < cutoff) continue;

      const attachments = message.hasAttachments
        ? await listMessageAttachments(accessToken, mailbox, message.id)
        : [];

      if (!isLikelyDmarcMessage(message, attachments)) continue;
      const parsed = await parseDmarcAttachments(accessToken, mailbox, message.id, attachments);

      results.push({
        id: message.id,
        receivedDateTime: message.receivedDateTime ?? null,
        subject: message.subject ?? "(no subject)",
        from: message.from?.emailAddress?.address ?? message.sender?.emailAddress?.address ?? null,
        fromName: message.from?.emailAddress?.name ?? message.sender?.emailAddress?.name ?? null,
        internetMessageId: message.internetMessageId ?? null,
        attachments: attachments.map((attachment) => ({
          id: attachment.id,
          name: attachment.name ?? "(unnamed attachment)",
          contentType: attachment.contentType ?? null,
          size: attachment.size ?? null,
          isInline: attachment.isInline ?? false,
          type: attachment["@odata.type"] ?? null,
        })),
        parsedReports: parsed.parsedReports,
        parseErrors: parsed.parseErrors,
      });
    }

    const parsedReports = results.flatMap((report) => report.parsedReports);
    return json(200, {
      mailbox,
      days,
      scannedMessages: messages.length,
      dmarcReportsFound: results.length,
      parsedReportsFound: parsedReports.length,
      parsedMessageCount: results.filter((report) => report.parsedReports.length > 0).length,
      parsedSummary: {
        totalMessages: parsedReports.reduce((sum, report) => sum + report.totalMessages, 0),
        alignedPassCount: parsedReports.reduce((sum, report) => sum + report.alignedPassCount, 0),
        fullFailCount: parsedReports.reduce((sum, report) => sum + report.fullFailCount, 0),
      },
      reports: results,
      nextLinkPresent: Boolean(payload["@odata.nextLink"]),
    });
  } catch (error) {
    console.error("Unable to review DMARC report emails", error);
    return json(500, { error: error instanceof Error ? error.message : "Unable to review DMARC report emails." });
  }
});
