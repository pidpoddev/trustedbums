import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Minus, Plus, Send, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CONVERSATION_DOCK_OPEN_EVENT } from "@/lib/conversationDock";
import {
  addConversationParticipantByEmail,
  listConversationThreads,
  sendConversationMessage,
  type ConversationThreadRecord,
} from "@/lib/portalApi";
import { cn } from "@/lib/utils";

const CONVERSATION_QUERY_KEY = ["conversation-threads"];

function participantName(thread: ConversationThreadRecord, userId: string) {
  const participant = thread.conversation_participants?.find((item) => item.user_id === userId);
  return participant?.profiles?.full_name ?? participant?.profiles?.email ?? "User";
}

function latestMessage(thread: ConversationThreadRecord) {
  return thread.conversation_messages?.[thread.conversation_messages.length - 1] ?? null;
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

function participantList(thread: ConversationThreadRecord) {
  return (thread.conversation_participants ?? [])
    .map((participant) => participant.profiles?.full_name ?? participant.profiles?.email ?? "User")
    .join(", ");
}

export function ConversationDock() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const canPollThreads = isOpen && !draft.trim() && !participantEmail.trim();

  const threadsQuery = useQuery({
    queryKey: CONVERSATION_QUERY_KEY,
    queryFn: listConversationThreads,
    enabled: Boolean(user?.id),
    refetchInterval: canPollThreads ? 30000 : false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const threads = useMemo(() => threadsQuery.data ?? [], [threadsQuery.data]);
  const selectedThread = threads.find((thread) => thread.id === selectedId) ?? threads[0] ?? null;

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ conversationId?: string }>).detail;
      setIsOpen(true);
      setIsMinimized(false);
      if (detail?.conversationId) {
        setSelectedId(detail.conversationId);
      }
      void queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEY });
    };

    window.addEventListener(CONVERSATION_DOCK_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CONVERSATION_DOCK_OPEN_EVENT, handleOpen);
  }, [queryClient]);

  useEffect(() => {
    if (!selectedId && threads[0]) {
      setSelectedId(threads[0].id);
    }
  }, [selectedId, threads]);

  useEffect(() => {
    if (selectedId && !threads.some((thread) => thread.id === selectedId)) {
      setSelectedId(threads[0]?.id ?? null);
    }
  }, [selectedId, threads]);

  const sendMutation = useMutation({
    mutationFn: () => sendConversationMessage(user!, selectedThread!.id, draft),
    onSuccess: async (thread) => {
      setDraft("");
      setSelectedId(thread.id);
      await queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEY });
    },
    onError: (error) => {
      toast({
        title: "Unable to send message",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: () => addConversationParticipantByEmail(user!, selectedThread!.id, participantEmail),
    onSuccess: async (thread) => {
      setParticipantEmail("");
      setIsAddingParticipant(false);
      setSelectedId(thread.id);
      await queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEY });
      toast({ title: "Participant added", description: "They can now see this conversation." });
    },
    onError: (error) => {
      toast({
        title: "Unable to add participant",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleChatButtonClick = () => {
    if (isOpen) {
      setIsMinimized((current) => !current);
      return;
    }

    setIsOpen(true);
    setIsMinimized(false);
    void queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEY });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-3 right-3 z-40 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-3 sm:bottom-4 sm:right-4 sm:max-w-[calc(100vw-2rem)]">
      {isOpen ? (
        <div
          className={cn(
            "w-[min(96vw,860px)] overflow-hidden rounded-lg border bg-background shadow-2xl",
            isMinimized ? "h-auto" : "h-[min(88vh,780px)] min-h-[560px]",
          )}
        >
          <div className="flex items-center justify-between border-b bg-card px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Conversations</p>
              <p className="truncate text-xs text-muted-foreground">
                {selectedThread ? threadContext(selectedThread) : threadsQuery.isLoading ? "Loading conversations" : "No active conversations"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button type="button" size="icon" variant="ghost" onClick={() => setIsMinimized((current) => !current)}>
                <Minus className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized ? (
            <div className="grid h-[calc(100%-57px)] grid-rows-[210px_minmax(0,1fr)] md:grid-cols-[270px_minmax(0,1fr)] md:grid-rows-1">
              <aside className="flex min-h-0 flex-col border-b bg-muted/20 md:border-b-0 md:border-r">
                <div className="flex h-12 items-center justify-between border-b px-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Active</p>
                    <p className="text-[11px] text-muted-foreground">{threads.length} conversation{threads.length === 1 ? "" : "s"}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{threads.length}</Badge>
                </div>
                <ScrollArea className="min-h-0 flex-1">
                  <div className="space-y-1 p-2">
                    {threads.map((thread) => {
                      const latest = latestMessage(thread);
                      return (
                        <button
                          key={thread.id}
                          type="button"
                          className={cn(
                            "block w-full rounded-md border border-transparent px-3 py-2 text-left text-sm hover:border-border hover:bg-background",
                            selectedThread?.id === thread.id && "border-border bg-background shadow-sm",
                          )}
                          onClick={() => setSelectedId(thread.id)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-medium">{thread.subject}</span>
                            <Badge variant="secondary" className="shrink-0 text-[10px]">
                              {thread.conversation_participants?.length ?? 0}
                            </Badge>
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{threadContext(thread)}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/85">{latest?.body ?? "No messages yet."}</p>
                        </button>
                      );
                    })}
                    {!threads.length ? (
                      <div className="p-4 text-sm text-muted-foreground">
                        {threadsQuery.isLoading ? "Loading conversations..." : "No conversations yet."}
                      </div>
                    ) : null}
                  </div>
                </ScrollArea>
              </aside>

              <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
                <div className="border-b px-4 py-3">
                  {selectedThread ? (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{selectedThread.subject}</p>
                          <p className="truncate text-xs text-muted-foreground">{threadContext(selectedThread)}</p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 shrink-0"
                          onClick={() => setIsAddingParticipant((current) => !current)}
                          aria-label="Add participant"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{participantList(selectedThread)}</span>
                      </div>
                      {isAddingParticipant ? (
                        <div className="flex gap-2">
                          <Input
                            value={participantEmail}
                            onChange={(event) => setParticipantEmail(event.target.value)}
                            placeholder="Email address"
                            className="h-9"
                          />
                          <Button
                            type="button"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            disabled={!participantEmail.trim() || addParticipantMutation.isPending}
                            onClick={() => addParticipantMutation.mutate()}
                            aria-label="Add participant to chat"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold">No conversation selected</p>
                      <p className="text-xs text-muted-foreground">Choose an active conversation from the list.</p>
                    </div>
                  )}
                </div>

                <ScrollArea className="min-h-0 bg-background">
                  <div className="space-y-3 p-4">
                    {selectedThread?.conversation_messages?.map((message) => {
                      const mine = message.sender_user_id === user.id;
                      return (
                        <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                          <div className={cn("max-w-[78%] rounded-lg px-3 py-2 text-sm", mine ? "bg-primary text-primary-foreground" : "bg-muted")}>
                            <p className="mb-1 text-[11px] opacity-75">{mine ? "You" : participantName(selectedThread, message.sender_user_id)}</p>
                            <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
                          </div>
                        </div>
                      );
                    })}
                    {selectedThread && !selectedThread.conversation_messages?.length ? (
                      <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">No messages yet.</p>
                    ) : null}
                  </div>
                </ScrollArea>

                {selectedThread ? (
                  <div className="border-t bg-card/50 p-3">
                    <div className="grid gap-2">
                      <Textarea
                        rows={3}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Write a message..."
                        className="min-h-[88px] resize-none bg-background"
                        onKeyDown={(event) => {
                          if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && draft.trim()) {
                            sendMutation.mutate();
                          }
                        }}
                      />
                      <div className="flex justify-end">
                        <Button type="button" disabled={!draft.trim() || sendMutation.isPending} onClick={() => sendMutation.mutate()}>
                          <Send className="mr-2 h-4 w-4" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>
            </div>
          ) : null}
        </div>
      ) : null}

      <Button type="button" className="h-11 rounded-full px-3 shadow-lg sm:h-10 sm:px-4" onClick={handleChatButtonClick}>
        <MessageSquare className="h-4 w-4 sm:mr-2" />
        <span className="sr-only sm:not-sr-only sm:inline">
          Chat{threads.length ? ` (${threads.length})` : ""}
        </span>
      </Button>
    </div>
  );
}
