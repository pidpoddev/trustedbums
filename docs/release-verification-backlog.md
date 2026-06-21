# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-21 by Codex daily release verification automation._

## Release Decision

Decision: `HOTFIX-FORWARD`.

Current deployed `main` head `5af32edeb0cc1290cdbae808207e75276d22a4d6` is live on `https://trustedbums.com`, but release evidence is not clean enough for `GO`. GitHub `QA` `27885457568`, DreamHost deploy `27885457565`, and deploy-triggered `E2E Smoke` `27885474019` all passed on `5af32ed`, and the primary host returned `HTTP/2 200` plus the Trusted Bums app shell from this runner. Release stays `HOTFIX-FORWARD` because the exact-head Code Review marker is still pinned to `1b3664a87c2176b86ac45b43e017277aaf0d6342`, no same-head `Visual UI Audit` exists for `5af32ed`, standalone `Deep QA Hotfix Audit` `27894244168` failed on the same head, and one of those failures is a real current-head client mutation bug rather than only a local repro.

## Evidence Summary

- `main`, `origin/main`, and the latest GitHub push workflows all resolve to `5af32edeb0cc1290cdbae808207e75276d22a4d6`.
- GitHub `QA` run `27885457568` on `5af32ed`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27885457565` on `5af32ed`: passed, including the release-provenance step.
- GitHub `E2E Smoke` run `27885474019` on `5af32ed`: passed, including `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- GitHub `Deep QA Hotfix Audit` run `27894244168` on `5af32ed`: failed.
  - `Role Workflow QA` failed in retained artifact `qa-target-preflight-artifacts/workflow/summary.json` with `HTTPS: fetch failed` and `App shell: app shell root element was not found in the base HTML`.
  - `Deep QA (client)` passed its own preflight, then failed on `/client/opportunities/new`.
- Current exact-head artifact proof for `TB-0114`: the failing GitHub run still used `await page.goto("/client/opportunities/new")` in [`tests/e2e/deep-workflow-hotfix-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), and retained `error-context.md` shows the public `Account access` page instead of the client Opportunities workspace. The local worktree contains an unreleased auth-bootstrap fix for this exact path, so local source is not current release evidence.
- No exact-head `Visual UI Audit` exists on `5af32ed`. The newest successful visual run is `27869672437` on `a0142260f502446a2e0aacedea219f22df233c8e`, so same-head visual release proof is still missing.
- [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still approves `1b3664a87c2176b86ac45b43e017277aaf0d6342`, not `5af32edeb0cc1290cdbae808207e75276d22a4d6`.
- Raw-shell `corepack pnpm run qa:env`: failed because the shell did not have the required QA variables exported.
- Sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`: passed.
- Sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`: passed.
- `curl -I -L --max-time 20 https://trustedbums.com`: returned `HTTP/2 200`, and the base HTML still contains `<div id="root">`.
- Live Supabase project `vaoqvtxqvbptyxddpoju` is `ACTIVE_HEALTHY`.
  - `public.companies.deal_registration_config` exists live as `jsonb not null`.
  - Live policy `Client users can delete unclaimed company opportunity registrations` exists on `public.opportunity_registrations`.
  - `public.admin_dashboard_summary()` is live as `SECURITY INVOKER`.
  - The migration ledger contains `20260620134628` but not `20260620151519` or `20260620152414`; inference from the current live object checks is that this is control-plane or provenance debt, not the current release blocker.
- Supabase advisors still report `auth_leaked_password_protection` as a warning and broader performance debt. Those remain watch items, not new exact-head blockers for this release verdict.
- `TB-0097` stays closed on current head: the live `deal_registration_config` object still exists, and current release evidence did not reopen the client-profile schema parity issue.

## Failed Or Missing Checks

### P1 - [TB-0019] Exact-head Code Review is stale on `1b3664a`
- Evidence: current hosted release evidence is on `5af32ed`, but [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still names `1b3664a87c2176b86ac45b43e017277aaf0d6342`.
- Impact: release-close, merge-close, and tracker-closeout claims are not trustworthy on the deployed head while the pre-main review gate still points at an older commit.
- Recommendation: keep release at `HOTFIX-FORWARD` and rerun the Code Review Agent on `5af32ed` or the next pushed hotfix head.
- Acceptance criteria: the review marker names the same head as the hosted run set that Release Verification cites.

### P1 - [TB-0114] Exact-head client mutation lane still loses auth before `/client/opportunities/new`
- Evidence: standalone `Deep QA (client)` on `27894244168` passed target preflight, then failed because the pushed exact-head test still opens `/client/opportunities/new` with a fresh browser context and `page.goto(...)` instead of reusing authenticated navigation. Retained `error-context.md` shows the public `Account access` page with `Sign in` and `Create account` buttons.
- Impact: the authoritative standalone GitHub mutation lane cannot prove the client opportunity create or cleanup workflow on the currently deployed head.
- Recommendation: hotfix-forward by pushing the auth-bootstrap change already present locally, then rerun standalone `Deep QA Hotfix Audit` on the new head before calling release evidence clean.
- Acceptance criteria: a same-head or newer standalone `Deep QA Hotfix Audit` client shard reaches the authenticated client Opportunities workspace and completes the mutation workflow or fails later with route-level evidence.

### P1 - [TB-0013] Standalone role-workflow QA failed before product mutation proof
- Evidence: retained `qa-target-preflight-artifacts/workflow/summary.json` for `27894244168` shows `DNS`, `Clerk`, and `Extension API` passed, while `HTTPS` failed with `fetch failed` and `App shell` failed second-order because the base HTML was never fetched. In the same run, standalone admin and Bum preflights passed, and this runner later received `HTTP/2 200` plus the app shell from `https://trustedbums.com`.
- Impact: the standalone workflow mutation lane is still incomplete on current head, so release cannot claim current-head hosted mutation proof for the role workflow contract.
- Recommendation: treat this first as QA Harness Reliability debt, stabilize or retry the standalone workflow preflight path, then rerun the standalone mutation lane on the same head or a newer hotfix head.
- Acceptance criteria: a same-head or newer standalone `Role Workflow QA` job completes preflight and runs the intended workflow proof instead of failing before protected routes load.

### P2 - Exact-head `Visual UI Audit` has not been rerun on `5af32ed`
- Evidence: the latest successful `Visual UI Audit` run is `27869672437` on `a0142260f502446a2e0aacedea219f22df233c8e`; no same-head visual run exists for `5af32ed`.
- Impact: release evidence is incomplete for the current deployed head even though the exact-head diff appears QA or workflow heavy rather than layout heavy.
- Recommendation: rerun `Visual UI Audit` on the same pushed head or the next hotfix head before returning to `GO`.
- Acceptance criteria: a successful exact-head `Visual UI Audit` run exists for the same commit Release Verification is evaluating.

## Cross-Agent Follow-Ups

### Code Review Agent - [TB-0019] refresh the review marker to the deployed head
- Current truth: hosted release evidence is anchored on `5af32ed`, but the review marker still points at `1b3664a`.
- Durable correction: when `main` advances after a GO review, rerun Code Review or explicitly preserve a same-head review marker before any later agent claims release closure.

### QA Harness Reliability Agent - [TB-0013] separate standalone preflight flakes from product regressions
- Current truth: the workflow-only preflight failed while sibling standalone preflights and runner-side primary-host smoke passed.
- Durable correction: add a deterministic retry or rerun path for standalone `qa:target-preflight` fetch failures before preserving them as product-level release blockers.

### QA Harness Reliability Agent and Lead Developer - [TB-0114] do not treat local hotfixes as deployed evidence
- Current truth: the failing GitHub run still used the unauthenticated `page.goto("/client/opportunities/new")` path on the deployed head, while the local worktree already contains an auth-bootstrap fix.
- Durable correction: when a hosted lane fails and the local tree already contains a candidate fix, keep the release ledger anchored to the pushed head until the fix is committed, pushed, and rerun with same-head hosted proof.

### Lead Developer - rebase the lead release handoff off `5af32ed`, not `a014226`
- Current truth: the release ledger now shows `HOTFIX-FORWARD` on `5af32ed`, while older lead handoff text still references `GO WITH WATCHLIST` on `a014226`.
- Durable correction: start each lead refresh from `git rev-parse HEAD`, current hosted run IDs, and current tracker rows before preserving a release summary.

## Agent Inputs

- Date of run: 2026-06-21 (`America/New_York`).
- Docs, rules, and handoffs reviewed:
  - `docs/agents/automation-prompts/trusted-bums-daily-release-verification-agent.toml`
  - `docs/agents/consultant-team-rules.md`
  - `docs/agents/company-wide-rules.md`
  - `docs/agents/consultant-access-needs.md`
  - `docs/agents/business-access-rules.md`
  - [`docs/release-verification-backlog.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md)
  - [`docs/qa-test-backlog.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md)
  - [`docs/security-review-backlog.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/security-review-backlog.md)
  - [`docs/trust-reputation-backlog.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trust-reputation-backlog.md)
  - [`docs/lead-developer-recommendations.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/lead-developer-recommendations.md)
  - [`docs/codex-edit-log.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md)
- GitHub evidence reviewed:
  - `gh run list --limit 20 --json databaseId,name,headSha,headBranch,status,conclusion,event,createdAt,updatedAt,url`
  - `gh run list --workflow "Visual UI Audit" --limit 10 --json databaseId,name,headSha,headBranch,status,conclusion,event,createdAt,updatedAt,url`
  - `gh run view 27885457568 --json ...`
  - `gh run view 27885457565 --json ...`
  - `gh run view 27885474019 --json ...`
  - `gh run view 27894244168 --json ...`
  - `gh run view 27894244168 --log-failed`
  - `gh run download 27894244168 -D /tmp/tb-deepqa-27894244168`
- Local checks reviewed:
  - `git branch --show-current`
  - `git rev-parse HEAD`
  - `git rev-parse origin/main`
  - `git log --oneline --decorate -8`
  - `git diff --name-only 1b3664a87c2176b86ac45b43e017277aaf0d6342..HEAD`
  - raw `corepack pnpm run qa:env`
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -sS --max-time 20 https://trustedbums.com`
  - targeted source review of [`tests/e2e/deep-workflow-hotfix-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), [`src/test/deepQaTriage.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/deepQaTriage.test.ts), [`supabase/migrations/20260620151519_restore_client_delete_unclaimed_opportunity_policy.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260620151519_restore_client_delete_unclaimed_opportunity_policy.sql), [`supabase/migrations/20260620152414_restore_admin_dashboard_summary_definer.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260620152414_restore_admin_dashboard_summary_definer.sql), and [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts)
- Live Supabase checks reviewed for project `vaoqvtxqvbptyxddpoju`:
  - project list and health
  - edge-function inventory
  - live `send-admin-email` source read
  - security advisors
  - performance advisors
  - live SQL for `information_schema.columns`, `supabase_migrations.schema_migrations`, `pg_policies`, `pg_proc`, and tracker rows
- Checks intentionally skipped or still incomplete:
  - no exact-head `Visual UI Audit` exists yet for `5af32ed`, so release still lacks same-head screenshot proof
  - no direct live Auth-settings view was available to close `TB-0023`; the advisor warning remains the current evidence surface
  - the retired `rcdl.tplinkdns.com` host was not rechecked in this pass because current shared rules treat `https://trustedbums.com` as the default public release target and no current verdict depended on external-DNS fallback proof
  - no tracker writes were made because current live tracker rows already matched the exact-head status of `TB-0013`, `TB-0019`, `TB-0023`, `TB-0097`, and `TB-0114`
