# Trusted Bums Security Review Backlog

_Last updated: 2026-06-20 by Codex daily security engineer automation._

## Executive Read

Exact head `e231cc07ee6959bc8eac9d04ed3b68b80d76f6c4` now has clean hosted proof on the primary host: GitHub `QA` run `27857690007`, DreamHost deploy run `27857689995`, exact-head `Visual UI Audit` run `27857691601`, and deploy-triggered `E2E Smoke` run `27857708006` all completed `success` on 2026-06-20 UTC.

Live Supabase validation stayed strong until the connector throttled. This run confirmed deployed `admin-access-requests` v5, `client-team` v3, `invite-bum` v4, and `send-admin-email` v10, and the live source for those functions matches the current issuer-pinned Clerk verification plus the new proof and approval guards. Direct SQL also confirmed `claim_client_notification_previews` still uses `security_invoker=true`, `bum_inner_circle_companies` has RLS enabled, `prevent_reverse_opportunity_admin_field_self_update` is `SECURITY DEFINER` with no `anon` or `authenticated` execute grant, and no exposed public tables with `anon` or `authenticated` grants and RLS disabled were returned before the MCP connector hit `RATE_LIMITED`.

The active security queue remains `TB-0023` only. `TB-0089` and `TB-0111` stay closed on current live function and catalog evidence. The remaining exact-head concern is control-plane auditability, not a newly reproduced auth bypass: a direct migration-ledger query returned no rows for `20260619120000` or `20260620012000`, even though live objects from the former migration already exist.

## Active Recommendations

### P1 - [TB-0023] Keep leaked-password protection blocked only with a current explicit decision
- Evidence: this run had exact-head hosted proof, live function inventory, deployed source reads, and initial live SQL catalog checks, but still no direct Auth-settings visibility to confirm whether leaked-password protection is enabled or unavailable on the current plan. Current official Supabase password-security guidance still presents leaked-password protection as the expected baseline hardening path for password-backed auth.
- Why it matters: if any password-backed accounts remain active without leaked-password protection, previously compromised passwords can still be accepted unless another control fully compensates.
- Recommendation: enable leaked-password protection in Supabase Auth if the current plan and settings permit it. If it still cannot be enabled, keep `TB-0023` blocked only with a current owner, explicit accepted-risk decision, and compensating controls captured in the tracker and access docs.
- Acceptance criteria: live Auth settings show leaked-password protection enabled, or `TB-0023` records a current explicit owner, reason, and compensating-control decision.

## Business Rule Alignment

- `Claim notification previews`: the earlier business-rule mismatch remains closed. Live SQL still proves `claim_client_notification_previews` uses `security_invoker=true`, so the current read path respects caller RLS instead of bypassing it.
- `Client company identity review`: live `client-team` v3 lets active same-company client users create `COMPANY_IDENTITY_CHANGE` requests only as pending review records, and live `admin-access-requests` v5 now requires proof metadata, blocks conflicting domains, and avoids role elevation when approving those requests. That matches the current business rule that ordinary company profile edits may stay self-service while legal company name and approved domain changes require Trusted Bums Admin review.
- `Managing Bum recruiting`: live `invite-bum` v4 now requires a named referral source plus explicit trust confirmation before sending an invite and preserves that context in the audit trail and pending team attachment notes. That aligns with the invite-only, trust-confirmed Bum recruiting rule.
- `Admin email metrics`: live `send-admin-email` v10 adds `get_metrics`, but the operation still sits behind admin-only verification and this run did not surface a new email-table exposure or RLS bypass.
- `Admin scrum helper security`: the helper hardening remains closed. Live SQL still proves `sync_admin_scrum_item_owner_fields` keeps `search_path=public`, and the mutable-search-path advisor finding is no longer active for that helper.

## Time-Sensitive Threat Notes

- Runtime dependency risk remains low in this run: `corepack pnpm audit --prod --json` returned zero runtime advisories across `229` production dependencies.
- Supabase's April 28, 2026 Data API exposure change is now directly relevant to this repo's current migration pattern: new `public` tables need explicit grants alongside RLS instead of relying on old defaults. Keep shipping `GRANT` plus RLS and policies together for any new exposed table. [Supabase Changelog](https://supabase.com/changelog)
- Current official Supabase password-security guidance still keeps leaked-password protection as the expected baseline hardening path for password auth. That continues to justify leaving `TB-0023` open until the live control is visibly enabled or explicitly waived. [Supabase Password Security](https://supabase.com/docs/guides/auth/password-security)
- Current official Supabase guidance for auth-bearing Edge Functions still expects trusted authorization headers and server-owned verification flow rather than token-selected trust roots. That remains the rationale for keeping issuer pinning closed only on live deployed source, not repo grep alone. [Supabase Auth Headers](https://supabase.com/docs/guides/functions/auth-headers) [Supabase Securing Edge Functions](https://supabase.com/docs/guides/functions/auth)
- Clerk's current metadata guidance still says `unsafeMetadata` is frontend-writable, which keeps signup metadata in the onboarding-input category rather than the authorization-source-of-truth category. [Clerk User Metadata](https://clerk.com/docs/guides/users/extending)
- Clerk's current manual JWT-verification guidance still expects backends to verify with trusted key material or JWKS configuration. That remains the rationale for the live issuer-pinning proof that kept `TB-0089` closed in this run. [Clerk Manual JWT Verification](https://clerk.com/docs/guides/sessions/manual-jwt-verification)

## Watchlist

- `TB-0027` stays relevant as the release and control-plane umbrella for same-head Supabase provenance. This run's direct SQL did not find migration-ledger rows `20260619120000` or `20260620012000`, so release verification remains correct to keep the head out of `GO` even though sampled live auth and RLS evidence are clean.
- `TB-0102` remains a workflow watchlist item, not an active security finding. `admin-shared-mailbox` is no longer in the issuer-pinning risk class, but the live mailbox/category/access proof should keep moving with the product-ops queue.

## Access Requests And Evidence Gaps

- This run had partial strong Supabase access: live Edge Function inventory, deployed source reads for four current security-sensitive functions, and initial read-only SQL catalog checks all succeeded.
- The remaining gaps are now narrower and more specific than basic project reachability: direct Auth-settings visibility for leaked-password protection, same-head deployment ledger or migration-parity visibility, a seeded allow-or-deny token matrix for the highest-risk service-role paths, and dependable tracker-refresh SQL without MCP `RATE_LIMITED` bursts.
- Because the connector rate-limited after the initial successful SQL burst, this run could not complete a fresh live tracker-row refresh for `TB-0023` in the same session. Keep the item open from current source-backed plus partial-live evidence until tracker access stabilizes.

## Agent Inputs

- Date of run: 2026-06-20 (`America/New_York`)
- Files and docs reviewed: `docs/agents/automation-prompts/trusted-bums-daily-security-engineer.toml`; `docs/agents/consultant-team-rules.md`; `docs/agents/company-wide-rules.md`; `docs/agents/consultant-access-needs.md`; `docs/agents/business-access-rules.md`; `docs/business-access-rules.md`; `docs/consultant-access-needs.md`; `docs/codex-edit-log.md`; prior `docs/security-review-backlog.md`; `docs/release-verification-backlog.md`; `package.json`; `supabase/config.toml`; the current security-sensitive function source set under `supabase/functions/`; and the focused security tests under `src/test/`.
- Live Supabase inputs reviewed for project `vaoqvtxqvbptyxddpoju`: `list_edge_functions`; deployed source reads for `admin-access-requests`, `client-team`, `invite-bum`, and `send-admin-email`; direct SQL checking `supabase_migrations.schema_migrations` for versions `20260619120000` and `20260620012000` (returned no rows); direct SQL checking `claim_client_notification_previews` and `bum_inner_circle_companies`; direct SQL checking `prevent_reverse_opportunity_admin_field_self_update` and `sync_admin_scrum_item_owner_fields`; direct SQL checking current table grants for `admin_email_campaigns`, `admin_email_deliveries`, `admin_email_events`, `bum_inner_circle_companies`, and `client_company_access_requests`; and a direct SQL scan for exposed public tables with `anon` or `authenticated` grants and RLS disabled (returned no rows).
- GitHub evidence reviewed in this run: `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json databaseId,workflowName,status,conclusion,headSha,createdAt,updatedAt,displayTitle`.
- Local commands and checks reviewed: `git rev-parse HEAD`; `git status --short`; `git log --oneline --decorate -n 12`; targeted `git diff --stat`; targeted `git diff`; targeted `rg`; targeted `sed`; `corepack pnpm audit --prod --json`; and `corepack pnpm exec vitest run src/test/serviceRoleAuthorization.test.ts src/test/adminAccessReviewWorkflow.test.ts src/test/managingBumInvites.test.ts src/test/scrumFiveBatch.test.ts src/test/deploymentProvenance.test.ts`.
- Results: hosted exact-head QA, deploy, visual, and E2E are green on `e231cc0`; runtime dependency audit returned zero production advisories; the focused security and provenance Vitest pack passed `21/21`; live function and catalog evidence keeps `TB-0089` and `TB-0111` closed; `TB-0023` stays blocked pending Auth-settings visibility or explicit risk acceptance; and migration-ledger parity remains a watchlist and provenance problem rather than a newly reproduced auth defect.
- Internet sources reviewed: current official Supabase changelog guidance on Data API exposure; current official Supabase password-security guidance; current official Supabase auth-header and function-auth guidance; current official Clerk metadata guidance; and current official Clerk manual JWT-verification guidance.
- Checks that could not run and why: after the initial successful SQL burst, subsequent Supabase `_execute_sql` calls returned `RATE_LIMITED`, so fresh tracker-row refreshes and broader migration-ledger rereads were not dependable in the same session. This shell also still could not inspect live Supabase Auth settings directly and did not have a seeded live allow-or-deny token matrix for the current privileged-function set.
