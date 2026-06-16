import { canUseConsentCategory } from "@/lib/consent";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

type AnalyticsEventValue = string | number | boolean | null | undefined;

export type AnalyticsEventParams = Record<string, AnalyticsEventValue>;

function normalizeAnalyticsValue(value: AnalyticsEventValue) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "string") {
    return value.slice(0, 100);
  }

  return value;
}

export function trackAnalyticsEvent(eventName: string, params: AnalyticsEventParams = {}) {
  if (typeof window === "undefined" || !window.gtag || !canUseConsentCategory("analytics")) {
    return;
  }

  const safeParams = Object.entries(params).reduce<Record<string, string | number>>((output, [key, value]) => {
    const normalizedValue = normalizeAnalyticsValue(value);
    if (normalizedValue !== null) {
      output[key] = normalizedValue;
    }
    return output;
  }, {});

  window.gtag("event", eventName, safeParams);
  window.clarity?.("event", eventName);
}
