# Trusted Bums Content Copyeditor Backlog

_Last updated: 2026-06-03 by Codex daily content copyeditor automation._

## Executive Read

Three terminology problems still deserve active backlog space, and all three remain current in both source and route-test inventories. First, the legal acceptance flow still mixes workspace, document, status, and deferral language: `Agreements`, `Partner Terms`, `Terms & Legal Agreements`, `Current Partner Terms`, `acceptance records`, and `Skip This Login`. Second, the demand and intro model still splits the same user mental model across `Requests`, `Inbound Requests`, `Customer Leads`, `Intro Requests`, `claims`, and `Prospect-converted`. Third, admin and Bum prospecting workflows still ship awkward recruiting language such as `future Bums`, `prospective Bum`, and `Add prospected client`.

Current guidance still supports tightening this. W3C’s current [consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification) and [labels or instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions) guidance both reinforce keeping repeated functions labeled consistently. W3C’s [clear visible labels pattern](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p06-clear-labels/) and Digital.gov’s [plain-language writing guidance](https://digital.gov/guides/plain-language/writing) favor familiar, explicit words. USWDS and GOV.UK button guidance also continue to prefer short, action-first labels that make the next step obvious: [USWDS buttons](https://designsystem.digital.gov/components/button), [GOV.UK buttons](https://design-system.service.gov.uk/components/button/).

## Active Recommendations

### P1 - Unify legal workspace, terms, and deferral copy
- Evidence: [Client dashboard](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx) still uses `Review partner terms`, routes users to `/client/profile`, and links to `View acceptance records`; [Client agreements](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientAgreements.tsx) uses `Agreements`, `Review partner terms, FAQ, and your current acceptance status`, `Current Partner Terms`, `Loading agreement records...`, and `Open terms screen`; [Client terms](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientTerms.tsx) still shows `Trusted Bums Terms & Legal Agreements`, `Partner terms accepted`, `Unable to load partner terms`, `View Partner Terms`, and `Skip This Login`; [Client terms gate](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/ClientTermsGate.tsx) still says `Checking partner terms...` and `Unable to check partner terms`; [Client layout](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/ClientLayout.tsx) keeps `Agreements` in nav; route inventories still treat `/client/agreements` as a separate `Agreements` page in [tests/e2e/portal-interaction-audit.spec.ts](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/portal-interaction-audit.spec.ts) and [tests/e2e/visual-ui-audit.spec.ts](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/visual-ui-audit.spec.ts).
- Why it matters: This is trust-critical compliance copy. Client admins and finance users should not have to infer whether they are opening a workspace, reviewing the current contract, seeing acceptance history, or using a temporary deferral.
- Recommendation: Keep `Agreements` as the workspace/route label, use `Current terms` or `Current agreement terms` for the active contract card, and reserve `acceptance history` only for a dedicated audit view. Replace `Review partner terms` with a CTA that matches the destination, such as `Review agreements` or `Review current terms`. Replace `Skip This Login` with explicit session language such as `Review later for this session` if legal approves deferral.
- Acceptance criteria: Dashboard, nav, terms gate, agreements page, and terms page share one noun system; the primary CTA names the destination correctly; `acceptance records` disappears unless the destination becomes an actual history screen; deferral copy explains that access continues only for the current session.

### P1 - Collapse overlapping request, lead, and claim labels into one visible object model
- Evidence: [Client layout](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/ClientLayout.tsx) labels `/client/requests` as `Requests` while [Client requests](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientRequests.tsx) titles the page `Inbound Requests`, describes them as `Demand-sourced opportunities`, uses a `Prospect-converted` badge, and separately lists `Bum Intro Requests`; [Client dashboard](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx) shows `Inbound Requests` plus the CTA `Review inbound requests`; [Bum reverse opportunities](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumReverseOpportunities.tsx) uses `Customer Leads`; [Bum claims](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumClaims.tsx) titles the page `Intro Requests` but still says `Loading your claims...`, `Unable to load claims right now.`, and `No claims yet`; [Bum layout](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/BumLayout.tsx) and [Portal search](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/PortalGlobalSearch.tsx) still index `/bum/claims` as `Intro Requests`; route tests still assert `Inbound Requests`, `Customer Leads`, and `Intro Requests` as separate headings in [tests/e2e/portal-interaction-audit.spec.ts](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [tests/e2e/visual-ui-audit.spec.ts](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/visual-ui-audit.spec.ts), and [tests/e2e/deep-workflow-hotfix-audit.spec.ts](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts).
- Why it matters: This is a repeated-function naming problem, not just a wording preference. Users have to translate between nav labels, page titles, helper copy, badges, and empty states to understand whether they are looking at demand intake, client-to-Bum intro asks, or claim rights on an opportunity.
- Recommendation: Use one visible primary label per object family, then explain origin in helper copy. Current source supports `Customer Leads` for Bum-submitted buyer demand and `Bum Intro Requests` for client-to-Bum asks. For `/bum/claims`, either restore `Claims` everywhere visible or complete a full visible rename to `Intro Requests`, including loading, empty, toast, search, and action copy. Remove `Prospect-converted` from visible badges and replace it with a state users can parse without CRM context.
- Acceptance criteria: `/client/requests` no longer mixes `Requests`, `Inbound Requests`, `Demand-sourced opportunities`, and `Prospect-converted`; `/bum/claims` uses one noun family in the heading, empty state, status/help copy, search, and related opportunity actions; route tests assert the chosen canonical names.

### P2 - Replace awkward recruiting and prospecting labels in admin intake and Bum workflows
- Evidence: [Admin contact submissions](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx) still says `Review homepage leads, convert client requests into targets, and qualify future Bums`, `Create a hidden prospective Bum profile`, `Create Prospective Bum`, and `Mark Bum Invited`; [Bum prospects](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumProspects.tsx) still uses `Add prospected client`, `Prospect saved`, and `Your prospect and key contact were added for admin review`; [Portal search](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/PortalGlobalSearch.tsx) still indexes the prospects page subtitle as `Prospected clients and contacts`.
- Why it matters: These are operator-facing but still trust-relevant. Ungrammatical or provisional recruiting language makes the workflow sound improvised and weakens confidence in a product that already asks users to adopt a branded role term.
- Recommendation: Switch to operational nouns: `Bum candidate` or `Potential Bum` for recruiting review, `Create Bum candidate`, `Mark invite sent`, `Add client prospect`, and `Client prospect saved` or `Prospect added` for Bum prospecting. Keep `Bum` where the brand requires it, but pair it with a concrete workflow noun.
- Acceptance criteria: No visible CTA or helper copy uses `prospected`; admin intake actions distinguish candidate creation from invite tracking; recruiting terminology is consistent across admin panels, Bum prospecting, and global search metadata.

## Company Glossary

### Agreements
- Definition: Client-facing workspace for current legal terms, custom agreements, and acceptance status.
- Use when: Client navigation, page titles, support instructions, and any CTA that sends a client to the legal workspace.
- Avoid/conflicts: Treating `Agreements`, `Partner Terms`, `Terms & Legal Agreements`, and `acceptance records` as separate destinations when they are parts of one flow.
- Evidence: [Client layout](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/ClientLayout.tsx), [Client agreements](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientAgreements.tsx), [Client terms](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientTerms.tsx).

### Bum
- Definition: Trusted Bums network participant who brings relationships, introductions, buyer demand, prospects, or opportunity claims into the marketplace.
- Use when: Role labels, Bum-facing navigation, Bum agreement copy, and approved brand storytelling.
- Avoid/conflicts: Swapping between `Bum`, `partner`, `seller`, `member`, or `representative` for the same role inside one workflow.
- Evidence: [Bum layout](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/BumLayout.tsx), [partner terms data](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/data/partnerTerms.ts), [company-wide rules](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/company-wide-rules.md).

### Bum Intro Request
- Definition: Request from a client team to a specific Bum asking for an introduction into a target company or contact.
- Use when: Client request history, directory-driven intro asks, admin handoff views, and support explanations.
- Avoid/conflicts: Using it for Bum-submitted buyer demand or as the public label for claims unless the whole claim workflow is renamed.
- Evidence: [Client requests](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientRequests.tsx), [business access rules](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/business-access-rules.md), [product ops backlog](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/product-ops-workflow-backlog.md).

### Claim
- Definition: Current product and legal term for a Bum asserting participation rights on an opportunity and its resulting commission path.
- Use when: Data model, admin/legal review, payments, disputes, and visible UI only if the product keeps `Claim` as the public noun.
- Avoid/conflicts: Titling the route family `Intro Requests` while loading, empty, finance, and action copy still say `claim`.
- Evidence: [Bum claims](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumClaims.tsx), [Bum opportunities](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumOpportunities.tsx), [Admin credits](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/admin/AdminCredits.tsx).

### Client Prospect
- Definition: Company a Bum believes should become a Trusted Bums client, usually paired with a key contact and invite owner.
- Use when: Bum prospecting, admin company-intake review, and related search or queue labels.
- Avoid/conflicts: `Prospected client`, which is grammatically awkward, and `prospective Bum`, which refers to recruiting instead of company acquisition.
- Evidence: [Bum prospects](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumProspects.tsx), [Portal search](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/PortalGlobalSearch.tsx).

### Customer Lead
- Definition: Buyer demand a Bum submits when they know a real customer need and want Trusted Bums to route that demand to the right client or prospective client.
- Use when: Bum-side lead submission, client review queues, admin triage, and related reporting.
- Avoid/conflicts: `Reverse opportunity`, `Inbound Request`, and `Demand-sourced opportunity` as competing primary visible labels for the same object.
- Evidence: [Bum reverse opportunities](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Client requests](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientRequests.tsx), [Client dashboard](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx).

## Disambiguation Queue

### Agreements vs terms vs acceptance history
- Confusion risk: The legal flow still uses route, document, status, and deferral labels interchangeably.
- Affected audiences: Client admins, client finance users, Bums, support, legal.
- Recommended direction: Keep `Agreements` for the workspace, `Current terms` for the active contract, and `acceptance history` only for a dedicated audit view.
- Evidence needed: Legal-approved naming and any support or onboarding language for acceptance and deferral.

### Claim vs Intro Request
- Confusion risk: The Bum-facing route family says `Intro Requests`, but the object still behaves like `Claim` across empty states, action labels, and finance/legal surfaces.
- Affected audiences: Bums, client reviewers, admins, finance, support.
- Recommended direction: Decide whether `Claim` stays public or becomes an internal/legal term behind a full visible rename.
- Evidence needed: Legal and product-owner confirmation on the public-facing noun plus any customer-tested explanation of the workflow.

### Client prospect vs Bum candidate
- Confusion risk: `Prospect` currently points to both a possible future client and a possible future Bum.
- Affected audiences: Bums, admins, recruiting, support, partner ops.
- Recommended direction: Reserve `client prospect` for company acquisition and use `Bum candidate` or `Potential Bum` for recruiting review.
- Evidence needed: Recruiting copy, onboarding language, and internal SOP terminology.

## Watchlist

- [Client dashboard](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx) still routes terms-remediation CTAs to `Company Profile`, which may be operationally correct but weakens label-to-destination clarity for a legal task.
- [Client terms](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientTerms.tsx) still uses `Open terms screen` on the agreements page and `View Partner Terms` on the terms page, which keeps the route/document distinction muddy.
- [Portal search](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/PortalGlobalSearch.tsx) still indexes `/client/requests` as `Requests` while the page heading remains `Inbound Requests`.

## Access Requests And Evidence Gaps

Material missing access, customer language, sales/support/legal/brand sources, or other evidence needed for a stronger content review. Mirror durable requests in [docs/consultant-access-needs.md](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/consultant-access-needs.md).

- Source-of-truth language artifacts are still missing: legal-approved terminology, sales collateral, onboarding emails, support macros, customer-language research, CRM stage naming, and recruiting copy for Bum acquisition are not available in the repo or current connectors.
- QA env preflight succeeded in this run after sourcing `.env.qa`, but fresh rendered portal copy evidence still failed because `pnpm exec playwright test tests/e2e/portal-interaction-audit.spec.ts --project=chromium --reporter=line` hit `page.goto: net::ERR_NAME_NOT_RESOLVED` at `https://trustedbums.com/` before route-level copy assertions.
- No fresh screenshots were generated in this run, so final recommendations remain grounded in current source, route/test inventories, current external guidance, and the failed deployed navigation audit rather than new rendered captures.

## Agent Inputs

- Date of run: 2026-06-03
- Files, tests, routes, internet sources, access sources, and commands reviewed: [consultant team rules](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/consultant-team-rules.md), [consultant access needs](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/consultant-access-needs.md), prior [content copyeditor backlog](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/content-copyeditor-backlog.md), [company-wide rules](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/company-wide-rules.md), [App routes](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/App.tsx), [Client layout](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/ClientLayout.tsx), [Bum layout](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/BumLayout.tsx), [Client dashboard](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx), [Client agreements](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientAgreements.tsx), [Client terms](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientTerms.tsx), [Client terms gate](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/ClientTermsGate.tsx), [Client requests](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientRequests.tsx), [Bum customer leads](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [Bum claims](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumClaims.tsx), [Bum prospects](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumProspects.tsx), [admin contact submissions](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [Portal search](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/PortalGlobalSearch.tsx), [package.json](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/package.json), [portal interaction audit](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [visual UI audit](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/visual-ui-audit.spec.ts), [deep workflow hotfix audit](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/deep-workflow-hotfix-audit.spec.ts), `git status --short`, `git log --since='10 days ago' --name-only --pretty=format:'COMMIT %h %ad %s' --date=short`, targeted `rg` terminology scans, `set -a; source .env.qa; set +a; pnpm run qa:env`, `pnpm run lint`, `set -a; source .env.qa; set +a; pnpm exec playwright test tests/e2e/portal-interaction-audit.spec.ts --project=chromium --reporter=line`; internet sources: [W3C clear visible labels](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p06-clear-labels/), [W3C labels or instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions), [W3C consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification), [Digital.gov writing guidance](https://digital.gov/guides/plain-language/writing), [USWDS button guidance](https://designsystem.digital.gov/components/button), [GOV.UK button guidance](https://design-system.service.gov.uk/components/button/).
- Checks that could not run and why: Fresh rendered portal copy assertions did not complete because the deployed Playwright audit failed at first navigation with `net::ERR_NAME_NOT_RESOLVED` for `https://trustedbums.com/`. `pnpm run lint` completed with existing React hook dependency warnings in admin/client payments and targets screens, but no lint errors directly affected the copy findings.
