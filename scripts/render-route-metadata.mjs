import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const manifest = JSON.parse(readFileSync(join(root, "src/data/publicRouteMetadata.json"), "utf8"));
const template = readFileSync(join(distDir, "index.html"), "utf8");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function setTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`Missing metadata tag for ${replacement}`);
  return html.replace(pattern, replacement);
}

function renderRouteHtml(route) {
  const canonicalUrl = `${manifest.siteOrigin}${route.path}`;
  const imageUrl = `${manifest.siteOrigin}${manifest.imagePath}`;
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);

  let html = template;
  html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = setTag(html, /<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${description}" />`);
  html = setTag(html, /<link\s+rel="canonical"[\s\S]*?\/>/, `<link rel="canonical" href="${canonicalUrl}" />`);
  html = setTag(html, /<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${title}" />`);
  html = setTag(html, /<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${description}" />`);
  html = setTag(html, /<meta\s+property="og:url"[\s\S]*?\/>/, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = setTag(html, /<meta\s+property="og:image"[\s\S]*?\/>/, `<meta property="og:image" content="${imageUrl}" />`);
  html = setTag(html, /<meta\s+name="twitter:title"[\s\S]*?\/>/, `<meta name="twitter:title" content="${title}" />`);
  html = setTag(html, /<meta\s+name="twitter:description"[\s\S]*?\/>/, `<meta name="twitter:description" content="${description}" />`);
  html = setTag(html, /<meta\s+name="twitter:image"[\s\S]*?\/>/, `<meta name="twitter:image" content="${imageUrl}" />`);
  return html;
}

for (const route of manifest.routes) {
  if (route.title.length > manifest.maxTitleLength) {
    throw new Error(`${route.path} title exceeds ${manifest.maxTitleLength} characters: ${route.title}`);
  }

  const target = route.path === "/" ? join(distDir, "index.html") : join(distDir, route.path, "index.html");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, renderRouteHtml(route));
}

console.log(`Rendered ${manifest.routes.length} route metadata files.`);
