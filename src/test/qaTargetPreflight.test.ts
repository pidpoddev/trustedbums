import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const packageJson = readFileSync("package.json", "utf8");
const preflightSource = readFileSync("scripts/qa-target-preflight.mjs", "utf8");

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

  it("fails dependent suites when authenticated extension inputs are incomplete", () => {
    expect(preflightSource).toContain('getRequiredEnv("QA_EXTENSION_API_TOKEN")');
    expect(preflightSource).toContain("Dependent hosted E2E suites should be skipped until preflight failures are fixed");
  });
});
