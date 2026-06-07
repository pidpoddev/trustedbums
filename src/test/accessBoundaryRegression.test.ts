import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const portalContactsSource = readFileSync("supabase/functions/portal-contacts/index.ts", "utf8");
const clientExportsSource = readFileSync("src/pages/client/ClientExports.tsx", "utf8");
const performancePageSource = readFileSync("src/pages/admin/AdminPerformanceMetrics.tsx", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");

describe("access boundary regressions", () => {
  it("limits represented-contact destinations to Bum-owned opportunity and target relationships", () => {
    expect(portalContactsSource).toContain("assertOpportunityEntitlement");
    expect(portalContactsSource).toContain('.from("opportunity_claims")');
    expect(portalContactsSource).toContain('.eq("bum_user_id", userId)');
    expect(portalContactsSource).toContain("assertCustomerTargetEntitlement");
    expect(portalContactsSource).toContain('.from("customer_target_responses")');
    expect(portalContactsSource).toContain('.in("status", ["ACCEPTED", "CONTACTED", "MEETING_SET"])');

    const payloadBuilderBody = portalContactsSource.match(/async function contactPayloadFromPatch[\s\S]*?return payload;\n}/)?.[0] ?? "";
    expect(payloadBuilderBody).toContain("await assertOpportunityEntitlement(userId, opportunityRegistrationId)");
    expect(payloadBuilderBody).toContain("await assertCustomerTargetEntitlement(userId, customerTargetId)");
  });

  it("keeps operational client exports behind client admin role", () => {
    expect(clientExportsSource).toContain('const canExportOperationalData = user?.clientAccessRole === "CLIENT_ADMIN"');
    expect(clientExportsSource).toContain("enabled: Boolean(user && canExportOperationalData)");
    expect(clientExportsSource).toContain("...(canExportOperationalData");
    expect(clientExportsSource).toContain("Customer payments");
  });

  it("uses server-shaped admin performance summaries instead of browser p75 math", () => {
    expect(portalApiSource).toContain("admin_performance_metric_summary");
    expect(performancePageSource).toContain("listPerformanceMetricSummaries");
    expect(performancePageSource).toContain("limit: 100");
    expect(performancePageSource).not.toContain("function percentile");
  });
});
