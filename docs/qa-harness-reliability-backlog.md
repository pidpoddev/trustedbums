# Trusted Bums QA Harness Reliability Backlog

_Last updated: 2026-06-21 by Codex daily QA harness reliability automation._

## Executive Read

Current `main` head `5af32edeb0cc1290cdbae808207e75276d22a4d6` has two active harness reopens: standalone hosted role-workflow mutation QA flaked in preflight before any protected route loaded, and the standalone client mutation shard opened a fresh browser context without authenticating it before `/client/opportunities/new`.

- GitHub `QA` run `27885457568` on `5af32ed`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27885457565` on `5af32ed`: passed.
- GitHub `E2E Smoke` run `27885474019` on `5af32ed`: passed, including `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- Standalone `Deep QA Hotfix Audit` run `27894244168` on `5af32ed` reopened `TB-0013`: `Role Workflow QA` failed in `qa-target-preflight` before any protected route loaded.
- The same standalone run also opened `TB-0114`: `Deep QA (client)` passed preflight, then hit the public `Account access` page because the mutating deep-QA test opened a fresh client context and never authenticated it before visiting `/client/opportunities/new`.
- Current local source now routes `createClientOpportunity` through `goToAuthedPath(...)`, and this shell re-verified that sourced `qa:target-preflight` still passes on `https://trustedbums.com`.
- The uploaded `role-workflow-qa` artifact from `27894244168` shows `DNS`, `Clerk`, and `Extension API` passed, while `HTTPS` failed with `fetch failed` and `App shell` failed only because the base HTML was never fetched.
- The same session still returned `HTTP/2 200` and `<div id="root">` from `https://trustedbums.com`, and sibling standalone `Deep QA (admin)` plus `Deep QA (bum)` jobs on `27894244168` completed successfully.
- Raw-shell versus sourced `.env.qa` versus hosted env states remain explicitly separate in this backlog:
  - raw `corepack pnpm run qa:env`: failed because the shell did not have the required QA variables exported.
  - sourced `.env.qa` `corepack pnpm run qa:env`: passed.
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`: passed.

`TB-0055` and `TB-0112` remain closed on current head. The exact-head harness reopens are the standalone preflight fetch flake in `TB-0013` and the standalone client auth-bootstrap omission in `TB-0114`.

## Active Harness Fixes

### P1 - [TB-0013] Stabilize standalone role-workflow preflight on exact head `5af32ed`
- Evidence: `Deep QA Hotfix Audit` `27894244168` failed `Role Workflow QA` in `qa-target-preflight` before any protected route loaded. The retained `qa-target-preflight-artifacts/workflow/summary.json` shows `DNS`, `Clerk`, and `Extension API` passed, while `HTTPS` failed with `fetch failed` and `App shell` failed second-order.
- Why it matters: the GitHub-hosted mutation lane is now part of the business-workflow QA contract for the unclaimed opportunity lifecycle and the Bum LinkedIn CSV import flow. Leaving this flake unresolved would force QA to keep relying on older local mutation proof.
- Recommendation: treat the failure as harness or target-availability debt first, not as a route-level product regression. Add deterministic retry or rerun handling for standalone fetch failures, then rerun `Deep QA Hotfix Audit` with `mutation_mode=true` until `Role Workflow QA` reaches the product mutations on the authoritative GitHub path.
- Acceptance criteria: a same-head or newer exact-head hosted `Deep QA Hotfix Audit` run completes `Role Workflow QA` successfully, executes the mutation scenarios, and uploads workflow proof rather than only a failing preflight summary.

### P1 - [TB-0114] Authenticate the standalone client mutation context before the first protected route
- Evidence: standalone `Deep QA (client)` on `27894244168` passed `qa-target-preflight`, `qa:env`, and auth helper setup, then failed because `tests/e2e/deep-workflow-hotfix-audit.spec.ts` opens a fresh browser context and goes directly to `/client/opportunities/new` without signing it in. The retained Playwright error context shows the public `Account access` page instead of the client Opportunities workspace.
- Why it matters: the standalone client mutation shard cannot prove the opportunity lifecycle until its first protected-route step shares the same auth bootstrap discipline as the rest of the deep-QA suite.
- Recommendation: keep the pending local source fix that reuses `goToAuthedPath(...)` before `createClientOpportunity`, then rerun the standalone hosted client shard once cleanup-capable QA credentials are available so the authoritative GitHub lane proves the route instead of the public auth page.
- Acceptance criteria: the next same-head or newer standalone client shard reaches `/client/opportunities/new` as an authenticated Client Admin and either completes the mutation proof or produces a later route-level failure.

## Deep QA Split Plan

- Current split remains `admin`, `client`, and `bum` shards in [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml) and [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml).
- Current exact-head deploy-triggered proof is clean: `E2E Smoke` `27885474019` passed `smoke` plus all three deep shards on `5af32ed`.
- Current standalone status is mixed: `Role Workflow QA` failed in preflight on `27894244168`, standalone `Deep QA (client)` failed later because its fresh client context was never authenticated, and standalone `Deep QA (admin)` plus `Deep QA (bum)` on the same run passed.
- Failure-attribution rule remains unchanged: when `qa:target-preflight` fails before any protected route loads, classify the shard as harness or target-availability first, not as a route-level product defect.
- Escalation rule: keep the current role split. Split a shard further only if a current-head shard starts failing repeatedly after smoke-stage preflight and suite-local reproduction both pass.

## Product Defect Handoffs

- No open exact-head product defect was reproduced inside the auth helpers, navigation helpers, localStorage bootstrap, deep-QA route partitioning, `.env.qa` contract checks, or artifact capture path in this pass.
- Current exact-head live SQL still shows the new delete policy and admin-dashboard summary helper split present. The missing migration-ledger rows for `20260620151519` and `20260620152414` are provenance debt, not a newly reproduced workflow failure.
- `TB-0013` should stay with QA Harness Reliability until a rerun fails after preflight passes. Do not hand this failure to product route owners from the current evidence alone.
- `TB-0114` is also a harness-side auth-bootstrap defect, not a reproduced product route regression, because the failure page is the public `Account access` screen and the failing hosted run never established a client session in that browser context. Current local source now uses the shared auth helper before that route, so remaining closeout is hosted rerun evidence.

## Agent Inputs

- Date of run: 2026-06-21 (`America/New_York`).
- Workflows, artifacts, tests, helpers, scripts, tracker rows, env checks, and commands reviewed:
  - `docs/qa-harness-reliability-backlog.md`
  - `docs/qa-test-backlog.md`
  - `docs/release-verification-backlog.md`
  - `docs/lead-developer-recommendations.md`
  - `docs/codex-edit-log.md`
  - [`scripts/qa-target-preflight.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/qa-target-preflight.mjs)
  - [`tests/e2e/workflow-qa-matrix.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/workflow-qa-matrix.spec.ts)
  - [`tests/e2e/helpers/deepQa.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/deepQa.ts)
  - [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml)
  - [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml)
  - `git rev-parse HEAD`
  - `git log --oneline -12`
  - raw `corepack pnpm run qa:env`
  - sourced `.env.qa` `corepack pnpm run qa:env`
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27885474019 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums workflow run .github/workflows/deep-qa-hotfix-audit.yml --repo Pidpoddev/trustedbums --ref main -f target_url='https://trustedbums.com' -f mutation_mode=true`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27894244168 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run download 27894244168 --repo Pidpoddev/trustedbums --name role-workflow-qa --dir /tmp/tb-role-workflow-YV66og`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -L --max-time 20 https://trustedbums.com`
  - `corepack pnpm exec vitest run src/test/deepQaTriage.test.ts`
  - sourced `.env.qa` `QA_BASE_URL=https://trustedbums.com QA_DEEP_SUITE=client QA_DEEP_MUTATION=1 corepack pnpm exec playwright test tests/e2e/deep-workflow-hotfix-audit.spec.ts --project=chromium --grep "attempts legal acceptance and mutating client workflows with cleanup"` (skipped because `QA_SUPABASE_SERVICE_ROLE_KEY` was present but not JWT-shaped for cleanup-enabled mutation)
  - `supabase db query --linked -o json ...` for tracker row reads on `public.admin_scrum_items`
- Hosted verification in this run:
  - exact-head `QA` `27885457568` passed
  - exact-head deploy `27885457565` passed
  - exact-head `E2E Smoke` `27885474019` passed
  - standalone `Role Workflow QA` on `27894244168` failed in preflight before product proof
  - standalone `Deep QA (client)` on `27894244168` failed after preflight because the client mutation context never authenticated
  - standalone `Deep QA (admin)` and `Deep QA (bum)` on `27894244168` passed
- Tracker status recheck completed in this run:
  - `TB-0013` was reopened for the standalone preflight fetch flake
  - `TB-0114` was created for the standalone client mutation auth-bootstrap gap
  - `TB-0055` remains `CLOSED`
  - `TB-0112` remains `CLOSED`
- Checks that could not fully close and why:
  - the standalone hosted mutation lane did not reach protected routes because preflight failed first
  - the standalone hosted client mutation lane still needs rerun proof after the local auth-bootstrap fix; this shell could not re-exercise cleanup-enabled mutation because `.env.qa` still exposes `QA_SUPABASE_SERVICE_ROLE_KEY` in a non-JWT shape
