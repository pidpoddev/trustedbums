import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const packageJson = readFileSync("package.json", "utf8");
const preflightSource = readFileSync("scripts/qa-target-preflight.mjs", "utf8");
const e2eSmokeWorkflow = readFileSync(".github/workflows/e2e-smoke.yml", "utf8");
const deepQaWorkflow = readFileSync(".github/workflows/deep-qa-hotfix-audit.yml", "utf8");

describe("QA target preflight contract", () => {
  it("exposes a package script for hosted target classification", () => {
    expect(packageJson).toContain('"qa:target-preflight": "node scripts/qa-target-preflight.mjs"');
  });

  it("classifies the required hosted E2E readiness checks", () => {
    expect(preflightSource).toContain('["DNS", () => checkDns(targetUrl)]');
    expect(preflightSource).toContain('["HTTPS", () => checkBaseHttp(targetUrl, state)]');
    expect(preflightSource).toContain('["App shell", () => checkAppShell(state)]');
    expect(preflightSource).toContain('["Clerk", () => checkClerkConfig()]');
    expect(preflightSource).toContain('["Extension API", () => checkExtensionApi()]');
  });

  it("accepts prerendered root markup in deployed app shell checks", () => {
    expect(preflightSource).toMatch(/<div\\b\(\?=\[\^>\]\*\\bid=\["'\]root\["'\]\)\[\^>\]\*>/);
    expect(preflightSource).not.toContain("'<div id=\"root\"></div>'");
  });

  it("fails dependent suites when authenticated extension inputs are incomplete", () => {
    expect(preflightSource).toContain("hasDynamicExtensionAuth");
    expect(preflightSource).toContain('getRequiredEnv("QA_EXTENSION_API_TOKEN")');
    expect(preflightSource).toContain("authenticated extension context returned HTTP");
    expect(preflightSource).toContain("QA_EXTENSION_API_EXPECTATION=required");
    expect(preflightSource).toContain("Dependent hosted E2E suites should be skipped until preflight failures are fixed");
  });

  it("classifies extension coverage as verified, skipped, or misconfigured", () => {
    expect(preflightSource).toContain("QA_EXTENSION_API_EXPECTATION must be one of: required, optional, skip");
    expect(preflightSource).toContain('status: "skip"');
    expect(preflightSource).toContain("extension API coverage intentionally skipped by QA_EXTENSION_API_EXPECTATION=skip");
    expect(preflightSource).toContain("Missing QA_EXTENSION_API_BASE_URL while QA_EXTENSION_API_EXPECTATION=required");
    expect(preflightSource).toContain("skippedChecks");
  });

  it("writes downloadable preflight artifacts before dependent suites start", () => {
    expect(preflightSource).toContain('"qa-target-preflight-artifacts"');
    expect(preflightSource).toContain('writePreflightArtifact({ targetUrl, results })');
    expect(preflightSource).toContain('"summary.json"');
    expect(preflightSource).toContain('"summary.txt"');
    expect(e2eSmokeWorkflow).toContain("QA_TARGET_PREFLIGHT_OUTPUT_DIR: qa-target-preflight-artifacts");
    expect(e2eSmokeWorkflow).toContain("qa-target-preflight-artifacts/");
    expect(deepQaWorkflow).toContain("QA_TARGET_PREFLIGHT_OUTPUT_DIR: qa-target-preflight-artifacts/${{ matrix.deep_suite }}");
    expect(deepQaWorkflow).toContain("qa-target-preflight-artifacts/");
  });

  it("keeps hosted fetch retries long enough for post-deploy recovery", () => {
    expect(preflightSource).toContain("QA_TARGET_PREFLIGHT_FETCH_ATTEMPTS ?? 6");
    expect(preflightSource).toContain("QA_TARGET_PREFLIGHT_FETCH_RETRY_DELAY_MS ?? 5_000");
  });
});
