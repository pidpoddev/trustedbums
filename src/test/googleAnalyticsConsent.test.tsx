import { cleanup, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION, type ConsentRecord } from "@/lib/consent";

const measurementId = "G-P6B5EYQMVN";

declare global {
  interface Window {
    dataLayer?: unknown[];
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
    decidedAt: "2026-06-11T00:00:00.000Z",
    source: "settings",
  };

  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
}

async function renderGoogleAnalytics(route = "/") {
  vi.resetModules();
  vi.stubEnv("VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID", measurementId);
  const { GoogleAnalytics } = await import("@/components/GoogleAnalytics");

  render(
    <MemoryRouter initialEntries={[route]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <GoogleAnalytics />
    </MemoryRouter>,
  );
}

describe("GoogleAnalytics consent gating", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    window.localStorage.clear();
    document.getElementById("trustedbums-google-analytics")?.remove();
    delete window.dataLayer;
    delete window.gtag;
  });

  it("loads the GA tag with denied storage before Analytics consent", async () => {
    await renderGoogleAnalytics("/privacy-policy");

    const script = await waitFor(() => {
      const element = document.getElementById("trustedbums-google-analytics") as HTMLScriptElement | null;
      expect(element).toBeInTheDocument();
      return element;
    });

    expect(script?.src).toBe(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
    expect(window.dataLayer).toContainEqual(["consent", "default", expect.objectContaining({ analytics_storage: "denied" })]);
    expect(window.dataLayer).toContainEqual(["config", measurementId, { send_page_view: false }]);
    expect(window.dataLayer).not.toContainEqual([
      "event",
      "page_view",
      expect.any(Object),
    ]);
  });

  it("loads the production GA4 stream after Analytics consent", async () => {
    writeAnalyticsConsent(true);

    await renderGoogleAnalytics("/bums?source=qa");

    const script = await waitFor(() => {
      const element = document.getElementById("trustedbums-google-analytics") as HTMLScriptElement | null;
      expect(element).toBeInTheDocument();
      return element;
    });

    expect(script?.src).toBe(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
    expect(window.dataLayer).toContainEqual(["consent", "default", expect.objectContaining({ analytics_storage: "denied" })]);
    expect(window.dataLayer).toContainEqual(["consent", "update", expect.objectContaining({ analytics_storage: "granted" })]);
    expect(window.dataLayer).toContainEqual([
      "event",
      "page_view",
      expect.objectContaining({
        page_path: "/bums?source=qa",
        page_location: expect.stringContaining("/bums?source=qa"),
      }),
    ]);
  });
});
