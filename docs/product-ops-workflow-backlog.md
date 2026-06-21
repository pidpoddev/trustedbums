# Trusted Bums Product Ops Workflow Backlog

_Last updated: 2026-06-21 by Codex daily product ops workflow analyst automation._

## Executive Read

Exact head `5af32edeb0cc1290cdbae808207e75276d22a4d6` keeps the active Product Ops implementation queue on one item: `TB-0052` stays open because live production still has `0` `customer_payment_reports`, `0` `claim_invoices`, `0` `bum_payouts`, and `0` `managing_bum_commission_allocations`, so the first finance-exception workflow still has no operator-owned lane to prove.

`TB-0097` stays closed on current live truth. The 2026-06-21 release verification pass rechecked the live `companies.deal_registration_config` object and confirmed live tracker row `TB-0097` is still `CLOSED`; the missing live migration-ledger rows `20260620151519` and `20260620152414` are current release-provenance debt, not a Product Ops reopen.

Shared mailbox, access-request, and Inner Circle closures also stay closed. Live aggregate reads now show `100` categorized shared-mailbox messages, all assigned and all `IN_PROGRESS`, plus one already-`approved` access request and one `NEW` contact submission. That matches the 2026-06-19 bulk mailbox triage posture captured in the edit log rather than a fresh Product Ops regression. Exact-head GitHub `QA` `27885457568`, DreamHost deploy `27885457565`, and `E2E Smoke` `27885474019` all completed `success` on 2026-06-20 UTC; standalone `Deep QA Hotfix Audit` `27894244168` failed on 2026-06-21 UTC, but that is a release or QA-harness issue, not a new Product Ops workflow defect.

## Active Recommendations

### Closed - [TB-0097] Client profile and beta setup governance
- Evidence: current source still routes `CLIENT_IT` to beta setup, exposes API access key management for `CLIENT_ADMIN` and `CLIENT_IT`, and keeps company-identity changes on an admin-reviewed request path in [`src/pages/client/ClientProfile.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [`src/pages/client/ClientDashboard.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [`src/pages/admin/AdminClients.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx), [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), and [`supabase/functions/client-team/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/client-team/index.ts).
- Live proof: project `vaoqvtxqvbptyxddpoju` is active and healthy at `https://vaoqvtxqvbptyxddpoju.supabase.co`; live tracker row `TB-0097` is `CLOSED`; and the 2026-06-21 release verification pass kept the item closed after rechecking the live company-config object path.
- Remaining enhancement: add `QA_CLIENT_IT` to `.env.qa` and the hosted role matrix when that account exists, so Product Ops can prove the IT allow path with browser evidence instead of source and focused tests.

### P2 - [TB-0052] Keep finance exception readiness open until exception states have an owned workflow
- Evidence: current exact-head source still gives Client Finance and Admin cleaner finance-safe reporting surfaces in [`src/pages/client/ClientDashboard.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [`src/pages/client/ClientPayments.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientPayments.tsx), [`src/pages/client/ClientExports.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientExports.tsx), [`src/pages/client/clientReportsModel.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/clientReportsModel.ts), [`src/pages/admin/AdminPayments.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminPayments.tsx), [`src/pages/admin/AdminPayouts.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminPayouts.tsx), [`src/pages/bum/BumEarnings.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumEarnings.tsx), and [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts); live tracker row `TB-0052` remains `OPEN`; and the current live Supabase read confirms `0` payment reports, invoices, payouts, and manager-allocation rows.
- Why it matters: the reporting surfaces are shipped, but the first disputed, voided, reversed, held, sent-not-paid, paid-not-allocated, or manager-allocation rescue event would still force Admin to work outside an explicit queue and state contract.
- Recommendation: keep `TB-0052` focused on the first real finance-exception lane. Do not reopen baseline finance visibility, mailbox routing, or client-profile governance that current source and live tracker truth already cover.
- Acceptance criteria: Admin finance operations can isolate disputed, held, voided, reversed, sent-not-paid, paid-not-allocated, and pending-allocation states across payments, invoices, payouts, and manager allocations; each exception carries owner, next action, due date, and reason; and Client Finance remains limited to finance-safe context while Admin handles rescue and overrides.

## Business Access Rule Recommendations

No new business-access text is warranted in this run.

Current rules in [`docs/business-access-rules.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md) already cover the workflows that changed most:

- `Client API Access Keys`
- `Access Requests And Bootstrap Exceptions`
- `Client Team, Company Profile, And Beta Deal Registration`
- `Shared Mailbox Intake And Admin Inbox`
- `Extension Page Captures And Bum Represented Contacts`
- `Payments, Invoices, Payouts, And Reports`

The next Product Ops change to that file should come only if live role walkthroughs, live finance exception volume, or mailbox closeout behavior contradict those current rules.

## Workflow Map

- Contact intake: live aggregate state still shows `1` `NEW` contact submission, and current source gives admins claim, qualification, owner, next-action, due-date, and escalation paths through [`src/components/admin/ContactSubmissionsPanel.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx) and [`src/lib/contactApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts).
- Shared mailbox: live aggregate state now shows `100` shared-mailbox rows, all assigned, all categorized (`39` `dmarc`, `29` `question`, `26` `support`, `3` `client_criteria`, `3` `legal`), and all `IN_PROGRESS`, with `0` `HANDLED`, `0` `ARCHIVED`, and `0` `handled_at` timestamps. Current source supports sync, claim, category changes, reply flows, and `HANDLED` transitions through [`src/pages/admin/AdminInbox.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminInbox.tsx), [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), and [`supabase/functions/admin-shared-mailbox/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-shared-mailbox/index.ts).
- Access requests: live aggregate state still shows `1` `approved` access-request row and no live pending-review backlog; current source keeps proof-backed review for `PUBLIC_EMAIL_COMPANY`, `RELATED_DOMAIN`, and `COMPANY_IDENTITY_CHANGE` in [`src/pages/admin/AdminClients.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx), [`src/pages/client/ClientTeam.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTeam.tsx), and [`supabase/functions/admin-access-requests/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-access-requests/index.ts).
- Client role workspaces: current source still splits dashboard recovery and next actions by `CLIENT_ADMIN`, `CLIENT_FINANCE`, `CLIENT_LEGAL`, and `CLIENT_IT` in [`src/pages/client/ClientDashboard.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), while `CLIENT_IT` owns beta setup and API-access-key workflow in [`src/pages/client/ClientProfile.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx).
- Finance lane: current source supports payment-report entry, invoice generation, business-date reporting, exports, and Bum payout history, but production still has no live finance volume and therefore no proven operator exception lane.

## Watchlist

- Do not reopen `TB-0102` or `TB-0113` from older backlog language alone. Live tracker rows remain `CLOSED`, and current mailbox and Inner Circle evidence does not contradict those closures.
- The shared mailbox still has `100` messages with no `handled_at` timestamps, but current data matches the documented 2026-06-19 bulk-triage posture rather than uncategorized or unassigned drift. If operators need true handled or archived closeout metrics, treat that as a new queue-metrics or SLA-reporting decision instead of reopening the original deployment contract item.
- Current exact-head release blockers `TB-0019`, `TB-0013`, `TB-0114`, and the missing same-head `Visual UI Audit` belong to release, QA, and harness docs, not this workflow backlog.
- The missing live migration-ledger rows `20260620151519` and `20260620152414` are release-provenance debt, not a Product Ops reopen.

## Current Standards And Time-Sensitive Notes

- Microsoft Learn still documents Exchange Online `RBAC for Applications` as the granular, resource-scoped way to limit app mailbox access, and says it replaces older Application Access Policies. That still supports keeping `bums@trustedbums.com` mailbox access explicitly scoped instead of broad tenant-mail access. Source: [Microsoft Learn](https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac)
- NIST SP 800-53A Rev. 5 still frames control assessment as a customizable methodology that should be aligned to organizational risk tolerance. That still supports proof-backed least-privilege and workflow-access reviews before broadening client-role or mailbox visibility. Source: [NIST SP 800-53A Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final)
- Stripe’s current payouts docs still separate payout schedule from settlement timing, and its dispute object still models dispute balance effects separately. That still supports keeping finance exception handling separate from simple paid or unpaid presentation once live money movement begins. Sources: [Stripe payouts](https://docs.stripe.com/payouts), [Stripe dispute object](https://docs.stripe.com/api/disputes/object)

## Access Requests And Evidence Gaps

- Product Ops still lacks CRM pipeline exports, support SOPs, finance exception examples, and narrated role walkthroughs for `CLIENT_ADMIN`, `CLIENT_IT`, `CLIENT_LEGAL`, `CLIENT_FINANCE`, `CLIENT_MEMBER`, and Admin.
- This run had live project confirmation plus successful direct tracker, mailbox, access-request, contact-submission, and finance aggregate reads on Supabase project `vaoqvtxqvbptyxddpoju`.
- No current exact-head `Visual UI Audit` exists for `5af32ed`, but this Product Ops pass did not depend on new visual proof because the current exact-head code changes were release, QA, and policy oriented rather than new workflow-surface launches.

## Agent Inputs

- Date of run: 2026-06-21 (`America/New_York`).
- Files and docs reviewed:
  - `docs/agents/automation-prompts/trusted-bums-daily-product-ops-analyst.toml`
  - `docs/agents/consultant-team-rules.md`
  - `docs/agents/company-wide-rules.md`
  - `docs/agents/consultant-access-needs.md`
  - `docs/agents/business-access-rules.md`
  - [`docs/product-ops-workflow-backlog.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md)
  - [`docs/business-access-rules.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md)
  - [`docs/consultant-access-needs.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md)
  - [`docs/codex-edit-log.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md)
  - [`src/pages/admin/AdminInbox.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminInbox.tsx)
  - [`src/pages/admin/AdminClients.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx)
  - [`src/pages/admin/AdminPayments.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminPayments.tsx)
  - [`src/pages/admin/AdminPayouts.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminPayouts.tsx)
  - [`src/pages/client/ClientDashboard.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx)
  - [`src/pages/client/ClientPayments.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientPayments.tsx)
  - [`src/pages/client/ClientExports.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientExports.tsx)
  - [`src/pages/client/ClientProfile.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx)
  - [`src/pages/client/ClientTeam.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTeam.tsx)
  - [`src/pages/client/clientReportsModel.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/clientReportsModel.ts)
  - [`src/pages/bum/BumEarnings.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumEarnings.tsx)
  - [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts)
  - [`src/components/admin/ContactSubmissionsPanel.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx)
  - [`supabase/functions/admin-access-requests/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-access-requests/index.ts)
  - [`supabase/functions/admin-shared-mailbox/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-shared-mailbox/index.ts)
  - [`supabase/functions/client-team/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/client-team/index.ts)
  - [`src/test/financeReportsModel.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/financeReportsModel.test.ts)
  - [`src/test/adminAccessReviewWorkflow.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/adminAccessReviewWorkflow.test.ts)
  - [`src/test/adminSharedMailbox.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/adminSharedMailbox.test.ts)
  - [`src/test/dealRegistrationBetaWorkflow.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/dealRegistrationBetaWorkflow.test.ts)
- Commands and repo checks reviewed:
  - `git status --short`
  - `git rev-parse HEAD`
  - `git log --oneline --decorate -n 8`
  - `git diff --stat a014226..HEAD -- src supabase docs tests .github`
  - `git diff --name-only a014226..HEAD -- src supabase docs tests .github`
  - `gh run list --limit 12 --json databaseId,workflowName,headSha,status,conclusion,createdAt,updatedAt,url,displayTitle`
  - targeted `rg` and `sed` source review across current workflow and finance surfaces
- Live Supabase evidence reviewed for project `vaoqvtxqvbptyxddpoju`:
  - project metadata and URL confirmation
  - tracker reads for `TB-0051`, `TB-0052`, `TB-0097`, `TB-0102`, and `TB-0113`
  - aggregate finance read showing `0` rows in `customer_payment_reports`, `claim_invoices`, `bum_payouts`, and `managing_bum_commission_allocations`
  - aggregate queue counts showing `1` `approved` access request, `1` `NEW` contact submission, and `100` shared-mailbox messages
  - grouped shared-mailbox category and status reads showing all live messages are assigned and `IN_PROGRESS`
- Internet sources reviewed:
  - Microsoft Learn Exchange Online `RBAC for Applications`
  - NIST SP 800-53A Rev. 5
  - Stripe payouts and dispute object docs
- Checks that could not run and why:
  - no CRM exports, support SOPs, finance exception examples, or narrated role walkthroughs were available in this run
  - no current exact-head `Visual UI Audit` exists for `5af32ed`
