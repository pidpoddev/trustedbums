# Trusted Bums QA Harness Reliability Backlog

_Last updated: 2026-06-08 by Codex daily QA harness reliability automation._

## Executive Read

Current `main` head `41187e0` is green on the core hosted harness lanes: GitHub `QA` run `27176979784` passed, DreamHost deploy run `27176979797` passed, and GitHub `E2E Smoke` run `27177006002` passed its smoke job plus `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`. The older GitHub extension-secret blocker from `4402ace` is closed for current head, and sourced local `corepack pnpm run qa:env` plus sourced `corepack pnpm run qa:target-preflight` both pass against `https://trustedbums.com`.

No new auth-helper, navigation-helper, or Deep QA shard defect reproduced in this run. `tests/e2e/helpers/auth.ts` still contains the bounded app-root bootstrap and current-session reuse guardrails, `src/test/deepQaTriage.test.ts` and `src/test/qaTargetPreflight.test.ts` both passed, and the downloaded deep-shard artifacts from run `27177006002` each contain a no-issues `deep-qa-hotfix-report`.

The remaining harness issue is artifact durability, not route execution. `qa-target-preflight` writes `summary.json` and `summary.txt` under `test-results/qa-target-preflight`, but a succeeding Playwright run deletes that directory before upload. Local reproduction proved the sequence directly: the preflight summaries exist immediately after `corepack pnpm run qa:target-preflight`, then disappear after `corepack pnpm exec playwright test tests/e2e/configuration-smoke.spec.ts --project=chromium`. The downloaded success artifacts for run `27177006002` contain the Playwright reports and deep hotfix markdown, but no `qa-target-preflight` summaries. Failed preflight runs like `27112837432` still preserve the summaries only because Playwright never starts.

## Active Harness Fixes

### P1 - [TB-0054] Move `qa-target-preflight` artifacts out of Playwright's `test-results/` root
- Evidence: Local reproduction in this run showed `test-results/qa-target-preflight/summary.json` and `summary.txt` immediately after `corepack pnpm run qa:target-preflight`, then only `test-results/.last-run.json` after `corepack pnpm exec playwright test tests/e2e/configuration-smoke.spec.ts --project=chromium`. Downloaded success artifacts for GitHub `E2E Smoke` run `27177006002` contain Playwright reports and deep hotfix markdown, but no preflight summaries. By contrast, failed preflight run `27112837432` preserved the summaries because Playwright never started.
- Why it matters: QA and Release Verification lose the exact DNS/HTTPS/app-shell/Clerk/extension preflight evidence on successful smoke runs and on later route failures, which makes env drift and target-health triage slower and less trustworthy.
- Recommendation: Change `scripts/qa-target-preflight.mjs` to write into a dedicated artifact directory outside Playwright's managed `test-results/` tree, then upload that directory explicitly from both `.github/workflows/e2e-smoke.yml` and `.github/workflows/deep-qa-hotfix-audit.yml`.
- Acceptance criteria: A current-head passing smoke run and a deliberately later-failing smoke or deep run both publish downloadable `summary.json` and `summary.txt` for the smoke job and each deep shard.

### P2 - [TB-0055] Keep raw-shell, sourced `.env.qa`, and hosted workflow env states separate in every handoff
- Evidence: Raw `corepack pnpm run qa:env` still fails in this shell because no QA variables are exported by default. After sourcing `.env.qa`, `corepack pnpm run qa:env` passes. Hosted `E2E Smoke` run `27177006002` also passed the same contract, while historical run `27112837432` failed because GitHub lacked the extension inputs.
- Why it matters: Collapsing those three states into one “QA env passed” or “QA env failed” claim hides whether the issue is shell setup, `.env.qa` drift, or GitHub Actions configuration drift.
- Recommendation: Keep every QA harness, QA test, and release handoff split into raw shell, sourced `.env.qa`, and hosted workflow states, and mention only the variable names that are missing in each state.
- Acceptance criteria: Future handoffs make it obvious which contract passed or failed in each environment without re-reading raw logs.

### P2 - [TB-0018] Pair current release heads with current visual evidence or an explicit reuse rule
- Evidence: Current head `41187e0` has fresh hosted QA and deep-route evidence, but the newest `Visual UI Audit` run is still `27167324836` on older commit `441fd92`. There is no newer visual artifact for `41187e0` in the latest workflow list.
- Why it matters: Release reviewers can over-trust a green smoke/deep run when the latest downloadable visual artifact is from an older head and no explicit no-visual-delta rule was recorded.
- Recommendation: Either auto-dispatch `Visual UI Audit` after a successful deploy, or codify a commit-scoped reuse rule that lets Release Verification cite an older visual artifact only when the intervening commits are explicitly non-visual.
- Acceptance criteria: The next current-head release note cites a matching visual run or a documented no-visual-delta reuse decision tied to the exact commit range.

## Deep QA Split Plan

- Current split: `admin`, `client`, and `bum` shards in both `.github/workflows/e2e-smoke.yml` and `.github/workflows/deep-qa-hotfix-audit.yml`.
- Current proof: GitHub `E2E Smoke` run `27177006002` passed smoke plus all three deep shards on commit `41187e0`, and each downloaded `deep-qa-hotfix-report` recorded no hotfix-level issues. The newer standalone `Deep QA Hotfix Audit` workflow has not been rerun since `27092527987` on 2026-06-07, but the deploy-triggered smoke workflow currently provides fresher shard evidence.
- Escalation rule: keep the role split as the default. Split a shard further by workflow or route only if a specific shard fails repeatedly after both `qa:target-preflight` and `qa:env` pass.
- Next candidate sub-slices if the client shard regresses again: `/client/dashboard` plus search, `/client/targets` plus opportunity registration, `/client/payments` plus `/client/exports`, and `/client/team`.
- Required evidence per slice: workflow run id, shard or sub-slice name, durable preflight summary outside Playwright's managed output tree, Playwright report or `lead-dev-hotfix-report`, route results, and a harness-versus-product classification.

## Product Defect Handoffs

- None active from this run.
- Historical note for QA Test Engineer and Lead Developer: the earlier authenticated redirect and bootstrap failures remain closed. Current-head smoke and all three deep shards passed on `41187e0`, so no product-defect handoff was reopened from this harness run.

## Agent Inputs

- Date of run: 2026-06-08
- Workflows, artifacts, tests, helpers, scripts, env checks, GitHub runs, and commands reviewed: `docs/qa-harness-reliability-backlog.md`, `docs/qa-test-backlog.md`, `docs/release-verification-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/codex-edit-log.md`, `package.json`, `playwright.config.ts`, `.github/workflows/e2e-smoke.yml`, `.github/workflows/deep-qa-hotfix-audit.yml`, `.github/workflows/qa.yml`, `.github/workflows/visual-ui-audit.yml`, `tests/e2e/deep-workflow-hotfix-audit.spec.ts`, `tests/e2e/configuration-smoke.spec.ts`, `tests/e2e/authenticated-role-smoke.spec.ts`, `tests/e2e/extension-api.spec.ts`, `tests/e2e/helpers/auth.ts`, `tests/e2e/helpers/deepQa.ts`, `scripts/verify-qa-env.mjs`, `scripts/qa-target-preflight.mjs`, raw `corepack pnpm run qa:env`, sourced `corepack pnpm run qa:env`, sourced `corepack pnpm run qa:target-preflight`, `corepack pnpm exec vitest run src/test/deepQaTriage.test.ts src/test/qaTargetPreflight.test.ts`, local preflight-artifact reproduction with `corepack pnpm exec playwright test tests/e2e/configuration-smoke.spec.ts --project=chromium`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Visual UI Audit" --limit 8 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Deep QA Hotfix Audit" --limit 8 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27177006002 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27174844132 --json ...`, and `/Users/macdaddy/bin/gh-trustedbums run download 27177006002 --dir /private/tmp/trustedbums-e2e-27177006002`.
- Hosted verification in this run: GitHub `E2E Smoke` run `27177006002` on commit `41187e0` passed smoke and all three deep shards. The downloaded deep artifacts each contained a no-issues `deep-qa-hotfix-report`, but the downloaded success artifacts did not contain the `qa-target-preflight` summaries that the smoke and deep jobs should preserve for later triage. The latest `Visual UI Audit` artifact remains `27167324836` on `441fd92`, and the latest standalone `Deep QA Hotfix Audit` workflow remains `27092527987` on 2026-06-07.
- Checks that could not run and why: no new standalone `Visual UI Audit` or standalone `Deep QA Hotfix Audit` run was dispatched from this automation because the current smoke workflow already provided fresher route-execution evidence for `41187e0`; no product-defect handoff was opened because the current hosted smoke and deep evidence are green.
