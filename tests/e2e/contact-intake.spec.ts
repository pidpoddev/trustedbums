import { expect, test } from "@playwright/test";

const defaultSupabaseUrl = "https://vaoqvtxqvbptyxddpoju.supabase.co";
const envValue = (value: string | undefined) => value?.trim() || undefined;
const supabaseUrl = envValue(process.env.QA_SUPABASE_URL) ?? envValue(process.env.VITE_SUPABASE_URL) ?? defaultSupabaseUrl;
const functionsBaseUrl =
  envValue(process.env.QA_SUPABASE_FUNCTIONS_URL) ?? (supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/functions/v1` : "");
const contactOrigin =
  envValue(process.env.QA_CONTACT_ALLOWED_ORIGIN) ?? envValue(process.env.QA_BASE_URL) ?? "https://trustedbums.com";
const contactSmokeEnabled = process.env.QA_CONTACT_SMOKE_ENABLED === "true";
const contactTurnstileToken = process.env.QA_CONTACT_TURNSTILE_TOKEN;

function uniqueQaEmail() {
  return `qa-contact-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function contactPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "QA Contact Smoke",
    email: uniqueQaEmail(),
    companyName: "QA Contact Smoke Company",
    interest: "CLIENT",
    targetAccounts: "QA Target Account",
    message: "QA contact smoke verifies the public intake path end to end.",
    idempotencyKey: crypto.randomUUID(),
    ...overrides,
  };
}

test.describe("public contact intake boundary", () => {
  test("rejects direct anonymous calls to the internal website email sender before template handling", async ({
    request,
  }) => {
    const response = await request.post(`${functionsBaseUrl}/send-website-email`, {
      headers: {
        Origin: contactOrigin,
      },
      data: {
        template: "contact-submission",
        name: "Bad Direct Caller",
        email: uniqueQaEmail(),
        message: "This direct call should fail before any email template can send.",
      },
    });

    expect(response.status()).toBe(403);
    const payload = await response.json();
    expect(String(payload.error)).toMatch(/trusted|internal|caller/i);
  });

  test("rejects public contact submissions with invalid verification", async ({ request }) => {
    const response = await request.post(`${functionsBaseUrl}/submit-contact`, {
      headers: {
        Origin: contactOrigin,
      },
      data: contactPayload({ turnstileToken: "qa-invalid-turnstile-token" }),
    });

    expect(response.status()).toBe(403);
    const payload = await response.json();
    expect(String(payload.error)).toMatch(/verify|verification|submission/i);
  });

  test("accepts a valid public contact submission and sends the notification", async ({ request }) => {
    test.skip(
      !contactSmokeEnabled,
      "Set QA_CONTACT_SMOKE_ENABLED=true to run the mutating contact-send smoke test.",
    );
    expect(contactTurnstileToken, "Set QA_CONTACT_TURNSTILE_TOKEN for the mutating contact-send smoke test.").toBeTruthy();

    const response = await request.post(`${functionsBaseUrl}/submit-contact`, {
      headers: {
        Origin: contactOrigin,
      },
      data: contactPayload({ turnstileToken: contactTurnstileToken }),
    });

    expect(response.status()).toBe(201);
    const payload = await response.json();
    expect(payload).toMatchObject({ submitted: true, notificationSent: true });
  });
});
