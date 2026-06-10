import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, MessageSquare, Target, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PaginationControls } from "@/components/PaginationControls";
import { ScheduleTeamsMeetingDialog } from "@/components/ScheduleTeamsMeetingDialog";
import { TeamsMeetingsPanel } from "@/components/TeamsMeetingsPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { openConversationDock } from "@/lib/conversationDock";
import { isConversationUnreadForUser, latestConversationMessageAt } from "@/lib/conversationUnread";
import { getPageItems } from "@/lib/pagination";
import { formatDateTimeForTimeZone } from "@/lib/timezone";
import {
  listConversationThreads,
  listCustomerTargets,
  listTeamsMeetings,
  markConversationThreadRead,
  syncTeamsMeetingAttendance,
  type ConversationThreadRecord,
  type CustomerTargetStatus,
} from "@/lib/portalApi";

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

function latestMessage(thread: ConversationThreadRecord) {
  const latestAt = latestConversationMessageAt(thread);
  return thread.conversation_messages?.find((message) => message.created_at === latestAt) ?? null;
}

function threadContext(thread: ConversationThreadRecord) {
  if (thread.opportunity_registrations?.target_account_name) {
    return thread.opportunity_registrations.target_account_name;
  }

  if (thread.customer_targets?.target_companies?.name || thread.customer_targets?.target_account_name) {
    return thread.customer_targets.target_companies?.name ?? thread.customer_targets.target_account_name;
  }

  return thread.context_type.replaceAll("_", " ").toLowerCase();
}

export default function BumLiveConversations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const timeZone = useUserTimeZone();
  const [targetsPage, setTargetsPage] = useState(1);
  const conversationsQuery = useQuery({
    queryKey: ["conversation-threads"],
    queryFn: listConversationThreads,
    enabled: Boolean(user?.id),
  });
  const targetsQuery = useQuery({
    queryKey: ["bum-customer-targets"],
    queryFn: () => listCustomerTargets(null),
  });
  const meetingsQuery = useQuery({
    queryKey: ["bum-teams-meetings"],
    queryFn: listTeamsMeetings,
  });

  const conversations = useMemo(() => conversationsQuery.data ?? [], [conversationsQuery.data]);
  const targets = targetsQuery.data ?? [];
  const visibleTargets = getPageItems(targets, targetsPage, TARGETS_PAGE_SIZE);
  const meetings = meetingsQuery.data ?? [];
  const unreadCount = user ? conversations.filter((thread) => isConversationUnreadForUser(thread, user)).length : 0;

  useEffect(() => {
    if (!user || conversationsQuery.isLoading || !conversations.length) {
      return;
    }

    const unreadThreads = conversations.filter((thread) => isConversationUnreadForUser(thread, user));
    if (!unreadThreads.length) {
      return;
    }

    void Promise.all(unreadThreads.map((thread) => markConversationThreadRead(user, thread.id)))
      .then(() => queryClient.invalidateQueries({ queryKey: ["conversation-threads"] }))
      .catch(() => {
        // Inbox should remain readable even if a read receipt update fails.
      });
  }, [conversations, conversationsQuery.isLoading, queryClient, user]);

  const syncAttendanceMutation = useMutation({
    mutationFn: () => syncTeamsMeetingAttendance(meetings.map((meeting) => meeting.id)),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["bum-teams-meetings"] });
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
        title="Inbox"
        description="Follow up on client messages, opportunity questions, and scheduled intro work from one place."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="font-display flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Messages
            </CardTitle>
            {unreadCount > 0 ? (
              <Badge variant="destructive" className="w-fit shadow-[0_0_18px_hsl(var(--destructive)/0.45)]">
                {unreadCount} unread
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {conversationsQuery.error instanceof Error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              Unable to load Inbox messages: {conversationsQuery.error.message}
            </div>
          ) : null}

          {conversations.map((thread) => {
            const latest = latestMessage(thread);
            const isUnread = user ? isConversationUnreadForUser(thread, user) : false;
            return (
              <div key={thread.id} className="rounded-xl border p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      {isUnread ? <span className="h-2.5 w-2.5 rounded-full bg-destructive shadow-[0_0_12px_hsl(var(--destructive))]" aria-hidden="true" /> : null}
                      <p className="truncate font-medium font-display">{thread.subject}</p>
                      <StatusBadge label={thread.context_type.replaceAll("_", " ")} variant="info" />
                    </div>
                    <p className="text-sm text-muted-foreground">{threadContext(thread)}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground/90">{latest?.body ?? "No messages yet."}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {thread.conversation_participants?.length ?? 0} participant{(thread.conversation_participants?.length ?? 0) === 1 ? "" : "s"}
                      </span>
                      {latest ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDateTimeForTimeZone(latest.created_at, timeZone)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <Button type="button" variant={isUnread ? "default" : "outline"} onClick={() => openConversationDock(thread.id)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Open
                  </Button>
                </div>
              </div>
            );
          })}

          {!conversationsQuery.isLoading && !conversationsQuery.error && !conversations.length ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No Inbox messages yet. Opportunity questions and client replies will appear here.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <TeamsMeetingsPanel
        meetings={meetings}
        isLoading={meetingsQuery.isLoading}
        error={meetingsError}
        timeZone={timeZone}
        upcomingTitle="Upcoming Teams calls"
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
                    void queryClient.invalidateQueries({ queryKey: ["bum-customer-targets"] });
                    void queryClient.invalidateQueries({ queryKey: ["bum-teams-meetings"] });
                  }}
                />
              </div>
            </div>
          ))}

          <PaginationControls page={targetsPage} pageSize={TARGETS_PAGE_SIZE} totalItems={targets.length} onPageChange={setTargetsPage} />

          {!targetsQuery.isLoading && !targetsError && !targets.length ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No customer targets are available yet. A client must add target accounts before Bums can schedule intros.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
