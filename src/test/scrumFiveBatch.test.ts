import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const e2eSmokeWorkflow = readFileSync(".github/workflows/e2e-smoke.yml", "utf8");
const qaHarnessBacklog = readFileSync("docs/qa-harness-reliability-backlog.md", "utf8");
const consentManager = readFileSync("src/components/ConsentManager.tsx", "utf8");
const adminEmails = readFileSync("src/pages/admin/AdminEmails.tsx", "utf8");
const portalApi = readFileSync("src/lib/portalApi.ts", "utf8");
const sendAdminEmail = readFileSync("supabase/functions/send-admin-email/index.ts", "utf8");

describe("scrum batch implementation guardrails", () => {
  it("runs target preflight inside each deploy-triggered deep QA shard", () => {
    expect(e2eSmokeWorkflow).toContain("QA_TARGET_PREFLIGHT_OUTPUT_DIR: qa-target-preflight-artifacts/${{ matrix.deep_suite }}");
    expect(e2eSmokeWorkflow).toContain("pnpm run qa:target-preflight && pnpm run qa:env && pnpm run qa:deep");
  });

  it("keeps raw shell, sourced env, and hosted workflow evidence separate", () => {
    expect(qaHarnessBacklog).toContain("raw-shell versus sourced `.env.qa` versus hosted env states");
    expect(qaHarnessBacklog).toContain("raw `pnpm run qa:env`");
    expect(qaHarnessBacklog).toContain("Sourced `QA_EXTENSION_API_EXPECTATION=skip");
    expect(qaHarnessBacklog).toContain("hosted workflow results split");
  });

  it("keeps the first consent layer compact on mobile without removing controls", () => {
    expect(consentManager).toContain("max-h-[52vh]");
    expect(consentManager).toContain("max-w-3xl");
    expect(consentManager).toContain("text-xs leading-5");
    expect(consentManager).toContain("Reject all");
    expect(consentManager).toContain("Accept all");
    expect(consentManager).toContain("Customize");
  });

  it("uses aggregate admin email metrics for headline reporting", () => {
    expect(portalApi).toContain("AdminEmailMetricsRecord");
    expect(portalApi).toContain('invokeAdminEmailOperation<AdminEmailMetricsRecord>("get_metrics")');
    expect(sendAdminEmail).toContain("getAdminEmailMetrics");
    expect(adminEmails).toContain("getAdminEmailMetrics");
    expect(adminEmails).toContain("clickEvents");
    expect(adminEmails).toContain("open proxy signals");
    expect(adminEmails).not.toContain("Tracked engagement");
    expect(adminEmails).not.toContain("opens / clicks");
  });
});
