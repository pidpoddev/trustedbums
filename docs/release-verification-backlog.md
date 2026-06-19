# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-19 by Codex daily release verification automation._

## Release Decision

Decision: `PENDING POST-PUSH VERIFICATION` for the current closeout batch.

Hosted release proof on `https://trustedbums.com` was green for prior head `a17a856`, and this closeout batch has now removed the live Supabase control-plane drift that blocked `TB-0027` and `TB-0089`. The live project `vaoqvtxqvbptyxddpoju` now serves the issuer-pinned Clerk verifier on the sampled Clerk-backed functions, and the DreamHost deploy workflow now runs a Supabase release provenance gate before upload. The release still needs the new closeout commit pushed and the hosted workflow chain checked before declaring the new head `GO`.

Safest recovery path: push the closeout commit, confirm the provenance-gated deploy and QA workflows, then close the related tracker rows against the final commit/run IDs. Rollback is not the first recommendation because the primary web deploy is healthy and the fixes are forward-only provenance, copy, layout, and live function-alignment changes.

## Evidence Summary

- GitHub `QA` run `27798687806` on `a17a856`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27798687708` on `a17a856`: passed.
- GitHub `E2E Smoke` run `27798711531` on `a17a856`: passed, including `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- Latest hosted `Visual UI Audit` success is still `27755903096` on `c02b18b`. No hosted visual artifact exists for `b67b4c4` or `a17a856`.
- [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still records `GO` for older head `4dfca6111781e0df4b9b6ee14dd811c0d90ac787`.
- Current DreamHost deploy workflow in [`.github/workflows/deploy_dreamhost.yaml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deploy_dreamhost.yaml) now runs `pnpm run release:provenance` with `SUPABASE_ACCESS_TOKEN` and project ref `vaoqvtxqvbptyxddpoju` before DreamHost upload.
- Live Supabase project `vaoqvtxqvbptyxddpoju` now shows the refreshed function set needed for this closeout:
  - `extension-api-v1` version `7`, `portal-contacts` version `5`, `profile-bootstrap` version `5`, `admin-access-requests` version `5`, and `bum-extension-download` version `3` all show the allowed Clerk issuer path in live source.
  - Additional same-pass live function refreshes include `customer-lead-duplicate-check` version `2`, `sync-clerk-users` version `3`, `clerk-impersonation` version `8`, `submit-feedback` version `3`, `sync-teams-attendees` version `3`, `clerk-user-tools` version `2`, `send-admin-email` version `9`, `api-access-keys` version `2`, `dmarc-reports` version `4`, and `schedule-teams-meeting` version `8`.
  - Prior same-day live closeout already moved `admin-shared-mailbox` to version `3`, `invite-bum` to version `4`, and `client-team` to version `3`.
- Live migration ledger proof shows latest migration `20260619120328 add_identity_review_inner_circle_companies_reverse_handoffs`, followed by `20260618101827 set_admin_scrum_owner_sync_search_path` and `20260617161426 add_admin_scrum_owner_column`.
- `https://trustedbums.com` currently returns `HTTP/2 200` with current CSP/HSTS headers and passes sourced `qa:target-preflight`.
- Runner-side external target `https://rcdl.tplinkdns.com` currently resolves DNS to `69.131.216.220`, but sourced `qa:target-preflight` fails `HTTPS` and `App shell`; `curl` without `-k` fails certificate verification and plain `http://rcdl.tplinkdns.com` returns `HTTP/1.1 403`.
- `.env.qa` is present. Raw-shell `qa:env` still fails until the expected variables are sourced; sourced `.env.qa` restores the contract and passes `qa:env`.

## Closeout Checks

### P0 - [TB-0027] Same-head Supabase provenance gate added
- Evidence: [deploy_dreamhost.yaml](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/deploy_dreamhost.yaml) now runs the Supabase provenance script before DreamHost upload, and [verify-supabase-release-provenance.mjs](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/verify-supabase-release-provenance.mjs) compares live function `version`, `status`, and `verify_jwt` metadata against [supabase/config.toml](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/config.toml) while including the local migration ledger in the proof output. Live SQL also confirmed the production migration ledger through `20260619120328`.
- Impact: future static deploys will fail before upload when live Supabase function metadata cannot be proven with the configured project/token.
- Recommendation: close after the new commit is pushed and the provenance-gated deploy workflow proves the secret is present in GitHub.
- Acceptance criteria: closeout commit is on `main`, hosted deploy runs the new provenance step successfully, and `TB-0027` cites the final commit plus live function/migration proof.

### P1 - [TB-0089] Issuer-pinning hardening redeployed live
- Evidence: live function source now shows `resolveAllowedClerkIssuer(...)` and `issuer: allowedIssuer` for `extension-api-v1` v7, `portal-contacts` v5, `profile-bootstrap` v5, `admin-access-requests` v5, and `bum-extension-download` v3. Local source scan found no remaining `resolveClerkJwksUrl` or `issuer: payload.iss` pattern under [supabase/functions](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions).
- Impact: the sampled live Clerk-backed service-role/custom-auth functions no longer let a token choose its own issuer trust root.
- Recommendation: close after final push and hosted proof are attached to the tracker.
- Acceptance criteria: tracker `TB-0089` cites the live versions above, the final commit, and the passing local auth/test proof.

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

### P1 - [TB-0102] Shared mailbox controls are live and triaged
- Evidence: live `admin-shared-mailbox` now serves version `3`, and the live `100`-message queue was triaged to `0` unassigned, `0` uncategorized, and `0` `OPEN`, with messages left `IN_PROGRESS` across explicit work queues for human review.
- Impact: the prior release blocker is no longer current; future mailbox release checks should verify live function version/source and queue counts rather than carrying the old version-2 drift.
- Recommendation: keep `TB-0102` closed unless a fresh live read shows function or queue regression.
- Acceptance criteria: tracker closeout cites `admin-shared-mailbox` v3, the triaged queue counts, and the final closeout commit.

### P2 - [TB-0018] Exact-head hosted visual proof is still missing for `a17a856`
- Evidence: latest successful `Visual UI Audit` is `27755903096` on `c02b18b`; no current-head hosted visual artifact exists for `a17a856`.
- Impact: visible admin/client surface changes since `c02b18b` still lack exact-head screenshot proof.
- Recommendation: rerun hosted `Visual UI Audit` after the control-plane hotfix, or document an explicit reuse rule tied to unchanged visible surfaces if that is truly defensible.
- Acceptance criteria: hosted `Visual UI Audit` succeeds on `a17a856`, or Release/UI records an explicit reuse note that matches the changed surface set.

## Cross-Agent Follow-Ups

### Security Engineer / Release Verification - `TB-0089` live proof now exists
- Current truth: repo/tests and sampled live function source now agree for the issuer-pinned Clerk verifier paths.
- Durable correction: do not close Edge Function auth-hardening rows from repo diff, static deploy, or browser smoke alone. Read the live function source or deployed revision for the same head before closing.

### Lead Developer / Release Verification - `TB-0027` now has a release-chain guard
- Current truth: the deploy workflow now includes live Supabase function metadata verification before DreamHost upload, but the next hosted run must confirm the GitHub secret is present.
- Durable correction: add same-chain function deployment or exact-head function provenance to the release chain whenever the pushed head changes Supabase Edge Functions.

### Product Ops Workflow Analyst - `TB-0102` source fix is not live proof
- Current truth: the shared-mailbox UI and repo function changed on `a17a856`, but live `admin-shared-mailbox` still serves the older behavior.
- Durable correction: keep source-only or hosted-web proof separate from live function proof before narrowing operational queue items that depend on Supabase functions.

### QA Harness Reliability / QA Test Engineer - green hosted smoke did not detect the live function drift
- Current truth: hosted `QA` and deploy-triggered `E2E Smoke` are still valuable, but they did not catch stale live function source on the same head.
- Durable correction: keep using hosted proof, but treat live function-source verification as a separate release surface whenever the commit range touches `supabase/functions/`.

## Tracker Closeout Sweep

- Re-read live tracker rows `TB-0018`, `TB-0019`, `TB-0024`, `TB-0027`, `TB-0089`, and `TB-0102`.
- Kept `TB-0024` separate because its external DNS acceptance criteria are still unmet.
- Prepared `TB-0027` and `TB-0089` for closeout after final push because live function/source proof now exists and the release-chain provenance guard is implemented.
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
