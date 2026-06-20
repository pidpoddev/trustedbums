# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-20 by Codex daily lead developer automation._

## Executive Read

Current release status is `HOTFIX-FORWARD` for `main` head `e231cc07ee6959bc8eac9d04ed3b68b80d76f6c4`.

- Completed work:
  - Exact-head hosted proof is green on `e231cc0`: GitHub `QA` `27857690007`, DreamHost deploy `27857689995`, `Visual UI Audit` `27857691601`, and `E2E Smoke` `27857708006` all completed `success`.
  - The overnight specialist wave correctly removed stale lead work from the active queue. Live tracker or exact-head backlog truth now keeps `TB-0027`, `TB-0047`, `TB-0051`, `TB-0065`, `TB-0089`, `TB-0102`, and `TB-0113` out of the current implementation queue.
  - Current lead-critical open items are now narrower: `TB-0097` same-head schema parity for `deal_registration_config`, `TB-0019` stale Code Review marker, `TB-0060` authenticated-mobile privacy-control overlap, `TB-0040` remaining `Prospect` wording seam, `TB-0046` bounded admin-email drilldowns, `TB-0049` remaining advisor debt, `TB-0052` finance exception readiness, `TB-0024` runner-side external DNS drift, and access-blocked `TB-0023`.
- Current priorities:
  1. Restore same-head release truth by proving or applying the missing production schema and migration-ledger parity behind `TB-0097`.
  2. Refresh exact-head Code Review on `e231cc0` for `TB-0019` immediately after schema parity is proven.
  3. Keep the next implementation wave small and current-head only: `TB-0060`, `TB-0040`, and `TB-0046`, then `TB-0049` and `TB-0052`.
- Current blockers:
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still approves older head `b2c6c44`, so release evidence is mixed-surface until `TB-0019` is refreshed.
  - Production Supabase still lacks `public.companies.deal_registration_config`, and the live migration ledger is missing repo rows `20260611195500` and `20260620012000`, so `TB-0097` remains the real release blocker even though hosted proof is green.
  - `https://rcdl.tplinkdns.com` still fails runner-side TLS or app-shell proof, so `TB-0024` stays separate from primary-host release evidence.
  - `TB-0023` still lacks direct Auth-settings visibility for leaked-password protection.
- Recommended next actions:
  1. Hotfix-forward or otherwise prove the missing live schema and migration parity on project `vaoqvtxqvbptyxddpoju`, then rerun the intended `CLIENT_ADMIN` and `CLIENT_IT` role proof on the same head.
  2. Refresh exact-head Code Review on `e231cc0` before any `GO` claim.
  3. After release truth is clean, implement the remaining narrow product-facing queue in this order: `TB-0060`, `TB-0040`, `TB-0046`, `TB-0049`, `TB-0052`.

## Recommendation Classification

- `TB-0097 Same-head schema parity for client profile and beta setup`: `READY`.
  - Reason: exact-head source depends on `companies.deal_registration_config`, but live production still lacks the column and the matching migration-ledger rows.
  - Next owner: Lead Developer with Product Ops, Release Verification, and QA follow-through.
  - Implementation queue: yes.
- `TB-0019 Refresh exact-head Code Review for e231cc0`: `BLOCKED BY ANOTHER SPECIALIST`.
  - Reason: hosted proof is current, but the pre-main review marker is still pinned to `b2c6c44`.
  - Next owner: Code Review Agent.
  - Implementation queue: no.
- `TB-0060 Re-home the authenticated-mobile Privacy choices control`: `READY`.
  - Reason: current exact-head visual proof still shows the fixed privacy launcher intruding into live authenticated mobile content after the earlier chat-launcher cleanup narrowed the defect.
  - Next owner: Lead Developer with UI, Accessibility, and UX review.
  - Implementation queue: yes.
- `TB-0040 Finish the remaining Prospect wording seam`: `READY`.
  - Reason: current head still shows `Prospect` microcopy in Bum contacts, Bum prospects, portal search, and admin reports even though the broader terminology cleanup already shipped.
  - Next owner: Lead Developer with Content Copyeditor review.
  - Implementation queue: yes.
- `TB-0046 Keep admin-email KPIs aggregate-first and add bounded drilldowns`: `READY`.
  - Reason: the headline KPI fix is shipped, but the default drilldowns are still recipient-heavy and capped at `50` rows.
  - Next owner: Lead Developer with Data review.
  - Implementation queue: yes.
- `TB-0049 Clear the remaining route-adjacent advisor debt`: `READY`.
  - Reason: `TB-0047` is already closed, but live advisors still show policy fan-out and foreign-key debt around route-adjacent, mailbox, admin-email, API-access-key, and finance paths.
  - Next owner: Lead Developer with Performance and Security review.
  - Implementation queue: yes.
- `TB-0052 Prepare finance exception handling before live exception volume arrives`: `READY`.
  - Reason: finance-safe reads exist, but there is still no owned workflow for dispute, hold, reversal, or allocation-rescue states once real volume appears.
  - Next owner: Lead Developer with Product Ops review.
  - Implementation queue: later.
- `TB-0024 Resolve or retire rcdl.tplinkdns.com from the cross-agent contract`: `BLOCKED BY ANOTHER SPECIALIST`.
  - Reason: runner-side trust checks still fail on the named external target while the primary host is healthy.
  - Next owner: Trust & Reputation, Release Verification, Agent Operations, and the infrastructure owner.
  - Implementation queue: no.
- `TB-0023 Enable leaked-password protection or record a current waiver`: `BLOCKED BY ACCESS`.
  - Reason: security evidence remains source-backed plus partial-live because the current session still lacks direct Auth-settings visibility.
  - Next owner: Security Engineer plus the Supabase Auth settings owner.
  - Implementation queue: no.
- `TB-0027`, `TB-0089`, and `TB-0102` older control-plane drift items: `STALE`.
  - Reason: the current head no longer reproduces the old live function-drift story as the primary blocker; the active release problem is schema parity plus stale Code Review, not the prior function drift batch.
  - Next owner: none unless fresh same-head live evidence reopens them.
  - Implementation queue: no.
- `TB-0047`, `TB-0051`, `TB-0065`, and `TB-0113` prior lead items: `STALE`.
  - Reason: current tracker or specialist truth already closes them on current-head evidence, so they should not remain in the lead queue.
  - Next owner: none unless newer evidence contradicts the closeout.
  - Implementation queue: no.
- BlackCurrant unowned opportunity volume and relationship supply: `BLOCKED BY ACCESS`.
  - Reason: company-wide rules still treat the queue as a P0 operating risk, but this lead pass still had no CRM or owner-state export to narrow it truthfully.
  - Next owner: CEO, Ops, Supply, and Staff with CRM access.
  - Implementation queue: no engineering implementation until owner-state truth is visible.

## Recommended Implementation Queue

### P0 - Restore same-head schema parity and release truth on `e231cc0`
- Classification: `READY`.
- Source: [docs/release-verification-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md), [docs/qa-test-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md), [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), live SQL on project `vaoqvtxqvbptyxddpoju`, and current exact-head tracker rows for `TB-0019` and `TB-0097`.
- Why now: this is the real release blocker. The primary host, browser smoke, and visual proof are green, but the live schema behind the client beta setup flow is not current.
- Recommended fix: apply or prove the missing `deal_registration_config` schema change and missing migration-ledger rows on production, then rerun the intended role proof and refresh exact-head Code Review before any `GO` claim.
- Likely files/routes: [supabase/migrations/20260611195500_add_client_deal_registration_config.sql](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260611195500_add_client_deal_registration_config.sql), [supabase/migrations/20260620012000_add_route_advisor_indexes.sql](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260620012000_add_route_advisor_indexes.sql), [`scripts/verify-supabase-release-provenance.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/verify-supabase-release-provenance.mjs), [src/pages/client/ClientProfile.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [src/pages/admin/AdminClients.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx), [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), release docs, and the Code Review marker.
- Dependencies/risks: do not promote release back to `GO` from hosted green alone. The current escape was a live-schema gap surviving a provenance check that only printed local migration filenames.
- Acceptance criteria: live SQL shows `public.companies.deal_registration_config`, the live migration ledger contains the missing repo rows, exact-head role proof passes for `CLIENT_ADMIN` and `CLIENT_IT` with deny-path checks for unrelated client roles, and [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) is refreshed to `e231cc0`.
- Validation: live SQL against `information_schema.columns` and `supabase_migrations.schema_migrations`, exact-head hosted `QA` or smoke follow-up as needed, refreshed Code Review marker, and same-head tracker closeout notes for `TB-0019` and `TB-0097`.

### P1 - Clear the remaining authenticated-mobile privacy-control overlap
- Classification: `READY`.
- Source: [docs/ui-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ui-optimization-backlog.md), [docs/accessibility-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/accessibility-backlog.md), exact-head `Visual UI Audit` `27857691601`, and current tracker row `TB-0060`.
- Why now: this is the sharpest remaining product-facing exact-head defect after release truth. The defect is current, visual, cross-role, and already narrowed to one controllable surface.
- Recommended fix: make the `Privacy choices` control route-aware on authenticated mobile shells so it uses an intentional support lane or menu surface instead of a fixed bottom-right overlap.
- Likely files/routes: [src/components/ConsentManager.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/ConsentManager.tsx), [src/layouts/AdminLayout.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/AdminLayout.tsx), [src/layouts/ClientLayout.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/ClientLayout.tsx), [src/layouts/BumLayout.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/BumLayout.tsx), [src/components/ConversationDock.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/ConversationDock.tsx), [src/test/uiVisualCleanup.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/uiVisualCleanup.test.ts), and [src/test/conversationDockLayout.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/conversationDockLayout.test.ts).
- Dependencies/risks: admin still has both privacy and chat surfaces to coordinate; client and Bum shells now primarily need privacy-control clearance only.
- Acceptance criteria: fresh exact-head mobile screenshots for `/admin`, `/admin/scrum`, `/admin/handoffs`, `/client/opportunities/new`, and one Bum workflow route show no privacy-chip overlap with tabs, filters, queue transitions, cards, or form controls.
- Validation: targeted layout tests plus a fresh hosted `Visual UI Audit` artifact review on the implementing head.

### P1 - Finish the remaining Prospective Client terminology cleanup
- Classification: `READY`.
- Source: [docs/content-copyeditor-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md), current `TB-0040`, and current exact-head source review.
- Why now: the broader terminology migration is already shipped, so the remaining work is small, exact, and cheap to close cleanly.
- Recommended fix: replace the remaining visible `Prospect` strings on Bum sourcing and admin-report surfaces with the agreed `Prospective Client` language, then extend the copy guardrail to cover the residual seams.
- Likely files/routes: [src/pages/bum/BumContacts.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), [src/pages/bum/BumProspects.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [src/components/PortalGlobalSearch.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), [src/pages/admin/AdminReports.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminReports.tsx), and [src/test/uiVisualCleanup.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/uiVisualCleanup.test.ts).
- Dependencies/risks: preserve object-model meaning and avoid introducing new mismatches between user-facing labels and internal enum names.
- Acceptance criteria: the remaining visible `Prospect` wording seam is gone on exact head, and the terminology guardrail rejects regressions on the covered sourcing surfaces.
- Validation: targeted terminology grep plus focused Vitest on current copy guardrails.

### P2 - Finish the remaining admin-email reporting and backend debt
- Classification: `READY`.
- Source: [docs/data-analytics-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/data-analytics-backlog.md), [docs/performance-engineering-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/performance-engineering-backlog.md), live tracker rows `TB-0046` and `TB-0049`, and current source on admin email plus route-summary paths.
- Why now: the high-confidence user-facing defects are narrower than they were yesterday, so the next engineering-quality wins are bounded reporting cleanup and the remaining low-risk advisor debt.
- Recommended fix: keep admin-email headline cards aggregate-first, add bounded drilldowns and filters, then clear the retained advisor warnings in small route-reviewed batches rather than reopening the already-closed `TB-0047` work.
- Likely files/routes: [supabase/functions/send-admin-email/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/send-admin-email/index.ts), [src/pages/admin/AdminEmails.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminEmails.tsx), [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), and the next advisor or index migrations under [supabase/migrations](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations).
- Dependencies/risks: keep recipient-level data deliberate and admin-only; do not conflate remaining planner or RLS advisor cleanup with the already-closed route-hydration fix.
- Acceptance criteria: admin-email KPI cards stay independent of capped recipient lists, drilldowns are bounded and filtered, and the next performance pass still keeps `TB-0047` closed while narrowing `TB-0049`.
- Validation: focused admin-email tests, live advisor review, and exact-head hosted regression proof when implementation lands.

### P2 - Prepare finance exception handling before real exception volume arrives
- Classification: `READY`.
- Source: [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md) and live tracker row `TB-0052`.
- Why now: the current live finance volume is still zero, which makes this the right moment to shape the exception lane before it becomes an operator fire drill.
- Recommended fix: define the admin-owned dispute, hold, reversal, failed-payment, and allocation-rescue workflow while preserving Client Finance as a finance-safe reporting role rather than an override role.
- Likely files/routes: [src/pages/client/ClientPayments.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientPayments.tsx), [src/pages/client/ClientExports.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientExports.tsx), [src/pages/bum/BumEarnings.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumEarnings.tsx), [src/pages/admin/AdminHandoffs.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminHandoffs.tsx), and the supporting finance-safe projections in [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts).
- Dependencies/risks: keep business-access rules aligned so Client Finance stays finance-safe while Admin owns exception rescue and overrides.
- Acceptance criteria: the first real finance exception has an owner, next action, due date, and reason, and the access model still limits Client Finance to finance-safe context.
- Validation: business-access review, focused role tests, and a seeded exception walkthrough when the first safe QA scenario exists.

## Fix Playbooks

- Release recovery playbook:
  - Treat `TB-0097` plus `TB-0019` as the real current release gate.
  - Fix or prove the live schema first, then refresh exact-head Code Review, then close release truth on the same SHA and run set.
  - Do not reuse the older `TB-0027` or `TB-0089` story as shorthand for the current blocker unless fresh same-head live evidence reproduces it.
- UI cleanup playbook:
  - Keep the remaining authenticated-mobile overlap work isolated to `TB-0060`.
  - Use hosted visual proof to confirm the privacy-chip placement fix instead of inferring closure from local spacing changes alone.
- Reporting and backend debt playbook:
  - Keep `TB-0046` and `TB-0049` separate: one is admin-email operator clarity, the other is remaining backend advisor debt.
  - Preserve `TB-0047` as closed unless fresh telemetry or exact-head source actually reopens the route-hydration defect.

## Cross-Backlog Dependencies

- `TB-0097` is the umbrella current-head release blocker. Release Verification, QA, Product Ops, and Lead Developer all now point at the same missing live schema rather than at the older function-parity story.
- `TB-0019` is now a pure gate item. Even after schema parity lands, release cannot return to `GO` until Code Review is refreshed to `e231cc0`.
- `TB-0060` now absorbs the exact-head accessibility-impacting UI issue. UX no longer has an active item on current head, and Accessibility specifically points back to the same shared placement defect instead of a duplicate ticket.
- `TB-0040` is narrower than the prior terminology family and should stay that way. Do not reopen the earlier broad copy queue if the remaining fix is only the sourced `Prospect` seam.
- `TB-0046`, `TB-0049`, and `TB-0052` are the next engineering-quality stack after release recovery: admin-email drilldown discipline first, remaining advisor debt second, finance exception readiness third.
- `TB-0024` and `TB-0023` remain real but separate. Neither should be used to overwrite primary-host release truth, and neither currently belongs in the product implementation queue.
- Company-wide BlackCurrant opportunity ownership risk remains visible, but the current lead pass still lacks CRM truth to turn it into a narrower engineering recommendation.

## Release Verification Handoff

- Current verdict: `HOTFIX-FORWARD`.
- Current exact-head hosted evidence on `e231cc0`:
  - GitHub `QA` `27857690007`: passed.
  - DreamHost deploy `27857689995`: passed.
  - `Visual UI Audit` `27857691601`: passed.
  - `E2E Smoke` `27857708006`: passed, including deploy-triggered `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)` shards.
- Current release blockers:
  - missing production schema or migration-ledger parity for `TB-0097`
  - stale Code Review marker for `TB-0019`
- Current non-blocking but active watch items:
  - `TB-0024` runner-side external DNS host remains unhealthy and should stay separate from primary-host release proof
  - `TB-0023` remains access-blocked until Auth-setting visibility exists or an explicit waiver is recorded

## Consultant Quality And Access Audit

- Release Verification and QA made the key current-head correction: exact-head hosted green is necessary but not sufficient when live schema-backed routes depend on new columns.
- Product Ops improved the lead signal materially by closing stale queue items instead of carrying them forward. The active workflow queue is now really `TB-0097` plus `TB-0052`, not yesterday's larger bundle.
- Security correctly kept `TB-0023` as the only active security item and demoted the older function-drift story to watchlist status on this head.
- UI, Accessibility, and Content all sharpened the remaining product-facing work: one exact-head placement defect (`TB-0060`) and one exact-head wording seam (`TB-0040`) survived current hosted proof.
- The remaining access gaps are now concentrated in live Supabase Auth settings, dependable non-rate-limited Supabase SQL, CRM or owner-state truth for BlackCurrant, and richer authenticated operator walkthroughs rather than in basic hosted reachability.

## Team Rule Updates

- No shared-rule, company-wide, business-access, or access-needs edit was required from the lead pass itself.
- The current shared rules already capture the main escaped-defect lesson from this run: local migration filenames are not live schema proof, and exact-head hosted green does not close release when schema-backed routes depend on missing production objects.
- This run updated [docs/lead-developer-recommendations.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/lead-developer-recommendations.md) and [docs/codex-edit-log.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md) only. No commit or push was attempted because the worktree already contains broad same-day specialist documentation changes outside the lead-document scope.

## Agent Inputs

- Date of run: 2026-06-20.
- Shared rules and lead docs reviewed:
  - [docs/company-wide-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/company-wide-rules.md)
  - [docs/consultant-team-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-team-rules.md)
  - [docs/consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md)
  - [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md)
  - [docs/lead-developer-recommendations.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/lead-developer-recommendations.md)
- Specialist backlog files reviewed:
  - [docs/release-verification-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md)
  - [docs/qa-test-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md)
  - [docs/qa-harness-reliability-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-harness-reliability-backlog.md)
  - [docs/security-review-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/security-review-backlog.md)
  - [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md)
  - [docs/data-analytics-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/data-analytics-backlog.md)
  - [docs/performance-engineering-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/performance-engineering-backlog.md)
  - [docs/ui-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ui-optimization-backlog.md)
  - [docs/ux-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ux-optimization-backlog.md)
  - [docs/accessibility-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/accessibility-backlog.md)
  - [docs/content-copyeditor-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md)
  - [docs/b2b-marketing-growth-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/b2b-marketing-growth-backlog.md)
  - [docs/trust-reputation-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trust-reputation-backlog.md)
- Current repo, workflow, Supabase, and external checks reviewed:
  - `git rev-parse HEAD`
  - `git status --short`
  - `git log --oneline --decorate -5`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 12 --json databaseId,workflowName,headSha,status,conclusion,displayTitle,createdAt,updatedAt`
  - live Supabase SQL for `information_schema.columns`, `supabase_migrations.schema_migrations`, tracker-row reads, and tracker schema inspection on project `vaoqvtxqvbptyxddpoju`
  - targeted source review of [src/pages/client/ClientProfile.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [src/pages/admin/AdminClients.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx), [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [src/components/ConsentManager.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/ConsentManager.tsx), [src/pages/bum/BumContacts.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), [src/pages/bum/BumProspects.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [src/components/PortalGlobalSearch.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), [src/pages/admin/AdminReports.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminReports.tsx), [src/pages/admin/AdminEmails.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminEmails.tsx), and [`scripts/verify-supabase-release-provenance.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/verify-supabase-release-provenance.mjs)
- Current official guidance reviewed:
  - [Supabase Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations)
  - [Supabase Password Security](https://supabase.com/docs/guides/auth/password-security)
  - [Supabase Function Configuration](https://supabase.com/docs/guides/functions/function-configuration)
  - [Supabase Authorization headers](https://supabase.com/docs/guides/functions/auth-headers)
  - [Supabase breaking change: tables not exposed automatically to Data API](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
  - [Apple Mail Privacy Protection](https://support.apple.com/guide/iphone/use-mail-privacy-protection-iphf084865c7/ios)
- Checks that could not fully run and why:
  - no direct live Supabase Auth-settings view was available to resolve `TB-0023`
  - no CRM or opportunity-owner export was available to narrow the BlackCurrant queue
  - no current production-safe role walkthrough was rerun for `TB-0097` because the live schema blocker already prevents a truthful pass
  - Supabase MCP access is still session-variable and can return `RATE_LIMITED` after initial successful reads, so this run did not attempt live tracker writes or broader same-session SQL after the evidence needed for the lead refresh was confirmed
