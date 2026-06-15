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

const PUBLIC_QUERY_PARAM_ALLOWLIST = new Set([
  "ref",
  "referral",
  "source",
  "utm_campaign",
  "utm_content",
  "utm_medium",
  "utm_source",
  "utm_term",
]);

const ROUTE_ID_PREDECESSORS = new Set(["clients", "contacts", "opportunities"]);

function getPortalArea(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0];

  if (segment === "admin" || segment === "client" || segment === "bum") {
    return segment;
  }

  if (segment === "dashboard" || segment === "terms") {
    return "portal";
  }

  if (segment === "login" || segment === "sign-in") {
    return "auth";
  }

  return "public";
}

function sanitizePathname(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const sanitized = segments.map((segment, index) => {
    const previousSegment = segments[index - 1];
    if (previousSegment && ROUTE_ID_PREDECESSORS.has(previousSegment)) {
      return ":id";
    }

    return segment;
  });

  return sanitized.length ? `/${sanitized.join("/")}` : "/";
}

function sanitizeSearch(search: string, portalArea: string) {
  if (!search || portalArea !== "public") {
    return "";
  }

  const params = new URLSearchParams(search);
  const safeParams = new URLSearchParams();
  params.forEach((value, key) => {
    if (PUBLIC_QUERY_PARAM_ALLOWLIST.has(key)) {
      safeParams.set(key, value.slice(0, 100));
    }
  });

  const safeSearch = safeParams.toString();
  return safeSearch ? `?${safeSearch}` : "";
}

function getRouteGroup(pathname: string, portalArea: string) {
  const segments = sanitizePathname(pathname).split("/").filter(Boolean);

  if (!segments.length) {
    return "home";
  }

  if (portalArea === "admin" || portalArea === "client" || portalArea === "bum") {
    return [segments[0], segments[1] ?? "dashboard"].join("_");
  }

  return segments[0];
}

function buildAnalyticsPage(pathname: string, search: string) {
  const portalArea = getPortalArea(pathname);
  const sanitizedPathname = sanitizePathname(pathname);
  const safeSearch = sanitizeSearch(search, portalArea);
  const pagePath = `${sanitizedPathname}${safeSearch}`;
  const isPortalRoute = ["admin", "client", "bum", "portal"].includes(portalArea);

  return {
    pagePath,
    pageLocation: new URL(pagePath, window.location.origin).href,
    portalArea,
    routeGroup: getRouteGroup(pathname, portalArea),
    authGate: isPortalRoute ? "protected" : portalArea === "auth" ? "auth" : "public",
    isPortalRoute,
  };
}

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
