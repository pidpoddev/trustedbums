import { expect, test } from "@playwright/test";

const extensionApiBaseUrl = process.env.QA_EXTENSION_API_BASE_URL;
const extensionApiToken = process.env.QA_EXTENSION_API_TOKEN;

test.describe("extension API smoke", () => {
  test.skip(!extensionApiBaseUrl, "Set QA_EXTENSION_API_BASE_URL to run extension API smoke tests.");

  test("rejects anonymous context requests with the stable v1 error envelope", async ({ request }) => {
    const response = await request.get(`${extensionApiBaseUrl}/context`);
    expect(response.status()).toBe(401);

    const payload = await response.json();
    expect(payload).toMatchObject({ apiVersion: "v1" });
    expect(String(payload.error)).toMatch(/bearer|token|profile|session/i);
  });

  test("returns extension context for an authenticated user", async ({ request }) => {
    test.skip(!extensionApiToken, "Set QA_EXTENSION_API_TOKEN to run authenticated extension API smoke tests.");

    const response = await request.get(`${extensionApiBaseUrl}/context`, {
      headers: { Authorization: `Bearer ${extensionApiToken}` },
    });
    expect(response.ok()).toBeTruthy();

    const payload = await response.json();
    expect(payload.apiVersion).toBe("v1");
    expect(payload.profile).toEqual(expect.objectContaining({ id: expect.any(String), role: expect.any(String) }));
    expect(payload.destinations).toEqual(expect.objectContaining({
      opportunities: expect.any(Array),
      customerTargets: expect.any(Array),
    }));
  });
});
