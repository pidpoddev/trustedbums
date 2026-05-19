import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

interface ClaimsResponse {
  sub?: string;
}

interface ProfileRow {
  id: string;
  role: string | null;
  is_admin: boolean;
  company_id: string | null;
}

interface TeamsMeetingRow {
  id: string;
  client_company_id: string;
  scheduled_by: string;
  microsoft_event_id: string | null;
  attendees: unknown;
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

interface GraphEventAttendee {
  type?: string;
  emailAddress?: {
    name?: string | null;
    address?: string | null;
  } | null;
  status?: {
    response?: string | null;
    time?: string | null;
  } | null;
}

interface GraphEventResponse {
  id?: string;
  isCancelled?: boolean;
  attendees?: GraphEventAttendee[];
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
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
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
  return atob(normalized + padding);
}

function parseJwtPayload(token: string) {
  const payloadSegment = token.split(".")[1] ?? "";

  if (!payloadSegment) {
    throw new Error("The current session token is malformed.");
  }

  return JSON.parse(decodeBase64Url(payloadSegment)) as ClaimsResponse & { iss?: string };
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
    .select("id, role, is_admin, company_id")
    .eq("id", id)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw new Error("Unable to read the Trusted Bums user directory.");
  }

  return data;
}

async function getMicrosoftAccessToken() {
  if (!microsoftTenantId || !microsoftClientId || !microsoftClientSecret) {
    throw new Error("Microsoft Graph credentials are not configured in Supabase Edge Function secrets.");
  }

  const response = await fetch("https://login.microsoftonline.com/" + microsoftTenantId + "/oauth2/v2.0/token", {
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
    throw new Error(detail || "Microsoft rejected the attendance sync credentials with HTTP " + response.status + ".");
  }

  return payload.access_token;
}

function microsoftGraphErrorMessage(payload: GraphErrorPayload, fallback: string, status: number) {
  const graphError = payload.error;
  const requestId = graphError?.innerError?.["request-id"] ?? graphError?.innerError?.["client-request-id"];
  return [fallback, "HTTP " + status, graphError?.code, graphError?.message, requestId ? "request-id " + requestId : null]
    .filter(Boolean)
    .join(" | ");
}

async function getGraphEvent(eventId: string, accessToken: string) {
  const params = new URLSearchParams({ $select: "id,isCancelled,attendees" });
  const response = await fetch(
    "https://graph.microsoft.com/v1.0/users/" + encodeURIComponent(microsoftOrganizerEmail) + "/events/" + encodeURIComponent(eventId) + "?" + params.toString(),
    { headers: { Authorization: "Bearer " + accessToken } },
  );
  const payload = (await response.json().catch(() => ({}))) as GraphEventResponse & GraphErrorPayload;

  if (!response.ok) {
    throw new Error(microsoftGraphErrorMessage(payload, "Read Teams calendar event attendees", response.status));
  }

  return payload;
}

function normalizeGraphAttendees(attendees: GraphEventAttendee[] | undefined) {
  return (attendees ?? [])
    .map((attendee) => {
      const email = attendee.emailAddress?.address?.trim().toLowerCase() ?? "";

      if (!email) {
        return null;
      }

      return {
        email,
        name: attendee.emailAddress?.name?.trim() || null,
        type: attendee.type ?? "required",
        response: attendee.status?.response ?? "none",
        responseTime: attendee.status?.time ?? null,
      };
    })
    .filter((attendee): attendee is NonNullable<typeof attendee> => Boolean(attendee));
}

async function listVisibleMeetings(profile: ProfileRow, meetingIds: string[]) {
  let query = supabaseAdmin
    .from("teams_meetings")
    .select("id, client_company_id, scheduled_by, microsoft_event_id, attendees")
    .not("microsoft_event_id", "is", null)
    .order("start_time", { ascending: true })
    .limit(100);

  if (meetingIds.length) {
    query = query.in("id", meetingIds);
  }

  if (!profile.is_admin && profile.role?.toUpperCase() !== "ADMIN") {
    if (profile.role?.toUpperCase() === "BUM") {
      query = query.eq("scheduled_by", profile.id);
    } else if (profile.company_id) {
      query = query.eq("client_company_id", profile.company_id);
    } else {
      return [];
    }
  }

  const { data, error } = await query.returns<TeamsMeetingRow[]>();

  if (error) {
    throw new Error("Unable to read Teams meetings for attendance sync.");
  }

  return data ?? [];
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
      return json(403, { error: "Create a Trusted Bums profile before syncing Teams attendance." });
    }

    const body = (await request.json().catch(() => ({}))) as { meetingIds?: unknown };
    const meetingIds = Array.isArray(body.meetingIds)
      ? body.meetingIds.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : [];
    const meetings = await listVisibleMeetings(profile, meetingIds);
    const accessToken = await getMicrosoftAccessToken();
    const updated: Array<{ id: string; attendees: unknown[]; status?: string }> = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const meeting of meetings) {
      if (!meeting.microsoft_event_id) {
        continue;
      }

      try {
        const event = await getGraphEvent(meeting.microsoft_event_id, accessToken);
        const attendees = normalizeGraphAttendees(event.attendees);

        if (!attendees.length) {
          throw new Error("Microsoft Graph returned no attendees for this calendar event.");
        }

        const patch: Record<string, unknown> = { attendees };

        if (event.isCancelled) {
          patch.status = "CANCELLED";
        }

        const { error } = await supabaseAdmin.from("teams_meetings").update(patch).eq("id", meeting.id);

        if (error) {
          throw new Error("Trusted Bums could not save the latest attendee responses.");
        }

        updated.push({ id: meeting.id, attendees, status: event.isCancelled ? "CANCELLED" : undefined });
      } catch (error) {
        failed.push({ id: meeting.id, error: error instanceof Error ? error.message : "Unable to sync attendee responses." });
      }
    }

    return json(200, { updated, failed });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unable to sync Teams attendee responses." });
  }
});
