import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const functionSource = readFileSync("supabase/functions/admin-shared-mailbox/index.ts", "utf8");
const migrationSource = readFileSync("supabase/migrations/20260612143000_add_admin_shared_mailbox_inbox.sql", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const adminInboxSource = readFileSync("src/pages/admin/AdminInbox.tsx", "utf8");
const adminLayoutSource = readFileSync("src/layouts/AdminLayout.tsx", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const supabaseConfigSource = readFileSync("supabase/config.toml", "utf8");

describe("admin shared mailbox inbox", () => {
  it("creates an admin-only shared mailbox persistence model", () => {
    expect(migrationSource).toContain("create table if not exists public.admin_shared_mailbox_messages");
    expect(migrationSource).toContain("create table if not exists public.admin_shared_mailbox_send_events");
    expect(migrationSource).toContain("alter table public.admin_shared_mailbox_messages enable row level security");
    expect(migrationSource).toContain("alter table public.admin_shared_mailbox_send_events enable row level security");
    expect(migrationSource).toContain("using (private.is_admin())");
    expect(migrationSource).toContain("admin_shared_mailbox_messages_unique_graph_id");
    expect(migrationSource).toContain("'dmarc', 'legal', 'question', 'complaint', 'privacy', 'abuse', 'support', 'client_criteria', 'uncategorized'");
  });

  it("keeps Microsoft Graph access behind an admin-only Edge Function", () => {
    expect(supabaseConfigSource).toContain("[functions.admin-shared-mailbox]");
    expect(functionSource).toContain("Only admins can use the shared mailbox.");
    expect(functionSource).toContain("getMicrosoftAccessToken");
    expect(functionSource).toContain("https://login.microsoftonline.com");
    expect(functionSource).toContain("https://graph.microsoft.com/v1.0/users/");
    expect(functionSource).toContain("Only the approved shared mailbox can be opened here.");
    expect(functionSource).toContain("resolveAllowedClerkIssuer");
    expect(functionSource).toContain("This Clerk session was issued by an unapproved tenant.");
    expect(functionSource).toContain('"claim_message"');
    expect(functionSource).toContain('"update_category"');
    expect(functionSource).toContain("admin_shared_mailbox_message_claimed");
    expect(functionSource).toContain("Choose a mailbox category before closing an uncategorized message.");
    expect(functionSource).toContain("admin_shared_mailbox_synced");
    expect(functionSource).toContain("admin_shared_mailbox_message_sent");
  });

  it("exposes sync, list, send, reply, and status operations to the admin page", () => {
    expect(portalApiSource).toContain('functions/v1/admin-shared-mailbox');
    expect(portalApiSource).toContain("syncAdminSharedMailbox");
    expect(portalApiSource).toContain("listAdminSharedMailboxMessages");
    expect(portalApiSource).toContain("sendAdminSharedMailboxMessage");
    expect(portalApiSource).toContain("updateAdminSharedMailboxStatus");
    expect(portalApiSource).toContain("updateAdminSharedMailboxCategory");
    expect(portalApiSource).toContain("claimAdminSharedMailboxMessage");
    expect(adminInboxSource).toContain("External mail");
    expect(adminInboxSource).toContain("bums@trustedbums.com");
    expect(adminInboxSource).toContain("Mailbox message claimed");
    expect(adminInboxSource).not.toContain("top: 75");
    expect(adminInboxSource).toContain('sendMutation.mutate("REPLY")');
    expect(adminInboxSource).toContain('sendMutation.mutate("REPLY_ALL")');
    expect(adminInboxSource).toContain('sendMutation.mutate("NEW")');
  });

  it("adds Admin Inbox navigation without removing the existing live conversations route", () => {
    expect(adminLayoutSource).toContain('{ title: "Inbox", url: "/admin/inbox"');
    expect(appSource).toContain('const AdminInbox = lazy(() => import("./pages/admin/AdminInbox"))');
    expect(appSource).toContain('<Route path="inbox" element={<AdminInbox />} />');
    expect(appSource).toContain('<Route path="live-conversations" element={<AdminLiveConversations />} />');
  });
});
