# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-04 by Codex daily QA/test engineer automation._

## Executive Read

Today's strongest release evidence is GitHub Actions, not this local runner. The latest `QA` workflow on `main` passed lint, unit tests, production build, and browser smoke for SHA `ecbd51d1cb4250c6c9fe4f1a532369c7241f02e8`, and the latest `Visual UI Audit` workflow passed with authenticated screenshots. The latest `E2E Smoke` workflow on the same `main` SHA failed, so deployed release confidence is still blocked by concrete E2E regressions rather than only by the local runner's DNS problem.

The failing deployed E2E evidence is specific: client finance smoke fails because `Customer Payment Reports` resolves to both the page `h1` and a card `h3`; signup dialog smoke expects stale validation copy after the glossary update; client finance portal search stays on `/client/dashboard` instead of navigating to `/client/payments`; and the deep workflow audit timed out after 600s while reporting two P1 hotfix candidates, including `Client: Terms`. Local preflight still cannot resolve `trustedbums.com`, but Supabase extension anonymous `/context` is reachable locally and returns the expected 401 envelope. Local `pnpm run test` passed 32 assertions across 10 files; `pnpm run lint` still has 7 hook dependency warnings and no errors.

## Active Recommendations

### P0 - Fix deployed E2E smoke regressions before release signoff
- Evidence: GitHub `E2E Smoke` run `26933527284` on `main` SHA `ecbd51d1cb4250c6c9fe4f1a532369c7241f02e8` failed 5 tests: duplicated `Customer Payment Reports` heading in client finance smoke, stale signup validation copy in staging smoke, and client finance global search remaining on `/client/dashboard` instead of `/client/payments`. The same run had 23 passing and 4 skipped tests before failing.
- Why it matters: These are deployed-target failures after the merge and deployment succeeded. They block release confidence for finance navigation, signup validation, and role portal search.
- Recommendation: Patch the product or selectors intentionally: make the finance page's accessible heading structure unambiguous or scope the smoke to `h1`; update signup validation assertions to `Select Client Prospect or Bum Prospect.` if the new copy is intended; and debug why client finance search submission does not navigate to the visible finance result.
- Acceptance criteria: `E2E Smoke` reruns green on desktop and mobile for staging smoke, authenticated role smoke, and portal interaction audit; failure artifacts show no duplicate-heading strict-mode errors, stale signup-copy assertions, or client finance search navigation mismatch.

### P0 - Make deep workflow audit bounded and actionable
- Evidence: The same GitHub `E2E Smoke` run failed `pnpm run qa:deep`; `tests/e2e/deep-workflow-hotfix-audit.spec.ts` timed out after 600s and attached a report saying Deep QA found 2 issues before release-safe treatment, including `P1 - Client: Terms`. The timeout surfaced `browserContext.close` errors at `tests/e2e/deep-workflow-hotfix-audit.spec.ts:207`, so the report is partial and hard to consume.
- Why it matters: Deep QA is intended to be a page-by-page interaction gate. A 10-minute timeout hides which routes were checked, which controls were skipped, and which findings are product defects versus audit harness defects.
- Recommendation: Split the deep workflow audit by role or route group, attach the full markdown report even on timeout, cap per-route exploration time, and emit structured issue summaries before failing the test. Then triage the reported `Client: Terms` P1 and the second P1 from the artifact.
- Acceptance criteria: Deep QA completes or fails within a bounded per-route budget; the GitHub artifact lists every route checked, skipped destructive controls, P0/P1 findings, and route-specific URL/evidence; rerun proves the `Client: Terms` issue and the second P1 are resolved or downgraded with evidence.

### P1 - Add a deployed target and API preflight before E2E gates
- Evidence: GitHub Actions can reach `https://trustedbums.com`, but this local runner still cannot: `curl -I -L --max-time 20 "$QA_BASE_URL"` timed out during DNS resolution, and `dig trustedbums.com A/AAAA` reported no reachable DNS server. Supabase extension API preflight is healthier than yesterday: local `curl "$QA_EXTENSION_API_BASE_URL/context"` returned HTTP 401 with `{"apiVersion":"v1","error":"Missing bearer token."}`.
- Why it matters: Release reports still mix target reachability, DNS, Supabase function reachability, Clerk, app boot, and route assertions. Classification matters because a local runner DNS failure should not be reported as a product outage when GitHub can reach production.
- Recommendation: Add `qa:target-preflight` or a Playwright setup check that records DNS resolution, HTTPS status, app shell load, Clerk script availability, extension anonymous 401 reachability, and runner identity before dependent suites execute.
- Acceptance criteria: A failed preflight produces one artifact with host, DNS result, HTTP status or timeout, app-shell status, extension API status, runner context, and skip reason for dependent suites; a passing preflight lets staging smoke, role smoke, visual audit, portal interaction audit, and extension smoke proceed normally.

### P1 - Add explicit extension API env-contract checks and authenticated allow/deny coverage
- Evidence: `.env.qa` restores `QA_EXTENSION_API_BASE_URL`, and local sourced `pnpm exec playwright test tests/e2e/extension-api.spec.ts --project=chromium` passed anonymous rejection and skipped authenticated coverage because `QA_EXTENSION_API_TOKEN` is still missing. `.env.qa.example` and `scripts/verify-qa-env.mjs` still omit extension API variables.
- Why it matters: The extension API is a cross-company and cross-workflow data boundary. Anonymous rejection is useful but does not prove authenticated object-level authorization for `/context` or `/page-captures`.
- Recommendation: Add extension-specific env validation, document required variables in `.env.qa.example`, and extend extension smoke into seeded allow/deny checks for own-company allow, foreign-company deny, Bum accepted-opportunity allow, Bum customer-target deny, and `/page-captures` authorization.
- Acceptance criteria: Extension smoke fails fast when authenticated extension inputs are required but missing; anonymous `/context` reliably returns the expected 401 envelope; passing authenticated tests prove positive and negative `/context` and `/page-captures` behavior against two-company fixtures.

### P1 - Replace source-string target-stage coverage with behavior-level proof
- Evidence: `src/test/customerTargetRules.test.ts` verifies `relationshipStage: "PROSPECT"` by reading `src/lib/portalApi.ts` source text. `pnpm run test` passed this check, but it still does not exercise `ensureCompany()`, Supabase writes, audit creation, or the client-created target workflow.
- Why it matters: Client-created target companies affect search, marketplace visibility, extension destinations, and Product Ops handoff semantics. A source-text test can pass while helper contracts or database write behavior still create the wrong relationship stage.
- Recommendation: Add a behavior-level unit/integration test around `createCustomerTarget()` with mocked Supabase calls or a safe local fixture that proves `ensureCompany` receives `PROSPECT` and the created `customer_targets` row/audit event remains company-scoped.
- Acceptance criteria: The test fails if `createCustomerTarget()` sends any non-`PROSPECT` relationship stage for new target companies, fails if the target row is not scoped to `user.clientId`, and does not depend on regex matching source text.

### P1 - Add direct allow/deny behavior coverage for represented contacts, telemetry, and profile bootstrap
- Evidence: `docs/business-access-rules.md` treats profile bootstrap, extension captures/represented contacts, and performance telemetry as RLS/authorization-sensitive. Current tests cover route guards and source contracts, but this run produced no direct data-path proof for `/bum/contacts/:id`, `performance_metric_events`, `admin_dashboard_summary()`, or self-edit attempts against authorization-bearing profile fields.
- Why it matters: These surfaces can leak cross-role or cross-company data while route rendering stays green. Profile bootstrap is especially risky because role, company, client access role, admin status, and Bum identity are authorization-bearing fields.
- Recommendation: Add targeted portal/API/direct-data tests that prove owning-role success and unrelated-role denial for Bum contacts, admin telemetry, and profile self-edits. Product Ops/Security should own final policy; QA should own the allow/deny proof matrix.
- Acceptance criteria: Tests prove owning Bum contact load/save/unlink/re-sync success plus another-Bum/client denial; Admin allow plus non-admin denial for `/admin/performance`, `performance_metric_events`, and `admin_dashboard_summary()`; and denial of direct or browser profile changes to `role`, `is_admin`, `company_id`, `client_access_role`, and Bum identity.

### P1 - Add client-team/domain approval allow-deny coverage
- Evidence: `docs/business-access-rules.md` defines profile bootstrap, same-domain approval, related-domain approval, public-email company creation, and Client Admin team-management rules. Source scan found `/client/team` behind `ClientAccessRoute allowedAccessRoles={["CLIENT_ADMIN"]}` and the `client-team` edge function, but current tests do not prove same-company approval, cross-company denial, related-domain pending behavior, public-email denial, disabled-user denial, or audit event creation.
- Why it matters: Client team approval can grant Client Admin, Client Finance, or Client Member access. A route guard alone cannot prove the server rejects self-join, cross-company, related-domain, or public-email escalation paths.
- Recommendation: Add seeded client-team tests for same-domain approval allow, Client Finance/Member denial on `/client/team`, cross-company denial, related-domain pending-until-admin-approval, public/free email manual-review behavior, disabled-user denial, and audit logging.
- Acceptance criteria: A Client Admin can approve and disable only same-company eligible users; Client Finance and Client Member cannot access team management; public/free-email and related-domain users cannot become company members without the approved Admin path; every approval, denial, disablement, and role change creates an audit event.

### P2 - Replace placeholder unit coverage and add enforceable visual, accessibility, and coverage gates
- Evidence: `src/test/example.test.ts` still contains `expect(true).toBe(true)`. `tests/e2e/visual-ui-audit.spec.ts` captures screenshots and the latest GitHub Visual UI Audit passed, but the suite still does not use `toHaveScreenshot()`. Repo search still finds no `@axe-core/playwright`, and `vitest.config.ts` plus `package.json` still lack a coverage script.
- Why it matters: Placeholder assertions inflate confidence, screenshots can pass without comparing against baselines, accessibility automation is absent, and source coverage remains inferred instead of measured.
- Recommendation: Remove the placeholder test, add behavior assertions around active dashboard/search logic, wire at least one public and one authenticated screenshot assertion, add axe scans for critical flows, and add a `pnpm run coverage` path backed by Vitest V8 coverage.
- Acceptance criteria: Placeholder coverage is removed, CI can fail on agreed screenshot and axe regressions, and `pnpm run coverage` emits a tracked report with thresholds.

## Business Access Coverage

- Profile bootstrap and self-editable identity:
  Data each role needs: signed-in users need safe preferences only; Admin needs audited control over role, company, client access role, Bum identity, and admin status.
  Missing allow/deny coverage: No executable proof that users cannot self-mutate authorization fields through browser profile sync, Clerk metadata, direct Supabase calls, RPCs, edge functions, or extension APIs.
  Seeded records and credentials needed: one unassigned signup-intent user, one client user, one Bum, one admin, and a second client company for denied cross-company attachment.
  RLS-sensitive hold: Do not harden or expand bootstrap/profile policies until safe preference edits still pass and authorization-bearing self-edits fail.

- Customer targets and target-company stage:
  Data each role needs: Client Admin needs own-company target creation and management; Client Member needs only allowed workflow fields; Client Finance remains deny-by-default for target management; Bum needs only relationship-bound target detail; Admin needs operational visibility.
  Missing allow/deny coverage: The `PROSPECT` target-company stage is source-tested but not behavior-tested; there is still no stable direct proof that Client Finance cannot browse target-management data, unrelated Bums cannot read targets, and cross-company target reads fail.
  Seeded records and credentials needed: two client companies, Client Admin, Client Member, Client Finance, two Bums, one own-company target, one foreign-company target, and deterministic labels.
  RLS-sensitive hold: Do not broaden target, search, or extension destination visibility until own-company allow and foreign-company/role deny checks pass.

- Extension API destinations and page captures:
  Data each role needs: Admin needs troubleshooting context; Client Admin needs own-company destinations; Bum needs only accepted or explicitly assigned workflow destinations; Client Finance and Client Member remain deny-by-default unless Product Ops expands the rule.
  Missing allow/deny coverage: Anonymous rejection passes again, but there is still no authenticated proof for Client Admin own-company allow, finance/member deny, Bum accepted-opportunity allow, Bum customer-target deny, foreign-company deny, or `/page-captures` deny behavior.
  Seeded records and credentials needed: `QA_EXTENSION_API_TOKEN`, one own-company target, one foreign-company target, one allowed accepted opportunity, one denied opportunity, and replay-safe capture payloads.
  RLS-sensitive hold: Keep extension release risk high until portal, API, extension, and direct data-path allow/deny proof all exist.

- Bum represented contacts:
  Data each role needs: Bum should see and mutate only their own represented contacts plus approved linked workflow context; Admin needs troubleshooting access; client roles should be denied raw represented-contact details by default.
  Missing allow/deny coverage: No automated proof that one Bum cannot read or mutate another Bum's contact, no client-role deny coverage, and no unauthorized unlink or re-sync assertion.
  Seeded records and credentials needed: two Bum accounts, one out-of-scope contact, and represented-contact rows sourced from claim, prospect, target-response, and extension-capture paths.
  RLS-sensitive hold: Do not expand admin/client represented-contact visibility without a business-rule update and matching allow/deny tests.

- Performance telemetry and admin observability:
  Data each role needs: Admin needs raw and summary telemetry for troubleshooting; non-admin roles must be denied `/admin/performance`, `performance_metric_events`, and `admin_dashboard_summary()`.
  Missing allow/deny coverage: No passing current-session route test for `/admin/performance`, no non-admin deny test, and no browser-authenticated direct-data proof.
  Seeded records and credentials needed: seeded telemetry rows for multiple routes plus one admin and one non-admin account.
  RLS-sensitive hold: Treat the existing business rule as a release gate for telemetry or admin-summary changes until route and data-helper deny proof exists.

- Client team, domain approval, and access-role assignment:
  Data each role needs: Client Admin needs same-company access requests, related-domain request status, team member status, and allowed company-scoped role assignments; Client Finance and Client Member need no team-management authority by default; Admin needs public-email, unmatched-domain, related-domain, stale-admin, and override queues.
  Missing allow/deny coverage: No executable proof that Client Admin can approve only eligible same-company users, cannot manage another company, cannot approve related domains before Admin review, and cannot use the `client-team` function to grant cross-company authority.
  Seeded records and credentials needed: one claimed client domain, one related-domain request, one public-email signup intent, one same-company pending user, one cross-company user, one Client Admin, one Client Finance, one Client Member, and one Admin override account.
  RLS-sensitive hold: Do not expand client-team, signup, or profile-bootstrap authority until approval/denial/audit cases pass at route, edge-function, and direct-data levels.

## Coverage Map

- Verified this run:
  GitHub `QA` run `26933502583` passed lint, unit tests, production build, and browser smoke on `main` SHA `ecbd51d1cb4250c6c9fe4f1a532369c7241f02e8`.
  GitHub `Visual UI Audit` run `26931897223` passed authenticated visual audit and uploaded artifacts on SHA `ba46092682907ef983cb2925584174c947d02c79`.
  `.env.qa` sourcing showed `QA_BASE_URL`, `QA_EXTENSION_API_BASE_URL`, and all five role emails present; `QA_EXTENSION_API_TOKEN`, `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, `QA_SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` were missing locally.
  `pnpm run qa:env` passed.
  `pnpm run lint` completed with 7 warnings and 0 errors.
  `pnpm run test` passed 32 assertions across 10 files.
  `pnpm exec playwright test tests/e2e/configuration-smoke.spec.ts --project=chromium` passed locally against the Vite preview harness.
  Sourced local `pnpm exec playwright test tests/e2e/extension-api.spec.ts --project=chromium` passed anonymous extension 401 and skipped authenticated coverage.

- Failed this run:
  GitHub `E2E Smoke` run `26933527284` failed deployed staging smoke, authenticated role smoke, portal interaction audit, and deep workflow audit.
  Local `curl -I -L --max-time 20 "$QA_BASE_URL"` timed out during DNS resolution.
  Local `dig trustedbums.com A` and `dig trustedbums.com AAAA` timed out with no reachable DNS server.

- Current direct route gaps:
  `/sign-in`, `/legal/:slug`, `/admin/performance`, `/bum/contacts/:id`, and the `*` Not Found route still lack direct passing assertions from this run.

- Current behavior gaps:
  Deployed E2E smoke stability, deep route/control audit completion, deterministic local target reachability, extension authenticated allow/deny paths, target-company stage behavior coverage, Bum contact mutation allow/deny behavior, admin performance allow/deny behavior, role-scoped search boundaries, and route-depth interaction coverage after the current E2E failures are fixed.

## Watchlist

- GitHub Actions can reach production, but this local runner still cannot resolve `trustedbums.com`; use GitHub as release evidence until local DNS is repaired or independently explained.
- Client finance global search may be a product defect, not just a test defect: the finance user stayed on `/client/dashboard` after searching for the finance destination.
- The signup-intent smoke is stale after glossary changes unless Product intentionally wants the old `Client or Bum` validation copy.
- Deep QA timeout means route/control coverage is partial even though a report attached two P1 hotfix candidates.
- `QA_EXTENSION_API_TOKEN` is still unavailable, so authenticated extension authorization coverage remains skipped.
- `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY` are missing locally, so mutating deep QA and cleanup-backed workflow checks cannot run from this session.
- `pnpm run lint` still reports the same 7 `react-hooks/exhaustive-deps` warnings.
- React Router v7 future-flag warnings still appear during `routeGuards.test.tsx`.

## Current Standards And Time-Sensitive Notes

- Checked 2026-06-04: Playwright 1.60 release notes document `testConfig.webServer.gracefulShutdown`, relevant to local preview reliability and clean teardown in CI, and this repo is on `@playwright/test@1.60.0`. Source: [Playwright release notes](https://playwright.dev/docs/release-notes)
- Checked 2026-06-04: Vitest release guidance says current supported regular patch lines are newer than this repo's `vitest@3.2.4`; plan a controlled upgrade path before relying on new coverage/reporting behavior. Source: [Vitest releases](https://main.vitest.dev/releases)
- Checked 2026-06-04: OWASP WSTG API BOLA guidance emphasizes proving object-level authorization so users can access and manipulate only authorized objects; this supports separate route, role, object, and API allow/deny tests rather than one role smoke. Source: [OWASP WSTG API BOLA](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/12-API_Testing/02-API_Broken_Object_Level_Authorization)

## Access Requests And Evidence Gaps

- Provide or repair local runner DNS/resolver evidence for `trustedbums.com`, while keeping GitHub Actions as authoritative release evidence when available.
- Provide deterministic extension API authenticated inputs: `QA_EXTENSION_API_TOKEN`, seeded allowed and denied destinations, and replay-safe capture payloads.
- Provide deterministic Clerk QA auth support: role-ready accounts, known-good sign-in path, and Clerk or edge logs for failed QA sign-ins after target preflight passes.
- Provide seeded multi-company authorization fixtures for extension destinations, accepted opportunities, customer targets, represented contacts, profile bootstrap denial checks, and telemetry deny checks.
- Provide seeded client-team/domain-approval fixtures for same-domain approval, related-domain pending/approval, public-email manual review, cross-company denial, disabled-user denial, and audit-event checks.
- Provide local `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY` only for approved QA environments where cleanup-backed mutating checks are safe; GitHub currently has these for deep QA but local consultant sessions do not.
- Provide flaky-test history, release history, and current Playwright artifacts from failing runs when QA needs trace-level diagnosis beyond log summaries.
- Provide live Supabase SQL, advisor, and catalog validation in-session if QA is expected to verify direct RLS allow/deny behavior rather than keep those findings source-backed.

## Agent Inputs

- Date of run: 2026-06-04
- Files, tests, docs, routes, internet sources, and commands reviewed: automation memory path, `docs/consultant-team-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, previous `docs/qa-test-backlog.md`, `docs/codex-edit-log.md`, `docs/qa-checklist.md`, `package.json`, `playwright.config.ts`, `vitest.config.ts`, `scripts/verify-qa-env.mjs`, `.env.qa.example`, `src/App.tsx`, `src/components/SignupIntentDialog.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/pages/client/ClientPayments.tsx`, `src/lib/opportunityModel.ts`, all current `tests/e2e/*.spec.ts`, all current `src/test/*.test.ts*`, `git status --short`, `git log --oneline -8`, `git show --stat --oneline -n 5`, `.env.qa` presence checks, `pnpm run qa:env`, `pnpm run lint`, `pnpm run test`, `pnpm exec playwright test tests/e2e/configuration-smoke.spec.ts --project=chromium`, sourced `pnpm exec playwright test tests/e2e/extension-api.spec.ts --project=chromium`, local `curl` and `dig` preflights, `gh run list --limit 8`, `gh run view 26933527284 --log-failed`, `gh run view 26933502583`, and `gh run view 26931897223`.
- Internet sources reviewed: official Playwright release notes, official Vitest releases page, and OWASP WSTG API Broken Object Level Authorization testing guidance.
- Checks that could not run and why: Authenticated extension API smoke skipped because `QA_EXTENSION_API_TOKEN` was missing. Mutating deep QA was not run locally because `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY` were missing in the local consultant shell. Local deployed public/authenticated/visual Playwright checks were not rerun because local DNS for `trustedbums.com` still times out; GitHub Actions evidence was used instead. Live Supabase SQL/advisor/catalog validation, Clerk dashboard/log evidence, hosting/DNS dashboard evidence, and flaky-test history were unavailable in this session.
