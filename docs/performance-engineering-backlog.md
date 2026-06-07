# Trusted Bums Performance Engineering Backlog

_Last updated: 2026-06-06 by Codex daily performance engineer automation._

## Executive Read

The strongest current performance issue is still startup JavaScript cost. `pnpm run build` on 2026-06-06 produced a single `dist/assets/index-3bFWxhoh.js` bundle at `1,975.42 kB` minified and `515.90 kB` gzip, and Vite emitted its large-chunk warning. `src/App.tsx` still statically imports the full public, admin, client, and Bum route trees, so every session pays for code it may never execute.

Production-origin telemetry still gives enough live signal to narrow scope. A 7-day aggregate from `public.performance_metric_events` now shows `17,438` samples from `https://trustedbums.com`, with LCP p75 at `2330 ms` on `/client/dashboard`, `2108 ms` on `/bum/dashboard`, `1959 ms` on `/admin`, and `1892 ms` on `/client/targets`. Those values are still under the `2.5 s` LCP good threshold, but `/client/dashboard` and `/bum/dashboard` are close enough that reducing startup and route data fan-out should stay ahead of threshold regressions.

Backend evidence still does not justify a broad database-index sprint. Most report-domain tables are still small in this environment, while Supabase performance advisors continue to flag schema-wide unindexed foreign keys and multiple permissive RLS policies. That work should stay targeted and measurement-led until query-plan access or route traces show which warnings overlap with slow user-visible paths.

## Active Recommendations

### P0 - Split the route tree and report/admin leaves out of the startup bundle
- Evidence: `pnpm run build` on 2026-06-06 emitted one JS asset at `1,975.42 kB` minified and `515.90 kB` gzip, and Vite warned about chunks over `500 kB`. `src/App.tsx` still statically imports the full public, admin, client, and Bum page trees with no `React.lazy`, `Suspense`, or manual chunk strategy in `vite.config.ts`.
- Why it matters: Public visitors and authenticated users are downloading and parsing far more code than their route needs, which directly pressures FCP, LCP, and main-thread responsiveness.
- Recommendation: Move route groups and heavy leaves such as reports, admin performance, troubleshooting, legal, and finance/reporting pages to module-scope `React.lazy` boundaries with `Suspense` fallbacks. As part of that migration, enable the React Router `v7_startTransition` future flag and keep lazy declarations out of render scope.
- Acceptance criteria: Production build emits multiple route-aligned chunks instead of one app-wide JS file; initial bundle gzip size drops materially from the current `515.90 kB`; and follow-up production telemetry shows improved p75 LCP on `/client/dashboard`, `/bum/dashboard`, and `/admin`.

### P1 - Replace whole-list route loading with server-scoped summaries, filters, and pagination
- Evidence: `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientReports.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/client/ClientTargets.tsx`, `src/pages/bum/BumReports.tsx`, and `src/pages/admin/AdminReports.tsx` still fetch broad Supabase lists and then summarize, filter, paginate, or export in the browser. Helper functions in `src/lib/portalApi.ts` such as `listCompanies` still use `select("*")`, and `listPerformanceMetricEvents` plus multiple route helpers still default to unpaginated or large bounded reads. Production telemetry shows the most sample-heavy authenticated routes are still `/client/dashboard` (`1023` LCP samples), `/admin` (`750`), `/bum/dashboard` (`640`), and `/client/targets` (`101`) over the last 7 days.
- Why it matters: Whole-list reads increase Supabase transfer, browser memory, RLS evaluation, and render work on the exact authenticated routes that already dominate current production samples.
- Recommendation: Introduce role-scoped summary endpoints or RPCs for dashboard counters, and add server-side pagination/filtering for targets, payments, exports, and reports before rows reach React. Keep export flows server-shaped as well so CSV generation does not require hydrating entire working sets in the page.
- Acceptance criteria: Dashboard cards and report landing views load from summary queries instead of full table reads; list pages request bounded server pages and filters; export flows no longer depend on preloading all rows in the browser; and network traces or RUM show lower transfer and faster route completion on `/client/dashboard` and `/client/targets`.

### P1 - Stop global search from fanning out into multi-list warm loads
- Evidence: `src/components/PortalGlobalSearch.tsx` issues up to 14 role-dependent `useQuery` calls as soon as the field is focused, the mobile sheet opens, or the query reaches two characters. Those queries currently pull broad datasets from helpers such as `listCompanies`, `listCustomerTargets`, `listOpportunityClaims`, `listProfiles`, `listConversationThreads`, and training/reporting sources, then assemble and filter all results client-side.
- Why it matters: Search is mounted in shared portal chrome, so this pattern can add unnecessary Supabase work, RLS checks, memory growth, and keystroke-time filtering cost on already hot authenticated routes.
- Recommendation: Replace the current fan-out model with a scoped search endpoint or per-role capped search queries that accept the user term, return only top matches, and defer category fetches until there is an actual query string.
- Acceptance criteria: Focusing the search UI no longer triggers broad background list loads; search requests are term-scoped and capped server-side; and route traces show materially less network activity and scripting when opening shared portal layouts.

### P1 - Make admin performance monitoring aggregate-first and route-prioritized
- Evidence: `src/pages/admin/AdminPerformanceMetrics.tsx` still calls `listPerformanceMetricEvents({ days, metricName, rating, limit: 500 })`, and `src/lib/portalApi.ts` reads raw rows directly from `performance_metric_events` before computing p75 in the browser. Live SQL on 2026-06-06 shows `performance_metric_events` is now the largest relevant table at about `17,469` rows and `12 MB`, with roughly `17,438` 7-day samples from `https://trustedbums.com`. Current 7-day LCP p75s are `/client/dashboard` `2330 ms`, `/bum/dashboard` `2108 ms`, `/admin` `1959 ms`, and `/client/targets` `1892 ms`.
- Why it matters: The current admin view is good enough for spot inspection, but it is not the right shape for sustained prioritization as telemetry volume grows. Pulling raw rows to the browser also makes route-level tuning harder to automate and verify.
- Recommendation: Add an admin-only aggregate query surface that returns route, metric, time window, sample count, poor count, and p75 directly from the database. Use that aggregate to rank real hotspots and only then sequence targeted advisor cleanup or route-specific optimization work.
- Acceptance criteria: `/admin/performance` renders server-computed route/metric aggregates instead of raw-row p75 math in the client; the page exposes 7-day and 28-day route summaries with sample counts; and performance follow-up items can point to exact route aggregates instead of browser-side approximations.

### P2 - Target Supabase advisor cleanup only on route-hot tables
- Evidence: Supabase performance advisors are callable in this run and still report `multiple_permissive_policies` on route-hot tables including `profiles`, `opportunity_registrations`, `reverse_opportunities`, and `teams_meetings`, plus many `unindexed_foreign_keys` across the schema. At the same time, live size checks show most user-facing tables here are still small: `opportunity_registrations` `97` rows, `customer_targets` `82`, `teams_meetings` `4`, `profiles` `18`, and `companies` `89`.
- Why it matters: Advisor findings on hot-path tables can still add avoidable RLS and join overhead, but a blanket index-and-policy sweep would spend time on low-value tables before frontend bundle and query-shape work lands.
- Recommendation: After the route and summary-query work above, profile only the advisor findings that overlap sampled routes and shared search/dashboard reads, starting with permissive-policy consolidation on `profiles`, `opportunity_registrations`, `reverse_opportunities`, and `teams_meetings`, then add only the foreign-key indexes those routes actually need.
- Acceptance criteria: Follow-up query-plan or trace evidence ties each schema change to a route-hot query; advisor counts drop for the targeted tables; and no broad schema cleanup ships without measured overlap with user-visible paths.

## Measurement Notes

- `pnpm run build` passed on 2026-06-06:
  - `dist/assets/index-3bFWxhoh.js`: `1,975.42 kB` minified, `515.90 kB` gzip
  - `dist/assets/index-BH_M0tg9.css`: `88.55 kB` minified, `15.38 kB` gzip
- `pnpm run lint` passed with warnings only. The warnings in `AdminCommissionPlans`, `AdminPayments`, `AdminPayouts`, `ClientPayments`, and `ClientTargets` indicate unstable `useMemo` dependencies that can trigger avoidable recalculation.
- `pnpm run test` passed: 10 files, 32 tests.
- Largest local public assets still include `public/downloads/trusted-bums-bum-welcome-line-animation.webm` at about `1.5 MB`.
- Live Supabase SQL on 2026-06-06 showed approximate table sizes:
  - `performance_metric_events`: `17,469` rows, `12 MB`
  - `opportunity_registrations`: `97` rows, `296 kB`
  - `customer_targets`: `82` rows, `144 kB`
  - `teams_meetings`: `4` rows, `160 kB`
  - `profiles`: `18` rows, `64 kB`
  - `companies`: `89` rows, `32 kB`
- Live 7-day production-origin telemetry from `performance_metric_events`:
  - origin mix: `https://trustedbums.com` `17,438` samples, local `http://127.0.0.1:5173` `16`, unknown `2`
  - top LCP-sampled routes: `/client/dashboard` `1023`, `/admin` `750`, `/bum/dashboard` `640`, `/` `446`, `/login` `156`, `/client/targets` `101`
  - route LCP p75: `/client/dashboard` `2330 ms`, `/bum/dashboard` `2108 ms`, `/admin` `1959 ms`, `/client/targets` `1892 ms`, `/` `1023 ms`
- Supabase performance advisors are callable in this run and still report broad `unindexed_foreign_keys` plus `multiple_permissive_policies`, including on `profiles`, `opportunity_registrations`, `reverse_opportunities`, `teams_meetings`, and `training_materials`.

## Watchlist

- Supabase performance advisors still report many `unindexed_foreign_keys` and `multiple_permissive_policies` findings, but current local evidence does not show which of those materially affect user-facing routes yet.
- `performance_metric_events` is growing quickly enough that raw-row admin reads should not remain the long-term monitoring shape.
- `public/downloads/trusted-bums-bum-welcome-line-animation.webm` is large enough to watch if it becomes part of a high-traffic page path or autoplay experience.

## Current Standards And Time-Sensitive Notes

- web.dev still defines good LCP as `2.5 s` or less at the 75th percentile and continues to recommend breaking route-level LCP into discovery, request, and render delays when pages are close to threshold: [web.dev LCP](https://web.dev/articles/lcp).
- web.dev still frames INP improvement around cutting long main-thread tasks and expensive script evaluation, which supports reducing startup JS and client-side list shaping before micro-tuning paint work: [web.dev optimize long tasks](https://web.dev/articles/optimize-long-tasks), [web.dev script evaluation and long tasks](https://web.dev/articles/script-evaluation-and-long-tasks).
- React Router `v6.30.x` still exposes the `v7_startTransition` future flag, and the docs continue to recommend enabling it ahead of v7 while keeping `React.lazy` declarations at module scope: [React Router future flags](https://reactrouter.com/en/v6/upgrading/future).
- Vite 8 shipped in March 2026 with Rolldown as the default bundler and newer Node requirements. This repo is still on Vite 5.4.x, so any upgrade should be staged for compatibility and measured separately from route-splitting gains: [Vite 8 announcement](https://vite.dev/blog/announcing-vite8).

## Access Requests And Evidence Gaps

Material missing access, production/staging telemetry, traces, query plans, Supabase advisors, authenticated routes, or other evidence needed for a stronger performance review. Mirror durable requests in `docs/consultant-access-needs.md`.

- Current production/staging Lighthouse reports, browser network waterfalls, and bundle-analyzer artifacts are still unavailable.
- Supabase read-only SQL, performance advisors, and logs were available in this run, but query plans, `pg_stat_statements`, and slow-query history were not.
- No fresh authenticated route walkthrough ran for admin, client admin, client finance, client member, or Bum roles in this run, so route payload and interaction cost are still source-backed rather than browser-verified.
- Runner-side DNS or deployed-browser issues still prevent treating this machine as a reliable source of deployed navigation timing proof.

## Agent Inputs

- Date of run: 2026-06-06
- Files, tests, routes, screenshots, measurements, Supabase MCP queries/advisors, internet sources, access sources, or commands reviewed:
  - Reviewed `docs/consultant-team-rules.md`, `docs/consultant-access-needs.md`, previous `docs/performance-engineering-backlog.md`, `package.json`, `vite.config.ts`, `src/App.tsx`, `src/main.tsx`, `src/components/PerformanceMonitoring.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/components/reports/ReportsWorkspace.tsx`, `src/pages/admin/AdminReports.tsx`, `src/pages/admin/AdminPerformanceMetrics.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientReports.tsx`, `src/pages/client/ClientTargets.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/bum/BumDashboard.tsx`, `src/pages/bum/BumReports.tsx`, and `src/lib/portalApi.ts`.
  - Reviewed recent changes with `git log --since='2026-06-05 00:00' --name-only`; no matching app/doc changes were returned for the scoped paths.
  - Ran `pnpm run build`, `pnpm run lint`, `pnpm run test`, `find dist/assets`, `find public`, targeted `rg`, and targeted `sed`.
  - Queried Supabase performance advisors, Postgres logs, table-size aggregates, telemetry origin/sample aggregates, and route-level 7-day LCP p75 aggregates for project `vaoqvtxqvbptyxddpoju`.
  - Reviewed current guidance from web.dev LCP, web.dev long-task guidance, React Router future flags, and the Vite 8 announcement.
- Checks that could not run and why:
  - No Lighthouse artifact set, bundle-analyzer report, or authenticated browser waterfall was available in-session.
  - No query plans or `pg_stat_statements` surface was exposed by the available Supabase tool set.
