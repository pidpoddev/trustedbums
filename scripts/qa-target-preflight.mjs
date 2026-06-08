import dns from "node:dns/promises";
import { mkdir, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";

const timeoutMs = Number(process.env.QA_TARGET_PREFLIGHT_TIMEOUT_MS ?? 15_000);
const outputDir = process.env.QA_TARGET_PREFLIGHT_OUTPUT_DIR?.trim() || "test-results/qa-target-preflight";
const fetchAttempts = Number(process.env.QA_TARGET_PREFLIGHT_FETCH_ATTEMPTS ?? 6);
const fetchRetryDelayMs = Number(process.env.QA_TARGET_PREFLIGHT_FETCH_RETRY_DELAY_MS ?? 5_000);

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Dependent hosted E2E suites should be skipped until it is set.`);
  }
  return value;
}

function hasDynamicExtensionAuth() {
  return Boolean(
    process.env.QA_BUM_EMAIL?.trim() &&
      (process.env.CLERK_SECRET_KEY?.trim() || process.env.QA_BUM_PASSWORD?.trim()),
  );
}

function createAbortSignal() {
  return AbortSignal.timeout(timeoutMs);
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatAddress(address) {
  return `${address.address}/${address.family}`;
}

async function classifyStep(name, run) {
  try {
    const result = await run();
    if (typeof result === "object" && result !== null && "status" in result && "detail" in result) {
      return { name, status: result.status, detail: result.detail };
    }
    return { name, status: "pass", detail: result };
  } catch (error) {
    return { name, status: "fail", detail: error instanceof Error ? error.message : String(error) };
  }
}

async function fetchText(url) {
  let lastError;

  for (let attempt = 1; attempt <= fetchAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: createAbortSignal(),
      });
      const text = await response.text();
      return { response, text, attempt };
    } catch (error) {
      lastError = error;
      if (attempt < fetchAttempts) {
        await delay(fetchRetryDelayMs);
      }
    }
  }

  throw lastError;
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
  const { response, text, attempt } = await fetchText(targetUrl.href);
  state.baseResponse = response;
  state.baseText = text;

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} at ${response.url}`);
  }

  return `HTTP ${response.status} at ${response.url}${attempt > 1 ? ` after ${attempt} attempts` : ""}`;
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
  const expectation = (process.env.QA_EXTENSION_API_EXPECTATION?.trim().toLowerCase() || "optional");
  if (!["required", "optional", "skip"].includes(expectation)) {
    throw new Error("QA_EXTENSION_API_EXPECTATION must be one of: required, optional, skip");
  }

  if (expectation === "skip") {
    return {
      status: "skip",
      detail: "extension API coverage intentionally skipped by QA_EXTENSION_API_EXPECTATION=skip",
    };
  }

  const extensionApiBaseUrl = process.env.QA_EXTENSION_API_BASE_URL?.trim();
  if (!extensionApiBaseUrl) {
    if (expectation === "required") {
      throw new Error("Missing QA_EXTENSION_API_BASE_URL while QA_EXTENSION_API_EXPECTATION=required");
    }
    return {
      status: "skip",
      detail: "QA_EXTENSION_API_BASE_URL is not set; extension API coverage intentionally skipped by QA_EXTENSION_API_EXPECTATION=optional",
    };
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

  if (hasDynamicExtensionAuth()) {
    return "anonymous extension API returns v1 401 and fresh Bum session auth is configured for Playwright smoke";
  }

  const extensionApiToken = getRequiredEnv("QA_EXTENSION_API_TOKEN");
  const authenticatedResponse = await fetch(contextUrl.href, {
    headers: { Authorization: `Bearer ${extensionApiToken}` },
    redirect: "manual",
    signal: createAbortSignal(),
  });
  const authenticatedPayload = await authenticatedResponse.json().catch(() => ({}));

  if (!authenticatedResponse.ok) {
    const detail = authenticatedPayload?.error
      ? `: ${authenticatedPayload.error}`
      : "";
    throw new Error(`authenticated extension context returned HTTP ${authenticatedResponse.status}${detail}`);
  }
  if (authenticatedPayload?.apiVersion !== "v1") {
    throw new Error("authenticated extension context did not return the stable v1 envelope");
  }
  if (!authenticatedPayload?.profile?.id || !authenticatedPayload?.profile?.role) {
    throw new Error("authenticated extension context did not include a profile id and role");
  }

  return "anonymous extension API returns v1 401 and authenticated context is verified";
}

async function writePreflightArtifact({ targetUrl, results }) {
  const generatedAt = new Date().toISOString();
  const failed = results.filter((result) => result.status === "fail");
  const skipped = results.filter((result) => result.status === "skip");
  const payload = {
    generatedAt,
    target: targetUrl.origin,
    timeoutMs,
    status: failed.length ? "fail" : "pass",
    failedChecks: failed.map((result) => result.name),
    skippedChecks: skipped.map((result) => result.name),
    results,
  };
  const lines = [
    `QA target preflight for ${targetUrl.origin}`,
    `Generated: ${generatedAt}`,
    `Status: ${payload.status.toUpperCase()}`,
    "",
    ...results.map((result) => `${result.status.toUpperCase()} ${result.name}: ${result.detail}`),
  ];

  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDir, "summary.json"), `${JSON.stringify(payload, null, 2)}\n`),
    writeFile(path.join(outputDir, "summary.txt"), `${lines.join("\n")}\n`),
  ]);
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

  await writePreflightArtifact({ targetUrl, results });

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
