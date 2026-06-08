# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-08 by Codex._

## Executive Read

The prior release blocker is closed. Current `main` is `441fd92`, and the hosted gates for that head are green:

- GitHub `QA` run `27167307017`: passed.
- DreamHost deploy run `27167306961`: passed.
- GitHub `E2E Smoke` run `27167339658`: passed.
- GitHub `Visual UI Audit` run `27167324836`: passed.
- Smoke result: `34 passed, 6 skipped`.
- Deep QA matrix in that E2E run passed for `admin`, `bum`, and `client`.
- Visual UI Audit passed with `18 passed`.

The old docs that framed the release as `NO-GO` because of missing `QA_EXTENSION_API_BASE_URL` / `QA_EXTENSION_API_TOKEN` were stale. The current issue that caused the 12 skipped E2E count was different: the contact-intake smoke path skipped because Supabase URL env values were missing, and then briefly failed because GitHub supplied a blank `QA_SUPABASE_FUNCTIONS_URL` override. Both are fixed.

The remaining 6 smoke skips are expected under the current non-mutating profile: 2 mutating contact-send checks and 4 desktop-only portal-interaction checks on mobile. The Bum contact-picker smoke checks now pass after the QA selector was updated to the current `Claim intro` action.

## Current Classifications

- `Release smoke/deploy/visual state`: `GREEN`. Current head `441fd92` has green QA, deploy, smoke, deep QA, and Visual UI Audit evidence.
- `Remaining E2E skips`: `EXPECTED`. They are fixture/mode/design skips, not unexplained failures.
- `Public and client recovery UX`: `SHIPPED`. Signup company-name retention, inline public contact recovery, client blocked-state messaging, and agreement recovery routing are in current `main`.
- `Seeded access-boundary proof`: `NEEDS QA PROOF`. Source and regression coverage are stronger, but seeded live allow/deny fixtures remain the durable next QA layer.
- `Current-head visual audit`: `GREEN`. GitHub run `27167324836` passed on `441fd92`.
- `Exact Code Review marker`: `WAIVED FOR 441fd92`. `.codex-review-decision.json` still points at `c9b7b07`, but the current cleanup records a release waiver because current-head hosted QA, deploy, E2E, and Visual UI Audit all passed and the final code delta was QA-selector-only.
- `Supabase Auth leaked-password protection`: `BLOCKED BY PLAN/ACCESS`. Still depends on Supabase plan capability.
- `External DNS rcdl.tplinkdns.com`: `INFRASTRUCTURE FOLLOW-UP`. Trusted Bums testing remains constrained to port `8080`; `rcdl.tplinkdns.com` is external DNS context, not the primary release target.

## Recommended Implementation Queue

### Closed - Ship the release-state doc cleanup

- Classification: `DONE`.
- Why now: The repo evidence is green, but stale docs still point at old failed runs and old `NO-GO` language. That creates bad scrum decisions.
- Acceptance criteria: `docs/release-verification-backlog.md`, `docs/qa-test-backlog.md`, and this file all point at current head `441fd92`, current green runs, and the expected 6-skip explanation.
- Validation: doc diff review plus current GitHub run ids.

### Closed - Ship public and client recovery-path fixes

- Classification: `DONE`.
- Source areas: [src/components/SignupIntentDialog.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx), [src/pages/Index.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx), [src/components/ClientAccessRoute.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/ClientAccessRoute.tsx), [src/pages/client/ClientDashboard.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [src/pages/client/ClientAgreements.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientAgreements.tsx), and [src/pages/client/ClientTerms.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientTerms.tsx).
- Recommended fix: Preserve manually entered client company names in signup, replace toast-only homepage contact-form recovery with inline errors plus reassurance, show a clear blocked-client next-step notice, route agreement recovery directly to agreement/terms surfaces, and make any agreement deferral wording session-scoped.
- Acceptance criteria: Editing signup email no longer clears a typed company name; contact-form errors are inline and accessible; blocked client users see a clear recovery path; agreement recovery no longer routes through unrelated profile surfaces.
- Validation: targeted unit/E2E tests, hosted E2E smoke, and fresh visual audit passed.

### P1 - Add seeded live allow/deny proof for access boundaries

- Classification: `NEEDS QA PROOF`.
- Source areas: extension API, represented contacts, client-team/domain approval, profile bootstrap, finance-safe exports, and admin telemetry.
- Recommended fix: Build a seeded multi-company QA fixture set and prove allowed and denied behavior for each high-risk role/data boundary.
- Acceptance criteria: Each high-risk path has at least one allowed and one denied seeded case, and created records are cleanup-safe or tagged as QA records.
- Validation: hosted E2E/deep QA plus targeted Supabase log review when useful.

### Closed - Run current-head visual audit

- Classification: `DONE`.
- Evidence: GitHub `Visual UI Audit` run `27167324836` passed on `441fd92` with `18 passed`.
- Acceptance criteria: Current-head screenshots exist for public, Bum, Client, and Admin views.

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
- Evidence reviewed: current head `441fd92`, GitHub runs `27167307017`, `27167306961`, `27167339658`, and `27167324836`, local focused QA selector checks, current `git status`, and release/QA backlog stale sections.
