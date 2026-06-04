import { type Locator, type Page, type TestInfo } from "@playwright/test";
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

const safeExploratoryActionPattern =
  /view|open|close|show|hide|expand|collapse|filter|search|clear|download|copy|cancel|details|help|faq|profile|settings|accessibility|feedback/i;

export function createDeepQaRunId() {
  return `qa-deep-${new Date().toISOString().replace(/[:.]/g, "-")}`;
}

export function isDeepMutationEnabled() {
  return process.env.QA_DEEP_MUTATION === "1";
}

export async function attachLeadDevHotfixReport(testInfo: TestInfo, runId: string, issues: DeepQaIssue[], createdRecords: QaCreatedRecord[] = []) {
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

export function installDeepQaMonitors(page: Page, issues: DeepQaIssue[], area: string) {
  page.on("pageerror", (error) => {
    issues.push({
      severity: "P1",
      area,
      workflow: "Browser runtime",
      evidence: `Uncaught page error: ${error.message}`,
      recommendation: "Fix the runtime exception and add a focused regression test for the affected route.",
      url: page.url(),
    });
  });

  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 500 && !url.includes("clerk") && !url.includes("browser-intake")) {
      issues.push({
        severity: "P1",
        area,
        workflow: "Network request",
        evidence: `${status} response from ${url}`,
        recommendation: "Investigate the failed backend request and expose a user-actionable error in the UI.",
        url: page.url(),
      });
    }
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

  return { skipped: false, reason: "deleted" };
}

export async function cleanupCreatedRecords(records: QaCreatedRecord[], issues: DeepQaIssue[]) {
  for (const record of records) {
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
