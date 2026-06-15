# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-15 by Codex TB-0054 fix handoff._

## Executive Read

Current `main` head `7ee97c1` is clean on the exact-head hosted lanes QA already owns:

- GitHub `QA` run `27469969615` on `7ee97c1`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27469969636` on `7ee97c1`: passed.
- GitHub `E2E Smoke` run `27469985957` on `7ee97c1`: passed `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- GitHub `Visual UI Audit` run `27488973899` on `7ee97c1`: passed.

Current-session local preflight and narrow contract or harness regressions are also still green once `.env.qa` is sourced:

- Raw `corepack pnpm run qa:env`: fails in a fresh shell because the QA variables are not exported by default.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`: passed.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`: passed against `https://trustedbums.com` with DNS, HTTPS, app shell, and Clerk checks green.
- Targeted consent, contract, and harness pack passed: `src/test/googleAnalyticsConsent.test.tsx`, `src/test/e2eSmokeRegression.test.ts`, `src/test/deepQaTriage.test.ts`, `src/test/qaTargetPreflight.test.ts`, `src/test/extensionApiContract.test.ts`, and `src/test/bumSavedItems.test.ts` (`30` tests total).

The QA handoff drift from 2026-06-14 is now corrected: the current-head visual lane is no longer pending. [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) now records `GO` for current head `7ee97c1`, and live tracker row `TB-0019` is closed. Release truth is still incomplete because the standalone `Deep QA Hotfix Audit` workflow is still stale on older head `850e507`, though the embedded deep shards inside `27469985957` are current exact-head proof. The active QA queue remains:

- `[TB-0054]` has a local artifact-routing fix, but still needs successor hosted smoke and failure-path artifact proof.
- `[TB-0086]` the manual Bum contact mutation still has no focused authenticated mutation proof or cleanup-backed regression.
- `[TB-0091]` the extension API still lacks executable negative-path and abuse-control contract proof beyond the current source and contract assertions.

## Active Recommendations

### P1 - Resolve the standalone Deep QA expectation
- Evidence: Current `main` is `7ee97c1`, [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) now records `GO` for `7ee97c121918bba73149748b49f2b28133c7ffbb`, and hosted `QA` `27469969615`, deploy `27469969636`, `E2E Smoke` `27469985957`, and `Visual UI Audit` `27488973899` all passed on `7ee97c1`. The only code diff from `9546563` to `7ee97c1` is the GA4 consent page-view fix in [`src/components/GoogleAnalytics.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/GoogleAnalytics.tsx) plus its updated test in [`src/test/googleAnalyticsConsent.test.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/googleAnalyticsConsent.test.tsx). The latest standalone `Deep QA Hotfix Audit` run, `27092527987`, is still stale on `850e507`.
- Why it matters: QA no longer has a stale Code Review blocker for this head, but Release Verification and Agent Operations should stop treating the standalone deep lane as silently current when only the embedded deep shards are exact-head.
- Recommendation: If release policy still expects a distinct standalone deep artifact, rerun `Deep QA Hotfix Audit` on `7ee97c1`; otherwise explicitly demote that standalone lane from the release gate and rely on the embedded deep shards already passing inside `27469985957`.
- Acceptance criteria: the release docs stop treating the standalone deep lane as implicitly current without either a rerun or an explicit policy update.

### P1 - [TB-0054] Move `qa-target-preflight` artifacts out of Playwright's `test-results/` root
- Evidence: A fresh artifact download for exact-head `E2E Smoke` run `27469985957` on `7ee97c1` still returned `matches=0` for `summary.json` and `summary.txt`. Local fix work on 2026-06-15 now moves the default output to `qa-target-preflight-artifacts`, wires both smoke and deep workflows to upload that directory explicitly, and adds regression coverage that fails if workflow upload wiring disappears.
- Why it matters: QA and Release Verification still lose the exact DNS, HTTPS, app-shell, and Clerk preflight evidence on successful runs and on later route failures, which makes env-drift triage slower and less specific than it should be.
- Recommendation: Keep `TB-0054` pending hosted verification until a successor smoke artifact and a later failure-path artifact both preserve `summary.json` and `summary.txt`.
- Acceptance criteria: a passing smoke run and a later failing smoke or deep run both preserve downloadable `summary.json` and `summary.txt`.

### P1 - [TB-0086] Add focused regression coverage for manual Bum contact creation
- Evidence: [`src/pages/bum/BumContacts.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx) still exposes the real `Add contact` mutation flow, and [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts) still routes it through `createBumRepresentedContact()` into the live `portal-contacts` path. Exact-head hosted `E2E Smoke` `27469985957` proves the Bum route still loads on `7ee97c1`, and the only repo diff since `9546563` is the GA4 consent page-view fix, so this surface remains functionally unchanged. This run's source and test scan still found no focused Vitest or Playwright proof that opens the dialog, validates required-name handling, creates a tagged manual contact, verifies the page update, and cleans the row back out.
- Why it matters: Route-load coverage is not mutation coverage. A Bum-visible write path is still missing the focused proof that would catch validation, optimistic cache, cleanup, or visibility regressions before they reach Bums.
- Recommendation: Add one focused source or component contract for required-name handling plus optimistic cache behavior, and one authenticated browser mutation proof that creates a tagged manual contact, verifies it appears on the page, and removes it cleanly.
- Acceptance criteria: exact-head or successor QA proves `Add contact` opens and validates correctly, a tagged manual contact can be created and observed on the page, cleanup returns the fixture state to zero residue, and the row remains invisible to unrelated roles in the approved allow or deny matrix.

### P1 - [TB-0091] Add executable extension API negative-path and abuse-control contract coverage
- Evidence: Current exact-head contract coverage in [`src/test/extensionApiContract.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/extensionApiContract.test.ts) still passes as part of the current 30-test QA pack and proves versioning, bearer-envelope stability, CORS origin whitelisting, Bum target-account scoping, and marketplace locking semantics. This run still found no executable proof for forged or wrong-issuer JWTs, invalid destination combinations, mismatched destination types, cross-company denial, idempotent retry, or direct `extension_page_captures` allow or deny behavior.
- Why it matters: The extension API is still the only current partner-style API contract. Native, mobile, or future partner work should not depend on it until its error, auth, idempotency, and abuse-control behavior is proven by tests instead of only documented or source-reviewed.
- Recommendation: Add focused unit or source tests and hosted smoke coverage for invalid request combinations, stable error envelope, idempotent retry, CORS allow or deny, forged or wrong-issuer token rejection, cross-company denial, and direct table allow or deny behavior. Pair the QA work with Security's rate-limit or equivalent abuse-control implementation.
- Acceptance criteria: the extension API has passing negative-path contract tests, at least one hosted authenticated allow path, stable deny proof for unauthenticated, invalid, or cross-scope calls, and direct `extension_page_captures` table mutation denial proof for exposed roles.

## Business Access Coverage

### Client opportunity publish, delete, claim-status, and details workflows
- Roles: Client Admin and Client Member allow for the intended company-scoped claim review or status updates; Client Admin allow for company-owned unclaimed opportunity delete and publish or draft updates; Client Finance deny for these management actions; unrelated client companies, unrelated Bums, Public Visitor, and direct cross-company access deny; Admin may troubleshoot or override where business rules allow.
- Current proof: The only code diff from `9546563` to `7ee97c1` is the GA4 consent page-view change, so the existing client workflow source contracts remain code-identical on the current head. Exact-head hosted `E2E Smoke` `27469985957` also passed the `Deep QA (client)` shard on `7ee97c1`.
- Missing allow or deny proof: this run still did not execute a direct Client Finance deny, cross-company deny, claimed-opportunity delete denial, or authenticated browser interaction that opens the newer pipeline `Details` panel on seeded current-head data. Current proof is source-backed plus hosted route execution, not a fresh seeded data-path matrix.
- Seed data needed: at least two client companies, one Client Admin, one Client Member, one Client Finance account, one unclaimed opportunity, one claimed opportunity, one approved claim, and one unrelated company record for deny checks.

### Bum represented contacts
- Roles: Bum allow only for their own represented-contact records or explicitly entitled records; unrelated Bums and client-company users deny unless a documented business rule grants visibility; Admin may troubleshoot.
- Current proof: The route itself is still present in current hosted coverage through exact-head `E2E Smoke` `27469985957`, and the business rule still lives in [`docs/business-access-rules.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md).
- Missing allow or deny proof: one allowed own-manual-contact create or read case, one denied foreign-Bum read, one denied client-company read where visibility is not intended, and any approved Admin rescue proof.
- Seed data needed: at least two Bums, one tagged manual contact, one denied cross-Bum read case, and one explicit visibility decision for whether any client-facing route should ever surface manual represented contacts.

## Cross-Agent Follow-Ups

### Release Verification / Lead Developer / Code Review Agent - exact-head Code Review is current on `7ee97c1`
- Evidence: exact-head `QA` `27469969615`, deploy `27469969636`, `E2E Smoke` `27469985957`, and `Visual UI Audit` `27488973899` are green on `7ee97c1`. [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) now records `GO` for `7ee97c121918bba73149748b49f2b28133c7ffbb`, and `TB-0019` is closed in the live tracker.
- Requested action: keep `TB-0019` closed unless `main` advances again, and stop carrying forward QA wording that treats exact-head Code Review or visual evidence as pending.

### Release Verification / Agent Operations - decide whether standalone Deep QA is still a required release lane
- Evidence: the embedded deep admin, client, and bum shards inside `27469985957` are current exact-head proof on `7ee97c1`, but the standalone `Deep QA Hotfix Audit` workflow is still stale at `27092527987` on `850e507`.
- Requested action: either rerun the standalone workflow on `7ee97c1` or update the release guidance so the embedded deep shards are the accepted exact-head deep proof.

### QA Harness Reliability - keep `TB-0054` on current-head artifact durability
- Evidence: exact-head `E2E Smoke` `27469985957` is green on `7ee97c1`, but a fresh artifact download still returned `matches=0` for the `qa-target-preflight` summaries. Local fix work now writes summaries to `qa-target-preflight-artifacts/` and uploads that directory explicitly.
- Requested action: run or inspect a successor hosted smoke artifact and one failure-path artifact before closing `TB-0054`.

### Security / Lead Developer - extension API contract coverage is still source-heavy, not hostile-input proven
- Evidence: current exact-head contract tests prove documentation and some API invariants, but this run still found no executable deny-path proof for forged tokens, bad destinations, cross-company misuse, or idempotent retry on the live contract surface.
- Requested action: pair Security's abuse-control work with QA's negative-path contract coverage so the next extension or mobile consumer is not relying on source-only assumptions.

## Coverage Map

- Current exact-head hosted evidence on `7ee97c1`:
  - GitHub `QA` run `27469969615`
  - GitHub `Deploy TrustedBums to DreamHost` run `27469969636`
  - GitHub `E2E Smoke` run `27469985957`
  - GitHub `Visual UI Audit` run `27488973899`
  - `27469985957` jobs: `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`
- Current deep-QA context:
  - embedded deep shards passed inside `27469985957` on `7ee97c1`
  - standalone `Deep QA Hotfix Audit` run `27092527987` passed on older head `850e507`
- Current local green in this run:
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`
  - `corepack pnpm exec vitest run src/test/googleAnalyticsConsent.test.tsx src/test/e2eSmokeRegression.test.ts src/test/deepQaTriage.test.ts src/test/qaTargetPreflight.test.ts src/test/extensionApiContract.test.ts src/test/bumSavedItems.test.ts`
- Current local caveat:
  - raw `corepack pnpm run qa:env` still fails in a fresh shell because required QA variables are not exported by default
- Current exact-head artifact check:
  - a fresh download of `27469985957` still returned `matches=0` for `qa-target-preflight` `summary.json` and `summary.txt`; local fix work now needs successor hosted artifact proof

## Watchlist

- Do not reopen `TB-0019` unless `main` advances beyond `7ee97c1` or the Code Review marker is invalidated.
- Do not treat the stale standalone `Deep QA Hotfix Audit` run as fresh exact-head proof unless release policy explicitly says the embedded deep shards are enough.
- Do not treat current source-string or contract tests for client claim-status, delete, claimed-field edit lock, or pipeline-details flows as sufficient direct RLS or seeded authorization proof.
- Do not treat `/bum/contacts` route presence as proof that the manual `Add contact` mutation is regression-covered.
- Do not treat the current extension API contract suite as proof of hostile-input handling, cross-company denial, or write-surface allow or deny behavior.

## Current Standards And Time-Sensitive Notes

- Playwright's current best-practices guidance still centers tests on user-visible behavior, resilient locators, and isolated state. That supports keeping the manual-contact coverage gap focused on one real authenticated mutation proof instead of hiding it inside broad smoke. Sources: [Playwright Best Practices](https://playwright.dev/docs/best-practices), [Playwright Actionability](https://playwright.dev/docs/actionability).
- Vitest's current guidance still emphasizes explicit mocking and controlled test context. That supports adding narrow source or component contracts for new write or API branches instead of relying on brittle file-global string checks. Sources: [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html), [Vitest Test Context](https://vitest.dev/guide/test-context).
- GitHub's current artifact guidance still expects workflows to upload exactly the files they need to preserve. That keeps `TB-0054` pointed at an explicit preflight artifact directory instead of Playwright-managed `test-results/`. Source: [Store and share data with workflow artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data).

## Access Requests And Evidence Gaps

- Provide cleanup-safe QA authority for mutating browser coverage when a test must create and remove tagged rows.
- Provide seeded represented-contact fixtures for one allowed own-Bum case, one denied foreign-Bum case, and one denied client-company case.
- Provide seeded multi-company client fixtures for one allowed claim-status update, one denied Client Finance update, one allowed unclaimed opportunity delete, one denied claimed-opportunity delete, and one denied cross-company attempt.
- Keep direct SQL and tracker-write access stable across specialist shells so QA can complete the required `/admin/scrum` closeout sweep in the same run instead of relying on cross-run tracker freshness.

## Agent Inputs

- Date of run: 2026-06-15.
- Files, docs, workflows, artifacts, live tracker rows, internet sources, and commands reviewed:
  - current role prompt and shared rules in `docs/agents/automation-prompts/trusted-bums-daily-qa-test-engineer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, and `docs/agents/business-access-rules.md`
  - current QA, harness, release, lead, edit-log, access-needs, and business-access docs
  - `git status --short`
  - `git rev-parse HEAD`
  - `git log -1 --format='%ci %h %s'`
  - `git diff --stat 9546563..HEAD -- src tests .github package.json docs`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 30 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow 'Deep QA Hotfix Audit' --limit 10 --json ...`
  - fresh artifact download check for `27469985957` showing `matches=0` for `summary.json` and `summary.txt`
  - raw `corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`
  - `corepack pnpm exec vitest run src/test/googleAnalyticsConsent.test.tsx src/test/e2eSmokeRegression.test.ts src/test/deepQaTriage.test.ts src/test/qaTargetPreflight.test.ts src/test/extensionApiContract.test.ts src/test/bumSavedItems.test.ts`
  - source review of [`src/components/GoogleAnalytics.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/GoogleAnalytics.tsx), [`src/pages/bum/BumContacts.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumContacts.tsx), [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [`src/test/extensionApiContract.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/extensionApiContract.test.ts), [`scripts/qa-target-preflight.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/qa-target-preflight.mjs), [`.github/workflows/e2e-smoke.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/e2e-smoke.yml), and [`.github/workflows/deep-qa-hotfix-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deep-qa-hotfix-audit.yml)
  - live Supabase `public.admin_scrum_items` reads and refreshes for `TB-0019`, `TB-0054`, `TB-0086`, and `TB-0091`
  - current official testing and artifact guidance reviewed:
    - [Playwright Best Practices](https://playwright.dev/docs/best-practices)
    - [Playwright Actionability](https://playwright.dev/docs/actionability)
    - [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
    - [Vitest Test Context](https://vitest.dev/guide/test-context)
    - [Store and share data with workflow artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data)
- Checks that could not fully close and why:
  - exact-head Code Review now exists for `7ee97c1`, and `TB-0019` is closed
  - no fresh standalone `Deep QA Hotfix Audit` run exists yet for `7ee97c1`
  - no seeded direct allow or deny proof was executed for the client claim-status and unclaimed-opportunity delete paths in this session
  - no authenticated browser mutation run created and cleaned a manual represented contact in this session
