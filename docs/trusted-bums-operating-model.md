# Trusted Bums Operating Model

_Drafted: 2026-06-01 by Codex._

## Purpose Of This Document

This document describes how Trusted Bums operates as a business: the concept, strategy, operating process, role model, product workflows, trust posture, monetization logic, support model, and the unresolved decisions that should be clarified as the company matures.

It is written as a business operating model, not a code reference. The current product and repository reveal a lot about the intended company: a high-trust B2B marketplace that turns credible human relationships into structured business-development workflows, then tracks the resulting value through legal terms, opportunity records, meetings, reports, commissions, invoices, payouts, and audit trails.

## Source Basis

This draft is based on the current Trusted Bums workspace, especially the public-site positioning, portal routes, Client Agreement, Bum Agreement, company-wide rules, business access rules, product-ops backlog, trust/reputation backlog, shared-mailbox operations, Chrome extension docs, application routes, and Supabase migration history.

Where the repository establishes a rule or workflow, this document describes it directly. Where the repository implies a business direction but does not capture Ryan's final intent, the document names the open question instead of pretending the decision has already been made.

## Executive Summary

Trusted Bums exists because important buyers increasingly ignore strangers. Cold outreach is noisy, generic, and easy to delete. Trusted Bums replaces stranger-led outreach with relationship-led access: a credible person, the "Bum," helps open a warm path into a strategic account or buyer.

The business is not primarily an appointment-setting service, a lead list, a CRM, or a referral spreadsheet. It is a managed marketplace for trust-based commercial access. Clients bring hard accounts they want to reach. Bums bring credibility, relationship context, and warm access. Trusted Bums provides the operating system that makes the exchange structured, trackable, legally anchored, and economically aligned.

The strategy is to focus on high-value accounts where one credible introduction can matter more than large volumes of low-quality outreach. The company monetizes when access, relationship support, or opportunity facilitation leads to real client revenue. That makes the core commercial promise outcome-aligned: if the introduction or support creates durable revenue, Trusted Bums participates in the upside.

The sharpest early customer is a funded startup that has a real product but has not yet built enough sales scale to move reliably from Seed to Series A or beyond. Trusted Bums can also serve larger companies, but the strongest wedge is the company that may not survive or graduate to the next stage without access to its first major customers.

## The Core Concept

Trusted Bums is built around one simple claim: trust is still the highest-performing route into guarded buyers.

The public positioning says:

- Buyers are ignoring strangers.
- Cold outreach gets buried.
- A credible friend can start a conversation in a way no automated sequence can.
- Revenue should stay aligned with the value created by the relationship.

The name is deliberately playful, but the operating model is serious. Trusted Bums is memorable by design. Some people laugh at it, some make fun of it, some hate it, and some love it, but they remember it. The acronym "BUMS" means "Bring Us More Sales." It gives the brand a plain-language explanation without sanding off the oddness that makes it stick.

A Bum is not a joke character inside the business model. A Bum is a trusted person who can create access, context, introductions, or meeting opportunities between a client and a target account.

The company's job is to transform informal relationship capital into a repeatable commercial workflow without destroying the thing that makes it valuable: trust.

The brand posture is "trusted playfulness": fun enough to be remembered, serious enough to be trusted with revenue, relationships, and confidential account strategy.

## What Trusted Bums Is

Trusted Bums is a high-trust B2B relationship marketplace.

It helps client companies:

- Identify strategic accounts and buyers they struggle to reach.
- Define opportunity or commission terms.
- Train and enable Bums on relevant products, customers, and account strategy.
- Request introductions from visible Bums.
- Register opportunities.
- Track targets, meetings, transcripts, reports, payments, and commission obligations.

It helps Bums:

- Represent their relationship network and credibility.
- Find relevant clients, targets, and opportunities.
- Propose or claim introductions where they have legitimate access.
- Track accepted work, conversations, trainings, claims, earnings, and payout status.
- Capture relevant contact context from sources like LinkedIn through a user-confirmed browser extension workflow.

It helps Trusted Bums operators:

- Maintain marketplace trust and access boundaries.
- Review companies, users, Bums, opportunities, terms, handoffs, payments, payouts, emails, training assets, reports, legal documents, and troubleshooting data.
- Rescue stalled workflows.
- Enforce legal terms and commission plans.
- Preserve auditability across sensitive actions.

## What Trusted Bums Is Not

Trusted Bums should not behave like a generic sales outsourcing shop.

It is not:

- A cold email agency.
- A generic lead database.
- A spray-and-pray appointment-setting service.
- A pure affiliate program with no operational oversight.
- A public referral board where anyone can browse sensitive targets.
- A platform where users can self-assign company access, authorization, or payout rights.

This matters because the brand depends on credibility. If the product begins to feel spammy, uncontrolled, or low-trust, it undermines the exact advantage it is supposed to sell.

## Strategic Thesis

The strategic thesis is that enterprise selling increasingly has an access problem, not merely a messaging problem.

Many client companies already know which accounts matter. Their problem is that the usual routes into those accounts are blocked: inboxes are crowded, procurement is guarded, decision makers are skeptical, and unknown vendors look risky. Trusted Bums tries to solve that by finding a trusted route into the buyer's world.

The business strategy has several parts:

- Focus on hard accounts, not easy volume.
- Prioritize warm routes into guarded buyers.
- Convert informal trust into documented workflows.
- Align economics to client revenue instead of charging only for activity.
- Protect trust with legal, access, security, and reputation controls.
- Build a marketplace where Bums and clients each have clear incentives and boundaries.

In practical terms, Trusted Bums wants to become the system of record for trust-led business development.

The long-term vision is a scalable marketplace of trust. The company can become a default motion for startups: something VCs, private equity firms, and startup operators sign new companies up for when they need early customer access, market proof, and credibility with buyers they could not reach alone.

## Business Flywheel

The operating flywheel looks like this:

1. A client identifies valuable accounts or buyers they cannot easily reach.
2. Trusted Bums gathers client context, product training, terms, and target strategy.
3. Bums surface relationship access, customer leads, or credible intro paths.
4. The platform matches relationship access to client goals.
5. A warm introduction, meeting, or relationship-support workflow begins.
6. Trusted Bums tracks opportunity status, meeting context, transcripts, handoffs, and claims.
7. If client revenue results, reporting, invoices, commissions, and payouts flow through the finance workflow.
8. Successful outcomes strengthen the marketplace, improve client confidence, and create more reasons for Bums to contribute high-quality access.

The flywheel only works if trust quality stays high. Low-quality introductions, inflated relationship claims, weak authorization, spammy outreach, poor email reputation, or unclear payouts would all damage the model.

## Canonical Opportunity Model

Trusted Bums should treat Opportunity as the parent product concept for any possible commercial match or revenue path. The current product still stores several source-specific objects, but the user-facing model should converge on one Opportunity workspace per role, filtered by access rules.

### Definition

An Opportunity is a potential commercial path involving a Client, a Customer or target account, and one or more possible trust-led routes to access, introduction, support, revenue, or commissionable value.

Existing route-specific objects map into this model:

- Client target accounts are Client-Originated Opportunities before or during qualification.
- Formal opportunity registrations are Client-Originated or Admin-Originated Opportunities with commission terms ready for Bum matching.
- Customer Leads are Customer-Originated Opportunities submitted by a Bum when buyer demand exists before the final Client path is resolved.
- Bum target responses are Bum-Originated Opportunity contributions attached to a Client target.
- Bum Intro Requests are Client-Originated intro actions attached to an Opportunity.
- Claims are Bum-Originated actions attached to an Opportunity that assert potential revenue rights after Client acceptance and trusted-introduction requirements.

### Origin Values

Use these origin values as the first product vocabulary pass:

- `Client-Originated`: the Client names a target account, registers an Opportunity, or asks a Bum for an introduction.
- `Bum-Originated`: a Bum contributes relationship evidence, proposes a path into a Client target, or requests a Claim on an Opportunity.
- `Customer-Originated`: a Customer need starts the work before the correct Client or Client path is fully resolved.
- `Admin-Originated`: Trusted Bums operators create or rescue an Opportunity on behalf of the marketplace.
- `Imported`: a batch, CRM import, or migration creates the Opportunity.

These values should be visible as filters or badges before they become database columns. Do not rename existing database enums until Product Ops, Data, Security, Legal, and QA approve a migration plan.

### Stage Values

Use these stage values as the cross-workflow lifecycle labels:

- `Intake`: raw or newly submitted work that needs triage.
- `Qualifying`: Trusted Bums, the Client, or the Bum is validating fit, proof, or next action.
- `Intro Requested`: a Client, Bum, or workflow has requested an introduction or relationship action.
- `Intro In Progress`: outreach, handoff, or relationship work has started.
- `Meeting Set`: an intro or follow-up meeting has been scheduled.
- `Open Opportunity`: the Opportunity is accepted or active enough to support Claims, meetings, commission planning, or pipeline tracking.
- `Needs Clarification`: the Opportunity or Claim needs more information, exception review, or dispute resolution.
- `Accepted Claim`: the Client has accepted a Bum Claim or equivalent participation right.
- `Revenue Confirmed`: Customer revenue has been reported or the workflow has reached the finance-confirmed stage.
- `Closed Lost`: the Opportunity, Claim, or lead is no longer active.

Avoid using `Successful Introduction` as a stage until the business decides whether success means a meeting occurred, revenue was confirmed, or commission became payable. `Completed Introduction` can describe a meeting/introduction event; `Revenue Confirmed` should describe the finance event.

### Claim And Intro Request Rules

Claims and Intro Requests should stay distinct:

- A `Bum Intro Request` is a Client request for a warm introduction from a specific Bum.
- A `Claim` is the Bum's assertion of participation rights or potential economics on an Opportunity, subject to Client acceptance, Trusted Bums review, meeting/introduction evidence, dispute handling, and finance rules.
- Every claimable Opportunity should expose one clear Claim action for eligible Bums.
- Multiple Bums may request or propose before the Client accepts a Claim or handoff.
- Once an accepted Claim or approved handoff exists, unrelated Bums should no longer see that Opportunity as claimable unless Admin explicitly reopens or splits it.
- Accepted Claims should link forward to meetings, transcripts, Customer Payment Reports, commission invoices, and Bum payout records as those records become relevant.

### Role Workspace Direction

Each role should eventually see one Opportunity workspace:

- Client Admin and eligible Client Member: target accounts, Customer Leads, Bum responses, Bum Intro Requests, registered Opportunities, Claims, meetings, and reports filtered to their company.
- Client Finance: finance-safe Opportunity context only when needed for Customer Payment Reports, commission invoices, exports, and approved finance exceptions.
- Bum: marketplace Opportunities, Client target accounts they are allowed to see, Customer Leads they submitted, Claims, intro work, meetings, and earnings context.
- Admin: all Opportunity origins, stages, Claims, intro requests, targets, Customer Leads, handoffs, meetings, transcripts, payment reports, invoices, payouts, disputes, and rescue queues.

The first implementation phase should keep current routes as filtered views while adding shared origin and stage labels. Route consolidation should happen only after migration and access tests prove the canonical model.

### Migration And Compatibility Plan

Do not destructively merge tables in the first pass. The safe migration sequence is:

1. Keep existing tables and routes as source-specific projections.
2. Add shared origin/stage labels in UI and tests.
3. Add Product Ops and business-access rules for canonical Opportunity visibility.
4. Add read-model or view-level aggregation if the UI needs one route to show multiple source tables.
5. Backfill durable `opportunity_origin` and `opportunity_stage` fields only after Data approves mappings for existing records.
6. Move routes into filters or tabs inside unified workspaces.
7. Retire old route labels only after redirects, tests, reports, support docs, and analytics have been updated.

Every migration step needs before/after role visibility tests for Client-Originated, Bum-Originated, Customer-Originated, Admin-Originated, and Imported paths.

## Marketplace Participants

### Public Visitors

Public visitors are potential clients, Bums, partners, or general contacts. They can read public pages, review legal and privacy content, sign in or sign up, and submit contact or interest forms.

The public site frames the business around access, trust, and aligned revenue. It offers two primary paths:

- Clients request an introduction strategy.
- Prospective Bums express interest in becoming a Bum.

Public intake must be abuse-resistant because the domain and mailbox reputation are business assets.

### Clients

Clients are companies that want help reaching strategic accounts or buyers. The best early clients are funded companies with a product and real ambition but not enough go-to-market scale. Seed-to-Series-A companies are especially aligned because a few major customer wins can change the trajectory of the company.

Trusted Bums may still work with larger established companies, especially when they need access to hard accounts. But companies with large mature sales teams may need Trusted Bums less unless they face a specific access problem that their internal team cannot solve.

Clients may participate through several company-scoped roles:

- Client Admin: manages the company relationship, team access, targets, opportunities, Bum intro requests, trainings, reports, payments, and company settings.
- Client Finance: reviews finance-safe payment, invoice, and report data.
- Client Member: participates in assigned operational workflows such as targets, trainings, intro requests, or reports.

Client companies must accept the active Client Agreement before using portal features. The agreement establishes that Trusted Bums creates value through introductions, account access, relationship support, and business-development activity, and that client revenue from introduced or materially supported opportunities may trigger commission obligations.

### Bums

Bums are approved relationship holders. They create value by providing warm access, context, introductions, relationship credibility, customer leads, or meeting opportunities.

The ideal Bum is a former senior-level leader or otherwise credible operator. They do not need to be salespeople. They may be executives, technical executives, advisors, operators, or other people who earned trust by standing with someone during hard times. A Bum may have only one person in power who deeply trusts them, but that one trusted relationship can be commercially meaningful.

Bums are expected to:

- Act in good faith.
- Avoid misleading claims about access or influence.
- Protect confidential information.
- Avoid spam, harassment, deceptive outreach, or behavior that harms clients or Trusted Bums.
- Comply with employer, contractual, confidentiality, and legal obligations.
- Accept that earnings depend on approved participation, client revenue, platform approval, dispute review, and payout requirements.

The Bum portal gives them a working surface for prospects, reverse opportunities, client browsing, contacts, opportunity detail, claims, trainings, conversations, earnings, reports, and profile management.

Bums may also become part of the marketplace's growth engine. Trusted Bums is considering a "Managing Bum" model where some Bums receive economics from Bums they bring into their network, helping the Bum supply side scale through trusted relationship trees rather than generic recruiting.

### Admins

Admins operate the marketplace. They have broad access because they are responsible for onboarding, legal terms, clients, Bums, opportunities, handoffs, payments, payouts, emails, training assets, reports, performance metrics, troubleshooting, and legal operations.

Admin power should be broad but auditable. The business rules repeatedly emphasize that authorization changes, company access changes, domain approvals, overrides, disablements, and similar elevated actions should create audit events.

## Client Operating Process

### 1. Client Interest And Intake

A prospective client arrives through the public site, signup flow, email, or direct relationship. They may declare that they need introductions for their company and provide target accounts or buyers.

The intake process should establish:

- Who the company is.
- Whether the email domain proves company control.
- Whether the user should become a Client Admin, Client Finance user, or Client Member.
- Whether the company already exists in the marketplace.
- Whether manual review is needed.
- What accounts or buyers the client wants to reach.
- Whether the client understands the commission-aligned model.

For verified business domains, the first user from an unclaimed client domain may create the client company and become the initial Client Admin through the approved server path. For public email domains like Gmail, company creation and Client Admin assignment require manual Admin verification.

### 2. Legal Acceptance

Client users must accept the active Client Agreement before accessing core client portal features.

The Client Agreement is central to the business model. It defines:

- Services: introductions, account strategy, relationship facilitation, opportunity support, meeting coordination, and business development.
- Opportunity registration: an opportunity may be registered when Trusted Bums introduces, identifies, facilitates, supports, or materially advances a client-target relationship.
- Introduced Accounts: includes companies, units, departments, affiliates, subsidiaries, channel opportunities, renewals, expansions, replacements, amendments, successor arrangements, and related opportunities that arise from the original support.
- Commissionable Revenue: amounts actually received by the client, excluding taxes, refunds, credits, chargebacks, and uncollected amounts.
- Commission Rate and Period: opportunity-specific or project-specific plans control the actual economics.
- Payment and Reporting: clients provide reasonable reporting, and commissions are generally payable within 14 days after the client receives customer payment unless different terms apply.
- Non-circumvention: clients cannot bypass, restructure, delay, reroute, or rename deals to avoid Trusted Bums' rights.
- Recording and Transcription: meetings may be recorded or transcribed where enabled and may be used for tracking, claims, disputes, training, service improvement, and compliance records.

The legal flow is not just compliance. It is the foundation that lets Trusted Bums convert relationship support into a durable revenue right.

### 3. Company Setup And Team Access

Client Admins manage company-scoped access. The current operating model treats signup metadata as intent, not authorization.

The business rules are:

- Users may not self-assign role, admin status, company, client access role, or Bum identity.
- Same-domain users for an already claimed company should request access and wait for Client Admin approval.
- Client Admins may approve same-company users and assign allowed company roles.
- Public email users require manual Admin verification before company creation or Client Admin assignment.
- Related company domains require Admin review before they grant access.
- Admins need override paths when prior Client Admin ownership is stale, invalid, or unavailable.

This is important because company membership determines access to sensitive targets, opportunities, payments, reports, and relationship data.

### 4. Target Definition

Clients name the doors that matter: target accounts, buyers, business units, and strategic opportunities.

Target data can include company identity, contact context, status, linked opportunities, linked responses, linked conversations, and activity history. This data is sensitive because it reveals client sales strategy and market intent.

Client Admins and authorized Client Members can manage company targets. Bums should only see target data when they have an explicit marketplace relationship, such as an accepted claim, assigned opportunity, accepted target response, accepted intro request, or another documented assignment.

The operating belief is that trust requires meaningful disclosure on both sides. Clients need to share who they are trying to reach and why. Bums need to share as much as possible about the customer or contact they are recommending. The platform should protect sensitive data, but it should not make the core matching process so opaque that trust cannot form.

### 5. Opportunity Registration

Opportunities can be registered when Trusted Bums introduces, identifies, facilitates, supports, or materially advances a client relationship with a target account.

Opportunity records can include:

- Client company.
- Creator.
- Target account.
- Business unit.
- Description.
- Client contact.
- Trusted Bums contact.
- Expected product or service.
- Estimated deal value.
- Expected timeline.
- Commission rate or plan.
- Commission duration.
- Notes.
- Status and status history.

Registration creates the operating and legal record for future claims, support, reporting, and commission discussions.

### 6. Training And Enablement

Clients can upload or manage training materials so Bums understand the client's product, positioning, target accounts, and relationship boundaries.

Training is a trust-control mechanism, not just content. Good training helps Bums make credible introductions, avoid overpromising, understand sensitive information, and represent the client accurately.

### 7. Bum Discovery And Intro Requests

Clients can browse visible Bum profiles and submit client-to-Bum intro requests. These requests include target company/contact context, intro context, notes, status, and timestamps.

The expected workflow is:

1. Client identifies a potentially relevant Bum.
2. Client submits an intro request with context.
3. The requested Bum and Admin can see the request.
4. The request moves through submitted, in-review, intro-requested, and closed-style states.
5. Closure authority is still an open business decision: the product rules ask whether Bums should be able to close intro-requested items or whether Admin closure should remain required.

The business trigger is the meeting. Once a meeting has occurred, Trusted Bums believes the trust has effectively been established. From that point, the contracted deal is in play and it becomes the client's responsibility to close the opportunity. The commission timeline itself starts when the client receives its first payment on the resulting deal.

### 8. Meetings, Conversations, And Transcripts

Trusted Bums supports meeting coordination, Microsoft Teams scheduling, attendee sync, transcript sync, manual transcript entry, and live conversation workflows.

Meeting and transcript records support:

- Introduction tracking.
- Opportunity support.
- Dispute review.
- Read-aheads.
- Training.
- Service improvement.
- Compliance records.

This is operationally valuable but sensitive. Transcript, attendee, and join-link access should be carefully separated from finance-only access unless a finance user is explicitly participating in a dispute or approved case.

Meetings also create proof. If a Bum's contact never accepts a meeting or the meeting never occurs, that Bum's claim can expire. If multiple Bums are involved and one claim expires, commission economics should be recalculated among the remaining accepted Bums according to the split rules.

### 9. Reporting And Finance

Clients report payment events and revenue connected to introduced or supported opportunities. Trusted Bums uses this to calculate commissions, invoices, and eventual Bum payouts.

The finance model has several records and workflows:

- Customer payment reports.
- Claim invoices.
- Commission plans.
- Commission overrides or opportunity-specific plans.
- Bum payouts.
- Admin payment review.
- Admin payout approval and paid transitions.
- Client payments and finance reports.

The business rule is that commissions are based on amounts actually received by the client from introduced or substantially related opportunities. Trusted Bums gets paid when the client gets paid, unless a custom agreement says otherwise.

## Bum Operating Process

### 1. Bum Interest And Approval

A prospective Bum expresses interest through signup or contact intake. Trusted Bums should approve Bums based on whether they can create legitimate relationship access and operate in a way that protects the brand.

Approval should consider:

- Relationship credibility.
- Market relevance.
- Good-faith conduct.
- Compliance constraints.
- Ability to protect confidential information.
- Professionalism and communication quality.

### 2. Agreement Acceptance

Bums must accept the Bum Agreement. It defines their role, accuracy expectations, confidentiality obligations, conduct rules, platform rules, earnings eligibility, compliance responsibilities, and recording/transcription consent.

The agreement makes clear that Bums are not guaranteed compensation merely for creating an account or reviewing opportunities. Earnings depend on approved participation, opportunity rules, successful downstream commercial events, platform approval, dispute review, fraud prevention, and payout requirements.

### 3. Profile And Relationship Surface

Bums maintain profile information that helps clients and Admins understand their relevance. Visible profile identity may be available to clients through the Bum directory, but sensitive underlying relationship information should remain controlled.

The Bum profile is part marketplace listing, part trust artifact. It should help answer:

- What kind of access does this Bum likely have?
- Which sectors, accounts, functions, or geographies are relevant?
- How credible is this person for the target?
- What training or client context have they completed?
- What work have they already accepted or completed?

### 4. Opportunity And Target Work

Bums can participate in several routes:

- View visible opportunities.
- Claim or request participation before a client accepts a handoff.
- Respond to customer targets with relationship context.
- Submit reverse opportunities or customer leads before a matching client exists.
- Bring clients opportunities that are not yet on the client's target list.
- Save relevant clients, targets, or opportunities.
- Join live conversations and meetings where they are involved.

The key access principle is explicit relationship. A Bum should not browse sensitive client target data merely because they are signed in. They should see what is open, assigned, accepted, or otherwise documented as relevant to their marketplace work.

Because the company is called Trusted Bums, the matching workflow should lean toward real disclosure rather than vague hints. A Bum recommending a customer should share enough about the customer, contact, and relationship for the client to make an informed decision. A client seeking help should share enough about who they want and why for the Bum to assess whether their trust can actually help.

### 5. Flexible Opportunity Origination

Trusted Bums should remain flexible because new marketplace patterns will emerge as Bums, customers, and clients interact. The product should not assume that every opportunity begins with an existing client target list.

Several origination models matter:

- Client-led target: a client names an account or buyer, then Bums make claims or submit relationship paths.
- Bum-led opportunity: a Bum brings a client an opportunity the client does not yet have on its target list.
- Customer-before-client: a Bum learns that a customer has a need before Trusted Bums has the right client. For example, a customer says, "I need a new supplier for coffee." The Bum brings that demand to the Bum network. Another Bum knows a potential client, such as a new coffee company, and invites that client to Trusted Bums to connect them with their first opportunity.
- Network-sourced client invite: a Bum uses a live customer need as the reason to recruit a new client into Trusted Bums.

These patterns are strategically important because they make Trusted Bums more than a claims workflow. The marketplace can discover demand, find supply, recruit clients, and create opportunities in multiple directions. Flexibility should be treated as a product requirement, not an edge case.

### 6. Captures And Represented Contacts

The Chrome extension gives Bums a user-confirmed capture workflow. The current version supports LinkedIn profile or company page capture after the user opens the page, reviews captured name/headline/selected text/destination/note, and clicks Send.

The extension does not crawl directories, auto-navigate results, or send background captures. That restraint matters for trust and compliance.

Captured information can become draft page captures or represented contacts. Product Ops still needs to define:

- Which raw capture fields can be retained.
- How long selected text and source URLs should live.
- Which derived fields may become client-visible.
- Who can archive or delete represented contact records.

### 7. Claims, Earnings, And Payouts

Bums are paid only when the underlying business conditions support payment. A Bum's participation may produce earnings when:

- The Bum's intro or relationship support is approved.
- The client receives commissionable revenue.
- The relevant opportunity or commission plan supports a payout.
- Disputes, fraud checks, tax requirements, and payout approval are satisfied.

The Bum portal includes earnings and reports because payout transparency is important. If Bums do not trust the payout process, they will not contribute high-quality access.

Trusted Bums' philosophy is that a Bum may be using up a rare and valuable chance to introduce someone who trusts them. That relationship cost deserves meaningful economics. The intended model is not token referral compensation; it is a substantive share of the long-term revenue Trusted Bums earns from the client relationship that the Bum helped create.

## Admin Operating Process

Admins are the marketplace operators. The Admin portal exists because a trust marketplace cannot be fully self-service at the start.

Admin responsibilities include:

- Reviewing and managing client companies.
- Reviewing and managing Bum accounts.
- Managing opportunities and status changes.
- Managing handoffs and rescue queues.
- Managing commission plans.
- Reviewing payments and invoices.
- Approving and tracking payouts.
- Reviewing live conversations.
- Managing operational emails and templates.
- Managing training assets.
- Reviewing reports and performance metrics.
- Handling troubleshooting.
- Managing legal terms and documents.
- Repairing access and profile issues.

Admins also own exceptions. The product backlog identifies several operational gaps that should mature into named queues:

- Handoff priority, owner, next action, and failed-notification views.
- Finance exception queues for uninvoiced payments, sent-not-paid invoices, paid-not-allocated invoices, payout-pending items, and disputed or voided exceptions.
- Transcript rescue queues for completed meetings missing transcripts or failed transcript sync.
- Support and public intake queues with ownership and aging.

## Legal And Commercial Model

Trusted Bums' commercial model is commission-aligned. The company creates access and relationship value, then participates when that value turns into revenue.

The preferred economics, especially for Series A-oriented companies, lean toward royalty-like upside rather than upfront cash. The reasoning is that these companies may not make it without the access Trusted Bums helps create. If Trusted Bums helps open a customer relationship that changes the client's trajectory, Trusted Bums should share in that success over time.

The Client Agreement establishes that commissionable events may arise from:

- Introductions.
- Account identification.
- Relationship facilitation.
- Opportunity support.
- Meeting coordination.
- Business-development activities.
- Material advancement of a client-target relationship.

The commercial model intentionally reaches beyond a single first meeting. Introduced Accounts include related opportunities, renewals, expansions, successor arrangements, affiliates, subsidiaries, related business units, and commercial arrangements substantially connected to the original introduction or support.

This is strategically important because the value of a warm introduction often compounds over time. A single trusted path into an enterprise account can lead to expansion, adjacent departments, renewal revenue, or successor contracts. Trusted Bums wants the economics to follow that value.

At the same time, the product supports custom terms, opportunity-specific commission plans, default client commission plans, and separate signed agreements. That flexibility is necessary because enterprise opportunities vary widely.

The current best-example Commission Plan is:

- 10% of revenue for the first 3 years.
- 5% of revenue for the next 2 years.
- 1% of revenue for as long as the client continues doing business with that customer.

Trusted Bums is also considering a default Bum share where the Bum receives 50% of what Trusted Bums receives. For example, if Trusted Bums receives 10% of revenue in the first tier, the Bum associated with the accepted claim would receive half of that Trusted Bums amount, subject to split rules, approval, collection, and any dispute or compliance checks.

When multiple Bums contribute to the same account, the client may accept one, two, or more claims. Accepted Bums should be notified that the account has a split. This can be valuable because one Bum may know the decision maker while another knows a powerful influencer. Multiple meetings may be appropriate. If one accepted Bum's meeting never occurs or the claim expires, the remaining accepted Bums share the available Bum economics according to the final split.

The client may cancel before accepting a claim. Once a client has accepted a claim, the client should not be able to suddenly avoid Trusted Bums by saying they already knew the person. The Bum declares who they know, and the client has the opportunity to inspect that person, such as by looking them up on LinkedIn or otherwise deciding whether the proposed relationship is worth pursuing.

One important open commercial question remains: reseller and channel revenue. If a Trusted Bums-introduced relationship produces a resale agreement or a client sells through another company to the ultimate customer, the business still needs a precise rule for whether and how Bum economics apply.

## Finance And Payout Strategy

The finance workflow should make three groups trust the economics:

- Clients need confidence that commission obligations are clear, fair, and tied to actual revenue.
- Bums need confidence that approved contribution will be tracked and paid when earned.
- Trusted Bums needs enough reporting and audit evidence to enforce commission rights and resolve disputes.

No customer money passes through Trusted Bums. The end customer pays the client directly. Trusted Bums does not intermediate the customer payment, hold customer funds, or act as the payment rail between customer and client.

Trusted Bums relies on the client to load earnings and payment information into the system. Whenever possible, Trusted Bums should also be added to the end customer's email distribution list or other customer-side notification path so the platform has earlier visibility into payment, procurement, renewal, launch, or relationship evidence.

The baseline flow is:

1. Client receives customer payment.
2. Client reports the payment or payment data is otherwise recorded.
3. Trusted Bums calculates the current commission percentage based on the approved plan, revenue entered, and date the revenue was collected.
4. The client can create an invoice from Trusted Bums if needed for tracking.
5. An invoice or commission claim is generated for the Trusted Bums share.
6. Client pays Trusted Bums directly according to the agreement.
7. Bum payout allocation is reviewed.
8. Bum payout is approved and marked paid when complete.

The product should mature toward exception-based finance operations. Instead of asking operators to scan every record manually, Admins should see queues for missing invoices, unpaid invoices, pending payouts, disputes, voids, late reports, or mismatched amounts.

Clients that delay reporting or fail to pay should owe penalties under the applicable agreement. Trusted Bums expects both human and AI-assisted monitoring to help detect non-reporting. Bums often know the relevant contacts and may learn when a deal has closed. AI monitoring can also look for public proof, such as co-marketing announcements, product launches, public case studies, press releases, website references, or other signs that the client is doing business with the introduced account.

## Trust, Reputation, And Brand Strategy

Trusted Bums sells trust, so it must operate with visible trustworthiness.

Trust applies to:

- Buyer-facing public website.
- Legal documents.
- Privacy policy.
- Email authentication.
- Domain reputation.
- Contact-form abuse prevention.
- Browser extension permissions.
- Client and Bum onboarding.
- Meeting recording and transcription consent.
- Data retention.
- Access control.
- Audit trails.
- Support and complaint handling.

The company-wide rules explicitly say the business should be treated as a high-trust B2B marketplace. Product, website, email, copy, and security decisions should increase buyer confidence and avoid patterns that make Trusted Bums look spammy, scam-like, blocked, spoofable, or low-trust.

This trust posture shapes operational priorities:

- Public intake must have anti-abuse controls.
- Direct mail-sending endpoints should not be publicly abusable.
- DMARC, SPF, DKIM, and mailbox operations matter.
- Public host redirects, metadata, and security headers matter.
- The Chrome extension should minimize scary permissions and avoid background crawling.
- Raw email bodies and attachments should not be stored unless a workflow requires them.
- Sensitive legal, complaint, privacy, and abuse messages should be classified before broad display.

## Data And Access Principles

Trusted Bums handles sensitive data:

- Client target strategy.
- Prospect and buyer identity.
- Relationship notes.
- Meeting attendees and join links.
- Transcripts.
- Commission terms.
- Payment and payout records.
- Legal acceptances.
- Contact submissions.
- Admin notes.
- Raw capture data.

The operating model therefore requires strict access principles:

- Authorization-bearing fields are not self-service.
- Signup metadata is intent, not proof.
- Company access must be domain-validated or Admin-approved.
- Public email domains require manual proof.
- Client Admins manage only their company scope.
- Bums see only open, assigned, accepted, or explicitly related work.
- Finance users get finance-safe data by default, not broad operational details.
- Admins can override but must leave audit trails.
- Pending and denied users remain unassigned until approved.

These principles are not merely technical. They define marketplace legitimacy.

## Product Architecture As Business Architecture

The product mirrors the business model through four operating surfaces:

- Public site: explains the model, collects interest, routes sign-in and signup, presents legal and privacy pages.
- Client portal: manages terms, dashboard, agreements, profile, team, targets, opportunities, Bum directory, trainings, requests, payments, exports, and reports.
- Bum portal: manages dashboard, prospects, reverse opportunities, clients, contacts, opportunities, claims, trainings, live conversations, earnings, reports, and profile.
- Admin portal: manages the entire operating system.

The underlying architecture is:

- Clerk for authentication.
- Supabase for database, Row Level Security, and Edge Functions.
- React/Vite frontend.
- Microsoft Graph for Teams meetings, transcript sync, mailbox operations, and email sending.
- Chrome extension for user-confirmed page captures.
- DreamHost for static frontend hosting.

This architecture is intentionally lightweight. It allows Trusted Bums to operate like a software-enabled marketplace before it needs a large internal operations team.

## Operating Workflows

### Public Intake

Public visitor submits a contact or signup-interest form. Abuse checks run. The submission becomes a contact record and may trigger an internal notification. Admin reviews, owns follow-up, archives, escalates, or converts it.

Goal: turn public interest into qualified client or Bum onboarding without damaging email/domain reputation.

### Client Company Creation

A verified business-domain user may claim an unclaimed company domain and become initial Client Admin. If the email domain is public, ambiguous, or already claimed, the user enters a review or approval flow.

Goal: keep onboarding low-friction while preventing false company access.

### Same-Domain Team Approval

A later user from an already claimed domain requests access. Client Admin reviews and assigns Client Admin, Client Finance, or Client Member if appropriate.

Goal: let clients control their own team without allowing automatic self-join into sensitive data.

### Target And Opportunity Workflow

Client defines target accounts or registers opportunities. Bums may respond, request, claim, or be invited depending on the workflow. Admins coordinate exceptions.

Goal: match client demand with credible relationship supply.

### Flexible Origination Workflow

A Bum may bring an opportunity to a client that is not already on the client's list. A Bum may also bring a customer's unmet need into the Bum network before the right client exists. Another Bum can then identify or invite a potential client that can serve that customer.

Goal: let Trusted Bums originate opportunities from client demand, Bum relationships, customer needs, and network-discovered supply.

### Bum-To-Client Handoff

A Bum responds to a target or opportunity. The response enters a review or coordination queue. Client and Admin accept, decline, formalize, or continue conversation.

Goal: convert claimed relationship access into an actionable client workflow.

### Client-To-Bum Intro Request

Client selects a visible Bum and submits an intro request. The requested Bum and Admin see the request. The request moves through review and introduction stages.

Goal: let clients pull on trusted relationships intentionally.

### Meeting And Transcript Workflow

Meeting is scheduled, attendees sync, transcript sync runs where available, manual transcript can be added where needed, and missing or failed transcript states should enter rescue queues.

Goal: preserve context and evidence around introductions and opportunity progress.

### Finance Workflow

Customer pays the client directly. Client reports the collected revenue in Trusted Bums. Trusted Bums calculates the current commission percentage based on the revenue and collection date. The client can create a Trusted Bums invoice for tracking if needed. Payment to Trusted Bums and Bum payout tracking then proceed according to the accepted opportunity terms.

Goal: make commission economics auditable, fair, and operationally reliable.

### Shared Mailbox And Reputation Workflow

The shared mailbox `bums@trustedbums.com` handles DMARC reports, legal document requests, public questions, client/Bum/partner questions, complaints, abuse reports, privacy requests, and support triage.

Goal: centralize sensitive operations intake while limiting mailbox access and storing only what the workflow requires.

## Growth Strategy

Trusted Bums should grow through quality before quantity.

The business becomes stronger when it can prove:

- It can reach accounts clients cannot reach alone.
- Bums provide legitimate, high-quality relationship access.
- Clients understand and accept the Commission Plan.
- Legal and finance records are clear enough to survive disputes.
- Payouts are fair enough to retain high-quality Bums.
- The platform protects sensitive data.
- Public reputation remains clean.

The likely growth path is:

1. Start with a small number of known clients and trusted Bums.
2. Prove that warm introductions produce meetings and revenue.
3. Improve operations around handoffs, transcripts, finance exceptions, and support.
4. Tighten trust, domain, email, and access controls.
5. Expand the Bum network only where quality can be preserved.
6. Add more client self-service only after Admin rescue workflows are mature.
7. Package success stories and proof points for broader sales.

The proof point already exists in early form: Trusted Bums brought a startup into a Fortune 500 company that is choosing the startup as underlying technology for a new product it will sell. The opportunity is estimated to have potential to grow to $100M in revenue. This is the kind of story that validates the strategic premise: one trusted route can create company-changing revenue.

Over time, Trusted Bums should turn this kind of outcome into anonymized or approved case studies. The story matters because it demonstrates that the product is not merely about meetings; it is about access that can change a startup's trajectory.

## Key Metrics

Trusted Bums should track metrics that reflect trust and economic value, not vanity activity.

Marketplace supply metrics:

- Approved Bums.
- Active Bums.
- Bums with completed training.
- Bums with accepted claims or intro requests.
- Relationship response quality.
- Bum payout timeliness.

Client demand metrics:

- Active client companies.
- Target accounts submitted.
- Opportunities registered.
- Intro requests submitted.
- Training assets published.
- Client team activation.

Workflow metrics:

- Target responses proposed, accepted, declined, and formalized.
- Handoff aging.
- Unowned handoffs.
- Failed notifications.
- Meetings scheduled.
- Completed meetings missing transcripts.
- Transcript sync failures.
- Conversation response time.

Revenue metrics:

- Estimated deal value.
- Customer payment reports.
- Commissionable revenue.
- Invoices generated.
- Invoices paid.
- Payouts pending.
- Payouts paid.
- Disputes and voids.

Trust metrics:

- Contact-form abuse attempts blocked.
- DMARC alignment and failure trends.
- Email deliverability and reputation signals.
- Public-site security header status.
- Search/security issue status.
- Access-denied test coverage.
- Audit events for sensitive changes.

## Operating Principles

### Trust First

Every workflow should protect the trust that creates value. A short-term growth hack that makes the company look spammy is strategically expensive.

Some trust violations should be terminal. A client that tries to go around Trusted Bums to reach a Bum's contact before approving the claim should be banned from the platform permanently. A Bum that tries to bypass Trusted Bums and negotiate a separate higher-revenue share directly with a client should also be banned permanently. More ban-worthy behaviors will become clear as the marketplace handles more real transactions.

### Relationship Quality Over Lead Volume

The company should prefer a small number of credible routes into meaningful accounts over a large number of weak or generic leads.

### Intent Is Not Authorization

Signup claims, metadata, and self-entered company names are useful signals, not proof of access rights.

### Explicit Relationship Before Sensitive Visibility

Bums should not see sensitive target or opportunity details unless their relationship to the work is open, assigned, accepted, or otherwise documented.

### Commission Rights Need Records

If Trusted Bums creates value, the system needs enough evidence to show what was introduced, when, by whom, under what terms, and what revenue resulted.

### Admin Overrides Are Necessary But Audited

At an early stage, human judgment is necessary. But every elevated access, legal, finance, and workflow decision should leave a record.

### Finance Must Be Boring

Payouts, invoices, exceptions, and reports should become predictable, transparent, and queue-driven. Surprise is bad for both clients and Bums.

### The Brand Is An Asset

Domain reputation, email authentication, browser reputation, public metadata, legal clarity, and privacy posture are not side tasks. They are part of the sales product.

## Current Maturity

Trusted Bums appears to be past the idea-only stage. The product already includes substantial portal structure, legal terms, onboarding rules, Supabase tables, RLS policies, Edge Functions, QA docs, trust/reputation work, Chrome extension support, and admin surfaces.

The business is still early operationally. The backlog shows that the next phase is not simply creating more pages; it is making existing workflows more mature:

- Splitting finance-safe exports from operational exports.
- Promoting handoff metadata into Admin queue UI.
- Turning finance exceptions into owned queues.
- Adding transcript and support rescue ownership.
- Finalizing represented-contact retention and client visibility.
- Hardening public email and contact intake.
- Moving DMARC toward enforcement after review.
- Improving production host, metadata, and security headers.

This is the right maturation path for a high-trust marketplace: fewer ambiguous surfaces, more explicit queues, tighter access, better auditability.

## Risks

### Trust Dilution

If low-quality Bums make weak intros, exaggerate access, spam prospects, or mishandle confidential information, the marketplace loses its core value.

### Access Drift

If role access grows route by route without business-rule discipline, sensitive data may leak to users who should not see it.

### Finance Ambiguity

If commission plans, opportunity-specific terms, payment reports, and payout rules are unclear, disputes will become hard to resolve.

### Public Reputation Damage

Unauthenticated mail-send surfaces, weak DMARC enforcement, duplicate hosts, missing headers, or broad extension permissions can undermine buyer confidence.

### Operational Queue Blindness

If Admins cannot see owner, age, priority, next action, or failure state, important handoffs and finance exceptions can stall.

### Legal Overreach Or Under-Clarity

The commission model needs enough breadth to capture real value, but enough clarity to feel fair and enforceable.

### Marketplace Chicken-And-Egg

Clients need enough credible Bums to believe the network can help. Bums need enough real opportunities and payout trust to invest effort.

## Recommended Near-Term Strategy

1. Protect the public trust surface.
   - Make validated contact intake the only public email path.
   - Continue DMARC review and progress toward enforcement.
   - Fix public host redirects, route metadata, and security headers.

2. Tighten business access alignment.
   - Resolve the finance export mismatch.
   - Keep role permissions mapped to business rules.
   - Expand tests from route access to payload and export-column safety.

3. Mature Admin rescue queues.
   - Add priority, owner, next action, notification health, and aging to handoffs.
   - Add finance exception queues.
   - Add transcript/support rescue queues.

4. Finalize contact and capture governance.
   - Decide raw capture retention.
   - Decide client-visible represented-contact fields.
   - Define archive/delete authority.

5. Strengthen marketplace quality.
   - Define Bum approval criteria.
   - Track relationship quality.
   - Use training completion and outcome history to improve matching.

6. Turn successful workflows into proof.
   - Collect credible case studies.
   - Track revenue generated from warm introductions.
   - Build client-facing reporting around outcomes, not activity counts.

## Questions For Ryan

These are the remaining areas where the business needs sharper operating decisions after Ryan's current founder-level clarifications.

1. What exact stage and funding profile is the best initial wedge?
   - Seed with institutional funding, late Seed, Series A-bound, venture-backed only, PE-backed growth companies, or any funded startup with a product and urgent customer-access gap?

2. What is the minimum bar to approve a senior leader as a Bum?
   - Title history, reference checks, verified relationships, LinkedIn credibility, sector relevance, prior customer access, or founder/Admin judgment?

3. What should the operations team do by default versus only by exception?
   - Matching, coaching, intro review, meeting scheduling, follow-up nudges, claim rescue, payment enforcement, or dispute handling.

4. Should the 10% / 5% / 1% structure become the published default?
   - Or should it remain an internal preferred structure that can be negotiated per client, account, or opportunity?

5. How should reseller, channel, and indirect revenue be treated?
   - If a Trusted Bums-introduced relationship leads to a reseller agreement or indirect customer revenue, when do Trusted Bums and the Bum participate?

6. How should economics work when the customer exists before the client?
   - If one Bum brings the customer need and another Bum recruits the client that can serve it, how should credit, claim status, and Bum splits work?

7. What exactly must be disclosed before a client accepts a Bum claim?
   - Contact name, title, company, relationship history, relationship strength, prior interaction, proof, LinkedIn link, or narrative context.

8. What exactly must a client disclose before Bums can evaluate the opportunity?
   - Target account, target buyer, product context, strategic reason, deal size, existing relationship conflicts, urgency, or commission plan.

9. What are the formal claim-expiration rules?
   - Time limit, meeting non-occurrence, contact non-response, client rejection, stale opportunity, or Admin override.

10. How should multi-Bum splits be calculated?
   - Equal split by default, client-weighted split, Admin-approved split, role-based split for decision-maker versus influencer, or negotiated split before acceptance.

11. What penalties should apply when clients delay reporting or payment?
    - Interest, late fees, suspension, loss of access, legal escalation, public proof investigation, or permanent removal.

12. What proof points can be public?
    - The Fortune 500 startup story, anonymized revenue potential, client logos, Bum profiles, testimonials, case studies, or only private sales materials.

13. What support promises should Trusted Bums make?
    - First response times, resolution goals, payout timing, intro request handling, transcript availability, and dispute response standards all need eventual service expectations.

14. What data should be deleted, archived, or retained indefinitely?
    - The current preference is to retain everything except what law requires excluding or deleting, but the product still needs specific retention rules for captures, transcripts, meeting metadata, contact submissions, legal acceptances, and relationship notes.

15. How should Trusted Bums price or monetize non-commission work?
    - Strategy sessions, account mapping, training creation, concierge support, or retained BD support may deserve separate pricing.

16. What is the Managing Bum compensation model?
    - Percentage of recruited Bums' earnings, override on Trusted Bums revenue, time-limited network royalty, qualification requirements, or revocation rules.

## One-Sentence Operating Intent

Trusted Bums turns credible human relationships into a structured, legally anchored, trust-preserving, commission-aligned revenue channel for hard-to-reach B2B accounts.
