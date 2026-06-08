import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stagingSmokeSource = readFileSync("tests/e2e/staging-smoke.spec.ts", "utf8");
const clientPaymentsSource = readFileSync("src/pages/client/ClientPayments.tsx", "utf8");
const portalSearchSource = readFileSync("src/components/PortalGlobalSearch.tsx", "utf8");
const signupIntentSource = readFileSync("src/components/SignupIntentDialog.tsx", "utf8");
const publicIndexSource = readFileSync("src/pages/Index.tsx", "utf8");
const clientDashboardSource = readFileSync("src/pages/client/ClientDashboard.tsx", "utf8");
const clientTermsSource = readFileSync("src/pages/client/ClientTerms.tsx", "utf8");

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

  it("keeps public and client recovery paths explicit", () => {
    expect(signupIntentSource).toContain("manualCompanyName");
    expect(signupIntentSource).not.toContain('setCompanyName("")');
    expect(publicIndexSource).toContain("noValidate");
    expect(publicIndexSource).toContain("contact-name-error");
    expect(publicIndexSource).toContain("Your details are still here");
    expect(publicIndexSource).toContain("Message sent. Trusted Bums will review it and follow up soon.");
    expect(publicIndexSource).toContain('role="status"');
    expect(clientDashboardSource).toContain("deniedFrom");
    expect(clientDashboardSource).toContain("getDeniedAccessRecovery");
    expect(clientDashboardSource).toContain("That workspace area is not available for this account.");
    expect(clientDashboardSource).toContain("Client Agreement needs attention.");
    expect(clientDashboardSource).toContain("Open Client Agreement");
    expect(clientDashboardSource).toContain('to: "/client/agreements"');
    expect(clientDashboardSource).not.toContain('to: "/client/profile", primary: true');
    expect(clientTermsSource).toContain("Continue This Session");
    expect(clientTermsSource).not.toContain("Skip This Login");
  });
});
