# Trusted Bums Content Copyeditor Backlog

_Last updated: 2026-06-08 by Codex daily content copyeditor automation._

## Executive Read

Current-state postscript: several agreement-recovery findings below were overtaken by the current `441fd92` recovery UX bundle. Treat the older route/copy observations as source history until the next copyeditor pass refreshes them against current `main`; the remaining durable content queue is legal terminology consistency, prospect language, and approved wording sources.

The copy backlog is still focused, and the current hosted evidence confirms the remaining issues are live. The highest-risk issue is still agreement recovery: client dashboard next actions still send users to `Company Profile` instead of the legal workspace, and the terms deferral control still says `Skip This Login` even though the surrounding helper copy describes a limited review-later state.

The second issue is now broader than the last run captured. The `/client/agreements` workspace visibly mixes three noun systems at once: the route heading says `Client Agreement`, the card says `Current Client Agreement`, and the rendered contract title says `Trusted Bums Partner Terms`. That mismatch also survives in route inventories and QA docs.

The third issue remains prospect terminology drift. Public, admin, and Bum-side surfaces still mix `Client Prospect`, `Bum Prospect`, and generic `Prospects`, which makes recruiting and company-acquisition workflows harder to distinguish. A smaller but still live consistency break remains in the client request history section, where the heading says `Bum Intro Requests` but the helper line shortens the same object to `Intro Requests`.

Current external guidance still supports tightening this language. W3C WCAG 2.2 continues to treat consistent identification as an understandability requirement, Digital.gov continues to recommend plain, familiar, consistent wording, and GOV.UK’s current button guidance still says button text should describe the action it performs.

## Active Recommendations

### Superseded - Route agreement recovery through the legal workspace and rename the deferral action
- Evidence: [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx) still routes both finance and non-finance `Review Client Agreement` actions to `/client/profile`; [Client profile](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx) still presents agreement recovery inside `Company Profile`; [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx) is the dedicated legal workspace and already exposes `Review Client Agreement`; [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx) still pairs `Review later` helper copy with the button label `Skip This Login`; hosted Visual UI Audit artifact `27083467531` for current commit `4402ace` still shows the agreement workspace as a separate route; [portal interaction audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), and [deep workflow hotfix audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts) all keep `/client/agreements` in route coverage.
- Why it matters: This is trust and legal workflow copy. Users blocked on an agreement should land in the legal workspace, and the deferral control should state the real consequence instead of sounding like a generic dismiss action.
- Recommendation: Route dashboard agreement-recovery CTAs to `/client/agreements` or `/client/terms`, not `Company Profile`. Replace `Skip This Login` with explicit session-scoped wording such as `Review later this session`, subject to legal-owner review. Keep `Company Profile` focused on company settings rather than agreement remediation.
- Acceptance criteria: Agreement-recovery actions from blocked or stale-agreement states point to `/client/agreements` or `/client/terms`; no visible control says `Skip This Login`; and both the helper copy and button explain that the deferral applies only to the current signed-in session.

### P1 - Unify the agreement workspace, contract, and QA language
- Evidence: Hosted Visual UI Audit screenshot `chromium-client_admin-client-agreements.png` in artifact `27083467531` shows the page heading `Client Agreement`, the left-hand card title `Current Client Agreement`, and the rendered contract title `Trusted Bums Partner Terms` on the same screen; [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx) hard-codes the workspace title `Client Agreement` while rendering `terms.title`; [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx) still references `Trusted Bums Partner Terms` in the mail subject and document download path; [QA checklist](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-checklist.md) still tells testers to accept the current `Partner Terms`; the route inventories in [portal interaction audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), and [deep workflow hotfix audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts) still identify `/client/agreements` as `Client Agreement`.
- Why it matters: This is a visible terminology collision inside a legal surface. When the workspace, current contract, QA instructions, and support language use different names for the same agreement family, users and operators have to guess whether they are looking at one document, a workspace, or a historical record list.
- Recommendation: Choose one naming system and apply it across product, tests, and QA docs in one pass. A reasonable default would be to name the route/workspace `Client Agreements` or `Agreements`, reserve `Current Client Agreement` for the active contract card, and either rename `Trusted Bums Partner Terms` to the approved client-facing contract name or explicitly document why that document title must remain different.
- Acceptance criteria: The `/client/agreements` route heading, side-nav label, workspace description, current-contract card, rendered document title, mail subject, route assertions, and QA checklist all use one approved agreement vocabulary with no mixed `Partner Terms` versus `Client Agreement` ambiguity.

### P1 - Separate company prospecting from Bum recruiting terminology
- Evidence: Hosted public signup screenshot `mobile-chrome-public-signup-intent.png` in Visual UI Audit artifact `27083467531` still shows `Client Prospect` and `Bum Prospect` as the first account-type choices; hosted Bum prospect screenshot `mobile-chrome-bum-bum-prospects.png` from the same artifact still shows the page title `Prospects`, the form heading `Add Client Prospect`, and the button `Save prospect`; [Signup intent dialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx) still asks users to choose `Client Prospect` or `Bum Prospect`; [Index](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx) still says `Apply as a Bum Prospect`; [Admin contact submissions](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx) still says `qualify Bum Prospects`, `Create a hidden Bum Prospect profile`, `Create Bum Prospect`, and `Bum Prospect created`; [contact API escalation copy](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts) still writes `Bum Prospect from contact form` and `Created a Bum Prospect profile from this contact submission`; [Bum prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Bum layout](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/BumLayout.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), and the route inventories in [portal interaction audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), and [deep workflow hotfix audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts) still label `/bum/prospects` generically as `Prospects`.
- Why it matters: `Prospect` still means both a company the Bum wants as a client and a person who wants to become a Bum. That collision makes onboarding, recruiting, support, and admin escalation harder to interpret, and it weakens public trust because the same product uses the same noun for two different object families.
- Recommendation: Reserve `Client Prospect` for company-acquisition workflows. Rename the recruiting-side person object to `Bum Candidate`, `Bum Applicant`, or another approved recruiting noun, then update public CTA copy, signup intent copy, admin escalation copy, generated admin notes, and Bum-side company workflow labels in one coordinated pass. Also rename the Bum-side company page and actions to object-specific terms such as `Client Prospects`, `Save client prospect`, and `Client prospect saved`.
- Acceptance criteria: Company-acquisition workflows consistently use `Client Prospect`; recruiting flows no longer use `Bum Prospect` once an approved recruiting noun is chosen; and the homepage, signup modal, admin intake actions, generated admin notes, Bum portal nav/page title, search metadata, route assertions, and toast or error copy all use the chosen terms consistently.

### P2 - Keep Bum intro-request language explicit in the client request history section
- Evidence: Hosted `chromium-client_admin-client-requests.png` in Visual UI Audit artifact `27083467531` shows the section title `Bum Intro Requests` while the helper line immediately below says `Intro Requests your team sent from the Bum Directory`; [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx) contains the same mismatch; [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md) still keeps `Claims`, `Customer Leads`, and `Client-To-Bum Intro Requests` as separate internal workflow concepts.
- Why it matters: The product already uses multiple request-like nouns. Shortening this one inside the same section weakens the glossary cleanup and makes it easier for users to read the table as a generic request list instead of a specific client-to-Bum handoff type.
- Recommendation: Keep the full object name in helper copy, for example `Bum Intro Requests your team sent from the Bum Directory...`, unless the whole section is deliberately renamed in one approved content pass.
- Acceptance criteria: The section title and helper sentence use the same noun family; no visible helper copy shortens `Bum Intro Requests` to `Intro Requests` unless the full section terminology changes together.

## Company Glossary

### Client Agreement workspace
- Definition: The client-facing legal workspace at `/client/agreements` that contains the current agreement, FAQ, and company agreement records.
- Use when: Route names, nav labels, search metadata, support instructions, and QA route inventories refer to the page itself rather than one specific document.
- Avoid/conflicts: Using the same singular noun for both the workspace and the current contract if the page also includes FAQ and historical records.
- Evidence: [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), [portal interaction audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), hosted Visual UI Audit artifact `27083467531`.

### Current Client Agreement
- Definition: The active agreement version a client user must review and accept to continue current portal work.
- Use when: Acceptance prompts, remediation cards, legal notifications, and the current-agreement summary card refer to the actionable contract.
- Avoid/conflicts: Treating `Current Client Agreement`, `Partner Terms`, and the workspace title as interchangeable without an approved naming rule.
- Evidence: [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx), [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx).

### Agreement records
- Definition: Company-specific historical files or supplemental agreement documents associated with a client company.
- Use when: A list, table, or download area contains multiple agreement files beyond the current contract.
- Avoid/conflicts: Treating `agreement records` as the same object as the current required agreement.
- Evidence: [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx).

### Client Prospect
- Definition: A company that may become a Trusted Bums client, usually paired with a key contact and invite owner.
- Use when: Bum prospecting, company-intake review, search metadata, and any workflow where the object is a company or company-contact pair that may become a client.
- Avoid/conflicts: Using `prospect` alone where it could also mean a recruiting applicant.
- Evidence: [Bum prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx).

### Bum Prospect
- Definition: Current product term for a person who may join the marketplace as a Bum.
- Use when: Only where current code has not yet been renamed and the recruiting meaning must be preserved.
- Avoid/conflicts: Reusing `prospect` without a recruiting qualifier, or using `Bum Prospect` in company-acquisition workflows.
- Evidence: [Signup intent dialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx), [Index](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx), [Admin contact submissions](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [contact API escalation copy](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts).

### Customer Lead
- Definition: Buyer demand a Bum submits when they know a real customer need and want Trusted Bums to route that demand to the right client or client prospect.
- Use when: Bum-side lead submission, client review queues, admin triage, dashboards, and reporting.
- Avoid/conflicts: `Reverse opportunity` or generic `request` as the main user-facing noun for the same object.
- Evidence: [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx), [Bum customer leads](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReverseOpportunities.tsx).

### Bum Intro Request
- Definition: A request a client team sends to a specific Bum asking for an introduction into a target company or contact.
- Use when: Client request history, directory-driven intro asks, handoff tables, and support explanations.
- Avoid/conflicts: Shortening it to `Intro Request` in one place while keeping `Bum Intro Request` elsewhere in the same workflow.
- Evidence: [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx), [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md).

## Disambiguation Queue

### Client Agreement workspace vs current contract title
- Confusion risk: The legal route behaves like a workspace, but the workspace title, current-contract card, rendered document title, and QA language still use different names.
- Affected audiences: Client admins, client finance users, support, legal, QA.
- Recommended direction: Decide the approved names for the workspace, the active contract, and historical agreement records, then update code, screenshots, tests, and QA docs together.
- Evidence needed: Legal-approved naming for the workspace, the current agreement, the PDF title, and the support or QA vocabulary to use around acceptance.

### Bum Prospect vs Bum Candidate
- Confusion risk: `Prospect` already names a possible client company elsewhere in the product.
- Affected audiences: Public visitors, recruiting, admins, Bums, support, growth.
- Recommended direction: Adopt a recruiting-specific noun such as `Bum Candidate` or `Bum Applicant`, then update the homepage, signup intent, admin escalation, and recruiting-facing notes together.
- Evidence needed: Recruiting copy, onboarding language, founder scripts, and support macros that describe Bum acquisition.

## Watchlist

- [Bum reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReports.tsx) still uses the value label `Prospects`, which may remain acceptable as a metric shorthand but should be rechecked after the Bum-side page and navigation adopt a more specific noun.
- [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx) still shows the stat-card label `Target Prospects`; that label should be revisited after the broader agreement and prospect terminology passes so the dashboard noun set stays consistent.

## Access Requests And Evidence Gaps

Material missing access, customer language, sales/support/legal/brand sources, or other evidence needed for a stronger content review. Mirror durable requests in [docs/consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md).

- Source-of-truth language artifacts are still missing: legal-approved terminology, onboarding emails, support macros, sales collateral, recruiting copy, customer-language research, and CRM stage naming are not available in the repo or current connectors.
- This run had current hosted visual evidence, but it still did not have a legal-approved terminology matrix for agreement naming, recruiting terminology, or request-history vocabulary. Recommendations remain implementation-ready and source-backed with hosted screenshots, not business-approved final wording.

## Agent Inputs

- Date of run: 2026-06-08
- Files, tests, routes, screenshots, internet sources, and commands reviewed: [copyeditor prompt](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/automation-prompts/trusted-bums-daily-content-copyeditor.toml), [consultant team rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-team-rules.md), [company-wide rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/company-wide-rules.md), [consultant access needs](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-access-needs.md), [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/business-access-rules.md), current [content copyeditor backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md), [Codex edit log](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md), `git status --short`, `git log --since='7 days ago' --name-only --pretty=format:'COMMIT %h %cs %s' -- src docs tests`, targeted `rg` terminology scans, [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [Client profile](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx), [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx), [Signup intent dialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx), [Admin contact submissions](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [contact API escalation copy](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts), [Bum prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Bum layout](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/BumLayout.tsx), [Bum reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReports.tsx), [Index](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), [QA checklist](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-checklist.md), [portal interaction audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), [deep workflow hotfix audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), hosted Visual UI Audit run list via `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Visual UI Audit" --limit 5 --json databaseId,headSha,headBranch,status,conclusion,createdAt,displayTitle`, artifact download via `/Users/macdaddy/bin/gh-trustedbums run download 27083467531 --repo Pidpoddev/trustedbums --name visual-ui-audit --dir /private/tmp/trustedbums-visual-27083467531`, hosted screenshots `mobile-chrome-public-signup-intent.png`, `mobile-chrome-bum-bum-prospects.png`, `chromium-client_admin-client-requests.png`, and `chromium-client_admin-client-agreements.png`, `corepack pnpm run lint`, `corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts src/test/termsContractRules.test.ts`; internet sources: [W3C WCAG 2.2 Understanding](https://www.w3.org/WAI/WCAG22/Understanding/), [Digital.gov plain language guide](https://digital.gov/guides/plain-language), [GOV.UK button guidance](https://design-system.service.gov.uk/components/button/).
- Checks that could not run and why: No legal-approved terminology matrix, onboarding source, support macros, or recruiting copy source was available in the repo or connected tools, so final naming choices remain unapproved. This run did not use local port `8080` preview or external DNS checks because current-head hosted Visual UI Audit already provided stronger rendered-copy evidence for the affected public and portal surfaces.
