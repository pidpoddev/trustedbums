import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const clientOpportunitySource = readFileSync("src/pages/client/ClientOpportunityNew.tsx", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const migrationSource = readFileSync(
  "supabase/migrations/20260620151519_restore_client_delete_unclaimed_opportunity_policy.sql",
  "utf8",
);

describe("client opportunity deletion", () => {
  it("allows deleting unclaimed opportunities from the Client pipeline", () => {
    expect(clientOpportunitySource).toContain("deleteOwnOpportunityRegistration");
    expect(clientOpportunitySource).toContain("deleteOpportunityMutation");
    expect(clientOpportunitySource).toContain("Delete");
    expect(clientOpportunitySource).toContain("queryClient.setQueryData<OpportunityRegistration[]>");
    expect(clientOpportunitySource).toContain("(item) => item.id !== opportunity.id");
    expect(portalApiSource).toContain("export async function deleteOwnOpportunityRegistration");
    expect(portalApiSource).toContain(".from(\"opportunity_registrations\")");
    expect(portalApiSource).toContain(".delete()");
    expect(portalApiSource).toContain(".select(\"id, target_account_name\")");
    expect(portalApiSource).toContain("Unable to delete this opportunity because no matching row was removed.");
    expect(portalApiSource).toContain("Opportunity was deleted, but the audit event could not be recorded.");
  });

  it("blocks deletes once any claim exists", () => {
    expect(clientOpportunitySource).toContain("Cannot be deleted because Claim exists.");
    expect(clientOpportunitySource).toContain("disabled={hasClaim || deleteOpportunityMutation.isPending}");
    expect(portalApiSource).toContain("Cannot delete this opportunity because a claim exists.");
    expect(portalApiSource).toContain(".from(\"opportunity_claims\")");
    expect(migrationSource).toContain("grant delete on public.opportunity_registrations");
    expect(migrationSource).toContain("private.current_company_id()");
    expect(migrationSource).toContain("for delete");
    expect(migrationSource).toContain("not exists");
    expect(migrationSource).toContain("from public.opportunity_claims claim");
  });
});
