# Trusted Bums QA Harness Reliability Backlog

_Last updated: 2026-06-20 by Codex daily QA harness reliability automation._

## Executive Read

Current `main` head `e231cc07ee6959bc8eac9d04ed3b68b80d76f6c4` has no open harness-only tracker items.

- GitHub `QA` run `27857690007` on `e231cc0`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27857689995` on `e231cc0`: passed.
- GitHub `Visual UI Audit` run `27857691601` on `e231cc0`: passed.
- GitHub `E2E Smoke` run `27857708006` on `e231cc0`: passed, including `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- Downloaded smoke artifacts from `27857708006` retain `qa-target-preflight-artifacts/summary.json` and `summary.txt`.
- Downloaded deploy-triggered deep artifacts from `27857708006` now each retain their own suite-scoped `summary.json` and `summary.txt` under `qa-target-preflight-artifacts/admin`, `client`, and `bum`, so `TB-0112` is closed on current head.
- The raw-shell versus sourced `.env.qa` versus hosted env states remain explicitly separate in this backlog and are still guarded by [scrumFiveBatch.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/scrumFiveBatch.test.ts); future handoffs must keep hosted workflow results split from local env states.
- raw `pnpm run qa:env`: failed because the shell did not have the required QA variables exported.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`: passed.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`: passed DNS, HTTPS, app shell, and Clerk checks.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://rcdl.tplinkdns.com corepack pnpm run qa:target-preflight`: passed DNS, then failed `HTTPS` and `App shell`. That remains `TB-0024` external-target contract or infrastructure evidence, not a harness defect.
- The latest standalone `Deep QA Hotfix Audit` workflow run is still stale at `27092527987` on `850e507`, but that is no longer the freshest deep evidence surface because deploy-triggered deep shards are current and green on `e231cc0`.

`TB-0055` and `TB-0112` are both `CLOSED` on current head. No replacement harness defect was reproduced in current code, current artifacts, or current local preflight.

## Active Harness Fixes

### No open harness-only tracker items on exact head `e231cc0`
- Evidence: live tracker rows `TB-0055` and `TB-0112` are both `CLOSED` on `e231cc0`, exact-head hosted `QA`, deploy, visual, and deploy-triggered deep QA are all green, and the downloaded `27857708006` artifacts prove suite-scoped preflight summaries exist for `admin`, `client`, and `bum`.
- Why it matters: carrying forward already-closed harness work would turn the backlog into stale prose and make future product failures harder to classify.
- Recommendation: preserve the current harness guardrails already in source: suite-scoped preflight before dependent deep shards, current-session route reuse, bounded auth bootstrap, chrome-error rejection, and the raw-shell versus sourced `.env.qa` versus hosted env states wording split. Reopen the backlog only when a newer exact-head run reproduces a harness-only defect with artifact or log evidence.
- Acceptance criteria: any future harness reopen cites a current or newer exact-head run, reproduces on the current helper or workflow path, and has a matching tracker row before it is carried forward here.

## Deep QA Split Plan

- Current split: `admin`, `client`, and `bum` shards in [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml) and [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml).
- Current exact-head proof: `E2E Smoke` run `27857708006` passed `smoke` plus all three deep shards on `e231cc0`.
- Current artifact proof: smoke-stage artifact retention is still good on `27857708006`, and deploy-triggered deep jobs now retain their own suite-scoped preflight summaries and deep-QA reports.
- Failure-attribution rule: when `qa:target-preflight` fails before any protected route loads, classify the shard as a harness or target-availability problem first, not as a route-level product defect. The current `https://rcdl.tplinkdns.com` failure still demonstrates the same rule: `HTTPS` failed first, and the `App shell` miss was only second-order.
- Standalone workflow status: the standalone `Deep QA Hotfix Audit` workflow is still stale at run `27092527987` on `850e507`, but it is not an active blocker while deploy-triggered deep shards remain current and exact-head green.
- Historical regression note: intermediate head `207331093565b490a7eeab0c042bf25b23a12a63` briefly failed admin Deep QA run `27857294287` because `/admin/emails` rendered visible text `0 failed`, which the visible-error heuristic treated as a P1 signal. Current head `e231cc0` changed the page copy in [AdminEmails.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminEmails.tsx), and exact-head `27857708006` cleared the issue. Treat that as a resolved product wording defect, not a current harness drift item.
- Escalation rule: keep the current role split. Split a shard further only if a specific exact-head shard starts failing repeatedly after smoke-stage preflight and suite-local reproduction both pass.

## Product Defect Handoffs

- No open exact-head product defect was reproduced inside the auth helpers, navigation helpers, localStorage bootstrap, deep-QA route partitioning, `.env.qa` contract checks, or artifact capture path during this run.
- Resolved historical handoff: intermediate head `2073310` surfaced a short-lived product wording defect on `/admin/emails` (`Visible error after safe button exploration: 0 failed`) in admin Deep QA run `27857294287`. Current head `e231cc0` fixed that copy, and exact-head run `27857708006` cleared it. QA Test Engineer and Lead Developer already have the current-head closure evidence in the exact-head QA and release ledgers, so no open harness-side follow-up remains.
- `TB-0024` stays with QA Test Engineer, Release Verification, Lead Developer, and Infrastructure as an external-target contract or infrastructure issue. Do not hand it to product engineering as a route regression unless `https://trustedbums.com` or a shard-local preflight starts failing too.

## Agent Inputs

- Date of run: 2026-06-20 (`America/New_York`).
- Workflows, artifacts, tests, helpers, scripts, tracker rows, env checks, and commands reviewed:
  - `docs/qa-harness-reliability-backlog.md`
  - `docs/qa-test-backlog.md`
  - `docs/release-verification-backlog.md`
  - `docs/lead-developer-recommendations.md`
  - `docs/codex-edit-log.md`
  - `package.json`
  - [`playwright.config.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/playwright.config.ts)
  - [`scripts/verify-qa-env.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/verify-qa-env.mjs)
  - [`scripts/qa-target-preflight.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/qa-target-preflight.mjs)
  - [`tests/e2e/helpers/auth.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/auth.ts)
  - [`tests/e2e/helpers/deepQa.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/deepQa.ts)
  - [`tests/e2e/deep-workflow-hotfix-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts)
  - [`tests/e2e/portal-interaction-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts)
  - [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml)
  - [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml)
  - [Admin emails](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminEmails.tsx)
  - `git rev-parse HEAD`
  - `git log --oneline -12`
  - raw `corepack pnpm run qa:env`
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://rcdl.tplinkdns.com corepack pnpm run qa:target-preflight`
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 30 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Deep QA Hotfix Audit" --limit 10 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27857708006 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27857294287 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27857294287 --repo Pidpoddev/trustedbums --job 82447421055 --log`
  - `/Users/macdaddy/bin/gh-trustedbums run download 27857708006 --repo Pidpoddev/trustedbums --dir /tmp/tb-e2e-e231cc0-Wn8bBl`
  - `/Users/macdaddy/bin/gh-trustedbums run download 27857294287 --repo Pidpoddev/trustedbums --dir /tmp/tb-e2e-2073310-aQrnl5`
  - `find /tmp/tb-e2e-e231cc0-Wn8bBl -maxdepth 6 ...`
  - `find /tmp/tb-e2e-2073310-aQrnl5 -maxdepth 6 ...`
  - Supabase changelog skim: `curl -fsSL https://supabase.com/changelog.md`
  - `mcp__codex_apps__supabase._list_projects`
  - `mcp__codex_apps__supabase._execute_sql` for tracker row and schema reads on `public.admin_scrum_items`
- Hosted verification in this run:
  - exact-head `QA` `27857690007` passed
  - exact-head deploy `27857689995` passed
  - exact-head `Visual UI Audit` `27857691601` passed
  - exact-head `E2E Smoke` `27857708006` passed
  - exact-head deploy-triggered `Deep QA (admin|client|bum)` all passed inside `27857708006`
- Tracker status recheck completed in this run:
  - `TB-0055` is `CLOSED` on exact head `e231cc0`
  - `TB-0112` is `CLOSED` on exact head `e231cc0`
  - `TB-0024` remains `OPEN` and separate from harness defects
- Checks that could not fully close and why:
  - no newer standalone `Deep QA Hotfix Audit` run exists than `27092527987`, so the standalone lane remains a stale-lane observation rather than an exact-head blocker
  - no new GitHub workflow dispatch was needed in this automation run because exact-head `QA`, deploy, visual, and deploy-triggered deep evidence already exist for `e231cc0`
