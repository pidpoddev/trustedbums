import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { getQaAccount, goToAuthedPath, hasExternalQaTarget, type QaAccount } from "./helpers/auth";
import {
  cleanupCreatedRecords,
  createWorkflowQaRunId,
  hasQaCleanupCredential,
  installWorkflowQaErrorGate,
  isWorkflowMutationEnabled,
  type DeepQaIssue,
  type QaCreatedRecord,
} from "./helpers/deepQa";

async function publishQaOpportunity(page: Page, account: QaAccount, runId: string, targetAccount: string) {
  await goToAuthedPath(page, account, "/client/opportunities/new");
  await expect(page.getByRole("heading", { name: /Opportunities|New opportunity/i }).first()).toBeVisible({ timeout: 20_000 });

  await page.getByLabel("Customer account name", { exact: true }).fill(targetAccount);
  await page.getByLabel("Business unit / department", { exact: true }).fill("QA workflow");
  await page.getByLabel("Your internal contact", { exact: true }).fill("QA Client Member");
  await page.getByLabel("Trusted Bums owner", { exact: true }).fill("QA Owner");
  await page.getByLabel("Expected product/service", { exact: true }).fill("Workflow QA validation");
  await page.getByLabel("Estimated deal value", { exact: true }).fill("25000");
  await page.getByLabel("Expected timeline", { exact: true }).fill("QA run only");
  await page.getByLabel("Opportunity description", { exact: true }).fill(`Created by ${runId}; safe to delete; do not use for business.`);
  await page.getByLabel("Notes", { exact: true }).fill(`Created by ${runId}; safe to delete after workflow QA.`);

  const createResponsePromise = page.waitForResponse(
    (response) => response.url().includes("/rest/v1/opportunity_registrations") && response.request().method() === "POST",
    { timeout: 20_000 },
  );
  await page.getByRole("button", { name: /publish opportunity to bums/i }).click();
  const createResponse = await createResponsePromise;
  expect(createResponse.ok(), await createResponse.text().catch(() => `POST returned ${createResponse.status()}`)).toBe(true);

  await expect(page.locator("#main-content").getByText("Opportunity published to Bums")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(targetAccount).first()).toBeVisible({ timeout: 20_000 });
}

async function expectAdminCanSeeOpportunity(page: Page, account: QaAccount, targetAccount: string) {
  await goToAuthedPath(page, account, "/admin/opportunities");

  if (await page.getByRole("heading", { name: "Opportunities" }).isVisible({ timeout: 5_000 }).catch(() => false)) {
    await page.getByRole("tab", { name: "Opportunity Registrations" }).click({ timeout: 15_000 });
  } else {
    await expect(page.getByText("Opportunity Registrations").first()).toBeVisible({ timeout: 15_000 });
  }

  await expect(page.getByText(targetAccount).first()).toBeVisible({ timeout: 20_000 });
}

async function expectBumCanSeeOpportunity(page: Page, account: QaAccount, targetAccount: string) {
  await goToAuthedPath(page, account, "/bum/opportunities");
  await expect(page.getByRole("heading", { name: "Opportunities" }).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(targetAccount).first()).toBeVisible({ timeout: 20_000 });
}

async function deleteUnclaimedOpportunity(page: Page, account: QaAccount, targetAccount: string) {
  await goToAuthedPath(page, account, "/client/opportunities");
  await expect(page.getByRole("heading", { name: /Opportunities|New opportunity/i }).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(targetAccount).first()).toBeVisible({ timeout: 20_000 });

  const opportunityRow = page.getByRole("row").filter({ hasText: targetAccount }).first();
  await expect(opportunityRow).toBeVisible({ timeout: 20_000 });

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(targetAccount);
    await dialog.accept();
  });

  const deleteResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/rest/v1/opportunity_registrations") &&
      response.url().includes("select=id") &&
      response.request().method() === "DELETE",
    { timeout: 20_000 },
  );
  await opportunityRow.getByRole("button", { name: /delete/i }).click();
  const deleteResponse = await deleteResponsePromise;
  const deletePayload = await deleteResponse.text().catch(() => "");
  expect(deleteResponse.ok(), deletePayload || `DELETE returned ${deleteResponse.status()}`).toBe(true);
  expect(deletePayload, "Client delete must return the deleted QA opportunity row instead of silently deleting zero rows.").toContain(targetAccount);

  await expect(page.getByText(targetAccount).first()).toBeHidden({ timeout: 20_000 });
  await page.reload();
  await expect(page.getByText(targetAccount).first()).toBeHidden({ timeout: 20_000 });
}

function requireQaAccount(prefix: string) {
  const account = getQaAccount(prefix);
  expect(account, `Set QA_${prefix}_EMAIL before running workflow QA mutation.`).toBeTruthy();
  return account!;
}

test.describe("role workflow QA matrix", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(!hasExternalQaTarget(), "Set QA_BASE_URL to run role workflow QA against the deployed QA target.");

  test("Client Member creates, Admin and Bum can see, and Client Admin deletes an unclaimed QA opportunity", async ({ browser }, testInfo) => {
    test.setTimeout(180_000);
    test.skip(testInfo.project.name !== "chromium", "Run mutating role workflow QA once on desktop Chromium.");
    test.skip(!isWorkflowMutationEnabled(), "Set QA_WORKFLOW_MUTATION=1 to create and clean up role workflow QA data.");
    expect(hasQaCleanupCredential(), "Set QA_SUPABASE_SERVICE_ROLE_KEY to a Supabase service_role JWT before workflow QA mutation.").toBe(true);

    const clientMember = requireQaAccount("CLIENT_MEMBER");
    const clientAdmin = requireQaAccount("CLIENT_ADMIN");
    const admin = requireQaAccount("ADMIN");
    const bum = requireQaAccount("BUM");

    const runId = createWorkflowQaRunId();
    const targetAccount = `QA DO NOT USE ${runId} opportunity`;
    const issues: DeepQaIssue[] = [];
    const createdRecords: QaCreatedRecord[] = [
      { table: "opportunity_registrations", field: "target_account_name", value: targetAccount },
    ];
    let clientMemberContext: BrowserContext | undefined;
    let adminContext: BrowserContext | undefined;
    let bumContext: BrowserContext | undefined;
    let clientAdminContext: BrowserContext | undefined;

    try {
      clientMemberContext = await browser.newContext();
      const clientMemberPage = await clientMemberContext.newPage();
      installWorkflowQaErrorGate(clientMemberPage, issues, "Client Member");
      await publishQaOpportunity(clientMemberPage, clientMember, runId, targetAccount);
      await clientMemberContext.close();
      clientMemberContext = undefined;

      adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      installWorkflowQaErrorGate(adminPage, issues, "Admin");
      await expectAdminCanSeeOpportunity(adminPage, admin, targetAccount);

      bumContext = await browser.newContext();
      const bumPage = await bumContext.newPage();
      installWorkflowQaErrorGate(bumPage, issues, "Bum");
      await expectBumCanSeeOpportunity(bumPage, bum, targetAccount);

      clientAdminContext = await browser.newContext();
      const clientAdminPage = await clientAdminContext.newPage();
      installWorkflowQaErrorGate(clientAdminPage, issues, "Client Admin");
      await deleteUnclaimedOpportunity(clientAdminPage, clientAdmin, targetAccount);
    } finally {
      await clientMemberContext?.close();
      await clientAdminContext?.close();
      await bumContext?.close();
      await adminContext?.close();
      await cleanupCreatedRecords(createdRecords, issues);
    }

    expect(issues.filter((issue) => issue.severity === "P1" || issue.severity === "P0"), "Workflow QA found red/RLS/cleanup blockers.").toEqual([]);
  });
});
