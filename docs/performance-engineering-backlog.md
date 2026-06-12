# Trusted Bums Performance Engineering Backlog

_Last updated: 2026-06-12 by Codex daily performance engineer automation._

## Executive Read

Current `main` head `d360570` has fresh exact-head hosted functional proof. GitHub `QA` run `27371736190`, DreamHost deploy run `27371736211`, and hosted `E2E Smoke` run `27371773276` all succeeded for commit `d36057032de1d354fe925d48ecfaf0e238e6efd3` on 2026-06-11 UTC. The standard `Visual UI Audit` run `27395701277` failed on 2026-06-12 UTC, but the failure log shows the admin scrum page tripped the audit's generic error-page regex on tracker text containing `404`; it did not surface a route-load performance regression.

Live Supabase telemetry remains the strongest current performance evidence. `performance_metric_events` now holds `170,403` rows across `69` routes since 2026-05-29, with `152,579` rows across `68` routes in the last 7 days. Overall 7-day p75 stays inside Core Web Vitals thresholds (`LCP 2156 ms`, `INP 40 ms`, `TTFB 91 ms`), but the same authenticated client-route architecture keeps clustering near the LCP guardrail: `/client/dashboard` now sits at `2440 ms`, `/client/opportunities` at `2301 ms`, `/client/reports` at `2184 ms`, `/client/payments` at `2168 ms`, `/client/targets` at `2156 ms`, and `/client/exports` at `2096 ms` on 30-day p75 LCP.

The highest-value work is still route-shape work, not bundle-only cleanup. Current live row counts remain modest or empty on several of the routes above (`82` opportunity registrations, `81` customer targets, and `0` current rows each in `opportunity_claims`, `reverse_opportunities`, `customer_target_responses`, `teams_meetings`, `claim_invoices`, and `customer_payment_reports`), yet the client shell already spends its LCP budget on broad route-start reads and browser-side shaping. That means the same whole-list pattern is now the active bottleneck even before finance, meetings, and conversation workflows fill in.

## Active Recommendations

### P1 - [TB-0047] Move high-traffic client routes off whole-list hydration and broad list helpers
- Evidence: `src/pages/client/ClientDashboard.tsx` now calls `listOpportunityRegistrations()` plus reverse opportunities, target responses, payment reports, and invoices before first render. `src/pages/client/ClientReports.tsx` still hydrates targets, opportunities, reverse opportunities, payment reports, and invoices before building report models in memory. `src/pages/client/ClientExports.tsx` still hydrates targets, meetings, and payment reports before any export action. The newer `src/pages/client/ClientOpportunityNew.tsx` also loads pay programs, opportunities, claims, target responses, and reverse opportunities at route start. The shared helpers behind those screens still read broad company or whole-table datasets with no route-scoped bounds in `src/lib/portalApi.ts`, including `listOpportunityRegistrations()`, `listOwnOpportunityRegistrations()`, `listCustomerTargets()`, `listOpportunityClaims()`, `listCustomerPaymentReports()`, and `listClaimInvoices()`. Live telemetry now shows `/client/dashboard LCP p75 2440 ms`, `/client/opportunities 2301 ms`, `/client/reports 2184 ms`, `/client/payments 2168 ms`, `/client/targets 2156 ms`, and `/client/exports 2096 ms`.
- Why it matters: The client operational shell is already spending most of its LCP budget while several of the underlying tables are still nearly empty. If these routes keep booting from broad list reads, route latency will scale with marketplace growth instead of with the narrow slice each screen actually needs.
- Recommendation: Replace route-start whole-list reads with route-scoped aggregates, counts, and bounded slices; keep heavy payment and export payloads server-generated or paginated; and narrow the shared helpers so the dashboard, opportunities, reports, payments, targets, and export routes stop paying for unrelated records.
- Acceptance criteria: `/client/dashboard`, `/client/opportunities`, `/client/reports`, `/client/payments`, `/client/targets`, and `/client/exports` no longer rely on whole-list hydration for first render; shared helpers request only route-scoped or paginated data; and follow-up field telemetry shows lower transfer and improved LCP on the current client hotspots.

### P1 - [TB-0048] Stop portal search from warming large multi-query datasets before a committed search
- Evidence: `src/components/PortalGlobalSearch.tsx` still sets `shouldFetchSearchData` when the field is focused, the mobile sheet opens, or the query reaches two characters. That still arms up to `14` `useQuery` sources across opportunities, targets, companies, contacts, claims, prospects, reverse opportunities, profiles, conversations, and training materials before the user commits to a real search. The component then normalizes and ranks the combined result set in the browser instead of receiving capped role-scoped search results.
- Why it matters: Search lives in persistent portal chrome, so a focus event or mobile-sheet open adds avoidable network, RLS, and memory work to unrelated route visits. That overhead now sits on top of the same client routes already running close to the LCP guardrail.
- Recommendation: Require a committed search term before any network fetch, move category matching and result caps server-side, and return only top role-scoped matches instead of warming broad datasets into the browser.
- Acceptance criteria: Search focus and mobile-sheet open no longer trigger data fan-out on their own; each role receives term-scoped capped results; and authenticated traces or field telemetry show less route overhead when opening or using portal search.

### P2 - [TB-0049] Clear route-adjacent advisor debt before finance, meetings, and email workloads fill in
- Evidence: Live Supabase performance advisors are callable in this session and still flag route-adjacent debt. Current warnings still include unindexed foreign keys on `claim_invoices.customer_payment_report_id`, `audit_events.company_id`, `bum_contacts.customer_target_id`, and multiple `bum_saved_items` relationships, plus `multiple_permissive_policies` warnings on `opportunity_registrations`, `opportunity_questions`, `profiles`, `reverse_opportunities`, `teams_meetings`, `terms_assignments`, and `training_materials`. New advisor noise also exists on several `admin_email_*` tables, but the route-adjacent client-path warnings remain the higher-priority subset because current source still reads those same surfaces broadly. Live counts show why this remains second-order work: `opportunity_claims`, `reverse_opportunities`, `customer_target_responses`, `teams_meetings`, `claim_invoices`, and `customer_payment_reports` are all still at `0` rows today even while the route-layer LCP pressure is already visible.
- Why it matters: Route architecture is still the first-order bottleneck, but once finance, meetings, saved items, and email history fill in, the remaining FK and permissive-policy debt will become the next source of avoidable latency and planner cost.
- Recommendation: Clear or explicitly waive the advisor items tied most directly to current or imminent route traffic, starting with `opportunity_registrations`, `profiles`, `teams_meetings`, `claim_invoices`, `audit_events`, `bum_contacts`, and `bum_saved_items`, and separate lower-priority admin-email advisor cleanup from the client-route performance queue.
- Acceptance criteria: The route-adjacent FK and permissive-policy warnings are either cleared or explicitly waived with business-rule justification, and the next performance pass no longer needs to carry the same route-linked advisor findings as open debt.

## Measurement Notes

- Current head and hosted workflow evidence:
  - `git rev-parse HEAD` returned `d36057032de1d354fe925d48ecfaf0e238e6efd3` (`d360570`).
  - GitHub `QA` run `27371736190`, DreamHost deploy `27371736211`, and hosted `E2E Smoke` `27371773276` all completed successfully on `d360570` on 2026-06-11 UTC.
  - GitHub `Visual UI Audit` `27395701277` failed on `d360570` on 2026-06-12 UTC because the audit's generic error regex matched admin scrum tracker text containing `404`; the failure log did not show a broken auth shell, missing config, or real route-not-found page.
- Local build and targeted checks on 2026-06-12:
  - `corepack pnpm run build` passed with Vite `5.4.21` and rendered `14` route metadata files.
  - Largest emitted browser assets were `vendor-CHdATByo.js` at `487.52 kB` (`141.16 kB` gzip), `vendor-supabase-Do-SqqqA.js` at `200.97 kB` (`51.99 kB` gzip), `index-ClNWRThp.js` at `183.24 kB` (`46.95 kB` gzip), `vendor-react-CGTIOkUr.js` at `142.62 kB` (`45.76 kB` gzip), and `vendor-radix-BE1DpZwm.js` at `121.01 kB` (`35.39 kB` gzip).
  - Route chunks relevant to the active queue were `ClientOpportunityNew` at `44.99 kB`, `ClientPayments` at `23.10 kB`, `ClientDashboard` at `18.37 kB`, `ClientReports` at `11.95 kB`, `ClientTargets` via page-local logic on the shared `index` chunk, `ClientClaims` at `7.61 kB`, `AdminPerformanceMetrics` at `6.38 kB`, and `ClientExports` at `5.54 kB`.
  - `corepack pnpm exec vitest run src/test/performanceBeacon.test.ts src/test/accessBoundaryRegression.test.ts src/test/clientExportsAccess.test.ts src/test/clientDashboardLayout.test.ts src/test/clientBumOriginatedOpportunities.test.ts src/test/clientOpportunityBulkTools.test.ts src/test/clientOpportunityDelete.test.ts src/test/clientClaimsWorkflow.test.ts` passed `15/15` tests.
- Live Supabase checks in this session:
  - Project `vaoqvtxqvbptyxddpoju` returned `ACTIVE_HEALTHY` on PostgreSQL `17.6.1.111`, and the live project URL still resolves to `https://vaoqvtxqvbptyxddpoju.supabase.co`.
  - Live performance telemetry now confirms `170,403` total `performance_metric_events` rows across `69` routes since 2026-05-29, with `152,579` rows across `68` routes in the last 7 days.
  - Top 30-day routes by event volume were `/` (`26,304`), `/client/dashboard` (`20,750`), `/dashboard` (`17,891`), `/admin` (`11,333`), `/bum/dashboard` (`9,673`), `/client/payments` (`4,818`), `/client/targets` (`4,759`), `/login` (`4,070`), `/client/user-profile` (`3,601`), `/client/reports` (`3,377`), and `/client/profile` (`3,314`).
  - The latest live 30-day route metrics for the current backlog were `/client/dashboard LCP p75 2440 ms`, `/client/opportunities 2301 ms`, `/client/live-conversations 2354 ms`, `/client/claims 2292 ms`, `/client/reports 2184 ms`, `/client/profile 2176 ms`, `/client/payments 2168 ms`, `/client/targets 2156 ms`, `/client/user-profile 2188 ms`, `/client/exports 2096 ms`, and `/admin/performance 1962 ms`.
  - Live table counts grounding the source review were `companies 89`, `opportunity_registrations 82`, `customer_targets 81`, `admin_scrum_items 87`, `profiles 19`, `conversation_threads 1`, and `0` current rows each for `opportunity_claims`, `reverse_opportunities`, `customer_target_responses`, `teams_meetings`, `claim_invoices`, and `customer_payment_reports`.
  - Live performance advisors are callable again and still report route-adjacent FK and permissive-policy debt plus lower-priority admin-email index debt.

## Watchlist

- The catch-all `vendor` chunk remains the largest browser payload at `487.52 kB` (`141.16 kB` gzip). Keep it measured with an authenticated waterfall or bundle analyzer before turning it into a separate implementation item.
- `ClientOpportunityNew` is now the largest route chunk in the client portal at `44.99 kB`. Keep it watched, but do not split it into its own backlog item until authenticated traces confirm how much of the route delay is chunk cost versus data fan-out.
- `vite@5.4.21` still builds cleanly here, but the current Vite support policy no longer covers the Vite 5 line. Treat any Vite upgrade as a maintenance track after the route and data-shape backlog, not as a substitute for it.

## Current Standards And Time-Sensitive Notes

- [web.dev LCP](https://web.dev/articles/lcp) says a good LCP target is `2.5 seconds or less` at the 75th percentile and was last updated on September 4, 2025.
- [web.dev INP](https://web.dev/articles/inp) says good responsiveness is `200 milliseconds or less` at the 75th percentile and was last updated on September 2, 2025.
- [React Router 6.30.4 changelog](https://reactrouter.com/6.30.4/start/changelog) still recommends adopting `future.v7_startTransition`; this repo already has that flag enabled, so there is no new router migration action from this run.
- [Vite Releases](https://vite.dev/releases) currently lists `vite@8.0` for regular patches, `vite@7.3` for important fixes and security backports, and `vite@6.4` for security backports only. Versions before those are unsupported.
- [Vite 8 announcement](https://vite.dev/blog/announcing-vite8) was published on March 12, 2026 and confirms the Rolldown-based build pipeline. Treat that as an upgrade path and future build-speed win, not as a fix for the current route fan-out bottlenecks.

## Access Requests And Evidence Gaps

Material missing access, production or staging telemetry, traces, query plans, or authenticated route evidence needed for a stronger performance review. Mirror durable requests in `docs/consultant-access-needs.md`.

- No authenticated browser trace or waterfall ran for `/client/dashboard`, `/client/opportunities`, `/client/reports`, `/client/payments`, `/client/targets`, `/client/exports`, or portal-search-open behavior in this session.
- No current-session Lighthouse artifact set or bundle-analyzer report was available.
- No current-session query-plan or `pg_stat_statements` access was available to connect the advisor warnings to exact slow statements.
- No current-session admin-versus-non-admin route proof was captured for `/admin/performance`; the live timing evidence came from stored telemetry rather than a fresh role walkthrough.

## Agent Inputs

- Date of run: 2026-06-12
- Files, tests, routes, measurements, Supabase queries or advisors, internet sources, access sources, or commands reviewed:
  - Reviewed `docs/agents/automation-prompts/trusted-bums-daily-performance-engineer.toml`, `docs/consultant-team-rules.md`, `docs/company-wide-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, `docs/codex-edit-log.md`, prior `docs/performance-engineering-backlog.md`, `docs/performance-monitoring.md`, `package.json`, `vite.config.ts`, `src/App.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientReports.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/client/ClientOpportunityNew.tsx`, `src/pages/client/ClientPayments.tsx`, `src/pages/client/ClientTargets.tsx`, `src/pages/client/ClientLiveConversations.tsx`, `src/pages/admin/AdminPerformanceMetrics.tsx`, and the relevant helper sections in `src/lib/portalApi.ts`.
  - Reviewed repo state with `git status --short --branch`, `git log --oneline -n 12`, `git show --stat --summary --name-only d360570`, `git show --stat --summary --name-only ea5a710`, `git show --stat --summary --name-only d79f604`, and `git rev-parse HEAD`.
  - Ran `corepack pnpm run build` and `corepack pnpm exec vitest run src/test/performanceBeacon.test.ts src/test/accessBoundaryRegression.test.ts src/test/clientExportsAccess.test.ts src/test/clientDashboardLayout.test.ts src/test/clientBumOriginatedOpportunities.test.ts src/test/clientOpportunityBulkTools.test.ts src/test/clientOpportunityDelete.test.ts src/test/clientClaimsWorkflow.test.ts`.
  - Queried `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27395701277 --json ...`, and `/Users/macdaddy/bin/gh-trustedbums run view 27395701277 --log-failed` for exact-head workflow evidence.
  - Queried Supabase tools for project health, project URL, performance advisors, live `performance_metric_events` aggregates, live route metrics, live table counts, and current tracker rows in project `vaoqvtxqvbptyxddpoju`.
  - Reviewed current official guidance from [web.dev LCP](https://web.dev/articles/lcp), [web.dev INP](https://web.dev/articles/inp), [React Router 6.30.4 changelog](https://reactrouter.com/6.30.4/start/changelog), [Vite Releases](https://vite.dev/releases), [Vite 8 announcement](https://vite.dev/blog/announcing-vite8), and [Vite build target docs](https://vite.dev/config/build-options).
- Checks that could not run and why:
  - No authenticated browser timing or route walkthrough ran because this session did not have a ready authenticated browser path for admin or client routes.
  - No query-plan or statement-level planner inspection ran because the available Supabase tooling in this session did not expose planner output or `pg_stat_statements`.
  - No Lighthouse artifact set or bundle-analyzer output was available in this session.
