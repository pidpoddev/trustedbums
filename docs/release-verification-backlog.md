# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-12 by Codex agent rebaseline._

## Release Decision

Decision: `HOLD-DEPLOY` for the latest `main` head after this follow-up.

Current hosted evidence is green for `QA`, DreamHost deploy, and `E2E Smoke` on pushed docs head `3f203d1`. This follow-up source fix narrows the `TB-0092` visual false positive and preserves query state for tabbed terms-gated routes. The release remains `HOLD-DEPLOY`, not a clean release `GO`, because the standard Visual UI Audit has not yet been rerun after the source fix and the newly merged privileged surfaces, `api-access-keys` and `admin-shared-mailbox`, still need live Supabase/security proof or an explicit waiver. No rollback or hotfix-forward is indicated from the available evidence.

## Evidence Summary

- Current pushed evidence head before this follow-up: `3f203d15896d6f9d36c7977de372085b7e1ba6eb` (`Rebaseline agent release governance`). This follow-up contains the `TB-0092` harness/navigation fixes and must be validated by its own post-push checks.
- Current release-chain commits reviewed in this rebaseline include `e1a2905` shared mailbox inbox, `9e51722` Clerk issuer hardening, `123185e` API access key management, and `dc9bd01` API access key portal UI.
- GitHub `QA` run `27414752682` on `3f203d1`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27414752664` on `3f203d1`: passed.
- GitHub `E2E Smoke` run `27414783377` on `3f203d1`: passed.
- Exact-head deep coverage inside `27414783377`: `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)` all passed.
- Local focused source/security tests: `corepack pnpm exec vitest run src/test/apiAccessKeys.test.ts src/test/adminSharedMailbox.test.ts src/test/clientLegalItRoles.test.ts` passed 10/10.
- Local full QA from the rebaseline window: `corepack pnpm run qa` passed with lint, Vitest 190/190 tests, and production build.
- Exact Code Review marker: refresh the local [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) to the follow-up commit before pushing.
- Exact-head visual status: no standard `Visual UI Audit` run was current after the `TB-0092` source fix at rebaseline time. The latest known Visual UI Audit/Complete Visual UI Audit failures were on older `d360570` evidence and need a successor rerun.
- Live Supabase/security status for new functions: not refreshed in this rebaseline. Source review confirmed Clerk issuer pinning, profile role checks, metadata-only API key storage, approved shared mailbox enforcement, and audit-event writes; Release Verification still needs live deployed function/config/advisor proof for `api-access-keys` and `admin-shared-mailbox`.
- Current local drift note: none intended after the follow-up commit; the source fix should push as one scoped harness/navigation commit after local gate and QA pass.

Older sections below that mention `d360570` are historical carry-forward context unless explicitly updated by this `dc9bd01` rebaseline.

## Failed Or Missing Checks

### P1 - [TB-0019] Current exact-head release gate is still incomplete
- Evidence: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) now points at `dc9bd01`, and exact-head `QA` `27413665159`, deploy `27413665134`, and `E2E Smoke` `27413702607` all passed. The standard exact-head visual lane is not current for `dc9bd01`, and new privileged functions still need live security proof.
- Impact: Release Verification does not replace Code Review. The release gate is still incomplete because visual and live privileged-path evidence lag the merged code.
- Recommendation: Let QA Harness Reliability clear or waive `TB-0092`, rerun standard visual QA on `dc9bd01`, and have Security/Release Verification perform live deployed checks for `api-access-keys` and `admin-shared-mailbox`.
- Acceptance criteria: Code Review marker matches `dc9bd01`, a successor exact-head standard visual run completes cleanly or is explicitly waived, and live checks prove the new privileged functions are deployed with the intended Clerk issuer, role, secret, audit, and RLS posture.

- Evidence: `Visual UI Audit` run `27395701277` captured `/admin/scrum` with normal tracker content, but [`tests/e2e/visual-ui-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts) failed any body text containing `404`. The local source fix narrows detection to real error-page phrases; a successor standard visual run is still needed.
- Impact: Release Verification loses a clean exact-head standard visual signal even though the route health evidence points to a harness defect, not an outage or broken admin page.
- Recommendation: Commit the narrowed regex and rerun standard exact-head visual QA.
- Acceptance criteria: `/admin/scrum` no longer fails just because tracker text contains `404`, while real config/error pages still fail loudly, and the successor standard visual run passes or produces a new product finding.

### P1 - [TB-0054] Exact-head smoke artifacts still drop preflight summaries
- Evidence: the latest confirmed artifact gap came from `E2E Smoke` `27371773276` on older `d360570`, where the downloaded success artifact tree omitted `qa-target-preflight` `summary.json` and `summary.txt`. Current `dc9bd01` E2E Smoke `27413702607` passed, but artifact retention still needs to be rechecked before closing `TB-0054`.
- Impact: Release Verification still loses the exact preflight evidence that would distinguish env drift from route failures on later regressions.
- Recommendation: Keep `TB-0054` open until smoke and deep workflows retain the preflight summaries on both success and failure paths.
- Acceptance criteria: a fresh exact-head smoke success and a later failure both preserve downloadable preflight summaries.

### P2 - [TB-0024] Fallback-host trust evidence degraded from TLS failure to DNS failure
- Evidence: on 2026-06-12 America/New_York, `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` failed with `curl: (6) Could not resolve host: rcdl.tplinkdns.com`. The same host was still a certificate-chain failure in the earlier 2026-06-11 release and trust notes, so the fallback path is less trustworthy now than the current checked-in ledger says.
- Impact: External-DNS release and trust smoke cannot even resolve the approved fallback host from this runner, so fallback-host evidence is weaker than the primary production host evidence and any workflow that still names this host as active QA context is operating on stale assumptions.
- Recommendation: Keep `TB-0024` open, update its blocker wording to DNS resolution failure, and either repair or retire `rcdl.tplinkdns.com` before treating it as usable fallback-host evidence again.
- Acceptance criteria: `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` succeeds from a clean runner, or the host is formally removed from active release and trust expectations in the relevant docs and tracker rows.

## Closed Or Satisfied In This Cleanup

- `TB-0017` remains closed: current-head GitHub `QA` run `27413665159` passed on `dc9bd01`.
- `TB-0019` remains open: Code Review is now current for `dc9bd01`, but the standard exact-head visual lane and live privileged-function proof still need completion.
- The primary release chain is healthy on current head `dc9bd01`: GitHub `QA`, DreamHost deploy, and `E2E Smoke` all passed.

## Cross-Agent Follow-Ups

### Code Review Agent and Lead Developer - finish the remaining exact-head release gate
### QA Harness, Security, Release Verification, and Lead Developer - finish the remaining exact-head release gate
- Current truth: release evidence on `dc9bd01` is green for `QA`, deploy, and `E2E Smoke`, and [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) is current. Standard exact-head visual QA and live privileged-function checks still need completion.
- Requested action: let QA Harness Reliability rerun or waive standard visual QA after the `TB-0092` fix, have Security/Release Verification prove `api-access-keys` and `admin-shared-mailbox` live posture, and then refresh `TB-0019` through the tracker.

### QA Harness Reliability and Release Verification - keep artifact durability separate from route health
- Current truth: exact-head `E2E Smoke` is green on `dc9bd01`, but `TB-0054` is still active until artifact download proof confirms preflight summaries are preserved.
- Requested action: keep route health and artifact-durability findings separate in future release calls.

### Trust / Release - fallback DNS host is now a resolution failure
- Current truth: on 2026-06-12 `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` failed with `curl: (6) Could not resolve host: rcdl.tplinkdns.com`, which is worse than the previous TLS-only failure recorded on 2026-06-11.
- Requested action: treat `rcdl.tplinkdns.com` as DNS and trust debt until Trust or infrastructure repairs the host or formally retires it from active QA and release expectations.

## Agent Inputs

- Date of run: 2026-06-12.
- Current evidence reviewed:
  - `git rev-parse HEAD`
  - `git log --since='2026-06-10' --oneline --decorate -- docs src supabase .github`
  - `git show --stat --summary --name-only dc9bd01 --`
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
