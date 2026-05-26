import { expect, test } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const extensionRoot = path.resolve("dist/chrome-extension/trustedbums");
const popupUrl = pathToFileURL(path.join(extensionRoot, "popup.html")).toString();
const contentScriptPath = path.join(extensionRoot, "contentScript.js");

test.describe("Trusted Bums extension", () => {


  test("extracts profile details from the LinkedIn page", async ({ page }) => {
    await page.addInitScript(() => {
      window.__trustedBumsMessageListeners = [];
      window.chrome = {
        runtime: {
          onMessage: {
            addListener: (listener) => {
              window.__trustedBumsMessageListeners.push(listener);
            },
          },
        },
      };
    });

    await page.route("https://www.linkedin.com/in/example-person/", async (route) => {
      await route.fulfill({
        contentType: "text/html",
        body: `<!doctype html>
          <html>
            <head>
              <title>Example Person | LinkedIn</title>
              <meta property="og:description" content="Finance executive at Example Co" />
            </head>
            <body>
              <main>
                <section class="pv-text-details__left-panel">
                  <h1>Example Person</h1>
                  <div class="text-body-medium break-words">VP of Finance at Example Co</div>
                </section>
              </main>
            </body>
          </html>`,
      });
    });

    await page.goto("https://www.linkedin.com/in/example-person/");
    await page.addScriptTag({ path: contentScriptPath });

    const response = await page.evaluate(() =>
      new Promise((resolve) => {
        window.__trustedBumsMessageListeners[0](
          { type: "TRUSTED_BUMS_CAPTURE_LINKEDIN_PAGE" },
          {},
          resolve,
        );
      }),
    );

    expect(response).toMatchObject({
      ok: true,
      capture: {
        captureType: "LINKEDIN_PROFILE",
        sourceUrl: "https://www.linkedin.com/in/example-person/",
        pageTitle: "Example Person | LinkedIn",
        profileName: "Example Person",
        headline: "VP of Finance at Example Co",
        description: "Finance executive at Example Co",
      },
    });
  });
  test("captures the active LinkedIn page and sends a draft capture to the API", async ({ page }) => {
    await page.addInitScript(() => {
      const capture = {
        captureType: "LINKEDIN_PROFILE",
        sourceUrl: "https://www.linkedin.com/in/example-person/",
        pageTitle: "Example Person | LinkedIn",
        profileName: "Example Person",
        headline: "VP of Finance at Example Co",
        selectedText: "Knows the buyer from a prior project",
        description: "Example Person is a finance leader at Example Co.",
      };

      const context = {
        apiVersion: "v1",
        profile: {
          id: "user_test",
          name: "QA User",
          email: "qa@example.com",
          role: "BUM",
        },
        destinations: {
          opportunities: [
            {
              id: "5ab7f4ba-5f12-49be-9ef0-c5bd2393b59a",
              destinationType: "OPPORTUNITY_REGISTRATION",
              targetAccountName: "Example Co",
              companyName: "BlackCurrant",
              status: "ACCEPTED",
            },
          ],
          customerTargets: [],
        },
      };

      window.__trustedBumsExtensionRequests = [];
      window.__trustedBumsMockClerk = {
        user: { primaryEmailAddress: { emailAddress: "qa@example.com" } },
        session: { getToken: async () => "test-clerk-token" },
        load: async () => undefined,
        addListener: () => undefined,
        openSignIn: () => undefined,
        signOut: async () => undefined,
      };
      window.chrome = {
        runtime: {
          id: "trustedbums",
          getURL: () => "chrome-extension://trustedbums/",
          getManifest: () => ({ version: "0.1.0" }),
          lastError: null,
        },
        storage: {
          local: {
            get: async () => ({
              apiBaseUrl: "https://api.test/functions/v1/extension-api-v1",
            }),
            set: async (value) => {
              window.__trustedBumsStoredSettings = value;
            },
          },
          session: {
            get: async () => ({
              apiToken: "test-clerk-token",
            }),
            set: async (value) => {
              window.__trustedBumsStoredSession = value;
            },
          },
        },
        tabs: {
          query: (_query, callback) => {
            callback([{ id: 123, url: capture.sourceUrl }]);
          },
          sendMessage: (_tabId, message, callback) => {
            if (message.type === "TRUSTED_BUMS_CAPTURE_LINKEDIN_PAGE") {
              callback({ ok: true, capture });
            } else {
              callback({ ok: false });
            }
          },
        },
      };

      window.fetch = async (url, options = {}) => {
        window.__trustedBumsExtensionRequests.push({
          url: String(url),
          method: options.method || "GET",
          headers: options.headers || {},
          body: options.body ? JSON.parse(String(options.body)) : null,
        });

        if (String(url).endsWith("/context")) {
          return new Response(JSON.stringify(context), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (String(url).endsWith("/page-captures")) {
          return new Response(JSON.stringify({
            apiVersion: "v1",
            capture: { id: "capture_test", status: "DRAFT" },
          }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ apiVersion: "v1", error: "not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      };
    });

    await page.goto(popupUrl);

    await expect(page.locator("#status")).toContainText("Ready to send");
    await expect(page.locator("#profileName")).toHaveText("Example Person");
    await expect(page.locator("#headline")).toHaveText("VP of Finance at Example Co");
    await expect(page.locator("#destination")).toContainText("Opportunity: Example Co");

    await page.locator("#note").fill("This is the person to follow up with.");
    await page.locator("#sendCapture").click();

    await expect(page.locator("#status")).toContainText("Sent to Trusted Bums");

    const captureRequest = await page.evaluate(() =>
      window.__trustedBumsExtensionRequests.find((request) => request.url.endsWith("/page-captures")),
    );
    expect(captureRequest).toMatchObject({
      method: "POST",
      body: {
        destinationType: "OPPORTUNITY_REGISTRATION",
        opportunityId: "5ab7f4ba-5f12-49be-9ef0-c5bd2393b59a",
        captureType: "LINKEDIN_PROFILE",
        sourceUrl: "https://www.linkedin.com/in/example-person/",
        pageTitle: "Example Person | LinkedIn",
        selectedText: "Knows the buyer from a prior project",
        note: "This is the person to follow up with.",
      },
    });
    expect(captureRequest.body.metadata).toMatchObject({
      extensionVersion: "0.1.0",
      profileName: "Example Person",
      headline: "VP of Finance at Example Co",
    });
  });
});
