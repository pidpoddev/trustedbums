import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexSource = readFileSync("src/pages/Index.tsx", "utf8");
const contactApiSource = readFileSync("src/lib/contactApi.ts", "utf8");
const adminPanelSource = readFileSync("src/components/admin/ContactSubmissionsPanel.tsx", "utf8");
const submitContactSource = readFileSync("supabase/functions/submit-contact/index.ts", "utf8");
const migrationSource = readFileSync("supabase/migrations/20260609154000_add_client_intake_qualification_fields.sql", "utf8");

describe("Client intake qualification workflow", () => {
  it("adds durable qualification and strategy-request fields to contact submissions", () => {
    [
      "buyer_role",
      "target_account_count",
      "current_blocker",
      "urgency",
      "referral_source",
      "qualification_status",
      "follow_up_deadline",
      "disqualification_reason",
    ].forEach((field) => expect(migrationSource).toContain(field));

    expect(migrationSource).toContain("QUALIFIED");
    expect(migrationSource).toContain("NEEDS_REVIEW");
    expect(migrationSource).toContain("LOW_FIT");
    expect(migrationSource).toContain("WRONG_PATH");
  });

  it("requires structured Client qualification fields before public submission", () => {
    [
      "buyerRole",
      "targetAccountCount",
      "targetAccounts",
      "currentBlocker",
      "urgency",
      "referralSource",
    ].forEach((field) => expect(indexSource).toContain(field));

    expect(indexSource).toContain("Request intro strategy");
    expect(indexSource).toContain("Request strategy review");
    expect(indexSource).toContain("Names are optional. Redacted accounts or buyer categories are fine.");
    expect(indexSource).toContain("nextErrors.targetAccountCount");
    expect(indexSource).toContain("nextErrors.currentBlocker");
    expect(indexSource).toContain("nextErrors.urgency");
  });

  it("stores and validates Client qualification fields in the public edge function", () => {
    [
      "buyer_role: buyerRole",
      "target_account_count: targetAccountCount",
      "current_blocker: currentBlocker",
      "urgency",
      "referral_source: referralSource",
      "qualification_status",
      "admin_next_action",
      "admin_priority",
    ].forEach((snippet) => expect(submitContactSource).toContain(snippet));

    expect(submitContactSource).toContain('interest === "CLIENT"');
    expect(submitContactSource).toContain("The Client strategy request is missing qualification fields.");
    expect(submitContactSource).toContain('return "Founder review"');
  });

  it("requires admin qualification before a Client request can become a target", () => {
    expect(contactApiSource).toContain('submission.qualification_status !== "QUALIFIED"');
    expect(contactApiSource).toContain("Mark this Client request qualified before creating a target.");
    expect(adminPanelSource).toContain("Save Qualification");
    expect(adminPanelSource).toContain("Mark this strategy request qualified before creating a Client Target.");
    expect(adminPanelSource).toContain('submission.qualification_status !== "QUALIFIED"');
    expect(adminPanelSource).toContain("claimContactSubmission");
    expect(adminPanelSource).toContain("followUpDeadline");
  });
});
