# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-21 by Codex daily QA/test engineer automation._

## Executive Read

Current `main` head `5af32edeb0cc1290cdbae808207e75276d22a4d6` is product-green on the primary hosted lane, but QA is not fully closed on current head because the release-evidence lane drifted and the new hosted role-workflow mutation lane flaked before it ever reached product mutations.

- GitHub `QA` run `27885457568` on `5af32ed`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27885457565` on `5af32ed`: passed.
- GitHub `E2E Smoke` run `27885474019` on `5af32ed`: passed, including `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- Standalone `Deep QA Hotfix Audit` run `27894244168` on `5af32ed` surfaced two separate QA issues:
  - `TB-0013`: uploaded `role-workflow-qa` preflight artifacts show `DNS`, `Clerk`, and `Extension API` passed, while `HTTPS` failed with `fetch failed` and `App shell` failed second-order because the base HTML was never fetched.
  - `TB-0114`: the client shard passed preflight, then failed because `tests/e2e/deep-workflow-hotfix-audit.spec.ts` opened a fresh client browser context and went straight to `/client/opportunities/new` without authenticating it, so the hosted run landed on the public `Account access` page instead of the client Opportunities workspace.
  - The same `https://trustedbums.com` target returned `HTTP/2 200` plus `<div id="root">` from this runner during the same session, and standalone `Deep QA (admin)` plus `Deep QA (bum)` jobs in that run completed successfully.
- Current-session local proof stayed split across the required QA env surfaces:
  - Raw `corepack pnpm run qa:env`: failed because the shell did not have the required QA variables exported.
  - Sourced `.env.qa` `corepack pnpm run qa:env`: passed.
  - Sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`: passed.
  - Focused current-head regression pack passed: `src/test/businessWorkflowQaContract.test.ts`, `src/test/e2eSmokeRegression.test.ts`, `src/test/clientOpportunityDelete.test.ts`, `src/test/deepQaTriage.test.ts`, `src/test/accessBoundaryRegression.test.ts`, `src/test/invitationRedirect.test.ts`, and `src/test/scrumQueueRegression.test.ts` (`37/37`).
- Live Supabase object proof on project `vaoqvtxqvbptyxddpoju` is good for the current code paths:
  - `public.companies.deal_registration_config` still exists live.
  - The client delete policy for unclaimed `opportunity_registrations` exists live and still enforces current-company plus no-claim delete behavior.
  - `public.admin_dashboard_summary()` remains `SECURITY INVOKER` and delegates to `private.admin_dashboard_summary_data()` as a `SECURITY DEFINER` helper.
- Live migration-ledger provenance is still incomplete for the latest database-backed fixes:
  - `supabase_migrations.schema_migrations` contains `20260620134628 add_client_deal_registration_config`.
  - The ledger still does not contain `20260620151519` or `20260620152414`, even though the required live policy and function objects are present.
  - Inference from current live SQL: this is control-plane or provenance debt, not a newly reproduced product defect on current head.
- [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still approves `1b3664a87c2176b86ac45b43e017277aaf0d6342`, not `5af32ed`, so `TB-0019` must be reopened.

## Active Recommendations

### P1 - [TB-0019] Refresh exact-head Code Review for `5af32ed`
- Evidence: current exact-head hosted proof is green on `5af32ed` (`QA` `27885457568`, deploy `27885457565`, `E2E Smoke` `27885474019`), but [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still names `1b3664a`.
- Why it matters: release, merge, and tracker closeout claims cannot stay tied to an older reviewed head after `main` advances.
- Recommendation: rerun the Code Review Agent on `5af32ed` before any current-head release-close or merge-to-main claim is treated as complete.
- Acceptance criteria: the review marker names `5af32edeb0cc1290cdbae808207e75276d22a4d6`, and the closure note cites the same-head hosted proof that QA used in this pass.

### P1 - [TB-0013] Re-run hosted role workflow QA after the standalone preflight fetch flake is fixed
- Evidence: standalone `Deep QA Hotfix Audit` run `27894244168` on `5af32ed` failed `Role Workflow QA` before any protected route loaded. Uploaded `qa-target-preflight-artifacts/workflow/summary.json` shows `DNS`, `Clerk`, and `Extension API` passed, while `HTTPS` failed with `fetch failed` and `App shell` failed only because the HTML body was never fetched. The same session still returned `HTTP/2 200` plus `<div id="root">` from `https://trustedbums.com`, and sibling standalone `Deep QA (admin)` and `Deep QA (bum)` jobs succeeded on the same run.
- Why it matters: the business-workflow contract now requires the hosted mutation lane to prove the unclaimed opportunity lifecycle and the Bum LinkedIn CSV import flow on the authoritative GitHub path, not only from prior local proof.
- Recommendation: treat this as QA Harness Reliability debt first, add a deterministic retry or rerun path for standalone preflight fetch failures, then rerun `Deep QA Hotfix Audit` with `mutation_mode=true` until `Role Workflow QA` passes on the same head.
- Acceptance criteria: a same-head or newer exact-head hosted `Deep QA Hotfix Audit` run completes `Role Workflow QA` successfully, the product scenarios execute instead of failing in preflight, and the uploaded `role-workflow-qa` artifact contains the workflow proof rather than only a failing preflight summary.

### P1 - [TB-0114] Authenticate the standalone client mutation context before `/client/opportunities/new`
- Evidence: standalone `Deep QA (client)` on `27894244168` passed `qa-target-preflight` and then failed on `createClientOpportunity` because `tests/e2e/deep-workflow-hotfix-audit.spec.ts` opens a fresh browser context and never signs in before `page.goto("/client/opportunities/new")`. The retained Playwright error context shows the public `Account access` page with `Sign in` and `Create account` buttons instead of the client Opportunities heading.
- Why it matters: the authoritative GitHub mutation lane cannot prove the unclaimed client opportunity lifecycle if the client shard loses auth before the first write path starts.
- Recommendation: authenticate the fresh client mutation context with the same QA Client Admin account before visiting `/client/opportunities/new`, then rerun the standalone hosted client mutation shard on the same head.
- Acceptance criteria: a same-head or newer hosted `Deep QA Hotfix Audit` client shard reaches `/client/opportunities/new` as an authenticated client, creates the synthetic opportunity, and either proves the full cleanup-safe mutation workflow or fails later with route-level evidence.

## Closed Current-Head Items

- `TB-0097` stays closed on `5af32ed`: live `deal_registration_config` object proof still holds, current hosted smoke stayed green, and no current session evidence reproduced a client-profile governance regression.
- `TB-0055` stays closed on `5af32ed`: raw-shell, sourced `.env.qa`, and hosted workflow env states remained explicitly separated again in this pass.
- `TB-0112` stays closed on `5af32ed`: deploy-triggered `E2E Smoke` `27885474019` still passed all deep shards on current head.
- `TB-0024` stays closed as a required-proof item: this pass used `https://trustedbums.com` for primary QA truth, and no current recommendation depends on reopening the runner-side external DNS host.

## Business Access Coverage

### Client profile and deal-registration setup
- Current proof: exact-head source still limits ordinary company profile edits versus beta setup writes appropriately, live `deal_registration_config` remains present, and hosted `E2E Smoke` stayed green on `5af32ed`.
- Missing allow or deny proof: one live `CLIENT_IT` allow-path walkthrough on current head, plus one cleanup-safe beta-setup mutation proof tied to a dedicated QA role instead of source-only or historical local evidence.
- Seed data needed: `QA_CLIENT_IT`.

### Company identity review and access requests
- Current proof: current source and live function surfaces still keep legal company-name or approved-domain changes on an admin-reviewed path.
- Missing allow or deny proof: one live same-company request that routes into admin review on current head, plus one deny proof for a foreign-company user.
- Seed data needed: one cleanup-safe company identity change request and one foreign-company deny account.

### Managing Bum invite and team access
- Current proof: current source, current hosted smoke, and current edge-function wiring still support the managing-Bum invite path.
- Missing allow or deny proof: one live managing-Bum invitation or membership change on current head, plus one deny proof that the same flow does not leak broader admin access or cross-company visibility.
- Seed data needed: one managing Bum, one invite target, and one unrelated deny user.

### Bum represented contacts
- Current proof: focused regression tests still keep represented-contact reads scoped to intended workflows, and no current session evidence showed a direct access regression.
- Missing allow or deny proof: one live allow proof for the owning Bum and Admin, plus one deny proof for an unrelated Bum and an unrelated client-company user.
- Seed data needed: one represented contact owned by a Bum, one admin reviewer, one foreign Bum deny case, and one unrelated client-company deny account.

## Cross-Agent Follow-Ups

### QA Harness Reliability Agent - [TB-0013] standalone role-workflow preflight flaked before product proof
- Evidence: `Deep QA Hotfix Audit` run `27894244168` failed `Role Workflow QA` in `qa-target-preflight` before any protected route loaded. Uploaded artifact `qa-target-preflight-artifacts/workflow/summary.json` shows `DNS`, `Clerk`, and `Extension API` passed, while `HTTPS` failed with `fetch failed` and `App shell` failed second-order. The same session still returned `HTTP/2 200` plus `<div id="root">` from `https://trustedbums.com`, and standalone `Deep QA (admin)` plus `Deep QA (bum)` on the same run succeeded.
- Root-cause analysis:
  - User job: prove hosted role-based mutation QA for the unclaimed client opportunity lifecycle and the Bum LinkedIn CSV import flow.
  - Triggering change: the new standalone `workflow-qa` job and LinkedIn import mutation coverage added across `5c35c47`, `4c64152`, `384628d`, `81a5866`, and `5af32ed`.
  - How it got through review or testing: local mutation proof and deploy-triggered deep smoke do not exercise the standalone `workflow-qa` preflight path on every head, so the GitHub-only preflight failure mode stayed unproven until this run.
  - Source lane: QA Harness Reliability workflow or preflight implementation, not product route owners, because the failure occurred before any protected route loaded and sibling deep jobs still reached product flows.
- Missing guardrail: a deterministic retry, rerun, or flake-classification path for standalone `qa-target-preflight` fetch failures before the mutation job is treated like a product regression.
- Requested action: reopen the harness queue, stabilize the standalone role-workflow preflight, then rerun the hosted mutation lane on current head.

### QA Harness Reliability Agent - [TB-0114] standalone client mutation shard skipped auth bootstrap
- Evidence: standalone `Deep QA (client)` on `27894244168` passed target preflight and QA env verification, then failed on `createClientOpportunity` because the test opened a fresh client context and navigated directly to `/client/opportunities/new` without authenticating it. The retained Playwright error context shows the public `Account access` page instead of the client Opportunities workspace.
- Root-cause analysis:
  - User job: prove the hosted mutation path for the client opportunity lifecycle on the standalone authoritative GitHub lane.
  - Triggering change: `5c35c47` exposed the standalone mutation lane in GitHub Actions again, which surfaced an older auth-bootstrap omission in `tests/e2e/deep-workflow-hotfix-audit.spec.ts`.
  - Source lane: the mutating deep-QA test implementation introduced at `bfcf38d8` on 2026-05-31, not the current product route, because the test creates a fresh browser context and never signs it in before the first client mutation step.
  - How it got through review or testing: local `qa:workflow` proof and deploy-triggered `E2E Smoke` do not execute this exact standalone client mutation path, so the auth omission stayed latent until the standalone workflow was rerun on current head.
  - Missing guardrail: a shared authenticated helper or explicit auth assertion before any deep-QA mutation test attempts a protected client route.
- Requested action: fix the standalone client mutation auth bootstrap, then rerun the hosted client shard separately from the preflight flake follow-up.

### Code Review Agent - [TB-0019] exact-head review drift reopened on `5af32ed`
- Evidence: exact-head hosted proof is green on `5af32ed`, but the review marker still names `1b3664a`.
- Requested action: refresh exact-head Code Review before any release-close or tracker-close claim uses current-head QA proof.

### Release Verification / Security / Lead Developer - current head has live object parity but not clean migration-ledger parity
- Evidence: live object checks show the `opportunity_registrations` delete policy and the `admin_dashboard_summary` function split are present, but `supabase_migrations.schema_migrations` still lacks `20260620151519` and `20260620152414`.
- Requested action: keep this as provenance or control-plane debt, not as a newly reproduced product defect. Do not close release provenance from repo diffs alone, but do not reopen the product workflow from this evidence alone either.

### Product Ops Workflow Analyst / Agent Operations Steward - remaining role-matrix seeds still block live allow or deny proof
- Evidence: QA still lacks `QA_CLIENT_IT`, managing-Bum seed users, represented-contact fixtures, and foreign-company deny accounts for the remaining business-access matrix.
- Requested action: add those durable QA roles or fixtures and mirror them into access-needs tracking so future QA runs can close the remaining source-only access scenarios with live evidence.

## Coverage Map

- Exact-head GitHub evidence on `5af32ed`:
  - `QA` run `27885457568`: passed.
  - `Deploy TrustedBums to DreamHost` run `27885457565`: passed.
  - `E2E Smoke` run `27885474019`: passed.
  - `Deep QA (admin|client|bum)` inside `27885474019`: all passed.
  - standalone `Deep QA Hotfix Audit` run `27894244168`: `Role Workflow QA` failed in preflight before product proof; `Deep QA (client)` failed after preflight because the test visited `/client/opportunities/new` without authenticating its fresh browser context; `Deep QA (admin)` and `Deep QA (bum)` succeeded.
- Current local proof in this pass:
  - raw `corepack pnpm run qa:env` failed with missing exported QA variables
  - sourced `.env.qa` `corepack pnpm run qa:env` passed
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight` passed
  - targeted Vitest regression pack passed `37/37`
  - `curl -I -L https://trustedbums.com` returned `HTTP/2 200`
  - live HTML fetch from `https://trustedbums.com` contained `<div id="root">`
- Current live Supabase proof:
  - project `vaoqvtxqvbptyxddpoju` is `ACTIVE_HEALTHY`
  - `companies.deal_registration_config` remains live
  - the current client delete policy exists on `public.opportunity_registrations`
  - `public.admin_dashboard_summary()` still delegates to `private.admin_dashboard_summary_data()`
  - live migration ledger contains `20260620134628`
  - live migration ledger still does not contain `20260620151519` or `20260620152414`
- Exact-head visual evidence note:
  - the latest `Visual UI Audit` run is still `27869672437` on `a0142260`.
  - Inference from the current diff: `a0142260..5af32ed` changed QA contracts, tests, the client delete mutation behavior, and the admin summary function split, but it did not change routed layout or styling surfaces that would by themselves justify treating the missing same-head visual run as a reproduced UI defect.

## Watchlist

- The standalone role-workflow failure currently looks like a harness flake, not a product regression. Keep product QA recommendations tied to route or mutation evidence, and keep the preflight fetch failure with QA Harness Reliability unless a rerun reproduces the failure after preflight passes.
- The live migration ledger gap on `20260620151519` and `20260620152414` remains provenance debt. Treat it as control-plane drift evidence, not as direct proof that the current product workflow is broken.
- A same-head `Visual UI Audit` was not rerun on `5af32ed`. Keep that as release-evidence debt unless a later exact-head UI change or screenshot artifact demonstrates a real rendered regression.

## Current Standards And Time-Sensitive Notes

- Playwright’s current best-practices guide still recommends tests that are isolated, resilient, and anchored in user-visible behavior rather than implementation detail. That supports keeping Trusted Bums workflow QA focused on end-to-end role jobs and cleanup-safe synthetic data. Source: [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- Playwright’s authentication guidance still recommends reusable authenticated state per role instead of rebuilding auth in every assertion path. That supports preserving dedicated QA role accounts for the workflow matrix rather than weakening coverage back to anonymous or source-only checks. Source: [Playwright Authentication](https://playwright.dev/docs/auth)
- Supabase’s current RLS and database-testing guidance still treats RLS and database functions as first-class test surfaces, not inferred guarantees. That supports the current live policy and function checks plus the remaining access-matrix seed requests. Sources: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase Testing Overview](https://supabase.com/docs/guides/local-development/testing/overview)

## Access Requests And Evidence Gaps

- `QA_CLIENT_IT` is still missing, so browser-level Client IT proof remains blocked.
- The remaining live business-access matrix still lacks seeded managing-Bum, represented-contact, foreign-company deny, and cleanup-safe identity-review fixtures.
- The standalone hosted role-workflow lane on `5af32ed` did not reach mutation steps because preflight failed first, so the authoritative GitHub mutation proof is still incomplete on current head.
- Local mutation cleanup authority was not re-exercised in this pass. The 2026-06-20 local `qa:workflow` pass recorded in [docs/codex-edit-log.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md) is historical proof, not current-session proof.

## Agent Inputs

- Date of run: 2026-06-21 (`America/New_York`).
- Files, tests, workflows, tracker rows, live SQL, and internet sources reviewed:
  - `docs/agents/automation-prompts/trusted-bums-daily-qa-test-engineer.toml`
  - `docs/agents/consultant-team-rules.md`
  - `docs/agents/company-wide-rules.md`
  - `docs/agents/consultant-access-needs.md`
  - `docs/agents/business-access-rules.md`
  - `docs/business-workflow-qa-contract.md`
  - `docs/qa-test-backlog.md`
  - `docs/qa-harness-reliability-backlog.md`
  - `docs/release-verification-backlog.md`
  - `docs/product-ops-workflow-backlog.md`
  - `docs/lead-developer-recommendations.md`
  - `docs/consultant-access-needs.md`
  - `docs/codex-edit-log.md`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - [`scripts/qa-target-preflight.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/qa-target-preflight.mjs)
  - [`tests/e2e/workflow-qa-matrix.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/workflow-qa-matrix.spec.ts)
  - [`tests/e2e/helpers/deepQa.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/deepQa.ts)
  - [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts)
  - [`supabase/migrations/20260620151519_restore_client_delete_unclaimed_opportunity_policy.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260620151519_restore_client_delete_unclaimed_opportunity_policy.sql)
  - [`supabase/migrations/20260620152414_restore_admin_dashboard_summary_definer.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260620152414_restore_admin_dashboard_summary_definer.sql)
  - `git rev-parse HEAD`
  - `git status --short --branch`
  - `git log --oneline --decorate -n 12`
  - `git diff --name-only a0142260f502446a2e0aacedea219f22df233c8e..HEAD -- src supabase tests .github docs`
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 40 --json databaseId,workflowName,headSha,status,conclusion,displayTitle,createdAt,updatedAt,event`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27885457568 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27885474019 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Visual UI Audit" --limit 5 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums workflow run .github/workflows/deep-qa-hotfix-audit.yml --repo Pidpoddev/trustedbums --ref main -f target_url='https://trustedbums.com' -f mutation_mode=true`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27894244168 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run download 27894244168 --repo Pidpoddev/trustedbums --name role-workflow-qa --dir /tmp/tb-role-workflow-YV66og`
  - raw `corepack pnpm run qa:env`
  - sourced `.env.qa` `corepack pnpm run qa:env`
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`
  - `corepack pnpm exec vitest run src/test/businessWorkflowQaContract.test.ts src/test/e2eSmokeRegression.test.ts src/test/clientOpportunityDelete.test.ts src/test/deepQaTriage.test.ts src/test/accessBoundaryRegression.test.ts src/test/invitationRedirect.test.ts src/test/scrumQueueRegression.test.ts`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -L --max-time 20 https://trustedbums.com`
  - live Supabase project list and SQL for tracker rows, `admin_scrum_items` schema, migration-ledger rows, `pg_policies`, `pg_proc`, and routine grants on project `vaoqvtxqvbptyxddpoju`
  - current official guidance reviewed:
    - [Playwright Best Practices](https://playwright.dev/docs/best-practices)
    - [Playwright Authentication](https://playwright.dev/docs/auth)
    - [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
    - [Supabase Testing Overview](https://supabase.com/docs/guides/local-development/testing/overview)
- Tracker refresh completed in this run:
  - reopened `TB-0019` for exact-head Code Review drift on `5af32ed`
  - reopened `TB-0013` for the standalone hosted preflight fetch flake blocking `Role Workflow QA`
  - created or refreshed `TB-0114` for the standalone client mutation auth-bootstrap bug
- Checks that could not fully close and why:
  - the standalone hosted `Role Workflow QA` lane on `27894244168` failed in preflight before any protected route loaded
  - the standalone hosted `Deep QA (client)` lane on `27894244168` failed because the test never authenticated its fresh client browser context before visiting `/client/opportunities/new`
  - no same-head Code Review marker exists yet for `5af32ed`
  - no `QA_CLIENT_IT` account or remaining role-matrix seed fixtures were available for the blocked business-access scenarios
  - no same-head `Visual UI Audit` run exists yet on `5af32ed`
