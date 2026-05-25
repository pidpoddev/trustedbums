import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const openApi = readFileSync("docs/openapi.yaml", "utf8");
const apiDocs = readFileSync("docs/api.md", "utf8");
const functionSource = readFileSync("supabase/functions/extension-api-v1/index.ts", "utf8");

describe("extension API contract", () => {
  it("documents the implemented v1 endpoints", () => {
    for (const endpoint of ["/functions/v1/extension-api-v1/context", "/functions/v1/extension-api-v1/page-captures"]) {
      expect(openApi).toContain(endpoint);
      expect(apiDocs).toContain(endpoint);
    }

    expect(functionSource).toContain('path === "/context"');
    expect(functionSource).toContain('path === "/page-captures"');
  });

  it("keeps the extension API versioned and backward-compatible by policy", () => {
    expect(openApi).toContain("version: 1.0.0");
    expect(openApi).toContain("extension-api-v2");
    expect(apiDocs).toContain("Breaking changes require a new function namespace such as `extension-api-v2`");
    expect(functionSource).toContain('const API_VERSION = "v1"');
  });

  it("requires bearer auth and returns stable response envelopes", () => {
    expect(openApi).toContain("ClerkBearerAuth");
    expect(openApi).toContain("apiVersion:");
    expect(functionSource).toContain("getBearerToken(request)");
    expect(functionSource).toContain("apiVersion: API_VERSION");
  });
});
