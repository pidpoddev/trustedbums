# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-08 by Codex._

## Release Decision

Decision: GO for the current smoke/deploy state at `3e9118c`.

This is not a blanket product-complete decision. It means the prior hosted release blocker is closed: the latest `main` head deployed successfully, passed QA, and passed the required hosted E2E workflow.

## Current Evidence

- Current `main` head: `3e9118c` (`Retry hosted app fetch in QA preflight`).
- GitHub `QA` run `27163785478`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27163785482`: passed.
- GitHub `E2E Smoke` run `27163818009`: passed.
- E2E smoke result: `32 passed, 8 skipped`.
- Deep QA matrix in run `27163818009`: `admin`, `bum`, and `client` all passed.
- Local targeted contact-intake proof after the env fix: both desktop and mobile boundary checks passed with blank `QA_SUPABASE_FUNCTIONS_URL`/`VITE_SUPABASE_URL` values, proving the fallback now reaches the real Supabase Functions URL.

## Closed Release Blockers

### Hosted extension/contact preflight drift

The stale `NO-GO` notes that referenced `4402ace` and hosted E2E run `27112837432` are no longer current. The current head is `3e9118c`, and its hosted E2E run `27163818009` passed.

What changed:

- `.env.qa` now includes the public Supabase URL values required by the contact-intake smoke path.
- `tests/e2e/contact-intake.spec.ts` now treats blank env vars as unset, so GitHub Actions no longer routes contact boundary requests to `https://trustedbums.com/...` by mistake.
- `scripts/qa-target-preflight.mjs` now retries the hosted app fetch, reducing false failures from transient hosted-network fetch errors.

### Contact-intake skip/failure issue

Earlier E2E smoke showed `28 passed, 12 skipped`. After the fixes, current smoke shows `32 passed, 8 skipped`.

The four recovered checks are the non-mutating contact-intake boundary checks across desktop and mobile:

- direct anonymous `send-website-email` calls reject with `403`;
- invalid-verification `submit-contact` calls reject with `403`.

## Expected Remaining Skips

The current 8 skipped tests are expected under the default non-mutating hosted smoke profile:

- 2 contact-intake mutating send tests are skipped because `QA_CONTACT_SMOKE_ENABLED=false`.
- 4 portal interaction audit tests are skipped on `mobile-chrome` because that audit is desktop-only by design.
- 2 Bum opportunity contact-picker checks are skipped because no live opportunity or target-account fixture is available for that non-mutating smoke check.

These are not release blockers unless the release goal changes to require mutating contact-send proof, mobile portal-interaction parity, or seeded Bum opportunity fixtures.

## Open Release Gaps

### P1 - Current-head visual evidence

The latest smoke/deep evidence is current, but a fresh current-head `Visual UI Audit` artifact is still useful before a wider announcement or product launch decision. The older visual artifact mentioned in prior docs is stale relative to `3e9118c`.

Acceptance criteria:

- Run the hosted `Visual UI Audit` workflow against `3e9118c` or newer.
- Review desktop and mobile screenshots for the public routes and authenticated role views.
- Record the run id in this backlog or `docs/codex-edit-log.md`.

### P1 - Exact current-head Code Review marker

The release workflow is green, but `.codex-review-decision.json` may still point at an older commit. If this repo requires an exact Code Review marker for release audit, refresh it for `3e9118c` or document the override.

Acceptance criteria:

- `.codex-review-decision.json` matches the release head, or the handoff records why the green hosted gates are sufficient for this push.

### P2 - External DNS certificate path

Trusted Bums uses `https://trustedbums.com` for hosted release evidence. The external DNS name `rcdl.tplinkdns.com` remains a separate infrastructure target and should not be used as release proof until its TLS chain is trustworthy from this runner.

Acceptance criteria:

- `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` completes a clean TLS handshake and returns an expected HTTP response.

## Next Release Work

1. Run fresh current-head `Visual UI Audit`.
2. Refresh or explicitly waive the exact-commit Code Review marker for `3e9118c`.
3. Keep the 8 current skips documented as expected until seeded fixtures or mutating smoke mode are intentionally enabled.
4. Move product work to the public/client recovery UX bundle: signup company-name retention, inline public contact recovery, client blocked-state messaging, and agreement recovery routing.

## Agent Inputs

- Date of run: 2026-06-08.
- Current evidence reviewed: GitHub runs `27163785478`, `27163785482`, and `27163818009`; local contact-intake reproduction; `tests/e2e/contact-intake.spec.ts`; `scripts/qa-target-preflight.mjs`; `.env.qa` key presence without printing secret values; and current `git status`.
- Checks not rerun in this cleanup: Visual UI Audit and Code Review marker refresh.
