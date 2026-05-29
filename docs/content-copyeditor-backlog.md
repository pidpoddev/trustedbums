# Trusted Bums Content Copyeditor Backlog

_Last updated: 2026-05-28 by Codex daily content copyeditor automation._

## Executive Read

This run removed the now-stale `connector` naming drift as the main product-wide issue. The highest-confidence copy risks are now: the client legal journey still points users to `Company Profile`, `Agreements`, and `terms` as if they are different tasks; `/client/requests` now combines two different request objects without a clear naming system; and the client team invite flow still uses generic role labels (`Admin`, `Finance`, `Member`) even though the product enforces more specific client access roles.

## Active Recommendations

### P1 - Make agreements the one clear legal workspace
- Evidence: Client dashboard next actions still send both standard and finance users to `/client/profile` for terms review in [ClientDashboard.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx). The dedicated legal page at `/client/agreements` is titled `Agreements`, but its primary CTA still says `Open terms screen` and its summary card says `Current Partner Terms` in [ClientAgreements.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientAgreements.tsx). The profile page separately presents `Review and accept terms` and `View agreement records` inside `Company Profile` in [ClientProfile.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientProfile.tsx).
- Why it matters: Current guidance still favors descriptive task labels and plain-language disclosures that are easy to notice and hard to miss. Right now the same legal action is split across profile, agreements, and terms language, which makes required acceptance look optional or administrative.
- Recommendation: Treat `/client/agreements` as the canonical legal workspace, keep `/client/terms` as the acceptance flow reached from that workspace, and stop telling users to accept terms from `Company Profile`. Replace generic CTA copy like `Open terms screen` with action-first labels such as `Review current terms`.
- Acceptance criteria: Dashboard prompts, nav/search labels, and profile cards direct legal review to `Agreements`; `Company Profile` no longer instructs users to complete acceptance there; the primary CTA language consistently uses `Review current terms` or `Review and accept terms`.

### P1 - Separate customer leads, Bum intro requests, and Bum responses into distinct label families
- Evidence: `/client/requests` is still headed `Inbound Requests` and described as `Demand-sourced opportunities that Bums have submitted against your company`, while the empty state now says `No Bum-submitted customer leads...` in [ClientRequests.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientRequests.tsx). The same route now also contains a second section titled `Bum Intro Requests` for requests the client initiated from the directory in [ClientRequests.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientRequests.tsx). The client dashboard still uses adjacent next actions and stats for `Bum responses` and `Inbound Requests` in [ClientDashboard.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx). Client access rules already distinguish `Bum intro requests` from other workflows in [business-access-rules.md](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/business-access-rules.md), and Bum-facing creation now calls the demand object `Customer Leads` in [BumReverseOpportunities.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumReverseOpportunities.tsx).
- Why it matters: The product now exposes three similar but different handoff objects: Bum-submitted demand, client-submitted intro requests, and Bum responses to target accounts. Reusing `requests` across all three raises comprehension risk for client admins, support, and finance reviewers who need to know who initiated the workflow and what action is next.
- Recommendation: Reserve one visible name per object family. A workable pattern is `Customer leads` for Bum-submitted demand, `Bum intro requests` for client-initiated directory requests, and `Bum responses` for replies to target-account opportunities. Keep those names stable in page headings, stat cards, table headings, empty states, and search metadata.
- Acceptance criteria: `/client/requests` no longer mixes `Inbound Requests`, `customer leads`, and `Bum Intro Requests` without explanation; the dashboard, route headings, tables, and status/help copy use one stable label family per object; no surface implies that customer leads, intro requests, and responses are synonyms.

### P2 - Use explicit client access role names in invites and team management
- Evidence: The client team role picker still labels roles as `Admin`, `Finance`, and `Member` in [ClientTeam.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientTeam.tsx), while the broader product and business rules distinguish `CLIENT_ADMIN`, `CLIENT_FINANCE`, and `CLIENT_MEMBER` in [business-access-rules.md](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/business-access-rules.md) and route gating in [App.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/App.tsx).
- Why it matters: Generic role labels make it harder for client admins to understand what authority they are granting, especially in B2B account-management flows where `Admin` could be read as Trusted Bums staff access rather than company-level access inside the client workspace.
- Recommendation: Rename the visible role options to `Client admin`, `Client finance`, and `Client member`, and keep the helper copy focused on permissions within the client workspace.
- Acceptance criteria: Invite forms, member tables, pending invite badges, and any related emails or help text use `Client admin`, `Client finance`, and `Client member`; no client-facing role selector uses the bare labels `Admin`, `Finance`, or `Member` without the `Client` qualifier.

## Company Glossary

### Trusted Bum
- Definition: The branded marketplace participant who provides introductions, relationship context, buyer access, or demand signals for clients.
- Use when: Directory labels, profiles, Bum-facing portal copy, and client-facing marketplace language.
- Avoid/conflicts: Avoid reviving `connector` or `relationship seller` in product copy unless a sales or legal source explicitly requires it.
- Evidence: [ClientBums.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientBums.tsx), [BumProfile.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumProfile.tsx), [partnerTerms.ts](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/data/partnerTerms.ts)

### Customer lead
- Definition: Buyer demand a Bum submits to a client or prospective client because the Bum knows of a real customer need.
- Use when: Bum demand-submission flow, client review queue for Bum-submitted demand, related reports, and search metadata.
- Avoid/conflicts: Do not use as a synonym for `Bum intro request` or `Bum response`.
- Evidence: [BumReverseOpportunities.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [BumDashboard.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumDashboard.tsx), [ClientReports.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientReports.tsx)

### Bum intro request
- Definition: A client-initiated request asking a specific Bum for help with a target account or contact.
- Use when: Bum Directory outreach history, client-to-Bum handoff tracking, and any future admin or Bum queue for this object.
- Avoid/conflicts: Do not collapse into `customer lead`, `inbound request`, or `claim`.
- Evidence: [ClientBums.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientBums.tsx), [ClientRequests.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientRequests.tsx), [portalApi.ts](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/lib/portalApi.ts)

### Bum response
- Definition: A Bum's response to a client-owned target account or opportunity prompt.
- Use when: Target-account workflows, approvals, response tabs, and client dashboard tasks tied to reviewing Bum replies.
- Avoid/conflicts: Do not use for customer leads or intro requests, because those have different initiators and queue logic.
- Evidence: [ClientDashboard.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx), [portalApi.ts](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/lib/portalApi.ts)

### Client admin
- Definition: A client-company user with full workspace and team-management authority inside that company's portal.
- Use when: Invite flows, team-management UI, access help text, and any customer-facing role explanations.
- Avoid/conflicts: Avoid the bare label `Admin` in client-facing role pickers because it can imply Trusted Bums internal staff.
- Evidence: [ClientTeam.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientTeam.tsx), [App.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/App.tsx), [business-access-rules.md](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/business-access-rules.md)

## Disambiguation Queue

### Partner terms vs client agreement vs bum agreement
- Confusion risk: Legal surfaces now use `Partner Terms`, `Current Partner Terms`, `Bum Agreement`, and `Terms & Legal Agreements`, which makes it unclear whether users are seeing one contract family or several distinct legal documents.
- Affected audiences: Client admins, client finance users, Bums, support, legal reviewers.
- Recommended direction: Decide whether the umbrella noun should be `Agreements`, `Terms`, or `Partner Terms`, then standardize the page titles and card labels under that system.
- Evidence needed: Legal-approved terminology and any customer-facing onboarding or support language that describes where users review or accept these documents.

### Prospect client vs client vs customer
- Confusion risk: The Bum demand flow still uses `prospect client`, while the rest of the product distinguishes `client` from `customer`.
- Affected audiences: Bums, client admins, support, sales.
- Recommended direction: Validate whether `prospect client` is a business-critical term; if it stays, add helper copy that contrasts it with `client` and `customer`.
- Evidence needed: Sales collateral, CRM stage names, onboarding docs, and support macros that explain this marketplace handoff in business-approved language.

## Watchlist

- `Prospect-converted` still appears as a status badge on `/client/requests` in [ClientRequests.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientRequests.tsx). It reads like internal workflow shorthand and should be folded into the request-taxonomy cleanup.
- The Bum earnings empty state still says payouts appear after `Admin allocates your share` in [BumEarnings.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumEarnings.tsx). Keep it off the active list for now, but update it if the finance copy pass touches payouts.
- The admin shell still uses the short label `Admin` in [AdminLayout.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/AdminLayout.tsx). This is acceptable for the internal admin workspace unless broader role-naming guidance says otherwise.

## Access Requests And Evidence Gaps

Material missing access, customer language, sales/support/legal/brand sources, or other evidence needed for a stronger content review. Mirror durable requests in [consultant-access-needs.md](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/consultant-access-needs.md).

- Approved product language sources are still missing. This repo still does not include sales collateral, support macros, onboarding emails or docs, brand voice guidance, customer-language research, or legal-approved terminology, so glossary and disambiguation decisions remain product-code-backed rather than business-approved.
- Authenticated browser validation remains blocked. The shell did not have QA variables exported at run start, `node scripts/verify-qa-env.mjs` is not present, and a current-session `curl -I` to the sourced `QA_BASE_URL` timed out on DNS resolution on 2026-05-28, so this run could not produce live portal screenshots or authenticated copy validation.

## Agent Inputs

- Date of run: 2026-05-28
- Files, tests, routes, internet sources, access sources, and commands reviewed: [consultant-team-rules.md](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/consultant-team-rules.md), [consultant-access-needs.md](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/consultant-access-needs.md), prior [content-copyeditor-backlog.md](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/content-copyeditor-backlog.md), [App.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/App.tsx), [ClientDashboard.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx), [ClientAgreements.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientAgreements.tsx), [ClientProfile.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientProfile.tsx), [ClientRequests.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientRequests.tsx), [ClientTeam.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientTeam.tsx), [ClientBums.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientBums.tsx), [ClientReports.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientReports.tsx), [BumReverseOpportunities.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumReverseOpportunities.tsx), [BumDashboard.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumDashboard.tsx), [BumClaims.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumClaims.tsx), [BumEarnings.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumEarnings.tsx), [PortalGlobalSearch.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/PortalGlobalSearch.tsx), [AdminLayout.tsx](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/layouts/AdminLayout.tsx), [partnerTerms.ts](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/data/partnerTerms.ts), [legalDocuments.ts](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/data/legalDocuments.ts), [business-access-rules.md](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/business-access-rules.md), [portal-interaction-audit.spec.ts](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/portal-interaction-audit.spec.ts), [visual-ui-audit.spec.ts](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/visual-ui-audit.spec.ts), `git status --short`, `git log -1 --stat`, targeted `git diff`, targeted `rg` terminology scans, `pnpm run lint`, `pnpm exec vitest run src/test/routeGuards.test.tsx src/test/paymentCommission.test.ts src/test/extensionApiContract.test.ts`, `node scripts/verify-qa-env.mjs`, `curl -I --max-time 15 $QA_BASE_URL`; internet sources: [Digital.gov links guidance](https://digital.gov/guides/plain-language/design/links), [GOV.UK writing for user interfaces](https://www.gov.uk/service-manual/design/writing-for-user-interfaces/), [W3C Understanding SC 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html), [FTC clear and conspicuous disclosure FAQ](https://www.ftc.gov/node/88176)
- Checks that could not run and why: No authenticated Playwright audit ran in this session because the current QA target remained unreachable after sourcing `.env.qa`; `curl` to `QA_BASE_URL` failed with `Resolving timed out after 15005 milliseconds`, so browser-based route validation and screenshots remain blocked.
