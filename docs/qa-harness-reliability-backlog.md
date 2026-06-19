# Trusted Bums QA Harness Reliability Backlog

_Last updated: 2026-06-19 by Codex daily QA harness reliability automation._

## Executive Read

Current `main` head `a17a85639a1b24dfda36da87d763eb4ecd3457af` does not reproduce a primary-host harness-chain failure. Exact-head hosted QA, deploy, smoke, and deploy-triggered deep QA are all green on `https://trustedbums.com`. The remaining live harness work is narrower: keep the raw-shell versus sourced `.env.qa` versus hosted env states separate, and restore per-shard preflight summaries for deploy-triggered Deep QA so a later shard-only failure can still be classified cleanly.

- GitHub `QA` run `27798687806` on `a17a856`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27798687708` on `a17a856`: passed.
- GitHub `E2E Smoke` run `27798711531` on `a17a856`: passed.
- `27798711531` also passed `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- Downloaded smoke artifacts from `27798711531` retain `qa-target-preflight-artifacts/summary.json` and `summary.txt`.
- Downloaded deploy-triggered deep artifacts from `27798711531` do not contain their own `summary.json` or `summary.txt`; the deep jobs set `QA_TARGET_PREFLIGHT_OUTPUT_DIR`, but they do not run `pnpm run qa:target-preflight` before `pnpm run qa:deep`.
- Raw `pnpm run qa:env`: failed because the shell did not have the required QA variables exported.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip pnpm run qa:env`: passed.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com pnpm run qa:target-preflight`: passed DNS, HTTPS, app shell, and Clerk checks.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://rcdl.tplinkdns.com pnpm run qa:target-preflight`: resolved DNS to `69.131.216.220`, then failed `HTTPS`; the paired `App shell` miss was derivative because no trusted base HTML was available to inspect. `curl` without `-k` failed local certificate verification, and `curl -k` returned `HTTP 403` with `Rejected request from RFC1918 IP to public server address`. That remains `TB-0024` external-target contract or infrastructure evidence, not a harness defect.

`TB-0054` remains closed. The active harness queue in this backlog is now `TB-0055` plus new `TB-0112`.

## Active Harness Fixes

### P2 - [TB-0112] Add per-shard preflight summaries to deploy-triggered Deep QA
- Evidence: [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml) runs deploy-triggered deep shards with `pnpm run qa:env && pnpm run qa:deep`, not `pnpm run qa:target-preflight`. Exact-head logs for `Deep QA (admin)` and `Deep QA (client)` in `27798711531` show `QA_TARGET_PREFLIGHT_OUTPUT_DIR` being set and uploaded, but no `qa-target-preflight` execution. Downloaded deep artifacts for `admin`, `client`, and `bum` contain no suite-scoped `summary.json` or `summary.txt`.
- Why it matters: if a single deep shard later fails because the target, TLS chain, app shell, or auth bootstrap drifted after smoke already passed, the shard artifact cannot prove whether the failure belongs to target availability or route-level product behavior. That raises the risk of false product handoffs.
- Recommendation: add a per-shard `pnpm run qa:target-preflight` step before `pnpm run qa:deep` in deploy-triggered deep jobs, or add an equivalent helper that always writes suite-scoped `summary.json` and `summary.txt` into each deep artifact before route auditing starts.
- Acceptance criteria: each deploy-triggered deep artifact contains suite-scoped preflight summaries, and a failed shard can be classified from its own artifact without relying only on the earlier smoke-stage summary.

### P2 - [TB-0055] Keep raw-shell, sourced `.env.qa`, and hosted workflow env states separate in every handoff
- Evidence: raw `pnpm run qa:env` still fails in this shell because `QA_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `QA_ADMIN_EMAIL`, `QA_CLIENT_ADMIN_EMAIL`, `QA_CLIENT_FINANCE_EMAIL`, `QA_CLIENT_MEMBER_EMAIL`, and `QA_BUM_EMAIL` are not exported by default. After sourcing `.env.qa`, `QA_EXTENSION_API_EXPECTATION=skip pnpm run qa:env` passes, sourced preflight against `https://trustedbums.com` passes, and hosted `QA` `27798687806`, deploy `27798687708`, and `E2E Smoke` `27798711531` all passed on the exact current head.
- Why it matters: collapsing those three states into one “QA env passed” sentence still hides whether the problem belongs to local shell setup, `.env.qa` drift, or GitHub Actions configuration.
- Recommendation: keep raw shell, sourced `.env.qa`, and hosted workflow results split in every QA, release, and harness handoff, and mention only variable names when the raw shell is missing exports.
- Acceptance criteria: future handoffs preserve all three env states distinctly without implying that a sourced or hosted pass means the raw shell was healthy.

## Deep QA Split Plan

- Current split: `admin`, `client`, and `bum` shards in [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml) and [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml).
- Current exact-head proof: `E2E Smoke` run `27798711531` passed `smoke` plus all three deep shards on `a17a856`.
- Current artifact proof: smoke-stage artifact retention is still good on `27798711531`; deploy-triggered deep jobs still need `TB-0112` so each shard has its own preflight summary.
- Failure-attribution rule: when `qa:target-preflight` fails before any protected route loads, classify the shard as a harness or target-availability problem first, not as a route-level product defect. On 2026-06-19, `https://rcdl.tplinkdns.com` demonstrated the same rule: `HTTPS` failed first, and the `App shell` miss was only second-order.
- Standalone workflow status: the standalone `Deep QA Hotfix Audit` workflow is still stale at run `27092527987` on `850e507`, but that is no longer the freshest deep evidence surface because deploy-triggered deep shards are current and green on `a17a856`.
- Escalation rule: keep the current role split. Split a shard further only if a specific exact-head shard starts failing repeatedly after smoke-stage preflight and suite-local reproduction both pass.

## Product Defect Handoffs

- No new exact-head product defect was reproduced inside the auth helpers, navigation helpers, localStorage bootstrap, or deep-QA route audits during this run.
- `TB-0024` stayed with QA Test Engineer, Release Verification, Lead Developer, and Infrastructure as an external-target contract or infrastructure issue. Do not hand it to product engineering as a route regression unless `https://trustedbums.com` or a shard-local preflight starts failing too.

## Agent Inputs

- Date of run: 2026-06-19
- Workflows, artifacts, tests, helpers, scripts, env checks, tracker rows, and commands reviewed:
  - `docs/qa-harness-reliability-backlog.md`
  - `docs/qa-test-backlog.md`
  - `docs/release-verification-backlog.md`
  - `docs/lead-developer-recommendations.md`
  - `docs/codex-edit-log.md`
  - `package.json`
  - [`playwright.config.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/playwright.config.ts)
  - [`.github/workflows/qa.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/qa.yml)
  - [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml)
  - [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml)
  - [`tests/e2e/helpers/auth.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/auth.ts)
  - [`tests/e2e/authenticated-role-smoke.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/authenticated-role-smoke.spec.ts)
  - [`tests/e2e/visual-ui-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts)
  - [`scripts/verify-qa-env.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/verify-qa-env.mjs)
  - [`scripts/qa-target-preflight.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/qa-target-preflight.mjs)
  - raw `pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com pnpm run qa:target-preflight`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://rcdl.tplinkdns.com pnpm run qa:target-preflight`
  - `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`
  - `curl -k -I -L --max-time 20 https://rcdl.tplinkdns.com`
  - `curl -k --max-time 20 -L https://rcdl.tplinkdns.com`
  - `gh run list --limit 24 --json ...`
  - `gh run list --workflow "Visual UI Audit" --limit 6 --json ...`
  - `gh run list --workflow "Deep QA Hotfix Audit" --limit 8 --json ...`
  - `gh run view 27798711531 --json jobs,...`
  - `gh run view 27798711531 --job 82264090453 --log`
  - `gh run view 27798711531 --job 82264536822 --log`
  - `gh run view 27798711531 --job 82264536817 --log`
  - `gh run download 27798711531 --dir /tmp/tb-e2e-a17a856-XT9PgT`
  - `find /tmp/tb-e2e-a17a856-XT9PgT -maxdepth 8 -name 'summary.json' -o -name 'summary.txt'`
  - `mcp__codex_apps__supabase._get_project`
  - `mcp__codex_apps__supabase._get_project_url`
  - `mcp__codex_apps__supabase._execute_sql` for tracker refreshes `TB-0024`, `TB-0055`, and new `TB-0112`
- Hosted verification in this run:
  - exact-head `QA` `27798687806` passed
  - exact-head deploy `27798687708` passed
  - exact-head `E2E Smoke` `27798711531` passed
  - exact-head deploy-triggered `Deep QA (admin|client|bum)` all passed inside `27798711531`
- Tracker status recheck completed in this run:
  - `TB-0054` remains `CLOSED`
  - `TB-0055` remains `OPEN` and was refreshed to exact head `a17a856`
  - `TB-0112` was opened for missing per-shard preflight summaries in deploy-triggered deep QA
  - `TB-0024` remains `OPEN` with corrected HTTPS and certificate evidence; it is not counted as a harness defect here
- Checks that could not run and why:
  - no newer standalone `Deep QA Hotfix Audit` run exists than `27092527987`, so the standalone lane remained a stale-lane observation rather than a current blocker
  - no new GitHub workflow dispatch was needed in this automation run because exact-head `QA`, deploy, and deploy-triggered deep evidence already existed for `a17a856`
