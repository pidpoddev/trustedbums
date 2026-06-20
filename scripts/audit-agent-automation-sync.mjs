#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const workspace = "/Users/macdaddy/CodexWork/TrustedBums/trustedbums";
const repoPromptDir = join(workspace, "docs/agents/automation-prompts");
const liveAutomationRoot = "/Users/macdaddy/.codex/automations";

function readTomlFields(path) {
  const source = readFileSync(path, "utf8");
  const field = (name) => source.match(new RegExp(`^${name}\\s*=\\s*"([^"]*)"`, "m"))?.[1] ?? null;
  const cwds = source.match(/^cwds\s*=\s*\[(.*)\]/m)?.[1] ?? "";

  return {
    path,
    id: field("id"),
    kind: field("kind"),
    name: field("name"),
    status: field("status"),
    rrule: field("rrule"),
    model: field("model"),
    reasoning_effort: field("reasoning_effort"),
    cwds: [...cwds.matchAll(/"([^"]+)"/g)].map((match) => match[1]),
  };
}

function trustedBumsLiveAutomations() {
  return readdirSync(liveAutomationRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("trusted-bums-"))
    .map((entry) => readTomlFields(join(liveAutomationRoot, entry.name, "automation.toml")))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

function trustedBumsRepoSnapshots() {
  return readdirSync(repoPromptDir)
    .filter((name) => name.startsWith("trusted-bums-") && name.endsWith(".toml"))
    .map((name) => readTomlFields(join(repoPromptDir, name)))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

const live = trustedBumsLiveAutomations();
const repo = trustedBumsRepoSnapshots();
const liveById = new Map(live.map((entry) => [entry.id, entry]));
const repoCronSnapshots = repo.filter((entry) => entry.kind === "cron" && entry.status === "ACTIVE");
const repoById = new Map(repoCronSnapshots.map((entry) => [entry.id, entry]));

const missingLive = repoCronSnapshots.filter((entry) => !liveById.has(entry.id));
const missingRepo = live.filter((entry) => !repoById.has(entry.id));
const mismatches = [];

for (const snapshot of repoCronSnapshots) {
  const active = liveById.get(snapshot.id);
  if (!active) continue;

  for (const field of ["name", "status", "rrule", "model", "reasoning_effort"]) {
    if (snapshot[field] !== active[field]) {
      mismatches.push({ id: snapshot.id, field, repo: snapshot[field], live: active[field] });
    }
  }

  if (JSON.stringify(snapshot.cwds) !== JSON.stringify(active.cwds)) {
    mismatches.push({ id: snapshot.id, field: "cwds", repo: snapshot.cwds, live: active.cwds });
  }
}

const allLiveTrustedBumsCwdsAreLocal = live.every(
  (entry) => entry.cwds.length > 0 && entry.cwds.every((cwd) => cwd === workspace),
);
const driftFound = missingLive.length > 0 || missingRepo.length > 0 || mismatches.length > 0 || !allLiveTrustedBumsCwdsAreLocal;

console.log(
  JSON.stringify(
    {
      auditCompleted: true,
      driftFound,
      liveRecurringCount: live.length,
      repoActiveCronSnapshotCount: repoCronSnapshots.length,
      missingLive: missingLive.map((entry) => ({
        id: entry.id,
        name: entry.name,
        rrule: entry.rrule,
        model: entry.model,
      })),
      missingRepo: missingRepo.map((entry) => entry.id),
      mismatches,
      allLiveTrustedBumsCwdsAreLocal,
      workspace,
    },
    null,
    2,
  ),
);
