# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-08 by Codex._

## Executive Read

Current head `441fd92` is QA-green:

- GitHub `QA` run `27167307017`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27167306961`: passed.
- GitHub `E2E Smoke` run `27167339658`: passed.
- GitHub `Visual UI Audit` run `27167324836`: passed.
- E2E smoke result: `34 passed, 6 skipped`.
- Deep QA matrix in `27167339658`: `admin`, `bum`, and `client` all passed.
- Visual UI Audit result: `18 passed`.

The prior `28 passed, 12 skipped` smoke result was explained and improved. Four contact-intake boundary tests had been skipped because Supabase URL values were missing from the smoke context. After adding local `.env.qa` Supabase URL keys and adding repo-side fallback/blank-env handling, the non-mutating contact-intake checks run and pass in hosted smoke. Two additional Bum contact-picker smoke checks now pass after the QA selector was updated to the current `Claim intro` action.

## Expected Skips

The current 6 skipped tests are expected for the default non-mutating hosted smoke profile:

- 2 skipped contact-send tests: mutating public contact submission remains disabled unless `QA_CONTACT_SMOKE_ENABLED=true` and a valid Turnstile token are provided.
- 4 skipped portal-interaction audit tests on `mobile-chrome`: those checks are desktop-only by design.

These skips should stay documented until QA intentionally adds seeded fixtures or enables mutating smoke mode.

## Recently Fixed

### Contact-intake Supabase URL drift

- Evidence: `.env.qa` now has the public Supabase URL keys required by contact smoke.
- Repo fix: `tests/e2e/contact-intake.spec.ts` defaults to `https://vaoqvtxqvbptyxddpoju.supabase.co` when the Supabase URL env is absent.
- Hosted result: current smoke now runs the contact-intake boundary checks and passed with `34 passed, 6 skipped`.

### Blank GitHub env override

- Evidence: GitHub Actions supplied `QA_SUPABASE_FUNCTIONS_URL:` as a blank string. The test treated that as a real override and called `https://trustedbums.com/send-website-email` / `submit-contact`, which returned the SPA shell with HTTP `200`.
- Repo fix: `tests/e2e/contact-intake.spec.ts` now trims env values and treats blanks as unset.
- Local proof: desktop and mobile contact-intake boundary checks passed with blank `QA_SUPABASE_FUNCTIONS_URL` and blank `VITE_SUPABASE_URL`.

### Hosted app preflight transient fetch failure

- Evidence: one hosted run failed `qa:target-preflight` on a transient `fetch failed` / missing app shell while local `https://trustedbums.com` returned `HTTP/2 200`.
- Repo fix: `scripts/qa-target-preflight.mjs` now retries the hosted fetch before failing.
- Hosted result: current E2E smoke passed after the retry hardening.

### Bum contact-picker QA selector drift

- Evidence: Visual UI Audit and staging smoke still looked for the retired `I know someone` CTA while the current Bum opportunity UI uses `Claim intro`.
- Repo fix: `tests/e2e/staging-smoke.spec.ts` and `tests/e2e/visual-ui-audit.spec.ts` now open the contact picker through `Claim intro`.
- Hosted result: current E2E smoke improved to `34 passed, 6 skipped`, and current Visual UI Audit passed with `18 passed`.

## Active Recommendations

### P1 - Add seeded live allow/deny behavior coverage

- Business Access Coverage remains the named proof lane until seeded live fixtures are applied and exercised. The repo now has an opt-in seed artifact in `supabase/qa_authorization_seed.sql`, documented in `docs/qa-authorization-fixtures.md`, plus a source-level fixture contract test in `src/test/qaAuthorizationFixtures.test.ts`.
- Scope: extension API, represented contacts, client-team/domain approval, profile bootstrap, finance exports, admin telemetry, and admin summary helpers.
- Required areas: Extension API destinations and page captures; Bum represented contacts; Client team, domain approval, and access-role assignment.
- Why it matters: Route smoke can pass while direct data paths still need live positive and negative proof.
- Acceptance criteria: QA applies the seed in a protected local or staging database, maps real Clerk QA ids when browser-authenticated coverage is required, and proves owning-role success plus unrelated-role denial for each high-risk boundary.

### P1 - Add current-head visual and accessibility gates

- Scope: hosted Visual UI Audit, screenshot assertions, and axe coverage for critical public and authenticated flows.
- Why it matters: current-head visual evidence is green, but screenshot assertions and axe coverage can still become stronger regression gates.
- Acceptance criteria: current-head visual artifacts stay fresh, at least one public and one authenticated screenshot assertion can fail CI, and axe checks cover critical flows.

### P1 - Expand contact and opportunity fixtures

- Scope: mutating contact-send smoke and Bum opportunity contact picker.
- Why it matters: 2 of the remaining 6 skips require intentional mutation mode, and seeded fixtures remain useful for deeper Bum opportunity flows beyond release smoke.
- Acceptance criteria: QA can choose between non-mutating release smoke and fixture-backed deep QA without confusing expected skips for defects.

### P2 - Add measured coverage reporting

- Scope: Vitest V8 coverage.
- Why it matters: current tests are broader, but coverage is still inferred rather than measured.
- Acceptance criteria: `pnpm run coverage` emits a tracked report with agreed thresholds.

## Access And Fixture Requests

- Apply `supabase/qa_authorization_seed.sql` in a protected QA database and add direct role-scoped allow/deny assertions against it.
- Provide a valid Turnstile/contact-smoke path only if mutating public contact submissions should be part of release smoke.
- Provide stable opportunity/target-account fixture data for deeper Bum opportunity workflows beyond the now-passing non-mutating contact-picker smoke.
- Keep current-head Visual UI Audit artifacts fresh for future product-code changes.

## Agent Inputs

- Date of run: 2026-06-08.
- Evidence reviewed: GitHub runs `27167307017`, `27167306961`, `27167339658`, and `27167324836`; local contact-intake and QA selector reproduction; `tests/e2e/contact-intake.spec.ts`; `tests/e2e/staging-smoke.spec.ts`; `tests/e2e/visual-ui-audit.spec.ts`; `scripts/qa-target-preflight.mjs`; `.env.qa` key presence without printing secret values; and current `git status`.
