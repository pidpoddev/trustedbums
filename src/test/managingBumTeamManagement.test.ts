import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync("src/App.tsx", "utf8");
const layoutSource = readFileSync("src/layouts/BumLayout.tsx", "utf8");
const teamPageSource = readFileSync("src/pages/bum/BumTeamManagement.tsx", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const metricsPolicySource = readFileSync(
  "supabase/migrations/20260612173000_allow_managing_bums_team_metrics.sql",
  "utf8",
);

describe("Managing Bum team management", () => {
  it("adds a dedicated Bum portal route for Team Management", () => {
    expect(appSource).toContain("const BumTeamManagement = lazy(() => import(\"./pages/bum/BumTeamManagement\"));");
    expect(appSource).toContain("<Route path=\"team\" element={<BumTeamManagement />} />");
  });

  it("shows the navigation option only for Managing Bums", () => {
    expect(layoutSource).toContain("getOwnBumProfile");
    expect(layoutSource).toContain("profileQuery.data?.is_managing_bum");
    expect(layoutSource).toContain("Team Management");
    expect(layoutSource).toContain("url: \"/bum/team\"");
  });

  it("summarizes team members, claims, earnings, and manager share", () => {
    expect(teamPageSource).toContain("listBumTeamMemberships");
    expect(teamPageSource).toContain("listOpportunityClaims");
    expect(teamPageSource).toContain("listBumPayouts");
    expect(teamPageSource).toContain("listManagingBumCommissionAllocations");
    expect(teamPageSource).toContain("Claims requested");
    expect(teamPageSource).toContain("Team earnings");
    expect(teamPageSource).toContain("Manager share");
  });

  it("keeps team metrics scoped to active team relationships", () => {
    expect(metricsPolicySource).toContain("Managing bums can read team opportunity claims");
    expect(metricsPolicySource).toContain("Managing bums can read team payouts");
    expect(metricsPolicySource).toContain("membership.managing_bum_user_id = public.current_user_id()");
    expect(metricsPolicySource).toContain("membership.status = 'ACTIVE'");
    expect(metricsPolicySource).toContain("manager_profile.is_managing_bum = true");
  });

  it("has a reader for Managing Bum commission allocations", () => {
    expect(portalApiSource).toContain("export async function listManagingBumCommissionAllocations");
    expect(portalApiSource).toContain("Only Admins and the Managing Bum can view this team.");
    expect(portalApiSource).toContain("managing_bum_commission_allocations");
  });
});
