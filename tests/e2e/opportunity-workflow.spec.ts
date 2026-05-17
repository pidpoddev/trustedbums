import { expect, test } from "@playwright/test";
import { getQaAccount, goToAuthedPath, hasExternalQaTarget } from "./helpers/auth";

test.describe("critical opportunity workflow", () => {
  test.skip(!hasExternalQaTarget(), "Set QA_BASE_URL to run critical workflow tests.");

  test("client submits an opportunity and admin can see it", async ({ browser }, testInfo) => {
    test.setTimeout(90_000);
    test.skip(testInfo.project.name !== "chromium", "Run this mutating workflow once on desktop Chromium.");

    const clientAdmin = getQaAccount("CLIENT_ADMIN");
    const admin = getQaAccount("ADMIN");
    test.skip(!clientAdmin, "Set QA_CLIENT_ADMIN_EMAIL.");
    test.skip(!admin, "Set QA_ADMIN_EMAIL.");

    const targetAccount = `QA Smoke ${new Date().toISOString()}`;
    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();

    await goToAuthedPath(clientPage, clientAdmin, "/client/opportunities/new");
    await expect(clientPage.getByRole("heading", { name: "Register Opportunity" })).toBeVisible();

    await clientPage.getByLabel("Target account name").fill(targetAccount);
    await clientPage.getByLabel("Business unit / department").fill("QA");
    await clientPage.getByLabel("Client contact").fill("QA Client");
    await clientPage.getByLabel("Trusted Bums contact").fill("QA Connector");
    await clientPage.getByLabel("Expected product/service").fill("QA smoke testing");
    await clientPage.getByLabel("Estimated deal value").fill("10000");
    await clientPage.getByLabel("Expected timeline").fill("QA validation");
    await clientPage.getByLabel("Opportunity description").fill("Automated QA smoke opportunity.");
    await clientPage.getByLabel("Notes").fill("Created by Playwright QA smoke testing.");
    await clientPage.getByRole("button", { name: /submit registration/i }).click();

    await expect(clientPage.getByText("Registration submitted")).toBeVisible({ timeout: 20_000 });
    await clientContext.close();

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await goToAuthedPath(adminPage, admin, "/admin/opportunities");
    await expect(adminPage.getByRole("heading", { name: "Opportunities" })).toBeVisible();
    await adminPage.getByRole("tab", { name: "Opportunity Registrations" }).click({ timeout: 15_000 });
    await expect(adminPage.getByText(targetAccount)).toBeVisible({ timeout: 20_000 });

    await adminContext.close();
  });
});
