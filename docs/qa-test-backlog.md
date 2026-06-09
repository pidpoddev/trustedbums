# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-08 by Codex daily QA/test engineer automation._

## Executive Read

Current `main` is `41187e0`, and its hosted release workflow is partly closed but not fully complete yet:

- GitHub `QA` run `27176979784` on `41187e0`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27176979797` on `41187e0`: passed.
- GitHub `E2E Smoke` run `27177006002` on `41187e0`: smoke passed, `Deep QA (admin)` and `Deep QA (bum)` passed, and `Deep QA (client)` was still running at final review time, so do not describe `41187e0` as fully green yet.
- Latest completed hosted smoke for product code is `73f0b06`: GitHub `QA` run `27175589606`, DreamHost deploy run `27175589605`, and GitHub `E2E Smoke` run `27175606654` all passed. That E2E run also passed `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- Latest hosted visual evidence is still GitHub `Visual UI Audit` run `27167324836` on `441fd92`, which passed with `18 passed`.

Local preflight and the newest access-sensitive regression coverage are green:

- Sourced `corepack pnpm run qa:env`: passed.
- Sourced `corepack pnpm run qa:target-preflight`: passed DNS, HTTPS, app shell, Clerk, and extension API preflight.
- Focused local authorization suite: `src/test/customerTargetRules.test.ts`, `src/test/accessBoundaryRegression.test.ts`, `src/test/qaAuthorizationFixtures.test.ts`, and `src/test/serviceRoleAuthorization.test.ts` all passed (`16/16` tests).

The highest-value QA change in the newest product-code commits is the customer-target save path. `5c6d451`, `7609b0d`, and `73f0b06` changed target creation to work with the signed-in session token shape and to avoid read-after-write failures by using minimal-return writes. Hosted smoke is green on `73f0b06`, but the seeded live allow/deny matrix for that workflow is still missing.

## Active Recommendations

### P1 - Refresh current-head hosted evidence before calling `41187e0` green
- Evidence: `41187e0` advanced `main`, `QA` run `27176979784` passed, DreamHost deploy run `27176979797` passed, and `E2E Smoke` run `27177006002` already cleared its smoke job while `Deep QA (admin)` and `Deep QA (bum)` passed and `Deep QA (client)` was still running when this backlog was finalized. The latest fully completed green smoke/deep proof is on `73f0b06`, not `41187e0`. The latest visual artifact is still `27167324836` on `441fd92`.
- Why it matters: Scrum and release notes become misleading if they keep naming `441fd92` as the current fully-green head after the repo has moved forward.
- Recommendation: Let `27177006002` finish, then refresh the release-facing docs and explicitly state whether the older visual artifact is being reused because the intervening commits were non-visual or whether a fresh `Visual UI Audit` run is required.
- Acceptance criteria: `docs/lead-developer-recommendations.md` and the release ledger no longer say current head `441fd92`; they cite `41187e0` with the final `E2E Smoke` result and an explicit visual-evidence position.

### P1 - Keep customer-target create/save coverage tied to seeded allow/deny proof
- Evidence: `tests/e2e/go-live-client-bum-workflow.spec.ts` now treats target save as a critical go-live action, `src/lib/portalApi.ts` changed customer-target creation to `return=minimal` style writes, and local source tests plus hosted smoke on `73f0b06` are green. The business-risk path still lacks seeded live proof for same-company allow, finance-role deny, cross-company deny, and Bum deny.
- Why it matters: This workflow sits on RLS and production-token-shape behavior. Route smoke can pass while direct data-path or cross-role denial still regresses.
- Recommendation: Use `supabase/qa_authorization_seed.sql` plus real QA role accounts to prove customer-target create/read boundaries end-to-end, including the signed-in Clerk session token path the repo now relies on.
- Acceptance criteria: QA records one allowed and one denied case each for Client Admin, Client Member if intended, Client Finance, Bum, and foreign-company client access against seeded data, with cleanup verified.

### P1 - Run the Client/Bum go-live workflow gate before external launch
- Evidence: The repo has `tests/e2e/go-live-client-bum-workflow.spec.ts` and `qa:go-live` for Client Admin, Client Finance, Client Member, and Bum workflows, but this gate was not rerun in this pass. The current local and hosted evidence proves smoke and deep coverage, not the full pre-launch workflow checklist.
- Why it matters: Release risk is not only unauthorized access. Legitimate client and Bum actions can still fail because of auth/bootstrap, terms gating, target-save flow, or route-specific breakage.
- Recommendation: Run `corepack pnpm run qa:go-live` against the intended hosted QA target before external launch, and keep mutation mode opt-in with cleanup.
- Acceptance criteria: The go-live suite passes on the hosted QA target with the intended accounts, and any mutating mode run documents cleanup counts.

### P1 - Keep visual and accessibility evidence current when product routes change
- Evidence: The latest visual artifact is still `27167324836` on `441fd92`, while the latest completed smoke/deep run is `27175606654` on `73f0b06`. The current head `41187e0` is docs-only, but the QA backlog still needs a clear rule for when visual evidence is considered fresh enough.
- Why it matters: Visual proof can silently drift behind route or component changes even when smoke stays green.
- Recommendation: Treat current-head `Visual UI Audit` artifacts as required whenever product routes, auth surfaces, or visible workflow CTAs change; otherwise document why the latest older artifact is still valid.
- Acceptance criteria: The next product-code release note cites either a fresh visual run for that head or a documented no-visual-delta reason for reusing the prior artifact.

### P2 - Add measured coverage reporting
- Evidence: The repo still infers unit coverage from breadth of tests rather than a generated coverage report. Current test inventory is broad across `src/test` and `tests/e2e`, and Vitest now supports V8 coverage with AST-based remapping comparable to Istanbul.
- Why it matters: The newest access and workflow fixes are accumulating faster than line-of-sight coverage accountability.
- Recommendation: Add a `coverage` script and tracked thresholds for the highest-risk auth, target, extension, and finance modules.
- Acceptance criteria: `corepack pnpm run coverage` emits a report with agreed thresholds and is documented in QA/release handoffs.

## Business Access Coverage

### Customer target creation and reads
- Roles: Client Admin and Client Member are the intended company-scoped operators for target-management routes; Client Finance is finance-only; Bum and Public Visitor are denied; Admin remains the marketplace override role.
- Current proof: Route access in [src/App.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/App.tsx), target-save workflow assertions in [tests/e2e/go-live-client-bum-workflow.spec.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/go-live-client-bum-workflow.spec.ts), minimal-return customer-target writes in [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), and policy/source guards in [src/test/customerTargetRules.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/customerTargetRules.test.ts).
- Missing allow/deny proof: live seeded proof for Client Finance deny on customer-target read/create, same-company Client Member allow if still intended, foreign-company client deny, Bum deny without explicit assignment, and Admin-only rescue paths.
- Seed data needed: two client companies, one Client Admin, one Client Member, one Client Finance, one Bum, at least one own-company target, and at least one foreign-company target.
- Hold point: Do not harden or widen customer-target RLS again without seeded production-token-shape proof for both create and subsequent read paths.

### Extension API customer-target destinations
- Roles: Bum allow only for owned or explicitly assigned target destinations; unrelated Bum and unrelated client-company users deny; Admin support only when explicitly intended.
- Current proof: local sourced preflight now verifies anonymous `401` shape plus fresh Bum-session auth readiness, and `src/test/serviceRoleAuthorization.test.ts` still expects target-deny errors for unauthorized extension requests.
- Missing allow/deny proof: live seeded destination create/read checks for one allowed Bum capture and one denied foreign-target capture, plus company-scoped client deny where relevant.
- Seed data needed: one Bum with an allowed destination, one denied destination, and replay-safe capture fixtures.

### Profile bootstrap and client-team approval
- Roles: Admin and existing Client Admin approve access; pending users remain unassigned; Client Finance and Client Member do not self-assign company authority.
- Current proof: business rules remain documented in [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md), and the QA fixture contract remains documented in [docs/qa-authorization-fixtures.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-authorization-fixtures.md).
- Missing allow/deny proof: live seeded company-domain approval, public-email manual-review, same-domain approval, and cross-company denial cases with real QA identities.
- Hold point: Keep this as an active seeded-QA lane before future RLS hardening or access-review workflow changes.

## Cross-Agent Follow-Ups

### Lead Developer / Release Verification - refresh the release truth after workflow `27177006002`
- Evidence: `docs/lead-developer-recommendations.md` still names `441fd92` as current fully-green head, but `main` is now `41187e0`, `QA` and deploy are already green on that head, the smoke job in `27177006002` passed, `Deep QA (admin)` and `Deep QA (bum)` passed, and `Deep QA (client)` was still running during this QA pass.
- Requested action: Update the release-facing docs as soon as `27177006002` finishes so they name the real current head and the final smoke/deep result instead of the older `441fd92` snapshot.

### Lead Developer / Security / Product Ops - keep target-create acceptance criteria bound to seeded deny cases
- Evidence: `5c6d451`, `7609b0d`, and `73f0b06` changed the customer-target save path to accommodate the signed-in session-token shape and avoid read-after-write failures. Local auth tests and hosted smoke are green, but seeded live deny proof is still absent.
- Requested action: Treat customer-target create/read allow/deny proof as a release-gated QA dependency for any future RLS, client-team, or opportunity workflow changes that touch the same company boundary.

## Coverage Map

- Hosted green on current head: `QA` run `27176979784`, DreamHost deploy run `27176979797`, and the smoke job inside `E2E Smoke` run `27177006002`.
- Hosted green on latest completed product-code head: `QA` run `27175589606`, DreamHost deploy run `27175589605`, `E2E Smoke` run `27175606654`, and deep shards `admin`, `client`, `bum`.
- Hosted visual evidence: `Visual UI Audit` run `27167324836` on `441fd92`.
- Local green in this run: sourced `qa:env`, sourced `qa:target-preflight`, and focused auth/RLS regression tests (`16/16` passed).
- Missing or pending: the final `Deep QA (client)` result for current-head `E2E Smoke` run `27177006002`, current-head go-live gate execution, seeded live allow/deny matrix, and a clearly documented current visual-evidence policy for non-visual commits versus visible-route changes.

## Watchlist

- `41187e0` is a docs/rules commit, but the hosted `Deep QA (client)` result still needs to close before other agents keep calling it fully green.
- The latest visual artifact predates the newest target-create product-code changes, even though those changes are not obviously visual.
- Mutating go-live smoke and deeper seeded target/opportunity fixtures remain intentionally outside the default hosted smoke profile.

## Current Standards And Time-Sensitive Notes

- [Playwright Authentication](https://playwright.dev/docs/auth): shared auth state is recommended only when tests do not mutate shared server-side state. Trusted Bums is aligned by keeping the mutating go-live path opt-in and cleanup-gated.
- [Playwright Best Practices](https://playwright.dev/docs/best-practices): user-visible locators and test isolation remain the right default. The current go-live and smoke specs should keep preferring role/name locators over implementation-detail selectors as target and opportunity flows change.
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security): JWT-backed access changes do not become visible until tokens refresh. Keep testing the production session-token shape instead of assuming a generic `authenticated` role.
- [Vitest Coverage Guide](https://main.vitest.dev/guide/coverage): current Vitest uses AST-remapped V8 coverage with Istanbul-grade accuracy, so the deferred coverage-report recommendation can stay on the faster V8 path.

## Access Requests And Evidence Gaps

- Apply `supabase/qa_authorization_seed.sql` in a protected QA database and run live role-scoped allow/deny checks against it.
- Run `corepack pnpm run qa:go-live` with the intended hosted QA accounts before external launch.
- Decide whether the next product-code release note requires a fresh `Visual UI Audit` run or a documented reuse rule when only docs/rules changed.
- Record the final `Deep QA (client)` result of `E2E Smoke` run `27177006002` in the release-facing handoff before anyone cites `41187e0` as the current fully-green head.

## Agent Inputs

- Date of run: 2026-06-08.
- Files, tests, routes, docs, workflows, and sources reviewed: `docs/agents/automation-prompts/trusted-bums-daily-qa-test-engineer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/qa-test-backlog.md`, `docs/release-verification-backlog.md`, `docs/qa-harness-reliability-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/codex-edit-log.md`, `docs/qa-authorization-fixtures.md`, `package.json`, `playwright.config.ts`, `scripts/verify-qa-env.mjs`, `scripts/qa-target-preflight.mjs`, [src/App.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/App.tsx), [src/lib/portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [src/test/customerTargetRules.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/customerTargetRules.test.ts), the `src/test` and `tests/e2e` suite inventory, GitHub workflow runs `27176979784`, `27176979797`, `27177006002`, `27175589606`, `27175589605`, `27175606654`, `27167324836`, and `27092527987`, official Playwright docs, official Supabase RLS docs, and official Vitest coverage docs.
- Checks run: sourced `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:target-preflight`; `corepack pnpm exec vitest run src/test/customerTargetRules.test.ts src/test/accessBoundaryRegression.test.ts src/test/qaAuthorizationFixtures.test.ts src/test/serviceRoleAuthorization.test.ts`; targeted `git show`, `git log`, `git diff`, `rg`, and `sed`; GitHub Actions inspection through `/Users/macdaddy/bin/gh-trustedbums`.
- Checks that could not run and why: current-head `E2E Smoke` run `27177006002` had not fully finished yet during this pass because `Deep QA (client)` was still running after smoke plus the admin and bum deep shards passed; no current-head hosted `Visual UI Audit` run exists yet; `qa:go-live` was not rerun because GitHub-hosted smoke/deep evidence was available and the go-live suite is a broader pre-launch gate rather than the narrowest reproduction check for this pass.
