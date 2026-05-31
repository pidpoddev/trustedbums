import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const DECISION_FILE = ".codex-review-decision.json";
const REVIEW_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const ZERO_OID = "0000000000000000000000000000000000000000";

function fail(message) {
  console.error("");
  console.error("Code Review Agent gate: NO-GO");
  console.error(message);
  console.error("");
  console.error("Required next step:");
  console.error("- Ask the Code Review Agent to review the exact commit being pushed to main.");
  console.error("- If the decision is NO-GO, Lead Developer must adjust the code and request a new review.");
  process.exit(1);
}

function currentHead() {
  return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
}

function parsePushLines(input) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [localRef, localOid, remoteRef, remoteOid] = line.split(/\s+/);
      return { localRef, localOid, remoteRef, remoteOid };
    });
}

const pushInput = readFileSync(0, "utf8");
const pushes = parsePushLines(pushInput);
const mainPushes = pushes.filter((push) => push.remoteRef === "refs/heads/main");

if (mainPushes.length === 0) {
  process.exit(0);
}

for (const push of mainPushes) {
  if (push.localOid === ZERO_OID) {
    fail("Deleting main is blocked by policy.");
  }
}

if (!existsSync(DECISION_FILE)) {
  fail(`Missing ${DECISION_FILE}. A GO decision is required before pushing to main.`);
}

let decision;
try {
  decision = JSON.parse(readFileSync(DECISION_FILE, "utf8"));
} catch (error) {
  fail(`${DECISION_FILE} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
}

if (decision.decision !== "GO") {
  fail(`${DECISION_FILE} does not contain decision: "GO".`);
}

if (decision.targetBranch !== "main" && decision.targetBranch !== "refs/heads/main") {
  fail(`${DECISION_FILE} must target main.`);
}

const reviewedAt = Date.parse(decision.reviewedAt ?? "");
if (!Number.isFinite(reviewedAt)) {
  fail(`${DECISION_FILE} must include a valid reviewedAt timestamp.`);
}

if (Date.now() - reviewedAt > REVIEW_MAX_AGE_MS) {
  fail(`${DECISION_FILE} is older than 24 hours. Re-run the Code Review Agent.`);
}

const reviewedHead = decision.head ?? decision.commit ?? "";
const attemptedHeads = new Set(mainPushes.map((push) => push.localOid));

if (!reviewedHead || !attemptedHeads.has(reviewedHead)) {
  fail(`${DECISION_FILE} must approve the exact commit being pushed to main. Current HEAD: ${currentHead()}`);
}

console.error(`Code Review Agent gate: GO for ${reviewedHead.slice(0, 12)} -> main`);
