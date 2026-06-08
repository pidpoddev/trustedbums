# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-08 by Codex._

## Release Decision

Decision: NO-GO.

## Evidence Summary

Local QA is healthy, and the Supabase helper fix now has local hosted role-smoke proof, but release verification is not complete. After sourcing `.env.qa`, local `corepack pnpm run qa:target-preflight` passes DNS, HTTPS, app shell, and Clerk checks for `https://trustedbums.com`, `corepack pnpm run qa` passes lint, 77 tests, and production build, and hosted `authenticated-role-smoke.spec.ts` passes all five roles in 44.4s. GitHub `Visual UI Audit` run `27083467531` passed on 2026-06-07, and GitHub `QA` runs `27110203072` and `27110314548` passed on 2026-06-08.

Hosted E2E evidence regressed on later June 8 commits. `E2E Smoke` run `27109958355` passed smoke plus `Deep QA (admin|client|bum)` on commit `ee36a83`, and run `27110095517` then showed a client-only preflight miss that still looked harness-first. But run `27110216996` on commit `a48a7da` failed completed `Deep QA (admin)` and `Deep QA (bum)` jobs because requested role routes redirected to `/login` with `Authorization required` and `Unable to bootstrap this profile.` Run `27110329150` on commit `aad6840` failed the smoke job itself with 13 authenticated failures across admin, client, client finance, and Bum flows showing the same redirect-to-login/bootstrap pattern. Commit `8fa0796` applied the helper private-schema and reference-qualification fix that cleared local hosted role smoke; GitHub `E2E Smoke` run `27110757594` then passed smoke plus `Deep QA (admin|client|bum)`.

The release is still missing authenticated extension API verification because hosted and local consultant access do not have the required extension API inputs. Current-head GitHub `E2E Smoke` run `27111541454` on commit `fa1fdfb` now fails early and clearly with `QA_EXTENSION_API_EXPECTATION=required`, DNS/HTTPS/app shell/Clerk passing, and `FAIL Extension API: Missing QA_EXTENSION_API_BASE_URL while QA_EXTENSION_API_EXPECTATION=required`. That is now the top release blocker after the hosted auth/bootstrap fix verified green.

## Failed Or Missing Checks

### P0 - Authenticated extension API coverage remains blocked
- Evidence: After sourcing `.env.qa`, local `qa:env` fails only on missing `QA_EXTENSION_API_TOKEN`. Hosted current-head `E2E Smoke` run `27111541454` fails preflight because `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN` are absent while hosted workflows require extension API coverage. Hosted auth/bootstrap is no longer the active blocker because commit `8fa0796` passed local hosted role smoke and GitHub `E2E Smoke` run `27110757594`.
- Impact: Release evidence still lacks authenticated extension allow/deny coverage for `/context` and `/page-captures`.
- Recommendation: Provide `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN` in the approved CI secret path, and provide the local token needed by `.env.qa`. Then rerun `qa:env`, `qa:target-preflight`, and authenticated extension API smoke against seeded fixtures.
- Acceptance criteria: Hosted and sourced-local `qa:env` pass with extension inputs present, and authenticated extension tests prove allow and deny behavior across at least two companies and two role categories.

### P1 - Separate the older client-only preflight miss from the newer auth/bootstrap blocker
- Evidence: `E2E Smoke` run `27110095517` failed only `Deep QA (client)` during preflight with `FAIL HTTPS: fetch failed` and `FAIL App shell`, while smoke plus admin and Bum passed in the same run. Later runs failed after setup and auth navigation across multiple roles.
- Impact: Release documentation can misclassify the root problem if the harness-first preflight miss and the newer cross-role bootstrap regression are collapsed into one item.
- Recommendation: QA Harness Reliability should keep the preflight classification logic and artifact retention, while Release Verification should cite the later cross-role bootstrap failures as the actual current release blocker.
- Acceptance criteria: Release docs clearly distinguish DNS/HTTPS/app-shell/Clerk preflight misses from authenticated route/bootstrap regressions.

### P1 - Keep hosted authenticated bootstrap on release watch
- Evidence: Runs `27110216996` and `27110329150` failed with `/login` redirects and `Unable to bootstrap this profile`, but commit `8fa0796` passed sourced local hosted role smoke plus GitHub smoke and all three Deep QA shards.
- Impact: The active blocker is closed, but the failure mode should stay visible for future hosted regressions.
- Recommendation: Preserve the failed-job logs and require current-head hosted green evidence before closing any future auth/bootstrap incident.
- Acceptance criteria: Future hosted smoke plus `Deep QA (admin|client|bum)` continue passing without redirecting approved QA roles back to `/login`.

## Cross-Agent Follow-Ups

- Lead Developer:
  Evidence: The earlier “hosted smoke/deep route item closed” guidance was invalidated by runs `27110216996` and `27110329150`, and `8fa0796` now has local hosted role-smoke proof plus green GitHub run `27110757594`.
  Requested action: Move back to seeded access proof and admin performance work instead of reopening bootstrap implementation.

- QA Harness Reliability:
  Evidence: Run `27110095517` is still a distinct client-only preflight miss, but later runs fail after auth begins.
  Requested action: Preserve the harness-first classification for preflight misses while keeping the newer cross-role bootstrap failures out of the harness bucket.

- Consultant Access Needs:
  Evidence: Local target reachability is currently good, and current-head hosted E2E fails only because required extension API inputs are absent. The known missing hosted inputs are `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN`; the known missing sourced-local input is still `QA_EXTENSION_API_TOKEN`.
  Requested action: Keep stale `.env.qa`-missing or blanket DNS-outage claims closed, prioritize extension API base URL and token access, and request auth/bootstrap logs only if a future current-head run repeats the redirect-to-login failure after preflight passes.

## Agent Inputs

- Date of run: 2026-06-08.
- Files and evidence reviewed: `docs/qa-test-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/qa-harness-reliability-backlog.md`, `docs/consultant-access-needs.md`, `.github/workflows/e2e-smoke.yml`, `.github/workflows/qa.yml`, `.github/workflows/visual-ui-audit.yml`, `supabase/functions/profile-bootstrap/index.ts`, `src/pages/Login.tsx`, local `qa:env` and `qa:target-preflight` results, sourced local hosted `authenticated-role-smoke.spec.ts`, GitHub runs `27083467531`, `27109958355`, `27110095517`, `27110203072`, `27110314548`, `27110216996`, `27110329150`, `27110757594`, and `27111541454`, hosted failed-job logs for jobs `80006872202`, `80006872204`, `80006869183`, `80010305969`, and downloaded `qa-target-preflight` summaries from `/private/tmp/trustedbums-e2e-27111541454`.
- Checks that could not run and why: authenticated extension API coverage could not run because `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN` are missing in hosted CI, `QA_EXTENSION_API_TOKEN` is missing locally, and local mutating deep QA could not run because cleanup credentials are not configured.
