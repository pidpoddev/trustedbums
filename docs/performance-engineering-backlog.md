# Trusted Bums Performance Engineering Backlog

_Last updated: 2026-06-20 by Codex TB-0049 safe-index pass._

## Executive Read

Current `main` head `a17a856` has clean exact-head hosted proof: GitHub `QA` run `27798687806`, DreamHost deploy run `27798687708`, and hosted `E2E Smoke` run `27798711531` all succeeded on June 19, 2026 UTC. `TB-0048` remains closed on this head: `src/components/PortalGlobalSearch.tsx` still waits for a committed query of at least two characters and no longer warms search datasets on focus or mobile-sheet open.

Live Supabase telemetry narrowed the active queue to `TB-0047` and `TB-0049`, but the route-shape story was broader than the earlier client-only framing. `performance_metric_events` stored `228,648` rows across `73` routes since 2026-05-29, and overall 7-day field p75 stayed inside Core Web Vitals thresholds (`LCP 2096 ms`, `INP 40 ms`, `TTFB 83.3 ms`, `CLS 0.1`). The slowest operational shells were split across both client and Bum flows: `/client/dashboard 2428 ms`, `/bum/dashboard 2408 ms`, `/bum/profile 2312 ms`, `/client/opportunities/new 2220 ms`, `/bum/live-conversations 2220 ms`, `/client/opportunities 2212 ms`, and `/bum/opportunities 2196 ms`.

`TB-0047` is now implemented in source pending push and hosted evidence. `src/pages/client/ClientDashboard.tsx` now reads a route-scoped `getClientDashboardSummary()` instead of five list helpers, `src/pages/bum/BumDashboard.tsx` now reads `getBumDashboardSummary()` instead of marketplace/prospect/reverse/claim lists, client claim reads are company-scoped, client exports scope meetings by client company, and Bum opportunities/live-conversations use capped first-render reads. Local proof passed: `corepack pnpm exec vitest run src/test/highTrafficRouteHydration.test.ts src/test/clientDashboardLayout.test.ts src/test/clientExportsAccess.test.ts src/test/clientClaimsWorkflow.test.ts`, `corepack pnpm run build`, and `corepack pnpm exec tsc --noEmit`.

`/client/terms 2657 ms`, `/bum/terms 2567 ms`, and `/client/agreements 2200 ms` still deserve watchlist attention, but current source points more at heavy static agreement rendering than another obvious list-hydration defect. Keep those routes out of the active queue until authenticated traces show a distinct fix path.

## Active Recommendations

### P1 - [TB-0047] Move high-traffic client and Bum routes off whole-list hydration and broad list helpers
- Evidence: Implemented locally on 2026-06-19. `src/lib/portalApi.ts` now exposes `getClientDashboardSummary()` and `getBumDashboardSummary()` backed by count queries and small route-specific slices; list helpers used by high-traffic routes now accept `limit` or client company scope where the route still needs rows. `src/pages/client/ClientDashboard.tsx` no longer imports `listOpportunityRegistrations()`, `listCustomerPaymentReports()`, `listClaimInvoices()`, `listClientReverseOpportunities()`, or `listCustomerTargetResponses()`. `src/pages/bum/BumDashboard.tsx` no longer imports `useIntroClaims()`, `listMarketplaceOpportunities()`, `listOwnProspectRecommendations()`, or `listOwnReverseOpportunities()`. `src/pages/bum/BumOpportunities.tsx` caps marketplace, customer target, saved item, contact picker, and claim-summary reads at first render; `src/pages/bum/BumLiveConversations.tsx` caps thread, target, and meeting reads; and client claim/payment/export routes now pass client company scope.
- Why it matters: These route shells are still paying first-render cost out of proportion to the live dataset size. If they keep hydrating broad lists up front, latency will scale with marketplace growth instead of with the narrow slice each screen actually needs.
- Recommendation: Push the implementation, attach hosted QA/deploy evidence to the tracker, then watch follow-up field telemetry for transfer and LCP movement on the current client and Bum hotspots.
- Acceptance criteria: Source-level route-shape acceptance is met locally and guarded by `src/test/highTrafficRouteHydration.test.ts`. Close after the commit is pushed, hosted checks pass, and tracker evidence links include the pushed commit plus relevant CI run IDs.

- Evidence: A first low-risk index-only slice was applied live on 2026-06-20 and mirrored in `supabase/migrations/20260620012000_add_route_advisor_indexes.sql`. The live database now has covering btree indexes for `audit_events.company_id`, `bum_contacts.customer_target_id`, `bum_saved_items.client_company_id`, `bum_saved_items.customer_target_id`, and `bum_saved_items.opportunity_registration_id`. No RLS, grants, policies, table definitions, or destructive schema changes were made. The broader item stays open because Supabase advisors still need a separate business-rule review for multiple-permissive-policy warnings on `opportunity_registrations`, `profiles`, `reverse_opportunities`, `teams_meetings`, `terms_assignments`, and `training_materials`, plus separate prioritization for the remaining finance-path, admin-email, shared-mailbox, and API-access-key index warnings.
- Why it matters: Route shape is still the primary bottleneck, but once finance, meetings, saved items, and mailbox traffic fill in, the remaining FK and permissive-policy debt will become the next avoidable source of planner cost and route latency.
- Recommendation: Treat the five applied FK indexes as closed sub-work, then review the remaining policy/RLS warnings with explicit access rules before changing them. Keep the admin-email, shared-mailbox, and API-access-key index debt out of the active performance queue unless traces show direct user-facing impact.
- Acceptance criteria: The route-adjacent FK and permissive-policy warnings are either cleared or explicitly waived with business-rule justification, and the next performance pass no longer needs to carry the same route-linked advisor findings as open debt.

## Measurement Notes

- Current head and hosted workflow evidence:
  - `git rev-parse HEAD` returned `a17a85639a1b24dfda36da87d763eb4ecd3457af` (`a17a856`).
  - GitHub `QA` run `27798687806`, DreamHost deploy run `27798687708`, and hosted `E2E Smoke` run `27798711531` all completed successfully on `a17a856` on June 19, 2026 UTC.
  - `TB-0048` remains closed on current head: `src/components/PortalGlobalSearch.tsx` still waits for a typed query of at least two characters and no longer triggers search fetches on focus or mobile-sheet open.
- Local build and targeted checks on 2026-06-19:
  - `corepack pnpm run build` passed with Vite `5.4.21` and rendered `14` route metadata files. ESLint still reports one non-blocking `react-hooks/exhaustive-deps` warning in `src/pages/client/ClientOpportunityNew.tsx` about the `opportunities` dependency in the linked-claim focus effect.
  - Largest emitted browser assets were `vendor-CHdATByo.js` at `487.52 kB` (`141.16 kB` gzip), `vendor-supabase-Do-SqqqA.js` at `200.97 kB` (`51.99 kB` gzip), `index-Dpq0nNdc.js` at `201.09 kB` (`51.22 kB` gzip), `vendor-react-CGTIOkUr.js` at `142.62 kB` (`45.76 kB` gzip), and `vendor-radix-CnBCTfel.js` at `121.01 kB` (`35.39 kB` gzip).
  - Route chunks most relevant to the active queue were `ClientOpportunityNew` at `53.82 kB`, `BumOpportunities` at `35.12 kB`, `AdminDashboard` at `30.26 kB`, `BumOpportunityDetail` at `24.77 kB`, `ClientPayments` at `23.06 kB`, `BumProfile` at `20.43 kB`, `ClientDashboard` at `18.33 kB`, `BumDashboard` at `13.14 kB`, and `BumLiveConversations` at `7.77 kB`.
  - `corepack pnpm exec vitest run src/test/performanceBeacon.test.ts src/test/clientDashboardLayout.test.ts src/test/clientClaimsWorkflow.test.ts src/test/clientOpportunityBulkTools.test.ts src/test/clientOpportunityDelete.test.ts src/test/clientExportsAccess.test.ts src/test/clientBumOriginatedOpportunities.test.ts src/test/accessBoundaryRegression.test.ts src/test/googleAnalyticsConsent.test.tsx src/test/claimDeclineWorkflow.test.ts src/test/opportunityClaimStakeholders.test.ts src/test/bumContactsMutationContract.test.ts src/test/firstLoginWalkthrough.test.ts` passed `41/41` tests.
  - `pnpm audit --prod --json` reported `0` runtime advisories across `225` production dependencies.
- Live Supabase checks in this session:
  - Project `vaoqvtxqvbptyxddpoju` returned `ACTIVE_HEALTHY` on PostgreSQL `17.6.1.111`, and the live project URL still resolves to `https://vaoqvtxqvbptyxddpoju.supabase.co`.
  - Live performance telemetry now confirms `228,648` total `performance_metric_events` rows across `73` routes since 2026-05-29, with the latest sample recorded at `2026-06-19 07:04:29+00`.
  - Overall 7-day p75 stayed at `LCP 2096 ms`, `FCP 408 ms`, `INP 40 ms`, `TTFB 83.3 ms`, and `CLS 0.1`.
  - The latest live 30-day LCP p75 route metrics were `/client/terms 2657 ms` with `436` samples, `/bum/terms 2567 ms` with `266`, `/client/dashboard 2428 ms` with `10,622`, `/bum/dashboard 2408 ms` with `4,907`, `/bum/profile 2312 ms` with `205`, `/client/opportunities/new 2220 ms` with `519`, `/bum/live-conversations 2220 ms` with `418`, `/client/opportunities 2212 ms` with `276`, `/client/agreements 2200 ms` with `596`, `/bum/opportunities 2196 ms` with `828`, `/client/live-conversations 2196 ms` with `311`, `/admin 2192 ms` with `5,572`, and `/admin/performance 1926 ms` with `195`.
  - Stored `/client/targets` telemetry remains historical only in this context: current routing now sends that workflow through `/client/opportunities`.
  - Live table counts grounding the source review were `opportunity_registrations 83`, `customer_targets 81`, `opportunity_claims 1`, `opportunity_claim_contacts 1`, `bum_contacts 2`, and `0` current rows each for `customer_target_responses`, `reverse_opportunities`, `teams_meetings`, `customer_payment_reports`, and `claim_invoices`.
  - Live performance advisors still report route-adjacent FK and permissive-policy debt plus newer admin-email, shared-mailbox, and API-access-key index debt.
  - Current tracker rows `TB-0047` and `TB-0049` were refreshed to exact head `a17a856`; `TB-0048` remains closed.
- Live Supabase TB-0049 safe-index checks on 2026-06-20:
  - Project `vaoqvtxqvbptyxddpoju` returned `ACTIVE_HEALTHY` on PostgreSQL `17.6.1.111`.
  - Added and verified live btree indexes: `audit_events_company_id_idx`, `bum_contacts_customer_target_id_idx`, `bum_saved_items_client_company_id_idx`, `bum_saved_items_customer_target_id_idx`, and `bum_saved_items_opportunity_registration_id_idx`.
  - Catalog proof showed each index valid and ready on the intended table/column. No RLS, policy, grant, or destructive schema changes were applied in this pass.

## Watchlist

- `/client/terms`, `/bum/terms`, and `/client/agreements` deserve targeted traces before they become active backlog work. Current telemetry shows the terms routes over the `2.5 s` LCP target, but current source points mostly at static agreement rendering and downloads rather than another obvious route-start data fan-out defect.
- `/admin` is now inside the main hotspot list at `2192 ms` p75 LCP, but it already mixes `getAdminDashboardSummary()` with many admin-only list calls. Keep it on the watchlist until authenticated traces show whether the fix path belongs with the shared route-hydration work or with admin-only summary consolidation.
- The catch-all `vendor` chunk remains the largest browser payload at `487.52 kB` (`141.16 kB` gzip). Keep it measured with an authenticated waterfall or bundle analyzer before turning it into a separate implementation item.
- `vite@5.4.21` still builds cleanly here, but the current Vite support policy no longer covers the Vite 5 line. Treat any Vite upgrade as a maintenance track after the route and data-shape backlog, not as a substitute for it.

## Current Standards And Time-Sensitive Notes

- [web.dev LCP](https://web.dev/articles/lcp) says a good LCP target is `2.5 seconds or less` at the 75th percentile and was last updated on September 4, 2025.
- [web.dev INP](https://web.dev/articles/inp) says good responsiveness is `200 milliseconds or less` at the 75th percentile and was last updated on September 2, 2025.
- [Vite Releases](https://vite.dev/releases) currently lists `vite@8.0` for regular patches, `vite@7.3` for important fixes and security backports, and `vite@6.4` for security backports only. Versions before these are unsupported, while this repo still builds on `vite@5.4.21`.
- [Supabase's April 28, 2026 breaking-change note](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) says new `public` tables may no longer auto-expose to the Data API automatically, the behavior became the default for new projects on May 30, 2026, and existing-project rollout is scheduled for October 30, 2026. Any future route-summary or telemetry tables added for performance work should be checked for explicit grants instead of assuming Data API exposure.

## Access Requests And Evidence Gaps

Material missing access, production or staging telemetry, traces, query plans, or authenticated route evidence needed for a stronger performance review. Mirror durable requests in `docs/consultant-access-needs.md`.

- No authenticated browser trace or waterfall ran for `/client/dashboard`, `/client/opportunities`, `/client/opportunities/new`, `/client/reports`, `/client/payments`, `/client/exports`, `/bum/dashboard`, `/bum/opportunities`, `/bum/live-conversations`, `/client/terms`, `/bum/terms`, or `/admin`.
- No current-session Lighthouse artifact set or bundle-analyzer report was available.
- No current-session query-plan or `pg_stat_statements` access was available to connect the advisor warnings to exact slow statements.
- No current-session admin-versus-non-admin route proof was captured for `/admin/performance`; the live timing evidence came from stored telemetry rather than a fresh role walkthrough.

## Agent Inputs

- Date of run: 2026-06-19
- Files, tests, routes, measurements, Supabase queries or advisors, internet sources, access sources, or commands reviewed:
  - Reviewed `docs/agents/automation-prompts/trusted-bums-daily-performance-engineer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/codex-edit-log.md`, prior `docs/performance-engineering-backlog.md`, `docs/performance-monitoring.md`, `package.json`, `vite.config.ts`, `src/lib/portalApi.ts`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientReports.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/client/ClientOpportunityNew.tsx`, `src/pages/client/ClientPayments.tsx`, `src/pages/client/ClientTerms.tsx`, `src/pages/client/ClientAgreements.tsx`, `src/pages/bum/BumDashboard.tsx`, `src/pages/bum/BumOpportunities.tsx`, `src/pages/bum/BumLiveConversations.tsx`, `src/pages/bum/BumProfile.tsx`, `src/hooks/use-intro-claims.ts`, and `src/pages/admin/AdminDashboard.tsx`.
  - Reviewed repo state with `git rev-parse HEAD`, `git status --short`, `git log --oneline --decorate -n 12`, `git diff --stat 57231bf..HEAD -- src package.json vite.config.ts docs/performance-monitoring.md docs/business-access-rules.md docs/consultant-access-needs.md docs/agents/consultant-access-needs.md docs/performance-engineering-backlog.md`, targeted `git diff 57231bf..HEAD -- ...`, targeted `rg`, and targeted `nl -ba` source review.
  - Ran `corepack pnpm run build`, `corepack pnpm exec vitest run src/test/performanceBeacon.test.ts src/test/clientDashboardLayout.test.ts src/test/clientClaimsWorkflow.test.ts src/test/clientOpportunityBulkTools.test.ts src/test/clientOpportunityDelete.test.ts src/test/clientExportsAccess.test.ts src/test/clientBumOriginatedOpportunities.test.ts src/test/accessBoundaryRegression.test.ts src/test/googleAnalyticsConsent.test.tsx src/test/claimDeclineWorkflow.test.ts src/test/opportunityClaimStakeholders.test.ts src/test/bumContactsMutationContract.test.ts src/test/firstLoginWalkthrough.test.ts`, and `pnpm audit --prod --json`.
  - Queried `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json databaseId,workflowName,headSha,status,conclusion,createdAt,updatedAt,displayTitle` for exact-head hosted evidence on `a17a856`, confirming `QA` `27798687806`, deploy `27798687708`, and `E2E Smoke` `27798711531` all passed.
  - Queried Supabase tools for project health, project URL, performance advisors, `performance_metric_events` schema, live telemetry aggregates, focused route metrics, live table counts, and current tracker rows in project `vaoqvtxqvbptyxddpoju`.
  - Reviewed current official guidance from [web.dev LCP](https://web.dev/articles/lcp), [web.dev INP](https://web.dev/articles/inp), [Vite Releases](https://vite.dev/releases), and [Supabase's April 28, 2026 Data API exposure change note](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).
- Checks that could not run and why:
  - No authenticated browser timing or route walkthrough ran because this session did not have a ready authenticated browser path for admin, client, or Bum routes.
  - No query-plan or statement-level planner inspection ran because the available Supabase tooling in this session did not expose planner output or `pg_stat_statements`.
  - No Lighthouse artifact set or bundle-analyzer output was available in this session.
