# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-12 by Codex daily QA/test engineer automation._

## Executive Read

Current `main` head `d360570` has fresh exact-head hosted release-QA proof on the lanes that already completed:

- GitHub `QA` run `27371736190` on `d360570`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27371736211` on `d360570`: passed.
- GitHub `E2E Smoke` run `27371773276` on `d360570`: passed `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.

Current-session local preflight is green once `.env.qa` is sourced:

- Raw `corepack pnpm run qa:env`: fails in a fresh shell because the QA variables are not exported by default.
- Sourced `corepack pnpm run qa:env`: passed.
- Sourced `corepack pnpm run qa:target-preflight`: passed against `https://trustedbums.com` with DNS, HTTPS, app shell, and Clerk checks green. Extension API stayed intentionally skipped through `QA_EXTENSION_API_EXPECTATION=skip`.
- Targeted exact-head client workflow regressions passed: `src/test/clientBumOriginatedOpportunities.test.ts`, `src/test/clientClaimsWorkflow.test.ts`, `src/test/clientOpportunityDelete.test.ts`, `src/test/clientOpportunityBulkTools.test.ts`, and `src/test/clientDashboardLayout.test.ts` (`10` tests total).

Current release truth is still incomplete. `.codex-review-decision.json` still records `GO` for `26fbdc7`, not current head `d360570`, and the exact-head standard `Visual UI Audit` run `27395701277` is currently red only because QA Harness Reliability reproduced a false-positive `404` body-text match on `/admin/scrum` and opened `TB-0092`. The clean exact-head product QA risk is therefore stale release proof plus the focused mutation and API-contract gaps below, not a newly confirmed admin product regression. The live open QA items from this run are:

- `[TB-0019]` stale exact-head Code Review remains the release-process gate.
- `[TB-0054]` hosted smoke artifacts still drop `qa-target-preflight` summaries on current head.
- `[TB-0086]` the manual Bum contact mutation still has no focused authenticated mutation proof or cleanup-backed regression.
- `[TB-0091]` the extension API still lacks the negative-path and abuse-control contract proof future partner or native clients would need.

## Active Recommendations

### P1 - [TB-0019] Refresh exact-head Code Review and re-establish a clean standard visual signal
- Evidence: Current `main` is `d360570`, but [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still points to `26fbdc7dc3493e87ffd309ccbfbe2416f44dfc5a` from `2026-06-11T17:21:43Z`. Hosted `QA` `27371736190`, deploy `27371736211`, and `E2E Smoke` `27371773276` all passed on `d360570`. QA Harness Reliability reproduced that exact-head `Visual UI Audit` run `27395701277` failed because [`tests/e2e/visual-ui-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts) treats any body text containing `404` as an error page, and `/admin/scrum` now contains legitimate tracker descriptions with `404`; that harness defect is tracked separately as `TB-0092`.
- Why it matters: Release proof for the clean head is still incomplete, but the missing exact-head standard visual pass should be routed to QA Harness Reliability, not misclassified as a new admin product bug.
- Recommendation: Refresh Code Review for `d360570`, let QA Harness Reliability clear `TB-0092`, and rerun standard exact-head visual QA after the harness fix.
- Acceptance criteria: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) matches `d360570`, and a successor exact-head standard visual run completes cleanly after the `TB-0092` harness fix.

### P1 - [TB-0054] Move `qa-target-preflight` artifacts out of Playwright's `test-results/` root
- Evidence: The downloaded success artifact tree for exact-head `E2E Smoke` run `27371773276` on `d360570` still contains only the smoke Playwright report plus the three deep Playwright report folders for the admin, client, and bum shards. It does not retain `summary.json` or `summary.txt` from `qa-target-preflight`, even though sourced local preflight passed in this session.
- Why it matters: QA and Release Verification still lose the exact DNS, HTTPS, app-shell, and Clerk preflight evidence on successful runs and on later route failures, which makes env-drift triage slower and less specific than it should be.
- Recommendation: Keep `TB-0054` open until [`scripts/qa-target-preflight.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/qa-target-preflight.mjs) writes outside Playwright's managed output tree and both smoke and deep workflows upload that directory explicitly.
- Acceptance criteria: a passing smoke run and a later-failing smoke or deep run both preserve downloadable `summary.json` and `summary.txt`.

### P1 - [TB-0086] Add focused regression coverage for manual Bum contact creation
- Evidence: [`src/pages/bum/BumContacts.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx) still exposes the real `Add contact` mutation flow with `createBumRepresentedContact`, optimistic cache updates, and the `MANUAL` source bucket introduced in `09aa045`. Exact-head hosted `QA` and `E2E Smoke` on `d360570` prove the route still loads, but this run still found no focused Vitest or Playwright proof that opens the dialog, validates required-name handling, creates a tagged manual contact, verifies the page update, and cleans the row back out.
- Why it matters: Route-load coverage is not mutation coverage. A new Bum-visible write path is still missing the focused proof that would catch validation, optimistic cache, cleanup, or visibility regressions before they reach Bums.
- Recommendation: Add one focused source or component contract for required-name handling plus optimistic cache behavior, and one authenticated browser mutation proof that creates a tagged manual contact, verifies it appears on the page, and removes it cleanly.
- Acceptance criteria: exact-head or successor QA proves `Add contact` opens and validates correctly, a tagged manual contact can be created and observed on the page, cleanup returns the fixture state to zero residue, and the row remains invisible to unrelated roles in the approved allow/deny matrix.

### P1 - [TB-0091] Add extension API negative-path and abuse-control contract coverage
- Evidence: Current extension API source and tests still prove basic versioning and some anonymous or authenticated smoke behavior, but this run did not add executable proof for invalid destination combinations, mismatched destination types, forged or wrong-issuer JWTs, cross-company denial, CORS allow/deny, idempotent retry, or direct Data API denial for `extension_page_captures`.
- Why it matters: The extension API is still the only current partner-style API contract. Native/mobile or future partner work should not depend on it until its error, auth, idempotency, and abuse-control behavior is proven by tests instead of only documented or source-reviewed.
- Recommendation: Add focused unit or source tests and hosted smoke coverage for invalid request combinations, stable error envelope, idempotent retry, CORS allow/deny, forged or wrong-issuer token rejection, cross-company denial, and direct table allow/deny behavior. Pair the QA work with Security's rate-limit or equivalent abuse-control implementation.
- Acceptance criteria: the extension API has passing negative-path contract tests, at least one hosted authenticated allow path, stable deny proof for unauthenticated, invalid, or cross-scope calls, and direct `extension_page_captures` table mutation denial proof for exposed roles.

## Business Access Coverage

### Client opportunity publish, delete, and claim-status workflows
- Roles: Client Admin and Client Member allow for the intended company-scoped claim review or status updates; Client Admin allow for company-owned unclaimed opportunity delete and publish or draft updates; Client Finance deny for these management actions; unrelated client companies, unrelated Bums, Public Visitor, and direct cross-company access deny; Admin may troubleshoot or override where business rules allow.
- Current proof: current source contracts in [`src/test/clientClaimsWorkflow.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/clientClaimsWorkflow.test.ts), [`src/test/clientOpportunityDelete.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/clientOpportunityDelete.test.ts), and [`src/test/clientOpportunityBulkTools.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/clientOpportunityBulkTools.test.ts) still match the exact-head code and migrations in [`supabase/migrations/20260611162000_allow_client_delete_unclaimed_opportunities.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260611162000_allow_client_delete_unclaimed_opportunities.sql) and [`supabase/migrations/20260611163500_allow_client_claim_status_updates.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260611163500_allow_client_claim_status_updates.sql). Exact-head hosted `E2E Smoke` `27371773276` also passed the `Deep QA (client)` shard on `d360570`.
- Missing allow/deny proof: this run still did not execute a direct Client Finance deny, cross-company deny, or claimed-opportunity delete denial against seeded data on the exact head. Current proof is source-backed plus hosted route execution, not a fresh seeded data-path matrix.
- Seed data needed: at least two client companies, one Client Admin, one Client Member, one Client Finance account, one unclaimed opportunity, one claimed opportunity, one approved claim, and one unrelated company record for deny checks.

### Bum represented contacts
- Roles: Bum allow only for their own represented-contact records or explicitly entitled records; unrelated Bums and client-company users deny unless a documented business rule grants visibility; Admin may troubleshoot.
- Current proof: the route itself is still present in current hosted coverage through exact-head `E2E Smoke` `27371773276`, and the business rule still lives in [`docs/business-access-rules.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md).
- Missing allow/deny proof: one allowed own-manual-contact create or read case, one denied foreign-Bum read, one denied client-company read where visibility is not intended, and any approved Admin rescue proof.
- Seed data needed: at least two Bums, one tagged manual contact, one denied cross-Bum read case, and one explicit visibility decision for whether any client-facing route should ever surface manual represented contacts.

## Cross-Agent Follow-Ups

### Release Verification / Lead Developer / Code Review Agent - exact-head hosted QA is green, and the red standard visual signal is harness-only
- Evidence: exact-head `QA` `27371736190`, deploy `27371736211`, and `E2E Smoke` `27371773276` are green on `d360570`. [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still records `GO` for `26fbdc7`, and QA Harness Reliability reproduced that exact-head `Visual UI Audit` `27395701277` failed because `/admin/scrum` tracker text matched the harness's broad `404` error-page regex, not because the admin route itself broke.
- Requested action: keep `TB-0019` open until Code Review is refreshed for `d360570`, and route `27395701277` through QA Harness Reliability item `TB-0092` instead of opening a new product regression.

### QA Harness Reliability - keep `TB-0054` on current-head artifact durability, and narrow the dirty-worktree source assertion before new role branches ship
- Evidence: exact-head `E2E Smoke` `27371773276` is green on `d360570`, but the downloaded success artifacts still omit the `qa-target-preflight` summaries. Separately, a dirty-worktree-only local run of `src/test/e2eSmokeRegression.test.ts` failed because its source assertion still bans any `to: "/client/profile", primary: true` string anywhere in [`src/pages/client/ClientDashboard.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), and current uncommitted Client Legal or Client IT dashboard branches now add that string outside the recovery-path logic. GitHub `QA` already passed on clean head `d360570`, so this is in-flight harness drift, not an exact-head release regression.
- Requested action: keep `TB-0054` open until preflight summaries survive artifact upload on a current-head success run, and tighten the broad file-global `e2eSmokeRegression` assertion before the uncommitted Client Legal or Client IT dashboard changes ship.

### Product Ops / Security / Lead Developer - prove the new client claim and delete boundaries with a seeded allow/deny matrix
- Evidence: exact-head `d79f604` and `d360570` added client-side claim status updates, opportunity publish or draft controls, and unclaimed opportunity delete behavior across [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [`src/pages/client/ClientClaims.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientClaims.tsx), and [`src/pages/client/ClientOpportunityNew.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientOpportunityNew.tsx). Current tests prove the intended source contract, but this run did not execute seeded Client Finance deny or cross-company deny checks on the live data path.
- Requested action: preserve the company-scoped claim and opportunity rules in [`docs/business-access-rules.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), then add cleanup-safe QA fixtures so the new delete and claim-status paths have positive and negative proof beyond string assertions.

## Coverage Map

- Current exact-head hosted evidence on `d360570`:
  - GitHub `QA` run `27371736190`
  - GitHub `Deploy TrustedBums to DreamHost` run `27371736211`
  - GitHub `E2E Smoke` run `27371773276`
  - `27371773276` shards: `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`
  - GitHub `Visual UI Audit` run `27395701277` failed on 2026-06-12 because the harness misread legitimate `/admin/scrum` tracker text containing `404` as an error page; see `TB-0092`
- Current local green in this run:
  - sourced `corepack pnpm run qa:env`
  - sourced `corepack pnpm run qa:target-preflight`
  - `corepack pnpm exec vitest run src/test/clientBumOriginatedOpportunities.test.ts src/test/clientClaimsWorkflow.test.ts src/test/clientOpportunityDelete.test.ts src/test/clientOpportunityBulkTools.test.ts src/test/clientDashboardLayout.test.ts`
  - `corepack pnpm exec vitest run src/test/googleAnalyticsConsent.test.tsx src/test/termsContractRules.test.ts src/test/clientCommissionPlans.test.ts src/test/clientLegalItRoles.test.ts`
- Current local caveat:
  - raw `corepack pnpm run qa:env` fails in a fresh shell because required QA variables are not exported by default
  - `corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts src/test/deepQaTriage.test.ts src/test/qaTargetPreflight.test.ts` fails only on the dirty worktree because uncommitted Client Legal or Client IT dashboard branches now trip a broad source assertion in `src/test/e2eSmokeRegression.test.ts`; treat that as in-flight harness drift, not clean-head release evidence
- Current exact-head artifact check:
  - downloaded `27371773276` artifacts do not retain `qa-target-preflight` summaries

## Watchlist

- Do not call `d360570` a full release `GO` until exact-head Code Review is refreshed and QA Harness Reliability reruns standard visual QA after clearing `TB-0092`.
- Do not treat current source-string tests for client claim-status or delete paths as sufficient direct RLS or authorization proof.
- Do not treat `/bum/contacts` route presence as proof that the manual `Add contact` mutation is regression-covered.

## Current Standards And Time-Sensitive Notes

- Playwright's current best-practices guidance still centers tests on user-visible behavior, resilient locators, and isolated test state. That supports keeping the manual-contact coverage gap focused on one real authenticated mutation proof instead of hiding it inside broad smoke. Sources: [Playwright Best Practices](https://playwright.dev/docs/best-practices), [Playwright Isolation](https://playwright.dev/docs/best-practices#make-tests-as-isolated-as-possible), [Playwright Locators](https://playwright.dev/docs/locators).
- Playwright's current actionability guidance still says enabled controls should be checked through real actionability and click behavior rather than source inspection alone. That supports keeping the exact-head visual run and deep client shard separate from source-only contract tests. Source: [Playwright Actionability](https://playwright.dev/docs/actionability).
- Vitest's current guidance still emphasizes explicit mocking and controlled test context. That supports adding narrow source or component contracts for new client workflow branches and manual-contact validation instead of relying on brittle file-global string checks. Sources: [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html), [Vitest Test Context](https://vitest.dev/guide/test-context).
- GitHub's current artifact guidance still expects workflows to upload exactly the files they need to preserve. That keeps `TB-0054` pointed at an explicit preflight artifact directory instead of Playwright-managed `test-results/`. Source: [Store and share data with workflow artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data).

## Access Requests And Evidence Gaps

- Provide cleanup-safe QA authority for mutating browser coverage when a test must create and remove tagged rows.
- Provide seeded represented-contact fixtures for one allowed own-Bum case, one denied foreign-Bum case, and one denied client-company case.
- Provide seeded multi-company client fixtures for one allowed claim-status update, one denied Client Finance update, one allowed unclaimed opportunity delete, one denied claimed-opportunity delete, and one denied cross-company attempt.

## Agent Inputs

- Date of run: 2026-06-12.
- Files, docs, workflows, artifacts, and commands reviewed:
  - current role prompt and shared rules in `docs/agents/automation-prompts/trusted-bums-daily-qa-test-engineer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, and `docs/agents/business-access-rules.md`
  - current QA, harness, release, lead, edit-log, security, and business-access docs
  - `git status --short`
  - `git rev-parse HEAD`
  - `git log --since='2026-06-10' --oneline --decorate -- docs src supabase .github`
  - `git show --stat --summary --name-only d360570 --`
  - `git show --stat --summary --name-only ea5a710 --`
  - `git show --stat --summary --name-only d79f604 --`
  - `git show --stat --summary --name-only 26fbdc7 --`
  - `git show --stat --summary --name-only 43db9c7 --`
  - `git diff 349bbe0..d360570 -- ...` against current client workflow, portal API, and E2E coverage files
  - GitHub workflow lists and run views for `27371736190`, `27371736211`, `27371773276`, and `27395701277`
  - downloaded artifact tree for `27371773276`
  - raw `corepack pnpm run qa:env`
  - sourced `corepack pnpm run qa:env`
  - sourced `corepack pnpm run qa:target-preflight`
  - `corepack pnpm exec vitest run src/test/clientBumOriginatedOpportunities.test.ts src/test/clientClaimsWorkflow.test.ts src/test/clientOpportunityDelete.test.ts src/test/clientOpportunityBulkTools.test.ts src/test/clientDashboardLayout.test.ts`
  - `corepack pnpm exec vitest run src/test/googleAnalyticsConsent.test.tsx src/test/termsContractRules.test.ts src/test/clientCommissionPlans.test.ts src/test/clientLegalItRoles.test.ts`
  - `corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts src/test/deepQaTriage.test.ts src/test/qaTargetPreflight.test.ts`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`
  - source review of [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [`src/pages/client/ClientClaims.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientClaims.tsx), [`src/pages/client/ClientDashboard.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [`src/pages/client/ClientOpportunityNew.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientOpportunityNew.tsx), [`src/pages/bum/BumContacts.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), [`src/test/e2eSmokeRegression.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/e2eSmokeRegression.test.ts), and the two current RLS migrations
  - live tracker reads for `TB-0019`, `TB-0054`, `TB-0055`, and `TB-0086` through `mcp__codex_apps__supabase._execute_sql`
  - current official testing and artifact guidance reviewed:
    - [Playwright Best Practices](https://playwright.dev/docs/best-practices)
    - [Playwright Actionability](https://playwright.dev/docs/actionability)
    - [Playwright Locators](https://playwright.dev/docs/locators)
    - [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
    - [Vitest Test Context](https://vitest.dev/guide/test-context)
    - [Store and share data with workflow artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data)
-- Checks that could not fully close and why:
  - no seeded direct allow/deny proof was executed for the new client claim-status and unclaimed-opportunity delete paths in this session
  - no authenticated browser mutation run created and cleaned a manual represented contact in this session
