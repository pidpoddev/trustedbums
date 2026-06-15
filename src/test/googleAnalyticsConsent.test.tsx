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

function readGtagCommands() {
  return (window.dataLayer ?? [])
    .filter((entry): entry is ArrayLike<unknown> => typeof entry === "object" && entry !== null && "length" in entry)
    .map((entry) => Array.from(entry));
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
    const commands = readGtagCommands();
    expect(commands).toContainEqual(["consent", "default", expect.objectContaining({ analytics_storage: "denied" })]);
    expect(commands).toContainEqual([
      "config",
      measurementId,
      expect.objectContaining({
        allow_ad_personalization_signals: false,
        allow_google_signals: false,
        send_page_view: false,
      }),
    ]);
    expect(commands).not.toContainEqual(["config", measurementId, expect.objectContaining({ page_path: "/privacy-policy" })]);
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
    const commands = readGtagCommands();
    expect(commands).toContainEqual(["consent", "default", expect.objectContaining({ analytics_storage: "denied" })]);
    expect(commands).toContainEqual(["consent", "update", expect.objectContaining({ analytics_storage: "granted" })]);
    expect(commands).toContainEqual([
      "config",
      measurementId,
      expect.objectContaining({
        auth_gate: "public",
        is_portal_route: "false",
        send_page_view: true,
        page_path: "/bums?source=qa",
        page_location: expect.stringContaining("/bums?source=qa"),
        portal_area: "public",
        route_group: "bums",
      }),
    ]);
    expect(commands).toContainEqual([
      "event",
      "trustedbums_route_view",
      expect.objectContaining({
        auth_gate: "public",
        is_portal_route: "false",
        page_path: "/bums?source=qa",
        portal_area: "public",
        route_group: "bums",
      }),
    ]);
  });

  it("tracks portal routes with aggregate route dimensions and strips IDs and query strings", async () => {
    writeAnalyticsConsent(true);

    await renderGoogleAnalytics("/bum/opportunities/0f5c5d4e-9d62-41bb-b5d7-fb7f7228f6d2?claimId=secret-claim-id");

    await waitFor(() => {
      expect(document.getElementById("trustedbums-google-analytics")).toBeInTheDocument();
    });

    const commands = readGtagCommands();
    expect(commands).toContainEqual([
      "config",
      measurementId,
      expect.objectContaining({
        auth_gate: "protected",
        is_portal_route: "true",
        page_location: expect.stringContaining("/bum/opportunities/:id"),
        page_path: "/bum/opportunities/:id",
        portal_area: "bum",
        route_group: "bum_opportunities",
      }),
    ]);
    expect(commands).toContainEqual([
      "event",
      "trustedbums_route_view",
      expect.objectContaining({
        auth_gate: "protected",
        is_portal_route: "true",
        page_path: "/bum/opportunities/:id",
        portal_area: "bum",
        route_group: "bum_opportunities",
      }),
    ]);
    expect(JSON.stringify(commands)).not.toContain("0f5c5d4e-9d62-41bb-b5d7-fb7f7228f6d2");
    expect(JSON.stringify(commands)).not.toContain("secret-claim-id");
  });
});
