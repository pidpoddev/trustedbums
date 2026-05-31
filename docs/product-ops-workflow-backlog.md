# Trusted Bums Product Ops Workflow Backlog

_Last updated: 2026-05-31 by Codex daily lead developer automation._

## Executive Read

The prior Product Ops backlog had gone stale: `/admin/handoffs` now exists in `src/App.tsx` and `src/pages/admin/AdminHandoffs.tsx`, so the remaining operations risk is queue maturity rather than queue absence. Admins need stronger urgency, ownership, next-action, and notification-health signals to rescue public-contact conversions, Bum responses, and intro requests without inferring priority from timestamps alone.

Live Supabase read-only checks on 2026-05-31 confirm the relevant objects are active: `customer_target_responses` has 4 rows, `contact_submissions` has 1, `bum_contacts` has 2, `extension_page_captures` has 1, `client_bum_intro_requests` has 0, and `performance_metric_events` has 3,769 rows across 42 routes in the last 7 days. Product Ops should now focus on exception management, access-rule decisions, and route-test handoffs before live volume grows.

## Active Recommendations

### P0 - Add owner, aging, next-action, and notification health to `/admin/handoffs`
- Evidence: `/admin/handoffs` is now routed in `src/App.tsx` and implemented in `src/pages/admin/AdminHandoffs.tsx`. UX review found the page sorts by age but does not surface `admin_next_action`, `admin_priority`, or `notification_error` as prominent queue signals even though the contact/handoff model exposes those fields through `src/lib/contactApi.ts` and `supabase/migrations/20260529181000_add_contact_abuse_and_handoff_fields.sql`.
- Why it matters: Admins now have one workspace for rescue work, but without SLA buckets, next step, or failed-notification visibility the queue still depends on manual interpretation. That can delay buyer leads, Bum responses, and client intro follow-through.
- Recommendation: Treat `/admin/handoffs` as an operational queue: show stale buckets, owner, next action, priority, linked workflow, and notification failure state; add filters for stale, unowned, and failed-notification work.
- Acceptance criteria: Admins can identify fresh, stale, unowned, and failed-notification items without opening another route; each open item has an owner or explicit unowned state; next action is visible; and queue summaries distinguish actionable age buckets.

### P1 - Turn finance exceptions and payout readiness into first-class queues
- Evidence: `src/pages/admin/AdminPayments.tsx`, `src/pages/admin/AdminPayouts.tsx`, `src/pages/client/ClientReports.tsx`, and `supabase/migrations/20260517061000_add_claim_payment_invoicing.sql` support invoice, payout, dispute, void, and allocation states, but the UI still emphasizes happy-path lists over exception ownership. Data review also found finance date semantics are not consistently business-effective across reports and exports.
- Why it matters: The first finance records are live, and the biggest operational risk is failing to isolate disputed, voided, uninvoiced, paid-without-payout, late-entered, and payout-pending cases before reconciliation depends on side channels.
- Recommendation: Add finance exception queues and summary cards for disputed, voided, uninvoiced, paid-without-payout, payout-pending, and stale invoice states. Require notes and timestamps on exception transitions, and align report filters to business-effective dates.
- Acceptance criteria: Admin finance users can isolate each exception state in-product; exception transitions record notes and timestamps; paid invoices without payout progression are visible; and finance reports use effective dates while preserving audit timestamps.

### P1 - Define operational ownership for profile bootstrap and workspace assignment
- Evidence: Security review found Clerk `unsafeMetadata` still feeds role/company/bootstrap state in `src/contexts/AuthContext.tsx`, `src/components/SignupIntentDialog.tsx`, and `src/lib/portalApi.ts`. The `Profile Bootstrap And Self-Editable Identity` business rule now defines the first implementation pass for workspace creation, public-email manual verification, Client Admin same-company user management, Admin-reviewed related domains, pending/denied states, audit events, and self-editable preference fields.
- Why it matters: Signup intent, role assignment, and company attachment are operational handoffs, not just auth plumbing. If Product Ops does not own the approval model, Security cannot safely tighten RLS without risking legitimate onboarding or allowing self-escalation.
- Recommendation: Implement the approved domain-claim operating model in the workflow design: first verified claimant of an unclaimed client business email domain can create the company and become initial Client Admin; Gmail/public-email signups can request company creation but require Admin review with alternate proof of company and administrative identity; later same-domain users enter Client Admin approval; Client Admins can manage same-company users including disabling another Client Admin; related domains can be requested but require Admin review before access; Admins get exception queues for public-email, unmatched-domain, related-domain, denied, and stale-admin override cases.
- Acceptance criteria: Product has documented domain-claim, public-email proof, same-domain approval, Admin-reviewed related-domain, pending/denied, disablement, and override flows; safe self-edit fields are display name, timezone, date format, and notification preferences; public/shared/disposable domains never auto-create companies; agencies, consultants, partner/referral domains, and ambiguous school/franchise/subsidiary domains start as manual-review; QA has allow/deny cases for profile bootstrap.

### P1 - Define extension-capture and represented-contact operating rules
- Evidence: `extension_page_captures`, `bum_contacts`, `extension-api-v1`, and `portal-contacts` are now live product surfaces. The business rule keeps raw capture text, source URLs, notes, and represented-contact details Bum/Admin scoped unless Product approves converted client visibility.
- Why it matters: Extension captures can contain third-party page text, personal contact details, and notes. Without product rules for conversion, retention, and client visibility, future tooling could expose raw capture data to the wrong role.
- Recommendation: Define the conversion lifecycle from capture to represented contact to client-visible workflow output. Decide which converted fields Client Admin or Client Member may see, whether Client Finance ever sees context, who can archive/delete, and how long raw selected text/source URLs are retained.
- Acceptance criteria: The capture/contact lifecycle has statuses, owners, retention expectations, and role-specific visibility; extension and portal QA can prove one allowed and one denied case for each role family.

### P2 - Add owner and aging views for support, meetings, and transcript rescue
- Evidence: `ContactSubmissionsPanel`, `TeamsMeetingsPanel`, `MeetingTranscriptsSection`, and linked transcript sync functions expose artifacts, but there is still no consolidated owner/aging view for overdue support items, completed meetings without transcripts, or transcript-sync exceptions.
- Why it matters: Meetings and support follow-up are service-quality commitments. Operators should not need to inspect raw tables or scattered panels to find aging work.
- Recommendation: Add owner, priority, age, overdue, and last-action context to support and transcript rescue surfaces after the P0 handoff queue is upgraded.
- Acceptance criteria: Operators can filter support/transcript work by owner and age, completed meetings missing transcripts are visible, and overdue items have a named next step.

## Business Access Rule Recommendations

- Product has confirmed the core profile bootstrap rule: first verified user for an unclaimed client business email domain may create the company and become initial Client Admin; Gmail/public-email users may request company creation but require Admin review and alternate proof; later same-domain users require Client Admin approval; Client Admins may manage same-company users including disabling another Client Admin; related-domain aliases require Admin review before access; public/shared/disposable domains never auto-create companies; agencies, consultants, partner/referral domains, and ambiguous school/franchise/subsidiary domains start as manual-review; Admin can override stale or invalid prior admins; access changes require audit events.
- Product must confirm whether saved targets can ever preserve Bum read access. Until clarified, saved-only access is not an approved entitlement in `docs/business-access-rules.md`.
- Product must confirm converted extension-capture visibility and raw-capture retention before exposing capture-derived details to client roles.
- Client Finance should remain finance/report scoped. If finance needs operational meeting or target context for a dispute, use explicit case participation or a finance-note surface rather than broad operational exports.

## Workflow Map

- Public intake: Visitor submits contact form through `submit-contact` -> abuse controls validate -> contact submission enters admin handoff queue -> Admin archives, escalates, converts, or follows up.
- Profile bootstrap: Visitor signs up with role/company intent and verified email domain -> if the client domain is unclaimed, approved server flow creates company and initial Client Admin -> if domain is already claimed, user enters Client Admin approval queue -> Admin can override stale or invalid prior admins -> authoritative profile changes are audited.
- Bum-to-client handoff: Bum submits target response -> Client reviews and formalizes or declines -> Admin monitors aging/ownership in `/admin/handoffs`.
- Client-to-Bum intro request: Client creates intro request -> requested Bum and Admin need queue visibility -> closure authority remains an open product decision.
- Extension capture: Bum captures page context for an allowed destination -> capture can materialize represented contact -> raw capture stays Bum/Admin scoped unless converted into approved client-visible workflow output.
- Finance path: Customer payment is reported -> invoice generated/sent/paid -> payout allocation progresses -> exceptions and paid-without-payout cases enter finance queue.
- Transcript path: Meeting completes -> transcript sync or manual artifact appears -> completed meetings without transcript completion enter rescue view.

## Watchlist

- `/admin/handoffs` should be added to visual and interaction route coverage before its queue state is called visually verified.
- The direct public `send-website-email` function remains a trust/ops risk until it is internal-only; Product Ops should verify legitimate contact submissions still create exactly one admin-reviewable item after that change.
- `CLIENT_FINANCE` currently reaches `/client/exports`; keep finance users out of target-contact and meeting export data unless Product explicitly approves a narrower exception.

## Current Standards And Time-Sensitive Notes

- Current Zendesk SLA guidance still centers support operations on visible response/resolution targets, which supports owner, aging, and overdue queue signals. Source: [Zendesk SLA policies overview](https://support.zendesk.com/hc/en-us/articles/5600997516058-About-SLA-policies-and-how-they-work).
- Current Microsoft Graph transcript notification guidance still treats transcript/recording notifications as subscription-based operational workflows, so completed-meeting rescue visibility remains relevant. Sources: [Microsoft Graph change notifications overview](https://learn.microsoft.com/en-us/graph/change-notifications-overview), [Get change notifications for transcripts and recordings](https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/meeting-transcripts/fetch-id).
- OWASP still recommends least privilege and deny-by-default access control, which remains the baseline for profile bootstrap, extension captures, represented contacts, transcript access, and finance exceptions. Sources: [OWASP Least Privilege Principle](https://owasp.org/www-community/controls/Least_Privilege_Principle), [OWASP Access Control](https://owasp.org/www-community/Access_Control).

## Access Requests And Evidence Gaps

- Need support queue exports, SLA definitions, operator screenshots, CRM pipeline data, finance exception samples, admin logs, operations SOPs, and narrated role walkthroughs.
- Need Product and Security confirmation for saved-target visibility, extension-capture retention, converted capture visibility, and intro-request closure authority.
- Supabase lead-run access on 2026-05-31 included read-only SQL, policy catalog queries, grants/function ACL checks, edge-function inventory/source, and safe aggregate counts. Dedicated advisor and log tools were still not exposed as callable tools in the lead session.

## Agent Inputs

- Date of run: 2026-05-31.
- Files, routes, docs, Supabase checks, and sources reviewed: `docs/consultant-team-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, prior `docs/product-ops-workflow-backlog.md`, `docs/security-review-backlog.md`, `docs/qa-test-backlog.md`, `docs/ux-optimization-backlog.md`, `docs/data-analytics-backlog.md`, `src/App.tsx`, `src/pages/admin/AdminHandoffs.tsx`, `src/lib/contactApi.ts`, `src/contexts/AuthContext.tsx`, `src/components/SignupIntentDialog.tsx`, `src/lib/portalApi.ts`, `src/pages/admin/AdminPayments.tsx`, `src/pages/admin/AdminPayouts.tsx`, `src/pages/client/ClientExports.tsx`, `supabase/functions/extension-api-v1/index.ts`, `supabase/functions/portal-contacts/index.ts`, `supabase/migrations/20260525160000_add_extension_api_page_captures.sql`, `supabase/migrations/20260526223000_add_bum_contacts.sql`, and `supabase/migrations/20260529181000_add_contact_abuse_and_handoff_fields.sql`.
- Commands and live checks reviewed: `git status --short`, `rg`, `sed`, Supabase `_get_project`, `_list_edge_functions`, `_get_edge_function`, and read-only `_execute_sql` counts for workflow tables.
- Checks that could not run and why: no support/CRM/finance/SOP/walkthrough evidence was available; no authenticated Product Ops browser workflow was rerun beyond source and specialist evidence; dedicated Supabase advisor/log tools were not callable in this lead session.
