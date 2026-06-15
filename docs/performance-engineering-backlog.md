# Trusted Bums Performance Engineering Backlog

_Last updated: 2026-06-15 by Codex daily performance engineer automation._

## Executive Read

Current `main` head `7ee97c1` still relies on the same exact-head hosted proof from June 13-14, 2026 UTC. GitHub `QA` run `27469969615`, DreamHost deploy run `27469969636`, hosted `E2E Smoke` run `27469985957`, and standard `Visual UI Audit` run `27488973899` all succeeded for commit `7ee97c121918bba73149748b49f2b28133c7ffbb`, and no newer exact-head hosted performance evidence appeared in the current 2026-06-15 rerun. The shipped app diff remains narrow: `src/components/GoogleAnalytics.tsx` and `src/test/googleAnalyticsConsent.test.tsx` changed for consented GA4 page-view dispatch, while the client route hydration and portal-search sources stayed the same.

Live Supabase telemetry remains the strongest current performance evidence. `performance_metric_events` now holds `199,370` rows across `70` routes since 2026-05-29, with `136,570` rows across `69` routes in the last 7 days. Overall 7-day p75 still sits inside Core Web Vitals thresholds (`LCP 2224 ms`, `INP 40 ms`, `TTFB 93.2 ms`, `CLS 0.003`), but the shared client shell still clusters close to the LCP guardrail: `/client/dashboard` is `2432 ms`, `/client/opportunities` `2225 ms`, `/client/reports` `2172 ms`, `/client/payments` `2156 ms`, and `/client/exports` `2084 ms` on 30-day p75 LCP.

The highest-value work is still route-shape work, not bundle-only cleanup. Live row counts remain modest or empty on the same client data sets (`83` opportunity registrations, `81` customer targets, and `0` current rows each in `opportunity_claims`, `reverse_opportunities`, `customer_target_responses`, `teams_meetings`, `claim_invoices`, and `customer_payment_reports`), yet the client shell already spends most of its LCP budget on broad route-start reads and browser-side shaping. The old `/client/targets` hotspot should still stay out of the active queue: current route config redirects that path to `/client/opportunities`, and the last stored `/client/targets` telemetry sample is still historical evidence from 2026-06-11 UTC.

## Active Recommendations

### P1 - [TB-0047] Move high-traffic client routes off whole-list hydration and broad list helpers
- Evidence: `src/pages/client/ClientDashboard.tsx` still calls the unscoped `listOpportunityRegistrations()` helper plus reverse opportunities, target responses, payment reports, and invoices before first render. `src/pages/client/ClientReports.tsx` still hydrates targets, opportunities, reverse opportunities, payment reports, and invoices before building report models in memory. `src/pages/client/ClientExports.tsx` still hydrates targets, meetings, and payment reports before any export action. `src/pages/client/ClientOpportunityNew.tsx` still loads pay programs, opportunities, claims, target responses, and reverse opportunities at route start, and `src/pages/client/ClientPayments.tsx` still boots from full claims, payment-report, and invoice reads. The shared helpers behind those screens still read broad company or whole-table datasets with no route-scoped bounds in `src/lib/portalApi.ts`, including `listOpportunityRegistrations()`, `listOwnOpportunityRegistrations()`, `listCustomerTargets()`, `listOpportunityClaims()`, `listCustomerPaymentReports()`, `listClaimInvoices()`, and `listTeamsMeetings()`. Live telemetry now shows `/client/dashboard LCP p75 2432 ms`, `/client/opportunities 2225 ms`, `/client/reports 2172 ms`, `/client/payments 2156 ms`, and `/client/exports 2084 ms`.
- Why it matters: The client operational shell is already spending most of its LCP budget while several of the underlying tables are still nearly empty. If these routes keep booting from broad list reads, route latency will scale with marketplace growth instead of with the narrow slice each screen actually needs.
- Recommendation: Replace route-start whole-list reads with route-scoped aggregates, counts, and bounded slices; keep heavy payment and export payloads server-generated or paginated; and narrow the shared helpers so the dashboard, opportunities, reports, payments, and export routes stop paying for unrelated records.
- Acceptance criteria: `/client/dashboard`, `/client/opportunities`, `/client/reports`, `/client/payments`, and `/client/exports` no longer rely on whole-list hydration for first render; shared helpers request only route-scoped or paginated data; and follow-up field telemetry shows lower transfer and improved LCP on the current client hotspots.

### P1 - [TB-0048] Stop portal search from warming large multi-query datasets before a committed search
- Evidence: `src/components/PortalGlobalSearch.tsx` still sets `shouldFetchSearchData` when the field is focused, the mobile sheet opens, or the query reaches two characters. That still arms up to `15` role-gated `useQuery` sources across opportunities, targets, companies, contacts, claims, prospects, reverse opportunities, profiles, conversations, and training materials before the user commits to a real search. The component still normalizes and ranks the combined result set in the browser instead of receiving capped role-scoped search results.
- Why it matters: Search lives in persistent portal chrome, so a focus event or mobile-sheet open adds avoidable network, RLS, and memory work to unrelated route visits. That overhead now sits on top of the same client routes already running close to the LCP guardrail.
- Recommendation: Require a committed search term before any network fetch, move category matching and result caps server-side, and return only top role-scoped matches instead of warming broad datasets into the browser.
- Acceptance criteria: Search focus and mobile-sheet open no longer trigger data fan-out on their own; each role receives term-scoped capped results; and authenticated traces or field telemetry show less route overhead when opening or using portal search.

### P2 - [TB-0049] Clear route-adjacent advisor debt before finance, meetings, and email workloads fill in
- Evidence: Live Supabase performance advisors are callable in this session and still flag route-adjacent debt. Current warnings still include unindexed foreign keys on `audit_events.company_id`, `bum_contacts.customer_target_id`, `claim_invoices.customer_payment_report_id`, and multiple `bum_saved_items` relationships, plus `multiple_permissive_policies` warnings on `opportunity_registrations`, `opportunity_questions`, `profiles`, `reverse_opportunities`, `teams_meetings`, `terms_assignments`, and `training_materials`. Newer advisor noise also exists on `admin_email_*`, `admin_shared_mailbox_*`, and `api_access_keys`, but the route-adjacent client-path warnings remain the higher-priority subset because current source still reads those same surfaces broadly while the live row counts are still small.
- Why it matters: Route architecture is still the first-order bottleneck, but once finance, meetings, saved items, and email history fill in, the remaining FK and permissive-policy debt will become the next source of avoidable latency and planner cost.
- Recommendation: Clear or explicitly waive the advisor items tied most directly to current or imminent route traffic, starting with `opportunity_registrations`, `profiles`, `teams_meetings`, `claim_invoices`, `audit_events`, `bum_contacts`, and `bum_saved_items`, and keep the newer admin-email or mailbox index debt out of the main client-route queue unless route traces prove it is user-facing.
- Acceptance criteria: The route-adjacent FK and permissive-policy warnings are either cleared or explicitly waived with business-rule justification, and the next performance pass no longer needs to carry the same route-linked advisor findings as open debt.

## Measurement Notes

- Current head and hosted workflow evidence:
  - `git rev-parse HEAD` returned `7ee97c121918bba73149748b49f2b28133c7ffbb` (`7ee97c1`).
  - GitHub `QA` run `27469969615`, DreamHost deploy `27469969636`, hosted `E2E Smoke` `27469985957`, and standard `Visual UI Audit` `27488973899` all completed successfully on `7ee97c1` on June 13-14, 2026 UTC.
  - `git diff --stat 9546563..HEAD` shows only `src/components/GoogleAnalytics.tsx` and `src/test/googleAnalyticsConsent.test.tsx` changed since the last performance refresh, so the route-cost findings above were revalidated against effectively unchanged client-route code.
- Local build and targeted checks on 2026-06-15:
  - `corepack pnpm run build` passed with Vite `5.4.21` and rendered `14` route metadata files.
  - Largest emitted browser assets were `vendor-CHdATByo.js` at `487.52 kB` (`141.16 kB` gzip), `vendor-supabase-Do-SqqqA.js` at `200.97 kB` (`51.99 kB` gzip), `index-DH0KV61c.js` at `194.24 kB` (`49.26 kB` gzip), `vendor-react-CGTIOkUr.js` at `142.62 kB` (`45.76 kB` gzip), and `vendor-radix-CnBCTfel.js` at `121.01 kB` (`35.39 kB` gzip).
  - Route chunks relevant to the active queue were `ClientOpportunityNew` at `49.64 kB`, `ClientPayments` at `23.10 kB`, `ClientDashboard` at `18.37 kB`, `ClientProfile` at `15.76 kB`, `ClientReports` at `11.95 kB`, `ClientTeam` at `11.56 kB`, `ClientClaims` at `8.76 kB`, `AdminPerformanceMetrics` at `6.38 kB`, and `ClientExports` at `5.54 kB`.
  - `corepack pnpm exec vitest run src/test/performanceBeacon.test.ts src/test/clientDashboardLayout.test.ts src/test/clientClaimsWorkflow.test.ts src/test/clientOpportunityBulkTools.test.ts src/test/clientOpportunityDelete.test.ts src/test/clientExportsAccess.test.ts src/test/clientBumOriginatedOpportunities.test.ts src/test/accessBoundaryRegression.test.ts src/test/googleAnalyticsConsent.test.tsx` passed `19/19` tests.
  - `pnpm audit --prod --json` reported `0` runtime advisories across `225` production dependencies.
- Live Supabase checks in this session:
  - Project `vaoqvtxqvbptyxddpoju` returned `ACTIVE_HEALTHY` on PostgreSQL `17.6.1.111`, and the live project URL still resolves to `https://vaoqvtxqvbptyxddpoju.supabase.co`.
  - Live performance telemetry now confirms `199,370` total `performance_metric_events` rows across `70` routes since 2026-05-29, with `136,570` rows across `69` routes in the last 7 days.
  - Overall 7-day p75 stayed at `LCP 2224 ms`, `FCP 492 ms`, `INP 40 ms`, `TTFB 93.2 ms`, and `CLS 0.003`.
  - The latest live 30-day route metrics for the current backlog were `/client/dashboard LCP p75 2432 ms` with `9,383` LCP samples, `/client/opportunities 2225 ms` with `226`, `/client/reports 2172 ms` with `866`, `/client/user-profile 2172 ms` with `778`, `/client/profile 2164 ms` with `870`, `/client/payments 2156 ms` with `1,077`, `/client/live-conversations 2152 ms` with `164`, `/client/claims 2122 ms` with `163`, `/client/exports 2084 ms` with `733`, and `/admin/performance 1950 ms` with `172`.
  - Stored `/client/targets` telemetry remains historical only in this context: `2156 ms` p75 LCP on older traffic, last seen `2026-06-11T17:31:39Z`, while current route config redirects `/client/targets` to `/client/opportunities`.
  - Live table counts grounding the source review were `companies 89`, `opportunity_registrations 83`, `customer_targets 81`, `admin_scrum_items 95`, `profiles 19`, and `0` current rows each for `opportunity_claims`, `reverse_opportunities`, `customer_target_responses`, `teams_meetings`, `claim_invoices`, and `customer_payment_reports`.
  - Live performance advisors are callable again and still report route-adjacent FK and permissive-policy debt plus newer admin-email, shared-mailbox, and API-access-key index debt.
  - Current tracker rows `TB-0047`, `TB-0048`, and `TB-0049` remain open and aligned to this performance queue.

## Watchlist

- The catch-all `vendor` chunk remains the largest browser payload at `487.52 kB` (`141.16 kB` gzip). Keep it measured with an authenticated waterfall or bundle analyzer before turning it into a separate implementation item.
- `ClientOpportunityNew` is still the largest route chunk in the client portal at `49.64 kB`. Keep it watched, but do not split it into its own backlog item until authenticated traces confirm how much of the route delay is chunk cost versus data fan-out.
- `/client/profile` and `/client/user-profile` still sit just behind the active route queue in live LCP, but current source shows lighter query shapes than the dashboard or reporting shells. Keep them as watchlist routes until traces show a consistent first-render bottleneck that is distinct from the existing queue.
- `vite@5.4.21` still builds cleanly here, but the current Vite support policy no longer covers the Vite 5 line. Treat any Vite upgrade as a maintenance track after the route and data-shape backlog, not as a substitute for it.

## Current Standards And Time-Sensitive Notes

- [web.dev LCP](https://web.dev/articles/lcp) says a good LCP target is `2.5 seconds or less` at the 75th percentile and was last updated on September 4, 2025.
- [web.dev INP](https://web.dev/articles/inp) says good responsiveness is `200 milliseconds or less` at the 75th percentile and was last updated on September 2, 2025.
- [Vite Releases](https://vite.dev/releases) currently lists `vite@8.0` for regular patches, `vite@7.3` for important fixes and security backports, and `vite@6.4` for security backports only. Versions before those are unsupported.
- [Supabase changelog](https://supabase.com/changelog) notes an April 28, 2026 breaking change: new `public` tables may no longer auto-expose to the Data API automatically, the behavior became the default for new projects on May 30, 2026, and existing-project rollout is scheduled for October 30, 2026. Any future route-summary or telemetry tables added for performance work should be checked for explicit grants instead of assuming Data API exposure.

## Access Requests And Evidence Gaps

Material missing access, production or staging telemetry, traces, query plans, or authenticated route evidence needed for a stronger performance review. Mirror durable requests in `docs/consultant-access-needs.md`.

- No authenticated browser trace or waterfall ran for `/client/dashboard`, `/client/opportunities`, `/client/reports`, `/client/payments`, `/client/exports`, or portal-search-open behavior in this session.
- No current-session Lighthouse artifact set or bundle-analyzer report was available.
- No current-session query-plan or `pg_stat_statements` access was available to connect the advisor warnings to exact slow statements.
- No current-session admin-versus-non-admin route proof was captured for `/admin/performance`; the live timing evidence came from stored telemetry rather than a fresh role walkthrough.

## Agent Inputs

- Date of run: 2026-06-15
- Files, tests, routes, measurements, Supabase queries or advisors, internet sources, access sources, or commands reviewed:
  - Reviewed `docs/agents/automation-prompts/trusted-bums-daily-performance-engineer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/codex-edit-log.md`, prior `docs/performance-engineering-backlog.md`, `docs/performance-monitoring.md`, `package.json`, `vite.config.ts`, `src/App.tsx`, `src/components/GoogleAnalytics.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientReports.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/client/ClientOpportunityNew.tsx`, `src/pages/client/ClientPayments.tsx`, `src/pages/client/ClientProfile.tsx`, `src/pages/client/ClientClaims.tsx`, `src/pages/client/ClientLiveConversations.tsx`, `src/pages/admin/AdminPerformanceMetrics.tsx`, and the relevant helper sections in `src/lib/portalApi.ts`.
  - Reviewed repo state with `git status --short`, `git log --oneline -n 12`, `git rev-parse HEAD`, `git diff --stat 9546563..HEAD`, and `git show --stat --summary --name-only 7ee97c1`.
  - Ran `corepack pnpm run build`, `corepack pnpm exec vitest run src/test/performanceBeacon.test.ts src/test/clientDashboardLayout.test.ts src/test/clientClaimsWorkflow.test.ts src/test/clientOpportunityBulkTools.test.ts src/test/clientOpportunityDelete.test.ts src/test/clientExportsAccess.test.ts src/test/clientBumOriginatedOpportunities.test.ts src/test/accessBoundaryRegression.test.ts src/test/googleAnalyticsConsent.test.tsx`, and `pnpm audit --prod --json`.
  - Queried `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 40 --json databaseId,workflowName,headSha,status,conclusion,createdAt,updatedAt` for exact-head hosted evidence on `7ee97c1`, confirming there were no newer hosted runs after `QA` `27469969615`, DreamHost deploy `27469969636`, `E2E Smoke` `27469985957`, and `Visual UI Audit` `27488973899`.
  - Queried Supabase tools for project health, project URL, performance advisors, live `performance_metric_events` aggregates, live route metrics, live table counts, and current tracker rows in project `vaoqvtxqvbptyxddpoju` using direct SQL because the admin-only summary RPC remains role-gated in this session.
  - Reviewed current official guidance from [web.dev LCP](https://web.dev/articles/lcp), [web.dev INP](https://web.dev/articles/inp), [Vite Releases](https://vite.dev/releases), and the [Supabase changelog](https://supabase.com/changelog).
- Checks that could not run and why:
  - No authenticated browser timing or route walkthrough ran because this session did not have a ready authenticated browser path for admin or client routes.
  - No query-plan or statement-level planner inspection ran because the available Supabase tooling in this session did not expose planner output or `pg_stat_statements`.
  - No Lighthouse artifact set or bundle-analyzer output was available in this session.
