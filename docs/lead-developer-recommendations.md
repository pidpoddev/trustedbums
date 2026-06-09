# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-08 by Codex._

## Executive Read

The old extension-preflight `NO-GO` is still closed, but the repo moved beyond the last fully-documented green head. Current `main` is `41187e0`:

- GitHub `QA` run `27176979784` on `41187e0`: passed.
- DreamHost deploy run `27176979797` on `41187e0`: passed.
- GitHub `E2E Smoke` run `27177006002` on `41187e0`: smoke passed, `Deep QA (admin)` and `Deep QA (bum)` passed, and `Deep QA (client)` was still running at review time.

The latest completed product-code release proof is still green on `73f0b06`:

- GitHub `QA` run `27175589606`: passed.
- DreamHost deploy run `27175589605`: passed.
- GitHub `E2E Smoke` run `27175606654`: passed.
- Deep QA matrix in that E2E run passed for `admin`, `bum`, and `client`.

The latest hosted visual artifact is still GitHub `Visual UI Audit` run `27167324836` on `441fd92`, which passed with `18 passed`. Do not keep calling `441fd92` the current fully-green head after `27177006002` settles; refresh the release-facing docs to the real head.

## Current Classifications

- `Release smoke/deploy state`: `PENDING CURRENT-HEAD CLIENT DEEP QA`. Current head `41187e0` has green QA, deploy, smoke, and passed `Deep QA (admin)` plus `Deep QA (bum)` evidence, but `Deep QA (client)` in `27177006002` was still running during this review.
- `Latest completed product-code smoke/deep state`: `GREEN`. `73f0b06` passed QA, deploy, E2E smoke, and deep shards.
- `Remaining E2E skips`: `EXPECTED`. They are fixture/mode/design skips, not unexplained failures.
- `Public and client recovery UX`: `SHIPPED`. Signup company-name retention, inline public contact recovery, client blocked-state messaging, and agreement recovery routing are in current `main`.
- `Seeded access-boundary proof`: `NEEDS QA PROOF`. Source and regression coverage are stronger, but seeded live allow/deny fixtures remain the durable next QA layer.
- `Current-head visual audit`: `STALE VS HEAD`. Latest visual artifact is still `27167324836` on `441fd92`; decide whether to reuse it explicitly or rerun it after `27177006002`.
- `Exact Code Review marker`: `WAIVED FOR 441fd92 ONLY`. Do not assume that waiver applies to later heads automatically.
- `Supabase Auth leaked-password protection`: `BLOCKED BY PLAN/ACCESS`. Still depends on Supabase plan capability.
- `External DNS rcdl.tplinkdns.com`: `INFRASTRUCTURE FOLLOW-UP`. Trusted Bums testing remains constrained to port `8080`; `rcdl.tplinkdns.com` is external DNS context, not the primary release target.

## Recommended Implementation Queue

### P1 - Refresh the release ledger after current-head smoke closes

- Classification: `READY`.
- Why now: QA found that the lead doc still names `441fd92` as the current fully-green head even though `main` is now `41187e0` and `Deep QA (client)` in `27177006002` is still in flight.
- Acceptance criteria: release-facing docs name `41187e0`, record the final result of `27177006002`, and state whether `27167324836` is intentionally reused visual evidence or needs replacement.
- Validation: GitHub run review plus doc diff.

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
- Evidence reviewed: current head `41187e0`, GitHub runs `27176979784`, `27176979797`, `27177006002`, `27175589606`, `27175589605`, `27175606654`, and `27167324836`, plus the QA backlog refresh.
