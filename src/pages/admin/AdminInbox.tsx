import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Mail, MessageSquare, RefreshCw, Reply, ReplyAll, Send, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { openConversationDock } from "@/lib/conversationDock";
import { isConversationUnreadForUser, latestConversationMessageAt } from "@/lib/conversationUnread";
import { formatDateTimeForTimeZone } from "@/lib/timezone";
import {
  getAdminSharedMailboxMessage,
  listAdminSharedMailboxMessages,
  listConversationThreads,
  markConversationThreadRead,
  sendAdminSharedMailboxMessage,
  syncAdminSharedMailbox,
  updateAdminSharedMailboxStatus,
  type AdminSharedMailboxCategory,
  type AdminSharedMailboxMessage,
  type AdminSharedMailboxStatus,
  type ConversationThreadRecord,
} from "@/lib/portalApi";

const categoryOptions: Array<{ value: AdminSharedMailboxCategory | "ALL"; label: string }> = [
  { value: "ALL", label: "All external mail" },
  { value: "support", label: "Support" },
  { value: "question", label: "Questions" },
  { value: "client_criteria", label: "Client criteria" },
  { value: "legal", label: "Legal" },
  { value: "privacy", label: "Privacy" },
  { value: "abuse", label: "Abuse" },
  { value: "complaint", label: "Complaints" },
  { value: "dmarc", label: "DMARC" },
  { value: "uncategorized", label: "Uncategorized" },
];

const statusOptions: Array<{ value: AdminSharedMailboxStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All statuses" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "HANDLED", label: "Handled" },
  { value: "ARCHIVED", label: "Archived" },
];

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

function recipientEmails(value: string) {
  return value.split(/[\n,;]+/).map((item) => item.trim().toLowerCase()).filter(Boolean);
}

function stripHtml(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function messageBody(message: AdminSharedMailboxMessage | null) {
  if (!message?.body_content) return message?.body_preview ?? "";
  return message.body_content_type === "html" ? stripHtml(message.body_content) : message.body_content;
}

function categoryLabel(value: AdminSharedMailboxCategory) {
  return categoryOptions.find((option) => option.value === value)?.label ?? value.replaceAll("_", " ");
}

function statusVariant(status: AdminSharedMailboxStatus) {
  if (status === "HANDLED") return "success" as const;
  if (status === "IN_PROGRESS") return "warning" as const;
  if (status === "ARCHIVED") return "secondary" as const;
  return "info" as const;
}

export default function AdminInbox() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const timeZone = useUserTimeZone();
  const [showExternalMail, setShowExternalMail] = useState(false);
  const [selectedMailboxMessageId, setSelectedMailboxMessageId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AdminSharedMailboxStatus | "ALL">("OPEN");
  const [categoryFilter, setCategoryFilter] = useState<AdminSharedMailboxCategory | "ALL">("ALL");
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [replyBody, setReplyBody] = useState("");

  const conversationsQuery = useQuery({
    queryKey: ["conversation-threads"],
    queryFn: listConversationThreads,
    enabled: Boolean(user?.id),
  });
  const mailboxQuery = useQuery({
    queryKey: ["admin-shared-mailbox", statusFilter, categoryFilter],
    queryFn: () => listAdminSharedMailboxMessages({ status: statusFilter, category: categoryFilter, top: 75 }),
    enabled: showExternalMail && user?.role === "ADMIN",
  });
  const selectedMessageQuery = useQuery({
    queryKey: ["admin-shared-mailbox-message", selectedMailboxMessageId],
    queryFn: () => getAdminSharedMailboxMessage(selectedMailboxMessageId!),
    enabled: showExternalMail && Boolean(selectedMailboxMessageId),
  });

  const conversations = useMemo(() => conversationsQuery.data ?? [], [conversationsQuery.data]);
  const unreadCount = user ? conversations.filter((thread) => isConversationUnreadForUser(thread, user)).length : 0;
  const mailboxMessages = useMemo(() => mailboxQuery.data ?? [], [mailboxQuery.data]);
  const selectedMailboxMessage = selectedMessageQuery.data ?? mailboxMessages.find((message) => message.id === selectedMailboxMessageId) ?? null;

  useEffect(() => {
    if (!showExternalMail || selectedMailboxMessageId || !mailboxMessages.length) return;
    setSelectedMailboxMessageId(mailboxMessages[0].id);
  }, [mailboxMessages, selectedMailboxMessageId, showExternalMail]);

  useEffect(() => {
    if (!user || conversationsQuery.isLoading || !conversations.length) return;
    const unreadThreads = conversations.filter((thread) => isConversationUnreadForUser(thread, user));
    if (!unreadThreads.length) return;
    void Promise.all(unreadThreads.map((thread) => markConversationThreadRead(user, thread.id)))
      .then(() => queryClient.invalidateQueries({ queryKey: ["conversation-threads"] }))
      .catch(() => {
        // Admin Inbox should remain readable even if read receipts fail.
      });
  }, [conversations, conversationsQuery.isLoading, queryClient, user]);

  const syncMutation = useMutation({
    mutationFn: () => syncAdminSharedMailbox({ top: 75, days: 45 }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-shared-mailbox"] });
      toast({ title: "External mail synced", description: `${result.synced} of ${result.scanned} mailbox messages are available.` });
    },
    onError: (error) => {
      toast({ title: "Unable to sync external mail", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (mode: "NEW" | "REPLY" | "REPLY_ALL") => {
      if (mode === "NEW") {
        return sendAdminSharedMailboxMessage({
          action: "NEW",
          to: recipientEmails(composeTo),
          subject: composeSubject,
          body: composeBody,
        });
      }

      return sendAdminSharedMailboxMessage({
        action: mode,
        messageId: selectedMailboxMessage?.id,
        body: replyBody,
      });
    },
    onSuccess: async (_result, mode) => {
      setReplyBody("");
      if (mode === "NEW") {
        setComposeTo("");
        setComposeSubject("");
        setComposeBody("");
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-shared-mailbox"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-shared-mailbox-message", selectedMailboxMessageId] }),
      ]);
      toast({ title: mode === "NEW" ? "Message sent" : "Reply sent", description: "The shared mailbox was updated for all admins." });
    },
    onError: (error) => {
      toast({ title: "Unable to send mail", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: AdminSharedMailboxStatus) => updateAdminSharedMailboxStatus(selectedMailboxMessage!.id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-shared-mailbox"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-shared-mailbox-message", selectedMailboxMessageId] }),
      ]);
      toast({ title: "Mailbox status updated" });
    },
    onError: (error) => {
      toast({ title: "Unable to update mailbox status", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox"
        description="Handle portal conversations and the shared bums@trustedbums.com mailbox from one admin workspace."
      >
        <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="show-external-mail" className="text-sm">External mail</Label>
          <Switch id="show-external-mail" checked={showExternalMail} onCheckedChange={setShowExternalMail} />
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="font-display flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Portal messages
            </CardTitle>
            {unreadCount > 0 ? <Badge variant="destructive">{unreadCount} unread</Badge> : null}
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {conversationsQuery.error instanceof Error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              Unable to load portal messages: {conversationsQuery.error.message}
            </div>
          ) : null}

          {conversations.slice(0, 8).map((thread) => {
            const latest = latestMessage(thread);
            const isUnread = user ? isConversationUnreadForUser(thread, user) : false;
            return (
              <div key={thread.id} className="rounded-md border p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      {isUnread ? <span className="h-2.5 w-2.5 rounded-full bg-destructive" aria-hidden="true" /> : null}
                      <p className="truncate font-display font-medium">{thread.subject}</p>
                      <StatusBadge label={thread.context_type.replaceAll("_", " ")} variant="info" />
                    </div>
                    <p className="text-sm text-muted-foreground">{threadContext(thread)}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{latest?.body ?? "No messages yet."}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{thread.conversation_participants?.length ?? 0} participants</span>
                      {latest ? <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDateTimeForTimeZone(latest.created_at, timeZone)}</span> : null}
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
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No portal messages yet.
            </div>
          ) : null}
        </CardContent>
      </Card>

      {showExternalMail ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="font-display flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      bums@trustedbums.com
                    </CardTitle>
                    <Button type="button" size="sm" variant="outline" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AdminSharedMailboxStatus | "ALL")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as AdminSharedMailboxCategory | "ALL")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{categoryOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2">
                {mailboxQuery.error instanceof Error ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    Unable to load external mail: {mailboxQuery.error.message}
                  </div>
                ) : null}

                {mailboxMessages.map((message) => (
                  <button
                    key={message.id}
                    type="button"
                    className={`rounded-md border p-3 text-left transition hover:bg-muted/50 ${selectedMailboxMessageId === message.id ? "border-primary bg-primary/5" : "bg-background"}`}
                    onClick={() => setSelectedMailboxMessageId(message.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{message.subject}</p>
                        <p className="truncate text-xs text-muted-foreground">{message.from_name || message.from_email || message.mailbox}</p>
                      </div>
                      <StatusBadge label={message.status.replaceAll("_", " ")} variant={statusVariant(message.status)} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{message.body_preview || "No preview available."}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">{categoryLabel(message.category)}</Badge>
                      <span>{formatDateTimeForTimeZone(message.received_at ?? message.sent_at ?? message.created_at, timeZone)}</span>
                    </div>
                  </button>
                ))}

                {!mailboxQuery.isLoading && !mailboxQuery.error && !mailboxMessages.length ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No external mail matches this view. Sync the mailbox or adjust the filters.
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  New external message
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="compose-to">To</Label>
                  <Input id="compose-to" value={composeTo} onChange={(event) => setComposeTo(event.target.value)} placeholder="recipient@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compose-subject">Subject</Label>
                  <Input id="compose-subject" value={composeSubject} onChange={(event) => setComposeSubject(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compose-body">Message</Label>
                  <Textarea id="compose-body" value={composeBody} onChange={(event) => setComposeBody(event.target.value)} rows={6} />
                </div>
                <Button type="button" onClick={() => sendMutation.mutate("NEW")} disabled={sendMutation.isPending}>
                  <Send className="mr-2 h-4 w-4" />
                  Send from bums@trustedbums.com
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle className="font-display">{selectedMailboxMessage?.subject ?? "External mail"}</CardTitle>
                  {selectedMailboxMessage ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      From {selectedMailboxMessage.from_name || selectedMailboxMessage.from_email || selectedMailboxMessage.mailbox}
                    </p>
                  ) : null}
                </div>
                {selectedMailboxMessage ? (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => statusMutation.mutate("IN_PROGRESS")} disabled={statusMutation.isPending || selectedMailboxMessage.status === "IN_PROGRESS"}>
                      In progress
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => statusMutation.mutate("HANDLED")} disabled={statusMutation.isPending || selectedMailboxMessage.status === "HANDLED"}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Handled
                    </Button>
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              {selectedMessageQuery.error instanceof Error ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  Unable to open message: {selectedMessageQuery.error.message}
                </div>
              ) : null}

              {selectedMailboxMessage ? (
                <>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <StatusBadge label={selectedMailboxMessage.status.replaceAll("_", " ")} variant={statusVariant(selectedMailboxMessage.status)} />
                    <Badge variant="secondary">{categoryLabel(selectedMailboxMessage.category)}</Badge>
                    {selectedMailboxMessage.has_attachments ? <Badge variant="outline">Has attachments</Badge> : null}
                    <span className="text-muted-foreground">{formatDateTimeForTimeZone(selectedMailboxMessage.received_at ?? selectedMailboxMessage.sent_at ?? selectedMailboxMessage.created_at, timeZone)}</span>
                  </div>

                  <div className="max-h-[460px] overflow-auto rounded-md border bg-muted/20 p-4 text-sm leading-6 whitespace-pre-wrap">
                    {messageBody(selectedMailboxMessage) || "No message body synced."}
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="reply-body">Reply</Label>
                    <Textarea id="reply-body" value={replyBody} onChange={(event) => setReplyBody(event.target.value)} rows={7} placeholder="Write a shared mailbox reply..." />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" onClick={() => sendMutation.mutate("REPLY")} disabled={sendMutation.isPending}>
                        <Reply className="mr-2 h-4 w-4" />
                        Reply
                      </Button>
                      <Button type="button" variant="outline" onClick={() => sendMutation.mutate("REPLY_ALL")} disabled={sendMutation.isPending}>
                        <ReplyAll className="mr-2 h-4 w-4" />
                        Reply all
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Select an external mailbox message to read or reply.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
