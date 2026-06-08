# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-08 by Codex._

## Executive Read

The implementation queue should stay led by live trust-boundary and business-access defects, not polish. A follow-up Supabase MCP check on 2026-06-07 confirmed project URL `https://vaoqvtxqvbptyxddpoju.supabase.co` and deployed `email-track` version `2` with the same hardened `https` allowlist behavior as local source. Public smokes returned `400` for an off-domain destination and `404` for an approved-host URL with an unknown delivery id, so the former deploy-drift P0 is closed; the remaining tracked-link work is release proof for a safe seeded valid-delivery click.

The next highest-confidence shipped risks are now Supabase Auth leaked-password protection and seeded access proof. The Clerk dependency hygiene item is closed: root web `@clerk/react` and dev `@clerk/testing` now resolve through patched Clerk shared packages, and the lockfile no longer contains `js-cookie` `3.0.5`. Service-role source contracts now have regression coverage for Clerk verification, client-team boundaries, profile-bootstrap metadata handling, admin access review, extension destinations, and admin email operations; they still need fixture-backed live allow/deny proof. Bum saved-target policy alignment is implemented in source, covered by regression tests, and applied live as Supabase migration `20260607234751 remove_saved_target_read_entitlement`; it still needs seeded allow/deny proof. Invitation redirect control is implemented in source, covered by focused tests, deployed to `client-team` and `invite-bum` version `2`, and smoke-checked for function boot; it still needs one safe authenticated invite smoke. The internal helper/RPC cleanup is now applied live as migration `20260607235839`, and refreshed Supabase security advisors only report leaked-password protection disabled.

The practical blocker is release evidence depth. `.env.qa` is present in this local workspace, and the hosted authenticated role smoke now passes all five roles after the live RLS helper grant fix. Follow-up hosted E2E checks also close the stale 2026-06-04 smoke failures: current staging smoke passes the signup-copy assertion, authenticated role smoke passes the Client Finance payments heading, and portal interaction audit proves Client Finance global search lands on `/client/payments`. Hosted non-destructive Deep QA now passes across the full listed Admin, Client, Client Finance, Client Member, and Bum route set, including `/admin/handoffs`, Client Terms, Client Member Customer Leads, and Client Member Opportunity Registration. Hosted target preflight classification is now implemented and wired into E2E/Deep QA workflows; it currently passes DNS, HTTPS, app shell, and Clerk checks, then fails by design until `QA_EXTENSION_API_TOKEN` is supplied for the configured extension API base URL. Client Finance export boundaries now have behavior-level coverage proving finance users only receive finance-safe payment export cards/headers while Client Admin retains operational exports. GitHub-hosted workflow evidence remains the intended final QA source, but several specialist runs today had intermittent access to it. That means the next implementation pass should pair every access or trust fix with deterministic allow/deny tests and a deliberate post-change QA plan instead of assuming the broader E2E path is immediately available.

## Recommended Implementation Queue

### P1 - Prove represented-contact and client-export access boundaries with seeded live QA
- Source: [supabase/functions/portal-contacts/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/portal-contacts/index.ts:474), [src/pages/client/ClientExports.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientExports.tsx:77), [src/test/accessBoundaryRegression.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/accessBoundaryRegression.test.ts), and `docs/business-access-rules.md`.
- Why now: Source has moved past the earlier implementation gap, but release confidence still depends on deterministic proof. The business needs live seeded positive and negative cases for Bum destination entitlement and finance-safe exports.
- Recommended fix: Add or document seeded fixtures that cover entitled and unrelated represented-contact destinations plus Client Admin versus Client Finance export scope, then run the same checks through automated QA.
- Likely files/routes: `src/test/accessBoundaryRegression.test.ts`, QA fixture scripts or docs, `/client/exports`, `portal-contacts`, and access-needs tracking.
- Dependencies/risks: Requires multi-company fixture data and role accounts; do not reopen source changes unless the seeded proof exposes a real mismatch.
- Acceptance criteria: Bum can link represented contacts only to entitled accepted opportunities or own-company targets; unrelated ids are denied server-side; Client Finance receives finance-safe exports only; Client Admin retains operational exports.
- Validation: Existing regression tests plus seeded live allow/deny QA once fixture access is available.

### P1 - Enable Supabase Auth leaked-password protection
- Source: refreshed live Supabase security advisors, `docs/security-review-backlog.md`, and Supabase Auth password-security guidance.
- Why now: This is the only remaining live Supabase security advisor after helper/RPC cleanup.
- Recommended fix: Enable leaked-password protection in Supabase Auth settings or the approved project configuration path, then rerun security advisors.
- Likely files/routes: Supabase dashboard/config only unless the setting is later managed through infrastructure code.
- Dependencies/risks: Coordinate with auth owner because this may affect password-based Supabase Auth signups/sign-ins if any remain active.
- Acceptance criteria: Refreshed Supabase security advisors no longer show `auth_leaked_password_protection`; expected auth flows still work.
- Validation: Supabase security advisor rerun plus auth smoke for any password-based paths in scope.

### P1 - Complete extension API QA credentials and authenticated extension coverage
- Source: `docs/ux-optimization-backlog.md`, `docs/ui-optimization-backlog.md`, `docs/consultant-team-rules.md`, the restored local `.env.qa`, and the older specialist `qa:env` failures recorded in `docs/codex-edit-log.md`.
- Why now: The top access and trust fixes should not ship behind source-only confidence. The local env file is present, hosted authenticated role smoke passed after the RLS helper grant fix, `/admin/handoffs` passed hosted Deep QA, and target preflight now classifies hosted readiness before E2E/Deep QA. Extension API authenticated coverage is still blocked by a missing dedicated QA token.
- Recommended fix: Add a dedicated `QA_EXTENSION_API_TOKEN` to the local and CI QA secret path without printing it, rerun `qa:env` and `qa:target-preflight`, then run authenticated extension API allow/deny checks.
- Likely files/routes: `.env.qa` or environment provisioning path, `.env.qa.example`, `scripts/verify-qa-env.mjs`, `tests/e2e/visual-ui-audit.spec.ts`, `tests/e2e/portal-interaction-audit.spec.ts`, `tests/e2e/extension-api.spec.ts`, and QA handoff docs.
- Dependencies/risks: This is partly an access/process item, not purely a product-code item. Keep missing credentials and GitHub workflow access visible as access blockers, not product defects.
- Acceptance criteria: `.env.qa` is present, `pnpm run qa:env` and `pnpm run qa:target-preflight` pass after sourcing it, authenticated role smoke remains green, and authenticated extension API checks run against seeded fixtures.
- Validation: sourced `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:target-preflight`; hosted authenticated role smoke; authenticated extension API Playwright/API checks.

### P1 - Add seeded live service-role authorization proof
- Source: [src/test/serviceRoleAuthorization.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/serviceRoleAuthorization.test.ts), [supabase/functions/client-team/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/client-team/index.ts), [supabase/functions/profile-bootstrap/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/profile-bootstrap/index.ts), [supabase/functions/admin-access-requests/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/admin-access-requests/index.ts), [supabase/functions/extension-api-v1/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/extension-api-v1/index.ts), and [supabase/functions/send-admin-email/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/send-admin-email/index.ts).
- Why now: Source-level service-role authorization contracts are now covered, but business confidence still needs real role tokens and two-company data proving the service-role paths behave the same way live.
- Recommended fix: Add fixture-backed API checks for first-domain claim, public-email pending review, same-domain approval, related-domain pending, client-team cross-company denial, direct auth-field mutation denial, extension own-company allow/foreign-company deny, and admin-email non-admin denial.
- Likely files/routes: QA fixture setup, `tests/e2e/extension-api.spec.ts`, authenticated role smoke helpers, `client-team`, `profile-bootstrap`, `admin-access-requests`, `extension-api-v1`, and `send-admin-email`.
- Dependencies/risks: Requires safe seeded role accounts and cleanup strategy; do not use real customer or mailbox data for mutation checks.
- Acceptance criteria: Each service-role path has one live allowed and one live denied case, and state-changing paths assert audit events or equivalent durable records.
- Validation: Seeded E2E/API run plus `corepack pnpm run qa`.

### P2 - Move admin observability and startup performance onto bounded, aggregate-first paths
- Source: `docs/data-analytics-backlog.md`, `docs/performance-engineering-backlog.md`, [src/pages/admin/AdminPerformanceMetrics.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminPerformanceMetrics.tsx:57), [src/App.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/App.tsx:16), and current Vite/React Router guidance.
- Why now: This is real and should stay in the queue, but it should trail live trust and access issues. The performance page still computes p75 from a `500`-row browser slice while the route tree still ships as one large eagerly imported app bundle.
- Recommended fix: Replace raw-row browser math on `/admin/performance` with server-shaped aggregates, then lazy-load route groups and heavy leaves out of the startup bundle.
- Likely files/routes: [src/pages/admin/AdminPerformanceMetrics.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminPerformanceMetrics.tsx:57), `src/lib/portalApi.ts`, [src/App.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/App.tsx:16), `vite.config.ts`, and related report/dashboard routes.
- Dependencies/risks: Data, Performance, Security, and QA should validate that any new aggregate helper stays admin-only and that route-splitting does not regress auth or navigation behavior.
- Acceptance criteria: Admin performance summaries are server-computed over the full selected window; startup JS is split into route-aligned chunks; the main bundle warning is materially reduced; auth and route smoke still pass.
- Validation: `pnpm run build`, targeted admin-performance checks, and follow-up route smoke after lazy-loading lands.

## Fix Playbooks

Keep `email-track` in release smoke coverage, but do not keep it in the active implementation queue unless a future live source check regresses. The remaining proof item is one seeded allowed-click path that records a click without using a real recipient.

Treat represented-contact scoping and finance-export scope as a QA proof workstream unless seeded evidence proves otherwise. Current source already contains the entitlement checks and finance export narrowing, so the next step is fixture-backed validation, not another broad implementation pass.

Keep Supabase helper cleanup on the watchlist rather than active implementation. `admin_dashboard_summary()` no longer appears in live advisors, and migration `20260607235839` cleared the remaining internal helper execution warnings. Re-check advisors after any new helper/RPC migration.

Keep invitation redirect hardening in release verification until one safe invite confirms an approved `/login` redirect. Live `client-team` and `invite-bum` source already shows the shared allowlist helper, so treat future redirect issues as release-proof or configuration items unless source regresses.

Do not carry the root Clerk `js-cookie` advisory as an active implementation item. Current `package.json` pins the root web Clerk floor at `@clerk/react` `^6.7.1`, `@clerk/testing` at `^2.0.35`, and the regenerated lockfile resolves only `js-cookie` `3.0.7`.

## Cross-Backlog Dependencies

- Trust, Security, and Product Ops should now treat `email-track` deploy drift as closed live evidence, with a release-smoke watch item for valid-delivery click recording.
- Product Ops, Security, Data, and QA now converge on the same access-boundary proof work: represented-contact destination entitlement, service-role live authorization, and deterministic allow/deny fixtures. Client Finance export scope now has behavior-level card/header coverage; live seeded download QA can still deepen it later.
- Older `.env.qa` absence claims are stale because the file is now restored locally. Hosted authenticated role smoke, portal interaction audit, staging smoke, and non-destructive Deep QA now pass against `trustedbums.com`, closing the stale E2E and route-audit failures recorded from 2026-06-04. Sourced `qa:env` and `qa:target-preflight` now correctly fail until `QA_EXTENSION_API_TOKEN` is added for the configured extension API base URL, and mutating Deep QA still needs cleanup credentials before it can run safely.
- `/admin/handoffs` remains a real UX, UI, and Product Ops follow-up, but it should trail the trust and access fixes above. Its current missing route coverage is better handled as part of the QA evidence-restoration step than as the top implementation item.
- Performance and Data both point to the same admin observability boundary: `/admin/performance` should move to aggregate-first server data, and any supporting helper must remain admin-only under the same access-rule discipline as the dashboard RPC cleanup.

## Consultant Quality And Access Audit

- The 2026-06-07 specialist backlog refreshes were materially sharper than the older backlog state. Security, Trust & Reputation, Product Ops, Data, and Performance all removed stale findings and narrowed recommendations to current source or live evidence.
- Multiple specialists correctly recorded that Supabase capability depth varied by session. In this follow-up, the generic Supabase connector confirmed current `email-track` version `2`; future runs should still retry the project-scoped server before recording a generic-connector fallback.
- UX and UI appropriately downgraded findings that they could not freshly prove from route evidence today. That is the right behavior under the shared rules and should be preserved.
- The main remaining consulting-process gap is release evidence stability: `.env.qa` is now restored locally and `qa:env` passes after sourcing it, but authenticated smoke still needs fresh verification, GitHub workflow reachability has been intermittent, and session-variable Supabase capability depth still forces some roles to stop at source-backed recommendations earlier than they should.

## Team Rule Updates

No shared-rule changes were needed in this lead run. `docs/company-wide-rules.md`, `docs/consultant-team-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, and `docs/trust-reputation-backlog.md` were reviewed as current source-of-truth inputs and left unchanged.

This run updated `docs/lead-developer-recommendations.md` and appended the lead handoff entry to `docs/codex-edit-log.md` only. Publication status: intentionally left local because the worktree already contains unrelated specialist documentation changes and this run was a review-and-handoff pass, not a requested commit or push.

## Agent Inputs

- Date of run: 2026-06-07.
- Specialist backlog files reviewed: `docs/ux-optimization-backlog.md`, `docs/ui-optimization-backlog.md`, `docs/content-copyeditor-backlog.md`, `docs/accessibility-backlog.md`, `docs/security-review-backlog.md`, `docs/performance-engineering-backlog.md`, `docs/data-analytics-backlog.md`, `docs/product-ops-workflow-backlog.md`, `docs/trust-reputation-backlog.md`, `docs/b2b-marketing-growth-backlog.md`, and `docs/marketing-graphics-campaign-backlog.md`.
- Shared rules and handoff docs reviewed: `docs/agents/automation-prompts/trusted-bums-daily-lead-developer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/consultant-team-rules.md`, `docs/company-wide-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, `docs/codex-edit-log.md`, and the existing `docs/lead-developer-recommendations.md`.
- Repo, source, and route evidence reviewed: [supabase/functions/email-track/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/email-track/index.ts:7), [supabase/functions/portal-contacts/index.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/functions/portal-contacts/index.ts:474), [src/pages/client/ClientExports.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientExports.tsx:61), [src/pages/admin/AdminPerformanceMetrics.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminPerformanceMetrics.tsx:57), [src/App.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/App.tsx:16), `supabase/functions/send-admin-email/index.ts`, `supabase/migrations/20260529001000_add_admin_dashboard_summary.sql`, and `docs/business-access-rules.md`.
- Git and shell checks reviewed in the prior lead run: `git status --short`, `git diff --stat -- docs`, `git diff --name-only -- docs`, `rg`, `sed`, `nl`, and `[ -f .env.qa ] && echo .env.qa-present || echo .env.qa-missing` which returned `.env.qa-missing` at that time. Current setup work restored `.env.qa` and verified `qa:env` passes after sourcing it without printing secrets.
- Supabase MCP checks reviewed: `mcp__supabase_trustedbums.get_project_url`, `mcp__supabase_trustedbums.list_edge_functions`, `mcp__supabase_trustedbums.get_edge_function("email-track")`, `mcp__supabase_trustedbums.get_edge_function("send-website-email")`, `mcp__supabase_trustedbums.get_advisors(type: "security")`, `mcp__supabase_trustedbums.get_advisors(type: "performance")`, and follow-up generic Supabase connector `_get_project_url` plus `_get_edge_function("email-track")`.
- Current external guidance reviewed: [Supabase Securing your API](https://supabase.com/docs/guides/api/securing-your-api), [Clerk user metadata and unsafe metadata guidance](https://clerk.com/docs/guides/users/extending), [Google Email sender guidelines](https://support.google.com/a/answer/81126?hl=en-na), and [Microsoft SmartScreen unexpected block guidance](https://learn.microsoft.com/en-us/troubleshoot/microsoft-edge/development/unexpected-block-warning).
- Checks that could not run and why in the prior lead run: no authenticated local QA or browser route smoke ran because `.env.qa` was missing then; no broad GitHub-hosted workflow artifact review was rerun in that lead session; no live SQL catalog queries were available through the project-scoped Supabase toolset exposed in that run, so live Supabase validation was advisor- and edge-function-based rather than direct SQL/catalog proof. Current setup work restored `.env.qa` and confirmed `qa:env` passes; authenticated browser checks still need to be rerun.
