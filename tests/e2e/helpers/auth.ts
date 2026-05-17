import { expect, type Frame, type Locator, type Page } from "@playwright/test";

export interface QaAccount {
  email: string;
  password: string;
}

export function getQaAccount(prefix: string): QaAccount | null {
  const email = process.env[`QA_${prefix}_EMAIL`];
  const password = process.env[`QA_${prefix}_PASSWORD`];

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

export function hasExternalQaTarget() {
  return Boolean(process.env.QA_BASE_URL);
}

const identifierSelectors = [
  'input[name="identifier"]',
  'input[name="emailAddress"]',
  'input[id*="identifier" i]',
  'input[autocomplete="username"]',
  'input[autocomplete="email"]',
  'input[type="email"]',
  'input[type="text"]',
];

const passwordSelectors = ['input[name="password"]', 'input[type="password"]'];

async function findVisibleLocator(locators: Locator[], timeout = 1_000) {
  for (const locatorCandidate of locators) {
    const locator = locatorCandidate.first();

    if (await locator.isVisible({ timeout: 1_000 }).catch(() => false)) {
      return locator;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, timeout));
  return null;
}

function pageIdentifierLocators(page: Page) {
  return [
    page.getByLabel(/email address|email|username/i),
    page.getByPlaceholder(/email address|email|username/i),
    ...identifierSelectors.map((selector) => page.locator(selector)),
  ];
}

function pagePasswordLocators(page: Page) {
  return [
    page.getByLabel(/password/i),
    page.getByPlaceholder(/password/i),
    ...passwordSelectors.map((selector) => page.locator(selector)),
  ];
}

function frameIdentifierLocators(frame: Frame) {
  return [
    frame.getByLabel(/email address|email|username/i),
    frame.getByPlaceholder(/email address|email|username/i),
    ...identifierSelectors.map((selector) => frame.locator(selector)),
  ];
}

function framePasswordLocators(frame: Frame) {
  return [
    frame.getByLabel(/password/i),
    frame.getByPlaceholder(/password/i),
    ...passwordSelectors.map((selector) => frame.locator(selector)),
  ];
}

async function findClerkInput(page: Page, kind: "identifier" | "password") {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    const pageLocator = await findVisibleLocator(
      kind === "identifier" ? pageIdentifierLocators(page) : pagePasswordLocators(page),
      250,
    );

    if (pageLocator) {
      return pageLocator;
    }

    for (const frame of page.frames()) {
      const frameLocator = await findVisibleLocator(
        kind === "identifier" ? frameIdentifierLocators(frame) : framePasswordLocators(frame),
        0,
      );

      if (frameLocator) {
        return frameLocator;
      }
    }
  }

  throw new Error(`Unable to find a visible Clerk ${kind} input.`);
}

async function continueClerkForm(page: Page) {
  const button = await findVisibleLocator([
    page.locator(".cl-formButtonPrimary"),
    page.locator('[data-localization-key="formButtonPrimary"]'),
    page.locator('form button[type="submit"]'),
    page.locator('[role="dialog"] button[type="submit"]'),
    page.locator('[role="dialog"]').getByRole("button", { name: /continue|sign in|next/i }),
    page.getByRole("button", { name: /continue|sign in|next/i }),
  ]);

  if (button) {
    await button.click();
    return;
  }

  for (const frame of page.frames()) {
    const frameButton = await findVisibleLocator([
      frame.locator(".cl-formButtonPrimary"),
      frame.locator('[data-localization-key="formButtonPrimary"]'),
      frame.locator('form button[type="submit"]'),
      frame.getByRole("button", { name: /continue|sign in|next/i }),
    ]);

    if (frameButton) {
      await frameButton.click();
      return;
    }
  }

  throw new Error("Unable to find a visible Clerk submit button.");
}

export async function signIn(page: Page, account: QaAccount) {
  await page.goto("/");

  const signInButton = page.getByRole("button", { name: /^sign in$/i }).first();
  await expect(signInButton).toBeVisible({ timeout: 15_000 });
  await signInButton.click();
  await page.waitForLoadState("networkidle").catch(() => undefined);

  let identifierInput = await findClerkInput(page, "identifier").catch(() => null);

  if (!identifierInput) {
    await signInButton.click();
    identifierInput = await findClerkInput(page, "identifier");
  }

  await identifierInput.fill(account.email);

  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

  if (!(await passwordInput.isVisible({ timeout: 1_500 }).catch(() => false))) {
    await continueClerkForm(page);
  }

  await (await findClerkInput(page, "password")).fill(account.password);
  await continueClerkForm(page);
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await waitForClerkSession(page);
}

async function getClerkDebugState(page: Page) {
  return page
    .evaluate(() => {
      const clerk = (window as typeof window & {
        Clerk?: {
          loaded?: boolean;
          user?: {
            id?: string;
            primaryEmailAddress?: { emailAddress?: string };
            emailAddresses?: Array<{ emailAddress?: string }>;
            publicMetadata?: Record<string, unknown>;
            unsafeMetadata?: Record<string, unknown>;
          } | null;
        };
      }).Clerk;
      const user = clerk?.user;

      return {
        clerkLoaded: Boolean(clerk?.loaded),
        clerkUserId: user?.id ?? null,
        primaryEmail:
          user?.primaryEmailAddress?.emailAddress ??
          user?.emailAddresses?.[0]?.emailAddress ??
          null,
        publicMetadata: user?.publicMetadata ?? null,
        unsafeMetadata: user?.unsafeMetadata ?? null,
        visibleText: document.body.innerText.slice(0, 1_000),
      };
    })
    .catch((error) => ({
      clerkLoaded: false,
      clerkUserId: null,
      primaryEmail: null,
      publicMetadata: null,
      unsafeMetadata: null,
      visibleText: `Unable to inspect Clerk state: ${error instanceof Error ? error.message : String(error)}`,
    }));
}

async function waitForClerkSession(page: Page) {
  await expect
    .poll(
      async () => {
        const state = await getClerkDebugState(page);
        return state.clerkUserId;
      },
      { timeout: 20_000 },
    )
    .not.toBeNull();
}

export async function expectTrustedBumsSession(page: Page) {
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle").catch(() => undefined);

  if (page.url().replace(/\/$/, "") === `${process.env.QA_BASE_URL}`.replace(/\/$/, "")) {
    const clerkState = await getClerkDebugState(page);

    throw new Error(
      [
        "Clerk sign-in completed, but Trusted Bums did not authorize this user.",
        `Clerk state: ${JSON.stringify(clerkState)}`,
        "Check that this QA user has role metadata in Clerk publicMetadata or unsafeMetadata, not only organization membership/private metadata.",
        "Expected examples: {\"role\":\"ADMIN\"}, {\"role\":\"CLIENT\",\"clientCompanyName\":\"QA\",\"clientAccessRole\":\"CLIENT_ADMIN\"}, or {\"role\":\"BUM\",\"bumId\":\"qa-bum\"}.",
      ].join(" "),
    );
  }
}

export async function acceptTermsIfPrompted(page: Page, destinationPath: string) {
  if (!page.url().includes("/terms")) {
    return;
  }

  const acceptButton = page.getByRole("button", { name: /accept.*continue/i });

  if (await acceptButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await page.getByRole("checkbox").first().click();
    await acceptButton.click();
    await page.waitForLoadState("networkidle").catch(() => undefined);
  }

  if (page.url().includes("/terms")) {
    await page.goto(destinationPath);
  }
}

export async function goToAuthedPath(page: Page, account: QaAccount, path: string) {
  await signIn(page, account);
  await expectTrustedBumsSession(page);
  await page.goto(path);
  await acceptTermsIfPrompted(page, path);
}
