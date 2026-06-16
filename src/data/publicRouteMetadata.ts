import manifest from "./publicRouteMetadata.json";

export interface PublicRouteMetadata {
  path: string;
  title: string;
  description: string;
}

export const siteOrigin = manifest.siteOrigin;
export const defaultImage = `${manifest.siteOrigin}${manifest.imagePath}`;
export const maxPublicRouteTitleLength = manifest.maxTitleLength;
export const publicRouteMetadata = manifest.routes as PublicRouteMetadata[];

export function getCanonicalPublicPath(path: string | undefined) {
  if (!path || path === "/") return "/";

  const normalized = path.replace(/\/$/, "");
  const route = publicRouteMetadata.find((candidate) => candidate.path === normalized);
  if (!route || route.path === "/") {
    return path;
  }

  return `${route.path}/`;
}

export function getPublicRouteMetadata(path: string | undefined) {
  if (!path) return undefined;
  const normalized = path.length > 1 ? path.replace(/\/$/, "") : path;
  return publicRouteMetadata.find((route) => route.path === normalized);
}
