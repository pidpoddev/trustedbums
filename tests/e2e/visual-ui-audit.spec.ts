import { promises as fs } from "node:fs";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { getQaAccount, goToAuthedPath, hasExternalQaTarget, type QaAccount } from "./helpers/auth";

const MAX_SCREENSHOT_HEIGHT = 12_000;

type RoleKey = "ADMIN" | "CLIENT_ADMIN" | "CLIENT_FINANCE" | "BUM";

interface VisualRoute {
  path: string;
  heading: string | RegExp;
  name: string;
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
    { path: "/client/opportunities/new", heading: "Register Opportunity", name: "client-register-opportunity" },
    { path: "/client/bum-directory", heading: "Bum Directory", name: "client-bum-directory" },
    { path: "/client/trainings", heading: "Trainings & Assets", name: "client-trainings" },
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
    { path: "/bum/opportunities", heading: "Opportunities", name: "bum-opportunities" },
    { path: "/bum/claims", heading: /^(My )?Claims$/, name: "bum-claims" },
    { path: "/bum/trainings", heading: "Trainings", name: "bum-trainings" },
    { path: "/bum/live-conversations", heading: "Live Conversations", name: "bum-live-conversations" },
    { path: "/bum/earnings", heading: "Earnings", name: "bum-earnings" },
    { path: "/bum/reports", heading: "Bum Reports", name: "bum-reports" },
    { path: "/bum/profile", heading: "Profile", name: "bum-profile" },
  ],
};

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

async function auditRoute(page: Page, account: QaAccount, role: RoleKey, route: VisualRoute, testInfo: TestInfo) {
  await goToAuthedPath(page, account, route.path);
  await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible({ timeout: 20_000 });
  await expectNoObviousErrorPage(page);
  await expectNoHorizontalOverflow(page);
  await expectReasonablePageHeight(page);
  const screenshotPath = testInfo.outputPath(`${testInfo.project.name}-${role.toLowerCase()}-${route.name}.png`);
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
    testInfo.outputPath(`${testInfo.project.name}-${role.toLowerCase()}-${route.name}.json`),
    `${JSON.stringify({ role, route: route.path, name: route.name, screenshotPath, metrics }, null, 2)}\n`,
    "utf8",
  );
}

test.describe("authenticated visual UI audit", () => {
  test.skip(!hasExternalQaTarget(), "Set QA_BASE_URL to run authenticated visual UI audit.");

  for (const [role, routes] of Object.entries(routesByRole) as Array<[RoleKey, VisualRoute[]]>) {
    test(`${role.toLowerCase().replaceAll("_", " ")} portal pages render cleanly`, async ({ page }, testInfo) => {
      test.setTimeout(240_000);

      const account = getQaAccount(role);
      test.skip(!account, `Set QA_${role}_EMAIL.`);

      for (const route of routes) {
        await auditRoute(page, account, role, route, testInfo);
      }
    });
  }
});
