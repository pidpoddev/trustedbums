# Trusted Bums Agent Operations Backlog

_Last updated: 2026-06-20 by Codex TB-0033 automation sync audit._

## Executive Read

The first current automation and prompt synchronization audit is complete. `corepack pnpm agent-ops:audit` compared the local Codex automation registry under `/Users/macdaddy/.codex/automations` with the repo prompt snapshots under `docs/agents/automation-prompts`, and the live Trusted Bums registry has `16` recurring automations, all on `/Users/macdaddy/CodexWork/TrustedBums/trustedbums`.

The existing live recurring automations match their repo snapshot metadata for name, status, schedule, model, reasoning effort, and workspace. The audit found one remaining drift item: the repo has an active `trusted-bums-daily-bum-supply-leader` cron snapshot scheduled for `04:30`, but no matching live recurring automation exists in the local registry. This is an operations follow-up, not a product release blocker.

`TB-0033` can close as the first synchronization audit is no longer pending. Weekly Agent Operations should keep the Bum Supply Leader automation gap and the duplicated shared-rule docs visible until Ryan decides whether to create the live automation or retire the snapshot.

## Active Agent Operations Fixes

### P1 - Decide whether Bum Supply Leader should be a live recurring automation
- Evidence: `corepack pnpm agent-ops:audit` returned `liveRecurringCount: 16`, `repoActiveCronSnapshotCount: 17`, and one `missingLive` entry: `trusted-bums-daily-bum-supply-leader`.
- Why it matters: The repo says the Bum Supply Leader should run daily, but the local automation registry will not actually run it. Supply work can appear owned in docs while no automation fires.
- Recommendation: Either create the live recurring automation from `docs/agents/automation-prompts/trusted-bums-daily-bum-supply-leader.toml` or change the snapshot/README to mark it on-demand or paused.
- Acceptance criteria: A fresh `corepack pnpm agent-ops:audit` shows no missing live recurring Trusted Bums snapshot, or the snapshot is no longer active cron.

### P1 - Reconcile the four duplicated shared-rule and access docs
- Evidence: Prior Agent Operations passes found material drift between root docs and `docs/agents` copies for `consultant-team-rules.md`, `company-wide-rules.md`, `consultant-access-needs.md`, and `business-access-rules.md`.
- Why it matters: Agents are told to read both paths. Divergent copies make the operating contract order-dependent.
- Recommendation: Choose one authoritative file path per shared-rule surface and mirror or remove the duplicate copy.
- Acceptance criteria: Each shared-rule/access surface has one documented authority, duplicated copies are synced or removed, and fresh diffs show no material drift.

## Automation Roster

| Role | Live cadence | Model | Workspace | Snapshot status |
| --- | --- | --- | --- | --- |
| QA Test Engineer | Daily 01:00 | `gpt-5.4` | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | Aligned |
| QA Harness Reliability Agent | Daily 01:30 | `gpt-5.4` | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | Aligned |
| Release Verification Agent | Daily 02:00 | `gpt-5.4` | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | Aligned |
| Accessibility, B2B Growth, Content, Data Analytics, Marketing Graphics, Performance, Product Ops, Security, Trust/Reputation, UI, UX | Daily 03:00 | `gpt-5.4` | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | Aligned |
| Bum Supply Leader | Missing live automation | `gpt-5.4` in snapshot | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` in snapshot | Drift: active cron snapshot has no live registry entry |
| Lead Developer Scrum | Daily 05:00 | `gpt-5.4` | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | Aligned |
| Agent Operations Steward | Sunday 06:00 | `gpt-5.4` | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | Aligned |
| CEO, Chief Marketing Officer, Technology Architect, Legal/Compliance Reviewer, Decision-Maker Researcher, Code Review Agent | On demand | Snapshot-defined | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | No live recurring automation expected |

## Source-Of-Truth Drift

- `docs/consultant-team-rules.md` vs `docs/agents/consultant-team-rules.md`: still needs a final authority decision rather than relying on both copies.
- `docs/company-wide-rules.md` vs `docs/agents/company-wide-rules.md`: still needs a final authority decision rather than relying on both copies.
- `docs/consultant-access-needs.md` vs `docs/agents/consultant-access-needs.md`: still needs a final authority decision rather than relying on both copies.
- `docs/business-access-rules.md` vs `docs/agents/business-access-rules.md`: still needs a final authority decision rather than relying on both copies.

## Agent Inputs

- Date of run: 2026-06-20.
- Exact local branch reviewed: `main`.
- Automation files reviewed: `/Users/macdaddy/.codex/automations/trusted-bums-*/automation.toml` and `docs/agents/automation-prompts/trusted-bums-*.toml`.
- Shared rules and source-of-truth files reviewed: `docs/agents/README.md`, `docs/agents/consultant-team-rules.md`, `docs/consultant-team-rules.md`, and current `docs/agent-operations-backlog.md`.
- Checks run: `corepack pnpm agent-ops:audit`, `corepack pnpm exec vitest run src/test/invitationRedirect.test.ts src/test/managingBumInvites.test.ts src/test/agentTrackerRules.test.ts`, `node --check scripts/audit-agent-automation-sync.mjs`, and local registry file inspection.
- Checks that could not run and why: No active automation was changed during this audit because Ryan asked to complete `TB-0033`, not to create a new recurring Bum Supply Leader automation.
