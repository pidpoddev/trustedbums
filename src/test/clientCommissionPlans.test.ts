import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync("src/App.tsx", "utf8");
const clientLayoutSource = readFileSync("src/layouts/ClientLayout.tsx", "utf8");
const clientOpportunitiesSource = readFileSync("src/pages/client/ClientOpportunityNew.tsx", "utf8");
const clientCommissionPlansSource = readFileSync("src/pages/client/ClientCommissionPlans.tsx", "utf8");
const portalSearchSource = readFileSync("src/components/PortalGlobalSearch.tsx", "utf8");

describe("client commission plans", () => {
  it("keeps commission plan management under Client Finance", () => {
    expect(appSource).toContain("ClientCommissionPlans");
    expect(appSource).toContain('path="commission-plans" element={<ClientCommissionPlans />}');
    expect(clientLayoutSource).toContain("Commission Plans");
    expect(clientLayoutSource).toContain("/client/commission-plans");
    expect(portalSearchSource).toContain("page:client-commission-plans");
    expect(portalSearchSource).toContain("/client/commission-plans");
    expect(portalSearchSource).toContain('accessRole === "CLIENT_ADMIN" || accessRole === "CLIENT_FINANCE"');
  });

  it("moves commission plan requests out of the opportunity filter", () => {
    expect(clientCommissionPlansSource).toContain("createClientPayProgramRequest");
    expect(clientCommissionPlansSource).toContain("listSelectableClientPayPrograms");
    expect(clientCommissionPlansSource).toContain("Request new plan");
    expect(clientOpportunitiesSource).not.toContain("Request commission plan");
    expect(clientOpportunitiesSource).not.toContain('<SelectItem value="commission-plan">');
    expect(clientOpportunitiesSource).toContain("Finance &gt; Commission Plans");
    expect(clientOpportunitiesSource).toContain("canOpenCommissionPlans");
    expect(clientOpportunitiesSource).toContain("Ask a Client Admin or Client Finance user to request it.");
  });
});
