# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-17 by Codex daily release verification automation._

## Release Decision

Decision: `HOLD-DEPLOY` for current `main` head `af944fe27b0ed851ce2b85dae99304a5b0c3a0bd`.

Current exact-head release evidence is not clean enough to trust:

- GitHub `QA` run `27653495600` passed on `af944fe`.
- GitHub `Deploy TrustedBums to DreamHost` run `27653495695` published the site, then failed on the post-publish Bing Webmaster URL batch step.
- GitHub `E2E Smoke` run `27653527364` skipped because deploy concluded `failure`.
- No exact-head `Visual UI Audit` run exists for `af944fe`.
- The latest standalone `Deep QA Hotfix Audit` success is still stale on `850e507`, not the current head.
- [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) is still stale on `f0996c5c9f4304d36ab57908c4da34d05efc4ab6`.
- Live Supabase verification no longer reproduces `TB-0081`, `TB-0085`, or `TB-0087`, but it now flags a new authenticated claim-notification preview view as `SECURITY DEFINER` without exact-head authorization proof (`TB-0108`).

## Evidence Summary

- Current release-candidate head reviewed in this pass: `af944fe` (`Allow bums to delete unattached contacts`).
- GitHub exact-head evidence reviewed in this pass:
  - `QA` run `27653495600` on `af944fe`: passed.
  - `Deploy TrustedBums to DreamHost` run `27653495695` on `af944fe`: failed after the publish step.
  - `E2E Smoke` run `27653527364` on `af944fe`: skipped.
  - no current-head `Visual UI Audit` run exists in GitHub Actions for `af944fe`.
  - latest standalone `Deep QA Hotfix Audit` success remains `27092527987` on `850e507`, not current head.
- Deploy failure details from `27653495695`:
  - build, DreamHost publish, live Bing health, and IndexNow submission all completed successfully.
  - the failing step was `Submit sitemap and URLs to Bing Webmaster API`.
  - the failed log ended with `Bing Webmaster API SubmitUrlBatch failed with HTTP 400: {"ErrorCode":2,"Message":"ERROR!!! You have exceeded your daily url submission quota : 100"}`.
- Exact-head Code Review evidence:
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still records `GO` for `f0996c5c9f4304d36ab57908c4da34d05efc4ab6`, reviewed at `2026-06-16T17:00:18Z`.
  - `TB-0019` remains open because that marker does not match `af944fe`.
- Current local QA preflight reviewed in this pass:
  - [`.env.qa`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.env.qa) is present.
  - raw `corepack pnpm run qa:env` still fails in a fresh shell because required QA variables are not exported by default.
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env` passed.
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight` passed against `https://trustedbums.com`.
  - local preflight is treated only as shell-contract and target-reachability evidence, not release proof.
- Current trust smoke reviewed in this pass:
  - `https://trustedbums.com` returned `HTTP/2 200` with the expected HSTS, CSP, frame, content-type, referrer, and permissions headers.
  - `https://rcdl.tplinkdns.com` still failed TLS validation from this runner with `curl: (60) SSL certificate problem: unable to get local issuer certificate`.
  - `http://rcdl.tplinkdns.com` still returned `HTTP/1.1 403 Forbidden`.
- Current live Supabase evidence for project `vaoqvtxqvbptyxddpoju`:
  - project status is still `ACTIVE_HEALTHY`.
  - project URL still resolves to `https://vaoqvtxqvbptyxddpoju.supabase.co`.
  - live security advisors now report only two current findings: leaked-password protection disabled (`TB-0023`) and `public.claim_client_notification_previews` defined as a `SECURITY DEFINER` view.
  - direct SQL now confirms `TB-0081`, `TB-0087`, and the related `normalize_customer_domain()` search-path hardening are live: `anon` and `authenticated` no longer have `EXECUTE`, while `service_role` still does.
  - live function inventory plus deployed source now confirm `sync-claim-decision-replies` is version `4`, still `verify_jwt = false`, but now fails closed when the sync secret is missing and loads that secret from env or the Vault-backed RPC. `TB-0085` is already closed in the tracker.
- Exact-head source defect still present:
  - `af944fe` still creates a duplicate My Contacts row after a detail-page claim for a suggested decision-maker match. That remains `TB-0106`.

## Failed Or Missing Checks

### P1 - [TB-0105] Bing Webmaster quota still fails deploy after publish
- Evidence: deploy `27653495695` completed the DreamHost publish, live crawler health, and IndexNow steps before failing in `Submit sitemap and URLs to Bing Webmaster API` with the live quota message `You have exceeded your daily url submission quota : 100`.
- Impact: exact-head smoke and deep hosted browser evidence skipped even though the primary site publish itself completed.
- Recommendation: make Bing Webmaster URL batch submission fail soft after publish, or broaden the quota parsing so the real production error shape is treated as non-blocking.
- Acceptance criteria: the next deploy can publish, record quota exhaustion when it happens, and still allow successor exact-head smoke to run.

### P1 - [TB-0106] Exact head still duplicates My Contacts rows after a detail-page claim
- Evidence: exact-head source still creates a manual represented-contact row after a detail-page claim for a suggested decision-maker match, even though My Contacts separately synthesizes claim-backed rows from `opportunity_claims`.
- Impact: Bums can see the same person twice in My Contacts, with inconsistent delete behavior between the manual row and the claim-backed row.
- Recommendation: land the narrow follow-up that removes the manual-row side effect and prove the contact list stays deduplicated.
- Acceptance criteria: exact-head or successor source plus QA proof show only one claim-backed My Contacts row after the claim flow completes.

### P1 - [TB-0019] Exact-head Code Review is stale again
- Evidence: the current review marker is still pinned to `f0996c5`, not `af944fe`.
- Impact: current release notes cannot claim a valid exact-head Code Review decision for the code now on `main`.
- Recommendation: refresh exact-head Code Review after the current release-workflow blocker is handled.
- Acceptance criteria: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) points at `af944fe` or its successor reviewed head, and the matching tracker item can close again.

### P1 - [TB-0108] Claim notification preview view lacks release-ready authorization proof
- Evidence: live Supabase security advisors on 2026-06-17 flag `public.claim_client_notification_previews` as a `SECURITY DEFINER` view. Current exact-head source in [supabase/migrations/20260616124500_add_claim_client_notification_previews.sql](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260616124500_add_claim_client_notification_previews.sql) grants authenticated direct reads, and current portal code in [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts) reads that view from the client portal. This run did not have exact-head positive and negative role proof for the view.
- Impact: authenticated users are reading a privileged wrapper over admin email delivery data without exact-head proof that only the intended admin or same-company users can see those previews.
- Recommendation: either remove `SECURITY DEFINER` from the view by moving to a security-invoker or private-schema pattern, or add exact-head allow and deny proof that validates the current design and clears the security review.
- Acceptance criteria: live security advisors no longer flag the view, or Security signs off on the view with exact-head positive same-company/admin proof plus negative foreign-company proof.

## Cross-Agent Follow-Ups

### Lead Developer / Release Verification - [TB-0105] keep post-publish Bing submission from blocking hosted smoke
- Current truth: the site publish completed before the workflow failed, so the active failure is the Bing Webmaster quota branch, not the build or DreamHost sync.
- Requested action: harden the quota path, then rerun deploy plus smoke on the next reviewable head.

### Lead Developer / QA Test Engineer - [TB-0106] remove the duplicate manual-contact side effect from detail-page claims
- Current truth: exact-head source still duplicates My Contacts rows after a detail-page claim, and the local follow-up is not yet committed or deployed.
- Requested action: land the fix, then rerun focused QA on the shipped head.

### Code Review Agent / Release Verification - [TB-0019] exact-head review must match the current `main` head
- Current truth: the live marker is stale on `f0996c5`.
- Requested action: refresh exact-head Code Review once the release path is coherent again.

### Security Engineer / Release Verification - [TB-0108] re-review the new claim notification preview view
- Current truth: older helper and function hardening blockers `TB-0081`, `TB-0085`, and `TB-0087` are already closed live, but the new `claim_client_notification_previews` view is now the remaining exact-head authorization-proof gap from the Supabase side.
- Requested action: either change the view shape or produce exact-head allow and deny proof that clears the security-advisor finding.

## Tracker Closeout Sweep

- Completed this pass through live Supabase SQL.
- Confirmed `TB-0019`, `TB-0105`, and `TB-0106` remain open on `af944fe`.
- Created `TB-0108` for the new `SECURITY DEFINER` claim notification preview view and its missing exact-head authorization proof.
- Confirmed `TB-0081`, `TB-0085`, and `TB-0087` are already `CLOSED` in the live tracker and no longer reproduce in current live Supabase evidence.
- Confirmed `TB-0104` stays closed; it covered the earlier hosted-evidence restoration on `0464f43`, not the new `af944fe` release gap.
- No tracker row met new closure criteria in this pass.

## Agent Inputs

- Date of run: 2026-06-17.
- Docs and local files reviewed:
  - [docs/agents/automation-prompts/trusted-bums-daily-release-verification-agent.toml](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/automation-prompts/trusted-bums-daily-release-verification-agent.toml)
  - [docs/agents/consultant-team-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-team-rules.md)
  - [docs/agents/company-wide-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/company-wide-rules.md)
  - [docs/agents/consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-access-needs.md)
  - [docs/agents/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/business-access-rules.md)
  - [docs/qa-test-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md)
  - [docs/security-review-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/security-review-backlog.md)
  - [docs/trust-reputation-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trust-reputation-backlog.md)
  - [docs/lead-developer-recommendations.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/lead-developer-recommendations.md)
  - [docs/production-go-live.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/production-go-live.md)
  - [docs/codex-edit-log.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md)
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
- GitHub workflows reviewed:
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 120 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow 'Visual UI Audit' --limit 12 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow 'Deep QA Hotfix Audit' --limit 12 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27653495695 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27653495695 --repo Pidpoddev/trustedbums --log-failed`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27653527364 --repo Pidpoddev/trustedbums --json ...`
- Local checks reviewed:
  - `git rev-parse HEAD`
  - `git log --oneline --decorate -8`
  - raw `corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`
  - `curl -I -L --max-time 20 http://rcdl.tplinkdns.com`
  - targeted source review of [supabase/migrations/20260616124500_add_claim_client_notification_previews.sql](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260616124500_add_claim_client_notification_previews.sql), [supabase/functions/sync-claim-decision-replies/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/sync-claim-decision-replies/index.ts), and [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts)
- Live Supabase checks reviewed for project `vaoqvtxqvbptyxddpoju`:
  - project lookup and project URL confirmation
  - security advisors
  - performance advisors
  - edge-function inventory
  - deployed `sync-claim-decision-replies` source
  - direct SQL for helper-function `EXECUTE` grants and search paths
  - direct SQL for current tracker rows `TB-0019`, `TB-0023`, `TB-0081`, `TB-0085`, `TB-0087`, `TB-0104`, `TB-0105`, `TB-0106`
  - tracker duplicate search and insert/update for `TB-0108`
- Current official guidance reviewed:
  - [Supabase changelog](https://supabase.com/changelog.md)
- Checks that could not fully close and why:
  - exact-head smoke and deep hosted browser evidence did not run because deploy `27653495695` failed after publish
  - no exact-head `Visual UI Audit` run exists for `af944fe`
  - standalone `Deep QA Hotfix Audit` remains stale on older head `850e507`
  - exact-head Code Review is stale because the current marker still points at `f0996c5`
  - this run did not have fresh authenticated role proof for `claim_client_notification_previews`, so `TB-0108` stays open as an authorization-proof gap
