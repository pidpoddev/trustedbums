# Trusted Bums Content Copyeditor Backlog

_Last updated: 2026-06-19 by Codex daily content copyeditor automation._

## Executive Read

Exact head `a17a856` keeps the larger terminology ship intact on current hosted proof: GitHub `QA` `27798687806`, DreamHost deploy `27798687708`, and `E2E Smoke` `27798711531` all passed on 2026-06-19 UTC, and exact-head `Visual UI Audit` `27810878263` is currently in progress. `TB-0042` stays closed because the earlier operator-doc drift is no longer real in [QA checklist](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-checklist.md), [trusted-bums operating model](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trusted-bums-operating-model.md), and [glossary-site-change-review](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/glossary-site-change-review.md). The real remaining copy issue is a reopened Bum-side regression: visible sourcing surfaces still mix the approved `Prospective Client` system with stale `Prospected Client`, `client prospect`, and generic `Prospect` labels.

Current external guidance still supports that cleanup: [W3C WCAG 2.2 consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html), [Digital.gov familiar terms](https://digital.gov/guides/writing-understanding/familiar-terms), and [GOV.UK button guidance](https://design-system.service.gov.uk/components/button/).

## Active Recommendations

### P1 - [TB-0040] Restore `Prospective Client` wording across Bum-side prospecting surfaces
- Evidence: The approved route still exists in [Bum prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx) and [first-login walkthrough](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/FirstLoginWalkthrough.tsx), but exact head `a17a856` regresses visible copy in [Bum dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumDashboard.tsx), [Bum reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReports.tsx), and [Bum contacts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx): `Prospected Clients`, `Bring in a new client prospect`, `Add Prospected Client`, `Prospect client submissions`, and `Prospect contacts` all remain visible even though the same workflow already uses `Prospective Client` elsewhere. Live tracker row `TB-0040` was reopened on current head with current hosted proof and the new regression scope.
- Why it matters: The same Bum workflow now identifies the same object two different ways, which weakens comprehension, onboarding consistency, and repeated-route accessibility for a core marketplace noun.
- Recommendation: Use `Prospective Client` or `Prospective Clients` consistently across Bum dashboard cards, CTA text, reports, contact-source labels, and save/error toasts. Keep internal status codes or table names hidden if they still need `PROSPECT` naming under the hood.
- Acceptance criteria: [Bum dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumDashboard.tsx), [Bum reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReports.tsx), [Bum contacts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), and prospecting toasts all use `Prospective Client` wording; no visible `client prospect`, `Prospected Client`, or generic `Prospect` label remains where the object is a prospective client company or its sourcing contact; and the targeted terminology regression pack still passes.

## Company Glossary

### Represented Clients
- Definition: Current client companies a Bum can already search, represent, or work with inside the marketplace.
- Use when: `/bum/clients`, Bum-side active company workflows, and any current-client browsing surface.
- Avoid/conflicts: `Clients We Represent`, generic `Clients`, or future-client terms when the company is already active in the marketplace.
- Evidence: [Bum clients](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumClients.tsx), [glossary-site-change-review](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/glossary-site-change-review.md).

### Prospective Client
- Definition: A company that may become a Trusted Bums client through recommendation, demand routing, or business-development follow-through.
- Use when: `/bum/prospects`, Bum-side sourcing workflows, Customer Lead routing, and related search/report copy.
- Avoid/conflicts: `Client Prospect`, `Prospected Client`, generic `Prospects`, or `Target Prospects` unless a metric is truly narrower and explained.
- Evidence: [Bum prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Bum dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumDashboard.tsx), [Bum reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReports.tsx), [Bum reverse opportunities](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Bum contacts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), and [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx).

### Prospective Bum
- Definition: A person who wants to join Trusted Bums as a Bum but is not yet approved.
- Use when: Public signup, recruiting copy, admin intake, and generated recruiting notes.
- Avoid/conflicts: `Bum Prospect`, which collides with company-pipeline language and is no longer the shipped term.
- Evidence: [Signup intent dialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx), [Admin contact submissions](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [contact API](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts), [glossary-site-change-review](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/glossary-site-change-review.md).

### Customer Lead
- Definition: Buyer demand a Bum submits when they know a real customer need and want Trusted Bums to route it to an active client or a prospective client.
- Use when: Bum demand submission, admin triage, client review queues, and related reports.
- Avoid/conflicts: Generic `request`, `reverse opportunity`, or company-prospect language when the object is actual customer demand.
- Evidence: [Bum reverse opportunities](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Bum dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumDashboard.tsx).

### Inner Circle
- Definition: A Bum's focused set of strongest trusted named direct relationships, capped at 20 contacts for now, used to surface high-confidence routes into opportunities and claims.
- Use when: Bum setup, My Contacts, claim stakeholder review, supply matching, and relationship-route explanation.
- Avoid/conflicts: Generic contact lists, scraped networks, inferred Second Circle routes, account-only placeholders, or weak acquaintances that do not meet the trusted-call standard.
- Evidence: [First login walkthrough](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/FirstLoginWalkthrough.tsx), [Bum contacts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), [Bum opportunity detail](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumOpportunityDetail.tsx), [Bum supply backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/bum-supply-leader-backlog.md), [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md).

### Inner Circle Company
- Definition: One of up to 3 companies where a Bum has credible prior-work, relationship-map, political, decision-process, or internal-context knowledge, even if no single named contact is ready to claim yet.
- Use when: Bum setup, relationship mapping, route-quality review, and Product Ops triage where the Bum understands a company deeply but should not list an account-only placeholder as one of the 20 named Inner Circle contacts.
- Avoid/conflicts: Named Inner Circle contact, generic Prospective Client, represented Client, employer history, or inferred Second Circle company. This term should not imply that Trusted Bums can expose or monetize unnamed relationships without Bum control.
- Evidence: [Product Ops workflow backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md).

### Agreements
- Definition: The client legal workspace that groups the current contract, FAQ, and agreement records.
- Use when: `/client/agreements`, dashboard recovery actions, legal navigation, and search metadata for the workspace.
- Avoid/conflicts: Singular `Client Agreement` when the user is opening the workspace rather than the specific contract.
- Evidence: [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [glossary-site-change-review](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/glossary-site-change-review.md).

### Client Agreement
- Definition: The current binding client contract a client user reviews and accepts.
- Use when: Terms acceptance, legal notices, support guidance, and contract-specific actions.
- Avoid/conflicts: `Partner Terms` for the same active contract, or using the same label for the broader agreements workspace.
- Evidence: [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx), [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), [Client profile](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx).

### Commission Plan
- Definition: The approved finance object that defines rates, duration, exclusions, and payout rules for a client opportunity or default client arrangement.
- Use when: Finance navigation, opportunity creation, payment reporting, support guidance, and legal references to approved economics.
- Avoid/conflicts: `commission structure` for the same approved object. Use `commission schedule` only for the timing sequence inside a plan.
- Evidence: [Client commission plans](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientCommissionPlans.tsx), [Client payments](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientPayments.tsx), [Client opportunity workflow](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientOpportunityNew.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx).

### Commission schedule
- Definition: The year-based timing sequence that determines which commission-plan tier applies after the first commission is paid.
- Use when: Explaining Year 1 through Year 6+ timing inside an approved commission plan.
- Avoid/conflicts: Using `commission schedule` as the name of the full approved finance object.
- Evidence: [Client commission plans](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientCommissionPlans.tsx), [Client opportunity workflow](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientOpportunityNew.tsx), [partner terms data](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/data/partnerTerms.ts).

### Deal Registration Beta Setup
- Definition: The current client-side configuration object for the beta deal-registration integration workflow.
- Use when: Client IT dashboard CTA, company profile card, settings form, save action, and support language for this beta setup.
- Avoid/conflicts: `Deal Registration Process`, `Deal Registration Automation`, or bare `Deal Registration Beta` for the same visible object.
- Evidence: [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [Client profile](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [Deal registration settings](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/DealRegistrationBetaSettings.tsx).

## Disambiguation Queue

### Opportunity stage names after the terminology ship
- Confusion risk: [glossary-site-change-review](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/glossary-site-change-review.md) still leaves stage names such as `Completed Introduction`, `Revenue Confirmed`, and `Successful Purchase` unresolved, which can affect product copy, reporting, and legal or finance explanations if renamed later.
- Affected audiences: Product Ops, Legal, Finance, Data, QA, and Content.
- Recommended direction: Settle the stage taxonomy before any status, report, or dashboard rename so content, analytics, and legal language move together.
- Evidence needed: Approved stage-name matrix plus an inventory of current status labels across UI, reports, and tests.

## Watchlist

- Recheck the Bum-side dashboard, reports, contacts, and any related toast or analytics helper text in the same pass as `TB-0040` so a route-by-route cleanup does not leave stale `Prospect` labels behind.
- Recheck this backlog after any legal-approved terminology source, finance-owner wording source, or future post-beta deal-registration naming decision lands.

## Access Requests And Evidence Gaps

Material missing access, customer language, sales/support/legal/brand sources, or other evidence needed for a stronger content review. Mirror durable requests in [docs/consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md).

- Still missing: legal-approved terminology for the `Agreements` workspace versus the `Client Agreement` contract, finance-owner terminology for `Commission Plan` versus `commission schedule` in operator docs, product and legal-owner terminology for any future post-beta deal-registration connector, sales collateral, onboarding emails, support macros, brand voice guidance, customer-language research, CRM stage naming, and customer-facing SOP or training language for represented clients, prospective clients, prospective Bums, and customer leads.
- This pass had current exact-head source, targeted copy tests, live tracker read/write access, and current external guidance, but it did not include completed exact-head visual artifacts, a narrated support workflow, or approved business-language sources for the legal, finance, and longer-lived terminology choices. Recommendations are therefore current and implementation-ready, but they are not yet owner-approved terminology.

## Agent Inputs

- Date of run: 2026-06-19
- Files, tests, routes, internet sources, and commands reviewed: [copyeditor prompt](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/automation-prompts/trusted-bums-daily-content-copyeditor.toml), [agent consultant team rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-team-rules.md), [repo consultant team rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-team-rules.md), [agent company-wide rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/company-wide-rules.md), [repo company-wide rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/company-wide-rules.md), [agent consultant access needs](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-access-needs.md), [repo consultant access needs](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md), [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), current [content copyeditor backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md), [Codex edit log](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md), `git rev-parse HEAD`, `git status --short`, `git log --oneline --decorate -12`, `git diff --name-only 57231bf75e9900c11aea964ec9999517a831d1ca..a17a85639a1b24dfda36da87d763eb4ecd3457af -- src docs tests .github`, targeted `rg` terminology scans across `src`, `docs`, and `tests`, [Bum prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Bum dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumDashboard.tsx), [Bum reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReports.tsx), [Bum contacts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), [Bum reverse opportunities](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Signup intent dialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx), [First login walkthrough](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/FirstLoginWalkthrough.tsx), [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), [Client commission plans](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientCommissionPlans.tsx), [Deal registration settings](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/DealRegistrationBetaSettings.tsx), [QA checklist](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-checklist.md), [trusted-bums operating model](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trusted-bums-operating-model.md), [glossary site change review](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/glossary-site-change-review.md), `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 12 --json databaseId,workflowName,headSha,status,conclusion,createdAt,updatedAt,displayTitle`, `/Users/macdaddy/bin/gh-trustedbums run view 27810878263 --repo Pidpoddev/trustedbums --json databaseId,workflowName,headSha,status,conclusion,createdAt,updatedAt,jobs`, `corepack pnpm exec vitest run src/test/clientCommissionPlans.test.ts src/test/dealRegistrationBetaWorkflow.test.ts src/test/bumSavedItems.test.ts src/test/termsContractRules.test.ts src/test/businessWorkflowQaContract.test.ts src/test/e2eSmokeRegression.test.ts`, Supabase project URL confirmation for `https://vaoqvtxqvbptyxddpoju.supabase.co`, live tracker-row reads for `TB-0040`, `TB-0041`, `TB-0042`, `TB-0100`, and `TB-0101`, live tracker-row update reopening `TB-0040`, [W3C WCAG 2.2 consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html), [Digital.gov plain language guide series](https://digital.gov/guides/plain-language), [Digital.gov familiar terms](https://digital.gov/guides/writing-understanding/familiar-terms), and [GOV.UK button guidance](https://design-system.service.gov.uk/components/button/).
- Checks that could not run and why: No completed exact-head screenshot artifact was available yet because `Visual UI Audit` `27810878263` was still running during this pass. No local browser session, legal-approved terminology matrix, support-macro source, finance-owner wording source, or post-beta deal-registration naming source was available in the repo or connected tools.
