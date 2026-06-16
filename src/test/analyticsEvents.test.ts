import { afterEach, describe, expect, it, vi } from "vitest";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION, type ConsentRecord } from "@/lib/consent";
import { trackAnalyticsEvent } from "@/lib/analyticsEvents";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

function writeAnalyticsConsent(analytics: boolean) {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    preferences: {
      necessary: true,
      preferences: false,
      analytics,
      marketing: false,
    },
    decidedAt: "2026-06-15T00:00:00.000Z",
    source: "settings",
  };

  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
}

describe("trackAnalyticsEvent", () => {
  afterEach(() => {
    window.localStorage.clear();
    delete window.clarity;
    delete window.gtag;
  });

  it("does not send custom events before Analytics consent", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    trackAnalyticsEvent("trustedbums_claim_requested", { opportunity_origin: "opportunity_detail" });

    expect(gtag).not.toHaveBeenCalled();
  });

  it("sends consented aggregate params and drops empty values", () => {
    const clarity = vi.fn();
    const gtag = vi.fn();
    window.clarity = clarity;
    window.gtag = gtag;
    writeAnalyticsConsent(true);

    trackAnalyticsEvent("trustedbums_claim_requested", {
      opportunity_origin: "opportunity_detail",
      claim_contact_count: 3,
      has_blocker: true,
      empty: "",
      absent: null,
    });

    expect(gtag).toHaveBeenCalledWith("event", "trustedbums_claim_requested", {
      opportunity_origin: "opportunity_detail",
      claim_contact_count: 3,
      has_blocker: "true",
    });
    expect(clarity).toHaveBeenCalledWith("event", "trustedbums_claim_requested");
  });
});
