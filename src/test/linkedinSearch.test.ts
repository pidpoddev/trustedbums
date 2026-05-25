import { describe, expect, it } from "vitest";
import { buildLinkedInFirstConnectionsUrl } from "@/lib/linkedinSearch";

describe("buildLinkedInFirstConnectionsUrl", () => {
  it("opens a company people page when a LinkedIn company URL is available", () => {
    expect(buildLinkedInFirstConnectionsUrl("BlackCurrant", "https://www.linkedin.com/company/blackcurrant-ai/")).toBe(
      "https://www.linkedin.com/company/blackcurrant-ai/people/",
    );
  });

  it("falls back to a first-connections people search by company name", () => {
    expect(buildLinkedInFirstConnectionsUrl("Acme Corp")).toBe(
      "https://www.linkedin.com/search/results/people/?keywords=Acme+Corp&network=%5B%22F%22%5D",
    );
  });
});
