# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-12 by Codex agent rebaseline._

## Executive Read

Current release status stays `HOLD-DEPLOY` for the latest `main` head after this follow-up.

- Completed work:
  - The merged `main` head is clean and includes shared mailbox inbox, Clerk issuer hardening, API access key management, and API access key portal UI.
  - Code Review was refreshed locally for exact head `dc9bd01` after source/security review of `api-access-keys`, `admin-shared-mailbox`, issuer pinning, role checks, metadata-only API key storage, and focused tests.
  - Exact-head hosted evidence is green where the lane is healthy: GitHub `QA` run `27414752682`, DreamHost deploy run `27414752664`, and `E2E Smoke` run `27414783377` all passed on `3f203d1`.
  - The follow-up harness/navigation source fix preserves tabbed route query state through terms gating and narrows visual error-page detection to real route failures.
  - Local validation passed: focused API/mailbox/role tests, then full `corepack pnpm run qa` with lint, Vitest 190/190 tests, and production build.
- Current priorities:
  - rerun or explicitly waive exact-head standard Visual UI Audit after this `TB-0092` source fix is pushed;
  - complete live Supabase/security proof for the newly merged privileged functions `api-access-keys` and `admin-shared-mailbox`;
  - fix QA harness items `TB-0092` and `TB-0054` so release evidence stops losing the standard visual lane and preflight artifacts;
  - refresh stale specialist backlogs that still point at `d360570` or source-only Client Legal/IT/deal-registration wording;
  - after release evidence and security proof settle, take the route-shape and access-contract stack `TB-0047`, `TB-0051`, `TB-0044`, and `TB-0045`.
- Current blockers:
  - Standard exact-head Visual UI Audit is not current after the local `TB-0092` source fix; older `d360570` red visual evidence remains the last failed visual proof.
  - The new service-role Edge Functions are source-reviewed but still need live deployed Supabase/security proof.
  - Several specialist backlogs remain stale after the merge and need rebase before their recommendations are treated as current release blockers.
  - Google Analytics property access, CRM truth, support queue exports, mailbox recheck access, and reputation dashboards are still missing, so several growth, content, and analytics conclusions remain evidence-limited.
- Recommended next actions:
  1. Push the `TB-0092` source fix, then rerun standard Visual UI Audit or document an explicit waiver.
  2. Run Security/Release Verification live checks for `api-access-keys` and `admin-shared-mailbox`, including Clerk issuer, role allow/deny, secrets, audit events, and RLS posture.
  3. Land `TB-0092` and `TB-0054` together so release evidence regains both clean standard visuals and downloadable preflight summaries.
  4. Refresh Product Ops, UX, Content, Trust, Data, Performance, and Architecture backlogs so they cite `dc9bd01` and the merged API access/shared mailbox state.
  5. After release evidence and security proof settle, take the route-shape and access-contract stack: `TB-0047`, `TB-0051`, `TB-0044`, and `TB-0045`.

## Recommendation Classification

- `TB-0019 Refresh exact-head release gate`: `BLOCKED BY ANOTHER SPECIALIST`.
  - Reason: hosted exact-head release evidence and local Code Review are green for `dc9bd01`, but exact-head standard visual QA and live privileged-function security proof remain with QA Harness, Security, and Release Verification.
  - Next owner: QA Harness Reliability, Security, Release Verification, then Lead Developer.
  - Implementation queue: no.
- `TB-0092 Narrow the standard visual audit 404 check`: `READY`.
  - Reason: QA Harness Reliability proved the current failure is a harness false positive, not a product failure; this follow-up contains the source fix and still needs post-push visual rerun.
  - Next owner: QA Harness Reliability Agent with Lead Developer follow-through.
  - Implementation queue: yes.
- `TB-0054 Preserve qa-target-preflight artifacts`: `READY`.
  - Reason: exact-head smoke still drops the preflight summaries from success artifacts.
  - Next owner: QA Harness Reliability Agent with Lead Developer follow-through.
  - Implementation queue: yes.
- `TB-0081 Revoke public EXECUTE on admin scrum audit helpers`: `READY`.
  - Reason: live SQL in this run still shows `anon` and `authenticated` `EXECUTE` on both public `SECURITY DEFINER` helper functions.
  - Next owner: Lead Developer with Security review.
  - Implementation queue: yes.
- `TB-0085 Require fail-closed auth for claim decision sync`: `READY`.
  - Reason: live deployed function source still has `verify_jwt = false` and accepts a missing sync secret state.
  - Next owner: Lead Developer with Security and QA review.
  - Implementation queue: yes.
- `TB-0087 Remove public EXECUTE from customer-lead duplicate helpers`: `READY`.
  - Reason: live SQL in this run still shows `find_customer_lead_duplicate()` publicly executable as a `SECURITY DEFINER` helper.
  - Next owner: Lead Developer with Security and Product Ops review.
  - Implementation queue: yes.
- `TB-0066 Confirm GA production collection after shipped consent fix`: `NEEDS QA PROOF`.
  - Reason: the consent-gated GA path is already included in current head `dc9bd01`; the remaining gap is live GA property proof, not code.
  - Next owner: Data Analytics Engineer plus whoever owns GA property access.
  - Implementation queue: no.
- `TB-0086 Add focused manual Bum contact mutation proof`: `READY`.
  - Reason: exact-head route coverage is green, but the new `Add contact` path still lacks focused create/read/cleanup proof.
  - Next owner: Lead Developer with QA review.
  - Implementation queue: yes.
- `TB-0097 Gate company-profile ownership and beta role launch after merge`: `NEEDS QA PROOF`.
  - Reason: Client Legal, Client IT, and beta deal-registration work has now been merged; the remaining issue is role-accurate live proof, operational enablement, and specialist backlog refresh rather than a dirty-branch merge block.
  - Next owner: Lead Developer with Product Ops, Security, QA, and Content review.
  - Implementation queue: yes.
- `TB-0096 Remove the Client Member commission-plan dead-end`: `READY`.
  - Reason: the merged helper copy still needs role-accurate proof that Client Member workflows do not send users to inaccessible commission-plan routes.
  - Next owner: Lead Developer with UX and QA review.
  - Implementation queue: yes.
- `TB-0047 Move client routes off whole-list hydration`: `READY`.
  - Reason: live telemetry still shows `/client/dashboard`, `/client/opportunities`, `/client/reports`, `/client/payments`, `/client/targets`, and `/client/exports` clustered near the LCP guardrail even at modest row counts.
  - Next owner: Lead Developer with Performance and Data review.
  - Implementation queue: yes, after release and security.
- `TB-0051 Finish queue-aging and triage parity`: `READY`.
  - Reason: live SQL still shows one stale unowned `contact_submissions` row, and the other queues still age from `created_at` alone.
  - Next owner: Lead Developer with Product Ops review.
  - Implementation queue: yes, after release and security.
- `TB-0044 Split Client Finance reads into a finance-safe model`: `READY`.
  - Reason: exact head still hydrates operational relationship fields into Client Finance-facing reads.
  - Next owner: Lead Developer with Data and Security review.
  - Implementation queue: yes, after release and security.
- `TB-0045 Enforce admin-email reporting rule`: `NEEDS QA PROOF`.
  - Reason: the admin-email reporting rule is now present in the merged docs; the remaining gap is source/test/live enforcement proof.
  - Next owner: Lead Developer with Data and Security review.
  - Implementation queue: yes, after release and security.
- `TB-0024 Repair or retire rcdl.tplinkdns.com`: `READY`.
  - Reason: the primary host is healthy, but fallback-host evidence is still bad and the symptom varies by runner between TLS-chain and DNS-resolution failures.
  - Next owner: Trust and Reputation plus infrastructure owner.
  - Implementation queue: no.
- `TB-0036` through `TB-0039` growth plays, `TB-0080` creative governance, and the broader copy-approval seams: `BLOCKED BY ACCESS`.
  - Reason: brand-strategy, CRM, GA property, mailbox, support, and approved-language sources are still missing.
  - Next owner: Founder and functional owners.
  - Implementation queue: no.

## Recommended Implementation Queue

### P0 - Refresh the exact-head release gate
- Classification: `BLOCKED BY ANOTHER SPECIALIST`.
- Source: [docs/release-verification-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md), [docs/qa-test-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md), and [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json).
- Why now: production looks healthy on exact head and Code Review is current, but the release cannot move past `HOLD-DEPLOY` until exact-head standard visual and live privileged-function proof are complete.
- Recommended fix: push the `TB-0092` source fix, rerun standard `Visual UI Audit` or document a waiver, then run live checks for `api-access-keys` and `admin-shared-mailbox`.
- Likely files/routes: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json), [`tests/e2e/visual-ui-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), and the visual QA workflow files.
- Dependencies/risks: any new merge or push after the review restarts the gate; the standard visual rerun is still blocked on the harness regex.
- Acceptance criteria: Code Review marker matches `dc9bd01`, a successor standard visual run passes or is explicitly waived, and live checks prove the new privileged functions.
- Validation: GitHub `QA` `27413665159`, DreamHost deploy `27413665134`, `E2E Smoke` `27413702607`, refreshed Code Review, and a clean rerun or waiver of standard exact-head visual QA.

### P0 - Close the live exposed Supabase helper and fail-open function batch
- Classification: `READY`.
- Source: live Supabase checks in this run plus [docs/security-review-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/security-review-backlog.md).
- Why now: `TB-0081`, `TB-0085`, and `TB-0087` are live trust-boundary issues on deployed privileged paths, not speculative source debt.
- Recommended fix: revoke exposed-role `EXECUTE` from the admin scrum helpers and the duplicate-check helper or move them behind a private or caller-scoped API boundary; make `sync-claim-decision-replies` fail closed when the secret is missing or move it to an internal authenticated path.
- Likely files/routes: [`supabase/migrations/20260609100000_harden_admin_scrum_tracker_audit.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260609100000_harden_admin_scrum_tracker_audit.sql), [`supabase/migrations/20260609124500_add_claim_decline_reasons_and_email_decisions.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260609124500_add_claim_decline_reasons_and_email_decisions.sql), [`supabase/migrations/20260611120000_add_customer_lead_duplicate_check.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260611120000_add_customer_lead_duplicate_check.sql), [`supabase/migrations/20260611124500_match_customer_lead_domain_aliases.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260611124500_match_customer_lead_domain_aliases.sql), [`supabase/functions/sync-claim-decision-replies/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/sync-claim-decision-replies/index.ts), and [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts).
- Dependencies/risks: Product Ops must preserve intended lead and claim workflows; QA must prove positive and negative role cases; Trust must review any public endpoint auth change that affects email or internal automation.
- Acceptance criteria: no exposed-role `EXECUTE` remains on the three live helpers; `sync-claim-decision-replies` cannot run with missing auth material; legitimate admin, client, and internal workflows still work; direct negative-path tests prove denial.
- Validation: focused Vitest or source tests, post-migration `has_function_privilege(...)` SQL, exact deployed function inspection, and hosted QA or E2E reruns after the batch ships.

### P1 - Repair the release-evidence harness gaps
- Classification: `READY`.
- Source: [docs/qa-harness-reliability-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-harness-reliability-backlog.md), [docs/release-verification-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md), and exact-head run `27395701277`.
- Why now: release evidence is losing signal for harness reasons, not product reasons.
- Recommended fix: narrow the body-wide `404` assertion in standard visual QA, move `qa-target-preflight` output out of Playwright-managed `test-results/`, and upload that directory explicitly from smoke and deep workflows.
- Likely files/routes: [`tests/e2e/visual-ui-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), [`scripts/qa-target-preflight.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/qa-target-preflight.mjs), [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml), and [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml).
- Dependencies/risks: keep real config-error detection loud; do not let artifact upload changes hide failures or break current success runs.
- Acceptance criteria: standard visual rerun no longer fails on legitimate tracker text, and both success and failure smoke or deep artifacts include `summary.json` and `summary.txt`.
- Validation: one rerun of standard visual QA on the same head plus one smoke or deep artifact download after the workflow change.

### P1 - Prove merged Client Legal, Client IT, and beta deal-registration ownership paths
- Classification: `NEEDS QA PROOF`.
- Source: [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), [docs/ux-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ux-optimization-backlog.md), [docs/content-copyeditor-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md), and current merged source.
- Why now: these risks are now part of current `dc9bd01` and still touch access, product truth, UX, and copy.
- Recommended fix: narrow company-profile write authority, keep beta deal registration clearly beta and admin-reviewed before any “enabled” state, restore a Client Member-safe commission-plan help path, and align the visible role and workflow nouns enough that QA and product owners can test what the feature actually is.
- Likely files/routes: [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [`src/pages/client/ClientProfile.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [`src/pages/client/ClientTeam.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTeam.tsx), [`src/pages/client/ClientOpportunityNew.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientOpportunityNew.tsx), [`src/pages/client/ClientCommissionPlans.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientCommissionPlans.tsx), [`src/pages/client/ClientDashboard.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [`src/components/DealRegistrationBetaSettings.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/DealRegistrationBetaSettings.tsx), [`supabase/functions/client-team/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/client-team/index.ts), and the two untracked client-role or deal-registration migrations.
- Dependencies/risks: Product Ops and Security must agree on field ownership; QA must cover allow and deny role cases; Content must reduce the live noun drift enough for repeatable QA and support.
- Acceptance criteria: Client Member users are never sent to an inaccessible route, only approved roles can mutate company-profile and beta setup fields, Admin-only review paths are explicit, and role tests cover `CLIENT_ADMIN`, `CLIENT_IT`, `CLIENT_LEGAL`, `CLIENT_FINANCE`, and `CLIENT_MEMBER`.
- Validation: targeted Vitest, route smoke for role-accurate nav and helper copy, and direct role-boundary tests on the underlying client-team and profile data path.

### P1 - Add focused mutation proof for manual Bum contacts
- Classification: `READY`.
- Source: [docs/qa-test-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md).
- Why now: a new Bum-visible write path is live without focused create/read/cleanup proof.
- Recommended fix: add one narrow source contract for required-name handling or optimistic cache behavior and one authenticated tagged-row mutation proof with cleanup.
- Likely files/routes: [`src/pages/bum/BumContacts.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), [`src/test/bumSavedItems.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/bumSavedItems.test.ts), and the relevant authenticated Playwright coverage.
- Dependencies/risks: needs cleanup-safe seeded data and cross-role deny proof.
- Acceptance criteria: the dialog validates correctly, a tagged manual contact can be created and observed, cleanup returns the fixture to zero residue, and unrelated roles stay denied.
- Validation: targeted Vitest plus authenticated browser mutation proof.

### P2 - After the gate and security work, take the route-shape and access-contract stack
- Classification: `READY`.
- Source: [docs/performance-engineering-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/performance-engineering-backlog.md), [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), and [docs/data-analytics-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/data-analytics-backlog.md).
- Why now: the same client-shell data shape is driving performance pressure, queue-operability debt, and least-privilege reporting debt.
- Recommended fix: sequence the work as `TB-0051` queue-aging parity, `TB-0044` finance-safe Client Finance projections, `TB-0045` committed admin-email reporting rule, then `TB-0047` route-scoped reads and bounded summaries on the current hot client routes.
- Likely files/routes: [`src/pages/admin/AdminHandoffs.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminHandoffs.tsx), [`src/components/admin/ContactSubmissionsPanel.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [`src/pages/client/ClientDashboard.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [`src/pages/client/ClientReports.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientReports.tsx), [`src/pages/client/ClientExports.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientExports.tsx), [`src/pages/client/ClientPayments.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientPayments.tsx), and [`src/pages/admin/AdminEmails.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminEmails.tsx).
- Dependencies/risks: the finance-safe and admin-email rule text is now merged, but enforcement proof remains open; do not performance-optimize the wrong access model.
- Acceptance criteria: queue stale logic reflects actual operator action, Client Finance reads are finance-safe, admin-email raw reporting stays admin-only, and the current hot client routes stop depending on broad whole-list hydration for first render.
- Validation: direct data-path role tests, targeted route tests, live SQL shape checks, and telemetry follow-up on the affected client routes.

## Fix Playbooks

### Release Gate Playbook

- Keep release truth anchored to the latest pushed head and rerun the gate after each follow-up commit.
- Treat `TB-0092` as harness work, not product work.
- Do not move beyond `HOLD-DEPLOY` until standard exact-head visual QA reruns cleanly or is waived and live privileged-function proof is complete.

### Security Hardening Playbook

- Treat `TB-0081`, `TB-0085`, and `TB-0087` as one release-sensitive auth batch.
- Validate with both source tests and live privilege checks after deploy.
- Use [Supabase API security guidance](https://supabase.com/docs/guides/api/securing-your-api) and [Supabase function configuration guidance](https://supabase.com/docs/guides/functions/function-configuration) as the current contract for grants, exposed helpers, and `verify_jwt`.

### Merged Role/Deal-Registration Proof Playbook

- Separate deployed truth from stale source-only backlog language.
- Resolve or downgrade `TB-0097` and `TB-0096` with role-accurate proof on current `dc9bd01`.
- Do not treat “beta configured” as “operationally enabled” without admin-reviewed proof and role-boundary tests.

## Cross-Backlog Dependencies

- `TB-0081`, `TB-0085`, and `TB-0087` touch Security, Product Ops, QA, Data, and Trust because they change admin, customer-lead, and mailbox-backed trust boundaries.
- `TB-0092` and `TB-0054` now sit in front of Release Verification, QA, UI, and Lead Developer because they determine whether exact-head evidence is clean and downloadable.
- `TB-0097`, `TB-0096`, and the related content seams around `Client Agreement`, `Commission Plans`, and beta deal registration all touch Product Ops, Security, QA, Content, UX, and Release Verification after merge.
- `TB-0047` depends on the same payload and role-boundary decisions as `TB-0044` and `TB-0045`; do not optimize the wrong data shape.
- `TB-0066` is fixed in code but still blocked from “trusted specialist evidence” status until live GA property access proves collection on production.
- `TB-0024` remains trust debt, but primary-host release health is currently good; do not let fallback-host noise override the healthy `trustedbums.com` evidence chain.

## Release Verification Handoff

- Current exact-head release evidence on `dc9bd01`:
  - GitHub `QA` `27413665159`: passed.
  - DreamHost deploy `27413665134`: passed.
  - GitHub `E2E Smoke` `27413702607`: passed `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
  - Standard `Visual UI Audit`: not current after the `TB-0092` source fix; older `d360570` evidence remains tied to the harness false positive.
- Current decision: `HOLD-DEPLOY`.
- Why still holding:
  - standard visual evidence is not current for `dc9bd01`;
  - `api-access-keys` and `admin-shared-mailbox` need live privileged-function proof.
- No rollback or hotfix-forward is indicated today.
- Fallback-host note: current runner evidence is inconsistent between shells, with one same-day release note seeing `curl: (6) Could not resolve host` and the trust pass seeing `curl: (60) SSL certificate problem`. Either way, `rcdl.tplinkdns.com` remains unusable fallback evidence and should stay open under `TB-0024`.

## Consultant Quality And Access Audit

- Overnight specialist quality was materially better than the previous pass:
  - `TB-0066` was correctly downgraded from active code work to fixed-code or missing-live-proof status.
  - `TB-0092` was correctly reclassified as a harness defect instead of a product or UI regression.
  - Product Ops and Data translated newer Client Legal, Client IT, finance-safe reporting, and admin-email reporting needs into draft business-access rules instead of leaving them only as prose findings.
- The main evidence-quality gaps are still access and runner variability, not specialist negligence:
  - Supabase SQL and tracker-write access still varies by shell.
  - GA property access, CRM, support, mailbox, Search Console, SmartScreen, and approved copy sources are still missing.
  - Fallback-host runner failures still vary by shell, so the exact error should be recorded each time without overcalling a site outage.
- No new shared-process rule change is needed from this lead pass. The current rules already cover retrying tool discovery, separating access blockers from product defects, and recording runner-specific trust failures carefully.

## Team Rule Updates

- Shared-rule updates from this rebaseline: [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md) now includes the merged Client API Access Keys rule.
- Remaining shared-rule work: Agent Operations should sync root shared-rule files with the matching `docs/agents/*` copies and refresh [docs/consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md) if live Supabase, GA, CRM, support, mailbox, or reputation access changes.
- Publication status: this rebaseline is intended to be committed and pushed after local gate and QA pass.

## Agent Inputs

- Date of run: 2026-06-12.
- Specialist backlog files reviewed: [docs/accessibility-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/accessibility-backlog.md), [docs/b2b-marketing-growth-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/b2b-marketing-growth-backlog.md), [docs/content-copyeditor-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md), [docs/data-analytics-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/data-analytics-backlog.md), [docs/marketing-graphics-campaign-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/marketing-graphics-campaign-backlog.md), [docs/performance-engineering-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/performance-engineering-backlog.md), [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), [docs/qa-harness-reliability-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-harness-reliability-backlog.md), [docs/qa-test-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md), [docs/release-verification-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md), [docs/security-review-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/security-review-backlog.md), [docs/trust-reputation-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trust-reputation-backlog.md), [docs/ui-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ui-optimization-backlog.md), [docs/ux-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ux-optimization-backlog.md), and the prior lead handoff.
- Current repo and workflow evidence reviewed:
  - `git status --short`
  - `git rev-parse HEAD`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - `git show 795ebd2 --stat --name-only --`
  - `git diff --stat da1688c..dc9bd01 -- src supabase docs .github`
  - current exact-head diffs for the merged API access, shared mailbox, Client Legal/IT, and beta deal-registration work
  - targeted repo scans for `find_customer_lead_duplicate`, `verify_jwt = false`, `Client Legal`, `Client IT`, `Commission Plans`, `GoogleAnalytics`, `Privacy choices`, and `404`
- Live Supabase checks reviewed for project `vaoqvtxqvbptyxddpoju`:
  - project health and version
  - project URL confirmation
  - edge-function inventory
  - direct privilege SQL for `find_customer_lead_duplicate`, `record_admin_scrum_item_audit_event`, and `set_admin_scrum_item_audit_fields`
  - deployed `sync-claim-decision-replies` source and `verify_jwt` setting
- Current internet sources reviewed:
  - [Supabase Securing your API](https://supabase.com/docs/guides/api/securing-your-api)
  - [Supabase Function Configuration](https://supabase.com/docs/guides/functions/function-configuration)
  - [Store and share data with workflow artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data)
  - [WAI-ARIA Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
  - [WCAG 2.2 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Checks that could not run and why:
  - no fresh Code Review Agent run was performed in this automation session
  - no live GA property access was available to confirm `Realtime`, `DebugView`, `Tag Diagnostics`, or `Data received`
  - no live CRM, support queue export, Search Console, SmartScreen, or mailbox recheck path was available
  - no additional product-code tests were run in this lead pass because the current specialist handoffs already carried current exact-head or source-backed validation for the active queue
