import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflowContract = readFileSync("docs/business-workflow-qa-contract.md", "utf8");
const qaPrompt = readFileSync("docs/agents/automation-prompts/trusted-bums-daily-qa-test-engineer.toml", "utf8");
const qaChecklist = readFileSync("docs/qa-checklist.md", "utf8");

describe("business workflow QA contract", () => {
  it("defines role business goals and release-blocking workflow chains", () => {
    expect(workflowContract).toContain("Test the role's job, not the route.");
    expect(workflowContract).toContain("Admin can delete an unclaimed opportunity");
    expect(workflowContract).toContain("Client can edit the opportunity while it is unclaimed.");
    expect(workflowContract).toContain("Bum can request a claim for an open opportunity.");
    expect(workflowContract).toContain("Claim creation does not create duplicate My Contacts rows");
    expect(workflowContract).toContain("The Claims section shows the message that was sent while hiding client recipient names and emails.");
  });

  it("requires QA automation to audit business workflows and escaped defects", () => {
    expect(qaPrompt).toContain("docs/business-workflow-qa-contract.md");
    expect(qaPrompt).toContain("business-workflow QA audit");
    expect(qaPrompt).toContain("Do not treat page-load coverage, button actionability, or route smoke as complete QA");
    expect(qaPrompt).toContain("Escaped defects must update docs/business-workflow-qa-contract.md or the executable deep QA suite");
  });

  it("keeps the release checklist aligned with role job proof", () => {
    expect(qaChecklist).toContain("Deep QA is not complete until the role-based business workflows");
    expect(qaChecklist).toContain("Business Workflow Checks");
    expect(qaChecklist).toContain("Duplicate form submits, refreshes, retries, and repeated clicks do not create duplicate records.");
  });
});
