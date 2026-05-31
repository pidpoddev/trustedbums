# Trusted Bums Performance Engineering Backlog

_Last updated: 2026-05-31 by Codex daily performance engineer automation._

## Executive Read

The clearest current frontend bottleneck is still startup JavaScript. `pnpm run build` on 2026-05-31 produced one app bundle at `dist/assets/index-e0SZYxT_.js` with `1,957.35 kB` minified and `512.39 kB` gzip, and Vite emitted the large-chunk warning. `src/App.tsx` still statically imports the full public, admin, client, and Bum route tree, so every session pays for code most users never execute.

Live telemetry is materially stronger than it was on the prior run. Supabase now shows `2,355` `performance_metric_events` rows across `42` routes and `1` origin in the last 7 days, and recent `performance-beacon` edge-function logs show steady `202` writes with execution time typically around `0.05s` to `0.32s`, with one observed outlier at `0.665s`. Current RUM pressure is concentrated on authenticated client routes: `/client/trainings` p75 `LCP` is about `10.7s` across `3` samples, `/client/bum-directory` is about `7.3s` across `3`, `/client/targets` is about `5.5s` across `11`, `/client/dashboard` is about `3.3s` across `110`, and `/client/payments` is about `3.0s` across `9`.

Source review still points to whole-list fetching and client-side shaping as the common cause. The client dashboard, targets, payments, reports, and global search experiences all fetch broad Supabase lists, then derive summaries, filtering, and pagination in the browser. Supabase performance advisors are now callable and support backend follow-up, but this session still lacks query plans, `pg_stat_statements`, Lighthouse traces, and network waterfalls.

## Active Recommendations

### P0 - Split route groups and heavy leaves out of the startup bundle
- Evidence: `pnpm run build` on 2026-05-31 emitted `dist/assets/index-e0SZYxT_.js` at `1,957.35 kB` minified and `512.39 kB` gzip, with Vite warning that chunks exceed `500 kB`. `src/App.tsx` still statically imports the full route tree, and `src/components/reports/ReportsWorkspace.tsx` still statically imports `recharts`.
- Why it matters: Large startup JS raises parse, compile, and execution cost before the first meaningful paint and increases the risk that every authenticated route inherits the same avoidable latency.
- Recommendation: Convert top-level admin, client, and Bum route groups plus heavy leaves such as reports and troubleshooting screens to module-scope `React.lazy` with `Suspense`. Keep lazy declarations at module scope so the React Router `v7_startTransition` migration path remains compatible.
- Acceptance criteria: Production build no longer emits a single monolithic app chunk, no emitted JS chunk exceeds `500 kB` minified, and initial gzip JS is lower than the current `512.39 kB` baseline.

### P1 - Replace client portal whole-list fetches with route-scoped summaries, server filtering, and server pagination
- Evidence: Live RUM now shows the worst sustained LCP on `/client/trainings` (`10.7s` p75, `3` samples), `/client/bum-directory` (`7.3s`, `3` samples), `/client/targets` (`5.5s`, `11` samples), `/client/dashboard` (`3.3s`, `110` samples), and `/client/payments` (`3.0s`, `9` samples). In code, `src/pages/client/ClientDashboard.tsx` mounts up to four broad list queries and computes counts locally, `src/pages/client/ClientTargets.tsx` fetches all targets then filters and paginates in the browser, and `src/pages/client/ClientPayments.tsx` fetches all claims, payment reports, and invoices before client-side filtering.
- Why it matters: These routes do extra network transfer, memory allocation, and main-thread work even when the user only needs a small summary or the first page of results.
- Recommendation: Introduce route-specific summary queries for dashboard cards, move searchable table routes to server-side filtering and page limits, and fetch only the current page or selected subset for payments, targets, training, and Bum directory views.
- Acceptance criteria: `/client/dashboard` loads summary counts without downloading full working sets, `/client/targets` and `/client/payments` request filtered paginated results from Supabase instead of whole lists, and follow-up RUM shows each of those routes below the current p75 LCP baselines.

### P1 - Stop report routes from fetching every dataset before the user selects a report
- Evidence: `src/pages/admin/AdminReports.tsx` mounts `14` queries on entry, `src/pages/client/ClientReports.tsx` mounts up to `6`, and `src/pages/bum/BumReports.tsx` mounts `5`. Those queries still call broad helpers in `src/lib/portalApi.ts` such as `listCompanies()`, `listCustomerTargets()`, `listOpportunityRegistrations()`, `listOpportunityClaims()`, `listCustomerPaymentReports()`, and `listClaimInvoices()`. Live RUM now shows `/admin/reports` p75 `LCP` about `3.1s` across `9` samples, and fresh Playwright coverage on 2026-05-31 confirms the client admin reports route is currently reachable in QA.
- Why it matters: Report entry cost scales with data volume, even if the user only opens one report, and the static `recharts` dependency increases the amount of JS pulled into the first render path.
- Recommendation: Land each reports page on a lightweight default summary, fetch only the selected report's dataset, and load chart code only when a chart-capable report is opened.
- Acceptance criteria: Entering `/admin/reports`, `/client/reports`, or `/bum/reports` triggers only the default visible report query, selecting another report issues a scoped follow-up request, and chart code does not load until a chart view is actually opened.

### P1 - Replace global-search focus prefetching with explicit server-side search
- Evidence: `src/components/PortalGlobalSearch.tsx` sets `shouldFetchSearchData` to true whenever the control is focused, opened on mobile, or has a two-character query, then mounts up to `14` queries depending on role. Those queries call broad helpers including `listCompanies()` (`select("*")`), `listCustomerTargets()`, `listOpportunityRegistrations()`, `listOpportunityClaims()`, `listConversationThreads()`, and `listTrainingMaterialsForUser()`. Live `pg_stat_user_tables` on 2026-05-31 still shows high sequential-read pressure on tables that this search path touches, including `companies` at `212562` seq scans and `opportunity_registrations` at `5982`.
- Why it matters: Opening search should not preload much of the portal dataset. The current design burns Supabase reads and browser work on intent that may never turn into a real search.
- Recommendation: Gate fetches on an explicit typed query with debounce and minimum length, reduce select lists, cap per-entity results, and prefer dedicated RPC or search endpoints for mixed-entity results rather than client-side filtering over full lists.
- Acceptance criteria: Opening search without a term triggers no broad preload, typing a term issues only scoped server-side search requests, and search no longer mounts the current whole-table query set on focus alone.

### P2 - Prioritize high-traffic Supabase advisor fixes once query-plan evidence is available
- Evidence: Supabase performance advisors on 2026-05-31 flag many unindexed foreign keys and multiple permissive-policy warnings. Relevant examples for current portal traffic include missing foreign-key indexes on `claim_invoices.customer_payment_report_id`, `claim_invoices.opportunity_registration_id`, `bum_contacts.customer_target_id`, `bum_payouts.opportunity_claim_id`, and `admin_email_deliveries.campaign_id`. Advisors also flag multiple permissive policies on frequently-read tables such as `profiles`, `opportunity_registrations`, `reverse_opportunities`, `teams_meetings`, and `training_materials`.
- Why it matters: These issues can add avoidable planner and policy-evaluation cost as traffic grows, but the session still lacks per-query timing to prove which advisor items are hurting the current slow routes most.
- Recommendation: Pull query plans and `pg_stat_statements`, then fix the advisor items that overlap with the authenticated client hotspots and the broad list helpers used by search, dashboard, payments, and reports.
- Acceptance criteria: Query-plan evidence exists for the slowest route-backed statements, the highest-impact missing indexes are added, redundant permissive policies are consolidated where business rules allow, and advisor noise is reduced for the affected high-traffic tables.

## Measurement Notes

- `pnpm run build` passed on 2026-05-31 in about `1m 21s`.
- Current production bundle output:
  - `dist/index.html`: `1.48 kB` (`0.55 kB` gzip)
  - `dist/assets/index-BH_M0tg9.css`: `88.55 kB` (`15.38 kB` gzip)
  - `dist/assets/index-e0SZYxT_.js`: `1,957.35 kB` (`512.39 kB` gzip)
- `pnpm run lint` passed with `7` warnings and `0` errors. The warnings are the existing `react-hooks/exhaustive-deps` findings in `src/pages/admin/AdminCommissionPlans.tsx`, `src/pages/admin/AdminPayments.tsx`, `src/pages/admin/AdminPayouts.tsx`, `src/pages/client/ClientPayments.tsx`, and `src/pages/client/ClientTargets.tsx`.
- `pnpm run test` passed: `6` files and `24` tests.
- `set -a; source .env.qa; set +a; pnpm run qa:env` passed on 2026-05-31, which means the current QA env contract works when variables are exported before invoking the verifier.
- `pnpm exec playwright test tests/e2e/visual-ui-audit.spec.ts --project=chromium --grep "client admin portal pages render cleanly"` passed on 2026-05-31 in about `2.4m`, giving fresh authenticated route coverage for `/client/dashboard`, `/client/targets`, `/client/opportunities/new`, `/client/bum-directory`, `/client/trainings`, `/client/requests`, `/client/payments`, `/client/exports`, `/client/reports`, `/client/profile`, and `/client/agreements`.
- Live Supabase SQL on 2026-05-31 shows `2,355` `performance_metric_events` rows across `42` distinct routes and `1` distinct origin in the last 7 days.
- Current RUM hotspots from the same SQL sample:
  - `/client/trainings` p75 `LCP` about `10700 ms` across `3` samples
  - `/client/bum-directory` p75 `LCP` about `7328 ms` across `3` samples
  - `/client/targets` p75 `LCP` about `5504 ms` across `11` samples
  - `/client/dashboard` p75 `LCP` about `3264 ms` across `110` samples
  - `/admin/reports` p75 `LCP` about `3092 ms` across `9` samples
  - `/client/payments` p75 `LCP` about `2956 ms` across `9` samples
- Current backend read pressure from `pg_stat_user_tables` still clusters around broad lookup tables:
  - `companies`: `212562` seq scans and `18,440,541` rows read
  - `profiles`: `76064` seq scans and `587,779` rows read
  - `opportunity_registrations`: `5982` seq scans and `553,341` rows read
  - `customer_targets`: `4387` seq scans and `301,687` rows read
- Recent Supabase edge-function logs show repeated `performance-beacon` `POST 202` writes with execution time commonly between `48 ms` and `318 ms`, plus one observed `665 ms` outlier in the sampled window.

## Watchlist

- `src/test/routeGuards.test.tsx` still emits React Router future-flag warnings for `v7_startTransition` and `v7_relativeSplatPath`; bundle splitting work should be paired with the `v7_startTransition` opt-in instead of creating a separate migration pass.
- `public/downloads/trusted-bums-bum-welcome-line-animation.webm` is still a `1.53 MB` deploy asset, and `rg` only finds it referenced from `public/video-assets/trusted-bums-bum-welcome-line-animation.html`, not from `src/`. Keep it as deployment-weight watchlist work unless a real route starts serving it.
- Homepage RUM remains mixed. `/` is still much healthier than the authenticated client hotspots, so public homepage optimization should stay behind the authenticated route work until new traces show otherwise.

## Current Standards And Time-Sensitive Notes

- [web.dev LCP guidance](https://web.dev/articles/lcp?hl=en) still defines good LCP as `2.5s` or less at the 75th percentile and was last updated on 2025-09-04.
- [web.dev INP guidance](https://web.dev/articles/optimize-inp) still defines good INP as `200 ms` or less at the 75th percentile and was last updated on 2025-09-02.
- [React Router future-flag guidance](https://reactrouter.com/en/v6/upgrading/future) still recommends opting into `v7_startTransition` before upgrading and explicitly warns that `React.lazy` should live at module scope.
- [Vite release policy](https://vite.dev/releases) says regular fixes ship on `vite@8.0`, important fixes and security patches are backported to `vite@7.3`, security patches are backported to `vite@6.4`, and versions before those ranges are unsupported. This repo is still building on installed `vite@5.4.21`.
- [Vite 8's release note](https://vite.dev/blog/announcing-vite8) says Vite 8 requires Node `20.19+` or `22.12+` and ships alongside `@vitejs/plugin-react` v6, so any build-tool upgrade should be planned with a Node runtime check.
- `pnpm outdated` on 2026-05-31 shows the repo is behind current releases on several performance-relevant packages, including `vite` (`5.4.21` -> `8.0.14`), `@vitejs/plugin-react` (`5.1.0` -> `6.0.2`), `react-router-dom` (`6.30.3` -> `7.16.0`), `recharts` (`2.15.4` -> `3.8.1`), `@supabase/supabase-js` (`2.105.4` -> `2.106.2`), and `@tanstack/react-query` (`5.100.10` -> `5.100.14`).
- [Supabase's April 28, 2026 Data API change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) means new public-schema tables are moving to explicit exposure by default on newer projects. That does not explain current route slowness here, but it is relevant to future performance instrumentation or reporting tables added later.
- [Supabase's May 8, 2026 Node 20 deprecation notice](https://supabase.com/changelog) is now active guidance for future function/runtime upgrades, so build-tool and Supabase runtime planning should not assume long-term Node 20 support.

## Access Requests And Evidence Gaps

Material missing access, production/staging telemetry, traces, query plans, Supabase advisors, authenticated routes, or other evidence needed for a stronger performance review. Mirror durable requests in `docs/consultant-access-needs.md`.

- No production or staging Lighthouse runs, bundle-analyzer artifacts, or representative browser network traces were available, so route prioritization is still a mix of source review, build output, and field telemetry rather than field-plus-lab correlation.
- Supabase performance advisors, read-only SQL, and edge-function logs were available, but there is still no query-plan output, no `pg_stat_statements`, and no slow-query history to connect the slowest routes to exact backend statements.
- Current RUM coverage is still single-origin. There is no verified staging or preview telemetry and no explicit origin inventory proving whether non-production beacon writes should exist.
- Only one fresh authenticated Playwright audit was run in this session, focused on client admin portal pages. Equivalent current route evidence is still missing for admin, client finance, client member, and Bum role performance walkthroughs.

## Agent Inputs

- Date of run: 2026-05-31
- Files, tests, routes, screenshots, measurements, Supabase sources, internet sources, access sources, or commands reviewed:
  - Reviewed `docs/consultant-team-rules.md`, `docs/consultant-access-needs.md`, previous `docs/performance-engineering-backlog.md`, `package.json`, `playwright.config.ts`, `scripts/verify-qa-env.mjs`, `src/App.tsx`, `src/components/PerformanceMonitoring.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/components/reports/ReportsWorkspace.tsx`, `src/pages/admin/AdminReports.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientTargets.tsx`, `src/pages/client/ClientPayments.tsx`, `src/pages/client/ClientReports.tsx`, `src/pages/bum/BumReports.tsx`, `src/pages/admin/AdminPerformanceMetrics.tsx`, and relevant list helpers in `src/lib/portalApi.ts`.
  - Reviewed recent changes with `git log --since='7 days ago' --name-only --pretty=format:'COMMIT %h %ad %s' --date=short`.
  - Inspected `dist/assets` output and the largest `public/` assets.
  - Ran `pnpm run build`, `pnpm run lint`, `pnpm run test`, `set -a; source .env.qa; set +a; pnpm run qa:env`, `pnpm outdated vite @vitejs/plugin-react react-router-dom @tanstack/react-query recharts @supabase/supabase-js --format json`, targeted `rg`, `sed`, `find`, `stat`, and `curl https://supabase.com/changelog.md`.
  - Ran `pnpm exec playwright test tests/e2e/visual-ui-audit.spec.ts --project=chromium --grep "client admin portal pages render cleanly"`.
  - Queried Supabase performance advisors, `public.performance_metric_events` aggregates, route-level p75 metric summaries, `pg_stat_user_tables`, and recent edge-function logs for project `vaoqvtxqvbptyxddpoju`.
  - Reviewed current guidance from [web.dev LCP](https://web.dev/articles/lcp?hl=en), [web.dev INP](https://web.dev/articles/optimize-inp), [React Router future flags](https://reactrouter.com/en/v6/upgrading/future), [Vite releases](https://vite.dev/releases), [Vite 8 announcement](https://vite.dev/blog/announcing-vite8), and [Supabase Data API exposure change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).
- Checks that could not run and why:
  - No Lighthouse artifact set, bundle-analyzer output, or browser network waterfall was available in this session.
  - No query plans or `pg_stat_statements` were exposed for the live Supabase project.
  - No fresh authenticated performance walkthrough ran for admin, client finance, client member, or Bum roles in this run.
