# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-09 by Codex daily release verification automation._

## Release Decision

Decision: `HOTFIX-FORWARD` for current `main` head `ff59d2c`.

The stale `9f42bf4` red-QA story is no longer current release truth. Current `main` has green hosted `QA`, DreamHost deploy, and `E2E Smoke` evidence on `ff59d2c`. The release is still not a clean `GO` because current-head `Visual UI Audit` run `27247209520` failed in the public visual audit, and `.codex-review-decision.json` does not match `ff59d2c`. The source now includes a complete production visual-audit workflow, and the complete audit passed locally against `https://trustedbums.com`; release still needs a successful exact-head hosted artifact after these changes are pushed.

## Evidence Summary

- Current `main` head: `ff59d2c` (`Add BlackCurrant research and email assets`).
- GitHub `QA` run `27244531408` on `ff59d2c`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27244531370` on `ff59d2c`: passed.
- GitHub `E2E Smoke` run `27244546687` on `ff59d2c`: passed.
- Deep QA matrix inside `27244546687`: `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)` all passed.
- GitHub `Visual UI Audit` run `27247209520` on `ff59d2c`: failed. The public marketing/privacy test timed out in both `chromium` and `mobile-chrome` waiting for the `Accessibility settings` button after the signup dialog step; the other 16 visual checks passed and artifacts uploaded.
- Latest successful hosted visual artifact: run `27200213766` on older head `fffe28c`.
- Local complete production visual audit: `QA_BASE_URL=https://trustedbums.com QA_VISUAL_AUDIT_SCOPE=complete corepack pnpm run qa:visual:complete` passed 18 desktop/mobile checks in about 11 minutes after the source fix.
- Exact Code Review marker: `.codex-review-decision.json` records `GO` for `e023694f`, not `ff59d2c`.
- Raw shell QA env state: `corepack pnpm run qa:env` failed before sourcing because `QA_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `QA_ADMIN_EMAIL`, `QA_CLIENT_ADMIN_EMAIL`, `QA_CLIENT_FINANCE_EMAIL`, `QA_CLIENT_MEMBER_EMAIL`, and `QA_BUM_EMAIL` were not exported in the shell.
- Sourced local QA env state: after sourcing `.env.qa`, `corepack pnpm run qa:env` passed and `corepack pnpm run qa:target-preflight` passed against `https://trustedbums.com` with DNS, HTTPS, app shell, Clerk, and extension API checks green.
- Public trust smoke: `curl -I -L --max-time 20 https://trustedbums.com` returned `HTTP/2 200` with HSTS and CSP headers; `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` still failed TLS verification.
- Partial live Supabase fallback via generic connector: project `vaoqvtxqvbptyxddpoju` is `ACTIVE_HEALTHY`; edge-function inventory still includes `extension-api-v1` v3 and `performance-beacon` v3; recent edge logs showed fresh `performance-beacon` `202` traffic plus `profile-bootstrap` and `sync-claim-decision-replies` `200` traffic; auth logs returned no entries in the last 24 hours. This session did not have callable live migration, SQL, or advisor surfaces.

## Failed Or Missing Checks

### P2 - [TB-0018] Pair current release heads with current visual evidence or an explicit reuse rule
- Evidence: `27247209520` failed on exact head `ff59d2c`; the latest completed successful artifact remains `27200213766` on `fffe28c`. The exact-head failure is the public marketing/privacy test timing out in both `chromium` and `mobile-chrome` while waiting for the `Accessibility settings` button after the signup dialog closes. The checked-in visual spec now fixes that sequencing, retains `/bums` and `/admin/scrum`, and adds a complete pre-go-live scope; local complete production audit passed, but hosted artifact proof is still pending.
- Impact: Release reviewers still cannot cite a clean exact-head screenshot artifact for the current public and authenticated visible surface.
- Recommendation: Dispatch `Complete Visual UI Audit` on `https://trustedbums.com` after these changes are pushed, review the retained screenshots/artifacts, and then decide whether `TB-0018` can close.
- Acceptance criteria: a successful exact-head visual artifact exists, or a no-visual-delta reuse rule is recorded for the exact commit range; the retained artifact still captures `/bums` and `/admin/scrum`.

### Current exact-head Code Review marker is stale
- Evidence: `.codex-review-decision.json` points at `e023694f`, while current `main` is `ff59d2c`.
- Impact: Release Verification does not replace Code Review. Even with green hosted QA and E2E, the current head still needs an exact review marker or an explicit Lead Developer waiver before `GO`.
- Recommendation: Run Code Review Agent after the current visual audit finishes, or record a deliberate exact-head waiver tied to `ff59d2c` and the hosted evidence above.
- Acceptance criteria: `.codex-review-decision.json` matches `ff59d2c`, or the lead handoff records an exact-head waiver.

### P2 - [TB-0024] External DNS TLS path remains unsuitable for release proof
- Evidence: Current runner check `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` still fails TLS verification with `SSL certificate problem: unable to get local issuer certificate`, while hosted QA and release proof are anchored to `https://trustedbums.com`.
- Impact: The external DNS target remains useful infrastructure context, but it should not be treated as release proof from this runner.
- Recommendation: Keep release proof anchored to `https://trustedbums.com` until the `rcdl.tplinkdns.com` certificate chain is fixed or independently verified through provider dashboards.
- Acceptance criteria: `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` completes a clean TLS handshake and returns an expected HTTP response.

## Closed Or Satisfied In This Cleanup

- `TB-0017` remains closed: current-head GitHub `QA` run `27244531408` passed on `ff59d2c`.
- `TB-0030` is source-satisfied by `8a9e2d7`: `SignupIntentDialog` now wires signup intent group and field errors with programmatic names, descriptions, and invalid state.
- `TB-0031` is source-satisfied by `8a9e2d7`: `AdminScrumTracker` now exposes explicit labels and help text for search, filters, and create-form controls.
- `TB-0053` and `TB-0056` remain historically closed from the 2026-06-09 admin scrum hardening pass. This run rechecked the current source and release posture only; it did not have callable live migration or SQL surfaces to restate those database claims as freshly verified.

## Cross-Agent Follow-Ups

### QA/Test Engineer and Lead Developer - stop carrying the old red-QA story
- Current truth: the old `27178512695` failure on `9f42bf4` is historical. Current `ff59d2c` hosted QA, deploy, and E2E evidence is green.
- Requested action: keep future handoffs focused on the remaining exact-head visual and Code Review gaps instead of reopening the stale QA-red narrative.

### UI, Accessibility, QA Harness, and Release Verification - run complete production visual audit
- Current truth: visual audit proof is red on exact head `ff59d2c`, but the source now fixes the public signup/accessibility sequencing and adds retained `/bums`, `/admin/scrum`, and complete-scope go-live coverage. The local complete production audit passed 18 checks against `https://trustedbums.com`.
- Requested action: dispatch `Complete Visual UI Audit` against `https://trustedbums.com`, inspect the artifacts, and use that exact-head hosted run as the visual gate before closing `TB-0018`.

## Agent Inputs

- Date of run: 2026-06-09.
- Current evidence reviewed: `git rev-parse HEAD`; `git log --oneline -8`; `.codex-review-decision.json`; GitHub workflow list; GitHub runs `27244531408`, `27244531370`, `27244546687`, `27247209520`, and Visual UI Audit history; raw `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:target-preflight`; `curl -I -L --max-time 20 https://trustedbums.com`; `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`; `mcp__codex_apps__supabase._get_project`; `mcp__codex_apps__supabase._list_edge_functions`; `mcp__codex_apps__supabase._get_logs` for `edge-function` and `auth`; source review of `tests/e2e/visual-ui-audit.spec.ts`.
- Checks that could not close and why:
  - `Visual UI Audit` run `27247209520` failed after this refresh began; it is now the active release evidence blocker.
  - `.codex-review-decision.json` was not updated because this was not a Code Review Agent run.
  - This session did not have a callable Admin Scrum Tracker or Supabase write path, so tracker closeout stayed limited to source and backlog reconciliation rather than live row updates.
  - This session did not have callable live migration history, read-only SQL, or advisor surfaces for Supabase, so prior database-only claims were treated as historical unless they were rechecked from current source.
