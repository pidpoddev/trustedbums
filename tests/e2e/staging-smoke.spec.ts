import { expect, test } from "@playwright/test";
import { getQaAccount, goToAuthedPath } from "./helpers/auth";

test.describe("staging smoke", () => {
  test.skip(!process.env.QA_BASE_URL, "Set QA_BASE_URL to run staging smoke tests.");

  test("loads public pages and primary marketing affordances", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Your buyer is ignoring strangers/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Request an intro strategy/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Sign up$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Accessibility settings/i })).toBeVisible();

    await page.goto("/privacy-policy");
    await expect(page.getByRole("heading", { name: /Privacy Policy/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Privacy choices/i })).toBeVisible();
  });

  test("lets anonymous visitors manage privacy choices", async ({ page }) => {
    await page.goto("/?consent=reset");

    await expect(page.getByRole("heading", { name: "Privacy choices" })).toBeVisible();
    await page.getByRole("button", { name: "Customize" }).click();
    await expect(page.getByRole("switch", { name: "Analytics consent" })).toBeVisible();
    await expect(page.getByRole("switch", { name: /Marketing.*consent/i })).toBeVisible();

    await expect(page.getByRole("button", { name: "Save choices" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reject all" })).toBeVisible();

    await page.goto("/privacy-policy");
    await page.getByRole("button", { name: "Review privacy choices" }).click();
    await expect(page.getByRole("heading", { name: "Privacy choices" })).toBeVisible();
    await expect(page.getByRole("switch", { name: "Preferences consent" })).toBeVisible();
  });

  test("validates the signup intent dialog before Clerk handoff", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^Sign up$/i }).click();

    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Select Client Prospect or Bum Prospect.")).toBeVisible();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();

    await page.locator('label[for="signup-client"]').click();
    await page.locator("#signup-email").fill("qa-smoke@example.com");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Enter the company name.")).toBeVisible();

    await page.locator("#signup-company").fill("QA Smoke Co");
    await page.locator("#signup-email").fill("qa-smoke-updated@example.com");
    await expect(page.locator("#signup-company")).toHaveValue("QA Smoke Co");
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  test("shows inline contact form recovery without clearing entered details", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Request an intro strategy/i }).click();

    await page.locator("#contact-name").fill("Q");
    await page.locator("#contact-email").fill("not-an-email");
    await page.locator("#contact-message").fill("short");
    await page.getByRole("button", { name: /Send message/i }).click();

    await expect(page.locator("#contact-name-error")).toBeVisible();
    await expect(page.locator("#contact-email-error")).toBeVisible();
    await expect(page.locator("#contact-message-error")).toBeVisible();
    await expect(page.locator("#contact-name")).toHaveValue("Q");
    await expect(page.locator("#contact-email")).toHaveValue("not-an-email");
    await expect(page.locator("#contact-message")).toHaveValue("short");
  });

  test("redirects protected routes away from anonymous users", async ({ page }) => {
    const protectedRoutes = [
      "/admin",
      "/admin/opportunities",
      "/client/dashboard",
      "/client/targets",
      "/bum/dashboard",
      "/bum/opportunities",
      "/bum/contacts",
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page, route).toHaveURL(/\/login$/);
    }
  });

  test("admin portal shell exposes search, feedback, and account controls", async ({ page }) => {
    const admin = getQaAccount("ADMIN");
    test.skip(!admin, "Set QA_ADMIN_EMAIL.");

    await goToAuthedPath(page, admin, "/admin");

    await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();

    const globalSearch = page.getByLabel("Search anything you can access");
    if (await globalSearch.isVisible().catch(() => false)) {
      await globalSearch.fill("reports");
      await expect(page.getByText("Reports", { exact: true }).first()).toBeVisible();
    }

    await page.getByRole("button", { name: "Submit feedback" }).click();
    await expect(page.getByRole("heading", { name: "Submit feedback" })).toBeVisible();
    await expect(page.getByLabel("Page")).toHaveValue(/\/admin/);
    await page.getByRole("button", { name: "Cancel" }).click();

    await page.getByRole("button", { name: "Open account menu" }).click();
    await expect(page.getByText(/Profile settings|User Profile/)).toBeVisible();
    await expect(page.getByText("Sign out")).toBeVisible();
  });

  test("bum opportunity contact picker can be opened without creating records", async ({ page }) => {
    const bum = getQaAccount("BUM");
    test.skip(!bum, "Set QA_BUM_EMAIL.");

    await goToAuthedPath(page, bum, "/bum/opportunities");
    await expect(page.getByRole("heading", { name: "Opportunities" })).toBeVisible();

    const claimIntroButtons = page.getByRole("button", { name: /Claim intro/i });
    test.skip((await claimIntroButtons.count()) === 0, "No live opportunity or target account is available for the contact picker smoke check.");

    await claimIntroButtons.first().click();
    await expect(page.getByText("Choose from your contacts")).toBeVisible();
    await expect(page.getByPlaceholder("Search contacts, companies, emails, or context")).toBeVisible();

    await page.getByRole("button", { name: "Quick add" }).click();
    await expect(page.getByRole("textbox", { name: "Name", exact: true })).toBeVisible();
    await expect(page.getByLabel("LinkedIn URL")).toBeVisible();
    await expect(page.getByRole("button", { name: /Add and select contact/i })).toBeDisabled();
  });

  test("client target add form opens without saving", async ({ page }) => {
    const clientAdmin = getQaAccount("CLIENT_ADMIN");
    test.skip(!clientAdmin, "Set QA_CLIENT_ADMIN_EMAIL.");

    await goToAuthedPath(page, clientAdmin, "/client/targets");
    await expect(page.getByRole("heading", { name: "Target Accounts" })).toBeVisible();

    await page.getByRole("button", { name: /Add target account/i }).first().click();
    await expect(page.getByLabel("Target account name")).toBeVisible();
    await expect(page.getByLabel("Expected product/service")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save target account" })).toBeVisible();
  });
});
