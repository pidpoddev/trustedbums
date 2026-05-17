import { expect, test } from "@playwright/test";

test.describe("staging smoke", () => {
  test.skip(!process.env.QA_BASE_URL, "Set QA_BASE_URL to run staging smoke tests.");

  test("loads public pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /We Open Doors/i })).toBeVisible();

    await page.goto("/privacy-policy");
    await expect(page.getByRole("heading", { name: /Privacy Policy/i })).toBeVisible();
  });

  test("redirects protected routes away from anonymous users", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/client/dashboard");
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/bum/dashboard");
    await expect(page).toHaveURL(/\/$/);
  });
});
