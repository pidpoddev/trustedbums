# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-20 by Codex TB-0097 closeout._

## Executive Read

Current `main` head `a0142260f502446a2e0aacedea219f22df233c8e` has fresh exact-head hosted proof, and QA can clear the former `TB-0097` live-schema blocker.

- GitHub `QA` run `27869628177` on `a0142260`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27869628178` on `a0142260`: passed.
- GitHub `E2E Smoke` run `27869672430` on `a0142260`: passed, including `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- GitHub `Visual UI Audit` run `27869672437` on `a0142260`: passed.
- Production Supabase project `vaoqvtxqvbptyxddpoju` now has `public.companies.deal_registration_config` as `jsonb not null` with the expected default and `companies_deal_registration_config_object_check`.
- Live data proof shows all `89` company rows have object-shaped deal-registration config values.
- The live migration ledger includes `20260620134628 add_client_deal_registration_config`.
- Hosted Client Admin visual audit passed through the Client Profile route after the live schema fix.
- The external DNS target decision is now retired: current shared rules no longer require `https://rcdl.tplinkdns.com` as a trust, QA, release, or visual-review target. `TB-0024` should close as a retirement decision; keep hosted release proof anchored on `https://trustedbums.com` unless Ryan explicitly names another host.

Current-session local preflight stayed split across the expected QA env surfaces:

- Raw `corepack pnpm run qa:env`: failed because the shell did not have the required QA variables exported.
- Sourced `.env.qa` `corepack pnpm run qa:env`: passed.
- Sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`: passed.
- Sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://rcdl.tplinkdns.com corepack pnpm run qa:target-preflight`: failed `HTTPS` and `App shell`.
- Focused current-head regression pack passed: `src/test/highTrafficRouteHydration.test.ts`, `src/test/deploymentProvenance.test.ts`, `src/test/scrumFiveBatch.test.ts`, `src/test/bumContactsMutationContract.test.ts`, and `src/test/serviceRoleAuthorization.test.ts` (`23/23`).

## Active Recommendations

### Active - Role workflow QA gate for UAT escape prevention
- Trigger: Ryan reported too many UAT escapes and asked whether per-user-type Workflow QA is good enough.
- Current change: add an opt-in mutating `qa:workflow` Playwright gate that uses QA roles to create a clearly marked `QA DO NOT USE` opportunity, prove Admin and Bum visibility, delete the unclaimed opportunity through the Client Admin UI, fail on red browser/Supabase errors, and run cleanup proof. The gate excludes only documented third-party telemetry noise and navigation-aborted background probes; app/Supabase/RLS failures stay blocking.
- Data handling rule: default to deleting every QA-created record after each test. Until a deliberate `qa_run_id` or `is_test` visibility model is added, published QA opportunities may be briefly visible to eligible Bums, so test records must use obvious QA labels and no real client, opportunity, contact, or private names.
- Closure standard: this gate counts only when `QA_WORKFLOW_MUTATION=1`, a real service-role cleanup JWT is present, all required QA role accounts exist, no red/RLS errors occur, and cleanup reports no P1 issues.

### Closed - [TB-0097] Client profile and beta role governance live schema parity
- Evidence: live SQL now shows `public.companies.deal_registration_config` exists and is constrained to an object; all current company rows have object-shaped values; and hosted Client Admin visual audit passed through Client Profile after the fix.
- Role proof: source and focused tests keep deal-registration writes limited to `CLIENT_ADMIN` and `CLIENT_IT`; hosted smoke proved Client Admin access, Client Finance access to finance-only lanes, and Client Member denial from finance-only lanes. The current QA env has no `QA_CLIENT_IT` account, so live Client IT browser proof remains a future enhancement rather than a blocker.
- Result: `TB-0097` can close against `a0142260` plus live migration `20260620134628`.

### Closed - [TB-0019] Exact-head Code Review proof refreshed
- Evidence: exact-head hosted proof and live tracker closeout now point at `a0142260`.
- Result: Keep future Code Review markers aligned to the pushed head before release-close claims.

### Closed - [TB-0024] Retire the runner-side external target from required QA proof
- Evidence: Ryan explicitly chose to retire `TB-0024`; current shared rules now use `https://trustedbums.com` as the default public trust, QA, release, and visual-review target unless Ryan names another host.
- Result: Do not use `https://rcdl.tplinkdns.com` as a required preflight, release, or visual proof surface. Historical failures on that host stay separate from primary-host release proof.

## Closed Current-Head Items

- `TB-0018` stays closed on `a0142260`: hosted `Visual UI Audit` `27869672437` pairs exact-head visual proof with current deploy and deep-QA evidence.
- `TB-0055` stays closed on `a0142260`: raw-shell, sourced `.env.qa`, and hosted workflow env states remain explicitly split in docs and tests.
- `TB-0112` stays closed on `a0142260`: deploy-triggered `E2E Smoke` `27869672430` produced suite-scoped preflight summaries for `admin`, `client`, and `bum`.

## Business Access Coverage

### Client profile and deal-registration setup
- Current proof: exact-head source exposes ordinary client company profile edits plus narrower deal-registration setup writes for `CLIENT_ADMIN` and `CLIENT_IT`; live schema now contains `companies.deal_registration_config`; and hosted Client Admin visual proof reaches the Client Profile route.
- Remaining enhancement: add a durable `QA_CLIENT_IT` account and one cleanup-safe config mutation proof so future runs can prove the IT allow path live instead of relying on source and focused test guards.

### Company identity review and access requests
- Current proof: source and live functions support admin-reviewed company identity changes and company access requests.
- Missing allow or deny proof: one live proof that legal company-name or approved-domain changes route through the Admin review path on current head, and one deny proof for unrelated client users.
- Seed data needed: one cleanup-safe company identity change request and one foreign-company deny account.

### Bum invite and managing-Bum access
- Current proof: source, current exact-head hosted QA, and live function inventory all support the invite flow.
- Missing allow or deny proof: one current-head live proof that Managing Bum invite or membership changes remain bounded to the intended company or team and do not leak broader admin access.
- Seed data needed: one managing Bum, one invite target, and one unrelated deny user.

### Bum represented contacts
- Current proof: source and focused regression tests keep represented-contact reads scoped to intended Bum-owned or admin-reviewed paths.
- Missing allow or deny proof: one authenticated browser or direct-data proof that the owning Bum and Admin allow, while unrelated Bums and client-company users deny.
- Seed data needed: one represented contact owned by a Bum, one admin reviewer, and one foreign Bum deny case.

## Cross-Agent Follow-Ups

### Release Verification / Lead Developer - [TB-0097] schema parity blocker cleared
- Evidence: production now has `companies.deal_registration_config`, all current company rows have object-shaped values, and hosted Client Admin visual proof reached Client Profile after the live schema fix.
- Requested action: keep release posture anchored on live schema proof for future schema-backed UI/API work.
- Durable correction: the provenance guard must compare live schema expectations, not only function metadata and local migration filenames.

### Code Review Agent - [TB-0019] exact-head review drift closed
- Evidence: exact-head hosted proof and tracker closeout now point at `a0142260`.
- Requested action: keep future Code Review markers aligned to the pushed head before release-close claims.

### Product Ops Workflow Analyst - [TB-0097] keep the closed scope narrow
- Evidence: live schema now supports the beta setup field, source and focused tests keep `CLIENT_ADMIN` and `CLIENT_IT` as the elevated setup roles, and hosted Client Admin profile proof passed.
- Requested action: do not reopen `TB-0097` unless a new live schema or role-proof regression appears; track `QA_CLIENT_IT` account creation as a QA enhancement.

### Trust & Reputation / Release Verification / Infrastructure owner - [TB-0024] external host remains separate
- Evidence: `rcdl.tplinkdns.com` still fails runner-side `HTTPS` and `App shell`, while exact-head hosted `trustedbums.com` proof is green.
- Requested action: repair or retire the host without letting it overwrite exact-head primary-host release truth.

## Coverage Map

- Exact-head GitHub evidence on `a0142260`:
  - `QA` run `27869628177`: passed.
  - `Deploy TrustedBums to DreamHost` run `27869628178`: passed.
  - `E2E Smoke` run `27869672430`: passed.
  - `Visual UI Audit` run `27869672437`: passed.
  - `Deep QA (admin|client|bum)` inside `27869672430`: all passed.
- Current local proof in this pass:
  - raw `corepack pnpm run qa:env` failed with missing exported QA variables
  - sourced `.env.qa` `corepack pnpm run qa:env` passed
  - sourced `.env.qa` `QA_BASE_URL=https://trustedbums.com` `qa:target-preflight` passed
  - sourced `.env.qa` `QA_BASE_URL=https://rcdl.tplinkdns.com` `qa:target-preflight` failed `HTTPS` and `App shell`
  - targeted Vitest regression pack passed `23/23`
- Current live Supabase proof:
  - project `vaoqvtxqvbptyxddpoju` is healthy
  - `companies.deal_registration_config` exists live as `jsonb not null`
  - `companies_deal_registration_config_object_check` is present
  - all `89` company rows have object-shaped config values
  - `bum_contacts.is_inner_circle` exists live
  - `opportunity_claim_contacts.is_inner_circle` exists live
  - live migration ledger includes `20260620134628 add_client_deal_registration_config`

## Current Standards And Time-Sensitive Notes

- Playwright still recommends tests anchored in user-visible behavior and isolated, reproducible flows. That supports the narrow exact-head regression pack used here rather than broad implementation-detail assertions. Source: [Playwright Best Practices](https://playwright.dev/docs/best-practices).
- GitHub Actions still applies a default `success()` status check unless a step or job uses an explicit status function, which remains relevant to the deploy-triggered smoke chain used here. Source: [GitHub Actions Expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions).

## Access Requests And Evidence Gaps

- `QA_CLIENT_IT` is not present in the current QA env, so browser-level Client IT proof remains a future QA-account enhancement.
- Runner-side external DNS target `https://rcdl.tplinkdns.com` is retired from required proof unless Ryan names it again.

## Agent Inputs

- Date of run: 2026-06-20.
- Files, tests, workflows, tracker rows, and internet sources reviewed:
  - `docs/agents/automation-prompts/trusted-bums-daily-qa-test-engineer.toml`
  - `docs/agents/consultant-team-rules.md`
  - `docs/agents/company-wide-rules.md`
  - `docs/agents/consultant-access-needs.md`
  - `docs/agents/business-access-rules.md`
  - `docs/business-workflow-qa-contract.md`
  - `docs/qa-test-backlog.md`
  - `docs/release-verification-backlog.md`
  - `docs/product-ops-workflow-backlog.md`
  - `docs/qa-harness-reliability-backlog.md`
  - `docs/consultant-team-rules.md`
  - `docs/codex-edit-log.md`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - [`scripts/verify-supabase-release-provenance.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/verify-supabase-release-provenance.mjs)
  - [`supabase/migrations/20260611195500_add_client_deal_registration_config.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260611195500_add_client_deal_registration_config.sql)
  - `git rev-parse HEAD`
  - `git log --oneline -12`
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 30 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27857690007 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27857689995 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27857691601 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27857708006 --repo Pidpoddev/trustedbums --json ...`
  - raw `corepack pnpm run qa:env`
  - sourced `.env.qa` `corepack pnpm run qa:env`
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://rcdl.tplinkdns.com corepack pnpm run qa:target-preflight`
  - `corepack pnpm exec vitest run src/test/highTrafficRouteHydration.test.ts src/test/deploymentProvenance.test.ts src/test/scrumFiveBatch.test.ts src/test/bumContactsMutationContract.test.ts src/test/serviceRoleAuthorization.test.ts`
  - Supabase project metadata, edge-function inventory, edge-function source reads, tracker reads, and live SQL for schema and migration checks on project `vaoqvtxqvbptyxddpoju`
  - current official guidance reviewed:
    - [Playwright Best Practices](https://playwright.dev/docs/best-practices)
    - [GitHub Actions Expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions)
- Tracker refresh completed in this run:
  - reopened `TB-0019` for exact-head Code Review drift on `e231cc0`
  - refreshed `TB-0024` with current exact-head evidence while keeping it separate from primary-host release proof
  - reopened `TB-0097` for live schema drift on `companies.deal_registration_config`
- Checks that could not fully close and why:
  - no exact-head Code Review marker exists yet for `e231cc0`
  - no live schema parity exists yet for `companies.deal_registration_config`
  - no production-safe role matrix was rerun for the blocked client beta setup workflow because the missing live column already makes the workflow non-closeable
