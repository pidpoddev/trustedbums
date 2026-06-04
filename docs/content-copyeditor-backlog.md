# Trusted Bums Content Copyeditor Backlog

_Last updated: 2026-06-04 by Codex daily content copyeditor automation._

## Executive Read

The 2026-06-04 glossary implementation removed most of the stale terminology drift that was still in yesterday’s backlog. Current source, route tests, and the Codex handoff log now consistently use `Client Agreement`, `Customer Leads`, `Claims`, `Client Prospect`, and `Bum Prospect` across the main portal surfaces.

Three copy issues still deserve active backlog space. First, the legal deferral flow still breaks the new agreement language with `Skip This Login`, skip-related toast copy, a `Trusted Bums Partner Terms` mailto subject, and support/process docs that still say `Partner Terms`. Second, the Bum-side prospecting workspace still uses the generic heading `Prospects` even though public signup and admin intake now use `Bum Prospect`, which overloads the same noun for two different objects. Third, admin intake still has a few action labels that are grammatically or operationally vague enough to weaken trust.

Current guidance still supports this narrower cleanup. W3C’s current [consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html) says controls with the same function should be identified consistently. W3C’s current [labels or instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) and [form labels tutorial](https://www.w3.org/WAI/tutorials/forms/labels/) reinforce visible, clear labels. Digital.gov’s current [writing guidance](https://digital.gov/guides/plain-language/writing) and [plain-language web writing tips](https://digital.gov/resources/plain-language-web-writing-tips/) still favor familiar words and consistent terminology. USWDS and GOV.UK button guidance also continue to prefer short, action-first labels that clearly describe what will happen: [USWDS buttons](https://designsystem.digital.gov/components/button), [GOV.UK buttons](https://design-system.service.gov.uk/components/button/).

## Active Recommendations

### P1 - Replace remaining legacy legal and deferral copy with explicit agreement language
- Evidence: [Client terms](src/pages/client/ClientTerms.tsx) still shows `Skip This Login`, `Updated terms skipped for now`, `Unable to skip updated terms`, and a `mailto:` subject containing `Trusted Bums Partner Terms`; [Client dashboard](src/pages/client/ClientDashboard.tsx) still uses the CTA `Review Client Agreement` but sends users to `/client/profile`; internal process docs still say `Partner Terms` in [qa checklist](docs/qa-checklist.md) and [operating model](docs/trusted-bums-operating-model.md).
- Why it matters: Legal acceptance is trust-critical. Generic skip language and legacy terms make the deferral flow feel improvised, and the CTA-to-destination mismatch weakens confidence at the point where users are deciding whether to accept a contract.
- Recommendation: Replace `Skip This Login` with explicit session language such as `Review later this session` if legal approves deferral. Update the related toast/error copy to repeat the same session-based wording. Change the mailto subject and support/process docs from `Partner Terms` to `Client Agreement` or `Bum Agreement` where that is the intended document. Either route `Review Client Agreement` to `/client/agreements` or rename the CTA so it matches `Company Profile`.
- Acceptance criteria: No user-facing legal or support-facing process copy uses `Partner Terms` when `Client Agreement` or `Bum Agreement` is meant; deferral copy clearly states that the skip applies only to the current session; legal CTAs accurately describe their destination.

### P1 - Rename the Bum prospecting workspace to `Client Prospects`
- Evidence: [Bum prospects](src/pages/bum/BumProspects.tsx) still titles the page `Prospects`; [Bum layout](src/layouts/BumLayout.tsx) still uses `Prospects` in navigation; [Portal global search](src/components/PortalGlobalSearch.tsx) already clarifies the page as `Client Prospects and contacts`; public signup now uses `Client Prospect` and `Bum Prospect` in [Signup intent dialog](src/components/SignupIntentDialog.tsx); admin intake also uses `Bum Prospect` in [Contact submissions panel](src/components/admin/ContactSubmissionsPanel.tsx); route tests still assert the generic heading `Prospects` in [portal interaction audit](tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](tests/e2e/visual-ui-audit.spec.ts), and [deep workflow hotfix audit](tests/e2e/deep-workflow-hotfix-audit.spec.ts).
- Why it matters: `Prospect` now points to both a future client company and a future Bum person. Leaving the Bum workspace at the generic `Prospects` forces users to infer which object they are managing.
- Recommendation: Rename the Bum workspace, nav label, page heading, search metadata, and route-test assertions to `Client Prospects`. Reserve `Bum Prospect` for recruiting or signup-intake flows involving a person who wants to become a Bum.
- Acceptance criteria: In Bum-facing navigation, headings, search, and tests, the company-acquisition workspace is always labeled `Client Prospects`; `Bum Prospect` appears only for person-level recruiting or intake flows.

### P2 - Tighten admin intake action labels for recruiting and conversion
- Evidence: [Contact submissions panel](src/components/admin/ContactSubmissionsPanel.tsx) still says `Review homepage leads, convert Client Prospect requests into targets, and qualify Bum Prospects.`; the Bum-intake helper copy says `Create a hidden Bum Prospect profile for admin review, or mark that you invited this person to sign up.`; the button still says `Mark Bum Invited`.
- Why it matters: This is operator-facing copy, but it still affects trust and speed. `Mark Bum Invited` is grammatically awkward, and `convert Client Prospect requests into targets` blurs the difference between a person’s inquiry and a company record.
- Recommendation: Use action labels that name the object and the outcome directly, such as `Convert client inquiry into Client Target`, `Create Bum Prospect`, and `Mark invite sent` or `Mark Bum Prospect invited`. Keep the action verbs consistent with current button guidance from USWDS and GOV.UK.
- Acceptance criteria: Admin intake copy distinguishes client-company conversion from Bum recruiting; no primary action uses awkward shorthand like `Mark Bum Invited`; helper text and buttons describe the actual next state created by the action.

## Company Glossary

### Client Agreement
- Definition: The current client contract accepted in the client portal, including commission, confidentiality, non-circumvention, and opportunity terms.
- Use when: Client legal pages, acceptance flows, support instructions, dashboard CTAs, and legal docs that refer to the client contract.
- Avoid/conflicts: `Partner Terms` when the intended document is the current client contract; generic `terms` when the route or action is specifically the client contract.
- Evidence: [Client agreements](src/pages/client/ClientAgreements.tsx), [Client terms](src/pages/client/ClientTerms.tsx), [data/legal documents](src/data/legalDocuments.ts).

### Bum Agreement
- Definition: The current Bum contract accepted in the Bum portal, covering role expectations, conduct, confidentiality, compliance, and payout eligibility.
- Use when: Bum legal pages, acceptance flows, support instructions, and legal docs that refer to the Bum contract.
- Avoid/conflicts: `Partner Terms` or generic `terms` when the intended document is the Bum contract.
- Evidence: [Client terms](src/pages/client/ClientTerms.tsx), [partner terms data](src/data/partnerTerms.ts), [data/legal documents](src/data/legalDocuments.ts).

### Customer Lead
- Definition: Buyer demand submitted by a Bum and routed to an existing client or a client prospect.
- Use when: Bum lead submission, client review queues, admin opportunity intake, dashboard summaries, and related reporting.
- Avoid/conflicts: `Reverse opportunity`, `Inbound Request`, or generic `request` as the primary visible label.
- Evidence: [Bum customer leads](src/pages/bum/BumReverseOpportunities.tsx), [Client requests](src/pages/client/ClientRequests.tsx), [Client dashboard](src/pages/client/ClientDashboard.tsx).

### Bum Intro Request
- Definition: A client-to-Bum request asking for an introduction into a target company or contact.
- Use when: Client request history, directory-driven intro asks, and support explanations about client-initiated intro work.
- Avoid/conflicts: Using it for Bum-submitted customer demand or for the public label of a Claim.
- Evidence: [Client requests](src/pages/client/ClientRequests.tsx), [business access rules](docs/business-access-rules.md), [operating model](docs/trusted-bums-operating-model.md).

### Claim
- Definition: A Bum request to participate in an Opportunity and the downstream commission path attached to that work.
- Use when: Bum-facing claim workflows, finance and payout contexts, disputes, admin/legal review, and opportunity detail surfaces.
- Avoid/conflicts: Renaming the same object as `Intro Request` in the same workflow.
- Evidence: [Bum claims](src/pages/bum/BumClaims.tsx), [Portal global search](src/components/PortalGlobalSearch.tsx), [Admin credits](src/pages/admin/AdminCredits.tsx).

### Client Prospect
- Definition: A company that a Bum or admin believes should become a Trusted Bums client, usually paired with a key contact and invite owner.
- Use when: Bum company prospecting, admin company-intake review, search metadata, and public signup paths that refer to a future client company.
- Avoid/conflicts: Generic `Prospects` when the product also uses `Bum Prospect`; `prospected client`; person-level recruiting language.
- Evidence: [Bum prospects](src/pages/bum/BumProspects.tsx), [Portal global search](src/components/PortalGlobalSearch.tsx), [Signup intent dialog](src/components/SignupIntentDialog.tsx).

### Bum Prospect
- Definition: A person who wants to become a Bum but is not yet an approved Bum account.
- Use when: Public signup, recruiting intake, admin review, and related support or onboarding language.
- Avoid/conflicts: Using `Bum Prospect` for a company-acquisition workspace or client-company record.
- Evidence: [Signup intent dialog](src/components/SignupIntentDialog.tsx), [Contact submissions panel](src/components/admin/ContactSubmissionsPanel.tsx), [contact API](src/lib/contactApi.ts).

## Disambiguation Queue

### Prospects
- Confusion risk: The same noun currently refers to client-company acquisition on the Bum side and person-level Bum recruiting in public and admin intake.
- Affected audiences: Bums, admins, support, onboarding.
- Recommended direction: Use `Client Prospects` for the Bum company workspace and reserve `Bum Prospect` for recruiting a person.
- Evidence needed: Sales or onboarding language showing what trusted users already call this workspace.

### Review Client Agreement CTA destination
- Confusion risk: The CTA wording names the contract, but the destination is `Company Profile`, not the agreement page itself.
- Affected audiences: Client admins, client finance, support.
- Recommended direction: Either send the CTA to `/client/agreements` or rename it to match the destination.
- Evidence needed: Product-owner intent for whether Company Profile or Client Agreement is the primary remediation destination.

## Watchlist

- [Client terms](src/pages/client/ClientTerms.tsx) now uses `Review later` in helper text but still keeps the generic button label `Skip This Login`, which is the sharpest remaining legal-copy inconsistency.
- [qa checklist](docs/qa-checklist.md) and [operating model](docs/trusted-bums-operating-model.md) still contain stale `Partner Terms` references after the product moved to `Client Agreement` and `Bum Agreement`.
- [portal interaction audit](tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](tests/e2e/visual-ui-audit.spec.ts), and [deep workflow hotfix audit](tests/e2e/deep-workflow-hotfix-audit.spec.ts) still encode the generic Bum heading `Prospects`, so the wording decision is currently test-coupled.

## Access Requests And Evidence Gaps

Material missing access, customer language, sales/support/legal/brand sources, or other evidence needed for a stronger content review. Mirror durable requests in [docs/consultant-access-needs.md](docs/consultant-access-needs.md).

- Legal-approved terminology, sales collateral, onboarding emails, support macros, customer-language research, CRM stage naming, and recruiting copy are still unavailable in the repo or current connectors.
- No fresh browser screenshots, deployed Playwright artifacts, or support transcripts were reviewed in this run, so recommendations remain source-backed rather than customer-validated.
- Current route and test coverage were reviewed, but final naming decisions for legal deferral and prospect taxonomy still need product/legal/support confirmation.

## Agent Inputs

- Date of run: 2026-06-04
- Files, routes, tests, docs, and commands reviewed: [consultant team rules](docs/consultant-team-rules.md), [consultant access needs](docs/consultant-access-needs.md), [codex edit log](docs/codex-edit-log.md), prior [content copyeditor backlog](docs/content-copyeditor-backlog.md), [company-wide rules](docs/company-wide-rules.md), [App routes](src/App.tsx), [Client layout](src/layouts/ClientLayout.tsx), [Bum layout](src/layouts/BumLayout.tsx), [Client dashboard](src/pages/client/ClientDashboard.tsx), [Client agreements](src/pages/client/ClientAgreements.tsx), [Client terms](src/pages/client/ClientTerms.tsx), [Client terms gate](src/components/ClientTermsGate.tsx), [Client requests](src/pages/client/ClientRequests.tsx), [Bum customer leads](src/pages/bum/BumReverseOpportunities.tsx), [Bum claims](src/pages/bum/BumClaims.tsx), [Bum prospects](src/pages/bum/BumProspects.tsx), [Signup intent dialog](src/components/SignupIntentDialog.tsx), [Contact submissions panel](src/components/admin/ContactSubmissionsPanel.tsx), [Portal global search](src/components/PortalGlobalSearch.tsx), [Admin legal](src/pages/admin/AdminLegal.tsx), [partner terms data](src/data/partnerTerms.ts), [qa checklist](docs/qa-checklist.md), [operating model](docs/trusted-bums-operating-model.md), [portal interaction audit](tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](tests/e2e/visual-ui-audit.spec.ts), [deep workflow hotfix audit](tests/e2e/deep-workflow-hotfix-audit.spec.ts), `git status --short`, `git log --since='3 days ago' --name-only --pretty=format:'COMMIT %h %ad %s' --date=short`, targeted `rg` terminology scans, `pnpm run lint`.
- Internet sources reviewed: [W3C consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html), [W3C labels or instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html), [W3C labeling controls tutorial](https://www.w3.org/WAI/tutorials/forms/labels/), [Digital.gov writing guidance](https://digital.gov/guides/plain-language/writing), [Digital.gov plain-language web writing tips](https://digital.gov/resources/plain-language-web-writing-tips/), [USWDS button guidance](https://designsystem.digital.gov/components/button), [GOV.UK button guidance](https://design-system.service.gov.uk/components/button/).
- Checks that could not run and why: No fresh browser or screenshot audit was run in this session. `pnpm run lint` completed with 7 existing React hook dependency warnings in admin/client payments, commission plans, payouts, and targets, but no lint errors affected today’s copy findings.
