# Trusted Bums Performance Engineering Backlog

_Last updated: 2026-06-08 by Codex daily performance engineer automation._

## Executive Read

Current-state postscript: the hosted failure evidence below is historical. Current head `441fd92` passed GitHub `QA` run `27167307017`, DreamHost deploy run `27167306961`, `E2E Smoke` run `27167339658`, and `Visual UI Audit` run `27167324836`. Performance follow-up should continue from the measured data-loading and telemetry items, not from the older extension-preflight blocker.

Startup JavaScript is improved from the earlier single app-wide bundle. `src/App.tsx` still lazy-loads public, admin, client, Bum, legal, report, finance, and troubleshooting pages, `vite.config.ts` still applies a deliberate vendor chunk strategy, and `corepack pnpm run qa` on 2026-06-08 emitted route-aligned page chunks without Vite's earlier large-chunk warning. The router-warning cleanup also remains complete: the app and route-guard tests both enable React Router's `v7_startTransition` and `v7_relativeSplatPath` flags.

The next bottleneck after startup remains whole-list client loading on shared portal routes. `PortalGlobalSearch`, `ClientDashboard`, `ClientReports`, `ClientExports`, and `BumReports` still fetch broad datasets and then summarize, filter, or export in the browser. Live telemetry is now strong enough to keep that claim measured instead of speculative: `public.performance_metric_events` holds `62,808` rows across `50` routes, and 7-day p75 LCP is `2036 ms` on `/client/dashboard`, `2000 ms` on `/client/reports`, `1944 ms` on `/client/exports`, and `1932 ms` on `/bum/reports`. Those figures are still inside the current good-LCP threshold, but they are the closest high-traffic authenticated routes to the line and still deserve transfer- and scripting-cost reduction before more portal weight lands.

Live backend evidence is usable for the admin telemetry path. The generic Supabase connector against project `vaoqvtxqvbptyxddpoju` confirms the route-summary helper is live, `performance-beacon` is still returning `202` writes in recent edge logs, and `/admin/performance` itself now shows a 7-day p75 LCP of `1656 ms`. The remaining proof gap is product-facing rather than schema-facing: current-head GitHub `E2E Smoke` run `27112837432` on commit `4402ace` failed before Playwright route navigation because `QA_EXTENSION_API_BASE_URL` was unset while extension coverage was marked required, and local preview could not stay on the required port `8080` because that port is already occupied on this machine.

## Active Recommendations

### P1 - Replace whole-list dashboard, report, and export loading with server-scoped summaries and bounded reads
- Evidence: `src/pages/client/ClientDashboard.tsx` still issues parallel list queries for opportunities, targets, payment reports, invoices, reverse opportunities, and target responses, then derives dashboard counts in React. `src/pages/client/ClientReports.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/bum/BumReports.tsx`, and `src/pages/admin/AdminReports.tsx` still read broad datasets and shape report/export output client-side. `src/lib/portalApi.ts` still exposes many `select("*")` list helpers, including `listCompanies()` returning the full row set with `select("*")`. Live 7-day telemetry now backs the priority: p75 LCP is `2036 ms` on `/client/dashboard`, `2000 ms` on `/client/reports`, `1944 ms` on `/client/exports`, and `1932 ms` on `/bum/reports`.
- Why it matters: These routes are doing transfer, RLS evaluation, memory allocation, and summary work in the browser that should be narrowed at the data source, especially on shared authenticated routes where responsiveness matters more than raw query convenience.
- Recommendation: Introduce role-scoped summary endpoints or RPCs for dashboard cards and report landing views, and move list pages and export flows to server-bounded pagination and filters instead of whole-list hydration.
- Acceptance criteria: Dashboard cards load from summary queries instead of full-table reads; report pages request only the bounded rows they render; export flows no longer depend on hydrating all matching rows in the page; and a follow-up trace or telemetry run shows lower transfer and scripting work on `/client/dashboard`, `/client/reports`, `/client/exports`, and Bum reporting surfaces.

### P1 - Stop portal search from warming large multi-query datasets in shared chrome
- Evidence: `src/components/PortalGlobalSearch.tsx` still enables up to `14` role-dependent `useQuery` calls when the field is focused, the mobile sheet opens, or the query reaches two characters. Those queries fan out into helpers like `listCompanies`, `listCustomerTargets`, `listOpportunityClaims`, `listProfiles`, `listConversationThreads`, `listVisibleBumProfiles`, and training/reporting sources, then filter results client-side. Commit `30661c86bfb5c4b843651c7adfcf6f3cd5974680` improved search ranking, but it did not change the fan-out loading shape.
- Why it matters: Search is mounted in persistent portal chrome, so this pattern adds avoidable network, RLS, and memory work to many authenticated routes before the user has committed to a real search.
- Recommendation: Replace the current fan-out model with a scoped search endpoint or per-role capped search queries that require a real query term and return only top matches for each category.
- Acceptance criteria: Focusing the search field or opening the mobile sheet no longer triggers broad background loads; category searches are term-scoped and capped server-side; and shared portal routes show materially less network and scripting work when opening search.

### P2 - Clean up avoidable recalculation noise in the known memo-warning routes
- Evidence: `pnpm run lint` passed on 2026-06-08 with warnings only, and the remaining `react-hooks/exhaustive-deps` warnings are still in `src/pages/admin/AdminCommissionPlans.tsx`, `src/pages/admin/AdminPayments.tsx`, `src/pages/admin/AdminPayouts.tsx`, `src/pages/client/ClientPayments.tsx`, and `src/pages/client/ClientTargets.tsx`.
- Why it matters: These warnings point to route code that can recreate derived arrays or objects on every render, adding avoidable recalculation churn on already data-heavy pages.
- Recommendation: Stabilize the memo inputs on the flagged routes so derived tables and totals reuse stable dependencies rather than recreating list references each render.
- Acceptance criteria: `pnpm run lint` no longer reports the current `react-hooks/exhaustive-deps` warnings for those route files, and any derived table or totals hooks depend only on stable memoized inputs.

### P2 - Add current-head browser timing evidence for `/admin/performance` after the aggregate rollout
- Evidence: `src/pages/admin/AdminPerformanceMetrics.tsx` now reads only `listPerformanceMetricSummaries()` and `listPerformanceMetricRouteSummaries()` for its primary cards and table, and live Supabase telemetry shows `/admin/performance` at a 7-day p75 LCP of `1656 ms`. Current-head GitHub `E2E Smoke` run `27112837432` on commit `4402ace` never reached browser navigation because `QA_EXTENSION_API_BASE_URL` was missing while extension coverage was required, and local `vite preview` could not stay on the required local port `8080`.
- Why it matters: The aggregate-only data path is shipped, but the backlog still needs one product-facing proof point that the deployed admin route loads and filters correctly without depending on raw-row hydration.
- Recommendation: After the hosted extension preflight is fixed, add a narrow authenticated smoke or browser walkthrough that loads `/admin/performance`, exercises its filters, and confirms the route uses the deployed aggregate path successfully on current head.
- Acceptance criteria: Current-head hosted route smoke or an authenticated browser run reaches `/admin/performance`, the page renders aggregate cards and route rows without raw-event list imports, and the proof is recorded in release or QA evidence rather than inferred from source alone.

## Measurement Notes

- `corepack pnpm run qa` passed on 2026-06-08:
  - Lint passed with warnings only.
  - Vitest passed `79` tests across `23` files.
  - Production build passed and emitted route-aligned chunks without the prior Vite large-chunk warning.
  - The largest remaining emitted assets were `dist/assets/vendor-DucjGV1L.js` at `487.54 kB` (`141.16 kB` gzip), `dist/assets/vendor-supabase-CPKAvC6y.js` at `200.97 kB` (`51.99 kB` gzip), `dist/assets/index-ChwFz3Ia.js` at `160.69 kB` (`40.71 kB` gzip), and `dist/assets/vendor-react-CGTIOkUr.js` at `142.62 kB` (`45.76 kB` gzip).
- `pnpm run lint` warnings on 2026-06-08 are still limited to:
  - `src/pages/admin/AdminCommissionPlans.tsx`
  - `src/pages/admin/AdminPayments.tsx`
  - `src/pages/admin/AdminPayouts.tsx`
  - `src/pages/client/ClientPayments.tsx`
  - `src/pages/client/ClientTargets.tsx`
- Current-head GitHub workflow evidence on 2026-06-08:
  - `QA` run `27112822759` passed for commit `4402ace`.
  - DreamHost deploy run `27112822754` passed for commit `4402ace`.
  - `E2E Smoke` run `27112837432` failed before Playwright route navigation because `QA_EXTENSION_API_BASE_URL` was missing while `QA_EXTENSION_API_EXPECTATION=required`.
- Local preview could not stay on the required port:
  - `pnpm exec vite preview --host 127.0.0.1 --port 8080` reported `Port 8080 is in use, trying another one...` and attempted `8081`, which is out of bounds for this repo's required local-test port.
  - `lsof -nP -iTCP:8080 -sTCP:LISTEN` showed two existing `node` listeners already bound to port `8080`.
- Live Supabase checks on 2026-06-08 via the generic connector fallback:
  - Project URL verified as `https://vaoqvtxqvbptyxddpoju.supabase.co`.
  - `public.performance_metric_events` currently holds `62,808` rows across `50` distinct routes, with the most recent sample at `2026-06-08 07:44:16+00`.
  - 7-day route telemetry shows p75 LCP of `2036 ms` on `/client/dashboard`, `2000 ms` on `/client/reports`, `1944 ms` on `/client/exports`, `1932 ms` on `/bum/reports`, `1888 ms` on `/admin`, and `1656 ms` on `/admin/performance`.
  - Recent edge-function logs still include accepted `performance-beacon` `POST 202` events.
- Current performance advisors still flag:
  - Many `unindexed_foreign_keys` findings across the schema, including admin email, audit, payout, claim-invoice, and other workflow tables.
  - `multiple_permissive_policies` on route-relevant tables including `opportunity_registrations`, `profiles`, `reverse_opportunities`, `teams_meetings`, `opportunity_questions`, and `training_materials`.

## Watchlist

- `public.performance_metric_events` has grown to `62,808` rows; `/admin/performance` no longer uses it as a raw-row browser workload, but any future drill-down should remain admin-only and bounded.
- The largest remaining emitted browser asset is still the generic `vendor` chunk at `487.54 kB` (`141.16 kB` gzip). Without a bundle analyzer or authenticated waterfall, keep this as a measured watch item rather than guessing which sub-libraries belong in the next split.
- The required local preview path on `127.0.0.1:8080` is still unavailable because the port is already occupied on this machine, and current-head hosted E2E still fails before route navigation. Authenticated browser timing evidence therefore remains blocked in this session.

## Current Standards And Time-Sensitive Notes

- [web.dev LCP](https://web.dev/articles/lcp) still defines good LCP as `2.5 s` or less at the 75th percentile. The page was last updated on September 4, 2025.
- [web.dev Optimize LCP](https://web.dev/articles/optimize-lcp?author=kipp) still recommends breaking LCP into subparts so teams can distinguish network, resource-discovery, and render delays. The page was last updated on March 31, 2025.
- [web.dev Optimize long tasks](https://web.dev/articles/optimize-long-tasks?authuser=6) still frames long tasks as any main-thread task over `50 ms`, which reinforces reducing startup JS and breaking up client-side shaping work. The page was last updated on December 19, 2024.
- [React Router future flags](https://reactrouter.com/upgrading/future) still recommends adopting future flags incrementally before the next major upgrade. This repo has already landed the currently relevant app/test future-flag work.
- [Vite 7.0 is out](https://vite.dev/blog/announcing-vite7) is still the current official major-release announcement from June 24, 2025. It raised the Node requirement to `20.19+` or `22.12+` and changed default browser targets, so any repo upgrade from Vite 5.x should stay isolated from the current route-data performance queue.

## Access Requests And Evidence Gaps

Material missing access, production/staging telemetry, traces, query plans, Supabase advisors, authenticated routes, or other evidence needed for a stronger performance review. Mirror durable requests in `docs/consultant-access-needs.md`.

- This session had live generic Supabase connector access for project URL verification, performance advisors, aggregate SQL against `performance_metric_events`, and edge-function logs. The project-scoped `mcp__supabase_trustedbums` path was not available in this session, so this run used the generic project-id fallback and verified the URL before treating the evidence as current.
- No fresh Lighthouse artifact set, bundle-analyzer report, or authenticated browser waterfall was available in this run.
- No authenticated route walkthrough ran in the browser because the required local preview on port `8080` was already occupied by other local listeners, and current-head hosted `E2E Smoke` failed before Playwright navigation due to missing `QA_EXTENSION_API_BASE_URL`.
- Current-head hosted route proof for `/admin/performance` is still missing even though the aggregate-only backend path is live.

## Agent Inputs

- Date of run: 2026-06-08
- Files, tests, routes, screenshots, measurements, Supabase MCP queries/advisors, internet sources, access sources, or commands reviewed:
  - Reviewed `docs/agents/automation-prompts/trusted-bums-daily-performance-engineer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/codex-edit-log.md`, previous `docs/performance-engineering-backlog.md`, `package.json`, `vite.config.ts`, `src/App.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/components/reports/ReportsWorkspace.tsx`, `src/pages/admin/AdminPerformanceMetrics.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientReports.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/bum/BumReports.tsx`, and `src/lib/portalApi.ts`.
  - Reviewed recent scoped changes with `git log --since='2026-06-07 00:00' --oneline -- docs/performance-engineering-backlog.md docs/consultant-access-needs.md docs/codex-edit-log.md src/App.tsx src/components/PortalGlobalSearch.tsx src/pages/admin/AdminPerformanceMetrics.tsx src/pages/client/ClientDashboard.tsx src/pages/client/ClientReports.tsx src/pages/client/ClientExports.tsx src/pages/bum/BumReports.tsx src/lib/portalApi.ts vite.config.ts package.json`.
  - Ran `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run qa`, `pnpm exec vite preview --host 127.0.0.1 --port 8080`, and `lsof -nP -iTCP:8080 -sTCP:LISTEN`.
  - Queried `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 8 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --json jobs`, and `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --job 80013874698 --log-failed`.
  - Queried the generic Supabase connector fallback: `_get_project_url`, `_get_advisors(type: performance)`, `_execute_sql` for `performance_metric_events` counts and 7-day route aggregates, and `_get_logs(service: "edge-function")` for recent `performance-beacon` traffic.
  - Reviewed current official guidance from web.dev LCP, web.dev Optimize LCP, web.dev Optimize long tasks, React Router future flags, Vite features/build docs, and the Vite 7 announcement.
- Checks that could not run and why:
  - No local browser walkthrough ran on the required repo port because `8080` was already occupied by other local Node listeners and the preview server tried to move to `8081`, which this automation should not use for Trusted Bums.
  - No current-head authenticated route timing proof was available because hosted `E2E Smoke` failed during extension preflight before Playwright route navigation.
  - No Lighthouse artifact set, bundle-analyzer output, or query-plan style database evidence was available in-session.
