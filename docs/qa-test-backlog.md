# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-03 by Codex daily QA/test engineer automation._

## Executive Read

Today's run keeps the same release-verification blocker in place: this runner cannot resolve or load `trustedbums.com`, so deployed public, authenticated role, visual, and portal interaction checks cannot produce useful route assertions. `curl -I -L --max-time 20 "$QA_BASE_URL"` timed out during DNS resolution, `dig trustedbums.com A/AAAA` reported no reachable DNS server, public staging smoke failed on first navigation, and authenticated role smoke failed all five roles at `tests/e2e/helpers/auth.ts:43` before Clerk sign-in.

Local source checks remain usable but incomplete: `pnpm run qa:env` passed after sourcing `.env.qa`; `pnpm run test` passed 29 assertions across 9 files; `pnpm run lint` still has 7 React hook dependency warnings and no errors; and local configuration smoke passed. Extension API risk increased from "anonymous rejection passes" to "anonymous `/context` request timed out" against the Supabase function URL, while authenticated extension coverage still skipped because `QA_EXTENSION_API_TOKEN` is missing.

## Implementation Recheck For Next Run

- 2026-06-04 Codex implemented glossary label changes and added the Opportunity origin/stage model in commit `bbd75c4`; use `docs/codex-edit-log.md` as a required input before preserving stale route-label or opportunity-model coverage gaps.
- New source-level proof exists in `src/test/opportunityModel.test.ts`; next QA run should decide whether this is enough for unit coverage and what additional route, visual, authenticated role, and direct data-path tests are still missing.
- Recheck current route/visual assertions for updated labels such as `Client Agreement`, `Customer Leads`, `Claims`, `Client Admin`, `Client Finance`, `Client Member`, `Customer Payment Reports`, and `Origin / Stage`.

## Active Recommendations

### P0 - Add a deployed QA target and API preflight before E2E gates
- Evidence: On 2026-06-03, `curl -I -L --max-time 20 "$QA_BASE_URL"` failed with `Resolving timed out after 20005 milliseconds`; `dig +time=5 +tries=1 trustedbums.com A` and `AAAA` both reported `no servers could be reached`; `pnpm exec playwright test tests/e2e/staging-smoke.spec.ts --project=chromium --grep 'loads public pages'` failed at first navigation to `https://trustedbums.com/`; and `pnpm exec playwright test tests/e2e/extension-api.spec.ts --project=chromium` timed out on anonymous `GET https://vaoqvtxqvbptyxddpoju.supabase.co/functions/v1/extension-api-v1/context`.
- Why it matters: Route, auth, visual, interaction, and extension checks currently collapse into infrastructure-style failures. Without a preflight, release reports cannot distinguish DNS, hosting, Supabase function reachability, Clerk, app boot, and route-guard regressions.
- Recommendation: Add a `qa:target-preflight` or Playwright setup check that verifies DNS resolution, HTTPS status, app shell load, Clerk script availability, and extension API anonymous 401 reachability before dependent suites run. Fail with a classification and skip dependent suites when the target or API is unavailable.
- Acceptance criteria: A failed preflight produces one artifact with host, DNS result, HTTP status or timeout, app-shell status, extension API status, and skip reason for dependent E2E suites; a passing preflight lets staging smoke, role smoke, visual audit, portal interaction audit, and extension smoke proceed normally.

### P0 - Stabilize authenticated Playwright sign-in before using role smoke as a release gate
- Evidence: `pnpm exec playwright test tests/e2e/authenticated-role-smoke.spec.ts --project=chromium` failed 5/5 checks on 2026-06-03 at the initial `page.goto("/")` because the QA target was unreachable from this runner. Historical 2026-05-31 evidence also showed timeouts inside Clerk sign-in and post-auth route settlement after target reachability.
- Why it matters: Authenticated role smoke is the main executable proof for route guards and business-access boundaries. It cannot serve as a release gate while failures mix DNS, Clerk session setup, terms routing, and role assertions.
- Recommendation: After target preflight is reliable, move deployed auth setup to a Playwright setup project or worker-scoped `storageState` flow, persist one auth artifact per role, and report "auth setup passed" separately from "role route assertions passed."
- Acceptance criteria: Admin, Client Admin, Client Finance, Client Member, and Bum storage states are created in a dedicated setup phase; each role smoke completes twice consecutively on Chromium after a passing target preflight; failures include role-specific trace/error context and classify auth setup versus route assertion.

### P1 - Replace source-string target-stage coverage with behavior-level proof
- Evidence: Commit `2003358` changed `createCustomerTarget()` in `src/lib/portalApi.ts` from `relationshipStage: "INACTIVE"` to `"PROSPECT"`, and `src/test/customerTargetRules.test.ts` verifies the change by reading source text. The test catches accidental string drift but does not exercise `ensureCompany()`, Supabase writes, audit creation, or the client-created target workflow.
- Why it matters: Client-created target companies affect search, marketplace visibility, extension destinations, and Product Ops handoff semantics. A source-text test can pass while helper contracts or database write behavior still create the wrong relationship stage.
- Recommendation: Add a behavior-level unit/integration test around `createCustomerTarget()` with mocked Supabase calls or a safe local fixture that proves `ensureCompany` receives `PROSPECT` and the created `customer_targets` row/audit event remains company-scoped.
- Acceptance criteria: The test fails if `createCustomerTarget()` sends any non-`PROSPECT` relationship stage for new target companies, fails if the target row is not scoped to `user.clientId`, and does not depend on regex matching source text.

### P1 - Add explicit extension API env-contract checks and authenticated allow/deny coverage
- Evidence: `.env.qa` restores `QA_EXTENSION_API_BASE_URL`, but `QA_EXTENSION_API_TOKEN` is missing. `.env.qa.example` and `scripts/verify-qa-env.mjs` still omit extension API variables. On 2026-06-03, anonymous extension smoke timed out instead of proving 401 rejection, and authenticated extension smoke skipped because no token was available.
- Why it matters: The extension API is a cross-company and cross-workflow data boundary. Anonymous rejection and authenticated allow/deny behavior both need deterministic proof because `/context` and `/page-captures` can expose destination and contact workflow data.
- Recommendation: Add extension-specific env validation, document required variables in `.env.qa.example`, and extend extension smoke into seeded allow/deny checks for own-company allow, foreign-company deny, Bum accepted-opportunity allow, Bum customer-target deny, and `/page-captures` authorization.
- Acceptance criteria: Extension smoke fails fast when authenticated extension inputs are required but missing; anonymous `/context` reliably returns the expected 401 envelope; and passing authenticated tests prove both positive and negative `/context` and `/page-captures` behavior against two-company fixtures.

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
- Evidence: `src/test/example.test.ts` still contains `expect(true).toBe(true)`. `tests/e2e/visual-ui-audit.spec.ts` captures screenshots but does not use `toHaveScreenshot()`. Repo search still finds no `@axe-core/playwright`, and `vitest.config.ts` plus `package.json` still lack a coverage script.
- Why it matters: Placeholder assertions inflate confidence, screenshots do not fail CI on visual regressions, accessibility automation is absent, and source coverage remains inferred instead of measured.
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
  Missing allow/deny coverage: The new `PROSPECT` target-company stage is source-tested but not behavior-tested; there is still no stable direct proof that Client Finance cannot browse target-management data, unrelated Bums cannot read targets, and cross-company target reads fail.
  Seeded records and credentials needed: two client companies, Client Admin, Client Member, Client Finance, two Bums, one own-company target, one foreign-company target, and deterministic labels.
  RLS-sensitive hold: Do not broaden target, search, or extension destination visibility until own-company allow and foreign-company/role deny checks pass.

- Extension API destinations and page captures:
  Data each role needs: Admin needs troubleshooting context; Client Admin needs own-company destinations; Bum needs only accepted or explicitly assigned workflow destinations; Client Finance and Client Member remain deny-by-default unless Product Ops expands the rule.
  Missing allow/deny coverage: No authenticated proof yet for Client Admin own-company allow, finance/member deny, Bum accepted-opportunity allow, Bum customer-target deny, foreign-company deny, or `/page-captures` deny behavior. Anonymous `/context` rejection also failed to complete in this run.
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
  `.env.qa` sourcing showed `QA_BASE_URL`, `QA_EXTENSION_API_BASE_URL`, and all five role emails present; `QA_EXTENSION_API_TOKEN`, `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY` were missing.
  `pnpm run qa:env` passed.
  `pnpm run lint` completed with 7 warnings and 0 errors.
  `pnpm run test` passed 29 assertions across 9 files.
  `pnpm exec playwright test tests/e2e/configuration-smoke.spec.ts --project=chromium` passed locally against the Vite preview harness.

- Failed this run:
  `curl -I -L --max-time 20 "$QA_BASE_URL"` timed out during DNS resolution.
  `dig trustedbums.com A` and `dig trustedbums.com AAAA` timed out with no reachable DNS server.
  `pnpm exec playwright test tests/e2e/staging-smoke.spec.ts --project=chromium --grep 'loads public pages'` failed at initial public navigation.
  `pnpm exec playwright test tests/e2e/authenticated-role-smoke.spec.ts --project=chromium` failed all 5 roles at initial navigation before sign-in.
  `pnpm exec playwright test tests/e2e/extension-api.spec.ts --project=chromium` failed anonymous `/context` with a 30s request timeout and skipped authenticated coverage because `QA_EXTENSION_API_TOKEN` was missing.

- Current direct route gaps:
  `/sign-in`, `/legal/:slug`, `/admin/performance`, `/bum/contacts/:id`, and the `*` Not Found route still lack direct passing assertions from this run.

- Current behavior gaps:
  Deterministic target reachability, deterministic extension API reachability, deterministic Clerk-authenticated role smoke, extension authenticated allow/deny paths, target-company stage behavior coverage, Bum contact mutation allow/deny behavior, admin performance allow/deny behavior, role-scoped search boundaries, and route-depth interaction coverage after target reachability is restored.

## Watchlist

- QA runner DNS resolution for `trustedbums.com` failed again on 2026-06-03; independent hosting/DNS monitor evidence is needed before treating it as a confirmed site outage.
- Supabase extension API anonymous `/context` timed out from this runner on 2026-06-03; rerun from an independent network path or with Supabase function logs before classifying it as a live function outage.
- Clerk-backed Playwright sign-in remains unfit as a release gate until target preflight and role auth setup are separated.
- `QA_EXTENSION_API_TOKEN` is still unavailable, so authenticated extension authorization coverage remains skipped.
- `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY` are missing locally, so mutating deep QA and cleanup-backed workflow checks cannot run from this session.
- `pnpm run lint` still reports the same 7 `react-hooks/exhaustive-deps` warnings.
- React Router v7 future-flag warnings still appear during `routeGuards.test.tsx`.

## Current Standards And Time-Sensitive Notes

- Checked 2026-06-03: Playwright 1.60 release notes document `testConfig.webServer.gracefulShutdown`, which is relevant to local preview reliability and clean teardown in CI. Source: [Playwright release notes](https://playwright.dev/docs/release-notes)
- Checked 2026-06-03: Vitest release guidance says Vitest 3.x is no longer supported and current regular patches are for `vitest@5.0`, with important fixes/security patches backported to `vitest@4.1`; this repo is on `vitest@3.2.4`, so plan a controlled upgrade path before relying on new coverage/reporting behavior. Source: [Vitest releases](https://main.vitest.dev/releases)
- Checked 2026-06-03: OWASP WSTG keeps authorization testing split across bypassing authorization schema, privilege escalation, IDOR, OAuth weaknesses, and API BOLA; this supports separate route, role, object, and API allow/deny tests rather than one role smoke. Source: [OWASP WSTG authorization testing](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/README)
- Checked 2026-06-03: OWASP Developer Guide recommends deny-by-default access control, least privilege, unit/integration tests that document business authorization criteria, and manual documentation for controls that cannot be automated. Source: [OWASP Enforce Access Controls](https://devguide.owasp.org/en/04-design/02-web-app-checklist/07-access-controls/)

## Access Requests And Evidence Gaps

- Provide independent QA target health evidence: DNS provider status, hosting/CDN monitor, deployment status, and an external HTTP check for `https://trustedbums.com`.
- Provide deterministic extension API reachability evidence: Supabase function logs, deployment status, and an external anonymous `/context` check for `extension-api-v1`.
- Provide deterministic Clerk QA auth support: role-ready accounts, known-good sign-in path, and Clerk or edge logs for failed QA sign-ins after target preflight passes.
- Provide `QA_EXTENSION_API_TOKEN` and document extension env requirements in the enforceable QA contract.
- Provide seeded multi-company authorization fixtures for extension destinations, accepted opportunities, customer targets, represented contacts, profile bootstrap denial checks, and telemetry deny checks.
- Provide seeded client-team/domain-approval fixtures for same-domain approval, related-domain pending/approval, public-email manual review, cross-company denial, disabled-user denial, and audit-event checks.
- Provide `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY` only for approved QA environments where cleanup-backed mutating checks are safe.
- Provide CI run history, flaky-test history, recent deploy/release evidence, and current Playwright artifacts so QA prioritization can use observed failures instead of source review alone.
- Provide live Supabase SQL, advisor, and catalog validation in-session if QA is expected to verify direct RLS allow/deny behavior rather than keep those findings source-backed.

## Agent Inputs

- Date of run: 2026-06-03
- Files, tests, docs, routes, internet sources, and commands reviewed: `docs/consultant-team-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, previous `docs/qa-test-backlog.md`, `package.json`, `playwright.config.ts`, `vitest.config.ts`, `scripts/verify-qa-env.mjs`, `.env.qa.example`, `src/App.tsx`, `src/lib/portalApi.ts`, `src/test/customerTargetRules.test.ts`, all current `tests/e2e/*.spec.ts`, all current `src/test/*.test.ts*`, `git status --short`, `git log --oneline -n 12`, `git show --stat --oneline -n 5`, `.env.qa` presence checks, `pnpm run qa:env`, `pnpm run lint`, `pnpm run test`, `pnpm exec playwright test tests/e2e/configuration-smoke.spec.ts --project=chromium`, `pnpm exec playwright test tests/e2e/extension-api.spec.ts --project=chromium`, `pnpm exec playwright test tests/e2e/authenticated-role-smoke.spec.ts --project=chromium`, `curl -I -L --max-time 20 "$QA_BASE_URL"`, `dig +time=5 +tries=1 trustedbums.com A`, `dig +time=5 +tries=1 trustedbums.com AAAA`, and `pnpm exec playwright test tests/e2e/staging-smoke.spec.ts --project=chromium --grep 'loads public pages'`.
- Internet sources reviewed: official Playwright release notes, official Vitest releases page, OWASP Web Security Testing Guide authorization testing, and OWASP Developer Guide access-control checklist.
- Checks that could not run and why: Authenticated extension API smoke skipped because `QA_EXTENSION_API_TOKEN` was missing. Mutating deep QA was not run because `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY` were missing. Portal interaction and visual audits were not rerun after DNS failed because they depend on the same unreachable deployed target. Live CI history, flaky-test history, release history, hosting/DNS dashboard evidence, Clerk dashboard/log evidence, and Supabase SQL/advisor/catalog validation were unavailable in this session.
