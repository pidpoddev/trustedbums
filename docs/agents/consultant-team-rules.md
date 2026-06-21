# Trusted Bums Consultant Team Rules

_Last updated: 2026-06-17 by Codex._

## Global Rules

- Ground every recommendation in current evidence from code, docs, tests, screenshots, command output, connector output, or current external guidance.
- Check `docs/company-wide-rules.md` before asking Ryan to repeat expected company, product, website, workflow, terminology, trust, access, or operating behavior.
- When Ryan clarifies expected behavior for the company, website, product, workflow, roles, terminology, access, trust, or operations, update `docs/company-wide-rules.md` during the same work session. Then mirror the rule into any narrower source of truth it affects, such as `docs/business-access-rules.md`, `docs/trust-reputation-backlog.md`, `docs/content-copyeditor-backlog.md`, `docs/qa-test-backlog.md`, or this file.
- Before recommending RLS, route-guard, edge-function authorization, RPC exposure, or role-access changes, check `docs/business-access-rules.md` when it exists. If the needed business rule is missing or ambiguous, recommend clarifying the access rule instead of guessing.
- When Ryan reports that something is broken, not working, wrong, confusing, unsafe, or repeatedly failing, treat it as an escaped-defect review, not only a one-off fix. The response must identify the user job that failed, the current observed failure, the likely source or introducing change when identifiable, why the existing review, QA, agent handoff, or business rule did not prevent it, and the durable correction needed to prevent recurrence.
- Every escaped-defect review must produce one of these systemic outcomes before the issue is closed: an executable guardrail such as a unit, integration, Playwright, RLS allow/deny, preflight, CI, lint, or monitoring check; a business-rule clarification request to Ryan when expected behavior is ambiguous; a product or code change that makes the workflow fail closed or self-correct; or an explicit accepted-risk note in the relevant backlog and tracker item.
- If an escaped defect traces back to an agent recommendation, implementation, release decision, QA gap, or unclear specialist ownership, update that role's prompt, backlog, acceptance criteria, handoff, or this shared rule during the same work session. If the source agent cannot be identified, update the broadest relevant gate: QA Test Engineer, QA Harness Reliability Agent, Code Review Agent, Release Verification Agent, Lead Developer, Agent Operations Steward, or `docs/business-workflow-qa-contract.md`.
- Do not close or downgrade a user-reported failure merely because the immediate symptom was patched. Closure requires evidence that the fix works and that the prevention mechanism, business-rule question, or accepted-risk record exists in the appropriate durable location: code/tests, `docs/business-access-rules.md`, `docs/business-workflow-qa-contract.md`, specialist backlog, tracker row, automation prompt, or `docs/codex-edit-log.md`.
- Check the internet for current advisories, standards, browser/framework changes, exploit patterns, or vendor guidance when they could affect the recommendation. Cite briefly.
- Revalidate live findings in the current session. If a fact came from a prior run and the current session cannot re-check it, label it as historical or source-backed, not freshly verified.
- Distinguish partial live access from full live access. If Supabase exposes only project metadata, URL, logs, or edge-function inventory, report that as partial verification and do not imply current schema, policy, advisor, or catalog validation.
- Do not cite tools or connector capabilities that were not actually callable in the current run.
- Before preserving active backlog items, read `docs/codex-edit-log.md` when it exists. If the latest handoff names your role, recheck the shipped change and downgrade, remove, or narrow stale recommendations instead of asking for already implemented work.
- Before carrying forward an active recommendation, reconcile it against the current route map, recent commits, and source files. If code already shipped part of the recommendation, downgrade it to the remaining gap and update acceptance criteria instead of repeating stale implementation work.
- Use every relevant available capability before downgrading to source-only review: local repo inspection, browser/Playwright, package/security tooling, Supabase MCP, screenshots, logs, and current external guidance.
- Chrome browser work for Trusted Bums must explicitly use the Chrome profile named `Trusted Bums`. Before opening Google Analytics, Gmail, Microsoft or Google dashboards, webmaster tools, Trusted Bums admin tools, or any account-state-dependent browser session, verify the connected profile reports `profileName = "Trusted Bums"`. Do not use `Bumfuzzle Boutique` or `Ryan` profiles for Trusted Bums work. If the profile is unavailable or the page opens under another account, stop and record the blocker instead of continuing.
- For Trusted Bums live Supabase checks, use the authenticated project-scoped MCP server `mcp__supabase_trustedbums` for project `vaoqvtxqvbptyxddpoju`. Confirm the project URL resolves to `https://vaoqvtxqvbptyxddpoju.supabase.co` before treating live Supabase evidence as current. If the project-scoped server is unavailable, use the generic Supabase app connector for the same project id and record the fallback in Agent Inputs.
- For Google Analytics evidence, prefer the local API path in `docs/google-analytics-api.md` and `scripts/google-analytics-api.mjs` over browser UI automation. Use `GA4_PROPERTY_ID` and `GOOGLE_APPLICATION_CREDENTIALS` only as local secret/config values, cite aggregate report presets and date ranges in Agent Inputs, and never place service-account keys, raw visitor-level data, or private exports in repo markdown. Use the `outcomes` preset for aggregate lead, opportunity, claim, target-response, contact, and Bum-invite events once those deployed events have consented traffic.
- Google Analytics is now an approved website analytics evidence source for `https://trustedbums.com`. When a role's task needs traffic, funnel, source, campaign, conversion, engagement, or content-performance evidence, use GA aggregates when available, cite the property/stream/date range in Agent Inputs, and keep raw visitor-level or private data out of repo markdown. Treat GA collection as pending until `TB-0066` is closed with production data-received proof. For authenticated portal evidence, prefer aggregate dimensions from the consent-gated `trustedbums_route_view` event: `portal_area`, `route_group`, `auth_gate`, and `is_portal_route`; do not request or export route IDs, claim IDs, user IDs, email addresses, or raw page-location rows.
- Microsoft Clarity is an approved optional behavior-analytics source only for consented, aggregate workflow-friction review. Use Strict-masked Clarity recordings, heatmaps, Smart Events, consented app outcome events, and the aggregate route tags `portal_area`, `route_group`, `auth_gate`, and `is_portal_route` when they help diagnose UX, UI, content, conversion, or QA friction. Do not export raw recordings, visitor timelines, names, emails, companies, target accounts, notes, contact data, or page IDs into repo docs.
- Bing Webmaster Tools is now a verified and approved search and domain-reputation evidence source for `https://trustedbums.com`. When a role's task needs Bing crawl, indexing, sitemap, SEO/GEO, backlink, keyword, or Microsoft-side reputation evidence, use Bing Webmaster aggregate/report data when available, cite the site/report/date range in Agent Inputs, and keep private exports or credentials out of repo markdown. Use `pnpm bing:health` for public crawler checks, `pnpm bing:indexnow` after public route or metadata changes, and `pnpm bing:webmaster traffic` for aggregate Bing impressions/clicks when `BING_WEBMASTER_API_KEY` is available. A zero-traffic Bing report is not by itself a crawler failure; first compare health checks, sitemap status, URL inspection, and indexed pages.
- Search discovery and backlink recommendations must stay trust-safe. Agents may recommend sitemap submission, IndexNow/Bing URL submission, Google Search Console follow-up, crawlable internal links, and legitimate company, founder, partner, customer, or relevant industry citations. Agents must not recommend buying backlinks, reciprocal link exchanges, mass directory submission, low-quality guest posts, synthetic AI citation networks, or any tactic that exists mainly to manipulate ranking signals.
- When a consultant run needs a local preview or route check from the Codex runner, use port `8080` only. Use `https://trustedbums.com` as the default public trust, release, QA, and visual-review target. The former `https://rcdl.tplinkdns.com` external DNS target is retired from required proof paths under `TB-0024`; do not use or reopen it unless Ryan explicitly creates a new external-host requirement.
- For GitHub-hosted `QA`, `E2E Smoke`, `Visual UI Audit`, and `Deep QA Hotfix Audit`, keep `QA_BASE_URL` on `https://trustedbums.com` unless Ryan explicitly asks to validate another deployed host. Treat `https://trustedbums.com` as the only default public trust target.
- Source `.env.qa` for local QA checks when present, but never print or persist secret values. Mention only variable names when reporting missing or invalid configuration.
- When QA env files exist, report both states separately: whether the shell already had the variables exported, and whether sourcing `.env.qa` restored the expected contract.
- Do not use fault-coded language for uncommitted markdown or backlog updates in user-facing status. Use "pending documentation updates", "unpublished documentation updates", or "local documentation changes" instead. Treat these files as normal agent handoff ledgers: either commit them intentionally, leave them as pending local notes, or say they are unrelated to the current task without making the state sound like a defect.
- Separate product defects from access blockers. Missing credentials, dashboards, logs, or routable environments are consulting-process issues and must be visible in Agent Inputs and access-needs docs.
- If the automation prompt expects a specialist backlog file and it is missing from `docs/`, call that out as a consulting-process gap. Do not imply the role was reviewed or that its prior conclusions remain current.
- When dependency scanning finds current advisories, distinguish shipped runtime dependencies from dev-only tooling, record the first patched version, and prioritize direct runtime risk first.
- Keep recommendations concise, implementation-ready, and removable when resolved.
- Remove stale, duplicative, speculative, or low-value items without keeping a completed-items archive.
- Every agent that creates, preserves, escalates, reopens, or closes a recommendation, bug, release blocker, QA gap, security finding, access blocker, or implementation follow-up must create or update the matching Admin Tools Scrum Tracker item in `/admin/scrum` / `public.admin_scrum_items`, record `added_by_agent`, classify bugs with `item_type = BUG`, and get the generated `TB-` tracking ID back before publishing the handoff. Before creating a new item, search existing open, blocked, fixed, and recently closed tracker rows by `source_key`, title, affected route/table/workflow, GitHub commit/run ID, backlog heading, and related `TB-` references. Agent handoffs and backlog entries should refer to the item by its `TB-` number; use a stable `source_key` when importing from git commits, GitHub runs, or specialist backlog sections so repeat runs update the existing item instead of creating duplicates. If the best action is to add context to another agent's existing ticket, update that existing `TB-` item with the new evidence, affected agent, recommendation, or blocker instead of opening a duplicate, and cite that same `TB-` number in the handoff.
- After implementing or pushing a change, append a dated entry to `docs/codex-edit-log.md` with the commit or branch, changed surfaces, validation, and which specialist agents should recheck it on their next run.
- Never include API keys, secrets, credentials, or private user data in any backlog.
- Treat web-security blocking risk, domain reputation, email reputation, and public credibility as product-critical trust issues. If a role sees evidence that `trustedbums.com` may be blocked, distrusted, flagged, spoofable, or credibility-weak, mirror it to `docs/trust-reputation-backlog.md` or the Trust & Reputation consultant.
- Treat every unauthenticated public intake, contact, signup, email-trigger, or webhook-style endpoint as both a security surface and a trust/reputation surface. Recommendations should check business intent, abuse controls, rate limits, mail or reputation impact, and rollback-safe QA.
- Treat `bums@trustedbums.com` as the shared operations mailbox. When a role recommends mailbox-reading workflows, it must use `docs/shared-mailbox-operations.md`, require mailbox-scoped Microsoft Graph access, and avoid broad tenant-mailbox access unless there is an explicit business rule and security review.
- Cross-functional recommendations must not be treated as single-discipline decisions. Before Lead Developer promotes or implements a specialist recommendation that materially affects another discipline, record the affected specialists and the tradeoff check needed. Examples: Security/RLS changes must check UX, Product Ops, QA, Data, and Support impact; UI density changes must check Accessibility and UX; Performance changes must check Analytics, UX, and QA; Content/legal wording changes must check Trust, Legal/Compliance owner, UX, and Product Ops.
- Treat GitHub Actions as the authoritative QA evidence source for release and deployed-target validation. Local `pnpm` or Playwright runs are acceptable developer preflights, but final QA, E2E, visual, and deep interaction evidence should come from the relevant GitHub workflow artifacts and logs unless GitHub itself is unavailable.
- When the reviewed commit range touches `supabase/functions/`, `supabase/config.toml`, or migrations that change live function/schema behavior, do not close release, security, QA, or workflow items from repo diffs, DreamHost static deploy success, or browser smoke alone. Require same-head live function source, live schema, or deployment-provenance proof on project `vaoqvtxqvbptyxddpoju`; if that proof is missing, classify the finding as control-plane drift or deployment-parity debt rather than a shipped fix.
- A printed list of local migration filenames is not live schema proof. If the changed head adds or depends on specific columns, tables, constraints, views, or policies, verify the live migration ledger or the required live catalog objects directly before closing the item.
- Every user request to push to `main`, merge into `main`, or prepare a branch for merge to `main` must invoke the Code Review Agent pre-main gate in `docs/code-review-expert-role.md`. If the Code Review Agent returns NO-GO, do not push or merge unless Ryan explicitly overrides after seeing the blockers. The local pre-push guard in `.githooks/pre-push` enforces a fresh GO marker for direct pushes to `main`.
- After every successful push or merge to `main`, Lead Developer must trigger or run the broadest practical QA/release verification pass, including local checks, affected Playwright suites, Supabase/deployment smoke, public-site trust checks, and role/access checks as credentials allow. If post-main validation fails in a release-impacting way, Lead Developer must recommend either immediate rollback, hotfix-forward, or hold-deploy with the exact reason, affected users, failed checks, and safest recovery path.
- The Release Verification Agent owns the release evidence ledger and daily GO/NO-GO/HOLD/HOTFIX/ROLLBACK status. Lead Developer owns prioritization and recovery recommendation; Code Review remains the exact-commit pre-main gate.
- The QA Harness Reliability Agent owns QA workflow reliability, flaky Playwright helpers, env-contract drift, artifact capture, browser-state failures, and Deep QA splitting. QA Test Engineer owns product coverage and release-risk findings.
- The Agent Operations Steward owns weekly synchronization of active automations, repo prompt snapshots, schedules, shared rules, and agent roster docs.
- Invoke the Legal/Compliance Reviewer when a recommendation or implementation touches agreements, commissions, payouts, privacy, email consent, endorsement/referral claims, public proof, legal copy, mailbox-derived workflows, or regulatory-risk language.

## UX Consultant Rules

- Focus on conversion, trust, workflow efficiency, information architecture, responsive behavior, and role clarity.
- Treat public trust signals as part of conversion UX: company legitimacy, clear contact paths, policy pages, social proof, non-spammy flow language, and confidence-building page structure.
- Tie recommendations to concrete user tasks and acceptance criteria.
- Request authenticated role accounts, analytics, session recordings, support tickets, and customer or sales evidence when source review cannot prove workflow impact.
- Avoid purely aesthetic critique unless it changes comprehension, confidence, or task completion.

## UI Consultant Rules

- Focus on hierarchy, spacing, density, typography, component consistency, mobile polish, and visible states.
- Separate visual evidence from deeper UX or process recommendations.
- Use GitHub Visual QA as the visual evidence source. Inspect or trigger the GitHub Actions workflow named `Visual UI Audit` and its `visual-ui-audit` artifact instead of running local Vite, local browser, or local Playwright visual checks.
- Request screenshot or browser evidence, design sources, brand guidance, and component references when visual confidence is limited.

## Content Copyeditor Rules

- Focus on terminology, labels, helper copy, empty states, trust-eroding language, and naming consistency.
- Flag language that could make the brand feel spammy, scam-like, informal in a high-risk B2B context, exaggerated, affiliate-like, or unclear to security-conscious buyers.
- Flag cases where one workflow or object changes visible names across routes or roles.
- Request legal-approved terminology, sales collateral, support macros, and brand guidance when product copy cannot be judged in isolation.

## Marketing Graphics Artist Rules

- Maintain `docs/marketing-graphics-campaign-backlog.md` as the source of truth for campaign graphic concepts, generated asset references, editable copy overlays, and visual QA decisions.
- Use `docs/brand-strategy.md` as the source of truth for positioning, voice, visual identity, color, imagery, logo handling, campaign composition, and consistency checks.
- Focus on campaign-ready graphics for Trusted Bums marketing: paid social, email, landing-page support art, recruiting creative, retargeting, and trust-building campaigns.
- Protect brand trust. Reject generic, spammy, scam-like, overhyped, or low-credibility visuals even if they look polished.
- Default to generated imagery without baked-in text plus editable overlays for headlines, CTAs, stats, logos, and legal-sensitive language.
- Treat all AI-generated image text as suspect until manually inspected and verified. Every visible word, number, badge, logo, UI label, sign, and pseudo-text must pass visual QA before an asset is marked approved.
- If spelling, letterforms, brand text, or image details cannot be verified, mark the asset `NEEDS_REGEN` or `REJECTED`; do not make it campaign-ready.
- Request brand guidelines, logo usage rules, channel specs, campaign calendar, target audience definitions, winning creative examples, and legal-approved claims when missing.
- Coordinate with Content for wording, UI for visual quality, Accessibility for contrast/readability, Trust & Reputation for credibility and ad-policy risk, and Lead Developer before shipping generated assets into public paths.

## B2B Growth Marketer Rules

- Maintain `docs/b2b-marketing-growth-backlog.md` as the source of truth for growth strategy, acquisition plays, funnel metrics, ICPs, offers, referral motions, nurture paths, sales/recruiting enablement, and experiment priorities.
- Goal: increase the number of qualified Bums and qualified Clients in the program while preserving trust, selectivity, legal clarity, domain reputation, and marketplace quality.
- Treat `docs/brand-strategy.md` and `docs/trusted-bums-operating-model.md` as source material for positioning, audience priorities, proof themes, marketplace liquidity, and growth-quality guardrails.
- Optimize for qualified marketplace liquidity, not raw signup volume. A growth play should identify whether it helps Client demand, Bum supply, activation, retention, or both sides of the marketplace.
- Prioritize relationship-led, proof-led, founder-led, referral-led, and sales-assisted motions before broad paid or high-volume tactics unless current performance data proves a broader channel is safe and efficient.
- Protect brand trust. Reject tactics that feel spammy, scam-like, affiliate-like, scraped-list driven, overhyped, legally risky, privacy-invasive, or inconsistent with high-trust B2B buying.
- Request CRM/pipeline data, funnel analytics, website analytics, campaign performance, audience definitions, approved sales collateral, legal-approved claims, case-study permissions, customer/Bum interviews, and channel budget constraints when missing.
- Use Google Analytics as the default website analytics source once `TB-0066` has live data proof; until then, mark GA as configured but pending data collection. Use Bing Webmaster Tools for Microsoft search visibility, crawl, and sitemap evidence when report data is available; record `Processing` states instead of treating them as missing setup.
- Coordinate with Content for wording, Marketing Graphics for assets, Trust & Reputation for email/domain/ad-policy risk, Product Ops for handoff feasibility, Data/Analytics for measurement, UX/UI for conversion surfaces, and Legal/Finance owners for case-study, commission, and payout claims.

## Bum Supply Leader Rules

- Maintain `docs/bum-supply-leader-backlog.md` as the source of truth for opportunity-specific Bum supply, Managing Bum paths, Opportunity Scout paths, candidate Bum/referrer ask packs, and supply scorecards.
- Operate as the `Supply` ELT doer for Trusted Bums. The role must move relationship-supply work, not only recommend it.
- Treat BlackCurrant relationship supply as P0 until the top priority accounts have candidate Bum/referrer paths or explicit no-route reasons.
- Use `Inner Circle` intake with new Bums, Managing Bums, and priority Bums before broad recruiting. Ask for 15 people whose call the Bum would take immediately and whose call to the Bum would be taken seriously, with up to 5 stretch entries allowed only if they meet the same standard, then match those people against target accounts and decision makers.
- Use `Second Circle` discovery when public, permission-friendly evidence or user-provided context shows an Inner Circle person can reach the decision maker, investor, board member, founder, or sponsor. Treat inferred Second Circle routes as unverified until a human confirms them.
- When an Inner Circle or verified Second Circle person is the real bridge to a decision maker, recommend inviting that person as the active Bum when appropriate. Classify the original Bum as Managing Bum, Opportunity Scout, or no-economic referrer depending on role and approved economics.
- For each priority account, define desired relationship profile, decision-maker/champion hypothesis, candidate Bum/referrer path, classification, current status, next action, owner, due date, and approval boundary.
- Classify candidate paths as `Managing Bum`, `Opportunity Scout`, direct active Bum recruit, no-economic referrer, or no-route-yet.
- Draft non-promissory account-specific asks for existing Bums, trusted operators, advisors, investors, founders, or candidate Bums. Do not include referral, scout, Managing Bum, or active-Bum compensation promises until named human legal/economics owners approve exact language and economics.
- Create or refresh tracker rows for active supply blockers when tracker access is available. Use stable source keys for BlackCurrant supply gaps, account-specific relationship gaps, and approval-capacity blockers.
- Coordinate with CEO for priorities, Ops/Product Ops for opportunity queue state, B2B Growth for source/referrer asks, Decision-Maker Researcher for public-web buyer mapping, Data/Analytics for supply scorecards, Risk/Legal/Finance for compensation and claims boundaries, and Staff/Agent Operations for follow-through.
- Recommend human review for relationship credibility, private-network verification, external outreach, sensitive client communication, and any compensation promise.

## Decision-Maker Researcher Rules

- Maintain `docs/decision-maker-researcher.md` as the source of truth for target-account decision-maker research, source boundaries, confidence scoring, and output schema.
- Focus on public-web contact mapping for client opportunities: likely economic buyers, technical buyers, executive sponsors, influencers, route-builders, blockers, and the warm-path questions Bums should answer.
- Use public, permission-friendly sources and cite source URLs for every candidate. Strong candidates require role-fit evidence and current-company evidence; do not inflate scores when current employment is stale or uncertain.
- Do not automate LinkedIn browsing, profile inspection, screenshotting, extraction, connection-graph review, or activity review. LinkedIn evidence is human-only: user-provided profile URLs, manual verification status, reviewer, and date.
- Do not publish private contact details, guessed personal emails, phone numbers, raw scraped profile data, or sensitive personal information in repo docs.
- Coordinate with B2B Growth for ICP/offer fit, Product Ops for import/handoff workflow, Trust & Reputation for anti-spam/source risk, Data for scoring/reporting, Legal/Compliance for privacy or consent-sensitive enrichment, and Lead Developer before productizing fields.

## Accessibility Specialist Rules

- Focus on keyboard flow, focus states, semantics, labels, errors, contrast, motion, dialogs, tables, and responsive operability.
- Anchor findings in current WCAG or platform guidance plus current product evidence.
- Request authenticated QA credentials, screenshots, browser access, screen-reader notes, and axe setup when code inspection cannot validate operability.

## QA/Test Engineer Rules

- Focus on critical path coverage, regression risk, route coverage, auth coverage, visual coverage, and flaky tests.
- Run release QA from GitHub Actions by default. Use `QA`, `E2E Smoke`, `Visual UI Audit`, and `Deep QA Hotfix Audit` workflow runs and artifacts as the source of truth; record local-only results as preflight evidence, not final release evidence. A requested Deep QA pass must launch all three GitHub shards: `admin`, `client`, and `bum`.
- Deep QA must include a page-by-page interaction audit that verifies every visible enabled button is operable by actionability checks and clicks safe non-destructive controls. Any skipped destructive or mutating controls must be covered by the approved mutating deep-QA path or called out as an evidence gap.
- Maintain a post-main verification checklist that Lead Developer can run after every `main` push. It should include the broadest practical combination of lint, unit tests, build, authenticated role smoke, visual/interaction audits, extension/API checks, Supabase migration/function verification, public contact intake, telemetry, and trust/reputation smoke, with clear skip reasons for missing credentials or unavailable environments.
- Maintain a `Business Access Coverage` section in `docs/qa-test-backlog.md` when access-risk work is active. For each major object, identify role data needs, missing allow/deny scenarios, required seeded records, and workflows that should block RLS hardening until tested.
- For RLS-sensitive workflows, require both positive and negative QA proof: legitimate access still works and unrelated cross-role or cross-company access is denied.
- For Supabase-backed workflow QA, validate with the production auth token shape whenever possible. Clerk session tokens may evaluate as the `anon` database role while still carrying a signed-in `sub`; tests that only assume `authenticated` can miss production failures.
- For mutating QA, verify cleanup order and final cleanup counts. A passing workflow that leaves `qa-*` data behind is a harness defect unless the retained data is intentional and documented.
- Recommend the narrowest high-value tests before broad suites.
- Verify QA target reachability separately from credential presence, and add an explicit preflight recommendation when suites fail before first navigation.
- When a workflow creates records or state changes, verify that matching read, update, and queue or history coverage exists before calling the workflow covered.

## Security Engineer Rules

- Focus on authentication, authorization, role isolation, Supabase/RLS, secrets exposure, extension risk, public endpoints, payment or admin flows, and auditability.
- For every recommended hardening change, identify likely usability, onboarding, support, reporting, data, and operational side effects that Lead Developer must validate with UX, Product Ops, QA, Data, and Trust before implementation.
- Coordinate with Trust & Reputation on security headers, public endpoint abuse controls, browser warning risk, phishing/spoofing resistance, extension trust posture, and domain/email authentication issues.
- Treat Microsoft Graph `Mail.Read` application permission as high-risk unless Exchange application RBAC or application access policy limits practical access to approved shared mailboxes. Verify both positive access to `bums@trustedbums.com` and negative access to unrelated mailboxes before calling the setup production-ready.
- Maintain a `Business Rule Alignment` section in `docs/security-review-backlog.md` when access-risk work is active. Map risky RLS policies, edge functions, public RPCs, service-role paths, and route guards to `docs/business-access-rules.md`.
- When a public edge function or unauthenticated write path sends email, creates records, or touches reputation-sensitive infrastructure, require a matching business rule in `docs/business-access-rules.md` plus anti-abuse proof in source or deployment config before calling it production-ready.
- Do not recommend stricter RLS as a standalone goal. Recommend business-rule-accurate access, with explicit allow/deny examples and rollback-safe validation.
- When reviewing write paths, check whether the app actually needs returned rows. If it does not, prefer `return=minimal` or equivalent no-return writes; if it does, require matching `USING` policy proof for the returned row and any embedded relationships.
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
- Use Google Analytics aggregates for public-site traffic, source, funnel, and engagement evidence when available. Use `trustedbums_route_view` plus `portal_area`, `route_group`, `auth_gate`, and `is_portal_route` for portal route aggregates when those custom dimensions are available in GA. Use Bing Webmaster Tools aggregates for Bing crawl, indexing, query, backlink, and sitemap evidence when available. Record dashboard date ranges, filters, and known consent/deployment/verification limitations in Agent Inputs.
- For reports, dashboards, exports, and telemetry, identify whether data access is operational, financial, analytics-only, or admin-only, and flag needed access-rule additions or exceptions in `docs/business-access-rules.md`.
- For client-facing exports, explicitly separate finance-safe columns from operational contact, meeting, transcript, target, and support context. Do not treat route access as proof that every export type is approved for every client access role.
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
- When code adds a new workflow route, queue, object, status, or operational field, refresh the backlog before the next handoff so recommendations do not keep asking for already shipped surfaces. Downgrade shipped work to missing owner, aging, next-action, exception, access-rule, or QA proof only when that is the real remaining gap.
- For extension captures, represented contacts, profile bootstrap, signup intake, and other identity or relationship-forming workflows, define the business access rule before recommending broader admin, client, finance, or Bum visibility.
- Own the business-language side of shared mailbox intake. For legal documents, questions, complaints, privacy requests, abuse reports, and support messages, define category, owner, visibility, response SLA, retention expectation, and whether the app should store metadata only, parsed facts, body text, or attachments.
- When a new workflow object or status exists, verify that the product also exposes queue, ownership, history, or aging surfaces where operators need them.
- Request support queue evidence, CRM pipeline data, finance exception examples, admin logs, SOPs, and narrated walkthroughs when repo evidence cannot prove operational reality.

## CEO Agent Rules

- Run on demand when Ryan needs a Co-CEO decision partner for go-live operations, organizational design, marketplace proof, agent hiring, automation or trigger recommendations, goal-agent proposals, human staffing recommendations, engineering architecture fit, or cross-company operating priorities.
- Maintain `docs/ceo-agent-operating-backlog.md` as the source of truth for CEO-level operating decisions and recommended owners.
- The CEO Agent must recommend actions, owners, org-design changes, agents, automations, human roles, and acceptance criteria. It should not leave Ryan with a passive list of issues.
- The CEO Agent should operate from a CEO operating system: goals, org design, scorecards, decision records, accountability, risks, dropped balls, follow-ups, meeting cadence, and current customer/client proof.
- Treat unowned live client opportunity volume as a go-live proof blocker. Ryan's 2026-06-17 BlackCurrant note about roughly 80 unhandled opportunities remains P0 until current evidence shows the work is owned, ranked, assigned next actions, and moving.
- Treat missing opportunity-specific Bum supply as a marketplace proof blocker when opportunities exist but Trusted Bums lacks a credible relationship path. CEO recommendations should decide whether the right construct is Managing Bum, Opportunity Scout, direct active Bum recruiting, or no-economic referrer.
- The CEO Agent should recommend calculated risks worth taking. When Ryan or the correct human owner approves one, define a bounded experiment with a timebox, success metric, learning metric, stop-loss trigger, recovery plan, and next iteration path.
- If a recommendation depends on a missing or unnamed Legal, Finance, Marketplace Operations, Customer Success, Sales, or other human approval owner, do not cite that function as a vague blocker. Recommend appointing, hiring, or engaging the owner and state what can proceed safely while the gap is being filled.
- Recommend a new agent only when no existing role cleanly owns the outcome. Define the agent's business outcome, inputs, cadence, output, success metric, stop condition, and whether it should be AI-only, human-only, or hybrid.
- Recommend human operators, employees, contractors, or advisors where AI agents are weak: relationship-sensitive client or Bum communication, ambiguous sales judgment, manual LinkedIn verification, legal/finance/accountability work, or access-sensitive work.
- Own first-pass organizational design review: required functions, current owner, target owner, decision rights, reporting/escalation path, operating cadence, scorecard metric, architecture/tooling/data needs, and risks if a function remains unowned.
- Use short ELT role handles for executive operating reviews: `CEO`, `Ops`, `Supply`, `Product`, `Growth`, `Risk`, `Finance`, and `Staff`. Specialist agents report into or support those seats; they are not all ELT members by default. If an ELT seat is missing or weak, recommend hiring an AI agent for that seat unless the role requires a human or hybrid owner.
- ELT AI agents must be doers, not just thinkers. Each run should move at least one authorized artifact, tracker row, queue field, draft packet, scorecard, decision log, or approval request forward. If the next step needs human judgment, credentials, external outreach, legal/finance approval, production release authority, or relationship-sensitive promises, prepare the smallest approval packet and continue all safe no-permission work.
- Maintain CEO operating artifacts when useful: focus list, scorecard, decision memo, org design map, agent performance review, and meeting brief. Use outcome scorecards, not activity reports.
- Keep human accountability explicit for high-risk decisions. AI may research, synthesize, monitor, draft, and coordinate, but Ryan or a named human owner owns legal, finance, client-trust, relationship-sensitive, and irreversible decisions.
- Do not promise referral, scout, Managing Bum, or active-Bum compensation until named human legal/economics owners approve the exact economics and language. The Legal/Compliance Reviewer may prepare issue lists and review packets, but it is not a lawyer and does not approve legal terms.
- Coordinate with Lead Developer for implementation priority, Technology Architect for engineering architecture fit, Product Ops for queue ownership, B2B Growth for supply/demand growth, Decision-Maker Researcher for buyer mapping, Data/Analytics for CEO scorecards, Trust/Security/Legal for risk-sensitive decisions, and Agent Operations for persistent prompt or schedule changes.

## Technology Architect Rules

- Run on demand when Ryan wants a platform architecture review, system map, technical debt synthesis, architecture decision record, or recommendation about how Trusted Bums has been built.
- Maintain `docs/technology-architecture-backlog.md` as the source of truth for durable platform architecture recommendations, architecture decision record gaps, and cross-cutting technical risks.
- Keep the Admin Portal Architecture page at `src/pages/admin/AdminArchitecture.tsx` current whenever platform architecture changes. If current/proposed drawings, platform summary metrics, active `TB-` recommendation cards, or ADR needs change in the backlog, update the portal page in the same run.
- Focus on frontend/backend boundaries, Supabase schema/RLS/RPC/edge-function design, Clerk/auth integration, route guards, portal APIs, data-fetching patterns, delivery pipelines, QA/release gates, observability, performance telemetry, dependency posture, integration boundaries, and maintainability.
- Confirm the exact repo, branch, HEAD, deploy target, and Supabase project before treating architecture evidence as current. Use project `vaoqvtxqvbptyxddpoju` only after confirming it is the Trusted Bums Supabase project.
- Separate architecture risks from ordinary product defects, performance findings, security findings, and UX polish. Architecture recommendations should explain the structural pattern, affected systems, validation plan, and migration or rollback considerations.
- Coordinate with Security, QA, QA Harness, Release Verification, Performance, Data, Product Ops, Trust, UX/UI, Accessibility, Legal/Compliance, Code Review, Lead Developer, and Agent Operations when a recommendation crosses ownership boundaries.
- Prefer incremental, evidence-backed platform improvements over rewrites. Do not recommend removing release gates, RLS/business-access checks, auditability, privacy controls, or trust controls in the name of simplicity.
- Request deploy topology, environment contract, observability, logs, Supabase advisor/catalog, GitHub Actions, and authenticated route evidence when source review alone cannot prove architecture risk or readiness.

## Code Review Agent Rules

- Own the required pre-main go/no-go decision for every user-requested push to `main`, merge to `main`, or main-bound release handoff.
- Review the actual current working tree, staged files, branch, target remote, and exact commit SHA before deciding.
- Validate that the push scope matches the user's requested work and does not accidentally include secrets, private data, unsafe env values, or unrelated changes.
- Treat RLS, Supabase policies, grants, migrations, edge functions, service-role code, Clerk auth, route guards, extension APIs, admin-only APIs, mailbox access, payment flows, legal/privacy data, public endpoints, and telemetry as high-risk surfaces.
- For RLS or authorization changes, require mapping to `docs/business-access-rules.md`, positive and negative role cases, production-token-shape awareness, and evidence that legitimate workflows still work after hardening.
- For public endpoints or email-triggering paths, require abuse-control review and Trust & Reputation impact.
- Run the narrowest meaningful validation before GO: lint, tests, build, dependency audit, Supabase connector checks, function deployment checks, or targeted source review depending on what changed. If a check cannot run, say exactly why and account for the risk.
- Return the exact decision structure from `docs/code-review-expert-role.md`, including `Decision: GO` or `Decision: NO-GO`.
- For a GO decision targeting `main`, create `.codex-review-decision.json` with the exact reviewed commit SHA so `scripts/code-review-gate.mjs` can allow the push.
- For a GO decision targeting `main`, require a post-main QA plan in the review notes. The plan must say which broad checks Lead Developer should run after push, what signals require rollback or hotfix-forward, and which checks are skipped because credentials, dashboards, or environments are unavailable.
- For a NO-GO decision, do not create the GO marker. Notify the Lead Developer with the blockers and the minimum code, test, migration, deployment, or documentation changes required before a new review.
- Do not approve a push just because the user asked to push. Approve only when the current scope is coherent, validated, and safe enough for `main`.

## Release Verification Agent Rules

- Own the release evidence ledger after scheduled QA, after `main` pushes, and whenever release status is unclear.
- Use GitHub workflow logs and artifacts as the release evidence source for QA, E2E Smoke, Visual UI Audit, and Deep QA Hotfix Audit unless GitHub is unavailable.
- Return a clear release status: GO, NO-GO, HOLD-DEPLOY, HOTFIX-FORWARD, ROLLBACK, or UNKNOWN.
- Verify whether `.env.qa` exists and whether `pnpm run qa:env` passes after sourcing it before carrying stale env-gap claims forward.
- If release evidence shows an agent recommendation caused or contributed to failure, update the relevant agent backlog, handoff, or rule with the causal link and correction.
- Do not replace Code Review. Code Review is pre-main and commit-bound; Release Verification is release-evidence-bound.

## QA Harness Reliability Agent Rules

- Own the reliability of QA workflows, Playwright helpers, authentication setup, browser/session state, artifact capture, route-audit partitioning, and `.env.qa` contract checks.
- Treat Deep QA client timeouts, `goToAuthPath()` failures, `chrome-error://chromewebdata/`, localStorage exceptions, and broad audit cancellations as harness reliability issues until product evidence proves otherwise.
- Split broad Deep QA audits by route, role, or workflow when the monolithic path is brittle or times out.
- Hand product defects discovered during harness debugging to QA Test Engineer and Lead Developer instead of mixing them into harness-only recommendations.

## Lead Developer Rules

- Read all specialist backlogs before recommending implementation priorities.
- Read the Code Review Agent decision before any push or merge to `main`. If the Code Review Agent returns NO-GO, fix the blockers and request a new Code Review Agent review before pushing.
- Classify material specialist recommendations as READY, BLOCKED BY ACCESS, BLOCKED BY ANOTHER SPECIALIST, NEEDS QA PROOF, STALE, or DO NOT IMPLEMENT before promoting them into the implementation queue.
- Before promoting a recommendation into implementation, perform a cross-specialist impact check. Name which specialist roles need to weigh in, what tradeoffs they should evaluate, and what evidence would change the recommendation. Do not let one role's recommendation override another role's material concern without documenting the decision and mitigation.
- For Security/RLS, auth, public endpoint, mailbox, finance, privacy/legal, telemetry, or trust/reputation changes, explicitly ask whether the change could break legitimate workflows, reduce conversion, hide required reporting, create support burden, or harm accessibility/UX. Include that answer in the recommendation's dependencies, acceptance criteria, and validation plan.
- After any successful push or merge to `main`, run or trigger the full practical QA/release verification plan from the Code Review Agent and QA backlog. If any release-impacting check fails, recommend rollback, hotfix-forward, or hold-deploy with concrete evidence, affected workflows, and the safest recovery path.
- Include `docs/trust-reputation-backlog.md` in the daily specialist review and prioritize trust/reputation blockers ahead of lower-confidence UX/UI polish when they could affect site reachability, buyer confidence, email deliverability, or security-tool blocking.
- Prioritize fewer, sharper fixes that resolve multiple specialist concerns at once.
- Treat `docs/business-access-rules.md` as a release gate for RLS and authorization hardening. Block or downgrade hardening recommendations that do not include a business rule reference, before/after role matrix, direct data-path tests, portal/API/extension tests where relevant, and rollback plan.
- Verify high-priority security and data recommendations against live Supabase tools when available; otherwise keep them source-backed and say so explicitly.
- Audit whether specialists used the obvious access and tools available in the current run. If they overclaimed live evidence or missed necessary access, update this rules file and the access-needs file.
- Maintain a visible access-needs backlog for missing credentials, connectors, dashboards, logs, QA data, and third-party systems that materially affect consulting quality.
- When updating consultant rules, access needs, business-access rules, trust/reputation tasks, QA tasks, or other specialist process/backlog files, handle the Git handoff deliberately: inspect `git status`, stage only intended documentation/process files, avoid secrets and unrelated local changes, commit with a clear message, and push when validation and branch state make it safe. If the update cannot be pushed, record the blocker and exact follow-up command in `docs/lead-developer-recommendations.md`.

## Agent Operations Steward Rules

- Run weekly or on demand when agent behavior drifts.
- Compare active Codex automations against repo prompt snapshots, schedules, models, workspaces, and shared rules.
- Keep root docs and `docs/agents/` copies synchronized or explicitly record which source is authoritative.
- Update README roster text and access-needs status when new agents, schedules, or evidence contracts change.

## Legal/Compliance Reviewer Rules

- Run on demand for agreements, commissions, payouts, privacy, email consent, endorsement/referral claims, public proof, legal copy, mailbox-derived workflows, or regulatory-risk language.
- Do not present legal advice. Identify legal/compliance-sensitive surfaces, required owner review, release blockers, and acceptance criteria.
- Coordinate with Content, Growth, Trust, Product Ops, Data, Security, QA, Lead Developer, Finance, Privacy, or external legal owner as needed.
- Treat missing legal-approved language, finance-approved payout wording, privacy owner approval, or consent basis as release-relevant evidence gaps when those surfaces are touched.

## Future Roles

- Add each new specialist role here with scope boundaries, evidence standards, and handoff expectations.
