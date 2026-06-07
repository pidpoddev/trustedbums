import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { type Page } from "@playwright/test";

const appBootstrapTimeoutMs = 15_000;
const protectedRouteTimeoutMs = 25_000;

export interface QaAccount {
  email: string;
  password?: string;
}

export function getQaAccount(prefix: string): QaAccount | null {
  const email = process.env[`QA_${prefix}_EMAIL`];
  const password = process.env[`QA_${prefix}_PASSWORD`];

  if (!email) {
    return null;
  }

  return { email, password };
}

export function hasExternalQaTarget() {
  return Boolean(process.env.QA_BASE_URL);
}

export function getQaBaseOrigin() {
  const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:4173";
  return new URL(baseUrl).origin;
}

export function isAppPageUrl(url: string) {
  if (!url || url === "about:blank" || url.startsWith("chrome-error://")) {
    return false;
  }

  try {
    return new URL(url).origin === getQaBaseOrigin();
  } catch {
    return false;
  }
}

let clerkSetupPromise: Promise<void> | null = null;

async function ensureClerkTestingSetup() {
  clerkSetupPromise ??= clerkSetup({ dotenv: false });
  await clerkSetupPromise;
}

async function loadAppRootForAuth(page: Page) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      await page.goto("/", { waitUntil: "domcontentloaded", timeout: appBootstrapTimeoutMs });
      await page.waitForFunction(() => Boolean(window.Clerk?.loaded), undefined, { timeout: appBootstrapTimeoutMs });
      return;
    } catch (error) {
      lastError = error;
      await page.goto("about:blank").catch(() => undefined);
    }
  }

  throw new Error(
    [
      "Unable to load the app root for QA auth within the bounded bootstrap window.",
      `Target origin: ${getQaBaseOrigin()}`,
      `Last URL: ${page.url()}`,
      `Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
      "Treat this as a base-target availability or QA auth harness failure before triaging individual protected routes.",
    ].join(" "),
  );
}

export async function signIn(page: Page, account: QaAccount) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem(
        "trustedbums:consent-preferences",
        JSON.stringify({
          version: "2026-05-19-eu-v1",
          preferences: { necessary: true, preferences: true, analytics: true, marketing: true },
          decidedAt: new Date().toISOString(),
          source: "settings",
        }),
      );
    } catch {
      // Browser error documents can deny localStorage; the app page will receive this init script again.
    }
  });
  await loadAppRootForAuth(page);

  const currentSessionEmail = await page
    .evaluate(() => {
      const clerk = window.Clerk;
      return (
        clerk?.user?.primaryEmailAddress?.emailAddress ??
        clerk?.user?.emailAddresses?.[0]?.emailAddress ??
        null
      );
    })
    .catch(() => null);

  if (currentSessionEmail?.toLowerCase() === account.email.toLowerCase()) {
    return;
  }

  if (process.env.CLERK_SECRET_KEY) {
    await ensureClerkTestingSetup();
    await clerk.signIn({ page, emailAddress: account.email });
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await waitForClerkSession(page);
    return;
  }

  if (!account.password) {
    throw new Error("Set CLERK_SECRET_KEY or a QA account password to run authenticated E2E smoke tests.");
  }

  const signInResult = await page.evaluate(async ({ email, password }) => {
    type ClerkError = {
      code?: string;
      longMessage?: string;
      message?: string;
      meta?: Record<string, unknown>;
    };
    type ClerkSignInAttempt = {
      status?: string;
      createdSessionId?: string | null;
      firstFactorVerification?: { status?: string; error?: ClerkError | null } | null;
      supportedFirstFactors?: Array<{ strategy?: string }>;
    };
    type ClerkGlobal = {
      client?: {
        signIn?: {
          create: (params: { identifier: string; password: string }) => Promise<ClerkSignInAttempt>;
        };
      };
      setActive?: (params: { session: string }) => Promise<void>;
      user?: { id?: string } | null;
    };

    const clerk = window.Clerk as ClerkGlobal | undefined;

    if (!clerk?.client?.signIn?.create || !clerk.setActive) {
      return {
        ok: false,
        reason: "Clerk client sign-in API is not available.",
      };
    }

    try {
      const attempt = await clerk.client.signIn.create({ identifier: email, password: password ?? "" });

      if (attempt.status === "complete" && attempt.createdSessionId) {
        await clerk.setActive({ session: attempt.createdSessionId });

        return {
          ok: true,
          status: attempt.status,
          createdSessionId: attempt.createdSessionId,
          userId: clerk.user?.id ?? null,
        };
      }

      return {
        ok: false,
        status: attempt.status ?? null,
        createdSessionId: attempt.createdSessionId ?? null,
        firstFactorVerification: attempt.firstFactorVerification ?? null,
        supportedFirstFactors: attempt.supportedFirstFactors ?? null,
      };
    } catch (error) {
      const clerkError = error as {
        errors?: ClerkError[];
        message?: string;
        status?: number;
      };

      return {
        ok: false,
        statusCode: clerkError.status ?? null,
        message: clerkError.message ?? String(error),
        errors: clerkError.errors ?? null,
      };
    }
  }, account);

  if (!signInResult.ok) {
    throw new Error(`Clerk password sign-in failed: ${JSON.stringify(signInResult)}`);
  }

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
  const deadline = Date.now() + 20_000;
  let lastState = await getClerkDebugState(page);

  while (Date.now() < deadline) {
    lastState = await getClerkDebugState(page);

    if (lastState.clerkUserId) {
      return;
    }

    await page.waitForTimeout(500);
  }

  throw new Error(
    [
      "Clerk did not establish a browser session after password submit.",
      `Current URL: ${page.url()}`,
      `Clerk state: ${JSON.stringify(lastState)}`,
      "Check that the QA user has a password credential, is email-verified/active, does not require password reset/MFA, and is not blocked by Clerk bot protection.",
    ].join(" "),
  );
}

export async function expectTrustedBumsSession(page: Page) {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded", timeout: appBootstrapTimeoutMs });
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

async function getTermsPromptDebugState(page: Page) {
  const acceptedStatus = page.getByText(/Current agreement accepted|Current terms accepted/i).first();
  const acceptButton = page.getByRole("button", { name: /accept.*continue/i });
  const skipButton = page.getByRole("button", { name: /skip this login/i });
  const checkbox = page.getByRole("checkbox").first();
  const visibleText = await page.locator("body").innerText().catch(() => "");
  const visibleErrors = visibleText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /unable to|failed|not authorized|please try again|current agreement accepted|current terms accepted/i.test(line))
    .slice(0, 8);

  return {
    url: page.url(),
    acceptedStatusVisible: await acceptedStatus.isVisible({ timeout: 500 }).catch(() => false),
    acceptButtonVisible: await acceptButton.isVisible({ timeout: 500 }).catch(() => false),
    acceptButtonEnabled: await acceptButton.isEnabled({ timeout: 500 }).catch(() => false),
    skipButtonVisible: await skipButton.isVisible({ timeout: 500 }).catch(() => false),
    checkboxVisible: await checkbox.isVisible({ timeout: 500 }).catch(() => false),
    visibleErrors,
    visibleText: visibleText.slice(0, 1_000),
  };
}

export async function acceptTermsIfPrompted(page: Page, destinationPath: string) {
  if (!page.url().includes("/terms")) {
    return;
  }

  const isDestinationTermsPage = destinationPath.includes("/terms");
  const acceptedStatus = page.getByText(/Current agreement accepted|Current terms accepted/i).first();

  if (isDestinationTermsPage && await acceptedStatus.isVisible({ timeout: 2_000 }).catch(() => false)) {
    return;
  }

  const acceptButton = page.getByRole("button", { name: /accept.*continue/i });

  if (await acceptButton.isVisible({ timeout: 15_000 }).catch(() => false)) {
    const checkbox = page.getByRole("checkbox").first();
    await checkbox.click({ timeout: 5_000 });
    await acceptButton.click();
    await page.waitForLoadState("networkidle").catch(() => undefined);

    await page
      .waitForURL((url) => !url.pathname.includes("/terms"), { timeout: 15_000 })
      .catch(() => undefined);
  }

  if (page.url().includes("/terms")) {
    await page.goto(destinationPath, { waitUntil: "domcontentloaded", timeout: protectedRouteTimeoutMs });
    await page.waitForLoadState("networkidle").catch(() => undefined);
  }

  if (isDestinationTermsPage && await acceptedStatus.isVisible({ timeout: 2_000 }).catch(() => false)) {
    return;
  }

  if (page.url().includes("/terms")) {
    const termsState = await getTermsPromptDebugState(page);
    throw new Error(
      [
        "Unable to accept current terms during E2E sign-in.",
        `Current URL: ${page.url()}`,
        `Terms prompt state: ${JSON.stringify(termsState)}`,
      ].join(" "),
    );
  }
}

const routeLinkNames: Record<string, RegExp> = {
  "/admin/opportunities": /^Opportunities$/,
  "/client/payments": /^(Payment Reports|Open Payment Reports|Go to Payment Reports|Import monthly Customer Payment Reports)$/,
  "/client/exports": /^Exports$/,
  "/client/opportunities/new": /^Register Opportunity$/,
  "/client/targets": /^Target Accounts$/,
};

interface GoToAuthedPathOptions {
  allowRedirectTo?: RegExp;
}

async function clickRouteLinkIfVisible(page: Page, path: string) {
  const linkName = routeLinkNames[path];

  if (!linkName) {
    return false;
  }

  const link = page.getByRole("link", { name: linkName }).first();

  if (!(await link.isVisible({ timeout: 2_000 }).catch(() => false))) {
    return false;
  }

  await link.click();
  await page.waitForLoadState("networkidle").catch(() => undefined);
  return true;
}

async function goToPathAfterTerms(page: Page, path: string, options: GoToAuthedPathOptions = {}) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto(path, { waitUntil: "domcontentloaded", timeout: protectedRouteTimeoutMs });
    await page.waitForLoadState("networkidle").catch(() => undefined);

    await page.waitForURL((url) => url.pathname.includes("/terms"), { timeout: 3_000 }).catch(() => undefined);
    await acceptTermsIfPrompted(page, path);

    await page.waitForTimeout(750);

    const currentPath = new URL(page.url()).pathname.replace(/\/$/, "") || "/";
    const expectedPath = path.replace(/\/$/, "") || "/";

    if (currentPath === expectedPath) {
      return;
    }

    if (options.allowRedirectTo?.test(currentPath)) {
      return;
    }

    if (
      expectedPath.startsWith("/admin/") &&
      currentPath === "/admin" &&
      (await page.getByRole("heading", { name: "Admin Dashboard" }).isVisible().catch(() => false))
    ) {
      return;
    }

    if (expectedPath !== "/dashboard") {
      if (await clickRouteLinkIfVisible(page, path)) {
        await page.waitForURL((url) => url.pathname === expectedPath, { timeout: 5_000 }).catch(() => undefined);
        await acceptTermsIfPrompted(page, path);

        const clickedPath = new URL(page.url()).pathname.replace(/\/$/, "") || "/";

        if (clickedPath === expectedPath) {
          return;
        }
      }

      continue;
    }

    if (!page.url().includes("/terms")) {
      return;
    }
  }

  throw new Error(
    [
      "Unable to reach requested path after auth, route guards, and terms acceptance settled.",
      `Requested path: ${path}`,
      `Current URL: ${page.url()}`,
      `Visible text: ${(await page.locator("body").innerText().catch(() => "")).slice(0, 1_000)}`,
    ].join(" "),
  );
}

export async function goToAuthedPath(page: Page, account: QaAccount, path: string) {
  await signIn(page, account);
  await expectTrustedBumsSession(page);
  await goToPathAfterTerms(page, path);
}

export async function goToPathWithCurrentSession(page: Page, path: string) {
  await goToPathAfterTerms(page, path);
}

export async function goToAuthedPathAllowingRedirect(
  page: Page,
  account: QaAccount,
  path: string,
  allowRedirectTo: RegExp,
) {
  await signIn(page, account);
  await expectTrustedBumsSession(page);
  await goToPathAfterTerms(page, path, { allowRedirectTo });
}
