# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-08 by Codex._

## Executive Read

Current head `3e9118c` is QA-green:

- GitHub `QA` run `27163785478`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27163785482`: passed.
- GitHub `E2E Smoke` run `27163818009`: passed.
- E2E smoke result: `32 passed, 8 skipped`.
- Deep QA matrix in `27163818009`: `admin`, `bum`, and `client` all passed.

The prior `28 passed, 12 skipped` smoke result was explained and improved. Four contact-intake boundary tests had been skipped because Supabase URL values were missing from the smoke context. After adding local `.env.qa` Supabase URL keys and adding repo-side fallback/blank-env handling, the non-mutating contact-intake checks run and pass in hosted smoke.

## Expected Skips

The current 8 skipped tests are expected for the default non-mutating hosted smoke profile:

- 2 skipped contact-send tests: mutating public contact submission remains disabled unless `QA_CONTACT_SMOKE_ENABLED=true` and a valid Turnstile token are provided.
- 4 skipped portal-interaction audit tests on `mobile-chrome`: those checks are desktop-only by design.
- 2 skipped Bum opportunity contact-picker tests: no live opportunity or target-account fixture is available for the non-mutating picker smoke.

These skips should stay documented until QA intentionally adds seeded fixtures or enables mutating smoke mode.

## Recently Fixed

### Contact-intake Supabase URL drift

- Evidence: `.env.qa` now has the public Supabase URL keys required by contact smoke.
- Repo fix: `tests/e2e/contact-intake.spec.ts` defaults to `https://vaoqvtxqvbptyxddpoju.supabase.co` when the Supabase URL env is absent.
- Hosted result: current smoke now runs the contact-intake boundary checks and passed with `32 passed, 8 skipped`.

### Blank GitHub env override

- Evidence: GitHub Actions supplied `QA_SUPABASE_FUNCTIONS_URL:` as a blank string. The test treated that as a real override and called `https://trustedbums.com/send-website-email` / `submit-contact`, which returned the SPA shell with HTTP `200`.
- Repo fix: `tests/e2e/contact-intake.spec.ts` now trims env values and treats blanks as unset.
- Local proof: desktop and mobile contact-intake boundary checks passed with blank `QA_SUPABASE_FUNCTIONS_URL` and blank `VITE_SUPABASE_URL`.

### Hosted app preflight transient fetch failure

- Evidence: one hosted run failed `qa:target-preflight` on a transient `fetch failed` / missing app shell while local `https://trustedbums.com` returned `HTTP/2 200`.
- Repo fix: `scripts/qa-target-preflight.mjs` now retries the hosted fetch before failing.
- Hosted result: current E2E smoke passed after the retry hardening.

## Active Recommendations

### P1 - Add seeded live allow/deny behavior coverage

- Scope: extension API, represented contacts, client-team/domain approval, profile bootstrap, finance exports, admin telemetry, and admin summary helpers.
- Why it matters: Route smoke can pass while direct data paths still need live positive and negative proof.
- Acceptance criteria: seeded fixtures prove owning-role success and unrelated-role denial for each high-risk boundary.

### P1 - Add current-head visual and accessibility gates

- Scope: hosted Visual UI Audit, screenshot assertions, and axe coverage for critical public and authenticated flows.
- Why it matters: the latest current-head smoke/deep evidence is green, but visual evidence still needs a fresh `3e9118c` or newer artifact.
- Acceptance criteria: current-head visual artifacts exist, at least one public and one authenticated screenshot assertion can fail CI, and axe checks cover critical flows.

### P1 - Expand contact and opportunity fixtures

- Scope: mutating contact-send smoke and Bum opportunity contact picker.
- Why it matters: 4 of the remaining 8 skips require either intentional mutation mode or stable live fixtures.
- Acceptance criteria: QA can choose between non-mutating release smoke and fixture-backed deep QA without confusing expected skips for defects.

### P2 - Add measured coverage reporting

- Scope: Vitest V8 coverage.
- Why it matters: current tests are broader, but coverage is still inferred rather than measured.
- Acceptance criteria: `pnpm run coverage` emits a tracked report with agreed thresholds.

## Access And Fixture Requests

- Provide or generate safe seeded multi-company QA fixtures for access-boundary proof.
- Provide a valid Turnstile/contact-smoke path only if mutating public contact submissions should be part of release smoke.
- Provide stable opportunity/target-account fixture data if the Bum contact-picker smoke should stop skipping.
- Provide a current-head Visual UI Audit artifact for `3e9118c` or newer.

## Agent Inputs

- Date of run: 2026-06-08.
- Evidence reviewed: GitHub runs `27163785478`, `27163785482`, and `27163818009`; local contact-intake reproduction; `tests/e2e/contact-intake.spec.ts`; `scripts/qa-target-preflight.mjs`; `.env.qa` key presence without printing secret values; and current `git status`.
