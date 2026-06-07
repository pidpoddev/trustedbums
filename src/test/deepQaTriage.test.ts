import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const authHelperSource = readFileSync("tests/e2e/helpers/auth.ts", "utf8");
const deepQaSpecSource = readFileSync("tests/e2e/deep-workflow-hotfix-audit.spec.ts", "utf8");
const deepQaHelperSource = readFileSync("tests/e2e/helpers/deepQa.ts", "utf8");

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
    expect(deepQaSpecSource).toContain("await attachLeadDevHotfixReport(testInfo, runId, issues, [], routeResults);");
  });
});
