import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

interface TeamsMeetingRow {
  id: string;
  customer_target_id: string;
  client_company_id: string;
  opportunity_registration_id: string | null;
  opportunity_claim_id: string | null;
  subject: string;
  end_time: string;
  teams_join_url: string | null;
  microsoft_online_meeting_id: string | null;
  transcript_sync_status: "PENDING" | "AVAILABLE" | "FAILED" | "SKIPPED";
  customer_targets?: {
    target_account_name: string | null;
  } | null;
}

interface GraphCollection<T> {
  value?: T[];
  error?: {
    message?: string;
  };
}

interface GraphOnlineMeeting {
  id?: string;
}

interface GraphTranscript {
  id?: string;
  createdDateTime?: string;
  transcriptContentUrl?: string;
}

interface SyncRequest {
  batchSize?: number;
}

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
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
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  });
}

function clampBatchSize(value: unknown) {
  const parsed = Number(value ?? 10);

  if (!Number.isFinite(parsed)) {
    return 10;
  }

  return Math.max(1, Math.min(Math.trunc(parsed), 25));
}

function escapeODataString(value: string) {
  return value.replace(/'/g, "''");
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

  const payload = (await response.json().catch(() => ({}))) as { access_token?: string; error_description?: string };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || "Microsoft rejected the transcript sync credentials.");
  }

  return payload.access_token;
}

async function graphGetJson<T>(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(payload.error?.message || "Microsoft Graph request failed.");
  }

  return payload;
}

async function graphGetText(url: string, accessToken: string) {
  const separator = url.includes("?") ? "&" : "?";
  const response = await fetch(`${url}${separator}$format=text/vtt`, {
    headers: {
      Accept: "text/vtt",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(payload.error?.message || "Microsoft Graph could not download the transcript content.");
  }

  return response.text();
}

async function getPendingMeetings(batchSize: number) {
  const retryBefore = new Date(Date.now() - 10 * 60_000).toISOString();
  const endedBefore = new Date(Date.now() - 5 * 60_000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("teams_meetings")
    .select("id, customer_target_id, client_company_id, opportunity_registration_id, opportunity_claim_id, subject, end_time, teams_join_url, microsoft_online_meeting_id, transcript_sync_status, customer_targets(target_account_name)")
    .in("transcript_sync_status", ["PENDING", "FAILED"])
    .lte("end_time", endedBefore)
    .or(`transcript_sync_attempted_at.is.null,transcript_sync_attempted_at.lt.${retryBefore}`)
    .order("end_time", { ascending: true })
    .limit(batchSize)
    .returns<TeamsMeetingRow[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function resolveOpportunityRegistrationId(meeting: TeamsMeetingRow) {
  if (meeting.opportunity_registration_id) {
    return meeting.opportunity_registration_id;
  }

  const targetName = meeting.customer_targets?.target_account_name?.trim();

  if (!targetName) {
    return null;
  }

  const { data } = await supabaseAdmin
    .from("opportunity_registrations")
    .select("id")
    .eq("company_id", meeting.client_company_id)
    .ilike("target_account_name", targetName)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (data?.id) {
    await supabaseAdmin
      .from("teams_meetings")
      .update({ opportunity_registration_id: data.id })
      .eq("id", meeting.id);
  }

  return data?.id ?? null;
}

async function resolveOnlineMeetingId(meeting: TeamsMeetingRow, accessToken: string) {
  if (meeting.microsoft_online_meeting_id) {
    return meeting.microsoft_online_meeting_id;
  }

  if (!meeting.teams_join_url) {
    throw new Error("Meeting does not have a Teams join URL.");
  }

  const params = new URLSearchParams({
    $filter: `JoinWebUrl eq '${escapeODataString(meeting.teams_join_url)}'`,
  });
  const payload = await graphGetJson<GraphCollection<GraphOnlineMeeting>>(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(microsoftOrganizerEmail)}/onlineMeetings?${params.toString()}`,
    accessToken,
  );
  const onlineMeetingId = payload.value?.[0]?.id;

  if (!onlineMeetingId) {
    throw new Error("Microsoft Graph could not resolve the online meeting from the Teams join URL yet.");
  }

  await supabaseAdmin
    .from("teams_meetings")
    .update({ microsoft_online_meeting_id: onlineMeetingId })
    .eq("id", meeting.id);

  return onlineMeetingId;
}

async function listTranscripts(onlineMeetingId: string, accessToken: string) {
  const payload = await graphGetJson<GraphCollection<GraphTranscript>>(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(microsoftOrganizerEmail)}/onlineMeetings/${encodeURIComponent(onlineMeetingId)}/transcripts`,
    accessToken,
  );

  return (payload.value ?? []).filter((transcript) => transcript.id);
}

async function saveTranscript(input: {
  meeting: TeamsMeetingRow;
  opportunityRegistrationId: string | null;
  onlineMeetingId: string;
  transcript: GraphTranscript;
  transcriptText: string;
}) {
  const graphTranscriptId = input.transcript.id;

  if (!graphTranscriptId) {
    return false;
  }

  const row = {
    teams_meeting_id: input.meeting.id,
    customer_target_id: input.meeting.customer_target_id,
    opportunity_registration_id: input.opportunityRegistrationId,
    opportunity_claim_id: input.meeting.opportunity_claim_id,
    company_id: input.meeting.client_company_id,
    created_by: "system",
    source: "GRAPH",
    status: "AVAILABLE",
    title: `${input.meeting.subject} transcript`,
    transcript_text: input.transcriptText,
    transcript_url: input.transcript.transcriptContentUrl ?? null,
    content_type: "text/vtt",
    graph_transcript_id: graphTranscriptId,
    captured_at: input.transcript.createdDateTime ?? new Date().toISOString(),
    metadata: {
      microsoft_online_meeting_id: input.onlineMeetingId,
      microsoft_organizer_email: microsoftOrganizerEmail,
    },
  };

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("meeting_transcripts")
    .select("id")
    .eq("graph_transcript_id", graphTranscriptId)
    .maybeSingle<{ id: string }>();

  if (existingError) {
    throw existingError;
  }

  const query = existing?.id
    ? supabaseAdmin.from("meeting_transcripts").update(row).eq("id", existing.id)
    : supabaseAdmin.from("meeting_transcripts").insert(row);
  const { error } = await query;

  if (error) {
    throw error;
  }

  return !existing?.id;
}

async function markMeeting(
  meetingId: string,
  status: "PENDING" | "AVAILABLE" | "FAILED" | "SKIPPED",
  errorMessage: string | null,
) {
  await supabaseAdmin
    .from("teams_meetings")
    .update({
      status: status === "AVAILABLE" ? "COMPLETED" : undefined,
      transcript_sync_attempted_at: new Date().toISOString(),
      transcript_sync_error: errorMessage,
      transcript_sync_status: status,
    })
    .eq("id", meetingId);
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as SyncRequest;
    const batchSize = clampBatchSize(body.batchSize);
    const meetings = await getPendingMeetings(batchSize);

    if (!meetings.length) {
      return json(200, { checked: 0, saved: 0, pending: 0, failed: 0 });
    }

    const accessToken = await getMicrosoftAccessToken();
    let saved = 0;
    let pending = 0;
    let failed = 0;

    for (const meeting of meetings) {
      try {
        const opportunityRegistrationId = await resolveOpportunityRegistrationId(meeting);
        const onlineMeetingId = await resolveOnlineMeetingId(meeting, accessToken);
        const transcripts = await listTranscripts(onlineMeetingId, accessToken);

        if (!transcripts.length) {
          pending += 1;
          await markMeeting(meeting.id, "PENDING", "No Teams transcript is available yet.");
          continue;
        }

        for (const transcript of transcripts) {
          const contentUrl =
            transcript.transcriptContentUrl ??
            `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(microsoftOrganizerEmail)}/onlineMeetings/${encodeURIComponent(onlineMeetingId)}/transcripts/${encodeURIComponent(transcript.id ?? "")}/content`;
          const transcriptText = await graphGetText(contentUrl, accessToken);
          const created = await saveTranscript({
            meeting,
            opportunityRegistrationId,
            onlineMeetingId,
            transcript,
            transcriptText,
          });

          if (created) {
            saved += 1;
          }
        }

        await markMeeting(meeting.id, "AVAILABLE", null);
      } catch (error) {
        failed += 1;
        await markMeeting(meeting.id, "FAILED", error instanceof Error ? error.message : "Transcript sync failed.");
      }
    }

    return json(200, {
      checked: meetings.length,
      saved,
      pending,
      failed,
    });
  } catch (error) {
    return json(400, {
      error: error instanceof Error ? error.message : "Unable to sync Teams transcripts.",
    });
  }
});
