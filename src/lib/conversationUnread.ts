import type { AuthUser } from "@/data/authData";
import type { ConversationThreadRecord } from "@/lib/portalApi";

export function latestConversationMessageAt(thread: ConversationThreadRecord) {
  return thread.conversation_messages?.reduce<string | null>((latest, message) => {
    if (!latest || new Date(message.created_at).getTime() > new Date(latest).getTime()) {
      return message.created_at;
    }

    return latest;
  }, null) ?? null;
}

export function isConversationUnreadForUser(thread: ConversationThreadRecord, user: Pick<AuthUser, "id">) {
  const latestMessageAt = latestConversationMessageAt(thread);
  if (!latestMessageAt) {
    return false;
  }

  const latestMessage = thread.conversation_messages?.find((message) => message.created_at === latestMessageAt);
  if (latestMessage?.sender_user_id === user.id) {
    return false;
  }

  const participant = thread.conversation_participants?.find((item) => item.user_id === user.id);
  if (!participant?.last_read_at) {
    return true;
  }

  return new Date(latestMessageAt).getTime() > new Date(participant.last_read_at).getTime();
}

export function unreadConversationCount(threads: ConversationThreadRecord[], user: Pick<AuthUser, "id"> | null | undefined) {
  if (!user) {
    return 0;
  }

  return threads.filter((thread) => isConversationUnreadForUser(thread, user)).length;
}
