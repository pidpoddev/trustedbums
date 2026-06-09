import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { readConsentRecord } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const measurementId = import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID;
const scriptId = "trustedbums-google-analytics";
let googleAnalyticsConfigured = false;

function hasAnalyticsConsent() {
  return Boolean(readConsentRecord()?.preferences.analytics);
}

function denyAnalyticsConsent() {
  if (!window.gtag) {
    return;
  }

  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function loadGoogleAnalytics() {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  if (!googleAnalyticsConfigured) {
    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { send_page_view: false });
    googleAnalyticsConfigured = true;
  }

  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }
}

export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (!measurementId) {
      return;
    }

    const syncAnalytics = () => {
      const granted = hasAnalyticsConsent();
      if (granted) {
        loadGoogleAnalytics();
        window.gtag?.("config", measurementId, {
          page_path: `${location.pathname}${location.search}`,
        });
      } else {
        denyAnalyticsConsent();
      }
    };

    syncAnalytics();
    window.addEventListener("trustedbums:consent-change", syncAnalytics);

    return () => {
      window.removeEventListener("trustedbums:consent-change", syncAnalytics);
    };
  }, [location.pathname, location.search]);

  return null;
}
