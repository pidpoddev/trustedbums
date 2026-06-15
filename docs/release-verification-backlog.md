# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-15 by Codex TB-0054 fix handoff._

## Release Decision

Decision: `HOLD-DEPLOY` for the latest `main` head `7ee97c1`.

As of 2026-06-15, the exact-head hosted release lanes are still green on `7ee97c1`: GitHub `QA` `27469969615`, DreamHost deploy `27469969636`, GitHub `E2E Smoke` `27469985957`, and GitHub `Visual UI Audit` `27488973899` all passed, and no newer hosted runs for this head appeared in GitHub during this pass. `TB-0019` is now closed because [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) records a fresh Code Review `GO` for exact head `7ee97c121918bba73149748b49f2b28133c7ffbb`. The release still is not `GO` because the standalone `Deep QA Hotfix Audit` workflow has no current-head run, the local `TB-0054` artifact-routing fix still needs successor hosted proof, and the live Supabase auth-surface batch is still open after fresh 2026-06-15 advisor, grant, source, and log checks.

## Evidence Summary

- Current release-candidate head reviewed in this pass: `7ee97c1` (`Fix GA4 consent page view dispatch`).
- GitHub exact-head evidence reviewed in this pass:
  - `QA` run `27469969615` on `7ee97c1`: passed.
  - `Deploy TrustedBums to DreamHost` run `27469969636` on `7ee97c1`: passed.
  - `E2E Smoke` run `27469985957` on `7ee97c1`: passed.
  - exact-head deep coverage inside `27469985957`: `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)` all passed.
  - `Visual UI Audit` run `27488973899` on `7ee97c1`: passed.
  - no newer hosted run for `7ee97c1` appeared in `run list` output through 2026-06-15.
- Exact-head Code Review evidence:
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) now records `GO` for `7ee97c121918bba73149748b49f2b28133c7ffbb`, reviewed at `2026-06-15T12:21:36Z`.
  - `TB-0019` was closed in `public.admin_scrum_items` with the same exact-head review evidence.
- Standalone `Deep QA Hotfix Audit` evidence is still stale:
  - latest standalone run `27092527987` passed on `2026-06-07`
  - that run targets older head `850e507`, not current head `7ee97c1`
- QA env state in this pass:
  - [`.env.qa`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.env.qa) is present.
  - the fresh shell still had no exported `QA_*` variables.
  - raw `corepack pnpm run qa:env` still failed until the QA variables were sourced.
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env` passed.
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight` passed against `https://trustedbums.com`.
- Public trust smoke in this pass:
  - `https://trustedbums.com` returned `HTTP/2 200` with expected HSTS, CSP, frame, content-type, referrer, and permissions headers.
  - `https://rcdl.tplinkdns.com` still failed TLS validation with `curl: (60) SSL certificate problem: unable to get local issuer certificate`.
  - `http://rcdl.tplinkdns.com` still returned `HTTP/1.1 403 Forbidden`.
- Current exact-head smoke artifact check:
  - a fresh download of `27469985957` still returned `MATCH_COUNT=0` for `qa-target-preflight` `summary.json` and `summary.txt`.
  - local fix work now routes preflight summaries to `qa-target-preflight-artifacts/` and uploads that directory explicitly from smoke and deep workflows, but no successor hosted artifact has verified it yet.
- Fresh live Supabase evidence in this pass for project `vaoqvtxqvbptyxddpoju`:
  - project status is still `ACTIVE_HEALTHY`.
  - project URL still resolves to `https://vaoqvtxqvbptyxddpoju.supabase.co`.
  - live security advisors still flag leaked-password protection disabled, exposed `SECURITY DEFINER` execute on `find_customer_lead_duplicate()`, `record_admin_scrum_item_audit_event()`, and `set_admin_scrum_item_audit_fields()`, plus mutable `search_path` on `normalize_customer_domain()`.
  - live SQL still shows `anon` and `authenticated` `EXECUTE` on those same helper surfaces, and `normalize_customer_domain()` still has exposed execute with empty `proconfig`.
  - live edge-function inventory still shows `sync-claim-decision-replies` version `3` active with `verify_jwt = false`, plus `admin-shared-mailbox` version `2` and `api-access-keys` version `1` active.
  - current edge-function source for `sync-claim-decision-replies` still rejects bad `x-sync-secret` only when `CLAIM_DECISION_SYNC_SECRET` is set, so missing-secret deployments still fail open.
  - current edge-function logs on 2026-06-15 still show repeated `POST | 200` activity for `sync-claim-decision-replies` version `3`; the returned 24-hour sample still did not include recent runtime entries for `admin-shared-mailbox` or `api-access-keys`, so privileged-path runtime proof there remains partial.

## Failed Or Missing Checks

### P1 - Live Supabase auth-surface batch is still open on the deployed project
- Evidence: This pass freshly revalidated the deployed project. Live security advisors still report exposed `SECURITY DEFINER` helper executes, mutable `search_path` on `normalize_customer_domain()`, and leaked-password protection disabled. Live SQL still shows `anon` and `authenticated` `EXECUTE` on `find_customer_lead_duplicate()`, `record_admin_scrum_item_audit_event()`, and `set_admin_scrum_item_audit_fields()`, plus exposed execute on `normalize_customer_domain()`. `sync-claim-decision-replies` version `3` is still active with `verify_jwt = false`, current source still fails open when `CLAIM_DECISION_SYNC_SECRET` is absent, and live logs still show successful current runtime activity on that function.
- Impact: Even with green hosted QA lanes, the deployed auth surface still carries unresolved trust-boundary risk. That keeps release status below `GO`.
- Recommendation: Keep `TB-0081`, `TB-0085`, and `TB-0087` in the release gate until the deployed project shows revoked exposed executes, a fail-closed claim-decision sync path, and an explicit leaked-password-protection decision.
- Acceptance criteria: live advisor and SQL evidence is refreshed after fixes or waiver; exposed helper executes are cleared or explicitly accepted; and `sync-claim-decision-replies` no longer runs with a missing-secret fail-open path.

### P1 - [TB-0054] Exact-head smoke artifacts still omit preflight summaries
- Evidence: A fresh artifact download for exact-head `E2E Smoke` run `27469985957` on `7ee97c1` still returned `MATCH_COUNT=0` for `qa-target-preflight` `summary.json` and `summary.txt`. Local fix work on 2026-06-15 changed the preflight output root to `qa-target-preflight-artifacts/`, wired workflow artifact uploads for that directory, and passed targeted local regression and preflight artifact checks.
- Impact: Release Verification still loses exact DNS, HTTPS, app-shell, and Clerk preflight evidence on success artifacts, which makes later env-drift triage slower and less specific.
- Recommendation: Keep `TB-0054` pending hosted verification until smoke and deep workflows preserve the preflight summaries on success and failure paths.
- Acceptance criteria: a passing smoke run and a later failing smoke or deep run both retain downloadable `summary.json` and `summary.txt`.

### P2 - Standalone `Deep QA Hotfix Audit` has no current-head run
- Evidence: The latest standalone `Deep QA Hotfix Audit` run is `27092527987` from `2026-06-07` on head `850e507`. Current head `7ee97c1` does have fresh embedded deep admin, client, and bum coverage inside `E2E Smoke` `27469985957`, so the gap is the standalone workflow lane only.
- Impact: Release evidence is still usable because the embedded deep shards passed, but the standalone workflow remains stale and should be called out as skipped supplemental evidence rather than silently treated as current.
- Recommendation: If the release policy still expects a distinct standalone Deep QA artifact on the shipped head, rerun `Deep QA Hotfix Audit` on `7ee97c1`; otherwise keep relying on the current embedded deep shards and remove the stale standalone expectation from the gate.
- Acceptance criteria: either a current-head standalone run exists, or the release rules explicitly treat the embedded deep shards as sufficient exact-head proof.

## Cross-Agent Follow-Ups

### Code Review Agent / Release Verification - exact-head Code Review is now closed
- Current truth: `7ee97c1` is green on hosted `QA`, deploy, `E2E Smoke`, and `Visual UI Audit`, and [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) now records a fresh `GO` for the exact commit.
- Requested action: keep `TB-0019` closed unless `main` advances again; future release status should focus on the remaining standalone Deep QA, `TB-0054`, and live Supabase auth-surface blockers.

### Security Engineer / Lead Developer / Release Verification - close or waive the live auth-surface batch
- Current truth: fresh 2026-06-15 live project checks still show the same exposed helper executes, leaked-password warning, and fail-open `sync-claim-decision-replies` pattern.
- Requested action: ship or waive `TB-0081`, `TB-0085`, and `TB-0087`, then rerun live advisor, grant, source, and log checks on the deployed project.

### QA Harness Reliability / Release Verification - keep artifact durability separate from route health
- Current truth: exact-head `E2E Smoke` `27469985957` is green on `7ee97c1`, but fresh artifact download proof still shows missing `qa-target-preflight` summaries. Local artifact-routing code is now fixed and locally verified.
- Requested action: verify a successor hosted success artifact plus one failure-path artifact before closing `TB-0054`.

### QA Test Engineer / Agent Operations - decide whether standalone Deep QA is still a required lane
- Current truth: current-head embedded deep shards are green inside `27469985957`, but the distinct `Deep QA Hotfix Audit` workflow is still stale on `850e507`.
- Requested action: either rerun the standalone workflow on `7ee97c1` or clarify in the shared rules that the embedded deep shards satisfy the current release gate.

## Tracker Closeout Sweep

- Completed this pass through live Supabase SQL.
- `TB-0092` is already `CLOSED`, and its closure still matches the current-head evidence because `Visual UI Audit` `27488973899` passed on `7ee97c1`.
- No additional `TB-` item met release-verification closure criteria in this pass.
- `TB-0019` is now `CLOSED` because exact-head Code Review is fresh for `7ee97c1`.
- `TB-0054` remains pending hosted verification because current exact-head success artifacts still drop the preflight summaries, even though the local artifact-routing fix is now implemented.
- `TB-0081`, `TB-0085`, and `TB-0087` remain `OPEN` because the fresh live Supabase auth-surface evidence is still unresolved.

## Agent Inputs

- Date of run: 2026-06-15.
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
- GitHub workflows and artifacts reviewed:
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 40 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Deep QA Hotfix Audit" --limit 10 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27469969615 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27469985957 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27488973899 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run download 27469985957 --repo Pidpoddev/trustedbums --dir /tmp/...`
- Local checks reviewed:
  - `git status --short`
  - `git rev-parse HEAD`
  - `git log -1 --format='%ci %h %s'`
  - `cat .codex-review-decision.json`
  - `(env | rg '^QA_' | sed 's/=.*$//' | sort) || true`
  - raw `corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`
  - `curl -I -L --max-time 20 http://rcdl.tplinkdns.com`
- Live Supabase checks reviewed for project `vaoqvtxqvbptyxddpoju`:
  - `mcp__codex_apps__supabase._get_project`
  - `mcp__codex_apps__supabase._get_project_url`
  - `mcp__codex_apps__supabase._get_advisors(security)`
  - `mcp__codex_apps__supabase._list_edge_functions`
  - `mcp__codex_apps__supabase._get_edge_function(sync-claim-decision-replies)`
  - `mcp__codex_apps__supabase._get_logs(edge-function)`
  - `mcp__codex_apps__supabase._execute_sql` for helper grants and tracker item status
- Checks that could not fully run and why:
  - exact-head Code Review was refreshed for `7ee97c1` and `TB-0019` was closed
  - no current-head standalone `Deep QA Hotfix Audit` run exists yet
  - the Supabase tools in this pass did not expose Auth dashboard setting visibility or vault-secret presence, so leaked-password enablement and `CLAIM_DECISION_SYNC_SECRET` presence remain partially inferred from advisors and deployed source rather than fully dashboard-confirmed
