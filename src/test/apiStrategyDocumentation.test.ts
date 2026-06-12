import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const apiDocs = readFileSync("docs/api.md", "utf8");
const apiBoundaryAdr = readFileSync("docs/architecture-decisions/0001-api-boundary-and-headless-workflows.md", "utf8");
const architectureBacklog = readFileSync("docs/technology-architecture-backlog.md", "utf8");

describe("API strategy documentation", () => {
  it("keeps TB-0088 tied to a checked-in API boundary ADR", () => {
    expect(apiBoundaryAdr).toContain("Tracker: `TB-0088`");
    expect(apiDocs).toContain("0001-api-boundary-and-headless-workflows.md");
    expect(architectureBacklog).toContain("TB-0088");
  });

  it("documents the supported API lanes and headless expectations", () => {
    for (const source of [apiDocs, apiBoundaryAdr]) {
      expect(source).toContain("Direct Data API");
      expect(source).toContain("Public Intake API");
      expect(source).toContain("Portal Domain API");
      expect(source).toContain("Internal Operations API");
      expect(source).toContain("Partner API");
      expect(source).toContain("UI-Only Helper");
      expect(source).toContain("headless");
      expect(source).toContain("Raw Supabase table endpoints are not a partner API");
    }
  });

  it("classifies current major workflow areas before future API expansion", () => {
    for (const workflow of [
      "Chrome extension page capture",
      "Public contact form",
      "Profile bootstrap",
      "Client opportunities",
      "Bum saved",
      "Conversations",
      "Finance",
      "Admin email",
      "Admin Scrum Tracker",
      "Training materials",
      "Performance beacon",
    ]) {
      expect(apiDocs).toContain(workflow);
      expect(apiBoundaryAdr).toContain(workflow);
    }
  });
});
