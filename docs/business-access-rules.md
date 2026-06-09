# Trusted Bums Business Access Rules

_Last updated: 2026-05-31 by Codex daily lead developer automation._

## Purpose

This document is the business source of truth for role-based access decisions before RLS, edge-function authorization, route guards, or QA tests are changed.

For broader company, product, website, terminology, trust, and operating behavior, check `docs/company-wide-rules.md` first. When Ryan clarifies behavior that affects access, mirror the relevant rule here.

RLS hardening must preserve legitimate Trusted Bums workflows. Every proposed access change should map to this document and include before/after QA checks for affected roles.

Every new or changed Supabase data workflow must include RLS/authorization proof before release. The proof must cover both sides of access: allowed roles can complete their legitimate portal/API/extension workflow, and disallowed roles cannot read or mutate cross-role or cross-company data through direct Supabase access, route guards, edge functions, public RPC, or extension APIs. Tests must use the production auth token shape where possible; Trusted Bums Clerk session tokens may evaluate as the `anon` database role while still carrying a signed-in `sub`, so policies must be validated against that reality rather than an assumed `authenticated` role. For writes that do not need returned rows, prefer minimal-return patterns to avoid accidental RLS `USING` failures during `RETURNING`.

## Ownership Model

- Product Ops defines the business workflow and handoff rules.
- QA defines the role data each workflow needs and the allow/deny test scenarios.
- Security maps the business rules to RLS, RPC, edge-function, and route-guard controls.
- Data/Analytics checks whether reporting, exports, dashboards, and telemetry need different read access than operational screens.
- Lead Developer approves sequencing and blocks RLS hardening that lacks role-by-role acceptance criteria.

## Access Rule Template

### Object or workflow
- Roles:
- Data needed:
- Allowed actions:
- Allowed when:
- Denied when:
- Sensitive fields:
- Source of truth:
- RLS/authorization owner:
- QA proof:
- Open questions:

## Starter Role Matrix

| Role | Core purpose | Default data posture |
| --- | --- | --- |
| Public Visitor | Evaluate Trusted Bums, submit contact/signup interest, read legal and marketing pages. | No portal data. Public content and intentional public forms only. |
| Client Admin | Manage the client company relationship, targets, opportunities, Bum intro requests, trainings, reports, payments, and team access. | Company-scoped access, with admin-level visibility inside their own company. |
| Client Finance | Review payment reports, invoices, exports, and finance dashboards. | Company-scoped finance/report access; no unrelated workflow management access unless explicitly granted. |
| Client Member | Participate in assigned client workflows such as trainings, target review, intro requests, or reporting as granted. | Least-privilege company-scoped access based on team role and workflow involvement. |
| Bum | Manage their own profile, prospects, contacts, opportunities, intro requests, trainings, earnings, customer leads, and relevant conversations. | Own or explicitly assigned marketplace work only; no broad client target browsing by default. |
| Admin | Operate and troubleshoot the marketplace across clients, Bums, finance, training, support, and reports. | Full operational access with auditability, support tooling, and elevated-action controls. |

## Candidate Rules To Validate First

### Public Contact And Signup Intake
- Roles: Public Visitor, Admin, internal notification mailbox or workflow automation.
- Data needed: Visitor contact details, declared interest, message, anti-abuse proof, submission timestamp, review status, and any escalation or conversion outcome.
- Allowed actions: Public visitors may submit intentional contact or signup-interest forms; Admins may review, triage, escalate, convert, archive, or reply through approved workflows; automated notification paths may send internal alerts only for validated submissions.
- Allowed when:
  - The visitor submits the intended public form with required fields plus current anti-abuse proof.
  - Internal mail or queue notifications are triggered only after server-side validation and abuse checks pass.
  - Admins are reviewing, escalating, or converting the resulting intake record.
- Denied when:
  - Requests fail anti-abuse verification, rate limits, nonce checks, or other server-side abuse controls.
  - Unauthenticated callers try to list, read, update, or resend prior submissions.
  - Public users attempt to trigger internal email workflows outside the intended intake path.
- Sensitive fields: Email address, phone or contact details if later added, free-text message content, internal admin notes, conversion decisions, and notification mailbox addresses.
- Source of truth: Public contact/signup forms, `contact_submissions`, related admin queues, and the `send-website-email` or successor notification path.
- RLS/authorization owner: Security Engineer plus Product Ops, with Trust & Reputation review.
- QA proof:
  - A valid public submission creates exactly one intake record and one intended internal notification.
  - Invalid captcha, nonce, or throttled repeats are rejected without creating duplicate mail noise.
  - Public users cannot read or mutate prior submissions through portal, RPC, or direct API paths.
  - Admins can review and triage created submissions without exposing internal notes publicly.
- Open questions:
  - What is the approved anti-abuse stack for public intake: Turnstile, provider-native challenge, IP throttle, email throttle, or combination?
  - Should high-volume or suspicious submissions create records without sending email, or should they be dropped entirely?

### Profile Bootstrap And Self-Editable Identity
- Roles: Public Visitor, signed-in unassigned user, Client Admin, Client Finance, Client Member, Bum, Admin.
- Data needed: Clerk user ID, email, verified email domain, display name, requested signup intent, approved portal role, approved client company, approved client access role, approved Bum identity, timezone, date format, notification preferences, domain-claim status, approved related-domain aliases, pending/approved/denied access status, approving Client Admin or Admin, disabled status, and audit history for role, company, domain, approval, denial, disablement, or override changes.
- Allowed actions:
  - Public visitors may submit signup intent, company-name hints, and verified email during onboarding.
  - First verified client-domain claimant may create the client company workspace and become initial Client Admin when the email domain is not already claimed.
  - Gmail and other public-email users may request company creation, but only Admin may approve company creation and initial Client Admin assignment after alternate company-identity and administrative-identity proof.
  - Later users from an already claimed client email domain may request access to that company.
  - Existing Client Admins may approve same-domain users, assign company-scoped roles such as Client Admin, Client Finance, or Client Member, and disable same-company users including another Client Admin.
  - Client Admins may request additional related company domains, but those domains require Admin review before they grant company access.
  - Signed-in users may edit safe profile preferences such as display name, timezone, date format, and notification preferences when those fields do not affect authorization.
  - Admins may override or repair portal role, client company, client access role, Bum identity, company-domain ownership, and admin status through an audited server-side path, including when the prior Client Admin is no longer valid.
  - Approved automation may sync Clerk identity fields into `profiles` only when the sync path cannot elevate role, company, client access role, or admin status from client-controlled metadata.
- Allowed when:
  - Signup metadata is used as onboarding intent and is validated against the user's verified email before any workspace or company assignment is created.
  - No existing client company has claimed the verified business email domain, and the first claimant creates the company workspace as initial Client Admin through the approved server path.
  - A public email domain such as Gmail is reviewed by Admin with alternate proof of company identity and administrative identity before company creation or Client Admin assignment. Initial acceptable proof may include company legal name, company website or public listing, and at least one administrative proof such as signed authorization, ownership email from a company domain, payment/customer record, business registration match, or Admin-verified relationship.
  - A same-domain access request is approved by an existing Client Admin for that company or by Admin override.
  - A related-domain alias request is approved by Admin before users from that domain can be approved into the company.
  - A role, company, client access role, Bum assignment, admin-status change, domain-ownership change, approval, denial, or disablement is performed by Admin, an authorized Client Admin within the same company/domain boundary, or an approved internal server workflow with auditability.
  - Self-service updates are limited to non-authorization preferences: display name, timezone, date format, and notification preferences.
- Denied when:
  - A user tries to self-assign `role`, `is_admin`, `company_id`, `client_access_role`, or Bum identity through Clerk `unsafeMetadata`, browser profile sync, direct Supabase Data API, RPC, edge function, or extension API.
  - A user attempts to attach themselves to another client company or switch between Client and Bum posture without Admin approval.
  - A user with a public/free email domain or unmatched email domain attempts to automatically create or join a client company without Admin review and proof approval.
  - A user from an already claimed domain tries to bypass the existing Client Admin approval queue.
  - A Client Admin tries to manage users outside their company, claim an unrelated domain without validation, or grant themselves cross-company/domain authority.
  - A pending or denied user tries to view company data before approval.
  - Signup intent alone is treated as proof of workspace membership or finance/admin authority.
- Sensitive fields: `profiles.role`, `profiles.is_admin`, `profiles.company_id`, `profiles.client_access_role`, company email domain aliases, domain-claim ownership, related-domain validation status, pending/approved/denied access status, disabled status, Bum identity links, Clerk metadata used for onboarding, email, admin repair notes, and audit events.
- Source of truth: `profiles`, client company records and approved email-domain aliases, related-domain validation records, Clerk user ID and backend-managed metadata, admin user tools, Client Admin team-management approvals, signup intent records or metadata, and audit events.
- RLS/authorization owner: Security Engineer plus Product Ops, with QA allow/deny coverage before hardening release.
- QA proof:
  - First verified user from an unclaimed client domain can create the company workspace and becomes initial Client Admin.
  - Gmail/public-email user can request company creation but cannot automatically create the company or become Client Admin.
  - Admin can approve a Gmail/public-email company creation and Client Admin assignment after alternate proof is recorded.
  - A later same-domain user cannot self-join directly; they enter a Client Admin approval queue or Admin override queue.
  - Existing Client Admin can approve a same-domain user and assign Client Admin, Client Finance, or Client Member as allowed.
  - Existing Client Admin can disable another same-company user, including another Client Admin, through the approved company-scoped path.
  - Client Admin can request an additional related domain; it does not grant access until Admin approves it; unrelated-domain claims stay pending or are denied.
  - Admin can override domain/company assignment and make a new Client Admin when the previous Client Admin is invalid or unavailable.
  - Users from different domains cannot join or see another client company without Admin override.
  - Public/free email domains do not auto-create trusted client workspaces without Admin review and alternate proof.
  - Pending and denied users cannot see company data.
  - Client Admins see same-domain requests; Admins see public-email, unmatched-domain, related-domain, and stale-admin override requests.
  - A user can update approved preference fields without changing access.
  - Direct attempts to mutate `company_id`, `client_access_role`, `role`, `is_admin`, or Bum identity are denied.
  - Clerk `unsafeMetadata` role/company edits do not become authoritative access.
  - Admin can assign or repair role and company through the approved path and the change is audited.
  - Every approval, denial, role/company/domain change, disable/enable action, and override creates an audit event with actor, target, company, old value, new value, action reason or category, evidence type when applicable, and timestamp.
- Open questions:
  - Hone proof requirements for Gmail/public-email company creation and Client Admin assignment as real client cases come in.
  - Hone the blocked/manual-review domain list over time. Public/shared/disposable domains should not auto-create companies; agencies, consultants, partner/referral domains, and ambiguous school/franchise/subsidiary domains should start as manual-review unless explicitly approved.

### Access Requests And Bootstrap Exceptions
- Roles: Public Visitor, signed-in unassigned user, Client Admin, Admin, Bum applicant.
- Data needed: Requester profile, email and email domain, requested company, requested domain, requested role, request type, evidence summary, proof category, request status, reviewer, review note, audit event, and resulting profile/company/domain state.
- Allowed actions:
  - Signed-in users may create their own access request when profile bootstrap cannot safely approve them automatically.
  - Client Admins may review same-company `SAME_DOMAIN_ACCESS` requests for users from already-approved company domains.
  - Client Admins may request `RELATED_DOMAIN` additions, but only Admin may approve those domains.
  - Admins may review `PUBLIC_EMAIL_COMPANY`, `RELATED_DOMAIN`, `BUM_SIGNUP`, stale-owner, unmatched-domain, denied-user repair, and any other bootstrap exception that changes company/domain/role authority.
  - Admins may approve or deny requests through audited server-side paths that update the request and the affected profile, company, or domain records together.
- Allowed when:
  - `SAME_DOMAIN_ACCESS` is pending, the requester belongs to the same approved company domain, and the reviewing Client Admin belongs to that company.
  - `PUBLIC_EMAIL_COMPANY` is pending and Admin has recorded alternate company-identity and administrative-identity proof before creating the company and assigning the requester.
  - `RELATED_DOMAIN` is pending and Admin has verified the requested domain belongs to, aliases, or is contractually controlled by the client company.
  - `BUM_SIGNUP` is pending and Admin approves the user as a Bum or approves a documented automated Bum onboarding path.
  - `AUTO_DOMAIN_CLAIM` is generated as part of a validated first-domain claim and remains auditable.
  - Approval or denial writes an audit event with actor, request type, target profile, company/domain context, resulting state, and reason or evidence category.
- Denied when:
  - Pending, denied, disabled, or unassigned users try to view company data before an approved request changes their profile state.
  - A Client Admin tries to approve public-email company creation, related-domain claims, Bum signup, cross-company requests, or requests outside their company.
  - A user attempts to approve their own role, company, client access role, admin status, Bum identity, or related-domain authority.
  - A request lacks required proof for public-email company creation, related-domain approval, or stale-admin repair.
- Sensitive fields: Email, requested company/domain, request evidence, proof documents or notes, review notes, requester profile state, requested role, denied reasons, audit events, and any alternate identity proof.
- Source of truth: `client_company_access_requests`, `profiles.access_status`, `profiles.role`, `profiles.company_id`, `profiles.client_access_role`, `company_domains`, `client-team`, `profile-bootstrap`, `admin-access-requests`, and `audit_events`.
- RLS/authorization owner: Security Engineer plus Product Ops, with QA allow/deny coverage before hardening release.
- QA proof:
  - Same-domain pending request is visible and reviewable by an authorized Client Admin for that company.
  - Public-email company request is visible only to Admin and approval requires recorded proof or review note.
  - Related-domain request is visible to Admin, does not grant access while pending, and grants access only after approval.
  - Bum signup request cannot view client data while pending and becomes Bum-scoped only after Admin approval.
  - Denied and disabled users cannot view company data through portal routes, direct Supabase reads, edge functions, or extension APIs.
  - Approval and denial create audit events with request type, actor, target profile, resulting state, and reason/category.
- Open questions:
  - Which proof categories are mandatory versus optional for public-email company approvals and related-domain approvals?
  - Should `BUM_SIGNUP` approval be manual-only at launch or delegated to an approved recruitment/onboarding workflow later?

### Customer Targets
- Roles: Admin, Client Admin, Client Member where assigned, Bum where explicitly entitled.
- Data needed: Target company/person details, status, linked opportunities, linked responses, linked conversations, relevant activity history.
- Allowed actions: Admins can manage; Client Admins can manage company targets; authorized Client Members can read/update assigned workflow fields; Bums can read only target data tied to explicit marketplace work.
- Allowed when:
  - Admin is operating the marketplace.
  - Client user belongs to the target's company and has a role that grants target access.
  - Bum has an explicit workflow relationship, such as an accepted claim, assigned opportunity, accepted target response, accepted intro request, or other documented assignment.
- Denied when:
  - Bum is merely signed in and has no explicit relationship to the target.
  - Bum has only saved or bookmarked a target and no accepted, assigned, or otherwise approved marketplace relationship unless Product Ops explicitly approves saved-target visibility.
  - Client user belongs to a different company.
  - Public or unauthenticated user requests target data.
- Sensitive fields: Contact identity, company relationship, opportunity context, notes, response history, financial or strategic target notes.
- Source of truth: `customer_targets`, linked opportunity/claim/request/response tables, company membership tables.
- RLS/authorization owner: Security Engineer plus Lead Developer.
- QA proof:
  - Client Admin can read own company target.
  - Client Finance cannot read non-finance target details unless granted by business rule.
  - Bum with explicit accepted relationship can read the allowed target subset.
  - Bum without relationship cannot read unrelated targets through direct Supabase access, portal APIs, extension APIs, or search.
  - Admin can read and update across companies.
- Open questions:
  - Which target fields are safe in marketplace-browsing surfaces before a Bum has an explicit relationship?
  - Should a saved target ever preserve Bum read access after the underlying explicit relationship ends?

### Customer Target Responses
- Roles: Admin, Client Admin, Client Member with target-management responsibility, submitting Bum.
- Data needed: Response status, linked target, submitting Bum, contact summary, relationship strength, notes, linked question thread or formalized opportunity.
- Allowed actions:
  - Bum can create and read their own responses.
  - Client Admin and target-managing Client Members can review, accept, decline, and formalize responses for their company.
  - Admin can review, troubleshoot, and rescue stale responses across companies.
- Allowed when:
  - Status is `PROPOSED`, `ACCEPTED`, or `DECLINED` and the user is the submitting Bum, an authorized target-managing client user for that company, or an Admin.
  - Once a response is formalized into an opportunity or conversation thread, linked participants keep read access to the workflow objects they are part of.
- Denied when:
  - Client Finance users try to browse target-response content by default.
  - Unrelated Bums or other client companies try to read the response.
- Sensitive fields: Contact identity, direct contact details, relationship notes, internal review notes, linked workflow IDs.
- Source of truth: `customer_target_responses`, `customer_targets`, linked `conversation_threads`, linked opportunity/claim records.
- RLS/authorization owner: Security Engineer plus Lead Developer.
- QA proof:
  - Submitting Bum can read their own response history.
  - Client Admin and allowed Client Member can review and formalize company responses.
  - Client Finance is denied by default.
  - Unrelated Bums and other client companies are denied.
- Open questions:
  - Should `DECLINED` responses remain visible to all target-managing client users indefinitely, or age into admin-only history?

### Opportunities, Claims, And Intro Requests
- Roles: Admin, Client Admin, Client Member where assigned, Client Finance by finance-safe exception only, Bum.
- Data needed: Opportunity origin, Opportunity stage, source object, client, target/customer, assigned/requesting Bum, claim/request status, split details, meeting/conversation context, Customer Payment Report and commission-invoice links where finance-safe.
- Allowed actions: Clients create/manage company Opportunities; Bums request visible Opportunities, submit relationship responses, submit Customer Leads, and request Claims where eligible; Admins create, manage, convert, rescue, and dispute Opportunity work.
- Allowed when:
  - The source object maps to one of the approved Opportunity origins: `Client-Originated`, `Bum-Originated`, `Customer-Originated`, `Admin-Originated`, or `Imported`.
  - The source object maps to one approved stage label, such as `Intake`, `Qualifying`, `Intro Requested`, `Intro In Progress`, `Meeting Set`, `Open Opportunity`, `Needs Clarification`, `Accepted Claim`, `Revenue Confirmed`, or `Closed Lost`.
  - Bum can see Opportunities open to the marketplace or specifically assigned/invited to them.
  - Multiple Bums can request before client acceptance.
  - After an accepted or approved handoff, the opportunity should no longer be visible as claimable to unrelated Bums.
  - Splits are visible only to parties involved plus Admins.
  - Client Finance can see only finance-safe Opportunity context needed for Customer Payment Reports, commission invoices, approved finance exceptions, and finance exports.
- Denied when:
  - Bum is unrelated after a claim/request is accepted and has no split relationship.
  - Client user belongs to a different company.
  - Client Finance tries to browse operational Opportunity details, target contacts, Bum relationship notes, Teams join URLs, transcript details, or non-finance workflow context by default.
- Sensitive fields: Customer identity, client relationship, payout/split details, acceptance status, relationship notes, target contacts, meeting details, transcript context, raw capture context, and dispute notes.
- Source of truth: Opportunity registrations, customer targets, customer target responses, reverse/customer lead records, client-to-Bum intro request tables, claims, split/commission tables, payment reports, invoices, payouts, company membership, and approved read-model projections.
- QA proof:
  - Client-Originated, Bum-Originated, Customer-Originated, Admin-Originated, and Imported Opportunity paths each show origin and stage in the relevant workspace before any route consolidation ships.
  - Two Bums can request before Client acceptance.
  - Accepted or approved handoff locks the opportunity from unrelated Bum claim flows.
  - Split participants can see their relevant split context.
  - Unrelated Bums cannot read accepted opportunity private details.
  - Client Finance can read finance-safe Opportunity context but cannot read operational target/contact/meeting/transcript details by default.
- Open questions:
  - Which existing source tables should become permanent source objects versus migrate into one canonical Opportunity table?
  - Which origin value should backfill historical opportunity registrations created by Admin on behalf of a Client?
  - Should `Claim` remain the public noun everywhere, or become a legal/finance term behind a different user-facing action label?

### Client-To-Bum Intro Requests
- Roles: Admin, Client Admin, Client Member, assigned Bum.
- Data needed: Requesting client, requested Bum, target company/contact summary, intro context, notes, status, timestamps.
- Allowed actions:
  - Client Admin and Client Member can create requests from visible Bum directory entries.
  - Admin can read and update all request statuses.
  - Assigned Bum can read requests addressed to them and use them as a work queue once Bum-side tooling exists.
- Allowed when:
  - `SUBMITTED` is visible to the requesting client company, the requested Bum, and Admin.
  - `IN_REVIEW` and `INTRO_REQUESTED` stay visible to the same parties while the handoff is active.
  - `CLOSED` remains visible as history to the requesting client company, requested Bum, and Admin.
- Denied when:
  - Client Finance users try to read or manage intro requests by default.
  - Other Bums or other client companies try to read the request.
- Sensitive fields: Prospect identity, requested introduction context, private notes, target contact details.
- Source of truth: `client_bum_intro_requests`, company membership, visible Bum directory eligibility.
- RLS/authorization owner: Security Engineer plus Lead Developer.
- QA proof:
  - Client Admin and Client Member can create and read their company request history.
  - Requested Bum can read assigned requests only.
  - Client Finance and unrelated Bums are denied.
  - Admin can update statuses across all requests.
- Open questions:
  - When Bum-side tooling launches, can the Bum move `INTRO_REQUESTED` to `CLOSED`, or should closure remain an Admin action?

### Customer Leads
- Roles: Bum, Admin, potential future Client after match.
- Data needed: Lead details submitted by Bum before a matching supported client exists.
- Allowed actions: Bum creates and manages own leads; Admin reviews and matches; Client sees only after an approved match/handshake.
- Allowed when:
  - Bum owns the submitted customer lead.
  - Admin is matching or troubleshooting.
  - Client has been explicitly matched to the lead.
- Denied when:
  - Other Bums attempt to browse or claim the lead without assignment.
  - Unmatched clients attempt to read lead details.
- Sensitive fields: Customer identity, need/problem statement, notes, proposed client match.
- Source of truth: Current customer-lead tables and any future match table.
- QA proof:
  - Bum can create and read own customer lead.
  - Other Bum cannot read it.
  - Admin can see matching queue.
  - Matched Client sees only after match approval.
- Open questions:
  - What status marks a lead as safe to share with a potential Client?

### Extension Page Captures And Bum Represented Contacts
- Roles: Bum, Admin, Client Admin, Client Member where explicitly participating, Client Finance by exception only.
- Data needed: Captured source URL, capture type, page title, selected text, notes, destination opportunity or target, derived represented contact details, source workflow, status, timestamps, and audit trail.
- Allowed actions:
  - Bums may create captures and represented contacts only for destinations they are allowed to access.
  - Bums may read and update their own represented contacts.
  - Admins may troubleshoot captures and represented contacts across the marketplace.
  - Client users may see only sanitized, workflow-approved outputs that have been converted into a company-visible target, opportunity, intro request, or conversation.
- Allowed when:
  - The capture is tied to an accepted or explicitly assigned opportunity or target relationship for the Bum.
  - The represented contact is owned by the Bum or is being reviewed by Admin for support or compliance.
  - A client-facing view shows derived workflow context that Product Ops has approved for that client company, not raw private capture notes by default.
  - Raw `extension_page_captures` remain Bum/Admin scoped unless a separate converted projection or workflow object explicitly allows selected fields for the client company.
- Denied when:
  - A Bum tries to capture against or read a target/opportunity they are not entitled to access.
  - A different Bum tries to read or mutate another Bum's represented contact.
  - Client Finance, unrelated client users, or other companies try to read raw capture text, raw notes, source URLs, or unrelated represented contacts.
  - Public or unauthenticated users try to read or write captures or represented contacts.
- Sensitive fields: Selected text, source URL, personal contact details, LinkedIn URLs, notes, relationship strength, extension metadata, destination IDs, and audit events.
- Source of truth: `extension_page_captures`, `bum_contacts`, `extension-api-v1`, `portal-contacts`, linked opportunities, linked customer targets, and linked handoff workflows.
- RLS/authorization owner: Security Engineer plus Product Ops, with extension API and portal QA coverage.
- QA proof:
  - Owning Bum can create a capture and manage the resulting represented contact for an allowed destination.
  - Another Bum and unrelated client roles cannot read or mutate that contact.
  - Client company visibility is limited to approved converted workflow outputs.
  - Admin can troubleshoot with audit trail.
  - Extension `/context` and `/page-captures` prove one allowed and one denied case.
- Open questions:
  - Which converted capture fields, if any, are safe for Client Admin or Client Member views? Until decided, client-facing output should be limited to the linked workflow context already approved elsewhere, not raw capture rows.
  - What retention period applies to raw selected text and source URLs?

### Payments, Invoices, Payouts, And Reports
- Roles: Admin, Client Admin, Client Finance, Bum.
- Data needed: Payment reports, invoices, payout status, commission/split allocations, export history, report filters.
- Allowed actions: Admins operate all finance records; Client Admin/Finance reads company finance records and exports; Bums read only their own earnings/payouts and relevant split allocations.
- Allowed when:
  - Client user belongs to the paying company and has finance/admin role.
  - Bum is the payout recipient or split participant.
  - Admin is reconciling or troubleshooting.
- Denied when:
  - Bum tries to read client-wide payment reports.
  - Client Finance tries to read another company or another Bum's unrelated earnings.
  - Client Member lacks finance permission.
  - Client Finance tries to export target contact emails, meeting attendee lists, Teams join URLs, transcripts, or other operational workflow details unless explicitly granted by a finance-case participation rule.
- Sensitive fields: Amounts, invoice numbers, customer payment dates, payout amounts, disputes, reconciliation notes.
- Source of truth: Payment reports, claim invoices, Bum payouts, commission plan tables, company membership.
- QA proof:
  - Client Finance can export own company finance report.
  - Client Member without finance role cannot.
  - Bum can read own earnings but not client payment report details.
  - Admin can manage exceptions.
- Open questions:
  - Should Client Admin and Client Finance have identical finance export access?
  - Which claim-linked invoice fields are required in Bum earnings views beyond amount, status, and invoice identifier?

### Performance Telemetry And Admin Observability
- Roles: Admin, internal telemetry writer, non-admin portal users.
- Data needed: Route-level Web Vitals samples, deployment origin, connection type, metric timestamps, aggregated troubleshooting summaries, and any admin-only operational dashboards derived from those rows.
- Allowed actions: Public/frontend runtimes may write only the intended telemetry payload through the approved beacon path; Admins may read raw telemetry and admin observability summaries for troubleshooting; non-admin portal roles must not read raw telemetry or admin-only observability summaries.
- Allowed when:
  - The write originates from an approved frontend origin and matches the expected beacon schema.
  - Admin is troubleshooting performance, release regressions, or environment health.
  - Any future shared reporting uses approved aggregate-only summaries that exclude raw route, origin, or user-agent-derived detail.
- Denied when:
  - Client Admin, Client Finance, Client Member, or Bum users try to read `performance_metric_events` or `/admin/performance`.
  - Unexpected origins attempt to post telemetry.
  - Public callers try to invoke admin-only observability summaries through browser RPC, exposed SQL helpers, or unauthenticated edge functions.
- Sensitive fields: Deployment origin, route path, connection type, user-agent-derived metadata, operational timing data, and any admin-only summary counts that reveal internal system state.
- Source of truth: `performance_metric_events`, `performance-beacon`, `/admin/performance`, `admin_dashboard_summary`, and any future admin observability helpers.
- RLS/authorization owner: Security Engineer plus Data/Analytics, with QA allow/deny coverage.
- QA proof:
  - Expected frontend origins can store telemetry and unexpected origins receive a deny response.
  - Admin can load `/admin/performance` and any supporting summary APIs with seeded rows present.
  - Non-admin roles are denied on the route and direct data paths.
  - Any admin summary helper remains inaccessible to non-admin browser sessions.
- Open questions:
  - Which non-production origins should remain authorized for QA and preview telemetry?
  - How long should raw telemetry be retained before rollup or deletion?

### Trainings And Legal Documents
- Roles: Admin, Client Admin, Client Member, Bum.
- Data needed: Training materials, completion records, legal versions, acceptances, attachments.
- Allowed actions: Admins manage; Clients manage company-scoped trainings if permitted; Bums read assigned/corporate trainings and their own completions.
- Allowed when:
  - User is assigned to the training audience or company scope.
  - User needs legal document access for acceptance or audit.
- Denied when:
  - User tries to access another company's private training or acceptance records.
- Sensitive fields: Completion status, legal acceptance history, private attachments.
- Source of truth: Training material tables, attachment storage policies, terms versions and acceptances.
- QA proof:
  - Bum can access assigned/corporate training.
  - Client can access company training.
  - Cross-company attachment reads fail.
- Open questions:
  - Which trainings are global to all Bums versus company-scoped?

### Conversations, Meetings, Support, And Feedback
- Roles: Admin, Client participants, Bum participants.
- Data needed: Conversation threads, participants, messages, Teams meetings, transcripts, support/contact/feedback records.
- Allowed actions: Participants read relevant conversations; Admins operate/troubleshoot; support records visible to Admins and submitter where appropriate.
- Allowed when:
  - User is a participant, creator, assigned owner, company-authorized participant, or Admin.
  - Transcript is attached to a meeting involving the user or their company/workflow.
- Denied when:
  - Unrelated users attempt to read conversations, transcripts, support submissions, or feedback.
- Sensitive fields: Message content, transcript content, support details, private notes.
- Source of truth: Conversation participants, meetings, transcripts, support/contact/feedback tables.
- QA proof:
  - Participant can read conversation.
  - Non-participant cannot.
  - Admin can troubleshoot.
  - Transcript visibility matches meeting/workflow membership.
- Open questions:
  - If a finance dispute requires context, should Client Finance get explicit case-by-case participation or a dedicated finance-note surface instead of broad conversation/transcript access?

## Required QA Audit Output

Each QA run should maintain a section in `docs/qa-test-backlog.md` called `Business Access Coverage` that lists:

- Access objects reviewed.
- Role data needed for each object.
- Missing allow/deny test scenarios.
- Seed data or credentials needed.
- RLS-sensitive workflows that should not be changed until tested.

## Required Security Audit Output

Each Security run should maintain a section in `docs/security-review-backlog.md` called `Business Rule Alignment` that lists:

- RLS policies or edge functions that conflict with this document.
- Public RPC or service-role paths that bypass these rules.
- Direct Supabase access checks needed for each risky object.
- Any proposed RLS change that lacks product-rule signoff.

## Required Lead Developer Gate

The Lead Developer should not recommend implementing an RLS hardening change unless the recommendation includes:

- Business rule reference from this document.
- Before/after role matrix.
- Direct data-path test plan.
- Portal/API/extension test plan where relevant.
- Rollback plan for broken legitimate access.
