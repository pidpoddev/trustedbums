import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const portalContactsSource = readFileSync("supabase/functions/portal-contacts/index.ts", "utf8");
const performancePageSource = readFileSync("src/pages/admin/AdminPerformanceMetrics.tsx", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const adminDashboardSummaryMigration = readFileSync(
  "supabase/migrations/20260620152414_restore_admin_dashboard_summary_definer.sql",
  "utf8",
);

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

  it("uses server-shaped admin performance summaries instead of browser p75 math", () => {
    expect(portalApiSource).toContain("admin_performance_metric_summary");
    expect(portalApiSource).toContain("admin_performance_route_summary");
    expect(performancePageSource).toContain("listPerformanceMetricSummaries");
    expect(performancePageSource).toContain("listPerformanceMetricRouteSummaries");
    expect(performancePageSource).not.toContain("listPerformanceMetricEvents");
    expect(performancePageSource).not.toContain("function percentile");
  });

  it("keeps admin dashboard aggregate reads behind a private definer helper", () => {
    expect(adminDashboardSummaryMigration).toContain("create or replace function private.admin_dashboard_summary_data()");
    expect(adminDashboardSummaryMigration).toContain("security definer");
    expect(adminDashboardSummaryMigration).toContain("revoke all on function private.admin_dashboard_summary_data() from public");
    expect(adminDashboardSummaryMigration).toContain("grant execute on function private.admin_dashboard_summary_data() to anon");
    expect(adminDashboardSummaryMigration).toContain("create or replace function public.admin_dashboard_summary()");
    expect(adminDashboardSummaryMigration).toContain("security invoker");
    expect(adminDashboardSummaryMigration).toContain("if not private.is_admin()");
    expect(adminDashboardSummaryMigration).toContain("from private.admin_dashboard_summary_data()");
    expect(adminDashboardSummaryMigration).toContain("grant execute on function public.admin_dashboard_summary() to anon");
    expect(adminDashboardSummaryMigration).toContain("grant execute on function public.admin_dashboard_summary() to authenticated");
  });
});
