import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stagingSmokeSource = readFileSync("tests/e2e/staging-smoke.spec.ts", "utf8");
const authenticatedRoleSmokeSource = readFileSync("tests/e2e/authenticated-role-smoke.spec.ts", "utf8");
const opportunityWorkflowSource = readFileSync("tests/e2e/opportunity-workflow.spec.ts", "utf8");
const workflowQaMatrixSource = readFileSync("tests/e2e/workflow-qa-matrix.spec.ts", "utf8");
const deepQaHelperSource = readFileSync("tests/e2e/helpers/deepQa.ts", "utf8");
const packageSource = readFileSync("package.json", "utf8");
const clientPaymentsSource = readFileSync("src/pages/client/ClientPayments.tsx", "utf8");
const portalSearchSource = readFileSync("src/components/PortalGlobalSearch.tsx", "utf8");
const signupIntentSource = readFileSync("src/components/SignupIntentDialog.tsx", "utf8");
const fieldHelpSource = readFileSync("src/components/FieldHelp.tsx", "utf8");
const publicIndexSource = readFileSync("src/pages/Index.tsx", "utf8");
const clientDashboardSource = readFileSync("src/pages/client/ClientDashboard.tsx", "utf8");
const clientTermsSource = readFileSync("src/pages/client/ClientTerms.tsx", "utf8");
const e2eAuthHelperSource = readFileSync("tests/e2e/helpers/auth.ts", "utf8");
const deniedAccessRecoverySource =
  clientDashboardSource.match(/function getDeniedAccessRecovery[\s\S]*?\n}\n\nfunction NextActionsCard/)?.[0] ?? "";

describe("E2E smoke regression coverage", () => {
  it("asserts the current signup validation copy", () => {
    expect(stagingSmokeSource).toContain("Create your Client account");
    expect(stagingSmokeSource).toContain("Apply as a Bum");
    expect(stagingSmokeSource).not.toContain("Select Client or Bum.");
    expect(signupIntentSource).toContain("lockedRole");
  });

  it("keeps signup field help accessible and reusable", () => {
    expect(fieldHelpSource).toContain("export function FieldLabel");
    expect(fieldHelpSource).toContain("export function FieldHelp");
    expect(fieldHelpSource).toContain("helpLabel");
    expect(fieldHelpSource).toContain("`${children} help`");
    expect(signupIntentSource).toContain("FieldLabel");
    expect(signupIntentSource).toContain("aria-labelledby={accountLabelId}");
    expect(signupIntentSource).toContain("aria-describedby={emailError");
    expect(signupIntentSource).toContain("aria-invalid={emailError}");
    expect(signupIntentSource).toContain("aria-describedby={companyError");
    expect(signupIntentSource).toContain("aria-invalid={companyError}");
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
    expect(portalSearchSource).toContain("const committedQuery = query.trim()");
    expect(portalSearchSource).toContain("shouldFetchSearchData = Boolean(user && committedQuery.length >= 2)");
    expect(portalSearchSource).not.toContain("focused || mobileOpen || query.trim().length >= 2");
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
    expect(clientDashboardSource).toContain("Agreements need attention.");
    expect(clientDashboardSource).toContain("Open Agreements");
    expect(deniedAccessRecoverySource).toContain('to: "/client/agreements"');
    expect(deniedAccessRecoverySource).not.toContain('to: "/client/profile"');
    expect(clientTermsSource).toContain("Continue This Session");
    expect(clientTermsSource).not.toContain("Skip This Login");
  });

  it("keeps authenticated E2E navigation strict for tabbed routes", () => {
    expect(e2eAuthHelperSource).toContain("currentUrl.search");
    expect(e2eAuthHelperSource).toContain("expectedUrl.search");
    expect(e2eAuthHelperSource).toContain("new URL(path, currentUrl.origin)");
  });

  it("uses protected-route navigation for client opportunity smoke hops", () => {
    expect(authenticatedRoleSmokeSource).toContain('goToPathWithCurrentSession(page, "/client/opportunities")');
    expect(authenticatedRoleSmokeSource).not.toContain('page.goto("/client/opportunities")');
  });

  it("cleans up fake opportunity records after mutating smoke tests", () => {
    expect(opportunityWorkflowSource).toContain("hasQaCleanupCredential");
    expect(opportunityWorkflowSource).toContain('table: "opportunity_registrations"');
    expect(opportunityWorkflowSource).toContain('field: "target_account_name"');
    expect(opportunityWorkflowSource).toContain("cleanupCreatedRecords(createdRecords, cleanupIssues)");
    expect(opportunityWorkflowSource).toContain("finally");
    expect(opportunityWorkflowSource).toContain('issue.severity === "P1"');
  });

  it("keeps mutating role workflow QA strict and cleanup-safe", () => {
    expect(packageSource).toContain('"qa:workflow": "playwright test tests/e2e/workflow-qa-matrix.spec.ts --project=chromium"');
    expect(workflowQaMatrixSource).toContain("QA_WORKFLOW_MUTATION=1");
    expect(workflowQaMatrixSource).toContain("QA DO NOT USE");
    expect(workflowQaMatrixSource).toContain("installWorkflowQaErrorGate");
    expect(workflowQaMatrixSource).toContain('requireQaAccount("CLIENT_MEMBER")');
    expect(workflowQaMatrixSource).toContain('requireQaAccount("CLIENT_ADMIN")');
    expect(workflowQaMatrixSource).toContain('requireQaAccount("ADMIN")');
    expect(workflowQaMatrixSource).toContain('requireQaAccount("BUM")');
    expect(workflowQaMatrixSource).toContain("expectAdminCanSeeOpportunity");
    expect(workflowQaMatrixSource).toContain("expectBumCanSeeOpportunity");
    expect(workflowQaMatrixSource).toContain("deleteUnclaimedOpportunity");
    expect(workflowQaMatrixSource).toContain("Bum imports a LinkedIn CSV export");
    expect(workflowQaMatrixSource).toContain("#linkedinProfileCsv");
    expect(workflowQaMatrixSource).toContain("#linkedinPositionsCsv");
    expect(workflowQaMatrixSource).toContain("#linkedinSkillsCsv");
    expect(workflowQaMatrixSource).toContain("#linkedinCertificationsCsv");
    expect(workflowQaMatrixSource).toContain("#linkedinConnectionsCsv");
    expect(workflowQaMatrixSource).toContain("import and prefill");
    expect(workflowQaMatrixSource).toContain("restoreBumProfileSnapshot");
    expect(workflowQaMatrixSource).toContain("QA LinkedIn Import");
    expect(deepQaHelperSource).toContain("function isWorkflowRelevantUrl");
    expect(deepQaHelperSource).toContain("function isIgnoredWorkflowConsoleError");
    expect(deepQaHelperSource).toContain("function isIgnoredWorkflowRequestFailure");
    expect(deepQaHelperSource).toContain("net::ERR_ABORTED");
    expect(deepQaHelperSource).toContain('["GET", "HEAD"].includes(request.method())');
    expect(deepQaHelperSource).toContain("performance-beacon");
    expect(deepQaHelperSource).toContain("export function installWorkflowQaErrorGate");
    expect(deepQaHelperSource).toContain("export function isQaCleanupSafeRecord");
    expect(deepQaHelperSource).toContain("Cleanup refused");
  });
});
