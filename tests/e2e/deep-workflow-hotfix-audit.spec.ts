import { expect, test, type Page } from "@playwright/test";
import { getQaAccount, goToAuthedPath, hasExternalQaTarget, type QaAccount } from "./helpers/auth";
import {
  attachLeadDevHotfixReport,
  cleanupCreatedRecords,
  createDeepQaRunId,
  exploreVisibleNonDestructiveButtons,
  installDeepQaMonitors,
  isDeepMutationEnabled,
  type DeepQaIssue,
  type QaCreatedRecord,
} from "./helpers/deepQa";

type RoleKey = "ADMIN" | "CLIENT_ADMIN" | "CLIENT_FINANCE" | "CLIENT_MEMBER" | "BUM";

interface WorkflowRoute {
  role: RoleKey;
  path: string;
  heading: string | RegExp;
  area: string;
  workflow: string;
}

const routeInventory: WorkflowRoute[] = [
  { role: "ADMIN", path: "/admin", heading: "Admin Dashboard", area: "Admin", workflow: "Dashboard" },
  { role: "ADMIN", path: "/admin/clients", heading: "Clients", area: "Admin", workflow: "Client management" },
  { role: "ADMIN", path: "/admin/bums", heading: "Bums", area: "Admin", workflow: "Bum management" },
  { role: "ADMIN", path: "/admin/opportunities", heading: "Opportunities", area: "Admin", workflow: "Opportunity operations" },
  { role: "ADMIN", path: "/admin/handoffs", heading: "Handoffs", area: "Admin", workflow: "Handoffs" },
  { role: "ADMIN", path: "/admin/credits", heading: "Credits & Disputes", area: "Admin", workflow: "Credits and disputes" },
  { role: "ADMIN", path: "/admin/commission-plans", heading: "Commission Plans", area: "Admin", workflow: "Commission plans" },
  { role: "ADMIN", path: "/admin/payments", heading: "Payments", area: "Admin", workflow: "Payments" },
  { role: "ADMIN", path: "/admin/payouts", heading: "Payouts", area: "Admin", workflow: "Payouts" },
  { role: "ADMIN", path: "/admin/live-conversations", heading: "Live Conversations", area: "Admin", workflow: "Live conversations" },
  { role: "ADMIN", path: "/admin/emails", heading: "Emails", area: "Admin", workflow: "Email operations" },
  { role: "ADMIN", path: "/admin/training-assets", heading: "Training & Assets", area: "Admin", workflow: "Training assets" },
  { role: "ADMIN", path: "/admin/reports", heading: "Admin Reports", area: "Admin", workflow: "Reports" },
  { role: "ADMIN", path: "/admin/performance", heading: "Performance Metrics", area: "Admin", workflow: "Performance metrics" },
  { role: "ADMIN", path: "/admin/troubleshooting", heading: "Troubleshooting Tools", area: "Admin", workflow: "Troubleshooting" },
  { role: "ADMIN", path: "/admin/legal", heading: "Legal", area: "Admin", workflow: "Legal workspace" },
  { role: "ADMIN", path: "/admin/profile", heading: "Profile", area: "Admin", workflow: "Profile" },
  { role: "CLIENT_ADMIN", path: "/client/dashboard", heading: /Welcome back/i, area: "Client", workflow: "Dashboard" },
  { role: "CLIENT_ADMIN", path: "/client/terms", heading: /Trusted Bums Client Agreement|Trusted Bums Bum Agreement/i, area: "Client", workflow: "Terms" },
  { role: "CLIENT_ADMIN", path: "/client/agreements", heading: "Client Agreement", area: "Client", workflow: "Client agreement" },
  { role: "CLIENT_ADMIN", path: "/client/profile", heading: "Company Profile", area: "Client", workflow: "Company profile" },
  { role: "CLIENT_ADMIN", path: "/client/user-profile", heading: "User Profile", area: "Client", workflow: "User profile" },
  { role: "CLIENT_ADMIN", path: "/client/reports", heading: "Client Reports", area: "Client", workflow: "Reports" },
  { role: "CLIENT_ADMIN", path: "/client/targets", heading: "Target Accounts", area: "Client", workflow: "Target accounts" },
  { role: "CLIENT_ADMIN", path: "/client/opportunities/new", heading: "Opportunities", area: "Client", workflow: "Opportunity registration" },
  { role: "CLIENT_ADMIN", path: "/client/bum-directory", heading: "Bum Directory", area: "Client", workflow: "Bum directory" },
  { role: "CLIENT_ADMIN", path: "/client/trainings", heading: "Training & Assets", area: "Client", workflow: "Training assets" },
  { role: "CLIENT_ADMIN", path: "/client/requests", heading: "Customer Leads", area: "Client", workflow: "Customer leads" },
  { role: "CLIENT_ADMIN", path: "/client/team", heading: "Team Management", area: "Client", workflow: "Team management" },
  { role: "CLIENT_ADMIN", path: "/client/payments", heading: "Customer Payment Reports", area: "Client", workflow: "Payments" },
  { role: "CLIENT_ADMIN", path: "/client/exports", heading: "Exports", area: "Client", workflow: "Exports" },
  { role: "CLIENT_FINANCE", path: "/client/dashboard", heading: /Welcome back/i, area: "Client Finance", workflow: "Dashboard" },
  { role: "CLIENT_FINANCE", path: "/client/agreements", heading: "Client Agreement", area: "Client Finance", workflow: "Client agreement" },
  { role: "CLIENT_FINANCE", path: "/client/profile", heading: "Company Profile", area: "Client Finance", workflow: "Company profile" },
  { role: "CLIENT_FINANCE", path: "/client/user-profile", heading: "User Profile", area: "Client Finance", workflow: "User profile" },
  { role: "CLIENT_FINANCE", path: "/client/reports", heading: "Client Reports", area: "Client Finance", workflow: "Reports" },
  { role: "CLIENT_FINANCE", path: "/client/payments", heading: "Customer Payment Reports", area: "Client Finance", workflow: "Customer Payment Reports" },
  { role: "CLIENT_FINANCE", path: "/client/exports", heading: "Exports", area: "Client Finance", workflow: "Exports" },
  { role: "CLIENT_MEMBER", path: "/client/dashboard", heading: /Welcome back/i, area: "Client Member", workflow: "Dashboard" },
  { role: "CLIENT_MEMBER", path: "/client/agreements", heading: "Client Agreement", area: "Client Member", workflow: "Client agreement" },
  { role: "CLIENT_MEMBER", path: "/client/profile", heading: "Company Profile", area: "Client Member", workflow: "Company profile" },
  { role: "CLIENT_MEMBER", path: "/client/user-profile", heading: "User Profile", area: "Client Member", workflow: "User profile" },
  { role: "CLIENT_MEMBER", path: "/client/reports", heading: "Client Reports", area: "Client Member", workflow: "Reports" },
  { role: "CLIENT_MEMBER", path: "/client/targets", heading: "Target Accounts", area: "Client Member", workflow: "Target accounts" },
  { role: "CLIENT_MEMBER", path: "/client/opportunities/new", heading: "Opportunities", area: "Client Member", workflow: "Opportunity registration" },
  { role: "CLIENT_MEMBER", path: "/client/bum-directory", heading: "Bum Directory", area: "Client Member", workflow: "Bum directory" },
  { role: "CLIENT_MEMBER", path: "/client/trainings", heading: "Training & Assets", area: "Client Member", workflow: "Training assets" },
  { role: "CLIENT_MEMBER", path: "/client/requests", heading: "Customer Leads", area: "Client Member", workflow: "Customer leads" },
  { role: "BUM", path: "/bum/dashboard", heading: /Welcome back/i, area: "Bum", workflow: "Dashboard" },
  { role: "BUM", path: "/bum/terms", heading: /Trusted Bums Bum Agreement|Trusted Bums Client Agreement/i, area: "Bum", workflow: "Terms" },
  { role: "BUM", path: "/bum/prospects", heading: "Prospects", area: "Bum", workflow: "Prospects" },
  { role: "BUM", path: "/bum/reverse-opportunities", heading: "Customer Leads", area: "Bum", workflow: "Customer leads" },
  { role: "BUM", path: "/bum/clients", heading: "Clients We Represent", area: "Bum", workflow: "Client representation" },
  { role: "BUM", path: "/bum/contacts", heading: "Contacts", area: "Bum", workflow: "Contacts" },
  { role: "BUM", path: "/bum/opportunities", heading: "Opportunities", area: "Bum", workflow: "Opportunities" },
  { role: "BUM", path: "/bum/claims", heading: "Claims", area: "Bum", workflow: "Claims" },
  { role: "BUM", path: "/bum/trainings", heading: "Training & Assets", area: "Bum", workflow: "Training assets" },
  { role: "BUM", path: "/bum/live-conversations", heading: "Live Conversations", area: "Bum", workflow: "Live conversations" },
  { role: "BUM", path: "/bum/earnings", heading: "Earnings", area: "Bum", workflow: "Earnings" },
  { role: "BUM", path: "/bum/reports", heading: "Bum Reports", area: "Bum", workflow: "Reports" },
  { role: "BUM", path: "/bum/profile", heading: "Profile", area: "Bum", workflow: "Profile" },
];

function getRequiredAccount(role: RoleKey) {
  const account = getQaAccount(role);
  test.skip(!account, `Set QA_${role}_EMAIL.`);
  return account!;
}

async function reportVisibleFailure(page: Page, issues: DeepQaIssue[], area: string, workflow: string) {
  const bodyText = await page.locator("body").innerText().catch(() => "");
  const visibleError = bodyText.match(/Unable to [^\n]+|Something went wrong|Application error|Please try again|not authorized/i)?.[0];
  if (visibleError) {
    issues.push({
      severity: "P1",
      area,
      workflow,
      evidence: `Visible failure: ${visibleError}`,
      recommendation: "Treat this as a hotfix candidate if the workflow is on a primary user path; expose the backend reason in QA traces.",
      url: page.url(),
    });
  }
}

async function exerciseTermsAcceptanceIfRequired(page: Page, account: QaAccount, issues: DeepQaIssue[], role: "CLIENT_ADMIN" | "BUM") {
  const termsPath = role === "BUM" ? "/bum/terms" : "/client/terms";
  const area = role === "BUM" ? "Bum" : "Client";

  await goToAuthedPath(page, account, termsPath);
  await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 20_000 });

  const acceptButton = page.getByRole("button", { name: /accept.*continue/i });
  if (!(await acceptButton.isVisible().catch(() => false))) {
    await reportVisibleFailure(page, issues, area, "Agreement acceptance");
    return;
  }

  await page.getByRole("checkbox").first().click();
  await acceptButton.click();
  await page.waitForTimeout(1_000);

  if (await page.getByText(/Unable to accept/i).isVisible().catch(() => false)) {
    issues.push({
      severity: "P0",
      area,
      workflow: "Agreement acceptance",
      evidence: await page.getByText(/Unable to accept/i).first().innerText().catch(() => "Unable to accept terms toast appeared."),
      recommendation: "Hotfix the terms acceptance write path and add a fresh-unaccepted-account regression for this role.",
      url: page.url(),
    });
  }
}

async function createClientTarget(page: Page, runId: string, records: QaCreatedRecord[]) {
  const name = `${runId} target`;
  await page.goto("/client/targets");
  await expect(page.getByRole("heading", { name: "Target Accounts" })).toBeVisible();
  await page.getByRole("button", { name: "Add Target Account", exact: true }).click();
  await page.getByLabel("Target account name", { exact: true }).fill(name);
  await page.getByLabel("Company website", { exact: true }).fill("qa-deep.example");
  await page.getByLabel("Business unit", { exact: true }).fill("QA");
  await page.getByLabel("Key contact", { exact: true }).fill("QA Contact");
  await page.getByLabel("Key contact email", { exact: true }).fill("qa-contact@example.com");
  await page.getByLabel("Estimated deal value", { exact: true }).fill("25000");
  await page.getByLabel("Expected product/service", { exact: true }).fill("Deep QA validation");
  await page.getByLabel("Notes", { exact: true }).fill(`Created by ${runId}; safe to delete.`);
  records.push({ table: "customer_targets", field: "target_account_name", value: name });
  await page.getByRole("button", { name: "Save target account" }).click();
  await expect(page.getByText("Target account saved")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(name)).toBeVisible({ timeout: 20_000 });
}

async function createClientOpportunity(page: Page, runId: string, records: QaCreatedRecord[]) {
  const name = `${runId} opportunity`;
  await page.goto("/client/opportunities/new");
  await expect(page.getByRole("heading", { name: "Opportunities" })).toBeVisible();
  await page.getByLabel("Customer account name", { exact: true }).fill(name);
  await page.getByLabel("Business unit / department", { exact: true }).fill("QA");
  await page.getByLabel("Your internal contact", { exact: true }).fill("QA Client");
  await page.getByLabel("Trusted Bums owner", { exact: true }).fill("QA Owner");
  await page.getByLabel("Expected product/service", { exact: true }).fill("Deep QA validation");
  await page.getByLabel("Estimated deal value", { exact: true }).fill("50000");
  await page.getByLabel("Expected timeline", { exact: true }).fill("QA run");
  await page.getByLabel("Opportunity description", { exact: true }).fill(`Created by ${runId}; safe to delete.`);
  await page.getByLabel("Notes", { exact: true }).fill(`Created by ${runId}; safe to delete.`);
  records.push({ table: "opportunity_registrations", field: "target_account_name", value: name });
  await page.getByRole("button", { name: /submit opportunity registration/i }).click();
  await expect(page.getByText("Registration submitted")).toBeVisible({ timeout: 20_000 });
}

test.describe("deep workflow hotfix audit", () => {
  test.skip(!hasExternalQaTarget(), "Set QA_BASE_URL to run deep workflow hotfix audit against the deployed QA target.");

  test("explores role routes and non-destructive controls for Lead Dev hotfix candidates", async ({ browser }, testInfo) => {
    test.setTimeout(600_000);
    test.skip(testInfo.project.name !== "chromium", "Run the deep route audit once on desktop Chromium.");

    const runId = createDeepQaRunId();
    const issues: DeepQaIssue[] = [];

    try {
      for (const route of routeInventory) {
        const account = getRequiredAccount(route.role);
        const context = await browser.newContext();
        const page = await context.newPage();
        installDeepQaMonitors(page, issues, route.area);

        try {
          await goToAuthedPath(page, account, route.path);
          await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible({ timeout: 20_000 });
          await reportVisibleFailure(page, issues, route.area, route.workflow);
          await exploreVisibleNonDestructiveButtons(page, issues, route.area, route.workflow);
        } catch (error) {
          issues.push({
            severity: "P1",
            area: route.area,
            workflow: route.workflow,
            evidence: error instanceof Error ? error.message : String(error),
            recommendation: "Reproduce this route/workflow directly, then fix either the product failure or the QA selector/session assumption.",
            url: page.url(),
          });
        } finally {
          await context.close();
        }
      }
    } finally {
      await attachLeadDevHotfixReport(testInfo, runId, issues);
    }

    const blockerIssues = issues.filter((issue) => issue.severity === "P0" || issue.severity === "P1");
    expect(blockerIssues, "P0/P1 deep QA findings should be routed to Lead Dev as hotfix candidates.").toEqual([]);
  });

  test("attempts legal acceptance and mutating client workflows with cleanup", async ({ browser }, testInfo) => {
    test.setTimeout(240_000);
    test.skip(testInfo.project.name !== "chromium", "Run mutating workflow QA once on desktop Chromium.");
    test.skip(!isDeepMutationEnabled(), "Set QA_DEEP_MUTATION=1 to create and clean up QA workflow records.");

    if (!process.env.QA_SUPABASE_URL || !process.env.QA_SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        "Mutating deep QA requires QA_SUPABASE_URL and QA_SUPABASE_SERVICE_ROLE_KEY so created qa-deep records can be cleaned up before the test exits.",
      );
    }

    const runId = createDeepQaRunId();
    const issues: DeepQaIssue[] = [];
    const createdRecords: QaCreatedRecord[] = [];
    try {
      const bumContext = await browser.newContext();
      const bumPage = await bumContext.newPage();
      installDeepQaMonitors(bumPage, issues, "Bum");
      await exerciseTermsAcceptanceIfRequired(bumPage, getRequiredAccount("BUM"), issues, "BUM");
      await bumContext.close();

      const clientTermsContext = await browser.newContext();
      const clientTermsPage = await clientTermsContext.newPage();
      installDeepQaMonitors(clientTermsPage, issues, "Client");
      await exerciseTermsAcceptanceIfRequired(clientTermsPage, getRequiredAccount("CLIENT_ADMIN"), issues, "CLIENT_ADMIN");
      await clientTermsContext.close();

      const clientContext = await browser.newContext();
      const clientPage = await clientContext.newPage();
      installDeepQaMonitors(clientPage, issues, "Client");
      await goToAuthedPath(clientPage, getRequiredAccount("CLIENT_ADMIN"), "/client/targets");
      await createClientTarget(clientPage, runId, createdRecords);
      await createClientOpportunity(clientPage, runId, createdRecords);
      await clientContext.close();
    } finally {
      await cleanupCreatedRecords(createdRecords, issues);
      await attachLeadDevHotfixReport(testInfo, runId, issues, createdRecords);
    }

    const blockerIssues = issues.filter((issue) => issue.severity === "P0" || issue.severity === "P1");
    expect(blockerIssues, "Mutating deep QA found hotfix candidates.").toEqual([]);
  });
});
