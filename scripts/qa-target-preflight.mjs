import dns from "node:dns/promises";
import net from "node:net";

const timeoutMs = Number(process.env.QA_TARGET_PREFLIGHT_TIMEOUT_MS ?? 15_000);

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Dependent hosted E2E suites should be skipped until it is set.`);
  }
  return value;
}

function createAbortSignal() {
  return AbortSignal.timeout(timeoutMs);
}

function formatAddress(address) {
  return `${address.address}/${address.family}`;
}

async function classifyStep(name, run) {
  try {
    const detail = await run();
    return { name, status: "pass", detail };
  } catch (error) {
    return { name, status: "fail", detail: error instanceof Error ? error.message : String(error) };
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: createAbortSignal(),
  });
  const text = await response.text();
  return { response, text };
}

async function checkDns(targetUrl) {
  const hostname = targetUrl.hostname;
  if (net.isIP(hostname)) {
    return `host is an IP address: ${hostname}`;
  }

  const addresses = await dns.lookup(hostname, { all: true });
  if (!addresses.length) {
    throw new Error(`no DNS addresses returned for ${hostname}`);
  }

  return `${hostname} -> ${addresses.map(formatAddress).join(", ")}`;
}

async function checkBaseHttp(targetUrl, state) {
  const { response, text } = await fetchText(targetUrl.href);
  state.baseResponse = response;
  state.baseText = text;

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} at ${response.url}`);
  }

  return `HTTP ${response.status} at ${response.url}`;
}

async function checkAppShell(state) {
  const text = state.baseText ?? "";
  if (!text.includes('<div id="root"></div>')) {
    throw new Error("app shell root element was not found in the base HTML");
  }
  if (!text.includes("<title>Trusted Bums</title>")) {
    throw new Error("Trusted Bums title was not found in the base HTML");
  }

  return "base HTML contains the Trusted Bums app shell";
}

async function checkClerkConfig() {
  getRequiredEnv("VITE_CLERK_PUBLISHABLE_KEY");
  getRequiredEnv("CLERK_SECRET_KEY");
  return "Clerk publishable and secret keys are configured for hosted auth helpers";
}

async function checkExtensionApi() {
  const extensionApiBaseUrl = process.env.QA_EXTENSION_API_BASE_URL?.trim();
  if (!extensionApiBaseUrl) {
    return "QA_EXTENSION_API_BASE_URL is not set; extension API suites should be skipped";
  }

  const contextUrl = new URL("context", extensionApiBaseUrl.endsWith("/") ? extensionApiBaseUrl : `${extensionApiBaseUrl}/`);
  const response = await fetch(contextUrl.href, {
    redirect: "manual",
    signal: createAbortSignal(),
  });
  const payload = await response.json().catch(() => ({}));

  if (response.status !== 401) {
    throw new Error(`anonymous extension context returned HTTP ${response.status}; expected 401`);
  }
  if (payload?.apiVersion !== "v1") {
    throw new Error("anonymous extension context did not return the stable v1 error envelope");
  }

  getRequiredEnv("QA_EXTENSION_API_TOKEN");
  return "anonymous extension API returns v1 401 and authenticated token is configured";
}

async function main() {
  const targetUrl = new URL(getRequiredEnv("QA_BASE_URL"));
  const state = {};
  const checks = [
    ["DNS", () => checkDns(targetUrl)],
    ["HTTPS", () => checkBaseHttp(targetUrl, state)],
    ["App shell", () => checkAppShell(state)],
    ["Clerk", () => checkClerkConfig()],
    ["Extension API", () => checkExtensionApi()],
  ];

  const results = [];
  for (const [name, run] of checks) {
    results.push(await classifyStep(name, run));
  }

  console.log(`QA target preflight for ${targetUrl.origin}`);
  for (const result of results) {
    console.log(`${result.status.toUpperCase()} ${result.name}: ${result.detail}`);
  }

  const failed = results.filter((result) => result.status === "fail");
  if (failed.length) {
    console.error(
      `Dependent hosted E2E suites should be skipped until preflight failures are fixed: ${failed
        .map((result) => result.name)
        .join(", ")}.`,
    );
    process.exit(1);
  }
}

await main();
