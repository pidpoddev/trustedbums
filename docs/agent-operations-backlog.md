# Trusted Bums Agent Operations Backlog

_Last updated: 2026-06-15 by Codex automation alignment pass._

## Executive Read

The active Trusted Bums automation stack is present and runnable from this project checkout: all 16 recurring automations exist in the local Codex registry, all point at `/Users/macdaddy/CodexWork/TrustedBums/trustedbums`, and all live recurring runs use `gpt-5.4`.

The previous live-registry versus repo-snapshot automation drift has been fixed. Repo prompt snapshots now use the concrete project cwd instead of `"<PROJECT_ROOT>"`, the recurring specialist batch metadata matches the live registry schedule/model/reasoning profile, and the UX, Lead Developer Scrum, and Trust role names now match the live automation ids/names. The live QA Test Engineer automation prompt was also updated with the stricter post-development regression root-cause and producing-agent feedback rule.

The remaining major mismatch is duplicate root-vs-`docs/agents` rule files drifting in both directions. `docs/consultant-team-rules.md`, `docs/company-wide-rules.md`, `docs/consultant-access-needs.md`, and `docs/business-access-rules.md` still need one authoritative copy strategy so different agents do not read materially different instructions depending on which path they hit first.

No recurring agent appears to be missing from the live registry. No pause/remove action is recommended today. The required follow-up is now the duplicated shared-rule doc reconciliation and the optional roster table.

## Active Agent Operations Fixes

### Resolved 2026-06-15 - Refresh recurring automation snapshot metadata to match the live registry
- Evidence: `docs/agents/automation-prompts/*.toml` no longer contains `"<PROJECT_ROOT>"`, `CodexFiles`, or `/Volumes` references, and every snapshot `cwds` entry now points at `/Users/macdaddy/CodexWork/TrustedBums/trustedbums`. Recurring specialist snapshots were rebaselined to the live 3 AM `gpt-5.4` / high-reasoning batch profile where applicable, and UX, Lead Developer Scrum, and Trust naming now matches the live automation ids/names.
- Why it matters: Future operators can inspect the repo prompt snapshots without rediscovering stale schedule, model, workspace, or naming drift.
- Verification: Live registry check showed all 16 `/Users/macdaddy/.codex/automations/trusted-bums-*/automation.toml` files still point at `/Users/macdaddy/CodexWork/TrustedBums/trustedbums`. Placeholder/path scans over repo snapshots and live Trusted Bums automation files returned no matches for `"<PROJECT_ROOT>"`, `CodexFiles`, or `/Volumes`.

### P1 - Reconcile the four duplicated shared-rule and access docs
- Evidence: All four duplicated source-of-truth pairs have different hashes and material content drift. `docs/consultant-team-rules.md` contains a connector/tool-discovery retry rule missing from `docs/agents/consultant-team-rules.md`. `docs/agents/company-wide-rules.md` contains the newer "New fields require clear labels and appropriate help" rule missing from the root copy. `docs/consultant-access-needs.md` and `docs/agents/consultant-access-needs.md` now share the same hosted-proof current-state postscript, but they still diverge on the tracker-write note and the active access-request inventory. `docs/business-access-rules.md` is materially broader than `docs/agents/business-access-rules.md`, including Client Legal/IT, API key, shared mailbox, bootstrap-exception, and managing-bum access rules that the agents copy does not carry.
- Why it matters: Agents are explicitly told to read both the root docs and the `docs/agents` copies. When those copies diverge, the operating contract becomes order-dependent and specialists can make conflicting decisions with equal documentary justification.
- Recommendation: Choose one authoritative file path per shared-rule surface and mirror or remove the duplicate copy. Until that is finished, weekly Agent Operations should keep diffing the pairs and should not assume either side is current by default.
- Acceptance criteria: Each shared-rule/access surface has one documented authority, duplicated copies are synced or removed, and a fresh `diff -u` on each pair shows no material drift.

### P2 - Add a roster-style schedule table to the repo pack
- Evidence: `docs/agents/README.md` correctly lists the recurring and on-demand roles, but it does not record the actual live schedule, model, or workspace layout. The only current roster with times is the local automation registry.
- Why it matters: Agent Operations is being asked to compare schedules, models, and workspaces every run, but the repo-shared pack still requires operators to inspect local registry files to answer basic roster questions.
- Recommendation: Add a compact recurring-roster table to `docs/agents/README.md` or another single authoritative roster file, using the live registry schedule/model/workspace contract.
- Acceptance criteria: A developer can open one repo file and see the current recurring role, cadence, model family, workspace, and whether the role is recurring or on-demand.

## Automation Roster

- `01:00` daily - QA Test Engineer - `gpt-5.4` - `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` - repo snapshot aligned.
- `01:30` daily - QA Harness Reliability Agent - `gpt-5.4` - `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` - repo snapshot aligned.
- `02:00` daily - Release Verification Agent - `gpt-5.4` - `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` - repo snapshot aligned.
- `03:00` daily - Accessibility, B2B Growth, Content, Data Analytics, Marketing Graphics, Performance, Product Ops, Security, Trust/Reputation, UI, and UX - all live on `gpt-5.4` in `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` - most repo metadata snapshots still stale.
- `05:00` daily - Lead Developer Scrum - `gpt-5.4` - `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` - naming drift against repo snapshot.
- `06:00` Sunday weekly - Agent Operations Steward - `gpt-5.4` - `/Users/macdaddy/CodexWork/TrustedBums/trustedbums` - repo snapshot aligned.
- On-demand repo roles only - Chief Marketing Officer, Technology Architect, Legal/Compliance Reviewer, Decision-Maker Researcher, and Code Review Agent - no recurring live automation expected today.

## Source-Of-Truth Drift

- `docs/consultant-team-rules.md` vs `docs/agents/consultant-team-rules.md`: root copy is newer on connector/tool-discovery retry behavior; agents copy still reports an older last-updated date.
- `docs/company-wide-rules.md` vs `docs/agents/company-wide-rules.md`: agents copy is newer on field-label/help expectations; root copy has not absorbed that rule yet.
- `docs/consultant-access-needs.md` vs `docs/agents/consultant-access-needs.md`: both copies now carry the same 2026-06-14 hosted-proof postscript, but they still differ materially in tracker-write history and in the active request inventory, including cleanup-authority, GTM, Visual QA, and role-access entries missing from the agents copy.
- `docs/business-access-rules.md` vs `docs/agents/business-access-rules.md`: root copy is materially ahead on client role types and several access-sensitive workflow definitions; agents copy is too incomplete to be treated as a safe mirror.
- `docs/agents/README.md`: directionally correct on role roster and ownership, but still not detailed enough to function as the schedule/model/workspace source of truth.

## Agent Inputs

- Date of run: 2026-06-14.
- Exact head reviewed: `7ee97c121918bba73149748b49f2b28133c7ffbb`.
- Automation files reviewed: `/Users/macdaddy/.codex/automations/trusted-bums-*/automation.toml` and `docs/agents/automation-prompts/*.toml`.
- Shared rules and source-of-truth files reviewed: `docs/agents/README.md`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, plus the matching root `docs/*.md` copies and the current `docs/agent-operations-backlog.md`.
- Commands reviewed: `git status --short`, `git rev-parse HEAD`, `rg`, `sed`, `diff -u`, `shasum`, `node`, and local registry file inspection under `/Users/macdaddy/.codex/automations`.
- Checks that could not run and why: I did not reconcile the duplicated root and `docs/agents` rule files directly because those docs already have in-flight worktree edits across multiple specialist-owned surfaces. This run records the current drift in the owned Agent Operations backlog instead of overwriting concurrent documentation changes.
