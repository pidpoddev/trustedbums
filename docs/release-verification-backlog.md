# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-20 by Codex TB-0097 closeout._

## Release Decision

Decision: `GO WITH WATCHLIST` for current head `a0142260f502446a2e0aacedea219f22df233c8e`.

Exact-head hosted proof on `https://trustedbums.com` is green on `a0142260`, the currently deployed primary host is healthy, and the live Supabase blocker behind `TB-0097` has been corrected. Production project `vaoqvtxqvbptyxddpoju` now has `public.companies.deal_registration_config` as `jsonb not null` with the expected default and object-shape check constraint. The live migration ledger includes `20260620134628 add_client_deal_registration_config`.

Remaining release watchlist items are no longer broad release blockers: `TB-0023` still needs Supabase Auth leaked-password setting visibility, and `TB-0049` still has route-adjacent advisor debt beyond the first low-risk index batch.

## Evidence Summary

- GitHub `QA` run `27869628177` on `a0142260`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27869628178` on `a0142260`: passed.
- GitHub `E2E Smoke` run `27869672430` on `a0142260`: passed, including `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- GitHub `Visual UI Audit` run `27869672437` on `a0142260`: passed.
- Current source uses `deal_registration_config` in [`src/pages/client/ClientProfile.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [`src/pages/admin/AdminClients.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx), and [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts).
- Live SQL now shows `public.companies.deal_registration_config` exists as `jsonb not null` with the expected default, and all `89` company rows have object-shaped config values.
- Live SQL shows `companies_deal_registration_config_object_check` enforcing `jsonb_typeof(deal_registration_config) = 'object'`.
- Sourced `.env.qa` hosted Playwright proof passed for Client Admin, Client Finance, and Client Member role smoke; hosted Client Admin visual audit passed through the Client Profile route.

## Failed Or Missing Checks

### Closed on current head
- `TB-0019` is closed: exact-head code review/proof drift was refreshed and exact-head hosted checks passed on `a0142260`.
- `TB-0024` is closed: `rcdl.tplinkdns.com` is retired from required proof, and `https://trustedbums.com` is the default public target.
- `TB-0097` is closed: live schema parity for `companies.deal_registration_config` is restored, source/backend role guards are covered, and hosted Client Admin profile proof passed.

## Cross-Agent Follow-Ups

### Release Verification Agent - local migration filenames are not schema provenance
- Current truth: the provenance script can pass while required live schema and migration ledger rows are still missing.
- Durable correction: when the reviewed range touches schema-backed UI/API behavior or migrations, compare live schema expectations or the live migration ledger to the repo before closing the item.

### Lead Developer - do not promote `GO` from exact-head hosted green alone
- Current truth: the web deploy and deep QA chain are green on `e231cc0`, but live schema parity is still incomplete.
- Durable correction: exact-head hosted success plus live function metadata is not enough when current routes or APIs depend on new columns.

### Product Ops Workflow Analyst - keep the client beta setup lane open until schema and role proof both land
- Current truth: the client profile and beta setup workflow still cannot be considered operationally real while the live column is absent.
- Durable correction: do not close workflow governance items from source wording or static deploy proof when the live schema is still missing.

## Agent Inputs

- Date of run: 2026-06-20 (`America/New_York`).
- Docs, files, and workflows reviewed:
  - `docs/agents/automation-prompts/trusted-bums-daily-release-verification-agent.toml`
  - `docs/agents/consultant-team-rules.md`
  - `docs/agents/company-wide-rules.md`
  - `docs/agents/consultant-access-needs.md`
  - `docs/agents/business-access-rules.md`
  - `docs/qa-test-backlog.md`
  - `docs/security-review-backlog.md`
  - `docs/trust-reputation-backlog.md`
  - `docs/lead-developer-recommendations.md`
  - `docs/release-verification-backlog.md`
  - `docs/product-ops-workflow-backlog.md`
  - `docs/codex-edit-log.md`
  - [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json)
  - [`scripts/verify-supabase-release-provenance.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/verify-supabase-release-provenance.mjs)
  - [`supabase/migrations/20260611195500_add_client_deal_registration_config.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260611195500_add_client_deal_registration_config.sql)
  - [`supabase/migrations/20260620012000_add_route_advisor_indexes.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260620012000_add_route_advisor_indexes.sql)
  - [`src/pages/client/ClientProfile.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx)
  - [`src/pages/admin/AdminClients.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx)
  - [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts)
- GitHub evidence reviewed:
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 40 --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27857690007 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27857689995 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27857691601 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27857708006 --repo Pidpoddev/trustedbums --json ...`
  - `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Deep QA Hotfix Audit" --limit 12 --json ...`
- Local checks reviewed:
  - raw `corepack pnpm run qa:env`
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://trustedbums.com corepack pnpm run qa:target-preflight`
  - sourced `.env.qa` `QA_EXTENSION_API_EXPECTATION=skip QA_BASE_URL=https://rcdl.tplinkdns.com corepack pnpm run qa:target-preflight`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`
  - `curl -I -L --max-time 20 http://rcdl.tplinkdns.com`
- Live Supabase checks reviewed for project `vaoqvtxqvbptyxddpoju`:
  - project health and URL
  - edge-function inventory plus live `send-admin-email` source read
  - live SQL for `information_schema.columns`, `supabase_migrations.schema_migrations`, and tracker rows
- Checks that could not fully close and why:
  - no exact-head Code Review marker exists yet for `e231cc0`
  - no live schema parity exists yet for `companies.deal_registration_config`
  - no standalone `Deep QA Hotfix Audit` run exists on `e231cc0`; current deep-QA evidence comes from deploy-triggered `E2E Smoke` shards instead
