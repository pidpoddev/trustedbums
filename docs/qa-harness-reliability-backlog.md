# Trusted Bums QA Harness Reliability Backlog

_Last updated: 2026-06-17 by Codex daily QA harness reliability automation._

## Executive Read

Current `main` head `af944fe` does not have a newly reproduced auth-helper, navigation-helper, localStorage, or Deep QA shard defect. The exact-head harness chain failed before Playwright browser coverage could run:

- GitHub `QA` run `27653495600` on `af944fe`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27653495695` on `af944fe`: published the site, passed live Bing crawler health plus IndexNow, then failed in `Submit sitemap and URLs to Bing Webmaster API` on daily quota exhaustion.
- GitHub `E2E Smoke` run `27653527364` on `af944fe`: skipped because the deploy-triggered `workflow_run` gate only proceeds when deploy concludes `success`.

Current-session local harness contract evidence stayed consistent against `https://trustedbums.com`:

- Raw `corepack pnpm run qa:env`: failed in a fresh shell because the QA variables were not exported.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`: passed.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`: passed DNS, HTTPS, app shell, and Clerk checks.
- `corepack pnpm exec vitest run src/test/qaTargetPreflight.test.ts src/test/e2eSmokeRegression.test.ts src/test/deepQaTriage.test.ts src/test/extensionApiContract.test.ts`: passed `31/31`.

`TB-0054` is no longer an active harness fix. The live tracker row is already `CLOSED`, and fresh artifact downloads for GitHub `E2E Smoke` runs `27634435369` on `f0996c5` and `27653400898` on `12d777f` both contained downloadable `qa-target-preflight-artifacts/summary.json` and `summary.txt` for smoke plus all three deep shards. The active harness queue is now narrower:

- `TB-0105`: make post-publish Bing Webmaster quota exhaustion fail soft so deploy-triggered smoke and deep QA still run on the same head;
- `TB-0055`: keep raw-shell, sourced `.env.qa`, and hosted workflow env states separate in every handoff.

## Active Harness Fixes

### P1 - [TB-0105] Keep post-publish Bing Webmaster quota exhaustion from aborting deploy-triggered smoke
- Evidence: GitHub deploy run `27653495695` on `af944fe` completed DreamHost publish, live Bing health, and IndexNow before failing on `pnpm run bing:webmaster submit-urls`. The log ended with `Bing Webmaster API SubmitUrlBatch failed with HTTP 400: {"ErrorCode":2,"Message":"ERROR!!! You have exceeded your daily url submission quota : 100"}`. Current [`scripts/bing-webmaster-api.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/bing-webmaster-api.mjs) only treats quota errors as non-fatal when the message includes `Quota remaining for today`, so the real production error shape still exits `1`. GitHub `E2E Smoke` `27653527364` then skipped instead of producing exact-head smoke or deep artifacts.
- Why it matters: This is a harness and workflow reliability defect, not a reproduced product regression. It blocks exact-head browser evidence after the site is already live and makes release triage spend time on workflow-chain fallout instead of product risk.
- Recommendation: Broaden the quota parser in [`scripts/bing-webmaster-api.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/bing-webmaster-api.mjs) to recognize the real `exceeded your daily url submission quota` message, and/or make the post-publish Bing Webmaster URL batch step in [`.github/workflows/deploy_dreamhost.yaml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deploy_dreamhost.yaml) fail soft once publish plus crawler-health checks have already succeeded.
- Acceptance criteria: the next head can publish, record quota exhaustion as a non-blocking post-publish outcome when it happens, and still trigger exact-head `E2E Smoke` plus the `admin`, `client`, and `bum` deep shards.

### P2 - [TB-0055] Keep raw-shell, sourced `.env.qa`, and hosted workflow env states separate in every handoff
- Evidence: Raw `corepack pnpm run qa:env` still fails in this shell because `QA_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `QA_ADMIN_EMAIL`, `QA_CLIENT_ADMIN_EMAIL`, `QA_CLIENT_FINANCE_EMAIL`, `QA_CLIENT_MEMBER_EMAIL`, and `QA_BUM_EMAIL` are not exported by default. After sourcing `.env.qa`, `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env` passes and sourced preflight passes against `https://trustedbums.com`. Hosted `QA` run `27653495600` also passed the same base contract on `af944fe`.
- Why it matters: Collapsing raw shell, sourced `.env.qa`, and hosted workflow states into a single "QA env passed" claim still hides whether a failure belongs to local shell setup, `.env.qa` drift, or GitHub Actions configuration.
- Recommendation: Keep every QA harness, QA test, and release handoff split into raw shell, sourced `.env.qa`, and hosted workflow states, and mention only the variable names that are missing in each state.
- Acceptance criteria: future handoffs make it obvious which contract passed or failed in each environment without re-reading raw logs.

## Deep QA Split Plan

- Current split: `admin`, `client`, and `bum` shards in [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml) and [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml).
- Current role-split proof: the latest completed deploy-triggered smoke on current code lineage is GitHub `E2E Smoke` run `27653400898` on `12d777f`, which passed `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`. Downloaded artifacts from that run include suite-specific `qa-target-preflight-artifacts/*/summary.json` and `summary.txt`.
- Current exact-head gap: `af944fe` has no exact-head smoke or deep browser evidence because the deploy workflow failed after publish and the `workflow_run` gate skipped the smoke workflow. Treat that as workflow-chain evidence loss, not as an auth-helper or navigation-helper regression.
- Standalone workflow status: the standalone `Deep QA Hotfix Audit` workflow is still stale at run `27092527987` from 2026-06-07, so the deploy-triggered smoke workflow remains the fresher route for exact-head deep evidence when deploy itself concludes cleanly.
- Escalation rule: keep the current role split as the default. Split a shard further by route or workflow only if a specific shard fails repeatedly after both `qa:target-preflight` and `qa:env` pass.

## Product Defect Handoffs

- [TB-0106] Stop detail-page claims from duplicating My Contacts rows: current `af944fe` source still calls `createBumRepresentedContact()` after a suggested decision-maker-match claim succeeds in [`src/pages/bum/BumOpportunityDetail.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumOpportunityDetail.tsx), while My Contacts separately synthesizes `OPPORTUNITY_CLAIM` rows from `opportunity_claims`. That remains a product bug already handed to QA Test Engineer and Lead Developer, not a harness defect.
- No new current-session product bug was reproduced inside the auth helpers, navigation helpers, localStorage bootstrap, or Deep QA shard logic. The current exact-head hosted chain stopped before Playwright browser execution.

## Agent Inputs

- Date of run: 2026-06-17
- Workflows, artifacts, tests, helpers, scripts, env checks, GitHub runs, tracker rows, and commands reviewed: `docs/qa-harness-reliability-backlog.md`, `docs/qa-test-backlog.md`, `docs/release-verification-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/codex-edit-log.md`, `package.json`, [`playwright.config.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/playwright.config.ts), [`.github/workflows/qa.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/qa.yml), [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml), [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml), [`.github/workflows/deploy_dreamhost.yaml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deploy_dreamhost.yaml), [`scripts/verify-qa-env.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/verify-qa-env.mjs), [`scripts/qa-target-preflight.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/qa-target-preflight.mjs), [`scripts/bing-webmaster-api.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/bing-webmaster-api.mjs), [`tests/e2e/helpers/auth.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/auth.ts), [`tests/e2e/helpers/deepQa.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/deepQa.ts), [`tests/e2e/deep-workflow-hotfix-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), [`src/test/qaTargetPreflight.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/qaTargetPreflight.test.ts), [`src/test/e2eSmokeRegression.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/e2eSmokeRegression.test.ts), [`src/test/deepQaTriage.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/deepQaTriage.test.ts), [`src/test/extensionApiContract.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/extensionApiContract.test.ts), `gh run list --limit 20 --json ...`, `gh run list --workflow 'Visual UI Audit' --limit 10 --json ...`, `gh run list --workflow 'Deep QA Hotfix Audit' --limit 10 --json ...`, `gh run view 27653495695 --json ...`, `gh run view 27653527364 --json ...`, `gh run view 27653400898 --json ...`, `gh run view 27653495695 --log`, `gh run download 27653400898`, `gh run download 27634435369`, raw `corepack pnpm run qa:env`, sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`, sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`, `corepack pnpm exec vitest run src/test/qaTargetPreflight.test.ts src/test/e2eSmokeRegression.test.ts src/test/deepQaTriage.test.ts src/test/extensionApiContract.test.ts`, live Supabase project confirmation for `vaoqvtxqvbptyxddpoju`, live tracker schema read for `public.admin_scrum_items`, and live tracker row reads for `TB-0054`, `TB-0055`, `TB-0105`, and `TB-0106`.
- Hosted verification in this run: GitHub `QA` `27653495600` passed on exact head `af944fe`; deploy `27653495695` failed after publish on Bing Webmaster quota exhaustion; `E2E Smoke` `27653527364` skipped because deploy did not conclude `success`; and the latest completed deploy-triggered smoke on current code lineage, `27653400898` on `12d777f`, passed all smoke and deep suites with retained preflight artifacts.
- Tracker refresh completed in this run: refreshed `TB-0055` to exact head `af944fe` and current env-contract evidence; added harness context to existing `TB-0105` instead of opening a duplicate; re-read `TB-0054` and `TB-0106`, which already matched the current evidence and did not need duplicate tracker rows.
- Checks that could not run and why: no exact-head smoke or deep artifact exists for `af944fe` because deploy failed after publish; no new standalone `Deep QA Hotfix Audit` run was dispatched because the current blocker is deploy-chain reliability rather than a role-specific browser flake.
