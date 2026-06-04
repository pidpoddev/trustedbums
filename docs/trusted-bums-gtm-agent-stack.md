# Trusted Bums GTM Agent Stack

_Last updated: 2026-06-04 by Codex._

This file is the setup map for the Trusted Bums go-to-market consultant agent stack. It connects the daily automation prompt snapshots, the backlogs each agent owns, and the handoff rules that keep GTM recommendations selective, trust-preserving, and implementation-ready.

## Stack Goal

The GTM stack exists to increase qualified marketplace liquidity:

- More qualified Clients with real target-account demand.
- More qualified Bums with credible relationship access.
- More successful warm-introduction workflows.
- Stronger trust, reputation, copy, creative, measurement, and operational controls around growth.

The stack should not optimize for raw signup volume, generic lead-gen, scraped-list tactics, passive-income framing, unapproved customer claims, guaranteed meetings, or broad paid scale before proof and tracking are ready.

## Source Files

- Agent operating pack: `docs/agents/README.md`
- Shared rules: `docs/consultant-team-rules.md`
- Agent prompt snapshots: `docs/agents/automation-prompts/`
- Access and evidence gaps: `docs/consultant-access-needs.md`
- Company and product source of truth: `docs/company-wide-rules.md`, `docs/trusted-bums-operating-model.md`, `docs/brand-strategy.md`
- Implementation handoff log: `docs/codex-edit-log.md`
- Pre-main review gate: `docs/code-review-expert-role.md`

## GTM Agent Lineup

| Agent | Prompt Snapshot | Owned Output | Schedule | Model | GTM Role |
| --- | --- | --- | --- | --- | --- |
| B2B Growth Marketer | `docs/agents/automation-prompts/trusted-bums-daily-b2b-growth-marketer.toml` | `docs/b2b-marketing-growth-backlog.md` | Daily 10:30 | `gpt-5`, high | Owns ICPs, offers, acquisition plays, referral motions, nurture, sales enablement, and growth experiments. |
| Marketing Graphics Artist | `docs/agents/automation-prompts/trusted-bums-daily-marketing-graphics-artist.toml` | `docs/marketing-graphics-campaign-backlog.md`, `docs/marketing-graphics/assets/` | Daily 09:30 | `gpt-5`, medium | Owns campaign visuals, text-free creative plates, overlay-safe asset guidance, and visual QA. |
| Content Copyeditor | `docs/agents/automation-prompts/trusted-bums-daily-content-copyeditor.toml` | `docs/content-copyeditor-backlog.md` | Daily 06:00 | `gpt-5`, medium | Protects terminology, trust tone, legal-sensitive wording, CTAs, proof language, and glossary consistency. |
| Trust & Reputation Consultant | `docs/agents/automation-prompts/trusted-bums-daily-trust-reputation-consultant.toml` | `docs/trust-reputation-backlog.md` | Daily 07:30 | `gpt-5`, high | Protects domain, email, browser, endpoint-security, public credibility, anti-abuse, and reputation risk. |
| Data Analytics Engineer | `docs/agents/automation-prompts/trusted-bums-daily-data-analytics-engineer.toml` | `docs/data-analytics-backlog.md` | Daily 06:00 | `gpt-5-codex`, high | Owns funnel definitions, source tracking, reporting, metric quality, and marketplace-liquidity measurement. |
| Product Ops Analyst | `docs/agents/automation-prompts/trusted-bums-daily-product-ops-analyst.toml` | `docs/product-ops-workflow-backlog.md` | Daily 12:00 | `gpt-5`, medium | Owns handoff feasibility, qualification queues, admin workflows, operational ownership, and exception paths. |
| UX Consultant | `docs/agents/automation-prompts/daily-ux-consultant.toml` | `docs/ux-optimization-backlog.md` | Daily 04:00 | `gpt-5.4`, medium | Owns conversion flow clarity, role journeys, information architecture, and trust-building user experience. |
| UI Consultant | `docs/agents/automation-prompts/trusted-bums-daily-ui-consultant.toml` | `docs/ui-optimization-backlog.md` | Daily 05:00 | `gpt-5`, medium | Owns visual polish, hierarchy, density, responsive quality, and GitHub Visual QA interpretation. |
| Accessibility Specialist | `docs/agents/automation-prompts/trusted-bums-daily-accessibility-specialist.toml` | `docs/accessibility-backlog.md` | Daily 07:00 | `gpt-5`, medium | Keeps GTM and portal surfaces operable, readable, and accessible. |
| QA Test Engineer | `docs/agents/automation-prompts/trusted-bums-daily-qa-test-engineer.toml` | `docs/qa-test-backlog.md` | Daily 08:00 | `gpt-5`, medium | Owns release evidence, role smoke, E2E/visual coverage, and business-access test gaps. |
| Security Engineer | `docs/agents/automation-prompts/trusted-bums-daily-security-engineer.toml` | `docs/security-review-backlog.md` | Daily 09:00 | `gpt-5`, medium | Protects auth, RLS, public endpoints, extension paths, payment/admin risk, and abuse-prone GTM flows. |
| Performance Engineer | `docs/agents/automation-prompts/trusted-bums-daily-performance-engineer.toml` | `docs/performance-engineering-backlog.md` | Daily 10:00 | `gpt-5`, medium | Protects public-site and portal speed, telemetry quality, and route performance. |
| Lead Developer | `docs/agents/automation-prompts/trusted-bums-daily-lead-developer.toml` | `docs/lead-developer-recommendations.md` | Daily 13:00 | `gpt-5`, medium | Synthesizes specialist recommendations, chooses implementation priorities, and coordinates review/QA. |

## Core GTM Workflow

1. B2B Growth Marketer defines the growth thesis, ICP, offer, channel, experiment, and quality guardrails.
2. Content Copyeditor converts the growth play into safe, clear, brand-consistent copy and flags terminology or claims risk.
3. Marketing Graphics Artist creates or curates text-free campaign plates and overlay guidance that match the offer.
4. UX and UI consultants validate the conversion surface and visual execution for the audience and route.
5. Trust & Reputation and Security review anti-spam, public endpoint, domain, email, privacy, and abuse risk.
6. Product Ops defines who qualifies the lead, owns follow-up, records status, and handles exceptions.
7. Data Analytics defines source tracking, success metrics, quality metrics, and reporting.
8. QA validates route coverage, role behavior, business access, screenshots, and workflow evidence.
9. Lead Developer decides whether to implement, defer, or split the recommendation, then records the handoff.

## Current GTM Priorities

- Build a segmented Client demand path around hard-account access.
- Turn the Fortune 500-style proof point into a claim-safe sales spine.
- Launch an invite-only Bum recruiting referral motion.
- Start founder-led LinkedIn thought leadership for hidden buyers and referral sources.
- Add a sales-assisted nurture path for qualified Client Prospects.
- Prepare a tightly scoped LinkedIn paid test only after proof, landing, source tracking, and manual review are ready.

These priorities currently live in `docs/b2b-marketing-growth-backlog.md`.

## Creative System

The first campaign asset pack lives under `docs/marketing-graphics/assets/2026-06-04/`. The approved creative direction is selective access instead of volume:

- One trusted route through outreach clutter.
- Guarded-account and warm-route motifs.
- Text-free artwork with editable overlays.
- No fake UI labels, baked-in claims, customer logos, pseudo-text, or generic dashboard visuals.

Campaign-ready concepts currently live in `docs/marketing-graphics-campaign-backlog.md`.

## Setup Checklist

Use this checklist when creating or refreshing the active automations from the repo snapshots:

1. Confirm every prompt snapshot under `docs/agents/automation-prompts/` is current.
2. Create or update the matching Codex automation with the snapshot `id`, `name`, `prompt`, `rrule`, `model`, `reasoning_effort`, `execution_environment`, and `cwds`.
3. Use the project root as the working directory for every local automation.
4. Keep generated output in the owned backlog file named in this stack document.
5. Never place secrets, raw customer data, raw mailbox content, credentials, private analytics exports, or private pipeline records in prompt snapshots or markdown.
6. After each material role or prompt change, update `docs/agents/README.md`, `docs/consultant-team-rules.md`, this file, and `docs/codex-edit-log.md`.
7. If an automation cannot access its needed dashboards, credentials, analytics, or tooling, record the blocker in `docs/consultant-access-needs.md`.

## Access Needed For Stronger GTM Runs

The stack is currently source-backed, not performance-backed. The most important missing inputs are:

- CRM or pipeline data for Client Prospects and Bum Prospects.
- Website analytics and source tracking.
- LinkedIn organic and paid performance data.
- Email and campaign performance.
- Referral-source tracking.
- Approved sales collateral and founder scripts.
- Customer and Bum interview notes.
- Legal-approved proof, claims, logo, commission, and payout boundaries.
- Ad-account budgets and channel constraints.
- Approved brand guidelines, logo usage rules, campaign calendar, and examples of winning creative.

The durable access request is tracked in `docs/consultant-access-needs.md` under `P0 - Provide CRM, analytics, and approved GTM evidence for B2B growth`.

## Quality Rules

- Prioritize qualified liquidity over volume.
- Keep Client acquisition focused on hard-account demand and clear qualification.
- Keep Bum recruiting selective, referral-led, and conduct-aware.
- Treat proof as claim-sensitive until approved.
- Treat public forms, outreach, email, and tracking as trust and reputation surfaces.
- Use editable overlays for campaign copy and logos.
- Run campaign visuals through spelling, crop, contrast, and platform-preview QA before external use.
- Do not ship broad paid or automated lifecycle motions until offer, tracking, manual review, and reputation controls are in place.
