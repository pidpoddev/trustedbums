import { useEffect } from "react";
import { defaultImage, getCanonicalPublicPath, getPublicRouteMetadata, siteOrigin } from "@/data/publicRouteMetadata";

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  element.href = href;
}

export function RouteMetadata({
  routePath,
  title,
  description,
  path,
}: {
  routePath?: string;
  title?: string;
  description?: string;
  path?: string;
}) {
  useEffect(() => {
    const routeMetadata = getPublicRouteMetadata(routePath ?? path ?? window.location.pathname);
    const resolvedTitle = title ?? routeMetadata?.title ?? "Trusted Bums";
    const resolvedDescription =
      description ??
      routeMetadata?.description ??
      "Warm introduction strategy for hard-to-reach target accounts.";
    const canonicalPath = getCanonicalPublicPath(path ?? routeMetadata?.path ?? window.location.pathname);
    const canonicalUrl = `${siteOrigin}${canonicalPath}`;
    document.title = resolvedTitle;
    upsertCanonical(canonicalUrl);
    upsertMeta('meta[name="description"]', { name: "description", content: resolvedDescription });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: resolvedTitle });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: resolvedDescription });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: defaultImage });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: resolvedTitle });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: resolvedDescription });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: defaultImage });
  }, [description, path, routePath, title]);

  return null;
}
