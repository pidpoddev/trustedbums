import { promises as fs } from "node:fs";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { getQaAccount, goToAuthedPath, hasExternalQaTarget, type QaAccount } from "./helpers/auth";

const MAX_SCREENSHOT_HEIGHT = 12_000;

type RoleKey = "ADMIN" | "CLIENT_ADMIN" | "CLIENT_FINANCE" | "BUM";
const allRoleKeys: RoleKey[] = ["ADMIN", "CLIENT_ADMIN", "CLIENT_FINANCE", "BUM"];

interface VisualRoute {
  path: string;
  heading: string | RegExp;
  name: string;
}

interface VisualInteraction extends VisualRoute {
  prepare: (page: Page, testInfo: TestInfo) => Promise<void>;
}

const routesByRole: Record<RoleKey, VisualRoute[]> = {
  ADMIN: [
    { path: "/admin", heading: "Admin Dashboard", name: "admin-dashboard" },
    { path: "/admin/clients", heading: "Clients", name: "admin-clients" },
    { path: "/admin/bums", heading: "Bums", name: "admin-bums" },
    { path: "/admin/opportunities", heading: "Opportunities", name: "admin-opportunities" },
    { path: "/admin/credits", heading: "Credits & Disputes", name: "admin-credits" },
    { path: "/admin/commission-plans", heading: "Commission Plans", name: "admin-commission-plans" },
    { path: "/admin/payments", heading: "Payments", name: "admin-payments" },
    { path: "/admin/payouts", heading: "Payouts", name: "admin-payouts" },
    { path: "/admin/live-conversations", heading: "Live Conversations", name: "admin-live-conversations" },
    { path: "/admin/emails", heading: "Emails", name: "admin-emails" },
    { path: "/admin/reports", heading: "Admin Reports", name: "admin-reports" },
    { path: "/admin/profile", heading: "Profile", name: "admin-profile" },
  ],
  CLIENT_ADMIN: [
    { path: "/client/dashboard", heading: /Welcome back/i, name: "client-admin-dashboard" },
    { path: "/client/targets", heading: "Target Accounts", name: "client-targets" },
    { path: "/client/opportunities/new", heading: "Opportunities", name: "client-register-opportunity" },
    { path: "/client/bum-directory", heading: "Bum Directory", name: "client-bum-directory" },
    { path: "/client/trainings", heading: "Training & Assets", name: "client-trainings" },
    { path: "/client/requests", heading: "Inbound Requests", name: "client-requests" },
    { path: "/client/payments", heading: "Customer Payments", name: "client-payments" },
    { path: "/client/exports", heading: "Exports", name: "client-exports" },
    { path: "/client/reports", heading: "Client Reports", name: "client-reports" },
    { path: "/client/profile", heading: "Company Profile", name: "client-profile" },
    { path: "/client/agreements", heading: "Agreements", name: "client-agreements" },
  ],
  CLIENT_FINANCE: [
    { path: "/client/dashboard", heading: /Welcome back/i, name: "client-finance-dashboard" },
    { path: "/client/payments", heading: "Customer Payments", name: "client-finance-payments" },
    { path: "/client/exports", heading: "Exports", name: "client-finance-exports" },
    { path: "/client/reports", heading: "Client Reports", name: "client-finance-reports" },
  ],
  BUM: [
    { path: "/bum/dashboard", heading: /Welcome back/i, name: "bum-dashboard" },
    { path: "/bum/prospects", heading: "Prospects", name: "bum-prospects" },
    { path: "/bum/reverse-opportunities", heading: "Reverse Opportunities", name: "bum-reverse-opportunities" },
    { path: "/bum/clients", heading: "Clients We Represent", name: "bum-clients" },
    { path: "/bum/contacts", heading: "Contacts", name: "bum-contacts" },
    { path: "/bum/opportunities", heading: "Opportunities", name: "bum-opportunities" },
    { path: "/bum/claims", heading: /^(My )?Claims$/, name: "bum-claims" },
    { path: "/bum/trainings", heading: "Training & Assets", name: "bum-trainings" },
    { path: "/bum/live-conversations", heading: "Live Conversations", name: "bum-live-conversations" },
    { path: "/bum/earnings", heading: "Earnings", name: "bum-earnings" },
    { path: "/bum/reports", heading: "Bum Reports", name: "bum-reports" },
    { path: "/bum/profile", heading: "Profile", name: "bum-profile" },
  ],
};

const interactionsByRole: Record<RoleKey, VisualInteraction[]> = {
  ADMIN: [
    {
      path: "/admin/opportunities",
      heading: "Opportunities",
      name: "admin-create-opportunity-open",
      prepare: async (page) => {
        await page.getByRole("button", { name: "Create opportunity" }).click();
        await expect(page.getByText("Select client")).toBeVisible();
        await expect(page.getByText("Target account", { exact: true })).toBeVisible();
      },
    },
    {
      path: "/admin",
      heading: "Admin Dashboard",
      name: "admin-global-search-results",
      prepare: async (page) => {
        const search = page.getByLabel("Search anything you can access");
        if (await search.isVisible().catch(() => false)) {
          await search.fill("reports");
          await expect(page.getByText("Reports", { exact: true }).first()).toBeVisible();
        } else {
          await page.getByRole("button", { name: "Open account menu" }).click();
          await expect(page.getByText("Sign out")).toBeVisible();
        }
      },
    },
  ],
  CLIENT_ADMIN: [
    {
      path: "/client/targets",
      heading: "Target Accounts",
      name: "client-target-add-form-open",
      prepare: async (page) => {
        await page.getByRole("button", { name: /Add target account/i }).first().click();
        await expect(page.getByLabel("Target account name")).toBeVisible();
        await expect(page.getByRole("button", { name: "Save target account" })).toBeVisible();
      },
    },
    {
      path: "/client/dashboard",
      heading: /Welcome back/i,
      name: "client-feedback-dialog-open",
      prepare: async (page) => {
        await page.getByRole("button", { name: "Submit feedback" }).click();
        await expect(page.getByRole("heading", { name: "Submit feedback" })).toBeVisible();
        await expect(page.getByLabel("Page")).toHaveValue(/\/client\/dashboard/);
      },
    },
  ],
  CLIENT_FINANCE: [
    {
      path: "/client/payments",
      heading: "Customer Payments",
      name: "client-finance-payment-search",
      prepare: async (page) => {
        await page.getByPlaceholder(/Search invoices, customers, or accounts/i).first().fill("visual-audit-empty");
        await expect(page.getByPlaceholder(/Search invoices, customers, or accounts/i).first()).toHaveValue("visual-audit-empty");
      },
    },
  ],
  BUM: [
    {
      path: "/bum/opportunities",
      heading: "Opportunities",
      name: "bum-opportunity-contact-picker-open",
      prepare: async (page, testInfo) => {
        const knowSomeoneButtons = page.getByRole("button", { name: /I know someone/i });
        if ((await knowSomeoneButtons.count()) > 0) {
          await knowSomeoneButtons.first().click();
          await expect(page.getByText("Choose from your contacts")).toBeVisible();
          await page.getByRole("button", { name: "Quick add" }).click();
          await expect(page.getByLabel("LinkedIn URL")).toBeVisible();
        } else {
          testInfo.annotations.push({ type: "visual-note", description: "No live marketplace items were available; captured filtered empty state instead." });
          await page.getByPlaceholder("Search opportunities...").fill("visual-audit-empty-state").catch(async () => {
            await page.getByPlaceholder("Search opportunities…").fill("visual-audit-empty-state");
          });
          await expect(page.getByText(/No live opportunities match your search|No live opportunities are available yet/i)).toBeVisible();
        }
      },
    },
    {
      path: "/bum/contacts",
      heading: "Contacts",
      name: "bum-contacts-search",
      prepare: async (page) => {
        await page.getByPlaceholder("Search contacts, companies, emails, or opportunity context").fill("visual-audit-empty");
        await expect(page.getByPlaceholder("Search contacts, companies, emails, or opportunity context")).toHaveValue("visual-audit-empty");
      },
    },
  ],
};

function getSelectedRoles() {
  const rawRoles = process.env.QA_VISUAL_ROLES?.trim();

  if (!rawRoles) {
    return allRoleKeys;
  }

  const selectedRoles = rawRoles
    .split(",")
    .map((role) => role.trim().toUpperCase())
    .filter(Boolean);
  const invalidRoles = selectedRoles.filter((role) => !allRoleKeys.includes(role as RoleKey));

  if (invalidRoles.length) {
    throw new Error("Invalid QA_VISUAL_ROLES value(s): " + invalidRoles.join(", ") + ". Allowed values: " + allRoleKeys.join(", ") + ".");
  }

  return selectedRoles as RoleKey[];
}

function shouldSkipRoleMismatch(error: unknown, role: RoleKey, auditedAnyRoute: boolean) {
  if (auditedAnyRoute || role !== "ADMIN" || !(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Unable to reach requested path") &&
    error.message.includes("Requested path: /admin") &&
    error.message.includes("/client/")
  );
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const documentWidth = document.documentElement.scrollWidth;
    const viewportWidth = document.documentElement.clientWidth;
    const bodyWidth = document.body.scrollWidth;

    return {
      bodyWidth,
      documentWidth,
      viewportWidth,
      overflowPixels: Math.max(documentWidth, bodyWidth) - viewportWidth,
    };
  });

  expect(overflow.overflowPixels, JSON.stringify(overflow)).toBeLessThanOrEqual(2);
}

async function expectReasonablePageHeight(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(height, `Full-page screenshot height ${height}px exceeds ${MAX_SCREENSHOT_HEIGHT}px. Add pagination, virtualization, or collapsible sections.`).toBeLessThanOrEqual(MAX_SCREENSHOT_HEIGHT);
}

async function expectNoObviousErrorPage(page: Page) {
  const text = await page.locator("body").innerText();

  expect(text).not.toMatch(/configuration needed|set a production clerk publishable key|404|page not found/i);
}

async function dismissConsentBanner(page: Page) {
  const rejectAll = page.getByRole("button", { name: "Reject all" });
  if (await rejectAll.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await rejectAll.click();
  }
}

async function captureVisualState(page: Page, testInfo: TestInfo, name: string, metadata: Record<string, unknown>) {
  await expectNoObviousErrorPage(page);
  await expectNoHorizontalOverflow(page);
  await expectReasonablePageHeight(page);

  const screenshotPath = testInfo.outputPath(`${testInfo.project.name}-${name}.png`);
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  const metrics = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    viewportHeight: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
  }));

  await fs.writeFile(
    testInfo.outputPath(`${testInfo.project.name}-${name}.json`),
    `${JSON.stringify({ ...metadata, screenshotPath, metrics }, null, 2)}\n`,
    "utf8",
  );
}

async function auditRoute(page: Page, account: QaAccount, role: RoleKey, route: VisualRoute, testInfo: TestInfo) {
  await goToAuthedPath(page, account, route.path);
  await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible({ timeout: 20_000 });
  await captureVisualState(page, testInfo, `${role.toLowerCase()}-${route.name}`, { role, route: route.path, name: route.name });
}

async function auditInteraction(page: Page, account: QaAccount, role: RoleKey, interaction: VisualInteraction, testInfo: TestInfo) {
  await goToAuthedPath(page, account, interaction.path);
  await expect(page.getByRole("heading", { name: interaction.heading }).first()).toBeVisible({ timeout: 20_000 });
  await interaction.prepare(page, testInfo);
  await captureVisualState(page, testInfo, `${role.toLowerCase()}-${interaction.name}`, {
    role,
    route: interaction.path,
    name: interaction.name,
    interaction: true,
  });
}

test.describe("public visual UI audit", () => {
  test.skip(!hasExternalQaTarget(), "Set QA_BASE_URL to run public visual UI audit.");

  test("public marketing and privacy states render cleanly", async ({ page }, testInfo) => {
    test.setTimeout(120_000);

    await page.goto("/");
    await dismissConsentBanner(page);
    await expect(page.getByRole("heading", { name: /Your buyer is ignoring strangers/i })).toBeVisible();
    await captureVisualState(page, testInfo, "public-home", { route: "/", name: "public-home" });

    await page.goto("/privacy-policy");
    await dismissConsentBanner(page);
    await expect(page.getByRole("heading", { name: /Privacy Policy/i })).toBeVisible();
    await captureVisualState(page, testInfo, "public-privacy-policy", { route: "/privacy-policy", name: "public-privacy-policy" });

    await page.goto("/?consent=reset");
    await expect(page.getByRole("heading", { name: "Privacy choices" })).toBeVisible();
    await page.getByRole("button", { name: "Customize" }).click();
    await expect(page.getByRole("switch", { name: "Analytics consent" })).toBeVisible();
    await captureVisualState(page, testInfo, "public-consent-settings", { route: "/?consent=reset", name: "public-consent-settings" });

    await page.goto("/");
    await dismissConsentBanner(page);
    await page.getByRole("button", { name: /^Sign up$/i }).click();
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await captureVisualState(page, testInfo, "public-signup-intent", { route: "/", name: "public-signup-intent" });

    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Accessibility settings" }).click();
    await expect(page.getByText("Enable low-vision mode")).toBeVisible();
    await captureVisualState(page, testInfo, "public-accessibility-menu", { route: "/", name: "public-accessibility-menu" });
  });
});

test.describe("authenticated visual UI audit", () => {
  test.skip(!hasExternalQaTarget(), "Set QA_BASE_URL to run authenticated visual UI audit.");

  for (const role of getSelectedRoles()) {
    const routes = routesByRole[role];
    const interactions = interactionsByRole[role];

    test(`${role.toLowerCase().replaceAll("_", " ")} portal pages render cleanly`, async ({ page }, testInfo) => {
      test.setTimeout(240_000);

      const account = getQaAccount(role);
      test.skip(!account, `Set QA_${role}_EMAIL.`);

      let auditedAnyRoute = false;

      for (const route of routes) {
        try {
          await auditRoute(page, account, role, route, testInfo);
          auditedAnyRoute = true;
        } catch (error) {
          test.skip(
            shouldSkipRoleMismatch(error, role, auditedAnyRoute),
            `QA_${role}_EMAIL authenticated into a different portal. Check the Clerk role metadata or set QA_VISUAL_ROLES to the roles configured for this environment.`,
          );

          throw error;
        }
      }
    });

    test(`${role.toLowerCase().replaceAll("_", " ")} interactive states render cleanly`, async ({ page }, testInfo) => {
      test.setTimeout(180_000);

      const account = getQaAccount(role);
      test.skip(!account, `Set QA_${role}_EMAIL.`);

      let auditedAnyRoute = false;

      for (const interaction of interactions) {
        try {
          await auditInteraction(page, account, role, interaction, testInfo);
          auditedAnyRoute = true;
        } catch (error) {
          test.skip(
            shouldSkipRoleMismatch(error, role, auditedAnyRoute),
            `QA_${role}_EMAIL authenticated into a different portal. Check the Clerk role metadata or set QA_VISUAL_ROLES to the roles configured for this environment.`,
          );

          throw error;
        }
      }
    });
  }
});
