import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

interface ClaimsResponse {
  sub?: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  is_admin: boolean;
}

interface CustomerTargetRow {
  id: string;
  client_company_id: string;
  target_company_id: string;
  target_account_name: string;
  key_contact_name: string | null;
  key_contact_email: string | null;
  expected_product_service: string | null;
  notes: string | null;
  client_companies: { name: string } | null;
  target_companies: { name: string; website: string | null } | null;
}

interface MeetingRequest {
  customerTargetId?: string;
  subject?: string;
  description?: string;
  startTime?: string;
  durationMinutes?: number;
  attendeeEmails?: string[];
}

interface MicrosoftEventResponse {
  id?: string;
  webLink?: string;
  onlineMeeting?: {
    id?: string;
    joinUrl?: string;
  } | null;
}

interface GraphCollection<T> {
  value?: T[];
}

interface GraphErrorPayload {
  error?: {
    code?: string;
    message?: string;
    innerError?: {
      date?: string;
      "request-id"?: string;
      "client-request-id"?: string;
    };
  };
}

interface GraphOnlineMeeting {
  id?: string;
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
const microsoftTenantId = Deno.env.get("MICROSOFT_TENANT_ID");
const microsoftClientId = Deno.env.get("MICROSOFT_CLIENT_ID");
const microsoftClientSecret = Deno.env.get("MICROSOFT_CLIENT_SECRET");
const microsoftOrganizerEmail = Deno.env.get("MICROSOFT_ORGANIZER_EMAIL") ?? "bums@trustedbums.com";
const microsoftLogoUrl = Deno.env.get("MICROSOFT_LOGO_URL") ?? "https://trustedbums.com/logo-light.jpg";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase function environment is missing required project credentials.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  if (!authorization.startsWith("Bearer ")) {
    throw new Error("Missing bearer token.");
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw new Error("Missing bearer token.");
  }

  return token;
}

function decodeBase64Url(segment: string) {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
}

function parseJwtPayload(token: string) {
  const payloadSegment = token.split(".")[1] ?? "";

  if (!payloadSegment) {
    throw new Error("The current session token is malformed.");
  }

  return JSON.parse(decodeBase64Url(payloadSegment)) as ClaimsResponse & {
    iss?: string;
  };
}

function resolveClerkJwksUrl(issuer?: string) {
  const candidate = issuer?.trim() || clerkFrontendApiUrl?.trim();

  if (!candidate) {
    throw new Error("Unable to determine the Clerk JWKS endpoint for this session.");
  }

  return new URL("/.well-known/jwks.json", candidate).toString();
}

async function getCurrentUserId(token: string) {
  const payload = parseJwtPayload(token);
  const jwksUrl = resolveClerkJwksUrl(payload.iss);
  const { payload: verifiedPayload } = await jose.jwtVerify(
    token,
    jose.createRemoteJWKSet(new URL(jwksUrl)),
    payload.iss ? { issuer: payload.iss } : undefined,
  );
  const claims = verifiedPayload as ClaimsResponse;
  const currentUserId = claims.sub?.trim();

  if (!currentUserId) {
    throw new Error("The verified Clerk session did not include a user ID.");
  }

  return currentUserId;
}

async function getProfile(id: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, role, is_admin")
    .eq("id", id)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw new Error("Unable to read the Trusted Bums user directory.");
  }

  return data;
}

async function getCustomerTarget(id: string) {
  const { data, error } = await supabaseAdmin
    .from("customer_targets")
    .select("id, client_company_id, target_company_id, target_account_name, key_contact_name, key_contact_email, expected_product_service, notes, client_companies:companies!customer_targets_client_company_id_fkey(name), target_companies:companies!customer_targets_target_company_id_fkey(name, website)")
    .eq("id", id)
    .maybeSingle<CustomerTargetRow>();

  if (error) {
    throw new Error("Unable to read the target account.");
  }

  return data;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function uniqueEmails(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? normalizeEmail(value) : ""))
        .filter((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)),
    ),
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeODataString(value: string) {
  return value.replace(/'/g, "''");
}

function buildMeetingBody(target: CustomerTargetRow, description: string | null) {
  const targetName = target.target_companies?.name ?? target.target_account_name;
  const clientName = target.client_companies?.name ?? "the client";
  const lines = [
    `<p><img src="${escapeHtml(microsoftLogoUrl)}" alt="Trusted Bums" width="96" /></p>`,
    `<p>Trusted Bums intro call for <strong>${escapeHtml(clientName)}</strong> and <strong>${escapeHtml(targetName)}</strong>.</p>`,
  ];

  if (target.expected_product_service) {
    lines.push(`<p><strong>Focus:</strong> ${escapeHtml(target.expected_product_service)}</p>`);
  }

  if (description) {
    lines.push(`<p>${escapeHtml(description).replace(/\n/g, "<br />")}</p>`);
  }

  if (target.notes) {
    lines.push(`<p><strong>Target notes:</strong> ${escapeHtml(target.notes).replace(/\n/g, "<br />")}</p>`);
  }

  return lines.join("");
}

async function getMicrosoftAccessToken() {
  if (!microsoftTenantId || !microsoftClientId || !microsoftClientSecret) {
    throw new Error("Microsoft Graph credentials are not configured in Supabase Edge Function secrets.");
  }

  const response = await fetch(`https://login.microsoftonline.com/${microsoftTenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
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
    throw new Error(detail || `Microsoft rejected the scheduler credentials with HTTP ${response.status}.`);
  }

  return payload.access_token;
}

async function createTeamsEvent(input: {
  subject: string;
  bodyHtml: string;
  startTime: Date;
  endTime: Date;
  attendeeEmails: string[];
  accessToken: string;
}) {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(microsoftOrganizerEmail)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: input.subject,
        body: {
          contentType: "HTML",
          content: input.bodyHtml,
        },
        start: {
          dateTime: input.startTime.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: input.endTime.toISOString(),
          timeZone: "UTC",
        },
        attendees: input.attendeeEmails.map((email) => ({
          emailAddress: {
            address: email,
          },
          type: "required",
        })),
        isOnlineMeeting: true,
        onlineMeetingProvider: "teamsForBusiness",
      }),
    },
  );

  const payload = (await response.json().catch(() => ({}))) as MicrosoftEventResponse & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || "Microsoft Graph could not create the Teams meeting.");
  }

  return payload;
}

function microsoftGraphErrorMessage(payload: GraphErrorPayload, fallback: string, status: number) {
  const graphError = payload.error;
  const requestId = graphError?.innerError?.["request-id"] ?? graphError?.innerError?.["client-request-id"];
  const detail = [
    fallback,
    `HTTP ${status}`,
    graphError?.code,
    graphError?.message,
    requestId ? `request-id ${requestId}` : null,
  ].filter(Boolean);

  return detail.join(" | ");
}

async function graphGetJson<T>(url: string, accessToken: string, context = "Microsoft Graph request") {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T & GraphErrorPayload;

  if (!response.ok) {
    throw new Error(microsoftGraphErrorMessage(payload, context, response.status));
  }

  return payload;
}

async function resolveOnlineMeetingId(teamsJoinUrl: string | null, accessToken: string) {
  if (!teamsJoinUrl) {
    return null;
  }

  const params = new URLSearchParams({
    $filter: `JoinWebUrl eq '${escapeODataString(teamsJoinUrl)}'`,
  });
  const payload = await graphGetJson<GraphCollection<GraphOnlineMeeting>>(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(microsoftOrganizerEmail)}/onlineMeetings?${params.toString()}`,
    accessToken,
    "Resolve Teams online meeting from join URL",
  );

  return payload.value?.[0]?.id ?? null;
}

async function configureOnlineMeetingOptions(onlineMeetingId: string, accessToken: string) {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(microsoftOrganizerEmail)}/onlineMeetings/${encodeURIComponent(onlineMeetingId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        allowTranscription: true,
        lobbyBypassSettings: {
          isDialInBypassEnabled: true,
          scope: "everyone",
        },
        recordAutomatically: true,
      }),
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as GraphErrorPayload;
    throw new Error(microsoftGraphErrorMessage(payload, "Configure Teams meeting recording/transcription options", response.status));
  }
}

async function findOpportunityRegistrationId(target: CustomerTargetRow) {
  const { data } = await supabaseAdmin
    .from("opportunity_registrations")
    .select("id")
    .eq("company_id", target.client_company_id)
    .ilike("target_account_name", target.target_account_name)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>();

  return data?.id ?? null;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  try {
    const currentUserId = await getCurrentUserId(getBearerToken(request));
    const profile = await getProfile(currentUserId);

    if (!profile) {
      return json(403, { error: "Create a Trusted Bums profile before scheduling meetings." });
    }

    const normalizedRole = profile.role?.toUpperCase();

    if (!profile.is_admin && normalizedRole !== "ADMIN" && normalizedRole !== "BUM") {
      return json(403, { error: "Only Bums and admins can schedule customer target calls." });
    }

    const body = (await request.json().catch(() => ({}))) as MeetingRequest;
    const customerTargetId = body.customerTargetId?.trim();
    const startTime = body.startTime ? new Date(body.startTime) : null;
    const durationMinutes = Number(body.durationMinutes ?? 30);

    if (!customerTargetId) {
      return json(400, { error: "Choose a customer target before scheduling." });
    }

    if (!startTime || Number.isNaN(startTime.getTime())) {
      return json(400, { error: "Choose a valid start time." });
    }

    if (!Number.isFinite(durationMinutes) || durationMinutes < 15 || durationMinutes > 240) {
      return json(400, { error: "Duration must be between 15 and 240 minutes." });
    }

    const target = await getCustomerTarget(customerTargetId);

    if (!target) {
      return json(404, { error: "That customer target no longer exists." });
    }

    const endTime = new Date(startTime.getTime() + durationMinutes * 60_000);
    const subject =
      body.subject?.trim() ||
      `Trusted Bums intro: ${target.client_companies?.name ?? "Client"} <> ${
        target.target_companies?.name ?? target.target_account_name
      }`;
    const description = body.description?.trim() || null;
    const attendeeEmails = uniqueEmails([
      profile.email,
      target.key_contact_email,
      ...(Array.isArray(body.attendeeEmails) ? body.attendeeEmails : []),
    ]);

    if (!attendeeEmails.length) {
      return json(400, { error: "Add at least one attendee email." });
    }

    const accessToken = await getMicrosoftAccessToken();
    const microsoftEvent = await createTeamsEvent({
      subject,
      bodyHtml: buildMeetingBody(target, description),
      startTime,
      endTime,
      attendeeEmails,
      accessToken,
    });

    const teamsJoinUrl = microsoftEvent.onlineMeeting?.joinUrl ?? null;
    let microsoftOnlineMeetingId = microsoftEvent.onlineMeeting?.id ?? null;
    let meetingOptionsConfigured = false;
    let meetingOptionsWarning: string | null = null;

    try {
      microsoftOnlineMeetingId = microsoftOnlineMeetingId ?? (await resolveOnlineMeetingId(teamsJoinUrl, accessToken));

      if (!microsoftOnlineMeetingId) {
        throw new Error("Microsoft Graph did not return an online meeting ID for meeting option updates.");
      }

      await configureOnlineMeetingOptions(microsoftOnlineMeetingId, accessToken);
      meetingOptionsConfigured = true;
    } catch (error) {
      meetingOptionsWarning =
        error instanceof Error
          ? error.message
          : "Microsoft Graph could not enable auto-recording, transcription, and lobby bypass.";
    }

    const opportunityRegistrationId = await findOpportunityRegistrationId(target);

    const { data: meeting, error: insertError } = await supabaseAdmin
      .from("teams_meetings")
      .insert({
        customer_target_id: target.id,
        client_company_id: target.client_company_id,
        target_company_id: target.target_company_id,
        opportunity_registration_id: opportunityRegistrationId,
        scheduled_by: profile.id,
        subject,
        description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        attendees: attendeeEmails.map((email) => ({ email, response: "none", responseTime: null })),
        teams_join_url: teamsJoinUrl,
        microsoft_event_id: microsoftEvent.id ?? null,
        microsoft_online_meeting_id: microsoftOnlineMeetingId,
        microsoft_event_web_link: microsoftEvent.webLink ?? null,
        transcript_sync_error: meetingOptionsWarning,
      })
      .select("*")
      .single();

    if (insertError) {
      throw new Error("The Teams meeting was created, but Trusted Bums could not save the meeting record.");
    }

    await supabaseAdmin.from("customer_targets").update({ status: "MEETING_SET" }).eq("id", target.id);

    return json(200, {
      meeting,
      teamsJoinUrl,
      eventWebLink: microsoftEvent.webLink ?? null,
      meetingOptionsConfigured,
      meetingOptionsWarning,
    });
  } catch (error) {
    return json(400, {
      error: error instanceof Error ? error.message : "Unable to schedule the Teams meeting.",
    });
  }
});
