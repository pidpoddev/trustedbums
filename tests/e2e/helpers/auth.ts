import { type Page } from "@playwright/test";

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

export async function signIn(page: Page, account: QaAccount) {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.Clerk?.loaded), undefined, { timeout: 20_000 });

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
      const attempt = await clerk.client.signIn.create({ identifier: email, password });

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
