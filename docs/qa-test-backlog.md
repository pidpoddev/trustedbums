# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-18 by Codex daily QA/test engineer automation._

## Executive Read

Current `main` head `4dfca6111781e0df4b9b6ee14dd811c0d90ac787` has green hosted QA/release evidence, including exact-head Code Review and hosted Visual UI proof.

- GitHub `QA` run `27753046146` on `4dfca61`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27753046130` on `4dfca61`: passed.
- GitHub `Visual UI Audit` run `27753060606` on `4dfca61`: passed.
- GitHub `E2E Smoke` run `27753099729` on `4dfca61`: passed, including `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- Latest standalone `Deep QA Hotfix Audit` success is still stale on `850e507`, but deploy-triggered deep QA on the current head is green and is the fresher evidence surface.
- [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) records `GO` for `4dfca6111781e0df4b9b6ee14dd811c0d90ac787`, and live tracker `TB-0019` is closed on the same head.

Current-session local preflight stayed split across the expected three QA env surfaces:

- Raw `corepack pnpm run qa:env`: failed because the shell did not have `QA_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `QA_ADMIN_EMAIL`, `QA_CLIENT_ADMIN_EMAIL`, `QA_CLIENT_FINANCE_EMAIL`, `QA_CLIENT_MEMBER_EMAIL`, and `QA_BUM_EMAIL` exported.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`: passed.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`: passed against `https://trustedbums.com`.
- Focused current-head regression pack passed: `src/test/opportunityClaimStakeholders.test.ts`, `src/test/clientCommissionPlans.test.ts`, `src/test/e2eSmokeRegression.test.ts`, `src/test/uiVisualCleanup.test.ts`, and `src/test/scrumQueueRegression.test.ts` (`34/34`).
- Focused Visual UI harness fix passed against `https://trustedbums.com`: `public marketing and privacy states render cleanly` plus `client admin interactive states render cleanly` on both `chromium` and `mobile-chrome`.

Closed items validated by current source, live Supabase state, or current hosted evidence and not reopened here: `TB-0032`, `TB-0054`, `TB-0098`, `TB-0105`, `TB-0106`, `TB-0108`, and `TB-0110`.

## Active Recommendations

### P1 - [TB-0019] Refresh exact-head Code Review
- Evidence: `main` is now `4dfca6111781e0df4b9b6ee14dd811c0d90ac787`, [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) records `GO` for that head, and live tracker row `TB-0019` is closed with matching hosted run evidence.
- Why it matters: closed. Release and QA docs can now claim exact-head review coverage for the pushed head.
- Recommendation: no action unless `main` advances again.
- Acceptance criteria: met.

### P2 - Refresh exact-head `Visual UI Audit`
- Evidence: hosted `Visual UI Audit` `27753060606` passed on `4dfca61` after the harness fix.
- Why it matters: closed. The latest pushed head now has hosted screenshot coverage for the affected UI states.
- Recommendation: no action unless a future UI head changes.
- Acceptance criteria: met.

## Business Access Coverage

### Bum represented contacts and detail-page claim flows
- Current proof: exact-head source in [`src/pages/bum/BumOpportunityDetail.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumOpportunityDetail.tsx) now invalidates `bum-represented-contacts` after claim success without recreating the old manual `createBumRepresentedContact()` side effect, and [`src/test/opportunityClaimStakeholders.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/opportunityClaimStakeholders.test.ts) passed on the current head. Hosted `QA` `27710960865`, deploy `27710961582`, and deploy-triggered `E2E Smoke` `27711014094` are also green on the same head.
- Missing allow or deny proof: one authenticated browser or direct-data proof that unrelated Bums and client-company users deny against another Bum's represented contacts through the current live portal or direct Supabase surface, and one populated-state browser proof that a detail-page claim still yields only the claim-backed contact row on the exact head.
- Seed data needed: one Bum with a suggested decision-maker claim path, one foreign Bum deny case, and cleanup-safe represented contacts that can be created and removed without contaminating later runs.

### Claim notification preview view
- Current proof: live Supabase on project `vaoqvtxqvbptyxddpoju` now reports `public.claim_client_notification_previews` with `security_invoker=true` and only `authenticated SELECT`; older `TB-0108` closure remains consistent with current live SQL.
- Missing allow or deny proof: if this view changes again, QA still needs one exact-head role matrix proving Admin allow, intended same-company client allow, foreign-company deny, Bum deny, and public deny using the real production token shape.
- Seed data needed: one claim with notification preview rows visible to the intended client company, one foreign-company client, one Bum, and one unauthenticated request surface for deny coverage.

## Cross-Agent Follow-Ups

### Code Review Agent / Release Verification - [TB-0019] exact-head review gate drifted closed on the wrong SHA
- Evidence: closed on `4dfca61`; tracker row `TB-0019` and [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) now match the pushed head.
- Requested action: keep reviewed-SHA drift as a reopen condition before the next release closeout.

### Release Verification / UI Consultant / UX Consultant - current head visual proof is closed
- Evidence: hosted `Visual UI Audit` `27753060606` passed on `4dfca61`, replacing failed `57231bf` run `27742677438`.
- Requested action: no action unless a future UI head changes.

### QA Harness Reliability Agent - drop stale `TB-0105` carry-forward from harness language
- Evidence: current source in [`scripts/bing-webmaster-api.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/bing-webmaster-api.mjs) now treats the real daily-quota error shape as non-blocking, and current hosted deploy plus smoke are both green on `4dfca61`.
- Requested action: keep `TB-0055` as the only active harness item unless a new exact-head workflow-chain defect reproduces.

## Coverage Map

- Exact-head GitHub evidence on `4dfca61`:
  - `QA` run `27753046146`: passed.
  - `Deploy TrustedBums to DreamHost` run `27753046130`: passed.
  - `Visual UI Audit` run `27753060606`: passed.
  - `E2E Smoke` run `27753099729`: passed.
  - `E2E Smoke` deep jobs on `27753099729`: `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)` all passed.
- Current exact-head hosted gaps:
  - no newer standalone `Deep QA Hotfix Audit` run than `27092527987`, although deploy-triggered deep QA is current
- Current local proof in this pass:
  - raw `corepack pnpm run qa:env` failed with missing exported QA variables
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env` passed
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight` passed
  - `corepack pnpm exec vitest run src/test/opportunityClaimStakeholders.test.ts src/test/clientCommissionPlans.test.ts src/test/e2eSmokeRegression.test.ts src/test/uiVisualCleanup.test.ts src/test/scrumQueueRegression.test.ts` passed
  - fixed-spec `tests/e2e/visual-ui-audit.spec.ts` passed the failed public/client-admin slices against `https://trustedbums.com` on `chromium` and `mobile-chrome`
- Current live Supabase proof:
  - project `vaoqvtxqvbptyxddpoju` is visible and healthy
  - `claim_client_notification_previews` is `security_invoker=true`
  - grants on `claim_client_notification_previews` are limited to `authenticated SELECT` plus internal `postgres` and `service_role` access

## Watchlist

- Do not treat the stale standalone `Deep QA Hotfix Audit` run as a current blocker while deploy-triggered deep QA is green on `4dfca61`.
- Keep raw-shell, sourced `.env.qa`, and hosted workflow env states separate in every QA handoff. The raw-shell failure is still a local shell-contract issue, not a hosted regression.
- Do not keep `https://rcdl.tplinkdns.com` on the QA, trust, release, or visual watchlist. Ryan retired that fallback host on 2026-06-18, so QA evidence should stay on `https://trustedbums.com` unless he explicitly names another deployed host.

## Current Standards And Time-Sensitive Notes

- Playwright still recommends testing user-visible behavior and keeping tests isolated, which supports the current focused stakeholder and route-regression packs instead of implementation-detail assertions. Source: [Playwright Best Practices](https://playwright.dev/docs/best-practices).
- GitHub Actions still applies a default `success()` status check unless a step or job uses an explicit status function, which is why the deploy-triggered smoke chain needs exact-head workflow conclusions to stay green when downstream proof depends on them. Source: [GitHub Actions Expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions).
- Supabase still documents that views bypass RLS by default and that Postgres 15+ should use `security_invoker = true` when exposed roles need the underlying-table policies to apply. That remains the right validation frame for future claim-preview view changes. Source: [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Access Requests And Evidence Gaps

- No current Visual UI access gap remains for `4dfca61`; rerun only after a future UI-affecting head.
- Provide one cleanup-safe populated-state browser proof for the detail-page claim to My Contacts path on the current head so `TB-0106` stays closed on more than source and focused regression evidence.
- Provide one current exact-head allow or deny role matrix for `claim_client_notification_previews` if that view is changed again or reused in a broader portal surface.

## Agent Inputs

- Date of run: 2026-06-18.
- Files, tests, routes, tracker rows, CI evidence, and internet sources reviewed:
  - `docs/agents/automation-prompts/trusted-bums-daily-qa-test-engineer.toml`
  - `docs/agents/consultant-team-rules.md`
  - `docs/agents/company-wide-rules.md`
  - `docs/agents/consultant-access-needs.md`
  - `docs/agents/business-access-rules.md`
  - `docs/business-workflow-qa-contract.md`
  - `docs/qa-test-backlog.md`
  - `docs/release-verification-backlog.md`
  - `docs/qa-harness-reliability-backlog.md`
  - `docs/security-review-backlog.md`
  - `docs/product-ops-workflow-backlog.md`
  - `docs/ux-optimization-backlog.md`
  - `docs/codex-edit-log.md`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - `git rev-parse HEAD`
  - `git status --short`
  - `git log --oneline --decorate -5`
  - `git show --stat --summary --name-only HEAD`
  - `gh run list --limit 20 --json ...`
  - `gh run list --workflow "Visual UI Audit" --limit 8 --json ...`
  - `gh run list --workflow "Deep QA Hotfix Audit" --limit 8 --json ...`
  - `gh run view 27710960865 --json jobs,...`
  - `gh run view 27711014094 --json jobs,...`
  - `gh run download 27711014094 --dir /tmp/tb-e2e-27711014094`
  - raw `corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`
  - `corepack pnpm exec vitest run src/test/opportunityClaimStakeholders.test.ts src/test/clientCommissionPlans.test.ts src/test/e2eSmokeRegression.test.ts src/test/uiVisualCleanup.test.ts src/test/scrumQueueRegression.test.ts`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `rg` verification that active QA, trust, release, and shared-rule docs no longer treat `https://rcdl.tplinkdns.com` as a required target
  - `mcp__codex_apps__supabase._list_projects`
  - `mcp__codex_apps__supabase._execute_sql` for tracker rows, tracker schema, `claim_client_notification_previews` grants, and `security_invoker` verification on project `vaoqvtxqvbptyxddpoju`
  - current official guidance reviewed:
    - [Playwright Best Practices](https://playwright.dev/docs/best-practices)
    - [GitHub Actions Expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions)
    - [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Tracker closeout sweep completed in this run:
  - revalidated `TB-0032`, `TB-0054`, `TB-0098`, `TB-0105`, `TB-0106`, `TB-0108`, and `TB-0110` as still closed on current head evidence
  - reopened and reclosed `TB-0019` because the review marker and tracker row had drifted closed on older head `346a21a`; it now closes on `4dfca61` with matching hosted proof
- Checks that could not fully close and why:
  - no newer standalone `Deep QA Hotfix Audit` run exists yet than `27092527987`, though deploy-triggered deep QA is current
  - populated-state browser proof for current-head claim-contact deduplication was not regenerated in this pass
