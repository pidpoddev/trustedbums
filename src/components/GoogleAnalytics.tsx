import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { buildAnalyticsPage } from "@/lib/analyticsPage";
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
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function loadGoogleAnalytics() {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? function gtag() {
    // Match Google's official gtag snippet so the runtime processes queued commands.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  if (!googleAnalyticsConfigured) {
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_ad_personalization_signals: false,
      allow_google_signals: false,
      send_page_view: false,
    });
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

    loadGoogleAnalytics();

    const syncAnalytics = () => {
      const granted = hasAnalyticsConsent();
      if (granted) {
        const page = buildAnalyticsPage(location.pathname, location.search);
        window.gtag?.("consent", "update", {
          analytics_storage: "granted",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
        window.gtag?.("config", measurementId, {
          allow_ad_personalization_signals: false,
          allow_google_signals: false,
          auth_gate: page.authGate,
          is_portal_route: page.isPortalRoute ? "true" : "false",
          portal_area: page.portalArea,
          route_group: page.routeGroup,
          send_page_view: true,
          page_title: document.title,
          page_location: page.pageLocation,
          page_path: page.pagePath,
        });
        window.gtag?.("event", "trustedbums_route_view", {
          auth_gate: page.authGate,
          is_portal_route: page.isPortalRoute ? "true" : "false",
          page_location: page.pageLocation,
          page_path: page.pagePath,
          portal_area: page.portalArea,
          route_group: page.routeGroup,
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
