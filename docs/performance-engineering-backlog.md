# Trusted Bums Performance Engineering Backlog

_Last updated: 2026-06-08 by Codex daily performance engineer automation._

## Executive Read

Current `main` head `9f42bf4` does not have a performance-specific failure signal. Local `corepack pnpm run qa` is green with `100` tests across `27` files and a successful production build, DreamHost deploy run `27178512660` passed, and hosted `E2E Smoke` run `27178530411` passed. The current hosted `QA` failure on run `27178512695` is a documentation/test-contract regression in `src/test/scrumQueueRegression.test.ts`, not a measured runtime slowdown.

Startup and public-route splitting remain in good shape. `src/App.tsx` still lazy-loads the major route groups, `vite.config.ts` still applies deliberate vendor chunking, and the latest build emitted separate public chunks for `Index` (`22.15 kB`) and `BumLanding` (`11.19 kB`) without the older Vite large-chunk warning. The largest remaining browser payload is still the catch-all `vendor` chunk at `487.52 kB` (`141.16 kB` gzip), so the next meaningful wins are more likely to come from reducing authenticated route fan-out than from broad startup rewrites.

The highest-value active pressure is still source-evident in shared portal routes: `PortalGlobalSearch`, `ClientDashboard`, `ClientReports`, `ClientExports`, `BumReports`, and `AdminReports` all fetch broad datasets and then summarize, filter, or export in the browser. This session could not re-run the earlier SQL-backed route aggregates because the callable Supabase tool surface exposed advisors, logs, URL verification, and edge-function inventory, but not the execute-SQL path. Treat the older 2026-06-08 route p75 figures as historical until live SQL or trace access returns.

Live backend evidence remains strong enough to keep telemetry work active. Project URL verification still matches `https://vaoqvtxqvbptyxddpoju.supabase.co`, recent edge-function logs still show `performance-beacon` version `3` accepting `POST 202` writes, and current performance advisors still flag route-relevant database debt. The new `admin_scrum_items` table joined that advisor set immediately, which means the current admin scrum rollout should be kept small and indexed before its data volume grows.

## Active Recommendations

### P1 - [TB-0047] Replace whole-list dashboard, report, and export loading with server-scoped summaries and bounded reads
- Evidence: `src/pages/client/ClientDashboard.tsx` still issues parallel list queries for opportunities, targets, payment reports, invoices, reverse opportunities, and target responses, then derives counts and next-action state in React. `src/pages/client/ClientReports.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/bum/BumReports.tsx`, and `src/pages/admin/AdminReports.tsx` still hydrate broad datasets and build report/export rows entirely in the browser. `src/lib/portalApi.ts` still exposes broad list helpers such as `listCompanies()` with `select("*")`, plus route-wide list functions consumed by these report surfaces.
- Why it matters: These routes are paying transfer, RLS, memory, and client-side shaping cost up front on shared authenticated pages where perceived speed matters more than developer convenience.
- Recommendation: Introduce role-scoped summary queries or RPCs for dashboard cards and report landing views, and move list pages and export flows to bounded pagination, filters, or server-generated exports instead of whole-list hydration.
- Acceptance criteria: Dashboard cards stop depending on full-table list reads; report pages request only the bounded rows they render; export flows no longer require hydrating the full matching dataset in-page; and a follow-up trace or live aggregate read shows lower transfer and scripting work on the targeted portal routes.

### P1 - [TB-0048] Stop portal search from warming large multi-query datasets in persistent chrome
- Evidence: `src/components/PortalGlobalSearch.tsx` still enables up to `14` role-dependent `useQuery` calls when the field is focused, the mobile sheet opens, or the query reaches two characters. The search fan-out still pulls from helpers such as `listCompanies`, `listCustomerTargets`, `listOpportunityClaims`, `listProfiles`, `listConversationThreads`, `listVisibleBumProfiles`, and training/reporting sources, then filters client-side. The search component is still mounted in the admin, client, and Bum layouts.
- Why it matters: Search is part of shared portal chrome, so a focus event or mobile-sheet open can add avoidable network, RLS, and memory cost to unrelated route visits before the user has committed to a real search.
- Recommendation: Replace the current fan-out model with a scoped search endpoint or per-role capped search queries that require a real term and return only top matches for each category.
- Acceptance criteria: Focusing the search field or opening the mobile sheet no longer triggers broad background loads; category searches are term-scoped and capped server-side; and authenticated routes show measurably less network and scripting work when opening search.

### P2 - [TB-0049] Clear advisor-backed index debt on newly active admin tables before the admin scrum queue grows
- Evidence: Live Supabase performance advisors in this run still flag many `unindexed_foreign_keys` findings, including new warnings on `public.admin_scrum_items` for `admin_scrum_items_created_by_fkey` and `admin_scrum_items_updated_by_fkey`, alongside the existing `admin_email_*` index debt. `src/pages/admin/AdminScrumTracker.tsx` currently reads the full scrum-item list and filters client-side, and `src/lib/portalApi.ts` still uses `select("*")` for `listAdminScrumItems()`.
- Why it matters: Admin-only does not make the queue free. The new scrum surface and existing admin email surfaces can accumulate slow scans and noisy advisor debt quickly because they are operational tables that will only grow.
- Recommendation: Add covering indexes for the current high-use admin foreign keys, starting with `admin_scrum_items` and the active `admin_email_*` tables, and move stable sort/filter behavior server-side where the UI already has clear filters.
- Acceptance criteria: The prioritized admin scrum and admin email foreign-key warnings are cleared or explicitly waived with reason, and the admin scrum list no longer depends on an unbounded full-table fetch for routine filtering.

### P2 - [TB-0050] Capture authenticated timing proof for aggregate telemetry routes now that local `8080` preview is available again
- Evidence: `src/pages/admin/AdminPerformanceMetrics.tsx` still reads only `listPerformanceMetricSummaries()` and `listPerformanceMetricRouteSummaries()` for the main cards and route table, and live edge logs confirm current `performance-beacon` `POST 202` traffic. `pnpm exec vite preview --host 127.0.0.1 --port 8080` now serves successfully on the required local port again, so the prior `8080 occupied` blocker is no longer current. This session still did not have authenticated browser timing or trace proof for `/admin/performance` or the heavier shared portal routes.
- Why it matters: The aggregate-only telemetry path is shipped, but performance claims about the deployed admin route and shared authenticated surfaces are still inferred from code and logs rather than observed end-user timing.
- Recommendation: Run one narrow authenticated browser trace or smoke capture that loads `/admin/performance`, exercises its filters, and captures at least one shared authenticated route such as `/client/reports`, `/client/exports`, or search-open behavior on current head.
- Acceptance criteria: Current-head authenticated evidence reaches `/admin/performance`, confirms aggregate cards and route rows render without raw-event hydration, and records a trace, waterfall, or equivalent timing artifact for one shared portal route in QA or release evidence.

## Measurement Notes

- `corepack pnpm run qa` passed on 2026-06-08:
  - Vitest passed `100` tests across `27` files.
  - Production build passed.
  - The largest emitted browser assets were `dist/assets/vendor-CHdATByo.js` at `487.52 kB` (`141.16 kB` gzip), `dist/assets/vendor-supabase-Do-SqqqA.js` at `200.97 kB` (`51.99 kB` gzip), `dist/assets/index-DSEEcJbu.js` at `166.53 kB` (`42.52 kB` gzip), `dist/assets/vendor-react-CGTIOkUr.js` at `142.62 kB` (`45.76 kB` gzip), and `dist/assets/vendor-radix-DIvCKyVc.js` at `121.01 kB` (`35.39 kB` gzip).
  - Public split chunks remain small relative to the authenticated shell: `dist/assets/Index-C3XlSELS.js` is `22.15 kB`, `dist/assets/BumLanding-rNjfDPaF.js` is `11.19 kB`, and `dist/assets/AdminPerformanceMetrics-Dn1FmOEo.js` is `6.38 kB`.
- Local preview on the required repo port is healthy again:
  - `pnpm exec vite preview --host 127.0.0.1 --port 8080` served successfully at `http://127.0.0.1:8080/`.
  - `lsof -nP -iTCP:8080 -sTCP:LISTEN` returned no competing listener before the preview start.
- Current-head GitHub workflow evidence for `9f42bf4`:
  - DreamHost deploy run `27178512660`: passed.
  - `E2E Smoke` run `27178530411`: passed.
  - `QA` run `27178512695`: failed in `src/test/scrumQueueRegression.test.ts` because the checked-in `docs/qa-test-backlog.md` at that commit no longer contained the seeded-proof section names the test expects. This is a release-doc contract failure, not a measured runtime performance regression.
- Live Supabase checks in this session:
  - Project URL verified as `https://vaoqvtxqvbptyxddpoju.supabase.co`.
  - Performance advisors still report `unindexed_foreign_keys` across the schema, including `admin_scrum_items`, `admin_email_*`, `audit_events`, `bum_contacts`, `bum_payouts`, `bum_saved_items`, and `claim_invoices`.
  - Performance advisors still report `multiple_permissive_policies` on route-relevant tables including `opportunity_registrations`, `opportunity_questions`, `profiles`, `reverse_opportunities`, `teams_meetings`, `terms_assignments`, and `training_materials`.
  - Recent edge-function logs still show accepted `performance-beacon` `POST 202` traffic on version `3`.
- Historical same-day telemetry note:
  - Earlier on 2026-06-08, a live SQL-backed run recorded `62,808` `performance_metric_events` rows across `50` routes and showed the closest authenticated p75 LCP pressure on `/client/dashboard`, `/client/reports`, `/client/exports`, `/bum/reports`, and `/admin/performance`.
  - This session could not re-run that SQL path, so those exact counts and p75 values should be treated as historical evidence, not freshly reverified current telemetry.

## Watchlist

- The generic `vendor` chunk remains the largest browser payload at `487.52 kB` (`141.16 kB` gzip). Without a bundle analyzer or authenticated waterfall, keep it as a measured watch item rather than guessing which library should move next.
- `AdminScrumTracker` shipped as a new `13.95 kB` route chunk and currently depends on a full-table fetch plus client-side filtering. Keep it small and indexed before it becomes another admin-heavy list page.
- The earlier SQL-backed telemetry pointed to `/client/dashboard`, `/client/reports`, `/client/exports`, and `/bum/reports` as the most likely authenticated hotspots. Re-check those routes first when live SQL aggregates or authenticated trace access returns.

## Current Standards And Time-Sensitive Notes

- [web.dev LCP](https://web.dev/articles/lcp) still defines good LCP as `2.5 s` or less at the 75th percentile. The article was last updated on September 4, 2025.
- [web.dev Optimize LCP](https://web.dev/articles/optimize-lcp?author=kipp) still recommends breaking LCP into subparts so teams can distinguish network, discovery, and render delay. The article was last updated on March 31, 2025.
- [web.dev Optimize long tasks](https://web.dev/articles/optimize-long-tasks?authuser=6) still defines long tasks as main-thread tasks over `50 ms`, which reinforces reducing client-side shaping work and breaking up synchronous work on shared portal routes. The article was last updated on December 19, 2024.
- [React Router future flags](https://reactrouter.com/upgrading/future) still recommends incremental adoption ahead of the next major upgrade. This repo already has the currently relevant `v7_startTransition` and `v7_relativeSplatPath` flags enabled.
- [Vite 7.0 is out](https://vite.dev/blog/announcing-vite7) remains the current official major-release announcement from June 24, 2025. Any upgrade from the repo's Vite 5 line should stay isolated from the current route-data and query-shape performance queue.

## Access Requests And Evidence Gaps

Material missing access, production/staging telemetry, traces, query plans, Supabase advisors, authenticated routes, or other evidence needed for a stronger performance review. Mirror durable requests in `docs/consultant-access-needs.md`.

- This session had live Supabase access for project URL verification, performance advisors, edge-function inventory, and edge-function logs, but not for execute-SQL route aggregates or query-plan inspection. That means current recommendations are source-, build-, advisor-, and log-backed rather than freshly SQL-backed.
- No fresh Lighthouse artifact set, bundle-analyzer report, or authenticated browser waterfall was available in this run.
- No authenticated route walkthrough ran in the browser. The missing blocker is now credentialed session access, not local port availability, because the required local preview on `127.0.0.1:8080` now serves correctly again.
- Current-head product-facing route proof for `/admin/performance` and the heavier shared portal routes is still missing even though the aggregate-only backend path and live beacon ingestion are current.

## Agent Inputs

- Date of run: 2026-06-08
- Files, tests, routes, screenshots, measurements, Supabase queries/advisors, internet sources, access sources, or commands reviewed:
  - Reviewed `docs/agents/automation-prompts/trusted-bums-daily-performance-engineer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/codex-edit-log.md`, previous `docs/performance-engineering-backlog.md`, `docs/performance-monitoring.md`, `package.json`, `vite.config.ts`, `src/App.tsx`, `src/components/PerformanceMonitoring.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/pages/admin/AdminPerformanceMetrics.tsx`, `src/pages/admin/AdminReports.tsx`, `src/pages/admin/AdminScrumTracker.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientReports.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/bum/BumReports.tsx`, `src/layouts/AdminLayout.tsx`, `src/lib/portalApi.ts`, and `src/test/scrumQueueRegression.test.ts`.
  - Reviewed recent repo state with `git status --short` and `git log --oneline -n 12`.
  - Ran `corepack pnpm run qa`, `lsof -nP -iTCP:8080 -sTCP:LISTEN`, and `pnpm exec vite preview --host 127.0.0.1 --port 8080`.
  - Queried `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Visual UI Audit" --limit 8 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27178512695 --json ...`, and `/Users/macdaddy/bin/gh-trustedbums run view 27178512695 --log-failed`.
  - Queried Supabase app tools for `_get_project_url`, `_get_advisors(type: performance)`, `_get_logs(service: "edge-function")`, and `_list_edge_functions` against project `vaoqvtxqvbptyxddpoju`.
  - Reviewed current official guidance from [web.dev LCP](https://web.dev/articles/lcp), [web.dev Optimize LCP](https://web.dev/articles/optimize-lcp?author=kipp), [web.dev Optimize long tasks](https://web.dev/articles/optimize-long-tasks?authuser=6), [React Router future flags](https://reactrouter.com/upgrading/future), and [Vite 7.0 is out](https://vite.dev/blog/announcing-vite7).
- Checks that could not run and why:
  - No authenticated browser timing or route walkthrough ran because this session did not have a ready authenticated browser path for admin or client routes.
  - No current-session SQL aggregate or query-plan inspection ran because the callable Supabase tool surface in this session did not expose the earlier execute-SQL path.
  - No Lighthouse artifact set or bundle-analyzer output was available in-session.
