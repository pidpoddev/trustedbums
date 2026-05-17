import { expect, test } from "@playwright/test";

test.describe("configuration smoke", () => {
  test.skip(Boolean(process.env.QA_BASE_URL), "Configuration smoke is only for local builds without Clerk env vars.");

  test("shows a clear configuration state when Clerk is not configured", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Trusted Bums configuration needed" })).toBeVisible();
    await expect(page.getByText("Set a production Clerk publishable key")).toBeVisible();
  });
});
