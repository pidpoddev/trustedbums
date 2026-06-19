# Trusted Bums Security Review Backlog

_Last updated: 2026-06-19 by Codex daily security engineer automation._

## Executive Read

Exact head `a17a85639a1b24dfda36da87d763eb4ecd3457af` now has clean hosted functional proof on the primary host: GitHub `QA` run `27798687806`, DreamHost deploy run `27798687708`, and deploy-triggered `E2E Smoke` run `27798711531` all completed `success` on 2026-06-19 UTC. Exact-head `Visual UI Audit` run `27810878263` is still `in_progress` as of this refresh, so visual artifact closure remains watchlist evidence rather than a finished gate.

Live Supabase validation is current in this run. Project `vaoqvtxqvbptyxddpoju` is active on Postgres `17.6.1.111`. `public.claim_client_notification_previews` still reports `security_invoker=true`, which keeps `TB-0108` closed live and in source. `public.sync_admin_scrum_item_owner_fields` still reports `proconfig = ["search_path=public"]`, which keeps `TB-0111` closed live and in source. Production dependency scanning stayed clean: `corepack pnpm audit --prod --json` returned zero runtime advisories across `229` production dependencies, and the focused security Vitest pack passed `32/32`.

The active security queue is now two items, but one of them changed shape materially since the prior refresh. `TB-0023` remains blocked because leaked-password protection is still not visible as enabled in live Auth settings and this shell still lacks Auth-setting visibility. `TB-0089` is no longer a repo-source gap on current head. Exact-head source now pins the allowed Clerk issuer across the remaining privileged functions, but sampled live Edge Function source is still stale on multiple deployed functions, so the real risk is repo-to-live control-plane drift until those functions are redeployed and same-head provenance is visible.

## Active Recommendations

### P1 - [TB-0089] Redeploy the issuer-pinned Clerk verifier to the live privileged Edge Function set
- Evidence: exact-head repo source on `a17a856` now uses pinned issuer verification across the remaining Clerk-backed privileged functions, and the focused tests passed `32/32` in `src/test/serviceRoleAuthorization.test.ts`, `src/test/supabaseHelperSecurity.test.ts`, `src/test/websiteEmailFunction.test.ts`, `src/test/adminAccessReviewWorkflow.test.ts`, and `src/test/extensionApiContract.test.ts`. Live deployed source is still stale on sampled functions including `extension-api-v1` version `6`, `portal-contacts` version `4`, `admin-access-requests` version `3`, `client-team` version `2`, `profile-bootstrap` version `4`, `send-admin-email` version `8`, `invite-bum` version `3`, `dmarc-reports` version `3`, `sync-clerk-users` version `2`, `clerk-user-tools` version `1`, `schedule-teams-meeting` version `7`, `sync-teams-attendees` version `2`, and `submit-feedback` version `2`, which still rely on token-selected issuer or JWKS resolution patterns instead of the pinned allowlist flow now present in repo source. Live `admin-shared-mailbox` and `clerk-impersonation` no longer represent the same issue class.
- Why it matters: these functions sit on admin, client-admin, mailbox, extension, or workflow surfaces that are supposed to trust only server-owned authorization boundaries. A token must not choose its own issuer trust root on those paths. The business rules in [docs/business-access-rules.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md) still require server-owned, auditable authorization for role, company, and admin workflows.
- Recommendation: redeploy the pinned issuer verifier to every remaining privileged Clerk-backed Edge Function, align any `verify_jwt` exceptions in `supabase/config.toml` with the intentional live posture, and record same-head deployment provenance so future security review can prove repo and live are on the same contract instead of inferring from mixed revisions.
- Acceptance criteria: sampled live function source shows the pinned issuer helper or equivalent allowed-issuer path rather than token-supplied issuer fallback; repo and live `verify_jwt` settings agree for each function; and release evidence proves the live function set matches exact head `a17a856`.

### P1 - [TB-0023] Keep leaked-password protection blocked only with a current explicit decision
- Evidence: this shell again had project inventory, read-only SQL, security-adjacent source review, live tracker access, and live Edge Function inventory, but still no Auth-settings visibility to confirm whether leaked-password protection is enabled or still unavailable on the current plan. Current official Supabase password-security guidance still presents leaked-password protection as the expected hardening path for password-backed auth.
- Why it matters: if any password-backed accounts remain active without leaked-password protection, previously compromised passwords can still be accepted unless another control fully compensates.
- Recommendation: enable leaked-password protection in Supabase Auth if the current plan and settings permit it. If it still cannot be enabled, keep `TB-0023` blocked only with a current owner, explicit accepted-risk decision, and compensating controls captured in the tracker and access docs.
- Acceptance criteria: live Auth settings show leaked-password protection enabled, or `TB-0023` records a current explicit owner, reason, and compensating-control decision.

## Business Rule Alignment

- `Claim notification previews`: the prior direct business-rule mismatch stays closed. Live SQL still proves `claim_client_notification_previews` uses `security_invoker=true`, so the current read path respects caller RLS instead of bypassing it.
- `Authorization-bearing admin and profile workflows`: the repo side is now aligned on exact head `a17a856`, but the live deployment is not yet aligned. `TB-0089` remains open because sampled live privileged functions still expose the older issuer-resolution pattern.
- `Admin scrum helper security`: the helper hardening remains closed. Live SQL still proves `sync_admin_scrum_item_owner_fields` now has `search_path=public`, and the mutable-search-path advisor finding is no longer active for that helper.
- `Public contact intake`: this run did not surface a new public-intake regression. Current source still keeps Turnstile verification, origin allowlisting, abuse throttling, and server-owned notification flow in the public intake path.

## Time-Sensitive Threat Notes

- Runtime dependency risk remains low in this run: `corepack pnpm audit --prod --json` returned zero runtime advisories across `229` production dependencies.
- Current official Supabase password-security guidance still keeps leaked-password protection as the expected baseline hardening path for password auth. That continues to justify leaving `TB-0023` open until the live control is visibly enabled or explicitly waived. [Supabase Password Security](https://supabase.com/docs/guides/auth/password-security)
- Current official Supabase guidance for auth-bearing Edge Functions still expects trusted authorization headers and server-owned verification flow rather than token-selected trust roots. That continues to justify treating the stale live issuer-resolution pattern as a real deployment risk, not a cosmetic code difference. [Supabase Auth Headers](https://supabase.com/docs/guides/functions/auth-headers) [Supabase Securing Edge Functions](https://supabase.com/docs/guides/functions/auth)
- Clerk's current metadata guidance still says `unsafeMetadata` is frontend-writable, which keeps signup metadata in the onboarding-input category rather than the authorization-source-of-truth category. [Clerk User Metadata](https://clerk.com/docs/guides/users/extending)
- Clerk's current manual JWT-verification guidance still expects backends to verify with trusted key material or JWKS configuration. That remains the rationale for pinning the allowed issuer in `TB-0089`. [Clerk Manual JWT Verification](https://clerk.com/docs/guides/sessions/manual-jwt-verification)

## Watchlist

- Exact-head hosted functional proof is green on `a17a856`, but `Visual UI Audit` run `27810878263` is still `in_progress` and should be rechecked before anyone treats the visual lane as closed on this head.
- `TB-0027` stays relevant as the release-control-plane umbrella for same-head Supabase function provenance. The current `TB-0089` finding is now a concrete example of why same-head function deployment proof matters.
- `TB-0102` stays on the workflow watchlist because `admin-shared-mailbox` is no longer in the issuer-pinning risk class but still has broader repo-versus-live drift under the product-ops refresh.

## Access Requests And Evidence Gaps

- This run again had strong project-scoped Supabase access: project inventory, read-only SQL, live tracker reads and writes, `list_edge_functions`, and deployed function source reads through `get_edge_function`.
- The remaining gaps are now narrower and more specific than basic project reachability: Auth-setting visibility for leaked-password protection, same-head deployment provenance or a live revision ledger for Supabase Edge Functions, and a seeded allow-or-deny matrix after the privileged functions are redeployed.
- Current `TB-0089` conclusions are stronger than the prior refresh because they are now backed by both repo-source review and sampled live deployed source, not just repo grep plus inventory.

## Agent Inputs

- Date of run: 2026-06-19 (`America/New_York`)
- Files and docs reviewed: `docs/agents/automation-prompts/trusted-bums-daily-security-engineer.toml`; `docs/agents/consultant-team-rules.md`; `docs/agents/company-wide-rules.md`; `docs/agents/consultant-access-needs.md`; `docs/agents/business-access-rules.md`; `docs/business-access-rules.md`; `docs/consultant-access-needs.md`; `docs/codex-edit-log.md`; prior `docs/security-review-backlog.md`; `docs/release-verification-backlog.md`; `supabase/config.toml`; the current privileged function source set under `supabase/functions/`; and the focused security tests under `src/test/`.
- Live Supabase inputs reviewed for project `vaoqvtxqvbptyxddpoju`: project metadata and engine version; direct SQL confirming `claim_client_notification_previews` `security_invoker=true`; direct SQL confirming `sync_admin_scrum_item_owner_fields` `search_path=public`; live tracker rows `TB-0023`, `TB-0089`, `TB-0108`, `TB-0111`, `TB-0027`, and `TB-0102`; live tracker refreshes for `TB-0023` and `TB-0089`; live Edge Function inventory; and deployed source reads for the sampled Clerk-backed functions listed above.
- GitHub evidence reviewed in this run: `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 8 --json databaseId,headSha,workflowName,status,conclusion,createdAt,updatedAt,displayTitle`.
- Local commands and checks reviewed: `git rev-parse HEAD`; targeted `rg`; targeted `sed`; `corepack pnpm audit --prod --json`; `corepack pnpm exec vitest run src/test/serviceRoleAuthorization.test.ts src/test/supabaseHelperSecurity.test.ts src/test/websiteEmailFunction.test.ts src/test/adminAccessReviewWorkflow.test.ts src/test/extensionApiContract.test.ts`; and targeted diff inspection.
- Results: hosted exact-head QA, deploy, and E2E are green on `a17a856`; exact-head `Visual UI Audit` is still in progress; dependency audit returned zero production advisories; focused security tests passed `32/32`; live SQL keeps `TB-0108` and `TB-0111` closed; `TB-0023` stays blocked pending Auth-setting visibility or explicit risk acceptance; and `TB-0089` is now accurately framed as live privileged-function deployment drift rather than a remaining repo-source gap.
- Internet sources reviewed: current official Supabase password-security guidance; current official Supabase auth-header and function-auth guidance; current official Clerk metadata guidance; and current official Clerk manual JWT-verification guidance.
- Checks that could not run and why: this shell still could not inspect live Supabase Auth settings directly, could not pull a same-head Edge Function deployment ledger, and did not run a fresh seeded live allow-or-deny token matrix against the stale functions.
