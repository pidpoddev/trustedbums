# Trusted Bums Content Copyeditor Backlog

_Last updated: 2026-06-12 by Codex daily content copyeditor automation._

## Executive Read

Current head `d360570` keeps the same four active copy issues from `349bbe0`, but one of them now has broader evidence. The Bum-side company split still needs the `TB-0040` cleanup because `/bum/clients`, `/bum/prospects`, search, reports, walkthrough copy, and route assertions continue to mix `Clients`, `Clients We Represent`, `Prospects`, `Prospected Clients`, `Prospect client submissions`, `Client Prospect`, and client-side `Target Prospects`.

`TB-0042` is stronger on exact head than it was yesterday. The product still mixes `Client Agreement` with legacy `Partner Terms`, and the new Client Legal and Client IT flows extend the singular workspace wording further across dashboard recovery copy, sidebar nav, walkthrough steps, and search labels even though `/client/agreements` contains the current agreement plus FAQ and agreement records. The recruiting and request-history issues remain unchanged: the product still uses `Bum Prospect` while the public CTA says `Apply as a Bum`, and the client helper still shortens `Bum Intro Requests` to `Intro Requests`.

This run also surfaced two newer terminology seams that are not yet active tickets but now belong in the disambiguation queue: the same finance object flips between `Commission Plans`, `commission structure`, and `commission schedule`, and the same integration setup flips between `Deal Registration Process`, `Deal Registration Automation`, and `Deal Registration Beta`. Current guidance still supports tightening the language: [W3C WCAG 2.2 consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html), [Digital.gov plain language guidance](https://www.plainlanguage.gov/), and [GOV.UK clear button text guidance](https://design-system.service.gov.uk/components/button/).

## Active Recommendations

### P1 - [TB-0040] Separate represented clients from client prospects with explicit Bum-side labels
- Evidence: [Bum layout](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/BumLayout.tsx), [Bum clients](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumClients.tsx), [Bum prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), [First login walkthrough](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/FirstLoginWalkthrough.tsx), [Bum dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumDashboard.tsx), [Bum reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReports.tsx), and [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx) still split the same company pipeline across `Clients`, `Clients We Represent`, `Prospects`, `Prospected Clients`, `Prospect client submissions`, `Client Prospect`, and `Target Prospects`. Current route assertions in [Visual UI Audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), [Portal interaction audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [Deep workflow hotfix audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), and [go-live client and Bum workflow](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/go-live-client-bum-workflow.spec.ts) still preserve the generic `Prospects` heading for `/bum/prospects`.
- Why it matters: Exact head now has two Bum-side company workflows, but the naming does not tell a Bum whether they are looking at existing represented clients or recommended future clients. That weakens trust, makes the onboarding walkthrough less legible, and creates avoidable reporting and support ambiguity.
- Recommendation: Decide the noun boundary and carry it through in one pass. If `/bum/clients` is the existing represented-client workspace, keep that route explicitly client-focused. If `/bum/prospects` is the recommendation queue for future clients, rename it to `Client Prospects` or another explicit future-client term and remove bare `Prospects`, `Prospected Clients`, and similar hybrids. If `Target Prospects` on the client dashboard is a narrower subset, add helper copy that explains the distinction.
- Acceptance criteria: `/bum/clients`, `/bum/prospects`, Bum dashboard cards and CTAs, Bum reports, search metadata, first-login walkthrough copy, and route assertions all use one clear naming system that distinguishes represented clients from recommended client prospects without any remaining generic `Prospects` label.

### P1 - [TB-0041] Replace `Bum Prospect` with a recruiting-specific person term
- Evidence: [Signup intent dialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx) still tells unlocked `/login` users to choose `Client Prospect` or `Bum Prospect`; [Admin contact submissions](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx) still says `qualify Bum Prospects`, `Create a hidden Bum Prospect profile`, `Create Bum Prospect`, and `Bum Prospect created`; and [contact API escalation copy](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts) still generates `Bum Prospect from contact form` and `Created a Bum Prospect profile...` notes while the public Bum landing page already says [Apply as a Bum](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/BumLanding.tsx).
- Why it matters: `Prospect` now names at least two different objects on the Bum side: future client companies and future Bums. Reusing it for a person makes recruiting, support, and admin escalation language harder to interpret and less trustworthy.
- Recommendation: Align the person term with the public recruiting CTA and standardize on `Bum Applicant`, then update the unlocked signup chooser, admin intake actions, invite labels, generated admin notes, and related assertions in one pass.
- Acceptance criteria: No visible recruiting flow or generated admin escalation note uses `Bum Prospect`; the unlocked signup chooser, admin intake actions, toasts, helper copy, and generated notes all use one recruiting-person term that is distinct from `Client Prospect`.

### P1 - [TB-0042] Finish the `Client Agreement` terminology cleanup and retire legacy `Partner Terms`
- Evidence: [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx) shows `Trusted Bums Client Agreement` in the page header but still uses `Trusted Bums Partner Terms` in the contact-mail subject; [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx) still titles the workspace `Client Agreement` while the same page contains agreement records and FAQ content; [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [Client layout](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/ClientLayout.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), and [First login walkthrough](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/FirstLoginWalkthrough.tsx) now extend that singular workspace label into Client Legal and Client IT role flows; [QA checklist](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-checklist.md) still tells testers to accept the current `Partner Terms`; [trusted-bums operating model](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trusted-bums-operating-model.md) still preserves legacy `Partner Terms` language; and route coverage in [Visual UI Audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), [Portal interaction audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), and [Deep workflow hotfix audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts) still asserts the singular workspace name `Client Agreement`.
- Why it matters: Legal, support, QA, and internal operating docs should not ask users or operators to infer whether `Partner Terms`, `Client Agreement`, and the agreement workspace are the same thing. Mixed legal nouns make acceptance, troubleshooting, and support instructions harder to trust.
- Recommendation: Standardize the current contract name on `Client Agreement` across product, QA, and operating docs; remove remaining `Partner Terms` references for the active client contract; and rename the multi-record workspace to `Client Agreements` or another clearly plural history label if it is meant to hold more than the current contract.
- Acceptance criteria: No user-facing or operator-facing string for the current client contract says `Partner Terms`; the contact-mail subject, QA checklist, operating docs, route and test vocabulary, and legal workspace labels all use one approved agreement naming system and clearly distinguish the current contract from agreement records.

### P2 - [TB-0043] Keep `Bum Intro Requests` explicit in the client request-history helper copy
- Evidence: [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx) still uses the section title `Bum Intro Requests` and the helper sentence `Intro Requests your team sent from the Bum Directory...`; [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md) keeps `Claims`, `Customer Leads`, and `Client-To-Bum Intro Requests` as separate workflow concepts.
- Why it matters: The product already has several request-like nouns. Shortening this one in the helper line makes the table read like a generic request queue instead of a specific client-to-Bum workflow.
- Recommendation: Repeat the full object name in the helper copy, for example `Bum Intro Requests your team sent from the Bum Directory...`, unless the whole section is renamed in one approved terminology pass.
- Acceptance criteria: The section title and helper line use the same noun family, and no visible helper text shortens `Bum Intro Requests` to a generic `Intro Requests` label on this page.

## Company Glossary

### Clients We Represent
- Definition: Existing client companies already in the Trusted Bums marketplace and visible to a Bum because they have open opportunities, target-account activity, or another active marketplace relationship.
- Use when: `/bum/clients`, represented-client search and filters, and Bum-side company browsing for current marketplace clients.
- Avoid/conflicts: `Client Prospect`, bare `Prospects`, or `Prospected Clients` when the company is already an active client.
- Evidence: [Bum layout](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/BumLayout.tsx), [Bum clients](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumClients.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx).

### Client Prospect
- Definition: A company that may become a Trusted Bums client, usually with a recommendation, target-account context, or invite owner attached.
- Use when: Bum-side client recommendations, customer-lead routing to a non-client company, admin client-creation review, and any workflow where the object is a future client company rather than an existing marketplace client.
- Avoid/conflicts: Generic `Prospects`, ambiguous `Target Prospects`, `Prospected Clients`, or any recruiting-person label such as `Bum Prospect`.
- Evidence: [Bum prospects page](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Bum reverse opportunities](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Bum dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumDashboard.tsx), [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx).

### Bum Applicant
- Definition: Proposed recruiting term for a person applying to join the Trusted Bums marketplace as a Bum.
- Use when: Public recruiting, unlocked signup, admin intake, recruiting notes, and support language about future Bums.
- Avoid/conflicts: `Bum Prospect`, which collides with `Client Prospect` and makes a person sound like a company pipeline object.
- Evidence: Current conflict in [Signup intent dialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx), [Admin contact submissions](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [contact API](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts), and [Bum landing](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/BumLanding.tsx).

### Customer Lead
- Definition: Buyer demand a Bum submits when they know a real customer need and want Trusted Bums to route that demand to an existing client or a client prospect.
- Use when: Bum demand submission, client review queues, admin triage, dashboards, and reports.
- Avoid/conflicts: Generic `request`, `reverse opportunity`, or prospect language when the object is actual customer demand.
- Evidence: [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx), [Bum reverse opportunities](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Client layout](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/ClientLayout.tsx).

### Bum Intro Request
- Definition: A request a client team sends to a specific Bum asking for an introduction into a target company or contact.
- Use when: Client request history, directory-driven handoffs, admin support explanations, and access rules.
- Avoid/conflicts: Shortening it to `Intro Request` in one surface while keeping the longer name in titles, business rules, or support docs.
- Evidence: [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx), [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md).

### Commission plan
- Definition: The approved commercial object that defines the rates, duration, timing, exclusions, and payment rules for a client opportunity or default client arrangement.
- Use when: Finance nav, opportunity creation, response approval, admin review, payment reporting, and legal references to the approved economic terms.
- Avoid/conflicts: `Commission structure` or `commission schedule` when referring to the full approved object. Use `commission schedule` only for the year-by-year timing inside a commission plan.
- Evidence: [Client commission plans](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientCommissionPlans.tsx), [Client opportunity workflow](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientOpportunityNew.tsx), [Client layout](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/ClientLayout.tsx), and [partner terms data](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/data/partnerTerms.ts).

### Client Agreement
- Definition: The current client-facing contract Trusted Bums asks a client user to review and accept.
- Use when: Terms acceptance, legal notifications, QA steps, support guidance, and the current-contract card.
- Avoid/conflicts: `Partner Terms` for the same current client contract, or using the same label for both the contract and the broader agreement workspace without an explicit distinction.
- Evidence: [partner terms data](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/data/partnerTerms.ts), [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx), [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), [QA checklist](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-checklist.md).

### Agreement records
- Definition: Historical or custom agreement files associated with a client company beyond the current contract.
- Use when: Lists, tables, or download areas that contain more than one agreement document.
- Avoid/conflicts: Treating `agreement records` as the same object as the current required client contract.
- Evidence: [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx).

## Disambiguation Queue

### `Clients We Represent` vs `Client Prospect`
- Confusion risk: Exact head now exposes both `/bum/clients` and `/bum/prospects`, but the dashboard, reports, search metadata, and walkthrough do not yet explain the difference clearly.
- Affected audiences: Bums, admins, product ops, support, QA, reporting owners.
- Recommended direction: Reserve `Clients` for active marketplace clients and use an explicit future-client term such as `Client Prospects` for recommended companies that are not yet clients.
- Evidence needed: Product-ops confirmation of whether every company shown on `/bum/clients` is already an approved client relationship rather than a broader sourced-company list.

### Agreement workspace label vs current contract label
- Confusion risk: The workspace title, current contract, QA checklist, and operating docs still do not use one finalized legal noun system.
- Affected audiences: Client admins, client finance users, support, QA, legal reviewers.
- Recommended direction: Decide whether the workspace should be `Client Agreements`, `Agreement Records`, or another plural history label, then align the current contract, workspace label, QA instructions, and contact/help language together.
- Evidence needed: Legal-approved terminology for the current contract, the multi-record workspace, and the support/QA vocabulary around acceptance.

### `Target Prospects` vs `Client Prospects`
- Confusion risk: The client dashboard still counts `Target Prospects` while the Bum-side company recommendation workflow wants the broader `Client Prospect` term.
- Affected audiences: Client admins, Bums, product ops, QA, reporting owners.
- Recommended direction: Confirm whether `Target Prospects` is a distinct subset. If it is not, rename it to `Client Prospects`; if it is, add helper copy that explains the narrower meaning.
- Evidence needed: Product-ops confirmation of whether the client dashboard metric counts the same object family as `/bum/prospects`.

### `Commission plan` vs `commission structure` vs `commission schedule`
- Confusion risk: Current client finance and opportunity surfaces use all three nouns for what looks like one approved commercial object, which makes it unclear whether users are choosing a whole plan or only one rates table inside it.
- Affected audiences: Client admins, client finance, Client Legal, support, QA, and payment-report reviewers.
- Recommended direction: Reserve `Commission plan` for the approved object across nav, forms, approvals, exports, and legal copy. Use `commission schedule` only for the year-by-year timing inside a plan, and retire `commission structure` unless it truly names a different concept.
- Evidence needed: Finance and legal-owner confirmation of whether `structure` names a distinct artifact or only the currently approved commission plan.

### `Deal Registration Process` vs `Deal Registration Automation` vs `Deal Registration Beta`
- Confusion risk: The new Client IT workflow uses three names for the same setup object across dashboard CTA, profile card, settings module, save button, walkthrough, and helper text, so users cannot tell whether they are editing one beta workflow or several different features.
- Affected audiences: Client IT, client admins, legal reviewers checking integration scope, support, and QA.
- Recommended direction: Pick one visible product noun for the setup object, keep `beta` as status rather than the object name, and reserve `automation` or `process` only for helper text that explains how the workflow operates.
- Evidence needed: Product and legal-owner confirmation of what the client-visible feature should be called while the integration remains a beta setup rather than a repeatable production API.

## Watchlist

- [glossary-site change review](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/glossary-site-change-review.md) still preserves older `Bum Prospect` assumptions and does not reflect the new `/bum/clients` versus `/bum/prospects` split. Recheck it after the live product wording changes land so the implementation notes do not keep pointing at retired nouns.
- [trusted-bums operating model](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trusted-bums-operating-model.md) still uses `Partner Terms` as the active client-contract label. Recheck it in the same pass as the agreement cleanup so operating docs stop drifting from the product and QA language.

## Access Requests And Evidence Gaps

Material missing access, customer language, sales/support/legal/brand sources, or other evidence needed for a stronger content review. Mirror durable requests in [docs/consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md).

- Still missing: legal-approved terminology for the client agreement workspace and current contract, recruiting-approved terminology for future Bums, finance-approved terminology for `Commission Plans` versus `commission structure` and `commission schedule`, product-approved terminology for the Client IT deal-registration beta workflow, sales collateral, onboarding emails, support macros, brand voice guidance, customer-language research, CRM stage naming, and customer-facing SOP or training language for `Customer Leads`, `Bum Intro Requests`, represented clients, and related workflow nouns.
- This pass had current exact-head source, live tracker-read evidence, and targeted regression coverage, but it did not include a fresh retained screenshot artifact, a narrated support workflow, or business-approved copy sources for represented-client, recruiting, agreement, finance-plan, and integration terminology. Recommendations are therefore implementation-ready and current, but not final-approval wording.

## Agent Inputs

- Date of run: 2026-06-12
- Files, tests, routes, internet sources, and commands reviewed: [copyeditor prompt](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/automation-prompts/trusted-bums-daily-content-copyeditor.toml), [consultant team rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-team-rules.md), [company-wide rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/company-wide-rules.md), [consultant access needs](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md), [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), previous [content copyeditor backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md), [Codex edit log](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md), `git status --short`, `git log --oneline --decorate -12 -- src/App.tsx src/pages/client/ClientDashboard.tsx src/pages/client/ClientProfile.tsx src/pages/client/ClientOpportunityNew.tsx src/pages/client/ClientTeam.tsx src/components/DealRegistrationBetaSettings.tsx src/components/FirstLoginWalkthrough.tsx src/components/PortalGlobalSearch.tsx src/pages/bum/BumClients.tsx`, `git show --stat --summary --name-only d79f604`, `git show --stat --summary --name-only ea5a710`, `git show --stat --summary --name-only d360570`, targeted `rg` terminology scans across `src`, `docs`, and `tests`, [Bum clients](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumClients.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), [First login walkthrough](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/FirstLoginWalkthrough.tsx), [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [Client profile](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), [Client commission plans](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientCommissionPlans.tsx), [Client opportunity workflow](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientOpportunityNew.tsx), [Client team](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTeam.tsx), [Client layout](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/ClientLayout.tsx), [deal registration config](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/dealRegistration.ts), [deal registration settings](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/DealRegistrationBetaSettings.tsx), [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx), [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx), [QA checklist](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-checklist.md), [trusted-bums operating model](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trusted-bums-operating-model.md), [Visual UI Audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), [Portal interaction audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [Deep workflow hotfix audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), `corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts src/test/agentTrackerRules.test.ts src/test/clientLegalItRoles.test.ts src/test/clientCommissionPlans.test.ts src/test/dealRegistrationBetaWorkflow.test.ts`, live Supabase project list and project URL check for `vaoqvtxqvbptyxddpoju`, live tracker-row reads for `TB-0040` through `TB-0043`, [W3C WCAG 2.2 consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html), [Digital.gov plain language guidance](https://www.plainlanguage.gov/), and [GOV.UK button guidance](https://design-system.service.gov.uk/components/button/).
- Checks that could not run and why: No fresh GitHub-hosted screenshot artifact or local browser session was reopened in this pass because the active copy issues were directly verifiable from current source. The targeted Vitest sweep did not produce a clean all-green current-worktree signal because [e2e smoke regression](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/e2eSmokeRegression.test.ts) still fails a broad source assertion against the new Client IT dashboard action string `to: "/client/profile", primary: true`; that is a known worktree-only harness issue rather than exact-head copy evidence.
