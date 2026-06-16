import { cleanup, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION, type ConsentRecord } from "@/lib/consent";

const projectId = "x7nevilplm";

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
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

async function renderMicrosoftClarity(route = "/") {
  vi.resetModules();
  vi.stubEnv("VITE_MICROSOFT_CLARITY_PROJECT_ID", projectId);
  const { MicrosoftClarity } = await import("@/components/MicrosoftClarity");

  render(
    <MemoryRouter initialEntries={[route]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <MicrosoftClarity />
    </MemoryRouter>,
  );
}

describe("MicrosoftClarity consent gating", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    window.localStorage.clear();
    document.getElementById("trustedbums-microsoft-clarity")?.remove();
    delete window.clarity;
  });

  it("does not load Microsoft Clarity before Analytics consent", async () => {
    await renderMicrosoftClarity("/");

    await waitFor(() => {
      expect(document.getElementById("trustedbums-microsoft-clarity")).not.toBeInTheDocument();
    });
    expect(window.clarity).toBeUndefined();
  });

  it("loads Microsoft Clarity after Analytics consent", async () => {
    writeAnalyticsConsent(true);

    await renderMicrosoftClarity("/bum/opportunities/secret-id?claimId=private");

    const script = await waitFor(() => {
      const element = document.getElementById("trustedbums-microsoft-clarity") as HTMLScriptElement | null;
      expect(element).toBeInTheDocument();
      return element;
    });

    expect(script.src).toBe(`https://www.clarity.ms/tag/${projectId}?ref=bwt`);
    expect(window.clarity?.q).toContainEqual(["consent", true]);
    expect(window.clarity?.q).toContainEqual(["set", "auth_gate", "protected"]);
    expect(window.clarity?.q).toContainEqual(["set", "is_portal_route", "true"]);
    expect(window.clarity?.q).toContainEqual(["set", "portal_area", "bum"]);
    expect(window.clarity?.q).toContainEqual(["set", "route_group", "bum_opportunities"]);
  });
});
