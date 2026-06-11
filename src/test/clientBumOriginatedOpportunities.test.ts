import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync("src/App.tsx", "utf8");
const clientLayoutSource = readFileSync("src/layouts/ClientLayout.tsx", "utf8");
const clientOpportunitiesSource = readFileSync("src/pages/client/ClientOpportunityNew.tsx", "utf8");
const portalSearchSource = readFileSync("src/components/PortalGlobalSearch.tsx", "utf8");

describe("client Bum-Originated opportunities", () => {
  it("keeps Bum-originated demand inside Client Opportunities", () => {
    expect(clientOpportunitiesSource).toContain('value="bum-originated"');
    expect(clientOpportunitiesSource).toContain("Bum-Originated");
    expect(clientOpportunitiesSource).toContain("Opportunity filter");
    expect(clientOpportunitiesSource).not.toContain("@/components/ui/tabs");
    expect(clientOpportunitiesSource).not.toContain("<Tabs");
    expect(clientOpportunitiesSource).toContain("listClientReverseOpportunities");
    expect(clientOpportunitiesSource).toContain('opportunityOriginLabel("BUM_ORIGINATED")');
  });

  it("removes the separate Client Customer Leads destination", () => {
    expect(appSource).toContain('<Navigate to="/client/opportunities?tab=bum-originated" replace />');
    expect(appSource).not.toContain("ClientRequests");
    expect(clientLayoutSource).not.toContain("/client/requests");
    expect(clientLayoutSource).not.toContain("Customer Leads");
    expect(portalSearchSource).not.toContain("page:client-requests");
  });
});
