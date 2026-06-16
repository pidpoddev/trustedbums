import { expect, test } from "@playwright/test";
import { getQaAccount, goToAuthedPath, hasExternalQaTarget } from "./helpers/auth";
import { cleanupCreatedRecords, hasQaCleanupCredential, type QaCreatedRecord } from "./helpers/deepQa";

test.describe("Bum contacts mutation", () => {
  test.skip(!hasExternalQaTarget(), "Set QA_BASE_URL to run Bum contacts mutation proof.");

  test("creates, observes, and cleans up a manual Bum contact", async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    test.skip(testInfo.project.name !== "chromium", "Run this mutating workflow once on desktop Chromium.");

    const bum = getQaAccount("BUM");
    test.skip(!bum, "Set QA_BUM_EMAIL.");
    test.skip(
      !hasQaCleanupCredential() && process.env.QA_ALLOW_EXTERNAL_CLEANUP !== "1",
      "Set QA_SUPABASE_SERVICE_ROLE_KEY or QA_ALLOW_EXTERNAL_CLEANUP=1 with an external cleanup plan.",
    );

    const suffix = Date.now();
    const contactName = `QA Manual Contact ${suffix}`;
    const contactEmail = `qa.manual.${suffix}@example.invalid`;
    const contactCompany = `QA Manual Company ${suffix}`;
    const createdRecords: QaCreatedRecord[] = [
      { table: "bum_contacts", field: "email", value: contactEmail },
    ];
    const cleanupIssues: Parameters<typeof cleanupCreatedRecords>[1] = [];

    try {
      await goToAuthedPath(page, bum, "/bum/contacts");
      await expect(page.getByRole("heading", { name: "Contacts" })).toBeVisible();

      await page.getByRole("button", { name: /add contact/i }).first().click();
      const addContactDialog = page.getByRole("dialog", { name: "Add contact" });
      await expect(addContactDialog).toBeVisible();

      await addContactDialog.getByLabel("Name").fill(contactName);
      await addContactDialog.getByLabel("Company").fill(contactCompany);
      await addContactDialog.getByLabel("Title").fill("QA VP Operations");
      await addContactDialog.getByLabel("Email").fill(contactEmail);
      await addContactDialog.getByLabel("Phone").fill("(555) 010-8600");
      await addContactDialog.getByLabel("LinkedIn").fill("https://www.linkedin.com/in/qa-manual-contact");
      await addContactDialog.getByLabel("Notes").fill("qa_authorization manual contact mutation proof");

      const createResponsePromise = page.waitForResponse(
        (response) => {
          if (!response.url().includes("/functions/v1/portal-contacts") || response.request().method() !== "POST") return false;
          const postData = response.request().postData();
          if (!postData) return false;
          try {
            return (JSON.parse(postData) as { action?: string }).action === "create";
          } catch {
            return false;
          }
        },
      );
      await addContactDialog.getByRole("button", { name: /^add contact$/i }).click();
      const createResponse = await createResponsePromise;
      const createPayload = await createResponse.text().catch(() => "");
      expect(createResponse.ok(), createPayload || `portal-contacts returned ${createResponse.status()}`).toBe(true);

      await expect(page.getByRole("dialog", { name: "Add contact" })).toBeHidden({ timeout: 15_000 });
      await expect(page.getByText(contactName)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(contactCompany)).toBeVisible();
      await expect(page.getByText(contactEmail)).toBeVisible();
    } finally {
      await cleanupCreatedRecords(createdRecords, cleanupIssues);
    }

    expect(cleanupIssues.filter((issue) => issue.severity === "P1")).toEqual([]);
  });
});
