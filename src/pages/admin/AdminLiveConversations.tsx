import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, Video } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ScheduleTeamsMeetingDialog } from "@/components/ScheduleTeamsMeetingDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { listCustomerTargets, listTeamsMeetings, type CustomerTargetStatus } from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";

function targetVariant(status: CustomerTargetStatus) {
  if (status === "CLOSED_WON") {
    return "success" as const;
  }
  if (status === "CLOSED_LOST") {
    return "destructive" as const;
  }
  if (status === "PROSPECT" || status === "QUALIFYING") {
    return "warning" as const;
  }
  return "info" as const;
}

function targetLabel(status: CustomerTargetStatus) {
  return status.replaceAll("_", " ");
}

export default function AdminLiveConversations() {
  const queryClient = useQueryClient();
  const timeZone = useUserTimeZone();
  const targetsQuery = useQuery({
    queryKey: ["admin-customer-targets-for-live-conversations"],
    queryFn: () => listCustomerTargets(null),
  });
  const meetingsQuery = useQuery({
    queryKey: ["admin-teams-meetings"],
    queryFn: listTeamsMeetings,
  });

  const targets = targetsQuery.data ?? [];
  const meetings = meetingsQuery.data ?? [];
  const targetsError = targetsQuery.error instanceof Error ? targetsQuery.error.message : null;
  const meetingsError = meetingsQuery.error instanceof Error ? meetingsQuery.error.message : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Conversations"
        description="Schedule and monitor Microsoft Teams intros across every client target account."
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Scheduled Teams calls
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {meetingsError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              Unable to load Teams calls: {meetingsError}
            </div>
          ) : null}

          {meetings.map((meeting) => (
            <div key={meeting.id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="font-medium font-display">{meeting.subject}</p>
                    <StatusBadge label={meeting.status} variant={meeting.status === "COMPLETED" ? "success" : "info"} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTimeForTimeZone(meeting.start_time, timeZone)} ·{" "}
                    {meeting.customer_targets?.target_companies?.name ??
                      meeting.customer_targets?.target_account_name ??
                      "Target account"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Client: {meeting.customer_targets?.client_companies?.name ?? "Unknown client"} · Scheduled by{" "}
                    {meeting.profiles?.full_name ?? meeting.profiles?.email ?? "Trusted Bums"}
                  </p>
                </div>
                {meeting.teams_join_url ? (
                  <a
                    href={meeting.teams_join_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Join Teams call
                  </a>
                ) : null}
              </div>
            </div>
          ))}

          {!meetingsQuery.isLoading && !meetingsError && !meetings.length ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No Teams calls have been scheduled yet. Pick a target account below to create the first intro.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Customer targets ready for intros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {targetsError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              Unable to load customer targets: {targetsError}
            </div>
          ) : null}

          {targets.map((targetAccount) => (
            <div key={targetAccount.id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="font-medium font-display">
                      {targetAccount.target_companies?.name ?? targetAccount.target_account_name}
                    </p>
                    <StatusBadge label={targetLabel(targetAccount.status)} variant={targetVariant(targetAccount.status)} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Client: {targetAccount.client_companies?.name ?? "Unknown client"} · Priority: {targetAccount.priority}
                  </p>
                  {targetAccount.key_contact_name || targetAccount.key_contact_email ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Key contact: {targetAccount.key_contact_name ?? "Unnamed contact"}
                      {targetAccount.key_contact_email ? ` · ${targetAccount.key_contact_email}` : ""}
                    </p>
                  ) : null}
                </div>
                <ScheduleTeamsMeetingDialog
                  target={targetAccount}
                  onScheduled={() => {
                    void queryClient.invalidateQueries({ queryKey: ["admin-customer-targets-for-live-conversations"] });
                    void queryClient.invalidateQueries({ queryKey: ["admin-teams-meetings"] });
                  }}
                />
              </div>
            </div>
          ))}

          {!targetsQuery.isLoading && !targetsError && !targets.length ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No customer targets are available yet. Clients need to add target accounts before intros can be scheduled.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
