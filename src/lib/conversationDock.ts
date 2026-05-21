export const CONVERSATION_DOCK_OPEN_EVENT = "trustedbums:open-conversation";

export function openConversationDock(conversationId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(CONVERSATION_DOCK_OPEN_EVENT, { detail: { conversationId } }));
}
