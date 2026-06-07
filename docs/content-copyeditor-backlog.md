# Trusted Bums Content Copyeditor Backlog

_Last updated: 2026-06-07 by Codex daily content copyeditor automation._

## Executive Read

The copy backlog is still narrow, but the remaining issues are real product-language problems, not cleanup noise. The highest-risk issue is still the client agreement recovery path: dashboard actions still route users to `Company Profile`, while the actual legal workspace is `/client/agreements`, and the deferral control on the terms page still uses `Skip This Login` even though the surrounding panel explains a session-scoped review-later state.

The second live issue is still prospect terminology drift, and the current repo shows it in more places than the prior backlog captured. `Client Prospect` is now the intended company-acquisition noun, but recruiting and public surfaces still use `Bum Prospect`, while the Bum-side company workflow still falls back to the generic page and action labels `Prospects`, `Save prospect`, and `Prospect saved`.

The remaining lower-severity issue is a consistency break inside the client request history table, where the section title says `Bum Intro Requests` but the helper sentence shortens the same object to `Intro Requests`.

Current external guidance still supports tightening this copy. W3C WCAG 2.2 says repeating functions should be identified consistently across pages. Digital.gov plain-language guidance still recommends familiar, consistent terms. GOV.UK’s current button guidance still says button text should describe the action it performs.

## Active Recommendations

### P1 - Route agreement recovery through the legal workspace and rename the deferral action
- Evidence: [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx) still sends both finance and non-finance `Review Client Agreement` actions to `/client/profile`; [Client profile](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx) still presents agreement recovery inside `Company Profile`; [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx) is the actual agreement workspace and already exposes `Review Client Agreement`; [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx) still pairs `Review later` helper copy with the button label `Skip This Login`; [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx) and the route inventories in [portal interaction audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), and [deep workflow hotfix audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts) still codify `/client/agreements` as a named route with the heading `Client Agreement`.
- Why it matters: This is trust and compliance copy. A user asked to resolve a legal blocker should land in the legal workspace, and the deferral control should state the real consequence instead of sounding like a generic dismiss action.
- Recommendation: Route dashboard agreement-recovery CTAs to `/client/agreements` or `/client/terms`, not `Company Profile`. Replace `Skip This Login` with explicit session-scoped wording such as `Review later for this session`, subject to legal approval. Keep `Company Profile` focused on company settings.
- Acceptance criteria: Agreement-recovery actions from blocked or stale-agreement states point to `/client/agreements` or `/client/terms`; no visible control says `Skip This Login`; the helper copy and button both explain that the deferral applies only to the current signed-in session.

### P1 - Separate company prospecting from Bum recruiting terminology
- Evidence: [Signup intent dialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx) still asks the user to choose `Client Prospect` or `Bum Prospect`; [Index](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx) still says `Apply as a Bum Prospect`; [Admin contact submissions](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx) still says `qualify Bum Prospects`, `Create a hidden Bum Prospect profile`, `Create Bum Prospect`, and toasts `Bum Prospect created`; [contact API escalation copy](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts) still writes `Bum Prospect from contact form` and `Created a Bum Prospect profile from this contact submission`; [Bum prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx) still titles the page `Prospects` and uses `Prospect saved` plus `Unable to save prospect`; [Bum layout](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/BumLayout.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), and the route inventories in [portal interaction audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), and [deep workflow hotfix audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts) still label `/bum/prospects` generically as `Prospects`.
- Why it matters: `Prospect` currently means both a company the Bum wants as a client and a person who wants to become a Bum. That collision makes onboarding, support, recruiting, and admin triage less predictable, and it weakens public trust because the homepage and portal do not describe the same object family the same way.
- Recommendation: Reserve `Client Prospect` for company-acquisition workflows. Rename the recruiting-side person object to `Bum Candidate`, `Bum Applicant`, or another approved recruiting noun, then update public CTA copy, signup intent copy, admin escalation copy, generated admin notes, and Bum-side company workflow labels in one pass. Also rename the Bum-side company page and actions to object-specific terms such as `Client Prospects`, `Save client prospect`, and `Client prospect saved`.
- Acceptance criteria: Company-acquisition workflows consistently use `Client Prospect`; recruiting flows no longer use `Bum Prospect` once an approved recruiting noun is chosen; the homepage, signup modal, admin intake actions, generated admin notes, Bum portal nav/page title, search metadata, and toast/error copy all use the chosen terms consistently.

### P2 - Keep Bum intro-request language explicit in the client request history section
- Evidence: [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx) titles the section `Bum Intro Requests`, but the helper line immediately below shortens the same object to `Intro Requests your team sent from the Bum Directory`; [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md) still keeps `Claims` and `Intro Requests` as adjacent internal concepts.
- Why it matters: The product already uses multiple request-like nouns. Shortening this one inside the same section weakens the glossary cleanup and increases the chance that users read it as a generic request table instead of a specific client-to-Bum handoff type.
- Recommendation: Keep the full object name in helper copy, for example `Bum Intro Requests your team sent from the Bum Directory...`, unless the whole section is deliberately renamed in one approved content pass.
- Acceptance criteria: The section title and helper sentence use the same noun family; no visible helper copy shortens `Bum Intro Requests` to `Intro Requests` unless the full section terminology changes together.

## Company Glossary

### Client Agreement
- Definition: The current standard legal agreement a client user must review and accept to continue in the platform.
- Use when: Document titles, acceptance prompts, agreement review actions, and legal support instructions.
- Avoid/conflicts: Using `Client Agreement` as both the workspace name and the individual contract name when the route also includes FAQ and agreement records.
- Evidence: [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx), [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), [Client profile](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx).

### Agreement records
- Definition: Custom company-specific agreement files or historical agreement records associated with a client company.
- Use when: A list, table, or download area contains more than the current standard agreement.
- Avoid/conflicts: Treating `agreement records` as the same thing as the current `Client Agreement`.
- Evidence: [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx).

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
- Avoid/conflicts: `Reverse opportunity` or generic `request` as the primary user-facing noun for the same object.
- Evidence: [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx), [Bum customer leads](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Client layout](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/ClientLayout.tsx).

### Bum Intro Request
- Definition: A request a client team sends to a specific Bum asking for an introduction into a target company or contact.
- Use when: Client request history, directory-driven intro asks, handoff tables, and support explanations.
- Avoid/conflicts: Shortening it to `Intro Request` in one place while keeping `Bum Intro Request` elsewhere in the same workflow.
- Evidence: [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx), [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md).

## Disambiguation Queue

### Client Agreement workspace vs current agreement document
- Confusion risk: `/client/agreements` behaves like a workspace with FAQ and records, but the route title still uses the singular document noun `Client Agreement`.
- Affected audiences: Client admins, client finance users, support, legal.
- Recommended direction: Decide whether the route should stay a workspace called `Client Agreements` or `Agreements`, while reserving `Client Agreement` for the current contract itself.
- Evidence needed: Legal-approved naming for the workspace, the current agreement, and the acceptance-history model.

### Bum Prospect vs Bum Candidate
- Confusion risk: `Prospect` already names a possible client company elsewhere in the product.
- Affected audiences: Public visitors, recruiting, admins, Bums, support, growth.
- Recommended direction: Adopt a recruiting-specific noun such as `Bum Candidate` or `Bum Applicant`, then update the homepage, signup intent, admin escalation, and recruiting-facing notes together.
- Evidence needed: Recruiting copy, onboarding language, founder scripts, and support macros that describe Bum acquisition.

## Watchlist

- [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), [Client layout](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/ClientLayout.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), and the Playwright route inventories still use `Client Agreement` for `/client/agreements` even though the page description says it contains the current agreement, FAQ, and agreement records. If that route is renamed to a workspace noun, search metadata and route assertions need to ship in the same change.
- [Bum reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReports.tsx) still uses the value label `Prospects`, which is probably correct as a metric shorthand today but should be rechecked after the Bum-side page is renamed to `Client Prospects`.

## Access Requests And Evidence Gaps

Material missing access, customer language, sales/support/legal/brand sources, or other evidence needed for a stronger content review. Mirror durable requests in [docs/consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md).

- Source-of-truth language artifacts are still missing: legal-approved terminology, onboarding emails, support macros, sales collateral, recruiting copy, customer-language research, and CRM stage naming are not available in the repo or current connectors.
- This run remained source-backed rather than browser-validated. `.env.qa` is absent in this checkout, no local preview was started because local testing is reserved for port `8080`, and the external DNS target check `curl -I -L --max-time 15 https://rcdl.tplinkdns.com` failed on 2026-06-07 with `curl: (60) SSL certificate problem: unable to get local issuer certificate`.

## Agent Inputs

- Date of run: 2026-06-07
- Files, tests, routes, internet sources, and commands reviewed: [copyeditor prompt](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/automation-prompts/trusted-bums-daily-content-copyeditor.toml), [consultant team rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-team-rules.md), [company-wide rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/company-wide-rules.md), [consultant access needs](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-access-needs.md), [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/business-access-rules.md), current [content copyeditor backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md), [Codex edit log](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md), `git status --short`, `git log --since='10 days ago' --name-only --pretty=format:'COMMIT %h %cs %s' -- src docs tests`, targeted `rg` terminology scans, [Client dashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [Client profile](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [Client agreements](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), [Client terms](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx), [Client requests](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientRequests.tsx), [Signup intent dialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx), [Admin contact submissions](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [contact API escalation copy](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts), [Bum prospects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), [Bum layout](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/BumLayout.tsx), [Bum reports](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumReports.tsx), [Index](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx), [Portal search](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/PortalGlobalSearch.tsx), [portal interaction audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), [deep workflow hotfix audit](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run lint`, `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts src/test/termsContractRules.test.ts`, `curl -I -L --max-time 15 https://rcdl.tplinkdns.com`; internet sources: [W3C consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html), [Digital.gov plain language guide](https://digital.gov/guides/plain-language), [Digital.gov writing for understanding](https://digital.gov/guides/plain-language/writing), [GOV.UK button guidance](https://design-system.service.gov.uk/components/button/).
- Checks that could not run and why: `pnpm` was not on `PATH`, so local checks used the bundled `corepack` path instead. `.env.qa` is not present in this checkout, so `qa:env` and authenticated browser checks were not attempted. No local preview was started because local testing is reserved for port `8080`, and this run did not have the QA env needed to make a preview useful. `pnpm run lint` completed with pre-existing React hook dependency warnings in [Admin commission plans](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminCommissionPlans.tsx), [Admin payments](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminPayments.tsx), [Admin payouts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminPayouts.tsx), [Client payments](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientPayments.tsx), and [Client targets](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTargets.tsx), but there were no lint errors. The external DNS target check against `https://rcdl.tplinkdns.com` failed TLS verification with `curl: (60) SSL certificate problem: unable to get local issuer certificate`, so this run has no fresh external rendered-copy proof.
