import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PaginationControls } from "@/components/PaginationControls";
import { ScheduleTeamsMeetingDialog } from "@/components/ScheduleTeamsMeetingDialog";
import { TeamsMeetingsPanel } from "@/components/TeamsMeetingsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { getPageItems } from "@/lib/pagination";
import { listCustomerTargets, listTeamsMeetings, syncTeamsMeetingAttendance, type CustomerTargetStatus } from "@/lib/portalApi";

const TARGETS_PAGE_SIZE = 8;

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
  const { toast } = useToast();
  const timeZone = useUserTimeZone();
  const [targetsPage, setTargetsPage] = useState(1);
  const targetsQuery = useQuery({
    queryKey: ["admin-customer-targets-for-live-conversations"],
    queryFn: () => listCustomerTargets(null),
  });
  const meetingsQuery = useQuery({
    queryKey: ["admin-teams-meetings"],
    queryFn: listTeamsMeetings,
  });

  const targets = targetsQuery.data ?? [];
  const visibleTargets = getPageItems(targets, targetsPage, TARGETS_PAGE_SIZE);
  const meetings = meetingsQuery.data ?? [];
  const syncAttendanceMutation = useMutation({
    mutationFn: () => syncTeamsMeetingAttendance(meetings.map((meeting) => meeting.id)),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-teams-meetings"] });
      if (result.failed.length) {
        toast({
          title: "Some attendee statuses could not be refreshed",
          description: result.failed[0]?.error ?? "Microsoft Graph did not return every meeting response.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Attendance refreshed", description: "Invite responses were updated from Microsoft Graph." });
    },
    onError: (error) => {
      toast({
        title: "Unable to refresh attendance",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });
  const targetsError = targetsQuery.error instanceof Error ? targetsQuery.error.message : null;
  const meetingsError = meetingsQuery.error instanceof Error ? meetingsQuery.error.message : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Conversations"
        description="Schedule and monitor Microsoft Teams intros across every client target account."
      />

      <TeamsMeetingsPanel
        meetings={meetings}
        isLoading={meetingsQuery.isLoading}
        error={meetingsError}
        timeZone={timeZone}
        showClient
        upcomingTitle="Scheduled Teams calls"
        emptyUpcomingMessage="No upcoming Teams calls are scheduled. Past meetings are shown separately once calls have ended."
        onRefreshAttendance={() => syncAttendanceMutation.mutate()}
        isRefreshingAttendance={syncAttendanceMutation.isPending}
      />

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

          {visibleTargets.map((targetAccount) => (
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

          <PaginationControls page={targetsPage} pageSize={TARGETS_PAGE_SIZE} totalItems={targets.length} onPageChange={setTargetsPage} />

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
