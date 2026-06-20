import { type Locator, type Page, type Request, type TestInfo } from "@playwright/test";
import { promises as fs } from "node:fs";
import path from "node:path";

export interface DeepQaIssue {
  severity: "P0" | "P1" | "P2";
  area: string;
  workflow: string;
  evidence: string;
  recommendation: string;
  url?: string;
}

export interface QaCreatedRecord {
  table: string;
  field: string;
  value: string;
}

export interface WorkflowQaAllowedFailure {
  method?: string;
  status?: number;
  urlPattern: RegExp;
  reason: string;
}

export interface DeepQaRouteResult {
  area: string;
  workflow: string;
  path: string;
  status: "passed" | "failed";
  durationMs: number;
  url?: string;
  evidence?: string;
}

const safeExploratoryActionPattern =
  /view|open|close|show|hide|expand|collapse|filter|search|clear|download|copy|cancel|details|help|faq|profile|settings|accessibility|feedback/i;

function getQaBaseOrigin() {
  return new URL(process.env.QA_BASE_URL ?? "http://127.0.0.1:8080").origin;
}

function isAppPageUrl(url: string) {
  if (!url || url === "about:blank" || url.startsWith("chrome-error://")) {
    return false;
  }

  try {
    return new URL(url).origin === getQaBaseOrigin();
  } catch {
    return false;
  }
}

export function createDeepQaRunId() {
  return `qa-deep-${new Date().toISOString().replace(/[:.]/g, "-")}`;
}

export function createWorkflowQaRunId() {
  return `qa-workflow-${new Date().toISOString().replace(/[:.]/g, "-")}`;
}

export function isDeepMutationEnabled() {
  return process.env.QA_DEEP_MUTATION === "1";
}

export function isWorkflowMutationEnabled() {
  return process.env.QA_WORKFLOW_MUTATION === "1" || isDeepMutationEnabled();
}

export function hasQaCleanupCredential() {
  const serviceRoleKey = process.env.QA_SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!serviceRoleKey.startsWith("eyJ")) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(serviceRoleKey.split(".")[1] ?? "", "base64url").toString("utf8")) as {
      role?: string;
    };
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

export function isQaCleanupSafeRecord(record: QaCreatedRecord) {
  const value = record.value.trim();
  return /(^qa[\s_-]|qa[\s_-]|@example\.invalid$|created by qa[\s_-]|playwright qa|qa_authorization)/i.test(value);
}

export async function attachLeadDevHotfixReport(
  testInfo: TestInfo,
  runId: string,
  issues: DeepQaIssue[],
  createdRecords: QaCreatedRecord[] = [],
  routeResults: DeepQaRouteResult[] = [],
) {
  const markdown = [
    `# Deep QA Hotfix Report`,
    ``,
    `Run id: \`${runId}\``,
    `Target: \`${process.env.QA_BASE_URL ?? "local preview"}\``,
    `Mutation mode: \`${isDeepMutationEnabled() ? "enabled" : "disabled"}\``,
    ``,
    `## Lead Dev Summary`,
    issues.length
      ? `Deep QA found ${issues.length} issue${issues.length === 1 ? "" : "s"} that should be triaged before treating this workflow as release-safe.`
      : `No hotfix-level issues were collected by this pass.`,
    ``,
    `## Hotfix Candidates`,
    ...(issues.length
      ? issues.map((issue, index) =>
          [
            `### ${index + 1}. ${issue.severity} - ${issue.area}: ${issue.workflow}`,
            `- Evidence: ${issue.evidence}`,
            `- Recommendation: ${issue.recommendation}`,
            issue.url ? `- URL: ${issue.url}` : undefined,
          ].filter(Boolean).join("\n"),
        )
      : [`None.`]),
    ``,
    `## Route Completion`,
    ...(routeResults.length
      ? routeResults.map((result) =>
          [
            `- ${result.status.toUpperCase()} ${result.area}: ${result.workflow} (${result.path}) in ${result.durationMs}ms`,
            result.url ? `  - URL: ${result.url}` : undefined,
            result.evidence ? `  - Evidence: ${result.evidence}` : undefined,
          ].filter(Boolean).join("\n"),
        )
      : [`No route-level results recorded.`]),
    ``,
    `## Created QA Records`,
    ...(createdRecords.length
      ? createdRecords.map((record) => `- ${record.table}.${record.field} = \`${record.value}\``)
      : [`None recorded.`]),
    ``,
  ].join("\n");

  await testInfo.attach("lead-dev-hotfix-report", {
    body: markdown,
    contentType: "text/markdown",
  });

  const outputPath = testInfo.outputPath(`deep-qa-hotfix-report-${runId}.md`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, markdown, "utf8");
}

export function installDeepQaMonitors(page: Page, issues: DeepQaIssue[], area: string | (() => string)) {
  const currentArea = () => (typeof area === "function" ? area() : area);

  page.on("pageerror", (error) => {
    if (!isAppPageUrl(page.url())) {
      return;
    }

    issues.push({
      severity: "P1",
      area: currentArea(),
      workflow: "Browser runtime",
      evidence: `Uncaught page error: ${error.message}`,
      recommendation: "Fix the runtime exception and add a focused regression test for the affected route.",
      url: page.url(),
    });
  });

  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 500 && isAppPageUrl(url) && !url.includes("clerk") && !url.includes("browser-intake")) {
      issues.push({
        severity: "P1",
        area: currentArea(),
        workflow: "Network request",
        evidence: `${status} response from ${url}`,
        recommendation: "Investigate the failed backend request and expose a user-actionable error in the UI.",
        url: page.url(),
      });
    }
  });
}

function isIgnoredWorkflowNoise(url: string) {
  return /browser-intake|clerk|ingest|analytics|clarity|googletagmanager|google-analytics|google\.com\/g\/collect|cloudflareinsights|performance-beacon/i.test(url);
}

function isIgnoredWorkflowConsoleError(text: string) {
  return /clarity\.ms|cloudflareinsights\.com|google\.com\/g\/collect|google-analytics\.com|googletagmanager\.com|Content Security Policy.*(clarity|google)|Failed to load resource: net::ERR_FAILED|Failed to load resource: the server responded with a status of \d+/i.test(
    text,
  );
}

function isIgnoredWorkflowRequestFailure(request: Request) {
  const url = request.url();
  const failureText = request.failure()?.errorText ?? "";
  if (isIgnoredWorkflowNoise(url)) {
    return true;
  }

  return failureText === "net::ERR_ABORTED" && ["GET", "HEAD"].includes(request.method());
}

function isWorkflowRelevantUrl(url: string) {
  if (isIgnoredWorkflowNoise(url)) {
    return false;
  }

  if (isAppPageUrl(url)) {
    return true;
  }

  return /\/rest\/v1\/|\/functions\/v1\/|\.supabase\.co\//i.test(url);
}

function isAllowedWorkflowFailure(requestMethod: string, status: number | undefined, url: string, allowedFailures: WorkflowQaAllowedFailure[]) {
  return allowedFailures.some((allowed) => {
    const methodMatches = !allowed.method || allowed.method.toUpperCase() === requestMethod.toUpperCase();
    const statusMatches = allowed.status === undefined || allowed.status === status;
    return methodMatches && statusMatches && allowed.urlPattern.test(url);
  });
}

export function installWorkflowQaErrorGate(
  page: Page,
  issues: DeepQaIssue[],
  area: string | (() => string),
  allowedFailures: WorkflowQaAllowedFailure[] = [],
) {
  const currentArea = () => (typeof area === "function" ? area() : area);

  page.on("pageerror", (error) => {
    if (!isAppPageUrl(page.url())) {
      return;
    }

    issues.push({
      severity: "P1",
      area: currentArea(),
      workflow: "Workflow runtime",
      evidence: `Uncaught page error: ${error.message}`,
      recommendation: "Fix the runtime exception before treating the role workflow as UAT-safe.",
      url: page.url(),
    });
  });

  page.on("console", (message) => {
    if (message.type() !== "error" || !isAppPageUrl(page.url())) {
      return;
    }

    if (isIgnoredWorkflowConsoleError(message.text())) {
      return;
    }

    issues.push({
      severity: "P1",
      area: currentArea(),
      workflow: "Browser console",
      evidence: `Console error: ${message.text()}`,
      recommendation: "Treat red console output during role workflow QA as a product or harness blocker until explained.",
      url: page.url(),
    });
  });

  page.on("requestfailed", (request) => {
    const url = request.url();
    const method = request.method();
    if (
      !isWorkflowRelevantUrl(url) ||
      isIgnoredWorkflowRequestFailure(request) ||
      isAllowedWorkflowFailure(method, undefined, url, allowedFailures)
    ) {
      return;
    }

    issues.push({
      severity: "P1",
      area: currentArea(),
      workflow: "Network request",
      evidence: `${method} request failed for ${url}: ${request.failure()?.errorText ?? "unknown failure"}`,
      recommendation: "Fix failed app/Supabase requests or explicitly document the expected negative-proof denial.",
      url: page.url(),
    });
  });

  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();
    const method = response.request().method();
    if (status < 400 || !isWorkflowRelevantUrl(url) || isAllowedWorkflowFailure(method, status, url, allowedFailures)) {
      return;
    }

    issues.push({
      severity: "P1",
      area: currentArea(),
      workflow: "Network response",
      evidence: `${method} ${status} response from ${url}`,
      recommendation: "Fix RLS/API failures before closing the workflow, or add a scoped allowed failure for deliberate negative proof.",
      url: page.url(),
    });
  });
}

async function buttonLabel(button: Locator) {
  return button.evaluate((element) => {
    const ariaLabel = element.getAttribute("aria-label")?.trim();
    const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
    const title = element.getAttribute("title")?.trim();
    return ariaLabel || text || title || "";
  });
}

export async function collectVisibleErrorText(page: Page) {
  const bodyText = await page.locator("body").innerText().catch(() => "");
  return bodyText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /unable to|something went wrong|application error|please try again|failed|not authorized|configuration needed/i.test(line))
    .slice(0, 8);
}

export async function exploreVisibleNonDestructiveButtons(page: Page, issues: DeepQaIssue[], area: string, workflow: string) {
  const buttons = page.getByRole("button");
  const count = await buttons.count();

  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    if (!(await button.isVisible().catch(() => false)) || !(await button.isEnabled().catch(() => false))) {
      continue;
    }

    const label = await buttonLabel(button);
    if (!label) {
      const box = await button.boundingBox().catch(() => null);
      issues.push({
        severity: "P2",
        area,
        workflow,
        evidence: `Visible enabled button ${index + 1}${box ? ` at ${Math.round(box.x)},${Math.round(box.y)}` : ""} has no accessible name.`,
        recommendation: "Give every interactive button visible text, aria-label, title, or equivalent accessible name.",
        url: page.url(),
      });
      continue;
    }

    await button.click({ timeout: 5_000, trial: true }).catch((error) => {
      issues.push({
        severity: "P2",
        area,
        workflow,
        evidence: `Button "${label}" is not operable by Playwright actionability checks: ${error instanceof Error ? error.message : String(error)}`,
        recommendation: "Confirm the control is reachable, enabled, visible, and not obscured; add a focused interaction regression test.",
        url: page.url(),
      });
    });

    if (!safeExploratoryActionPattern.test(label)) {
      continue;
    }

    await button.click({ timeout: 5_000 }).catch((error) => {
      issues.push({
        severity: "P2",
        area,
        workflow,
        evidence: `Button "${label}" could not be clicked: ${error instanceof Error ? error.message : String(error)}`,
        recommendation: "Confirm the control is reachable and not obscured; add a focused interaction regression test.",
        url: page.url(),
      });
    });
    await page.keyboard.press("Escape").catch(() => undefined);
  }

  const visibleErrors = await collectVisibleErrorText(page);
  for (const errorText of visibleErrors) {
    issues.push({
      severity: "P1",
      area,
      workflow,
      evidence: `Visible error after safe button exploration: ${errorText}`,
      recommendation: "Reproduce the workflow manually, fix the failed action, and add coverage for the user-facing error state.",
      url: page.url(),
    });
  }
}

async function deleteByField(table: string, field: string, value: string) {
  const supabaseUrl = process.env.QA_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.QA_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { skipped: true, reason: "Set QA_SUPABASE_URL/VITE_SUPABASE_URL and QA_SUPABASE_SERVICE_ROLE_KEY to enable cleanup." };
  }

  if (!hasQaCleanupCredential()) {
    return { skipped: true, reason: "QA_SUPABASE_SERVICE_ROLE_KEY is not a Supabase service_role JWT accepted by the REST cleanup path." };
  }

  if (table === "companies" && field === "name") {
    const lookupUrl = new URL("/rest/v1/companies", supabaseUrl);
    lookupUrl.searchParams.set("select", "id");
    lookupUrl.searchParams.set("name", `eq.${value}`);

    const lookupResponse = await fetch(lookupUrl, {
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (!lookupResponse.ok) {
      return { skipped: false, reason: `company lookup failed: ${lookupResponse.status} ${await lookupResponse.text()}` };
    }

    const companies = (await lookupResponse.json().catch(() => [])) as Array<{ id?: string }>;
    for (const company of companies) {
      if (!company.id) continue;
      const domainCleanup = await deleteByField("company_domains", "company_id", company.id);
      if (domainCleanup.skipped || domainCleanup.reason !== "deleted") return domainCleanup;
      const targetCleanup = await deleteByField("customer_targets", "target_company_id", company.id);
      if (targetCleanup.skipped || targetCleanup.reason !== "deleted") return targetCleanup;
    }
  }

  const url = new URL(`/rest/v1/${table}`, supabaseUrl);
  url.searchParams.set(field, `eq.${value}`);

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      prefer: "return=minimal",
    },
  });

  if (!response.ok) {
    return { skipped: false, reason: `${response.status} ${await response.text()}` };
  }

  const verifyUrl = new URL(`/rest/v1/${table}`, supabaseUrl);
  verifyUrl.searchParams.set("select", field);
  verifyUrl.searchParams.set(field, `eq.${value}`);

  const verifyResponse = await fetch(verifyUrl, {
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      prefer: "count=exact",
    },
  });

  if (!verifyResponse.ok) {
    return { skipped: false, reason: `cleanup verification failed: ${verifyResponse.status} ${await verifyResponse.text()}` };
  }

  const remainingRows = (await verifyResponse.json().catch(() => [])) as unknown[];
  if (remainingRows.length > 0) {
    return { skipped: false, reason: `cleanup verification found ${remainingRows.length} remaining ${table} row(s)` };
  }

  return { skipped: false, reason: "deleted" };
}

export async function cleanupCreatedRecords(records: QaCreatedRecord[], issues: DeepQaIssue[]) {
  const cleanupOrder: Record<string, number> = {
    opportunity_registrations: 0,
    customer_targets: 1,
    companies: 2,
  };
  const orderedRecords = [...records].sort((a, b) => (cleanupOrder[a.table] ?? 1) - (cleanupOrder[b.table] ?? 1));

  for (const record of orderedRecords) {
    if (!isQaCleanupSafeRecord(record)) {
      issues.push({
        severity: "P1",
        area: "QA cleanup",
        workflow: record.table,
        evidence: `Cleanup refused for ${record.table}.${record.field}=${record.value} because the value is not visibly QA-owned.`,
        recommendation: "Use a qa-* run id, QA-prefixed display value, qa_authorization marker, or example.invalid email before creating mutating QA data.",
      });
      continue;
    }

    const result = await deleteByField(record.table, record.field, record.value);
    if (result.skipped) {
      issues.push({
        severity: "P2",
        area: "QA cleanup",
        workflow: record.table,
        evidence: `Cleanup skipped for ${record.table}.${record.field}=${record.value}. ${result.reason}`,
        recommendation: "Provide the QA cleanup service-role env only in the protected QA environment, or add an admin cleanup endpoint scoped to qa-deep records.",
      });
      continue;
    }

    if (result.reason !== "deleted") {
      issues.push({
        severity: "P1",
        area: "QA cleanup",
        workflow: record.table,
        evidence: `Cleanup failed for ${record.table}.${record.field}=${record.value}: ${result.reason}`,
        recommendation: "Fix cleanup permissions before expanding mutating deep QA coverage.",
      });
    }
  }
}
