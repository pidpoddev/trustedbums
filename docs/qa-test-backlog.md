# Trusted Bums QA And Test Backlog

_Last updated: 2026-05-31 by Codex daily QA/test engineer automation._

## Executive Read

The highest-confidence QA risk changed in this run. The base QA contract still loads `QA_BASE_URL` and `QA_EXTENSION_API_BASE_URL`, `pnpm run lint` still reports only the same 7 React hook warnings, `pnpm run test` still passes 24/24 assertions, and deployed anonymous extension smoke still passes. But authenticated deployed coverage is no longer stable evidence: `tests/e2e/authenticated-role-smoke.spec.ts --project=chromium` failed 4 of 5 checks on 2026-05-31 because Clerk test sign-in timed out for finance/member and admin/client-admin flows stalled before route settlement.

The portal interaction audit is still blocked by a known test-design defect. `tests/e2e/portal-interaction-audit.spec.ts --project=chromium` again flagged the shared `Skip to content -> #main-content` link as a broken anchor in Admin, Client Admin, and Bum layouts even though each layout ships the matching `<main id="main-content">` target. One Client Finance audit also hit `net::ERR_ADDRESS_UNREACHABLE` on `https://trustedbums.com/client/dashboard` after profile navigation, so the suite currently mixes a deterministic false positive with at least one environment or network-level instability.

## Active Recommendations

### P0 - Stabilize authenticated Playwright sign-in before treating role smoke as a release gate
- Evidence: `pnpm exec playwright test tests/e2e/authenticated-role-smoke.spec.ts --project=chromium` failed 4 of 5 checks on 2026-05-31. Admin and Client Admin timed out in [`tests/e2e/helpers/auth.ts`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/helpers/auth.ts:303) after auth and terms handling with `page.waitForTimeout: Target page, context or browser has been closed`. Client Finance and Client Member timed out inside `clerk.signIn()` at [`tests/e2e/helpers/auth.ts`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/helpers/auth.ts:63), and Clerk testing logged repeated failures against `https://clerk.trustedbums.com/v1/client/sign_ins`.
- Why it matters: Authenticated role smoke is the main executable proof for route guards and portal access. If sign-in is flaky or the helper cannot deterministically settle after auth, release risk is hidden behind test infrastructure noise.
- Recommendation: Move deployed auth setup to a Playwright `setup` project or worker-scoped `storageState` flow, capture per-role traces/screenshots on auth failure, and separate sign-in failures from post-login route assertions so QA can tell whether the break is Clerk, network, or app routing.
- Acceptance criteria: Admin, Client Admin, Client Finance, Client Member, and Bum role smoke can each complete twice consecutively on Chromium against `QA_BASE_URL`, and auth failures produce role-specific trace artifacts plus the exact failed step.

### P0 - Fix the portal interaction audit’s anchor validation and rerun route-depth coverage
- Evidence: `pnpm exec playwright test tests/e2e/portal-interaction-audit.spec.ts --project=chromium` failed 4 of 4 role audits on 2026-05-31. Admin, Client Admin, and Bum all failed [`expectNoBrokenInternalLinks()`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/portal-interaction-audit.spec.ts:162) because it rejects every `href` starting with `#`, including the shipped skip link in [AdminLayout.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/AdminLayout.tsx:92), [ClientLayout.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/ClientLayout.tsx:82), and [BumLayout.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/BumLayout.tsx:60), all of which render `<main id="main-content">`. Client Finance additionally failed with `page.goto: net::ERR_ADDRESS_UNREACHABLE` when returning to `/client/dashboard` from the profile flow.
- Why it matters: The deepest route and interaction audit is currently red for a deterministic test bug, so it cannot expose real nav, search, dialog, or role-control regressions. The finance network error also remains untriaged because the anchor failure masks later coverage for other roles.
- Recommendation: Update the helper to flag only empty or dangling fragment links, keep valid in-page skip links allowed, then rerun the suite with traces retained long enough to determine whether the finance `ERR_ADDRESS_UNREACHABLE` is target instability or a test-navigation issue.
- Acceptance criteria: The audit no longer fails on `#main-content`, reaches the route/search assertions for all configured roles, and any remaining Client Finance failure includes trace/network evidence that isolates environment versus app behavior.

### P1 - Add explicit extension API env-contract checks and authenticated allow/deny coverage
- Evidence: After sourcing `.env.qa`, `QA_EXTENSION_API_BASE_URL` is present but `QA_EXTENSION_API_TOKEN` is still missing. `pnpm exec playwright test tests/e2e/extension-api.spec.ts` passed only the anonymous `/context` checks and skipped both authenticated checks on 2026-05-31. `package.json`, `.env.qa.example`, and [`scripts/verify-qa-env.mjs`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/scripts/verify-qa-env.mjs) still do not make extension-auth requirements part of the enforceable QA contract.
- Why it matters: The extension API remains one of the clearest cross-company data exposure paths. Without an authenticated token path and seeded deny cases, QA cannot prove that allowed roles keep access while unrelated roles stay blocked.
- Recommendation: Add extension-specific env validation, document the required vars in `.env.qa.example`, and extend extension smoke into a seeded allow/deny matrix for own-company allow, foreign-company deny, Bum accepted-opportunity allow, Bum customer-target deny, and `/page-captures` authorization.
- Acceptance criteria: Extension smoke fails fast when required vars are missing, and authenticated tests prove both positive and negative `/context` and `/page-captures` behavior against seeded two-company fixtures.

### P1 - Add direct allow/deny behavior coverage for Bum contact detail and admin performance telemetry
- Evidence: [`src/pages/bum/BumContactDetail.tsx`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumContactDetail.tsx) ships save, unlink, and re-sync actions on `/bum/contacts/:id`, while [`src/App.tsx`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/App.tsx:112) and [`src/lib/portalApi.ts`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/lib/portalApi.ts:4519) expose `/admin/performance`, `performance_metric_events`, and `admin_dashboard_summary()`. This run did not produce passing automated proof for either surface, and current automated suites still stop at shell-level or route-level evidence.
- Why it matters: Represented-contact mutations and admin telemetry are both authorization-sensitive. They can regress or leak cross-role data without any existing test turning red on the actual behavior or direct data path.
- Recommendation: Add targeted tests that prove Bum contact detail load/save/unlink/re-sync success for the owning Bum plus deny behavior for another Bum and client roles, and add `/admin/performance` admin-allow plus non-admin deny coverage at route and data-helper layers.
- Acceptance criteria: `/bum/contacts/:id` has mutation success and unauthorized-failure coverage, `/admin/performance` has admin allow and non-admin deny coverage, and failures clearly distinguish route-guard breaks from backend authorization breaks.

### P2 - Replace placeholder unit coverage and add enforceable quality gates for visuals, accessibility, and source coverage
- Evidence: [`src/test/example.test.ts`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/test/example.test.ts) is still `expect(true).toBe(true)`. [`tests/e2e/visual-ui-audit.spec.ts`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/visual-ui-audit.spec.ts) captures screenshots but does not use `toHaveScreenshot()`. Repo search still finds no `@axe-core/playwright`, and [`vitest.config.ts`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/vitest.config.ts) plus `package.json` still lack a coverage configuration or `coverage` script.
- Why it matters: The unit suite can remain green on placeholder assertions, UI artifact capture does not fail CI on regressions, accessibility automation is still absent, and code coverage remains inferred instead of measured.
- Recommendation: Remove the placeholder test, add behavior assertions around active dashboard/search logic, wire at least one public and one authenticated screenshot assertion, add `@axe-core/playwright` scans for critical flows, and add a `pnpm run coverage` path backed by Vitest V8 coverage.
- Acceptance criteria: Placeholder coverage is removed, CI can fail on agreed screenshot and axe regressions, and `pnpm run coverage` emits a tracked report with thresholds.

## Business Access Coverage

- Profile bootstrap and self-editable identity:
  Data each role needs: signed-in users need their own safe preferences; Admin needs audited control over role, company, client access role, Bum identity, and admin status.
  Missing allow/deny coverage: No executable proof that users cannot self-mutate `role`, `is_admin`, `company_id`, `client_access_role`, or Bum identity through browser profile sync, direct Supabase calls, Clerk `unsafeMetadata`, or admin repair paths.
  Seeded records and credentials needed: one unassigned signup-intent user, one client user, one Bum, one admin, and a second client company for denied cross-company attachment.
  Rule/doc impact: `docs/business-access-rules.md` now defines profile bootstrap as an authorization release gate; QA should block profile/RLS hardening until safe preference edits still pass and all authorization-bearing self-edits fail.

- Extension API destinations and page captures:
  Data each role needs: Admin needs full troubleshooting context. Client Admin needs own-company destinations. Bum needs only destinations tied to accepted or explicitly assigned workflow. Client Finance and Client Member should remain deny-by-default unless Product Ops expands the rule.
  Missing allow/deny coverage: No authenticated proof yet for Client Admin own-company allow, Client Finance deny, Client Member deny, Bum accepted-opportunity allow, Bum customer-target deny, foreign-company deny, or `/page-captures` deny behavior.
  Seeded records and credentials needed: `QA_EXTENSION_API_TOKEN`, one own-company target, one foreign-company target, one allowed accepted opportunity, one denied opportunity, and replay-safe capture payloads.
  Rule/doc impact: `docs/business-access-rules.md` already requires Bum target denial without an explicit relationship; QA should keep extension release risk high until portal, API, and extension allow/deny proof all exist.

- Bum represented contacts:
  Data each role needs: Bum should see and mutate only their own represented contacts plus linked workflow context. Admin troubleshooting access is still plausible but not yet proven as an implementation-safe final rule. Client roles should be denied by default.
  Missing allow/deny coverage: No automated proof that one Bum cannot read or mutate another Bum’s contact, no client-role deny coverage, and no unauthorized unlink or re-sync assertion.
  Seeded records and credentials needed: Two Bum accounts, one out-of-scope contact, and represented-contact rows sourced from claim, prospect, target-response, and extension-capture paths.
  Rule/doc impact: `docs/business-access-rules.md` should gain a dedicated represented-contacts section before broader admin or client visibility is expanded.

- Customer targets, opportunities, and global search:
  Data each role needs: Client Admin needs own-company target and opportunity management. Client Member needs only explicitly allowed workflow data. Client Finance should remain finance/report scoped. Bum needs marketplace-safe summaries plus only relationship-bound detail. Admin needs cross-company visibility.
  Missing allow/deny coverage: This run produced no stable passing authenticated proof for search-boundary behavior. The repo still lacks seeded runtime proof that Client Finance cannot discover target-management destinations through search, unrelated Bums cannot reach accepted-opportunity detail, and accepted intro/request locking remains enforced across multiple Bums.
  Seeded records and credentials needed: Two client companies, Client Admin, Client Member, Client Finance, two Bums, one open opportunity, one accepted opportunity, one explicit target-response workflow, and deterministic searchable labels.
  Rule/doc impact: Do not tighten RLS or search-surface behavior further without the allow/deny matrix because the current business doc still leaves some pre-relationship marketplace-detail questions open.

- Performance telemetry and admin observability:
  Data each role needs: Admin needs raw and summary telemetry for troubleshooting. Non-admin roles should be denied `/admin/performance`, `performance_metric_events`, and `admin_dashboard_summary()`.
  Missing allow/deny coverage: No passing current-session route test for `/admin/performance`, no non-admin deny test, and no executable proof in this run that the helper and table stay admin-only under browser-authenticated sessions.
  Seeded records and credentials needed: Seeded telemetry rows for multiple routes and one non-admin account.
  Rule/doc impact: Treat the existing business rule as a release gate for any telemetry or admin-summary changes until route and direct data-path deny proof exists.

## Coverage Map

- Verified this run:
  `set -a; . ./.env.qa; set +a` showed `QA_BASE_URL` and `QA_EXTENSION_API_BASE_URL` present while `QA_EXTENSION_API_TOKEN` remained unset.
  `pnpm run qa:env` completed with the current base QA contract after sourcing `.env.qa`.
  `pnpm run lint` reported the same 7 `react-hooks/exhaustive-deps` warnings and no errors.
  `pnpm run test` passed 24 assertions across 6 files.
  `pnpm exec playwright test tests/e2e/extension-api.spec.ts` passed 2 anonymous `/context` checks and skipped 2 authenticated checks because `QA_EXTENSION_API_TOKEN` was missing.

- Failed this run:
  `pnpm exec playwright test tests/e2e/authenticated-role-smoke.spec.ts --project=chromium` failed 4 of 5 tests because Clerk sign-in and post-auth route settlement were not deterministic for Admin, Client Admin, Client Finance, and Client Member.
  `pnpm exec playwright test tests/e2e/portal-interaction-audit.spec.ts --project=chromium` failed all 4 role audits; 3 failed on the skip-link false positive and 1 failed with `net::ERR_ADDRESS_UNREACHABLE` on `/client/dashboard`.

- Current direct route gaps:
  `/sign-in`, `/legal/:slug`, `/admin/performance`, `/bum/contacts/:id`, and the `*` Not Found route still lack direct passing assertions from this run.

- Current behavior gaps:
  Deterministic Clerk-authenticated role smoke, extension authenticated allow/deny paths, Bum contact mutation allow/deny behavior, admin performance allow/deny behavior, role-scoped search boundaries, and route-depth interaction coverage after the anchor helper is fixed.

- Current suite skew:
  Unit coverage is still helper-heavy and includes a placeholder assertion, deployed anonymous API smoke is healthier than authenticated browser smoke, and CI still enforces only lint, Vitest, build, and local configuration smoke on pull requests and `main`.

## Watchlist

- Clerk-backed Playwright sign-in is not currently deterministic for Admin, Client Admin, Client Finance, and Client Member on the deployed QA target.
- `tests/e2e/portal-interaction-audit.spec.ts` still treats valid `#main-content` skip links as broken anchors.
- The Client Finance portal audit also recorded `net::ERR_ADDRESS_UNREACHABLE` on `https://trustedbums.com/client/dashboard`, which may indicate target or runner instability separate from the skip-link issue.
- `QA_EXTENSION_API_TOKEN` is still unavailable, so authenticated extension authorization coverage remains skipped.
- `pnpm run lint` still reports the same 7 `react-hooks/exhaustive-deps` warnings.
- React Router v7 future-flag warnings still appear during `routeGuards.test.tsx`.

## Current Standards And Time-Sensitive Notes

- Checked 2026-05-31: Playwright still recommends authenticating once and reusing saved `storageState` instead of signing in separately inside each spec. Source: [Playwright Authentication](https://playwright.dev/docs/auth)
- Checked 2026-05-31: Playwright CI guidance still treats traces and CI-specific debugging artifacts as the primary way to isolate failed browser runs, which fits the current Clerk sign-in failures. Source: [Playwright CI](https://playwright.dev/docs/ci)
- Checked 2026-05-31: Vitest still defaults coverage to the V8 provider, and the official low-friction script pattern remains `vitest run --coverage`. Source: [Vitest Coverage](https://main.vitest.dev/guide/coverage)
- Checked 2026-05-31: Supabase still documents RLS as the core browser-data authorization control and recommends explicit authenticated-versus-unauthenticated checks rather than relying on implicit `auth.uid()` behavior. Source: [Supabase Row Level Security](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security)

## Access Requests And Evidence Gaps

- Provide deterministic Clerk QA auth support: role-ready accounts, known-good sign-in path, and access to Clerk or edge logs for failed QA sign-ins.
- Provide `QA_EXTENSION_API_TOKEN` and document extension env requirements in the enforceable QA contract.
- Provide seeded multi-company authorization fixtures for extension destinations, accepted opportunities, customer targets, represented contacts, and telemetry deny checks.
- Provide CI run history, flaky-test history, and recent deploy or release evidence so QA prioritization can use observed failures instead of source review alone.
- Provide live Supabase SQL, advisor, and catalog validation in-session if QA is expected to verify direct RLS allow/deny behavior rather than keep those findings source-backed.

## Agent Inputs

- Date of run: 2026-05-31
- Files, tests, docs, routes, internet sources, and commands reviewed: `docs/consultant-team-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, previous `docs/qa-test-backlog.md`, `docs/test-accounts.md`, `package.json`, `playwright.config.ts`, `vitest.config.ts`, `src/App.tsx`, `src/pages/admin/AdminDashboard.tsx`, `src/pages/admin/AdminPerformanceMetrics.tsx`, `src/pages/bum/BumContactDetail.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/lib/portalApi.ts`, `src/lib/contactApi.ts`, all current `tests/e2e/*.spec.ts`, all current `src/test/*.test.ts*`, `.github/workflows/qa.yml`, `.github/workflows/e2e-smoke.yml`, `.github/workflows/visual-ui-audit.yml`, `supabase/migrations/*` related to targets, extension captures, performance metrics, and dashboard summary; commands: `git status --short`, `git log --oneline -n 12`, env-presence checks after sourcing `.env.qa`, `pnpm run qa:env`, `pnpm run lint`, `pnpm run test`, `pnpm exec playwright test tests/e2e/extension-api.spec.ts`, `pnpm exec playwright test tests/e2e/authenticated-role-smoke.spec.ts --project=chromium`, and `pnpm exec playwright test tests/e2e/portal-interaction-audit.spec.ts --project=chromium`.
- Internet sources reviewed: official Playwright authentication docs, official Playwright CI docs, official Vitest coverage guide, and official Supabase RLS docs.
- Checks that could not run and why: Authenticated extension API smoke still skipped because `QA_EXTENSION_API_TOKEN` was missing after sourcing `.env.qa`. Live CI history, flaky-test history, release history, and Clerk dashboard/log evidence were not available in this session. Direct Supabase SQL or advisor validation was not used in this run, so RLS-sensitive conclusions here remain repo- and test-backed rather than live-policy-backed.
