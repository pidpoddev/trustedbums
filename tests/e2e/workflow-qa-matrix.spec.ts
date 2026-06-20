import { Buffer } from "node:buffer";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { getQaAccount, goToAuthedPath, hasExternalQaTarget, type QaAccount } from "./helpers/auth";
import {
  cleanupCreatedRecords,
  createWorkflowQaRunId,
  hasQaCleanupCredential,
  installWorkflowQaErrorGate,
  isWorkflowMutationEnabled,
  type DeepQaIssue,
  type QaCreatedRecord,
} from "./helpers/deepQa";

async function publishQaOpportunity(page: Page, account: QaAccount, runId: string, targetAccount: string) {
  await goToAuthedPath(page, account, "/client/opportunities/new");
  await expect(page.getByRole("heading", { name: /Opportunities|New opportunity/i }).first()).toBeVisible({ timeout: 20_000 });

  await page.getByLabel("Customer account name", { exact: true }).fill(targetAccount);
  await page.getByLabel("Business unit / department", { exact: true }).fill("QA workflow");
  await page.getByLabel("Your internal contact", { exact: true }).fill("QA Client Member");
  await page.getByLabel("Trusted Bums owner", { exact: true }).fill("QA Owner");
  await page.getByLabel("Expected product/service", { exact: true }).fill("Workflow QA validation");
  await page.getByLabel("Estimated deal value", { exact: true }).fill("25000");
  await page.getByLabel("Expected timeline", { exact: true }).fill("QA run only");
  await page.getByLabel("Opportunity description", { exact: true }).fill(`Created by ${runId}; safe to delete; do not use for business.`);
  await page.getByLabel("Notes", { exact: true }).fill(`Created by ${runId}; safe to delete after workflow QA.`);

  const createResponsePromise = page.waitForResponse(
    (response) => response.url().includes("/rest/v1/opportunity_registrations") && response.request().method() === "POST",
    { timeout: 20_000 },
  );
  await page.getByRole("button", { name: /publish opportunity to bums/i }).click();
  const createResponse = await createResponsePromise;
  expect(createResponse.ok(), await createResponse.text().catch(() => `POST returned ${createResponse.status()}`)).toBe(true);

  await expect(page.locator("#main-content").getByText("Opportunity published to Bums")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(targetAccount).first()).toBeVisible({ timeout: 20_000 });
}

async function expectAdminCanSeeOpportunity(page: Page, account: QaAccount, targetAccount: string) {
  await goToAuthedPath(page, account, "/admin/opportunities");

  if (await page.getByRole("heading", { name: "Opportunities" }).isVisible({ timeout: 5_000 }).catch(() => false)) {
    await page.getByRole("tab", { name: "Opportunity Registrations" }).click({ timeout: 15_000 });
  } else {
    await expect(page.getByText("Opportunity Registrations").first()).toBeVisible({ timeout: 15_000 });
  }

  await expect(page.getByText(targetAccount).first()).toBeVisible({ timeout: 20_000 });
}

async function expectBumCanSeeOpportunity(page: Page, account: QaAccount, targetAccount: string) {
  await goToAuthedPath(page, account, "/bum/opportunities");
  await expect(page.getByRole("heading", { name: "Opportunities" }).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(targetAccount).first()).toBeVisible({ timeout: 20_000 });
}

async function deleteUnclaimedOpportunity(page: Page, account: QaAccount, targetAccount: string) {
  await goToAuthedPath(page, account, "/client/opportunities");
  await expect(page.getByRole("heading", { name: /Opportunities|New opportunity/i }).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(targetAccount).first()).toBeVisible({ timeout: 20_000 });

  const opportunityRow = page.getByRole("row").filter({ hasText: targetAccount }).first();
  await expect(opportunityRow).toBeVisible({ timeout: 20_000 });

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(targetAccount);
    await dialog.accept();
  });

  const deleteResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/rest/v1/opportunity_registrations") &&
      response.url().includes("select=id") &&
      response.request().method() === "DELETE",
    { timeout: 20_000 },
  );
  await opportunityRow.getByRole("button", { name: /delete/i }).click();
  const deleteResponse = await deleteResponsePromise;
  const deletePayload = await deleteResponse.text().catch(() => "");
  expect(deleteResponse.ok(), deletePayload || `DELETE returned ${deleteResponse.status()}`).toBe(true);
  expect(deletePayload, "Client delete must return the deleted QA opportunity row instead of silently deleting zero rows.").toContain(targetAccount);

  await expect(page.getByText(targetAccount).first()).toBeHidden({ timeout: 20_000 });
  await page.reload();
  await expect(page.getByText(targetAccount).first()).toBeHidden({ timeout: 20_000 });
}

function requireQaAccount(prefix: string) {
  const account = getQaAccount(prefix);
  expect(account, `Set QA_${prefix}_EMAIL before running workflow QA mutation.`).toBeTruthy();
  return account!;
}

const bumProfileSnapshotColumns = [
  "user_id",
  "headline",
  "bio",
  "linkedin_url",
  "years_experience",
  "availability_status",
  "home_region",
  "industries",
  "regions",
  "products_sold",
  "buyer_personas",
  "worked_with_companies",
  "relationship_companies",
  "certifications",
  "skills",
  "notable_wins",
  "is_visible_to_clients",
  "last_linkedin_imported_at",
] as const;

type BumProfileSnapshot = {
  existed: boolean;
  data: Record<(typeof bumProfileSnapshotColumns)[number], unknown> | null;
};

function requireQaRestConfig() {
  const supabaseUrl = process.env.QA_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.QA_SUPABASE_SERVICE_ROLE_KEY;
  expect(supabaseUrl, "Set QA_SUPABASE_URL or VITE_SUPABASE_URL before workflow QA mutation.").toBeTruthy();
  expect(serviceRoleKey, "Set QA_SUPABASE_SERVICE_ROLE_KEY before workflow QA mutation.").toBeTruthy();

  return { supabaseUrl: supabaseUrl!, serviceRoleKey: serviceRoleKey! };
}

function qaRestHeaders(serviceRoleKey: string, prefer?: string) {
  return {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    ...(prefer ? { prefer } : {}),
  };
}

async function readBumProfileSnapshot(userId: string): Promise<BumProfileSnapshot> {
  const { supabaseUrl, serviceRoleKey } = requireQaRestConfig();
  const url = new URL("/rest/v1/bum_profiles", supabaseUrl);
  url.searchParams.set("select", bumProfileSnapshotColumns.join(","));
  url.searchParams.set("user_id", `eq.${userId}`);
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: qaRestHeaders(serviceRoleKey),
  });
  expect(response.ok, await response.text().catch(() => `GET returned ${response.status}`)).toBe(true);

  const rows = (await response.json().catch(() => [])) as Record<(typeof bumProfileSnapshotColumns)[number], unknown>[];
  return { existed: rows.length > 0, data: rows[0] ?? null };
}

async function getCurrentClerkUserId(page: Page) {
  const userId = await page.evaluate(() => window.Clerk?.user?.id ?? null);
  expect(userId, "Workflow QA could not read the signed-in Clerk user id for the Bum profile restore point.").toBeTruthy();
  return userId!;
}

async function restoreBumProfileSnapshot(userId: string, snapshot: BumProfileSnapshot, issues: DeepQaIssue[], runId: string) {
  const { supabaseUrl, serviceRoleKey } = requireQaRestConfig();
  const url = new URL("/rest/v1/bum_profiles", supabaseUrl);
  url.searchParams.set("user_id", `eq.${userId}`);

  if (!snapshot.existed) {
    url.searchParams.set("headline", `eq.QA LinkedIn Import ${runId}`);

    const deleteResponse = await fetch(url, {
      method: "DELETE",
      headers: qaRestHeaders(serviceRoleKey, "return=representation"),
    });
    if (!deleteResponse.ok) {
      issues.push({
        severity: "P1",
        area: "QA cleanup",
        workflow: "Bum LinkedIn import",
        evidence: `Cleanup delete failed for the QA Bum profile row: ${deleteResponse.status} ${await deleteResponse.text()}`,
        recommendation: "Fix service-role cleanup access before expanding import mutation coverage.",
      });
      return;
    }

    const remainingSnapshot = await readBumProfileSnapshot(userId);
    if (remainingSnapshot.data?.headline === `QA LinkedIn Import ${runId}`) {
      issues.push({
        severity: "P1",
        area: "QA cleanup",
        workflow: "Bum LinkedIn import",
        evidence: "Cleanup verification found the current-run QA LinkedIn import profile row after delete.",
        recommendation: "Fix service-role cleanup verification before expanding import mutation coverage.",
      });
    }
    return;
  }

  const restoreResponse = await fetch(url, {
    method: "PATCH",
    headers: {
      ...qaRestHeaders(serviceRoleKey, "return=representation"),
      "content-type": "application/json",
    },
    body: JSON.stringify(snapshot.data),
  });

  if (!restoreResponse.ok) {
    issues.push({
      severity: "P1",
      area: "QA cleanup",
      workflow: "Bum LinkedIn import",
      evidence: `Profile snapshot restore failed: ${restoreResponse.status} ${await restoreResponse.text()}`,
      recommendation: "Restore the QA Bum profile manually and fix service-role cleanup before adding more profile import cases.",
    });
  }
}

function csvFile(name: string, body: string) {
  return {
    name,
    mimeType: "text/csv",
    buffer: Buffer.from(body),
  };
}

async function importLinkedInCsvAndSaveProfile(page: Page, runId: string) {
  await expect(page.getByRole("heading", { name: /Bum profile/i }).first()).toBeVisible({ timeout: 20_000 });

  const headline = `QA LinkedIn Import ${runId}`;
  const pastCompany = `QA Past Co ${runId}`;
  const relationshipCompany = `QA Relationship Co ${runId}`;
  const skill = `QA Relationship Sales ${runId}`;
  const certification = `QA Certification ${runId}`;
  const notableWin = `Created by ${runId}; safe to delete.`;

  await page.locator("#linkedinProfileCsv").setInputFiles(
    csvFile(
      `profile-${runId}.csv`,
      [
        "Headline,Summary,Public Profile URL,Geo Location,Industry",
        `"${headline}","Created by ${runId}; safe to delete; do not use for business.","https://www.linkedin.com/in/qa-workflow-import","QA Region","QA Industry"`,
      ].join("\n"),
    ),
  );
  await page.locator("#linkedinPositionsCsv").setInputFiles(
    csvFile(
      `positions-${runId}.csv`,
      ["Company Name,Started On,Description", `"${pastCompany}",2016-01,"${notableWin}"`].join("\n"),
    ),
  );
  await page.locator("#linkedinSkillsCsv").setInputFiles(
    csvFile(`skills-${runId}.csv`, ["Name", `"${skill}"`].join("\n")),
  );
  await page.locator("#linkedinCertificationsCsv").setInputFiles(
    csvFile(`certifications-${runId}.csv`, ["Name", `"${certification}"`].join("\n")),
  );
  await page.locator("#linkedinConnectionsCsv").setInputFiles(
    csvFile(`connections-${runId}.csv`, ["First Name,Last Name,Company", `"QA","Contact","${relationshipCompany}"`].join("\n")),
  );

  await page.getByRole("button", { name: /import and prefill/i }).click();
  await expect(page.getByText("Imported summary")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByLabel("Headline")).toHaveValue(headline);
  await expect(page.getByLabel("LinkedIn URL")).toHaveValue("https://www.linkedin.com/in/qa-workflow-import");
  await expect(page.getByLabel("Home region")).toHaveValue("QA Region");
  await expect(page.getByLabel("Industries worked in")).toHaveValue("QA Industry");
  await expect(page.getByLabel("Companies worked with")).toHaveValue(pastCompany);
  await expect(page.getByLabel("Companies where you have relationships")).toHaveValue(relationshipCompany);
  await expect(page.getByLabel("Skills / expertise")).toHaveValue(skill);
  await expect(page.getByLabel("Certifications", { exact: true })).toHaveValue(certification);
  await expect(page.getByLabel("Notable wins or examples")).toHaveValue(notableWin);

  const saveResponsePromise = page.waitForResponse(
    (response) => response.url().includes("/rest/v1/bum_profiles") && response.request().method() === "POST",
    { timeout: 20_000 },
  );
  await page.getByRole("button", { name: /^Save profile$/i }).click();
  const saveResponse = await saveResponsePromise;
  expect(saveResponse.ok(), await saveResponse.text().catch(() => `POST returned ${saveResponse.status()}`)).toBe(true);

  await expect(page.getByText("Profile saved", { exact: true })).toBeVisible({ timeout: 20_000 });
  await page.reload();
  await expect(page.getByLabel("Headline")).toHaveValue(headline, { timeout: 20_000 });
  await expect(page.getByLabel("Companies worked with")).toHaveValue(pastCompany);
  await expect(page.getByLabel("Companies where you have relationships")).toHaveValue(relationshipCompany);
  await expect(page.getByLabel("Skills / expertise")).toHaveValue(skill);
}

test.describe("role workflow QA matrix", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(!hasExternalQaTarget(), "Set QA_BASE_URL to run role workflow QA against the deployed QA target.");

  test("Client Member creates, Admin and Bum can see, and Client Admin deletes an unclaimed QA opportunity", async ({ browser }, testInfo) => {
    test.setTimeout(180_000);
    test.skip(testInfo.project.name !== "chromium", "Run mutating role workflow QA once on desktop Chromium.");
    test.skip(!isWorkflowMutationEnabled(), "Set QA_WORKFLOW_MUTATION=1 to create and clean up role workflow QA data.");
    expect(hasQaCleanupCredential(), "Set QA_SUPABASE_SERVICE_ROLE_KEY to a Supabase service_role JWT before workflow QA mutation.").toBe(true);

    const clientMember = requireQaAccount("CLIENT_MEMBER");
    const clientAdmin = requireQaAccount("CLIENT_ADMIN");
    const admin = requireQaAccount("ADMIN");
    const bum = requireQaAccount("BUM");

    const runId = createWorkflowQaRunId();
    const targetAccount = `QA DO NOT USE ${runId} opportunity`;
    const issues: DeepQaIssue[] = [];
    const createdRecords: QaCreatedRecord[] = [
      { table: "opportunity_registrations", field: "target_account_name", value: targetAccount },
    ];
    let clientMemberContext: BrowserContext | undefined;
    let adminContext: BrowserContext | undefined;
    let bumContext: BrowserContext | undefined;
    let clientAdminContext: BrowserContext | undefined;

    try {
      clientMemberContext = await browser.newContext();
      const clientMemberPage = await clientMemberContext.newPage();
      installWorkflowQaErrorGate(clientMemberPage, issues, "Client Member");
      await publishQaOpportunity(clientMemberPage, clientMember, runId, targetAccount);
      await clientMemberContext.close();
      clientMemberContext = undefined;

      adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      installWorkflowQaErrorGate(adminPage, issues, "Admin");
      await expectAdminCanSeeOpportunity(adminPage, admin, targetAccount);

      bumContext = await browser.newContext();
      const bumPage = await bumContext.newPage();
      installWorkflowQaErrorGate(bumPage, issues, "Bum");
      await expectBumCanSeeOpportunity(bumPage, bum, targetAccount);

      clientAdminContext = await browser.newContext();
      const clientAdminPage = await clientAdminContext.newPage();
      installWorkflowQaErrorGate(clientAdminPage, issues, "Client Admin");
      await deleteUnclaimedOpportunity(clientAdminPage, clientAdmin, targetAccount);
    } finally {
      await clientMemberContext?.close();
      await clientAdminContext?.close();
      await bumContext?.close();
      await adminContext?.close();
      await cleanupCreatedRecords(createdRecords, issues);
    }

    expect(issues.filter((issue) => issue.severity === "P1" || issue.severity === "P0"), "Workflow QA found red/RLS/cleanup blockers.").toEqual([]);
  });

  test("Bum imports a LinkedIn CSV export, saves the profile, and reloads persisted profile fields", async ({ browser }, testInfo) => {
    test.setTimeout(180_000);
    test.skip(testInfo.project.name !== "chromium", "Run mutating role workflow QA once on desktop Chromium.");
    test.skip(!isWorkflowMutationEnabled(), "Set QA_WORKFLOW_MUTATION=1 to create and clean up role workflow QA data.");
    expect(hasQaCleanupCredential(), "Set QA_SUPABASE_SERVICE_ROLE_KEY to a Supabase service_role JWT before workflow QA mutation.").toBe(true);

    const bum = requireQaAccount("BUM");
    const runId = createWorkflowQaRunId();
    const issues: DeepQaIssue[] = [];
    let bumContext: BrowserContext | undefined;
    let bumUserId: string | undefined;
    let profileSnapshot: BumProfileSnapshot | undefined;

    try {
      bumContext = await browser.newContext();
      const bumPage = await bumContext.newPage();
      installWorkflowQaErrorGate(bumPage, issues, "Bum");
      await goToAuthedPath(bumPage, bum, "/bum/profile");
      bumUserId = await getCurrentClerkUserId(bumPage);
      profileSnapshot = await readBumProfileSnapshot(bumUserId);
      await importLinkedInCsvAndSaveProfile(bumPage, runId);
    } finally {
      await bumContext?.close();
      if (bumUserId && profileSnapshot) {
        await restoreBumProfileSnapshot(bumUserId, profileSnapshot, issues, runId);
      }
    }

    expect(issues.filter((issue) => issue.severity === "P1" || issue.severity === "P0"), "Workflow QA found red/RLS/import cleanup blockers.").toEqual([]);
  });
});
