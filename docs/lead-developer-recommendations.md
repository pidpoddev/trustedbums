# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-12 by Codex daily lead developer automation._

## Executive Read

Current release status stays `HOLD-DEPLOY` for exact `main` head `d360570`.

- Completed work:
  - Overnight specialists refreshed the active backlogs to exact head `d360570` and corrected several stale carry-forwards, especially `TB-0066` and `TB-0092`.
  - This lead pass revalidated the current release gate, live Supabase project health, live public helper grants, and the deployed `sync-claim-decision-replies` configuration.
  - Exact-head hosted evidence is still green where the lane is healthy: GitHub `QA` run `27371736190`, DreamHost deploy run `27371736211`, and `E2E Smoke` run `27371773276` all passed on `d360570`.
  - Exact-head Google Analytics consent gating is now shipped in commit `795ebd2`; `TB-0066` is no longer an active implementation defect on `main`.
- Current priorities:
  - refresh Code Review for exact head `d360570`;
  - close the three live privileged-path Supabase exposures behind `TB-0081`, `TB-0085`, and `TB-0087`;
  - fix QA harness items `TB-0092` and `TB-0054` so release evidence stops losing the standard visual lane and preflight artifacts;
  - block merge of the current Client Legal or Client IT or beta deal-registration branch until `TB-0097` and `TB-0096` are resolved;
  - after the gate and security work, take the route-shape and access-contract stack `TB-0047`, `TB-0051`, `TB-0044`, and `TB-0045`.
- Current blockers:
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still records `GO` for `26fbdc7`, not `d360570`.
  - Standard exact-head `Visual UI Audit` is still red only because `TB-0092` treats legitimate `/admin/scrum` text containing `404` as an error page.
  - The worktree contains large in-progress product and doc changes, including source-only Client Legal or Client IT and beta deal-registration work that is not yet deployed and still needs governance hardening before merge.
  - Google Analytics property access, CRM truth, support queue exports, mailbox recheck access, and reputation dashboards are still missing, so several growth, content, and analytics conclusions remain evidence-limited.
- Recommended next actions:
  1. Refresh Code Review for `d360570`, then rerun standard visual QA after the `TB-0092` fix.
  2. Land one scoped Supabase hardening batch for `TB-0081`, `TB-0085`, and `TB-0087`, then rerun hosted QA and post-fix live privilege checks.
  3. Land `TB-0092` and `TB-0054` together so release evidence regains both clean standard visuals and downloadable preflight summaries.
  4. Do not merge the current Client Legal or Client IT or beta deal-registration branch until `TB-0097` and `TB-0096` are fixed with role-accurate tests.
  5. After the gate and security batch settles, take the route-shape and access-contract stack: `TB-0047`, `TB-0051`, `TB-0044`, and `TB-0045`.

## Recommendation Classification

- `TB-0019 Refresh exact-head release gate`: `BLOCKED BY ANOTHER SPECIALIST`.
  - Reason: hosted exact-head release evidence is green, but only Code Review can refresh [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) for `d360570`.
  - Next owner: Code Review Agent, then Lead Developer.
  - Implementation queue: no.
- `TB-0092 Narrow the standard visual audit 404 check`: `READY`.
  - Reason: QA Harness Reliability proved the current failure is a harness false positive, not a product failure.
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
  - Reason: commit `795ebd2` already shipped the consent-gated GA path on `d360570`; the remaining gap is live GA property proof, not code.
  - Next owner: Data Analytics Engineer plus whoever owns GA property access.
  - Implementation queue: no.
- `TB-0086 Add focused manual Bum contact mutation proof`: `READY`.
  - Reason: exact-head route coverage is green, but the new `Add contact` path still lacks focused create/read/cleanup proof.
  - Next owner: Lead Developer with QA review.
  - Implementation queue: yes.
- `TB-0097 Gate company-profile ownership and beta role launch before merge`: `READY`.
  - Reason: the current dirty branch adds Client Legal, Client IT, and beta deal-registration flows, but company-profile ownership and operational enablement are still too broad and not yet merge-safe.
  - Next owner: Lead Developer with Product Ops, Security, QA, and Content review.
  - Implementation queue: yes.
- `TB-0096 Remove the Client Member commission-plan dead-end before merge`: `READY`.
  - Reason: current dirty worktree helper copy sends a valid Client Member workflow to an inaccessible route.
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
- `TB-0045 Commit and enforce an admin-email reporting rule`: `READY`.
  - Reason: the rule is now drafted in the dirty worktree, but exact head still lacks committed admin-email reporting governance.
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
- Why now: production looks healthy on exact head, but the release cannot move past `HOLD-DEPLOY` while Code Review is still pinned to `26fbdc7`.
- Recommended fix: run Code Review Agent on `d360570`, then rerun standard `Visual UI Audit` after `TB-0092` lands.
- Likely files/routes: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json), [`tests/e2e/visual-ui-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), and the visual QA workflow files.
- Dependencies/risks: any new merge or push after the review restarts the gate; the standard visual rerun is still blocked on the harness regex.
- Acceptance criteria: Code Review marker matches `d360570`, and a successor standard visual run passes after `TB-0092`.
- Validation: GitHub `QA` `27371736190`, DreamHost deploy `27371736211`, `E2E Smoke` `27371773276`, refreshed Code Review, and a clean rerun of standard exact-head visual QA.

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

### P1 - Block the current Client Legal or Client IT or beta deal-registration branch from merge until ownership and role paths are fixed
- Classification: `READY`.
- Source: [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), [docs/ux-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ux-optimization-backlog.md), [docs/content-copyeditor-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md), and current dirty worktree source.
- Why now: these risks are not live on `d360570`, but they are current merge risks in the active worktree and already touch access, product truth, UX, and copy.
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
- Dependencies/risks: the finance-safe and admin-email rule text already exists in the dirty worktree but is not yet exact-head truth; do not performance-optimize the wrong access model.
- Acceptance criteria: queue stale logic reflects actual operator action, Client Finance reads are finance-safe, admin-email raw reporting stays admin-only, and the current hot client routes stop depending on broad whole-list hydration for first render.
- Validation: direct data-path role tests, targeted route tests, live SQL shape checks, and telemetry follow-up on the affected client routes.

## Fix Playbooks

### Release Gate Playbook

- Keep release truth anchored to exact head `d360570`.
- Treat `TB-0092` as harness work, not product work.
- Do not move beyond `HOLD-DEPLOY` until Code Review is refreshed and standard exact-head visual QA reruns cleanly.

### Security Hardening Playbook

- Treat `TB-0081`, `TB-0085`, and `TB-0087` as one release-sensitive auth batch.
- Validate with both source tests and live privilege checks after deploy.
- Use [Supabase API security guidance](https://supabase.com/docs/guides/api/securing-your-api) and [Supabase function configuration guidance](https://supabase.com/docs/guides/functions/function-configuration) as the current contract for grants, exposed helpers, and `verify_jwt`.

### Dirty Branch Merge Playbook

- Separate deployed truth from source-only branch risk.
- Resolve `TB-0097` and `TB-0096` before any code-review request for the current client-role or beta branch.
- Do not treat “beta configured” as “operationally enabled” without admin-reviewed proof and role-boundary tests.

## Cross-Backlog Dependencies

- `TB-0081`, `TB-0085`, and `TB-0087` touch Security, Product Ops, QA, Data, and Trust because they change admin, customer-lead, and mailbox-backed trust boundaries.
- `TB-0092` and `TB-0054` now sit in front of Release Verification, QA, UI, and Lead Developer because they determine whether exact-head evidence is clean and downloadable.
- `TB-0097`, `TB-0096`, and the related content seams around `Client Agreement`, `Commission Plans`, and beta deal registration all touch Product Ops, Security, QA, Content, UX, and Code Review before merge.
- `TB-0047` depends on the same payload and role-boundary decisions as `TB-0044` and `TB-0045`; do not optimize the wrong data shape.
- `TB-0066` is fixed in code but still blocked from “trusted specialist evidence” status until live GA property access proves collection on production.
- `TB-0024` remains trust debt, but primary-host release health is currently good; do not let fallback-host noise override the healthy `trustedbums.com` evidence chain.

## Release Verification Handoff

- Current exact-head release evidence on `d360570`:
  - GitHub `QA` `27371736190`: passed.
  - DreamHost deploy `27371736211`: passed.
  - GitHub `E2E Smoke` `27371773276`: passed `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
  - Standard `Visual UI Audit` `27395701277`: failed only because `TB-0092` still treats tracker body text containing `404` as an error page.
- Current decision: `HOLD-DEPLOY`.
- Why still holding:
  - stale exact-head Code Review marker on `26fbdc7`;
  - harness-only standard visual failure still needs the fix and rerun.
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

- No new shared-rule documents were edited in this lead pass.
- Reviewed current dirty specialist edits in [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md) and [docs/consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md). Those drafts are directionally correct for Client Legal or Client IT governance, finance-safe reporting, and admin-email reporting, but they remain local because the worktree already contains unrelated product, doc, migration, and test changes.
- Publication status: no commit or push attempted from this lead pass.

## Agent Inputs

- Date of run: 2026-06-12.
- Specialist backlog files reviewed: [docs/accessibility-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/accessibility-backlog.md), [docs/b2b-marketing-growth-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/b2b-marketing-growth-backlog.md), [docs/content-copyeditor-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md), [docs/data-analytics-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/data-analytics-backlog.md), [docs/marketing-graphics-campaign-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/marketing-graphics-campaign-backlog.md), [docs/performance-engineering-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/performance-engineering-backlog.md), [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), [docs/qa-harness-reliability-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-harness-reliability-backlog.md), [docs/qa-test-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md), [docs/release-verification-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md), [docs/security-review-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/security-review-backlog.md), [docs/trust-reputation-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trust-reputation-backlog.md), [docs/ui-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ui-optimization-backlog.md), [docs/ux-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ux-optimization-backlog.md), and the prior lead handoff.
- Current repo and workflow evidence reviewed:
  - `git status --short`
  - `git rev-parse HEAD`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - `git show 795ebd2 --stat --name-only --`
  - `git diff --stat 349bbe0..d360570 -- src supabase docs .github`
  - current dirty diffs for `docs/business-access-rules.md`, `docs/consultant-access-needs.md`, `docs/consultant-team-rules.md`, `docs/lead-developer-recommendations.md`, and `docs/codex-edit-log.md`
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
