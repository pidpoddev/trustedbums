# Trusted Bums Agent Operating Pack

_Last updated: 2026-06-15 by Codex._

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
- `../google-analytics-api.md`: local Google Analytics Data/Admin API setup for agent-safe aggregate reporting without automating the GA web UI.
- `../bing-webmaster-api.md`: local Bing Webmaster and IndexNow setup for crawler health checks, URL submission, sitemap submission, and aggregate Bing traffic reports.
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

For GA access, prefer the local API path in `docs/google-analytics-api.md` over browser UI automation. The API path uses `GA4_PROPERTY_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, and `scripts/google-analytics-api.mjs` to pull aggregate reports or create the approved event-scoped custom dimensions and key events when the service account has the right GA property role. Use `pnpm ga4:report -- --preset=outcomes` for lead, opportunity, claim, target-response, contact, and invite outcome checks after the related app events have deployed and consented users have triggered them.

Microsoft Clarity is configured as optional consent-gated behavior analytics for `https://trustedbums.com` with project ID `x7nevilplm`, Strict masking, bot detection, cookies, and an active Google Analytics integration. Agents may use aggregate Clarity heatmap/session-friction evidence when available, plus the consent-gated outcome event names and route tags (`portal_area`, `route_group`, `auth_gate`, `is_portal_route`) emitted by the app. Do not paste raw session recordings, visitor-level timelines, names, emails, company names, customer targets, notes, or other private data into repo markdown.

Bing Webmaster Tools is verified as an approved search and Microsoft-side reputation evidence source for `https://trustedbums.com/`, tracked by closed item `TB-0071`. Agents may use Bing for crawl, indexing, sitemap, SEO/GEO, backlink, keyword, and reputation evidence when report data is available. Use `pnpm bing:health` for crawler asset checks, `pnpm bing:indexnow` for public URL submission, and `pnpm bing:webmaster traffic` for aggregate Bing impressions/clicks when `BING_WEBMASTER_API_KEY` is available. Do not place private exports, credentials, or unnecessary query/campaign detail in repo markdown.

## Chrome Profile Contract

Chrome work for Trusted Bums must use the Chrome profile named `Trusted Bums`. Before opening Google Analytics, Gmail, Microsoft or Google dashboards, webmaster tools, Trusted Bums admin tools, or any browser session where account state matters, explicitly select or verify that the connected Chrome profile metadata reports `profileName = "Trusted Bums"`. Do not use the `Bumfuzzle Boutique` or `Ryan` profiles for Trusted Bums agent work. If the Trusted Bums profile is unavailable or a page unexpectedly opens under another account, stop, record the blocker, and ask Ryan before continuing account-dependent browser work.

## Code Review Gate

Pushes or merges to `main` require a Code Review Agent GO decision for the exact commit being pushed. The local hook lives in `.githooks/pre-push` and runs `scripts/code-review-gate.mjs`.

Each developer should enable the shared hook once per clone:

```bash
pnpm run install:hooks
```

The hook blocks direct pushes to `main` unless `.codex-review-decision.json` exists locally with a fresh GO decision for the exact commit. That file is ignored by git because it is local review state.

The Code Review Agent remains on-demand and commit-bound. It should not be replaced by a daily automation. Use it when a branch is being pushed or merged to `main`, then let Lead Developer and Release Verification handle post-main evidence.

## Decision Authority Matrix

Current rebaseline: merged `main` head `dc9bd01cbcf9e02344eb9894ebfab540cdec6fe2` on 2026-06-12. GitHub `QA` run `27413665159`, DreamHost deploy run `27413665134`, and `E2E Smoke` run `27413702607` are green on that exact commit. Exact-head standard visual evidence and live Supabase/security proof remain Release Verification follow-ups.

- Code Review Agent: owns exact-commit pre-main `GO` or `NO-GO`. It updates the local `.codex-review-decision.json` only after reviewing the exact head and does not replace Release Verification.
- Release Verification Agent: owns post-main release verdicts: `GO`, `NO-GO`, `HOLD-DEPLOY`, `HOTFIX-FORWARD`, `ROLLBACK`, or `UNKNOWN`. It can hold a release even when Code Review has approved the commit.
- Lead Developer Scrum: owns synthesis, engineering priority, sequencing, and recommendation classification such as `READY`, `BLOCKED BY ACCESS`, `BLOCKED BY ANOTHER SPECIALIST`, `NEEDS QA PROOF`, and `STALE`. It does not override Code Review or Release Verification.
- QA Test Engineer: owns product workflow coverage, role access coverage, and release-risk findings. It can require `HOLD` or `NEEDS QA PROOF` evidence but does not issue final release `GO`.
- QA Harness Reliability Agent: owns workflow health, visual/deep/smoke reliability, Playwright helpers, artifact capture, and evidence durability.
- Security Engineer: owns auth, RLS, Supabase grants/functions, secrets, and privileged-path review. Security findings can block or hold release readiness through Code Review, Lead Developer, or Release Verification.
- Technology Architect Agent: owns platform boundaries, Supabase/service/API strategy, architecture diagrams, ADRs, Admin Architecture page freshness, and cross-cutting maintainability risk.
- Product-facing specialists: UX, UI, Accessibility, Content, Legal/Compliance, Product Ops, Trust, B2B Growth, Marketing Graphics, CMO, and Decision-Maker Researcher own discipline-specific recommendations and tracker updates; they route release blockers to the gate-owning agents.
- Agent Operations Steward: owns prompt, roster, schedule, shared-rule, access-needs, and source-of-truth drift so every agent runs from the same current contract.

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
