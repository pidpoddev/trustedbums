# Trusted Bums Product Ops Workflow Backlog

_Last updated: 2026-06-20 by Codex daily product ops workflow analyst automation._

## Executive Read

Exact head `e231cc0` narrows the active Product Ops queue to two items, and both are already tracked live: `TB-0097` stays open because production still lacks `companies.deal_registration_config` and the live migration ledger is still missing `20260611195500` plus `20260620012000`; `TB-0052` stays open because current source still has finance-safe reporting surfaces but no real exception-lane workflow or live finance volume to validate it.

The broader 2026-06-18 Product Ops story is no longer current. Shared mailbox intake, access-request proof capture, reverse-opportunity handoff fields, and Inner Circle workflow surfaces all now exist in source, and live tracker rows `TB-0051`, `TB-0102`, and `TB-0113` are already `CLOSED`. No new Product Ops item warrants reopening without fresher live queue evidence that contradicts those closures.

## Active Recommendations

### P1 - [TB-0097] Keep client profile and beta setup governance open until production schema parity lands
- Evidence: exact-head source on `e231cc0` still routes `CLIENT_IT` to a beta setup workspace, exposes API access key management for `CLIENT_ADMIN` and `CLIENT_IT`, and keeps company-identity changes on an admin-reviewed request path in [`src/pages/client/ClientProfile.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [`src/pages/client/ClientDashboard.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [`src/pages/admin/AdminClients.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx), [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [`supabase/functions/client-team/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/client-team/index.ts), and [`src/test/dealRegistrationBetaWorkflow.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/dealRegistrationBetaWorkflow.test.ts); live project `vaoqvtxqvbptyxddpoju` still has no `public.companies.deal_registration_config`, and the live migration ledger is still missing repo rows `20260611195500` and `20260620012000`; live tracker row `TB-0097` remains `OPEN` as of 2026-06-20.
- Why it matters: Product Ops cannot call the `CLIENT_ADMIN` and `CLIENT_IT` beta setup workflow operationally real while the source-of-truth config column is absent in production and the current role walkthrough has not been revalidated against live schema.
- Recommendation: keep `TB-0097` narrowly scoped to same-head schema parity plus role-proof. Do not reopen generic profile-edit governance that current source and access rules already cover.
- Acceptance criteria: production has `companies.deal_registration_config`; the missing migration rows are present live; Product Ops keeps one role matrix for ordinary company-profile edits, identity-change review, `CLIENT_IT` beta setup, and Client Legal agreement involvement; and exact-head QA proves allow and deny behavior for `CLIENT_ADMIN`, `CLIENT_IT`, `CLIENT_LEGAL`, `CLIENT_FINANCE`, and `CLIENT_MEMBER`.

### P2 - [TB-0052] Keep finance exception readiness open until exception states have an owned workflow
- Evidence: current exact-head source gives Client Finance a cleaner payment-report, invoice, export, and dashboard lane in [`src/pages/client/ClientDashboard.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [`src/pages/client/ClientPayments.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientPayments.tsx), [`src/pages/client/ClientExports.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientExports.tsx), [`src/pages/bum/BumEarnings.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumEarnings.tsx), and finance-safe projections in [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts); live tracker row `TB-0052` remains `OPEN`; the current live Supabase read confirms `0` `customer_payment_reports`, `0` `claim_invoices`, `0` `bum_payouts`, and `0` `managing_bum_commission_allocations`, so there is still no production exception volume proving dispute, hold, reversal, or allocation-rescue behavior.
- Why it matters: finance-safe reads are shipped, but Product Ops still lacks an operator workflow for exceptions once the first disputed, held, failed, reversed, or allocation-adjusted money movement lands.
- Recommendation: keep `TB-0052` focused on the first real exception queue. Do not widen it back to basic finance visibility that current source and business access rules already cover.
- Acceptance criteria: Admin finance operations can isolate disputed, failed, canceled, reversed, or held payment, invoice, payout, and allocation states; each exception carries owner, next action, due date, and reason; and Client Finance remains limited to finance-safe context while Admin handles rescue and overrides.

## Business Access Rule Recommendations

No new business-access text is warranted in this run.

Current rules in [`docs/business-access-rules.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md) already cover the workflows that changed most:

- `Client API Access Keys`
- `Access Requests And Bootstrap Exceptions`
- `Client Team, Company Profile, And Beta Deal Registration`
- `Shared Mailbox Intake And Admin Inbox`

The next Product Ops change to that file should come only if live role walkthroughs or first finance-exception volume contradict those current rules.

## Workflow Map

- Contact intake: current source now gives admins claim, qualification, owner, next-action, due-date, and escalation paths through [`src/components/admin/ContactSubmissionsPanel.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx) and [`src/lib/contactApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts).
- Shared mailbox: current source now gives Admin-only sync, assignment, category, handled state, reply, and send-event auditability through [`src/pages/admin/AdminInbox.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminInbox.tsx), [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [`supabase/functions/admin-shared-mailbox/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-shared-mailbox/index.ts), and [`supabase/migrations/20260612143000_add_admin_shared_mailbox_inbox.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260612143000_add_admin_shared_mailbox_inbox.sql).
- Access requests: current source now forces proof-backed review for `PUBLIC_EMAIL_COMPANY`, `RELATED_DOMAIN`, and `COMPANY_IDENTITY_CHANGE` in [`src/pages/admin/AdminClients.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx), [`supabase/functions/admin-access-requests/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-access-requests/index.ts), and [`src/test/adminAccessReviewWorkflow.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/adminAccessReviewWorkflow.test.ts).
- Client role workspaces: current source now splits dashboard recovery and next actions by `CLIENT_ADMIN`, `CLIENT_FINANCE`, `CLIENT_LEGAL`, and `CLIENT_IT` in [`src/pages/client/ClientDashboard.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx); `CLIENT_IT` owns beta setup and API-access-key workflow in [`src/pages/client/ClientProfile.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx).
- Finance lane: current source supports payment-report entry, invoice generation, exports, and Bum payout history, but the first exception-specific owner and rescue workflow still lacks live volume and explicit admin exception surfaces.

## Watchlist

- Do not reopen `TB-0051`, `TB-0102`, or `TB-0113` from older backlog language alone. Current head ships the relevant workflow surfaces, and live tracker rows are already `CLOSED`.
- The missing live repo migrations `20260611195500` and `20260620012000` are corroborating control-plane drift for `TB-0097`, not a separate Product Ops item.
- Shared mailbox queue volume, contact queue counts, and access-request traffic beyond the initial schema and tracker checks could not be freshly re-aggregated in this run because the Supabase MCP moved from successful reads into `RATE_LIMITED` responses mid-session. June 18-19 queue counts remain historical evidence, not freshly revalidated counts.

## Current Standards And Time-Sensitive Notes

- Microsoft Learn now recommends Exchange Online `RBAC for Applications` with resource scopes for mailbox-limited app access, replacing the older application-access-policy model. That supports keeping `bums@trustedbums.com` mailbox access explicitly scoped rather than broad tenant mail read. Source: [Microsoft Learn](https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac)
- NIST SP 800-53A AC-6 still expects least-privilege reviews to validate assigned privileges and remove or reassign them when business need changes. That supports the current proof-backed access-request workflow and the need for live role revalidation before calling `CLIENT_IT` or finance workflows fully operational. Source: [NIST SP 800-53A assessment procedures](https://csrc.nist.gov/files/pubs/sp/800/53/a/r5/final/docs/sp800-53ar5-assessment-procedures.txt)
- Stripe’s current docs still separate payout schedule from settlement timing, and dispute objects still carry separate balance-transaction effects. That supports keeping finance exception handling separate from simple paid or unpaid presentation once live money movement begins. Sources: [Stripe payouts](https://docs.stripe.com/payouts), [Stripe dispute object](https://docs.stripe.com/api/disputes/object)

## Access Requests And Evidence Gaps

- Product Ops still lacks CRM pipeline exports, support SOPs, finance exception examples, and narrated role walkthroughs for `CLIENT_ADMIN`, `CLIENT_IT`, `CLIENT_LEGAL`, `CLIENT_FINANCE`, `CLIENT_MEMBER`, and Admin.
- This run had live project confirmation plus successful schema and tracker reads on Supabase project `vaoqvtxqvbptyxddpoju`, but broader aggregate SQL moved into `RATE_LIMITED` responses before queue counts could be rechecked or tracker rows could be refreshed.
- No additional mailbox-body review, CRM export, or operator shadowing was required to keep `TB-0097` open because the live schema miss is already sufficient.

## Agent Inputs

- Date of run: 2026-06-20 (`America/New_York`).
- Files and docs reviewed:
  - `docs/agents/automation-prompts/trusted-bums-daily-product-ops-analyst.toml`
  - `docs/agents/consultant-team-rules.md`
  - `docs/agents/company-wide-rules.md`
  - `docs/agents/consultant-access-needs.md`
  - `docs/agents/business-access-rules.md`
  - [`docs/product-ops-workflow-backlog.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md)
  - [`docs/business-access-rules.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md)
  - [`docs/consultant-access-needs.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md)
  - [`docs/shared-mailbox-operations.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/shared-mailbox-operations.md)
  - [`docs/trusted-bums-operating-model.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trusted-bums-operating-model.md)
  - [`docs/release-verification-backlog.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md)
  - [`docs/codex-edit-log.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md)
  - [`src/components/admin/ContactSubmissionsPanel.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx)
  - [`src/lib/contactApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts)
  - [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts)
  - [`src/pages/admin/AdminClients.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx)
  - [`src/pages/admin/AdminInbox.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminInbox.tsx)
  - [`src/pages/admin/AdminHandoffs.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminHandoffs.tsx)
  - [`src/pages/client/ClientDashboard.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx)
  - [`src/pages/client/ClientProfile.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx)
  - [`src/pages/client/ClientPayments.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientPayments.tsx)
  - [`src/pages/client/ClientExports.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientExports.tsx)
  - [`src/pages/bum/BumEarnings.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumEarnings.tsx)
  - [`supabase/functions/admin-access-requests/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-access-requests/index.ts)
  - [`supabase/functions/client-team/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/client-team/index.ts)
  - [`supabase/functions/admin-shared-mailbox/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-shared-mailbox/index.ts)
  - [`supabase/migrations/20260609154000_add_client_intake_qualification_fields.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260609154000_add_client_intake_qualification_fields.sql)
  - [`supabase/migrations/20260611195500_add_client_deal_registration_config.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260611195500_add_client_deal_registration_config.sql)
  - [`supabase/migrations/20260612143000_add_admin_shared_mailbox_inbox.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260612143000_add_admin_shared_mailbox_inbox.sql)
  - [`supabase/migrations/20260619120000_add_identity_review_inner_circle_companies_reverse_handoffs.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260619120000_add_identity_review_inner_circle_companies_reverse_handoffs.sql)
  - [`src/test/adminAccessReviewWorkflow.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/adminAccessReviewWorkflow.test.ts)
  - [`src/test/clientLegalItRoles.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/clientLegalItRoles.test.ts)
  - [`src/test/dealRegistrationBetaWorkflow.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/dealRegistrationBetaWorkflow.test.ts)
- Commands and repo checks reviewed:
  - `git status --short`
  - `git rev-parse HEAD`
  - `git log --oneline --decorate -n 8`
  - `git diff --name-only a17a856..HEAD -- src supabase docs`
  - targeted `rg` and `sed` source review across current workflow surfaces
- Live Supabase evidence reviewed for project `vaoqvtxqvbptyxddpoju`:
  - project metadata and URL confirmation
  - schema check showing no `companies.deal_registration_config`
  - migration-ledger check showing no `20260611195500` or `20260620012000`
  - tracker reads for `TB-0051`, `TB-0052`, `TB-0097`, `TB-0102`, and `TB-0113`
  - aggregate finance read showing `0` rows in `customer_payment_reports`, `claim_invoices`, `bum_payouts`, and `managing_bum_commission_allocations`
- Internet sources reviewed:
  - Microsoft Learn Exchange Online `RBAC for Applications`
  - NIST SP 800-53A AC-6 least-privilege assessment procedures
  - Stripe payouts and dispute object docs
- Checks that could not run and why:
  - broader aggregate queue SQL and tracker refresh writes hit Supabase MCP `RATE_LIMITED` responses after the initial successful schema and tracker reads
  - no CRM exports, support SOPs, finance exception examples, or narrated role walkthroughs were available in this run
