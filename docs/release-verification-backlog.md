# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-08 by Codex._

## Release Decision

Decision: GO for the current smoke/deploy/visual state at `441fd92`.

This is not a blanket product-complete decision. It means the prior hosted release blocker is closed: the latest `main` head deployed successfully, passed QA, and passed the required hosted E2E workflow.

## Current Evidence

- Current `main` head: `441fd92` (`Update Bum contact picker QA selectors`).
- GitHub `QA` run `27167307017`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27167306961`: passed.
- GitHub `E2E Smoke` run `27167339658`: passed.
- GitHub `Visual UI Audit` run `27167324836`: passed.
- E2E smoke result: `34 passed, 6 skipped`.
- Deep QA matrix in run `27167339658`: `admin`, `bum`, and `client` all passed.
- Visual UI Audit result: `18 passed`.
- Local targeted contact-intake proof after the env fix: both desktop and mobile boundary checks passed with blank `QA_SUPABASE_FUNCTIONS_URL`/`VITE_SUPABASE_URL` values, proving the fallback now reaches the real Supabase Functions URL.

## Closed Release Blockers

### Hosted extension/contact preflight drift

The stale `NO-GO` notes that referenced `4402ace` and hosted E2E run `27112837432` are no longer current. The current head is `441fd92`, and its hosted QA, deploy, E2E, and Visual UI Audit runs passed.

What changed:

- `.env.qa` now includes the public Supabase URL values required by the contact-intake smoke path.
- `tests/e2e/contact-intake.spec.ts` now treats blank env vars as unset, so GitHub Actions no longer routes contact boundary requests to `https://trustedbums.com/...` by mistake.
- `scripts/qa-target-preflight.mjs` now retries the hosted app fetch, reducing false failures from transient hosted-network fetch errors.

### Contact-intake skip/failure issue

Earlier E2E smoke showed `28 passed, 12 skipped`. After the contact-intake and Bum contact-picker QA selector fixes, current smoke shows `34 passed, 6 skipped`.

The recovered checks are the non-mutating contact-intake boundary checks across desktop and mobile, plus the Bum contact-picker smoke checks after the QA selector was updated from the retired `I know someone` CTA to the current `Claim intro` action.

- direct anonymous `send-website-email` calls reject with `403`;
- invalid-verification `submit-contact` calls reject with `403`.

## Expected Remaining Skips

The current 6 skipped tests are expected under the default non-mutating hosted smoke profile:

- 2 contact-intake mutating send tests are skipped because `QA_CONTACT_SMOKE_ENABLED=false`.
- 4 portal interaction audit tests are skipped on `mobile-chrome` because that audit is desktop-only by design.

These are not release blockers unless the release goal changes to require mutating contact-send proof or mobile portal-interaction parity.

## Open Release Gaps

### Closed - Current-head visual evidence

Current-head visual evidence is refreshed. GitHub `Visual UI Audit` run `27167324836` passed on `441fd92` with `18 passed`.

### P1 - Exact current-head Code Review marker

The release workflow is green, but `.codex-review-decision.json` still points at older commit `c9b7b07`. For this cleanup, the exact-commit Code Review marker is explicitly waived for `441fd92` because current-head hosted QA, deploy, E2E, and Visual UI Audit all passed and the only code change after the prior review was a QA selector update.

Acceptance criteria:

- `.codex-review-decision.json` matches the release head, or the handoff records why the green hosted gates are sufficient for this push. Current status: waived in this backlog and in `docs/lead-developer-recommendations.md`.

### P2 - External DNS certificate path

Trusted Bums uses `https://trustedbums.com` for hosted release evidence. The external DNS name `rcdl.tplinkdns.com` remains a separate infrastructure target and should not be used as release proof until its TLS chain is trustworthy from this runner.

Acceptance criteria:

- `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` completes a clean TLS handshake and returns an expected HTTP response.

## Next Release Work

1. Keep the 6 current skips documented as expected until mutating smoke mode or mobile portal-interaction parity is intentionally enabled.
2. Move product work to the next P1 bundle: mobile consent/privacy UX, public legal/trust navigation, Bum dashboard placeholder finance totals, and seeded live allow/deny access-boundary proof.
3. Refresh the Code Review marker on a future product-code change if exact-marker release audit is required again.

## Agent Inputs

- Date of run: 2026-06-08.
- Current evidence reviewed: GitHub runs `27167307017`, `27167306961`, `27167339658`, and `27167324836`; local focused QA selector checks; `tests/e2e/contact-intake.spec.ts`; `tests/e2e/staging-smoke.spec.ts`; `tests/e2e/visual-ui-audit.spec.ts`; `scripts/qa-target-preflight.mjs`; `.env.qa` key presence without printing secret values; and current `git status`.
- Checks not rerun in this cleanup: exact Code Review marker refresh. It is explicitly waived for `441fd92`.
