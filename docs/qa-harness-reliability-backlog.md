# Trusted Bums QA Harness Reliability Backlog

_Last updated: 2026-06-18 by Codex daily QA harness reliability automation._

## Executive Read

Current `main` head `57231bf75e9900c11aea964ec9999517a831d1ca` does not reproduce an active harness-chain failure. Exact-head hosted QA, deploy, smoke, and deploy-triggered deep QA are all green, and current smoke artifacts retain the preflight summaries that earlier harness runs were trying to restore.

- GitHub `QA` run `27710960865` on `57231bf`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27710961582` on `57231bf`: passed.
- GitHub `E2E Smoke` run `27711014094` on `57231bf`: passed.
- `27711014094` also passed `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- Downloaded `27711014094` artifacts include `qa-target-preflight-artifacts/summary.json` and `summary.txt`.
- The latest non-current failed smoke run still supports a harness-only diagnosis instead of a product handoff: `E2E Smoke` `27706706707` on `4e96b9ca606d7956d002565724e0a481c1e86a34` passed `smoke`, `Deep QA (admin)`, and `Deep QA (bum)`, but `Deep QA (client)` failed before any protected route audit because `qa:target-preflight` logged `FAIL HTTPS: fetch failed`, then logged a second-order `FAIL App shell` only because no base HTML was available to inspect.

Current-session local harness contract evidence stayed consistent:

- Raw `corepack pnpm run qa:env`: failed because the shell did not have the required QA variables exported.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`: passed.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`: passed DNS, HTTPS, app shell, and Clerk checks against `https://trustedbums.com`.

`TB-0105` and `TB-0054` remain closed on current source and hosted evidence. The only active harness item carried forward here is `TB-0055`, because the raw-shell versus sourced-env versus hosted-workflow distinction still matters every run.

## Active Harness Fixes

### P2 - [TB-0055] Keep raw-shell, sourced `.env.qa`, and hosted workflow env states separate in every handoff
- Evidence: raw `corepack pnpm run qa:env` still fails in this shell because `QA_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `QA_ADMIN_EMAIL`, `QA_CLIENT_ADMIN_EMAIL`, `QA_CLIENT_FINANCE_EMAIL`, `QA_CLIENT_MEMBER_EMAIL`, and `QA_BUM_EMAIL` are not exported by default. After sourcing `.env.qa`, `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env` passes, sourced preflight passes, and hosted `QA` `27710960865` also passed on the current head.
- Why it matters: collapsing those three states into a single “QA env passed” sentence still hides whether the problem belongs to local shell setup, `.env.qa` drift, or GitHub Actions configuration.
- Recommendation: keep raw shell, sourced `.env.qa`, and hosted workflow results split in every QA, release, and harness handoff, and mention only variable names when the raw shell is missing exports.
- Acceptance criteria: future handoffs preserve all three env states distinctly without implying that a sourced or hosted pass means the raw shell was healthy.

## Deep QA Split Plan

- Current split: `admin`, `client`, and `bum` shards in [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml) and [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml).
- Current role-split proof: `E2E Smoke` run `27711014094` passed `smoke` plus all three deep shards on the exact current head.
- Current artifact-retention proof: `27711014094` retained `qa-target-preflight-artifacts/summary.json` and `summary.txt`.
- Failure-attribution rule: when `qa:target-preflight` fails before any protected route loads, classify the shard as a harness or target-availability problem first, not as a route-level product defect. Historical example: `Deep QA (client)` inside `27706706707` never reached route audit because HTTPS fetch failed during preflight; the paired `App shell` failure was derivative, not an independent client-route regression.
- Standalone workflow status: the standalone `Deep QA Hotfix Audit` workflow is still stale at run `27092527987` on `850e507`, but that is no longer the freshest deep evidence surface because the deploy-triggered deep shards are current on `57231bf`.
- Escalation rule: keep the current role split. Split a shard further only if a specific exact-head shard starts failing repeatedly after both sourced `qa:env` and sourced `qa:target-preflight` pass.

## Product Defect Handoffs

- No new current-session defect was reproduced inside the auth helpers, navigation helpers, localStorage bootstrap, artifact-upload path, or deep-QA shard orchestration.
- The failed client deep shard on `4e96b9c` was not handed to QA Test Engineer or Lead Developer as a client-route bug because the shard failed in preflight before any protected client route or button audit began.
- `TB-0019` was reopened by QA as a release-gate drift issue, not a harness defect.

## Agent Inputs

- Date of run: 2026-06-18
- Workflows, artifacts, tests, helpers, scripts, env checks, tracker rows, and commands reviewed:
  - `docs/qa-harness-reliability-backlog.md`
  - `docs/qa-test-backlog.md`
  - `docs/release-verification-backlog.md`
  - `docs/codex-edit-log.md`
  - `package.json`
  - [`playwright.config.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/playwright.config.ts)
  - [`.github/workflows/qa.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/qa.yml)
  - [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml)
  - [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml)
  - [`.github/workflows/deploy_dreamhost.yaml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deploy_dreamhost.yaml)
  - [`scripts/verify-qa-env.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/verify-qa-env.mjs)
  - [`scripts/qa-target-preflight.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/qa-target-preflight.mjs)
  - [`scripts/bing-webmaster-api.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/bing-webmaster-api.mjs)
  - raw `corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`
  - `gh run view 27710960865 --json jobs,...`
  - `gh run view 27711014094 --json jobs,...`
  - `gh run view 27706706707 --json jobs,...`
  - `gh run view 27706706707 --job 81957955059 --log-failed`
  - `gh run list --workflow "Deep QA Hotfix Audit" --limit 8 --json ...`
  - `gh run download 27711014094 --dir /tmp/tb-e2e-27711014094`
  - `gh run download 27706706707 --dir /tmp/tb-e2e-27706706707`
  - `find /tmp/tb-e2e-27711014094 -maxdepth 5 -name 'summary.json' -o -name 'summary.txt'`
  - `find /tmp/tb-e2e-27706706707 -maxdepth 5 -name 'summary.json' -o -name 'summary.txt' -o -name '*.md'`
  - `mcp__codex_apps__supabase._execute_sql` for tracker rows `TB-0054`, `TB-0055`, `TB-0105`, and `TB-0106`
- Hosted verification in this run:
  - exact-head `QA` `27710960865` passed
  - exact-head deploy `27710961582` passed
  - exact-head `E2E Smoke` `27711014094` passed
  - exact-head deploy-triggered `Deep QA (admin|client|bum)` all passed inside `27711014094`
- Tracker status recheck completed in this run:
  - `TB-0054` remains `CLOSED`
  - `TB-0055` remains `OPEN`
  - `TB-0105` remains `CLOSED`
- Checks that could not run and why:
  - no newer standalone `Deep QA Hotfix Audit` run exists yet than `27092527987`; this remained a stale-lane observation rather than a current harness blocker because deploy-triggered deep QA is current and green
