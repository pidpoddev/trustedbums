# Trusted Bums Content Copyeditor Backlog

_Last updated: 2026-06-06 by Codex daily content copyeditor automation._

## Executive Read

The June 4 glossary pass still holds, so this backlog is now down to a small set of real implementation issues rather than a broad terminology cleanup. The highest-risk copy problem remains the client agreement recovery flow: dashboard recovery CTAs still send users to `Company Profile`, while the actual agreement workspace and terms route already exist elsewhere. The same flow also still uses the button label `Skip This Login`, which conflicts with the surrounding `Review later` explanation and does not clearly describe the session-scoped consequence.

The second active copy system problem is prospect terminology. Company-acquisition workflows use `Client Prospect`, recruiting flows still use `Bum Prospect`, and the Bum-facing company page still falls back to the generic heading `Prospects` plus generic save language. A smaller but still real consistency gap remains in the client request history area, where the section heading says `Bum Intro Requests` but the helper sentence shortens the same object to `Intro Requests`.

Current external guidance still supports narrowing these terms. W3C’s current WCAG 2.2 guidance says repeated functions should be identified consistently across pages, and visible labels should help users understand the purpose of controls. Digital.gov still recommends familiar terms, active voice, and using the same term consistently for the same concept. GOV.UK’s current button guidance still recommends button text that describes the action it performs.

## Active Recommendations

### P1 - Route agreement recovery through the legal workspace and rename the deferral action
- Evidence: [Client dashboard](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx) still shows finance and non-finance `Review Client Agreement` actions that send users to `/client/profile`; [Client profile](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientProfile.tsx) contains a secondary agreement card inside `Company Profile`; [Client terms](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientTerms.tsx) shows a `Review later` panel but keeps the button label `Skip This Login`; [Client agreements](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientAgreements.tsx) and [Portal search](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/PortalGlobalSearch.tsx) already establish `/client/agreements` as the legal destination; [portal interaction audit](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/visual-ui-audit.spec.ts), and [deep workflow hotfix audit](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts) all still codify `/client/agreements` as a named route with the heading `Client Agreement`.
- Why it matters: This is trust and compliance copy. A legal-remediation CTA should land in the legal workspace, not a profile screen, and the deferral button should state the actual consequence so client admins and finance users do not guess what will happen.
- Recommendation: Send agreement-remediation CTAs and blocked-state recovery copy to `/client/agreements` or `/client/terms`, not `Company Profile`. Replace `Skip This Login` with explicit session-scoped wording such as `Review later for this session`, subject to legal approval. Keep `Company Profile` focused on company settings instead of acting as the primary legal recovery destination.
- Acceptance criteria: Dashboard, quick actions, and any recovery card that asks a user to review the agreement point to `/client/agreements` or `/client/terms`; no visible control says `Skip This Login`; the deferral helper text and button both state that access continues only for the current session.

### P1 - Split client-acquisition prospects from Bum recruiting prospects
- Evidence: [Signup intent dialog](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/SignupIntentDialog.tsx) still asks users to choose `Client Prospect` or `Bum Prospect`; [Admin contact submissions](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx) still says `qualify Bum Prospects`, `Create a hidden Bum Prospect profile`, and `Create Bum Prospect`; [Bum prospects](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumProspects.tsx) still uses the generic page title `Prospects`, the toast `Prospect saved`, and the CTA `Save prospect`; [Bum layout](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/BumLayout.tsx), [Portal search](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/PortalGlobalSearch.tsx), [portal interaction audit](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/visual-ui-audit.spec.ts), and [deep workflow hotfix audit](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts) still all use the generic page name `Prospects` for `/bum/prospects`.
- Why it matters: `Prospect` currently names two different objects: a company the Bum wants as a client and a person who wants to become a Bum. That overlap weakens support, onboarding, and admin triage language because the same noun changes meaning by route and audience.
- Recommendation: Reserve `Client Prospect` for companies and related contact-intake workflows. Rename the recruiting-side person object to `Bum Candidate` or `Bum Applicant`, then update the admin CTA/helper copy accordingly. On the Bum-side company workflow, replace generic labels with object-specific copy such as `Client Prospects`, `Save client prospect`, and `Client prospect saved`.
- Acceptance criteria: Visible company-acquisition workflows consistently use `Client Prospect`; visible recruiting workflows no longer use `Bum Prospect` if `Bum Candidate` or another approved recruiting noun is adopted; the Bum prospects page, toast copy, admin intake actions, signup intent dialog, and search metadata all use the chosen terms consistently.

### P2 - Keep Bum intro-request language explicit in the client handoff table
- Evidence: [Client requests](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientRequests.tsx) correctly titles the second section `Bum Intro Requests`, but its helper copy shortens that same object to `Intro Requests your team sent from the Bum Directory`; [business access rules](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/business-access-rules.md) still uses `Claims` and `Intro Requests` as adjacent internal concepts, which increases the value of keeping the public UI explicit.
- Why it matters: The June 4 copy pass fixed the larger `Customer Leads` and `Claims` drift. Reintroducing the shorter `Intro Requests` label inside the same section weakens that cleanup and makes support explanations less precise.
- Recommendation: Keep the full noun family in helper copy, for example `Bum Intro Requests your team sent from the Bum Directory...`, or rename the whole section to a shorter approved term in one pass instead of mixing long and short versions.
- Acceptance criteria: The section heading and its supporting sentence use the same noun family; no public helper text shortens `Bum Intro Requests` to `Intro Requests` unless the entire section is renamed together.

## Company Glossary

### Client Agreement
- Definition: The current standard legal agreement a client user must review and accept to continue in the platform.
- Use when: Document titles, acceptance prompts, agreement review actions, and legal support instructions.
- Avoid/conflicts: Using `Client Agreement` as both the workspace name and the individual contract name when the page also contains FAQ and agreement records.
- Evidence: [Client terms](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientTerms.tsx), [Client agreements](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientAgreements.tsx), [Client profile](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientProfile.tsx).

### Agreement Records
- Definition: Custom company-specific agreement files or historical agreement records associated with a client company.
- Use when: A list, table, or download area contains more than the current standard agreement.
- Avoid/conflicts: Treating `agreement records` as the same thing as the current `Client Agreement`.
- Evidence: [Client agreements](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientAgreements.tsx), [Client dashboard](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx).

### Client Prospect
- Definition: A company that may become a Trusted Bums client, usually paired with a key contact and invite owner.
- Use when: Bum prospecting, customer-lead routing to a not-yet-client company, admin company-intake review, and related search metadata.
- Avoid/conflicts: Using `prospect` alone where it could also mean a person who may become a Bum.
- Evidence: [Bum prospects](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumProspects.tsx), [Bum customer leads](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Portal search](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/PortalGlobalSearch.tsx).

### Bum Prospect
- Definition: Current product term for a person who may join the marketplace as a Bum.
- Use when: Only where current code has not yet been renamed and the recruiting meaning must be preserved.
- Avoid/conflicts: Reusing `prospect` without a recruiting qualifier, or using `Bum Prospect` in company-acquisition workflows.
- Evidence: [Signup intent dialog](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/SignupIntentDialog.tsx), [Admin contact submissions](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [Index](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/Index.tsx).

### Customer Lead
- Definition: Buyer demand a Bum submits when they know a real customer need and want Trusted Bums to route that demand to the right client or client prospect.
- Use when: Bum-side lead submission, client review queues, admin triage, dashboards, and reporting.
- Avoid/conflicts: `Reverse opportunity` or generic `request` as the primary user-facing noun for the same object.
- Evidence: [Client requests](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientRequests.tsx), [Bum reverse opportunities](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Client layout](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/ClientLayout.tsx).

### Bum Intro Request
- Definition: A request a client team sends to a specific Bum asking for an introduction into a target company or contact.
- Use when: Client request history, directory-driven intro asks, handoff tables, and support explanations.
- Avoid/conflicts: Shortening it to `Intro Request` in one place while keeping `Bum Intro Request` elsewhere in the same workflow.
- Evidence: [Client requests](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientRequests.tsx), [business access rules](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/business-access-rules.md).

## Disambiguation Queue

### Client Agreement workspace vs current agreement document
- Confusion risk: `/client/agreements` currently acts like a workspace with FAQ and records, but visible labels still center the singular document noun `Client Agreement`.
- Affected audiences: Client admins, client finance users, support, legal.
- Recommended direction: Decide whether the route should stay a workspace called `Agreements` or `Client Agreements`, while reserving `Client Agreement` for the current contract itself.
- Evidence needed: Legal-approved naming for the workspace, current agreement, acceptance history, and deferral flow.

### Bum Prospect vs Bum Candidate
- Confusion risk: `Prospect` already means a possible client company elsewhere in the product.
- Affected audiences: Admins, recruiting, Bums, support, growth.
- Recommended direction: Test a recruiting-specific noun such as `Bum Candidate`, `Bum Applicant`, or another approved term that does not collide with `Client Prospect`.
- Evidence needed: Recruiting copy, onboarding language, founder scripts, and support macros that describe Bum acquisition.

## Watchlist

- [Client agreements](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientAgreements.tsx), [Client layout](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/ClientLayout.tsx), [Portal search](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/PortalGlobalSearch.tsx), and the Playwright route inventories currently all use `Client Agreement` for `/client/agreements` even though the page description says it contains the current agreement, FAQ, and agreement records. If this route is renamed to a workspace noun such as `Client Agreements`, search metadata and route assertions will need to ship in the same change.
- [Bum prospects](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumProspects.tsx) still uses the generic success and save language `Prospect saved` and `Save prospect`, which is low-risk but keeps the object-name ambiguity visible until the prospect split is resolved.

## Access Requests And Evidence Gaps

Material missing access, customer language, sales/support/legal/brand sources, or other evidence needed for a stronger content review. Mirror durable requests in [docs/consultant-access-needs.md](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/consultant-access-needs.md).

- Source-of-truth language artifacts are still missing: legal-approved terminology, onboarding emails, support macros, sales collateral, recruiting copy, customer-language research, and CRM stage naming are not available in the repo or current connectors.
- Fresh rendered copy evidence is still blocked on this runner: `curl -I -L --max-time 20 https://trustedbums.com` timed out during DNS resolution on 2026-06-06, so this run remains source-backed plus route-inventory-backed rather than browser-validated.
- There was no automation memory file at the start of this run, so this pass used [Codex edit log](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/codex-edit-log.md) and the current backlog as continuity sources before creating automation memory.

## Agent Inputs

- Date of run: 2026-06-06
- Files, routes, tests, internet sources, and commands reviewed: [consultant team rules](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/consultant-team-rules.md), [consultant access needs](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/consultant-access-needs.md), prior [content copyeditor backlog](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/content-copyeditor-backlog.md), [Codex edit log](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/codex-edit-log.md), [business access rules](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/business-access-rules.md), [App routes](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/App.tsx), [Client layout](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/ClientLayout.tsx), [Bum layout](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/BumLayout.tsx), [Portal search](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/PortalGlobalSearch.tsx), [Client access route](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/ClientAccessRoute.tsx), [Client terms gate](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/ClientTermsGate.tsx), [Signup intent dialog](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/SignupIntentDialog.tsx), [Client dashboard](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx), [Client profile](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientProfile.tsx), [Client agreements](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientAgreements.tsx), [Client terms](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientTerms.tsx), [Client requests](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientRequests.tsx), [Bum customer leads](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Bum prospects](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumProspects.tsx), [Admin contact submissions](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [portal interaction audit](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/visual-ui-audit.spec.ts), [deep workflow hotfix audit](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), `git status --short`, `git log --since='7 days ago' --name-only --pretty=format:'COMMIT %h %cs %s' -- .`, targeted `rg` terminology scans, `set -a; [ -f .env.qa ] && source .env.qa; set +a; pnpm run qa:env`, `pnpm run lint`, `gh run list --repo pidpoddev/trustedbums --limit 10`, `curl -I -L --max-time 20 https://trustedbums.com`; internet sources: [W3C consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html), [W3C visible labels via H44](https://www.w3.org/WAI/WCAG22/Techniques/html/H44), [Digital.gov writing for understanding](https://digital.gov/guides/plain-language/writing), [Digital.gov familiar terms](https://digital.gov/guides/writing-understanding/familiar-terms), [Digital.gov short and simple](https://digital.gov/guides/plain-language/principles/short-simple), [GOV.UK button guidance](https://design-system.service.gov.uk/components/button/).
- Checks that could not run and why: No fresh deployed screenshots or rendered route assertions were gathered because this runner still could not resolve `trustedbums.com` on 2026-06-06. `pnpm run lint` completed with pre-existing React hook dependency warnings in [Admin commission plans](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/admin/AdminCommissionPlans.tsx), [Admin payments](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/admin/AdminPayments.tsx), [Admin payouts](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/admin/AdminPayouts.tsx), [Client payments](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientPayments.tsx), and [Client targets](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientTargets.tsx), but no lint errors blocked the content review.
