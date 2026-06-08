# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-08 by Codex._

## Executive Read

Hosted evidence is materially better than the older backlog state, but it is not uniformly green. GitHub `Visual UI Audit` run `27083467531` passed on 2026-06-07. GitHub `E2E Smoke` run `27109958355` passed on 2026-06-08 with a green smoke job plus green `Deep QA (admin|client|bum)` shards for commit `ee36a83`. The next `E2E Smoke` run, `27110095517` on commit `aab430a`, did not expose a fresh product defect in smoke or most deep coverage: smoke, `Deep QA (admin)`, and `Deep QA (bum)` passed, while only `Deep QA (client)` failed during hosted preflight with `FAIL HTTPS: fetch failed` and `FAIL App shell`. Treat that newer failure as a harness or target-health flake until it repeats on rerun or reproduces outside GitHub Actions.

Local preflight quality is stable but still not release-complete. `corepack pnpm run qa` passes lint, 73 tests across 23 files, and production build. Inherited shell state still lacks the QA contract entirely, so raw `corepack pnpm run qa:env` fails on the base variables until `.env.qa` is sourced. After sourcing `.env.qa`, `qa:env` now fails only on `QA_EXTENSION_API_TOKEN`, and `corepack pnpm run qa:target-preflight` passes DNS, HTTPS, app shell, and Clerk checks for `https://trustedbums.com`, then fails only the expected extension-token gate. Live Supabase helper migrations `20260608013000` and `20260608013500` moved RLS helpers out of the exposed `public` RPC schema and fixed lingering policy/function references after an intermediate hosted smoke caught `public.is_admin()` bootstrap failures; the final hosted authenticated role smoke passed all five roles. Mutating Deep QA remains intentionally unavailable locally until cleanup credentials are supplied.

The highest remaining QA risk is still business-access proof, not the older route-smoke regressions. Product Ops and Security continue to point at represented-contact destination scoping, Client Finance operational exports, admin-only telemetry or RPC exposure, client-team or domain approval, profile bootstrap, and extension page captures. Current tests now include more behavior-level coverage than earlier runs, but they still do not prove object-level positive and negative access across companies and roles.

## Active Recommendations

### P1 - Add extension API authenticated allow/deny coverage
- Evidence: `.env.qa` includes `QA_EXTENSION_API_BASE_URL`, but `QA_EXTENSION_API_TOKEN` is absent. `.env.qa.example` and `scripts/verify-qa-env.mjs` now document and enforce that token when the extension API base URL is configured. `tests/e2e/extension-api.spec.ts` can prove anonymous `/context` 401, but authenticated `/context` and `/page-captures` coverage still cannot run until the QA token exists.
- Why it matters: `/context` and `/page-captures` sit on a cross-company boundary that can expose destination, capture, and represented-contact workflow data.
- Recommendation: Add a dedicated QA extension token to local/CI secrets, then extend extension smoke into seeded own-company allow, foreign-company deny, Bum accepted-opportunity allow, Bum customer-target deny, and `/page-captures` authorization checks.
- Acceptance criteria: Sourced `qa:env` passes with the token present; authenticated tests prove positive and negative `/context` and `/page-captures` behavior against two-company fixtures.

### P1 - Add direct allow/deny behavior coverage for represented contacts, telemetry, profile bootstrap, and admin RPCs
- Evidence: `docs/business-access-rules.md` defines profile bootstrap, extension captures/represented contacts, and performance telemetry as authorization-sensitive. Source and regression coverage now show represented-contact destination entitlement checks, finance export narrowing, and helper/RPC cleanup. Refreshed live Supabase security advisors after migration `20260608013000` no longer flag public or signed-in execution for the RLS helper functions or `admin_dashboard_summary()`. Current tests still do not prove `/bum/contacts/:id`, `performance_metric_events`, `admin_dashboard_summary()`, or profile authorization-field mutation denials with seeded role data.
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
  Missing allow/deny coverage: `PROSPECT` target-company stage, own-company target row scoping, and company-scoped audit creation are now behavior-tested. No stable direct proof yet shows Client Finance cannot browse target-management data, unrelated Bums cannot read targets, or cross-company target reads fail. The current deployed finance search failure has been rechecked by portal interaction audit and no longer reproduces.
  Seeded records and credentials needed: two client companies, Client Admin, Client Member, Client Finance, two Bums, own-company target, foreign-company target, and deterministic finance records.
  RLS-sensitive hold: Do not broaden target, search, or extension destination visibility until own-company allow and foreign-company/role deny checks pass.

- Client Finance exports:
  Data each role needs: Client Finance needs payment reports, invoices, commission-safe exports, and finance dashboards for its own company; Client Admin may need broader company exports where approved; Client Member should not receive finance exports by default.
  Missing allow/deny coverage: Unit-level behavior now proves finance-safe field allowlists and operational export denial for Client Finance export cards. Seeded live download checks could still prove the same boundary through the browser and generated CSV blobs.
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

## Cross-Agent Follow-Ups

- QA Harness Reliability Agent:
  Evidence: GitHub `E2E Smoke` run `27109958355` passed smoke plus all three Deep QA shards on 2026-06-08, but the next run `27110095517` failed only `Deep QA (client)` before route work began. The failed client shard logged `PASS DNS`, then `FAIL HTTPS: fetch failed` and `FAIL App shell`, while the same run's smoke, admin, and Bum jobs still passed.
  Requested action: Treat this as harness or target-health evidence unless it repeats on rerun; preserve per-shard preflight artifacts even when Playwright never reaches the route audit; and make release docs distinguish hosted preflight flakes from product regressions on the same commit line.

- Consultant Access Needs and Release Verification:
  Evidence: `.env.qa.example` and `scripts/verify-qa-env.mjs` already document the extension env contract, local sourced `qa:target-preflight` now reaches `https://trustedbums.com`, and the remaining local contract failure is just `QA_EXTENSION_API_TOKEN`.
  Requested action: Remove stale claims that `.env.qa` is absent or that local DNS to `trustedbums.com` is categorically broken, and keep the active blocker focused on the missing extension token, seeded fixtures, and intermittent hosted preflight evidence.

## Coverage Map

- Verified this run:
  Raw shell state contains none of the required `QA_*`, `VITE_CLERK_PUBLISHABLE_KEY`, or `CLERK_SECRET_KEY` variables, so unsourced `corepack pnpm run qa:env` fails on the base contract as expected.
  `.env.qa` exists and exports `QA_BASE_URL`, `QA_EXTENSION_API_BASE_URL`, all five role emails, passwords, and Clerk variables; it does not export `QA_EXTENSION_API_TOKEN`, `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, or `QA_SUPABASE_SERVICE_ROLE_KEY`.
  After sourcing `.env.qa`, `corepack pnpm run qa:env` fails only on missing `QA_EXTENSION_API_TOKEN`.
  After sourcing `.env.qa`, `corepack pnpm run qa:target-preflight` passes DNS, HTTPS, app shell, and Clerk checks for `https://trustedbums.com`, then fails only the extension-token readiness check.
  `corepack pnpm run qa` passed locally with 7 existing lint warnings, 73 passing tests across 23 files, and a successful production build.
  `corepack pnpm exec vitest run src/test/customerTargetRules.test.ts src/test/accessBoundaryRegression.test.ts src/test/serviceRoleAuthorization.test.ts` passed 10 tests across 3 files, confirming the newer business-access regression surfaces still pass in isolation.
  GitHub `Visual UI Audit` run `27083467531` succeeded on 2026-06-07 and uploaded the `visual-ui-audit` artifact.
  GitHub `QA` runs `27110203072` and `27110314548` both succeeded on 2026-06-08.
  GitHub `E2E Smoke` run `27109958355` succeeded on 2026-06-08: smoke plus `Deep QA (admin|client|bum)` all passed and uploaded artifacts.
  GitHub `E2E Smoke` run `27110095517` failed on 2026-06-08, but the failure was limited to `Deep QA (client)` preflight. Smoke plus `Deep QA (admin)` and `Deep QA (bum)` still passed and uploaded artifacts.
  GitHub `E2E Smoke` runs `27110216996` for commit `a48a7da` and `27110329150` for commit `aad6840` were still in progress when this QA review was written.

- Failed or limited this run:
  Authenticated extension API smoke is still blocked because `QA_EXTENSION_API_TOKEN` is missing locally and in current consultant access.
  Local mutating Deep QA remains blocked because `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY` are not configured for the local shell.
  QA did not rerun local deployed authenticated Playwright suites in this pass because the newest hosted smoke and deep evidence was available from GitHub Actions and gave better release-grade signal.
  Direct Supabase SQL, policy-catalog, and advisor validation were not available in this QA run, so object-level allow/deny findings remain source-backed plus workflow-backed, not catalog-backed.

- Current direct route gaps:
  `/sign-in`, `/legal/:slug`, `/admin/performance`, `/bum/contacts/:id`, and the `*` Not Found route still lack direct passing assertions from this run.

- Current behavior gaps:
  Authenticated extension allow/deny, live represented-contact destination entitlement, live finance export field allow/deny, admin performance/admin-summary allow/deny, client-team/domain approval allow/deny, and direct Supabase/RLS object-level proof.

## Watchlist

- `QA_EXTENSION_API_TOKEN` is still unavailable, so authenticated extension authorization coverage remains skipped.
- Local `.env.qa` lacks `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY`; GitHub has cleanup credentials for deep QA, but local direct cleanup-backed workflow checks cannot run.
- GitHub `E2E Smoke` run `27110095517` failed only the client deep shard preflight one commit after a fully green deep pass. Keep that as a harness or target-health watch item until a rerun either repeats or clears it.
- `pnpm run lint` still reports 7 `react-hooks/exhaustive-deps` warnings.
- `pnpm run build` still emits a large shared JS chunk warning.
- React Router v7 future-flag warnings still appear during `routeGuards.test.tsx`.

## Current Standards And Time-Sensitive Notes

- Checked 2026-06-07: current Playwright release notes continue to emphasize artifact-rich debugging and targeted rerun workflows, which supports keeping `qa:target-preflight` separate from role and route assertions and preserving per-shard artifacts when Deep QA aborts early. Source: [Playwright release notes](https://playwright.dev/docs/release-notes)
- Checked 2026-06-07: current Vitest coverage guidance says V8 coverage plus built-in HTML and summary reporters are the standard path, which reinforces adding an explicit `pnpm run coverage` contract instead of relying on inferred test presence. Source: [Vitest coverage guide](https://main.vitest.dev/guide/coverage)
- Checked 2026-06-07: current Supabase RLS guidance still frames access through role-scoped Postgres policies, which reinforces direct positive and negative data-path testing rather than route smoke alone. Source: [Supabase Row Level Security docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Checked 2026-06-07: GitHub Actions artifact guidance and rerun guidance confirm that artifacts are the expected mechanism for persisting test evidence and that reruns keep the same `GITHUB_SHA` and `GITHUB_REF`. That supports classifying repeated reruns on the same commit as harness or target evidence, not silent code changes. Sources: [Workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts), [Re-running workflows and jobs](https://docs.github.com/actions/managing-workflow-runs/re-running-workflows-and-jobs?tool=cli)

## Access Requests And Evidence Gaps

- Provide `QA_EXTENSION_API_TOKEN` plus the approved seeded allow/deny fixtures for extension destinations and page captures.
- Provide deterministic Clerk QA auth support: role-ready accounts, known-good sign-in path, and Clerk or edge logs for failed QA sign-ins after target preflight passes.
- Provide seeded multi-company authorization fixtures for extension destinations, accepted opportunities, customer targets, represented contacts, profile bootstrap denial checks, telemetry deny checks, and admin summary RPC deny checks.
- Provide seeded Client Finance export fixtures covering payment reports, invoices, target contacts, Teams meetings, transcripts, Client Admin, Client Finance, Client Member, and cross-company rows.
- Provide seeded client-team/domain-approval fixtures for same-domain approval, related-domain pending/approval, public-email manual review, cross-company denial, disabled-user denial, and audit-event checks.
- Provide local-safe `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY` only for approved QA environments where cleanup-backed mutating checks are safe.
- Provide hosting/CDN or uptime evidence for `trustedbums.com` only if the June 8 hosted preflight mismatch repeats; current local and adjacent hosted evidence no longer support carrying a blanket DNS-outage claim.
- Provide CI flaky-test history, release/deploy history beyond the latest runs, and current Playwright artifact retention policy so QA prioritization can use observed failure rate instead of one-run evidence.
- Provide live Supabase SQL, advisor, and catalog validation in-session if QA is expected to verify direct RLS allow/deny behavior rather than keep findings source-backed.

## Agent Inputs

- Date of run: 2026-06-08
- Files, tests, docs, routes, CI sources, and commands reviewed: `docs/consultant-team-rules.md`, `docs/company-wide-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, `docs/codex-edit-log.md`, `docs/lead-developer-recommendations.md`, `docs/qa-test-backlog.md`, `docs/qa-harness-reliability-backlog.md`, `docs/release-verification-backlog.md`, `docs/security-review-backlog.md`, `docs/product-ops-workflow-backlog.md`, `package.json`, `playwright.config.ts`, `vitest.config.ts`, `.github/workflows/qa.yml`, `.github/workflows/e2e-smoke.yml`, `.github/workflows/visual-ui-audit.yml`, `.github/workflows/deep-qa-hotfix-audit.yml`, `.env.qa` variable-name inventory, `src/App.tsx`, current `tests/e2e/*.spec.ts`, current `src/test/*.test.ts*`, `src/test/customerTargetRules.test.ts`, `git status --short`, `git log --oneline -n 12`, `git diff -- docs/qa-test-backlog.md docs/lead-developer-recommendations.md src/test/customerTargetRules.test.ts docs/codex-edit-log.md`, `rg` route and skip searches, `corepack pnpm run qa:env`, `corepack pnpm run qa:target-preflight`, `corepack pnpm run qa`, `corepack pnpm exec vitest run src/test/customerTargetRules.test.ts src/test/accessBoundaryRegression.test.ts src/test/serviceRoleAuthorization.test.ts`, `gh run list` for `QA`, `E2E Smoke`, `Visual UI Audit`, and `Deep QA Hotfix Audit`, `gh run view 27109958355`, `gh run view 27110095517`, `gh run view 27110095517 --job 80006521915 --log-failed`, `gh run view 27110203072`, `gh run view 27110314548`, and `gh run download` for runs `27110095517` and `27083467531`.
- Internet sources reviewed: official Playwright release notes, official Vitest coverage guide, official Supabase Row Level Security docs, official GitHub Actions artifact docs, and official GitHub rerun docs.
- Checks that could not run and why: authenticated extension API allow/deny coverage could not run because `QA_EXTENSION_API_TOKEN` is missing after sourcing `.env.qa`; local mutating Deep QA could not run because `QA_DEEP_MUTATION`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY` are not configured locally; direct Supabase SQL/advisor/catalog validation was unavailable in this QA run; and GitHub `E2E Smoke` runs `27110216996` and `27110329150` were still in progress when this backlog update was written.
