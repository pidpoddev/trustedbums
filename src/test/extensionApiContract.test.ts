import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const openApi = readFileSync("docs/openapi.yaml", "utf8");
const apiDocs = readFileSync("docs/api.md", "utf8");
const functionSource = readFileSync("supabase/functions/extension-api-v1/index.ts", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");

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

  it("restricts extension API CORS to configured extension origins", () => {
    expect(functionSource).toContain("EXTENSION_API_ALLOWED_ORIGINS");
    expect(functionSource).toContain("chrome-extension://eemjcjegjdmeghobmfdbaiammapaefde");
    expect(functionSource).toContain("allowedCorsOrigins.has(origin)");
    expect(functionSource).not.toContain('"Access-Control-Allow-Origin": "*"');
  });

  it("does not expose client target-account destinations to Bum extension sessions", () => {
    expect(functionSource).toContain('if (normalizeRole(profile) === "CLIENT") return Boolean(profile.company_id && target.client_company_id === profile.company_id)');
    expect(functionSource).not.toContain('if (normalizeRole(profile) === "BUM") return true');
    expect(functionSource).toContain("targetQuery = targetQuery.limit(0);");
  });

  it("keeps opportunities requestable until a client accepts an intro request", () => {
    expect(portalApiSource).toContain("const MARKETPLACE_LOCKING_CLAIM_STATUSES");
    expect(portalApiSource).toContain('"APPROVED"');
    expect(portalApiSource).not.toContain('MARKETPLACE_LOCKING_CLAIM_STATUSES: OpportunityClaimStatus[] = [\n  "PROPOSED"');
    expect(portalApiSource).toContain("That opportunity already has an accepted intro request.");
  });
});
