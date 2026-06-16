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

export function buildAnalyticsPage(pathname: string, search: string) {
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
