# Trusted Bums Content Copyeditor Backlog

_Last updated: 2026-06-20 by Codex daily content copyeditor automation._

## Executive Read

Exact head `e231cc0` keeps the broader terminology ship intact, but the backlog was closed too broadly on 2026-06-19. Current source still leaves a narrower visible `TB-0040` wording seam after the prior closeout: [Bum Contacts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx) still labels the `PROSPECT` source as `Prospect`, describes the page as covering `prospect recommendations`, and tells Bums to add `prospects`; [Bum Prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx) still shows `Prospect saved`, `Unable to save prospect`, `Save prospect`, and `No prospects submitted yet`; [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx) still categorizes these records as `Prospect`; and [Admin Reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminReports.tsx) still types the same records as `Prospect`.

Current external guidance still supports finishing that cleanup: [W3C WCAG 2.2 consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html), [Digital.gov plain language guidance](https://digital.gov/guides/plain-language), and [GOV.UK button guidance](https://design-system.service.gov.uk/components/button/). Exact-head hosted release proof is green while this wording drift remains: GitHub `QA` `27857690007`, DreamHost deploy `27857689995`, `Visual UI Audit` `27857691601`, and `E2E Smoke` `27857708006` all completed successfully for `e231cc0`.

## Active Recommendations

### P1 - Finish `Prospective Client` wording across the remaining sourcing microcopy (`TB-0040`)
- Evidence: Exact head `e231cc0` still ships mixed visible naming for the same future-client object. [Bum Contacts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx:32) maps `PROSPECT` to `Prospect`, and its page description plus empty state still say `prospect recommendations` and `prospects`; [Bum Prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx:64) still uses `Prospect saved`, `Unable to save prospect`, `Save prospect`, and `No prospects submitted yet`; [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx:372) still uses `Prospect` as the visible category; and [Admin Reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminReports.tsx:182) still types these rows as `Prospect`. The current guardrail in [UI visual cleanup tests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/uiVisualCleanup.test.ts) only blocks the earlier `Prospected Client` family and therefore passes even though these remaining visible strings are still present.
- Why it matters: Repeating the same workflow object under both `Prospective Client` and `Prospect` raises cognitive load, weakens trust in the glossary, and breaks the consistent-identification rule that matters most on repeated portal actions, search results, and confirmation states.
- Recommendation: Standardize these remaining visible strings on `Prospective Client` or `Prospective Clients` everywhere the object is a future client company or a future-client recommendation. Keep terse internal schema or enum names hidden if needed, but finish the user-facing copy cleanup across Bum contacts, Bum prospect toasts and empty states, portal search categories, and admin reporting labels.
- Acceptance criteria: [Bum Contacts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), [Bum Prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), and [Admin Reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminReports.tsx) stop showing the visible `Prospect` noun for this object; the guardrail expands to fail on the remaining visible drift such as `Prospect saved`, `Save prospect`, `No prospects submitted yet`, `prospect recommendations`, and `category: "Prospect"`; and the fix lands with the existing exact-head workflow set rerun or a newer exact-head green chain.

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
- Evidence: [Bum prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Bum dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumDashboard.tsx), [Bum reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReports.tsx), [Bum reverse opportunities](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Bum contacts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), [Admin Reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminReports.tsx), and the current `TB-0040` guard gap in [UI visual cleanup tests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/uiVisualCleanup.test.ts).

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

- Recheck future new search, reporting, admin, or empty-state surfaces any time the product adds another future-client workflow so visible `Prospect` drift does not return outside the main `/bum/prospects` route.
- Recheck this backlog after any legal-approved terminology source, finance-owner wording source, or future post-beta deal-registration naming decision lands.

## Access Requests And Evidence Gaps

Material missing access, customer language, sales/support/legal/brand sources, or other evidence needed for a stronger content review. Mirror durable requests in [docs/consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md).

- Still missing: legal-approved terminology for the `Agreements` workspace versus the `Client Agreement` contract, finance-owner terminology for `Commission Plan` versus `commission schedule` in operator docs, product and legal-owner terminology for any future post-beta deal-registration connector, sales collateral, onboarding emails, support macros, brand voice guidance, customer-language research, CRM stage naming, and customer-facing SOP or training language for represented clients, prospective clients, prospective Bums, and customer leads.
- This pass had current source, targeted copy tests, live tracker row reads, and current external guidance, but it did not include a narrated support workflow or approved business-language sources for the legal, finance, and longer-lived terminology choices. The active content queue is now narrow again: one exact-head visible `Prospect` wording seam in `TB-0040`, plus the owner-source evidence gaps above.

## Agent Inputs

- Date of run: 2026-06-20
- Exact-head finding update: the prior `TB-0040` closeout fixed the earlier `Prospected Client` family, but exact head `e231cc0` still leaves a narrower visible `Prospect` wording seam across Bum contacts, Bum prospect toasts and empty states, portal search categories, and admin reports.
- Files, tests, routes, internet sources, and commands reviewed: [copyeditor prompt](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/automation-prompts/trusted-bums-daily-content-copyeditor.toml), [agent consultant team rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-team-rules.md), [repo consultant team rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-team-rules.md), [agent company-wide rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/company-wide-rules.md), [agent consultant access needs](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-access-needs.md), [repo consultant access needs](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md), [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), current [content copyeditor backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md), [Codex edit log](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md), [glossary site change review](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/glossary-site-change-review.md), `git rev-parse HEAD`, `git status --short`, `git log --oneline --decorate -12`, `git diff --name-only a17a856..HEAD -- src docs supabase .github`, targeted `rg -P` terminology scans across `src`, `tests`, and `docs`, [Bum contacts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), [Bum prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Bum dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumDashboard.tsx), [Bum reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReports.tsx), [Bum reverse opportunities](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), [Admin reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminReports.tsx), [Admin dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminDashboard.tsx), [Admin clients](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx), [Admin emails](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminEmails.tsx), `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json databaseId,workflowName,headSha,status,conclusion,createdAt,updatedAt,displayTitle`, `corepack pnpm exec vitest run src/test/uiVisualCleanup.test.ts src/test/scrumFiveBatch.test.ts src/test/bumContactsMutationContract.test.ts`, live tracker-row reads for `TB-0040`, `TB-0041`, `TB-0042`, `TB-0100`, and `TB-0101`, successful live tracker-row reopen for `TB-0040`, [W3C WCAG 2.2 consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html), [Digital.gov plain language guidance](https://digital.gov/guides/plain-language), and [GOV.UK button guidance](https://design-system.service.gov.uk/components/button/).
- Checks that could not run and why: No local browser session, legal-approved terminology matrix, support-macro source, finance-owner wording source, or post-beta deal-registration naming source was available in the repo or connected tools.
