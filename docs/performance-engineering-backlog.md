# Trusted Bums Performance Engineering Backlog

_Last updated: 2026-06-20 by Codex daily performance engineer automation._

## Executive Read

Current `main` head `e231cc0` has clean exact-head hosted proof: GitHub `QA` run `27857690007`, DreamHost deploy run `27857689995`, `Visual UI Audit` run `27857691601`, and hosted `E2E Smoke` run `27857708006` all completed `success` on June 20, 2026 UTC. `TB-0047` is no longer an active backlog item on this head: the live tracker already closed it at `2026-06-20 01:10:30+00` after the shipped route-summary and capped-hydration work landed. `TB-0048` remains closed.

Live Supabase telemetry is current through `2026-06-20 02:48:28+00` and still shows generally healthy field performance: `performance_metric_events` now stores `241,884` rows across `73` routes since 2026-05-29, while overall 7-day field p75 remains inside Core Web Vitals thresholds (`LCP 2056 ms`, `INP 40 ms`, `TTFB 90.8 ms`, `CLS 0.1`). The repeat routes that still merit attention are agreement-heavy or dashboard shells rather than the already-shipped route-hydration change: `/client/terms 2661 ms`, `/bum/terms 2569 ms`, `/client/dashboard 2420 ms`, `/bum/dashboard 2399 ms`, `/bum/profile 2318 ms`, `/client/opportunities/new 2221 ms`, and `/bum/live-conversations 2220 ms` on 30-day p75 LCP.

The only active performance backlog item now is `TB-0049`. The advisor surface has narrowed, but it has not disappeared: the first five route-adjacent indexes are already live, while the remaining warnings are concentrated in permissive-policy fan-out plus admin-email, shared-mailbox, API-access-key, and finance-adjacent foreign keys. Current source and current hosted proof do not justify reopening `TB-0047`.

## Active Recommendations

### P2 - [TB-0049] Clear route-adjacent advisor debt before finance, meetings, saved items, and email workloads fill in
- Evidence: `supabase/migrations/20260620012000_add_route_advisor_indexes.sql` is now live and already closed the first low-risk slice by adding covering indexes for `audit_events.company_id`, `bum_contacts.customer_target_id`, `bum_saved_items.client_company_id`, `bum_saved_items.customer_target_id`, and `bum_saved_items.opportunity_registration_id`. Current live advisors still report multiple-permissive-policy warnings on `opportunity_registrations`, `profiles`, `reverse_opportunities`, `teams_meetings`, `terms_assignments`, and `training_materials`, plus remaining unindexed foreign keys across `admin_email_*`, `admin_shared_mailbox_send_events`, `api_access_keys`, `bum_payouts`, `claim_invoices`, and related admin or finance surfaces.
- Why it matters: The main route-hydration fix is already shipped and closed, so the next avoidable backend tax is planner and RLS overhead on the tables that will grow next. If these warnings are left broad and unprioritized, the admin-email, finance, and shared-mailbox surfaces will inherit preventable latency as real usage grows.
- Recommendation: Keep `TB-0047` closed, then work `TB-0049` in small, access-rule-reviewed batches. Prioritize route-adjacent policy consolidation first (`opportunity_registrations`, `profiles`, `reverse_opportunities`, `teams_meetings`), then add only the admin-email, shared-mailbox, API-access-key, or finance-path indexes that traces or route summaries show are user-facing.
- Acceptance criteria: Each retained advisor warning is either removed or explicitly waived with business-rule justification and linked evidence. The next performance pass should still show `TB-0047` closed and should narrow the remaining `TB-0049` warning set instead of repeating the same mixed queue.

## Measurement Notes

- Current head and exact-head hosted workflow evidence:
  - `git rev-parse HEAD` returned `e231cc07ee6959bc8eac9d04ed3b68b80d76f6c4` (`e231cc0`).
  - GitHub `QA` `27857690007`, DreamHost deploy `27857689995`, `Visual UI Audit` `27857691601`, and hosted `E2E Smoke` `27857708006` all completed `success` on `e231cc0` on June 20, 2026 UTC.
  - Live tracker rows now show `TB-0047 CLOSED`, `TB-0048 CLOSED`, and `TB-0049 OPEN`.
- Local build and targeted checks on 2026-06-20:
  - `corepack pnpm run build` passed with Vite `5.4.21` and rendered `14` route metadata files. ESLint still reports one non-blocking `react-hooks/exhaustive-deps` warning in `src/pages/client/ClientOpportunityNew.tsx` about the `opportunities` dependency in the linked-claim focus effect.
  - Largest emitted browser assets were `vendor-CHdATByo.js` at `487.52 kB` (`141.16 kB` gzip), `index-DXo8sc-4.js` at `208.00 kB` (`52.64 kB` gzip), `vendor-supabase-Do-SqqqA.js` at `200.97 kB` (`51.99 kB` gzip), `vendor-react-CGTIOkUr.js` at `142.62 kB` (`45.76 kB` gzip), and `vendor-radix-CnBCTfel.js` at `121.01 kB` (`35.39 kB` gzip).
  - The heaviest route chunks relevant to the watchlist were `ClientOpportunityNew` at `53.86 kB`, `AdminEmails` at `42.95 kB`, `BumOpportunities` at `35.20 kB`, `AdminDashboard` at `30.26 kB`, `BumContacts` at `20.36 kB`, `BumProfile` at `20.43 kB`, `AdminHandoffs` at `19.69 kB`, `ClientDashboard` at `17.31 kB`, and `BumDashboard` at `12.76 kB`.
  - `corepack pnpm exec vitest run src/test/highTrafficRouteHydration.test.ts src/test/clientDashboardLayout.test.ts src/test/clientExportsAccess.test.ts src/test/clientClaimsWorkflow.test.ts` passed `9/9` tests.
  - `pnpm audit --prod --json` reported `0` runtime advisories across `225` production dependencies.
- Live Supabase checks in this session:
  - Project `vaoqvtxqvbptyxddpoju` returned `ACTIVE_HEALTHY` on PostgreSQL `17.6.1.111`, and the live project URL still resolves to `https://vaoqvtxqvbptyxddpoju.supabase.co`.
  - The live `performance_metric_events` schema still matches the intended beacon contract: route data is stored in `page_path`, values in `metric_value`, and timestamps in `created_at`.
  - Live performance telemetry now confirms `241,884` total `performance_metric_events` rows across `73` routes since `2026-05-29 04:15:34+00`, with the latest sample recorded at `2026-06-20 02:48:28+00`.
  - Overall 7-day p75 currently reads `CLS 0.1`, `FCP 428 ms`, `INP 40 ms`, `LCP 2056 ms`, and `TTFB 90.8 ms`.
  - The latest repeated 30-day LCP hotspots verified in-session were `/client/terms 2661 ms` with `444` samples, `/bum/terms 2569 ms` with `275`, `/client/dashboard 2420 ms` with `11,145`, `/bum/dashboard 2399 ms` with `5,202`, `/bum/profile 2318 ms` with `214`, `/client/opportunities/new 2221 ms` with `564`, and `/bum/live-conversations 2220 ms` with `445`.
  - Tiny-sample dynamic detail pages also surfaced above the threshold in the raw route list, but they only carried `1` to `3` samples each and are therefore watchlist noise rather than active backlog work in this pass.
  - Live table counts grounding the current route picture were `opportunity_registrations 83`, `customer_targets 81`, `opportunity_claims 1`, `opportunity_claim_contacts 1`, `bum_contacts 2`, `customer_target_responses 0`, `reverse_opportunities 0`, `teams_meetings 0`, `customer_payment_reports 0`, and `claim_invoices 0`.
  - Live performance advisors still report the remaining `TB-0049` policy and foreign-key debt after the first five saved-item and audit indexes landed.
  - Follow-on Supabase route-specific post-deploy breakdown queries hit `RATE_LIMITED` `429` responses after the initial successful reads, so this pass did not publish a narrower post-`e231cc0` route-slice comparison or force a tracker write.

## Watchlist

- `/client/terms`, `/bum/terms`, and `/client/agreements` still deserve targeted authenticated traces before they become active backlog work. Current telemetry still points more toward heavy static agreement rendering and document framing than toward another obvious list-hydration defect.
- `/client/dashboard`, `/bum/dashboard`, `/bum/profile`, and `/bum/live-conversations` remain the main repeated authenticated shells to compare once enough post-`e231cc0` telemetry accumulates. This pass confirmed live samples on those routes, but not enough clean post-deploy slice data to claim a before-vs-after win.
- The catch-all `vendor` chunk remains the largest browser payload at `487.52 kB` (`141.16 kB` gzip). Keep it measured with a real authenticated waterfall or bundle analyzer before converting it into a separate implementation item.
- `vite@5.4.21` still builds cleanly here, but the current Vite support policy no longer covers the Vite 5 line. Treat a Vite upgrade as maintenance work after the route and advisor backlog, not as a substitute for those fixes.

## Current Standards And Time-Sensitive Notes

- [web.dev LCP](https://web.dev/articles/lcp) says a good LCP target is `2.5 seconds or less` at the 75th percentile across field page loads and was last updated on September 4, 2025.
- [web.dev INP](https://web.dev/articles/inp) says good responsiveness is `200 milliseconds or less` at the 75th percentile and emphasizes quick visual feedback rather than waiting for all async work to finish; the guide was last updated on September 2, 2025.
- [Vite Releases](https://vite.dev/releases) currently lists `vite@8.0` for regular patches, `vite@7.3` for important fixes and security backports, and `vite@6.4` for security backports only. Versions before these are unsupported, while this repo still builds on `vite@5.4.21`.
- [Supabase's April 28, 2026 breaking-change note](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) says new `public` tables may no longer auto-expose to the Data API automatically, the behavior became the default for new projects on May 30, 2026, and existing-project rollout is scheduled for October 30, 2026. Any future route-summary or telemetry tables added for performance work should be checked for explicit grants instead of assuming Data API exposure.

## Access Requests And Evidence Gaps

Material missing access, production or staging telemetry, traces, query plans, or authenticated route evidence needed for a stronger performance review. Mirror durable requests in `docs/consultant-access-needs.md`.

- No authenticated browser trace or waterfall ran for `/client/dashboard`, `/client/opportunities`, `/client/opportunities/new`, `/client/reports`, `/client/payments`, `/client/exports`, `/bum/dashboard`, `/bum/opportunities`, `/bum/live-conversations`, `/client/terms`, `/bum/terms`, or `/admin`.
- No current-session Lighthouse artifact set or bundle-analyzer report was available.
- No current-session query-plan or `pg_stat_statements` access was available to connect the remaining advisor warnings to exact slow statements.
- No current-session admin-versus-non-admin route proof was captured for `/admin/performance`; the live timing evidence came from stored telemetry and seeded fixtures rather than a fresh role walkthrough.
- Supabase advisor and aggregate reads worked initially, but narrower post-deploy route re-queries hit `RATE_LIMITED` `429` errors in the same session. Dependable project-scoped SQL throughput remains a real access gap for recurring performance refreshes.

## Agent Inputs

- Date of run: 2026-06-20
- Files, tests, routes, measurements, Supabase queries or advisors, internet sources, access sources, or commands reviewed:
  - Reviewed `docs/agents/automation-prompts/trusted-bums-daily-performance-engineer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/codex-edit-log.md`, prior `docs/performance-engineering-backlog.md`, `docs/performance-monitoring.md`, `package.json`, `src/lib/portalApi.ts`, `src/pages/client/ClientDashboard.tsx`, `src/pages/bum/BumDashboard.tsx`, `src/pages/bum/BumOpportunities.tsx`, `src/pages/bum/BumLiveConversations.tsx`, `src/pages/admin/AdminEmails.tsx`, `src/test/highTrafficRouteHydration.test.ts`, `supabase/migrations/20260529023000_add_performance_metric_events.sql`, and `supabase/qa_authorization_seed.sql`.
  - Reviewed repo state with `git rev-parse HEAD`, `git status --short`, `git log --oneline --decorate -n 12`, `git diff --stat a17a856..HEAD -- src package.json vite.config.ts docs/performance-monitoring.md docs/business-access-rules.md docs/consultant-access-needs.md docs/agents/consultant-access-needs.md docs/performance-engineering-backlog.md`, targeted `git diff a17a856..HEAD -- ...`, and targeted `rg` plus `nl -ba` source review.
  - Ran `corepack pnpm run build`, `corepack pnpm exec vitest run src/test/highTrafficRouteHydration.test.ts src/test/clientDashboardLayout.test.ts src/test/clientExportsAccess.test.ts src/test/clientClaimsWorkflow.test.ts`, and `pnpm audit --prod --json`.
  - Queried `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 30 --json databaseId,workflowName,headSha,status,conclusion,createdAt,updatedAt,displayTitle` for exact-head hosted evidence on `e231cc0`, confirming `QA` `27857690007`, DreamHost deploy `27857689995`, `Visual UI Audit` `27857691601`, and `E2E Smoke` `27857708006` all passed.
  - Queried Supabase tools for project health, project URL, performance advisors, `performance_metric_events` schema, live telemetry aggregates, live tracker rows `TB-0047` through `TB-0049`, and key table counts in project `vaoqvtxqvbptyxddpoju`.
  - Reviewed current official guidance from [web.dev LCP](https://web.dev/articles/lcp), [web.dev INP](https://web.dev/articles/inp), [Vite Releases](https://vite.dev/releases), and [Supabase's April 28, 2026 Data API exposure change note](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).
- Checks that could not run and why:
  - No authenticated browser timing or route walkthrough ran because this session did not have a ready authenticated browser path for admin, client, or Bum routes.
  - No query-plan or statement-level planner inspection ran because the available Supabase tooling in this session did not expose planner output or `pg_stat_statements`.
  - No Lighthouse artifact set or bundle-analyzer output was available in this session.
  - No narrower post-deploy route-slice or fresh tracker write ran after the initial Supabase reads because follow-on SQL calls began returning `RATE_LIMITED` `429` responses.
