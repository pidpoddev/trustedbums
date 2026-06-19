# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-19 by Codex daily lead developer automation._

## Executive Read

Current release status is `HOTFIX-FORWARD` for `main` head `a17a85639a1b24dfda36da87d763eb4ecd3457af`.

- Completed work:
  - Exact-head hosted proof is now green on `a17a856`: GitHub `QA` `27798687806`, DreamHost deploy `27798687708`, `E2E Smoke` `27798711531`, and `Visual UI Audit` `27810878263` all completed `success`.
  - The specialist wave correctly kept `TB-0044`, `TB-0048`, `TB-0108`, `TB-0111`, `TB-0029`, `TB-0032`, and `TB-0082` out of the active lead queue on current evidence.
  - Live Supabase review re-anchored the real current blockers: `TB-0027` release-control-plane drift, `TB-0089` stale live issuer-pinning deployment, `TB-0102` live mailbox function drift, `TB-0113` staged `Inner Circle` launch, `TB-0051` unfinished handoff parity, `TB-0097` broad company-profile ownership, `TB-0047` route-shape debt, `TB-0046` admin-email KPI debt, `TB-0024` external-host drift, and access-blocked `TB-0023`.
- Current priorities:
  1. Restore same-head Supabase deployment parity for the exact-head hotfix wave under `TB-0027`, `TB-0089`, and `TB-0102`.
  2. Gate staged workflow/schema work before it is treated as live: `TB-0113` and `TB-0097`.
  3. Finish operator queue discipline under `TB-0051`, then move to `TB-0047` and `TB-0046`.
- Current blockers:
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) is still stale on `4dfca6111781e0df4b9b6ee14dd811c0d90ac787`, so exact-head Code Review is open again under `TB-0019`.
  - [`.github/workflows/deploy_dreamhost.yaml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deploy_dreamhost.yaml) proves static-site deploy only; it does not deploy or verify matching Supabase Edge Function revisions, which is why `TB-0027` is now a real release blocker.
  - `https://rcdl.tplinkdns.com` remains unhealthy from this runner, so `TB-0024` stays open until the host is repaired or the contract changes everywhere at once.
  - `TB-0023` remains blocked by missing live Auth-setting visibility even though current security advisors still flag leaked-password protection disabled.
- Recommended next actions:
  1. Hotfix-forward the matching live Supabase function set for `a17a856`, then record same-head live provenance for the affected functions.
  2. Refresh exact-head Code Review on `a17a856`.
  3. Keep `TB-0018` closed as stale because exact-head visual proof now exists, but do not promote release back to `GO` until live function parity is proven.
  4. Make one authoritative `rcdl.tplinkdns.com` decision and mirror it into prompt, rules, and tracker together.

## Recommendation Classification

- `TB-0027 Same-head Supabase function deployment parity`: `READY`.
  - Reason: hosted app proof is green on `a17a856`, but live `extension-api-v1`, `portal-contacts`, and `admin-shared-mailbox` still do not match repo head.
  - Next owner: Lead Developer plus Release Verification.
  - Implementation queue: yes.
- `TB-0089 Redeploy the issuer-pinned Clerk verifier to the live privileged function set`: `READY`.
  - Reason: repo head now uses the pinned issuer helper in the affected functions, but sampled live deployed source still shows the older token-selected issuer path on multiple privileged functions.
  - Next owner: Lead Developer with Security review.
  - Implementation queue: yes.
- `TB-0102 Shared mailbox controls are source-only until the live function catches up`: `READY`.
  - Reason: live SQL still shows `100` mailbox rows, all `OPEN`, with `47` `uncategorized` and `100` unassigned, while live `admin-shared-mailbox` version `2` still lacks `claim_message` and `update_category`.
  - Next owner: Lead Developer with Product Ops, Security, and Legal/Compliance review.
  - Implementation queue: yes.
- `TB-0019 Refresh exact-head Code Review for a17a856`: `READY`.
  - Reason: the exact-head hosted chain is green, but the current review marker still points at `4dfca61`.
  - Next owner: Code Review Agent.
  - Implementation queue: no.
- `TB-0018 Exact-head hosted visual proof`: `STALE`.
  - Reason: GitHub `Visual UI Audit` `27810878263` completed `success` on `a17a856`, so the earlier reopen from the release/QA pass is no longer current-head truth.
  - Next owner: none unless a newer visual head lands.
  - Implementation queue: no.
- `TB-0113 Gate Inner Circle launch behind live schema and explicit visibility rules`: `BLOCKED BY ANOTHER SPECIALIST`.
  - Reason: source now exposes `Inner Circle`, but live schema still lacks `bum_contacts.is_inner_circle`, `opportunity_claim_contacts.is_inner_circle`, and the related staged workflow proof.
  - Next owner: Product Ops, Bum Supply, Security, and Lead Developer after deployment parity is restored.
  - Implementation queue: later.
- `TB-0097 Gate company profile ownership and beta role launch`: `READY`.
  - Reason: generic client users still have too-broad company-profile write authority, while the narrower `CLIENT_IT`/`CLIENT_LEGAL` launch is ahead of live schema truth.
  - Next owner: Lead Developer with Product Ops and Security review.
  - Implementation queue: yes, after the hotfix-forward wave.
- `TB-0051 Finish owner/next-step parity across admin handoff lanes`: `READY`.
  - Reason: live `contact_submissions` still has one `NEW` row with no owner, next action, or deadline, and reverse opportunities are still outside the same parity model.
  - Next owner: Lead Developer with Product Ops review.
  - Implementation queue: yes.
- `TB-0047 Move high-traffic client and Bum routes off broad first-render hydration`: `READY`.
  - Reason: live telemetry still centers `/client/dashboard`, `/bum/dashboard`, `/bum/profile`, `/client/opportunities/new`, `/bum/live-conversations`, `/client/opportunities`, and `/bum/opportunities` while the live datasets remain small.
  - Next owner: Lead Developer with Performance and Data review.
  - Implementation queue: yes, after workflow/control-plane recovery.
- `TB-0046 Make admin-email metrics aggregate-first`: `READY`.
  - Reason: current admin email KPIs still depend on capped list reads, recipient-level summary rows, and open-heavy headline metrics even though live delivery/event counts are growing.
  - Next owner: Lead Developer with Data review.
  - Implementation queue: yes, after `TB-0047`.
- `TB-0024 Resolve or retire rcdl.tplinkdns.com from one authoritative source`: `BLOCKED BY ANOTHER SPECIALIST`.
  - Reason: current contract still names `https://rcdl.tplinkdns.com`, but runner checks still fail TLS/app-shell expectations.
  - Next owner: Trust & Reputation, Release Verification, Agent Operations, and the infrastructure owner.
  - Implementation queue: no.
- `TB-0023 Enable leaked-password protection or record an explicit waiver`: `BLOCKED BY ACCESS`.
  - Reason: live security advisors still flag the control, but current sessions still lack direct Auth-setting visibility.
  - Next owner: Security Engineer plus the Supabase Auth settings owner.
  - Implementation queue: no.
- `TB-0060 Shared mobile support-zone overlap`: `READY`.
  - Reason: exact-head visual proof confirms the privacy/chat stack still overlaps live mobile authenticated surfaces.
  - Next owner: Lead Developer with UI, UX, and Accessibility review.
  - Implementation queue: later.
- `TB-0065 Reduce first-layer mobile consent-banner footprint`: `READY`.
  - Reason: the first-visit mobile consent layer still pushes the primary Client CTA below the fold.
  - Next owner: UX Consultant with Lead Developer and Trust/Legal review.
  - Implementation queue: later.
- `TB-0040 Restore Prospective Client wording across Bum-side prospecting surfaces`: `READY`.
  - Reason: current Bum dashboard, reports, and contacts still regress to `Prospected Client`, `client prospect`, and generic `Prospect` wording.
  - Next owner: Content Copyeditor with Lead Developer review.
  - Implementation queue: later.
- BlackCurrant unowned opportunity volume and relationship supply: `BLOCKED BY ACCESS`.
  - Reason: company-wide rules still treat the `~80` unhandled opportunities as a P0 operating problem, but this lead pass still had no CRM export or live owner-state evidence to prove the queue is moving.
  - Next owner: CEO, Ops, Supply, and Staff with CRM access.
  - Implementation queue: no engineering implementation until the owner-state truth is visible.

## Recommended Implementation Queue

### P0 - Restore same-head Supabase release parity on `a17a856`
- Classification: `READY`.
- Source: [docs/release-verification-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md), [docs/security-review-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/security-review-backlog.md), [`.github/workflows/deploy_dreamhost.yaml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deploy_dreamhost.yaml), live function inventory, and live deployed source for `extension-api-v1`, `portal-contacts`, and `admin-shared-mailbox`.
- Why now: this is the real release blocker. Static-host evidence is green, but the live control plane is behind the repo on the same head.
- Recommended fix: deploy the matching live Supabase function set for the current head, capture the exact deployed revision/provenance, and keep `TB-0027`, `TB-0089`, and `TB-0102` synchronized to the same exact-head proof instead of closing them from mixed surfaces.
- Likely files/routes: [supabase/functions/extension-api-v1/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/extension-api-v1/index.ts), [supabase/functions/portal-contacts/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/portal-contacts/index.ts), [supabase/functions/admin-shared-mailbox/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-shared-mailbox/index.ts), [supabase/config.toml](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/config.toml), release/security docs, and any deploy scripts or ledgers used to prove function parity.
- Dependencies/risks: do not let a repo-side auth cleanup or workflow improvement get marked shipped until the live function source matches the same head.
- Acceptance criteria: live function reads show the exact current issuer-pinned verifier for the affected privileged functions and the current mailbox operations for `admin-shared-mailbox`; release proof cites the same head across repo, tracker, and live control-plane surfaces.
- Validation: live function-source reads on project `vaoqvtxqvbptyxddpoju`, tracker refreshes for `TB-0027`/`TB-0089`/`TB-0102`, exact-head hosted `QA`, deploy, `E2E Smoke`, and refreshed Code Review.

### P1 - Treat the shared mailbox as a live queue after function parity exists
- Classification: `READY`.
- Source: [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), [docs/shared-mailbox-operations.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/shared-mailbox-operations.md), [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), live SQL counts, and [src/pages/admin/AdminInbox.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminInbox.tsx).
- Why now: the mailbox is the strongest current live operations gap once the control-plane deploy catches up.
- Recommended fix: after the live function matches repo head, prove claim/category/close-guard behavior in production, then add durable owner, next-step, and due-state discipline so the queue stops relying on operator memory.
- Likely files/routes: [src/pages/admin/AdminInbox.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminInbox.tsx), [supabase/functions/admin-shared-mailbox/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-shared-mailbox/index.ts), [docs/shared-mailbox-operations.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/shared-mailbox-operations.md), and [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md).
- Dependencies/risks: mailbox retention, raw-body handling, assignment visibility, and legal/privacy categories all need Product Ops, Security, and Legal/Compliance alignment.
- Acceptance criteria: all live mailbox rows are reachable from the UI, admins can claim and categorize messages, uncategorized messages cannot be closed, and live queue counts no longer show `100` open plus `100` unassigned as the steady state.
- Validation: live admin walkthrough, direct SQL count recheck, and admin-only allow/deny proof.

### P1 - Gate staged workflow/schema work before it becomes operator truth
- Classification: `READY` for `TB-0097`; `BLOCKED BY ANOTHER SPECIALIST` for `TB-0113` until deploy parity lands.
- Source: [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), [src/pages/client/ClientProfile.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [src/components/FirstLoginWalkthrough.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/FirstLoginWalkthrough.tsx), [src/pages/bum/BumContacts.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), and [supabase/migrations/20260618100000_add_inner_circle_contacts.sql](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260618100000_add_inner_circle_contacts.sql).
- Why now: current source exposes `Inner Circle`, `CLIENT_IT`, `CLIENT_LEGAL`, and beta deal-registration workflow language ahead of live schema truth and finalized access rules.
- Recommended fix: keep `Inner Circle` staged until live columns, trigger enforcement, and visibility rules are all present; separately narrow generic client-company profile writes before additional client roles become operational.
- Likely files/routes: [src/pages/client/ClientProfile.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [src/components/FirstLoginWalkthrough.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/FirstLoginWalkthrough.tsx), [src/pages/bum/BumContacts.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), and the supporting migrations/functions.
- Dependencies/risks: Product Ops, Bum Supply, Security, QA, and Lead Developer all need the same visibility and role matrix before launch.
- Acceptance criteria: production has the required columns and trigger behavior, the business-access rule explicitly defines `Inner Circle` visibility and client role ownership, and the current-head role matrix proves only the intended users can see or change the staged data.
- Validation: live schema inspection, allow/deny QA, and one production-safe workflow proof for `Inner Circle` plus narrowed company-profile ownership.

### P2 - Finish queue parity, route-shape cleanup, and aggregate-first admin email KPIs
- Classification: `READY`.
- Source: [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), [docs/performance-engineering-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/performance-engineering-backlog.md), [docs/data-analytics-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/data-analytics-backlog.md), live queue counts, live telemetry, and current portal/admin source.
- Why now: these are the next durable improvements once release truth and staged-workflow governance are no longer blocking lead attention.
- Recommended fix: finish owner/next-action parity across admin handoff lanes, then narrow broad client/Bum route-start payloads, then move admin email summary cards to aggregate-first helpers rather than capped recipient-level list reads.
- Likely files/routes: [src/pages/admin/AdminHandoffs.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminHandoffs.tsx), [src/components/admin/ContactSubmissionsPanel.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [src/pages/client/ClientDashboard.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [src/pages/bum/BumDashboard.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumDashboard.tsx), [src/pages/admin/AdminEmails.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminEmails.tsx), and [supabase/functions/send-admin-email/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/send-admin-email/index.ts).
- Dependencies/risks: route-shape work must preserve role-boundary contracts; admin email KPI work must not widen raw recipient-level access; queue-parity work still needs Product Ops, Security, Data, and QA review.
- Acceptance criteria: the live contact lane no longer has an unowned `NEW` row with no next action or deadline, hotspot routes stop broad-list hydration for first render, and admin-email headline metrics come from aggregate-safe helpers instead of capped raw lists.
- Validation: direct SQL queue recheck, targeted role tests, telemetry recheck, and response-shape tests for finance-safe/admin-only paths.

## Fix Playbooks

- Release hotfix-forward playbook:
  - Treat `TB-0027` as the umbrella item for same-head Supabase function parity.
  - Deploy the current function set first, then refresh Code Review and tracker closeouts on the same head.
  - Keep exact-head hosted proof, live function reads, and tracker notes citing the same SHA.
- Shared mailbox playbook:
  - Do not narrow `TB-0102` from repo code alone.
  - Prove live `claim_message`, `update_category`, and uncategorized close-blocking behavior before queue cleanup claims.
  - Mirror final mailbox-owner/category rules into ops and access docs before treating the workflow as stable.
- Governance launch playbook:
  - Keep `Inner Circle` and narrower client-role launches staged until live schema, visibility rules, and role QA exist together.
  - Separate company identity/matching edits from beta technical setup ownership before `CLIENT_IT` or `CLIENT_LEGAL` become real live roles.

## Cross-Backlog Dependencies

- `TB-0027` is the lead umbrella for the current release problem. `TB-0089` and `TB-0102` are concrete live examples of the same control-plane drift.
- `TB-0018` is stale now that exact-head visual proof exists, but `TB-0019` is still open and release cannot return to `GO` until Code Review matches the same head as the hosted and live evidence.
- `TB-0113` depends on both deploy/schema parity and the access-language work already started in Product Ops and business-access rules.
- `TB-0051`, `TB-0047`, and `TB-0046` are still the next engineering-quality stack after release and governance recovery: operator parity first, route-shape cleanup second, aggregate-first admin-email reporting third.
- UI, UX, accessibility, and content all narrowed correctly. Their remaining items (`TB-0060`, `TB-0065`, `TB-0040`) stay behind the control-plane and operator queue work unless Ryan explicitly reprioritizes them.
- Company-wide rules still keep the BlackCurrant owner-state and relationship-supply problem visible, but the current lead run still lacks CRM proof to narrow that risk.

## Release Verification Handoff

- Current verdict: `HOTFIX-FORWARD`.
- Current exact-head hosted evidence on `a17a856`:
  - GitHub `QA` `27798687806`: passed.
  - DreamHost deploy `27798687708`: passed.
  - `E2E Smoke` `27798711531`: passed, including deploy-triggered deep admin/client/bum shards.
  - `Visual UI Audit` `27810878263`: passed.
- Current release blockers:
  - live Supabase function drift against repo head under `TB-0027`
  - exact-head Code Review drift under `TB-0019`
- Current non-blocking but active watch items:
  - `TB-0024` external DNS host remains unhealthy and should stay separate from primary-host release proof.
  - `TB-0023` remains access-blocked until Auth-setting visibility exists or an explicit waiver is recorded.

## Consultant Quality And Access Audit

- Release Verification made the most important catch of the day: static DreamHost success and browser smoke were over-crediting release truth when the live Supabase control plane had not caught up.
- Security properly narrowed the active queue. The real open item is not repo-side issuer pinning anymore; it is live deployment parity for the privileged function set, plus the separate Auth-settings visibility gap.
- Product Ops did the right thing by splitting source-only workflow improvements from live operational truth. `TB-0102` and `TB-0113` are sharper because they now distinguish repo progress from live schema/function state.
- UI, UX, accessibility, and content all improved the signal quality of the lead queue. Exact-head visual proof is complete, the shared mobile support-zone issue is still real, the first-visit consent-banner weight issue is still real, and the reopened Bum-side terminology drift is now specific.
- Access gaps remain concentrated in live Supabase Auth settings, same-head function deployment provenance, CRM/opportunity-owner truth, owner dashboards for search/reputation analytics, and richer authenticated AT/browser evidence rather than in basic repo or hosted reachability.

## Team Rule Updates

- Updated [docs/consultant-team-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-team-rules.md) and [docs/agents/consultant-team-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-team-rules.md) so any run touching `supabase/functions/`, `supabase/config.toml`, or live-schema-changing migrations now requires same-head live function/schema provenance before closing release, security, QA, or workflow items.
- No company-wide, business-access, trust, or access-needs edits were required from the lead pass itself; the current specialist refreshes already updated those docs where the underlying rules changed.
- No commit or push was attempted in this run because the worktree already contains broad same-day specialist backlog changes outside the lead-document scope.

## Agent Inputs

- Date of run: 2026-06-19.
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
  - [docs/marketing-graphics-campaign-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/marketing-graphics-campaign-backlog.md)
  - [docs/trust-reputation-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trust-reputation-backlog.md)
- Current repo, workflow, Supabase, and external checks reviewed:
  - `git rev-parse HEAD`
  - `git status --short`
  - `find docs -maxdepth 1 -type f -name '*.md' ...`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - [`.github/workflows/deploy_dreamhost.yaml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deploy_dreamhost.yaml)
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 12 --json ...`
  - live Supabase project/url checks, security advisors, live function inventory, deployed source reads for `extension-api-v1`, `portal-contacts`, and `admin-shared-mailbox`, and direct SQL for mailbox counts, missing staged columns, contact-submission parity, and client-role counts
  - targeted repo grep on [supabase/functions/extension-api-v1/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/extension-api-v1/index.ts), [supabase/functions/portal-contacts/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/portal-contacts/index.ts), [supabase/functions/admin-shared-mailbox/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-shared-mailbox/index.ts), [src/pages/client/ClientProfile.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [src/components/FirstLoginWalkthrough.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/FirstLoginWalkthrough.tsx), [src/pages/bum/BumContacts.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), and [supabase/migrations/20260618100000_add_inner_circle_contacts.sql](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260618100000_add_inner_circle_contacts.sql)
- Current official guidance reviewed:
  - [Supabase Securing Edge Functions](https://supabase.com/docs/guides/functions/auth)
  - [Supabase Authorization headers](https://supabase.com/docs/guides/functions/auth-headers)
  - [Supabase Function Configuration](https://supabase.com/docs/guides/functions/function-configuration)
  - [Clerk User metadata](https://clerk.com/docs/guides/users/extending)
  - [Supabase breaking change: tables not exposed automatically to Data API](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- Checks that could not fully run and why:
  - no fresh CRM or opportunity-owner export was available to clear the BlackCurrant owner-state warning
  - no live Supabase Auth settings view was available to resolve `TB-0023`
  - this run did not deploy code or rerun live tracker closeouts itself; it verified and synthesized the overnight specialist evidence plus current live control-plane state
