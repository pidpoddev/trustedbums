# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-09 by Codex._

## Executive Read

Current `main` is `9f42bf4`, and its hosted release state is mixed rather than green:

- GitHub `Deploy TrustedBums to DreamHost` run `27178512660` on `9f42bf4`: passed.
- GitHub `E2E Smoke` run `27178530411` on `9f42bf4`: passed.
- Deep QA matrix in `27178530411`: `smoke`, `Deep QA (admin)`, `Deep QA (bum)`, and `Deep QA (client)` all passed.
- GitHub `QA` run `27178512695` on `9f42bf4`: failed in `Unit tests`.
- Current-head `QA` failure cause: [src/test/scrumQueueRegression.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/scrumQueueRegression.test.ts) still expects the seeded-proof backlog sections `Extension API destinations and page captures`, `Bum represented contacts`, and `Client team, domain approval, and access-role assignment`; the latest backlog rewrite removed those exact headings.
- Local hotfix-forward verification after restoring those sections is green: `corepack pnpm exec vitest run src/test/scrumQueueRegression.test.ts` passed, and `corepack pnpm run qa` passed locally. Hosted `QA` remains red until GitHub reruns on the fixed head.
- Current-head visual evidence is still missing. The latest `Visual UI Audit` artifact remains run `27167324836` on `441fd92`, which is stale for the landing split and marketing-copy changes in `0ee2f44` and `9f42bf4`.

Local preflight is clean once `.env.qa` is sourced:

- Raw `corepack pnpm run qa:env`: fails in an unsourced shell, which is expected.
- Sourced `corepack pnpm run qa:env`: passed.
- Sourced `corepack pnpm run qa:target-preflight`: passed DNS, HTTPS, app shell, Clerk, and extension API preflight.

The active QA issue is now documentation/test-contract drift, not a reproduced hosted product outage. That still blocks a clean release call because GitHub `QA` is authoritative for the exact head.

## Active Recommendations

### P1 - [TB-0017] Restore the seeded-proof QA backlog contract and rerun current-head QA
- Evidence: GitHub `QA` run `27178512695` failed because `docs/qa-test-backlog.md` no longer contains seeded-proof sections that `src/test/scrumQueueRegression.test.ts` still treats as required QA scaffolding.
- Why it matters: The authoritative current-head QA gate is red, so release evidence cannot be called green even though hosted smoke and deep coverage passed.
- Recommendation: Restore the missing sections in this backlog, keep the causal link visible, and rerun GitHub `QA` on the exact release head or successor.
- Acceptance criteria: local `corepack pnpm exec vitest run src/test/scrumQueueRegression.test.ts` passes, and the next GitHub `QA` run is green.

### P1 - [TB-0018] Run a current-head Visual UI Audit for the landing split and copy restore
- Evidence: `0ee2f44` and `9f42bf4` changed public landing content and route wiring, but the latest visual artifact is still `27167324836` on `441fd92`.
- Why it matters: Public marketing copy and first-visit route changes need screenshot evidence, not just smoke and deep interaction passes.
- Recommendation: Trigger `Visual UI Audit` on `9f42bf4` or the hotfix-forward successor head before treating the public changes as release-ready.
- Acceptance criteria: a current-head visual artifact exists and passes for the updated public Client and Bum landing surfaces plus signup-intent states.

### P1 - [TB-0020] Keep customer-target create/save coverage tied to seeded allow/deny proof
- Current implementation note: v1 is now proven against live Supabase with rolled-back synthetic matrix rows. The matrix proved Client Admin same-company read/create allow, Client Member same-company read allow, Client Finance read/create deny, foreign Client Admin deny, assigned Bum read allow, unassigned Bum deny, and Admin rescue read allow. The live policy gap that allowed Client Finance direct target creation was fixed by `supabase/migrations/20260609230000_restrict_customer_target_management_roles.sql`, and cleanup verification returned zero synthetic rows across profiles, companies, customer targets, access requests, extension captures, Bum contacts, and performance telemetry.
- Evidence: `5c6d451`, `7609b0d`, `73f0b06`, and the later current-head smoke/deep runs proved the customer-target save path is operational under the signed-in session-token shape. The 2026-06-09 rolled-back live Supabase matrix now adds direct seeded allow/deny proof for the customer-target create/read boundaries.
- Why it matters: Route smoke can pass while direct data-path or cross-role denial still regresses.
- Recommendation: Keep `supabase/migrations/20260609230000_restrict_customer_target_management_roles.sql` and the source-level regression in `src/test/customerTargetRules.test.ts` as the standing guardrail for customer-target management roles.
- Acceptance criteria: one allowed and one denied seeded case is recorded for each relevant role boundary, with cleanup verified. This is complete for customer-target create/read boundaries as of the 2026-06-09 live matrix.

### P1 - [TB-0021] Run the Client/Bum go-live workflow gate before external launch
- Current implementation note: `corepack pnpm run qa:go-live` passed against the hosted QA target on 2026-06-09 with 4 passed Chromium workflow tests and 1 optional mutating smoke skipped by configuration.
- Evidence: `tests/e2e/go-live-client-bum-workflow.spec.ts` and `qa:go-live` still exist, and the 2026-06-09 hosted-target run passed the broader go-live lane.
- Why it matters: Legitimate workflow failures can still hide outside smoke and deep coverage, especially in auth/bootstrap, terms, and target-save paths.
- Recommendation: Keep `corepack pnpm run qa:go-live` as the broader external-launch gate whenever release scope needs more than hosted smoke and deep QA.
- Acceptance criteria: the go-live suite passes on hosted QA, with cleanup counts documented if mutation mode is enabled. This pass did not enable mutation mode, so no created-record cleanup was needed.

### P1 - [TB-0072] Verify Potential DM matches and LinkedIn candidate buttons
- Evidence: `TB-0072` is FIXED in `/admin/scrum`: the live Trusted Bums Supabase project has 11 BlackCurrant Potential DM matches across 4 target accounts, all labeled `Research Bot`, and [BumOpportunityDetail.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumOpportunityDetail.tsx) renders Source and LinkedIn candidate buttons for each match when URLs exist.
- Why it matters: This is a new outbound-link workflow on the Bum opportunity detail page. QA needs to confirm the card is visible only where the accepted-opportunity/RLS path allows it, that the `Where this came from: Research Bot` badge is visible, and that LinkedIn stays framed as a manual candidate link rather than verified scraped truth.
- Recommendation: On a deployed authenticated Bum session, open an accepted BlackCurrant opportunity that has seeded Potential DM matches. Confirm the card renders candidates, the Source buttons open their public source URLs in a new tab/window, and each LinkedIn candidate button opens the LinkedIn profile candidate URL in a new tab/window with no in-app scraping or login automation.
- Acceptance criteria: QA records the opportunity tested, confirms at least one Source and one LinkedIn candidate button opened in a new tab/window, confirms the `LinkedIn check: not checked` text remains visible, and either closes `TB-0072` or updates it with the blocker and screenshot/evidence.

## Business Access Coverage

### Customer target creation and reads
- Roles: Client Admin and Client Member are the intended company-scoped operators for target-management routes; Client Finance is finance-only; Bum and Public Visitor are denied; Admin remains the marketplace override role.
- Current proof: route access in [src/App.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/App.tsx), target-save workflow assertions in [tests/e2e/go-live-client-bum-workflow.spec.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/go-live-client-bum-workflow.spec.ts), minimal-return writes in [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), policy/source guards in [src/test/customerTargetRules.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/customerTargetRules.test.ts), and live rolled-back Supabase RLS proof for same-company allow, finance-role deny, cross-company deny, assigned-Bum allow, unassigned-Bum deny, and Admin rescue read.
- Missing allow/deny proof: none for the customer-target create/read boundaries covered by TB-0020. Keep future fixture expansion focused on adjacent workflows such as customer target responses, meetings, and reporting exports.
- Seed data needed: no additional seed data for the customer-target create/read boundary closed by TB-0020. Reuse the same two-company role matrix if adjacent target-response, meeting, or reporting-export boundaries are expanded later.

### Extension API destinations and page captures
- Roles: Bum allow only for owned or explicitly assigned target destinations and created page captures; unrelated Bum and unrelated client-company users deny; Admin support only when explicitly intended.
- Current proof: sourced preflight now verifies the anonymous extension API `401` shape plus fresh Bum-session auth readiness, [src/test/serviceRoleAuthorization.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/serviceRoleAuthorization.test.ts) still expects deny behavior for unauthorized extension requests, and [supabase/migrations/20260608141000_limit_raw_extension_capture_reads.sql](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260608141000_limit_raw_extension_capture_reads.sql) keeps raw page captures creator-or-admin scoped.
- Missing allow/deny proof: live seeded destination create/read checks for one allowed Bum capture, one denied foreign-target capture, one denied unrelated-capture read, and any intended admin rescue path.
- Seed data needed: one Bum with an allowed destination, one denied destination, replay-safe capture fixtures, and one admin observer.

### Bum represented contacts
- Roles: Bum allow only for their own represented-contact records or records they are explicitly entitled to manage; unrelated Bums and client-company users deny unless a documented business rule grants visibility; Admin may troubleshoot.
- Current proof: business rules remain anchored in [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), and represented-contact workflows still sit inside the high-risk seeded fixture lane called out across QA, Security, and Product Ops handoffs.
- Missing allow/deny proof: one allowed own-contact case, one denied foreign-Bum case, one denied client-company case where visibility is not intended, and any approved admin rescue proof.
- Seed data needed: at least two Bums, represented contacts from each relevant source type, and one denied cross-Bum case.

### Client team, domain approval, and access-role assignment
- Roles: Admin and existing Client Admin approve access; pending users remain unassigned; Client Finance and Client Member do not self-assign company authority.
- Current proof: the business rule and role matrix remain documented in [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), and the fixture contract remains documented in [docs/qa-authorization-fixtures.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-authorization-fixtures.md).
- Missing allow/deny proof: seeded first-domain claim, public-email manual-review, same-domain approval, related-domain gating, cross-company denial, and denied direct auth-field mutation cases with real QA identities.
- Seed data needed: one unclaimed business domain, one claimed business domain, one public-email claimant, one related-domain request, at least two companies, and one stale-admin override scenario.

## Cross-Agent Follow-Ups

### Release Verification / Lead Developer - keep current head at HOTFIX-FORWARD until QA and visual evidence are clean
- Evidence: current head `9f42bf4` passed deploy plus hosted smoke/deep QA, but `QA` is red and no current-head visual artifact exists.
- Requested action: keep the release ledger at `HOTFIX-FORWARD` until the red `QA` workflow, missing visual audit, and stale exact-head review state are all closed together.

### QA/Test Engineer - preserve seeded-proof sections until the regression test is intentionally changed
- Causal link: the previous backlog rewrite removed headings that [src/test/scrumQueueRegression.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/scrumQueueRegression.test.ts) still treats as required release scaffolding, which directly caused GitHub `QA` run `27178512695` to fail.
- Requested action: keep seeded-proof headings explicit in this file until the regression test and release policy are intentionally revised together.

### QA/Test Engineer - add deployed proof for Potential DM outbound buttons
- Causal link: `TB-0072` added Source and LinkedIn candidate buttons to the Bum opportunity detail page for Research Bot Potential DM matches.
- Requested action: exercise the deployed Bum flow, confirm the new outbound buttons open in a new tab/window, and keep LinkedIn verification status as manual `not checked` unless a human verifies the profile.

## Coverage Map

- Hosted green on current head: DreamHost deploy run `27178512660` and `E2E Smoke` run `27178530411`, including all deep shards.
- Hosted red on current head: `QA` run `27178512695`.
- Latest completed product-code head with fully green QA/deploy/E2E: `73f0b06` via runs `27175589606`, `27175589605`, and `27175606654`.
- Hosted visual evidence still available: `Visual UI Audit` run `27167324836` on `441fd92`.
- Local green in this run: sourced `qa:env`, sourced `qa:target-preflight`, and the targeted release-verification inspection of the current QA failure contract.

## Watchlist

- Do not treat `trustedbums.com` health plus green hosted smoke as enough for `GO` while GitHub `QA` is red on the same head.
- Treat public landing-page and copy changes as visual-evidence-bound changes; do not reuse `441fd92` screenshots silently.
- Keep the seeded live allow/deny lane explicit for customer targets, represented contacts, extension captures, and client-team approval until fixtures exist and the regression test is intentionally relaxed.

## Access Requests And Evidence Gaps

- Apply `supabase/qa_authorization_seed.sql` in a protected QA database and run the missing live role-scoped allow/deny checks.
- Trigger a current-head `Visual UI Audit` run for `9f42bf4` or its hotfix-forward successor.
- Refresh exact-head Code Review evidence for the next hotfix-forward head.
- Run `corepack pnpm run qa:go-live` before any external launch call that needs more than smoke/deep proof.

## Agent Inputs

- Date of run: 2026-06-08.
- Files, tests, docs, workflows, and commands reviewed: current [docs/qa-test-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md), current [docs/release-verification-backlog.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md), current [docs/lead-developer-recommendations.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/lead-developer-recommendations.md), [docs/qa-authorization-fixtures.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-authorization-fixtures.md), [src/test/scrumQueueRegression.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/scrumQueueRegression.test.ts), [src/test/serviceRoleAuthorization.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/serviceRoleAuthorization.test.ts), [src/test/customerTargetRules.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/customerTargetRules.test.ts), [src/App.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/App.tsx), [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [supabase/migrations/20260608141000_limit_raw_extension_capture_reads.sql](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260608141000_limit_raw_extension_capture_reads.sql), `git rev-parse HEAD`, `git show --stat --summary 0ee2f44`, `git show --stat --summary 9f42bf4`, raw and sourced `corepack pnpm run qa:env`, sourced `corepack pnpm run qa:target-preflight`, and GitHub runs `27178512695`, `27178512660`, `27178530411`, `27167324836`, `27177006002`, and `27175606654`.
- Checks that could not run and why: there is still no current-head `Visual UI Audit` run for `0ee2f44` or `9f42bf4`; the next hosted `QA` rerun requires a new push or manual retrigger after the backlog/test contract fix; and `qa:go-live` was not rerun because hosted smoke and deep coverage already isolated the active release blocker to the red `QA` workflow plus missing visual evidence.
