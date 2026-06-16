import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "src/data/publicRouteMetadata.json"), "utf8"));
const endpoint = "https://ssl.bing.com/webmaster/api.svc/json";
const indexNowEndpoint = process.env.INDEXNOW_ENDPOINT ?? "https://www.bing.com/indexnow";
const indexNowKey = "c6e13fa24dba32bdab55120a5dab7df3";

function getArgs(argv) {
  const [command, ...rawArgs] = argv.slice(2);
  const args = {};

  for (const rawArg of rawArgs) {
    if (!rawArg.startsWith("--")) {
      continue;
    }

    const [key, ...valueParts] = rawArg.slice(2).split("=");
    args[key] = valueParts.length ? valueParts.join("=") : "true";
  }

  return { command, args };
}

function getSiteOrigin(args) {
  return args.site ?? process.env.BING_SITE_URL ?? manifest.siteOrigin;
}

function getSitemapUrl(args) {
  return args.sitemap ?? new URL("/sitemap.xml", getSiteOrigin(args)).href;
}

function getApiKey() {
  const apiKey = process.env.BING_WEBMASTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing BING_WEBMASTER_API_KEY. Generate it in Bing Webmaster Tools before using Webmaster API commands.");
  }
  return apiKey;
}

function publicUrls(siteOrigin) {
  return manifest.routes
    .filter((route) => route.path !== "/login")
    .map((route) => new URL(route.path === "/" ? "/" : `${route.path}/`, siteOrigin).href);
}

async function readResponse(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function bingRequest(methodName, { method = "GET", body, query = {} } = {}) {
  const url = new URL(`${endpoint}/${methodName}`);
  url.searchParams.set("apikey", getApiKey());
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json; charset=utf-8" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await readResponse(response);

  if (!response.ok) {
    throw new Error(`Bing Webmaster API ${methodName} failed with HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

function quotaRemainingFromError(error) {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/Quota remaining for today:\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

async function submitFeed(args) {
  const siteUrl = getSiteOrigin(args);
  const feedUrl = getSitemapUrl(args);
  const payload = await bingRequest("SubmitFeed", {
    method: "POST",
    body: { siteUrl, feedUrl },
  });

  console.log(JSON.stringify({ action: "submit-feed", siteUrl, feedUrl, response: payload }, null, 2));
}

async function submitUrls(args) {
  const siteUrl = getSiteOrigin(args);
  const urlList = publicUrls(siteUrl);
  let submittedUrls = urlList;
  let payload = null;

  try {
    payload = await bingRequest("SubmitUrlBatch", {
      method: "POST",
      body: { siteUrl, urlList },
    });
  } catch (error) {
    const remainingQuota = quotaRemainingFromError(error);
    if (remainingQuota === null) {
      throw error;
    }

    if (remainingQuota <= 0) {
      console.warn(`Bing Webmaster URL quota is exhausted; skipping ${urlList.length} URL submissions.`);
      console.log(JSON.stringify({ action: "submit-url-batch", siteUrl, urlCount: 0, skippedUrlCount: urlList.length, reason: "quota-exhausted" }, null, 2));
      return;
    }

    submittedUrls = urlList.slice(0, remainingQuota);
    console.warn(`Bing Webmaster URL quota only has ${remainingQuota} submissions remaining; submitting a reduced batch.`);
    payload = await bingRequest("SubmitUrlBatch", {
      method: "POST",
      body: { siteUrl, urlList: submittedUrls },
    });
  }

  console.log(JSON.stringify({ action: "submit-url-batch", siteUrl, urlCount: submittedUrls.length, skippedUrlCount: urlList.length - submittedUrls.length, response: payload }, null, 2));
}

async function traffic(args) {
  const siteUrl = getSiteOrigin(args);
  const payload = await bingRequest("GetRankAndTrafficStats", {
    query: { siteUrl },
  });

  const rows = Array.isArray(payload?.d) ? payload.d : [];
  console.log(JSON.stringify({ action: "traffic", siteUrl, rowCount: rows.length, rows }, null, 2));
}

async function health(args) {
  const siteUrl = getSiteOrigin(args);
  const sitemapUrl = getSitemapUrl(args);
  const keyUrl = new URL(`/${indexNowKey}.txt`, siteUrl).href;
  const urls = [
    { name: "home", url: siteUrl },
    { name: "robots", url: new URL("/robots.txt", siteUrl).href },
    { name: "sitemap", url: sitemapUrl },
    { name: "indexnow-key", url: keyUrl },
  ];
  const checks = [];

  for (const item of urls) {
    const response = await fetch(item.url, { redirect: "follow" });
    const body = await response.text().catch(() => "");
    checks.push({
      name: item.name,
      url: item.url,
      status: response.status,
      contentType: response.headers.get("content-type"),
      ok: response.ok,
      hasBingVerification: item.name === "home" ? body.includes('name="msvalidate.01"') : undefined,
      hasSitemapDirective: item.name === "robots" ? body.includes(`Sitemap: ${sitemapUrl}`) : undefined,
      hasUrlset: item.name === "sitemap" ? body.includes("<urlset") : undefined,
      hasIndexNowKey: item.name === "indexnow-key" ? body.trim() === indexNowKey : undefined,
    });
  }

  console.log(JSON.stringify({ action: "health", siteUrl, checks }, null, 2));
}

async function submitIndexNow(args) {
  const siteUrl = getSiteOrigin(args);
  const urlList = publicUrls(siteUrl);
  const payload = {
    host: new URL(siteUrl).host,
    key: indexNowKey,
    keyLocation: new URL(`/${indexNowKey}.txt`, siteUrl).href,
    urlList,
  };

  const response = await fetch(indexNowEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const responsePayload = await readResponse(response);

  if (!response.ok) {
    throw new Error(`IndexNow submission failed with HTTP ${response.status}: ${JSON.stringify(responsePayload)}`);
  }

  console.log(JSON.stringify({ action: "indexnow", endpoint: indexNowEndpoint, urlCount: urlList.length, response: responsePayload }, null, 2));
}

function printHelp() {
  console.log(`Usage:
  pnpm bing:health
  pnpm bing:indexnow
  pnpm bing:webmaster submit-feed
  pnpm bing:webmaster submit-urls
  pnpm bing:webmaster traffic

Required for Webmaster API commands:
  BING_WEBMASTER_API_KEY

Optional args:
  --site=https://trustedbums.com
  --sitemap=https://trustedbums.com/sitemap.xml`);
}

async function main() {
  const { command, args } = getArgs(process.argv);

  if (!command || command === "help" || args.help) {
    printHelp();
    return;
  }

  if (command === "health") {
    await health(args);
    return;
  }

  if (command === "indexnow") {
    await submitIndexNow(args);
    return;
  }

  if (command === "submit-feed") {
    await submitFeed(args);
    return;
  }

  if (command === "submit-urls") {
    await submitUrls(args);
    return;
  }

  if (command === "traffic") {
    await traffic(args);
    return;
  }

  throw new Error(`Unknown command "${command}".`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
