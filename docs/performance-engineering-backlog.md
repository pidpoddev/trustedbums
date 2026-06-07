# Trusted Bums Performance Engineering Backlog

_Last updated: 2026-06-07 by Codex daily performance engineer automation._

## Executive Read

Startup JavaScript is still the clearest performance problem. `pnpm run build` on 2026-06-07 still emits one app-wide `dist/assets/index-V-_NI9wW.js` bundle at `1,975.92 kB` minified and `517.70 kB` gzip, and Vite still warns that the chunk exceeds `500 kB`. `src/App.tsx` still eagerly imports the full public, admin, client, and Bum route trees, so every session pays for code it may never execute.

The next bottleneck after startup remains whole-list client loading on shared portal routes. `PortalGlobalSearch`, `ClientDashboard`, `ClientReports`, `ClientExports`, `BumReports`, and `AdminPerformanceMetrics` still fetch broad datasets and then summarize, filter, or export in the browser. Live Supabase evidence confirms the telemetry table has grown further to `33,397` rows, while the admin telemetry page still caps itself at `500` raw rows and computes p75 client-side.

Live backend evidence is usable but narrower than the ideal path in this session. I verified the Trusted Bums Supabase project URL as `https://vaoqvtxqvbptyxddpoju.supabase.co`, current performance advisors are callable, `performance_metric_events` row growth is visible through live table inventory, and recent edge-function logs show accepted `performance-beacon` traffic. Read-only SQL and query-plan style checks were not callable in this run because both `mcp__supabase_trustedbums.execute_sql` and the generic Supabase SQL fallback were cancelled by the tool layer.

## Active Recommendations

### P0 - Split the route tree and heavy leaves out of the startup bundle
- Evidence: `pnpm run build` on 2026-06-07 emitted one JS asset at `1,975.92 kB` minified and `517.70 kB` gzip, and Vite warned about chunks over `500 kB`. [Vite build guide](https://vite.dev/guide/build) still documents chunking customization, and [Vite 7.0](https://vite.dev/blog/announcing-vite7) is current as of June 24, 2025, while this repo remains on `vite@^5.4.19` and built with Vite `5.4.21` in this run. `src/App.tsx` still statically imports every admin, client, Bum, legal, report, and troubleshooting page with no `React.lazy`, `Suspense`, or chunk strategy in `vite.config.ts`.
- Why it matters: The app is still shipping too much JavaScript up front, which directly increases parse, compile, and evaluation cost on the main thread before any route-specific work begins.
- Recommendation: Move route groups and heavy leaves such as reports, admin performance, troubleshooting, finance, and legal pages behind module-scope `React.lazy` boundaries with `Suspense` fallbacks. Add a deliberate chunking strategy in the Vite build config after the route tree is lazy-loaded. While touching the router bootstrap, enable the React Router `v7_startTransition` future flag that the test suite is already warning about.
- Acceptance criteria: Production build emits multiple route-aligned JS chunks instead of one app-wide bundle; the initial gzip JS payload drops materially from `517.70 kB`; `src/test/routeGuards.test.tsx` no longer emits the `v7_startTransition` warning; and follow-up telemetry or browser traces show improved startup scripting time on dashboard routes.

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

### P1 - Make admin performance monitoring aggregate-first before the telemetry table grows further
- Evidence: `src/pages/admin/AdminPerformanceMetrics.tsx` still calls `listPerformanceMetricEvents({ days, metricName, rating, limit: 500 })` and computes p75 in the browser over raw rows. `src/lib/portalApi.ts` still reads individual `performance_metric_events` rows instead of route/metric aggregates. Live Supabase table inventory on 2026-06-07 shows `public.performance_metric_events` at `33,397` rows, and recent edge-function logs still show accepted `POST 202` traffic to `performance-beacon`.
- Why it matters: Raw-row client math will become noisier and less representative as telemetry volume grows, and the current `500`-row cap prevents the admin view from serving as a trustworthy prioritization surface.
- Recommendation: Add an admin-only aggregate query surface that returns route, metric, time window, sample count, poor count, and p75 directly from the database, then use that aggregate as the source for `/admin/performance`.
- Acceptance criteria: `/admin/performance` renders server-computed route or metric aggregates instead of raw-row browser math; the page exposes at least 7-day and 28-day summaries with sample counts; and future performance backlog items can cite aggregate outputs rather than client-side approximations.

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
- `pnpm run build` passed on 2026-06-07:
  - `dist/assets/index-V-_NI9wW.js`: `1,975.92 kB` minified, `517.70 kB` gzip
  - `dist/assets/index-vTHVyLhw.css`: `88.61 kB` minified, `15.42 kB` gzip
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

## Watchlist

- `public.performance_metric_events` has roughly doubled since the earlier backlog snapshot and should not remain a raw-row admin workload.
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

- This session had live Supabase advisors, table inventory, logs, and project-URL verification, but not callable read-only SQL or query-plan access. Both the project-scoped `execute_sql` path and the generic SQL fallback were cancelled by the tool layer.
- No fresh Lighthouse artifact set, bundle-analyzer report, or authenticated browser waterfall was available in this run.
- No authenticated route walkthrough ran in the browser because the required local preview on port `8080` failed to bind and no alternate browser evidence source was used for performance timing.
- The shell still lacked the expected QA env contract, so even preflighted authenticated route checks were blocked before navigation.

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
