# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-21 by Codex daily lead developer automation._

## Executive Read

Current release status is `HOTFIX-FORWARD` for `main` head `5af32edeb0cc1290cdbae808207e75276d22a4d6`.

- Completed work:
  - The overnight specialist wave rebased the core backlogs to exact head `5af32ed`: Release, Product Ops, Security, Performance, Data, Trust, UI, UX, Accessibility, Content, and Growth now all reference the same shipped SHA and the same primary hosted proof.
  - Primary-host release proof is clean on `https://trustedbums.com`: GitHub `QA` `27885457568`, DreamHost deploy `27885457565`, and `E2E Smoke` `27885474019` all completed `success`, and a fresh runner `curl` still returns `HTTP/2 200`.
  - `TB-0097` remains correctly `CLOSED` on live tracker and current release truth. `TB-0046` also remains correctly `CLOSED`; the admin-email aggregate-first work is no longer an active lead item.
  - The overnight backlog maintenance correctly narrowed the active product-facing queue to `TB-0114`, `TB-0060`, `TB-0040`, `TB-0049`, and `TB-0052`, while reopening `TB-0024` because Ryan restored `https://rcdl.tplinkdns.com` as the named external-DNS surface.
  - Current live tracker truth is now aligned on the key rows: `TB-0013 OPEN`, `TB-0019 OPEN`, `TB-0023 BLOCKED`, `TB-0024 OPEN`, `TB-0040 OPEN`, `TB-0046 CLOSED`, `TB-0049 OPEN`, `TB-0052 OPEN`, `TB-0060 OPEN`, `TB-0097 CLOSED`, and `TB-0114 OPEN`.
- Current priorities:
  1. Ship the local `TB-0114` client Deep QA auth-context fix without sweeping unrelated worktree changes into the patch, then rerun hosted release lanes on the resulting head.
  2. Refresh exact-head Code Review (`TB-0019`) on the post-hotfix head before any release-clean claim.
  3. After release evidence is clean again, work the two sharp user-facing follow-ups: `TB-0060` mobile privacy-control overlap and `TB-0040` remaining `Prospective Client` wording seam.
  4. Keep `TB-0049` and `TB-0052` as the next engineering-quality queue, while leaving `TB-0023` and `TB-0024` separated from primary-host release proof.
- Current blockers:
  - `TB-0019`: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still approves `1b3664a87c2176b86ac45b43e017277aaf0d6342`, not `5af32ed` or the next hotfix head.
  - `TB-0013`: standalone role-workflow QA still needs a clean rerun after the preflight failure recorded in `27894244168`.
  - `TB-0023`: direct Supabase Auth-settings visibility is still missing, so leaked-password protection remains an access blocker rather than a freshly verified control.
  - `TB-0024`: `https://rcdl.tplinkdns.com` is still broken from this runner and remains an infrastructure or owner-contract issue, not a primary-host outage.
- Recommended next actions:
  1. Stage only the local `TB-0114` fix surfaces, push a clean hotfix head, and rerun `QA`, `Role Workflow QA`, `Deep QA Hotfix Audit`, `E2E Smoke`, and `Visual UI Audit`.
  2. Run the Code Review Agent on that exact head and update [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) before calling release clean.
  3. Keep using `27896715845` as valid defect evidence for `TB-0060`, but do not treat that failed visual workflow as clean release proof.
  4. Hold `TB-0049` and `TB-0052` as the next implementation queue once the release blockers move, and do not reopen `TB-0046` or `TB-0097` without fresh same-head live evidence.

## Recommendation Classification

- `TB-0114 Authenticate client Deep QA mutation context`: `READY`.
  - Reason: exact-head `Deep QA Hotfix Audit` `27894244168` failed on the shipped head, and the current local worktree already contains the narrow auth-navigation fix plus matching test coverage.
  - Next owner: Lead Developer with QA Harness Reliability review.
  - Implementation queue: yes.
- `TB-0019 Refresh exact-head Code Review for the deployed head`: `BLOCKED BY ANOTHER SPECIALIST`.
  - Reason: hosted proof is current, but the review marker is still stale on `1b3664a`.
  - Next owner: Code Review Agent.
  - Implementation queue: no.
- `TB-0013 Re-run hosted role-workflow QA after standalone preflight flake is fixed`: `BLOCKED BY ANOTHER SPECIALIST`.
  - Reason: current evidence points to preflight or harness instability, not a newly scoped product fix in this lead pass.
  - Next owner: QA Harness Reliability Agent.
  - Implementation queue: no.
- `TB-0060 Keep the mobile Privacy choices control clear of live authenticated content`: `READY`.
  - Reason: exact-head `Visual UI Audit` `27896715845` failed as a workflow but still uploaded screenshots that directly prove the overlap on current head `5af32ed`, and live tracker row `TB-0060` is now `OPEN`.
  - Next owner: Lead Developer with UI, UX, and Accessibility follow-up.
  - Implementation queue: yes.
- `TB-0040 Finish the remaining Prospective Client wording seam`: `READY`.
  - Reason: current source and the refreshed live tracker row keep only the narrow Bum/Admin wording seam open on exact head `5af32ed`.
  - Next owner: Lead Developer with Content Copyeditor review.
  - Implementation queue: yes.
- `TB-0049 Finish the remaining advisor debt after the admin-email pagination and index rollout`: `READY`.
  - Reason: `TB-0046` is closed, current field telemetry is healthy, and the remaining performance work is now the smaller planner or policy cleanup batch under `TB-0049`.
  - Next owner: Lead Developer with Performance and Security review.
  - Implementation queue: yes.
- `TB-0052 Land finance exception lanes before first invoice, payout, or allocation volume arrives`: `READY`.
  - Reason: the live product still has zero finance exception volume, which makes this the right time to define the owned rescue path without firefighting real data.
  - Next owner: Lead Developer with Product Ops review.
  - Implementation queue: later.
- `TB-0024 Repair or retire the named external DNS target`: `BLOCKED BY ANOTHER SPECIALIST`.
  - Reason: the host is still broken from this runner, but it is explicitly separate from the healthy primary-host release path.
  - Next owner: Trust & Reputation Consultant, infrastructure owner, and whoever owns the current consultant run contract.
  - Implementation queue: no.
- `TB-0023 Enable leaked-password protection or record a current waiver`: `BLOCKED BY ACCESS`.
  - Reason: live function and RLS evidence are strong, but the session still lacks direct Auth-settings visibility.
  - Next owner: Security Engineer plus the Supabase Auth settings owner.
  - Implementation queue: no.
- `TB-0097 Client profile and beta setup governance`: `STALE`.
  - Reason: current release, Product Ops, and live tracker truth all keep it `CLOSED` on `5af32ed`.
  - Next owner: none unless fresh same-head live evidence reopens it.
  - Implementation queue: no.
- `TB-0046 Admin email metrics aggregate-first and bounded`: `STALE`.
  - Reason: the analytics backlog, live function version, live indexes, and live tracker row all keep it `CLOSED`.
  - Next owner: none unless fresh same-head live evidence reopens it.
  - Implementation queue: no.
- GTM expansion, CRM reconciliation, and BlackCurrant operating evidence gaps: `BLOCKED BY ACCESS`.
  - Reason: Growth now has better strategy docs, but still lacks CRM or channel-operating truth sharp enough to become an engineering recommendation in this queue.
  - Next owner: Founder, Growth, and Ops.
  - Implementation queue: no.

## Recommended Implementation Queue

### P0 - Ship the local client Deep QA auth-context hotfix and close the release rerun gap
- Classification: `READY`.
- Source: [docs/release-verification-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md), live tracker rows `TB-0013`, `TB-0019`, and `TB-0114`, failed `Deep QA Hotfix Audit` `27894244168`, and the current local diffs in [tests/e2e/deep-workflow-hotfix-audit.spec.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), [src/test/deepQaTriage.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/deepQaTriage.test.ts), and related auth-navigation helpers.
- Why now: this is the only active issue that is both a real release blocker on the shipped head and already partially fixed in the local worktree.
- Recommended fix: keep the mutating client shard on the authenticated navigation helper before it touches `/client/opportunities/new`, preserve the fail-fast evidence path, and publish that hotfix as its own clean reviewable batch.
- Likely files/routes: [tests/e2e/deep-workflow-hotfix-audit.spec.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), [tests/e2e/helpers/auth.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/auth.ts), [tests/e2e/helpers/deepQa.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/deepQa.ts), [src/test/deepQaTriage.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/deepQaTriage.test.ts), and the relevant hosted workflow definitions under [.github/workflows](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows).
- Dependencies/risks: the worktree already contains unrelated local edits in [src/pages/client/ClientOpportunityNew.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientOpportunityNew.tsx) and [supabase/functions/send-website-email/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/send-website-email/index.ts); do not sweep those into the hotfix unless they are intentionally part of the same change set.
- Acceptance criteria: the pushed head no longer lands on the public `Account access` page for the client mutation path, `TB-0114` closes from same-head hosted proof, `TB-0013` is re-evaluated from a clean role-workflow rerun, and release no longer depends on a local-only fix.
- Validation: rerun exact-head `Deep QA Hotfix Audit`, `Role Workflow QA`, `QA`, `E2E Smoke`, and a fresh Code Review pass on the pushed hotfix head.

### P1 - Move the mobile Privacy choices control out of authenticated content
- Classification: `READY`.
- Source: [docs/ui-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ui-optimization-backlog.md), [docs/accessibility-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/accessibility-backlog.md), [docs/ux-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ux-optimization-backlog.md), exact-head `Visual UI Audit` `27896715845`, and live tracker row `TB-0060`.
- Why now: this is the sharpest remaining user-facing product defect once the release rerun gap is closed.
- Recommended fix: treat the `Privacy choices` launcher as an authenticated utility surface rather than a floating overlay; either reserve a dedicated bottom utility lane that clears live cards and controls or move the action into an intentional support or account surface.
- Likely files/routes: [src/components/ConsentManager.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/ConsentManager.tsx), [src/layouts/AdminLayout.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/AdminLayout.tsx), [src/layouts/ClientLayout.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/ClientLayout.tsx), [src/layouts/BumLayout.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/BumLayout.tsx), [src/components/ConversationDock.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/ConversationDock.tsx), and the relevant UI tests.
- Dependencies/risks: Admin still carries both chat and privacy utilities; the final placement must keep both accessible without obscuring active controls or focus targets.
- Acceptance criteria: fresh same-head mobile screenshots for `/admin`, `/admin/handoffs`, `/client/opportunities/new`, and `/bum/dashboard` show the control outside live cards, filters, tabs, form fields, and metric stacks.
- Validation: targeted layout tests and a fresh same-head `Visual UI Audit`; failed visual jobs may still help defect proof, but closure requires a clean artifact or an explicit waiver.

### P1 - Finish the remaining Prospective Client wording seam
- Classification: `READY`.
- Source: [docs/content-copyeditor-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md), live tracker row `TB-0040`, and current source in Bum and Admin surfaces.
- Why now: the broader terminology migration already shipped, so the remaining seam is small, cheap to close, and easy to regression-test.
- Recommended fix: remove the remaining visible `Prospect` wording from the Bum contacts and Admin clients surfaces while preserving the internal model and stage semantics already used elsewhere.
- Likely files/routes: [src/pages/bum/BumContacts.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), [src/pages/admin/AdminClients.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx), and any focused copy guardrails that should cover the same seam.
- Dependencies/risks: keep the visible copy aligned with the agreed future-client terminology while avoiding churn in enum names or backend relationship-stage logic.
- Acceptance criteria: the remaining visible `Prospect` strings on the tracked surfaces are gone on the implementing head, and the copy guardrail covers the surviving seam explicitly enough to prevent regression.
- Validation: focused terminology grep plus targeted Vitest and hosted route review on the implementing head.

### P2 - Finish the remaining advisor debt in small route-reviewed batches
- Classification: `READY`.
- Source: [docs/performance-engineering-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/performance-engineering-backlog.md), live tracker row `TB-0049`, current live telemetry, and current live advisor output.
- Why now: `TB-0047` and `TB-0048` are already closed, the admin-email pagination or index slice landed, and the remaining queue is now smaller and safer to tackle deliberately.
- Recommended fix: close the one remaining admin-email FK miss first, then work permissive-policy or FK cleanup only on the tables already exercised by the current hot routes or admin workflows.
- Likely files/routes: the next focused migrations under [supabase/migrations](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations), [src/pages/admin/AdminEmails.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminEmails.tsx), [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), and any route-specific tests for admin, dashboard, agreement, or finance paths.
- Dependencies/risks: keep the policy cleanup tied to documented business rules, not raw advisor volume, and do not promote zero-volume tables ahead of route evidence.
- Acceptance criteria: each retained warning is either removed or explicitly waived with a business-rule rationale, and `TB-0049` narrows again without reopening the closed route-hydration items.
- Validation: same-head advisor review, targeted tests, and current route or workflow evidence after each small batch.

### P2 - Define the first finance exception workflow before real volume arrives
- Classification: `READY`.
- Source: [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), live tracker row `TB-0052`, and the current live zero-volume finance aggregates.
- Why now: the product still has time to shape the first dispute, hold, reversal, or allocation-rescue workflow before it becomes an operator fire drill.
- Recommended fix: define the admin-owned exception lane and keep `CLIENT_FINANCE` on finance-safe reporting rather than rescue or override authority.
- Likely files/routes: [src/pages/client/ClientPayments.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientPayments.tsx), [src/pages/client/ClientExports.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientExports.tsx), [src/pages/bum/BumEarnings.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumEarnings.tsx), [src/pages/admin/AdminPayments.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminPayments.tsx), [src/pages/admin/AdminPayouts.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminPayouts.tsx), and the finance-safe projections in [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts).
- Dependencies/risks: preserve the current business-access rule that `CLIENT_FINANCE` gets finance-safe visibility, not operational override power.
- Acceptance criteria: the first real exception has an owner, next action, due date, and reason, and the role model still prevents finance-safe reporting roles from acting like admin operators.
- Validation: business-access review, focused role tests, and a seeded exception walkthrough when a safe QA scenario exists.

## Fix Playbooks

- Release recovery playbook:
  - Treat release as four separate gates on the next hotfix head: clean `QA` or deploy proof, clean standalone `Role Workflow QA`, clean `Deep QA Hotfix Audit`, and refreshed exact-head Code Review.
  - Use exact-head failed `Visual UI Audit` artifacts for defect triage when they upload useful screenshots, but do not let them stand in for clean release proof.
  - Stage only the hotfix files needed for `TB-0114`; do not mix unrelated local worktree changes into the release rerun batch.
- Product-facing cleanup playbook:
  - Keep `TB-0060` and `TB-0040` as separate follow-ups after release recovery. One is a cross-role mobile utility-placement defect; the other is a narrow copy seam.
  - Do not reopen the broader historical UX, accessibility, or copy queues unless fresh same-head evidence expands them again.
- Engineering-quality cleanup playbook:
  - Keep `TB-0049` and `TB-0052` as the next deliberate queue after release recovery.
  - Keep `TB-0046` and `TB-0097` closed unless fresh same-head live evidence contradicts the current tracker and hosted truth.

## Cross-Backlog Dependencies

- Release is no longer blocked by `TB-0097`; it is now blocked by evidence quality and exact-head coordination: `TB-0114`, `TB-0013`, `TB-0019`, and the absence of a clean same-head visual run.
- `TB-0060` is one shared UI, UX, and Accessibility issue. The tracker and the strongest exact-head screenshot evidence now keep it `OPEN`, so later watchlist-only language should not override that live row without fresher proof.
- `TB-0040` is now a Bum/Admin copy seam, not a broader terminology migration. Keep the next fix narrow.
- `TB-0049` is the performance and security cleanup queue after release, and it should stay separate from the already-closed analytics-facing `TB-0046` work.
- `TB-0052` depends on current business-access rules. Product Ops can define the workflow now, but implementation must preserve the finance-safe role contract.
- `TB-0024` remains a real trust and infrastructure issue only for the named external-DNS target. Do not let it pollute primary-host release status for `https://trustedbums.com`.
- `TB-0023` remains an access and control-plane issue, not a current reproduced auth bypass on the shipped head.
- Growth now has stronger strategy docs, but still lacks CRM and owner-state truth; keep those items out of the engineering queue until the operating evidence sharpens.

## Release Verification Handoff

- Current verdict: `HOTFIX-FORWARD`.
- Current exact-head hosted evidence on `5af32ed`:
  - GitHub `QA` `27885457568`: passed.
  - DreamHost deploy `27885457565`: passed.
  - GitHub `E2E Smoke` `27885474019`: passed.
  - GitHub `Deep QA Hotfix Audit` `27894244168`: failed.
  - GitHub `Visual UI Audit` `27896715845`: failed, but retained useful authenticated screenshots for `TB-0060`.
- Current release blockers:
  - `TB-0114` exact-head client mutation lane still lost auth on the shipped head; the fix currently exists only in the local worktree.
  - `TB-0013` standalone role-workflow QA still needs a clean rerun after the preflight failure path.
  - `TB-0019` exact-head Code Review is still stale on `1b3664a`.
  - No clean same-head `Visual UI Audit` pass exists yet for `5af32ed`.
- Current non-release but active watch items:
  - `TB-0024` external DNS host remains broken and separate from the healthy primary host.
  - `TB-0023` remains blocked on Auth-settings visibility or explicit waiver.

## Consultant Quality And Access Audit

- Release Verification, Product Ops, Security, Performance, and Data all correctly converged on the same exact-head truth: `TB-0097` and `TB-0046` stay closed, and the current release problem is evidence quality plus auth-harness drift, not stale schema panic.
- UI provided the strongest current-head product evidence by using the failed-but-populated exact-head `Visual UI Audit` artifact and reopening `TB-0060` directly from that proof.
- UX and Accessibility correctly stayed narrower than the older backlog text, but their next passes should now defer to the stronger live tracker plus screenshot evidence that keeps `TB-0060` open.
- Content correctly narrowed `TB-0040` and kept it out of a broader copy cleanup spiral.
- Trust correctly mirrored Ryan's explicit external-DNS instruction and reopened `TB-0024` instead of letting the rules drift toward a retired-host assumption.
- The remaining material access gaps are direct Supabase Auth-settings visibility, durable visual-artifact retention, stable Bing or GA env exports in `.env.qa`, and CRM or owner-state truth for GTM items.

## Team Rule Updates

- No new lead-specific shared-rule, company-wide-rule, business-access, or access-needs patch was required in this run.
- Overnight specialists already refreshed the shared docs to preserve port `8080` for local testing and `https://rcdl.tplinkdns.com` as the named external-DNS-only target when Ryan explicitly asks for it.
- This run updated [docs/lead-developer-recommendations.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/lead-developer-recommendations.md) and [docs/codex-edit-log.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md) only.
- No commit or push was attempted because the working tree already contains broad specialist documentation changes plus unrelated local runtime edits outside the lead-doc scope.

## Agent Inputs

- Date of run: 2026-06-21.
- Specialist backlog files reviewed:
  - [docs/release-verification-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md)
  - [docs/product-ops-workflow-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md)
  - [docs/security-review-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/security-review-backlog.md)
  - [docs/performance-engineering-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/performance-engineering-backlog.md)
  - [docs/data-analytics-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/data-analytics-backlog.md)
  - [docs/ui-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ui-optimization-backlog.md)
  - [docs/ux-optimization-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/ux-optimization-backlog.md)
  - [docs/accessibility-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/accessibility-backlog.md)
  - [docs/content-copyeditor-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md)
  - [docs/trust-reputation-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trust-reputation-backlog.md)
  - [docs/b2b-marketing-growth-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/b2b-marketing-growth-backlog.md)
- Shared rules and lead-owned docs reviewed:
  - [docs/company-wide-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/company-wide-rules.md)
  - [docs/consultant-team-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-team-rules.md)
  - [docs/consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md)
  - [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md)
  - [docs/codex-edit-log.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md)
- Current repo, workflow, tracker, and source checks reviewed:
  - `git rev-parse HEAD`
  - `git log --oneline --decorate -8`
  - `git status --short`
  - `git diff -- docs/agents/company-wide-rules.md docs/company-wide-rules.md docs/agents/consultant-team-rules.md docs/consultant-team-rules.md docs/agents/consultant-access-needs.md docs/consultant-access-needs.md`
  - `git diff -- src/pages/client/ClientOpportunityNew.tsx tests/e2e/deep-workflow-hotfix-audit.spec.ts src/test/deepQaTriage.test.ts src/test/websiteEmailFunction.test.ts supabase/functions/send-website-email/index.ts`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 12 --json databaseId,workflowName,headSha,status,conclusion,createdAt,updatedAt,displayTitle,url`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -k -I -L --max-time 20 https://rcdl.tplinkdns.com`
  - `curl -I -L --max-time 20 http://rcdl.tplinkdns.com`
  - `supabase db query --linked -o json "select tracking_id,status,priority,title,updated_at from public.admin_scrum_items where tracking_id in (...)"` for `TB-0013`, `TB-0019`, `TB-0023`, `TB-0024`, `TB-0040`, `TB-0046`, `TB-0049`, `TB-0052`, `TB-0060`, `TB-0097`, and `TB-0114`
  - targeted source review of [src/components/ConsentManager.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/ConsentManager.tsx), [src/pages/bum/BumContacts.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), [src/pages/admin/AdminClients.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx), [tests/e2e/deep-workflow-hotfix-audit.spec.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), [src/test/deepQaTriage.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/deepQaTriage.test.ts), and [supabase/functions/send-website-email/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/send-website-email/index.ts)
- Current external guidance rechecked:
  - [Supabase Password Security](https://supabase.com/docs/guides/auth/password-security)
  - [Supabase changelog: tables not exposed automatically](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
  - [W3C Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- Checks that could not run and why:
  - no direct live Supabase Auth-settings view was available to resolve `TB-0023`
  - no clean same-head `Visual UI Audit` pass exists yet for `5af32ed`; only the failed-but-useful screenshot artifact exists
  - no commit or push was attempted because the worktree contains unrelated local product and specialist changes outside the lead-doc scope
