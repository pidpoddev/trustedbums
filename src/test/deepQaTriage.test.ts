import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const authHelperSource = readFileSync("tests/e2e/helpers/auth.ts", "utf8");
const deepQaSpecSource = readFileSync("tests/e2e/deep-workflow-hotfix-audit.spec.ts", "utf8");
const deepQaHelperSource = readFileSync("tests/e2e/helpers/deepQa.ts", "utf8");
const deepQaWorkflowSource = readFileSync(".github/workflows/deep-qa-hotfix-audit.yml", "utf8");
const e2eSmokeWorkflowSource = readFileSync(".github/workflows/e2e-smoke.yml", "utf8");

describe("deep QA triage coverage", () => {
  it("recognizes the current accepted agreement state during terms navigation", () => {
    expect(authHelperSource).toContain("Current agreement accepted|Current terms accepted");
    expect(authHelperSource).toContain("Terms prompt state");
    expect(authHelperSource).toContain("acceptedStatusVisible");
    expect(authHelperSource).toContain("acceptButtonVisible");
  });

  it("records both passing and failing route completion evidence before the global report finishes", () => {
    expect(deepQaHelperSource).toContain("interface DeepQaRouteResult");
    expect(deepQaHelperSource).toContain("## Route Completion");
    expect(deepQaSpecSource).toContain('status: "passed"');
    expect(deepQaSpecSource).toContain('status: "failed"');
    expect(deepQaSpecSource).toContain("test.setTimeout(activeSuite ? 420_000 : 1_200_000)");
    expect(deepQaSpecSource).toContain("await attachLeadDevHotfixReport(testInfo, runId, issues, [], routeResults);");
    expect(deepQaSpecSource).toContain("await Promise.all([...sessions.values()].map");
  });

  it("bounds live auth bootstrap and prevents browser error pages from becoming product findings", () => {
    expect(authHelperSource).toContain("const appBootstrapTimeoutMs = 15_000");
    expect(authHelperSource).toContain('await page.goto("/", { waitUntil: "domcontentloaded", timeout: appBootstrapTimeoutMs })');
    expect(authHelperSource).toContain("Unable to load the app root for QA auth within the bounded bootstrap window.");
    expect(authHelperSource).toContain("try {\n      window.localStorage.setItem");
    expect(deepQaHelperSource).toContain('url.startsWith("chrome-error://")');
    expect(deepQaHelperSource).toContain("isAppPageUrl(page.url())");
    expect(deepQaHelperSource).toContain("isAppPageUrl(url)");
  });

  it("keeps role coverage while reducing client deep QA blast radius", () => {
    expect(deepQaSpecSource).toContain("test.describe.configure({ mode: \"serial\" });");
    expect(deepQaSpecSource).toContain("const sessions = new Map<RoleKey, RoleAuditSession>();");
    expect(deepQaSpecSource).toContain("goToPathWithCurrentSession");
    expect(deepQaSpecSource).toContain("Client Deep QA failed fast because the base app could not load");
  });

  it("splits GitHub deep QA into admin, client, and bum suites from a single deep pass trigger", () => {
    expect(deepQaSpecSource).toContain('type DeepQaSuite = "admin" | "client" | "bum"');
    expect(deepQaSpecSource).toContain("QA_DEEP_SUITE");
    expect(deepQaSpecSource).toContain("getRoutesForSuite");
    expect(deepQaSpecSource).toContain('route.role === "ADMIN"');
    expect(deepQaSpecSource).toContain('route.role.startsWith("CLIENT_")');
    expect(deepQaSpecSource).toContain('route.role === "BUM"');
    expect(deepQaSpecSource).toContain('activeSuite !== "client"');

    for (const suite of ["admin", "client", "bum"]) {
      expect(deepQaWorkflowSource).toContain(`- ${suite}`);
      expect(e2eSmokeWorkflowSource).toContain(`- ${suite}`);
    }

    expect(deepQaWorkflowSource).toContain("QA_DEEP_SUITE: ${{ matrix.deep_suite }}");
    expect(e2eSmokeWorkflowSource).toContain("QA_DEEP_SUITE: ${{ matrix.deep_suite }}");
  });

  it("uses suite-scoped target preflight before dependent deep QA shards", () => {
    const deepRunChain = "pnpm run qa:target-preflight && pnpm run qa:env && pnpm run qa:deep";

    expect(deepQaWorkflowSource).toContain(deepRunChain);
    expect(e2eSmokeWorkflowSource).toContain("needs: smoke");
    expect(e2eSmokeWorkflowSource).toContain("QA_TARGET_PREFLIGHT_OUTPUT_DIR: qa-target-preflight-artifacts/${{ matrix.deep_suite }}");
    expect(e2eSmokeWorkflowSource).toContain(deepRunChain);
  });

  it("requires extension API coverage in hosted Deep QA workflow preflight", () => {
    expect(deepQaWorkflowSource).toContain("QA_EXTENSION_API_EXPECTATION: required");
    expect(e2eSmokeWorkflowSource).toContain("QA_EXTENSION_API_EXPECTATION: required");
  });
});
