# Trusted Bums Performance Engineering Backlog

_Last updated: 2026-06-08 by Codex._

## Executive Read

Startup JavaScript is improved from the earlier single app-wide bundle. `src/App.tsx` now lazy-loads public, admin, client, Bum, legal, report, finance, and troubleshooting pages, `vite.config.ts` has a deliberate vendor chunk strategy, and `corepack pnpm run qa` on 2026-06-08 emitted route-aligned page chunks instead of the prior `517.70 kB` gzip app bundle. The latest build no longer prints Vite's large-chunk warning. The remaining router-side cleanup was the React Router v7 future warnings in route guard tests, now addressed by enabling `v7_startTransition` and `v7_relativeSplatPath` in the app and test routers.

The next bottleneck after startup remains whole-list client loading on shared portal routes. `PortalGlobalSearch`, `ClientDashboard`, `ClientReports`, `ClientExports`, and `BumReports` still fetch broad datasets and then summarize, filter, or export in the browser. `/admin/performance` has moved to aggregate-first data: metric cards use `admin_performance_metric_summary`, route rows use the new `admin_performance_route_summary`, and the page no longer imports the raw `performance_metric_events` list path for its primary table.

Live backend evidence is usable for the admin telemetry path. Generic Supabase MCP against project `vaoqvtxqvbptyxddpoju` applied live migration `20260608020645 add_admin_performance_route_summary`, confirmed the new function is security invoker, verified non-admin SQL context receives `Only admins can read performance route summaries.`, and verified a simulated admin JWT claim returns route-level aggregate rows with p75 and count fields. Security advisors still show only the Supabase Auth leaked-password plan blocker; performance advisors still show the older broad unindexed-FK and multiple-permissive-policy backlog, not a new helper exposure finding.

## Active Recommendations

### P0 - Startup route splitting and router warning cleanup verified
- Evidence: `corepack pnpm run qa` on 2026-06-08 emitted many route-aligned page chunks, including public, admin, client, Bum, legal, finance, report, and troubleshooting surfaces. The prior one-file startup bundle and Vite large-chunk warning no longer appear. `src/App.tsx` now enables React Router `v7_startTransition` and `v7_relativeSplatPath`, and `src/test/routeGuards.test.tsx` uses the same future flags.
- Why it matters: Route-level code splitting keeps users from paying the full portal JavaScript cost before they enter a specific surface, and the router flags remove upgrade-warning noise from the QA signal.
- Recommendation: Treat the route-splitting item as implementation-complete. Keep future startup work focused on measured browser traces, vendor-package analysis, and data-loading reduction instead of reopening the route import pattern.
- Acceptance criteria: Met for route-aligned chunks, removed Vite warning, and removed React Router future warnings in the route-guard test. Still needs follow-up telemetry or browser traces to quantify real startup scripting improvement on authenticated dashboard routes.

### P1 - Replace whole-list dashboard, report, and export loading with server-scoped summaries and bounded reads
- Evidence: `src/pages/client/ClientDashboard.tsx` still issues parallel list queries for opportunities, targets, payment reports, invoices, reverse opportunities, and target responses, then derives dashboard counts in React. `src/pages/client/ClientReports.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/bum/BumReports.tsx`, and `src/pages/admin/AdminReports.tsx` still read broad datasets and shape report/export output client-side. `src/lib/portalApi.ts` still exposes many `select("*")` list helpers, and `listCompanies()` still returns the full row set with `select("*")`.
- Why it matters: These routes are doing transfer, RLS evaluation, memory allocation, and summary work in the browser that should be narrowed at the data source, especially on shared authenticated routes where responsiveness matters more than raw query convenience.
- Recommendation: Introduce role-scoped summary endpoints or RPCs for dashboard cards and report landing views, and move list pages and export flows to server-bounded pagination and filters instead of whole-list hydration.
- Acceptance criteria: Dashboard cards load from summary queries instead of full-table reads; report pages request only the bounded rows they render; export flows no longer depend on hydrating all matching rows in the page; and a follow-up trace or telemetry run shows lower transfer and scripting work on `/client/dashboard`, `/client/reports`, `/client/exports`, and Bum reporting surfaces.

### P1 - Stop portal search from warming large multi-query datasets in shared chrome
- Evidence: `src/components/PortalGlobalSearch.tsx` still enables up to 14 role-dependent `useQuery` calls when the field is focused, the mobile sheet opens, or the query reaches two characters. Those queries fan out into helpers like `listCompanies`, `listCustomerTargets`, `listOpportunityClaims`, `listProfiles`, `listConversationThreads`, `listVisibleBumProfiles`, and training/reporting sources, then filter results client-side. Commit `30661c86bfb5c4b843651c7adfcf6f3cd5974680` improved search ranking, but it did not change the fan-out loading shape.
- Why it matters: Search is mounted in persistent portal chrome, so this pattern adds avoidable network, RLS, and memory work to many authenticated routes before the user has committed to a real search.
- Recommendation: Replace the current fan-out model with a scoped search endpoint or per-role capped search queries that require a real query term and return only top matches for each category.
- Acceptance criteria: Focusing the search field or opening the mobile sheet no longer triggers broad background loads; category searches are term-scoped and capped server-side; and shared portal routes show materially less network and scripting work when opening search.

### P1 - Admin performance monitoring aggregate path verified
- Evidence: `src/pages/admin/AdminPerformanceMetrics.tsx` now calls `listPerformanceMetricSummaries()` and `listPerformanceMetricRouteSummaries()` instead of `listPerformanceMetricEvents()`. Migration `20260608020645_add_admin_performance_route_summary.sql` adds an admin-only route aggregate helper returning route, metric, sample count, poor count, needs-improvement count, p75, and latest sample time. The source regression in `src/test/accessBoundaryRegression.test.ts` now requires the route-summary RPC and forbids the page from importing the raw event list.
- Why it matters: The page can now represent the full selected time window through server-side aggregates instead of sampling capped raw rows in the browser.
- Recommendation: Treat the primary aggregate path as implementation-complete. Keep raw `performance_metric_events` access reserved for narrower admin troubleshooting or future drill-down flows, and add browser/authenticated route proof once current-head release evidence is available.
- Acceptance criteria: Met for server-computed metric and route summaries, no raw list import in `/admin/performance`, live admin-only RPC deployment, and local QA. Remaining proof: current-head hosted route smoke or authenticated browser walkthrough of `/admin/performance`.

### P2 - Clean up avoidable recalculation noise in the known memo-warning routes
- Evidence: `pnpm run lint` passed on 2026-06-07 with warnings only, but it still flagged unstable `useMemo` dependency inputs in `src/pages/admin/AdminCommissionPlans.tsx`, `src/pages/admin/AdminPayments.tsx`, `src/pages/admin/AdminPayouts.tsx`, `src/pages/client/ClientPayments.tsx`, and `src/pages/client/ClientTargets.tsx`.
- Why it matters: These warnings point to route code that can recreate derived arrays or objects on every render, adding avoidable recalculation churn on already data-heavy pages.
- Recommendation: Stabilize the memo inputs on the flagged routes so derived tables and totals reuse stable dependencies rather than recreating list references each render.
- Acceptance criteria: `pnpm run lint` no longer reports the current `react-hooks/exhaustive-deps` warnings for those route files, and any derived table or totals hooks depend only on stable memoized inputs.

## Measurement Notes

- `pnpm run qa:env` failed on 2026-06-07 because the shell did not have the expected QA variables exported:
  - Missing `QA_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `QA_ADMIN_EMAIL`, `QA_CLIENT_ADMIN_EMAIL`, `QA_CLIENT_FINANCE_EMAIL`, `QA_CLIENT_MEMBER_EMAIL`, and `QA_BUM_EMAIL`
- `pnpm run lint` passed with warnings only. The current warnings are in:
  - `src/pages/admin/AdminCommissionPlans.tsx`
  - `src/pages/admin/AdminPayments.tsx`
  - `src/pages/admin/AdminPayouts.tsx`
  - `src/pages/client/ClientPayments.tsx`
  - `src/pages/client/ClientTargets.tsx`
- `pnpm run test` passed on 2026-06-07:
  - `16` files
  - `46` tests
- `corepack pnpm run qa` passed on 2026-06-08:
  - Lint passed.
  - Vitest passed `77` tests across `23` files.
  - Production build passed and emitted route-aligned chunks without the prior Vite large-chunk warning.
- Local preview could not start on the required port:
  - `pnpm exec vite preview --host 127.0.0.1 --port 8080` failed with `listen EPERM: operation not permitted 127.0.0.1:8080`
- Live Supabase checks on 2026-06-07:
  - Project URL verified via generic Supabase connector: `https://vaoqvtxqvbptyxddpoju.supabase.co`
  - `public.performance_metric_events`: `33,397` rows from live `list_tables`
  - Other current route-relevant table counts from live `list_tables`: `opportunity_registrations` `97`, `customer_targets` `82`, `profiles` `18`, `companies` `89`, `teams_meetings` `4`
  - Recent edge-function logs include accepted `performance-beacon` `POST 202` events and recent `send-website-email` `POST 403` rejects
- Current performance advisors still flag:
  - Many `unindexed_foreign_keys` findings across the schema
  - `multiple_permissive_policies` on route-relevant tables including `opportunity_registrations`, `profiles`, `reverse_opportunities`, `teams_meetings`, `opportunity_questions`, and `training_materials`
- Live Supabase checks on 2026-06-08:
  - Generic Supabase MCP table inventory showed `public.performance_metric_events` at `62,359` rows.
  - Migration inventory includes `20260608020645 add_admin_performance_route_summary`.
  - Direct generic SQL without an admin JWT was denied by `admin_performance_route_summary`.
  - Simulated admin JWT claim inside a transaction returned route aggregate rows with p75 and count fields.

## Watchlist

- `public.performance_metric_events` has grown to `62,359` rows; `/admin/performance` no longer uses it as a raw-row browser workload, but any future drill-down should remain admin-only and bounded.
- The current live performance-advisor output is still broad, but without query plans or successful live SQL in this session there is not yet enough evidence to justify a schema-wide index sprint.
- The required local preview path on `127.0.0.1:8080` is still blocked by runner permissions, so local browser timing evidence remains unavailable from this machine.

## Current Standards And Time-Sensitive Notes

- [web.dev LCP](https://web.dev/articles/lcp) still defines good LCP as `2.5 s` or less at the 75th percentile. The page was last updated on September 4, 2025.
- [web.dev Optimize LCP](https://web.dev/articles/optimize-lcp?author=kipp) still recommends breaking LCP into subparts so teams can distinguish network, resource-discovery, and render delays. The page was last updated on March 31, 2025.
- [web.dev Optimize long tasks](https://web.dev/articles/optimize-long-tasks?authuser=6) still frames long tasks as any main-thread task over `50 ms`, which reinforces reducing startup JS and breaking up client-side shaping work. The page was last updated on December 19, 2024.
- [React Router future flags](https://reactrouter.com/v6/upgrading/future) still recommends adopting `v7_startTransition` from the latest v6 release before moving to v7.
- [Vite 7.0 is out](https://vite.dev/blog/announcing-vite7) remains the current major-release announcement on the official Vite blog as of 2026-06-07. This repo is still on Vite 5.x, so any upgrade should be isolated from route-splitting work and validated separately.

## Access Requests And Evidence Gaps

Material missing access, production/staging telemetry, traces, query plans, Supabase advisors, authenticated routes, or other evidence needed for a stronger performance review. Mirror durable requests in `docs/consultant-access-needs.md`.

- This session had live generic Supabase MCP table inventory, migration application, advisor checks, and SQL verification for the admin route-summary helper. Query-plan style checks were not run.
- No fresh Lighthouse artifact set, bundle-analyzer report, or authenticated browser waterfall was available in this run.
- No authenticated route walkthrough ran in the browser because the required local preview on port `8080` failed to bind and no alternate browser evidence source was used for performance timing.
- Extension API authenticated checks still lack the required token, so authenticated extension coverage remains blocked separately from the performance work.

## Agent Inputs

- Date of run: 2026-06-07
- Files, tests, routes, screenshots, measurements, Supabase MCP queries/advisors, internet sources, access sources, or commands reviewed:
  - Reviewed `docs/agents/automation-prompts/trusted-bums-daily-performance-engineer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/codex-edit-log.md`, previous `docs/performance-engineering-backlog.md`, `package.json`, `vite.config.ts`, `src/App.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/pages/admin/AdminPerformanceMetrics.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientReports.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/bum/BumReports.tsx`, and `src/lib/portalApi.ts`.
  - Reviewed recent scoped changes with `git log --since='2026-06-06 00:00' --stat -- docs/performance-engineering-backlog.md src/App.tsx src/components/PortalGlobalSearch.tsx src/pages/admin/AdminPerformanceMetrics.tsx src/lib/portalApi.ts vite.config.ts package.json`.
  - Ran `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run qa:env`, `lint`, `test`, `build`, and `pnpm exec vite preview --host 127.0.0.1 --port 8080`.
  - Queried `mcp__codex_apps__supabase._get_project_url`, `mcp__supabase_trustedbums.get_advisors(type: performance)`, `mcp__supabase_trustedbums.list_tables(schemas: [\"public\"], verbose: false)`, and `mcp__supabase_trustedbums.get_logs(service: \"edge-function\")`.
  - Reviewed current official guidance from web.dev LCP, web.dev Optimize LCP, web.dev Optimize long tasks, React Router future flags, Vite build guide, and the Vite 7 announcement.
- Checks that could not run and why:
  - Read-only live SQL and query-plan style Supabase checks did not run because both available SQL tool paths were cancelled by the tool layer in this session.
  - No local browser walkthrough ran because `vite preview` could not bind `127.0.0.1:8080` on this runner.
  - No authenticated route timing proof, Lighthouse artifact set, or bundle-analyzer output was available in-session.
