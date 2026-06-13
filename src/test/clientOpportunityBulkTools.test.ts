import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const opportunityImportSource = readFileSync("src/lib/opportunityImport.ts", "utf8");
const clientOpportunitySource = readFileSync("src/pages/client/ClientOpportunityNew.tsx", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");

describe("client opportunity bulk tools", () => {
  it("uses a single Customer column and supports Draft vs Published rows", () => {
    expect(opportunityImportSource).toContain('"customer_name"');
    expect(opportunityImportSource).toContain('"status"');
    expect(opportunityImportSource).toContain('"Published"');
    expect(opportunityImportSource).toContain('"Use Draft instead of Published');
    expect(opportunityImportSource).toContain('return "Accepted"');
    expect(opportunityImportSource).toContain('return "Draft"');
    expect(clientOpportunitySource).toContain("Use one Customer column");
    expect(clientOpportunitySource).toContain("Download Template");
  });

  it("exports current opportunities for bulk update and locks claimed fields", () => {
    expect(clientOpportunitySource).toContain("Export for Bulk Update");
    expect(clientOpportunitySource).toContain('"opportunity_id"');
    expect(clientOpportunitySource).toContain('"claimed"');
    expect(clientOpportunitySource).toContain("Bulk update rows must include opportunity_id");
    expect(clientOpportunitySource).toContain("Claim exists. Locked fields cannot change");
    expect(portalApiSource).toContain("Claimed opportunities cannot change Customer, scope, publish status, or commission plan fields.");
    expect(portalApiSource).toContain('"pay_program_id"');
    expect(portalApiSource).toContain('"status"');
  });

  it("keeps claimed opportunity quick edits from resending an unchanged commission plan", () => {
    expect(clientOpportunitySource).toContain('editPayProgramId !== (editingOpportunity.pay_program_id ?? "")');
    expect(clientOpportunitySource).toContain("updates.pay_program_id = editPayProgramId || null");
    expect(clientOpportunitySource).toContain("disabled={editingOpportunityHasClaim}");
    expect(clientOpportunitySource).toContain("Commission plan is locked because this opportunity already has a claim.");
  });
});
