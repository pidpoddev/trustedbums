# Trusted Bums Performance Engineering Backlog

_Last updated: 2026-06-04 by Codex daily performance engineer automation._

## Executive Read

The highest-confidence performance blocker is still frontend startup cost. Today's `pnpm run build` passed but emitted a single app JavaScript asset, `dist/assets/index-3bFWxhoh.js`, at `1,975.42 kB` minified and `515.90 kB` gzip, with Vite's large-chunk warning. `src/App.tsx` still statically imports the public, admin, client, and Bum route tree, so public visitors and every authenticated role pay for code they may never execute.

The second recurring bottleneck is broad data loading on high-value portal routes. Client dashboard, targets, payments, reports, global search, and Bum report surfaces still fetch broad Supabase lists, then filter, summarize, paginate, or slice in the browser. Prior SQL-backed RUM from 2026-05-31 showed authenticated client LCP pressure on `/client/trainings`, `/client/bum-directory`, `/client/targets`, `/client/dashboard`, and `/client/payments`; this run could not refresh route-level RUM because read-only SQL/query tools were not exposed and local QA env does not provide `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`.

Supabase evidence is partial but useful. The Supabase project `vaoqvtxqvbptyxddpoju` is `ACTIVE_HEALTHY` on Postgres `17.6.1`, performance advisors still flag many unindexed foreign keys and multiple permissive RLS policies, and edge-function logs show active `performance-beacon` writes plus recurring multi-second `sync-teams-attendees` and `sync-teams-transcripts` executions. The latest sampled beacon writes ranged from roughly `159-1204 ms`, while Teams sync jobs commonly ran around `3.2-8.8 s`, so backend tuning should stay focused on user-visible route/query work first and operational sync paths second.

## Active Recommendations

### P0 - Split route groups and heavy leaves out of the startup bundle
- Evidence: `pnpm run build` on 2026-06-04 emitted one JS bundle at `1,975.42 kB` minified and `515.90 kB` gzip, above the 2026-05-31 `512.39 kB` gzip baseline, and Vite warned that chunks exceed `500 kB`. `src/App.tsx` still imports all admin, client, Bum, public, reports, performance, and troubleshooting pages statically. `src/components/reports/ReportsWorkspace.tsx` still statically imports chart code through the report route tree.
- Why it matters: Large startup JS increases transfer, parse, compile, and execution time before the first meaningful route can become interactive. It also makes slow authenticated routes harder to isolate because every role shares the same startup payload.
- Recommendation: Convert top-level admin, client, and Bum route groups plus heavy leaves such as reports, performance metrics, legal/admin tooling, and troubleshooting screens to module-scope `React.lazy` with `Suspense`. Keep lazy declarations at module scope and enable the React Router `v7_startTransition` future flag as part of the same migration check.
- Acceptance criteria: Production build emits separate route chunks, no emitted JS chunk exceeds `500 kB` minified, initial gzip JS falls below the current `515.90 kB` baseline, and route-guard tests no longer emit the `v7_startTransition` warning.

### P1 - Replace client portal whole-list fetches with route-scoped summaries and server pagination
- Evidence: Current code still mounts broad list queries on client routes: `ClientDashboard` fetches opportunity registrations, targets, reverse opportunities, target responses, payment reports, and invoices to compute counts; `ClientTargets` fetches all targets, then filters and paginates locally; `ClientPayments` fetches claims, reports, and invoices, then filters locally. The 2026-05-31 SQL-backed RUM snapshot, not refreshed today, showed p75 LCP above the `2.5s` good threshold on `/client/trainings`, `/client/bum-directory`, `/client/targets`, `/client/dashboard`, and `/client/payments`.
- Why it matters: Whole-list reads increase Supabase transfer, policy evaluation, browser memory, and main-thread work even when the user only needs a summary, a first page, or a filtered view.
- Recommendation: Add route-specific summary helpers or RPCs for dashboard counts and finance totals. Move targets, payments, trainings, and Bum directory views to server-side filters, slim select lists, and page limits. Keep client-side filtering only for the current page of already-scoped results.
- Acceptance criteria: `/client/dashboard` loads counts without downloading full working sets; `/client/targets`, `/client/payments`, `/client/trainings`, and `/client/bum-directory` request filtered/paginated data from Supabase; and follow-up RUM or Lighthouse/network traces show lower transfer volume and p75 LCP below the current route baselines.

### P1 - Stop report routes from fetching every dataset before report selection
- Evidence: `AdminReports` still mounts 14 queries on entry. `ClientReports` mounts up to 6 queries depending on access role. `BumReports` mounts 5 queries, then filters claims and payouts to the current Bum in the browser. These routes call broad helpers such as `listCompanies()`, `listCustomerTargets()`, `listOpportunityRegistrations()`, `listOpportunityClaims()`, `listCustomerPaymentReports()`, `listClaimInvoices()`, `listBumPayouts()`, and `listAuditEvents()`.
- Why it matters: Report entry cost scales with total data volume, not with the report the user is actually reading. This hurts perceived speed and creates avoidable backend read pressure on admin, finance, and Bum reporting workflows.
- Recommendation: Land report pages on a lightweight default summary, fetch only the selected report's dataset, and dynamically load report/chart workspace code only when a chart-capable report is opened. For Bum reports, prefer user-scoped backend queries over fetching global claims/payouts and filtering in the browser.
- Acceptance criteria: Entering `/admin/reports`, `/client/reports`, or `/bum/reports` triggers only the default visible report query; selecting another report issues one scoped follow-up request; Bum report queries are scoped by the current Bum before data reaches the browser; and chart code is absent from the initial route chunk.

### P1 - Replace global-search focus prefetching with explicit server-side search
- Evidence: `PortalGlobalSearch` sets `shouldFetchSearchData` when the input is focused, mobile search opens, or a query reaches two characters. Focus alone can mount broad role-dependent queries across opportunities, targets, companies, contacts, claims, prospects, reverse opportunities, profiles, Bum profiles, conversations, and training materials.
- Why it matters: Opening search should not preload large slices of the portal. The current behavior spends Supabase reads and browser work before the user has expressed a concrete search term.
- Recommendation: Gate remote search on a debounced typed term with a minimum length, reduce select lists, cap per-entity results, and move mixed-entity search to dedicated server-side search helpers or RPCs rather than client-side filtering over full lists.
- Acceptance criteria: Focusing or opening global search with an empty term issues no broad data fetches; typing a valid term issues only scoped server-side search requests; result sets are capped per entity; and search no longer mounts the current whole-table query set on focus.

### P2 - Make performance telemetry reporting aggregate-first before tuning advisor noise
- Evidence: `AdminPerformanceMetrics` calls `listPerformanceMetricEvents({ limit: 500 })`, and `listPerformanceMetricEvents` caps reads at `1000`, then computes p75 and counts in the browser from the most recent raw rows. Supabase performance advisors still flag many unindexed foreign keys and multiple permissive-policy warnings, including tables touched by reports/search such as `claim_invoices`, `bum_contacts`, `bum_payouts`, `profiles`, `opportunity_registrations`, `reverse_opportunities`, `teams_meetings`, and `training_materials`. This run had advisors and logs, but no query plans, `pg_stat_statements`, or refreshed SQL-backed RUM aggregates.
- Why it matters: A raw latest-500 admin view can misstate route p75s as telemetry grows, and advisor lists are too broad to prioritize without tying them to slow routes and statements.
- Recommendation: Add an admin-only aggregate endpoint, view, or RPC that returns route/metric/day p75, sample count, poor count, and origin count over 7/28-day windows. Use that output plus query plans to prioritize only advisor fixes that overlap with slow portal routes and broad list helpers.
- Acceptance criteria: `/admin/performance` displays server-computed p75s by route and metric, not just the latest raw rows; aggregate queries include sample counts and origin counts; slow route recommendations link to exact backend statements or plans; and foreign-key index/policy consolidation work is sequenced by measured route impact.

## Measurement Notes

- `pnpm run build` passed on 2026-06-04 in about `3.90s`.
- Current production bundle output:
  - `dist/index.html`: `1.48 kB` (`0.55 kB` gzip)
  - `dist/assets/index-BH_M0tg9.css`: `88.55 kB` (`15.38 kB` gzip)
  - `dist/assets/index-3bFWxhoh.js`: `1,975.42 kB` (`515.90 kB` gzip)
- `pnpm run lint` passed with `7` warnings and `0` errors. The warnings are the existing `react-hooks/exhaustive-deps` findings in `AdminCommissionPlans`, `AdminPayments`, `AdminPayouts`, `ClientPayments`, and `ClientTargets`.
- `pnpm run test` passed: `10` files and `32` tests. `routeGuards.test.tsx` still emits React Router future-flag warnings for `v7_startTransition` and `v7_relativeSplatPath`.
- `set -a; source .env.qa; set +a; pnpm run qa:env` passed. The same environment does not expose `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`, so a local Supabase client aggregate against `performance_metric_events` could not run.
- Deployed target preflight still failed from this runner: `curl -I -L --max-time 20 "$QA_BASE_URL"` timed out during DNS resolution, and `dig trustedbums.com A` / `AAAA` reported no reachable DNS server. This is runner-visible evidence, not proof of a public outage.
- Supabase MCP project metadata returned `ACTIVE_HEALTHY` for project `vaoqvtxqvbptyxddpoju`, hosted in `us-west-2`, running Postgres `17.6.1`.
- Supabase MCP performance advisors were available and still returned many `unindexed_foreign_keys` and `multiple_permissive_policies` findings. Read-only SQL, query plans, and `pg_stat_statements` were not available in this session.
- Supabase edge-function logs from the last 24 hours showed many `performance-beacon` `POST 202` writes between about `159-1204 ms`, plus recurring `sync-teams-attendees` and `sync-teams-transcripts` jobs commonly around `3.2-8.8 s`. Postgres logs sampled in this run showed normal checkpoint/cron-style entries, not slow-query detail.
- Historical route RUM from 2026-05-31 remains useful but was not refreshed today: live SQL then showed `2,355` `performance_metric_events` rows across `42` routes and one origin in the prior 7 days, with authenticated client LCP hotspots led by `/client/trainings`, `/client/bum-directory`, `/client/targets`, `/client/dashboard`, and `/client/payments`.

## Watchlist

- `public/downloads/trusted-bums-bum-welcome-line-animation.webm` is still a `1.53 MB` deploy asset, and source search only finds it referenced from `public/video-assets/trusted-bums-bum-welcome-line-animation.html`, not app routes. Keep it on deployment-weight watch until a real route serves it.
- `sync-teams-attendees` and `sync-teams-transcripts` are routinely multi-second in current edge-function logs. They are not proven route blockers yet, but they should stay on the operational latency watchlist until query plans and route-level traces can link them to user-facing workflows.
- `performance-beacon` execution time is not currently the main bottleneck, but today's sampled `159-1204 ms` writes warrant monitoring as telemetry volume grows.
- Vite/build-tool upgrades should follow route splitting rather than replace it. Upgrading can improve build speed and support posture, but it will not by itself remove the monolithic app chunk or broad route data loading.

## Current Standards And Time-Sensitive Notes

- web.dev's current LCP article says good LCP is `2.5s` or less at the 75th percentile, segmented across mobile and desktop: https://web.dev/articles/lcp?hl=en.
- web.dev's current INP guidance still frames responsiveness work around keeping the main thread available for interactions: https://web.dev/articles/optimize-inp.
- React Router v6 future-flag guidance for `v7_startTransition` says `React.lazy` should be moved to module scope before opting in: https://reactrouter.com/6.30.4/upgrading/future.
- Vite's supported versions page now lists regular patches for `vite@8.0`, important/security fixes for `vite@7.3`, security fixes for `vite@6.4`, and says older versions are unsupported: https://vite.dev/releases. This repo currently builds with installed `vite@5.4.21`.
- Vite 8 requires Node `20.19+` or `22.12+`, ships with the Rolldown integration, and releases `@vitejs/plugin-react` v6; the Vite announcement notes v5 of the React plugin still works with Vite 8: https://vite.dev/blog/announcing-vite8.
- `pnpm outdated` on 2026-06-04 shows performance-relevant packages behind current releases: `vite` `5.4.21` -> `8.0.16`, `@vitejs/plugin-react` `5.1.0` -> `6.0.2`, `react-router-dom` `6.30.3` -> `7.16.0`, `recharts` `2.15.4` -> `3.8.1`, `@supabase/supabase-js` `2.105.4` -> `2.107.0`, and `@tanstack/react-query` `5.100.10` -> `5.101.0`.
- Supabase introduced a hosted-platform rate limit on recursive or nested Edge Function-to-Edge Function calls on 2026-03-06. That does not appear to explain the current telemetry path, but it is relevant if future sync or reporting work starts chaining functions: https://supabase.com/changelog/43644-edge-functions-rate-limits-on-recursive-nested-edge-functions-calls.

## Access Requests And Evidence Gaps

Material missing access, production/staging telemetry, traces, query plans, Supabase advisors, authenticated routes, or other evidence needed for a stronger performance review. Mirror durable requests in `docs/consultant-access-needs.md`.

- Current production/staging Lighthouse reports, browser network waterfalls, bundle-analyzer artifacts, and authenticated route performance traces are still unavailable.
- Supabase performance advisors and logs are available, but read-only SQL, query plans, `pg_stat_statements`, slow-query history, and telemetry aggregate queries were not exposed in this session.
- Local `.env.qa` passes the current QA contract but lacks `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, so source-local read-only telemetry aggregation could not run.
- Deployed `QA_BASE_URL` still cannot be resolved from this runner. That blocked fresh deployed Lighthouse or authenticated browser performance checks and should remain an access/process blocker, not a product defect, until corroborated externally.
- Current RUM depth is incomplete. The latest route-level p75 values in this backlog are historical from 2026-05-31, while today's live evidence is limited to Supabase project health, advisors, and edge-function logs.
- No fresh authenticated performance walkthrough ran for admin, client admin, client finance, client member, or Bum roles in this run.

## Agent Inputs

- Date of run: 2026-06-04
- Files, tests, routes, screenshots, measurements, Supabase MCP queries/advisors, internet sources, access sources, or commands reviewed:
  - Reviewed `docs/consultant-team-rules.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`, previous `docs/performance-engineering-backlog.md`, `package.json`, `vite.config.ts`, `scripts/verify-qa-env.mjs`, `.env.qa.example`, `src/App.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/components/PerformanceMonitoring.tsx`, `src/components/reports/ReportsWorkspace.tsx`, `src/pages/admin/AdminReports.tsx`, `src/pages/admin/AdminPerformanceMetrics.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientTargets.tsx`, `src/pages/client/ClientPayments.tsx`, `src/pages/client/ClientReports.tsx`, `src/pages/bum/BumReports.tsx`, and relevant helpers in `src/lib/portalApi.ts`.
  - Reviewed recent changes with `git log --since='2026-05-31' --name-only --pretty=format:'COMMIT %h %ad %s' --date=short`.
  - Inspected `dist/assets` output and largest `public/` assets.
  - Ran `pnpm run build`, `pnpm run lint`, `pnpm run test`, `set -a; source .env.qa; set +a; pnpm run qa:env`, `pnpm outdated vite @vitejs/plugin-react react-router-dom @tanstack/react-query recharts @supabase/supabase-js web-vitals --format json`, targeted `rg`, `sed`, `find`, `stat`, `curl`, and `dig`.
  - Attempted a local read-only Supabase telemetry aggregate after sourcing `.env.qa`; it could not run because `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` were not exported in that QA env contract.
  - Queried Supabase MCP project metadata, performance advisors, edge-function logs, and Postgres logs for project `vaoqvtxqvbptyxddpoju`.
  - Reviewed current guidance from web.dev LCP, web.dev INP, React Router v6 future flags, Vite supported releases, Vite 8 announcement, and Supabase changelog.
- Checks that could not run and why:
  - No Lighthouse artifact set, bundle-analyzer report, browser network waterfall, or deployed authenticated performance walkthrough was available.
  - Deployed route checks could not run because `trustedbums.com` DNS resolution timed out from this runner.
  - No live query plans, `pg_stat_statements`, slow-query history, or refreshed route-level RUM SQL aggregates were exposed by the available Supabase tool surface.
