import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const clientDashboardSource = readFileSync("src/pages/client/ClientDashboard.tsx", "utf8");
const bumDashboardSource = readFileSync("src/pages/bum/BumDashboard.tsx", "utf8");
const bumOpportunitiesSource = readFileSync("src/pages/bum/BumOpportunities.tsx", "utf8");
const bumLiveConversationsSource = readFileSync("src/pages/bum/BumLiveConversations.tsx", "utf8");
const clientExportsSource = readFileSync("src/pages/client/ClientExports.tsx", "utf8");
const clientOpportunityNewSource = readFileSync("src/pages/client/ClientOpportunityNew.tsx", "utf8");

describe("high-traffic route hydration", () => {
  it("keeps client dashboard on a route-scoped summary payload instead of broad list helpers", () => {
    expect(clientDashboardSource).toContain("getClientDashboardSummary");
    expect(clientDashboardSource).not.toContain("listOpportunityRegistrations");
    expect(clientDashboardSource).not.toContain("listCustomerPaymentReports");
    expect(clientDashboardSource).not.toContain("listClaimInvoices");
    expect(clientDashboardSource).not.toContain("listClientReverseOpportunities");
    expect(clientDashboardSource).not.toContain("listCustomerTargetResponses");
    expect(portalApiSource).toContain("export async function getClientDashboardSummary");
    expect(portalApiSource).toContain('.select("id", { count: "exact", head: true })');
    expect(portalApiSource).toContain(".limit(6)");
    expect(portalApiSource).toContain('.eq("company_id", user.clientId)');
  });

  it("keeps Bum dashboard on count queries instead of list hydration", () => {
    expect(bumDashboardSource).toContain("getBumDashboardSummary");
    expect(bumDashboardSource).not.toContain("useIntroClaims");
    expect(bumDashboardSource).not.toContain("listMarketplaceOpportunities");
    expect(bumDashboardSource).not.toContain("listOwnProspectRecommendations");
    expect(bumDashboardSource).not.toContain("listOwnReverseOpportunities");
    expect(portalApiSource).toContain("export async function getBumDashboardSummary");
  });

  it("bounds marketplace, inbox, export, and client claim reads on first render", () => {
    expect(bumOpportunitiesSource).toContain("BUM_OPPORTUNITIES_INITIAL_LIMIT");
    expect(bumOpportunitiesSource).toContain("listMarketplaceOpportunities({ limit: BUM_OPPORTUNITIES_INITIAL_LIMIT })");
    expect(bumOpportunitiesSource).toContain("listCustomerTargets(null, { limit: BUM_OPPORTUNITIES_INITIAL_LIMIT })");
    expect(bumOpportunitiesSource).toContain("listBumRepresentedContacts(user!.id, { limit: BUM_OPPORTUNITIES_INITIAL_LIMIT })");
    expect(bumOpportunitiesSource).toContain("listOpportunityClaimSummaries({ limit: BUM_OPPORTUNITIES_INITIAL_LIMIT })");
    expect(bumLiveConversationsSource).toContain("listConversationThreads({ limit: BUM_INBOX_THREAD_LIMIT })");
    expect(bumLiveConversationsSource).toContain("listCustomerTargets(null, { limit: BUM_INBOX_TARGET_LIMIT })");
    expect(bumLiveConversationsSource).toContain("listTeamsMeetings({ limit: BUM_INBOX_MEETING_LIMIT })");
    expect(clientExportsSource).toContain("listTeamsMeetings({ clientCompanyId: user?.clientId })");
    expect(clientOpportunityNewSource).toContain("clientCompanyId: user!.clientId ?? undefined");
  });
});
