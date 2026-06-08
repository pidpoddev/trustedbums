import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const qaAuthorizationSeed = readFileSync("supabase/qa_authorization_seed.sql", "utf8");

describe("QA authorization fixtures", () => {
  it("uses valid deterministic UUID literals", () => {
    const uuidLikeLiterals = qaAuthorizationSeed.match(/[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/g) ?? [];
    expect(uuidLikeLiterals.length).toBeGreaterThan(20);

    for (const uuid of uuidLikeLiterals) {
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    }
  });

  it("keeps paired company data for allow and deny checks", () => {
    expect(qaAuthorizationSeed).toContain("QA Alpha Client");
    expect(qaAuthorizationSeed).toContain("QA Beta Client");
    expect(qaAuthorizationSeed).toContain("QA Alpha Allowed Opportunity");
    expect(qaAuthorizationSeed).toContain("QA Beta Denied Opportunity");
    expect(qaAuthorizationSeed).toContain("QA Alpha Target Account");
    expect(qaAuthorizationSeed).toContain("QA Beta Target Account");
    expect(qaAuthorizationSeed).toContain("qa_authorization allow customer target");
    expect(qaAuthorizationSeed).toContain("qa_authorization deny customer target for Alpha");
  });

  it("covers every supported QA role with deterministic profile rows", () => {
    for (const profileId of [
      "qa_admin_auth_user",
      "qa_client_alpha_admin",
      "qa_client_alpha_finance",
      "qa_client_alpha_member",
      "qa_client_beta_admin",
      "qa_client_disabled_user",
      "qa_pending_public_email",
      "qa_pending_same_domain",
      "qa_bum_primary_auth_user",
      "qa_bum_secondary_auth_user",
    ]) {
      expect(qaAuthorizationSeed).toContain(profileId);
    }

    expect(qaAuthorizationSeed).toContain("'CLIENT_ADMIN'");
    expect(qaAuthorizationSeed).toContain("'CLIENT_FINANCE'");
    expect(qaAuthorizationSeed).toContain("'CLIENT_MEMBER'");
    expect(qaAuthorizationSeed).toContain("'BUM'");
    expect(qaAuthorizationSeed).toContain("'DISABLED'");
    expect(qaAuthorizationSeed).toContain("'PENDING'");
  });

  it("includes access-review, extension, contact, telemetry, and audit fixtures", () => {
    expect(qaAuthorizationSeed).toContain("'PUBLIC_EMAIL_COMPANY'");
    expect(qaAuthorizationSeed).toContain("'RELATED_DOMAIN'");
    expect(qaAuthorizationSeed).toContain("'SAME_DOMAIN_ACCESS'");
    expect(qaAuthorizationSeed).toContain("approval requires proof category and review note");
    expect(qaAuthorizationSeed).toContain("client admin same-company approval");
    expect(qaAuthorizationSeed).toContain("qa-authz-alpha-opportunity-capture");
    expect(qaAuthorizationSeed).toContain("qa-authz-beta-target-capture");
    expect(qaAuthorizationSeed).toContain("'OPPORTUNITY_CLAIM'");
    expect(qaAuthorizationSeed).toContain("'EXTENSION_CAPTURE'");
    expect(qaAuthorizationSeed).toContain("'TARGET_RESPONSE'");
    expect(qaAuthorizationSeed).toContain("'MANUAL'");
    expect(qaAuthorizationSeed).toContain("qa-authz-admin-performance");
    expect(qaAuthorizationSeed).toContain("qa_authorization_fixture_seeded");
  });

  it("documents both overexposure and over-tightening expectations", () => {
    expect(qaAuthorizationSeed).toContain("allow Alpha opportunity/target/team request");
    expect(qaAuthorizationSeed).toContain("deny Beta opportunity/target");
    expect(qaAuthorizationSeed).toContain("allow finance-safe Alpha surfaces");
    expect(qaAuthorizationSeed).toContain("deny operational/admin-only changes");
    expect(qaAuthorizationSeed).toContain("allow member-visible Alpha surfaces");
    expect(qaAuthorizationSeed).toContain("allow own claims/captures/contacts");
    expect(qaAuthorizationSeed).toContain("deny secondary Bum contacts/captures");
    expect(qaAuthorizationSeed).toContain("deny authenticated portal authority until approved");
  });
});
