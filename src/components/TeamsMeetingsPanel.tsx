import { useState } from "react";
import { FileText, RefreshCw, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { listMeetingTranscripts, type MeetingTranscriptRecord, type TeamsMeetingAttendee, type TeamsMeetingRecord } from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";

function responseLabel(response?: string | null) {
  const normalized = response?.trim().toLowerCase();

  if (normalized === "accepted") {
    return "Accepted";
  }

  if (normalized === "tentativelyaccepted") {
    return "Tentative";
  }

  if (normalized === "declined") {
    return "Declined";
  }

  if (normalized === "organizer") {
    return "Organizer";
  }

  if (normalized === "notresponded") {
    return "No response";
  }

  return "Invited";
}

function responseVariant(response?: string | null) {
  const normalized = response?.trim().toLowerCase();

  if (normalized === "accepted" || normalized === "organizer") {
    return "success" as const;
  }

  if (normalized === "declined") {
    return "destructive" as const;
  }

  if (normalized === "tentativelyaccepted") {
    return "warning" as const;
  }

  return "info" as const;
}

function normalizeAttendee(attendee: TeamsMeetingAttendee) {
  if (typeof attendee === "string") {
    return {
      email: attendee,
      name: null,
      response: "none",
      responseTime: null,
    };
  }

  return {
    email: attendee.email ?? attendee.address ?? "Unknown attendee",
    name: attendee.name ?? null,
    response: attendee.response ?? attendee.status?.response ?? "none",
    responseTime: attendee.responseTime ?? attendee.status?.time ?? null,
  };
}

function attendeeSummary(attendees: TeamsMeetingAttendee[]) {
  const normalized = attendees.map(normalizeAttendee);
  const accepted = normalized.filter((attendee) => attendee.response?.toLowerCase() === "accepted").length;
  const declined = normalized.filter((attendee) => attendee.response?.toLowerCase() === "declined").length;
  const pending = normalized.length - accepted - declined;

  return { accepted, declined, pending, total: normalized.length };
}

function transcriptPreview(text: string | null) {
  if (!text) {
    return "Transcript content is stored externally.";
  }

  return text.length > 220 ? text.slice(0, 220) + "..." : text;
}

function TranscriptText({ transcript }: { transcript: MeetingTranscriptRecord }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasInlineText = Boolean(transcript.transcript_text);
  const canExpand = (transcript.transcript_text?.length ?? 0) > 220;
  const text = isExpanded ? transcript.transcript_text : transcriptPreview(transcript.transcript_text);

  return (
    <div className="mt-2 min-w-0 max-w-full">
      <p className="max-w-full whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
        {text}
      </p>
      {hasInlineText && canExpand ? (
        <Button type="button" variant="link" size="sm" className="mt-1 h-auto px-0 text-xs" onClick={() => setIsExpanded((current) => !current)}>
          {isExpanded ? "Show less" : "Show more"}
        </Button>
      ) : null}
    </div>
  );
}

function MeetingTranscriptSummary({ meetingId, timeZone }: { meetingId: string; timeZone: string }) {
  const transcriptsQuery = useQuery({
    queryKey: ["meeting-transcripts", "teams-meeting", meetingId],
    queryFn: () => listMeetingTranscripts({ teamsMeetingId: meetingId }),
  });
  const transcripts = transcriptsQuery.data ?? [];

  if (transcriptsQuery.isLoading) {
    return <p className="mt-4 text-xs text-muted-foreground">Loading transcripts...</p>;
  }

  if (!transcripts.length) {
    return <p className="mt-4 text-xs text-muted-foreground">No transcript is available for this meeting yet.</p>;
  }

  return (
    <div className="mt-4 space-y-2 border-t pt-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FileText className="h-4 w-4 text-primary" />
        Meeting transcripts
      </div>
      {transcripts.map((transcript: MeetingTranscriptRecord) => (
        <div key={transcript.id} className="min-w-0 max-w-full overflow-hidden rounded-md border bg-muted/20 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="break-words text-sm font-medium [overflow-wrap:anywhere]">{transcript.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDateTimeForTimeZone(transcript.captured_at ?? transcript.created_at, timeZone)}
              </p>
            </div>
          </div>
          <TranscriptText transcript={transcript} />
        </div>
      ))}
    </div>
  );
}

function MeetingCard({ meeting, showClient, timeZone }: { meeting: TeamsMeetingRecord; showClient?: boolean; timeZone: string }) {
  const attendees = meeting.attendees ?? [];
  const summary = attendeeSummary(attendees);
  const isPastMeeting = new Date(meeting.end_time).getTime() < Date.now();

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="min-w-0 break-words font-medium font-display [overflow-wrap:anywhere]">{meeting.subject}</p>
            <StatusBadge label={meeting.status} variant={meeting.status === "COMPLETED" ? "success" : meeting.status === "CANCELLED" ? "destructive" : "info"} />
          </div>
          <p className="break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
            {formatDateTimeForTimeZone(meeting.start_time, timeZone)} · {meeting.customer_targets?.target_companies?.name ?? meeting.customer_targets?.target_account_name ?? "Target account"}
          </p>
          {showClient ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Client: {meeting.customer_targets?.client_companies?.name ?? "Unknown client"} · Scheduled by {meeting.profiles?.full_name ?? meeting.profiles?.email ?? "Trusted Bums"}
            </p>
          ) : null}
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{summary.accepted} accepted</span>
              <span>{summary.pending} pending</span>
              {summary.declined ? <span>{summary.declined} declined</span> : null}
            </div>
            {attendees.length ? (
              <div className="flex flex-wrap gap-2">
                {attendees.map((attendee, index) => {
                  const normalized = normalizeAttendee(attendee);
                  const label = normalized.name ? normalized.name + " · " + normalized.email : normalized.email;

                  return (
                    <span key={normalized.email + index} className="inline-flex max-w-full items-center gap-2 rounded-md border bg-muted/30 px-2 py-1 text-xs">
                      <span className="truncate">{label}</span>
                      <StatusBadge label={responseLabel(normalized.response)} variant={responseVariant(normalized.response)} />
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No attendees are recorded for this meeting.</p>
            )}
          </div>
          {isPastMeeting ? <MeetingTranscriptSummary meetingId={meeting.id} timeZone={timeZone} /> : null}
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
          {meeting.teams_join_url ? (
            <a href={meeting.teams_join_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
              Join Teams call
            </a>
          ) : null}
          {meeting.microsoft_event_web_link ? (
            <a href={meeting.microsoft_event_web_link} target="_blank" rel="noreferrer" className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline">
              Open calendar event
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface TeamsMeetingsPanelProps {
  meetings: TeamsMeetingRecord[];
  isLoading?: boolean;
  error?: string | null;
  timeZone: string;
  showClient?: boolean;
  upcomingTitle: string;
  emptyUpcomingMessage: string;
  onRefreshAttendance?: () => void;
  isRefreshingAttendance?: boolean;
}

export function TeamsMeetingsPanel({
  meetings,
  isLoading,
  error,
  timeZone,
  showClient,
  upcomingTitle,
  emptyUpcomingMessage,
  onRefreshAttendance,
  isRefreshingAttendance,
}: TeamsMeetingsPanelProps) {
  const now = Date.now();
  const activeMeetings = meetings.filter((meeting) => meeting.status !== "CANCELLED");
  const upcomingMeetings = activeMeetings
    .filter((meeting) => new Date(meeting.end_time).getTime() >= now)
    .sort((left, right) => new Date(left.start_time).getTime() - new Date(right.start_time).getTime());
  const pastMeetings = activeMeetings
    .filter((meeting) => new Date(meeting.end_time).getTime() < now)
    .sort((left, right) => new Date(right.start_time).getTime() - new Date(left.start_time).getTime());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle className="font-display flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            {upcomingTitle}
          </CardTitle>
          {onRefreshAttendance ? (
            <Button type="button" variant="outline" size="sm" onClick={onRefreshAttendance} disabled={isRefreshingAttendance || !meetings.length}>
              <RefreshCw className={isRefreshingAttendance ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
              Refresh attendance
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-3">
          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              Unable to load Teams calls: {error}
            </div>
          ) : null}

          {upcomingMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} showClient={showClient} timeZone={timeZone} />
          ))}

          {!isLoading && !error && !upcomingMeetings.length ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              {emptyUpcomingMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {pastMeetings.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Past Meetings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {pastMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} showClient={showClient} timeZone={timeZone} />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
