import { expect, test } from "@playwright/test";
import { getQaAccount, signIn } from "./helpers/auth";

const extensionApiBaseUrl = process.env.QA_EXTENSION_API_BASE_URL;
const extensionApiToken = process.env.QA_EXTENSION_API_TOKEN;

async function readApiPayload(response: { json: () => Promise<unknown>; text: () => Promise<string> }) {
  try {
    return await response.json();
  } catch {
    return await response.text();
  }
}

async function getCurrentClerkSessionToken(page: Parameters<typeof signIn>[0]) {
  return page.evaluate(async () => {
    const clerk = (window as typeof window & {
      Clerk?: {
        session?: {
          getToken?: () => Promise<string | null>;
        } | null;
      };
    }).Clerk;

    return (await clerk?.session?.getToken?.()) ?? null;
  });
}

test.describe("extension API smoke", () => {
  test.skip(!extensionApiBaseUrl, "Set QA_EXTENSION_API_BASE_URL to run extension API smoke tests.");

  test("rejects anonymous context requests with the stable v1 error envelope", async ({ request }) => {
    const response = await request.get(`${extensionApiBaseUrl}/context`);
    expect(response.status()).toBe(401);

    const payload = await response.json();
    expect(payload).toMatchObject({ apiVersion: "v1" });
    expect(String(payload.error)).toMatch(/bearer|token|profile|session/i);
  });

  test("returns extension context for an authenticated user", async ({ page, request }) => {
    const bum = getQaAccount("BUM");
    const canCreateFreshToken = Boolean(bum && (process.env.CLERK_SECRET_KEY || bum.password));
    test.skip(
      !extensionApiToken && !canCreateFreshToken,
      "Set QA_EXTENSION_API_TOKEN or QA_BUM_EMAIL with CLERK_SECRET_KEY/password to run authenticated extension API smoke tests.",
    );

    let token = extensionApiToken;

    if (canCreateFreshToken && bum) {
      await signIn(page, bum);
      token = await getCurrentClerkSessionToken(page);
    }

    if (!token) {
      throw new Error("Unable to resolve a Clerk session token for extension API smoke.");
    }

    const response = await request.get(`${extensionApiBaseUrl}/context`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await readApiPayload(response);
    expect(response.ok(), `Extension API returned HTTP ${response.status()}: ${JSON.stringify(payload)}`).toBeTruthy();

    expect(payload).toEqual(expect.objectContaining({ apiVersion: "v1" }));
    expect(payload).toEqual(expect.objectContaining({
      profile: expect.objectContaining({ id: expect.any(String), role: expect.any(String) }),
    }));
    expect(payload).toEqual(expect.objectContaining({
      destinations: expect.objectContaining({
      opportunities: expect.any(Array),
      customerTargets: expect.any(Array),
      }),
    }));
  });
});
