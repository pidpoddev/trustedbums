# Trusted Bums Consultant Access Needs

_Last updated: 2026-06-06 by Codex daily product ops workflow analyst automation._

## Executive Read

This file tracks access, credentials, dashboards, logs, fixtures, and third-party systems that would materially improve consultant output. Missing access belongs here, not buried inside product recommendations.

## Active Access Requests

### P0 - Provide CRM, analytics, approved GTM evidence, and the missing brand strategy source
- Why it matters: B2B Growth Marketer, Content, Marketing Graphics, Trust & Reputation, Product Ops, Data/Analytics, UX/UI, and Lead Developer need real funnel evidence plus the authoritative brand-positioning source before scaling acquisition or hardening public messaging. Without those inputs, growth recommendations stay source-backed, selective, and intentionally conservative, with Client-demand capture prioritized over any broad Bum or paid expansion.
- Needed access: `docs/brand-strategy.md` or its replacement source of truth covering positioning, audience priorities, voice, proof hierarchy, and trust constraints; CRM or pipeline views for Client Prospects and Bum Prospects including source, owner, stage, qualification status, disqualification reason, and conversion timestamps; website analytics and source tracking; LinkedIn organic analytics; LinkedIn paid account access or exports; email/campaign performance; referral-source tracking; approved sales collateral; founder scripts; outreach examples; objection notes; approved case-study permissions; legal-approved claims boundaries for logos, outcomes, commissions, payouts, and referral disclosures; customer/Bum interview notes; and budget constraints by channel.
- Current status: Added by B2B Growth Marketer on 2026-06-04 and expanded on 2026-06-05 and 2026-06-06. The repo now has a sharper growth strategy backlog, but the run still had no `docs/brand-strategy.md`, CRM, analytics, ad-account, email-platform, interview, approved-collateral, or claims-approval source. Current public acquisition evidence is still mostly source inspection: one homepage with broad Client and Bum CTAs, one shared contact form, one signup-intent modal, Bum-side activation workflows, and proof-safe marketing graphics concepts. The 2026-06-06 growth review still points to Client demand as the near-term liquidity constraint, so the highest-value missing evidence is Client-side funnel data: qualified strategy requests, referred-company quality, objection patterns, founder-call conversion, and first-target-account activation by source. Until GTM evidence and the brand source are available, the backlog should continue to prioritize founder-led, referral-led, proof-led, and sales-assisted motions over scaled paid or lifecycle automation.

### P0 - Provide domain reputation, DNS, and webmaster access
- Why it matters: Trust & Reputation, Security, Content, UX, and Lead Developer need to know whether `trustedbums.com` is blocked, distrusted, misconfigured, spoofable, poorly indexed, or weakly credible to web-security systems and buyers.
- Needed access: DreamHost hosting or DNS dashboard (or whichever provider is authoritative now), registrar/DNS records, Google Search Console security/manual-action reports, Bing Webmaster Tools, Google Safe Browsing status where available, Microsoft Defender/SmartScreen reputation feedback, DMARC aggregate reports, postmaster tools, Microsoft 365 or other email-provider domain-authentication dashboards, and any security/reputation scanner dashboards already in use.
- Current status: This remains a local-runner release verification limitation on 2026-06-05, not a confirmed public outage. After sourcing `.env.qa`, local `curl -I -L --max-time 20 "$QA_BASE_URL"` timed out during DNS resolution for `https://trustedbums.com`; local `dig trustedbums.com A` and `AAAA` timed out with no reachable DNS server; and local deployed staging smoke failed at first navigation. However, GitHub Actions could reach the target: `QA` run `26933502583` passed browser smoke, and `E2E Smoke` run `26933527284` reached enough deployed routes to pass 23 tests before assertion/deep-QA failures. Independent hosting, DNS, CDN, registrar, uptime-monitor, Google Search Console, Safe Browsing, SmartScreen, postmaster, and email-auth dashboard evidence are still needed.

### P0 - Stabilize Supabase consultant tooling for project `vaoqvtxqvbptyxddpoju`
- Why it matters: Security, Data/Analytics, Performance, Product Ops, and Lead Developer need consistent live validation for RLS, policies, grants, views, functions, advisors, and safe aggregates.
- Needed access: Supabase MCP or connector capability for read-only SQL, catalog inspection, security advisors, performance advisors, storage inspection, safe aggregate queries, function inventory, and logs in the actual consultant session.
- Current status: This remains open, but the 2026-06-06 security run materially narrowed the gap. In that run, Supabase live inspection was callable for project metadata, security advisors, read-only SQL, storage buckets and policies, extensions, targeted edge-function source retrieval, and edge-function logs. That was enough to freshly confirm live `SECURITY DEFINER` advisor findings, broad `public` Data API grants, current storage-policy shape, and the current behavior of public edge-function paths. The remaining tooling gaps are narrower now: `_list_edge_functions` still required reauthentication, and the session still lacked reliable query plans, `pg_stat_statements`, deployment history, secrets inventory by variable name, and a stable all-role function inventory path. Keep this request open until those remaining capabilities are consistently callable across specialist runs instead of appearing only in some sessions.

### P0 - Define authoritative profile bootstrap and self-editable identity fields
- Why it matters: Security, Product Ops, QA/Test, and Lead Developer need an explicit business rule for who may assign portal role, client company, client access role, and Bum identity before RLS and auth bootstrap can be safely tightened.
- Needed access: Product/security decision or documented business rule covering sign-up intent, company matching, admin-approved role assignment, client workspace creation, and which `profiles` fields are user-editable versus admin-controlled.
- Current status: This gap narrowed on 2026-05-31 because `docs/business-access-rules.md` now includes a release-gate rule for profile bootstrap and self-editable identity fields. Product/security still need to confirm the exact self-editable field list and whether first-time client signup may create a workspace automatically or must wait for Admin approval before implementation hardening proceeds.

### P1 - Provide accessibility validation evidence for authenticated and public routes
- Why it matters: Accessibility review can confirm label wiring and some semantics from source, but it still cannot validate keyboard order, focus visibility, disclosure behavior, table announcements, dialog trapping, or screen-reader output on real portal pages without live evidence.
- Needed access: Authenticated browser-routable QA sessions for admin, client admin, client finance, client member, and Bum roles; fresh desktop and mobile screenshots for key routes; `@axe-core/playwright` or equivalent automated scan wiring; lightweight screen-reader or keyboard walkthrough notes for high-traffic routes; and a scripted QA env bootstrap that exports `.env.qa` reliably for consultant shells.
- Current status: This gap remains open on 2026-06-06. Sourcing `.env.qa` still restored the expected QA env contract, and `scripts/verify-qa-env.mjs` still proves the required variable names are present when the shell is bootstrapped correctly. The blockers are still material: the checked-in public Playwright smoke spec now also shows a local-evidence gap because [`tests/e2e/staging-smoke.spec.ts`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/tests/e2e/staging-smoke.spec.ts:5) skips entirely without `QA_BASE_URL`, the repo still has no `@axe-core/playwright` or `axe-core`, `pnpm run lint` still errors while scanning a missing `test-results` directory, and there are still no narrated keyboard, screen-reader, authenticated mobile, or fresh screenshot captures for portal routes.

### P0 - Provide deterministic Clerk QA auth support plus failure logs
- Why it matters: QA/Test, Accessibility, Security, and Lead Developer currently depend on deployed authenticated browser coverage, but the 2026-05-31 run showed that role smoke no longer provides stable evidence because Clerk-backed sign-in itself is timing out or closing before route assertions can settle.
- Needed access: Confirmed-good QA accounts for Admin, Client Admin, Client Finance, Client Member, and Bum; the approved sign-in method for automation; Clerk dashboard or request-log visibility for failed QA sign-ins; and any relevant edge-function or auth-proxy logs tied to `clerk.trustedbums.com` requests.
- Current status: This remains open, but current evidence has shifted from "auth cannot start" to "deployed auth reaches routes but role assertions still fail." GitHub `E2E Smoke` run `26933527284` reached authenticated finance routes, then failed because the finance payment page had duplicate accessible `Customer Payment Reports` headings and because finance global search navigated to `/client/dashboard` instead of `/client/payments`. Local deployed auth checks still cannot run because this runner cannot resolve `trustedbums.com`. Clerk logs and deterministic auth setup evidence remain needed to separate account/session issues from route assertion failures after target preflight passes.

### P0 - Provide extension API QA token plus explicit QA env contract coverage
- Why it matters: QA/Test and Security need to run authenticated extension API smoke and authorization-boundary checks instead of relying on source-only review, and QA preflight should fail fast when extension-smoke inputs are missing.
- Needed access: `QA_EXTENSION_API_BASE_URL`, `QA_EXTENSION_API_TOKEN` or an equivalent deterministic auth mechanism, plus seeded data for one allowed and one denied authorization case. Also needed: document these variables in `.env.qa.example` and make `scripts/verify-qa-env.mjs` check them when extension smoke is part of the run.
- Current status: `.env.qa` still contains `QA_EXTENSION_API_BASE_URL`, but 2026-06-05 verification showed `QA_EXTENSION_API_TOKEN` is still missing after sourcing `.env.qa`. `.env.qa.example` and `scripts/verify-qa-env.mjs` still omit extension variables, so authenticated extension smoke cannot be preflighted from the documented contract. The anonymous extension smoke is healthier today: `tests/e2e/extension-api.spec.ts` passed the anonymous `/context` 401 envelope locally in 1.1s, while authenticated coverage still skipped because no token was available.

### P0 - Provide seeded multi-company authorization fixtures for QA and RLS validation
- Why it matters: QA/Test, Security, Product Ops, and Lead Developer need deterministic allow/deny proof for customer targets, accepted opportunities, extension destinations, Bum represented contacts, and other company-scoped workflows.
- Needed access: Seeded records and credentials spanning at least two client companies, one admin, one client admin, one client finance, one client member, two Bums, one allowed accepted opportunity, one denied accepted opportunity, one own-company customer target, one foreign-company customer target, represented contacts from each source type, profile-bootstrap/self-edit denial fixtures, seeded telemetry rows, same-domain and cross-company client-team approval fixtures, related-domain pending/approval fixtures, public-email manual-review fixtures, disabled-user fixtures, audit-event expectations, and replay-safe extension capture inputs.
- Current status: The repo documents role account types and source-backed business rules, but the consultant session still lacks deterministic seeded data to prove cross-company denial and legitimate access for the highest-risk authorization paths. The 2026-06-02 QA review added client-team/domain-approval fixture needs because `/client/team` and the `client-team` function can grant client access roles, but current tests do not prove same-company allow, cross-company deny, public-email manual review, related-domain pending behavior, disabled-user denial, or audit event creation.

### P1 - Provide approved product language and legal terminology sources
- Why it matters: Content, UX, Product Ops, Support, and Legal decisions now depend on distinguishing `customer leads`, `Bum intro requests`, `Bum responses`, role names, and legal workspace language with more confidence than code alone can provide.
- Needed access: Sales collateral, onboarding docs or emails, support macros, legal-approved terminology, brand voice guidance, customer-language research, CRM stage naming, recruiting or partner-acquisition copy for future Bums, and any customer-facing SOPs or training content that define these workflows.
- Current status: This remains open on 2026-06-06, and the scope is still narrower after the June 4 glossary pass. The biggest remaining content gaps are unchanged: agreement-remediation CTAs still route to `Company Profile`, the terms-deferral button label still says `Skip This Login`, and `Prospect` still refers to both `Client Prospect` companies and `Bum Prospect` recruiting objects. A smaller residual copy mismatch also remains in the client request history section, where the heading says `Bum Intro Requests` but the helper sentence shortens it to `Intro Requests`. QA env preflight again succeeded only after sourcing `.env.qa`, but `curl -I -L --max-time 20 https://trustedbums.com` still timed out during DNS resolution on this runner on 2026-06-06, so the current content review remains code-backed and route-inventory-backed rather than browser-verified or business-approved.

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
- Current status: This gap remains open on 2026-06-05, although GitHub workflow evidence is now partially available in-session. `gh run list` and run logs showed `QA` on `main` passed, `Visual UI Audit` passed, and `E2E Smoke` failed with concrete deployed Playwright failures plus a deep-QA timeout. Supabase project metadata, performance advisors, edge-function logs, and Postgres logs were callable in recent specialist runs, but this QA run did not have live read-only SQL/catalog access, frontend error monitoring, Lighthouse, bundle analyzer, authenticated route traces, `pg_stat_statements`, dependency alert context, or full flaky-test history.

### P1 - Provide seeded telemetry samples and role access proof for admin performance monitoring
- Why it matters: QA/Test, Performance, Security, and Product Ops need to verify the new `/admin/performance` route with realistic data and prove that telemetry remains admin-scoped.
- Needed access: Production-safe or seeded `performance_metric_events` aggregate access covering multiple metrics and routes, one admin account, one non-admin account for deny checks, and a route-level aggregate/query-plan path that does not expose raw private telemetry.
- Current status: This gap narrowed again on 2026-06-06. Live SQL now confirms about `17,469` `performance_metric_events` rows (`12 MB` total), about `17,438` 7-day samples from `https://trustedbums.com`, and current route-level LCP p75 aggregates for `/client/dashboard`, `/admin`, `/bum/dashboard`, `/`, and `/client/targets`. What is still missing is the product-facing proof: an admin walkthrough of `/admin/performance`, a non-admin deny check, and a server-side aggregate/query-plan path that the page itself can use instead of computing p75 from the latest raw `500` rows in the browser.

### P2 - Confirm telemetry retention and deployment-provider values
- Why it matters: The app now treats performance telemetry as necessary operational monitoring, stores Web Vitals in Supabase, and gives admins a review tool.
- Needed access: Deployment-provider confirmation for `VITE_PERFORMANCE_BEACON_URL` and `VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN`, plus retention expectations for `performance_metric_events`.
- Current status: Product classification is decided as necessary operational monitoring, consent/legal copy is aligned, repo env templates include the variable names, Cloudflare Web Analytics setup was completed, the Supabase beacon endpoint is deployed, `/admin/performance` provides admin review, and live Supabase data now confirms ongoing stored beacon rows. The remaining questions are narrower now: confirm production deployment-provider values, retention period, and whether any telemetry origins beyond the currently observed `https://trustedbums.com` and small local-dev samples are expected.

### P1 - Provide product, design, and operations source-of-truth artifacts
- Why it matters: UX, UI, Content, Product Ops, and Data/Analytics need stronger non-code evidence to validate terminology, queue design, workflow ownership, access handoffs, visual intent, funnel friction, and customer trust objections.
- Needed access: Brand and design sources, approved logo usage rules, campaign visual guidelines, campaign calendar, ad-account/channel priorities, audience definitions by channel, ad-account performance exports, examples of winning creative, legal-approved marketing claims, approved screenshot baselines, durable access to retained `Visual UI Audit` artifacts or an equivalent long-lived screenshot library for public plus authenticated role shells, ad-manager preview access or exportable crop proofs, OCR-capable image QA for spelling verification when generated text is unavoidable, funnel or product analytics, session recordings, support tickets or macros, support queue exports with current statuses and SLAs, customer-feedback exports, sales-objection notes, CRM or sales-pipeline exports for reverse-opportunity and target-response follow-through, onboarding materials, finance reconciliation and exception samples, admin audit/log examples, operations SOPs, and narrated role walkthroughs for Admin, Client Admin, Client Finance, Client Member, and Bum accounts.
- Current status: This gap remains open on 2026-06-06. `docs/brand-strategy.md` is still missing, so brand guidance remains inferred from current public-site copy, assets, typography, colors, and consultant rules rather than confirmed by a dedicated source-of-truth file. UI evidence remains implementation-grade rather than design-approved: GitHub Visual QA run `26931897223` from 2026-06-04 is still the latest authoritative visual artifact, but those screenshots are not an approved baseline set and the artifact retention window is too short to serve as the only durable reference. Product Ops still lacks support queue export with SLA buckets, CRM stage history, finance exception samples, admin rescue logs, access-request proof examples, narrated role walkthroughs for Admin, Client Admin, Client Finance, Client Member, and Bum roles, and the underlying operations SOPs that would explain queue ownership and escalation policy. This run also still lacked direct Supabase SQL/advisor access, so policy and status validation stayed limited to live table inventory rather than safe aggregate or policy-catalog proof. Marketing still lacks approved logo usage rules, campaign visual guidelines, campaign calendar, audience definitions, ad-account performance, winning creative examples, legal-approved claims, ad-manager crop proof, and OCR-backed spelling QA when text-bearing creative is required.

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
