# Trusted Bums Consultant Access Needs

_Last updated: 2026-06-04 by Codex daily product ops workflow analyst automation._

## Executive Read

This file tracks access, credentials, dashboards, logs, fixtures, and third-party systems that would materially improve consultant output. Missing access belongs here, not buried inside product recommendations.

## Active Access Requests

### P0 - Provide CRM, analytics, and approved GTM evidence for B2B growth
- Why it matters: B2B Growth Marketer, Content, Marketing Graphics, Trust & Reputation, Product Ops, Data/Analytics, and Lead Developer need real funnel evidence before scaling acquisition. Without it, growth recommendations stay source-backed and low-risk by necessity, which is appropriate but slower.
- Needed access: CRM or pipeline views for Client Prospects and Bum Prospects including source, owner, stage, qualification status, disqualification reason, and conversion timestamps; website analytics and source tracking; LinkedIn organic analytics; LinkedIn paid account access or exports; email/campaign performance; referral-source tracking; approved sales collateral; founder scripts; outreach examples; objection notes; approved case-study permissions; legal-approved claims boundaries for logos, outcomes, commissions, and payouts; customer/Bum interview notes; and budget constraints by channel.
- Current status: Added by B2B Growth Marketer on 2026-06-04. The repo now has a stronger growth strategy backlog, but the run still had no CRM, analytics, ad-account, email-platform, interview, approved-collateral, or claims-approval source. Current public acquisition evidence is limited to source inspection: one homepage with broad Client and Bum CTAs, one shared contact form, one signup-intent modal, Bum-side activation workflows, and proof-safe marketing graphics concepts. Until GTM evidence is available, the backlog should prioritize founder-led, referral-led, proof-led, and sales-assisted motions over scaled paid or lifecycle automation.

### P0 - Provide domain reputation, DNS, and webmaster access
- Why it matters: Trust & Reputation, Security, Content, UX, and Lead Developer need to know whether `trustedbums.com` is blocked, distrusted, misconfigured, spoofable, poorly indexed, or weakly credible to web-security systems and buyers.
- Needed access: DreamHost hosting or DNS dashboard (or whichever provider is authoritative now), registrar/DNS records, Google Search Console security/manual-action reports, Bing Webmaster Tools, Google Safe Browsing status where available, Microsoft Defender/SmartScreen reputation feedback, DMARC aggregate reports, postmaster tools, Microsoft 365 or other email-provider domain-authentication dashboards, and any security/reputation scanner dashboards already in use.
- Current status: This remains a runner-visible release verification blocker on 2026-06-03. After sourcing `.env.qa`, `curl -I -L --max-time 20 "$QA_BASE_URL"` again timed out during DNS resolution for `https://trustedbums.com`; `dig trustedbums.com A` and `AAAA` timed out with no reachable DNS server; public staging smoke failed at first navigation; and authenticated role smoke again failed all five roles at the first `page.goto("/")` before Clerk sign-in. This is still not a confirmed public outage because the session lacks independent hosting, DNS, CDN, registrar, uptime-monitor, Google Search Console, Safe Browsing, SmartScreen, postmaster, and email-auth dashboard evidence.

### P0 - Stabilize Supabase consultant tooling for project `vaoqvtxqvbptyxddpoju`
- Why it matters: Security, Data/Analytics, Performance, Product Ops, and Lead Developer need consistent live validation for RLS, policies, grants, views, functions, advisors, and safe aggregates.
- Needed access: Supabase MCP or connector capability for read-only SQL, catalog inspection, security advisors, performance advisors, storage inspection, and safe aggregate queries in the actual consultant session.
- Current status: This is partially available but still not stable enough for full trust-boundary review. On 2026-06-04, Security successfully used live Supabase security advisors, edge-function inventory, edge-function source retrieval, and publishable-key metadata for `vaoqvtxqvbptyxddpoju`; advisors confirmed executable `SECURITY DEFINER` functions and mutable function `search_path`. The available connector did not expose arbitrary read-only SQL/catalog queries, storage-policy inspection, edge-function logs, deployment history, or secrets inventory by variable name, so live grants, policies, storage buckets, views, and deployed runtime errors could not be fully revalidated today.

### P0 - Define authoritative profile bootstrap and self-editable identity fields
- Why it matters: Security, Product Ops, QA/Test, and Lead Developer need an explicit business rule for who may assign portal role, client company, client access role, and Bum identity before RLS and auth bootstrap can be safely tightened.
- Needed access: Product/security decision or documented business rule covering sign-up intent, company matching, admin-approved role assignment, client workspace creation, and which `profiles` fields are user-editable versus admin-controlled.
- Current status: This gap narrowed on 2026-05-31 because `docs/business-access-rules.md` now includes a release-gate rule for profile bootstrap and self-editable identity fields. Product/security still need to confirm the exact self-editable field list and whether first-time client signup may create a workspace automatically or must wait for Admin approval before implementation hardening proceeds.

### P1 - Provide accessibility validation evidence for authenticated and public routes
- Why it matters: Accessibility review can confirm label wiring and some semantics from source, but it still cannot validate keyboard order, focus visibility, disclosure behavior, table announcements, dialog trapping, or screen-reader output on real portal pages without live evidence.
- Needed access: Authenticated browser-routable QA sessions for admin, client admin, client finance, client member, and Bum roles; fresh desktop and mobile screenshots for key routes; `@axe-core/playwright` or equivalent automated scan wiring; lightweight screen-reader or keyboard walkthrough notes for high-traffic routes; and a scripted QA env bootstrap that exports `.env.qa` reliably for consultant shells.
- Current status: This gap remains open on 2026-06-03. Sourcing `.env.qa` restored the expected QA env contract, and a sourced local `vite` server plus manual Playwright review with `waitUntil: "domcontentloaded"` did produce fresh public-page screenshots, so the accessibility session is no longer blocked from all browser evidence. The remaining blockers are still material: deployed Playwright navigation to `https://trustedbums.com/` aborted before first render, the existing public smoke spec also timed out on the local page `load` event, the repo still has no `@axe-core/playwright` or `axe-core`, and there are still no narrated keyboard, screen-reader, or authenticated mobile route captures from this run.

### P0 - Provide deterministic Clerk QA auth support plus failure logs
- Why it matters: QA/Test, Accessibility, Security, and Lead Developer currently depend on deployed authenticated browser coverage, but the 2026-05-31 run showed that role smoke no longer provides stable evidence because Clerk-backed sign-in itself is timing out or closing before route assertions can settle.
- Needed access: Confirmed-good QA accounts for Admin, Client Admin, Client Finance, Client Member, and Bum; the approved sign-in method for automation; Clerk dashboard or request-log visibility for failed QA sign-ins; and any relevant edge-function or auth-proxy logs tied to `clerk.trustedbums.com` requests.
- Current status: This remains open and is still masked by target reachability. On 2026-06-03, `pnpm exec playwright test tests/e2e/authenticated-role-smoke.spec.ts --project=chromium --reporter=line` again failed 5 of 5 checks before sign-in because the first `page.goto("/")` to `https://trustedbums.com/` aborted with `net::ERR_ABORTED`. The 2026-05-31 Clerk evidence therefore remains unresolved: until target preflight is healthy and Clerk logs are available, the session still cannot distinguish account issues, upstream auth instability, or test-helper defects.

### P0 - Provide extension API QA token plus explicit QA env contract coverage
- Why it matters: QA/Test and Security need to run authenticated extension API smoke and authorization-boundary checks instead of relying on source-only review, and QA preflight should fail fast when extension-smoke inputs are missing.
- Needed access: `QA_EXTENSION_API_BASE_URL`, `QA_EXTENSION_API_TOKEN` or an equivalent deterministic auth mechanism, plus seeded data for one allowed and one denied authorization case. Also needed: document these variables in `.env.qa.example` and make `scripts/verify-qa-env.mjs` check them when extension smoke is part of the run.
- Current status: `.env.qa` still contains `QA_EXTENSION_API_BASE_URL`, but 2026-06-03 verification showed `QA_EXTENSION_API_TOKEN` was still missing after sourcing `.env.qa`. `.env.qa.example` and `scripts/verify-qa-env.mjs` still omit the extension variables entirely, so authenticated extension smoke cannot be preflighted from the documented contract. The latest extension smoke on 2026-06-03 no longer proved anonymous rejection: `GET https://vaoqvtxqvbptyxddpoju.supabase.co/functions/v1/extension-api-v1/context` timed out after 30s, and authenticated coverage still skipped because `QA_EXTENSION_API_TOKEN` was unavailable. Provide Supabase function logs or an independent external check before classifying this as a live function outage.

### P0 - Provide seeded multi-company authorization fixtures for QA and RLS validation
- Why it matters: QA/Test, Security, Product Ops, and Lead Developer need deterministic allow/deny proof for customer targets, accepted opportunities, extension destinations, Bum represented contacts, and other company-scoped workflows.
- Needed access: Seeded records and credentials spanning at least two client companies, one admin, one client admin, one client finance, one client member, two Bums, one allowed accepted opportunity, one denied accepted opportunity, one own-company customer target, one foreign-company customer target, represented contacts from each source type, profile-bootstrap/self-edit denial fixtures, seeded telemetry rows, same-domain and cross-company client-team approval fixtures, related-domain pending/approval fixtures, public-email manual-review fixtures, disabled-user fixtures, audit-event expectations, and replay-safe extension capture inputs.
- Current status: The repo documents role account types and source-backed business rules, but the consultant session still lacks deterministic seeded data to prove cross-company denial and legitimate access for the highest-risk authorization paths. The 2026-06-02 QA review added client-team/domain-approval fixture needs because `/client/team` and the `client-team` function can grant client access roles, but current tests do not prove same-company allow, cross-company deny, public-email manual review, related-domain pending behavior, disabled-user denial, or audit event creation.

### P1 - Provide approved product language and legal terminology sources
- Why it matters: Content, UX, Product Ops, Support, and Legal decisions now depend on distinguishing `customer leads`, `Bum intro requests`, `Bum responses`, role names, and legal workspace language with more confidence than code alone can provide.
- Needed access: Sales collateral, onboarding docs or emails, support macros, legal-approved terminology, brand voice guidance, customer-language research, CRM stage naming, recruiting or partner-acquisition copy for future Bums, and any customer-facing SOPs or training content that define these workflows.
- Current status: This remains open on 2026-06-03 and is still blocking a stronger content review. Current code still conflicts on `Agreements` vs `Partner Terms` vs `Terms & Legal Agreements` vs `Current Partner Terms` vs `acceptance records`, `Requests` vs `Inbound Requests` vs `Customer Leads` vs `Bum Intro Requests`, `Claim` vs `Intro Request`, and recruiting/prospecting language such as `future Bums`, `prospective Bum`, `Prospected clients and contacts`, and `Add prospected client`. The terms-deferral flow still shows `Skip This Login`, which should not be treated as final without legal-approved deferral wording. QA env preflight succeeded after sourcing `.env.qa`, but a fresh deployed Playwright portal audit still failed at first navigation with `net::ERR_NAME_NOT_RESOLVED` for `https://trustedbums.com/`, so today’s content findings remain code-backed rather than business-approved or browser-verified.

### P1 - Provide deployment provenance for Supabase functions and schema changes
- Why it matters: Live Supabase inventory still shows deployment drift risk, which weakens trust-boundary review, release auditability, and incident response.
- Needed access: CI/CD deploy history for Supabase functions and database migrations, release notes or change tickets for live-only functions, Chrome extension release/version provenance where extension auth depends on those deploys, environment or CI secrets inventory by variable name, and confirmation of which branch or environment should match project `vaoqvtxqvbptyxddpoju`.
- Current status: This gap remains material on 2026-06-04. Live inventory includes `submit-contact`, `profile-bootstrap`, `client-team`, `admin-access-requests`, `email-track`, `send-website-email`, `invite-bum`, `portal-contacts`, and multiple other public `verify_jwt = false` functions. Some public platform auth posture is expected because the functions manually verify Clerk JWTs, but current review still lacks CI/CD history, release notes, function logs, Chrome extension release provenance, and secrets inventory by variable name to explain which public functions are intentionally deployed, which are legacy or one-off, and which should be retired.

### P1 - Provide public-form abuse protection and mail-reputation operations access
- Why it matters: Trust & Reputation, Security, QA/Test, and Lead Developer need to verify that public contact/signup flows cannot be used to flood inboxes, damage sender reputation, or trigger browser/security distrust.
- Needed access: Cloudflare Turnstile or equivalent captcha configuration, edge or CDN rate-limit settings, any WAF or bot-management rules protecting public forms, Microsoft 365 or mail-provider sending dashboards for the notification mailbox, and any alerting on contact-form spikes or delivery failures.
- Current status: This gap remains open and expanded on 2026-06-04. Live `submit-contact` source verifies Turnstile, checks origin, rate-limits by recent submissions, and writes `contact_submissions` before notifying operations, but live `send-website-email` is still directly public, uses Microsoft Graph credentials, and lacks equivalent anti-abuse controls. Security also confirmed live `email-track/click` redirects to an arbitrary external URL even with an invalid delivery id. The consultant session still needs Turnstile/dashboard evidence, edge or CDN rate-limit/WAF settings, sender-reputation operations visibility, Microsoft Graph/mail tracking policy, and alerting evidence to prove the public mail path cannot be abused.

### P1 - Provide payment provider and finance exception security evidence
- Why it matters: Security, Data/Analytics, Product Ops, QA/Test, and Lead Developer need to verify payment, invoice, payout, commission, refund, credit, and admin exception boundaries against real provider configuration instead of source-only assumptions.
- Needed access: Payment provider dashboard or configuration export, webhook endpoint inventory, webhook signing-secret variable names, payout and refund role settings, finance reconciliation samples, chargeback/dispute examples, sandbox credentials or seeded payment fixtures, and approved admin exception SOPs for credits, payouts, and commission overrides.
- Current status: Added by Security on 2026-06-04. The repo has payment, payout, commission, and client finance surfaces, but this session had no payment provider configuration, webhook logs, seeded payment fixtures, or finance exception evidence. Security review therefore could not validate whether Client Finance, Client Admin, Bum, and Admin payment boundaries match provider-side reality.

### P1 - Provide production or staging observability and dependency alert context
- Why it matters: Security, Performance, QA/Test, and Lead Developer need CI failures, deploy history, runtime errors, Web Vitals, and security alert visibility to prioritize risk instead of relying only on source review.
- Needed access: CI run history, deployment logs, frontend error monitoring, production or staging Web Vitals, Lighthouse or bundle-analyzer artifacts, flaky-test history, and repository security alert or Dependabot visibility if available.
- Current status: This gap remains open on 2026-06-04. Supabase project metadata, performance advisors, edge-function logs, and Postgres logs were callable; the project is `ACTIVE_HEALTHY`, and recent `performance-beacon` logs show ongoing `202` writes. However, read-only SQL/query-plan tools were not exposed in this performance run, `.env.qa` did not export `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` for a local read-only telemetry aggregate, and `trustedbums.com` still timed out during DNS resolution from the runner. Historical 2026-05-31 SQL showed `2,355` `performance_metric_events` rows across `42` routes, but current route-level RUM, Lighthouse, bundle analyzer, browser waterfalls, authenticated route traces, `pg_stat_statements`, CI/deploy logs, frontend error monitoring, and dependency alert context remain unavailable.

### P1 - Provide seeded telemetry samples and role access proof for admin performance monitoring
- Why it matters: QA/Test, Performance, Security, and Product Ops need to verify the new `/admin/performance` route with realistic data and prove that telemetry remains admin-scoped.
- Needed access: Seeded or production-safe `performance_metric_events` aggregate access covering multiple metrics and routes, one admin account, one non-admin account for deny checks, and a route-level aggregate/query-plan path that does not expose raw private telemetry.
- Current status: The raw telemetry shortage is no longer the main issue. Historical live SQL on 2026-05-31 showed `2,355` `performance_metric_events` rows across `42` routes, and 2026-06-04 edge-function logs still show ongoing `performance-beacon` writes with current execution times. What is still missing is current route-level aggregate access, live admin walkthrough proof for `/admin/performance`, non-admin deny proof, and query-plan evidence for the slow route-backed statements. Today's source review also found `/admin/performance` computes p75 from the latest raw `500` rows in the browser, so Performance needs an admin-safe server aggregate before using that page as the primary prioritization source.

### P2 - Confirm telemetry retention and deployment-provider values
- Why it matters: The app now treats performance telemetry as necessary operational monitoring, stores Web Vitals in Supabase, and gives admins a review tool.
- Needed access: Deployment-provider confirmation for `VITE_PERFORMANCE_BEACON_URL` and `VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN`, plus retention expectations for `performance_metric_events`.
- Current status: Product classification is decided as necessary operational monitoring, consent/legal copy is aligned, repo env templates include the variable names, Cloudflare Web Analytics setup was completed, the Supabase beacon endpoint is deployed, `/admin/performance` provides admin review, and live Supabase data now confirms ongoing stored beacon rows. Still needed: confirm production deployment-provider values, retention period, and the complete set of allowed telemetry origins beyond the single currently observed origin `https://trustedbums.com`.

### P1 - Provide product, design, and operations source-of-truth artifacts
- Why it matters: UX, UI, Content, Product Ops, and Data/Analytics need stronger non-code evidence to validate terminology, queue design, workflow ownership, access handoffs, visual intent, funnel friction, and customer trust objections.
- Needed access: Brand and design sources, approved logo usage rules, campaign visual guidelines, campaign calendar, ad-account/channel priorities, audience definitions by channel, ad-account performance exports, examples of winning creative, legal-approved marketing claims, approved screenshot baselines, funnel or product analytics, session recordings, support tickets or macros, support queue exports with current statuses and SLAs, customer-feedback exports, sales-objection notes, CRM or sales-pipeline exports for reverse-opportunity and target-response follow-through, onboarding materials, finance reconciliation and exception samples, admin audit/log examples, operations SOPs, and narrated role walkthroughs for Admin, Client Admin, Client Finance, Client Member, and Bum accounts.
- Current status: This gap remains open on 2026-06-04. `docs/brand-strategy.md` is now an inferred, repo-backed first brand source of truth based on current public-site copy, assets, typography, colors, and consultant rules. UI evidence also improved because GitHub Visual QA run `26931897223` passed with fresh public, Admin, Client Admin, Client Finance, and Bum screenshots in the `visual-ui-audit` artifact. Those screenshots are implementation evidence, not an approved design baseline. Product Ops still lacks support queue export with SLA buckets, CRM stage history, finance exception samples, admin rescue logs, access-request proof examples, operations SOPs, and narrated role walkthroughs for Admin, Client Admin, Client Finance, Client Member, and Bum roles. Marketing still lacks approved logo usage rules, campaign visual guidelines, campaign calendar, audience definitions, ad-account performance, winning creative examples, and legal-approved claims.

## Role Access Matrix

### UX Consultant
- Core access: Authenticated role accounts, browser screenshots, funnel analytics, session recordings, support or customer feedback.
- If missing: Keep recommendations source-backed and say which user-confidence questions remain open.

### UI Consultant
- Core access: Browser screenshots, design sources, component references, and brand guidance.
- If missing: Keep visual recommendations narrow and route-specific.

### Marketing Graphics Artist
- Core access: Brand guidelines, approved logo/source assets, channel specs, campaign calendar, target audiences, ad-account performance data, examples of winning creative, legal-approved claims, image generation or design tooling, and visual QA/OCR capability.
- If missing: Keep concepts clearly marked as source-backed creative drafts, avoid factual or legal-sensitive claims, and do not mark generated assets campaign-ready without visual and spelling QA.

### B2B Growth Marketer
- Core access: CRM/pipeline data for Client Prospects and Bum candidates, funnel analytics, website analytics, source tracking, campaign performance, LinkedIn/email/ad data, audience definitions, approved sales collateral, legal-approved claims, case-study permissions, customer/Bum interview notes, objection notes, and channel budget constraints.
- If missing: Keep growth plays source-backed, prioritize low-risk founder/referral motions, and avoid claiming performance confidence or scale readiness.

### Content Copyeditor
- Core access: Product copy, legal-approved terminology, sales collateral, onboarding and support language.
- If missing: Flag naming drift but avoid claiming final terminology decisions.

### Trust And Reputation Consultant
- Core access: DNS/Cloudflare or registrar records, Google Search Console, Bing Webmaster Tools, Safe Browsing or security-issue reports, Microsoft SmartScreen feedback, email provider auth dashboards, DMARC reports, postmaster tools, scanner dashboards, public site crawl, and brand/company proof sources.
- If missing: Run public-source checks, keep findings scanner/source-backed, and mark dashboard-only checks as access gaps.

### Accessibility Specialist
- Core access: Authenticated browser access, screenshots, keyboard and screen-reader notes, automated axe coverage.
- If missing: Keep findings code-backed and identify operability gaps that still need live validation.

### QA/Test Engineer
- Core access: Routable QA target, seeded accounts, role credentials, CI history, flaky-test history, and deterministic auth setup.
- If missing: Treat skipped or unreachable suites as coverage limitations, not passing coverage.

### Security Engineer
- Core access: Supabase read-only SQL and advisors, Clerk configuration visibility, deployed function inventory or logs, seeded role tokens, CI secrets inventory.
- If missing: Do not assume current live policy or grant state from code alone.

### Performance Engineer
- Core access: Production or staging traces, Web Vitals, bundle analysis, Supabase advisor access, query plans, authenticated route access.
- If missing: Distinguish measured production evidence from local build or source inference.

### Data And Analytics Engineer
- Core access: Supabase SQL, analytics or event data, export samples, reconciliation examples, and metric owners.
- If missing: Treat metric definitions and data quality as inferred, not confirmed.

### Product Ops Workflow Analyst
- Core access: Support queues, CRM pipeline, admin logs, finance exception examples, operations SOPs, and role walkthroughs.
- If missing: Treat recommendations as product-model findings, not proven operating reality.

### Lead Developer
- Core access: All specialist backlogs, Supabase tooling, QA/browser access, CI and deployment history, dependency audit output, and current external guidance.
- If missing: Prioritize the access request alongside the implementation recommendation it blocks.
