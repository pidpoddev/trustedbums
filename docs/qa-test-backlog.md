# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-06 by Codex daily QA/test engineer automation._

## Executive Read

Latest release evidence is still blocked by the 2026-06-04 GitHub `E2E Smoke` failure; no newer GitHub workflow run exists as of this audit. GitHub `QA` and `Visual UI Audit` passed on `main`, but `E2E Smoke` failed after reaching deployed authenticated routes. The failure set is now clearer because the failed Playwright artifact was downloadable today: finance smoke still fails on duplicate `Customer Payment Reports` headings, finance global search still lands on `/client/dashboard` instead of `/client/payments`, signup smoke still expects obsolete validation copy, and deep QA found P1 findings for Client Terms plus Client Member routes before timing out.

Local preflight quality is stable but not release-complete. `.env.qa` passes the current env verifier, `pnpm run lint` has the same 7 hook dependency warnings and no errors, `pnpm run test` passes 32 tests across 10 files, `pnpm run build` passes with the existing large JS chunk warning, local configuration smoke passes, and anonymous extension API smoke proves the expected 401 envelope. This runner still cannot resolve `trustedbums.com`, so local deployed browser checks remain a runner/DNS limitation rather than app proof.

The highest QA coverage risk remains business-access proof. Product Ops and Security have active access-sensitive findings around represented-contact destination scoping, Client Finance operational exports, admin-only RPC/telemetry exposure, client-team/domain approval, profile bootstrap, and extension page captures. Current tests still lean on route guards, source-string assertions, and screenshot collection; they do not yet prove object-level allow/deny behavior across companies and roles.

## Active Recommendations

### P0 - Fix current deployed E2E smoke failures before treating `main` as release-safe
- Evidence: GitHub Actions run `26933527284` (`E2E Smoke`, 2026-06-04) failed 5 deployed tests after 23 passed. Failed log and downloaded artifact show desktop and mobile failures in `tests/e2e/authenticated-role-smoke.spec.ts:35` because `getByRole("heading", { name: "Customer Payment Reports", exact: true })` resolves to both an `h1` and `h3`; `tests/e2e/portal-interaction-audit.spec.ts:244` because client-finance global search navigates to `https://trustedbums.com/client/dashboard` instead of `/client/payments`; and `tests/e2e/staging-smoke.spec.ts:42` because the test still expects old copy `Select Client or Bum.` while source now renders `Select Client Prospect or Bum Prospect.`.
- Why it matters: These are deployed-release gate failures. Some are test/selector drift, but the finance search redirect could mask a role-access or result-priority bug for a finance-only workflow.
- Recommendation: Update product or tests deliberately: give the payment summary card a distinct accessible heading or scope the smoke assertion to the page `h1`; verify finance global search selects the finance payment result and cannot expose forbidden workflow pages; update signup validation assertions to approved current copy or restore the old copy if Product wants it.
- Acceptance criteria: `E2E Smoke` passes on desktop and mobile; finance users can search and navigate to `/client/payments`; no duplicate accessible heading breaks strict Playwright assertions; signup smoke asserts the approved current validation text.

### P0 - Triage deep QA P1 findings and make the suite preserve complete route evidence
- Evidence: Downloaded GitHub artifact from run `26933527284` contains `deep-qa-hotfix-report` files. Both original and retry reports flag `P1 - Client: Terms` with evidence `Unable to accept current terms during E2E sign-in` at `https://trustedbums.com/client/terms`. The original run also flags `P1 - Client Member: Customer leads` at `/client/requests` after the browser/context closed; the retry flags `P1 - Client Member: Opportunity registration` with URL `/login`. Both runs timed out at 600s, and the Playwright snapshots show the suite was still on a Client Member portal/login state when the timeout closed the context.
- Why it matters: Deep QA is the broadest non-destructive interaction audit. A terms-acceptance failure can strand authenticated clients behind the agreement gate, while route timeouts make the suite look flaky and can hide real role-specific defects.
- Recommendation: Reproduce the Client Admin terms acceptance path directly with the same QA account; inspect whether the product write path, terms acceptance state, test helper, or already-accepted/session-deferral assumption is wrong. Then bound deep QA per route/account and attach partial reports before timeout so route-specific failures survive even when the global suite hits its cap.
- Acceptance criteria: Client Admin terms acceptance either succeeds or fails with a precise backend/UI reason; the Client Member `/client/requests` and `/client/opportunities/new` failures are reproduced or reclassified as timeout fallout; deep QA emits a complete route-result artifact with per-route timeout classification; rerun fails only on explicit P0/P1 findings.

### P1 - Add deployed target and API preflight classification before dependent E2E gates
- Evidence: After sourcing `.env.qa`, local `curl -I -L --max-time 20 "$QA_BASE_URL"` timed out during DNS resolution, and `dig +time=5 +tries=1 trustedbums.com A/AAAA` returned `no servers could be reached`. GitHub Actions reached the same target on 2026-06-04, proving the local runner has a DNS/reachability limitation. Anonymous extension API smoke still passes locally, while authenticated extension coverage skips because `QA_EXTENSION_API_TOKEN` is missing.
- Why it matters: Without a preflight, local and CI reports mix DNS, hosting, Supabase function reachability, Clerk, app boot, auth setup, and route assertions.
- Recommendation: Add a `qa:target-preflight` or Playwright setup check for DNS resolution, HTTPS status, app shell load, Clerk script availability, extension API anonymous 401 reachability, and required authenticated tokens. Use it to skip dependent suites with a classified reason when the runner cannot reach the target.
- Acceptance criteria: A failed preflight emits host, DNS result, HTTP status or timeout, app-shell status, Clerk status, extension API status, and dependent-suite skip reason; a passing preflight lets staging, role, visual, portal interaction, deep QA, and extension checks proceed normally.

### P1 - Add Client Finance export allow/deny coverage before export changes ship
- Evidence: Product Ops and Data/Analytics both flag `/client/exports` as a shipped mismatch: `src/App.tsx` grants `/client/exports` to `CLIENT_ADMIN` and `CLIENT_FINANCE`, while `src/pages/client/ClientExports.tsx` exports operational target contact emails, meeting attendees, Teams join URLs, and transcript sync status. `docs/business-access-rules.md` says Client Finance should not receive target contacts, meeting details, join URLs, transcripts, or non-finance workflow context by default.
- Why it matters: Finance exports are a direct data-egress path. A route guard proving finance can open `/client/exports` is not enough if the CSV includes operational data outside the finance role's approved scope.
- Recommendation: Add role-by-export tests before or with the product fix: Client Finance allowed for payment/invoice/commission-safe exports; Client Finance denied for target contacts, meeting attendees, Teams join URLs, transcript-adjacent fields, and operational target exports; Client Admin allowed only where business rules approve.
- Acceptance criteria: Export tests assert exact CSV/header field sets for Client Finance and Client Admin; finance users cannot generate operational exports by UI, direct route, or helper/API path; any future finance exception is documented in `docs/business-access-rules.md` before tests are relaxed.

### P1 - Replace source-string target-stage coverage with behavior-level proof
- Evidence: `src/test/customerTargetRules.test.ts` verifies `createCustomerTarget()` by regex-reading `src/lib/portalApi.ts` for `relationshipStage: "PROSPECT"`. This test passes but does not exercise `ensureCompany()`, Supabase writes, target row scoping, or audit creation.
- Why it matters: Client-created target companies affect search, extension destinations, marketplace visibility, and Product Ops handoff semantics. A source-string test can pass while runtime writes are wrong.
- Recommendation: Add a behavior-level unit/integration test around `createCustomerTarget()` with mocked Supabase calls or a safe fixture proving `ensureCompany` receives `PROSPECT`, `customer_targets.client_company_id` uses `user.clientId`, and the audit event is company-scoped.
- Acceptance criteria: The test fails on any non-`PROSPECT` relationship stage, foreign `client_company_id`, missing audit event, or regex-only source assertion.

### P1 - Add explicit extension API env checks and authenticated allow/deny coverage
- Evidence: `.env.qa` includes `QA_EXTENSION_API_BASE_URL`, but `QA_EXTENSION_API_TOKEN` is absent; `.env.qa.example` and `scripts/verify-qa-env.mjs` still omit extension API variables. `tests/e2e/extension-api.spec.ts` passed anonymous `/context` 401 locally in 582ms, then skipped authenticated `/context`.
- Why it matters: `/context` and `/page-captures` sit on a cross-company boundary that can expose destination, capture, and represented-contact workflow data.
- Recommendation: Document and validate extension-specific QA variables, then extend extension smoke into seeded own-company allow, foreign-company deny, Bum accepted-opportunity allow, Bum customer-target deny, and `/page-captures` authorization checks.
- Acceptance criteria: Extension smoke fails fast when authenticated inputs are required but missing; authenticated tests prove positive and negative `/context` and `/page-captures` behavior against two-company fixtures.

### P1 - Add direct allow/deny behavior coverage for represented contacts, telemetry, profile bootstrap, and admin RPCs
- Evidence: `docs/business-access-rules.md` defines profile bootstrap, extension captures/represented contacts, and performance telemetry as authorization-sensitive. Source and regression coverage now show represented-contact destination entitlement checks, finance export narrowing, and helper/RPC grant cleanup, and refreshed live Supabase security advisors after migration `20260607235839` no longer flag `admin_dashboard_summary()` or internal helper execution. Current tests still do not prove `/bum/contacts/:id`, `performance_metric_events`, `admin_dashboard_summary()`, or profile authorization-field mutation denials with seeded role data.
- Why it matters: Route guards can pass while direct data paths leak cross-role or cross-company records. Represented contacts and profile bootstrap are high-risk because they create or change relationship and authorization state.
- Recommendation: Add portal/API/direct-data tests for owning-role success and unrelated-role denial for Bum contacts, contact destination linking, admin telemetry, admin summary RPCs, and profile self-edits. Product Ops/Security should own final policy; QA should own the allow/deny matrix.
- Acceptance criteria: Tests prove owning Bum contact load/save/unlink/re-sync success plus another-Bum/client denial; contact linking rejects destinations the Bum is not entitled to; Admin allow plus anon/client/Bum denial for `/admin/performance`, `performance_metric_events`, and `admin_dashboard_summary()`; profile edits cannot mutate `role`, `is_admin`, `company_id`, `client_access_role`, or Bum identity.

### P1 - Add client-team/domain approval allow-deny coverage
- Evidence: `docs/business-access-rules.md` defines same-domain approval, related-domain approval, public-email company creation, profile bootstrap, and Client Admin team-management rules. `/client/team` is route-gated to `CLIENT_ADMIN`, and `supabase/functions/client-team/index.ts` is the server path, but no current test proves same-company approval, cross-company denial, related-domain pending behavior, public-email denial, disabled-user denial, or audit event creation.
- Why it matters: Team approval grants `CLIENT_ADMIN`, `CLIENT_FINANCE`, or `CLIENT_MEMBER` authority. Route guards alone cannot prove the server blocks self-join, cross-company, related-domain, or public-email escalation paths.
- Recommendation: Add seeded client-team tests for same-domain approval allow, Client Finance/Member denial on `/client/team`, cross-company denial, related-domain pending-until-admin-approval, public/free email manual review, disabled-user denial, and audit logging.
- Acceptance criteria: A Client Admin can approve and disable only same-company eligible users; Client Finance and Client Member cannot access team management; public/free-email and related-domain users cannot become company members without the approved Admin path; every approval, denial, disablement, and role change creates an audit event.

### P2 - Replace placeholder unit coverage and add enforceable visual, accessibility, and coverage gates
- Evidence: `src/test/example.test.ts` still contains `expect(true).toBe(true)`. `tests/e2e/visual-ui-audit.spec.ts` captures screenshots but does not use `toHaveScreenshot()`. Repo search still finds no `@axe-core/playwright`, and `vitest.config.ts` plus `package.json` still lack a coverage script. GitHub `Visual UI Audit` passed, but it is screenshot artifact evidence, not a visual-diff gate.
- Why it matters: Placeholder assertions inflate confidence, screenshots do not fail CI on visual regressions, accessibility automation is absent, and source coverage remains inferred instead of measured.
- Recommendation: Remove the placeholder test, add behavior assertions around active dashboard/search logic, wire at least one public and one authenticated screenshot assertion, add axe scans for critical flows, and add a `pnpm run coverage` path backed by Vitest V8 coverage.
- Acceptance criteria: Placeholder coverage is removed, CI can fail on agreed screenshot and axe regressions, and `pnpm run coverage` emits a tracked report with thresholds.

## Business Access Coverage

- Profile bootstrap and self-editable identity:
  Data each role needs: signed-in users need safe preferences only; Admin needs audited control over role, company, client access role, Bum identity, and admin status.
  Missing allow/deny coverage: No executable proof that users cannot self-mutate authorization fields through browser profile sync, Clerk metadata, direct Supabase calls, RPCs, edge functions, or extension APIs.
  Seeded records and credentials needed: unassigned signup-intent user, client user, Bum, admin, second client company, and denied/pending users.
  RLS-sensitive hold: Do not harden or expand bootstrap/profile policies until safe preference edits still pass and authorization-bearing self-edits fail.
  Business-rule update needed: none today; existing rules are sufficient, but proof categories for public-email company approval remain an open Product Ops decision.

- Customer targets, target-company stage, and finance search:
  Data each role needs: Client Admin needs own-company target creation and management; Client Member needs allowed workflow fields; Client Finance remains deny-by-default for target management; Bum needs relationship-bound target detail; Admin needs operational visibility.
  Missing allow/deny coverage: `PROSPECT` target-company stage is source-tested but not behavior-tested; no stable direct proof that Client Finance cannot browse target-management data, unrelated Bums cannot read targets, or cross-company target reads fail. The current deployed finance search failure needs triage to prove finance search routes only to allowed finance/report pages.
  Seeded records and credentials needed: two client companies, Client Admin, Client Member, Client Finance, two Bums, own-company target, foreign-company target, and deterministic finance records.
  RLS-sensitive hold: Do not broaden target, search, or extension destination visibility until own-company allow and foreign-company/role deny checks pass.

- Client Finance exports:
  Data each role needs: Client Finance needs payment reports, invoices, commission-safe exports, and finance dashboards for its own company; Client Admin may need broader company exports where approved; Client Member should not receive finance exports by default.
  Missing allow/deny coverage: No tests prove finance-safe field allowlists, operational export denial, CSV/header field contents, or direct helper/API denial for target contacts, meeting attendees, Teams join URLs, transcript sync fields, and operational target context.
  Seeded records and credentials needed: own-company payment report, invoice, target contact, Teams meeting/transcript metadata, Client Admin, Client Finance, Client Member, and second company data.
  RLS-sensitive hold: Do not expand `/client/exports` or finance export APIs until finance-safe versus operational field rules are explicit and tested.
  Business-rule update needed: Product Ops should add field-level finance-safe versus operational export rules to `docs/business-access-rules.md`.

- Extension API destinations and page captures:
  Data each role needs: Admin needs troubleshooting context; Client Admin needs own-company destinations; Bum needs only accepted or explicitly assigned workflow destinations; Client Finance and Client Member remain deny-by-default unless Product Ops expands the rule.
  Missing allow/deny coverage: Anonymous 401 is proven locally, but authenticated allow/deny coverage is still skipped. No proof yet for Client Admin own-company allow, finance/member deny, Bum accepted-opportunity allow, Bum customer-target deny, foreign-company deny, or `/page-captures` deny behavior.
  Seeded records and credentials needed: `QA_EXTENSION_API_TOKEN`, own-company target, foreign-company target, allowed accepted opportunity, denied opportunity, and replay-safe capture payloads.
  RLS-sensitive hold: Keep extension authorization risk high until portal, API, extension, and direct data-path allow/deny proof all exist.

- Bum represented contacts:
  Data each role needs: Bum should see and mutate only their own represented contacts plus approved linked workflow context; Admin needs troubleshooting access; client roles should be denied raw represented-contact details by default.
  Missing allow/deny coverage: No automated proof that one Bum cannot read or mutate another Bum's contact, no client-role deny coverage, no unauthorized unlink/re-sync assertion, and no test for the Product Ops finding that contact linking should not accept destinations outside the Bum's entitlement.
  Seeded records and credentials needed: two Bum accounts, one out-of-scope contact, represented-contact rows from claim/prospect/target-response/extension-capture paths, and one unrelated accepted opportunity.
  RLS-sensitive hold: Do not expand admin/client represented-contact visibility without a business-rule update and matching allow/deny tests.

- Performance telemetry and admin observability:
  Data each role needs: Admin needs raw and summary telemetry for troubleshooting; non-admin roles must be denied `/admin/performance`, `performance_metric_events`, and `admin_dashboard_summary()`.
  Missing allow/deny coverage: GitHub visual route coverage includes authenticated surfaces, but no current passing direct route/data proof for `/admin/performance`, no non-admin deny test, and no browser-authenticated direct-data proof.
  Seeded records and credentials needed: telemetry rows for multiple routes plus one admin and one non-admin account.
  RLS-sensitive hold: Treat the existing business rule as a release gate for telemetry or admin-summary changes until route and data-helper deny proof exists.

- Client team, domain approval, and access-role assignment:
  Data each role needs: Client Admin needs same-company access requests, related-domain request status, team member status, and allowed company-scoped role assignments; Client Finance and Client Member need no team-management authority by default; Admin needs public-email, unmatched-domain, related-domain, stale-admin, and override queues.
  Missing allow/deny coverage: No executable proof that Client Admin can approve only eligible same-company users, cannot manage another company, cannot approve related domains before Admin review, and cannot use `client-team` to grant cross-company authority.
  Seeded records and credentials needed: claimed client domain, related-domain request, public-email signup intent, same-company pending user, cross-company user, Client Admin, Client Finance, Client Member, and Admin override account.
  RLS-sensitive hold: Do not expand client-team, signup, or profile-bootstrap authority until approval/denial/audit cases pass at route, edge-function, and direct-data levels.

## Coverage Map

- Verified this run:
  `.env.qa` exists and exports `QA_BASE_URL`, `QA_EXTENSION_API_BASE_URL`, all five role emails, and Clerk variables; it does not export `QA_EXTENSION_API_TOKEN`, `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, or `QA_SUPABASE_SERVICE_ROLE_KEY`.
  `pnpm run qa:env` passed after sourcing `.env.qa`.
  `pnpm run lint` completed with 7 warnings and 0 errors.
  `pnpm run test` passed 32 tests across 10 files.
  `pnpm run build` passed with a 1.98 MB shared JS chunk warning.
  `pnpm exec playwright test tests/e2e/configuration-smoke.spec.ts --project=chromium` passed locally.
  `pnpm exec playwright test tests/e2e/extension-api.spec.ts --project=chromium` passed anonymous 401 and skipped authenticated context because `QA_EXTENSION_API_TOKEN` is missing.
  `gh run list --repo pidpoddev/trustedbums --limit 12` showed no newer GitHub runs than the 2026-06-04 `E2E Smoke` failure.
  `gh run download 26933527284` succeeded and exposed the failed Playwright report plus deep-QA markdown reports.

- Failed or limited this run:
  Local `curl -I -L --max-time 20 "$QA_BASE_URL"` timed out during DNS resolution.
  Local `dig trustedbums.com A` and `AAAA` timed out with no reachable DNS server.
  Local deployed role, visual, portal interaction, and staging smoke suites were not rerun after DNS failed because they depend on the same unreachable target from this runner.
  GitHub `E2E Smoke` run `26933527284` remains the latest deployed E2E signal and failed 5 tests plus deep QA timeout.

- Current direct route gaps:
  `/sign-in`, `/legal/:slug`, `/admin/performance`, `/bum/contacts/:id`, and the `*` Not Found route still lack direct passing assertions from this run.

- Current behavior gaps:
  Finance global-search destination proof, Client Terms acceptance proof, deep-QA route completion, authenticated extension allow/deny, finance export field allow/deny, target-company stage behavior, Bum represented-contact mutation and destination entitlement, admin performance/admin-summary allow/deny, client-team/domain approval allow/deny, and direct Supabase/RLS object-level proof.

## Watchlist

- Local runner DNS for `trustedbums.com` failed again on 2026-06-06; GitHub Actions can reach the site, so treat this as local-runner limitation until independent monitoring says otherwise.
- `QA_EXTENSION_API_TOKEN` is still unavailable, so authenticated extension authorization coverage remains skipped.
- Local `.env.qa` lacks `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY`; GitHub has cleanup credentials for deep QA, but local direct cleanup-backed workflow checks cannot run.
- GitHub deep QA now has artifact evidence, but its global timeout can still close the browser/context and obscure later route-specific results.
- `pnpm run lint` still reports 7 `react-hooks/exhaustive-deps` warnings.
- `pnpm run build` still emits a large shared JS chunk warning.
- React Router v7 future-flag warnings still appear during `routeGuards.test.tsx`.

## Current Standards And Time-Sensitive Notes

- Checked 2026-06-06: Playwright release notes include current guidance and features for preparing server-side state before visiting the app, trace/debug reliability, and new worker/test environment signals. This supports stronger setup/preflight classification and artifact-first failure triage. Source: [Playwright release notes](https://playwright.dev/docs/release-notes)
- Checked 2026-06-06: Vitest release guidance says Vitest has no fixed release cycle and currently supported versions are newer than this repo's `vitest@3.2.4`; coverage/tooling work should include a controlled Vitest upgrade path. Source: [Vitest releases](https://main.vitest.dev/releases)
- Checked 2026-06-06: Supabase RLS guidance continues to frame access through Postgres policies per request role, reinforcing the need for direct positive and negative RLS/data-path tests rather than route smoke alone. Source: [Supabase Row Level Security docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Checked 2026-06-06: Current GitHub Actions flakiness research and practice notes emphasize classifying reruns, external dependencies, and test-data isolation; this supports separating target preflight, auth setup, role assertions, direct-data fixtures, and artifact retention in CI. Sources: [GitHub Actions rerun/flakiness study](https://arxiv.org/abs/2602.02307), [CI/CD Watch flaky tests guide](https://cicd.watch/blog/flaky-tests-complete-guide)

## Access Requests And Evidence Gaps

- Provide independent QA target health evidence: DNS provider status, hosting/CDN monitor, deployment status, and external HTTP check for `https://trustedbums.com`.
- Provide deterministic Clerk QA auth support: role-ready accounts, known-good sign-in path, and Clerk or edge logs for failed QA sign-ins after target preflight passes.
- Provide `QA_EXTENSION_API_TOKEN` and document extension env requirements in the enforceable QA contract.
- Provide seeded multi-company authorization fixtures for extension destinations, accepted opportunities, customer targets, represented contacts, profile bootstrap denial checks, telemetry deny checks, and admin summary RPC deny checks.
- Provide seeded Client Finance export fixtures covering payment reports, invoices, target contacts, Teams meetings, transcripts, Client Admin, Client Finance, Client Member, and cross-company rows.
- Provide seeded client-team/domain-approval fixtures for same-domain approval, related-domain pending/approval, public-email manual review, cross-company denial, disabled-user denial, and audit-event checks.
- Provide local-safe `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY` only for approved QA environments where cleanup-backed mutating checks are safe.
- Provide CI flaky-test history, release/deploy history beyond the latest runs, and current Playwright artifacts retention policy so QA prioritization can use observed failure rate instead of one-run evidence.
- Provide live Supabase SQL, advisor, and catalog validation in-session if QA is expected to verify direct RLS allow/deny behavior rather than keep findings source-backed.

## Agent Inputs

- Date of run: 2026-06-06
- Files, tests, docs, routes, CI sources, internet sources, and commands reviewed: `docs/consultant-team-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, `docs/codex-edit-log.md`, previous `docs/qa-test-backlog.md`, `docs/product-ops-workflow-backlog.md`, `docs/security-review-backlog.md`, `docs/accessibility-backlog.md`, `docs/performance-engineering-backlog.md`, `docs/data-analytics-backlog.md`, `package.json`, `playwright.config.ts`, `vitest.config.ts`, `.env.qa` variable-name inventory, `src/App.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/components/SignupIntentDialog.tsx`, `src/components/ClientTermsGate.tsx`, `src/pages/client/ClientTerms.tsx`, `src/pages/client/ClientPayments.tsx`, `src/pages/client/ClientExports.tsx`, `src/lib/portalApi.ts`, `tests/e2e/deep-workflow-hotfix-audit.spec.ts`, `tests/e2e/helpers/auth.ts`, current `tests/e2e/*.spec.ts`, current `src/test/*.test.ts*`, `git status --short`, `git log --since=2026-06-05T07:00:53Z --oneline --decorate --all --max-count=40`, `rg` test/skip/coverage searches, `gh run list --repo pidpoddev/trustedbums --limit 12`, `gh run view 26933527284 --repo pidpoddev/trustedbums --log-failed`, `gh run download 26933527284 --repo pidpoddev/trustedbums`, downloaded deep-QA markdown reports, `pnpm run qa:env`, `pnpm run lint`, `pnpm run test`, `pnpm run build`, `pnpm exec playwright test tests/e2e/configuration-smoke.spec.ts --project=chromium`, `pnpm exec playwright test tests/e2e/extension-api.spec.ts --project=chromium`, `curl -I -L --max-time 20 "$QA_BASE_URL"`, `dig +time=5 +tries=1 trustedbums.com A`, and `dig +time=5 +tries=1 trustedbums.com AAAA`.
- Internet sources reviewed: official Playwright release notes, official Vitest releases page, official Supabase Row Level Security docs, 2026 GitHub Actions flakiness/rerun study, and current CI/CD Watch flaky tests guide.
- Checks that could not run and why: Authenticated extension API smoke skipped because `QA_EXTENSION_API_TOKEN` was missing. Mutating deep QA and direct cleanup-backed workflow checks were not run locally because `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY` were missing locally. Local deployed role, visual, staging, and portal interaction checks were not run after DNS failed because they depend on the same unreachable target from this runner. Live Supabase SQL/advisor/catalog validation, Clerk dashboard/log evidence, hosting/DNS dashboards, and full flaky-test history were unavailable in this session.
