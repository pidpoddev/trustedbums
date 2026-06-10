# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-09 by Codex daily QA/test engineer automation._

## Executive Read

Current `main` head `ff59d2c` is green on the authoritative hosted QA lanes:

- GitHub `QA` run `27244531408` on `ff59d2c`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27244531370` on `ff59d2c`: passed.
- GitHub `E2E Smoke` run `27244546687` on `ff59d2c`: passed `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.

Current-session local preflight is also green once `.env.qa` is sourced:

- Sourced `corepack pnpm run qa:env`: passed.
- Sourced `corepack pnpm run qa:target-preflight`: passed against `https://trustedbums.com` with DNS, HTTPS, app shell, Clerk, and extension API checks green.
- Targeted regressions passed: `src/test/potentialDecisionMakerMatches.test.ts`, `src/test/adminScrumTracker.test.ts`, `src/test/scrumQueueRegression.test.ts`, and `src/test/e2eSmokeRegression.test.ts` (`21` tests total).

The last red-QA story from `9f42bf4` is no longer the current release truth. QA risk has narrowed to coverage quality, not an observed release outage. The active gaps are:

- deployed proof for `[TB-0072]` Potential DM matches plus Source and LinkedIn candidate buttons on a real Bum session;
- mutating browser QA still skipping cleanup-sensitive lanes because the automated cleanup credential is not yet a working Supabase `service_role` JWT path;
- exact-head visual evidence is still behind the current UI-bearing commit range. The latest successful `Visual UI Audit` run is `27200213766` on `fffe28c`, which fixed the hosted target issue, but it is not an exact-head artifact for the later UI changes now on `ff59d2c`.

## Active Recommendations

### P1 - [TB-0072] Verify Potential DM matches and outbound buttons on a deployed Bum session
- Evidence: GitHub `QA` and `E2E Smoke` are green on `ff59d2c`, but current automated coverage for the new Potential DM surface is still source-backed rather than workflow-backed. [src/test/potentialDecisionMakerMatches.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/potentialDecisionMakerMatches.test.ts) only asserts the migration contract, while [src/pages/bum/BumOpportunityDetail.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumOpportunityDetail.tsx) now renders `Where this came from: Research Bot`, public Source buttons, and LinkedIn candidate buttons for accepted-opportunity matches.
- Why it matters: This is a new accepted-opportunity-only RLS surface plus a new outbound-link workflow. Source assertions do not prove that the right Bum can see the card, that unrelated Bums cannot, or that the links behave safely on the deployed product.
- Recommendation: On a deployed authenticated Bum session, open an accepted BlackCurrant opportunity that has seeded Potential DM matches. Confirm the card renders, at least one Source button opens a public source in a new tab/window, at least one LinkedIn candidate button opens a candidate profile URL in a new tab/window, and the UI still frames LinkedIn as manual `not checked` verification rather than scraped truth.
- Acceptance criteria: QA records the opportunity tested, confirms the `Where this came from: Research Bot` badge and `LinkedIn check: not checked` text are visible, confirms at least one Source and one LinkedIn candidate button opened in a new tab/window, and either closes `TB-0072` with evidence or updates it with the blocker.

### P1 - Keep mutating browser QA blocked until automated cleanup authority is real
- Evidence: [tests/e2e/helpers/deepQa.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/deepQa.ts) now guards mutation lanes after the earlier cleanup failure, and commit `8028280` kept that guard in place. Current hosted smoke and deep shards are green, but there is still no current-head run proving that mutating go-live/deep workflow coverage can create and then automatically clean synthetic rows without manual recovery.
- Why it matters: Non-mutating smoke and deep coverage can stay green while the highest-risk create/update/delete workflows remain unproven as a repeatable release gate.
- Recommendation: Provide a cleanup path that the automated Playwright mutation helpers can actually use in-session: either a valid Supabase `service_role` JWT accepted by the REST cleanup helper, or an approved scoped cleanup endpoint or RPC for `qa-go-live-*` and `qa-deep-*` data. Keep the current guard so mutation lanes skip instead of leaving residue until that authority exists.
- Acceptance criteria: A current-head or successor-hosted mutation run executes the mutating lanes instead of skipping them, and cleanup verification reports zero remaining synthetic rows for companies, target accounts, opportunities, and related domains.

### P2 - Pair exact-head visual evidence with the current UI-bearing commit range and keep retained route coverage healthy
- Evidence: The latest successful GitHub `Visual UI Audit` run is `27200213766` on `fffe28c`. Current exact-head run `27247209520` on `ff59d2c` failed in the public marketing/privacy test while waiting for the `Accessibility settings` button after the signup dialog closes. The checked-in [tests/e2e/visual-ui-audit.spec.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts) already retains `/bums` and `/admin/scrum`.
- Why it matters: Hosted `E2E Smoke` proves the deployed app is routable and interactive, but it does not replace current screenshots for the active public and authenticated visual surfaces on the exact release head.
- Recommendation: Inspect the `27247209520` trace and artifact, fix or rebaseline the public `Accessibility settings` step, rerun `Visual UI Audit` on `ff59d2c` or the next candidate head, and keep `/bums` plus `/admin/scrum` in the retained hosted visual set.
- Acceptance criteria: A completed current-head visual artifact exists for the candidate release head, and the artifact still includes `/bums` plus `/admin/scrum`.

## Business Access Coverage

### Customer target create/read boundaries
- Roles: Admin allow; Client Admin and Client Member allow within intended company workflows; Client Finance deny for target management; assigned Bum read allow; unassigned Bum and Public Visitor deny.
- Current proof: No new regression reopened this lane on `ff59d2c`. Current smoke/deep workflows stayed green, and the earlier direct allow/deny customer-target proof remains the active source-backed baseline.
- Missing allow/deny proof: none newly introduced by the current head.

### Potential decision maker matches
- Roles: Admin manage; same-company client users read own company matches; Bum read allow only when the linked opportunity is accepted; unrelated Bum, unrelated client company, and Public Visitor deny.
- Current proof: [supabase/migrations/20260609153000_add_potential_decision_maker_matches.sql](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260609153000_add_potential_decision_maker_matches.sql) enables admin-all, same-company client read, and accepted-opportunity Bum read policies. [src/test/potentialDecisionMakerMatches.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/potentialDecisionMakerMatches.test.ts) asserts the accepted-opportunity RLS policy and the manual LinkedIn-verification contract.
- Missing allow/deny proof: deployed accepted-Bum allow, unrelated-Bum deny, same-company client allow, and foreign-company client deny on the seeded BlackCurrant data.
- Seed data needed: one Bum with an accepted BlackCurrant opportunity that has matches, one Bum without an accepted relationship, one same-company client user, and one foreign-company client user.

### Extension API destinations and page captures
- Roles: Bum allow only for owned or explicitly assigned destination and capture records; unrelated Bum and unrelated client-company users deny; Admin rescue only when intended.
- Current proof: sourced `qa:target-preflight` still verifies the anonymous extension API `401` shape, [src/test/serviceRoleAuthorization.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/serviceRoleAuthorization.test.ts) still expects deny behavior for unauthorized extension requests, and [supabase/migrations/20260608141000_limit_raw_extension_capture_reads.sql](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260608141000_limit_raw_extension_capture_reads.sql) keeps raw page captures creator-or-admin scoped.
- Missing allow/deny proof: live seeded destination create/read checks for one allowed Bum capture, one denied foreign-target capture, one denied unrelated-capture read, and any intended admin rescue path.
- Seed data needed: one Bum with an allowed destination, one denied destination, replay-safe capture fixtures, and one admin observer.

### Bum represented contacts
- Roles: Bum allow only for their own represented-contact records or explicitly entitled records; unrelated Bums and client-company users deny unless a documented business rule grants visibility; Admin may troubleshoot.
- Current proof: the current business rule still lives in [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), and the seeded allow/deny requirement remains explicit in [src/test/scrumQueueRegression.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/scrumQueueRegression.test.ts).
- Missing allow/deny proof: one allowed own-contact case, one denied foreign-Bum case, one denied client-company case where visibility is not intended, and any approved admin rescue proof.
- Seed data needed: at least two Bums, represented contacts from each relevant source type, and one denied cross-Bum case.

### Client team, domain approval, and access-role assignment
- Roles: Admin and existing Client Admin approve access; pending users remain unassigned; Client Finance and Client Member do not self-assign company authority.
- Current proof: the business rule and role matrix remain documented in [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), and the required seeded fixture contract remains documented in [docs/qa-authorization-fixtures.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-authorization-fixtures.md).
- Missing allow/deny proof: seeded first-domain claim, public-email manual review, same-domain approval, related-domain gating, cross-company denial, and denied direct auth-field mutation cases with real QA identities.
- Seed data needed: one unclaimed business domain, one claimed business domain, one public-email claimant, one related-domain request, at least two companies, and one stale-admin override scenario.

## Cross-Agent Follow-Ups

### Release Verification / Lead Developer - rebaseline release truth away from the stale `9f42bf4` QA failure
- Evidence: current `main` head `ff59d2c` has green GitHub `QA` (`27244531408`), deploy (`27244531370`), and `E2E Smoke` (`27244546687`) evidence. The old `9f42bf4` red-QA story is no longer the active release state.
- Requested action: update release and lead handoffs so they stop carrying forward the stale `HOTFIX-FORWARD because QA is red` narrative. The remaining release caveats are exact-head visual proof and exact-head Code Review state, not a current red QA workflow.

### QA Harness Reliability / UI / Accessibility - move from base-target triage to exact-head visual retention and the current public interaction failure
- Evidence: `Visual UI Audit` run `27181180658` failed on the wrong base target, but the later run `27200213766` succeeded on `https://trustedbums.com`. The remaining gap is now the exact-head `27247209520` failure waiting for `Accessibility settings`, not missing `/bums` or `/admin/scrum` coverage in source.
- Requested action: keep `https://trustedbums.com` as the hosted visual default, dispatch current-head visual runs when UI-bearing commits land, and focus the next fix on the public `Accessibility settings` interaction while preserving the existing `/bums` and `/admin/scrum` coverage.

### Decision-Maker Researcher / Product Ops / Lead Developer - keep Potential DM matches framed as manual-candidate workflow data until deployed QA closes `TB-0072`
- Evidence: the current seeded Potential DM data and UI contract are in place, but this run did not yet produce deployed Bum-session proof for the visible card and outbound buttons.
- Requested action: do not treat the new match rows as fully QA-validated outreach-ready workflow data until deployed QA records accepted-opportunity visibility plus safe outbound-link behavior.

### QA Harness Reliability / Lead Developer - keep the mutation cleanup guard in place
- Evidence: current hosted smoke and deep evidence are green without needing mutation cleanup, but there is still no current-head proof that mutation lanes can clean up their own writes automatically.
- Requested action: keep the current mutation guard active and treat the cleanup credential or cleanup-endpoint work as a prerequisite for elevating mutation QA into a required release gate.

## Coverage Map

- Current hosted green on exact head `ff59d2c`:
  - GitHub `QA` run `27244531408`
  - GitHub `Deploy TrustedBums to DreamHost` run `27244531370`
  - GitHub `E2E Smoke` run `27244546687`
  - `27244546687` shards: `smoke`, `Deep QA (admin)`, `Deep QA (client)`, `Deep QA (bum)`
- Current local green in this run:
  - sourced `corepack pnpm run qa:env`
  - sourced `corepack pnpm run qa:target-preflight`
  - `corepack pnpm exec vitest run src/test/potentialDecisionMakerMatches.test.ts src/test/adminScrumTracker.test.ts src/test/scrumQueueRegression.test.ts src/test/e2eSmokeRegression.test.ts`
- Latest successful hosted visual evidence:
  - GitHub `Visual UI Audit` run `27200213766` on `fffe28c`
- Latest standalone `Deep QA Hotfix Audit` workflow:
  - GitHub run `27092527987` on `850e507`
  - current deploy-triggered deep shards are fresher than the standalone workflow

## Watchlist

- Do not close `[TB-0072]` from source or migration assertions alone; it still needs deployed Bum-session proof.
- Do not treat mutating browser QA as green while the cleanup-sensitive lanes skip instead of executing.
- Do not silently reuse `fffe28c` visual evidence for later UI-bearing heads without either a new artifact or an explicit no-visual-delta decision.
- Keep the seeded live allow/deny proof lanes explicit for extension captures, represented contacts, and client-team approval until real fixtures exist and the current regression contract is intentionally relaxed.

## Current Standards And Time-Sensitive Notes

- Playwright’s current best-practices guidance says tests should prioritize user-visible behavior, avoid relying on implementation details, and keep each test isolated. That supports keeping the Potential DM verification focused on real deployed Bum actions and visible link behavior instead of only schema assertions. Source: [Playwright Best Practices](https://playwright.dev/docs/best-practices).
- Playwright’s current locator guidance says `getByText()` can match exact text, while locator strictness and auto-waiting remain core to resilient tests. That matches the current direction of using tighter user-facing locators when duplicate live-region wrappers or toasts make broad text matches ambiguous. Sources: [Playwright Locators](https://playwright.dev/docs/locators), [Playwright Auto-waiting](https://playwright.dev/docs/actionability).
- Playwright’s current authentication guidance recommends reusing stored authenticated browser state carefully and keeping auth artifacts out of version control. That reinforces keeping deployed-role QA deterministic and scoped rather than rebuilding fragile ad hoc login flows inside every spec. Source: [Playwright Authentication](https://playwright.dev/docs/auth).
- Vitest’s current guidance emphasizes cleanup or restoration of mocks between tests and explicit fixture isolation. That supports keeping the current regression suite narrow and deterministic instead of hiding cross-test state when QA uses source-backed regression files as release contracts. Sources: [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html), [Vitest Test Context](https://vitest.dev/guide/test-context).

## Access Requests And Evidence Gaps

- Provide a working mutation-cleanup authority for Playwright QA: a Supabase `service_role` JWT accepted by the REST cleanup helper, or an approved scoped cleanup RPC/endpoint.
- Provide or preserve seeded role fixtures for extension captures, represented contacts, and client-team approval flows so the remaining allow/deny lanes can move from source-backed to live-backed.
- Keep a current-head hosted `Visual UI Audit` artifact available for release candidates, with `/bums` and `/admin/scrum` included once the spec expands.
- This run did not have a callable Admin Scrum Tracker or Supabase write path in-session for live tracker mutation. Historical repo evidence says `TB-0017`, `TB-0018`, and `TB-0019` were previously closed live, but this automation did not re-read or rewrite tracker rows directly in the current session.

## Agent Inputs

- Date of run: 2026-06-09.
- Files, docs, workflows, and commands reviewed:
  - current role prompt and shared rules in `docs/agents/automation-prompts/trusted-bums-daily-qa-test-engineer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, and `docs/agents/business-access-rules.md`
  - current QA, release, lead, harness, and edit-log docs
  - `git log -6 --oneline --decorate`
  - `git show --stat --summary --name-only ff59d2c`
  - `git show --stat --summary --name-only 8a9e2d7`
  - `git show --stat --summary --name-only fffe28c`
  - GitHub workflow lists plus run views for `27244531408`, `27244531370`, `27244546687`, and `27200213766`
  - sourced `corepack pnpm run qa:env`
  - sourced `corepack pnpm run qa:target-preflight`
  - `corepack pnpm exec vitest run src/test/potentialDecisionMakerMatches.test.ts src/test/adminScrumTracker.test.ts src/test/scrumQueueRegression.test.ts src/test/e2eSmokeRegression.test.ts`
  - source review of [src/pages/bum/BumOpportunityDetail.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumOpportunityDetail.tsx), [src/test/potentialDecisionMakerMatches.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/potentialDecisionMakerMatches.test.ts), [src/test/adminScrumTracker.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/adminScrumTracker.test.ts), [src/test/scrumQueueRegression.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/scrumQueueRegression.test.ts), [tests/e2e/helpers/auth.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/auth.ts), [tests/e2e/go-live-client-bum-workflow.spec.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/go-live-client-bum-workflow.spec.ts), and [supabase/migrations/20260609153000_add_potential_decision_maker_matches.sql](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260609153000_add_potential_decision_maker_matches.sql)
  - current official testing guidance reviewed:
    - [Playwright Best Practices](https://playwright.dev/docs/best-practices)
    - [Playwright Locators](https://playwright.dev/docs/locators)
    - [Playwright Authentication](https://playwright.dev/docs/auth)
    - [Playwright Auto-waiting](https://playwright.dev/docs/actionability)
    - [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
    - [Vitest Test Context](https://vitest.dev/guide/test-context)
- Checks that could not run and why:
  - no deployed authenticated Bum-session proof for `[TB-0072]` yet; this run stayed at hosted smoke/deep plus source/regression review because there is no dedicated existing spec for the Potential DM workflow
  - no current-head hosted visual artifact for `ff59d2c`; the latest successful visual run is still `27200213766` on `fffe28c`
  - no live tracker-row mutation in `/admin/scrum` or `public.admin_scrum_items` because that write path was not callable from this session
