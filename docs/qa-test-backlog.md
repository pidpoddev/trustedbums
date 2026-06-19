# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-19 by Codex daily QA/test engineer automation._

## Executive Read

Current `main` head `a17a85639a1b24dfda36da87d763eb4ecd3457af` has fresh exact-head functional proof, but release evidence is only partial on the current head.

- GitHub `QA` run `27798687806` on `a17a856`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27798687708` on `a17a856`: passed.
- GitHub `E2E Smoke` run `27798711531` on `a17a856`: passed, including `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still records `GO` for older head `4dfca6111781e0df4b9b6ee14dd811c0d90ac787`, so `TB-0019` must reopen for exact-head Code Review.
- Latest hosted `Visual UI Audit` success is `27755903096` on `c02b18b`; no exact-head visual artifact exists for `b67b4c4` or `a17a856`, so `TB-0018` must reopen unless Release/UI records an explicit reuse rule for the changed surfaces.
- This run's explicit automation contract again names `https://rcdl.tplinkdns.com` as the runner-side external DNS target. Sourced `qa:target-preflight` against that host now fails `DNS`, `HTTPS`, and `App shell`, so `TB-0024` must reopen as an external-target contract/infrastructure gap. That does not invalidate the green hosted runs on `https://trustedbums.com`; it does block any claim that the named external DNS target is healthy.

Current-session local preflight stayed split across the expected QA env surfaces:

- Raw `corepack pnpm run qa:env`: failed because the shell did not have `QA_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `QA_ADMIN_EMAIL`, `QA_CLIENT_ADMIN_EMAIL`, `QA_CLIENT_FINANCE_EMAIL`, `QA_CLIENT_MEMBER_EMAIL`, and `QA_BUM_EMAIL` exported.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`: passed.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`: passed.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://rcdl.tplinkdns.com corepack pnpm run qa:target-preflight`: failed `DNS`, `HTTPS`, and `App shell`.
- Focused current-head regression pack passed: `src/test/adminSharedMailbox.test.ts`, `src/test/bumContactsMutationContract.test.ts`, `src/test/extensionApiContract.test.ts`, `src/test/financeReportsModel.test.ts`, `src/test/scrumQueueRegression.test.ts`, and `src/test/serviceRoleAuthorization.test.ts` (`36/36`).
- The only exact-head CI failure in this commit range was already fixed before current head: `QA` run `27791727975` failed on `587fb6e` because the `Retire fallback DNS host` backlog rewrite removed the explicit seeded allow/deny wording guarded by [`src/test/scrumQueueRegression.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/scrumQueueRegression.test.ts). `b67b4c4` restored the wording and the current focused pack is green again.

Closed items validated by current source, live Supabase state, or current hosted evidence and not reopened here: `TB-0054`, `TB-0055` remains the only active harness env-contract item, `TB-0089` is already closed on current head, and `TB-0105`, `TB-0106`, `TB-0108`, and `TB-0110` stay closed.

## Active Recommendations

### P1 - [TB-0019] Refresh exact-head Code Review for `a17a856`
- Evidence: `main` is now `a17a85639a1b24dfda36da87d763eb4ecd3457af`, but [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still names `4dfca6111781e0df4b9b6ee14dd811c0d90ac787`. Current exact-head `QA` `27798687806`, deploy `27798687708`, and deploy-triggered `E2E Smoke` `27798711531` all passed on `a17a856`.
- Why it matters: Release and QA docs cannot keep exact-head review coverage marked closed once `main` advances past the reviewed SHA.
- Recommendation: Re-run Code Review for `a17a856` before the next GO closeout.
- Acceptance criteria: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) names `a17a856...`, and `TB-0019` closes again with matching exact-head hosted run evidence.

### P1 - [TB-0024] Reconcile the named external DNS target `rcdl.tplinkdns.com`
- Evidence: this automation run explicitly says to treat `https://rcdl.tplinkdns.com` as the external DNS target when external DNS context is needed. On 2026-06-19, sourced `qa:target-preflight` against that host failed `DNS`, `HTTPS`, and `App shell`, and direct `curl` returned `Could not resolve host`. Shared rules and `TB-0024` were retired on 2026-06-18, so the prompt contract and the checked-in rules drifted apart.
- Why it matters: QA can no longer claim the named external host is healthy, and future trust/release/accessibility runs will split unless one contract wins.
- Recommendation: Either restore DNS/TLS/app-shell for `rcdl.tplinkdns.com` and keep it as the runner-side external target, or explicitly retire it again by updating the automation prompt, shared rules, and tracker from the same decision source.
- Acceptance criteria: sourced `QA_BASE_URL=https://rcdl.tplinkdns.com` `qa:target-preflight` passes `DNS`, `HTTPS`, and `App shell`, or Ryan explicitly re-retires the host and the prompt/rules/tracker all agree on the replacement target.

### P2 - [TB-0018] Pair current head `a17a856` with current hosted visual proof or an explicit reuse rule
- Evidence: latest hosted `Visual UI Audit` success is `27755903096` on `c02b18b`; no exact-head visual run exists for `b67b4c4` or `a17a856`. Current head changes visible queue surfaces in [`src/pages/admin/AdminInbox.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminInbox.tsx) and [`src/pages/admin/AdminHandoffs.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminHandoffs.tsx), plus finance-safe client reporting payloads in [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts).
- Why it matters: exact-head QA/deploy/smoke are green, but visible admin/client surfaces changed without a matching hosted artifact.
- Recommendation: Dispatch hosted `Visual UI Audit` on `a17a856`, or document a scope-based reuse rule that explains why the last artifact is still sufficient for these changed surfaces.
- Acceptance criteria: hosted `Visual UI Audit` succeeds on `a17a856`, or Release/UI records an explicit reuse note tied to the changed routes/components and closes the gap without implying missing proof never mattered.

## Business Access Coverage

### Bum represented contacts and detail-page claim flows
- Current proof: exact-head source in [`src/pages/bum/BumOpportunityDetail.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumOpportunityDetail.tsx) still invalidates `bum-represented-contacts` after claim success without recreating the old manual represented-contact side effect, and [`src/test/bumContactsMutationContract.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/bumContactsMutationContract.test.ts) passed on `a17a856`.
- Missing allow or deny proof: one authenticated browser or direct-data proof that unrelated Bums and client-company users deny against another Bum's represented contacts through the current live portal or direct Supabase surface, and one populated-state browser proof that a detail-page claim still yields only the claim-backed contact row on the exact head.
- Seed data needed: one Bum with a suggested decision-maker claim path, one foreign Bum deny case, and cleanup-safe represented contacts that can be created and removed without contaminating later runs.

### Admin shared mailbox claim/category controls
- Current proof: exact-head source in [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [`src/pages/admin/AdminInbox.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminInbox.tsx), and [`supabase/functions/admin-shared-mailbox/index.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-shared-mailbox/index.ts) now exposes `claim_message` and `update_category`, blocks handling/archiving uncategorized mail, and [`src/test/adminSharedMailbox.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/adminSharedMailbox.test.ts) passed on `a17a856`. Hosted `QA` `27798687806` and `E2E Smoke` `27798711531` are also green on the same head.
- Missing allow or deny proof: one cleanup-safe live proof that only Admin can claim/categorize shared-mailbox rows, and one negative proof that uncategorized rows reject handled/archive state changes through the live edge function.
- Seed data needed: one uncategorized shared-mailbox row, one Admin account, and one non-admin deny surface.

### Client Finance safe reporting projections
- Current proof: exact-head source in [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts) now uses finance-safe select lists for `customer_payment_reports` and `claim_invoices`, and [`src/test/financeReportsModel.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/financeReportsModel.test.ts) passed on `a17a856`.
- Missing allow or deny proof: one live role matrix proving Client Finance sees only the narrowed payload while Admin/Client Admin keep their operational fields, and one direct-data deny proof that finance users do not receive unrelated contact/bum fields through the same read path.
- Seed data needed: one company with a finance user, one Admin or Client Admin comparator, and one payment/invoice record with populated contact fields.

## Cross-Agent Follow-Ups

### Code Review Agent / Release Verification - [TB-0019] exact-head review drift reopened after `main` advanced to `a17a856`
- Evidence: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still names `4dfca61` while exact-head `QA`, deploy, and deploy-triggered smoke are already green on `a17a856`.
- Requested action: refresh Code Review on `a17a856` before the next GO closeout.

### Release Verification / UI Consultant / QA Harness Reliability - [TB-0018] current-head visual proof is missing again
- Evidence: latest hosted visual success is `c02b18b`; no exact-head artifact exists for `a17a856` even though visible admin queue surfaces changed.
- Requested action: dispatch current-head `Visual UI Audit` or record an explicit reuse rationale tied to the changed surfaces.

### Trust & Reputation / Lead Developer / Agent Operations - [TB-0024] external target contract drifted after the retirement decision
- Evidence: today's automation instruction restored `rcdl.tplinkdns.com` as the runner-side external DNS target, but shared rules still said retired until this QA pass, and current preflight fails `DNS`, `HTTPS`, and `App shell`.
- Requested action: choose one contract and mirror it everywhere that matters: automation prompt, shared rules, tracker, and any trust/release watchlists.
- Root-cause note: the 2026-06-18 `587fb6e` retirement sweep changed rules and backlog defaults, but the next explicit automation instruction reintroduced the host without a same-turn shared-rule/tracker resync. Missing guardrail: external target decisions need prompt/rule/tracker synchronization from one source of truth.

### Lead Developer / QA Harness Reliability - `587fb6e` doc rewrite briefly broke exact-head QA coverage
- Evidence: `QA` run `27791727975` failed on `587fb6e` because [`docs/qa-test-backlog.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md) no longer contained the explicit seeded allow/deny proof wording guarded by [`src/test/scrumQueueRegression.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/scrumQueueRegression.test.ts). `b67b4c4` restored the wording, and the current focused pack passes `36/36`.
- Requested action: when docs-only backlog rewrites touch guarded QA phrases, rerun the exact-head unit suite before closeout and preserve the seeded allow/deny lane until live fixtures exist.

## Coverage Map

- Exact-head GitHub evidence on `a17a856`:
  - `QA` run `27798687806`: passed.
  - `Deploy TrustedBums to DreamHost` run `27798687708`: passed.
  - `E2E Smoke` run `27798711531`: passed.
  - `E2E Smoke` deep jobs on `27798711531`: `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)` all passed.
- Current exact-head hosted gaps:
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still points at `4dfca61`.
  - no `Visual UI Audit` run exists for `a17a856`.
  - no newer standalone `Deep QA Hotfix Audit` run exists than `27092527987`, although deploy-triggered deep QA is current.
- Current local proof in this pass:
  - raw `corepack pnpm run qa:env` failed with missing exported QA variables
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env` passed
  - sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight` passed
  - sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://rcdl.tplinkdns.com corepack pnpm run qa:target-preflight` failed `DNS`, `HTTPS`, and `App shell`
  - `corepack pnpm exec vitest run src/test/adminSharedMailbox.test.ts src/test/bumContactsMutationContract.test.ts src/test/extensionApiContract.test.ts src/test/financeReportsModel.test.ts src/test/scrumQueueRegression.test.ts src/test/serviceRoleAuthorization.test.ts` passed
- Current live Supabase proof:
  - project `vaoqvtxqvbptyxddpoju` is `ACTIVE_HEALTHY`
  - current security advisor output is narrowed to leaked-password protection disabled
  - current-head tracker refreshes already keep `TB-0089` closed and `TB-0102` plus `TB-0047` open on `a17a856`

## Watchlist

- Keep raw-shell, sourced `.env.qa`, and hosted workflow env states separate in every QA handoff. The raw-shell failure is still a local shell-contract issue, not a hosted regression.
- Do not treat the stale standalone `Deep QA Hotfix Audit` run as a current blocker while deploy-triggered deep QA is green on `a17a856`.
- A green `https://trustedbums.com` hosted run does not satisfy runner-side external DNS evidence when the explicit target for that question is `https://rcdl.tplinkdns.com`.
- Treat the `587fb6e` QA failure as a closed escaped-defect lesson, not a live regression.

## Current Standards And Time-Sensitive Notes

- Playwright still recommends testing user-visible behavior, keeping tests isolated, and avoiding implementation-detail assertions where possible. That still supports the current focused regression packs instead of broad brittle DOM snapshots. Source: [Playwright Best Practices](https://playwright.dev/docs/best-practices).
- GitHub Actions still applies a default `success()` status check unless a step or job uses an explicit status function, which remains relevant to the deploy-triggered smoke chain used here. Source: [GitHub Actions Expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions).
- Supabase still documents that exposed views bypass RLS by default unless they use `security_invoker = true`, which remains the right frame for future claim-preview and finance-safe read-path changes. Sources: [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) and [Supabase Tables and View security](https://supabase.com/docs/guides/database/tables).
- Supabase's current changelog was reviewed on 2026-06-19 before this QA writeup. I did not find a newly surfaced breaking-change note that changes the current QA stance for these workflows; that is an inference from the current changelog page rather than a repo-specific product guarantee. Source: [Supabase Changelog](https://supabase.com/changelog).

## Access Requests And Evidence Gaps

- Exact-head Code Review marker is still missing for `a17a856`.
- Exact-head hosted `Visual UI Audit` artifact is still missing for `a17a856`.
- Runner-side external DNS target `https://rcdl.tplinkdns.com` currently fails preflight from this Mac.
- Cleanup-safe live Admin shared-mailbox allow/deny proof was not regenerated in this run.
- Live role-matrix proof for the finance-safe reporting projections was not regenerated in this run.

## Agent Inputs

- Date of run: 2026-06-19.
- Files, tests, workflows, tracker rows, and internet sources reviewed:
  - `docs/agents/automation-prompts/trusted-bums-daily-qa-test-engineer.toml`
  - `docs/agents/consultant-team-rules.md`
  - `docs/agents/company-wide-rules.md`
  - `docs/agents/consultant-access-needs.md`
  - `docs/agents/business-access-rules.md`
  - `docs/business-workflow-qa-contract.md`
  - `docs/qa-test-backlog.md`
  - `docs/release-verification-backlog.md`
  - `docs/qa-harness-reliability-backlog.md`
  - `docs/product-ops-workflow-backlog.md`
  - `docs/business-access-rules.md`
  - `docs/company-wide-rules.md`
  - `docs/consultant-team-rules.md`
  - `docs/codex-edit-log.md`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - `git rev-parse HEAD`
  - `git status --short`
  - `git log --oneline -8`
  - `git show --stat --summary --name-only 587fb6e`
  - `git show --stat --summary --name-only b67b4c4`
  - `git diff 4dfca61..a17a856 -- src docs .github package.json playwright.config.ts supabase`
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Visual UI Audit" --limit 10 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Deep QA Hotfix Audit" --limit 10 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27798687806 --repo Pidpoddev/trustedbums --json jobs,...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27798687708 --repo Pidpoddev/trustedbums --json jobs,...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27798711531 --repo Pidpoddev/trustedbums --json jobs,...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27791727975 --repo Pidpoddev/trustedbums --log-failed`
  - raw `corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://rcdl.tplinkdns.com corepack pnpm run qa:target-preflight`
  - `corepack pnpm exec vitest run src/test/adminSharedMailbox.test.ts src/test/bumContactsMutationContract.test.ts src/test/extensionApiContract.test.ts src/test/financeReportsModel.test.ts src/test/scrumQueueRegression.test.ts src/test/serviceRoleAuthorization.test.ts`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`
  - `curl -I -L --max-time 20 http://rcdl.tplinkdns.com`
  - `mcp__codex_apps__supabase._get_project`
  - `mcp__codex_apps__supabase._get_project_url`
  - `mcp__codex_apps__supabase._get_advisors`
  - `mcp__codex_apps__supabase._execute_sql` for tracker schema, current tracker rows, and current head tracker refreshes on project `vaoqvtxqvbptyxddpoju`
  - current official guidance reviewed:
    - [Playwright Best Practices](https://playwright.dev/docs/best-practices)
    - [GitHub Actions Expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions)
    - [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
    - [Supabase Tables and View security](https://supabase.com/docs/guides/database/tables)
    - [Supabase Changelog](https://supabase.com/changelog)
- Tracker refresh completed in this run:
  - reopened `TB-0019` for current head `a17a856`
  - reopened `TB-0018` because exact-head visual evidence is missing on `a17a856`
  - reopened `TB-0024` because this run's named external DNS target `rcdl.tplinkdns.com` now fails preflight and the prompt/rule contract drifted
- Checks that could not fully close and why:
  - no exact-head Code Review marker exists yet for `a17a856`
  - no exact-head hosted `Visual UI Audit` artifact exists yet for `a17a856`
  - runner-side external DNS preflight failed on `rcdl.tplinkdns.com`
