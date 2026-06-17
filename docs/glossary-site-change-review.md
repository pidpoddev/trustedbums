# Glossary Site Change Review

_Date: 2026-06-01_

## Purpose

This document records the Lead Developer and Scrum-team review of the founder-approved glossary in `docs/content-copyeditor-backlog.md` and identifies practical site changes that should bring the public site, portals, legal surfaces, training copy, tests, and support language into alignment.

## Lead Developer Review

The glossary is implementation-ready for a first pass. Most changes are low technical risk because they are copy and label updates, but they touch trust-sensitive workflows and therefore need coordinated QA:

- Legal wording affects buyer confidence and acceptance records.
- Marketplace wording affects whether Clients and Bums understand what object they are acting on.
- Finance wording must not imply Customer money passes through Trusted Bums.
- Role labels must not imply platform-wide authority.
- Tests currently encode old labels, so route and visual audits must be updated with the copy changes.

Recommended implementation posture:

1. Ship copy-only changes first where the glossary is founder-approved.
2. Keep deeper data-model or workflow changes out of the first glossary PR.
3. Update tests in the same PR where they assert visible labels.
4. Defer ambiguous terms to a later legal/product pass: `Claim` vs `Introduction Claim`, `Revenue Share` vs `Commission`, and `Successful Purchase` vs `Revenue Confirmed`.

## Scrum Review

The Scrum team should treat the glossary as a product alignment epic with several small stories, not a single broad rewrite. Each story should have visible acceptance criteria and should be testable in one portal area.

## Recommended Epic

### Epic: Apply Approved Glossary To Site And Portal Copy

Goal: Replace ambiguous or inconsistent terms with the approved glossary so Clients, Bums, Admins, and public visitors see the same concepts across the website, product, legal docs, and training.

Success measure: A user can tell the difference between Customer, Client, Prospective Client, Bum, Prospective Bum, Represented Client, Opportunity, Customer Lead, Intro Request, Claim, Accepted Claim, Completed Introduction, Customer Payment Report, Commission Plan, and Commission Invoice Generator without relying on internal knowledge.

## Stories

### Story 1 - Standardize Agreements Workspace And Client Agreement Language

As a Client user, I want every legal acceptance and legal-history surface to use the same terms so I know whether I am opening the Agreements workspace, reviewing the current Client Agreement, or looking at past agreement records.

Recommended terms:

- Use `Agreements` for the Client legal workspace that contains the current contract, FAQ, redline/amendment requests, and agreement records.
- Use `Client Agreement` for the binding Client contract or document.
- Use `Agreement records` for history.
- Avoid `Partner Terms`, `Terms & Legal Agreements`, and singular `Client Agreement` where the whole workspace is meant.

Candidate files:

- `src/layouts/ClientLayout.tsx`
- `src/components/PortalGlobalSearch.tsx`
- `src/pages/client/ClientAgreements.tsx`
- `src/pages/client/ClientTerms.tsx`
- `src/pages/client/ClientProfile.tsx`
- `src/pages/client/ClientDashboard.tsx`
- `src/data/legalDocuments.ts`
- `src/data/partnerTerms.ts`
- route/visual audit tests that assert old labels

Acceptance criteria:

- Client nav, dashboard, profile, search, and agreement-history workspace links use `Agreements` consistently for the workspace.
- The current contract remains labeled `Client Agreement`.
- History remains distinguishable as `Agreement records`.
- No client-facing CTA says `Open terms screen`.
- Tests asserting visible legal labels are updated.

### Story 2 - Consolidate Opportunity Entry Points Into One Opportunity Workspace

As a Client, Bum, or Admin user, I want every possible deal path to appear as an Opportunity with an origin, stage, and Claim action so I do not have to understand separate entry points like Opportunities, Reverse Opportunities, Customer Leads, target responses, and intro requests.

Recommended terms:

- `Opportunity`: any possible commercial match or revenue path.
- `Opportunity Origin`: who or what started it.
- `Opportunity Stage`: CRM-style maturity state.
- `Customer Lead`: a Customer the Bum knows who may want the Client's products or services.
- `Bum-Originated Opportunity`: an Opportunity a Bum brings to a Client that is not already on the Client's target list.
- `Customer-Originated Opportunity`: an Opportunity that begins with Customer need before the right Client exists.
- `Intro Request`: a request for a trusted introduction.
- `Bum Intro Request`: a Client request for a warm introduction from a specific Bum.
- `Claim`: working product term for a Bum asserting the right to revenue if the Client accepts the claim and the trusted introduction occurs.
- `Accepted Claim`: a Client-accepted claim that can produce Bum economics after the trusted introduction occurs and downstream requirements are met.

Recommended origin values:

- `Client-Originated`
- `Bum-Originated`
- `Customer-Originated`
- `Admin-Originated`
- `Imported`

Recommended workspace direction:

- One Opportunity list per role, filtered by permissions.
- Origin filters instead of separate top-level concepts.
- Stage filters instead of route-specific workflow names.
- A consistent `Create Claim` or `Request Claim` action wherever a Bum can claim the Opportunity.
- Opportunity detail page shows origin, stage, eligible Claim actions, accepted Claims, meetings, Customer Payment Reports, and Commission Invoice records as they become relevant.

Candidate files:

- `src/pages/client/ClientRequests.tsx`
- `src/pages/client/ClientDashboard.tsx`
- `src/pages/client/ClientOpportunityNew.tsx`
- `src/layouts/ClientLayout.tsx`
- `src/components/PortalGlobalSearch.tsx`
- `src/pages/bum/BumReverseOpportunities.tsx`
- `src/pages/bum/BumClaims.tsx`
- `src/pages/bum/BumOpportunities.tsx`
- `src/pages/admin/AdminOpportunities.tsx`
- `src/lib/portalApi.ts`
- `tests/e2e/portal-interaction-audit.spec.ts`
- `tests/e2e/visual-ui-audit.spec.ts`

Acceptance criteria:

- `/client/requests` no longer behaves as a separate generic request bucket; its contents are represented as Opportunities or Claim/Intro Request activity in the unified model.
- `Reverse Opportunities` no longer appears as a primary user-facing concept once the unified Opportunity workspace is ready.
- Every Opportunity row or card shows origin and stage.
- Every claimable Opportunity has a clear Claim action.
- Search and empty states stop using `requests` as the umbrella term for multiple workflow objects.
- `Prospect-converted` is replaced with a user-readable status.
- Client dashboard action copy distinguishes Customer Leads from Bum Intro Requests.
- Tests are updated for the approved visible labels.

Implementation note:

This should probably ship in two phases. Phase 1 is label cleanup and navigation IA planning without schema changes. Phase 2 is the unified Opportunity workspace, which may require API shape changes, data migrations, reporting changes, and access-rule updates.

### Story 3 - Scope Client Team Role Labels

As a Client Admin, I want role labels to make clear that I am assigning company-scoped Client roles, not platform-wide roles.

Recommended terms:

- `Client Admin`
- `Client Finance`
- `Client Member`

Candidate files:

- `src/pages/client/ClientTeam.tsx`
- `src/data/authData.ts`
- `src/layouts/ClientLayout.tsx`
- tests that assert role labels

Acceptance criteria:

- Team role picker uses `Client Admin`, `Client Finance`, and `Client Member`.
- Role chips and shell summaries use the same scoped labels.
- No client-facing team-management surface shows bare `Admin`, `Finance`, or `Member` unless the surrounding sentence clearly scopes it to the Client company.

### Story 4 - Correct Finance Language Around Direct Customer Payments

As a Client Finance user, I want finance copy to make clear that Customers pay Clients directly and Trusted Bums only records Client-reported revenue and generates commission invoices.

Recommended terms:

- `Customer Payment Report` for Client-entered Customer revenue.
- `Commission Plan` for the approved finance object that explains how commission is calculated.
- `Commission Invoice Generator` for the tool that calculates the current Trusted Bums commission amount.
- `Commission` for legal/finance calculation.
- `Revenue Share` for narrative explanation of the business model.

Avoid:

- `Payment processing`
- `Paid through Trusted Bums`
- `Commission structure` as the visible product term when the approved object is the `Commission Plan`
- Any copy implying Customer money passes through Trusted Bums
- `Trusted Bums receipt` unless a future legal/finance decision defines it

Candidate files:

- `src/pages/client/ClientPayments.tsx`
- `src/pages/client/ClientReports.tsx`
- `src/pages/client/ClientDashboard.tsx`
- `src/pages/client/ClientExports.tsx`
- `src/components/PortalGlobalSearch.tsx`
- legal docs and training docs that mention finance flow

Acceptance criteria:

- Finance copy says Customers pay Clients directly.
- Client-entered revenue is called a `Customer Payment Report`.
- Client-facing finance setup and dashboard copy use `Commission Plan` for the approved finance object.
- Invoice tool copy reflects commission calculation, not payment processing.
- Finance export labels do not imply broad operational access.

### Story 5 - Align Public Site And Intake Copy With Party Terms

As a public visitor, I want to understand the difference between Customers, Clients, Bums, Prospective Bums, and Prospective Clients before I sign up or contact Trusted Bums.

Recommended terms:

- `Client` for the company seeking access and paying Trusted Bums.
- `Customer` for the end buyer.
- `Bum` for an approved network participant.
- `Prospective Bum` for a person who wants to become a Bum but is not yet approved.
- `Prospective Client` for a company that might become a Client.

Candidate files:

- `src/pages/Index.tsx`
- `src/components/SignupIntentDialog.tsx`
- `src/components/admin/ContactSubmissionsPanel.tsx`
- public legal pages

Acceptance criteria:

- Public signup/contact copy does not imply every applicant is already a Bum.
- Admin intake copy distinguishes Prospective Bums from approved Bums.
- Public signup and company-contact routes distinguish Prospective Clients from active Clients.
- Public explanation distinguishes Customers from Clients when the business model is being explained.
- No visible recruiting flow or generated admin note uses `Bum Prospect`.
- No future-client UI uses `Client Prospect`.

### Story 6 - Separate Represented Clients From Prospective Clients

As a Bum user, I want active Client companies and future Client companies to use different labels so I know whether I am representing an approved Client or suggesting a company that could become one.

Recommended terms:

- `Represented Clients` for active or live Client companies a Bum can represent, search, or work with.
- `Prospective Clients` for companies that might become Clients through recommendation, demand routing, or business development.
- Avoid `Clients We Represent`, generic `Prospects`, `Client Prospect`, and `Target Prospects` as primary user-facing labels.

Candidate files:

- `src/pages/bum/BumClients.tsx`
- `src/pages/bum/BumProspects.tsx`
- `src/pages/bum/BumDashboard.tsx`
- `src/pages/bum/BumReports.tsx`
- `src/pages/bum/BumReverseOpportunities.tsx`
- `src/components/PortalGlobalSearch.tsx`
- `src/components/FirstLoginWalkthrough.tsx`
- route/visual audit tests that assert old labels

Acceptance criteria:

- `/bum/clients` uses `Represented Clients`.
- `/bum/prospects` uses `Prospective Clients`.
- Bum dashboard, reports, search, walkthrough, and related Opportunity copy use those terms consistently.
- Old labels remain only in migration notes, test descriptions for legacy coverage, or explicit avoid lists.

### Story 7 - Define CRM Stage Names Before Implementing Stage UI

As the Scrum team, we need agreed stage names before changing workflow statuses so product labels, reporting, legal records, and analytics stay aligned.

Recommended stage direction:

- `Completed Introduction`: trusted introduction occurred, usually because the meeting occurred.
- Avoid `Successful Introduction` until money or a deal exists.
- Consider `Revenue Confirmed` instead of `Successful Purchase` if the revenue event may be subscription, renewal, expansion, reseller, usage, or other non-retail payment.

Acceptance criteria:

- Product, Legal, Finance, and Data agree on stage names before code changes status enums.
- Any status rename includes migration, UI copy, reports, and tests.
- Analytics/reporting can distinguish meeting occurrence from confirmed revenue.

## Suggested Release Sequence

1. Legal and role-label copy pass: low workflow risk and high trust clarity.
2. Finance copy pass: requires careful review to avoid implying payment processing.
3. Public intake copy pass: align marketing and admin intake with Prospective Bum / Prospective Client.
4. Bum company workflow copy pass: align Represented Clients and Prospective Clients.
5. Opportunity IA design: define one Opportunity workspace, origin values, stage model, and Claim action rules.
6. Unified Opportunity implementation: consolidate separate Opportunity/Reverse Opportunity/Customer Lead/request views after Product/Legal/Data/QA agree.
7. CRM stage design: do before changing status enums or reports.

## Cross-Functional Review Needed

- Content Copyeditor: owns glossary application and old-label audit.
- Lead Developer: scopes PRs, prevents status/data-model churn in the copy-only pass, updates tests.
- Product Ops/Scrum: converts the stories above into sprint work and confirms workflow ownership.
- Legal/Compliance owner: reviews `Claim`, `Introduction Claim`, `Commission`, `Revenue Share`, and legal use of `Bum`.
- Data/Analytics: reviews stage names and finance/reporting terms.
- QA: updates route, visual, and copy assertions.
- Trust/Reputation: reviews public-site and finance copy for buyer confidence.

## Resolved Decisions

- `Prospective Bum` replaces `Bum Prospect`.
- `Prospective Client` replaces `Client Prospect`.
- `Agreements` names the Client legal workspace; `Client Agreement` remains the binding contract.
- `Commission Plan` names the approved Client finance object.
- `Represented Clients` names active Bum-side Client companies.

## Open Decisions

- Whether product should keep `Claim` or adopt `Introduction Claim` in legal/finance surfaces.
- Whether `Revenue Confirmed` should replace `Successful Purchase`.
- Whether `Revenue Share` and `Commission` should both be official, with audience-specific usage.
- Whether `Bum Intro Request` should remain a subtype or if all request workflows should use directional names.
- Which Opportunity origin values are final.
- Which existing tables should remain as implementation details versus migrate into one canonical Opportunity model.
- Whether Customer Leads become Opportunities immediately or remain pre-Opportunity intake until qualified.
