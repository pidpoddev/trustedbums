# Trusted Bums Agent Operations Backlog

_Last updated: 2026-06-12 by Codex agent rebaseline._

## Executive Read

Agent Operations ran a rebaseline against fully merged `main` head `dc9bd01cbcf9e02344eb9894ebfab540cdec6fe2`. The agent system is usable, but the source of truth needed to be re-established: Code Review owns exact-commit pre-main `GO/NO-GO`, Release Verification owns post-main release verdicts, Lead Developer owns priority/classification, and the specialist agents own evidence-backed recommendations that must be routed through those gates.

Current exact-head evidence:

- Local worktree before the rebaseline was clean against `origin/main`.
- Local focused review passed for API access keys, shared mailbox, and Client Legal/IT role source tests: `corepack pnpm exec vitest run src/test/apiAccessKeys.test.ts src/test/adminSharedMailbox.test.ts src/test/clientLegalItRoles.test.ts`.
- GitHub `QA` run `27413665159` passed on `dc9bd01`.
- GitHub `Deploy TrustedBums to DreamHost` run `27413665134` passed on `dc9bd01`.
- GitHub `E2E Smoke` run `27413702607` passed on `dc9bd01`, including the deep admin, client, and bum shards.
- Code Review was refreshed locally for `dc9bd01` after source/security review of API key management, admin shared mailbox, and Clerk issuer hardening.
- Release Verification remains `HOLD-DEPLOY` until exact-head standard visual evidence is refreshed and the new privileged Supabase functions receive live security proof or an explicit waiver.

## Active Agent Operations Fixes

### P1 - [TB-0033] Keep the automation roster and prompt snapshots current
- Evidence: The original setup backlog predated Chief Marketing Officer and Decision-Maker Researcher additions and did not include the exact-head agent rebaseline.
- Why it matters: Daily agents can make stale or conflicting recommendations if the active app automations, repo prompt snapshots, roster docs, and shared rules disagree.
- Recommendation: On each weekly Agent Operations run, compare active automation definitions against `docs/agents/automation-prompts/*.toml`, this backlog, `docs/agents/README.md`, shared rules, and access-needs status.
- Acceptance criteria: The backlog lists the current automation roster, known drift, and prompt/schedule/source-of-truth fixes needed.

### P1 - Agent shared-rule copies have drifted
- Evidence: Root shared-rule files and `docs/agents/*` copies differ for consultant rules, company-wide rules, business-access rules, and access-needs content.
- Why it matters: Specialists can cite different operating contracts depending on which copy they read.
- Recommendation: Make one set authoritative, sync the copies, and add an explicit weekly Agent Operations check for drift.
- Acceptance criteria: `docs/consultant-team-rules.md`, `docs/company-wide-rules.md`, `docs/business-access-rules.md`, and `docs/consultant-access-needs.md` have a documented relationship to the matching `docs/agents/*` copies, with no material uncontrolled drift.

### P1 - Release-facing backlogs must be rebased after every main merge batch
- Evidence: Release Verification and Lead Developer files still referenced `d360570` after `dc9bd01` was fully merged and deployed.
- Why it matters: Stale release docs can cause the wrong commit to be treated as the current GO/NO-GO target.
- Recommendation: After any merge batch to `main`, rerun Code Review for the exact head when needed, refresh Release Verification and Lead Developer evidence, and explicitly mark older sections historical when they remain in the file.
- Acceptance criteria: Release-facing docs identify the same current head, workflow run IDs, and remaining blockers.

## Automation Roster

- Daily QA Test Engineer: product QA coverage, release-risk findings, business-access test matrix, and cross-agent failure feedback.
- Daily QA Harness Reliability Agent: QA machinery health, flaky workflow diagnosis, Deep QA splitting, browser/session helpers, artifact capture, and `.env.qa` contract reliability.
- Daily Release Verification Agent: release evidence status after QA or main changes, including `GO`, `NO-GO`, `HOLD-DEPLOY`, `HOTFIX-FORWARD`, and `ROLLBACK` recommendations.
- Daily specialist agents: UX, UI, Content, Marketing Graphics, B2B Growth, Accessibility, Security, Performance, Data, Product Ops, Trust & Reputation.
- Daily Lead Developer Scrum: synthesis, engineering priority, cross-specialist tradeoff classification, and implementation sequencing.
- Weekly Agent Operations Steward: prompt, schedule, shared-rule, access-needs, and source-of-truth synchronization.
- On-demand Code Review Agent: exact-commit pre-main `GO/NO-GO` review.
- On-demand Technology Architect Agent: platform architecture review, current/proposed diagrams, Admin Architecture page synchronization, ADRs, and cross-cutting technical recommendations.
- On-demand Legal/Compliance Reviewer: legal, finance, privacy, consent, agreement, commission, endorsement, and claims-sensitive review.
- On-demand Chief Marketing Officer Agent: buyer-led marketing strategy, self-service sales influence, First Call Deck strategy, and prospect-specific deck generation.
- On-demand Decision-Maker Researcher: public-web target-account contact mapping, decision-maker scoring, and human-only LinkedIn verification tasks.

## Agent Inputs

- Date of run: 2026-06-12.
- Exact head reviewed: `dc9bd01cbcf9e02344eb9894ebfab540cdec6fe2`.
- Files reviewed: `docs/agents/README.md`, `.codex-review-decision.json`, `docs/release-verification-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/technology-architecture-backlog.md`, agent shared-rule docs, recent commits, GitHub workflow evidence, and focused API/mailbox source tests.
- Checks that could not fully run and why: exact-head standard Visual UI Audit was not already current for `dc9bd01`; Release Verification should rerun or explicitly waive it after QA Harness resolves or accounts for `TB-0092`.
