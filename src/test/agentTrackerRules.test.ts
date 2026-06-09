import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const agentConsultantRules = readFileSync("docs/agents/consultant-team-rules.md", "utf8");
const rootConsultantRules = readFileSync("docs/consultant-team-rules.md", "utf8");
const agentCompanyRules = readFileSync("docs/agents/company-wide-rules.md", "utf8");
const rootCompanyRules = readFileSync("docs/company-wide-rules.md", "utf8");
const agentReadme = readFileSync("docs/agents/README.md", "utf8");
const codeReviewAgent = readFileSync("docs/agents/code-review-agent.md", "utf8");
const agentBusinessAccessRules = readFileSync("docs/agents/business-access-rules.md", "utf8");
const leadDeveloperPrompt = readFileSync("docs/agents/automation-prompts/trusted-bums-daily-lead-developer.toml", "utf8");
const releaseVerificationPrompt = readFileSync("docs/agents/automation-prompts/trusted-bums-daily-release-verification-agent.toml", "utf8");
const qaTestPrompt = readFileSync("docs/agents/automation-prompts/trusted-bums-daily-qa-test-engineer.toml", "utf8");

describe("agent scrum tracker rules", () => {
  it("requires agents to create tracker items and cite returned TB IDs", () => {
    for (const source of [agentConsultantRules, rootConsultantRules, agentCompanyRules, rootCompanyRules, agentReadme]) {
      expect(source).toContain("TB-");
      expect(source).toContain("added_by_agent");
      expect(source).toContain("item_type = BUG");
      expect(source).toContain("source_key");
      expect(source).toContain("existing `TB-` item");
      expect(source).toContain("search existing open, blocked, fixed, and recently closed tracker rows");
      expect(source).toContain("affected route/table/workflow");
    }
  });

  it("makes tracker coverage part of code review and access rules", () => {
    expect(codeReviewAgent).toContain("Matching `TB-` Scrum Tracker IDs");
    expect(codeReviewAgent).toContain("true defects use `item_type = BUG`");
    expect(codeReviewAgent).toContain("searched existing open, blocked, fixed, and recently closed rows");
    expect(codeReviewAgent).toContain("affected route/table/workflow");
    expect(codeReviewAgent).toContain("instead of creating a duplicate");
    expect(agentBusinessAccessRules).toContain("Admin Scrum Tracker");
    expect(agentBusinessAccessRules).toContain("Every active agent recommendation has a returned `TB-` ID");
    expect(agentBusinessAccessRules).toContain("Cross-agent additions update the original `TB-` item");
    expect(agentBusinessAccessRules).toContain("without first searching the matching `source_key`");
  });

  it("requires triggered agents to close tracker items when proof is complete", () => {
    for (const source of [leadDeveloperPrompt, releaseVerificationPrompt, qaTestPrompt]) {
      expect(source).toContain("tracker closeout sweep");
      expect(source).toContain("public.admin_scrum_items");
      expect(source).toContain("closure note");
      expect(source).toContain("evidence links");
    }
  });
});
