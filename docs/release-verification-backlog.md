# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-19 by Codex daily release verification automation._

## Release Decision

Decision: `HOTFIX-FORWARD` for current `main` head `a17a85639a1b24dfda36da87d763eb4ecd3457af`.

Hosted release proof on `https://trustedbums.com` is green for the current head, but the release is not trustworthy enough to treat as `GO`. The DreamHost app shell for `a17a856` is live, exact-head hosted `QA` and deploy-triggered `E2E Smoke` passed, and `trustedbums.com` still serves the app cleanly. The blocker is control-plane drift: live Supabase Edge Function source in project `vaoqvtxqvbptyxddpoju` does not match the repo or the tracker closeouts that were treated as shipped on the same head.

Safest recovery path: forward-deploy or otherwise prove the matching Supabase Edge Function revisions, then rerun the narrow live checks that depend on them. Rollback is not the first recommendation because the primary web deploy is healthy and the live functions are stale rather than obviously crashing globally, but current release status must not be treated as clean.

## Evidence Summary

- GitHub `QA` run `27798687806` on `a17a856`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27798687708` on `a17a856`: passed.
- GitHub `E2E Smoke` run `27798711531` on `a17a856`: passed, including `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- Latest hosted `Visual UI Audit` success is still `27755903096` on `c02b18b`. No hosted visual artifact exists for `b67b4c4` or `a17a856`.
- [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still records `GO` for older head `4dfca6111781e0df4b9b6ee14dd811c0d90ac787`.
- Current DreamHost deploy workflow in [`.github/workflows/deploy_dreamhost.yaml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deploy_dreamhost.yaml) deploys the static app only. It does not deploy or verify Supabase Edge Function revisions for the same head.
- Live Supabase project `vaoqvtxqvbptyxddpoju` is active on Postgres `17.6.1.111`, but deployed function source is stale against repo head:
  - `extension-api-v1` live version `6` still uses `resolveClerkJwksUrl(payload.iss)` and verifies with `issuer: payload.iss`.
  - `portal-contacts` live version `4` still uses the same token-selected issuer path.
  - `admin-shared-mailbox` live version `2` still lacks `claim_message` and `update_category`, and still list-limits shared mailbox reads to `top 100`.
- `https://trustedbums.com` currently returns `HTTP/2 200` with current CSP/HSTS headers and passes sourced `qa:target-preflight`.
- Runner-side external target `https://rcdl.tplinkdns.com` currently resolves DNS to `69.131.216.220`, but sourced `qa:target-preflight` fails `HTTPS` and `App shell`; `curl` without `-k` fails certificate verification and plain `http://rcdl.tplinkdns.com` returns `HTTP/1.1 403`.
- `.env.qa` is present. Raw-shell `qa:env` still fails until the expected variables are sourced; sourced `.env.qa` restores the contract and passes `qa:env`.

## Failed Or Missing Checks

### P0 - [TB-0027] Live Supabase function revisions do not match the shipped head
- Evidence: live Supabase function reads contradicted the static deploy proof. `extension-api-v1`, `portal-contacts`, and `admin-shared-mailbox` still serve older source even though repo head `a17a856`, local tests, tracker rows, and hosted DreamHost/E2E runs were treated as if those changes were already live.
- Impact: release closeout is currently over-trusting static deploy and browser smoke. Exact-head security and workflow behavior for Edge Functions cannot be treated as shipped, and admin mailbox controls added on `a17a856` are not proven live.
- Recommendation: `HOTFIX-FORWARD` owned by Lead Developer plus Release Verification. Add same-chain Supabase function deployment or live provenance verification, then prove the live function source matches `a17a856` before clearing release.
- Acceptance criteria: live `extension-api-v1`, `portal-contacts`, and `admin-shared-mailbox` source matches the repo head or an explicit same-head deployed revision ledger; `TB-0027` closes with exact-head proof, not static-site-only proof.

### P1 - [TB-0089] Issuer-pinning hardening was closed in tracker before live deployment matched repo
- Evidence: repo source and tests on `a17a856` pin the Clerk issuer, but live `extension-api-v1` and `portal-contacts` still verify against token-selected issuer input. `TB-0089` has been reopened in live tracker because the earlier closeout was based on repo/test/static evidence rather than current live function source.
- Impact: security hardening for Clerk-backed service-role functions is not yet trustworthy on the live project even though the repo diff exists. Release status cannot claim the authorization fix shipped.
- Recommendation: `HOTFIX-FORWARD` owned by Security Engineer plus Lead Developer. Deploy the matching function revisions, then re-read live function source and rerun the targeted auth contract checks.
- Acceptance criteria: live function source shows `resolveAllowedClerkIssuer(...)` and `issuer: allowedIssuer` for the affected functions, tracker `TB-0089` closes again on the real live revision, and release evidence cites the same head across repo, tracker, and live function reads.

### P1 - [TB-0019] Refresh exact-head Code Review for `a17a856`
- Evidence: `main` is `a17a85639a1b24dfda36da87d763eb4ecd3457af`, but [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still names `4dfca6111781e0df4b9b6ee14dd811c0d90ac787`.
- Impact: even if the live function drift is fixed, the current release still lacks exact-head Code Review closure.
- Recommendation: keep release non-`GO` until Code Review refreshes on `a17a856`.
- Acceptance criteria: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) names `a17a856...`, and `TB-0019` closes with matching exact-head hosted proof.

### P1 - [TB-0024] Runner-side external DNS target `rcdl.tplinkdns.com` still fails HTTPS and app-shell proof
- Evidence: sourced `qa:target-preflight` now resolves DNS for `rcdl.tplinkdns.com`, but still fails `HTTPS` and `App shell`; direct `curl` without `-k` fails certificate validation, and plain `http` returns `403`.
- Impact: external-target trust and runner-side fallback-host checks remain unhealthy. This does not negate the primary-host hosted runs on `https://trustedbums.com`, but it blocks any claim that the named external DNS target is healthy.
- Recommendation: keep this separate from primary-host release proof. Either restore the external target or explicitly retire it again from one authoritative decision source.
- Acceptance criteria: sourced `QA_BASE_URL=https://rcdl.tplinkdns.com corepack pnpm run qa:target-preflight` passes `HTTPS` and `App shell`, or Ryan explicitly retires this host and the prompt/rules/tracker all agree.

### P1 - [TB-0102] Shared mailbox controls added on `a17a856` are not live yet
- Evidence: repo head `a17a856` adds claim/category controls and larger shared-mailbox list reads in [`src/pages/admin/AdminInbox.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminInbox.tsx) and [`supabase/functions/admin-shared-mailbox/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-shared-mailbox/index.ts), but live Supabase still serves version `2` without `claim_message` / `update_category` and without the same list-read expansion.
- Impact: admin queue behavior on the live site is not aligned with the repo change that QA and tracker language treated as shipped. Admins can hit stale behavior even though the UI code expects newer operations.
- Recommendation: `HOTFIX-FORWARD` owned by Product Ops Workflow Analyst plus Lead Developer. Deploy and verify the matching live function before treating the mailbox control improvement as shipped.
- Acceptance criteria: live `admin-shared-mailbox` source matches the repo operations and limits, then one live admin proof confirms claim/category flows and uncategorized close-blocking behavior on the deployed target.

### P2 - [TB-0018] Exact-head hosted visual proof is still missing for `a17a856`
- Evidence: latest successful `Visual UI Audit` is `27755903096` on `c02b18b`; no current-head hosted visual artifact exists for `a17a856`.
- Impact: visible admin/client surface changes since `c02b18b` still lack exact-head screenshot proof.
- Recommendation: rerun hosted `Visual UI Audit` after the control-plane hotfix, or document an explicit reuse rule tied to unchanged visible surfaces if that is truly defensible.
- Acceptance criteria: hosted `Visual UI Audit` succeeds on `a17a856`, or Release/UI records an explicit reuse note that matches the changed surface set.

## Cross-Agent Follow-Ups

### Security Engineer / Release Verification - `TB-0089` reopened because tracker closeout outran live deployment
- Current truth: repo/tests changed, but live function source did not. `TB-0089` is open again in tracker.
- Durable correction: do not close Edge Function auth-hardening rows from repo diff, static deploy, or browser smoke alone. Read the live function source or deployed revision for the same head before closing.

### Lead Developer / Release Verification - `TB-0027` is now a real release blocker, not just metadata debt
- Current truth: the deploy workflow proves DreamHost static publish, but it does not prove or perform matching Supabase Edge Function deployment.
- Durable correction: add same-chain function deployment or exact-head function provenance to the release chain whenever the pushed head changes Supabase Edge Functions.

### Product Ops Workflow Analyst - `TB-0102` source fix is not live proof
- Current truth: the shared-mailbox UI and repo function changed on `a17a856`, but live `admin-shared-mailbox` still serves the older behavior.
- Durable correction: keep source-only or hosted-web proof separate from live function proof before narrowing operational queue items that depend on Supabase functions.

### QA Harness Reliability / QA Test Engineer - green hosted smoke did not detect the live function drift
- Current truth: hosted `QA` and deploy-triggered `E2E Smoke` are still valuable, but they did not catch stale live function source on the same head.
- Durable correction: keep using hosted proof, but treat live function-source verification as a separate release surface whenever the commit range touches `supabase/functions/`.

## Tracker Closeout Sweep

- Re-read live tracker rows `TB-0018`, `TB-0019`, `TB-0024`, `TB-0027`, `TB-0089`, and `TB-0102`.
- Kept `TB-0018`, `TB-0019`, and `TB-0024` open because their acceptance criteria are still unmet on the current head.
- Reopened `TB-0089` because live function source contradicts the earlier closeout on `a17a856`.
- Refreshed `TB-0027` to the current release-process failure: no same-head Supabase function provenance or deploy proof.
- Corrected `TB-0102` so it no longer implies the mailbox function controls are already live.
- Left `TB-0108`, `TB-0111`, and the hosted primary-site checks closed or healthy because current release findings did not invalidate their live proof.

## Agent Inputs

- Date of run: 2026-06-19 (`America/New_York`).
- Docs, files, and workflows reviewed:
  - `docs/agents/automation-prompts/trusted-bums-daily-release-verification-agent.toml`
  - `docs/agents/consultant-team-rules.md`
  - `docs/agents/company-wide-rules.md`
  - `docs/agents/consultant-access-needs.md`
  - `docs/agents/business-access-rules.md`
  - `docs/qa-test-backlog.md`
  - `docs/security-review-backlog.md`
  - `docs/trust-reputation-backlog.md`
  - `docs/lead-developer-recommendations.md`
  - `docs/production-go-live.md`
  - `docs/codex-edit-log.md`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - [`.github/workflows/deploy_dreamhost.yaml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deploy_dreamhost.yaml)
  - [`src/pages/admin/AdminInbox.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminInbox.tsx)
  - [`src/pages/admin/AdminHandoffs.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminHandoffs.tsx)
  - [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts)
  - [`supabase/functions/admin-shared-mailbox/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-shared-mailbox/index.ts)
  - [`supabase/functions/extension-api-v1/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/extension-api-v1/index.ts)
  - [`supabase/functions/portal-contacts/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/portal-contacts/index.ts)
  - [`src/test/serviceRoleAuthorization.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/serviceRoleAuthorization.test.ts)
- GitHub evidence reviewed:
  - `gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 25 --json ...`
  - `gh-trustedbums run view 27798687806 --repo Pidpoddev/trustedbums --json ...`
  - `gh-trustedbums run view 27798687708 --repo Pidpoddev/trustedbums --json ...`
  - `gh-trustedbums run view 27798711531 --repo Pidpoddev/trustedbums --json ...`
  - `gh-trustedbums run list --workflow "Visual UI Audit" --limit 10 --json ...`
  - `gh-trustedbums run list --workflow "Deep QA Hotfix Audit" --limit 10 --json ...`
- Local checks reviewed:
  - `git rev-parse HEAD`
  - `git status --short`
  - `git log --oneline --decorate -n 12`
  - `git show --stat --summary --name-only HEAD`
  - `git diff c02b18b..a17a856 -- ...`
  - raw `corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://rcdl.tplinkdns.com corepack pnpm run qa:target-preflight`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`
  - `curl -I -L --max-time 20 http://rcdl.tplinkdns.com`
- Live Supabase checks reviewed for project `vaoqvtxqvbptyxddpoju`:
  - project inventory and database version
  - Edge Function inventory
  - deployed source for `extension-api-v1`, `portal-contacts`, and `admin-shared-mailbox`
  - last-24-hour edge-function logs sample
  - tracker schema read plus tracker-row refreshes for `TB-0027`, `TB-0089`, and `TB-0102`
- Checks that could not fully close and why:
  - no exact-head hosted `Visual UI Audit` exists yet for `a17a856`
  - no exact-head Code Review marker exists yet for `a17a856`
  - no live Supabase advisor tool was callable in this session, so current release posture relies on direct function-source reads and tracker truth rather than a fresh advisor sweep
  - no same-session seeded live auth matrix was run against the stale live functions, so the current blocker is based on direct live source mismatch rather than a new live exploit repro
