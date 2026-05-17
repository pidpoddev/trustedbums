import { expect, test } from "@playwright/test";
import { getQaAccount, goToAuthedPath, goToAuthedPathAllowingRedirect, hasExternalQaTarget } from "./helpers/auth";

test.describe("authenticated role smoke", () => {
  test.skip(!hasExternalQaTarget(), "Set QA_BASE_URL to run authenticated role smoke tests.");

  test("admin reaches the admin dashboard", async ({ page }) => {
    const admin = getQaAccount("ADMIN");
    test.skip(!admin, "Set QA_ADMIN_EMAIL.");

    await goToAuthedPath(page, admin, "/dashboard");

    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
  });

  test("client admin reaches the client dashboard and can open target workflows", async ({ page }) => {
    const clientAdmin = getQaAccount("CLIENT_ADMIN");
    test.skip(!clientAdmin, "Set QA_CLIENT_ADMIN_EMAIL.");

    await goToAuthedPath(page, clientAdmin, "/dashboard");

    await expect(page).toHaveURL(/\/client\/dashboard\/?$/);
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();

    await page.goto("/client/targets");
    await expect(page.getByRole("heading", { name: "Target Accounts" })).toBeVisible();
  });

  test("client finance can open payments and exports", async ({ page, isMobile }) => {
    const finance = getQaAccount("CLIENT_FINANCE");
    test.skip(!finance, "Set QA_CLIENT_FINANCE_EMAIL.");

    await goToAuthedPath(page, finance, "/client/payments");
    await expect(page.getByRole("heading", { name: "Customer Payments", exact: true })).toBeVisible();

    if (!isMobile) {
      await goToAuthedPath(page, finance, "/client/exports");
      await expect(page.getByRole("heading", { name: "Exports & Integrations" })).toBeVisible();
    }
  });

  test("client member is redirected away from finance-only pages", async ({ page }) => {
    const member = getQaAccount("CLIENT_MEMBER");
    test.skip(!member, "Set QA_CLIENT_MEMBER_EMAIL.");

    await goToAuthedPathAllowingRedirect(page, member, "/client/payments", /\/client\/dashboard$/);

    await expect(page).toHaveURL(/\/client\/dashboard\/?$/);
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  });

  test("bum reaches the bum dashboard", async ({ page }) => {
    const bum = getQaAccount("BUM");
    test.skip(!bum, "Set QA_BUM_EMAIL.");

    await goToAuthedPath(page, bum, "/dashboard");

    await expect(page).toHaveURL(/\/bum\/dashboard\/?$/);
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
    await expect(page.getByText("Profile completeness")).toBeVisible();
  });
});
