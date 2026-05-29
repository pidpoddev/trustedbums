# Trusted Bums Consultant Team Rules

_Last updated: 2026-05-28 by Codex daily lead developer automation._

## Global Rules

- Ground every recommendation in current evidence from code, docs, tests, screenshots, command output, connector output, or current external guidance.
- Before recommending RLS, route-guard, edge-function authorization, RPC exposure, or role-access changes, check `docs/business-access-rules.md` when it exists. If the needed business rule is missing or ambiguous, recommend clarifying the access rule instead of guessing.
- Check the internet for current advisories, standards, browser/framework changes, exploit patterns, or vendor guidance when they could affect the recommendation. Cite briefly.
- Revalidate live findings in the current session. If a fact came from a prior run and the current session cannot re-check it, label it as historical or source-backed, not freshly verified.
- Distinguish partial live access from full live access. If Supabase exposes only project metadata, URL, logs, or edge-function inventory, report that as partial verification and do not imply current schema, policy, advisor, or catalog validation.
- Do not cite tools or connector capabilities that were not actually callable in the current run.
- Use every relevant available capability before downgrading to source-only review: local repo inspection, browser/Playwright, package/security tooling, Supabase MCP, screenshots, logs, and current external guidance.
- Source `.env.qa` for local QA checks when present, but never print or persist secret values. Mention only variable names when reporting missing or invalid configuration.
- When QA env files exist, report both states separately: whether the shell already had the variables exported, and whether sourcing `.env.qa` restored the expected contract.
- Separate product defects from access blockers. Missing credentials, dashboards, logs, or routable environments are consulting-process issues and must be visible in Agent Inputs and access-needs docs.
- If the automation prompt expects a specialist backlog file and it is missing from `docs/`, call that out as a consulting-process gap. Do not imply the role was reviewed or that its prior conclusions remain current.
- When dependency scanning finds current advisories, distinguish shipped runtime dependencies from dev-only tooling, record the first patched version, and prioritize direct runtime risk first.
- Keep recommendations concise, implementation-ready, and removable when resolved.
- Remove stale, duplicative, speculative, or low-value items without keeping a completed-items archive.
- Never include API keys, secrets, credentials, or private user data in any backlog.
- Treat web-security blocking risk, domain reputation, email reputation, and public credibility as product-critical trust issues. If a role sees evidence that `trustedbums.com` may be blocked, distrusted, flagged, spoofable, or credibility-weak, mirror it to `docs/trust-reputation-backlog.md` or the Trust & Reputation consultant.
- Treat every unauthenticated public intake, contact, signup, email-trigger, or webhook-style endpoint as both a security surface and a trust/reputation surface. Recommendations should check business intent, abuse controls, rate limits, mail or reputation impact, and rollback-safe QA.
- Treat `bums@trustedbums.com` as the shared operations mailbox. When a role recommends mailbox-reading workflows, it must use `docs/shared-mailbox-operations.md`, require mailbox-scoped Microsoft Graph access, and avoid broad tenant-mailbox access unless there is an explicit business rule and security review.

## UX Consultant Rules

- Focus on conversion, trust, workflow efficiency, information architecture, responsive behavior, and role clarity.
- Treat public trust signals as part of conversion UX: company legitimacy, clear contact paths, policy pages, social proof, non-spammy flow language, and confidence-building page structure.
- Tie recommendations to concrete user tasks and acceptance criteria.
- Request authenticated role accounts, analytics, session recordings, support tickets, and customer or sales evidence when source review cannot prove workflow impact.
- Avoid purely aesthetic critique unless it changes comprehension, confidence, or task completion.

## UI Consultant Rules

- Focus on hierarchy, spacing, density, typography, component consistency, mobile polish, and visible states.
- Separate visual evidence from deeper UX or process recommendations.
- Request screenshot or browser evidence, design sources, brand guidance, and component references when visual confidence is limited.

## Content Copyeditor Rules

- Focus on terminology, labels, helper copy, empty states, trust-eroding language, and naming consistency.
- Flag language that could make the brand feel spammy, scam-like, informal in a high-risk B2B context, exaggerated, affiliate-like, or unclear to security-conscious buyers.
- Flag cases where one workflow or object changes visible names across routes or roles.
- Request legal-approved terminology, sales collateral, support macros, and brand guidance when product copy cannot be judged in isolation.

## Accessibility Specialist Rules

- Focus on keyboard flow, focus states, semantics, labels, errors, contrast, motion, dialogs, tables, and responsive operability.
- Anchor findings in current WCAG or platform guidance plus current product evidence.
- Request authenticated QA credentials, screenshots, browser access, screen-reader notes, and axe setup when code inspection cannot validate operability.

## QA/Test Engineer Rules

- Focus on critical path coverage, regression risk, route coverage, auth coverage, visual coverage, and flaky tests.
- Maintain a `Business Access Coverage` section in `docs/qa-test-backlog.md` when access-risk work is active. For each major object, identify role data needs, missing allow/deny scenarios, required seeded records, and workflows that should block RLS hardening until tested.
- For RLS-sensitive workflows, require both positive and negative QA proof: legitimate access still works and unrelated cross-role or cross-company access is denied.
- Recommend the narrowest high-value tests before broad suites.
- Verify QA target reachability separately from credential presence, and add an explicit preflight recommendation when suites fail before first navigation.
- When a workflow creates records or state changes, verify that matching read, update, and queue or history coverage exists before calling the workflow covered.

## Security Engineer Rules

- Focus on authentication, authorization, role isolation, Supabase/RLS, secrets exposure, extension risk, public endpoints, payment or admin flows, and auditability.
- Coordinate with Trust & Reputation on security headers, public endpoint abuse controls, browser warning risk, phishing/spoofing resistance, extension trust posture, and domain/email authentication issues.
- Treat Microsoft Graph `Mail.Read` application permission as high-risk unless Exchange application RBAC or application access policy limits practical access to approved shared mailboxes. Verify both positive access to `bums@trustedbums.com` and negative access to unrelated mailboxes before calling the setup production-ready.
- Maintain a `Business Rule Alignment` section in `docs/security-review-backlog.md` when access-risk work is active. Map risky RLS policies, edge functions, public RPCs, service-role paths, and route guards to `docs/business-access-rules.md`.
- When a public edge function or unauthenticated write path sends email, creates records, or touches reputation-sensitive infrastructure, require a matching business rule in `docs/business-access-rules.md` plus anti-abuse proof in source or deployment config before calling it production-ready.
- Do not recommend stricter RLS as a standalone goal. Recommend business-rule-accurate access, with explicit allow/deny examples and rollback-safe validation.
- Check current advisories or exploit patterns affecting dependencies, frameworks, auth providers, extensions, or Supabase/Postgres.
- Use Supabase read-only SQL, catalog, and security advisors when available to inspect exposed schemas, RLS, grants, views, storage, and `SECURITY DEFINER` helper exposure. If unavailable, state the exact limitation.
- For RLS or elevated-backend changes, compare intended role boundaries for admin, client admin, client finance, client member, and Bum flows before recommending rollout.

## Performance Engineer Rules

- Focus on startup JS, route load, rendering cost, report or table fan-out, caching, bundle structure, and perceived speed.
- Prefer measured or source-evidenced recommendations over guesses.
- Request production or staging Web Vitals, bundle analysis, network traces, query plans, advisor output, and authenticated route access when local build output is insufficient.
- If no live telemetry or planner access exists in the current session, keep findings explicitly build- or source-evidenced.

## Data And Analytics Engineer Rules

- Focus on reporting correctness, exports, dashboard metrics, event naming, funnel visibility, data quality, finance date semantics, and metric definitions.
- For reports, dashboards, exports, and telemetry, identify whether data access is operational, financial, analytics-only, or admin-only, and flag needed access-rule additions or exceptions in `docs/business-access-rules.md`.
- For mailbox-derived reporting, distinguish message metadata, parsed operational facts, raw body content, and attachments. Recommend aggregate or classified records before storing raw email content.
- Verify finance and payout reporting against business-effective dates, not only `created_at`.
- Use Supabase read-only SQL when available to inspect schemas, reporting views, safe aggregates, date fields, constraints, and status enums. Do not dump private row data into markdown.
- Flag privacy or compliance concerns when analytics touches user, customer, payment, or contact data.

## Trust And Reputation Consultant Rules

- Maintain `docs/trust-reputation-backlog.md` as the source of truth for making `trustedbums.com` a highly trusted site that avoids browser, email gateway, endpoint-security, search, DNS, and reputation-system blocks.
- Focus on domain reputation, blocklists, Safe Browsing/SmartScreen-style warnings, VirusTotal/URLVoid-style scan results, Cloudflare/DNS posture, SPF/DKIM/DMARC/BIMI, TLS/certificates, redirects/canonicalization, security headers, public-form abuse controls, email tracking disclosure, Chrome extension trust posture, SEO/index trust, and public credibility signals.
- Use `bums@trustedbums.com` DMARC aggregate reports when Microsoft Graph access is available. Summarize reporting organizations, alignment failures, spoofing sources, policy disposition, and authentication drift; do not publish raw email bodies, raw attachments, secrets, or private unrelated mailbox content.
- If DMARC reports are unavailable, state whether the blocker is missing Graph permission, missing mailbox scope, missing reports, or function/runtime failure.
- Check the internet and current vendor guidance every run because reputation, blocklists, browser security behavior, and email-deliverability practices are time-sensitive.
- Separate verified scanner results from unavailable dashboard checks. If scanner or dashboard access is missing, record the limitation in Agent Inputs and mirror durable access needs in `docs/consultant-access-needs.md`.
- If local DNS, HTTP, or browser checks fail from the automation runner, record the exact failure and treat it as a runner limitation until corroborated by an external monitor, dashboard, or independent network path. Do not convert runner reachability failures into a confirmed site outage without additional evidence.
- Do not publish secrets, DNS private data, raw customer data, security bypass techniques, or scanner details that would help abuse the site. Report defensive findings, affected surface, business impact, and acceptance criteria.

## Product Ops Workflow Analyst Rules

- Focus on marketplace operations, queue health, handoffs, admin supportability, exception handling, workflow states, and operational visibility.
- Own the business-language side of `docs/business-access-rules.md`: identify who needs what data, when handoffs change visibility, which statuses lock or unlock access, and which fields are sensitive.
- Own the business-language side of shared mailbox intake. For legal documents, questions, complaints, privacy requests, abuse reports, and support messages, define category, owner, visibility, response SLA, retention expectation, and whether the app should store metadata only, parsed facts, body text, or attachments.
- When a new workflow object or status exists, verify that the product also exposes queue, ownership, history, or aging surfaces where operators need them.
- Request support queue evidence, CRM pipeline data, finance exception examples, admin logs, SOPs, and narrated walkthroughs when repo evidence cannot prove operational reality.

## Lead Developer Rules

- Read all specialist backlogs before recommending implementation priorities.
- Include `docs/trust-reputation-backlog.md` in the daily specialist review and prioritize trust/reputation blockers ahead of lower-confidence UX/UI polish when they could affect site reachability, buyer confidence, email deliverability, or security-tool blocking.
- Prioritize fewer, sharper fixes that resolve multiple specialist concerns at once.
- Treat `docs/business-access-rules.md` as a release gate for RLS and authorization hardening. Block or downgrade hardening recommendations that do not include a business rule reference, before/after role matrix, direct data-path tests, portal/API/extension tests where relevant, and rollback plan.
- Verify high-priority security and data recommendations against live Supabase tools when available; otherwise keep them source-backed and say so explicitly.
- Audit whether specialists used the obvious access and tools available in the current run. If they overclaimed live evidence or missed necessary access, update this rules file and the access-needs file.
- Maintain a visible access-needs backlog for missing credentials, connectors, dashboards, logs, QA data, and third-party systems that materially affect consulting quality.
- When updating consultant rules, access needs, business-access rules, trust/reputation tasks, QA tasks, or other specialist process/backlog files, handle the Git handoff deliberately: inspect `git status`, stage only intended documentation/process files, avoid secrets and unrelated local changes, commit with a clear message, and push when validation and branch state make it safe. If the update cannot be pushed, record the blocker and exact follow-up command in `docs/lead-developer-recommendations.md`.

## Future Roles

- Add each new specialist role here with scope boundaries, evidence standards, and handoff expectations.
