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
    expect(deepQaSpecSource).toContain("test.setTimeout(activeSuite ? 900_000 : 1_800_000)");
    expect(deepQaSpecSource).toContain("await attachLeadDevHotfixReport(testInfo, runId, issues, [], routeResults);");
    expect(deepQaSpecSource).toContain("await context.close().catch(() => undefined);");
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
});
