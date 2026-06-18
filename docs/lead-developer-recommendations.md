# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-18 by Codex daily lead developer automation._

## Executive Read

Current release-evidence status is `GO` for pushed `main` head `4dfca6111781e0df4b9b6ee14dd811c0d90ac787`.

- Completed work:
      - Rebased the lead queue from the stale `af944fe` snapshot to current head `57231bf`, then pushed the direct fix successor `4dfca61`.
      - Confirmed exact-head hosted proof is green on `4dfca61`: GitHub `QA` `27753046146`, DreamHost deploy `27753046130`, `Visual UI Audit` `27753060606`, and deploy-triggered `E2E Smoke` `27753099729` all passed.
  - Confirmed `TB-0105`, `TB-0106`, `TB-0108`, `TB-0032`, `TB-0096`, `TB-0098`, and `TB-0110` are no longer active lead queue items on the current head.
      - Verified live Supabase now narrows the security queue to `TB-0089` and access-blocked `TB-0023`; `TB-0111` was fixed live on 2026-06-18 with `search_path=public` on `public.sync_admin_scrum_item_owner_fields`, and `claim_client_notification_previews` remains hardened live as `security_invoker=true` with grants narrowed to `authenticated SELECT`.
      - Fixed the current `Visual UI Audit` harness drift locally: the public signup interaction now scopes the duplicated `Create Client account` CTA to the page banner, and the client-admin opportunity interaction opens the current `New Opportunity` workflow before expecting the form.
- Current priorities:
  1. Treat the live shared-mailbox backlog as the top operational implementation item under `TB-0102`.
  2. Continue the broader issuer-pinning sweep under `TB-0089`; `TB-0111` is closed live and in source on `4dfca61`.
  3. Follow with operator ownership parity under `TB-0051`, then the finance-safe data and route-shape pair `TB-0044` plus `TB-0047`.
- Current blockers:
  - No release-evidence blocker remains for pushed head `4dfca61`: exact-head Code Review, QA, deploy, Visual UI Audit, and E2E Smoke are all current and green.
  - `TB-0023` remains blocked by missing Supabase Auth-setting visibility even though live advisors still flag leaked-password protection disabled.
  - Product Ops still cannot independently clear the company-wide `~80` unhandled BlackCurrant opportunities warning because this run did not have CRM export or live opportunity-owner proof.
- Recommended next actions:
  1. Ship mailbox ownership, full-list visibility, and category-completion handling under `TB-0102`.
  2. Continue the remaining Clerk issuer and `verify_jwt` alignment work under `TB-0089`.
  3. Keep Auth-setting owner follow-up on `TB-0023` for leaked-password protection.

## Recommendation Classification

- `TB-0019 Refresh exact-head Code Review`: `CLOSED`.
  - Reason: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) now names pushed head `4dfca6111781e0df4b9b6ee14dd811c0d90ac787`, and live tracker `TB-0019` is closed with matching hosted runs `27753046146`, `27753046130`, `27753060606`, and `27753099729`.
  - Next owner: none unless `main` advances again.
  - Implementation queue: no.
- Exact-head hosted visual proof: `CLOSED`.
  - Reason: hosted `Visual UI Audit` `27753060606` passed on `4dfca61` after the harness fix.
  - Next owner: none unless a future UI head changes.
  - Implementation queue: no.
- `TB-0102 Clear the live shared mailbox backlog and stop hiding open mail`: `READY`.
  - Reason: live production now has `100` `OPEN` mailbox rows, `47` uncategorized, `0` assigned, `0` handled, `40` with attachments, and `90` with stored body content while the default list still requests only `75` rows.
  - Next owner: Lead Developer with Product Ops, Security, and Legal/Compliance review.
  - Implementation queue: yes.
- `TB-0111 Set an explicit search_path on public.sync_admin_scrum_item_owner_fields`: `CLOSED`.
  - Reason: live Supabase now reports `proconfig = ["search_path=public"]` for `public.sync_admin_scrum_item_owner_fields`, security advisors no longer report the mutable `search_path` lint, and source now includes the follow-up migration plus helper-security regression coverage.
  - Next owner: none unless a future advisor rerun reopens it.
  - Implementation queue: no, unless the pushed source batch or hosted validation fails.
- `TB-0089 Pin Clerk issuer and JWKS resolution in remaining Clerk-backed Edge Functions`: `READY`.
  - Reason: the real current security queue is narrower than yesterday’s, but active exact-head functions still trust token-supplied issuer fallback and repo/live `verify_jwt` drift remains visible.
  - Next owner: Lead Developer with Security review.
  - Implementation queue: yes.
- `TB-0023 Enable Supabase Auth leaked-password protection or record an explicit waiver`: `BLOCKED BY ACCESS`.
  - Reason: live advisors still flag the control, but this shell still lacks Auth-setting visibility.
  - Next owner: Security Engineer plus the Supabase Auth settings owner.
  - Implementation queue: no.
- `TB-0051 Make handoff aging reflect operator action and finish triage parity`: `READY`.
  - Reason: `contact_submissions` still has a live unowned `NEW` row, and the richer owner/next-action model still has not been generalized across the other queue surfaces.
  - Next owner: Lead Developer with Product Ops review.
  - Implementation queue: yes.
- `TB-0097 Gate company profile ownership and beta role launch`: `READY`.
  - Reason: source is preparing `CLIENT_IT` and `CLIENT_LEGAL`, but the live generic company-profile write path is still too broad for ordinary client roles.
  - Next owner: Lead Developer with Product Ops and Security review.
  - Implementation queue: yes, after `TB-0102` and `TB-0051`.
- `TB-0052 Land finance exception lanes before first invoice, payout, or manager-allocation volume arrives`: `READY`.
  - Reason: Managing Bum and terms assignment are partially live, but the first real finance exception would still land in generalized progression screens.
  - Next owner: Lead Developer with Product Ops and Finance review.
  - Implementation queue: yes, after queue ownership and profile-governance work.
- `TB-0044 Split Client Finance reporting into a finance-safe read model`: `READY`.
  - Reason: current client finance reads still hydrate operational relationship and reporter fields that the business-access rule forbids, and GA shows those routes are active.
  - Next owner: Lead Developer with Data and Security review.
  - Implementation queue: yes.
- `TB-0047 Move high-traffic client routes off whole-list hydration and broad list helpers`: `READY`.
  - Reason: live performance telemetry still centers the same client routes even after the search-warming cleanup, and the underlying data helpers are still broad.
  - Next owner: Lead Developer with Performance and Data review.
  - Implementation queue: yes, with `TB-0044`.
- `TB-0046 Make admin email metrics aggregate-first`: `READY`.
  - Reason: current admin-email KPIs still depend on capped list reads and open-heavy headline metrics.
  - Next owner: Lead Developer with Data review.
  - Implementation queue: yes, after `TB-0044` and `TB-0047`.
- `TB-0024 Resolve or retire rcdl.tplinkdns.com`: `READY`.
  - Reason: the primary host is healthy, but the required fallback host still fails TLS validation and should not remain a silent consultant default without repair or retirement.
  - Next owner: Trust & Reputation Consultant with infrastructure owner review.
  - Implementation queue: no.
- `TB-0042 Refresh operator docs to match shipped terminology`: `READY`.
  - Reason: the live terminology wave is shipped, and the remaining content work is docs-only drift across operator references.
  - Next owner: Content Copyeditor.
  - Implementation queue: no.
- Bum-side and public mobile polish (`TB-0060`, `TB-0065`, `TB-0082`): `READY`.
  - Reason: the remaining route-level UI and UX items are now narrow and evidence-backed, but they sit behind exact-head release evidence, mailbox operations, security hardening, and data-shape work.
  - Next owner: Lead Developer with UI, UX, and Accessibility review.
  - Implementation queue: later.
- BlackCurrant unowned opportunity volume and relationship supply: `BLOCKED BY ACCESS`.
  - Reason: company-wide rules still treat the `~80` unhandled opportunities as a P0 operating problem, but this lead run did not have the CRM or owner-state evidence to prove the queue is now owned and moving.
  - Next owner: CEO Agent, Supply, Ops, and Staff with CRM access.
  - Implementation queue: no engineering implementation until the owner/queue truth is visible.

## Recommended Implementation Queue

### P0 - Exact-head release evidence gap on `57231bf` successor `4dfca61`
- Classification: `CLOSED` for `TB-0019` and the current visual lane.
- Source: [docs/release-verification-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md), [docs/qa-test-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md), exact-head workflow runs `27753046146`, `27753046130`, `27753060606`, `27753099729`, and [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json).
- Why now: the stale review marker and failed visual lane were the real release-evidence gap after older product defects had already been closed.
- Recommended fix: complete. Reopen only if `main` advances or a new hosted release lane fails.
- Likely files/routes: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json), [tests/e2e/visual-ui-audit.spec.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), release/QA docs, and related tracker rows.
- Dependencies/risks: do not reopen the old `TB-0105` or `TB-0106` queue; the prior visual issue was harness drift and the hosted rerun is green.
- Acceptance criteria: exact-head review marker matches the shipped SHA, and the hosted visual lane passes cleanly.
- Validation: Code Review marker, tracker closeout for `TB-0019`, hosted `QA`, deploy, `Visual UI Audit`, and `E2E Smoke` all green on `4dfca61`.

### P0 - Treat the shared mailbox as a live operating queue, not a pre-volume design item
- Classification: `READY`.
- Source: [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), [docs/shared-mailbox-operations.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/shared-mailbox-operations.md), live Supabase counts on `admin_shared_mailbox_messages`, [src/pages/admin/AdminInbox.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminInbox.tsx), and [supabase/functions/admin-shared-mailbox/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-shared-mailbox/index.ts).
- Why now: this is the strongest live operations gap in the current evidence set and it is already hiding real work from default admin views.
- Recommended fix: add full-list reachability, make `assigned_to` and due-state real operator controls, and define category-specific retention plus owner rules before messages leave `OPEN`.
- Likely files/routes: [src/pages/admin/AdminInbox.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminInbox.tsx), [supabase/functions/admin-shared-mailbox/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-shared-mailbox/index.ts), [docs/shared-mailbox-operations.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/shared-mailbox-operations.md), and [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md).
- Dependencies/risks: raw-body access, legal/privacy handling, and assignment visibility all need Security, Product Ops, and Legal/Compliance alignment.
- Acceptance criteria: operators can reach all mailbox rows, assign ownership, set next-action or due-state, and prevent indefinite `OPEN` plus `uncategorized` drift.
- Validation: live queue walkthrough, direct SQL recheck of assignment/handled counts, and role-accurate access review.

### P1 - Hardening pass for the live Supabase queue: preserve `TB-0111`, then finish `TB-0089`
- Classification: `TB-0111` closed live and pushed in source; `TB-0089` remains `READY`.
- Source: [docs/security-review-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/security-review-backlog.md), live Supabase advisors, live function inventory, [supabase/migrations/20260617120500_add_admin_scrum_owner_column.sql](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260617120500_add_admin_scrum_owner_column.sql), [src/test/supabaseHelperSecurity.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/supabaseHelperSecurity.test.ts), and current Clerk verification guidance.
- Why now: the older auth-boundary batch is no longer accurate; the live queue is smaller and should stay evidence-current while the remaining issuer work proceeds.
- Recommended fix: keep the live `sync_admin_scrum_item_owner_fields` `search_path` hardening in source control, then finish the shared issuer/JWKS pinning and repo/live `verify_jwt` alignment sweep across remaining Clerk-backed functions.
- Likely files/routes: the `20260617120500` migration chain, relevant follow-up migrations, [src/test/supabaseHelperSecurity.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/supabaseHelperSecurity.test.ts), [src/test/serviceRoleAuthorization.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/serviceRoleAuthorization.test.ts), [supabase/config.toml](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/config.toml), and the remaining Clerk-backed Edge Functions.
- Dependencies/risks: do not let a repo-side `verify_jwt` cleanup silently revert a live hardening improvement; keep release verification and Security aligned on the same direct successor head.
- Acceptance criteria: `TB-0111` remains closed with live advisor proof, the remaining issuer fallback set is removed, and live/repo function config agrees.
- Validation: targeted tests, live advisor rerun, function inventory recheck, and exact-head hosted verification.

### P1 - Finish operator ownership parity before queue volume broadens
- Classification: `READY`.
- Source: [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), [docs/company-wide-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/company-wide-rules.md), [src/components/admin/ContactSubmissionsPanel.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [src/pages/admin/AdminHandoffs.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminHandoffs.tsx), [src/pages/client/ClientProfile.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), and [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts).
- Why now: shared mailbox ownership and handoff parity are the strongest operator-quality gaps, and they overlap with profile-governance and future finance exception work.
- Recommended fix: extend owner/priority/next-action/due-state semantics across the handoff queues, then narrow broad company-profile mutation before `CLIENT_IT` or `CLIENT_LEGAL` become real production roles.
- Likely files/routes: [src/components/admin/ContactSubmissionsPanel.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [src/pages/admin/AdminHandoffs.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminHandoffs.tsx), [src/pages/client/ClientProfile.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [src/layouts/ClientLayout.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/ClientLayout.tsx), [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), and [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md).
- Dependencies/risks: Product Ops, Security, and UX need the same role matrix before route or API changes ship.
- Acceptance criteria: operator queues track accountable next steps, stale state is due- or last-touch-based, and generic client users no longer act as default company-profile owners.
- Validation: role smoke, direct allow/deny checks, and queue-state walkthroughs.

### P2 - Pair the finance-safe analytics and client-route-shape stack
- Classification: `READY`.
- Source: [docs/data-analytics-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/data-analytics-backlog.md), [docs/performance-engineering-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/performance-engineering-backlog.md), live GA aggregates, live telemetry, and current client-report/helper source paths.
- Why now: `TB-0044` and `TB-0047` are still the same underlying payload-shape problem seen from different disciplines, and `TB-0046` should not be solved on top of the current recipient-level reporting surface.
- Recommended fix: split Client Finance onto a finance-safe read model, narrow first-render client route payloads, then move admin-email summary cards to aggregate-first helpers and clean up route-adjacent advisor debt.
- Likely files/routes: [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [src/pages/client/clientReportsModel.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/clientReportsModel.ts), [src/pages/client/clientExportsModel.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/clientExportsModel.ts), [src/pages/client/ClientReports.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientReports.tsx), [src/pages/client/ClientExports.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientExports.tsx), [src/pages/client/ClientPayments.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientPayments.tsx), and [src/pages/admin/AdminEmails.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminEmails.tsx).
- Dependencies/risks: Security and Data need to validate the finance-safe contract before release, and Performance should confirm route-specific gains rather than treat bundle size alone as proof.
- Acceptance criteria: Client Finance stops receiving operational relationship payloads, hotspot routes stop relying on broad list hydration for first render, and admin-email headline KPIs stop depending on capped list reads or open-only framing.
- Validation: targeted response-shape tests, telemetry recheck, and direct role-boundary verification.

## Fix Playbooks

- Release evidence playbook:
  - Preserve Code Review and hosted proof on `4dfca61`.
  - Reopen only if `main` advances beyond `4dfca61` or a new hosted release lane fails.
  - Keep the visual harness scoped to current CTA and client-admin opportunity behavior.
- Shared mailbox playbook:
  - Make the full queue reachable.
  - Add owner and due-state semantics before changing category-specific retention rules.
  - Mirror the final category matrix into mailbox ops and business-access docs before treating the queue as production-ready.
- Supabase hardening playbook:
  - Keep `TB-0111` closed with live advisor and pushed-source proof.
  - Fold the remaining issuer/JWKS pinning plus `verify_jwt` drift cleanup under `TB-0089`.
  - Keep `TB-0023` visible but blocked until Auth-setting visibility exists.

## Cross-Backlog Dependencies

- `TB-0019` and the current-head hosted visual lane are closed on `4dfca61`. They should not be mixed back together with already-closed product defects unless `main` advances or a hosted lane regresses.
- `TB-0102` and `TB-0051` are the strongest current operational-quality pair. One is the new live mailbox queue, the other is the overdue parity model for the rest of the admin handoff surfaces.
- `TB-0111` is closed; `TB-0089` is the active live Supabase hardening item that should move while current live advisor and function inventory evidence is fresh.
- `TB-0044`, `TB-0047`, and `TB-0046` should stay sequenced as one data-shape program: finance-safe payload first, route-shape second, aggregate-first admin email third.
- Company-wide rules still treat the unowned BlackCurrant opportunity volume and missing relationship supply as go-live blockers. This lead run did not clear that risk; it only confirmed the current engineering queues that intersect it.

## Release Verification Handoff

- Current verdict: `GO`.
- Current exact-head hosted evidence on `4dfca61`:
  - GitHub `QA` `27753046146`: passed.
  - DreamHost deploy `27753046130`: passed.
  - `Visual UI Audit` `27753060606`: passed.
  - `E2E Smoke` `27753099729`: passed, including `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- Current release blockers: none for `4dfca61`.
- Current non-blocking watch items:
  - `TB-0024` fallback TLS remains unhealthy and should stay on the trust/infrastructure watchlist, not the primary release target.
  - Standalone `Deep QA Hotfix Audit` remains stale, but deploy-triggered deep QA is current and green.

## Consultant Quality And Access Audit

- Release Verification and QA/Test did the critical rebase work correctly. They removed stale closed defects from the release queue and re-opened `TB-0019` only where the evidence actually drifted.
- UI and UX evidence is materially better than the prior lead snapshot. The failed exact-head visual run is still useful because it isolates harness drift against current shipped CTA and client-opportunity behavior instead of implying a route-rendering collapse.
- Security output is now the strongest of the specialist set because it couples current hosted proof, live advisors, direct SQL, and live function inventory. The lead queue should follow that narrower security backlog, not the older helper-exposure batch.
- Product Ops surfaced the biggest newly materialized operating gap: the mailbox is now live volume, not a design placeholder. That changes lead priority.
- Access gaps remain concentrated in Supabase Auth settings, CRM/opportunity ownership proof, Search Console/Bing owner dashboards, and durable authenticated visual/AT evidence rather than in basic hosted or database reachability.

## Team Rule Updates

- No new company-wide, consultant-team, consultant-access, business-access, or trust-rule edits were required from the lead pass itself.
- Same-day specialist updates already refreshed [docs/company-wide-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/company-wide-rules.md), [docs/consultant-team-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-team-rules.md), and [docs/consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md) where the underlying rules or access picture changed.
- No commit or push was attempted in this run because the worktree already contains broad pre-existing specialist doc changes and new agent/backlog additions outside the lead file refresh.

## Agent Inputs

- Date of run: 2026-06-18.
- Specialist backlog files reviewed:
  - [docs/release-verification-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md)
  - [docs/qa-test-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md)
  - [docs/qa-harness-reliability-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-harness-reliability-backlog.md)
  - [docs/security-review-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/security-review-backlog.md)
  - [docs/trust-reputation-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trust-reputation-backlog.md)
  - [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md)
  - [docs/data-analytics-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/data-analytics-backlog.md)
  - [docs/performance-engineering-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/performance-engineering-backlog.md)
  - [docs/accessibility-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/accessibility-backlog.md)
  - [docs/ui-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ui-optimization-backlog.md)
  - [docs/ux-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ux-optimization-backlog.md)
  - [docs/content-copyeditor-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md)
  - [docs/b2b-marketing-growth-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/b2b-marketing-growth-backlog.md)
  - [docs/marketing-graphics-campaign-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/marketing-graphics-campaign-backlog.md)
  - [docs/consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md)
- Current repo, workflow, Supabase, and external checks reviewed:
  - `git rev-parse HEAD`
  - `git status --short`
  - `git log --since='2026-06-18 02:45' --name-only -- docs`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 15 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27742677438 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27742677438 --repo Pidpoddev/trustedbums --log-failed`
  - `/Users/macdaddy/bin/gh-trustedbums run download 27742677438 --repo Pidpoddev/trustedbums --name visual-ui-audit --dir /tmp/trustedbums-visual-27742677438`
  - Supabase project list, live tracker row reads, mailbox counts, `claim_client_notification_previews` reloptions and grants, function inventory, and current Supabase docs search
  - current Supabase changelog index
- Current official guidance reviewed:
  - [Supabase Authorization headers](https://supabase.com/docs/guides/functions/auth-headers)
  - [Supabase changelog](https://supabase.com/changelog)
  - current specialist-reviewed sources cited in the refreshed backlog docs, including Clerk manual JWT verification, Supabase RLS guidance, WCAG/WAI guidance, GitHub Actions expressions, and current search/trust guidance
- Checks that could not fully run and why:
  - no fresh CRM or opportunity-owner export was available to independently clear the BlackCurrant ownership warning
  - no Supabase Auth settings view was available to resolve `TB-0023`
  - no exact-head clean hosted visual pass exists yet for `57231bf`; the current artifact is usable but still a failed run
