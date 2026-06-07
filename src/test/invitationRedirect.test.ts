import { describe, expect, it } from "vitest";

import { normalizeInvitationRedirectUrl } from "../../supabase/functions/_shared/invitationRedirect";

function requestWithOrigin(origin?: string) {
  return new Request("https://vaoqvtxqvbptyxddpoju.supabase.co/functions/v1/invite-bum", {
    headers: origin ? { origin } : {},
  });
}

describe("normalizeInvitationRedirectUrl", () => {
  it("keeps approved Trusted Bums origins and normalizes the path to login", () => {
    const redirectUrl = normalizeInvitationRedirectUrl(
      "https://trustedbums.com/client/dashboard?next=https://evil.example",
      requestWithOrigin(),
    );

    expect(redirectUrl).toBe("https://trustedbums.com/login");
  });

  it("uses an approved request origin when the caller omits a redirect", () => {
    const redirectUrl = normalizeInvitationRedirectUrl(null, requestWithOrigin("https://www.trustedbums.com"));

    expect(redirectUrl).toBe("https://www.trustedbums.com/login");
  });

  it("falls back instead of returning a disallowed external redirect", () => {
    const redirectUrl = normalizeInvitationRedirectUrl(
      "https://evil.example/phish",
      requestWithOrigin("https://evil.example"),
    );

    expect(redirectUrl).toBe("https://trustedbums.com/login");
  });

  it("allows configured Clerk or app origins and uses a configured fallback", () => {
    const redirectUrl = normalizeInvitationRedirectUrl(
      "https://clerk.trustedbums.com/sign-in",
      requestWithOrigin(),
      {
        allowedOrigins: "https://app.trustedbums.com",
        clerkFrontendApiUrl: "https://clerk.trustedbums.com",
        fallbackUrl: "https://app.trustedbums.com/login",
      },
    );

    expect(redirectUrl).toBe("https://clerk.trustedbums.com/login");
  });

  it("ignores invalid or disallowed configured fallback values safely", () => {
    const redirectUrl = normalizeInvitationRedirectUrl("https://app.trustedbums.com/welcome", requestWithOrigin(), {
      allowedOrigins: "not a url",
      fallbackUrl: "https://evil.example/login",
    });

    expect(redirectUrl).toBe("https://trustedbums.com/login");
  });
});
