import { expect, type Page } from "@playwright/test";

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

async function fillFirstVisible(page: Page, selectors: string[], value: string) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();

    if (await locator.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await locator.fill(value);
      return;
    }
  }

  throw new Error(`Unable to find a visible input for selectors: ${selectors.join(", ")}`);
}

async function continueClerkForm(page: Page) {
  const button = page.getByRole("button", { name: /continue|sign in|next/i }).last();
  await expect(button).toBeVisible({ timeout: 10_000 });
  await button.click();
}

export async function signIn(page: Page, account: QaAccount) {
  await page.goto("/");

  const signInButton = page.getByRole("button", { name: /^sign in$/i }).first();
  await expect(signInButton).toBeVisible({ timeout: 15_000 });
  await signInButton.click();

  await fillFirstVisible(
    page,
    [
      'input[name="identifier"]',
      'input[name="emailAddress"]',
      'input[type="email"]',
      'input[autocomplete="username"]',
    ],
    account.email,
  );

  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

  if (!(await passwordInput.isVisible({ timeout: 1_500 }).catch(() => false))) {
    await continueClerkForm(page);
  }

  await fillFirstVisible(page, ['input[name="password"]', 'input[type="password"]'], account.password);
  await continueClerkForm(page);
  await page.waitForLoadState("networkidle").catch(() => undefined);
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
  await page.goto(path);
  await acceptTermsIfPrompted(page, path);
}
