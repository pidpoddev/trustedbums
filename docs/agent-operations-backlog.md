# Trusted Bums Agent Operations Backlog

_Last updated: 2026-06-21 by Codex weekly agent operations automation._

## Executive Read

The weekly sync reran on exact head `7c7e0e0e82db014308994177718a0f53b7efac2a`. `corepack pnpm agent-ops:audit` still shows a stable live Trusted Bums registry: `16` recurring automations are active, every live entry stays on `/Users/macdaddy/CodexWork/TrustedBums/trustedbums`, and there are no live-vs-snapshot mismatches for name, status, schedule, model, or reasoning effort.

The only live registry gap remains `trusted-bums-daily-bum-supply-leader`: the repo still carries it as an active `04:30` cron snapshot, but the local Codex registry still has no matching live automation. That is still an agent-operations follow-up, not a product release blocker.

Today's material drift moved to the duplicated source-of-truth docs rather than the automation registry. Root docs and `docs/agents` copies now disagree on shared rules, company-wide rules, access-needs status, and business-access matrices, so agent behavior depends on which file path was read first. The README roster text also needed a wording correction so Bum Supply Leader is treated as snapshot-only until the live cron exists.

`TB-0033` should stay open as the weekly operating-pack umbrella until the Bum Supply Leader create/pause/remove decision lands and the duplicated shared-doc authority problem is resolved.

## Active Agent Operations Fixes

### P1 - Decide whether Bum Supply Leader should be a live recurring automation, a paused snapshot, or a removed role
- Evidence: `corepack pnpm agent-ops:audit` returned `liveRecurringCount: 16`, `repoActiveCronSnapshotCount: 17`, and one `missingLive` entry: `trusted-bums-daily-bum-supply-leader`. The live registry under `/Users/macdaddy/.codex/automations` still has no matching supply automation file.
- Why it matters: The repo can imply daily Supply ownership while no recurring automation actually runs. That makes the ELT supply seat look covered in docs while the live operating system is not doing the work.
- Recommendation: Choose one explicit action and sync all surfaces to it: create the live recurring automation from `docs/agents/automation-prompts/trusted-bums-daily-bum-supply-leader.toml`, mark the snapshot `PAUSED` or on-demand, or remove the snapshot if Supply is intentionally handled elsewhere.
- Acceptance criteria: A fresh `corepack pnpm agent-ops:audit` shows no `missingLive` cron snapshot, or the snapshot is no longer an active recurring role in prompt files and README text.

### P1 - Stop double-editing the shared rules and access source-of-truth files
- Evidence: `diff -u` shows root `docs/consultant-team-rules.md` has the connector/tool-discovery fallback rule that `docs/agents/consultant-team-rules.md` lacks; `docs/agents/company-wide-rules.md` includes the newer `New fields require clear labels and appropriate help` section while root `docs/company-wide-rules.md` does not; `docs/agents/consultant-access-needs.md` has additional 2026-06-21 UI and QA updates not mirrored into root; and `docs/business-access-rules.md` now has materially broader coverage than `docs/agents/business-access-rules.md`, including root-only sections for Client API Access Keys, Access Requests and Bootstrap Exceptions, Client Team/Deal Registration, Client Finance reporting, and Admin Email reporting.
- Why it matters: Agents are instructed to read both paths. When those copies diverge, prompt outcomes become order-dependent, stale env/access claims linger in one copy, and role-access recommendations can be made from incomplete matrices.
- Recommendation: Pick one authority for each shared-rule surface and either generate the mirror from that source in the same session or remove the duplicate path from prompts and README. Do not keep two manually edited copies.
- Acceptance criteria: Each shared-rule/access surface has one documented authority, mirrored copies are regenerated or removed in the same change set, and fresh `diff -u` checks across the duplicate paths are clean.

## Automation Roster

| Role | Live cadence | Model | Workspace | Snapshot status |
| --- | --- | --- | --- | --- |
| QA Test Engineer | Daily 01:00 | `gpt-5.4` | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | Aligned |
| QA Harness Reliability Agent | Daily 01:30 | `gpt-5.4` | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | Aligned |
| Release Verification Agent | Daily 02:00 | `gpt-5.4` | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | Aligned |
| Accessibility, B2B Growth, Content, Data Analytics, Marketing Graphics, Performance, Product Ops, Security, Trust/Reputation, UI, UX | Daily 03:00 | `gpt-5.4` | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | Aligned |
| Bum Supply Leader | Snapshot only; no live recurring automation | `gpt-5.4` in snapshot | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` in snapshot | Drift: active cron snapshot has no live registry entry |
| Lead Developer Scrum | Daily 05:00 | `gpt-5.4` | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | Aligned |
| Agent Operations Steward | Sunday 06:00 | `gpt-5.4` | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | Aligned |
| CEO, Chief Marketing Officer, Technology Architect, Legal/Compliance Reviewer, Decision-Maker Researcher, Code Review Agent | On demand | Snapshot-defined | `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` | No live recurring automation expected |

## Source-Of-Truth Drift

- `docs/consultant-team-rules.md` vs `docs/agents/consultant-team-rules.md`: root adds the connector or MCP tool-discovery retry rule, while the `docs/agents` copy omits it.
- `docs/company-wide-rules.md` vs `docs/agents/company-wide-rules.md`: the `docs/agents` copy is newer and includes the `New fields require clear labels and appropriate help` rule, while root still shows the older date and misses that section.
- `docs/consultant-access-needs.md` vs `docs/agents/consultant-access-needs.md`: the `docs/agents` copy includes extra 2026-06-21 UI and QA tracker/access updates and slightly different current-state wording; root is now the stale copy for that surface.
- `docs/business-access-rules.md` vs `docs/agents/business-access-rules.md`: root currently has `21` workflow sections while `docs/agents` has `17`, so the mirrored access matrix is no longer functionally equivalent.

## Agent Inputs

- Date of run: 2026-06-21.
- Exact local branch reviewed: `main`.
- Exact local head reviewed: `7c7e0e0e82db014308994177718a0f53b7efac2a`.
- Automation files reviewed: `/Users/macdaddy/.codex/automations/trusted-bums-*/automation.toml` and `docs/agents/automation-prompts/trusted-bums-*.toml`.
- Shared rules and source-of-truth files reviewed: `docs/agents/README.md`, `docs/consultant-team-rules.md`, `docs/agents/consultant-team-rules.md`, `docs/company-wide-rules.md`, `docs/agents/company-wide-rules.md`, `docs/consultant-access-needs.md`, `docs/agents/consultant-access-needs.md`, `docs/business-access-rules.md`, `docs/agents/business-access-rules.md`, and current `docs/agent-operations-backlog.md`.
- Checks run: `corepack pnpm agent-ops:audit`, `git rev-parse HEAD`, `find /Users/macdaddy/.codex/automations -maxdepth 2 -name automation.toml | rg trusted-bums`, `diff -u` across the duplicated shared-doc paths, `rg` heading and evidence scans across README/access/rule files, and direct local automation metadata inspection.
- Checks that could not run and why: No live automation, shared-rule authority flip, or tracker row change was applied in this audit because this pass was scoped to evidence-backed synchronization findings rather than registry mutation or broad shared-doc consolidation.
