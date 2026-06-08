import { expect, test, type Page } from "@playwright/test";
import { getQaAccount, goToAuthedPath, goToAuthedPathAllowingRedirect, hasExternalQaTarget, type QaAccount } from "./helpers/auth";
import { cleanupCreatedRecords, createDeepQaRunId, type QaCreatedRecord } from "./helpers/deepQa";

function isGoLiveMutationEnabled() {
  return process.env.QA_GO_LIVE_MUTATION === "1";
}

function requiredAccount(role: "CLIENT_ADMIN" | "CLIENT_FINANCE" | "CLIENT_MEMBER" | "BUM") {
  const account = getQaAccount(role);
  test.skip(!account, `Set QA_${role}_EMAIL.`);
  return account!;
}

async function expectHealthyWorkflowPage(page: Page, heading: string | RegExp) {
  await page.waitForLoadState("domcontentloaded").catch(() => undefined);
  await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible({ timeout: 20_000 });
  await expect(page).not.toHaveURL(/\/login\/?$/);

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(/configuration needed|application error|something went wrong|unable to bootstrap|not authorized/i);
}

async function openClientPage(page: Page, account: QaAccount, path: string, heading: string | RegExp) {
  await goToAuthedPath(page, account, path);
  await expectHealthyWorkflowPage(page, heading);
}

async function openBumPage(page: Page, account: QaAccount, path: string, heading: string | RegExp) {
  await goToAuthedPath(page, account, path);
  await expectHealthyWorkflowPage(page, heading);
}

test.describe("go-live Client and Bum workflow gate", () => {
  test.skip(!hasExternalQaTarget(), "Set QA_BASE_URL to run the go-live workflow gate.");

  test("Client Admin can complete core client workflows", async ({ page }) => {
    test.setTimeout(180_000);
    const clientAdmin = requiredAccount("CLIENT_ADMIN");

    await openClientPage(page, clientAdmin, "/client/dashboard", /Welcome back/i);
    await expect(page.getByRole("link", { name: /Add Target Account/i }).first()).toBeVisible();

    await openClientPage(page, clientAdmin, "/client/profile", "Company Profile");
    await expect(page.getByRole("button", { name: /Save Company Profile/i })).toBeVisible();

    await openClientPage(page, clientAdmin, "/client/targets", "Target Accounts");
    await page.getByRole("button", { name: /Add Target Account/i }).first().click();
    await expect(page.getByRole("button", { name: "Save target account" })).toBeVisible();
    await page.keyboard.press("Escape").catch(() => undefined);

    await openClientPage(page, clientAdmin, "/client/opportunities", "Opportunities");
    await openClientPage(page, clientAdmin, "/client/opportunities/new", "Opportunities");
    await expect(page.getByRole("button", { name: /submit opportunity registration/i })).toBeVisible();

    await openClientPage(page, clientAdmin, "/client/bum-directory", "Bum Directory");
    await openClientPage(page, clientAdmin, "/client/requests", "Customer Leads");
    await openClientPage(page, clientAdmin, "/client/team", "Team Management");
    await openClientPage(page, clientAdmin, "/client/reports", "Client Reports");
    await openClientPage(page, clientAdmin, "/client/exports", "Exports");
  });

  test("Client Finance can complete finance workflows without broader client admin access", async ({ page }) => {
    test.setTimeout(120_000);
    const finance = requiredAccount("CLIENT_FINANCE");

    await openClientPage(page, finance, "/client/dashboard", /Welcome back/i);
    await openClientPage(page, finance, "/client/payments", "Customer Payment Reports");
    await openClientPage(page, finance, "/client/exports", "Exports");
    await openClientPage(page, finance, "/client/reports", "Client Reports");

    await goToAuthedPathAllowingRedirect(page, finance, "/client/team", /\/client\/dashboard\/?$/);
    await expect(page).toHaveURL(/\/client\/dashboard\/?$/);
  });

  test("Client Member can use member workflows and is blocked from finance-only workflows", async ({ page }) => {
    test.setTimeout(120_000);
    const member = requiredAccount("CLIENT_MEMBER");

    await openClientPage(page, member, "/client/dashboard", /Welcome back/i);
    await openClientPage(page, member, "/client/targets", "Target Accounts");
    await openClientPage(page, member, "/client/opportunities", "Opportunities");
    await openClientPage(page, member, "/client/bum-directory", "Bum Directory");
    await openClientPage(page, member, "/client/requests", "Customer Leads");

    await goToAuthedPathAllowingRedirect(page, member, "/client/payments", /\/client\/dashboard\/?$/);
    await expect(page).toHaveURL(/\/client\/dashboard\/?$/);
  });

  test("Bum can complete core Bum workflows", async ({ page }) => {
    test.setTimeout(180_000);
    const bum = requiredAccount("BUM");

    await openBumPage(page, bum, "/bum/dashboard", /Welcome back/i);
    await expect(page.getByText("Profile completeness")).toBeVisible();

    await openBumPage(page, bum, "/bum/profile", "Profile");
    await expect(page.getByText("Availability")).toBeVisible();
    await expect(page.getByRole("button", { name: /Save profile/i })).toBeVisible();

    await openBumPage(page, bum, "/bum/opportunities", "Opportunities");
    const claimIntroButtons = page.getByRole("button", { name: /Claim intro/i });
    if (await claimIntroButtons.first().isVisible({ timeout: 5_000 }).catch(() => false)) {
      await claimIntroButtons.first().click();
      await expect(page.getByRole("button", { name: "Quick add" })).toBeVisible();
      await page.getByRole("button", { name: "Quick add" }).click();
      await expect(page.getByRole("button", { name: /Add and select contact/i })).toBeDisabled();
      await page.keyboard.press("Escape").catch(() => undefined);
    }

    await openBumPage(page, bum, "/bum/contacts", "Contacts");
    await openBumPage(page, bum, "/bum/claims", "Claims");
    await openBumPage(page, bum, "/bum/prospects", "Prospects");
    await openBumPage(page, bum, "/bum/reverse-opportunities", "Customer Leads");
    await openBumPage(page, bum, "/bum/clients", "Clients We Represent");
    await openBumPage(page, bum, "/bum/earnings", "Earnings");
    await openBumPage(page, bum, "/bum/reports", "Bum Reports");
  });

  test("optional mutating Client/Bum workflow smoke", async ({ browser }, testInfo) => {
    test.setTimeout(180_000);
    test.skip(!isGoLiveMutationEnabled(), "Set QA_GO_LIVE_MUTATION=1 to run mutating go-live workflow smoke.");
    test.skip(testInfo.project.name !== "chromium", "Run mutating go-live workflow smoke once on desktop Chromium.");

    const clientAdmin = requiredAccount("CLIENT_ADMIN");
    const runId = createDeepQaRunId().replace("qa-deep", "qa-go-live");
    const createdRecords: QaCreatedRecord[] = [];
    const cleanupIssues: Parameters<typeof cleanupCreatedRecords>[1] = [];

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      const targetName = `${runId} target`;
      await openClientPage(page, clientAdmin, "/client/targets", "Target Accounts");
      await page.getByRole("button", { name: /Add Target Account/i }).first().click();
      await page.getByLabel("Target account name", { exact: true }).fill(targetName);
      await page.getByLabel("Company website", { exact: true }).fill("qa-go-live.example");
      await page.getByLabel("Business unit", { exact: true }).fill("QA");
      await page.getByLabel("Key contact", { exact: true }).fill("QA Go Live Contact");
      await page.getByLabel("Key contact email", { exact: true }).fill("qa-go-live-contact@example.com");
      await page.getByLabel("Estimated deal value", { exact: true }).fill("25000");
      await page.getByLabel("Expected product/service", { exact: true }).fill("Go-live QA validation");
      await page.getByLabel("Notes", { exact: true }).fill(`Created by ${runId}; safe to delete.`);
      createdRecords.push({ table: "customer_targets", field: "target_account_name", value: targetName });
      await page.getByRole("button", { name: "Save target account" }).click();
      await expect(page.getByText("Target account saved")).toBeVisible({ timeout: 20_000 });

      const opportunityName = `${runId} opportunity`;
      await openClientPage(page, clientAdmin, "/client/opportunities/new", "Opportunities");
      await page.getByLabel("Customer account name", { exact: true }).fill(opportunityName);
      await page.getByLabel("Business unit / department", { exact: true }).fill("QA");
      await page.getByLabel("Your internal contact", { exact: true }).fill("QA Client");
      await page.getByLabel("Trusted Bums owner", { exact: true }).fill("QA Owner");
      await page.getByLabel("Expected product/service", { exact: true }).fill("Go-live QA validation");
      await page.getByLabel("Estimated deal value", { exact: true }).fill("50000");
      await page.getByLabel("Expected timeline", { exact: true }).fill("QA run");
      await page.getByLabel("Opportunity description", { exact: true }).fill(`Created by ${runId}; safe to delete.`);
      await page.getByLabel("Notes", { exact: true }).fill(`Created by ${runId}; safe to delete.`);
      createdRecords.push({ table: "opportunity_registrations", field: "target_account_name", value: opportunityName });
      await page.getByRole("button", { name: /submit opportunity registration/i }).click();
      await expect(page.getByText(/Registration submitted|Opportunity published/i)).toBeVisible({ timeout: 20_000 });
    } finally {
      await cleanupCreatedRecords(createdRecords, cleanupIssues);
      await context.close();
    }

    expect(cleanupIssues.filter((issue) => issue.severity === "P1")).toEqual([]);
  });
});
