import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { claimStatusConfig } from "@/lib/claimConfig";

const clientClaimsSource = readFileSync("src/pages/client/ClientClaims.tsx", "utf8");
const clientLayoutSource = readFileSync("src/layouts/ClientLayout.tsx", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const migrationSource = readFileSync(
  "supabase/migrations/20260611163500_allow_client_claim_status_updates.sql",
  "utf8",
);

describe("client claims workflow", () => {
  it("adds a Client Claims destination for accepted claims", () => {
    expect(appSource).toContain("ClientClaims");
    expect(appSource).toContain('path="claims" element={<ClientClaims />}');
    expect(clientLayoutSource).toContain('{ title: "Claims", url: "/client/claims"');
    expect(clientClaimsSource).toContain('title="Claims"');
    expect(clientClaimsSource).toContain('currentClaimStatuses: OpportunityClaimStatus[] = ["APPROVED", "SCHEDULED", "MEETING_HELD"]');
  });

  it("lets Client admins and members update accepted claim status", () => {
    expect(clientClaimsSource).toContain('clientEditableClaimStatuses: OpportunityClaimStatus[] = ["APPROVED", "SCHEDULED", "MEETING_HELD"]');
    expect(clientClaimsSource).toContain("Update status");
    expect(portalApiSource).toContain('user.clientAccessRole !== "CLIENT_ADMIN" && user.clientAccessRole !== "CLIENT_MEMBER"');
    expect(migrationSource).toContain("profile.client_access_role in ('CLIENT_ADMIN', 'CLIENT_MEMBER')");
    expect(migrationSource).not.toContain("CLIENT_FINANCE");
  });

  it("locks the claim once the introduction is made and starts the term schedule", () => {
    expect(claimStatusConfig.MEETING_HELD.label).toBe("Introduction made");
    expect(clientClaimsSource).toContain("Locked for term period");
    expect(clientClaimsSource).toContain("Term end:");
    expect(portalApiSource).toContain('existingClaim.status === "MEETING_HELD" && user.role !== "ADMIN"');
    expect(portalApiSource).toContain('status === "MEETING_HELD"');
    expect(portalApiSource).toContain("commission_schedule_start_at");
    expect(migrationSource).toContain("status <> 'MEETING_HELD'");
  });
});
