# Trusted Bums QA Harness Reliability Backlog

_Last updated: 2026-06-08 by Codex daily QA harness reliability automation._

## Executive Read

Current-state postscript: the extension-preflight failure described below is superseded for release gating. Current `main` head `441fd92` passed GitHub `QA` run `27167307017`, DreamHost deploy run `27167306961`, `E2E Smoke` run `27167339658`, and `Visual UI Audit` run `27167324836`. Keep the notes below as historical harness evidence and as a regression guard for future required extension API coverage, not as the active release blocker.

No new harness-code defect reproduced in this run. The latest current-head hosted evidence, GitHub `E2E Smoke` run `27112837432` on commit `4402ace`, failed in smoke plus `Deep QA (admin|client|bum)` before Playwright started because `QA_EXTENSION_API_EXPECTATION=required` while GitHub provided neither `QA_EXTENSION_API_BASE_URL` nor `QA_EXTENSION_API_TOKEN`. The same classification holds locally after sourcing `.env.qa`: `corepack pnpm run qa:env` fails only on `QA_EXTENSION_API_TOKEN`, and `corepack pnpm run qa:target-preflight` passes DNS, HTTPS, app shell, and Clerk for `https://trustedbums.com` before failing the extension token gate.

The earlier auth/bootstrap harness work should stay closed unless a newer preflight-passing run reopens it. `tests/e2e/helpers/auth.ts` still contains the bounded app-root bootstrap, `chrome-error://` and localStorage guardrails remain covered by `src/test/deepQaTriage.test.ts`, and current artifact capture is working: downloaded artifacts for run `27112837432` include `test-results/qa-target-preflight/summary.json` and `summary.txt` in the smoke artifact plus all three deep-shard artifacts. The active blocker is workflow secret/config parity, not more Deep QA splitting or auth helper churn.

## Active Harness Fixes

### Historical P0 - Provision required extension API secrets in GitHub Actions
- Evidence: GitHub `E2E Smoke` run `27112837432` on commit `4402ace` failed the smoke job and all three deep shards before Playwright. The failed smoke log shows `PASS DNS`, `PASS HTTPS`, `PASS App shell`, and `PASS Clerk`, then `FAIL Extension API: Missing QA_EXTENSION_API_BASE_URL while QA_EXTENSION_API_EXPECTATION=required`; the same job log shows `QA_EXTENSION_API_TOKEN` empty. Locally, after sourcing `.env.qa`, `corepack pnpm run qa:env` fails only on `QA_EXTENSION_API_TOKEN`, and sourced `corepack pnpm run qa:target-preflight` fails only that extension gate after the other readiness checks pass.
- Why it matters: The release-grade QA workflows were red for a workflow-configuration reason in run `27112837432`. Current release workflows are green on `441fd92`, but authenticated extension-specific allow/deny coverage still needs explicit fixture-backed proof if that lane is required again.
- Recommendation: Set `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN` in the GitHub Actions secret or variable path used by both `.github/workflows/e2e-smoke.yml` and `.github/workflows/deep-qa-hotfix-audit.yml`. Keep `QA_EXTENSION_API_EXPECTATION=required` so the workflows continue failing fast if the secrets regress.
- Acceptance criteria: The next current-head hosted `E2E Smoke` run clears `qa:target-preflight` and `qa:env` in the smoke job and all three deep shards, and Playwright starts instead of failing on extension configuration.

### P1 - Keep local, sourced, and hosted env states separate in every handoff
- Evidence: Raw `corepack pnpm run qa:env` in this shell fails on the base contract because nothing is exported yet. After sourcing `.env.qa`, the only missing variable is `QA_EXTENSION_API_TOKEN`. In GitHub run `27112837432`, both `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN` are missing.
- Why it matters: Collapsing those three states into one blanket “QA env missing” claim creates bad triage. The current local target is healthy enough to reach the app and Clerk, while the hosted workflows are misconfigured more broadly.
- Recommendation: Keep every QA harness, QA test, and release handoff reporting three states separately: raw shell, sourced `.env.qa`, and GitHub workflow env. Mention only the missing variable names for each state.
- Acceptance criteria: Updated handoffs and release notes consistently show which contract was checked, how it was loaded, and which exact variable names were absent in each environment.

### P1 - Treat preflight artifact retention as a regression guard, not a finished assumption
- Evidence: Downloaded artifacts for GitHub run `27112837432` include `test-results/qa-target-preflight/summary.json` and `summary.txt` in `playwright-report` and in `deep-qa-hotfix-audit-admin`, `deep-qa-hotfix-audit-client`, and `deep-qa-hotfix-audit-bum`.
- Why it matters: When a failure happens before Playwright starts, those summaries are the only durable evidence QA and Release Verification can review without reopening raw logs.
- Recommendation: Keep uploading `test-results/` in both workflow entrypoints and spot-check the artifact contents after any workflow or reporter edit that touches the smoke or deep jobs.
- Acceptance criteria: Any future preflight failure still produces downloadable `summary.json` and `summary.txt` artifacts for every failed smoke or deep-shard job.

### P2 - Do not reopen auth-helper or shard-splitting work until a preflight-passing run fails later
- Evidence: `src/test/deepQaTriage.test.ts` and `src/test/qaTargetPreflight.test.ts` both passed in this run. `tests/e2e/helpers/auth.ts` still contains the bounded app-root bootstrap retry, current-session route navigation, terms handling, and Clerk debug output. The current-head hosted failure exits before any route execution begins.
- Why it matters: There is no new evidence that `goToAuthedPath()`, `localStorage`, `chrome-error://chromewebdata/`, or the current `admin|client|bum` split is the active problem on `4402ace`.
- Recommendation: Freeze further harness-code churn in auth/navigation helpers and Deep QA subdivision unless a newer hosted run first clears preflight and then fails during actual route execution.
- Acceptance criteria: The next harness-code change in these areas is tied to a preflight-passing failed run or a targeted local reproduction, not to the current secret-misconfiguration failure mode.

## Deep QA Split Plan

- Current split: `admin`, `client`, and `bum` shards in both `.github/workflows/e2e-smoke.yml` and `.github/workflows/deep-qa-hotfix-audit.yml`.
- Current proof: GitHub `E2E Smoke` run `27110757594` passed smoke plus all three deep shards on commit `8fa0796`. The latest current-head run, `27112837432` on `4402ace`, stopped smoke and all three deep shards at the shared extension-input preflight gate rather than at role-specific route execution.
- Escalation rule: keep the role split as the default. Split a shard further by workflow or route only if a specific shard fails repeatedly after both `qa:target-preflight` and `qa:env` pass.
- Next candidate sub-slices if the client shard regresses again: `/client/dashboard` plus search, `/client/targets` plus opportunity registration, `/client/payments` plus `/client/exports`, and `/client/team`.
- Required evidence per slice: workflow run id, shard or sub-slice name, downloadable preflight summary, Playwright report or `lead-dev-hotfix-report`, route results, and a harness-versus-product classification.

## Product Defect Handoffs

- None active from this run.
- Historical note for QA Test Engineer and Lead Developer: GitHub `E2E Smoke` runs `27110216996` and `27110329150` exposed a real authenticated redirect-to-`/login` regression with `Authorization required` and `Unable to bootstrap this profile.` Closure evidence remains commit `8fa0796` plus GitHub run `27110757594`, which passed smoke and all three deep shards. Reopen that defect only if a newer current-head hosted run repeats the redirect pattern after preflight passes.

## Agent Inputs

- Date of run: 2026-06-08
- Workflows, artifacts, tests, helpers, scripts, env checks, GitHub runs, and commands reviewed: `docs/qa-harness-reliability-backlog.md`, `docs/qa-test-backlog.md`, `docs/release-verification-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/codex-edit-log.md`, `package.json`, `playwright.config.ts`, `.github/workflows/e2e-smoke.yml`, `.github/workflows/deep-qa-hotfix-audit.yml`, `.github/workflows/qa.yml`, `tests/e2e/deep-workflow-hotfix-audit.spec.ts`, `tests/e2e/authenticated-role-smoke.spec.ts`, `tests/e2e/extension-api.spec.ts`, `tests/e2e/helpers/auth.ts`, `tests/e2e/helpers/deepQa.ts`, `scripts/verify-qa-env.mjs`, `scripts/qa-target-preflight.mjs`, raw `corepack pnpm run qa:env`, sourced `corepack pnpm run qa:env`, sourced `corepack pnpm run qa:target-preflight`, `corepack pnpm exec vitest run src/test/deepQaTriage.test.ts src/test/qaTargetPreflight.test.ts`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --job 80013874698 --log-failed`, and `/Users/macdaddy/bin/gh-trustedbums run download 27112837432 --dir /private/tmp/trustedbums-e2e-27112837432`.
- Hosted verification in this run: GitHub `E2E Smoke` run `27112837432` on commit `4402ace` failed before Playwright because `QA_EXTENSION_API_EXPECTATION=required` while `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN` were both empty in GitHub. Downloaded artifacts to `/private/tmp/trustedbums-e2e-27112837432` included `test-results/qa-target-preflight/summary.json` and `summary.txt` for the smoke report and for all three deep-shard artifacts.
- Checks that could not run and why: authenticated extension API coverage still could not run because local `.env.qa` is missing `QA_EXTENSION_API_TOKEN` after sourcing and the hosted workflows are missing both the extension API base URL and token; no local Playwright deep-audit reproduction was needed because the latest current-head GitHub evidence already shows the jobs failing before route execution; no new product-defect handoff was opened because no newer preflight-passing run reproduced the earlier auth/bootstrap failure mode.
