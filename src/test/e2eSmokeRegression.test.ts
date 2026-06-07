import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stagingSmokeSource = readFileSync("tests/e2e/staging-smoke.spec.ts", "utf8");
const clientPaymentsSource = readFileSync("src/pages/client/ClientPayments.tsx", "utf8");
const portalSearchSource = readFileSync("src/components/PortalGlobalSearch.tsx", "utf8");

describe("E2E smoke regression coverage", () => {
  it("asserts the current signup validation copy", () => {
    expect(stagingSmokeSource).toContain("Select Client Prospect or Bum Prospect.");
    expect(stagingSmokeSource).not.toContain("Select Client or Bum.");
  });

  it("keeps only the page header as the exact Customer Payment Reports heading", () => {
    const pageHeaderMatches = clientPaymentsSource.match(/title="Customer Payment Reports"/g) ?? [];
    const duplicateCardTitleMatches =
      clientPaymentsSource.match(/<CardTitle className="font-display">Customer Payment Reports<\/CardTitle>/g) ?? [];

    expect(pageHeaderMatches).toHaveLength(1);
    expect(duplicateCardTitleMatches).toHaveLength(0);
    expect(clientPaymentsSource).toContain("Payment report history");
  });

  it("prioritizes page and title matches in portal global search", () => {
    expect(portalSearchSource).toContain("scoreSearchResult");
    expect(portalSearchSource).toContain("singularizeSearchToken");
    expect(portalSearchSource).toContain('item.icon === "page"');
    expect(portalSearchSource).toContain(".sort((first, second) => scoreSearchResult(first, normalizedQuery) - scoreSearchResult(second, normalizedQuery))");
  });
});
