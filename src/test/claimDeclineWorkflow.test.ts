import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { claimDeclineReasonLabel, claimDeclineReasons, claimStatusConfig } from "@/lib/claimConfig";
import { opportunityStageLabel, stageFromClaimStatus } from "@/lib/opportunityModel";

const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const clientOpportunitySource = readFileSync("src/pages/client/ClientOpportunityNew.tsx", "utf8");
const bumClaimsSource = readFileSync("src/pages/bum/BumClaims.tsx", "utf8");
const bumOpportunityDetailSource = readFileSync("src/pages/bum/BumOpportunityDetail.tsx", "utf8");
const migrationSource = readFileSync("supabase/migrations/20260609124500_add_claim_decline_reasons_and_email_decisions.sql", "utf8");
const syncFunctionSource = readFileSync("supabase/functions/sync-claim-decision-replies/index.ts", "utf8");
const supabaseConfigSource = readFileSync("supabase/config.toml", "utf8");
const syncSecretRpcMigration = readFileSync(
  "supabase/migrations/20260616113000_add_claim_decision_sync_secret_rpc.sql",
  "utf8",
);

describe("claim decline workflow", () => {
  it("adds declined as a first-class claim status with structured reasons", () => {
    expect(claimStatusConfig.DECLINED.label).toBe("Declined");
    expect(opportunityStageLabel(stageFromClaimStatus("DECLINED"))).toBe("Closed Lost");
    expect(claimDeclineReasons.map((reason) => reason.value)).toEqual([
      "ALREADY_CONNECTED",
      "NO_LONGER_OPPORTUNITY",
      "WRONG_CONTACT_LEVEL",
      "NOT_RELEVANT",
      "DUPLICATE",
      "OTHER",
    ]);
    expect(claimDeclineReasonLabel("WRONG_CONTACT_LEVEL")).toBe("Not the right level of contact");
  });

  it("persists decline reasons and decision email metadata", () => {
    expect(migrationSource).toContain("'DECLINED'");
    expect(migrationSource).toContain("decline_reason_code");
    expect(migrationSource).toContain("client_decision_token");
    expect(migrationSource).toContain("claim_decision_email_events");
    expect(migrationSource).toContain("sync-claim-decision-replies-every-5-minutes");
    expect(portalApiSource).toContain('export type OpportunityClaimStatus = "PROPOSED" | "APPROVED" | "DECLINED"');
    expect(portalApiSource).toContain("decline_reason_code: OpportunityClaimDeclineReason | null");
  });

  it("lets Clients decide pending claims and shows declined reasons to Bums", () => {
    expect(clientOpportunitySource).toContain("Claim decision");
    expect(clientOpportunitySource).toContain("claimDeclineReasons.map");
    expect(clientOpportunitySource).toContain('decision: "DECLINED"');
    expect(clientOpportunitySource).toContain('decision: "APPROVED"');
    expect(bumClaimsSource).toContain("Why this Claim was declined");
    expect(bumOpportunityDetailSource).toContain("Why this Claim was declined");
    expect(bumOpportunityDetailSource).toContain("bumClaimUpdateStatuses");
    expect(bumOpportunityDetailSource).not.toContain('bumClaimUpdateStatuses: ClaimStatus[] = ["APPROVED"');
  });

  it("adds a conservative mailbox sync function for reply-based decisions", () => {
    expect(supabaseConfigSource).toContain("[functions.sync-claim-decision-replies]");
    expect(syncFunctionSource).toContain("extractDecisionToken");
    expect(syncFunctionSource).toContain("extractDecision");
    expect(syncFunctionSource).toContain("reasonFromText");
    expect(syncFunctionSource).toContain("alreadyProcessed");
    expect(syncFunctionSource).toContain("claim_decision_email_events");
    expect(syncFunctionSource).toContain("claim.status !== \"PROPOSED\"");
    expect(syncFunctionSource).toContain("x-sync-secret");
    expect(syncFunctionSource).toContain("CLAIM_DECISION_SYNC_SECRET is not configured.");
    expect(syncFunctionSource).toContain("if (!syncSecret)");
    expect(syncFunctionSource).toContain('supabaseAdmin.rpc("claim_decision_sync_secret")');
    expect(syncSecretRpcMigration).toContain("security definer");
    expect(syncSecretRpcMigration).toContain("trusted_bums_claim_decision_sync_secret");
    expect(syncSecretRpcMigration).toContain("grant execute on function public.claim_decision_sync_secret() to service_role;");
    expect(migrationSource).toContain("Claim decision token: {{claim_decision_token}}");
  });
});
