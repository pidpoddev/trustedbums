# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-18 by Codex daily release verification automation._

## Release Decision

Decision: `GO` for current `main` head `4dfca6111781e0df4b9b6ee14dd811c0d90ac787`.

The current head has clean hosted proof on the primary release chain and closes the two release-evidence gaps from the previous head:

- [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) now names `4dfca6111781e0df4b9b6ee14dd811c0d90ac787`, and live tracker `TB-0019` is closed on the same head.
- Hosted `Visual UI Audit` run `27753060606` passed on `4dfca61`, replacing failed run `27742677438` on `57231bf`.

Everything else that was a live release blocker in the older `af944fe` snapshot is now closed or no longer reproduces on the current head.

## Hosted Proof

- GitHub `QA` run `27753046146` on `4dfca61`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27753046130` on `4dfca61`: passed.
- GitHub `Visual UI Audit` run `27753060606` on `4dfca61`: passed.
- GitHub `E2E Smoke` run `27753099729` on `4dfca61`: passed.
- `E2E Smoke` `27753099729` also passed `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- Current exact-head smoke artifact download retains `qa-target-preflight-artifacts/summary.json` and `summary.txt`.
- Latest hosted `Visual UI Audit` success is now `27753060606` on `4dfca61`.
- Local fixed-spec Playwright also passed the two previously failed public/client-admin slices against `https://trustedbums.com` on both `chromium` and `mobile-chrome` before the hosted rerun.
- Latest standalone `Deep QA Hotfix Audit` success remains `27092527987` on `850e507`, but current deploy-triggered deep QA makes that a stale lane rather than the primary release gap.

## Exact-Head Release Blockers

### P1 - [TB-0019] Refresh exact-head Code Review
- Evidence: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) records `GO` for `4dfca6111781e0df4b9b6ee14dd811c0d90ac787`, and live tracker row `TB-0019` is `CLOSED` with matching hosted run evidence.
- Impact: closed. Exact-head release evidence now has a valid Code Review gate for the code on `main`.
- Recommendation: no action unless `main` advances again.
- Acceptance criteria: met.

### P2 - Refresh exact-head `Visual UI Audit`
- Evidence: hosted `Visual UI Audit` `27753060606` passed on `4dfca61` after the harness fix.
- Impact: closed. Hosted screenshot coverage is current for the pushed fix head.
- Recommendation: no action unless a future UI head changes.
- Acceptance criteria: met.

## Closed Or Cleared Items

- `TB-0105`: closed. Current source in [`scripts/bing-webmaster-api.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/bing-webmaster-api.mjs) now treats the real daily-quota error shape as non-blocking, and current exact-head deploy plus smoke are green.
- `TB-0106`: closed. Current exact-head source in [`src/pages/bum/BumOpportunityDetail.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumOpportunityDetail.tsx) no longer recreates the extra manual represented-contact row, and the focused stakeholder regression is green.
- `TB-0108`: closed. Live Supabase now reports `claim_client_notification_previews` as `security_invoker=true` with grants restricted to `authenticated SELECT`.
- `TB-0054`: closed. Current exact-head smoke artifact retention includes the preflight summaries.
- `TB-0081`, `TB-0085`, and `TB-0087`: remain closed and do not reproduce in current live Supabase checks.

## Stale Or Informational Lanes

- Standalone `Deep QA Hotfix Audit` is still stale on `850e507`. Keep it visible as a stale lane, but do not let it outweigh the newer deploy-triggered deep QA proof on `4dfca61`.
- `https://rcdl.tplinkdns.com` is retired and should not be used as a release, TLS, or hosted QA watch target. Keep release evidence on `https://trustedbums.com` unless Ryan explicitly names another deployed host.
- Raw-shell `qa:env` still fails until `.env.qa` is exported; sourced `.env.qa` and hosted workflows remain healthy.

## Cross-Agent Follow-Ups

### Code Review Agent - reopen and close `TB-0019` on the real head
- Current truth: closed on `4dfca61`; the marker file and tracker row now match the pushed head.
- Requested action: no action unless `main` advances again.

### UI Consultant / UX Consultant - provide or waive current-head hosted visual proof
- Current truth: closed on `4dfca61`; hosted `Visual UI Audit` `27753060606` passed after the harness fix.
- Requested action: no action unless a new UI head changes.

### QA Harness Reliability Agent - keep standalone Deep QA status secondary to current deploy-triggered deep evidence
- Current truth: deploy-triggered deep QA is green on `4dfca61` even though the standalone workflow is older.
- Requested action: keep the release language aligned with the fresher hosted deep evidence surface.

## Tracker Closeout Sweep

- Completed this pass through live Supabase SQL.
- Reopened and reclosed `TB-0019` because its tracker state had drifted `CLOSED` on older head `346a21a`; it now closes on `4dfca61` with matching Code Review and hosted run evidence.
- Revalidated `TB-0054`, `TB-0105`, `TB-0106`, and `TB-0108` as still `CLOSED`.
- No new release blocker row was created for the failed `57231bf` visual lane because the harness fix is now pushed and hosted `Visual UI Audit` passed on `4dfca61`.

## Agent Inputs

- Date of run: 2026-06-18.
- Docs, workflows, tracker rows, and local files reviewed:
  - `docs/agents/automation-prompts/trusted-bums-daily-release-verification-agent.toml`
  - `docs/agents/consultant-team-rules.md`
  - `docs/agents/company-wide-rules.md`
  - `docs/agents/consultant-access-needs.md`
  - `docs/agents/business-access-rules.md`
  - `docs/qa-test-backlog.md`
  - `docs/qa-harness-reliability-backlog.md`
  - `docs/security-review-backlog.md`
  - `docs/ux-optimization-backlog.md`
  - `docs/codex-edit-log.md`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - `git rev-parse HEAD`
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
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`
  - `mcp__codex_apps__supabase._list_projects`
  - `mcp__codex_apps__supabase._execute_sql` for tracker rows and live `claim_client_notification_previews` verification on project `vaoqvtxqvbptyxddpoju`
- Current official guidance reviewed:
  - [GitHub Actions Expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions)
  - [Playwright Best Practices](https://playwright.dev/docs/best-practices)
  - [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Checks that could not fully close and why:
  - no newer standalone `Deep QA Hotfix Audit` run exists than `27092527987`, though deploy-triggered deep QA is current and green
