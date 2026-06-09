# Trusted Bums Agent Operations Backlog

_Last updated: 2026-06-07 by Codex agent setup._

## Executive Read

Agent Operations Steward has been added as a weekly role to keep active Codex automations, repo prompt snapshots, shared rules, schedules, and roster docs synchronized.

## Active Agent Operations Fixes

### P1 - [TB-0033] First automation and prompt synchronization audit pending
- Evidence: New recurring and on-demand roles were added after the latest specialist prompt refresh.
- Why it matters: Drift between active app automations and repo snapshots can cause future agents to run the wrong schedule, model, workspace, or coordination rules.
- Recommendation: First weekly run should compare active automation definitions against `docs/agents/automation-prompts/*.toml`, README roster text, shared rules, and access-needs status.
- Acceptance criteria: Backlog lists the current automation roster, known drift, and any prompt/schedule/source-of-truth fixes needed.

## Automation Roster

- Daily QA Test Engineer: 1:00 AM local.
- Daily QA Harness Reliability Agent: 1:30 AM local.
- Daily Release Verification Agent: 2:00 AM local.
- Daily specialist agents: existing 3:00 AM local group.
- Daily Lead Developer Scrum: 5:00 AM local.
- Weekly Agent Operations Steward: Sunday 6:00 AM local.
- On-demand Code Review Agent: exact-commit pre-main review.
- On-demand Legal/Compliance Reviewer: legal, finance, privacy, consent, agreement, commission, endorsement, and claims-sensitive review.

## Source-Of-Truth Drift

- First run should verify root `docs/*` shared rules and `docs/agents/*` shared rules remain synchronized.
- First run should verify `.env.qa` access-state claims are current after local restoration.

## Agent Inputs

- Date of run: 2026-06-07 setup only.
- Files reviewed: active agent request, new prompt snapshots, README, consultant rules.
- Checks that could not run and why: no weekly operations audit was requested during setup.
