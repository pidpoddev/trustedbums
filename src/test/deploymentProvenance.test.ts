import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflowSource = readFileSync(".github/workflows/deploy_dreamhost.yaml", "utf8");
const packageSource = readFileSync("package.json", "utf8");
const provenanceScriptSource = readFileSync("scripts/verify-supabase-release-provenance.mjs", "utf8");

describe("deployment provenance guardrails", () => {
  it("runs the Supabase provenance proof during production deploys", () => {
    expect(packageSource).toContain('"release:provenance": "node scripts/verify-supabase-release-provenance.mjs"');
    expect(workflowSource).toContain("Verify Supabase release provenance");
    expect(workflowSource).toContain("SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}");
    expect(workflowSource).toContain("SUPABASE_PROJECT_REF: vaoqvtxqvbptyxddpoju");
    expect(workflowSource).toContain("pnpm run release:provenance");
  });

  it("checks live function revision metadata against local function config", () => {
    expect(provenanceScriptSource).toContain("supabase/config.toml");
    expect(provenanceScriptSource).toContain("https://api.supabase.com/v1/projects/${PROJECT_REF}/functions");
    expect(provenanceScriptSource).toContain("verify_jwt");
    expect(provenanceScriptSource).toContain("getLiveVersion");
    expect(provenanceScriptSource).toContain("SUPABASE_ACCESS_TOKEN is required");
    expect(provenanceScriptSource).toContain("supabase/migrations");
  });
});
