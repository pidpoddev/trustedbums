import { expect, test, type Locator, type Page } from "@playwright/test";
import { getQaAccount, goToAuthedPath, hasExternalQaTarget } from "./helpers/auth";

type RoleKey = "ADMIN" | "CLIENT_ADMIN" | "CLIENT_FINANCE" | "BUM";

interface RouteAudit {
  path: string;
  heading: string | RegExp;
  navName?: string | RegExp;
}

interface RoleAuditConfig {
  accountPrefix: RoleKey;
  homePath: string;
  profilePath: RegExp;
  searchQuery?: string;
  searchDestination?: RegExp;
  forbiddenSearchResults?: RegExp[];
  routes: RouteAudit[];
}

const roleAudits: RoleAuditConfig[] = [
  {
    accountPrefix: "ADMIN",
    homePath: "/admin",
    profilePath: /\/admin\/profile\/?$/,
    searchQuery: "reports",
    searchDestination: /\/admin\/reports\/?$/,
    routes: [
      { path: "/admin", heading: "Admin Dashboard", navName: "Dashboard" },
      { path: "/admin/clients", heading: "Clients", navName: "Clients" },
      { path: "/admin/bums", heading: "Bums", navName: "Bums" },
      { path: "/admin/opportunities", heading: "Opportunities", navName: "Opportunities" },
      { path: "/admin/credits", heading: "Credits & Disputes", navName: "Credits" },
      { path: "/admin/commission-plans", heading: "Commission Plans", navName: "Commission Plans" },
      { path: "/admin/payments", heading: "Payments", navName: "Payments" },
      { path: "/admin/payouts", heading: "Payouts", navName: "Payouts" },
      { path: "/admin/live-conversations", heading: "Live Conversations", navName: "Live Conversations" },
      { path: "/admin/emails", heading: "Emails", navName: "Emails" },
      { path: "/admin/training-assets", heading: "Training & Assets", navName: "Training & Assets" },
      { path: "/admin/reports", heading: "Admin Reports", navName: "Reports" },
      { path: "/admin/troubleshooting", heading: "Troubleshooting Tools", navName: "Tools" },
      { path: "/admin/legal", heading: "Legal", navName: "Legal" },
      { path: "/admin/profile", heading: "Profile" },
    ],
  },
  {
    accountPrefix: "CLIENT_ADMIN",
    homePath: "/client/dashboard",
    profilePath: /\/client\/user-profile\/?$/,
    searchQuery: "targets",
    searchDestination: /\/client\/targets\/?$/,
    routes: [
      { path: "/client/dashboard", heading: /Welcome back/i, navName: "Dashboard" },
      { path: "/client/targets", heading: "Target Accounts", navName: "Target Accounts" },
      { path: "/client/opportunities", heading: "Opportunities", navName: "Opportunities" },
      { path: "/client/bum-directory", heading: "Bum Directory", navName: "Bums" },
      { path: "/client/trainings", heading: "Training & Assets", navName: "Training & Assets" },
      { path: "/client/requests", heading: "Inbound Requests", navName: "Requests" },
      { path: "/client/payments", heading: "Customer Payments", navName: "Payments" },
      { path: "/client/exports", heading: "Exports", navName: "Exports" },
      { path: "/client/reports", heading: "Client Reports", navName: "Reports" },
      { path: "/client/team", heading: "Team Management", navName: "Team Management" },
      { path: "/client/profile", heading: "Company Profile", navName: "Company Profile" },
      { path: "/client/user-profile", heading: "User Profile", navName: "User Profile" },
      { path: "/client/agreements", heading: "Agreements", navName: "Agreements" },
    ],
  },
  {
    accountPrefix: "CLIENT_FINANCE",
    homePath: "/client/dashboard",
    profilePath: /\/client\/user-profile\/?$/,
    searchQuery: "payments",
    searchDestination: /\/client\/payments\/?$/,
    forbiddenSearchResults: [/Target Accounts/i, /Team Management/i, /Bum Directory/i],
    routes: [
      { path: "/client/dashboard", heading: /Welcome back/i, navName: "Dashboard" },
      { path: "/client/payments", heading: "Customer Payments", navName: "Payments" },
      { path: "/client/exports", heading: "Exports", navName: "Exports" },
      { path: "/client/reports", heading: "Client Reports", navName: "Reports" },
      { path: "/client/profile", heading: "Company Profile", navName: "Company Profile" },
      { path: "/client/user-profile", heading: "User Profile", navName: "User Profile" },
      { path: "/client/agreements", heading: "Agreements", navName: "Agreements" },
    ],
  },
  {
    accountPrefix: "BUM",
    homePath: "/bum/dashboard",
    profilePath: /\/bum\/profile\/?$/,
    searchQuery: "contacts",
    searchDestination: /\/bum\/contacts\/?$/,
    routes: [
      { path: "/bum/dashboard", heading: /Welcome back/i, navName: "Dashboard" },
      { path: "/bum/prospects", heading: "Prospects", navName: "Prospects" },
      { path: "/bum/reverse-opportunities", heading: "Reverse Opportunities", navName: "Reverse Opportunities" },
      { path: "/bum/clients", heading: "Clients We Represent", navName: "Clients" },
      { path: "/bum/contacts", heading: "Contacts", navName: "Contacts" },
      { path: "/bum/opportunities", heading: "Opportunities", navName: "Opportunities" },
      { path: "/bum/claims", heading: "My Claims", navName: "My Claims" },
      { path: "/bum/live-conversations", heading: "Live Conversations", navName: "Live Conversations" },
      { path: "/bum/trainings", heading: "Training & Assets", navName: "Training & Assets" },
      { path: "/bum/earnings", heading: "Earnings", navName: "Earnings" },
      { path: "/bum/reports", heading: "Bum Reports", navName: "Reports" },
      { path: "/bum/profile", heading: "Profile" },
    ],
  },
];

async function expectHealthyPortalPage(page: Page) {
  await page.waitForLoadState("domcontentloaded").catch(() => undefined);
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
  await expect(page).not.toHaveURL(/\/login\/?$/);

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(/configuration needed|set a production clerk publishable key|page not found|application error|something went wrong/i);

  await expect(page.getByRole("button", { name: "Submit feedback" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Accessibility settings" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open account menu" })).toBeVisible();
}

async function visibleButtonName(button: Locator) {
  return button.evaluate((element) => {
    const ariaLabel = element.getAttribute("aria-label")?.trim();
    const title = element.getAttribute("title")?.trim();
    const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();

    if (element instanceof HTMLInputElement && element.type === "file") {
      const labelText = Array.from(element.labels ?? [])
        .map((label) => (label.textContent ?? "").replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .join(" ");

      return ariaLabel || labelText || title || element.name || element.id || "";
    }

    return ariaLabel || text || title || "";
  });
}

async function expectVisibleButtonsHaveNames(page: Page) {
  const buttons = page.getByRole("button");
  const count = await buttons.count();
  const unnamedButtons: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    if (!(await button.isVisible().catch(() => false))) {
      continue;
    }

    const name = await visibleButtonName(button);
    if (!name) {
      const box = await button.boundingBox().catch(() => null);
      unnamedButtons.push(`button ${index + 1}${box ? ` at ${Math.round(box.x)},${Math.round(box.y)}` : ""}`);
    }
  }

  expect(unnamedButtons, "Visible buttons must have text, aria-label, title, or sr-only text.").toEqual([]);
}

async function expectNoBrokenInternalLinks(page: Page) {
  const badLinks = await page.locator("a[href]").evaluateAll((links) =>
    links
      .map((link) => {
        const href = link.getAttribute("href") ?? "";
        const text = (link.textContent ?? link.getAttribute("aria-label") ?? "").replace(/\s+/g, " ").trim();
        return { href, text };
      })
      .filter(({ href }) => href.startsWith("#") || href === ""),
  );

  expect(badLinks, "Visible navigation links should not point to empty anchors.").toEqual([]);
}

async function openAndCloseFeedback(page: Page) {
  await page.getByRole("button", { name: "Submit feedback" }).click();
  await expect(page.getByRole("heading", { name: "Submit feedback" })).toBeVisible();
  await expect(page.getByLabel("Page")).toHaveValue(/\//);
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("heading", { name: "Submit feedback" })).toBeHidden();
}

async function openAndCloseAccessibility(page: Page) {
  await page.getByRole("button", { name: "Accessibility settings" }).click();
  await expect(page.getByText("Enable low-vision mode")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Enable low-vision mode")).toBeHidden();
}

async function openAccountProfile(page: Page, config: RoleAuditConfig) {
  await page.getByRole("button", { name: "Open account menu" }).click();
  await expect(page.getByText("Sign out")).toBeVisible();

  const profileLink = page.getByRole("menuitem", { name: /Profile settings|User Profile/ });
  await profileLink.click();
  await expect(page).toHaveURL(config.profilePath);
  await expectHealthyPortalPage(page);
  await page.goto(config.homePath);
  await expectHealthyPortalPage(page);
}

async function exerciseSidebar(page: Page, config: RoleAuditConfig) {
  const trigger = page.getByRole("button", { name: "Toggle Sidebar" }).first();
  if (!(await trigger.isVisible().catch(() => false))) {
    return;
  }

  await trigger.click();
  await page.waitForTimeout(250);

  const navTarget = config.routes.find((route) => route.navName)?.navName;
  if (navTarget) {
    await expect(page.getByRole("link", { name: navTarget }).first()).toBeVisible({ timeout: 5_000 }).catch(() => undefined);
  }

  await trigger.click().catch(async () => {
    await page.keyboard.press("Escape");
  });
}

async function exerciseGlobalSearch(page: Page, config: RoleAuditConfig) {
  if (!config.searchQuery || !config.searchDestination) {
    return;
  }

  await page.goto(config.homePath);
  await expectHealthyPortalPage(page);
  const search = page.getByLabel("Search anything you can access");
  if (!(await search.isVisible().catch(() => false))) {
    return;
  }

  await search.fill(config.searchQuery);
  await expect(search).toHaveValue(config.searchQuery);

  for (const forbiddenResult of config.forbiddenSearchResults ?? []) {
    await expect(page.getByText(forbiddenResult)).toHaveCount(0);
  }

  await search.press("Enter");
  await expect(page).toHaveURL(config.searchDestination);
  await expectHealthyPortalPage(page);
}

async function exerciseSearchFields(page: Page) {
  const searchInputs = page.locator('input[placeholder*="Search"], input[aria-label*="Search"]');
  const count = Math.min(await searchInputs.count(), 3);

  for (let index = 0; index < count; index += 1) {
    const input = searchInputs.nth(index);
    if (!(await input.isVisible().catch(() => false)) || !(await input.isEnabled().catch(() => false))) {
      continue;
    }

    await input.fill("qa-audit-empty");
    await expect(input).toHaveValue("qa-audit-empty");
  }
}

test.describe("portal interaction audit", () => {
  test.skip(!hasExternalQaTarget(), "Set QA_BASE_URL to run the portal interaction audit.");

  for (const config of roleAudits) {
    test(`${config.accountPrefix.toLowerCase().replaceAll("_", " ")} navigation and controls do not strand users`, async ({ page, isMobile }) => {
      test.setTimeout(300_000);
      test.skip(isMobile, "Desktop-only deep interaction audit; visual UI audit covers mobile layouts.");

      const account = getQaAccount(config.accountPrefix);
      test.skip(!account, `Set QA_${config.accountPrefix}_EMAIL.`);

      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      await goToAuthedPath(page, account, config.homePath);
      await expectHealthyPortalPage(page);
      await openAndCloseFeedback(page);
      await openAndCloseAccessibility(page);
      await openAccountProfile(page, config);
      await exerciseSidebar(page, config);
      await exerciseGlobalSearch(page, config);

      for (const route of config.routes) {
        await page.goto(route.path);
        await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible({ timeout: 20_000 });
        await expectHealthyPortalPage(page);
        await expectVisibleButtonsHaveNames(page);
        await expectNoBrokenInternalLinks(page);
        await exerciseSearchFields(page);
      }

      expect(pageErrors, "Portal pages should not throw uncaught browser errors.").toEqual([]);
    });
  }
});
