# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-20 by Codex daily QA/test engineer automation._

## Executive Read

Current `main` head `e231cc07ee6959bc8eac9d04ed3b68b80d76f6c4` has fresh exact-head hosted proof, but QA cannot call the release clean.

- GitHub `QA` run `27857690007` on `e231cc0`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27857689995` on `e231cc0`: passed.
- GitHub `Visual UI Audit` run `27857691601` on `e231cc0`: passed.
- GitHub `E2E Smoke` run `27857708006` on `e231cc0`: passed, including `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still records `GO` for older head `b2c6c440f0301020a108d017f2817cc983c06b3b`, so `TB-0019` must reopen for exact-head Code Review drift.
- Production Supabase still lacks `public.companies.deal_registration_config`, even though current source reads and writes that field in [`src/pages/client/ClientProfile.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [`src/pages/admin/AdminClients.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx), and [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), and the repo already contains [`supabase/migrations/20260611195500_add_client_deal_registration_config.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260611195500_add_client_deal_registration_config.sql). This reopens `TB-0097`.
- The current release provenance guard in [`scripts/verify-supabase-release-provenance.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/verify-supabase-release-provenance.mjs) verifies live function metadata plus local migration filenames, but it does not compare the live migration ledger to the repo or assert that required columns exist. That is the escaped QA or release defect in this run.
- The external DNS target decision is now retired: current shared rules no longer require `https://rcdl.tplinkdns.com` as a trust, QA, release, or visual-review target. `TB-0024` should close as a retirement decision; keep hosted release proof anchored on `https://trustedbums.com` unless Ryan explicitly names another host.

Current-session local preflight stayed split across the expected QA env surfaces:

- Raw `corepack pnpm run qa:env`: failed because the shell did not have the required QA variables exported.
- Sourced `.env.qa` `corepack pnpm run qa:env`: passed.
- Sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`: passed.
- Sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://rcdl.tplinkdns.com corepack pnpm run qa:target-preflight`: failed `HTTPS` and `App shell`.
- Focused current-head regression pack passed: `src/test/highTrafficRouteHydration.test.ts`, `src/test/deploymentProvenance.test.ts`, `src/test/scrumFiveBatch.test.ts`, `src/test/bumContactsMutationContract.test.ts`, and `src/test/serviceRoleAuthorization.test.ts` (`23/23`).

## Active Recommendations

### P1 - [TB-0097] Reopen client profile and beta role governance on exact head `e231cc0`
- Evidence: current source now depends on `companies.deal_registration_config`, but live production still reports that column as missing and the latest visible migration ledger row is `20260619120328`. The current client and admin profile flows can therefore look shipped in source and CI while the live schema still cannot support the intended role matrix.
- Why it matters: `CLIENT_ADMIN` and `CLIENT_IT` deal-registration setup cannot be called production-ready while the live schema is missing the field they update. This is a real release-surface miss, not only future cleanup.
- Escaped-defect review: the introducing risk was the release verification path that accepted function-metadata parity and a local migration list as enough provenance. The missing guardrail is a same-head live schema parity check that compares required columns or the live migration ledger, not only function versions.
- Recommendation: keep release non-`GO` until Release Verification or Lead Developer proves live schema parity for `deal_registration_config` or explicitly rolls the UI and API surface back behind a staged gate.
- Acceptance criteria: live SQL shows `public.companies.deal_registration_config` exists, exact-head role QA proves the intended `CLIENT_ADMIN` and `CLIENT_IT` allow-paths, unrelated client roles deny, and tracker `TB-0097` closes on the real current head.

### P1 - [TB-0019] Refresh exact-head Code Review for `e231cc0`
- Evidence: `main` is now `e231cc07ee6959bc8eac9d04ed3b68b80d76f6c4`, but [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still names `b2c6c44`.
- Why it matters: exact-head hosted proof is green, but the Code Review gate is still anchored to an older commit.
- Recommendation: rerun Code Review on `e231cc0` before the next GO closeout.
- Acceptance criteria: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) names `e231cc0...`, and `TB-0019` closes with matching exact-head hosted run evidence.

### Closed - [TB-0024] Retire the runner-side external target from required QA proof
- Evidence: Ryan explicitly chose to retire `TB-0024`; current shared rules now use `https://trustedbums.com` as the default public trust, QA, release, and visual-review target unless Ryan names another host.
- Result: Do not use `https://rcdl.tplinkdns.com` as a required preflight, release, or visual proof surface. Historical failures on that host stay separate from primary-host release proof.

## Closed Current-Head Items

- `TB-0018` stays closed on `e231cc0`: hosted `Visual UI Audit` `27857691601` now pairs exact-head visual proof with current deploy and deep-QA evidence.
- `TB-0055` stays closed on `e231cc0`: raw-shell, sourced `.env.qa`, and hosted workflow env states remain explicitly split in docs and tests.
- `TB-0112` stays closed on `e231cc0`: deploy-triggered `E2E Smoke` `27857708006` produced suite-scoped preflight summaries for `admin`, `client`, and `bum`.

## Business Access Coverage

### Client profile and deal-registration setup
- Current proof: exact-head source exposes ordinary client company profile edits plus narrower deal-registration setup writes for `CLIENT_ADMIN` and `CLIENT_IT`.
- Missing allow or deny proof: one live role matrix showing `CLIENT_ADMIN` and `CLIENT_IT` can update the intended setup on current schema, one negative proof that `CLIENT_MEMBER`, `CLIENT_FINANCE`, and foreign-company users deny, and one refresh proof that the saved config survives reload and audit logging.
- Seed data needed: one company with `CLIENT_ADMIN`, `CLIENT_IT`, `CLIENT_FINANCE`, and `CLIENT_MEMBER` users plus one cleanup-safe config change.
- Blocking note: this workflow is blocked from real closure until the live schema actually contains `companies.deal_registration_config`.

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

### Release Verification / Lead Developer - [TB-0097] schema parity is the real current blocker
- Evidence: exact-head hosted chain is green on `e231cc0`, but production still lacks `companies.deal_registration_config` while exact-head source reads and writes it.
- Requested action: update release posture to treat live schema parity as blocked until the field exists or the surface is rolled back behind a staged gate.
- Durable correction: the provenance guard must compare live schema expectations, not only function metadata and local migration filenames.

### Code Review Agent - [TB-0019] exact-head review drift reopened
- Evidence: current GO marker still targets `b2c6c44` while current head is `e231cc0`.
- Requested action: refresh Code Review on `e231cc0` before the next push or GO claim.

### Product Ops Workflow Analyst - [TB-0097] do not treat client beta setup as closed from source-only workflow language
- Evidence: yesterday's Product Ops backlog and tracker closure assumed the client-profile governance work was effectively done, but the live schema still lacks the deal-registration config field that the workflow depends on.
- Requested action: reopen the Product Ops narrative around client profile or beta setup ownership until live schema and role QA both exist.

### Trust & Reputation / Release Verification / Infrastructure owner - [TB-0024] external host remains separate
- Evidence: `rcdl.tplinkdns.com` still fails runner-side `HTTPS` and `App shell`, while exact-head hosted `trustedbums.com` proof is green.
- Requested action: repair or retire the host without letting it overwrite exact-head primary-host release truth.

## Coverage Map

- Exact-head GitHub evidence on `e231cc0`:
  - `QA` run `27857690007`: passed.
  - `Deploy TrustedBums to DreamHost` run `27857689995`: passed.
  - `Visual UI Audit` run `27857691601`: passed.
  - `E2E Smoke` run `27857708006`: passed.
  - `Deep QA (admin|client|bum)` inside `27857708006`: all passed.
- Current local proof in this pass:
  - raw `corepack pnpm run qa:env` failed with missing exported QA variables
  - sourced `.env.qa` `corepack pnpm run qa:env` passed
  - sourced `.env.qa` `QA_BASE_URL=https://trustedbums.com` `qa:target-preflight` passed
  - sourced `.env.qa` `QA_BASE_URL=https://rcdl.tplinkdns.com` `qa:target-preflight` failed `HTTPS` and `App shell`
  - targeted Vitest regression pack passed `23/23`
- Current live Supabase proof:
  - project `vaoqvtxqvbptyxddpoju` is healthy
  - `companies.deal_registration_config` is still missing live
  - `bum_contacts.is_inner_circle` exists live
  - `opportunity_claim_contacts.is_inner_circle` exists live
  - latest visible live migration ledger row is `20260619120328`

## Current Standards And Time-Sensitive Notes

- Playwright still recommends tests anchored in user-visible behavior and isolated, reproducible flows. That supports the narrow exact-head regression pack used here rather than broad implementation-detail assertions. Source: [Playwright Best Practices](https://playwright.dev/docs/best-practices).
- GitHub Actions still applies a default `success()` status check unless a step or job uses an explicit status function, which remains relevant to the deploy-triggered smoke chain used here. Source: [GitHub Actions Expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions).

## Access Requests And Evidence Gaps

- Exact-head Code Review marker is still missing for `e231cc0`.
- Live schema proof for `companies.deal_registration_config` is missing because the column itself is still absent.
- Current production-safe role QA for client profile and deal-registration setup was not rerun because the live schema blocker already prevents a truthful pass.
- Runner-side external DNS target `https://rcdl.tplinkdns.com` still fails preflight from this Mac.

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
