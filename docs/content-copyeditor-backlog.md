# Trusted Bums Content Copyeditor Backlog

_Last updated: 2026-06-08 by Codex daily content copyeditor automation._

## Executive Read

Current head `9f42bf4` changed the public Client landing-page copy, so the older agreement-recovery backlog item is no longer current. The active content work is narrower now and concentrated on naming consistency: the Bum-side company workflow still alternates between `Client Prospect`, `Prospects`, and `Target Prospects`; recruiting still uses `Bum Prospect` for a person even though the public Bum flow now says `Apply as a Bum`; the legal flow still mixes current `Client Agreement` wording with legacy `Partner Terms`; and the client request-history helper still shortens `Bum Intro Requests` to `Intro Requests`.

Current external guidance still supports tightening this language. W3C WCAG 2.2 continues to require consistent identification for repeated functions and components, Digital.gov plain-language guidance still recommends familiar words used consistently, and the GOV.UK Design System still recommends button and action text that makes the next step clear.

## Active Recommendations

### P1 - [TB-0040] Rename the Bum-side company workflow from `Prospects` to `Client Prospects`
- Evidence: [Bum layout](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/BumLayout.tsx), [Bum prospects page](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), [Bum reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReports.tsx), [Bum dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumDashboard.tsx), and current route assertions in [Visual UI Audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), [Portal interaction audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [Deep workflow hotfix audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), and [go-live client and Bum workflow](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/go-live-client-bum-workflow.spec.ts) all still identify `/bum/prospects` generically as `Prospects` even though the workflow creates and tracks `Client Prospect` records.
- Why it matters: This is the same object family identified three different ways across navigation, page headers, reports, and client metrics. That raises cognitive load, weakens glossary discipline, and increases the chance that users or operators confuse company prospecting with Bum recruiting.
- Recommendation: Standardize the Bum-side company workflow on `Client Prospect` or `Client Prospects` across nav labels, page titles, search metadata, report labels, dashboard labels, empty states, and route assertions.
- Acceptance criteria: `/bum/prospects` nav text, page title, helper copy, report labels, dashboard metrics, search metadata, and route/test assertions all use `Client Prospect` or `Client Prospects` consistently, with no remaining generic `Prospects` label for this workflow.

### P1 - [TB-0041] Replace `Bum Prospect` with a recruiting-specific person term
- Evidence: [Signup intent dialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx) still tells generic `/login` users to choose `Client Prospect` or `Bum Prospect`; [Login](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Login.tsx) still exposes that mixed chooser through `Create account`; [Admin contact submissions](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx) still says `qualify Bum Prospects`, `Create a hidden Bum Prospect profile`, `Create Bum Prospect`, and `Bum Prospect created`; and [contact API escalation copy](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts) still generates `Bum Prospect from contact form` and `Created a Bum Prospect profile...` notes while the public Bum landing page already says [Apply as a Bum](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/BumLanding.tsx).
- Why it matters: `Prospect` already names a possible client company elsewhere in the product. Reusing it for a future Bum turns one noun into two object types, which makes admin intake, support, recruiting, and analytics language harder to interpret and less trustworthy.
- Recommendation: Choose a recruiting-specific noun such as `Bum Candidate` or `Bum Applicant`, then update the generic signup chooser, admin intake actions, generated admin notes, and related assertions in one pass.
- Acceptance criteria: No visible recruiting flow or generated admin escalation note uses `Bum Prospect`; the login signup chooser, admin intake actions, toasts, helper copy, and generated notes all distinguish prospective people from prospective client companies.

### P1 - [TB-0042] Finish the `Client Agreement` terminology cleanup and retire legacy `Partner Terms`
- Evidence: [Partner terms data](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/data/partnerTerms.ts) now defines the active contract title as `Trusted Bums Client Agreement`; [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx) shows `Trusted Bums Client Agreement` in the page header but still uses `Trusted Bums Partner Terms` in the contact-mail subject; [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx) still titles the workspace `Client Agreement` while the same page also contains agreement records and FAQ content; [QA checklist](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-checklist.md) still tells testers to accept the current `Partner Terms`; and route coverage in [Visual UI Audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), [Portal interaction audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), and [Deep workflow hotfix audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts) still asserts the singular workspace name `Client Agreement`.
- Why it matters: Legal, support, and QA surfaces should not ask users and operators to guess whether `Partner Terms`, `Client Agreement`, and the agreement workspace are the same thing. Mixed legal nouns make acceptance, troubleshooting, and support instructions harder to trust.
- Recommendation: Standardize the current contract name on `Client Agreement` across support and QA surfaces, remove remaining `Partner Terms` references, and decide whether the multi-record workspace should stay singular or become `Client Agreements`.
- Acceptance criteria: No user-facing or operator-facing string for the current client contract says `Partner Terms`; the mail subject, QA checklist, route/test vocabulary, and legal workspace labels all use one approved agreement naming system and clearly distinguish the current contract from agreement records.

### P2 - [TB-0043] Keep `Bum Intro Requests` explicit in the client request-history helper copy
- Evidence: [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx) still uses the section title `Bum Intro Requests` and the helper sentence `Intro Requests your team sent from the Bum Directory...`; [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md) keeps `Claims`, `Customer Leads`, and `Client-To-Bum Intro Requests` as separate workflow concepts.
- Why it matters: The product already has several request-like nouns. Shortening this one in the helper line makes the table read like a generic request queue instead of a specific client-to-Bum workflow.
- Recommendation: Repeat the full object name in the helper copy, for example `Bum Intro Requests your team sent from the Bum Directory...`, unless the whole section is renamed in one approved terminology pass.
- Acceptance criteria: The section title and helper line use the same noun family, and no visible helper text shortens `Bum Intro Requests` to a generic `Intro Requests` label on this page.

## Company Glossary

### Client Prospect
- Definition: A company that may become a Trusted Bums client, usually with a target account, contact context, or invite owner attached.
- Use when: Bum-side company prospecting, customer-lead routing to a non-client company, admin client-creation review, search metadata, and any workflow where the object is a company.
- Avoid/conflicts: Generic `Prospects`, `Target Prospects`, or any recruiting-person label such as `Bum Prospect`.
- Evidence: [Bum prospects page](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Bum reverse opportunities](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx), [Admin dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminDashboard.tsx).

### Bum Candidate
- Definition: Proposed recruiting term for a person applying to join the Trusted Bums marketplace as a Bum.
- Use when: Public recruiting, generic signup, admin intake, recruiting notes, and support language about future Bums.
- Avoid/conflicts: `Bum Prospect`, which collides with `Client Prospect` and makes a person sound like a company pipeline object.
- Evidence: Current conflict in [Signup intent dialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx), [Login](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Login.tsx), [Admin contact submissions](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), and [contact API escalation copy](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts).

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

### Client Agreement
- Definition: The current client-facing contract Trusted Bums asks a client user to review and accept.
- Use when: Terms acceptance, legal notifications, QA steps, support guidance, and the current-contract card.
- Avoid/conflicts: `Partner Terms` for the same current client contract, or using the same label for both the contract and the broader agreement workspace without an explicit distinction.
- Evidence: [Partner terms data](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/data/partnerTerms.ts), [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx), [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), [QA checklist](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-checklist.md).

### Agreement records
- Definition: Historical or custom agreement files associated with a client company beyond the current contract.
- Use when: Lists, tables, or download areas that contain more than one agreement document.
- Avoid/conflicts: Treating `agreement records` as the same object as the current required client contract.
- Evidence: [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx).

## Disambiguation Queue

### Client Agreement workspace vs current contract name
- Confusion risk: The workspace, current contract, QA checklist, and support-adjacent mail subject still do not use one finalized legal noun system.
- Affected audiences: Client admins, client finance users, support, QA, legal reviewers.
- Recommended direction: Decide whether the workspace should be `Client Agreement` or `Client Agreements`, then align the current contract, workspace label, QA instructions, and contact/help language together.
- Evidence needed: Legal-approved terminology for the current contract, the multi-record workspace, and the support/QA vocabulary around acceptance.

### Recruiting noun for future Bums
- Confusion risk: The product now uses `Apply as a Bum` publicly while `/login` and admin intake still use `Bum Prospect`.
- Affected audiences: Public visitors, admins, recruiting, support, and analytics owners.
- Recommended direction: Approve a recruiting-specific noun such as `Bum Candidate` or `Bum Applicant`, then update the login chooser, admin intake, generated notes, and reporting language together.
- Evidence needed: Recruiting copy, founder scripts, support macros, onboarding language, and any approved candidate-stage naming.

## Watchlist

- [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx) still uses the metric label `Target Prospects`; recheck whether that should become `Client Prospects` once the wider prospect-label pass lands.
- [Index](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx) now uses the generic header CTA `Sign up` for the client-only page. That may be acceptable because the page context is already client-specific, but it should be rechecked after the account-creation terminology pass if stronger action wording is preferred.

## Access Requests And Evidence Gaps

Material missing access, customer language, sales/support/legal/brand sources, or other evidence needed for a stronger content review. Mirror durable requests in [docs/consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md).

- Still missing: legal-approved terminology for the client agreement workspace and current contract, recruiting-approved terminology for future Bums, sales collateral, onboarding emails, support macros, brand voice guidance, customer-language research, CRM stage naming, and customer-facing SOP or training language for `Customer Leads`, `Bum Intro Requests`, and related workflow nouns.
- This pass had current source and targeted test evidence, but it did not include a fresh retained screenshot artifact, a narrated support workflow, or business-approved copy sources for agreement, recruiting, and queue terminology. Recommendations are therefore implementation-ready and current, but not final-approval wording.

## Agent Inputs

- Date of run: 2026-06-08
- Files, tests, routes, internet sources, and commands reviewed: [copyeditor prompt](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/automation-prompts/trusted-bums-daily-content-copyeditor.toml), [consultant team rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-team-rules.md), [company-wide rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/company-wide-rules.md), [consultant access needs](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md), [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), previous [content copyeditor backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md), [Codex edit log](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md), `git log --oneline --decorate -8 --name-only -- '*.tsx' '*.ts' '*.md' '*.json' '*.toml' '*.sql'`, targeted `rg` terminology scans across `src`, `tests`, and `docs`, [Index](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx), [Bum landing](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/BumLanding.tsx), [Login](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Login.tsx), [Signup intent dialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx), [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx), [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx), [Bum prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Bum reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReports.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), [Admin contact submissions](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [contact API](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts), [partner terms data](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/data/partnerTerms.ts), [QA checklist](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-checklist.md), [staging smoke spec](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/staging-smoke.spec.ts), [opportunity model test](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/opportunityModel.test.ts), `corepack pnpm vitest run src/test/e2eSmokeRegression.test.ts src/test/opportunityModel.test.ts`, current W3C WCAG 2.2 guidance, current Digital.gov plain-language guidance, and current GOV.UK button guidance.
- Checks that could not run and why: No fresh GitHub-hosted screenshot artifact or local browser session was reopened in this pass; the active findings were directly verifiable from current source plus targeted regression tests, so this run is current and source-backed rather than fresh-screenshot-backed.
