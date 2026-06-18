# Trusted Bums Performance Engineering Backlog

_Last updated: 2026-06-18 by Codex daily performance engineer automation._

## Executive Read

Current `main` head `57231bf` now has fully green exact-head hosted proof: GitHub `QA` run `27710960865`, DreamHost deploy run `27710961582`, and hosted `E2E Smoke` run `27711014094` all succeeded on June 17, 2026 UTC. `TB-0048` is already closed on this head: `src/components/PortalGlobalSearch.tsx` no longer warms search datasets on focus or mobile-sheet open, and network fetches now wait for a typed query of at least two characters plus tighter role gating.

Live Supabase telemetry keeps the active queue narrowed to `TB-0047` and `TB-0049`. `performance_metric_events` now stores `219,322` rows across `73` routes since 2026-05-29, and overall 7-day field p75 still stays inside Core Web Vitals thresholds (`LCP 2140 ms`, `INP 40 ms`, `TTFB 84.9 ms`, `CLS 0.050`). The same broad client-shell routes still spend most of the LCP budget: `/client/dashboard 2436 ms`, `/client/opportunities 2228 ms`, `/client/opportunities/new 2220 ms`, `/client/reports 2172 ms`, `/client/payments 2164 ms`, `/client/profile 2156 ms`, and `/client/exports 2084 ms`.

`/client/terms 2656 ms` and `/bum/terms 2568 ms` now exceed the `2.5 s` LCP target too, but current source points at large static agreement rendering rather than another obvious whole-list hydration path. Keep those routes on the watchlist until authenticated traces show a distinct fix path.

## Active Recommendations

### P1 - [TB-0047] Move high-traffic client routes off whole-list hydration and broad list helpers
- Evidence: `git diff --stat af944fe..57231bf` shows current-head edits in `src/components/PortalGlobalSearch.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientOpportunityNew.tsx`, `src/pages/client/ClientPayments.tsx`, and `src/lib/portalApi.ts`, but those changes close search warming and adjust mobile or copy behavior rather than narrowing route-start data reads. `src/pages/client/ClientDashboard.tsx` still boots from `listOpportunityRegistrations()`, `listCustomerPaymentReports()`, `listClaimInvoices()`, `listClientReverseOpportunities()`, and `listCustomerTargetResponses()`. `src/pages/client/ClientReports.tsx` still loads `listCustomerTargets()`, `listOwnOpportunityRegistrations()`, `listClientReverseOpportunities()`, `listCustomerPaymentReports()`, and `listClaimInvoices()` together. `src/pages/client/ClientExports.tsx` still starts from `listCustomerTargets()`, `listTeamsMeetings()`, and `listCustomerPaymentReports()`. `src/pages/client/ClientOpportunityNew.tsx` still starts from `listSelectableClientPayPrograms()`, `listOwnOpportunityRegistrations()`, `listOpportunityClaims()`, `listCustomerTargetResponses()`, and `listClientReverseOpportunities()`. The shared helpers in `src/lib/portalApi.ts` still select broad company or whole-table arrays with no pagination or route-scoped bounds for `listOpportunityRegistrations()`, `listOwnOpportunityRegistrations()`, `listCustomerTargets()`, `listOpportunityClaims()`, `listCustomerPaymentReports()`, `listClaimInvoices()`, `listClientReverseOpportunities()`, `listTeamsMeetings()`, and `listCustomerTargetResponses()`. Live 30-day telemetry keeps `/client/dashboard` at `2436 ms` p75 LCP, `/client/opportunities` at `2228 ms`, `/client/opportunities/new` at `2220 ms`, `/client/reports` at `2172 ms`, `/client/payments` at `2164 ms`, and `/client/exports` at `2084 ms` while the backing tables remain tiny (`83` opportunity registrations, `81` customer targets, `1` opportunity claim, and `0` current rows each in `reverse_opportunities`, `customer_target_responses`, `teams_meetings`, `claim_invoices`, and `customer_payment_reports`).
- Why it matters: The client shell is still paying route-start cost out of proportion to the live dataset size. If these routes stay broad-read-first, latency will scale with marketplace growth instead of with the narrow slice each screen actually needs.
- Recommendation: Replace whole-list route-start reads with server-scoped summaries, capped or paginated lists, and on-demand detail fetches. Keep export and finance payloads off first render, and narrow the shared helpers so dashboard, opportunity, report, payment, and export routes stop hydrating unrelated records.
- Acceptance criteria: `/client/dashboard`, `/client/opportunities`, `/client/opportunities/new`, `/client/reports`, `/client/payments`, and `/client/exports` no longer depend on broad list hydration for first render; the shared helpers request only route-scoped or paginated data; and follow-up field telemetry shows lower transfer and improved LCP on the current client hotspots.

### P2 - [TB-0049] Clear route-adjacent advisor debt before finance, meetings, and email workloads fill in
- Evidence: Current Supabase performance advisors are callable and still flag route-adjacent debt. The active subset remains unindexed foreign keys on `audit_events.company_id`, `bum_contacts.customer_target_id`, and `bum_saved_items` relationships, plus multiple-permissive-policy warnings on `opportunity_registrations`, `profiles`, `reverse_opportunities`, `teams_meetings`, `terms_assignments`, and `training_materials`. `claim_invoices` still has no live rows yet, but its FK debt remains on the same finance path that `ClientPayments` and `ClientReports` already boot from. Newer advisor noise also remains on `admin_email_*`, `admin_shared_mailbox_*`, and `api_access_keys`, but those warnings are still lower priority than the route-adjacent client-path subset because current user-facing route load already depends on the latter.
- Why it matters: Route shape is still the primary bottleneck, but once finance, meetings, and saved-item tables start filling in, the remaining FK and permissive-policy debt will become the next source of avoidable planner cost and route latency.
- Recommendation: Clear or explicitly waive the route-adjacent advisor items first, starting with `opportunity_registrations`, `profiles`, `reverse_opportunities`, `teams_meetings`, `audit_events`, `bum_contacts`, `bum_saved_items`, and the finance-path `claim_invoices` warning. Keep the newer admin-email and shared-mailbox index debt out of the main client-route queue unless traces show direct user-facing impact.
- Acceptance criteria: The route-adjacent FK and permissive-policy warnings are either cleared or explicitly waived with business-rule justification, and the next performance pass no longer needs to carry the same route-linked advisor findings as open debt.

## Measurement Notes

- Current head and hosted workflow evidence:
  - `git rev-parse HEAD` returned `57231bf75e9900c11aea964ec9999517a831d1ca` (`57231bf`).
  - GitHub `QA` run `27710960865`, DreamHost deploy run `27710961582`, and hosted `E2E Smoke` run `27711014094` all completed successfully on `57231bf` on June 17, 2026 UTC.
  - `TB-0048` is already closed on current head: `src/components/PortalGlobalSearch.tsx` now waits for a typed query of at least two characters and no longer triggers search fetches on focus or mobile-sheet open.
- Local build and targeted checks on 2026-06-18:
  - `corepack pnpm run build` passed with Vite `5.4.21` and rendered `14` route metadata files.
  - Largest emitted browser assets were `vendor-CHdATByo.js` at `487.52 kB` (`141.16 kB` gzip), `vendor-supabase-Do-SqqqA.js` at `200.97 kB` (`51.99 kB` gzip), `index-BtTTJ7sn.js` at `198.84 kB` (`50.62 kB` gzip), `vendor-react-CGTIOkUr.js` at `142.62 kB` (`45.76 kB` gzip), and `vendor-radix-CnBCTfel.js` at `121.01 kB` (`35.39 kB` gzip).
  - Route chunks relevant to the active queue were `ClientOpportunityNew` at `50.60 kB`, `ClientPayments` at `23.06 kB`, `ClientDashboard` at `18.33 kB`, `ClientProfile` at `15.77 kB`, `ClientReports` at `11.95 kB`, `AdminPerformanceMetrics` at `6.38 kB`, and `ClientExports` at `5.54 kB`.
  - `corepack pnpm exec vitest run src/test/performanceBeacon.test.ts src/test/clientDashboardLayout.test.ts src/test/clientClaimsWorkflow.test.ts src/test/clientOpportunityBulkTools.test.ts src/test/clientOpportunityDelete.test.ts src/test/clientExportsAccess.test.ts src/test/clientBumOriginatedOpportunities.test.ts src/test/accessBoundaryRegression.test.ts src/test/googleAnalyticsConsent.test.tsx` passed `20/20` tests.
  - `pnpm audit --prod --json` reported `0` runtime advisories across `225` production dependencies.
- Live Supabase checks in this session:
  - Project `vaoqvtxqvbptyxddpoju` returned `ACTIVE_HEALTHY` on PostgreSQL `17.6.1.111`, and the live project URL still resolves to `https://vaoqvtxqvbptyxddpoju.supabase.co`.
  - Live performance telemetry now confirms `219,322` total `performance_metric_events` rows across `73` routes since 2026-05-29, with the latest sample recorded at `2026-06-18 04:13:11+00`.
  - Overall 7-day p75 stayed at `LCP 2140 ms`, `FCP 448 ms`, `INP 40 ms`, `TTFB 84.9 ms`, and `CLS 0.050`.
  - The latest live 30-day LCP p75 route metrics were `/client/terms 2656 ms` with `429` samples, `/bum/terms 2568 ms` with `259`, `/client/dashboard 2436 ms` with `10,210`, `/client/opportunities 2228 ms` with `263`, `/client/opportunities/new 2220 ms` with `488`, `/client/reports 2172 ms` with `960`, `/client/user-profile 2172 ms` with `867`, `/client/payments 2164 ms` with `1,197`, `/client/profile 2156 ms` with `964`, `/client/claims 2132 ms` with `266`, `/client/exports 2084 ms` with `816`, and `/admin/performance 1940 ms` with `189`.
  - Stored `/client/targets` telemetry remains historical only in this context: `2156 ms` p75 LCP on older traffic, last seen `2026-06-11T17:31:39Z`, while current routing now sends that workflow through `/client/opportunities`.
  - Live table counts grounding the source review were `opportunity_registrations 83`, `customer_targets 81`, `opportunity_claims 1`, and `0` current rows each for `reverse_opportunities`, `customer_target_responses`, `teams_meetings`, `claim_invoices`, and `customer_payment_reports`.
  - Live performance advisors still report route-adjacent FK and permissive-policy debt plus newer admin-email, shared-mailbox, and API-access-key index debt.
  - Current tracker rows `TB-0047` and `TB-0049` were refreshed to exact head `57231bf`; `TB-0048` was already closed on the same head.

## Watchlist

- `/client/terms`, `/bum/terms`, and `/client/agreements` now deserve targeted traces before they become active backlog work. Current telemetry shows the terms routes over the `2.5 s` LCP target, but current source points mostly at static agreement rendering and downloads rather than another obvious route-start data fan-out defect.
- The catch-all `vendor` chunk remains the largest browser payload at `487.52 kB` (`141.16 kB` gzip). Keep it measured with an authenticated waterfall or bundle analyzer before turning it into a separate implementation item.
- `/client/live-conversations`, `/client/profile`, `/client/user-profile`, and `/client/claims` still sit just behind the active queue in live LCP, but current source still shows lighter query shapes than the dashboard, reports, payments, and export shells. Keep them as watchlist routes until traces show a distinct first-render bottleneck that is separate from the existing queue.
- `vite@5.4.21` still builds cleanly here, but the current Vite support policy no longer covers the Vite 5 line. Treat any Vite upgrade as a maintenance track after the route and data-shape backlog, not as a substitute for it.

## Current Standards And Time-Sensitive Notes

- [web.dev LCP](https://web.dev/articles/lcp) says a good LCP target is `2.5 seconds or less` at the 75th percentile and was last updated on September 4, 2025.
- [web.dev INP](https://web.dev/articles/inp) says good responsiveness is `200 milliseconds or less` at the 75th percentile and was last updated on September 2, 2025.
- [Vite Releases](https://vite.dev/releases) currently lists `vite@8.0` for regular patches, `vite@7.3` for important fixes and security backports, and `vite@6.4` for security backports only. Versions before those are unsupported.
- [Supabase's April 28, 2026 breaking-change note](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) says new `public` tables may no longer auto-expose to the Data API automatically, the behavior became the default for new projects on May 30, 2026, and existing-project rollout is scheduled for October 30, 2026. Any future route-summary or telemetry tables added for performance work should be checked for explicit grants instead of assuming Data API exposure.

## Access Requests And Evidence Gaps

Material missing access, production or staging telemetry, traces, query plans, or authenticated route evidence needed for a stronger performance review. Mirror durable requests in `docs/consultant-access-needs.md`.

- No authenticated browser trace or waterfall ran for `/client/dashboard`, `/client/opportunities`, `/client/opportunities/new`, `/client/reports`, `/client/payments`, `/client/exports`, `/client/terms`, or `/bum/terms` in this session.
- No current-session Lighthouse artifact set or bundle-analyzer report was available.
- No current-session query-plan or `pg_stat_statements` access was available to connect the advisor warnings to exact slow statements.
- No current-session admin-versus-non-admin route proof was captured for `/admin/performance`; the live timing evidence came from stored telemetry rather than a fresh role walkthrough.

## Agent Inputs

- Date of run: 2026-06-18
- Files, tests, routes, measurements, Supabase queries or advisors, internet sources, access sources, or commands reviewed:
  - Reviewed `docs/agents/automation-prompts/trusted-bums-daily-performance-engineer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/codex-edit-log.md`, prior `docs/performance-engineering-backlog.md`, `docs/performance-monitoring.md`, `package.json`, `vite.config.ts`, `src/components/PortalGlobalSearch.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientReports.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/client/ClientOpportunityNew.tsx`, `src/pages/client/ClientPayments.tsx`, `src/pages/client/ClientTerms.tsx`, `src/pages/client/ClientAgreements.tsx`, and the relevant helper sections in `src/lib/portalApi.ts`.
  - Reviewed repo state with `git rev-parse HEAD`, `git status --short`, `git log --oneline --decorate -n 12`, `git diff --stat af944fe..57231bf -- src/components/PortalGlobalSearch.tsx src/pages/client/ClientDashboard.tsx src/pages/client/ClientReports.tsx src/pages/client/ClientExports.tsx src/pages/client/ClientOpportunityNew.tsx src/pages/client/ClientPayments.tsx src/lib/portalApi.ts src/App.tsx vite.config.ts package.json docs/performance-monitoring.md`, `git diff af944fe..57231bf -- ...`, and targeted `rg`.
  - Ran `corepack pnpm run build`, `corepack pnpm exec vitest run src/test/performanceBeacon.test.ts src/test/clientDashboardLayout.test.ts src/test/clientClaimsWorkflow.test.ts src/test/clientOpportunityBulkTools.test.ts src/test/clientOpportunityDelete.test.ts src/test/clientExportsAccess.test.ts src/test/clientBumOriginatedOpportunities.test.ts src/test/accessBoundaryRegression.test.ts src/test/googleAnalyticsConsent.test.tsx`, and `pnpm audit --prod --json`.
  - Queried `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 25 --json databaseId,workflowName,headSha,status,conclusion,createdAt,updatedAt,displayTitle` for exact-head hosted evidence on `57231bf`, confirming `QA` `27710960865`, deploy `27710961582`, and `E2E Smoke` `27711014094` all passed.
  - Queried Supabase tools for project listing, project health, project URL, performance advisors, `performance_metric_events` schema, live telemetry aggregates, live route metrics, live table counts, and current tracker rows in project `vaoqvtxqvbptyxddpoju`.
  - Reviewed current official guidance from [web.dev LCP](https://web.dev/articles/lcp), [web.dev INP](https://web.dev/articles/inp), [Vite Releases](https://vite.dev/releases), and [Supabase's April 28, 2026 Data API exposure change note](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).
- Checks that could not run and why:
  - No authenticated browser timing or route walkthrough ran because this session did not have a ready authenticated browser path for admin or client routes.
  - No query-plan or statement-level planner inspection ran because the available Supabase tooling in this session did not expose planner output or `pg_stat_statements`.
  - No Lighthouse artifact set or bundle-analyzer output was available in this session.
