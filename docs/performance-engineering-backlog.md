# Trusted Bums Performance Engineering Backlog

_Last updated: 2026-06-21 by Codex daily performance engineer automation._

## Executive Read

Current `main` head `5af32ed` has clean exact-head hosted proof on the primary host: GitHub `QA` `27885457568`, DreamHost deploy `27885457565`, and hosted `E2E Smoke` `27885474019` all completed `success` on June 20, 2026 UTC against `https://trustedbums.com`. `TB-0047` and `TB-0048` remain correctly closed, and this run refreshed live tracker row `TB-0049` to exact head `5af32ed` at `2026-06-21 07:07:05+00`.

Live Supabase telemetry is now current through `2026-06-21 07:05:17+00` and still shows generally healthy field performance: `performance_metric_events` now stores `259,312` rows across `73` routes since `2026-05-29 04:15:34+00`, while overall 7-day field p75 remains inside current Core Web Vitals thresholds (`LCP 2064 ms`, `INP 40 ms`, `TTFB 109.8 ms`, `CLS 0.1`). The longer 30-day route picture still points at agreement and dashboard shells rather than the already-closed whole-list hydration issue: `/client/terms 2662 ms`, `/bum/terms 2572 ms`, `/client/dashboard 2412 ms`, `/bum/dashboard 2384 ms`, `/bum/profile 2329 ms`, `/client/live-conversations 2264 ms`, `/bum/claims 2241 ms`, `/bum/contacts 2232 ms`, `/client/opportunities/new 2224 ms`, and `/client/opportunities 2219 ms` on 30-day p75 LCP.

The only active performance backlog item is still `TB-0049`, but its scope narrowed again on this head. The admin-email result slice that looked likely to become the next user-facing bottleneck is now partially addressed in both source and live database state: `AdminEmails` now pages result lists in `25`-row slices, and the new admin-email campaign, delivery, event, schedule, and trigger-rule indexes are live. The remaining advisor debt is now concentrated in permissive-policy fan-out plus a smaller set of unindexed admin, shared-mailbox, API-access-key, and finance-adjacent foreign keys.

## Active Recommendations

### P2 - [TB-0049] Finish the remaining advisor debt after the admin-email pagination and index rollout
- Evidence: current source on [`src/pages/admin/AdminEmails.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminEmails.tsx:1) and [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts:1) now pages campaigns, engagement, and deliveries in `25`-row slices instead of warming whole result lists, and live catalog reads confirm the `20260620105033_add_admin_email_result_indexes.sql` index set is already present on `admin_email_campaigns`, `admin_email_deliveries`, `admin_email_events`, `admin_email_schedules`, and `admin_email_trigger_rules`. Current live advisors still report unindexed foreign keys on `admin_email_brand_settings`, `admin_shared_mailbox_send_events`, `api_access_keys`, `bum_payouts`, and `claim_invoices`, plus multiple permissive-policy warnings on `opportunity_questions`, `opportunity_registrations`, `potential_decision_maker_matches`, `profiles`, `reverse_opportunities`, `teams_meetings`, `terms_assignments`, and `training_materials`.
- Why it matters: the prior route-hydration queue is already closed, so the next avoidable latency risk is planner and RLS overhead on the admin, agreement, dashboard, mailbox, and finance surfaces that are now accumulating real field usage. Leaving the advisor queue broad would make the next performance regression harder to attribute and easier to ignore.
- Recommendation: keep `TB-0047` and `TB-0048` closed, then work `TB-0049` in small, business-rule-reviewed batches. Close the one remaining admin-email foreign-key miss first (`admin_email_brand_settings.updated_by`), then prioritize permissive-policy consolidation and any remaining foreign-key indexes only on tables that current route telemetry or admin workflows already exercise (`opportunity_registrations`, `profiles`, `teams_meetings`, `terms_assignments`, `training_materials`, shared mailbox, and finance-path tables). Do not promote zero-volume finance or reverse-opportunity tables ahead of route-trace evidence.
- Acceptance criteria: each retained advisor warning is either removed or explicitly waived with business-rule justification and linked evidence, `TB-0049` stays mapped to exact head `5af32ed`, and the next performance pass narrows the warning set again without reopening the closed route-hydration items.

## Measurement Notes

- Current head and hosted workflow evidence:
  - `git rev-parse HEAD` returned `5af32edeb0cc1290cdbae808207e75276d22a4d6` (`5af32ed`).
  - GitHub `QA` `27885457568`, DreamHost deploy `27885457565`, and hosted `E2E Smoke` `27885474019` all completed `success` on `5af32ed` on June 20, 2026 UTC.
  - A fresh `Visual UI Audit` run for `5af32ed` (`27896715845`) was still `in_progress` during this performance pass, so this run did not treat it as finished exact-head evidence.
  - Live tracker rows now show `TB-0047 CLOSED`, `TB-0048 CLOSED`, and `TB-0049 OPEN`, and this run refreshed `TB-0049` to `github_commit = 5af32ed...` with hosted run ids `27885457568;27885457565;27885474019`.
- Local build and targeted checks on 2026-06-21:
  - `corepack pnpm run build` passed with Vite `5.4.21` and rendered `14` route metadata files. The previous `react-hooks/exhaustive-deps` warning in `ClientOpportunityNew.tsx` is no longer present on this head.
  - Largest emitted browser assets were `vendor-CHdATByo.js` at `487.52 kB` (`141.16 kB` gzip), `index-CLo-MJ6O.js` at `208.43 kB` (`52.75 kB` gzip), `vendor-supabase-Do-SqqqA.js` at `200.97 kB` (`51.99 kB` gzip), `vendor-react-CGTIOkUr.js` at `142.62 kB` (`45.76 kB` gzip), and `vendor-radix-CnBCTfel.js` at `121.01 kB` (`35.39 kB` gzip).
  - The heaviest route chunks relevant to the watchlist were `ClientOpportunityNew` at `53.88 kB`, `AdminEmails` at `44.46 kB`, `BumOpportunities` at `35.20 kB`, `AdminDashboard` at `30.26 kB`, `BumContacts` at `20.38 kB`, `BumProfile` at `20.43 kB`, `AdminHandoffs` at `19.69 kB`, `ClientDashboard` at `17.31 kB`, and `BumDashboard` at `12.76 kB`.
  - `corepack pnpm exec vitest run src/test/highTrafficRouteHydration.test.ts src/test/clientDashboardLayout.test.ts src/test/clientExportsAccess.test.ts src/test/clientClaimsWorkflow.test.ts src/test/uiVisualCleanup.test.ts src/test/e2eSmokeRegression.test.ts` passed `34/34` tests.
  - `pnpm audit --prod --json` reported `0` runtime advisories across `225` production dependencies.
- Live Supabase checks in this session:
  - Project `vaoqvtxqvbptyxddpoju` returned `ACTIVE_HEALTHY` on PostgreSQL `17.6.1.111`, and the live project URL still resolves to `https://vaoqvtxqvbptyxddpoju.supabase.co`.
  - The live `performance_metric_events` schema still matches the intended beacon contract: route data is stored in `page_path`, values in `metric_value`, and timestamps in `created_at`.
  - Live performance telemetry now confirms `259,312` total `performance_metric_events` rows across `73` routes since `2026-05-29 04:15:34+00`, with the latest sample recorded at `2026-06-21 07:05:17.982229+00`.
  - Overall 7-day p75 currently reads `CLS 0.1`, `FCP 444 ms`, `INP 40 ms`, `LCP 2064 ms`, and `TTFB 109.8 ms`.
  - The current repeated 30-day LCP hotspots verified in-session were `/client/terms 2662 ms` with `459` samples, `/bum/terms 2572 ms` with `289`, `/client/dashboard 2412 ms` with `11,870`, `/bum/dashboard 2384 ms` with `5,564`, `/bum/profile 2329 ms` with `234`, `/client/live-conversations 2264 ms` with `453`, `/bum/claims 2241 ms` with `492`, `/bum/contacts 2232 ms` with `739`, `/client/opportunities/new 2224 ms` with `633`, and `/client/opportunities 2219 ms` with `334`.
  - Since exact head `5af32ed` deployed at `2026-06-20 22:13:12+00`, the still-sparse post-head route picture points at the same general shell family rather than a new admin-email regression: `/bum/dashboard 2368 ms` (`23` samples), `/client/dashboard 2363 ms` (`62`), `/client/payments 2309 ms` (`10`), `/client/live-conversations 2148 ms` (`12`), `/bum/opportunities 2132 ms` (`5`), `/client/claims 2110 ms` (`11`), `/client/opportunities/new 2102 ms` (`7`), `/client/agreements 2100 ms` (`9`), `/client/reports 2082 ms` (`11`), and `/client/trainings 2062 ms` (`7`).
  - Current admin-email workload counts are still modest: `23` campaigns, `35` deliveries, `36` events, `11` trigger rules, and `0` schedules. Finance-path rows are still at `0` for both `claim_invoices` and `bum_payouts`, while `opportunity_registrations` remains `83`, `teams_meetings` remains `0`, and `reverse_opportunities` remains `0`.
  - Live catalog reads confirm the new admin-email indexes are present, including `admin_email_campaigns_created_at_idx`, `admin_email_deliveries_created_at_idx`, `admin_email_deliveries_engagement_score_idx`, `admin_email_events_created_at_idx`, `admin_email_schedules_created_at_idx`, and `admin_email_trigger_rules_template_id_idx`.
  - Live performance advisors still report the remaining `TB-0049` policy and foreign-key debt after the admin-email index slice landed.

## Watchlist

- `/client/terms`, `/bum/terms`, `/client/agreements`, and `/client/payments` still deserve targeted authenticated traces before they become active backlog work. Current telemetry points more toward heavy agreement or dashboard framing than toward a new list-hydration defect.
- `/client/dashboard`, `/bum/dashboard`, `/client/live-conversations`, `/bum/claims`, and `/bum/contacts` remain the highest-signal authenticated shells to compare once enough post-`5af32ed` telemetry accumulates.
- The catch-all `vendor` chunk remains the largest browser payload at `487.52 kB` (`141.16 kB` gzip). Keep it measured with a real authenticated waterfall or bundle analyzer before converting it into a separate implementation item.
- `AdminEmails` grew slightly to `44.46 kB` while the page also gained server-backed pagination. Keep it as a watchlist surface, not a new backlog item, until field traces show the current batching still regresses under larger campaign history.
- `vite@5.4.21` still builds cleanly here, but the current Vite support policy no longer covers the Vite 5 line. Treat a Vite upgrade as maintenance work after the route and advisor backlog, not as a substitute for those fixes.

## Current Standards And Time-Sensitive Notes

- [web.dev LCP](https://web.dev/articles/lcp) says a good LCP target is `2.5 seconds or less` at the 75th percentile across field page loads and notes that LCP includes TTFB and redirect/setup costs; the guide was last updated on September 4, 2025.
- [web.dev INP](https://web.dev/articles/inp) says good responsiveness is `200 milliseconds or less` at the 75th percentile and that field data should be the starting point for INP work because lab runs rarely reproduce the same interactions; the guide says this directly in the current article.
- [Vite Releases](https://vite.dev/releases) currently lists `vite@8.0` for regular patches, `vite@7.3` for important fixes and security backports, and `vite@6.4` for security backports only. Versions before these are unsupported, while this repo still builds on `vite@5.4.21`.
- [Supabase's April 28, 2026 breaking-change note](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) says new `public` tables may no longer auto-expose to the Data API automatically, the behavior became the default for new projects on May 30, 2026, and existing-project rollout is scheduled for October 30, 2026. Any future route-summary or telemetry tables added for performance work should be checked for explicit grants instead of assuming Data API exposure.

## Access Requests And Evidence Gaps

Material missing access, production or staging telemetry, traces, query plans, or authenticated route evidence needed for a stronger performance review. Mirror durable requests in `docs/consultant-access-needs.md`.

- No authenticated browser trace or waterfall ran for `/client/dashboard`, `/client/opportunities`, `/client/opportunities/new`, `/client/reports`, `/client/payments`, `/client/exports`, `/bum/dashboard`, `/bum/opportunities`, `/bum/live-conversations`, `/client/terms`, `/bum/terms`, or `/admin`.
- No current-session Lighthouse artifact set or bundle-analyzer report was available.
- No current-session query-plan or `pg_stat_statements` access was available to connect the remaining advisor warnings to exact slow statements.
- No current-session admin-versus-non-admin route proof was captured for `/admin/performance`; the live timing evidence came from stored telemetry and aggregate SQL rather than a fresh role walkthrough.
- The current-head `Visual UI Audit` run was still in progress during this pass, so no new hosted screenshot artifact was available for route-by-route visual corroboration.

## Agent Inputs

- Date of run: 2026-06-21
- Files, tests, routes, measurements, Supabase queries or advisors, internet sources, access sources, or commands reviewed:
  - Reviewed `docs/agents/automation-prompts/trusted-bums-daily-performance-engineer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/codex-edit-log.md`, prior `docs/performance-engineering-backlog.md`, `docs/performance-monitoring.md`, `package.json`, `vite.config.ts`, `src/lib/portalApi.ts`, `src/pages/admin/AdminEmails.tsx`, `supabase/migrations/20260620105033_add_admin_email_result_indexes.sql`, and `supabase/migrations/20260620152414_restore_admin_dashboard_summary_definer.sql`.
  - Reviewed repo state with `git rev-parse HEAD`, `git status --short`, `git log --oneline --decorate -n 12`, `git diff --stat e231cc0..HEAD -- src package.json vite.config.ts docs/performance-monitoring.md docs/performance-engineering-backlog.md docs/consultant-access-needs.md docs/agents/consultant-access-needs.md supabase`, targeted `git diff e231cc0..HEAD -- src/lib/portalApi.ts src/pages/admin/AdminEmails.tsx supabase/migrations/20260620105033_add_admin_email_result_indexes.sql supabase/migrations/20260620152414_restore_admin_dashboard_summary_definer.sql`, and targeted `rg` plus `sed` source review.
  - Ran `corepack pnpm run build`, `corepack pnpm exec vitest run src/test/highTrafficRouteHydration.test.ts src/test/clientDashboardLayout.test.ts src/test/clientExportsAccess.test.ts src/test/clientClaimsWorkflow.test.ts src/test/uiVisualCleanup.test.ts src/test/e2eSmokeRegression.test.ts`, and `pnpm audit --prod --json`.
  - Queried `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 30 --json databaseId,workflowName,headSha,status,conclusion,createdAt,updatedAt,displayTitle` for exact-head hosted evidence on `5af32ed`, confirming `QA` `27885457568`, DreamHost deploy `27885457565`, and `E2E Smoke` `27885474019` all passed while `Visual UI Audit` `27896715845` was still running.
  - Queried Supabase tools for project health, performance advisors, `performance_metric_events` schema, live telemetry aggregates, current index presence on admin-email tables, live tracker rows `TB-0047` through `TB-0049`, live admin-email and route-adjacent table counts, and a tracker refresh for `TB-0049` on project `vaoqvtxqvbptyxddpoju`.
  - Reviewed current official guidance from [web.dev LCP](https://web.dev/articles/lcp), [web.dev INP](https://web.dev/articles/inp), [Vite Releases](https://vite.dev/releases), and [Supabase's April 28, 2026 Data API exposure change note](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).
- Checks that could not run and why:
  - No authenticated browser timing or route walkthrough ran because this session did not have a ready authenticated browser path for admin, client, or Bum routes.
  - No query-plan or statement-level planner inspection ran because the available Supabase tooling in this session did not expose planner output or `pg_stat_statements`.
  - No Lighthouse artifact set or bundle-analyzer output was available in this session.
  - No completed current-head `Visual UI Audit` artifact was available during the run because workflow `27896715845` was still `in_progress`.
