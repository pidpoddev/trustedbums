# Trusted Bums Agent Operating Pack

_Last updated: 2026-06-07 by Codex._

This folder is the repo-shared source for Trusted Bums consultant agents, operating rules, and review gates. It exists so every developer can inspect the same expected behaviors instead of relying on one person's local Codex automation registry.

## Contents

- `automation-prompts/`: snapshots of the Trusted Bums Codex automation prompts. These are reference definitions for daily UX, UI, content, B2B growth marketing, marketing graphics, accessibility, QA, QA harness reliability, release verification, security, performance, data, product ops, trust/reputation, lead developer, weekly agent operations, and on-demand Chief Marketing Officer, Technology Architect, legal/compliance, and decision-maker researcher agents.
- `consultant-team-rules.md`: shared behavioral rules and handoff expectations for every specialist.
- `company-wide-rules.md`: durable company, product, website, workflow, terminology, trust, and operating rules Ryan has clarified.
- `../codex-edit-log.md`: running implementation log and next-run recheck queue that specialists should consult before preserving stale recommendations.
- `../trusted-bums-gtm-agent-stack.md`: GTM agent stack map linking growth, creative, trust, data, product ops, QA, and implementation handoffs.
- `../decision-maker-researcher.md`: public-web decision-maker research playbook, scoring model, LinkedIn boundary, and import-ready output schema.
- `../first-call-deck-playbook.md`: Chief Marketing Officer-owned workflow for customized prospect-specific First Call Decks.
- `consultant-access-needs.md`: durable list of access, dashboard, connector, QA, and evidence gaps that limit consultant quality.
- `business-access-rules.md`: role and data access expectations used by Security, QA, Data, Product Ops, Lead Developer, and Code Review.
- `code-review-agent.md`: pre-main Code Review Agent contract, GO/NO-GO output format, and Lead Developer handoff rules.
- `../b2b-marketing-growth-backlog.md`: growth strategy backlog for increasing qualified Bums and Clients while preserving marketplace quality and trust.
- `../release-verification-backlog.md`: release evidence, GO/NO-GO/HOLD/HOTFIX/ROLLBACK status, and cross-agent release follow-ups.
- `../qa-harness-reliability-backlog.md`: QA workflow, Playwright, env-contract, artifact, and Deep QA reliability backlog.
- `../agent-operations-backlog.md`: weekly automation, prompt, schedule, and source-of-truth synchronization audit.
- `../technology-architecture-backlog.md`: on-demand platform architecture review backlog for frontend, backend, data, integrations, delivery, observability, maintainability, and architecture decision gaps.

## Scrum Tracker Contract

Every agent must create or update an Admin Tools Scrum Tracker item for any recommendation, bug, release blocker, QA gap, security finding, access blocker, or implementation follow-up it keeps active or closes. Agents must get the generated `TB-` tracking ID back and cite it in their handoff or backlog entry.

Tracker entries live in `/admin/scrum` and `public.admin_scrum_items`. Set `added_by_agent` to the agent name, classify true defects with `item_type = BUG`, and use a stable `source_key` for imported git commits, GitHub runs, or backlog sections so repeated runs update the same item instead of creating duplicates. Before opening a new item, search existing open, blocked, fixed, and recently closed tracker rows by `source_key`, title, affected route/table/workflow, GitHub commit/run ID, backlog heading, and related `TB-` references. When the best action is to add context to another agent's existing ticket, update that existing `TB-` item with the additional evidence, affected agent, recommendation, or blocker and cite the same `TB-` number in the handoff.

## Shared Evidence Sources

Google Analytics is configured as an approved aggregate website analytics source for `https://trustedbums.com`: account/property `Trusted Bums`, stream `Trusted Bums Web`, measurement ID `G-P6B5EYQMVN`, tracked by `TB-0066`. Agents may use GA for traffic, source, funnel, campaign, content, and engagement evidence once live data collection is proven. Until `TB-0066` is closed, treat GA as configured but pending data collection. Do not place raw visitor-level data, private exports, credentials, or unnecessary campaign details in repo markdown.

Bing Webmaster Tools is verified as an approved search and Microsoft-side reputation evidence source for `https://trustedbums.com/`, tracked by closed item `TB-0071`. Agents may use Bing for crawl, indexing, sitemap, SEO/GEO, backlink, keyword, and reputation evidence when report data is available. The production sitemap `https://trustedbums.com/sitemap.xml` was submitted on 2026-06-09 and may show `Processing` while Bing builds reports. Do not place private exports, credentials, or unnecessary query/campaign detail in repo markdown.

## Code Review Gate

Pushes or merges to `main` require a Code Review Agent GO decision for the exact commit being pushed. The local hook lives in `.githooks/pre-push` and runs `scripts/code-review-gate.mjs`.

Each developer should enable the shared hook once per clone:

```bash
pnpm run install:hooks
```

The hook blocks direct pushes to `main` unless `.codex-review-decision.json` exists locally with a fresh GO decision for the exact commit. That file is ignored by git because it is local review state.

The Code Review Agent remains on-demand and commit-bound. It should not be replaced by a daily automation. Use it when a branch is being pushed or merged to `main`, then let Lead Developer and Release Verification handle post-main evidence.

## Recurring And On-Demand Roles

- Daily QA Test Engineer: product QA coverage, release-risk findings, business-access test matrix, and cross-agent failure feedback.
- Daily QA Harness Reliability Agent: QA machinery health, flaky workflow diagnosis, Deep QA splitting, browser/session helpers, artifact capture, and `.env.qa` contract reliability.
- Daily Release Verification Agent: release evidence status after QA or main changes, including GO/NO-GO/HOLD/HOTFIX/ROLLBACK recommendations.
- Daily specialist agents: UX, UI, Content, Marketing Graphics, B2B Growth, Accessibility, Security, Performance, Data, Product Ops, Trust & Reputation.
- Daily Lead Developer Scrum: synthesis, engineering priority, cross-specialist tradeoff classification, and implementation sequencing.
- Weekly Agent Operations Steward: prompt/schedule/source-of-truth synchronization.
- On-demand Chief Marketing Officer Agent: buyer-led marketing strategy, self-service sales influence, First Call Deck strategy, and prospect-specific deck generation.
- On-demand Technology Architect Agent: platform architecture review, system map, cross-cutting technical recommendations, architecture decision records, and maintainability/release-safety risk analysis.
- On-demand Code Review Agent: exact-commit pre-main GO/NO-GO review.
- On-demand Legal/Compliance Reviewer: legal, finance, privacy, consent, agreement, commission, endorsement, and claims-sensitive review.
- On-demand Decision-Maker Researcher: public-web target-account contact mapping, decision-maker scoring, and human-only LinkedIn verification tasks.

## Updating This Pack

When a role changes, update the matching file in this folder and the active `docs/` source file when applicable. If a local Codex automation prompt changes, refresh the matching file under `automation-prompts/` before pushing.

Do not commit secrets, private data, raw mailbox content, or environment-specific credential values into this folder.
