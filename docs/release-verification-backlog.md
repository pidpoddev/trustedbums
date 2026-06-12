# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-12 by Codex daily release verification automation._

## Release Decision

Decision: `HOLD-DEPLOY` for current `main` head `d360570`.

Current exact-head hosted evidence is green for `QA`, DreamHost deploy, and `E2E Smoke` on `d360570`, and the primary production host is healthy. The release is still not a clean `GO`, because [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still records `GO` for `26fbdc7`, not the current head, and the exact-head standard `Visual UI Audit` run `27395701277` is currently red only because QA Harness Reliability reproduced a false-positive `404` body-text match on `/admin/scrum` and opened `TB-0092`. No rollback or hotfix-forward is indicated; the deployed site looks healthy, but the release gate is still incomplete until Code Review is refreshed and the harness reruns standard visual QA cleanly.

## Evidence Summary

- Current `main` head: `d360570` (`Polish client opportunity workflows`).
- Current release-chain commits since the last QA snapshot: `43db9c7`, `26fbdc7`, `d79f604`, `ea5a710`, and `d360570`.
- GitHub `QA` run `27371736190` on `d360570`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27371736211` on `d360570`: passed.
- GitHub `E2E Smoke` run `27371773276` on `d360570`: passed.
- Exact-head deep coverage inside `27371773276`: `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)` all passed.
- Standalone `Deep QA Hotfix Audit`: no current-head run exists for `d360570`; the latest standalone workflow evidence is run `27092527987` on `850e507` from 2026-06-07, and the fresher exact-head deep evidence comes from the `E2E Smoke` deep shards above.
- Exact-head visual status: GitHub `Visual UI Audit` run `27395701277` failed on `d360570` in step `Run authenticated visual audit`, but QA Harness Reliability reproduced that the route rendered and the failure came from [`tests/e2e/visual-ui-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts) line `320`, where `expectNoObviousErrorPage()` rejects any body text containing `404`. `/admin/scrum` now includes legitimate tracker descriptions with `404`, so this run is tracked as harness false positive `TB-0092`, not a confirmed product regression.
- Raw shell QA env state: `corepack pnpm run qa:env` failed before sourcing because `QA_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `QA_ADMIN_EMAIL`, `QA_CLIENT_ADMIN_EMAIL`, `QA_CLIENT_FINANCE_EMAIL`, `QA_CLIENT_MEMBER_EMAIL`, and `QA_BUM_EMAIL` were not exported in the shell.
- Sourced local QA env state: after sourcing `.env.qa`, `corepack pnpm run qa:env` passed and `corepack pnpm run qa:target-preflight` passed against `https://trustedbums.com` with DNS, HTTPS, app shell, and Clerk checks green. Extension API stayed intentionally skipped through `QA_EXTENSION_API_EXPECTATION=skip`.
- Public trust smoke in this session: `curl -I -L --max-time 20 https://trustedbums.com` returned `HTTP/2 200` with the expected HSTS, CSP, frame, content-type, referrer, and permissions headers.
- External DNS fallback smoke in this session: `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` now fails earlier with `curl: (6) Could not resolve host: rcdl.tplinkdns.com`. Treat that as fallback-host DNS trust debt, not a primary release-host outage.
- Exact Code Review marker: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) records `GO` for `26fbdc7dc3493e87ffd309ccbfbe2416f44dfc5a`, reviewed at `2026-06-11T17:21:43Z`, not for `d36057032de1d354fe925d48ecfaf0e238e6efd3`.
- Live Supabase state in this session: project `vaoqvtxqvbptyxddpoju` is still `ACTIVE_HEALTHY`, project URL still resolves to `https://vaoqvtxqvbptyxddpoju.supabase.co`, and edge-function inventory remains callable. Security advisors still flag `record_admin_scrum_item_audit_event()` and `set_admin_scrum_item_audit_fields()` as publicly executable `SECURITY DEFINER` helpers, plus the standing leaked-password and mutable-search-path warnings. Live edge logs also show `sync-claim-decision-replies` version `3` still receiving `POST 200` traffic while the deployed function remains `verify_jwt = false`; auth logs were empty in this session.
- Current local drift note: the working tree still contains unpublished app, docs, function, and migration changes, including local diffs under [`supabase/functions/client-team/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/client-team/index.ts), [`supabase/functions/profile-bootstrap/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/profile-bootstrap/index.ts), and untracked migrations. This release verdict applies to deployed head `d360570`, not the current dirty worktree.

## Failed Or Missing Checks

### P1 - [TB-0019] Current exact-head release gate is still incomplete
- Evidence: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still points at `26fbdc7`, while current `main` is `d360570`. In the same run, exact-head `QA` `27371736190`, deploy `27371736211`, and `E2E Smoke` `27371773276` all passed. QA Harness Reliability reproduced that exact-head `Visual UI Audit` `27395701277` is not a new admin product failure; it is harness false positive `TB-0092`.
- Impact: Release Verification does not replace Code Review. The release gate is still incomplete because the Code Review marker is stale and the standard exact-head visual lane still needs a clean rerun after the harness fix.
- Recommendation: Refresh Code Review for `d360570`, then let QA Harness Reliability clear `TB-0092` and rerun standard visual QA before moving the release beyond `HOLD-DEPLOY`.
- Acceptance criteria: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) matches `d360570`, and a successor exact-head standard visual run completes cleanly after the harness fix.

### P1 - [TB-0092] Exact-head standard visual QA is red because the error-page regex is too broad
- Evidence: `Visual UI Audit` run `27395701277` captured `/admin/scrum` with normal tracker content, but [`tests/e2e/visual-ui-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts) still fails any body text containing `404`. Current tracker descriptions include legitimate phrases such as `unknown endpoint 404`, so both `chromium` and `mobile-chrome` fail before the standard admin route set can finish.
- Impact: Release Verification loses a clean exact-head standard visual signal even though the route health evidence points to a harness defect, not an outage or broken admin page.
- Recommendation: Narrow the regex to real error-page surfaces and rerun standard exact-head visual QA.
- Acceptance criteria: `/admin/scrum` no longer fails just because tracker text contains `404`, while real config/error pages still fail loudly.

### P1 - [TB-0054] Exact-head smoke artifacts still drop preflight summaries
- Evidence: exact-head `E2E Smoke` `27371773276` passed on `d360570`, but the downloaded success artifact tree still omitted `qa-target-preflight` `summary.json` and `summary.txt`.
- Impact: Release Verification still loses the exact preflight evidence that would distinguish env drift from route failures on later regressions.
- Recommendation: Keep `TB-0054` open until smoke and deep workflows retain the preflight summaries on both success and failure paths.
- Acceptance criteria: a fresh exact-head smoke success and a later failure both preserve downloadable preflight summaries.

### P2 - [TB-0024] Fallback-host trust evidence degraded from TLS failure to DNS failure
- Evidence: on 2026-06-12 America/New_York, `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` failed with `curl: (6) Could not resolve host: rcdl.tplinkdns.com`. The same host was still a certificate-chain failure in the earlier 2026-06-11 release and trust notes, so the fallback path is less trustworthy now than the current checked-in ledger says.
- Impact: External-DNS release and trust smoke cannot even resolve the approved fallback host from this runner, so fallback-host evidence is weaker than the primary production host evidence and any workflow that still names this host as active QA context is operating on stale assumptions.
- Recommendation: Keep `TB-0024` open, update its blocker wording to DNS resolution failure, and either repair or retire `rcdl.tplinkdns.com` before treating it as usable fallback-host evidence again.
- Acceptance criteria: `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` succeeds from a clean runner, or the host is formally removed from active release and trust expectations in the relevant docs and tracker rows.

## Closed Or Satisfied In This Cleanup

- `TB-0017` remains closed: current-head GitHub `QA` run `27371736190` passed on `d360570`.
- `TB-0019` remains open: the release verdict is still blocked by stale exact-head Code Review, and the standard exact-head visual lane still needs a clean rerun after harness item `TB-0092`.
- The primary production host is healthy on current head `d360570`: `https://trustedbums.com` returned `HTTP/2 200` with the expected response headers in this run.

## Cross-Agent Follow-Ups

### Code Review Agent and Lead Developer - finish the remaining exact-head release gate
- Current truth: release evidence on `d360570` is green for `QA`, deploy, and `E2E Smoke`, but [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) is still stale and standard exact-head visual QA still needs a clean rerun after harness false positive `TB-0092`.
- Requested action: refresh Code Review for `d360570`, let QA Harness Reliability rerun standard visual QA after the regex fix, and then refresh `TB-0019` through the tracker with the next exact-head visual result.

### QA Harness Reliability and Release Verification - keep artifact durability separate from route health
- Current truth: exact-head `E2E Smoke` is green on `d360570`, but `TB-0054` is still active because the success artifact does not preserve the preflight summaries.
- Requested action: keep route health and artifact-durability findings separate in future release calls.

### Trust / Release - fallback DNS host is now a resolution failure
- Current truth: on 2026-06-12 `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` failed with `curl: (6) Could not resolve host: rcdl.tplinkdns.com`, which is worse than the previous TLS-only failure recorded on 2026-06-11.
- Requested action: treat `rcdl.tplinkdns.com` as DNS and trust debt until Trust or infrastructure repairs the host or formally retires it from active QA and release expectations.

## Agent Inputs

- Date of run: 2026-06-12.
- Current evidence reviewed:
  - `git rev-parse HEAD`
  - `git log --since='2026-06-10' --oneline --decorate -- docs src supabase .github`
  - `git show --stat --summary --name-only d360570 --`
  - `git show --stat --summary --name-only ea5a710 --`
  - `git show --stat --summary --name-only d79f604 --`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - GitHub workflow lists for `QA`, `Deploy TrustedBums to DreamHost`, `E2E Smoke`, `Visual UI Audit`, `Complete Visual UI Audit`, and `Deep QA Hotfix Audit`
  - GitHub run views `27371736190`, `27371736211`, `27371773276`, `27395701277`, and standalone `Deep QA Hotfix Audit` run `27092527987`
  - raw `corepack pnpm run qa:env`
  - sourced `corepack pnpm run qa:env`
  - sourced `corepack pnpm run qa:target-preflight`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`
  - Supabase `get_project`, `get_project_url`, `list_edge_functions`, `get_advisors(security)`, `get_logs(edge-function)`, `get_logs(auth)`, and `get_edge_function(sync-claim-decision-replies)`
  - live tracker reads for `TB-0017`, `TB-0019`, `TB-0024`, `TB-0054`, `TB-0081`, `TB-0085`, and `TB-0092` through `mcp__codex_apps__supabase._execute_sql`
  - live privilege SQL for `record_admin_scrum_item_audit_event()` and `set_admin_scrum_item_audit_fields()`
- Checks that could not fully run and why:
  - no fresh standalone `Deep QA Hotfix Audit` run was launched because the fresher exact-head deep matrix inside `E2E Smoke` `27371773276` already passed, and there is no newer standalone current-head run than `27092527987`
  - this was not a Code Review Agent run, so [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) was inspected but not refreshed
