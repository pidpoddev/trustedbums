import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const clientOpportunitySource = readFileSync("src/pages/client/ClientOpportunityNew.tsx", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const migrationSource = readFileSync(
  "supabase/migrations/20260611162000_allow_client_delete_unclaimed_opportunities.sql",
  "utf8",
);

describe("client opportunity deletion", () => {
  it("allows deleting unclaimed opportunities from the Client pipeline", () => {
    expect(clientOpportunitySource).toContain("deleteOwnOpportunityRegistration");
    expect(clientOpportunitySource).toContain("deleteOpportunityMutation");
    expect(clientOpportunitySource).toContain("Delete");
    expect(portalApiSource).toContain("export async function deleteOwnOpportunityRegistration");
    expect(portalApiSource).toContain(".from(\"opportunity_registrations\")");
    expect(portalApiSource).toContain(".delete()");
  });

  it("blocks deletes once any claim exists", () => {
    expect(clientOpportunitySource).toContain("Cannot be deleted because Claim exists.");
    expect(clientOpportunitySource).toContain("disabled={hasClaim || deleteOpportunityMutation.isPending}");
    expect(portalApiSource).toContain("Cannot delete this opportunity because a claim exists.");
    expect(portalApiSource).toContain(".from(\"opportunity_claims\")");
    expect(migrationSource).toContain("grant delete on public.opportunity_registrations");
    expect(migrationSource).toContain("for delete");
    expect(migrationSource).toContain("not exists");
    expect(migrationSource).toContain("from public.opportunity_claims claim");
  });
});
