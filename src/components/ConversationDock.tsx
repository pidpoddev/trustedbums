import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Minus, Plus, Send, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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


export function ConversationDock() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");

  const threadsQuery = useQuery({
    queryKey: CONVERSATION_QUERY_KEY,
    queryFn: listConversationThreads,
    enabled: Boolean(user?.id),
    refetchInterval: isOpen ? 10000 : 30000,
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

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3">
      {isOpen ? (
        <div className={cn("w-[min(92vw,420px)] overflow-hidden rounded-lg border bg-background shadow-2xl", isMinimized ? "h-auto" : "h-[min(72vh,620px)]")}>
          <div className="flex items-center justify-between border-b bg-card px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Conversations</p>
              <p className="truncate text-xs text-muted-foreground">
                {selectedThread ? threadContext(selectedThread) : "No active threads"}
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
            <div className="grid h-[calc(100%-49px)] grid-rows-[auto_1fr_auto]">
              <ScrollArea className="max-h-28 border-b">
                <div className="space-y-1 p-2">
                  {threads.map((thread) => {
                    const latest = latestMessage(thread);
                    return (
                      <button
                        key={thread.id}
                        type="button"
                        className={cn(
                          "block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted",
                          selectedThread?.id === thread.id && "bg-muted",
                        )}
                        onClick={() => setSelectedId(thread.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium">{thread.subject}</span>
                          <Badge variant="secondary" className="shrink-0 text-[10px]">{thread.conversation_participants?.length ?? 0}</Badge>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{latest?.body ?? threadContext(thread)}</p>
                      </button>
                    );
                  })}
                  {!threads.length ? <p className="p-3 text-sm text-muted-foreground">No conversations yet.</p> : null}
                </div>
              </ScrollArea>

              <ScrollArea className="min-h-0">
                <div className="space-y-3 p-3">
                  {selectedThread?.conversation_messages?.map((message) => {
                    const mine = message.sender_user_id === user.id;
                    return (
                      <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[82%] rounded-lg px-3 py-2 text-sm", mine ? "bg-primary text-primary-foreground" : "bg-muted")}> 
                          <p className="mb-1 text-[11px] opacity-75">{mine ? "You" : participantName(selectedThread, message.sender_user_id)}</p>
                          <p className="whitespace-pre-wrap">{message.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {selectedThread ? (
                <div className="space-y-2 border-t p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {(selectedThread.conversation_participants ?? [])
                        .map((participant) => participant.profiles?.full_name ?? participant.profiles?.email ?? "User")
                        .join(", ")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={participantEmail}
                      onChange={(event) => setParticipantEmail(event.target.value)}
                      placeholder="Add participant by email"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!participantEmail.trim() || addParticipantMutation.isPending}
                      onClick={() => addParticipantMutation.mutate()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    <Textarea
                      rows={2}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Write a message..."
                      onKeyDown={(event) => {
                        if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && draft.trim()) {
                          sendMutation.mutate();
                        }
                      }}
                    />
                    <Button type="button" disabled={!draft.trim() || sendMutation.isPending} onClick={() => sendMutation.mutate()}>
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <Button type="button" className="rounded-full shadow-lg" onClick={() => { setIsOpen(true); setIsMinimized(false); }}>
        <MessageSquare className="mr-2 h-4 w-4" />
        Chat{threads.length ? ` (${threads.length})` : ""}
      </Button>
    </div>
  );
}
