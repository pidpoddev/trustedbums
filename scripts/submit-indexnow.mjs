import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "src/data/publicRouteMetadata.json"), "utf8"));
const key = "c6e13fa24dba32bdab55120a5dab7df3";
const hostOrigin = process.env.INDEXNOW_HOST ?? manifest.siteOrigin;
const endpoint = process.env.INDEXNOW_ENDPOINT ?? "https://www.bing.com/indexnow";
const dryRun = process.argv.includes("--dry-run");

const urls = manifest.routes.map((route) => new URL(route.path, hostOrigin).href);

const payload = {
  host: new URL(hostOrigin).host,
  key,
  keyLocation: new URL(`/${key}.txt`, hostOrigin).href,
  urlList: urls,
};

if (dryRun) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const body = await response.text().catch(() => "");
  throw new Error(`IndexNow submission failed with HTTP ${response.status}: ${body}`);
}

console.log(`Submitted ${urls.length} URLs to IndexNow via ${endpoint}`);
