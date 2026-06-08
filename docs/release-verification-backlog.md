# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-08 by Codex._

## Release Decision

Decision: NO-GO.

## Evidence Summary

The current pushed head is `ebbc4c5` (`Move admin performance to route aggregates`). GitHub `Deploy TrustedBums to DreamHost` run `27112275422` succeeded for `ebbc4c5`, GitHub `QA` run `27112275428` succeeded for `ebbc4c5`, and live `curl -I https://trustedbums.com` returned `HTTP/2 200` with `last-modified: Mon, 08 Jun 2026 02:15:42 GMT`, so the aggregate-performance commit has production deploy and hosted QA evidence. Release evidence is still not green because current-head `E2E Smoke` run `27112291558` failed.

The current-head E2E failure is still the required extension API configuration gate, not a new hosted app-shell or auth-bootstrap failure. `E2E Smoke` run `27112291558` failed the smoke job and all three Deep QA matrix jobs. The smoke job log shows `PASS DNS`, `PASS HTTPS`, `PASS App shell`, and `PASS Clerk`, then `FAIL Extension API: Missing QA_EXTENSION_API_BASE_URL while QA_EXTENSION_API_EXPECTATION=required`. Earlier `E2E Smoke` runs `27111541454` for `fa1fdfb`, `27111730997` for `30fc1fc`, and `27111955744` for `36a171c` failed the same release class after extension preflight hardening. The latest completed `Visual UI Audit` run `27083467531` succeeded on commit `30661c8`, and the latest completed standalone `Deep QA Hotfix Audit` run `27092527987` succeeded on commit `850e507`; both are source-backed but stale relative to `ebbc4c5`.

Local preflight on the clean current head is healthy except for the same extension credential gap that is failing hosted release workflows. `.env.qa` is present. Raw shell state had none of the `QA_*`, `VITE_CLERK_PUBLISHABLE_KEY`, or `CLERK_SECRET_KEY` variables exported. After sourcing `.env.qa`, `corepack pnpm run qa:env` fails only on missing `QA_EXTENSION_API_TOKEN`, `corepack pnpm run qa:target-preflight` passes DNS, HTTPS, app shell, and Clerk checks for `https://trustedbums.com` and then fails only the extension token gate. `corepack pnpm run qa` passes lint, 77 tests, and production build on `ebbc4c5`.

Supabase drift checks are stable enough to rule out a fresh live auth outage but not to clear the release. Generic Supabase MCP confirmed the Trusted Bums project URL `https://vaoqvtxqvbptyxddpoju.supabase.co`, the current edge-function inventory still shows `email-track` version `2`, `client-team` version `2`, `profile-bootstrap` version `1`, `extension-api-v1` version `2`, and `performance-beacon` version `3`, and the only live security advisor is `auth_leaked_password_protection`. Recent live logs show repeated `POST | 200` for `profile-bootstrap` and `POST | 202` for `performance-beacon`, which does not support a current hosted bootstrap incident. The new aggregate helper migration `20260608020645 add_admin_performance_route_summary` is applied in Supabase and was verified as admin-gated. The exact Code Review marker on disk is stale for release audit purposes: `.codex-review-decision.json` records `Decision: GO` for `c9b7b070f13bce5ae373885399f7a1e102ca37d8`, not the current head `ebbc4c5566531d4baa1e79a24f62ec332fc3c39c`.

## Failed Or Missing Checks

### P0 - Current-head E2E is failing on required extension API configuration
- Evidence: `Deploy TrustedBums to DreamHost` run `27112275422` and `QA` run `27112275428` both succeeded for `ebbc4c5`, and `https://trustedbums.com` returned `HTTP/2 200` with `last-modified: Mon, 08 Jun 2026 02:15:42 GMT`. Current-head `E2E Smoke` run `27112291558` failed in smoke plus all three Deep QA jobs. The failed smoke log passed DNS, HTTPS, app shell, and Clerk, then failed because `QA_EXTENSION_API_BASE_URL` was missing while `QA_EXTENSION_API_EXPECTATION=required`.
- Impact: The deployed aggregate-performance commit is not release-clear because the required post-deploy E2E gate is red.
- Recommendation: Provide `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN` in GitHub Actions, then rerun `E2E Smoke` for `ebbc4c5` or a newer current head. If that passes, decide whether the aggregate admin-performance route also needs current-head manual admin route smoke or visual evidence before returning to GO.
- Acceptance criteria: A matching `E2E Smoke` run for `ebbc4c5` or newer completes successfully, and any required current-head visual/deep/admin-route evidence is recorded explicitly instead of inferred from older commits.

### P0 - Required extension API release coverage is still blocked
- Evidence: After sourcing `.env.qa`, local `qa:env` fails only on missing `QA_EXTENSION_API_TOKEN`, and local `qa:target-preflight` fails only the extension token check after DNS, HTTPS, app shell, and Clerk pass. The latest completed hosted `E2E Smoke` runs, `27111541454` (`fa1fdfb`), `27111730997` (`30fc1fc`), `27111955744` (`36a171c`), and `27112291558` (`ebbc4c5`), all ended in failure with the smoke job plus all three Deep QA matrix jobs exiting non-zero after the extension preflight hardening.
- Impact: Release evidence still lacks authenticated extension API allow/deny coverage for `/context` and `/page-captures`, and the required post-deploy E2E gate cannot go green while the token is absent.
- Recommendation: Provide `QA_EXTENSION_API_TOKEN` in the approved local `.env.qa` path and the GitHub Actions secret path, then rerun `qa:env`, `qa:target-preflight`, and hosted `E2E Smoke` against the current deployed commit.
- Acceptance criteria: Sourced-local and hosted `qa:env` pass with the extension token present, preflight no longer stops on extension configuration, and current-head hosted extension smoke proves authenticated allow and deny behavior.

### P1 - Exact current-head Code Review evidence is missing
- Evidence: `.codex-review-decision.json` records `Decision: GO` for commit `c9b7b070f13bce5ae373885399f7a1e102ca37d8`; the current pushed head is `ebbc4c5566531d4baa1e79a24f62ec332fc3c39c`, so the marker does not match the deployed commit.
- Impact: Even if current-head QA later passes, the release audit still lacks the exact-commit Code Review evidence the repo rules expect before `main` pushes.
- Recommendation: Rerun the Code Review Agent for `ebbc4c5`, or record an explicit Ryan override if the push was intentionally made without an exact-match GO review.
- Acceptance criteria: `.codex-review-decision.json` is refreshed for `ebbc4c5` or the release handoff explicitly records the override decision and rationale.

### P2 - The external DNS smoke target still is not trustworthy from this runner
- Evidence: `curl -I -L --max-time 20 https://trustedbums.com` returned `HTTP/2 200`, but `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` still failed from this runner with `curl: (60) SSL certificate problem: unable to get local issuer certificate`.
- Impact: The approved external DNS fallback cannot currently serve as independent release smoke evidence from this environment.
- Recommendation: Fix the certificate chain presented at `rcdl.tplinkdns.com` or document that release verification should rely on `https://trustedbums.com` until the fallback host is repaired.
- Acceptance criteria: The runner can complete a clean TLS handshake and `HTTP/2 200` response against `https://rcdl.tplinkdns.com`.

## Cross-Agent Follow-Ups

- Lead Developer:
  Evidence: `ebbc4c5` has deploy evidence through run `27112275422` and hosted QA evidence through run `27112275428`, but current-head `E2E Smoke` run `27112291558` failed on missing extension API configuration.
  Requested action: Treat the deployment as live-but-untrusted, prioritize extension API GitHub secrets, and do not declare GO from local-only or QA-only green checks.

- Code Review Agent:
  Evidence: The only GO marker on disk is for `c9b7b070...`, not current head `ebbc4c5`.
  Requested action: Refresh the exact-commit review for `ebbc4c5` or document the explicit override that allowed the push.

- QA Harness Reliability:
  Evidence: The extension preflight change is now doing its job: local preflight and the last two completed hosted `E2E Smoke` runs fail early and clearly on extension coverage instead of producing a false green.
  Requested action: Preserve that classification and make sure the next current-head hosted run for `ebbc4c5` keeps artifact retention available even if the extension gate fails again.

- Consultant Access Needs:
  Evidence: `.env.qa` is present, `trustedbums.com` is reachable, the remaining sourced-local contract miss is only `QA_EXTENSION_API_TOKEN`, and the repo-scoped GitHub wrapper can read workflow summaries. The remaining access blocker is extension API credential coverage, not blanket GitHub visibility.
  Requested action: Keep the extension token as the active access blocker, and do not reopen stale `.env.qa`-missing, GitHub-auth-missing, or blanket target-outage narratives.

## Agent Inputs

- Date of run: 2026-06-08.
- Files and evidence reviewed: `docs/qa-test-backlog.md`, `docs/security-review-backlog.md`, `docs/trust-reputation-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/consultant-access-needs.md`, `docs/production-go-live.md`, `docs/codex-edit-log.md`, `.github/workflows/e2e-smoke.yml`, `.github/workflows/qa.yml`, `.github/workflows/visual-ui-audit.yml`, `.github/workflows/deep-qa-hotfix-audit.yml`, `.codex-review-decision.json`, GitHub workflow summaries for runs `27112291558`, `27112275428`, `27112275422`, `27111955744`, `27111939536`, `27111939535`, `27111730997`, `27111715090`, `27111541454`, `27083467531`, and `27092527987`, local `qa:env`, local `qa:target-preflight`, local `qa`, live `curl -I` checks for `https://trustedbums.com` and `https://rcdl.tplinkdns.com`, and generic Supabase MCP project URL, advisor, edge-function inventory, log, and aggregate route-summary migration checks for project `vaoqvtxqvbptyxddpoju`.
- Checks that could not run and why: Authenticated extension API coverage still could not run because `QA_EXTENSION_API_TOKEN` is missing locally and the hosted workflow does not have `QA_EXTENSION_API_BASE_URL` or `QA_EXTENSION_API_TOKEN`. Local mutating Deep QA remains intentionally unavailable because cleanup credentials are not configured.
