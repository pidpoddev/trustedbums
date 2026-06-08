# Trusted Bums Codex Edit Log

_Last updated: 2026-06-08 by Codex._

This file is the running handoff log for implementation work Codex has made in this repo. Specialist agents should read it before preserving backlog items so they can recheck shipped changes, downgrade stale recommendations, and add only the remaining gaps.

## Log Protocol

- Append a new dated entry after every Codex implementation or pushed handoff.
- Include the commit or branch when available, the user request, the files or surfaces changed, checks run, and specialist agents that should recheck the work.
- Do not paste secrets, raw private data, credential values, or mailbox contents.
- If a pushed commit included pre-existing dirty files outside the current implementation scope, call that out instead of implying Codex authored every line.

## Additional Agent Recheck Requests

### 2026-06-08 - Refresh hosted auth/bootstrap evidence after helper fix

- Trigger: Trusted Bums daily QA Test Engineer automation rechecked the newest GitHub-hosted QA and E2E evidence before finalizing recommendations.
- Implementation branch: `main`.
- What changed: Refreshed `docs/qa-test-backlog.md` to replace the earlier harness-first-only narrative with the newer cross-role hosted bootstrap regression and the later `8fa0796` helper-fix evidence, updated `docs/qa-harness-reliability-backlog.md` so the client-only preflight miss stays in the harness bucket while current-head verification is tracked by shard, rewrote `docs/release-verification-backlog.md` with a current `NO-GO` decision driven by the extension-token evidence gap, corrected `docs/lead-developer-recommendations.md` so the bootstrap work is a release watch item rather than active implementation, and updated `docs/consultant-access-needs.md` to request live Clerk or profile-bootstrap logs only if future current-head coverage repeats the failure.
- Main surfaces changed: `docs/qa-test-backlog.md`, `docs/qa-harness-reliability-backlog.md`, `docs/release-verification-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`.
- Checks run: `corepack pnpm run qa`; raw and sourced `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:target-preflight`; `corepack pnpm exec vitest run src/test/customerTargetRules.test.ts src/test/accessBoundaryRegression.test.ts src/test/serviceRoleAuthorization.test.ts`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 8 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27110216996 --json jobs`; `/Users/macdaddy/bin/gh-trustedbums run view 27110329150 --json jobs`; and `/Users/macdaddy/bin/gh-trustedbums api repos/Pidpoddev/trustedbums/actions/jobs/.../logs` for jobs `80006872202`, `80006872204`, and `80006869183`.
- Results: Local QA remained green. Hosted `Visual UI Audit` and `QA` remained green. Earlier `E2E Smoke` run `27109958355` stayed green and `27110095517` still looked like a client-only preflight miss, but later June 8 runs showed broader authenticated failures: `27110216996` failed completed admin and Bum deep-role jobs, and `27110329150` failed the smoke job itself with 13 redirects back to `/login` showing `Unable to bootstrap this profile.` After the `8fa0796` Supabase helper fix, local hosted role smoke passed all five roles and current-head GitHub `E2E Smoke` run `27110757594` passed smoke plus `Deep QA (admin|client|bum)`.
- Recheck agents: Lead Developer, Release Verification Agent, QA/Test Engineer, QA Harness Reliability Agent, Consultant Access Needs.
- Next run should verify: whether `QA_EXTENSION_API_TOKEN` can finally unblock authenticated extension coverage, then continue seeded access-boundary proof.

### 2026-06-08 - Recheck QA evidence after hosted preflight flake classification

- Trigger: Trusted Bums daily QA Test Engineer automation reviewed the latest scrum outputs, specialist backlogs, changed docs, local QA contract, and GitHub QA/E2E/visual/deep evidence.
- Implementation branch: `main`.
- What changed: Refreshed `docs/qa-test-backlog.md` with current June 8 local and GitHub evidence, added explicit Cross-Agent Follow-Ups, downgraded the latest hosted `Deep QA (client)` miss to a harness-first preflight issue instead of a fresh product defect, refreshed `docs/qa-harness-reliability-backlog.md` with the new run-id evidence and requested action, and corrected stale access-state claims in `docs/consultant-access-needs.md` around `.env.qa`, `trustedbums.com` reachability, and the extension env contract.
- Main surfaces changed: `docs/qa-test-backlog.md`, `docs/qa-harness-reliability-backlog.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`.
- Checks run: `corepack pnpm run qa`; raw and sourced `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:target-preflight`; `corepack pnpm exec vitest run src/test/customerTargetRules.test.ts src/test/accessBoundaryRegression.test.ts src/test/serviceRoleAuthorization.test.ts`; `gh run list` for `QA`, `E2E Smoke`, `Visual UI Audit`, and `Deep QA Hotfix Audit`; `gh run view 27109958355`; `gh run view 27110095517`; `gh run view 27110095517 --job 80006521915 --log-failed`; and `gh run download` for runs `27110095517` and `27083467531`.
- Results: Local QA passed. Latest completed GitHub QA runs passed. Latest completed GitHub visual run passed. Latest completed GitHub E2E evidence is mixed: run `27109958355` passed smoke plus all three deep shards, while run `27110095517` failed only the client deep shard during hosted preflight.
- Recheck agents: QA/Test Engineer, QA Harness Reliability Agent, Release Verification Agent, Product Ops Workflow Analyst, Security Engineer, Lead Developer.
- Next run should verify: whether `QA_EXTENSION_API_TOKEN` is finally available and whether extension, client-team, telemetry, and represented-contact allow/deny proof can move from source-backed to fixture-backed evidence. The later `27110757594` E2E run superseded the hosted auth/bootstrap rerun question by passing smoke plus all three Deep QA shards.

### 2026-06-08 - Recheck private-schema RLS helper cleanup

- Trigger: Ryan asked to continue completing recommended scrum items with QA and release verification between tasks.
- Implementation branch: `main`.
- What changed: Added migration `20260608013000_move_rls_helpers_to_private_schema.sql` after live Supabase advisors showed the RLS helper functions were again exposed as public and signed-in security-definer RPCs. The migration moves `can_add_conversation_participant`, `company_has_customer_targets`, `conversation_company_id`, `current_company_id`, `is_admin`, `is_bum`, and `is_conversation_participant` into the `private` schema while preserving `anon`/`authenticated` execute grants needed for policy evaluation. Hosted role smoke then exposed lingering `public.is_admin()` references in policy/function text, so migration `20260608013500_qualify_private_rls_helper_references.sql` qualifies policies and dependent functions to `private.*`. Updated helper-security regression coverage and handoff docs.
- Main surfaces changed: `supabase/migrations/20260608013000_move_rls_helpers_to_private_schema.sql`, `supabase/migrations/20260608013500_qualify_private_rls_helper_references.sql`, `src/test/supabaseHelperSecurity.test.ts`, `docs/security-review-backlog.md`, `docs/qa-test-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/codex-edit-log.md`.
- Checks run: Supabase MCP live migration apply for both migrations; Supabase MCP security advisor rerun; Supabase MCP function-schema query; `corepack pnpm exec vitest run src/test/supabaseHelperSecurity.test.ts`; `corepack pnpm run qa`; hosted `corepack pnpm exec playwright test tests/e2e/authenticated-role-smoke.spec.ts --project=chromium` after sourcing `.env.qa`.
- Results: initial hosted role smoke failed with `Unable to bootstrap this profile` and Postgres logs showed `function public.is_admin() does not exist`; the qualifying migration fixed that regression. Final hosted authenticated role smoke passed all five roles. Refreshed live security advisors now report only `auth_leaked_password_protection`; the seven helper functions now exist in `private` and no matching `public` helper functions remain. Full local QA passed lint, 73 tests across 23 files, and production build.
- Recheck agents: Security Engineer, QA/Test Engineer, Lead Developer.
- Next run should verify: hosted authenticated role smoke still passes after the private-schema move, and leaked-password protection is enabled through the approved Supabase Auth setting path.

### 2026-06-08 - Recheck customer-target behavior coverage

- Trigger: Ryan asked to complete recommended tasks one at a time with QA and release verification between tasks.
- Implementation branch: `main`.
- What changed: Replaced the regex/source-string `createCustomerTarget()` test with behavior-level coverage. The test now calls `createCustomerTarget()` with a mocked Supabase client and verifies the target company insert uses `relationship_stage: "PROSPECT"`, the `customer_targets` upsert uses the caller's `client_company_id`, and the audit event is scoped to the client company and target row.
- Main surfaces changed: `src/test/customerTargetRules.test.ts`, `docs/qa-test-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/codex-edit-log.md`.
- Checks run: `corepack pnpm exec vitest run src/test/customerTargetRules.test.ts`; `corepack pnpm run qa`; `corepack pnpm run code-review:gate`.
- Results: targeted customer-target tests passed. Full local QA passed lint, 71 tests across 23 files, and production build.
- Recheck agents: QA/Test Engineer, Product Ops Workflow Analyst, Data And Analytics Engineer, Lead Developer.
- Next run should verify: seeded live target-creation proof can still be added with cleanup credentials, but the unit-level behavior no longer depends on regex source matching.

### 2026-06-08 - Recheck Client Finance export boundary coverage

- Trigger: Ryan asked to complete recommended tasks one at a time with QA and release verification between tasks.
- Implementation branch: `main`.
- What changed: Replaced the remaining source-string export-boundary assertion with behavior-level coverage for Client export definitions. `ClientExports` now exposes pure row/card builders used by the UI and tests. New coverage proves Client Finance receives only the finance-safe `Customer payments` export with exact payment headers, while Client Admin retains operational target-account and meeting/transcript exports.
- Main surfaces changed: `src/pages/client/ClientExports.tsx`, `src/test/clientExportsAccess.test.ts`, `src/test/accessBoundaryRegression.test.ts`, `docs/qa-test-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/codex-edit-log.md`.
- Checks run: `corepack pnpm exec vitest run src/test/clientExportsAccess.test.ts src/test/accessBoundaryRegression.test.ts`; `corepack pnpm run qa`; `corepack pnpm run code-review:gate`.
- Results: targeted export/access tests passed. Full local QA passed lint, 71 tests across 23 files, and production build.
- Recheck agents: QA/Test Engineer, Data And Analytics Engineer, Security Engineer, Lead Developer.
- Next run should verify: seeded live export download checks can still be added later, but the current role-by-export card and header boundary is now covered at behavior level.

### 2026-06-08 - Recheck hosted target preflight classification

- Trigger: Ryan asked to complete recommended tasks one at a time with QA and release verification between tasks.
- Implementation branch: `main`.
- What changed: Added `pnpm run qa:target-preflight` to classify hosted target readiness before dependent E2E gates. The preflight checks DNS, HTTPS/app-shell load, Clerk env readiness, anonymous extension API v1 401 reachability, and whether the authenticated extension token is present when an extension API base URL is configured. Wired the preflight into the `E2E Smoke` workflow and the manual `Deep QA Hotfix Audit` workflow before their Playwright runs.
- Main surfaces changed: `scripts/qa-target-preflight.mjs`, `package.json`, `src/test/qaTargetPreflight.test.ts`, `.github/workflows/e2e-smoke.yml`, `.github/workflows/deep-qa-hotfix-audit.yml`, `docs/qa-test-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/codex-edit-log.md`.
- Checks run: `corepack pnpm exec vitest run src/test/qaTargetPreflight.test.ts`; sourced `corepack pnpm run qa:target-preflight`; `corepack pnpm run qa`; `corepack pnpm run code-review:gate`.
- Results: unit contract test passed. Live preflight passed DNS, HTTPS, app shell, and Clerk checks against `https://trustedbums.com`, then failed as expected on missing `QA_EXTENSION_API_TOKEN`. Full local QA passed lint, 70 tests across 22 files, and production build.
- Recheck agents: QA/Test Engineer, QA Harness Reliability Agent, Release Verification Agent, Lead Developer.
- Next run should verify: add `QA_EXTENSION_API_TOKEN` to local and GitHub secrets when ready, then rerun `qa:target-preflight` and the authenticated extension API smoke.

### 2026-06-08 - Recheck deep QA P0 closure

- Trigger: Ryan asked to complete recommended tasks one at a time with QA and release verification between tasks.
- Implementation branch: `main`.
- What changed: No product code change was needed. Reran hosted Deep QA after the Supabase terms-gate fix. The non-destructive audit now reports no hotfix-level issues and complete route success across Admin, Client, Client Finance, Client Member, and Bum routes, including the previously suspect Client Terms, Client Member Customer Leads, Client Member Opportunity Registration, and `/admin/handoffs` surfaces. Updated QA and Lead handoffs so the stale deep-QA P0 is closed.
- Main surfaces changed: `docs/qa-test-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/codex-edit-log.md`.
- Checks run: hosted `deep-workflow-hotfix-audit.spec.ts` against `https://trustedbums.com`.
- Results: non-destructive deep workflow audit passed in 7.4 minutes; generated report `qa-deep-2026-06-08T00-37-59-358Z` says no hotfix-level issues were collected and every listed route passed. Mutating deep QA remained intentionally skipped because `QA_DEEP_MUTATION=1`, `QA_SUPABASE_URL`, and `QA_SUPABASE_SERVICE_ROLE_KEY` are not configured locally.
- Recheck agents: QA/Test Engineer, Lead Developer, Release Verification Agent.
- Next run should verify: run the mutating deep QA lane only when cleanup credentials are present, and keep object-level allow/deny tests separate from this non-destructive route audit.

### 2026-06-08 - Recheck hosted E2E smoke P0 closure

- Trigger: Ryan asked to complete the recommended tasks one at a time with QA and release verification between tasks.
- Implementation branch: `main`.
- What changed: No product code change was needed. The current deployed site already contains the fixes for the older 2026-06-04 E2E smoke failures: current signup validation copy, a single exact `Customer Payment Reports` page heading, and global-search prioritization that routes Client Finance `payments` searches to `/client/payments`. Updated QA/Lead handoffs so this old E2E smoke P0 is no longer treated as active.
- Main surfaces changed: `docs/qa-test-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/codex-edit-log.md`.
- Checks run: hosted `authenticated-role-smoke.spec.ts` plus `staging-smoke.spec.ts` against `https://trustedbums.com`; hosted `portal-interaction-audit.spec.ts` against `https://trustedbums.com`.
- Results: targeted hosted E2E smoke passed 11 tests with 1 intentional skip; hosted portal interaction audit passed all 4 role audits, including Client Finance global search.
- Recheck agents: QA/Test Engineer, Lead Developer, Release Verification Agent.
- Next run should verify: GitHub Actions should rerun `E2E Smoke` from current `main` and replace the stale 2026-06-04 failed workflow signal with a fresh green hosted run.

### 2026-06-08 - Recheck RLS helper grant restoration and hosted role smoke

- Trigger: Ryan asked to move ahead on the next unresolved scrum item.
- Implementation branch: `main`.
- What changed: Added a successor Supabase migration that restores `anon` and `authenticated` execute grants only for security-definer helpers that are called by live RLS policies, while keeping the trigger-only profile authorization guard closed to direct callers. Applied the migration live to Trusted Bums Supabase as `20260608002426 restore_rls_helper_execute_grants`. Updated the helper security regression test to catch the difference between policy helpers and trigger-only guards. Updated QA env preflight so a configured extension API base URL requires `QA_EXTENSION_API_TOKEN`, and documented the extension API QA variables in `.env.qa.example`.
- Main surfaces changed: `supabase/migrations/20260608010000_restore_rls_helper_execute_grants.sql`, `src/test/supabaseHelperSecurity.test.ts`, `scripts/verify-qa-env.mjs`, `.env.qa.example`, `docs/security-review-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/qa-test-backlog.md`.
- Checks run: live Supabase SQL catalog checks for helper grants and policy usage; Supabase MCP `_apply_migration`; hosted `authenticated-role-smoke.spec.ts` against `https://trustedbums.com` using `.env.qa` credentials; `corepack pnpm exec vitest run src/test/supabaseHelperSecurity.test.ts`; sourced `corepack pnpm run qa:env`; `corepack pnpm run qa`.
- Results: hosted authenticated role smoke passed all 5 roles; full local QA passed lint, 21 test files / 67 tests, and production build. Sourced `qa:env` now intentionally fails because `.env.qa` has `QA_EXTENSION_API_BASE_URL` but is missing `QA_EXTENSION_API_TOKEN`.
- Recheck agents: Security Engineer, QA/Test Engineer, Lead Developer, Product Ops Workflow Analyst.
- Next run should verify: add the missing dedicated QA extension token, rerun `qa:env`, and rerun authenticated extension API allow/deny coverage against two-company fixtures.

### 2026-06-07 - Recheck Clerk dependency advisory closure

- Trigger: Ryan approved the next unresolved security item.
- Implementation branch: `main`.
- What changed: Upgraded the root web Clerk dependency floor from `@clerk/react` `^6.6.2` to `^6.7.1` and the Clerk testing package from `@clerk/testing` `^2.0.29` to `^2.0.35`. Regenerated `pnpm-lock.yaml` so the root web path resolves through `@clerk/shared` `4.15.0` and the dev testing path resolves through `@clerk/backend` `3.5.0`; the lockfile no longer contains affected `js-cookie` `3.0.5`, only patched `3.0.7`.
- Main surfaces changed: `package.json`, `pnpm-lock.yaml`, `docs/security-review-backlog.md`, `docs/lead-developer-recommendations.md`.
- Checks run: `rg -n "@clerk/react|@clerk/testing|@clerk/backend|@clerk/shared|js-cookie" package.json pnpm-lock.yaml`; `corepack pnpm run qa`.
- Recheck agents: Security Engineer, QA/Test Engineer, Lead Developer.
- Next run should verify: GitHub dependency scanning no longer reports the `js-cookie` advisory for the root web Clerk path, and authenticated Clerk route smoke still passes in hosted QA.

### 2026-06-07 - Recheck service-role authorization contract coverage

- Trigger: Ryan asked to continue the next unresolved scrum items.
- Implementation branch: `main`.
- What changed: Added deterministic source-level regression coverage for service-role edge-function trust boundaries. The new test verifies the `verify_jwt = false` functions still perform explicit Clerk verification, then locks down the important authorization contracts in `client-team`, `profile-bootstrap`, `admin-access-requests`, `extension-api-v1`, and `send-admin-email`. Updated lead and security handoffs so the remaining service-role item is fixture-backed live allow/deny proof, not missing source-level regression coverage.
- Main surfaces changed: `src/test/serviceRoleAuthorization.test.ts`, `docs/security-review-backlog.md`, `docs/lead-developer-recommendations.md`.
- Checks run: `corepack pnpm exec vitest run src/test/serviceRoleAuthorization.test.ts`.
- Recheck agents: Security Engineer, QA/Test Engineer, Product Ops Workflow Analyst, Lead Developer.
- Next run should verify: seeded live service-role allow/deny cases for first-domain claim, public-email review, same-domain approval, related-domain pending review, cross-company client-team denial, extension own-company/foreign-company destinations, admin email non-admin denial, and audit-event writes.

### 2026-06-07 - Recheck email-track deploy drift closure

- Trigger: Ryan asked to work the next unresolved scrum items.
- Implementation branch: `main`.
- What changed: Updated security, trust/reputation, lead-developer, and consultant-access handoffs to close the stale `email-track` deploy-drift P0. Follow-up Supabase evidence now shows deployed `email-track` version `2` matching the hardened local allowlist implementation; public smoke checks returned `400` for an off-domain click destination and `404` for an approved-host URL with an unknown delivery id. The remaining tracked-link item is a seeded valid-delivery click proof, not a deploy fix.
- Main surfaces changed: `docs/security-review-backlog.md`, `docs/trust-reputation-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/consultant-access-needs.md`.
- Checks run: Supabase MCP/connector `get_project_url` and `get_edge_function` for `email-track`; two public `curl` smokes against the deployed `email-track` click endpoint; targeted source review of `supabase/functions/email-track/index.ts`, `supabase/functions/portal-contacts/index.ts`, `src/pages/client/ClientExports.tsx`, and `src/test/accessBoundaryRegression.test.ts`; `git diff --check -- docs`.
- Recheck agents: Security Engineer, Trust And Reputation Consultant, Lead Developer, Product Ops Workflow Analyst, QA/Test Engineer.
- Next run should verify: the next safe seeded valid-delivery tracked click records and redirects to an approved Trusted Bums host; invitation redirect URLs are constrained; represented-contact and client-export access boundaries get seeded live allow/deny proof; and Supabase read-only SQL is available for RLS, grant, and helper-function review.

### 2026-06-07 - Recheck invitation redirect hardening

- Trigger: Ryan asked to work the next unresolved scrum items.
- Implementation branch: `main`.
- What changed: Added a shared Supabase edge-function redirect normalizer for invitation flows, changed `client-team` and `invite-bum` to allow only approved Trusted Bums/configured Clerk origins, normalize approved redirects to `/login`, and fall back server-side for missing, invalid, or disallowed redirect inputs. Added focused unit coverage for approved origins, omitted redirects, disallowed external redirects, configured Clerk/app origins, and unsafe fallback configuration. Deployed both Supabase functions through MCP as version `2` with `verify_jwt: false` preserved for their existing custom Clerk verification.
- Main surfaces changed: `supabase/functions/_shared/invitationRedirect.ts`, `supabase/functions/client-team/index.ts`, `supabase/functions/invite-bum/index.ts`, `src/test/invitationRedirect.test.ts`, `docs/security-review-backlog.md`, `docs/lead-developer-recommendations.md`.
- Checks run: `corepack pnpm exec vitest run src/test/invitationRedirect.test.ts`; `corepack pnpm run qa`; `git diff --check`; Supabase MCP `_deploy_edge_function` for `invite-bum` and `client-team`; Supabase MCP `_get_edge_function` for both deployed functions; public no-auth `curl` smokes for both endpoints, each returning `400` with `Missing bearer token.`.
- Recheck agents: Security Engineer, Trust And Reputation Consultant, QA/Test Engineer, Product Ops Workflow Analyst, Lead Developer.
- Next run should verify: valid invitations still land on an approved `/login` handoff, external redirect inputs do not reach Clerk unchanged, and any production-specific allowed origins are set through `INVITATION_REDIRECT_ALLOWED_ORIGINS` plus `INVITATION_REDIRECT_FALLBACK_URL` as needed.

### 2026-06-07 - Recheck Bum saved-target RLS alignment

- Trigger: Ryan asked to continue the next unresolved scrum items.
- Implementation branch: `main`.
- What changed: Added a successor RLS migration that removes `bum_saved_items` from the `customer_targets` Bum read policy, keeping read entitlement tied to accepted target responses or scheduled/completed meetings. Applied the migration live to Trusted Bums Supabase as `20260607234751 remove_saved_target_read_entitlement`. Added regression coverage so saved-only target reads cannot re-enter the policy unnoticed, and updated the security/lead handoffs to move this from implementation gap to seeded proof.
- Main surfaces changed: `supabase/migrations/20260607194500_remove_saved_target_read_entitlement.sql`, `src/test/customerTargetRules.test.ts`, `docs/security-review-backlog.md`, `docs/lead-developer-recommendations.md`.
- Checks run: `corepack pnpm exec vitest run src/test/customerTargetRules.test.ts`; `corepack pnpm run qa`; `git diff --check`; Supabase MCP `_apply_migration`; Supabase MCP `_list_migrations`.
- Recheck agents: Security Engineer, Product Ops Workflow Analyst, QA/Test Engineer, Lead Developer.
- Next run should verify: a Bum with an accepted target response can still read the allowed target, a Bum with only a saved target cannot read it directly, and Product Ops still wants saved targets to remain bookmark-only rather than entitlement-preserving.

### 2026-06-07 - Recheck Supabase helper/RPC exposure cleanup

- Trigger: Ryan asked to continue the next unresolved scrum items.
- Implementation branch: `main`.
- What changed: Added a successor migration that revokes direct `EXECUTE` from `public`, `anon`, and `authenticated` on internal security-definer RLS/trigger helpers, and sets an explicit `search_path` on `normalize_submitted_opportunity_status()`. Applied it live to Trusted Bums Supabase as `20260607235839 restrict_security_definer_helper_execute`. Refreshed live security advisors now show only leaked-password protection disabled.
- Main surfaces changed: `supabase/migrations/20260607201000_restrict_security_definer_helper_execute.sql`, `src/test/supabaseHelperSecurity.test.ts`, `docs/security-review-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/trust-reputation-backlog.md`.
- Checks run: `corepack pnpm exec vitest run src/test/supabaseHelperSecurity.test.ts`; `corepack pnpm run qa`; `git diff --check`; Supabase MCP `_apply_migration`; Supabase MCP `_list_migrations`; Supabase MCP `_get_advisors(type: security)`.
- Recheck agents: Security Engineer, Data And Analytics Engineer, Trust And Reputation Consultant, QA/Test Engineer, Lead Developer.
- Next run should verify: Supabase Auth leaked-password protection is enabled or explicitly accepted, and any future helper/RPC migration is followed by a security advisor rerun.

### 2026-06-04 - Recheck glossary copy implementation

- Trigger: Ryan asked to implement Lead Developer recommendation 1.
- Implementation commit: `bbd75c4` on `codex/p0-access-contact-handoffs`.
- What changed: Site, portal, data labels, and visible test expectations were updated toward the approved glossary: `Client Agreement`, `Agreement records`, `Customer Leads`, `Customer Payment Reports`, `commission invoices`, `Client Admin`, `Client Finance`, `Client Member`, `Client Prospect`, `Bum Prospect`, and `/bum/claims` as `Claims`.
- Main surfaces changed: client legal, dashboard, request, finance, report, profile, team, and terms pages; Bum dashboard, claims, prospects, reports, and Customer Leads pages; admin legal, payments, dashboard, and contact-submission panels; portal search; signup intent copy; route and visual audit label expectations.
- Checks run before push: `git diff --check`; `pnpm run lint`; `pnpm exec vitest run src/test/routeGuards.test.tsx`; `pnpm run build`.
- Recheck agents: Content Copyeditor, UX Consultant, UI Consultant, Accessibility Specialist, QA/Test Engineer, Product Ops Workflow Analyst, Lead Developer.
- Next run should verify: remove or downgrade stale copy recommendations that still describe the pre-implementation labels; re-scan visible copy for remaining glossary conflicts; confirm legal/public wording still needs owner approval only where actual uncertainty remains; update route/visual assertions if rendered evidence differs.

### 2026-06-04 - Recheck unified Opportunity model implementation

- Trigger: Ryan asked to implement Lead Developer recommendation 2.
- Implementation commit: `bbd75c4` on `codex/p0-access-contact-handoffs`.
- What changed: Added a shared source-level Opportunity origin/stage model and surfaced origin/stage badges in existing Client, Bum, and Admin opportunity-like workspaces without destructive route or schema consolidation.
- Main files changed: `src/lib/opportunityModel.ts`, `src/test/opportunityModel.test.ts`, `src/pages/client/ClientRequests.tsx`, `src/pages/client/ClientOpportunityNew.tsx`, `src/pages/bum/BumOpportunities.tsx`, `src/pages/bum/BumReverseOpportunities.tsx`, `src/pages/bum/BumClaims.tsx`, `src/pages/admin/AdminOpportunities.tsx`, `docs/trusted-bums-operating-model.md`, and `docs/business-access-rules.md`.
- Canonical values introduced: `Client-Originated`, `Bum-Originated`, `Customer-Originated`, `Admin-Originated`, `Imported`; stages including `Intake`, `Qualifying`, `Intro Requested`, `Intro In Progress`, `Meeting Set`, `Open Opportunity`, `Needs Clarification`, `Accepted Claim`, `Revenue Confirmed`, and `Closed Lost`.
- Checks run before push: `git diff --check`; `pnpm run lint`; `pnpm exec vitest run src/test/opportunityModel.test.ts src/test/routeGuards.test.tsx`; `pnpm run build`.
- Recheck agents: Product Ops Workflow Analyst, Data And Analytics Engineer, Security Engineer, QA/Test Engineer, UX Consultant, UI Consultant, Content Copyeditor, Lead Developer.
- Next run should verify: current route-specific pages now behave as projections of one Opportunity model; any remaining recommendations should focus on missing route consolidation, migration fields, access-rule tests, finance-safe projections, or role-specific workspace UX rather than asking for the already shipped origin/stage labeling pass.

## Pushed Scope Notes

- `bbd75c4` was created after Ryan explicitly asked to push all local changes. The commit contains 66 files, including the implementation work above plus documentation, workflow, and screenshot files that were already present in the dirty worktree before the final push request.
- Future agents should inspect the commit diff before assigning authorship or treating every changed doc as a fresh implementation by Codex in the glossary/opportunity pass.

## Latest Agent Recheck Requests

### 2026-06-07 - Recheck lead developer queue after 3 AM specialist refresh review

- Trigger: Ryan asked to run the Trusted Bums Lead Developer agent against the current dirty worktree, use the lead prompt plus shared rules, review the completed 3 AM specialist doc updates, revalidate the highest-priority items with the project-scoped Trusted Bums Supabase MCP server when available, and update the lead handoff with a concise scrum summary.
- Implementation branch: Current local workspace with pre-existing unrelated documentation changes.
- What changed: Rewrote `docs/lead-developer-recommendations.md` to remove stale historical implementation carry-forward and replace it with a current lead queue centered on live `email-track` deployment drift, shipped business-access mismatches in represented contacts and client exports, live Supabase advisor findings for exposed admin/internal helper surfaces, and the current QA-env evidence blocker. Revalidated that `mcp__supabase_trustedbums` was callable in this session and confirmed the project URL, live edge-function inventory, live `email-track` source drift, hardened live `send-website-email`, and current security/performance advisor findings directly instead of carrying them forward only from specialist summaries.
- Superseded status: Follow-up evidence later on 2026-06-07 closed the `email-track` deploy-drift item and downgraded represented contacts/client exports to seeded QA proof gaps because current source and regression tests now support the intended boundaries.
- Main surfaces changed: `docs/lead-developer-recommendations.md`, `docs/codex-edit-log.md`.
- Checks run: `git status --short`; `git diff --stat -- docs`; `git diff --name-only -- docs`; targeted `rg`, `sed`, and `nl`; `[ -f .env.qa ] && echo .env.qa-present || echo .env.qa-missing`; `mcp__supabase_trustedbums.get_project_url`; `mcp__supabase_trustedbums.list_edge_functions`; `mcp__supabase_trustedbums.get_edge_function` for `email-track` and `send-website-email`; `mcp__supabase_trustedbums.get_advisors` for `security` and `performance`; and current Supabase, Clerk, Google sender-guidance, and Microsoft SmartScreen documentation review.
- Recheck agents: Lead Developer, Security Engineer, Trust And Reputation Consultant, Product Ops Workflow Analyst, Data And Analytics Engineer, QA/Test Engineer, Performance Engineer.
- Next run should verify: whether live `email-track` has been redeployed to the hardened local implementation; whether represented-contact destination scoping and finance-safe export narrowing ship with deterministic allow/deny tests; whether live security advisors narrow after admin/helper grant cleanup; whether `.env.qa` and GitHub-hosted QA evidence are restored for authenticated validation; and whether `/admin/handoffs` enters visual/interaction coverage once the access and trust queue is addressed.

### 2026-06-07 - Recheck trust and reputation backlog after live edge-function evidence refresh

- Trigger: Ryan asked to run the Trusted Bums Trust & Reputation Consultant agent with the current automation prompt, shared rules, port `8080` local-test constraint, `rcdl.tplinkdns.com` as the external DNS target when needed, and the Trusted Bums Supabase project context for `vaoqvtxqvbptyxddpoju`.
- Implementation branch: Current local workspace with pre-existing unrelated documentation changes.
- What changed: Rewrote `docs/trust-reputation-backlog.md` against current local source, current official trust/reputation guidance, runner-side DNS/TLS checks, and live Supabase function inventory/source/log evidence. Removed the stale public `send-website-email` P0 because live source now shows trusted-caller hardening and logs include a fresh denied `403`; promoted the then-current deployed `email-track` drift into the top active trust item; refreshed DMARC, metadata, headers, and extension-trust recommendations; and recorded the missing project-scoped Supabase MCP path, missing `.env.qa`, `127.0.0.1:8080` preview `EPERM`, and `https://rcdl.tplinkdns.com` TLS failure as current evidence gaps instead of implying a confirmed outage.
- Superseded status: Follow-up evidence later on 2026-06-07 confirmed deployed `email-track` version `2` with hardened allowlist behavior, plus `400` and `404` public smoke results, so this is no longer the top active trust item.
- Main surfaces changed: `docs/trust-reputation-backlog.md`.
- Checks run: `git status --short`; `git log --oneline -n 12`; targeted `rg`; targeted `sed`; `[ -f .env.qa ] && echo PRESENT || echo ABSENT`; `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm exec vite preview --host 127.0.0.1 --port 8080`; `mcp__codex_apps__supabase._get_project_url`; `mcp__codex_apps__supabase._list_edge_functions`; `mcp__codex_apps__supabase._get_edge_function` for `send-website-email` and `email-track`; `mcp__codex_apps__supabase._get_logs` for `edge-function`; `mcp__codex_apps__supabase._get_advisors` for `security`; and current Google, Microsoft, OWASP, Chrome, and Supabase documentation review.
- Recheck agents: Trust And Reputation Consultant, Security Engineer, QA/Test Engineer, Product Ops Workflow Analyst, Lead Developer.
- Next run should verify: whether live `email-track` is redeployed to the hardened allowlist version, whether an authenticated admin path can execute `dmarc-reports` against `bums@trustedbums.com`, whether the project-scoped `mcp__supabase_trustedbums` server is callable again, whether local preview on `127.0.0.1:8080` remains blocked, and whether `rcdl.tplinkdns.com` is expected to present a publicly trusted TLS chain from consultant runners.

### 2026-06-07 - Recheck product ops backlog after live workflow evidence refresh

- Trigger: Ryan asked to run the Trusted Bums Product Ops Workflow Analyst agent with the current automation prompt, shared rules, project-scoped Supabase MCP server, port `8080` local-test constraint, and `rcdl.tplinkdns.com` as the external DNS target when needed.
- Implementation branch: Current local workspace with pre-existing unrelated documentation changes.
- What changed: Rewrote `docs/product-ops-workflow-backlog.md` against current source, live Supabase project metadata/table inventory/advisors/logs, current external ops guidance, and fresh local validation. Kept the represented-contact scoping, finance export-scope, access-review workspace, handoff triage, finance exception, and raw-capture visibility work active; removed stale repo-path references; and recorded the current `.env.qa` absence plus cancelled Supabase `execute_sql` calls as evidence limits instead of implying deeper live queue aggregates.
- Main surfaces changed: `docs/product-ops-workflow-backlog.md`.
- Checks run: `git status --short`; targeted `rg`, `sed`, and `nl`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run qa:env`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run lint`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm exec vitest run src/test/routeGuards.test.tsx src/test/opportunityModel.test.ts src/test/paymentCommission.test.ts src/test/customerTargetRules.test.ts`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run build`; `mcp__supabase_trustedbums.get_project_url`; `mcp__supabase_trustedbums.get_advisors` for `security` and `performance`; `mcp__supabase_trustedbums.list_tables`; `mcp__supabase_trustedbums.list_edge_functions`; `mcp__supabase_trustedbums.get_logs` for `postgres` and `edge-function`; attempted `mcp__supabase_trustedbums.execute_sql`; and current Zendesk, Microsoft Entra, and Stripe documentation review.
- Recheck agents: Product Ops Workflow Analyst, Security Engineer, Data And Analytics Engineer, QA/Test Engineer, UX Consultant, Trust And Reputation Consultant, Lead Developer.
- Next run should verify: whether represented-contact destination scoping ships in `portal-contacts`, whether `/client/exports` is split or narrowed for `CLIENT_FINANCE`, whether `/admin/clients` gains proof-category and review-note workflows, whether `/admin/handoffs` exposes priority/next-action/notification-health state, whether finance exception buckets appear before payout volume grows, and whether consultant sessions regain usable Supabase SQL aggregates for live queue counts.

### 2026-06-07 - Recheck data analytics backlog after live advisor and table-inventory refresh

- Trigger: Ryan asked to run the Trusted Bums Data Analytics Engineer agent with the current automation prompt, shared rules, Trusted Bums Supabase MCP context, port `8080` local-test constraint, and `rcdl.tplinkdns.com` as the external DNS target when needed.
- Implementation branch: Current local workspace with pre-existing unrelated documentation changes.
- What changed: Rewrote `docs/data-analytics-backlog.md` against current source, local checks, live Supabase advisors, live table inventory, and recent logs. Kept the business-effective-date, `CLIENT_FINANCE` export-scope, and admin dashboard RPC exposure work active; promoted the admin performance dashboard row-cap issue into the active list because live telemetry is now at `33,397` rows; downgraded access-request and terms-deferral reporting plus admin email pagination/open-signal concerns to watchlist because live usage is still low or absent; and recorded the current SQL-tool cancellation, missing `.env.qa`, and local `127.0.0.1:8080` preview `EPERM` failure as evidence gaps.
- Main surfaces changed: `docs/data-analytics-backlog.md`.
- Checks run: `git status --short`; targeted `rg`, `sed`, and `nl`; `env | rg '^(QA_|VITE_|CLERK_|SUPABASE_)'`; `.env.qa` presence check; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run qa:env`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run lint`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run build`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm exec vite preview --host 127.0.0.1 --port 8080`; `mcp__codex_apps__supabase._get_project_url`; `mcp__codex_apps__supabase._get_advisors` for `security` and `performance`; `mcp__codex_apps__supabase._list_tables`; `mcp__codex_apps__supabase._get_logs` for `edge-function` and `postgres`; attempted `mcp__codex_apps__supabase._execute_sql`; and current Supabase, Apple, and ICO documentation review.
- Recheck agents: Data And Analytics Engineer, Security Engineer, Performance Engineer, QA/Test Engineer, Product Ops Workflow Analyst, Lead Developer.
- Next run should verify: whether finance report workspaces now use business-effective dates, whether `/client/exports` is split or narrowed for `CLIENT_FINANCE`, whether `admin_dashboard_summary()` execute scope is tightened live, whether `/admin/performance` moves to server-side aggregates over the full time window, and whether consultant sessions regain callable Supabase SQL/policy-catalog access.

### 2026-06-07 - Recheck performance backlog after evidence refresh

- Trigger: Ryan asked to run the Trusted Bums Performance Engineer agent with the current role prompt, shared rules, port `8080` local-test constraint, `rcdl.tplinkdns.com` as the external DNS target when needed, and the authenticated Trusted Bums Supabase MCP context for project `vaoqvtxqvbptyxddpoju`.
- Implementation branch: Current local workspace with pre-existing unrelated documentation changes.
- What changed: Rewrote `docs/performance-engineering-backlog.md` against current source, build, lint, test, live Supabase advisor/table/log evidence, and current official performance guidance. Preserved the startup bundle, list-loading, search fan-out, and admin telemetry-shape issues; added the current memo-warning recalculation cleanup item; removed stale claims that depended on live SQL aggregates not revalidated in this session; and recorded the current SQL-tool cancellation plus local `127.0.0.1:8080` preview `EPERM` blocker as evidence gaps.
- Main surfaces changed: `docs/performance-engineering-backlog.md`.
- Checks run: `git status --short`; targeted `sed`, `rg`, and `git log`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run qa:env`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run lint`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run test`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run build`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm exec vite preview --host 127.0.0.1 --port 8080`; `mcp__codex_apps__supabase._get_project_url`; `mcp__supabase_trustedbums.get_advisors`; `mcp__supabase_trustedbums.list_tables`; `mcp__supabase_trustedbums.get_logs`; and current web.dev, React Router, and Vite documentation review.
- Recheck agents: Performance Engineer, QA/Test Engineer, UX Consultant, Data And Analytics Engineer, Security Engineer, Lead Developer.
- Next run should verify: whether route-level code splitting actually lands in `src/App.tsx` and the build output, whether search and report/dashboard reads move to bounded server-shaped queries, whether consultant sessions regain callable read-only SQL and route-level telemetry aggregates, whether the local runner can bind `127.0.0.1:8080`, and whether fresh authenticated route traces or Lighthouse artifacts become available.

### 2026-06-07 - Recheck security backlog after live Supabase edge-source validation

- Trigger: Ryan asked to run the Trusted Bums Security Engineer agent with the current automation prompt, shared rules, project-scoped Supabase MCP server, port `8080` local-test constraint, and `rcdl.tplinkdns.com` as the external DNS target when needed.
- Implementation branch: Current local workspace with pre-existing unrelated documentation changes.
- What changed: Rewrote `docs/security-review-backlog.md` against current local and live evidence, removed the stale public-mail-sender P0 because live `send-website-email` is now hardened, elevated the live `email-track` deployment drift/open-redirect issue as the top active risk, refreshed dependency and business-rule alignment notes, and updated `docs/consultant-access-needs.md` so the Supabase capability gap, QA env gap, deploy-provenance drift, and public-form/mail-reputation access request reflect the current 2026-06-07 evidence.
- Main surfaces changed: `docs/security-review-backlog.md`, `docs/consultant-access-needs.md`.
- Checks run: `git status --short`; targeted `rg`; targeted `sed`; `mcp__supabase_trustedbums.get_project_url`; `mcp__supabase_trustedbums.list_edge_functions`; `mcp__supabase_trustedbums.get_edge_function` for `send-website-email` and `email-track`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run qa:env`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run lint`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm exec vitest run src/test/extensionApiContract.test.ts src/test/routeGuards.test.tsx src/test/customerTargetRules.test.ts src/test/authData.test.ts src/test/paymentCommission.test.ts src/test/termsContractRules.test.ts src/test/opportunityModel.test.ts`; `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`; and current GitHub/Supabase/Clerk/Cloudflare documentation review.
- Recheck agents: Security Engineer, Trust And Reputation Consultant, QA/Test Engineer, Product Ops Workflow Analyst, Lead Developer.
- Next run should verify: whether live `email-track` has been redeployed to the hardened local implementation, whether consultant sessions regain callable Supabase read-only SQL for live grant/RLS checks, whether the QA env contract is restored in-shell, and whether deploy history can explain why local and live edge-function versions diverged.

### 2026-06-07 - Recheck accessibility backlog after evidence refresh

- Trigger: Ryan asked to run the Trusted Bums Accessibility Specialist agent with the current role prompt, shared rules, local-runner port `8080` constraint, and `rcdl.tplinkdns.com` as the external DNS target.
- Implementation branch: Current local workspace with pre-existing unrelated documentation changes.
- What changed: Rewrote `docs/accessibility-backlog.md` against the current checkout, kept only evidence-backed accessibility findings, added a new WCAG 2.2 target-size recommendation for the collapsed `Privacy choices` launcher, corrected the backlog's stale evidence claims about `.env.qa`, local preview, and external DNS validation, and tightened the shared accessibility evidence gap in `docs/consultant-access-needs.md`.
- Main surfaces changed: `docs/accessibility-backlog.md`, `docs/consultant-access-needs.md`.
- Checks run: `git status --short`; targeted `git log`, `rg`, `sed`, and `nl` across the accessibility prompt, shared rules, backlog, public forms, consent manager, sidebar, layouts, and Playwright specs; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run qa:env`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run lint`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run build`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm exec vite preview --host 127.0.0.1 --port 8080`; `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`; `mcp__supabase_trustedbums.get_project_url`; `mcp__supabase_trustedbums.list_edge_functions`; and current W3C accessibility guidance review for WCAG 2.2, modal dialogs, error identification, form errors, and target size.
- Recheck agents: Accessibility Specialist, UX Consultant, UI Consultant, QA/Test Engineer, Trust And Reputation Consultant, Lead Developer.
- Next run should verify: whether consultant shells regain a usable QA env contract, whether the runner can bind local preview on `127.0.0.1:8080`, whether `rcdl.tplinkdns.com` is expected to present a publicly trusted TLS chain, whether the privacy launcher target size and mobile sidebar dialog semantics are fixed in source, and whether axe or equivalent automated accessibility coverage is added.

### 2026-06-07 - Recheck live Supabase evidence after MCP OAuth fix

- Trigger: Ryan asked to fix the Supabase auth issue for all Trusted Bums agents by using MCP.
- Implementation branch: Current local workspace with pre-existing unrelated documentation changes.
- What changed: Completed OAuth login for the Codex `supabase-trustedbums` MCP server, verified a fresh nested agent can use the project-scoped `mcp__supabase_trustedbums` server, and updated shared consultant rules/access-needs docs so agents use project `vaoqvtxqvbptyxddpoju` explicitly instead of treating Supabase availability as ambiguous.
- Main surfaces changed: `docs/consultant-team-rules.md`, `docs/agents/consultant-team-rules.md`, `docs/consultant-access-needs.md`, `docs/agents/consultant-access-needs.md`.
- Checks run: `mcp__codex_apps__supabase._list_projects`; `mcp__codex_apps__supabase._list_edge_functions` for project `vaoqvtxqvbptyxddpoju`; `codex mcp login supabase-trustedbums`; fresh nested `codex exec` verification that `mcp__supabase_trustedbums.get_project_url` returned `https://vaoqvtxqvbptyxddpoju.supabase.co` and `mcp__supabase_trustedbums.list_edge_functions` returned the live edge-function inventory including `send-website-email`.
- Recheck agents: Security Engineer, Data And Analytics Engineer, Performance Engineer, Product Ops Workflow Analyst, Trust And Reputation Consultant, QA/Test Engineer, Lead Developer.
- Next run should verify: whether each specialist gets the depth of Supabase tools it needs in its own session, especially read-only SQL/catalog/advisor paths beyond project URL and edge-function inventory.

### 2026-06-07 - Recheck growth backlog after B2B marketer refresh

- Trigger: Ryan asked to run the Trusted Bums B2B Growth Marketer agent with the current role prompt, shared rules, local-runner port `8080` constraint, and `rcdl.tplinkdns.com` as the external DNS target.
- Implementation branch: Current local workspace with pre-existing unrelated documentation changes.
- What changed: Rewrote `docs/b2b-marketing-growth-backlog.md` against the current checkout, removed stale references to an older local repo path, kept only current evidence-backed growth plays, refreshed the thesis around Client-demand constraint and invite-only Bum supply, updated Current Standards and Agent Inputs with the required current sources and runner checks, and tightened the GTM evidence blocker in `docs/consultant-access-needs.md` to include the current `rcdl.tplinkdns.com` TLS failure and the local `127.0.0.1:8080` preview `listen EPERM` limitation.
- Main surfaces changed: `docs/b2b-marketing-growth-backlog.md`, `docs/consultant-access-needs.md`.
- Checks run: `git status --short`; targeted `git log --since='2026-06-04' --name-only --pretty=format:'COMMIT %h %cs %s' -- docs src tests package.json public supabase`; targeted `rg` and `sed` across the growth prompt, shared rules, current backlog, `package.json`, `Index`, `SignupIntentDialog`, `contactApi`, `ContactSubmissionsPanel`, `ClientDashboard`, `BumDashboard`, `BumProfile`, `BumProspects`, and related backlog files; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run lint`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts src/test/termsContractRules.test.ts`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run build`; `curl -I -L --max-time 15 https://rcdl.tplinkdns.com`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm exec vite preview --host 127.0.0.1 --port 8080`; current Google, LinkedIn, Gartner, ICO, and FTC guidance review.
- Recheck agents: B2B Growth Marketer, Content Copyeditor, Marketing Graphics Artist, Trust And Reputation Consultant, Product Ops Workflow Analyst, Data And Analytics Engineer, UX Consultant, Lead Developer.
- Next run should verify: whether a dedicated Client intake branch ships, whether the proof spine and referral ask pack exist in approved form, whether Client-side funnel data or founder-call evidence becomes available, whether `docs/brand-strategy.md` is restored or replaced, whether `rcdl.tplinkdns.com` is expected to present a publicly trusted TLS chain, and whether the runner can ever bind local preview on `127.0.0.1:8080`.

### 2026-06-07 - Recheck content backlog after copyeditor refresh

- Trigger: Ryan asked to run the Trusted Bums Content Copyeditor agent with the current role prompt and shared rules.
- Implementation branch: Current local workspace with pre-existing unrelated documentation changes.
- What changed: Rewrote `docs/content-copyeditor-backlog.md` against the current checkout, removed stale references to an older local repo path, kept only the remaining evidence-backed copy issues, expanded the `Bum Prospect` recommendation to include the public homepage and generated admin escalation notes, refreshed Agent Inputs to use the required `corepack` path and the external DNS target `rcdl.tplinkdns.com`, updated `docs/consultant-access-needs.md` with the current content-specific evidence gaps, and captured Ryan's new consultant-runner rule in both `docs/company-wide-rules.md` and `docs/consultant-team-rules.md` so local testing stays on port `8080` and external DNS checks use `rcdl.tplinkdns.com`.
- Main surfaces changed: `docs/content-copyeditor-backlog.md`, `docs/consultant-access-needs.md`, `docs/company-wide-rules.md`, `docs/consultant-team-rules.md`.
- Checks run: `git status --short`; `git log --since='10 days ago' --name-only --pretty=format:'COMMIT %h %cs %s' -- src docs tests`; targeted `rg` terminology scans across `src`, `tests`, and `docs`; `sed -n` review of the copyeditor prompt, shared rules, current backlog, and the live copy surfaces in `ClientDashboard`, `ClientProfile`, `ClientAgreements`, `ClientTerms`, `ClientRequests`, `SignupIntentDialog`, `ContactSubmissionsPanel`, `contactApi`, `BumProspects`, `BumLayout`, `BumReports`, `Index`, and `PortalGlobalSearch`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run lint`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts src/test/termsContractRules.test.ts`; `curl -I -L --max-time 15 https://rcdl.tplinkdns.com`; current W3C WCAG 2.2, Digital.gov, and GOV.UK content-guidance review.
- Recheck agents: Content Copyeditor, UX Consultant, UI Consultant, QA/Test Engineer, Product Ops Workflow Analyst, Trust And Reputation Consultant, Lead Developer.
- Next run should verify: whether dashboard agreement-recovery CTAs stop routing through `Company Profile`, whether `Skip This Login` is replaced with session-scoped deferral copy, whether recruiting terminology moves off `Bum Prospect` across public, admin, and generated-note surfaces together, whether the client request helper line stays aligned with `Bum Intro Requests`, and whether `rcdl.tplinkdns.com` is expected to present a trusted TLS chain for consultant-runner checks.

### 2026-06-07 - Recheck UI backlog after portal dock padding change

- Trigger: Daily UI consultant automation run.
- Implementation branch: Current local workspace with pre-existing unrelated documentation changes.
- What changed: Rewrote `docs/ui-optimization-backlog.md` to narrow the mobile floating-control recommendation after commit `850e507` added portal bottom padding, preserved the remaining evidence-backed privacy/legal and Bum earnings findings, kept `/admin/handoffs` route-coverage work active, and mirrored the new durable GitHub Visual QA workflow-access gap into `docs/consultant-access-needs.md`.
- Main surfaces changed: `docs/ui-optimization-backlog.md`, `docs/consultant-access-needs.md`.
- Checks run: `git status --short`; `git log --since='14 days ago' --name-only --pretty=format:'--- %h %ad %s' --date=short -- src app components docs tests .github/workflows`; `sed -n` review of the UI consultant prompt/rules, `docs/codex-edit-log.md`, `.github/workflows/visual-ui-audit.yml`, `tests/e2e/visual-ui-audit.spec.ts`, `src/components/ConversationDock.tsx`, `src/components/ConsentManager.tsx`, `src/pages/bum/BumDashboard.tsx`, `src/pages/bum/BumEarnings.tsx`, `src/pages/admin/AdminHandoffs.tsx`, `src/layouts/AdminLayout.tsx`, `src/layouts/ClientLayout.tsx`, `src/layouts/BumLayout.tsx`; screenshot inspection from `/Users/macdaddy/tmp/trustedbums-visual-ui-27083467531`; `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run lint`; current W3C WCAG 2.2, MDN, and Android Developers guidance review.
- Recheck agents: UI Consultant, UX Consultant, Accessibility Specialist, QA/Test Engineer, Product Ops Workflow Analyst, Lead Developer.
- Next run should verify: whether a coordinated mobile utility rail replaces the fixed chat/privacy collision pattern, whether the consent reopen control is enlarged and visually audited on `/privacy-policy`, whether `/admin/handoffs` is added to `Visual UI Audit`, and whether consultant sessions regain direct GitHub workflow/artifact access instead of relying on pre-downloaded copies.

### 2026-06-07 - Recheck UX backlog after finance regression narrowing

- Trigger: Daily UX consultant automation run.
- Implementation branch: Current local workspace with pre-existing unrelated documentation changes.
- What changed: Rewrote `docs/ux-optimization-backlog.md` for 2026-06-07 to keep only current evidence-backed UX recommendations. Preserved the signup company-name loss, public contact-form recovery, client blocked-route and agreement-recovery issue, and admin handoff triage gap. Downgraded the earlier finance payment-page issue from active backlog to watchlist because current source now includes regression coverage for updated signup copy, the single exact `Customer Payment Reports` heading, and page-title search prioritization in `src/test/e2eSmokeRegression.test.ts`, but this runner could not revalidate the deployed finance flow live. Updated `docs/consultant-access-needs.md` to capture the current QA env, local-preview, and GitHub-access blockers.
- Main surfaces changed: `docs/ux-optimization-backlog.md`, `docs/consultant-access-needs.md`.
- Checks run: `git status --short`; `git log --oneline -n 12 -- docs src tests .github package.json`; `git log --oneline -n 8 -- src/components/SignupIntentDialog.tsx src/pages/Index.tsx src/components/ClientAccessRoute.tsx src/pages/client/ClientDashboard.tsx src/components/PortalGlobalSearch.tsx src/pages/client/ClientPayments.tsx src/pages/admin/AdminHandoffs.tsx`; `corepack pnpm run qa:env`; `corepack pnpm run lint`; `corepack pnpm run build`; `corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts`; `gh run list --repo pidpoddev/trustedbums --limit 8`; `curl -I -L --max-time 15 https://rcdl.tplinkdns.com`.
- Recheck agents: UX Consultant, UI Consultant, Accessibility Specialist, QA/Test Engineer, Product Ops Workflow Analyst, Trust And Reputation Consultant, Lead Developer.
- Next run should verify: whether exported QA env variables are restored for consultant shells, whether GitHub-hosted `E2E Smoke` confirms the finance search path still lands on `/client/payments`, whether `/admin/handoffs` is added to visual audit coverage, whether local preview on `127.0.0.1:8080` is possible from the runner, and whether `rcdl.tplinkdns.com` is expected to present a publicly trusted TLS chain.

### 2026-06-06 - Recheck data analytics backlog refresh

- Trigger: Daily data analytics engineer automation run.
- Implementation branch: Current local workspace with pre-existing unrelated dirty documentation files.
- What changed: Rewrote `docs/data-analytics-backlog.md` for 2026-06-06 to keep only current evidence-backed analytics recommendations. Preserved the active finance-date, client-finance export scope, admin dashboard RPC exposure, access-request and terms-deferral reporting, and admin email analytics items; downgraded telemetry and terms-acceptance access concerns to watchlist items; and updated Agent Inputs to reflect that this run had live Supabase project metadata, edge-function inventory, and logs, but not direct SQL or advisor access.
- Main surfaces changed: `docs/data-analytics-backlog.md`.
- Checks run: `set -a; [ -f .env.qa ] && source .env.qa; set +a; pnpm run qa:env`; `pnpm run lint`; `pnpm run build`; `pnpm run test -- src/test/paymentCommission.test.ts src/test/routeGuards.test.tsx src/test/termsContractRules.test.ts src/test/opportunityModel.test.ts`; Supabase MCP `list_projects`, `get_project`, `list_edge_functions`, `get_logs` for `postgres` and `edge-function`; current official web review for Supabase API/RLS/security-definer guidance, web.dev SPA vitals guidance, Apple Mail Privacy Protection, and ICO storage-and-access guidance.
- Recheck agents: Data And Analytics Engineer, Security Engineer, QA/Test Engineer, Product Ops Workflow Analyst, Performance Engineer, Lead Developer.
- Next run should verify: whether finance report workspaces now use business-effective dates, whether `/client/exports` is split or narrowed for `CLIENT_FINANCE`, whether `admin_dashboard_summary()` execute scope is tightened, whether admin reporting now includes historical access-request and deferral outcomes, and whether admin email analytics moved beyond fixed 50-row reads.

### 2026-06-06 - Recheck UX backlog against current finance and intake evidence

- Trigger: Daily UX consultant automation run.
- Implementation branch: Current local workspace with pre-existing unrelated dirty documentation files.
- What changed: Refreshed `docs/ux-optimization-backlog.md` for 2026-06-06, kept only current evidence-backed UX recommendations, preserved the signup company-name loss, contact-form recovery, client access-recovery, finance search-routing, and admin-handoff findings, and downgraded the signup validation copy mismatch to QA drift instead of a live product UX issue.
- Main surfaces changed: `docs/ux-optimization-backlog.md`.
- Checks run: `git status --short`; `git log --since='10 days ago' --name-only --pretty=format:'COMMIT %h %ad %s' --date=short -- docs src tests`; `set -a; source .env.qa; set +a; pnpm run qa:env`; `pnpm run lint`; `gh run list --repo pidpoddev/trustedbums --limit 12`; `gh run view 26933527284 --repo pidpoddev/trustedbums --log-failed`; `curl -I -L --max-time 20 https://trustedbums.com`.
- Recheck agents: UX Consultant, UI Consultant, QA/Test Engineer, Product Ops Workflow Analyst, Accessibility Specialist, Lead Developer.
- Next run should verify: whether client-finance search now lands on `/client/payments`, whether the payment page keeps a single primary `Customer Payment Reports` heading, whether dashboard redirects now explain blocked routes and route agreement recovery correctly, whether the public signup flow preserves typed company names after email edits, and whether local DNS/browser reachability is restored on this runner.

### 2026-06-05 - Recheck UX backlog refresh

- Trigger: Daily UX consultant automation run.
- Implementation branch: `codex/gtm-agent-stack-cleanup` with pre-existing unrelated dirty docs in the workspace.
- What changed: Rewrote `docs/ux-optimization-backlog.md` to remove stale scaffolding and keep only current, evidence-backed UX priorities. Added a new deployed-evidence-backed client-finance search/navigation issue, kept the active signup/contact-form/client-recovery/admin-handoff findings, and updated the evidence/access sections to distinguish GitHub-hosted route proof from this runner's DNS-limited local browser checks.
- Main surfaces changed: `docs/ux-optimization-backlog.md`.
- Checks run: `set -a; source .env.qa; set +a; pnpm run qa:env`; `pnpm run lint`; `pnpm exec playwright test tests/e2e/authenticated-role-smoke.spec.ts --project=chromium --reporter=line`; `curl -I -L --max-time 20 https://trustedbums.com`; `gh run list --repo pidpoddev/trustedbums --workflow visual-ui-audit.yml --limit 3`; `gh run list --repo pidpoddev/trustedbums --workflow 'E2E Smoke' --limit 3`; `gh run view 26933527284 --repo pidpoddev/trustedbums --log-failed`.
- Recheck agents: UX Consultant, UI Consultant, QA/Test Engineer, Product Ops Workflow Analyst, Accessibility Specialist, Lead Developer.
- Next run should verify: whether client-finance search now prioritizes `/client/payments`, whether the payment page keeps a single primary heading, whether dashboard redirects now explain blocked routes and point terms recovery to agreement routes, and whether local runner DNS/browser reachability is restored or GitHub-hosted evidence remains the only live route source.

### 2026-06-04 - Recheck GTM agent stack first run

- Trigger: Ryan asked to "Do a first run" of the Trusted Bums GTM agent stack.
- Implementation branch: `codex/gtm-agent-stack-cleanup`.
- What changed: Added the first combined GTM stack run artifact with Agent 1 positioning dossier, Agent 6 competitor/category monitor, Agent 2 30-day content and enablement plan, Agent 3 first copy batch, Agent 4 one-week distribution plan, and Agent 5 deferral criteria.
- Main surfaces changed: `docs/gtm-agent-runs/2026-06-04-first-run.md`.
- Checks run: repo source review, homepage/product workflow inspection, current competitor/category web review, `git diff --check`, and first-run guardrail review. No app tests were run because this was documentation and GTM planning only.
- Recheck agents: B2B Growth Marketer, Content Copyeditor, Marketing Graphics Artist, Trust And Reputation Consultant, Data And Analytics Engineer, Product Ops Workflow Analyst, UX Consultant, Lead Developer.
- Next run should verify: whether the first-week LinkedIn/email assets produce qualified replies, whether one objection repeats enough to trigger Agent 5, whether `docs/brand-strategy.md` should be restored because it is referenced but missing on this branch, and whether the first-run proof log can move recommendations from source-backed to performance-backed.

### 2026-06-04 - Recheck B2B growth marketer agent setup

- Trigger: Ryan asked to create an agent that is the best B2B marketer in the world with the goal of increasing the number of Bums and Clients in the program.
- Implementation branch: Current local workspace with uncommitted documentation/process changes.
- What changed: Added a daily B2B Growth Marketer automation prompt snapshot, created the first `docs/b2b-marketing-growth-backlog.md`, and added role rules/access expectations so the agent optimizes for qualified marketplace liquidity rather than raw signup volume.
- Main surfaces changed: `docs/agents/automation-prompts/trusted-bums-daily-b2b-growth-marketer.toml`, `docs/b2b-marketing-growth-backlog.md`, `docs/agents/README.md`, `docs/agents/consultant-team-rules.md`, `docs/consultant-team-rules.md`, and `docs/consultant-access-needs.md`.
- Checks run: Source review of existing agent prompt patterns, brand strategy, operating model growth strategy, content guidance, marketing graphics guidance, and access-needs structure.
- Recheck agents: B2B Growth Marketer, Content Copyeditor, Marketing Graphics Artist, Trust And Reputation Consultant, Product Ops Workflow Analyst, Data And Analytics Engineer, Lead Developer.
- Next run should verify: whether CRM, funnel analytics, campaign performance, case-study permissions, approved claims, and customer/Bum interview inputs are available enough to move from source-backed plays to performance-backed growth priorities.

### 2026-06-04 - Recheck first marketing graphics asset set

- Trigger: Daily Trusted Bums marketing graphics artist automation run.
- Implementation branch: `codex/p0-access-contact-handoffs` with uncommitted working-tree changes.
- What changed: Added a first campaign-ready asset pack of three text-free vector background plates plus rendered previews and production notes, then replaced the placeholder marketing graphics backlog with approved concept entries, QA decisions, reusable prompt fragments, and campaign evidence. Also expanded the access-needs request to explicitly ask for audience definitions and ad-account performance data.
- Main surfaces changed: `docs/marketing-graphics-campaign-backlog.md`, `docs/consultant-access-needs.md`, and `docs/marketing-graphics/assets/2026-06-04/`.
- Checks run: source review of brand/public-site assets, targeted `git log` inspection, local Quick Look renders via `qlmanage -t -s 2400`, manual inspection of the rendered PNG previews, and SVG-source spelling review confirming no visible text in the approved assets.
- Recheck agents: Marketing Graphics Artist, Content Copyeditor, UI Consultant, Trust And Reputation Consultant, UX Consultant, Lead Developer.
- Next run should verify: whether editable overlay copy was applied in design tooling without rasterized brand text, whether audience/performance inputs narrow the concept priority order, and whether any new legal-approved claims or brand-template guidance should replace the current source-backed overlay suggestions.

### 2026-06-04 - Recheck objection-led selective-access graphics set

- Trigger: Follow-up Trusted Bums marketing graphics artist automation run on the same day.
- Implementation branch: Current local workspace with uncommitted documentation and asset changes.
- What changed: Replaced the earlier same-day concept set in `docs/marketing-graphics-campaign-backlog.md` with a sharper objection-led lineup focused on the buyer fear that Trusted Bums could look like generic lead-gen. Added three new approved text-free SVG plates plus rendered PNG previews and updated `asset-notes.md` with overlay-safe usage guidance.
- Main surfaces changed: `docs/marketing-graphics-campaign-backlog.md`, `docs/marketing-graphics/assets/2026-06-04/linkedin-selective-access-191x1.svg`, `docs/marketing-graphics/assets/2026-06-04/paid-social-guarded-door-4x5.svg`, `docs/marketing-graphics/assets/2026-06-04/email-hero-decision-map-16x9.svg`, their rendered `.png` previews, and `docs/marketing-graphics/assets/2026-06-04/asset-notes.md`.
- Checks run: source review of homepage/public SVG brand surfaces, recent `git log` inspection, current platform-guidance review for LinkedIn/Google/Meta/WCAG, local Quick Look renders via `qlmanage -t -s 2400`, manual inspection of all three rendered PNG previews, and SVG-source inspection confirming no visible text or pseudo-text in the approved assets.
- Recheck agents: Marketing Graphics Artist, Content Copyeditor, UI Consultant, Trust And Reputation Consultant, UX Consultant, Lead Developer.
- Next run should verify: whether editable overlay copy and approved logo assets were applied outside raster layers, whether live ad-manager previews introduce crop pressure on the portrait concept, and whether campaign-performance or audience-priority inputs justify narrowing to one lead concept.
