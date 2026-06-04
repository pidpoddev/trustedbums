# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-01 by Codex glossary implementation review._

## Executive Read

The implementation queue should stay led by live trust-boundary work, not UI polish. Supabase read-only inspection for project `vaoqvtxqvbptyxddpoju` confirms RLS is enabled on the watched tables, but `profiles`, `customer_targets`, `contact_submissions`, `performance_metric_events`, and `bum_saved_items` still carry broad `anon`/`authenticated` grants. Live `public.admin_dashboard_summary()` and RLS helper functions are still `SECURITY DEFINER` functions in exposed `public` with `anon`/`authenticated` execute grants. The public `send-website-email` function is still unauthenticated, wildcard-CORS, and directly mail-sending even though `submit-contact` is now the hardened public intake path.

The second priority is authorization bootstrap. Current source still lets Clerk `unsafeMetadata` influence role/company/client-access/Bum identity bootstrap, and live `profiles` policies still allow signed-in users to insert or update their own non-admin profile rows without pinning `company_id` or `client_access_role`. Clerk currently documents `unsafeMetadata` as frontend-writeable and tamperable, so the hardening path must be driven by the new business-access rule rather than inferred from signup UX.

The third priority is executable proof. `pnpm run qa:env` passed after sourcing `.env.qa`, and targeted Vitest checks passed, but authenticated Playwright role smoke is currently unreliable, extension authenticated checks still skip without `QA_EXTENSION_API_TOKEN`, and `/admin/handoffs` is not yet in visual/interaction route coverage. Product, QA, Security, Data, and Product Ops should converge on a smaller allow/deny matrix before any broad RLS or grant cleanup ships.

## Recommended Implementation Queue

### P1 - Apply founder-approved glossary to site and portal copy
- Source: `docs/content-copyeditor-backlog.md` glossary updated on 2026-06-01; `docs/glossary-site-change-review.md`; current source scan of client legal, request, role, and finance surfaces.
- Why now: Ryan has clarified the core party, opportunity, claim, finance, and legal terms. The site still exposes old labels that blur Customer vs Client, Client Agreement vs Partner Terms, generic requests vs Customer Leads/Bum Intro Requests/Claims, and bare role names vs company-scoped Client roles.
- Recommended fix: Ship staged copy-only PRs that apply approved glossary terms before deeper workflow/status model changes. Start with legal noun family and Client role labels, then marketplace object labels, then finance language that avoids implying Customer money passes through Trusted Bums.
- Likely files/routes: `src/layouts/ClientLayout.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/pages/client/ClientAgreements.tsx`, `src/pages/client/ClientTerms.tsx`, `src/pages/client/ClientProfile.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientRequests.tsx`, `src/pages/client/ClientTeam.tsx`, `src/pages/client/ClientPayments.tsx`, `src/pages/client/ClientReports.tsx`, `src/pages/bum/BumReverseOpportunities.tsx`, `src/pages/bum/BumClaims.tsx`, `src/pages/Index.tsx`, and route/visual audit tests.
- Dependencies/risks: Legal should review `Claim` vs `Introduction Claim`, `Commission` vs `Revenue Share`, and use of `Bum` in agreements. Data/Product Ops should review CRM stage names before status enum changes. QA must update visible-label assertions in the same PR as copy changes. Ryan has also clarified that Opportunities, Reverse Opportunities, Customer Leads, target responses, and intro-request-like workflows should probably become one Opportunity workspace with origin and stage; do not accidentally cement old route names while doing the copy pass.
- Acceptance criteria: Client legal surfaces use `Client Agreement`; team surfaces use `Client Admin`, `Client Finance`, and `Client Member`; `/client/requests` stops using generic `Requests` as the umbrella for all marketplace objects; finance copy uses `Customer Payment Report` and `Commission Invoice Generator` without implying payment processing; route/visual audits pass with updated labels.
- Validation: Targeted unit/route tests for labels where present, route guard tests if navigation names change, and focused Playwright visual/interaction audit once authenticated QA is stable.

### P1 - Design unified Opportunity workspace before expanding opportunity-like routes
- Source: Ryan clarification on 2026-06-01; `docs/glossary-site-change-review.md`; `docs/product-ops-workflow-backlog.md`; current routes `src/pages/client/ClientOpportunityNew.tsx`, `src/pages/client/ClientRequests.tsx`, `src/pages/bum/BumOpportunities.tsx`, `src/pages/bum/BumReverseOpportunities.tsx`, `src/pages/bum/BumClaims.tsx`, and `src/pages/admin/AdminOpportunities.tsx`.
- Why now: The app currently has too many entry points for the same business concept. They are all Opportunities with different originators and stages, and each claimable Opportunity needs a route to create or review a Claim.
- Recommended fix: Before adding more route-specific opportunity workflows, define a canonical Opportunity workspace by role. Add `Opportunity Origin` and `Opportunity Stage` to the product model, keep `Claim` as the action attached to an Opportunity, and decide which current routes become filters, tabs, or redirects inside the unified workspace.
- Likely files/routes: `src/pages/client/ClientOpportunityNew.tsx`, `src/pages/client/ClientRequests.tsx`, `src/pages/bum/BumOpportunities.tsx`, `src/pages/bum/BumReverseOpportunities.tsx`, `src/pages/bum/BumClaims.tsx`, `src/pages/admin/AdminOpportunities.tsx`, `src/lib/portalApi.ts`, `docs/business-access-rules.md`, route/visual audit tests, and possibly migrations if the canonical model needs new origin/stage fields.
- Dependencies/risks: This is product architecture, not a copy-only change. Product Ops, Data, Security, Legal, QA, and UX should approve origin values, stage values, access rules, and migration strategy before implementation. Avoid destructive migrations until current records are mapped.
- Acceptance criteria: Product spec defines unified Opportunity object behavior, origin values, stage values, Claim creation rules, role visibility, and migration/compatibility plan; site navigation no longer exposes separate opportunity-like concepts where filters or tabs would be clearer; tests cover Client-Originated, Bum-Originated, and Customer-Originated Opportunities.
- Validation: Source-level route review, updated route/visual audits, targeted role smoke, and direct data-path access tests once implementation begins.

### P0 - Make profile bootstrap admin-approved and remove self-service authorization mutation
- Source: `docs/business-access-rules.md` Profile Bootstrap rule; live Supabase `profiles` RLS policies and grants on 2026-05-31; `src/contexts/AuthContext.tsx`; `src/components/SignupIntentDialog.tsx`; `src/lib/portalApi.ts`; Clerk metadata docs: `unsafeMetadata` can be changed from the frontend.
- Why now: Role, company, client access role, and Bum identity determine tenant boundaries. If client-controlled metadata can become authoritative profile state, RLS and route guards inherit a self-escalation path.
- Recommended fix: Treat signup metadata as onboarding intent only. Add an admin-approved server path for role/company/client-role/Bum assignment, restrict self-profile writes to agreed preference fields, and update bootstrap sync code so it cannot elevate authorization-bearing columns from Clerk `unsafeMetadata`.
- Likely files/routes: `src/contexts/AuthContext.tsx`, `src/components/SignupIntentDialog.tsx`, `src/lib/portalApi.ts`, `supabase/functions/clerk-user-tools`, `supabase/functions/sync-clerk-users`, a profile/RLS grant migration, `tests/e2e/authenticated-role-smoke.spec.ts`, and direct profile mutation tests.
- Dependencies/risks: Product has now defined the first implementation rules: first claimant of an unclaimed client business email domain may create the company and become initial Client Admin; Gmail/public-email company creation requires Admin review and alternate proof; later same-domain users require Client Admin approval or Admin override; Client Admins may manage same-company users, including disabling another Client Admin; related domains may be requested but require Admin review before access; safe self-service fields are display name, timezone, date format, and notification preferences. Roll out with a rollback plan for legitimate onboarding failures.
- Acceptance criteria: Users cannot change their own `role`, `is_admin`, `company_id`, `client_access_role`, or Bum assignment through browser sync, direct Supabase Data API, RPC, edge function, or Clerk `unsafeMetadata`; allowed preference edits still work; Admin can assign/repair access with audit evidence.
- Validation: Direct Supabase allow/deny tests for profile mutation; portal signup and admin repair tests; role smoke for Admin, Client Admin, Client Finance, Client Member, and Bum; live policy/grant recheck after migration.

### P0 - Make `send-website-email` internal-only and keep public intake on `submit-contact`
- Source: Live Supabase edge-function inventory/source on 2026-05-31; deployed `submit-contact` enforces origin checks, Turnstile Siteverify, abuse fingerprinting, and rate limits; deployed `send-website-email` remains `verify_jwt: false`, wildcard-CORS, and calls Microsoft Graph `sendMail` directly; `docs/business-access-rules.md` Public Contact rule; Cloudflare Turnstile server-side validation docs.
- Why now: This is a live sender-reputation and abuse path. Attackers can bypass the hardened intake function and directly trigger internal mail unless the mail function is restricted.
- Recommended fix: Require a server-only secret or verified internal caller for `send-website-email`, narrow CORS/origin behavior, and keep `submit-contact` as the only anonymous public form endpoint. Preserve one-notification-per-valid-submission behavior.
- Likely files/routes: `supabase/functions/send-website-email/index.ts`, `supabase/functions/submit-contact/index.ts`, `supabase/config.toml`, `src/lib/contactApi.ts`, homepage contact tests, Trust/Reputation docs.
- Dependencies/risks: Needs a safe production validation path that does not spam `bums@trustedbums.com`; coordinate with Trust & Reputation and Product Ops for rejected-submission handling.
- Acceptance criteria: Anonymous direct invocation of `send-website-email` is denied; valid homepage submissions through `submit-contact` still create one `contact_submissions` row and one intended notification; invalid Turnstile/origin/throttle cases do not send mail.
- Validation: Function-level allowed/denied tests; live function source/inventory recheck; safe invalid direct-call check; logs or admin UI evidence for one allowed and one denied case.

### P1 - Revoke broad Data API grants and move public `SECURITY DEFINER` helpers out of exposed RPC reach
- Source: Live SQL on 2026-05-31 shows broad `anon`/`authenticated` grants on `profiles`, `customer_targets`, `contact_submissions`, `performance_metric_events`, and `bum_saved_items`; live function ACLs show `anon`/`authenticated` execute on `public.admin_dashboard_summary()` and multiple `SECURITY DEFINER` RLS helpers; Supabase Data API exposure changelog and API security guidance.
- Why now: RLS is enabled, but the privilege surface is wider than the business contract. Broad grants and exposed privileged helpers turn future policy mistakes into higher-impact defects.
- Recommended fix: Revoke default public-schema table/function grants, regrant only intentional verbs per business rule, move RLS-only helper functions to a private schema or revoke direct execute, and serve admin summary data through an admin-verified server path.
- Likely files/routes: grant/policy migration, `supabase/migrations/20260529001000_add_admin_dashboard_summary.sql` successor, `src/lib/portalApi.ts`, `src/pages/admin/AdminDashboard.tsx`, `/admin/performance`, business-access tests.
- Dependencies/risks: Do not ship as blanket hardening. Use before/after role matrix, direct data-path tests, portal/API/extension tests, and rollback plan for legitimate-access breakage.
- Acceptance criteria: Non-admin and anonymous direct RPC calls to admin/internal helpers fail; public tables expose only intended verbs; admin dashboard/performance still works for Admin; Supabase advisor/catalog checks no longer flag externally callable internal helpers.
- Validation: Live grants/function ACL query, policy catalog query, positive/negative role tests, extension `/context` and `/page-captures` smoke once `QA_EXTENSION_API_TOKEN` exists.

### P1 - Stabilize authenticated QA and extension allow/deny proof
- Source: `docs/qa-test-backlog.md`; `tests/e2e/authenticated-role-smoke.spec.ts` failures in Clerk sign-in/post-auth settlement; `tests/e2e/portal-interaction-audit.spec.ts` false-positive `#main-content` failures; `tests/e2e/extension-api.spec.ts` skips authenticated checks without `QA_EXTENSION_API_TOKEN`; Playwright authentication docs recommend reusable storage state.
- Why now: The highest-risk changes above cannot be release-gated by flaky auth or skipped extension tests.
- Recommended fix: Move deployed auth setup to a Playwright setup project or worker-scoped storage-state flow, capture role-specific traces on auth failure, fix the skip-link assertion, document extension env vars in `.env.qa.example` and `scripts/verify-qa-env.mjs`, and seed two-company allow/deny fixtures.
- Likely files/routes: `tests/e2e/helpers/auth.ts`, `playwright.config.ts`, `tests/e2e/authenticated-role-smoke.spec.ts`, `tests/e2e/portal-interaction-audit.spec.ts`, `tests/e2e/extension-api.spec.ts`, `.env.qa.example`, `scripts/verify-qa-env.mjs`.
- Dependencies/risks: Requires Clerk dashboard/request-log visibility and `QA_EXTENSION_API_TOKEN`. Keep missing credentials as access blockers, not product defects.
- Acceptance criteria: Role smoke passes twice consecutively on Chromium; portal interaction audit reaches route/search/dialog assertions instead of failing valid skip links; extension smoke fails fast when env is missing and proves allowed/denied cases when present.
- Validation: `set -a; source .env.qa; set +a; pnpm run qa:env`; targeted Playwright suites; trace review for any remaining failures.

### P1 - Mature `/admin/handoffs` and cover it in route audits
- Source: `docs/ux-optimization-backlog.md`; updated `docs/product-ops-workflow-backlog.md`; `src/pages/admin/AdminHandoffs.tsx`; `src/lib/contactApi.ts`; `supabase/migrations/20260529181000_add_contact_abuse_and_handoff_fields.sql`; live counts for `customer_target_responses`, `contact_submissions`, and `client_bum_intro_requests`.
- Why now: The workspace now exists, but rescue effectiveness depends on visible urgency, ownership, next-step, and notification-health signals.
- Recommended fix: Surface `admin_next_action`, `admin_priority`, stale buckets, unowned counts, linked workflow, and `notification_error`; add `/admin/handoffs` to visual and interaction audits.
- Likely files/routes: `src/pages/admin/AdminHandoffs.tsx`, `src/lib/contactApi.ts`, `src/lib/portalApi.ts`, `tests/e2e/visual-ui-audit.spec.ts`, `tests/e2e/portal-interaction-audit.spec.ts`.
- Dependencies/risks: Depends on the QA auth stabilization above for reliable screenshot and interaction evidence.
- Acceptance criteria: Admins can identify fresh, stale, unowned, and failed-notification work without opening another page; route audits cover `/admin/handoffs`.
- Validation: Targeted component/source tests if added; visual audit screenshot for `/admin/handoffs`; admin route smoke after auth setup is stable.

### P2 - Patch runtime advisories and split the monolithic app bundle
- Source: `pnpm audit --prod --json` on 2026-05-31 reports `js-cookie` high via `@clerk/react` and `uuid` moderate via `@clerk/chrome-extension`; `package.json` still has `react-router-dom@^6.30.1` and `postcss@^8.5.6`; Performance backlog reports one `1,957.35 kB` JS chunk and static route imports in `src/App.tsx`.
- Why now: Dependency and startup-JS work is real, but it should follow live auth/mail/grant work because it is lower immediate trust-boundary risk.
- Recommended fix: Upgrade Clerk packages enough to clear `js-cookie` and `uuid`, keep extension compatibility in scope, patch React Router/PostCSS ranges, then route-split admin/client/Bum shells and lazy-load report-heavy leaves.
- Likely files/routes: `package.json`, lockfile, `src/App.tsx`, report pages, Chrome extension build/smoke files.
- Dependencies/risks: Clerk extension changes may affect Chrome extension auth. Route splitting needs stable auth smoke and React Router future-flag review.
- Acceptance criteria: `pnpm audit --prod` clears current runtime advisories or documents accepted residuals; production build no longer emits one monolithic app chunk above 500 kB minified; route smoke remains green.
- Validation: `pnpm audit --prod --json`; `pnpm run test`; `pnpm run build`; extension smoke; route guard tests.

## Fix Playbooks

Profile hardening should be split into three PRs: business-rule confirmation and tests, bootstrap/server-path change, then RLS/grant cleanup. Keep a documented rollback for onboarding and admin repair.

Public intake should be a small deploy: restrict `send-website-email`, verify `submit-contact` still works, then update Trust/Reputation evidence with one allowed and one denied case.

Data API and RPC cleanup should start with inventory-only SQL committed in the PR description, then a narrow migration per object family. Do not combine this with unrelated UI work.

QA stabilization should land before deeper RLS changes. Auth traces, skip-link fix, and extension env contract are prerequisites for credible release gates.

## Cross-Backlog Dependencies

- Security, Data, QA, and Product Ops should use the updated Profile Bootstrap business rule before profile/RLS hardening ships: domain-claim workspace creation, public-email manual verification, Client Admin same-company user management, Admin-reviewed related domains, pending/denied states, audit events, and Admin override for stale or invalid prior admins.
- Trust/Reputation and Security both point to the same public mail risk: `submit-contact` is hardened, but `send-website-email` remains directly public.
- Customer target access is closer to the intended rule, but saved-target-only visibility is still a Product Ops decision. Until clarified, saved-only target access should not be treated as an approved Bum entitlement.
- `/admin/performance`, `performance_metric_events`, and `admin_dashboard_summary()` are one admin-only observability boundary and need route plus direct data-path deny tests.
- UX/UI/Accessibility contact-form recommendations should be bundled with public-intake validation so inline errors, Turnstile state, and trust copy match the server-side abuse path.

## Consultant Quality And Access Audit

- UX, UI, Content, Accessibility, QA, Security, Performance, Data, Product Ops, and Trust backlogs were reviewed. Most roles now cite concrete files, tests, screenshots, or live checks.
- Security and Data met the expected senior-consultant bar by using live Supabase SQL/advisor-style evidence and mapping findings to business rules. Lead revalidated the key SQL/catalog findings directly in this run.
- QA correctly separated credential/tooling blockers from product defects and identified the deterministic skip-link test bug. It still needs Clerk logs and extension token access.
- Product Ops required lead correction: its older queue recommendation was stale because `/admin/handoffs` already exists. The backlog now focuses on queue maturity and access-rule ownership.
- Performance had live telemetry and build evidence, but still lacks query plans, `pg_stat_statements`, and network/Lighthouse artifacts. Recommendations remain valid but should not outrank live auth/mail/grant risk.
- Trust/Reputation used appropriate current public checks and vendor sources. Dashboard-only checks for Search Console, SmartScreen/Defender, DNS control plane, and DMARC mailbox review remain access gaps.

## Team Rule Updates

- Updated `docs/consultant-team-rules.md` to require specialists to reconcile carried-forward recommendations against current routes, source files, and recent commits before preserving active items.
- Updated `docs/consultant-access-needs.md` to reflect this run's actual Supabase access: SQL, policy catalog, grants/function ACLs, edge-function inventory/source, and safe aggregates were callable; dedicated advisor/log tools were not.
- Updated `docs/product-ops-workflow-backlog.md` because the prior Product Ops queue item was stale now that `/admin/handoffs` exists.
- No lead-level changes were needed in `docs/business-access-rules.md` or `docs/trust-reputation-backlog.md`; their current release gates already cover this queue.
- Publication status: scoped documentation update committed and pushed during this run. Other specialist docs were reviewed as inputs but not staged by this lead handoff.

## Agent Inputs

- Date of run: 2026-05-31.
- Specialist backlog files reviewed: `docs/ux-optimization-backlog.md`, `docs/ui-optimization-backlog.md`, `docs/content-copyeditor-backlog.md`, `docs/accessibility-backlog.md`, `docs/qa-test-backlog.md`, `docs/security-review-backlog.md`, `docs/performance-engineering-backlog.md`, `docs/data-analytics-backlog.md`, `docs/product-ops-workflow-backlog.md`, and `docs/trust-reputation-backlog.md`.
- Files, tests, routes, and docs reviewed: `docs/consultant-team-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, `docs/lead-developer-recommendations.md`, `package.json`, `public/.htaccess`, `src/App.tsx`, `src/pages/admin/AdminHandoffs.tsx`, `src/pages/Index.tsx`, `src/components/SignupIntentDialog.tsx`, `src/contexts/AuthContext.tsx`, `src/lib/contactApi.ts`, `src/lib/portalApi.ts`, `src/components/ui/sidebar.tsx`, `tests/e2e/authenticated-role-smoke.spec.ts`, `tests/e2e/extension-api.spec.ts`, `tests/e2e/portal-interaction-audit.spec.ts`, `tests/e2e/visual-ui-audit.spec.ts`, Supabase functions `submit-contact`, `send-website-email`, and `extension-api-v1`, and relevant migrations for profiles, customer targets, contacts, telemetry, admin summary, extension captures, and Bum contacts.
- Supabase MCP/connector checks: `_get_project`, `_list_edge_functions`, `_get_edge_function` for `submit-contact` and `send-website-email`, read-only `_execute_sql` for watched table RLS flags, policy catalog, table grants, function ACLs, and safe aggregate counts. Project `vaoqvtxqvbptyxddpoju` is `ACTIVE_HEALTHY` on Postgres 17.6.1.
- Commands/checks run: `git status --short`, `git diff --name-only`, `rg`, `sed`, `set -a; source .env.qa; set +a; pnpm run qa:env`, `pnpm exec vitest run src/test/routeGuards.test.tsx src/test/extensionApiContract.test.ts src/test/paymentCommission.test.ts`, `pnpm audit --prod --json`, DNS TXT/MX/A checks with `dig`, and `curl -I -L` checks for `https://trustedbums.com`, `https://www.trustedbums.com`, `robots.txt`, and `sitemap.xml`.
- Internet sources reviewed: [Clerk user metadata docs](https://clerk.com/docs/users/user-metadata), [Cloudflare Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Supabase Data API exposure changelog](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically), [Playwright authentication docs](https://playwright.dev/docs/auth), plus specialist-cited W3C, OWASP, web.dev, Microsoft, Google, MDN, and email/security-header sources.
- Checks that could not run and why: Dedicated Supabase advisor/log tools were not exposed as callable tools in this lead session; authenticated Playwright suites were not rerun because QA already identified Clerk sign-in instability and missing extension token; no Search Console, Bing Webmaster, SmartScreen/Defender, DNS/hosting dashboard, DMARC mailbox review, CI/flaky-test history, Clerk dashboard logs, query plans, `pg_stat_statements`, Lighthouse artifacts, support/CRM exports, finance exception samples, or design-system sources were available.
