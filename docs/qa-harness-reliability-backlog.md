# Trusted Bums QA Harness Reliability Backlog

_Last updated: 2026-06-15 by Codex TB-0054 fix handoff._

## Executive Read

Current `main` head `7ee97c1` is still green on the authoritative hosted harness lanes as of 2026-06-15. No newer exact-head hosted reruns appeared after the prior completed evidence:

- GitHub `QA` run `27469969615`: passed.
- DreamHost deploy run `27469969636`: passed.
- GitHub `E2E Smoke` run `27469985957`: passed `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.

Local sourced preflight and the narrow harness or contract regression pack are also green against `https://trustedbums.com`:

- Raw `corepack pnpm run qa:env`: fails in a fresh shell because the QA variables are not exported by default.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`: passes.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`: passes DNS, HTTPS, app shell, and Clerk checks.
- `corepack pnpm exec vitest run src/test/googleAnalyticsConsent.test.tsx src/test/e2eSmokeRegression.test.ts src/test/deepQaTriage.test.ts src/test/qaTargetPreflight.test.ts src/test/extensionApiContract.test.ts src/test/bumSavedItems.test.ts`: passed `30/30`.

No new auth-helper, navigation-helper, localStorage, or Deep QA shard defect reproduced on clean exact head. The active harness queue is now narrower:

- `TB-0054` now has a local fix that moves `qa-target-preflight` summaries outside Playwright-managed output and wires CI uploads for that directory, but it still needs successor hosted artifact proof before closure;
- raw-shell versus sourced versus hosted env-state discipline still needs to stay explicit in handoffs;
- the older `TB-0092` visual regex fix remains stale or closed, not active, because completed standard visual runs `27464549870` on `9546563` and `27488973899` on `7ee97c1` both passed, so the rerun stayed release-evidence follow-through rather than an unshipped harness fix.

## Active Harness Fixes

### P1 - [TB-0054] Move `qa-target-preflight` artifacts out of Playwright's `test-results/` root
- Evidence: Downloaded success artifacts for GitHub `E2E Smoke` run `27469985957` on `7ee97c1` still contain only Playwright report folders and no `qa-target-preflight` summaries. Local fix work on 2026-06-15 now changes [`scripts/qa-target-preflight.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/qa-target-preflight.mjs) to default `QA_TARGET_PREFLIGHT_OUTPUT_DIR` to `qa-target-preflight-artifacts`, wires both [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml) and [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml) to upload that directory explicitly, and adds regression coverage in [`src/test/qaTargetPreflight.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/qaTargetPreflight.test.ts).
- Why it matters: QA and Release Verification still lose the exact DNS, HTTPS, app-shell, and Clerk preflight evidence on successful runs and on later route failures, which slows env-drift triage and weakens harness-versus-product classification.
- Recommendation: Keep `TB-0054` in hosted-verification status until a successor smoke artifact and a later failing smoke or deep artifact both preserve the preflight summaries.
- Acceptance criteria: a current-head passing smoke run and a deliberately later-failing smoke or deep run both publish downloadable `summary.json` and `summary.txt`.

### P2 - [TB-0055] Keep raw-shell, sourced `.env.qa`, and hosted workflow env states separate in every handoff
- Evidence: Raw `corepack pnpm run qa:env` still fails in this shell because `QA_BASE_URL`, the Clerk keys, and the role-email variables are not exported by default. After sourcing `.env.qa`, `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env` passes and sourced preflight passes against `https://trustedbums.com`. Hosted `QA` run `27469969615` and hosted `E2E Smoke` run `27469985957` also passed the same contract on `7ee97c1`.
- Why it matters: Collapsing those three states into one "QA env passed" or "QA env failed" claim still hides whether the issue is shell setup, `.env.qa` drift, or GitHub Actions configuration drift.
- Recommendation: Keep every QA harness, QA test, and release handoff split into raw shell, sourced `.env.qa`, and hosted workflow states, and mention only the variable names that are missing in each state.
- Acceptance criteria: future handoffs make it obvious which contract passed or failed in each environment without re-reading raw logs.

## Deep QA Split Plan

- Current split: `admin`, `client`, and `bum` shards in [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml) and [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml).
- Current proof: GitHub `E2E Smoke` run `27469985957` passed smoke plus all three deep shards on commit `7ee97c1`.
- Standard visual state: completed standard visual run `27464549870` passed on prior head `9546563`, and current-head standard visual rerun `27488973899` also passed on `7ee97c1`.
- Standalone workflow status: the standalone `Deep QA Hotfix Audit` workflow is still stale at run `27092527987` from 2026-06-07, so the deploy-triggered smoke workflow remains the fresher exact-head deep signal.
- Escalation rule: keep the role split as the default. Split a shard further by workflow or route only if a specific shard fails repeatedly after both `qa:target-preflight` and `qa:env` pass.

## Product Defect Handoffs

- None active on clean exact head `7ee97c1`.
- Current classification note for QA Test Engineer and Lead Developer: the manual-contact coverage gap on `/bum/contacts` is still a product-coverage issue tracked as `TB-0086`, not a harness failure. Clean exact-head harness evidence still says the route loads and the deep bum shard completes.
- Current classification note for QA Harness Reliability and Release Verification: `TB-0092` remains stale or closed from the shipped regex narrowing plus the completed standard visual successes `27464549870` on `9546563` and `27488973899` on `7ee97c1`. No new current-head visual harness defect reopened in this run.

## Agent Inputs

- Date of run: 2026-06-15
- Workflows, artifacts, tests, helpers, scripts, env checks, GitHub runs, tracker rows, and commands reviewed: `docs/qa-harness-reliability-backlog.md`, `docs/qa-test-backlog.md`, `docs/release-verification-backlog.md`, `package.json`, [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml), [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml), [`tests/e2e/helpers/auth.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/auth.ts), [`tests/e2e/helpers/deepQa.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/deepQa.ts), [`tests/e2e/deep-workflow-hotfix-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), [`scripts/verify-qa-env.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/verify-qa-env.mjs), [`scripts/qa-target-preflight.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/qa-target-preflight.mjs), [`src/test/googleAnalyticsConsent.test.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/googleAnalyticsConsent.test.tsx), [`src/test/e2eSmokeRegression.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/e2eSmokeRegression.test.ts), [`src/test/deepQaTriage.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/deepQaTriage.test.ts), [`src/test/qaTargetPreflight.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/qaTargetPreflight.test.ts), [`src/test/extensionApiContract.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/extensionApiContract.test.ts), [`src/test/bumSavedItems.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/bumSavedItems.test.ts), raw `corepack pnpm run qa:env`, sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`, sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`, `corepack pnpm exec vitest run src/test/googleAnalyticsConsent.test.tsx src/test/e2eSmokeRegression.test.ts src/test/deepQaTriage.test.ts src/test/qaTargetPreflight.test.ts src/test/extensionApiContract.test.ts src/test/bumSavedItems.test.ts`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 30 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Deep QA Hotfix Audit" --limit 10 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27469985957 --json headSha,jobs,url`, `/Users/macdaddy/bin/gh-trustedbums run download 27469985957 --dir /tmp/trustedbums-e2e-7ee97c1-*`, live Supabase project checks for `vaoqvtxqvbptyxddpoju`, live tracker schema read for `public.admin_scrum_items`, live tracker row reads for `TB-0054`, `TB-0055`, `TB-0086`, and `TB-0092`, and live tracker refresh SQL for `TB-0055`.
- Hosted verification in this run: no newer exact-head hosted rerun exists after GitHub `QA` run `27469969615`, DreamHost deploy `27469969636`, GitHub `E2E Smoke` run `27469985957`, and GitHub `Visual UI Audit` run `27488973899`, and the run list still shows those as the latest exact-head completed successes on commit `7ee97c1`. The fresh smoke artifact download still returned `MATCH_COUNT=0` for `qa-target-preflight` `summary.json` and `summary.txt`; the successor hosted run must verify the new `qa-target-preflight-artifacts/` upload path.
- Tracker refresh completed in this run: refreshed `TB-0055` to exact head `7ee97c1` and current run `27469985957`; re-read `TB-0054`, `TB-0086`, and `TB-0092`, which already matched the current evidence and did not need a second rewrite.
- Checks added for `TB-0054`: `corepack pnpm exec vitest run src/test/qaTargetPreflight.test.ts src/test/e2eSmokeRegression.test.ts src/test/deepQaTriage.test.ts` passed `19/19`; sourced local `QA_EXTENSION_API_EXPECTATION=skip QA_TARGET_PREFLIGHT_OUTPUT_DIR=/tmp/tb-0054-preflight-artifacts corepack pnpm run qa:target-preflight` wrote `/tmp/tb-0054-preflight-artifacts/summary.json` and `/tmp/tb-0054-preflight-artifacts/summary.txt`.
- Checks that could not run and why: no new standalone `Deep QA Hotfix Audit` run was dispatched because the deploy-triggered smoke workflow still provides the fresher exact-head deep evidence for `7ee97c1`, and no new hosted rerun was launched in this fix pass; `TB-0054` still requires successor hosted artifact proof before closure.
