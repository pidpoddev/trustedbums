# Trusted Bums QA And Test Backlog

_Last updated: 2026-06-17 by Codex daily QA/test engineer automation._

## Executive Read

Current `main` head `af944fe` (`Allow bums to delete unattached contacts`) is not release-ready.

- GitHub `QA` run `27653495600` on `af944fe`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27653495695` on `af944fe`: failed after the site publish step because the Bing Webmaster URL submission step hit the live daily quota and exited `1`.
- GitHub `E2E Smoke` run `27653527364` on `af944fe`: skipped because the deploy workflow did not finish cleanly.
- [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) is stale on older head `f0996c5`, so `TB-0019` is open again for exact-head Code Review.

Current-session local QA preflight still separates the shell-env contract from the product state:

- Raw `corepack pnpm run qa:env`: failed in a fresh shell because QA variables were not exported.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`: passed.
- Sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`: passed against `https://trustedbums.com`.
- Focused current-worktree regression pack passed: `src/test/bumContactsMutationContract.test.ts`, `src/test/opportunityClaimStakeholders.test.ts`, and `src/test/e2eSmokeRegression.test.ts` (`18` tests total).

That local green pack does not clear the current head. Exact-head source review found a real product bug on `af944fe`: the detail-page claim flow still creates a manual represented-contact row even though My Contacts already synthesizes claim-backed rows from `opportunity_claims`, so the same person can appear twice. QA logged that as `[TB-0106]`.

## Active Recommendations

### P1 - [TB-0105] Keep Bing Webmaster quota from failing deploy after publish
- Evidence: GitHub `QA` `27653495600` passed on `af944fe`, but deploy run `27653495695` failed in `Submit sitemap and URLs to Bing Webmaster API` after the DreamHost publish step, live Bing health, and IndexNow steps had already succeeded. The failed log ended with `Bing Webmaster API SubmitUrlBatch failed with HTTP 400: {"ErrorCode":2,"Message":"ERROR!!! You have exceeded your daily url submission quota : 100"}`. The earlier quota-handling commit `12d777f` only parses quota messages that include `Quota remaining for today`, so the real GitHub error text still bubbles out as a hard failure. `E2E Smoke` `27653527364` then skipped because the deploy workflow did not complete successfully.
- Why it matters: Current release evidence is being blocked by a post-publish search-submission step instead of a product or deploy failure. That leaves exact-head smoke evidence incomplete and hides whether the shipped site is actually healthy.
- Recommendation: Treat Bing Webmaster URL batch submission as quota-aware best-effort after publish. Update the script to recognize the real quota-exhausted error shape, and/or make the workflow fail soft after the site is already deployed while still logging the skipped submission.
- Acceptance criteria: a rerun on the next head still publishes the site, records Bing quota exhaustion as a non-blocking outcome when applicable, and allows exact-head `E2E Smoke` to run instead of skipping.

### P1 - [TB-0106] Stop detail-page claims from duplicating My Contacts rows
- Evidence: Exact head `af944fe` still calls `createBumRepresentedContact()` inside [`src/pages/bum/BumOpportunityDetail.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumOpportunityDetail.tsx) after a successful decision-maker-match claim. The represented-contacts list in [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts) also derives `OPPORTUNITY_CLAIM` rows directly from `opportunity_claims`, so the same person can surface twice in My Contacts. The current worktree already contains a narrow follow-up diff and a new contract expectation in [`src/test/opportunityClaimStakeholders.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/opportunityClaimStakeholders.test.ts) that remove the manual-row side effect and keep only cache invalidation.
- Why it matters: After `af944fe`, Bums can now delete unattached manual contacts. Duplicate rows would leave one claim-backed row correctly locked and a second manual row inconsistently deletable, which makes the new contact-management behavior look broken even though the real bug is the extra row.
- Recommendation: Remove the detail-page manual-contact side effect for claim-backed matches and keep one focused regression that proves a detail-page claim invalidates My Contacts without creating a second manual row.
- Acceptance criteria: a detail-page claim for a suggested decision-maker match yields only the claim-backed My Contacts entry, no extra manual `bum_contacts` row is created, and the regression is covered by at least one focused contract or browser proof.

### P1 - [TB-0019] Refresh exact-head Code Review for `af944fe`
- Evidence: `main` advanced to `af944fe27b0ed851ce2b85dae99304a5b0c3a0bd`, but [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still records `GO` for older head `f0996c5c9f4304d36ab57908c4da34d05efc4ab6` at `2026-06-16T17:00:18Z`. Exact-head `QA` is green, but current-head deploy and smoke evidence are incomplete, so the pre-main review marker is not current for the code now on `main`.
- Why it matters: Release and QA docs cannot treat exact-head Code Review as closed once `main` moves past the reviewed SHA.
- Recommendation: Re-run Code Review for `af944fe` after the release-workflow blocker is understood so the exact-head review notes match the code and post-main QA plan currently under discussion.
- Acceptance criteria: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) points at `af944fe...`, and `TB-0019` can close again with the matching exact-head review evidence.

## Business Access Coverage

### Bum represented contacts and detail-page claim flows
- Roles: Bum allow for own manual contacts, own claim-backed contacts, own prospect contacts, own target-response contacts, and own extension captures; unrelated Bums and client-company users deny unless a separate business rule explicitly grants access; Admin may troubleshoot.
- Current proof: Current local contract coverage proves manual contact add/delete wiring, claim-contact synthesis, and the non-delete guard for `OPPORTUNITY_CLAIM` rows. Sourced current-session preflight passed against `https://trustedbums.com`. The exact head also still uses signed-in portal-contact mutations and claim-backed contact synthesis.
- Missing allow or deny proof: one authenticated browser or direct-data proof that a decision-maker-match claim creates only the claim-backed contact projection and not a second manual row; one deny proof that foreign Bums cannot read or mutate another Bum's contacts after the delete-contact change; and one current-head browser proof for the delete path once the duplicate-row bug is fixed.
- Seed data needed: one Bum with a decision-maker-match claim path, one foreign Bum deny case, and cleanup-safe tagged contacts that can be created and removed without contaminating later runs.

## Cross-Agent Follow-Ups

### Lead Developer / Release Verification - [TB-0105] Bing quota is blocking release evidence, not the site publish
- Evidence: deploy `27653495695` published the app and passed live crawler health plus IndexNow before failing on the Bing Webmaster URL batch quota. The subsequent `E2E Smoke` run skipped instead of testing the freshly published site.
- Requested action: harden the Bing Webmaster submission step so quota exhaustion is logged without aborting post-publish release evidence, then rerun exact-head deploy plus smoke.

### Lead Developer / Code Review Agent - [TB-0106] exact head still duplicates My Contacts rows after a detail-page claim
- Evidence: exact-head source still creates a manual represented contact after a claim succeeds, while My Contacts separately synthesizes claim-backed rows. The current worktree follow-up removes that side effect and adds a regression expectation, which means the bug is known locally but not fixed on `main`.
- Requested action: land the narrow follow-up, then rerun focused QA so the duplicate-row fix is proven on the shipped head rather than only in pending local changes.

### Code Review Agent / Release Verification - [TB-0019] exact-head review marker is stale again
- Evidence: `main` is `af944fe`, but the review marker still points at `f0996c5`.
- Requested action: refresh exact-head Code Review after the release-workflow blocker is handled, and keep release docs from claiming a current-head review until the marker matches.

## Coverage Map

- Exact-head GitHub evidence on `af944fe`:
  - `QA` run `27653495600`: passed.
  - `Deploy TrustedBums to DreamHost` run `27653495695`: failed after publish on Bing Webmaster URL quota exhaustion.
  - `E2E Smoke` run `27653527364`: skipped because deploy did not finish green.
- Current local green in this run:
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`
  - `corepack pnpm exec vitest run src/test/bumContactsMutationContract.test.ts src/test/opportunityClaimStakeholders.test.ts src/test/e2eSmokeRegression.test.ts`
- Current local caveat:
  - raw `corepack pnpm run qa:env` still fails in a fresh shell because required QA variables are not exported by default
- Current exact-head source finding:
  - `af944fe` still creates a manual represented-contact row after a detail-page claim for a suggested match; the local follow-up removes that side effect but is not committed or deployed

## Watchlist

- Do not treat `QA` `27653495600` as release-ready proof for `af944fe`; exact-head deploy, smoke, visual, and Code Review are incomplete.
- Do not treat the current worktree follow-up for the duplicate-contact bug as shipped proof. It is source evidence of the fix direction, not exact-head release evidence.
- Do not blame the Bing quota failure on the delete-contact feature itself. Current local contact and claim contract tests stayed green; the release blocker is the post-publish workflow branch.
- Do not reopen older closed QA items such as `TB-0054`, `TB-0086`, or `TB-0091` without current contradictory evidence; the live tracker currently keeps those closed.

## Current Standards And Time-Sensitive Notes

- Playwright still recommends testing user-visible behavior, keeping tests isolated, and avoiding third-party dependencies you do not control. That supports keeping the detail-page claim regression focused on the rendered contact outcome instead of source-shape trivia, while mocking external dependencies where appropriate. Sources: [Playwright Best Practices](https://playwright.dev/docs/best-practices).
- Vitest still documents focused mocking and controlled test context patterns. That supports a narrow regression around the post-claim contact side effect instead of broad string-only assertions or overcoupled file scans. Source: [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html).
- GitHub Actions still applies `success()` by default and documents `!cancelled()` / status-condition control for steps and jobs that should continue despite a non-critical earlier failure. That supports treating quota-limited Bing Webmaster submission as a fail-soft post-publish step so hosted smoke can still run. Source: [GitHub Actions Expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions).

## Access Requests And Evidence Gaps

- Provide one exact-head Visual UI Audit run or an explicit release-policy note that visual evidence is intentionally deferred for this head.
- Provide cleanup-safe authenticated browser proof for the duplicate-contact fix once it lands so QA can validate the fix on the deployed head rather than only by source review.
- Clarify whether Bing Webmaster URL batch submission is a required release gate or a best-effort trust signal once the site publish and public health checks have already succeeded.

## Agent Inputs

- Date of run: 2026-06-17.
- Files, docs, workflows, tracker rows, internet sources, and commands reviewed:
  - current role prompt and shared rules in `docs/agents/automation-prompts/trusted-bums-daily-qa-test-engineer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, and `docs/agents/business-access-rules.md`
  - current QA, release, lead, access-needs, business-access, and edit-log docs
  - `git status --short`
  - `git rev-parse HEAD`
  - `git log --oneline -5`
  - `git show --stat --summary af944fe`
  - `git show af944fe:src/pages/bum/BumOpportunityDetail.tsx`
  - `git diff -- src/pages/bum/BumOpportunityDetail.tsx src/test/opportunityClaimStakeholders.test.ts`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27653495695 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27653495695 --repo Pidpoddev/trustedbums --log-failed`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27653495600 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27653527364 --repo Pidpoddev/trustedbums --json ...`
  - raw `corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`
  - sourced `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`
  - `corepack pnpm exec vitest run src/test/bumContactsMutationContract.test.ts src/test/opportunityClaimStakeholders.test.ts src/test/e2eSmokeRegression.test.ts`
  - live Supabase project confirmation and tracker SQL for `TB-0019`, `TB-0105`, and `TB-0106`
  - current official guidance reviewed:
    - [Playwright Best Practices](https://playwright.dev/docs/best-practices)
    - [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
    - [GitHub Actions Expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions)
- Checks that could not fully close and why:
  - exact-head deploy is not green because the post-publish Bing Webmaster URL batch step exhausted daily quota
  - exact-head `E2E Smoke` skipped because it depends on a successful deploy workflow
  - no current-head Visual UI Audit run was available in this session
  - exact-head Code Review is stale because the current marker still points at older head `f0996c5`
