# Trusted Bums Consultant Access Needs

_Last updated: 2026-06-09 by Codex._

## Executive Read

This file tracks access, credentials, dashboards, logs, fixtures, and third-party systems that would materially improve consultant output. Missing access belongs here, not buried inside product recommendations.

All agents need write/read access to the Admin Tools Scrum Tracker through `/admin/scrum`, Supabase MCP, or an approved equivalent path. If an agent cannot create or update `public.admin_scrum_items`, cannot set `added_by_agent`, or cannot get the generated `TB-` number back for its handoff, the agent must record that as an access blocker here and keep the affected recommendation explicitly untracked until access is restored.

## Active Access Requests

### P0 - Provide domain reputation, DNS, and webmaster access
- Why it matters: Trust & Reputation, Security, Content, UX, and Lead Developer need to know whether `trustedbums.com` is blocked, distrusted, misconfigured, spoofable, poorly indexed, or weakly credible to web-security systems and buyers.
- Needed access: DreamHost hosting or DNS dashboard (or whichever provider is authoritative now), registrar/DNS records, Google Search Console security/manual-action reports, Bing Webmaster Tools, Google Safe Browsing status where available, Microsoft Defender/SmartScreen reputation feedback, postmaster tools, Microsoft 365 or other email-provider domain-authentication dashboards, post-quarantine DMARC monitoring and rollback authority, Supabase Edge Function deployment provenance for `dmarc-reports`, and any security/reputation scanner dashboards already in use.
- Current status: This gap narrowed on 2026-06-09. DreamHost deploy run `27209133291` published commit `6512a6c`, `curl https://trustedbums.com/` confirmed the Bing verification tag, Bing Verify succeeded for `https://trustedbums.com/`, and `https://trustedbums.com/sitemap.xml` was submitted with status `Processing`. Later on 2026-06-09, Codex deployed `dmarc-reports` version 3 to Supabase project `vaoqvtxqvbptyxddpoju`, invoked it as an authenticated admin against `bums@trustedbums.com`, and confirmed the expanded review parses cleanly: 100 mailbox messages scanned, 17 likely DMARC reports found, 17 parsed, 44 reported messages summarized, 44 aligned passes, 0 full SPF/DKIM alignment failures, and no parse errors across Google ZIP plus Microsoft/Yahoo GZIP reports. DreamHost and authoritative DNS now show `_dmarc.trustedbums.com` at `v=DMARC1; p=quarantine; rua=mailto:bums@trustedbums.com; pct=100;`; the prior rollback record is `v=DMARC1; p=none; rua=mailto:bums@trustedbums.com; pct=100;`. Earlier checks returned HTTP 200 for `https://trustedbums.com`, so the runner can reach the deployed site. The remaining missing evidence is dashboard/control-plane level rather than routability-level: registrar or DNS dashboard, Google Search Console, Safe Browsing or SmartScreen feedback, postmaster data, email-auth dashboard access, and recurring Bing report access after processing.

### P0 - Stabilize Supabase consultant tooling for project `vaoqvtxqvbptyxddpoju`
- Why it matters: Security, Data/Analytics, Performance, Product Ops, and Lead Developer need consistent live validation for RLS, policies, grants, views, functions, advisors, and safe aggregates.
- Needed access: Supabase MCP or connector capability for read-only SQL, catalog inspection, security advisors, performance advisors, storage inspection, safe aggregate queries, function inventory, and logs in the actual consultant session.
- Current status: This narrowed again on 2026-06-07. Codex completed OAuth login for the project-scoped `supabase-trustedbums` MCP entry and a fresh nested agent verified `mcp__supabase_trustedbums` against project `vaoqvtxqvbptyxddpoju`: `get_project_url` returned `https://vaoqvtxqvbptyxddpoju.supabase.co`, and `list_edge_functions` returned the live edge-function inventory including `send-website-email`. The generic Supabase app connector also listed the same Trusted Bums project and edge functions. Keep this request open only for capability-depth gaps that may still vary by session, such as reliable query plans, `pg_stat_statements`, deployment history, secrets inventory by variable name, and a stable all-role function inventory path.

### P0 - Define authoritative profile bootstrap and self-editable identity fields
- Why it matters: Security, Product Ops, QA/Test, and Lead Developer need an explicit business rule for who may assign portal role, client company, client access role, and Bum identity before RLS and auth bootstrap can be safely tightened.
- Needed access: Product/security decision or documented business rule covering sign-up intent, company matching, admin-approved role assignment, client workspace creation, and which `profiles` fields are user-editable versus admin-controlled.
- Current status: The 2026-05-31 security run found that local auth bootstrap still reads Clerk `unsafeMetadata` hints and live `profiles` policy still allows signed-in non-admin users to update their own profile row without pinning `company_id` or `client_access_role`. `docs/business-access-rules.md` has the role matrix, but it still does not define the authoritative bootstrap path or safe self-editable profile fields, so final hardening acceptance criteria remain partly implicit.

### P1 - Provide accessibility validation evidence for authenticated and public routes
- Why it matters: Accessibility review can confirm label wiring and some semantics from source, but it still cannot validate keyboard order, focus visibility, disclosure behavior, table announcements, dialog trapping, or screen-reader output on real portal pages without live evidence.
- Needed access: Authenticated browser-routable QA sessions for admin, client admin, client finance, client member, and Bum roles; fresh desktop and mobile screenshots for key routes; `@axe-core/playwright` or equivalent automated scan wiring; and lightweight screen-reader or keyboard walkthrough notes for high-traffic routes.
- Current status: This gap narrowed on 2026-05-31: after sourcing `.env.qa`, `pnpm run qa:env` passed, the expected QA variable names were present in-shell, `curl -I --max-time 15 "$QA_BASE_URL"` returned HTTP 200, and authenticated Playwright navigation could sign in across the existing desktop role audit. The remaining missing evidence is richer validation, not basic reachability: the repo still has no `@axe-core/playwright` or `axe-core`, no narrated keyboard or screen-reader notes, no fresh mobile route captures, and the current portal interaction audit stops early because its hash-link assertion treats the shared `#main-content` skip link as broken even when the target exists.

### P0 - Provide extension API QA token plus explicit QA env contract coverage
- Why it matters: QA/Test and Security need to run authenticated extension API smoke and authorization-boundary checks instead of relying on source-only review, and QA preflight should fail fast when extension-smoke inputs are missing.
- Needed access: `QA_EXTENSION_API_BASE_URL`, `QA_EXTENSION_API_TOKEN` or an equivalent deterministic auth mechanism, plus seeded data for one allowed and one denied authorization case. Also needed: document these variables in `.env.qa.example` and make `scripts/verify-qa-env.mjs` check them when extension smoke is part of the run.
- Current status: `.env.qa` still contains `QA_EXTENSION_API_BASE_URL`, but 2026-05-31 verification showed `QA_EXTENSION_API_TOKEN` was still missing after sourcing `.env.qa`. `.env.qa.example` and `scripts/verify-qa-env.mjs` still omit the extension variables entirely, so authenticated extension smoke cannot be preflighted from the documented contract. The latest live extension smoke on 2026-05-31 again passed only the anonymous `/context` checks while skipping authenticated coverage because `QA_EXTENSION_API_TOKEN` was unavailable.

### P0 - Provide seeded multi-company authorization fixtures for QA and RLS validation
- Why it matters: QA/Test, Security, Product Ops, and Lead Developer need deterministic allow/deny proof for customer targets, accepted opportunities, extension destinations, Bum represented contacts, and other company-scoped workflows.
- Needed access: Seeded records and credentials spanning at least two client companies, one admin, one client admin, one client finance, one client member, two Bums, one allowed accepted opportunity, one denied accepted opportunity, one own-company customer target, one foreign-company customer target, represented contacts from each source type, and replay-safe extension capture inputs.
- Current status: The repo documents role account types and source-backed business rules, but the consultant session still lacks deterministic seeded data to prove cross-company denial and legitimate access for the highest-risk authorization paths.

### P1 - Provide approved product language and legal terminology sources
- Why it matters: Content, UX, Product Ops, Support, and Legal decisions now depend on distinguishing `customer leads`, `Bum intro requests`, `Bum responses`, role names, and legal workspace language with more confidence than code alone can provide.
- Needed access: Sales collateral, onboarding docs or emails, support macros, legal-approved terminology, brand voice guidance, customer-language research, CRM stage naming, recruiting or partner-acquisition copy for future Bums, and any customer-facing SOPs or training content that define these workflows.
- Current status: These sources are still not present in the repo or connected tools as of 2026-05-31. Current code still conflicts on `Agreements` vs `Partner Terms` vs `Terms & Legal Agreements`, `Requests` vs `Customer leads` vs `Bum intro requests`, bare `Admin`/`Finance`/`Member` role labels, and public-intake/internal-ops language such as `I want to become a Bum` vs `Prospective Bum` vs `Mark Bum Invited`, so content recommendations remain implementation-ready but product-code-backed rather than business-approved.

### P1 - Provide deployment provenance for Supabase functions and schema changes
- Why it matters: Live Supabase inventory still shows deployment drift risk, which weakens trust-boundary review, release auditability, and incident response.
- Needed access: CI/CD deploy history for Supabase functions and database migrations, release notes or change tickets for live-only functions, Chrome extension release/version provenance where extension auth depends on those deploys, environment or CI secrets inventory by variable name, confirmation of which branch or environment should match project `vaoqvtxqvbptyxddpoju`, and a deploy-capable Supabase token or workflow for Edge Function updates.
- Current status: This gap remains concrete on 2026-06-09, but `TB-0057` is no longer blocked on `dmarc-reports` deployment. Codex deployed `dmarc-reports` version 3 with the gzip attachment fix through the Supabase connector, and the live mailbox review parsed Microsoft/Yahoo `.xml.gz` reports cleanly. What is still missing is the audit trail explaining when earlier live/local divergence happened, which branch or workflow last deployed each function, and a repeatable CI-backed release path for future Edge Function updates instead of relying on ad hoc connector deployment.

### P1 - Provide public-form abuse protection and mail-reputation operations access
- Why it matters: Trust & Reputation, Security, QA/Test, and Lead Developer need to verify that public contact/signup flows cannot be used to flood inboxes, damage sender reputation, or trigger browser/security distrust.
- Needed access: Cloudflare Turnstile or equivalent captcha configuration, edge or CDN rate-limit settings, any WAF or bot-management rules protecting public forms, Microsoft 365 or mail-provider sending dashboards for the notification mailbox, and any alerting on contact-form spikes or delivery failures.
- Current status: Local source shows `send-website-email` is intentionally public and mail-sending, but the current consultant session has no anti-abuse vendor evidence, no rate-limit dashboard, and no sender-reputation operations view.

### P1 - Provide production or staging observability and dependency alert context
- Why it matters: Security, Performance, QA/Test, and Lead Developer need CI failures, deploy history, runtime errors, Web Vitals, and security alert visibility to prioritize risk instead of relying only on source review.
- Needed access: CI run history, deployment logs, frontend error monitoring, production or staging Web Vitals, Lighthouse or bundle-analyzer artifacts, flaky-test history, and repository security alert or Dependabot visibility if available.
- Current status: Local source review and narrow QA checks are available, and the no-cost performance-monitoring implementation now has live Supabase evidence through `performance_metric_events` rows plus recent `performance-beacon` logs. The 2026-05-30 performance session still had no CI history, flaky-test history, deploy logs, browser telemetry dashboard, Lighthouse artifacts, bundle-analyzer output, authenticated route network traces, or error-monitoring context, so bundle-splitting and report-route priorities remain mostly build- and source-backed.

### P1 - Provide seeded telemetry samples and role access proof for admin performance monitoring
- Why it matters: QA/Test, Performance, Security, and Product Ops need to verify the new `/admin/performance` route with realistic data and prove that telemetry remains admin-scoped.
- Needed access: Seeded `performance_metric_events` rows covering multiple metrics and routes, one admin account, and one non-admin account for deny checks.
- Current status: Live Supabase SQL on 2026-05-30 still shows only `13` `performance_metric_events` rows across three paths and one origin, and recent edge-function logs still show both accepted `202` and rejected `403` `performance-beacon` requests. The telemetry path is active, but authenticated route proof is still missing: this session had no live admin walkthrough of `/admin/performance` and no non-admin deny check.

### P2 - Confirm telemetry retention and deployment-provider values
- Why it matters: The app now treats performance telemetry as necessary operational monitoring, stores Web Vitals in Supabase, and gives admins a review tool.
- Needed access: Deployment-provider confirmation for `VITE_PERFORMANCE_BEACON_URL` and `VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN`, plus retention expectations for `performance_metric_events`.
- Current status: Product classification is decided as necessary operational monitoring, consent/legal copy is aligned, repo env templates include the variable names, Cloudflare Web Analytics setup was completed, the Supabase beacon endpoint is deployed, `/admin/performance` provides admin review, and live Supabase data now confirms stored beacon rows. Still needed: confirm production deployment-provider values, retention period, and the complete set of allowed telemetry origins behind the recent `403` beacon rejects.

### P2 - Verify Google Analytics live collection and agent access path
- Why it matters: B2B Growth, Data/Analytics, UX, UI, Product Ops, Trust & Reputation, Performance, Release Verification, and Lead Developer can now use GA as the primary website analytics source, but only after deployment and consented traffic prove collection is live.
- Needed access: Google Analytics property access for the `Trusted Bums` account/property, the `Trusted Bums Web` stream for `https://trustedbums.com`, date-range-filtered aggregate reports, source/medium and campaign reports, landing-page/event aggregates, and an agreed agent-safe way to cite aggregate GA evidence without exporting raw visitor-level data.
- Current status: GA4 setup is complete under `TB-0066`: web stream `Trusted Bums Web`, stream URL `https://trustedbums.com`, stream ID `15031871944`, and measurement ID `G-P6B5EYQMVN`. The repo now has a consent-gated GA loader and the GitHub deployment secret `VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID` is set. GA still showed `Data collection is pending` on 2026-06-09, so agents may cite GA as configured but should not claim live website analytics evidence until production deploy plus GA data-received proof closes `TB-0066`.

### P2 - Verify Bing Webmaster Tools ownership, sitemap, and agent access path
- Why it matters: Trust & Reputation, B2B Growth, Data/Analytics, Content, Marketing Graphics, UX, UI, Performance, Release Verification, and Lead Developer can use Bing Webmaster Tools for Microsoft search visibility, crawl, sitemap, indexing, SEO/GEO, backlink, keyword, and reputation evidence.
- Needed access: Bing Webmaster Tools access for the `https://trustedbums.com/` site entry, verification status, sitemap submission/status, crawl/indexing reports, SEO/GEO reports, keyword/backlink reports, Microsoft-side security or reputation messages when available, and an agreed agent-safe way to cite aggregate Bing evidence without exporting private data.
- Current status: Bing setup is verified under closed item `TB-0071`: the site entry exists, production serves `<meta name="msvalidate.01" content="F262EC5D731F39A7B9C8912DF741F807" />`, `public/robots.txt` allows Bingbot, `public/sitemap.xml` is live, Bing Verify succeeded, and `https://trustedbums.com/sitemap.xml` was submitted on 2026-06-09 with status `Processing`. Agents may use Bing Webmaster Tools when report data is available; record processing or empty-report states as current Bing evidence rather than setup blockers.

### P1 - Provide product, design, and operations source-of-truth artifacts
- Why it matters: UX, UI, Content, Product Ops, and Data/Analytics need stronger non-code evidence to validate terminology, queue design, workflow ownership, access handoffs, visual intent, funnel friction, and customer trust objections.
- Needed access: Brand and design sources, approved screenshot baselines, funnel or product analytics, session recordings, support tickets or macros, support queue exports with current statuses and SLAs, customer-feedback exports, sales-objection notes, CRM or sales-pipeline exports for reverse-opportunity and target-response follow-through, onboarding materials, finance reconciliation and exception samples, admin audit/log examples, operations SOPs, and narrated role walkthroughs for Admin, Client Admin, Client Finance, Client Member, and Bum accounts.
- Current status: This gap remains open on 2026-06-09. GitHub Visual QA access is no longer blocked by basic workflow control, but current-head run `27181180658` on `9f42bf4` failed before auth bootstrap because it targeted `https://rcdl.tplinkdns.com` instead of the healthy primary host `https://trustedbums.com`. Product Ops still lacks support queue export with SLA buckets, CRM stage history, finance exception samples, admin rescue logs, operations SOPs, approved access-proof categories, and narrated role walkthroughs for Admin, Client Admin, Client Finance, Client Member, and Bum roles. UI/UX/Content still lack brand guidance, component-library references, approved screenshot baselines, analytics, support evidence, and design source files. Current recommendations are implementation-ready and evidence-backed, but not yet validated against approved design intent or day-to-day operating proof.

## Role Access Matrix

### UX Consultant
- Core access: Authenticated role accounts, browser screenshots, Google Analytics funnel and landing-page aggregates when live, session recordings, support or customer feedback.
- If missing: Keep recommendations source-backed and say which user-confidence questions remain open.

### UI Consultant
- Core access: Browser screenshots, design sources, component references, and brand guidance.
- If missing: Keep visual recommendations narrow and route-specific.

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
- Core access: Supabase SQL, Google Analytics aggregate reporting when live, product analytics or event data, export samples, reconciliation examples, and metric owners.
- If missing: Treat metric definitions and data quality as inferred, not confirmed.

### Product Ops Workflow Analyst
- Core access: Support queues, CRM pipeline, admin logs, finance exception examples, operations SOPs, and role walkthroughs.
- If missing: Treat recommendations as product-model findings, not proven operating reality.

### Lead Developer
- Core access: All specialist backlogs, Supabase tooling, QA/browser access, CI and deployment history, dependency audit output, and current external guidance.
- If missing: Prioritize the access request alongside the implementation recommendation it blocks.
