# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-08 by Codex._

## Executive Read

The prior release blocker is closed. Current `main` is `3e9118c`, and the hosted gates for that head are green:

- GitHub `QA` run `27163785478`: passed.
- DreamHost deploy run `27163785482`: passed.
- GitHub `E2E Smoke` run `27163818009`: passed.
- Smoke result: `32 passed, 8 skipped`.
- Deep QA matrix in that E2E run passed for `admin`, `bum`, and `client`.

The old docs that framed the release as `NO-GO` because of missing `QA_EXTENSION_API_BASE_URL` / `QA_EXTENSION_API_TOKEN` were stale. The current issue that caused the 12 skipped E2E count was different: the contact-intake smoke path skipped because Supabase URL env values were missing, and then briefly failed because GitHub supplied a blank `QA_SUPABASE_FUNCTIONS_URL` override. Both are fixed.

The remaining 8 smoke skips are expected under the current non-mutating profile: 2 mutating contact-send checks, 4 desktop-only portal-interaction checks on mobile, and 2 Bum contact-picker checks that need seeded live opportunity fixtures.

## Current Classifications

- `Release smoke/deploy state`: `GREEN`. Current head `3e9118c` has green QA, deploy, smoke, and deep QA evidence.
- `Remaining E2E skips`: `EXPECTED`. They are fixture/mode/design skips, not unexplained failures.
- `Public and client recovery UX`: `READY`. This is the next product-code bundle.
- `Seeded access-boundary proof`: `NEEDS QA PROOF`. Source and regression coverage are stronger, but seeded live allow/deny fixtures remain the durable next QA layer.
- `Current-head visual audit`: `SHOULD RUN`. Not a blocker for the just-fixed smoke state, but useful before broad launch claims.
- `Exact Code Review marker`: `SHOULD REFRESH OR WAIVE`. Check `.codex-review-decision.json` before treating this as a formal release record.
- `Supabase Auth leaked-password protection`: `BLOCKED BY PLAN/ACCESS`. Still depends on Supabase plan capability.
- `External DNS rcdl.tplinkdns.com`: `INFRASTRUCTURE FOLLOW-UP`. Trusted Bums testing remains constrained to port `8080`; `rcdl.tplinkdns.com` is external DNS context, not the primary release target.

## Recommended Implementation Queue

### P0 - Ship the release-state doc cleanup

- Classification: `IN PROGRESS`.
- Why now: The repo evidence is green, but stale docs still point at old failed runs and old `NO-GO` language. That creates bad scrum decisions.
- Acceptance criteria: `docs/release-verification-backlog.md`, `docs/qa-test-backlog.md`, and this file all point at current head `3e9118c`, current green runs, and the expected 8-skip explanation.
- Validation: doc diff review plus current GitHub run ids.

### P1 - Ship public and client recovery-path fixes

- Classification: `READY`.
- Source areas: [src/components/SignupIntentDialog.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx), [src/pages/Index.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx), [src/components/ClientAccessRoute.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/ClientAccessRoute.tsx), [src/pages/client/ClientDashboard.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [src/pages/client/ClientAgreements.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), and [src/pages/client/ClientTerms.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx).
- Recommended fix: Preserve manually entered client company names in signup, replace toast-only homepage contact-form recovery with inline errors plus reassurance, show a clear blocked-client next-step notice, route agreement recovery directly to agreement/terms surfaces, and make any agreement deferral wording session-scoped.
- Acceptance criteria: Editing signup email no longer clears a typed company name; contact-form errors are inline and accessible; blocked client users see a clear recovery path; agreement recovery no longer routes through unrelated profile surfaces.
- Validation: targeted unit/E2E tests, hosted E2E smoke, and fresh visual audit.

### P1 - Add seeded live allow/deny proof for access boundaries

- Classification: `NEEDS QA PROOF`.
- Source areas: extension API, represented contacts, client-team/domain approval, profile bootstrap, finance-safe exports, and admin telemetry.
- Recommended fix: Build a seeded multi-company QA fixture set and prove allowed and denied behavior for each high-risk role/data boundary.
- Acceptance criteria: Each high-risk path has at least one allowed and one denied seeded case, and created records are cleanup-safe or tagged as QA records.
- Validation: hosted E2E/deep QA plus targeted Supabase log review when useful.

### P1 - Run current-head visual audit

- Classification: `READY`.
- Recommended fix: Trigger hosted Visual UI Audit for `3e9118c` or newer after the doc cleanup.
- Acceptance criteria: Current-head screenshots exist and are reviewed for public, Bum, Client, and Admin views.

### P2 - Canonical host and trust headers

- Classification: `READY`.
- Recommended fix: Continue canonical-host, route metadata, HSTS, referrer/framing/permissions policy, and CSP work as a bundled trust-hardening pass.
- Acceptance criteria: `https://trustedbums.com` remains the canonical public host; response headers and route metadata are verified after deploy.

## Lead Notes

- Do not reopen the old extension-preflight `NO-GO` from `4402ace`; it is stale.
- Do not use port `8081`. Trusted Bums testing may use port `8080` only.
- Keep `rcdl.tplinkdns.com` as external DNS context, but use `https://trustedbums.com` for current hosted release evidence until the external DNS TLS path is proven.
- Keep the unrelated specialist doc edits intact unless the user asks to package or push the full doc batch.

## Agent Inputs

- Date of run: 2026-06-08.
- Evidence reviewed: current head `3e9118c`, GitHub runs `27163785478`, `27163785482`, and `27163818009`, local contact-intake reproduction, current `git status`, and release/QA backlog stale sections.
