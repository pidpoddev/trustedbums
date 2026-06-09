# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-08 by Codex daily release verification automation._

## Release Decision

Decision: HOTFIX-FORWARD for the current deployed head `9f42bf4`.

The deployed app is not showing a confirmed live product outage: DreamHost deploy, hosted smoke, and all three deep shards passed on `9f42bf4`, and `https://trustedbums.com` returned `HTTP 200` with current security headers. The release evidence is still not clean enough to call `GO` because the authoritative GitHub `QA` workflow is red on the exact head, the exact-commit Code Review marker is stale, and the visible landing-page and marketing-copy changes have no matching current-head `Visual UI Audit` artifact.

## Evidence Summary

- Current `main` head: `9f42bf4` (`Restore Client marketing copy`).
- Prior visible route change still in scope on current head: `0ee2f44` (`Split public Client and Bum landing pages`).
- GitHub `Deploy TrustedBums to DreamHost` run `27178512660` on `9f42bf4`: passed.
- GitHub `E2E Smoke` run `27178530411` on `9f42bf4`: passed.
- Deep QA matrix inside `27178530411`: `smoke`, `Deep QA (admin)`, `Deep QA (bum)`, and `Deep QA (client)` all passed.
- GitHub `QA` run `27178512695` on `9f42bf4`: failed in `Unit tests`.
- Current-head `QA` failure cause: `src/test/scrumQueueRegression.test.ts` still requires `docs/qa-test-backlog.md` to carry the seeded proof lanes `Extension API destinations and page captures`, `Bum represented contacts`, and `Client team, domain approval, and access-role assignment`. The current backlog rewrite dropped those exact sections, so the release proof failed on documentation/test-contract drift rather than a reproduced product outage.
- Local hotfix-forward verification after restoring that contract: `corepack pnpm exec vitest run src/test/scrumQueueRegression.test.ts` passed, and `corepack pnpm run qa` passed locally (`26` test files, `95` tests, production build green). Hosted `QA` evidence is still red until GitHub reruns on the fixed head.
- Current-head `Visual UI Audit`: missing. The latest visual artifact is still run `27167324836` on older head `441fd92`.
- Local QA env state:
  - Raw shell `corepack pnpm run qa:env`: failed because the shell was not preloaded with `QA_BASE_URL`, Clerk keys, or the role-email variables.
  - After sourcing `.env.qa`, `corepack pnpm run qa:env`: passed.
  - After sourcing `.env.qa`, `corepack pnpm run qa:target-preflight`: passed DNS, HTTPS, app shell, Clerk, and extension API preflight.
- Current public trust smoke:
  - `curl -I -L --max-time 20 https://trustedbums.com`: returned `HTTP/2 200` with `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Content-Security-Policy`.
  - `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`: still failed TLS verification with `curl: (60) SSL certificate problem: unable to get local issuer certificate`, so the external DNS target remains context only, not release proof.
- Exact Code Review marker: `.codex-review-decision.json` still points at `c9b7b07`, not `9f42bf4`.
- Deployment/function drift relevance: no `supabase/` migrations or edge-function files changed between last completed product-code green head `73f0b06` and current head `9f42bf4`; the new release risk is front-end plus documentation evidence drift, not a newly introduced backend deploy mismatch.

## Failed Or Missing Checks

### P1 - [TB-0017] GitHub QA is red on the exact deployed head
- Evidence: GitHub `QA` run `27178512695` failed on `9f42bf4` in `Unit tests`; `src/test/scrumQueueRegression.test.ts` expected seeded access-proof sections that were removed from `docs/qa-test-backlog.md`.
- Impact: Release evidence is not trustworthy enough for `GO` because the authoritative `QA` workflow on the exact deployed head is failing, and production build plus browser-smoke steps were skipped after the unit-test failure.
- Recommendation: HOTFIX-FORWARD by restoring the required backlog/test contract, rerunning `QA`, and keeping the causal link visible in the QA backlog and lead handoff.
- Acceptance criteria: a new `QA` run on the exact release head or successor passes lint, unit tests, production build, and browser smoke.

### P1 - [TB-0018] Current-head visual evidence is missing for visible public-route changes
- Evidence: `0ee2f44` and `9f42bf4` changed [src/pages/Index.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx), [src/pages/BumLanding.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/BumLanding.tsx), [src/components/SignupIntentDialog.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx), and route wiring in [src/App.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/App.tsx), but no `Visual UI Audit` run exists for either head. The latest visual artifact is still `27167324836` on `441fd92`.
- Impact: The public landing split and marketing-copy restoration are visible trust and conversion surfaces, so the old screenshot set cannot be treated as current release proof.
- Recommendation: HOLD fresh `GO` status until GitHub `Visual UI Audit` runs on `9f42bf4` or a successor head and passes.
- Acceptance criteria: a current-head `Visual UI Audit` artifact exists and shows the updated public Client and Bum landing surfaces plus any changed signup copy states.

### P1 - [TB-0019] Exact-commit Code Review evidence is stale
- Evidence: `.codex-review-decision.json` still records `GO` for `c9b7b07`; there is no current-head Code Review marker for `0ee2f44` or `9f42bf4`.
- Impact: Release Verification does not replace Code Review. The lack of exact-commit review evidence weakens confidence that the visible release scope was intentionally reviewed before the automated deploy.
- Recommendation: Refresh Code Review for the next hotfix-forward head, or explicitly record a scoped waiver from Lead Developer tied to the exact new head after the red `QA` item and visual evidence gap are closed.
- Acceptance criteria: `.codex-review-decision.json` matches the release head, or the lead handoff records a deliberate exact-head waiver with the new hosted evidence.

### P2 - [TB-0024] External DNS TLS path remains unsuitable for release proof
- Evidence: `https://rcdl.tplinkdns.com` still fails TLS verification from this runner, while `https://trustedbums.com` is healthy and was the GitHub smoke target that passed.
- Impact: External DNS context is still useful for infrastructure tracking, but it cannot be used to corroborate current release status from this runner.
- Recommendation: Keep release proof anchored to `https://trustedbums.com` until the `rcdl.tplinkdns.com` certificate chain is fixed or independently verified through provider dashboards.
- Acceptance criteria: `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` completes a clean TLS handshake and returns an expected HTTP response.

## Cross-Agent Follow-Ups

### QA/Test Engineer and Lead Developer - restore the backlog/test contract that broke current-head QA
- Causal link: the earlier `docs/qa-test-backlog.md` rewrite removed seeded-proof sections that `src/test/scrumQueueRegression.test.ts` still treats as required release scaffolding.
- Durable correction: keep the seeded proof lanes explicit until the test is intentionally relaxed, and treat backlog rewrites as test-governed artifacts rather than prose-only cleanup.

### Lead Developer and Release Verification - do not upgrade current head to GO on E2E alone
- Evidence: `27178530411` is green, but `27178512695` is red and no current-head visual artifact exists for the changed landing pages.
- Requested action: treat the next state as `HOTFIX-FORWARD` until `QA`, `Visual UI Audit`, and exact-head Code Review evidence are reconciled together.

## Agent Inputs

- Date of run: 2026-06-08.
- Current evidence reviewed: `git rev-parse HEAD`; `git log --oneline -8`; `.codex-review-decision.json`; raw and sourced `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:target-preflight`; `git diff --name-only 73f0b06..9f42bf4`; `git diff --name-only 41187e0..9f42bf4`; `git show --stat --summary 0ee2f44`; `git show --stat --summary 9f42bf4`; GitHub runs `27178512695`, `27178512660`, `27178530411`, `27167324836`, `27177006002`, and `27175606654`; current `docs/qa-test-backlog.md`; current `docs/lead-developer-recommendations.md`; current `docs/codex-edit-log.md`; and `src/test/scrumQueueRegression.test.ts`.
- Public checks reviewed: `curl -I -L --max-time 20 https://trustedbums.com` and `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`.
- Checks that could not run and why:
  - No current-head `Visual UI Audit` workflow exists yet for `0ee2f44` or `9f42bf4`.
  - No current-head exact-commit Code Review marker exists yet for `0ee2f44` or `9f42bf4`.
  - `qa:go-live` was not rerun because hosted smoke and deep coverage already isolated the active release blocker to the red `QA` workflow plus missing visual evidence.
