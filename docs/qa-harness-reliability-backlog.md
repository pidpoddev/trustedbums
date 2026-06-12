# Trusted Bums QA Harness Reliability Backlog

_Last updated: 2026-06-12 by Codex daily QA harness reliability automation._

## Executive Read

Current `main` head `d360570` is green on the authoritative hosted harness lanes that already completed:

- GitHub `QA` run `27371736190`: passed.
- DreamHost deploy run `27371736211`: passed.
- GitHub `E2E Smoke` run `27371773276`: passed `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.

Local sourced preflight is also green against `https://trustedbums.com`:

- Raw `corepack pnpm run qa:env`: fails in a fresh shell because the QA variables are not exported by default.
- Sourced `corepack pnpm run qa:env`: passes.
- Sourced `corepack pnpm run qa:target-preflight`: passes DNS, HTTPS, app shell, and Clerk checks. Extension API stayed intentionally skipped by `QA_EXTENSION_API_EXPECTATION=skip`.
- `corepack pnpm exec vitest run src/test/clientBumOriginatedOpportunities.test.ts src/test/clientClaimsWorkflow.test.ts src/test/clientOpportunityDelete.test.ts src/test/clientOpportunityBulkTools.test.ts src/test/clientDashboardLayout.test.ts`: passed `10/10`.

No new auth-helper, navigation-helper, localStorage, or Deep QA shard defect reproduced on clean exact head. The active harness queue is now three items, not two: exact-head smoke artifacts still drop the `qa-target-preflight` summaries, raw-shell versus sourced versus hosted env-state discipline still needs to stay explicit in handoffs, and exact-head standard `Visual UI Audit` run `27395701277` is now proven to be a harness false positive rather than a product or route failure. A separate local-only worktree signal also remains open: uncommitted Client Legal or Client IT dashboard changes trip a broad file-global source assertion in `src/test/e2eSmokeRegression.test.ts`, but GitHub `QA` already passed on clean head `d360570`, so that mismatch is in-flight harness drift, not a clean-head release regression.

## Active Harness Fixes

### P1 - [TB-0054] Move `qa-target-preflight` artifacts out of Playwright's `test-results/` root
- Evidence: Downloaded success artifacts for GitHub `E2E Smoke` run `27371773276` on `d360570` still contain the smoke Playwright report plus three deep Playwright report folders, but no `qa-target-preflight` summaries. `.github/workflows/e2e-smoke.yml` and `.github/workflows/deep-qa-hotfix-audit.yml` still upload only `playwright-report/` and `test-results/`, and [`scripts/qa-target-preflight.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/qa-target-preflight.mjs) still defaults `QA_TARGET_PREFLIGHT_OUTPUT_DIR` to `test-results/qa-target-preflight`.
- Why it matters: QA and Release Verification still lose the exact DNS, HTTPS, app-shell, and Clerk preflight evidence on successful runs and on later route failures, which slows env-drift triage and weakens harness-versus-product classification.
- Recommendation: Change [`scripts/qa-target-preflight.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/qa-target-preflight.mjs) to write into a dedicated artifact directory outside Playwright's managed `test-results/` tree, then upload that directory explicitly from both `.github/workflows/e2e-smoke.yml` and `.github/workflows/deep-qa-hotfix-audit.yml`.
- Acceptance criteria: a current-head passing smoke run and a deliberately later-failing smoke or deep run both publish downloadable `summary.json` and `summary.txt`.

### P1 - [TB-0092] Narrow the standard visual audit's generic error-page regex
- Evidence: Exact-head `Visual UI Audit` run `27395701277` failed on both `chromium` and `mobile-chrome` during the admin portal pass, but the captured body text shows `/admin/scrum` rendered normally with tracker content, counts, filters, and forms. The failure came from [`tests/e2e/visual-ui-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts) line `320`, where `expectNoObviousErrorPage()` rejects any body text containing `404`. The admin scrum tracker now contains real item descriptions such as `unknown endpoint 404`, so the harness misclassifies legitimate tracker text as an error page.
- Why it matters: Standard exact-head visual evidence is currently red for harness reasons, not product reasons. That creates false release pressure, routes the failure to the wrong owners, and hides the real fix under UI or release noise.
- Recommendation: Replace the body-wide `404` substring check with a narrower assertion that only fires on real error-page surfaces, route-level failure markers, or known app-shell misconfiguration states. Keep the current `configuration needed` checks, but stop treating arbitrary tracker or audit text as a fatal page error.
- Acceptance criteria: rerunning standard `Visual UI Audit` on the same head no longer fails on `/admin/scrum` just because tracker text contains `404`, while real config/error pages still fail loudly.

### P2 - [TB-0055] Keep raw-shell, sourced `.env.qa`, and hosted workflow env states separate in every handoff
- Evidence: Raw `corepack pnpm run qa:env` still fails in this shell because `QA_BASE_URL`, the Clerk keys, and the role-email variables are not exported by default. After sourcing `.env.qa`, `corepack pnpm run qa:env` passes and sourced `corepack pnpm run qa:target-preflight` passes against `https://trustedbums.com`. Hosted `QA` run `27371736190` and hosted `E2E Smoke` run `27371773276` also passed the same contract on `d360570`.
- Why it matters: Collapsing those three states into one "QA env passed" or "QA env failed" claim still hides whether the issue is shell setup, `.env.qa` drift, or GitHub Actions configuration drift.
- Recommendation: Keep every QA harness, QA test, and release handoff split into raw shell, sourced `.env.qa`, and hosted workflow states, and mention only the variable names that are missing in each state.
- Acceptance criteria: future handoffs make it obvious which contract passed or failed in each environment without re-reading raw logs.

## Deep QA Split Plan

- Current split: `admin`, `client`, and `bum` shards in `.github/workflows/e2e-smoke.yml` and `.github/workflows/deep-qa-hotfix-audit.yml`.
- Current proof: GitHub `E2E Smoke` run `27371773276` passed smoke plus all three deep shards on commit `d360570`.
- Standalone workflow status: the standalone `Deep QA Hotfix Audit` workflow is still stale at run `27092527987` from 2026-06-07, so the deploy-triggered smoke workflow remains the fresher exact-head deep signal.
- Escalation rule: keep the role split as the default. Split a shard further by workflow or route only if a specific shard fails repeatedly after both `qa:target-preflight` and `qa:env` pass.

## Product Defect Handoffs

- None active on clean exact head `d360570`.
- Exact-head `Visual UI Audit` run `27395701277` is no longer classified as a product or UI defect. The current failure is harness-only and is tracked as `TB-0092`.
- Current classification note for QA Test Engineer and Lead Developer: the manual-contact coverage gap on `/bum/contacts` is still a product-coverage issue tracked as `TB-0086`, not a harness failure. Clean exact-head harness evidence still says the route loads and the deep bum shard completes.
- Worktree-only harness note for QA Harness Reliability and Lead Developer: local `src/test/e2eSmokeRegression.test.ts` now fails against uncommitted Client Legal or Client IT dashboard changes because the test still bans any `to: "/client/profile", primary: true` string anywhere in [`src/pages/client/ClientDashboard.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx). Tighten that source assertion before those dashboard changes ship.

## Agent Inputs

- Date of run: 2026-06-12
- Workflows, artifacts, tests, helpers, scripts, env checks, GitHub runs, and commands reviewed: `docs/qa-harness-reliability-backlog.md`, `docs/qa-test-backlog.md`, `docs/release-verification-backlog.md`, `docs/lead-developer-recommendations.md`, `package.json`, `.github/workflows/e2e-smoke.yml`, `.github/workflows/deep-qa-hotfix-audit.yml`, `.github/workflows/qa.yml`, `.github/workflows/visual-ui-audit.yml`, `tests/e2e/deep-workflow-hotfix-audit.spec.ts`, `tests/e2e/helpers/auth.ts`, `tests/e2e/helpers/deepQa.ts`, `tests/e2e/visual-ui-audit.spec.ts`, `scripts/verify-qa-env.mjs`, `scripts/qa-target-preflight.mjs`, `src/test/e2eSmokeRegression.test.ts`, raw `corepack pnpm run qa:env`, sourced `corepack pnpm run qa:env`, sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`, `corepack pnpm exec vitest run src/test/deepQaTriage.test.ts src/test/qaTargetPreflight.test.ts src/test/e2eSmokeRegression.test.ts`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run list --workflow "Visual UI Audit" --limit 10 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run list --workflow "Deep QA Hotfix Audit" --limit 10 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27371736190 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27371736211 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27371773276 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27395701277 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27395701277 --log-failed`, `/Users/macdaddy/bin/gh-trustedbums run download 27371773276 --dir /private/tmp/trustedbums-e2e-27371773276`, `/Users/macdaddy/bin/gh-trustedbums run download 27395701277 --dir /private/tmp/trustedbums-visual-27395701277`, `curl -I -L --max-time 20 https://trustedbums.com`, `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`, and live tracker reads plus updates for `TB-0019` and `TB-0092` in project `vaoqvtxqvbptyxddpoju`.
- Hosted verification in this run: GitHub `QA` run `27371736190`, DreamHost deploy `27371736211`, and GitHub `E2E Smoke` run `27371773276` all passed on commit `d360570`. The downloaded success smoke artifacts still did not contain the `qa-target-preflight` summaries that the smoke and deep jobs should preserve. Exact-head standard `Visual UI Audit` run `27395701277` failed only because the admin scrum tracker body text contains `404` inside legitimate item descriptions; the current evidence points to a harness false positive tracked as `TB-0092`, not a product-route failure.
- Tracker refresh in this run: created `TB-0092` for the exact-head standard visual false positive on `/admin/scrum` and corrected `TB-0019` so the release gate no longer treats `27395701277` as a product or UI defect. Existing harness items `TB-0054` and `TB-0055` remain current on head `d360570`.
- Checks that could not run and why: no new standalone `Deep QA Hotfix Audit` run was dispatched because the deploy-triggered smoke workflow already provided fresher route-execution evidence for `d360570`.
