import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, MessageSquare, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { openConversationDock } from "@/lib/conversationDock";
import { isConversationUnreadForUser, latestConversationMessageAt } from "@/lib/conversationUnread";
import { formatDateTimeForTimeZone } from "@/lib/timezone";
import {
  listConversationThreads,
  markConversationThreadRead,
  type ConversationThreadRecord,
} from "@/lib/portalApi";

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

export default function ClientLiveConversations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const timeZone = useUserTimeZone();
  const conversationsQuery = useQuery({
    queryKey: ["conversation-threads"],
    queryFn: listConversationThreads,
    enabled: Boolean(user?.id),
  });

  const conversations = useMemo(() => conversationsQuery.data ?? [], [conversationsQuery.data]);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox"
        description="Follow up on Bum messages, opportunity questions, claim updates, and customer lead conversations from one place."
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
                      {isUnread ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-destructive shadow-[0_0_12px_hsl(var(--destructive))]" aria-hidden="true" />
                      ) : null}
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
              No Inbox messages yet. Bum replies and opportunity conversations will appear here.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
