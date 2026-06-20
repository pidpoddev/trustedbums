# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-20 by Codex daily release verification automation._

## Release Decision

Decision: `HOTFIX-FORWARD` for current head `e231cc07ee6959bc8eac9d04ed3b68b80d76f6c4`.

Exact-head hosted proof on `https://trustedbums.com` is green on `e231cc0`, and the currently deployed primary host is healthy, but the release still needs a hotfix-forward closeout because two same-head gates are broken:

- [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still approves older head `b2c6c44`.
- Production Supabase still lacks `public.companies.deal_registration_config`, and the live migration ledger is also missing the current-head `20260620012000_add_route_advisor_indexes.sql` row.

Safest recovery path: prove or apply the missing live schema and migration parity on the current head, refresh exact-head Code Review, and then close the tracker rows against the same commit and run IDs. Rollback is not the first recommendation because the primary web deploy is healthy and the current evidence points to release-proof drift rather than a broad browser-surface outage.

## Evidence Summary

- GitHub `QA` run `27857690007` on `e231cc0`: passed.
- GitHub `Deploy TrustedBums to DreamHost` run `27857689995` on `e231cc0`: passed.
- GitHub `Visual UI Audit` run `27857691601` on `e231cc0`: passed.
- GitHub `E2E Smoke` run `27857708006` on `e231cc0`: passed, including `smoke`, `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`.
- GitHub workflow history shows no standalone `Deep QA Hotfix Audit` run on `e231cc0`; current deep-QA evidence comes from the deploy-triggered shards inside `E2E Smoke` `27857708006`.
- [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) still records `GO` for `b2c6c440f0301020a108d017f2817cc983c06b3b`.
- Current source uses `deal_registration_config` in [`src/pages/client/ClientProfile.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientProfile.tsx), [`src/pages/admin/AdminClients.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminClients.tsx), and [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts).
- Current repo migrations [`supabase/migrations/20260611195500_add_client_deal_registration_config.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260611195500_add_client_deal_registration_config.sql) and [`supabase/migrations/20260620012000_add_route_advisor_indexes.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260620012000_add_route_advisor_indexes.sql) are both absent from the live migration ledger, and live SQL still shows `companies.deal_registration_config` missing while the latest visible production migration row remains `20260619120328`.
- Current release provenance guard in [`scripts/verify-supabase-release-provenance.mjs`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/scripts/verify-supabase-release-provenance.mjs) checks live function metadata and prints local migration filenames. It does not compare local migrations to the live ledger or assert that required columns exist. That means the workflow can look provenance-gated while a live schema gap still escapes.
- Live Supabase function inventory still shows `send-admin-email` active at version `10`, so this run did not reproduce the earlier same-head function drift story on the current release lane.
- Raw shell `qa:env` still fails with missing exported QA variables, while sourced `.env.qa` `qa:env` and sourced `qa:target-preflight` on `https://trustedbums.com` pass without printing secrets.
- Runner-side external target `https://rcdl.tplinkdns.com` still fails sourced `qa:target-preflight` for `HTTPS` and `App shell`. Keep that as `TB-0024`, separate from primary-host release proof.
- Tracker closeout sweep found no new closure work beyond what is already live in `public.admin_scrum_items`: `TB-0018`, `TB-0055`, and `TB-0112` are closed on `e231cc0`; `TB-0019`, `TB-0024`, and `TB-0097` remain open.

## Failed Or Missing Checks

### P1 - [TB-0097] Same-head schema parity is still missing
- Evidence: exact-head source and current repo migration expect `companies.deal_registration_config`, but live production still lacks the column; the live migration ledger is also missing repo rows `20260611195500` and `20260620012000`.
- Impact: the client beta setup and company-profile governance lane cannot be called released, even though the static site and exact-head hosted workflows are green.
- Recommendation: prove or apply the missing schema on the live project before the next GO claim, then run the intended role matrix on the same head.
- Acceptance criteria: production has `companies.deal_registration_config`, current-head role QA proves `CLIENT_ADMIN` and `CLIENT_IT` setup behavior and deny-paths, and `TB-0097` closes with exact-head commit and run IDs.

### P1 - [TB-0019] Refresh exact-head Code Review for `e231cc0`
- Evidence: exact-head hosted proof is green, but the Code Review marker still names `b2c6c44`.
- Impact: release evidence is mixed-surface and stale across commits.
- Recommendation: keep release non-`GO` until Code Review refreshes on `e231cc0`.
- Acceptance criteria: [`.codex-review-decision.json`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.codex-review-decision.json) names `e231cc0...`, and `TB-0019` closes with matching exact-head hosted proof.

### P1 - [TB-0024] Runner-side external DNS target still fails independent proof
- Evidence: sourced `QA_BASE_URL=https://rcdl.tplinkdns.com corepack pnpm run qa:target-preflight` still fails `HTTPS` and `App shell`, while the current primary-host chain is green on `https://trustedbums.com`.
- Impact: external-host trust evidence remains unhealthy, but it should not overwrite primary-host release truth.
- Recommendation: keep `TB-0024` open separately until the host is repaired or retired from the authoritative contract.
- Acceptance criteria: sourced `qa:target-preflight` passes on `https://rcdl.tplinkdns.com`, or Ryan explicitly retires the host and the prompt, rules, and tracker all agree.

### Closed on current head
- `TB-0018` is closed: exact-head visual proof exists on `27857691601`.
- `TB-0055` is closed: env-evidence split remains guarded and documented.
- `TB-0112` is closed: deploy-triggered deep shards now retain preflight summaries on `27857708006`.

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
