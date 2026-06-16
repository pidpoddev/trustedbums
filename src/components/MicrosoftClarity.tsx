import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { buildAnalyticsPage } from "@/lib/analyticsPage";
import { canUseConsentCategory } from "@/lib/consent";

type ClarityFunction = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFunction;
  }
}

const clarityProjectId = import.meta.env.VITE_MICROSOFT_CLARITY_PROJECT_ID || "x7nevilplm";
const scriptId = "trustedbums-microsoft-clarity";

function loadMicrosoftClarity() {
  window.clarity = window.clarity ?? function clarity(...args: unknown[]) {
    window.clarity!.q = window.clarity!.q ?? [];
    window.clarity!.q.push(args);
  };

  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(clarityProjectId)}?ref=bwt`;
    document.head.appendChild(script);
  }
}

export function MicrosoftClarity() {
  const location = useLocation();

  useEffect(() => {
    if (!clarityProjectId) {
      return;
    }

    const syncClarity = () => {
      if (!canUseConsentCategory("analytics")) {
        window.clarity?.("consent", false);
        return;
      }

      loadMicrosoftClarity();
      window.clarity?.("consent", true);
      const page = buildAnalyticsPage(location.pathname, location.search);
      window.clarity?.("set", "auth_gate", page.authGate);
      window.clarity?.("set", "is_portal_route", page.isPortalRoute ? "true" : "false");
      window.clarity?.("set", "portal_area", page.portalArea);
      window.clarity?.("set", "route_group", page.routeGroup);
    };

    syncClarity();
    window.addEventListener("trustedbums:consent-change", syncClarity);

    return () => {
      window.removeEventListener("trustedbums:consent-change", syncClarity);
    };
  }, [location.pathname, location.search]);

  return null;
}
