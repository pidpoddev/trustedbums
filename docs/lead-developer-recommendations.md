# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-05-31 by Codex daily lead developer automation._

## Executive Read

Today's queue should start with two P0 trust-boundary fixes and one release-gate clarification. Security's live May 31 evidence shows profile bootstrap still lets client-controlled Clerk `unsafeMetadata` influence role/company posture, while live `profiles` policy/grants reportedly still allow self-updates that do not pin `company_id` or `client_access_role`. The business rule for profile bootstrap was missing before this run; it is now documented as a release gate in `docs/business-access-rules.md`.

The public contact path has improved but is not closed. Live Supabase function inventory confirms `submit-contact` is deployed and enforces Turnstile, origin allowlisting, abuse fingerprinting, and rate limits before writing `contact_submissions`; however `send-website-email` is still deployed with `verify_jwt: false`, wildcard CORS, and direct Microsoft Graph `sendMail`. That direct public mail-send function remains the highest-confidence trust/reputation abuse risk.

The next implementation tier is now clearer: remove exposed `SECURITY DEFINER`/Data API surfaces that exceed the business contract, stabilize authenticated QA so role/access gates can be trusted, split Client Finance exports away from operational target/meeting data, and reduce the monolithic app bundle plus client-route whole-list fetching. Production checks from this run confirm `trustedbums.com` is reachable, `www` still does not redirect to apex, crawler files serve as text/XML, DMARC remains `p=none`, and production responses still omit HSTS/security headers.

## Recommended Implementation Queue

### P0 - Lock profile bootstrap behind admin-approved identity rules
- Source: `docs/security-review-backlog.md` P0; new `docs/business-access-rules.md` Profile Bootstrap rule; `src/contexts/AuthContext.tsx`; `src/components/SignupIntentDialog.tsx`; `src/lib/portalApi.ts`; `supabase/migrations/20260516223000_align_user_id_schema_with_clerk.sql`; `supabase/migrations/20260519190611_allow_profile_sync_updates.sql`; Clerk metadata guidance says `unsafeMetadata` can be modified from the frontend; Supabase Data API guidance says grants and RLS both control exposed access.
- Why now: Role, company, client access role, and Bum identity are authorization facts. If client-controlled signup metadata can become authoritative, downstream RLS, route guards, exports, extension API, and profile policies inherit tenant-isolation risk.
- Recommended fix: Treat Clerk signup metadata as advisory. Add an audited admin/server path for authoritative `role`, `company_id`, `client_access_role`, `is_admin`, and Bum assignment. Restrict self-service profile writes to approved preference fields only. Revise profile sync so it cannot elevate role or company from browser-controlled state.
- Likely files/routes: `src/contexts/AuthContext.tsx`, `src/components/SignupIntentDialog.tsx`, `src/lib/portalApi.ts`, admin user/troubleshooting tools, profile RLS/grant migration, `tests/e2e/authenticated-role-smoke.spec.ts`, extension/profile allow-deny tests.
- Dependencies/risks: Product/Security must confirm whether first-time client signup can create a workspace automatically and which profile fields are self-editable. Roll out with a rollback plan that restores legitimate onboarding if admin assignment breaks.
- Acceptance criteria: Users cannot mutate `role`, `is_admin`, `company_id`, `client_access_role`, or Bum identity through Clerk `unsafeMetadata`, browser sync, direct Data API, RPC, edge function, or extension API; safe preference edits still work; Admin assignment/repair works and is audited.
- Validation: Direct data-path deny tests for profile mutations; portal signup/onboarding smoke; admin repair smoke; extension and route-guard regression; Supabase SQL/catalog policy and grant inspection; rollback test for a legitimate new client and Bum account.

### P0 - Make direct website mail-send internal-only
- Source: `docs/security-review-backlog.md` P0; `docs/trust-reputation-backlog.md` P0; `docs/business-access-rules.md` Public Contact rule; live Supabase function inventory/source for `submit-contact` and `send-website-email`; `src/lib/contactApi.ts`; Cloudflare Turnstile server-side validation guidance; Google sender guidance.
- Why now: The intended public intake path is hardened, but attackers can still bypass it by invoking `send-website-email` directly. That can flood `bums@trustedbums.com`, harm sender reputation, and trigger browser/email-gateway distrust on a young B2B domain.
- Recommended fix: Keep `submit-contact` public and make `send-website-email` callable only by trusted server-side callers. Require an internal secret or verified service path, restrict CORS/origin as appropriate, and preserve the valid `submit-contact -> notification` workflow.
- Likely files/routes: `supabase/functions/send-website-email/index.ts`, `supabase/functions/submit-contact/index.ts`, `supabase/config.toml`, deployment secrets by variable name, public contact form tests.
- Dependencies/risks: Must not break legitimate homepage submissions. Use a staged function deployment, verify one valid submit and one denied direct invoke, and keep a rollback plan that temporarily disables notification send while preserving intake records if mail breaks.
- Acceptance criteria: Anonymous direct `send-website-email` POST is denied; valid homepage contact submission still stores one `contact_submissions` row and sends at most one internal notification; blocked attempts are visible in logs without dumping private data.
- Validation: Supabase function source/inventory after deploy; safe direct anonymous deny check; valid non-production submit; edge-function logs; Microsoft 365 sender dashboard if available; Trust & Reputation recheck.

### P1 - Revoke exposed RPC/function and broad Data API privileges to match business rules
- Source: `docs/security-review-backlog.md` P1; `docs/data-analytics-backlog.md` P1; `docs/business-access-rules.md` Performance Telemetry and Admin Observability rule; `src/lib/portalApi.ts` browser RPC call to `admin_dashboard_summary`; `supabase/migrations/20260529001000_add_admin_dashboard_summary.sql`; Supabase security-definer and API security guidance; live specialist SQL/advisor evidence from May 31.
- Why now: Route guards say `/admin` and `/admin/performance` are admin-only, but live specialist evidence says public/exposed RPC and broad grants still exceed that contract. This makes future RLS mistakes easier to turn into real data exposure.
- Recommended fix: Move RLS-only helpers to a private schema or revoke `EXECUTE` from `anon`, `authenticated`, and `PUBLIC` where direct RPC is not a product API. Serve admin summary through an explicitly admin-authorized server path. Revoke default broad grants and regrant only exact verbs on public surfaces.
- Likely files/routes: migrations for helper schema/grants, `src/lib/portalApi.ts`, admin dashboard summary path, `performance_metric_events`, `profiles`, `contact_submissions`, `customer_targets`, helper functions.
- Dependencies/risks: Needs a before/after role matrix and direct data-path tests. Do not tighten grants blindly; prove admin dashboards, profile preferences, contact intake, extension API, and telemetry still work.
- Acceptance criteria: Supabase advisors no longer flag externally callable admin/internal `SECURITY DEFINER` helpers; anon and non-admin direct RPC calls fail; public tables expose only intended verbs; admin screens still load.
- Validation: Supabase security advisors and SQL catalog checks; direct RPC allow/deny tests; portal admin/non-admin smoke; extension API smoke; rollback migration that restores prior grants only if legitimate access breaks.

### P1 - Stabilize authenticated QA and extension allow/deny coverage before access hardening ships
- Source: `docs/qa-test-backlog.md` P0/P1; `docs/consultant-access-needs.md`; `tests/e2e/authenticated-role-smoke.spec.ts`; `tests/e2e/portal-interaction-audit.spec.ts`; `tests/e2e/extension-api.spec.ts`; Playwright authentication guidance.
- Why now: Profile, grant, export, and extension hardening all need trustworthy role evidence. Current authenticated smoke failed 4 of 5 Chromium checks on May 31, portal interaction audit still fails on a false-positive `#main-content` skip-link check, and authenticated extension coverage skips because `QA_EXTENSION_API_TOKEN` is missing.
- Recommended fix: Add a Playwright setup/storageState flow or worker-scoped auth fixture per role, preserve auth-failure traces, fix the skip-link assertion to allow valid in-page anchors, and add extension env-contract checks in `.env.qa.example` plus `scripts/verify-qa-env.mjs`.
- Likely files/routes: `playwright.config.ts`, `tests/e2e/helpers/auth.ts`, `tests/e2e/authenticated-role-smoke.spec.ts`, `tests/e2e/portal-interaction-audit.spec.ts`, `tests/e2e/extension-api.spec.ts`, `.env.qa.example`, `scripts/verify-qa-env.mjs`.
- Dependencies/risks: Needs confirmed QA accounts, Clerk logs for failed sign-ins, `QA_EXTENSION_API_TOKEN`, and seeded two-company fixtures. Do not make role smoke a release gate until it can pass twice consecutively.
- Acceptance criteria: Admin, Client Admin, Client Finance, Client Member, and Bum smoke each pass twice on Chromium; portal interaction audit reaches route/search assertions instead of failing on valid skip links; extension smoke proves own-company allow, foreign-company deny, Bum accepted-opportunity allow, Bum target deny, and `/page-captures` authorization.
- Validation: `set -a; source .env.qa; set +a; pnpm run qa:env`; targeted Playwright role smoke; portal interaction audit; extension API smoke; trace artifacts on failure.

### P1 - Split finance-safe exports from operational client exports
- Source: `docs/data-analytics-backlog.md` P1; `docs/content-copyeditor-backlog.md` role naming; `docs/business-access-rules.md` Payments/Reports rule; `src/App.tsx`; `src/layouts/ClientLayout.tsx`; `src/pages/client/ClientExports.tsx`; `tests/e2e/authenticated-role-smoke.spec.ts`.
- Why now: `CLIENT_FINANCE` can reach `/client/exports`, and that page exports target contact emails, meeting attendee lists, Teams join URLs, and transcript sync status alongside finance data. The business rule grants finance/report access, not broad operational target or meeting context.
- Recommended fix: Split finance exports from operational exports, or gate target/meeting exports to Client Admin while leaving payment/invoice exports available to Client Finance. Update labels so the route no longer implies all exports are finance-safe.
- Likely files/routes: `src/pages/client/ClientExports.tsx`, `src/App.tsx`, `src/layouts/ClientLayout.tsx`, `src/pages/client/ClientDashboard.tsx`, route/visual/auth smoke specs, possible data helpers.
- Dependencies/risks: Product must decide whether Client Finance ever gets case-by-case operational context. If yes, model it as explicit case participation or finance-note surface rather than broad CSV access.
- Acceptance criteria: Client Finance can export payment/invoice data without target emails, meeting attendees, join URLs, transcript metadata, or unrelated operational details; Client Admin retains operational exports; tests cover each export type by client access role.
- Validation: Client Admin and Client Finance route smoke; CSV content assertions; direct data-helper review; business-access allow/deny matrix.

### P1 - Reduce authenticated client-route load by route-splitting and server-side data shaping
- Source: `docs/performance-engineering-backlog.md` P0/P1; `pnpm run build` on 2026-05-31; `src/App.tsx`; `src/components/PortalGlobalSearch.tsx`; `src/pages/client/ClientDashboard.tsx`; `src/pages/client/ClientTargets.tsx`; `src/pages/client/ClientPayments.tsx`; web.dev LCP guidance; React Router future-flag guidance.
- Why now: The current build still emits one `1,957.35 kB` JS chunk (`512.39 kB` gzip), and live telemetry shows poor client-route LCP hotspots, led by `/client/trainings`, `/client/bum-directory`, `/client/targets`, `/client/dashboard`, and `/client/payments`.
- Recommended fix: First route-split admin, client, Bum, reports, and troubleshooting leaves with module-scope `React.lazy` and `Suspense`. Then replace client dashboard/table/search whole-list fetches with scoped summaries, server filtering, page limits, and explicit typed search.
- Likely files/routes: `src/App.tsx`, reports pages, `src/components/reports/ReportsWorkspace.tsx`, `src/components/PortalGlobalSearch.tsx`, client dashboard/targets/payments/trainings/Bum directory helpers, query/index migrations after query-plan evidence.
- Dependencies/risks: Authenticated smoke must be stable enough to catch lazy-route regressions. Keep RLS/grant changes separate from query-shape changes unless tests cover both.
- Acceptance criteria: Build no longer emits one monolithic app chunk; no emitted JS chunk exceeds the current 500 kB warning threshold; opening search without a query does not preload broad datasets; client dashboard, targets, and payments fetch scoped/paginated data.
- Validation: `pnpm run build`; bundle diff; client/admin/Bum smoke after QA fix; RUM comparison; Supabase query plans and performance advisors when SQL/advisor access is available.

## Fix Playbooks

### Access bootstrap package
- Add the Product-approved profile bootstrap matrix first.
- Implement profile self-write restrictions and admin repair path together.
- Validate with direct profile mutation denies before touching broader table grants.

### Public trust package
- Make `send-website-email` internal-only before host metadata, HSTS, or DMARC polish.
- Then ship canonical `www -> apex`, absolute route metadata, and HSTS/security headers as a separate public-site hardening patch.

### Supabase exposure package
- Inventory function grants and exposed tables with live SQL/advisors.
- Move or revoke internal helpers before broad grant cleanup.
- Keep a rollback migration for legitimate-access breakage and run portal/API/extension allow/deny checks after every revoke.

### QA release-gate package
- Fix deterministic auth and skip-link false positive first.
- Add extension env contract and seeded fixtures next.
- Only then use authenticated smoke as a release gate for RLS/grant/profile/export changes.

### Performance package
- Land route-level lazy loading before manual chunk tuning.
- Follow with route-scoped summaries and server-side filters on client hotspots.
- Use RUM and query-plan evidence to choose database indexes rather than applying every advisor item at once.

## Cross-Backlog Dependencies

- Profile bootstrap links Security, Product Ops, QA, and Business Access. No RLS hardening should ship until the new business rule has product confirmation, a before/after role matrix, direct data-path tests, portal tests, and rollback plan.
- Public contact, Trust, Security, Product Ops, and Content all converge on one path: `submit-contact` must be the only public intake, and Admins must still receive queueable legitimate submissions after direct mail-send is closed.
- Extension captures and Bum represented contacts need Product Ops rules before Security or UX expands client visibility. Raw selected text, source URLs, and notes should stay Bum/Admin scoped until explicitly converted.
- Client Finance export cleanup depends on Data, Content, QA, and Business Access agreeing on which columns are finance-safe versus operational.
- Performance work depends on QA stability because lazy routes and server-side filtering affect every authenticated shell.
- Product Ops backlog was stale and has been refreshed. Future specialist runs should verify shipped routes before repeating "add route" recommendations.

## Consultant Quality And Access Audit

- UX: Current and evidence-backed. Used code, tests, screenshots, and W3C/GOV.UK/USWDS guidance. Remaining gap is behavioral analytics and full authenticated mobile evidence.
- UI: Current and strong on visual evidence for desktop portal/public mobile. Correctly flags lack of authenticated mobile screenshots and design-system baselines.
- Content: Current and implementation-ready on taxonomy drift. Still needs approved sales/legal/support terminology before final product-language decisions.
- Accessibility: Current and appropriately separates code-backed issues from missing axe/screen-reader proof. Good catch on valid skip links being misclassified by QA.
- QA/Test: Current, but missed explicit profile-bootstrap coverage until this run. Added profile bootstrap to Business Access Coverage.
- Security: Strongest specialist evidence this run. Used live Supabase SQL/advisors/functions and current sources. Recommendations survive senior scrutiny, but implementation must still wait for product-owned bootstrap and saved-target decisions.
- Performance: Strong current evidence: build, lint/test, live RUM aggregates, advisors, and source hotspots. Still lacks query plans, `pg_stat_statements`, Lighthouse/network traces, and multi-role performance walkthroughs.
- Data/Analytics: Strong on finance date semantics, export scope, admin RPC exposure, email analytics, and telemetry attribution. Needs broader finance fixtures and live browser role proof.
- Product Ops: Prior backlog was stale relative to shipped `/admin/handoffs`. Refreshed it to focus on owner/aging/next-action, profile bootstrap ownership, capture/contact operating rules, and finance/transcript exceptions.
- Trust/Reputation: Current and high-signal. Correctly prioritized direct mail-send exposure, DMARC enforcement, canonical metadata, and security headers. Needs dashboard-level reputation/Search Console/SmartScreen/postmaster evidence.
- Lead Developer: This run used local source, tests, build, audit, Supabase project/function inventory/source, DNS/HTTP checks, and current web guidance. Lead Supabase connector access was partial because SQL/advisors/log tools were not callable in this session.

## Team Rule Updates

- Updated `docs/consultant-team-rules.md` to require Product Ops to refresh shipped workflow recommendations before handoff, define access rules for profile/bootstrap/capture/contact workflows, and require Data to separate finance-safe exports from operational context.
- Updated `docs/business-access-rules.md` with `Profile Bootstrap And Self-Editable Identity` and `Extension Page Captures And Bum Represented Contacts`; also clarified saved-target ambiguity and Client Finance export denial boundaries.
- Updated `docs/consultant-access-needs.md` to record partial Supabase connector coverage in this lead run and to note that profile-bootstrap business rules now exist but still need product/security confirmation.
- Updated `docs/qa-test-backlog.md` to add profile bootstrap/self-editable identity to Business Access Coverage.
- Updated `docs/product-ops-workflow-backlog.md` because the prior P0 still asked for an admin handoff route that now exists.
- `docs/trust-reputation-backlog.md` was reviewed and did not need lead-level edits; its public mail-send, host, metadata, DMARC, and header priorities remain current.
- Publication status: scoped documentation/process updates were validated and published to the current branch in a documentation-only commit during this run.

## Agent Inputs

- Date of run: 2026-05-31.
- Specialist backlog files reviewed: `docs/ux-optimization-backlog.md`, `docs/ui-optimization-backlog.md`, `docs/content-copyeditor-backlog.md`, `docs/accessibility-backlog.md`, `docs/qa-test-backlog.md`, `docs/security-review-backlog.md`, `docs/performance-engineering-backlog.md`, `docs/data-analytics-backlog.md`, `docs/product-ops-workflow-backlog.md`, `docs/trust-reputation-backlog.md`.
- Files and routes reviewed: `docs/consultant-team-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, `docs/lead-developer-recommendations.md`, `package.json`, `.env.qa.example`, `scripts/verify-qa-env.mjs`, `playwright.config.ts`, `vitest.config.ts`, `src/App.tsx`, `src/contexts/AuthContext.tsx`, `src/components/SignupIntentDialog.tsx`, `src/components/ConsentManager.tsx`, `src/components/ClientAccessRoute.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/pages/Index.tsx`, `src/pages/admin/AdminHandoffs.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/bum/BumContactDetail.tsx`, `src/lib/contactApi.ts`, `src/lib/portalApi.ts`, relevant `tests/e2e/*.spec.ts`, relevant `src/test/*.test.ts*`, `supabase/config.toml`, `supabase/functions/submit-contact/index.ts`, `supabase/functions/send-website-email/index.ts`, `supabase/functions/extension-api-v1/index.ts`, `supabase/functions/portal-contacts/index.ts`, `supabase/migrations/20260516223000_align_user_id_schema_with_clerk.sql`, `supabase/migrations/20260519190611_allow_profile_sync_updates.sql`, `supabase/migrations/20260525160000_add_extension_api_page_captures.sql`, `supabase/migrations/20260526223000_add_bum_contacts.sql`, `supabase/migrations/20260529001000_add_admin_dashboard_summary.sql`, `supabase/migrations/20260529023000_add_performance_metric_events.sql`, `supabase/migrations/20260529180000_restrict_bum_customer_target_reads.sql`, and `supabase/migrations/20260529181000_add_contact_abuse_and_handoff_fields.sql`.
- Commands and checks reviewed: `git status --short`, `git log --oneline -n 12`, `git diff --stat`, `rg`, `sed`, `set -a; source .env.qa; set +a; pnpm run qa:env`, `pnpm audit --prod --json`, `pnpm run lint`, `pnpm run test`, `pnpm run build`, `curl -I -L --max-time 20` for `https://trustedbums.com`, `https://www.trustedbums.com`, `http://trustedbums.com`, `https://trustedbums.com/robots.txt`, and `https://trustedbums.com/sitemap.xml`, plus `dig +short @1.1.1.1` for A, MX, SPF, DMARC, DKIM selectors, and BIMI.
- Validation outcome: `qa:env` passed after exporting `.env.qa`; `pnpm run lint` passed with 7 existing React Hook dependency warnings; `pnpm run test` passed 24 tests across 6 files; `pnpm run build` passed and emitted the existing `1,957.35 kB` minified / `512.39 kB` gzip JS chunk warning; `pnpm audit --prod --json` failed with runtime advisories for `js-cookie` high (`GHSA-qjx8-664m-686j`, patched `>=3.0.6`) and `uuid` moderate (`GHSA-w5hq-g745-h8pq`, patched `>=11.1.1`).
- Supabase connector reviewed: project `vaoqvtxqvbptyxddpoju` is `ACTIVE_HEALTHY` on Postgres 17; live edge-function inventory and deployed source were reviewed for `submit-contact`, `send-website-email`, and `extension-api-v1`. The lead session did not expose callable SQL, advisor, catalog, storage, or log tools, so live policy/grant/advisor conclusions here rely on specialist evidence plus source review.
- Public trust checks reviewed: apex HTTPS returns `200`; `www` HTTPS also returns `200` instead of redirecting; HTTP apex redirects to HTTPS; `robots.txt` returns `text/plain`; `sitemap.xml` returns `application/xml`; production headers still omit HSTS/security headers in checked responses; A record resolves to `208.97.186.234`; MX points to Microsoft 365; SPF and DKIM selector CNAMEs exist; DMARC remains `p=none`; no BIMI TXT was returned.
- Current internet sources reviewed: [Supabase Securing your API](https://supabase.com/docs/guides/api/securing-your-api), [Supabase Data API exposure changelog](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically), [Supabase security-definer guidance](https://supabase.com/docs/guides/troubleshooting/do-i-need-to-expose-security-definer-functions-in-row-level-security-policies-iI0uOw), [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security), [Clerk user metadata](https://clerk.com/docs/users/metadata), [Cloudflare Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Google email sender guidelines](https://support.google.com/a/answer/81126?hl=en-EN), [MDN HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security), [W3C WCAG 2.2 overview](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/), [W3C Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [Playwright Authentication](https://playwright.dev/docs/auth), [React Router future flags](https://reactrouter.com/v6/upgrading/future), [Vite releases](https://vite.dev/releases), [web.dev LCP](https://web.dev/articles/lcp?hl=en), and [web.dev SPA Core Web Vitals FAQ](https://web.dev/articles/vitals-spa-faq).
- Checks that could not run and why: no Supabase SQL/advisor/log/catalog validation was callable in this lead session; no Search Console, Safe Browsing owner dashboard, Bing Webmaster, SmartScreen/Defender, DNS/hosting control plane, postmaster, Microsoft 365 sender dashboard, Clerk dashboard/logs, CI/flaky-test/deploy history, support/CRM/finance samples, screen-reader notes, query plans, `pg_stat_statements`, Lighthouse artifacts, or authenticated Playwright reruns were available in this run.
