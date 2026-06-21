import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationSource = readFileSync("supabase/migrations/20260621211500_add_legal_agreement_queue.sql", "utf8");
const reminderFunctionSource = readFileSync("supabase/functions/legal-agreement-reminders/index.ts", "utf8");
const supabaseConfigSource = readFileSync("supabase/config.toml", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const scrumPageSource = readFileSync("src/pages/admin/AdminScrumTracker.tsx", "utf8");
const sharedMailboxOpsSource = readFileSync("docs/shared-mailbox-operations.md", "utf8");
const legalReviewerPromptSource = readFileSync("docs/agents/automation-prompts/trusted-bums-on-demand-legal-compliance-reviewer.toml", "utf8");

describe("legal agreement queue", () => {
  it("adds legal agreement reviews as an admin-only queue attached to scrum items", () => {
    expect(migrationSource).toContain("create table if not exists public.legal_agreement_reviews");
    expect(migrationSource).toContain("scrum_item_id uuid not null references public.admin_scrum_items");
    expect(migrationSource).toContain("mailbox_message_id uuid references public.admin_shared_mailbox_messages");
    expect(migrationSource).toContain("alter table public.legal_agreement_reviews enable row level security");
    expect(migrationSource).toContain('create policy "Admins can manage legal agreement reviews"');
    expect(migrationSource).toContain("using (private.is_admin())");
    expect(migrationSource).toContain("legal_agreement_reviews_status_next_prompt_idx");
    expect(migrationSource).toContain("legal_agreement_reviews_created_by_idx");
    expect(migrationSource).toContain("legal_agreement_review_events_created_by_idx");
  });

  it("keeps the legal bot commercially practical with must-haves and acceptable tradeoffs", () => {
    expect(migrationSource).toContain("risk_posture text not null default 'SPEED_TO_MARKET'");
    expect(migrationSource).toContain("must_have_terms text[] not null default array");
    expect(migrationSource).toContain("acceptable_tradeoffs text[] not null default array");
    expect(migrationSource).toContain("Vendor template formatting, notice mechanics, governing-law preference, and minor boilerplate should not block signature by themselves.");
    expect(migrationSource).toContain("Use a short side letter, addendum, email confirmation, or opportunity-specific rider");
    expect(legalReviewerPromptSource).toContain("Speed-to-market posture");
    expect(legalReviewerPromptSource).toContain("Must-haves");
    expect(legalReviewerPromptSource).toContain("Acceptable tradeoffs");
  });

  it("seeds the K2View agreement into the legal queue without treating it as closed", () => {
    expect(migrationSource).toContain("K2View / Concentrix");
    expect(migrationSource).toContain("Concentrix Agreement & Referral Agreement");
    expect(migrationSource).toContain("shared-mailbox:k2view-concentrix-agreement-2026-06-17");
    expect(migrationSource).toContain("1bf7bc39-f349-4a23-a7c9-d095ff79095a");
    expect(migrationSource).toContain("'NEEDS_REVIEW'");
    expect(migrationSource).toContain("Confirm the Concentrix-specific agreement controls over any broader K2View partner template");
  });

  it("adds a daily Microsoft-backed owner reminder function with internal caller proof", () => {
    expect(supabaseConfigSource).toContain("[functions.legal-agreement-reminders]");
    expect(reminderFunctionSource).toContain("LEGAL_QUEUE_REMINDER_SECRET");
    expect(reminderFunctionSource).toContain("Legal queue reminders require a trusted internal caller.");
    expect(reminderFunctionSource).toContain("getMicrosoftAccessToken");
    expect(reminderFunctionSource).toContain("https://graph.microsoft.com/v1.0/users/");
    expect(reminderFunctionSource).toContain("Daily reminders continue until the review is signed, declined, superseded, or the scrum item is closed.");
    expect(migrationSource).toContain("legal-agreement-owner-reminders-daily");
    expect(migrationSource).toContain("'0 13 * * *'");
    expect(migrationSource).toContain("trusted_bums_legal_queue_reminder_secret");
  });

  it("shows legal agreement reviews inside the admin scrum task system", () => {
    expect(portalApiSource).toContain("export interface LegalAgreementReviewRecord");
    expect(portalApiSource).toContain(".select(\"*, legal_agreement_reviews(*)\")");
    expect(scrumPageSource).toContain("Legal queue");
    expect(scrumPageSource).toContain("legalQueueOnly");
    expect(scrumPageSource).toContain("Must-haves:");
    expect(scrumPageSource).toContain("Recommended changes:");
    expect(scrumPageSource).toContain("riskPostureLabel");
  });

  it("documents mailbox-to-legal-queue handling", () => {
    expect(sharedMailboxOpsSource).toContain("Legal Queue");
    expect(sharedMailboxOpsSource).toContain("legal agreement review");
    expect(sharedMailboxOpsSource).toContain("daily owner reminders");
    expect(sharedMailboxOpsSource).toContain("must-have terms");
  });
});
