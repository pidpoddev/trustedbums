# Trusted Bums Codex Edit Log

_Last updated: 2026-06-08 by Codex._

This file is the running handoff log for implementation work Codex has made in this repo. Specialist agents should read it before preserving backlog items so they can recheck shipped changes, downgrade stale recommendations, and add only the remaining gaps.

## Log Protocol

- Append a new dated entry after every Codex implementation or pushed handoff.
- Include the commit or branch when available, the user request, the files or surfaces changed, checks run, and specialist agents that should recheck the work.
- Do not paste secrets, raw private data, credential values, or mailbox contents.
- If a pushed commit included pre-existing dirty files outside the current implementation scope, call that out instead of implying Codex authored every line.

## Additional Agent Recheck Requests

### 2026-06-08 - Reconcile docs to final green current head

- Trigger: Ryan asked to do the next three cleanup items: refresh release docs, handle the stale Code Review marker, and clean the dirty specialist docs.
- Implementation branch: `main`.
- What changed: Updated `docs/release-verification-backlog.md`, `docs/lead-developer-recommendations.md`, and `docs/qa-test-backlog.md` from old `3e9118c` / `32 passed, 8 skipped` evidence to current head `441fd92` / `34 passed, 6 skipped`. Recorded that GitHub `QA` run `27167307017`, DreamHost deploy run `27167306961`, `E2E Smoke` run `27167339658`, and `Visual UI Audit` run `27167324836` all passed. Added current-state postscripts to the dirty specialist backlog batch so older `4402ace` extension-preflight notes remain historical rather than active release blockers.
- Code Review marker handling: did not create or rewrite `.codex-review-decision.json` because project rules reserve that file for a real Code Review Agent GO. The exact-marker requirement is explicitly waived for `441fd92` in the release and lead-developer docs because the current-head hosted gates are green and the final code delta was QA-selector-only.
- Worktree cleanup: removed stale `.env.qa` backup files without printing secret values; kept the specialist backlog updates as documentation changes.
- Checks run: `git status --short`, `git rev-parse HEAD`, GitHub run list/review through `/Users/macdaddy/bin/gh-trustedbums`, targeted `rg`, `sed`, `nl`, and `git diff --check`.
- Results: Docs now state the current release truth, the Code Review marker mismatch is documented as a waiver rather than a fake review, and the dirty specialist docs have current-state notes to prevent stale scrum decisions.
- Recheck agents: Lead Developer, Release Verification Agent, QA/Test Engineer, QA Harness Reliability Agent, Code Review Agent, Consultant Access Needs.
- Next run should verify: whether a real Code Review Agent should refresh `.codex-review-decision.json` for the next product-code push, and whether specialist agents should fully rewrite their backlogs against `441fd92` instead of carrying point-in-time postscripts.

### 2026-06-08 - Clean stale release-state docs after green current-head QA

- Trigger: Ryan asked to clean up the docs after current-head QA, deploy, and E2E were fixed and verified.
- Implementation branch: `main` with pre-existing unrelated specialist documentation edits already in the workspace.
- What changed: Rewrote `docs/release-verification-backlog.md`, `docs/lead-developer-recommendations.md`, and `docs/qa-test-backlog.md` so they no longer treat old commit `4402ace` and old E2E run `27112837432` as the active release state. The docs now point at current head `3e9118c`, green GitHub `QA` run `27163785478`, green DreamHost deploy run `27163785482`, and green GitHub `E2E Smoke` run `27163818009`.
- Main surfaces changed: `docs/release-verification-backlog.md`, `docs/lead-developer-recommendations.md`, `docs/qa-test-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: `git rev-parse --short HEAD`; `git status --short`; current GitHub run review from `/Users/macdaddy/bin/gh-trustedbums`; local contact-intake reproduction from the preceding fix; targeted `sed`, `rg`, and document diff review.
- Results: Release docs now record the current smoke result as `32 passed, 8 skipped`, explain the 8 expected skips, and move the next queue to current-head visual audit, exact Code Review marker refresh or waiver, public/client recovery UX, and seeded access-boundary proof.
- Recheck agents: Release Verification Agent, QA/Test Engineer, QA Harness Reliability Agent, Lead Developer.
- Next run should verify: hosted Visual UI Audit is refreshed on `3e9118c` or newer, `.codex-review-decision.json` is refreshed or explicitly waived for the release head, and the public/client recovery UX bundle is implemented next.

### 2026-06-08 - Refresh QA backlog against current-head extension gating

- Trigger: Trusted Bums daily QA Test Engineer automation reran after the QA backlog still centered on older auth/bootstrap regression evidence instead of the latest current-head hosted failures.
- Implementation branch: `main`.
- What changed: Rewrote `docs/qa-test-backlog.md` so it now reflects current head `4402ace`: GitHub `QA` run `27112822759` and DreamHost deploy run `27112822754` passed, while current-head `E2E Smoke` run `27112837432` failed before route execution because GitHub still lacks `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN`. The QA backlog now also reflects the cleaner local state: sourced `qa:env` fails only on the token, sourced `qa:target-preflight` fails only the extension gate after DNS/HTTPS/app-shell/Clerk pass, and `pnpm run qa` is green with 79 tests and production build.
- Main surfaces changed: `docs/qa-test-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: raw and sourced `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:target-preflight`; `corepack pnpm run qa`; `corepack pnpm exec vitest run src/test/routeGuards.test.tsx`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "QA" --limit 8 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "E2E Smoke" --limit 8 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --job 80013874698 --log-failed`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --job 80013933103 --log-failed`; and targeted review of current QA, release, security, performance, data, product-ops, trust, UI, UX, and accessibility backlogs.
- Results: Current release evidence remains `NO-GO`, but the active blocker is now accurately described as extension env drift rather than a live auth/bootstrap regression. Local QA is clean aside from the missing extension token. Worktree publication was intentionally left local because unrelated specialist-doc changes were already present in `docs/consultant-access-needs.md` and `docs/ux-optimization-backlog.md`.
- Recheck agents: Release Verification Agent, QA Harness Reliability Agent, Consultant Access Needs, Lead Developer.
- Next run should verify: GitHub Actions has both extension variables, local `.env.qa` has the token, current-head `E2E Smoke` clears preflight, and a current-head `Visual UI Audit` artifact exists.

### 2026-06-08 - Refresh performance backlog with live telemetry and current-head evidence

- Trigger: Trusted Bums daily performance engineer automation reran after the prior backlog still mixed older measurement notes with already-shipped aggregate telemetry work.
- Implementation branch: `main` with pre-existing unrelated dirty documentation files already in the workspace.
- What changed: Rewrote `docs/performance-engineering-backlog.md` to remove stale startup and raw-telemetry claims, anchor the active recommendations to current code plus fresh 2026-06-08 evidence, and distinguish measured route pressure from missing browser-timing proof. Narrowed the mirrored performance access requests in `docs/consultant-access-needs.md` so observability now reflects live GitHub workflow evidence and live Supabase Web Vitals aggregates instead of the older pre-aggregate state.
- Main surfaces changed: `docs/performance-engineering-backlog.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`.
- Checks run: `corepack pnpm run qa`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 8 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --json jobs`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --job 80013874698 --log-failed`; generic Supabase `_get_project_url`; generic Supabase `_get_advisors(type: performance)`; generic Supabase `_execute_sql` for telemetry counts and 7-day route aggregates; generic Supabase `_get_logs(service: "edge-function")`; `pnpm exec vite preview --host 127.0.0.1 --port 8080`; `lsof -nP -iTCP:8080 -sTCP:LISTEN`; official web.dev, React Router, and Vite guidance review.
- Results: Local QA passed with `79` tests. Current-head GitHub `QA` and DreamHost deploy passed on commit `4402ace`, while current-head `E2E Smoke` still failed before Playwright because hosted `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN` were blank while extension coverage was required. Live Supabase telemetry now shows `62,808` stored metric rows across `50` routes, with 7-day p75 LCP of `2036 ms` on `/client/dashboard`, `2000 ms` on `/client/reports`, `1944 ms` on `/client/exports`, `1932 ms` on `/bum/reports`, and `1656 ms` on `/admin/performance`. Local browser timing on the required port remains blocked because port `8080` is already occupied on this machine.
- Recheck agents: Performance Engineer, QA/Test Engineer, Release Verification Agent, QA Harness Reliability Agent, Lead Developer.
- Next run should verify: hosted extension preflight is fixed so current-head browser navigation can reach authenticated routes, `/admin/performance` gets one product-facing route proof on current head, and dashboard/report/export pages start moving from whole-list hydration to bounded server-side summaries.

### 2026-06-08 - Refresh daily security backlog with live audit evidence

- Trigger: Trusted Bums daily security engineer automation reran after the June 8 helper and release updates landed.
- Implementation branch: `main` with pre-existing unrelated dirty documentation files already in the workspace.
- What changed: Updated `docs/security-review-backlog.md` with fresh live Supabase advisor and SQL evidence, current-head GitHub `E2E Smoke` evidence, current dependency-audit output, and a new low-priority cleanup item for the unused `@clerk/chrome-extension` dependency that still pulls vulnerable `uuid@8.3.2`. Updated `docs/consultant-access-needs.md` so Supabase tooling status reflects currently callable read-only SQL and the extension QA blocker now distinguishes raw local shell, sourced `.env.qa`, and hosted GitHub env gaps accurately.
- Main surfaces changed: `docs/security-review-backlog.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`.
- Checks run: generic Supabase `_get_project_url`; `_get_advisors` for `security` and `performance`; `_get_logs` for `auth` and `edge-function`; `_execute_sql` for helper schemas, routine grants, and `public.profiles` policies; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 8 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --job 80013874698 --log-failed`; raw and sourced `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:target-preflight`; `corepack pnpm audit --prod --json`; `corepack pnpm exec vitest run src/test/serviceRoleAuthorization.test.ts src/test/supabaseHelperSecurity.test.ts src/test/extensionApiContract.test.ts src/test/customerTargetRules.test.ts`; `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`; `curl -I -L --max-time 20 http://rcdl.tplinkdns.com`.
- Results: Live Supabase security advisors still show only leaked-password protection disabled; current helper exposure remains narrowed to `private` plus the trigger-only public guard; targeted security tests passed; local sourced QA still lacks only `QA_EXTENSION_API_TOKEN`; current-head hosted `E2E Smoke` still lacks both extension API env vars; `pnpm audit --prod --json` now reports `uuid` through the unused Clerk extension package and `react-router` in unaffected `<BrowserRouter>` declarative mode; `https://rcdl.tplinkdns.com` still fails TLS verification from this runner.
- Recheck agents: Security Engineer, Consultant Access Needs, QA Harness Reliability Agent, Release Verification Agent, Lead Developer.
- Next run should verify: GitHub and local QA env parity for extension smoke, removal or replacement of the unused Clerk extension package if the dependency queue picks it up, and whether the Supabase org is upgraded enough to enable leaked-password protection.

### 2026-06-08 - Refresh UX backlog with QA-backed mobile consent evidence

- Trigger: Trusted Bums daily UX consultant automation reran to refresh the UX backlog against current source, current hosted workflow state, and a local `8080` preview that follows the consultant port rule.
- Implementation branch: `main`.
- What changed: Updated `docs/ux-optimization-backlog.md` to keep the existing signup, contact-form, client-access, and admin-handoff items that still survive current source review; added a new mobile first-visit consent-banner recommendation from fresh QA-backed local screenshots; refreshed the executive read, watchlist, and agent inputs so they distinguish hosted extension-preflight blockers from actual UX regressions and record that local preview evidence requires sourced `.env.qa`.
- Main surfaces changed: `docs/ux-optimization-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: `git status --short`; `git log --oneline -n 12`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 12 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Visual UI Audit" --limit 6 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --json jobs`; `corepack pnpm run lint`; `corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts src/test/clientExportsAccess.test.ts`; unsourced `corepack pnpm run build`; sourced `.env.qa` `corepack pnpm run build`; sourced `.env.qa` `corepack pnpm exec vite preview --host 0.0.0.0 --port 8080`; `curl -I http://127.0.0.1:8080`; local screenshots under `/private/tmp/trustedbums-ux-20260608`.
- Results: Lint, targeted regression tests, and both builds passed. Current-head hosted `QA` and DreamHost deploy still passed on `4402ace`, while current-head hosted `E2E Smoke` and all three Deep QA shards still failed before route navigation because hosted `QA_EXTENSION_API_BASE_URL` is blank while extension coverage is required. Fresh QA-backed mobile screenshots confirm the public site renders locally once `.env.qa` is sourced and show the privacy-choices banner covering most of the first mobile viewport.
- Recheck agents: UX Consultant, UI Consultant, Trust & Reputation Consultant, Accessibility Specialist, Legal/Compliance Reviewer, QA/Test Engineer, Lead Developer.
- Next run should verify: a current-head `Visual UI Audit` artifact exists for `4402ace`, hosted `E2E Smoke` can clear extension preflight, and any consent-banner layout revision keeps equal-prominence consent choices while exposing the hero and first CTA on mobile.

### 2026-06-08 - Refresh data analytics backlog against current source and live Supabase evidence

- Trigger: Trusted Bums daily data analytics engineer automation run.
- Implementation branch: `main` with pre-existing unrelated dirty documentation files already in the workspace.
- What changed: Rewrote `docs/data-analytics-backlog.md` to remove stale resolved finance items, keep only current evidence-backed analytics recommendations, and refresh the Business Access, Watchlist, and Agent Inputs sections. The active backlog now centers on admin email reporting governance, admin email analytics scale-readiness and KPI framing, and trimming terms-acceptance analytics payloads.
- Main surfaces changed: `docs/data-analytics-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: `corepack pnpm exec vitest run src/test/clientExportsAccess.test.ts src/test/financeReportsModel.test.ts src/test/accessBoundaryRegression.test.ts`; `set -a && source .env.qa >/dev/null 2>&1 && set +a && corepack pnpm run qa:env`; generic Supabase connector `_get_project_url`, `_get_advisors(security)`, `_get_advisors(performance)`, `_execute_sql` for safe aggregate table counts, `_execute_sql` for `terms_versions` content-length aggregates, `_execute_sql` for `pg_indexes`, and `_execute_sql` for `pg_policies`; current official-source review of Apple Mail Privacy Protection and Supabase Database Advisors guidance.
- Results: Targeted source regressions passed. Current live evidence confirms the older Client Finance export and finance-date backlog items should stay closed, that admin email data is still admin-only in RLS but missing from `docs/business-access-rules.md`, that admin email list operations remain capped at `50` rows, that live admin email volume is still `27` deliveries / `16` campaigns / `20` events, that `terms_acceptances` now has `19` rows, and that sourced `qa:env` still fails on missing `QA_EXTENSION_API_TOKEN`.
- Recheck agents: Data And Analytics Engineer, Security Engineer, Product Ops Workflow Analyst, Performance Engineer, QA/Test Engineer, Lead Developer.
- Next run should verify: whether `docs/business-access-rules.md` now documents admin email reporting access, whether admin email list endpoints gain aggregate or paginated summary support before volume exceeds the current sample cap, whether terms-acceptance reporting stops loading full legal bodies on analytics pages, and whether hosted/browser finance smoke can run once `QA_EXTENSION_API_TOKEN` is restored.

### 2026-06-08 - Refresh product ops backlog against current workflow evidence

- Trigger: Trusted Bums daily Product Ops Workflow Analyst automation reran because the existing backlog still carried resolved export and represented-contact findings alongside current workflow gaps.
- Implementation branch: `main`.
- What changed: Rewrote `docs/product-ops-workflow-backlog.md` to remove stale resolved recommendations, promote the current access-review workflow gap, narrow finance follow-up to exception handling after the business-date rollout, and keep raw extension-capture visibility aligned with the business rule. Updated `docs/consultant-access-needs.md` so the Supabase tooling request now reflects the actual 2026-06-08 connector surface: metadata, advisors, function inventory, and logs are live, while read-only SQL and safe aggregates are still missing.
- Main surfaces changed: `docs/product-ops-workflow-backlog.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`.
- Checks run: `corepack pnpm exec vitest run src/test/accessBoundaryRegression.test.ts src/test/clientExportsAccess.test.ts`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 8 --json ...`; Supabase connector checks for project metadata, project URL, security advisors, performance advisors, function inventory, edge-function logs, and Postgres logs on project `vaoqvtxqvbptyxddpoju`.
- Results: Targeted access-boundary tests passed. Current-head GitHub `QA` and deploy evidence remained green on `4402ace`, current-head `E2E Smoke` still failed before route navigation, and current-head `Visual UI Audit` was already running during this pass. Live Supabase evidence remained partial but current: the connector confirmed the right project, current advisors, active workflow functions, and recent transcript-sync activity, while read-only SQL and safe queue aggregates stayed unavailable.
- Recheck agents: Product Ops Workflow Analyst, Security Engineer, QA/Test Engineer, UX Consultant, Lead Developer.
- Next run should verify: the new current-head `Visual UI Audit` artifact for `4402ace`, current-head hosted route evidence after extension preflight inputs are restored, and whether Supabase read-only SQL becomes callable for live queue counts and policy validation.

### 2026-06-08 - Refresh B2B growth backlog against current intake friction and GTM evidence gaps

- Trigger: Trusted Bums daily B2B growth marketer automation reran after current UX, trust, product-ops, and route evidence sharpened where marketplace growth is actually constrained.
- Implementation branch: `main`.
- What changed: Rewrote `docs/b2b-marketing-growth-backlog.md` around the current Client-demand bottleneck instead of broad marketplace growth. The backlog now treats the mixed buyer and recruiting intake, signup and contact-form friction, proof-asset gap, founder and referral-led demand capture, invite-only Bum recruiting, and manual nurture discipline as the active growth work. Updated `docs/consultant-access-needs.md` with a durable GTM evidence request covering the missing brand strategy source, CRM or pipeline visibility, analytics, founder scripts, approved case studies, claims matrix, and channel-budget evidence.
- Main surfaces changed: `docs/b2b-marketing-growth-backlog.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`.
- Checks run: `git status --short`; `git log --since='2026-06-07 00:00' --name-only --pretty=format:'COMMIT %h %cs %s' -- docs src`; targeted `rg`; targeted `sed`; `corepack pnpm run lint`; `corepack pnpm run build`; reviewed current LinkedIn Marketing Solutions guidance, Gartner March 9 and May 20 2026 B2B buying press releases, Google sender guidance, ICO electronic-mail guidance updated April 28 2026, and FTC endorsement guidance.
- Results: Local lint passed with no errors and production build passed. Current source still shows a deeper Bum-side workflow set than public Client acquisition depth, while the latest UX evidence keeps the active public friction on mixed intake, inline recovery, and company-name persistence rather than a new route outage. Growth recommendations are now sharper, but still constrained by the missing brand strategy file and missing GTM performance evidence.
- Recheck agents: B2B Growth Marketer, UX Consultant, Content Copyeditor, Marketing Graphics Artist, Trust And Reputation Consultant, Product Ops Workflow Analyst, Data And Analytics Engineer, Lead Developer.
- Next run should verify: whether `docs/brand-strategy.md` or an equivalent approved brand source exists, whether CRM/analytics/founder-script evidence is available, and whether the Client-intake and public-form recovery changes have shipped.

### 2026-06-08 - Refresh trust and reputation backlog against current live evidence

- Trigger: Trusted Bums daily Trust & Reputation consultant automation reran after the prior backlog still carried an outdated canonical-host concern and older live-evidence wording.
- Implementation branch: `main`.
- What changed: Rewrote `docs/trust-reputation-backlog.md` to remove the stale host-redirect warning, keep only the trust issues that still survive current source plus live checks, and tighten the recommendations around four active gaps: mailbox-backed DMARC review, route-aware absolute metadata, baseline security headers, and the publicly downloadable pre-store extension zip. Updated `docs/consultant-access-needs.md` so the durable access record now reflects the current `rcdl.tplinkdns.com` TLS blocker and the latest hosted preflight evidence instead of older reachability framing.
- Main surfaces changed: `docs/trust-reputation-backlog.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`.
- Checks run: `git status --short`; `git log --oneline -n 12`; `git branch --show-current`; targeted `rg`; targeted `sed`; `curl -I -L --max-time 20 https://trustedbums.com`; `curl -I -L --max-time 20 https://trustedbums.com/robots.txt`; `curl -I -L --max-time 20 https://trustedbums.com/downloads/trustedbums-extension.zip`; `curl -I -L --max-time 20 https://www.trustedbums.com`; `curl -I -L --max-time 20 http://trustedbums.com`; `curl -I -L --max-time 20 http://www.trustedbums.com`; `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`; `curl -sL --max-time 20 https://trustedbums.com`; `curl -sL --max-time 20 https://trustedbums.com/privacy-policy`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 10 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --job 80013874698 --log-failed`.
- Results: Live `trustedbums.com` responded `HTTP/2 200`, all `http` and `www` variants redirected to `https://trustedbums.com/`, the public extension zip still returned `HTTP/2 200`, the live HTML shell still emitted generic root-relative metadata on both homepage and privacy page, the live response still lacked baseline security headers, the latest hosted `E2E Smoke` preflight corroborated DNS, HTTPS, and app-shell health before failing on missing extension API configuration, and `rcdl.tplinkdns.com` still failed TLS verification from this runner.
- Recheck agents: Trust And Reputation Consultant, Security Engineer, Lead Developer, Consultant Access Needs.
- Next run should verify: whether an authenticated admin can execute `dmarc-reports`, whether production now serves HSTS/CSP and route-aware absolute metadata, whether the extension zip has been removed from the public site, and whether `rcdl.tplinkdns.com` now presents a valid certificate chain.

### 2026-06-08 - Refresh release verification against current head 4402ace

- Trigger: Trusted Bums daily release verification automation reran after the finance-report release note itself landed on `main`.
- Implementation branch: `main`.
- What changed: Rewrote `docs/release-verification-backlog.md` against current head `4402ace` and the latest authoritative workflow evidence. The release decision stays `NO-GO`: GitHub deploy run `27112822754` and GitHub QA run `27112822759` passed for `4402ace`, but current-head `E2E Smoke` run `27112837432` failed before route navigation because `QA_EXTENSION_API_BASE_URL` is missing while extension coverage is required, and `QA_EXTENSION_API_TOKEN` is still absent. The refresh also records that the latest downloadable `Visual UI Audit` and standalone `Deep QA Hotfix Audit` artifacts are stale relative to current head, that sourced local `.env.qa` is present but still lacks the extension token, that `trustedbums.com` returns `HTTP/2 200` while `rcdl.tplinkdns.com` still fails TLS validation, and that live Supabase checks do not show a fresh hosted auth/bootstrap incident.
- Main surfaces changed: `docs/release-verification-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: `git status --short`; `git show --stat --summary --format=fuller 4402ace`; `git show --stat --summary --format=fuller 518aa53`; raw and sourced `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:target-preflight`; `corepack pnpm run qa`; `/Users/macdaddy/bin/gh-trustedbums run list --repo pidpoddev/trustedbums --limit 20 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --job 80013874698 --log-failed`; `/Users/macdaddy/bin/gh-trustedbums run list --repo pidpoddev/trustedbums --workflow "Visual UI Audit" --limit 6 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run list --repo pidpoddev/trustedbums --workflow "Deep QA Hotfix Audit" --limit 6 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run download 27112837432 --name playwright-report --dir /private/tmp/trustedbums-e2e-27112837432`; `curl -I -L --max-time 20 https://trustedbums.com`; `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`; Supabase project URL, advisors, edge-function inventory, edge-function logs, auth logs, Postgres logs, and migration inventory for project `vaoqvtxqvbptyxddpoju`.
- Results: Local QA passed with 79 tests and production build. Raw shell env remained empty; sourcing `.env.qa` restored the base contract and `QA_EXTENSION_API_BASE_URL`, but `QA_EXTENSION_API_TOKEN` is still missing locally. Hosted preflight artifact `test-results/qa-target-preflight/summary.json` from run `27112837432` confirms the current release blocker is still missing extension API workflow inputs, not a new public outage or auth regression. Pre-existing dirty files outside this release-update scope remained in `docs/consultant-access-needs.md` and `docs/ux-optimization-backlog.md`.
- Recheck agents: Release Verification Agent, Lead Developer, QA/Test Engineer, QA Harness Reliability Agent, Code Review Agent, Consultant Access Needs.
- Next run should verify: GitHub Actions has `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN`, current-head `E2E Smoke` reruns successfully, and current-head visual/deep artifacts are refreshed before declaring `GO`.

### 2026-06-08 - Refresh content copyeditor backlog against hosted visuals

- Trigger: Trusted Bums daily content copyeditor automation reran after the prior backlog still treated some rendering evidence as source-only and had not yet promoted the agreement-title mismatch into an active recommendation.
- Implementation branch: `main`.
- What changed: Rewrote `docs/content-copyeditor-backlog.md` against current commit `4402ace`, kept the agreement-recovery and prospect-terminology items that still survive current code, promoted the visible `Client Agreement` versus `Trusted Bums Partner Terms` mismatch into an active recommendation, removed stale local-preview and external-DNS blocker framing, and refreshed Agent Inputs to cite the current hosted Visual UI Audit artifact plus the latest narrow local checks.
- Main surfaces changed: `docs/content-copyeditor-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: `git rev-parse HEAD`; `git status --short`; `git log --since='7 days ago' --name-only --pretty=format:'COMMIT %h %cs %s' -- src docs tests`; targeted `rg` terminology scans across `src`, `tests`, and `docs`; `sed -n` review of the copyeditor prompt, shared rules, current backlog, `docs/qa-checklist.md`, and the live copy surfaces in `ClientDashboard`, `ClientProfile`, `ClientAgreements`, `ClientTerms`, `ClientRequests`, `SignupIntentDialog`, `ContactSubmissionsPanel`, `contactApi`, `BumProspects`, `BumLayout`, `BumReports`, `Index`, and `PortalGlobalSearch`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Visual UI Audit" --limit 5 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run download 27083467531 --repo Pidpoddev/trustedbums --name visual-ui-audit --dir /private/tmp/trustedbums-visual-27083467531`; reviewed hosted screenshots from that artifact; `corepack pnpm run lint`; `corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts src/test/termsContractRules.test.ts`; current W3C WCAG 2.2, Digital.gov, and GOV.UK guidance review.
- Results: Current hosted visual evidence for `4402ace` still shows four live copy issues: agreement-recovery CTAs route through `Company Profile`, the terms deferral button still says `Skip This Login`, the client agreement workspace mixes `Client Agreement` with `Trusted Bums Partner Terms`, and prospect terminology still collides across public, admin, and Bum surfaces. Local lint passed with no output, and the targeted vitest checks passed 6 of 6 tests.
- Recheck agents: UX Consultant, UI Consultant, Legal/Compliance Reviewer, QA/Test Engineer, Product Ops Workflow Analyst, Lead Developer.
- Next run should verify: whether agreement-recovery CTAs move to `/client/agreements` or `/client/terms`, whether the legal workspace and document title adopt one approved noun system, whether recruiting copy moves off `Bum Prospect`, and whether route inventories plus QA docs are updated in the same pass as the product copy.

### 2026-06-08 - Refresh lead developer scrum after overnight specialist updates

- Trigger: Trusted Bums daily lead developer scrum automation reviewed the latest specialist backlogs, hosted workflow evidence, and live Supabase metadata after the overnight UX/access and release handoffs landed.
- Implementation branch: `main`.
- What changed: Rewrote `docs/lead-developer-recommendations.md` so the lead queue now reflects current head `4402ace`, the live app commit `518aa53`, the current hosted `E2E Smoke` failure mode, the overnight UX/access-needs refresh, and the latest live Supabase connector evidence. The queue now centers the hosted extension-secret blocker, seeded access-boundary proof, the combined public/client recovery-path UX work, canonical-host plus security-header trust hardening, and the Supabase leaked-password plan gate.
- Main surfaces changed: `docs/lead-developer-recommendations.md`, `docs/codex-edit-log.md`.
- Checks run: `git rev-parse --short HEAD`; `git log --oneline -n 8 --decorate`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 12 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --json jobs,...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --job 80013874698 --log-failed`; `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:target-preflight`; generic Supabase connector `_get_project_url`, `_list_edge_functions`, and `_get_logs` for project `vaoqvtxqvbptyxddpoju`; reviewed current official Supabase, Cloudflare Turnstile, GOV.UK, and OWASP guidance.
- Results: Hosted `QA` and deploy remain green on `4402ace`; hosted `E2E Smoke` still fails at preflight because GitHub Actions has neither `QA_EXTENSION_API_BASE_URL` nor `QA_EXTENSION_API_TOKEN`; sourced local preflight fails only on missing `QA_EXTENSION_API_TOKEN`; live Supabase metadata and logs do not support a fresh hosted auth/bootstrap outage.
- Recheck agents: Release Verification Agent, QA Harness Reliability Agent, QA/Test Engineer, UX Consultant, Accessibility Specialist, Content Copyeditor, Trust And Reputation Consultant, Security Engineer, Product Ops Workflow Analyst, Lead Developer.
- Next run should verify: GitHub Actions and local `.env.qa` both have the extension API contract restored, current-head hosted `E2E Smoke` gets past preflight, a fresh `Visual UI Audit` artifact exists for `4402ace`, and the public/client recovery-path implementation receives route evidence plus Legal/Compliance review where required.

### 2026-06-08 - Refresh QA harness backlog against current-head extension gate

- Trigger: Trusted Bums daily QA Harness Reliability automation reran after the backlog still pointed at earlier current-head evidence and older active harness items.
- Implementation branch: `main`.
- What changed: Rewrote `docs/qa-harness-reliability-backlog.md` to anchor the backlog to current-head GitHub `E2E Smoke` run `27112837432` on commit `4402ace`, remove already-verified auth-helper and shard-alignment work from the active queue, and keep the remaining blocker focused on GitHub extension API secret parity plus artifact retention. The backlog now distinguishes raw shell, sourced `.env.qa`, and hosted workflow env state explicitly and leaves the June 8 auth/bootstrap incident as historical-only unless a future preflight-passing run reopens it.
- Main surfaces changed: `docs/qa-harness-reliability-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: raw `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:target-preflight`; `corepack pnpm exec vitest run src/test/deepQaTriage.test.ts src/test/qaTargetPreflight.test.ts`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --job 80013874698 --log-failed`; `/Users/macdaddy/bin/gh-trustedbums run download 27112837432 --dir /private/tmp/trustedbums-e2e-27112837432`.
- Results: Local raw `qa:env` still failed on the base contract, sourced `qa:env` failed only on `QA_EXTENSION_API_TOKEN`, sourced `qa:target-preflight` passed DNS/HTTPS/app-shell/Clerk and failed only the extension token gate, targeted harness regression tests passed, and current-head GitHub `E2E Smoke` still failed before Playwright because `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN` were missing in GitHub while `QA_EXTENSION_API_EXPECTATION=required`. Downloaded artifacts confirmed `qa-target-preflight` summaries were preserved for smoke and all three deep shards.
- Recheck agents: QA Harness Reliability Agent, Release Verification Agent, QA/Test Engineer, Lead Developer.
- Next run should verify: GitHub Actions has `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN`, current-head `E2E Smoke` clears preflight into Playwright, and no preflight-passing run reopens the older auth/bootstrap failure pattern.

### 2026-06-08 - Refresh UX backlog against current hosted evidence

- Trigger: Trusted Bums daily UX consultant automation reran after the prior UX backlog carried stale access assumptions and older route evidence.
- Implementation branch: `main`.
- What changed: Rewrote `docs/ux-optimization-backlog.md` to remove outdated GitHub and QA-env blocker claims, keep only the UX issues that still survive current source plus hosted evidence, and distinguish current access blockers from actual UX regressions. Updated `docs/consultant-access-needs.md` so GitHub workflow access and visual-artifact access are no longer described as unavailable, while preserving the remaining needs for current-head visual proof, extension-preflight inputs, and approved terminology sources.
- Main surfaces changed: `docs/ux-optimization-backlog.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`.
- Checks run: `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 12 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Visual UI Audit" --limit 6 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --json jobs`; `/Users/macdaddy/bin/gh-trustedbums run view 27112837432 --job 80013874698 --log-failed`; `/Users/macdaddy/bin/gh-trustedbums run download 27083467531 --name visual-ui-audit --dir /private/tmp/trustedbums-visual-27083467531`; reviewed hosted screenshots from that artifact; `corepack pnpm run lint`; `corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts src/test/clientExportsAccess.test.ts`; `corepack pnpm run build`.
- Results: Local lint, targeted regression tests, and production build passed. Current-head hosted `QA` and deploy passed, while current-head hosted `E2E Smoke` failed before route navigation because `QA_EXTENSION_API_BASE_URL` is still missing while extension coverage is required. Active UX backlog items are now limited to signup data preservation, contact-form recovery, client agreement/access recovery, and admin handoff triage.
- Recheck agents: UX Consultant, UI Consultant, Content Copyeditor, Accessibility Specialist, QA/Test Engineer, Legal/Compliance Reviewer, Lead Developer.
- Next run should verify: a current-head `Visual UI Audit` artifact exists for `4402ace`, hosted `E2E Smoke` can clear extension preflight and navigate real routes, and agreement-recovery copy/routing changes receive legal-owner review before implementation.

### 2026-06-08 - Refresh release verification for finance report rollout

- Trigger: Post-push release verification after re-keying finance reports to business dates.
- Implementation branch: `main`.
- What changed: Updated `docs/release-verification-backlog.md` for application commit `518aa53`. Local QA passed, GitHub deploy run `27112675263` succeeded, and GitHub QA run `27112675241` succeeded. Current-head `E2E Smoke` run `27112692015` failed in smoke plus all three Deep QA jobs because hosted extension API configuration is missing.
- Main surfaces changed: `docs/release-verification-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: `corepack pnpm run qa`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 8 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112692015 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112692015 --job 80013469092 --log-failed`.
- Results: Release decision remains `NO-GO`. The failed smoke log passed DNS, HTTPS, app shell, and Clerk, then failed with missing `QA_EXTENSION_API_BASE_URL` while `QA_EXTENSION_API_EXPECTATION=required`; `QA_EXTENSION_API_TOKEN` was also empty.
- Recheck agents: Release Verification Agent, QA/Test Engineer, QA Harness Reliability Agent, Lead Developer.
- Next run should verify: GitHub Actions has `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN`, rerun current-head `E2E Smoke`, and update release status from that result.

### 2026-06-08 - Re-key finance reports to business dates

- Trigger: Continue the recommended-task queue after aggregate admin-performance release verification showed extension API secrets are still the current release blocker.
- Implementation branch: `main`.
- What changed: Replaced the placeholder unit test with finance report behavior coverage. Client Finance reports, Client Admin combined finance reports, Admin finance operations, and Bum earnings now use `businessDate` fields derived from payment, invoice, and payout business-date helpers instead of filtering finance rows by audit `createdAt`. `createdAt` remains available as a hidden-by-default audit column.
- Main surfaces changed: `src/pages/client/ClientReports.tsx`, `src/pages/client/clientReportsModel.ts`, `src/pages/admin/AdminReports.tsx`, `src/pages/admin/adminReportsModel.ts`, `src/pages/bum/BumReports.tsx`, `src/pages/bum/bumReportsModel.ts`, `src/test/financeReportsModel.test.ts`, `docs/data-analytics-backlog.md`, `docs/qa-test-backlog.md`, `docs/lead-developer-recommendations.md`.
- Checks run: `corepack pnpm exec vitest run src/test/financeReportsModel.test.ts`; `corepack pnpm run lint`.
- Results: Focused finance report model coverage passed and lint passed. The remaining finance-date proof is hosted/browser or live seeded late-entry validation; extension API E2E remains separately blocked by missing QA extension configuration.
- Recheck agents: Data And Analytics Engineer, QA/Test Engineer, Lead Developer, Release Verification Agent.
- Next run should verify: full local QA, current-head GitHub QA/E2E after push, and whether browser/export walkthroughs can prove the report date filters with seeded late-entry rows.

### 2026-06-08 - Refresh release verification for aggregate rollout

- Trigger: Post-push release handoff after moving `/admin/performance` to aggregate route summaries.
- Implementation branch: `main`.
- What changed: Updated `docs/release-verification-backlog.md` from the prior `36a171c` live-head state to the new `ebbc4c5` aggregate-performance head. The release decision remains `NO-GO`: DreamHost deploy run `27112275422` and GitHub `QA` run `27112275428` succeeded, `https://trustedbums.com` returned `HTTP/2 200`, but current-head `E2E Smoke` run `27112291558` failed because the hosted workflow is missing required extension API configuration, and the on-disk Code Review marker is stale for this commit.
- Main surfaces changed: `docs/release-verification-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 12 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27111955744 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112291558 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27112291558 --job 80012364376 --log-failed`; `curl -I -L --max-time 20 https://trustedbums.com`.
- Results: `ebbc4c5` has deploy and hosted QA evidence, but not green release evidence. Current-head E2E passed DNS, HTTPS, app shell, and Clerk, then failed because `QA_EXTENSION_API_BASE_URL` is missing while `QA_EXTENSION_API_EXPECTATION=required`; all three Deep QA matrix jobs failed in the same hosted run.
- Recheck agents: Release Verification Agent, QA/Test Engineer, QA Harness Reliability Agent, Code Review Agent, Lead Developer.
- Next run should verify: extension API base URL and token are configured in GitHub Actions and `.env.qa`, rerun current-head `E2E Smoke`, and update the decision from that result.

### 2026-06-08 - Move admin performance to route aggregates

- Trigger: Continue the lead/performance queue after router future flags and Supabase Auth leaked-password protection verification.
- Implementation branch: `main`.
- What changed: Added live-backed `admin_performance_route_summary` migration and changed `/admin/performance` to render aggregate route rows instead of recent raw `performance_metric_events`. Updated the source regression so the page must use metric and route summary RPCs and must not import the raw event list. Refreshed performance, data, and lead backlogs with live migration and QA evidence.
- Main surfaces changed: `supabase/migrations/20260608020645_add_admin_performance_route_summary.sql`, `src/lib/portalApi.ts`, `src/pages/admin/AdminPerformanceMetrics.tsx`, `src/test/accessBoundaryRegression.test.ts`, `docs/performance-engineering-backlog.md`, `docs/data-analytics-backlog.md`, `docs/lead-developer-recommendations.md`.
- Checks run: `corepack pnpm exec vitest run src/test/accessBoundaryRegression.test.ts`; `corepack pnpm run qa`; `git diff --check`; `corepack pnpm run code-review:gate`; generic Supabase MCP `_apply_migration` for project `vaoqvtxqvbptyxddpoju`; `_list_migrations`; `_execute_sql` confirming the helper is security invoker; `_execute_sql` confirming non-admin context is denied; `_execute_sql` with a simulated admin JWT claim confirming route aggregates return p75/count fields; `_get_advisors` for security and performance.
- Results: Local QA passed, live migration `20260608020645 add_admin_performance_route_summary` is applied, non-admin SQL context is denied, simulated admin context returns aggregate rows, security advisors still show only the Supabase Auth leaked-password plan blocker, and performance advisors still show the older broad FK/policy backlog.
- Recheck agents: Performance Engineer, Data And Analytics Engineer, Security Engineer, QA/Test Engineer, Release Verification Agent, Lead Developer.
- Next run should verify: current-head hosted `/admin/performance` route smoke after deployment and whether the next release verification run can cite this commit instead of local-only evidence.

### 2026-06-08 - Refresh release verification for live commit 36a171c

- Trigger: Trusted Bums daily release verification automation rechecked current release evidence after the router future-flag commit reached `main`.
- Implementation branch: `main`.
- What changed: Rewrote `docs/release-verification-backlog.md` with current-head release evidence. The update records that `36a171c` is live through DreamHost deploy run `27111939535`, that GitHub `QA` run `27111939536` is still in progress, that the latest completed `E2E Smoke` runs for `fa1fdfb` and `30fc1fc` still fail on the required extension preflight gate, that the latest completed `Visual UI Audit` and standalone `Deep QA Hotfix Audit` are older than the live head, that sourced-local `qa:env` and `qa:target-preflight` still fail only on missing `QA_EXTENSION_API_TOKEN`, that local `qa` passes on a clean `36a171c`, that generic Supabase drift checks show only the leaked-password advisor plus healthy recent `profile-bootstrap`/`performance-beacon` traffic, and that the on-disk Code Review GO marker does not match the live head.
- Main surfaces changed: `docs/release-verification-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: `git fetch origin`; `git status --short`; sourced `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:target-preflight`; `corepack pnpm run qa`; `curl -I -L --max-time 20 https://trustedbums.com`; `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`; public GitHub Actions summary-page review for runs `27111939536`, `27111939535`, `27111730997`, `27111715090`, `27111541454`, `27083467531`, and `27092527987`; generic Supabase MCP `_get_project_url`, `_get_advisors`, `_list_edge_functions`, `_get_logs(edge-function)`, and `_get_logs(auth)`.
- Results: Current decision remains `NO-GO`. The live site is serving `36a171c`, but release trust is blocked by incomplete current-head GitHub evidence, the missing extension QA token, a stale exact-commit Code Review marker, and the unusable TLS state of the `rcdl.tplinkdns.com` fallback.
- Recheck agents: Lead Developer, Release Verification Agent, QA Harness Reliability Agent, Code Review Agent, Consultant Access Needs.
- Next run should verify: `QA` for `36a171c` has completed, the post-deploy `E2E Smoke` run for `36a171c` exists and reports whether extension coverage is still blocked, and `QA_EXTENSION_API_TOKEN` has been supplied locally and in GitHub secrets.

### 2026-06-08 - Enable router future flags after route splitting

- Trigger: Next implementable item from the lead/performance Scrum after extension API credentials and Supabase Auth leaked-password protection were blocked by missing external access.
- Implementation branch: `main`.
- What changed: Enabled React Router `v7_startTransition` and `v7_relativeSplatPath` in the app `BrowserRouter` and mirrored those flags in route-guard tests. Updated performance and lead backlogs so startup route splitting is no longer described as unresolved implementation work.
- Main surfaces changed: `src/App.tsx`, `src/test/routeGuards.test.tsx`, `docs/performance-engineering-backlog.md`, `docs/lead-developer-recommendations.md`.
- Checks run: `corepack pnpm exec vitest run src/test/routeGuards.test.tsx`; `corepack pnpm run qa`.
- Next run should verify: authenticated browser traces or telemetry for dashboard startup, then continue with server-computed admin performance aggregates.

### 2026-06-08 - Verify Supabase leaked-password protection blocker

- Trigger: Next lead/security item after extension API credentials were confirmed blocked by missing inputs.
- Implementation branch: `main`.
- What changed: Verified generic Supabase MCP access against Trusted Bums project `vaoqvtxqvbptyxddpoju` with table inventory, then used the logged-in Chrome Supabase dashboard to inspect Email Auth settings. The `PASSWORD_HIBP_ENABLED` setting was off, and Supabase rejected enabling it because leaked-password protection requires Pro plan or higher. The unsaved dashboard change was cancelled.
- Main surfaces changed: `docs/security-review-backlog.md`, `docs/lead-developer-recommendations.md`.
- Checks run: generic Supabase MCP table inventory for project `vaoqvtxqvbptyxddpoju`; Chrome dashboard check of Auth -> Sign In / Providers -> Email.
- Next run should verify: after the Supabase org/project is upgraded to Pro or higher, enable leaked-password protection and rerun security advisors.

### 2026-06-08 - Classify extension API preflight coverage

- Trigger: Continue the QA Harness Reliability queue after aligning Deep QA env checks.
- Implementation branch: `main`.
- What changed: Added `QA_EXTENSION_API_EXPECTATION=required|optional|skip` handling to `scripts/qa-target-preflight.mjs` and `scripts/verify-qa-env.mjs`. Hosted E2E and Deep QA workflows now set the expectation to `required`, so missing extension API inputs fail explicitly instead of producing a generic PASS. Optional or explicit-skip runs now record `SKIP` and `skippedChecks` in the preflight artifact. Updated `.env.qa.example`, regression tests, and `docs/qa-harness-reliability-backlog.md`.
- Main surfaces changed: `scripts/qa-target-preflight.mjs`, `scripts/verify-qa-env.mjs`, `.github/workflows/e2e-smoke.yml`, `.github/workflows/deep-qa-hotfix-audit.yml`, `.env.qa.example`, `src/test/qaTargetPreflight.test.ts`, `src/test/deepQaTriage.test.ts`, `docs/qa-harness-reliability-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: controlled required-mode preflight failure with `QA_EXTENSION_API_EXPECTATION=required`; controlled optional-mode preflight with `SKIP Extension API` and `skippedChecks` in `summary.json`; required-mode `qa:env` failure on missing extension base/token; skip-mode `qa:env` pass with base auth variables; `corepack pnpm exec vitest run src/test/deepQaTriage.test.ts src/test/qaTargetPreflight.test.ts`; `corepack pnpm run qa`; `git diff --check`; and `corepack pnpm run code-review:gate`.
- Results: Local preflight and env-contract checks now distinguish verified, skipped, and misconfigured extension coverage. Hosted workflows will now fail clearly until extension API base URL and token are configured.
- Recheck agents: QA Harness Reliability Agent, QA/Test Engineer, Release Verification Agent, Security Engineer.
- Next run should verify: GitHub-hosted E2E/Deep QA behavior after this workflow change; expected result is either green with extension inputs configured or a clear missing-extension-input failure that Release Verification can cite.

### 2026-06-08 - Align Deep QA env contracts

- Trigger: Continue the next QA Harness Reliability item after preflight artifacts were persisted.
- Implementation branch: `main`.
- What changed: Updated `.github/workflows/e2e-smoke.yml` so the Deep QA matrix job runs `pnpm run qa:target-preflight && pnpm run qa:env && pnpm run qa:deep`, matching `.github/workflows/deep-qa-hotfix-audit.yml`. Added regression coverage in `src/test/deepQaTriage.test.ts` and refreshed `docs/qa-harness-reliability-backlog.md`.
- Main surfaces changed: `.github/workflows/e2e-smoke.yml`, `src/test/deepQaTriage.test.ts`, `docs/qa-harness-reliability-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: `corepack pnpm exec vitest run src/test/deepQaTriage.test.ts src/test/qaTargetPreflight.test.ts`; `corepack pnpm run qa`; `git diff --check`; and `corepack pnpm run code-review:gate`.
- Results: Local workflow contract coverage now proves both Deep QA workflow entrypoints enforce the same preflight/env/deep chain. Full local QA remained green.
- Recheck agents: QA Harness Reliability Agent, QA/Test Engineer, Release Verification Agent.
- Next run should verify: the next hosted `E2E Smoke` Deep QA matrix run shows the `qa:env` stage before `qa:deep`, then handle extension coverage classification.

### 2026-06-08 - Persist QA target preflight artifacts

- Trigger: Continue the next implementable scrum item after hosted auth/bootstrap was verified green and the harness backlog was refocused.
- Implementation branch: `main`.
- What changed: Updated `scripts/qa-target-preflight.mjs` so every preflight run writes `summary.json` and `summary.txt` under `test-results/qa-target-preflight/` before exiting. Added regression coverage in `src/test/qaTargetPreflight.test.ts` and refreshed `docs/qa-harness-reliability-backlog.md`.
- Main surfaces changed: `scripts/qa-target-preflight.mjs`, `src/test/qaTargetPreflight.test.ts`, `docs/qa-harness-reliability-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: controlled failing preflight with `QA_BASE_URL=http://127.0.0.1:9` and `QA_TARGET_PREFLIGHT_OUTPUT_DIR=/private/tmp/trustedbums-preflight-artifact-test`; inspected generated `summary.json` and `summary.txt`; `corepack pnpm run qa`; `git diff --check`; and `corepack pnpm run code-review:gate`.
- Results: The controlled failure exited non-zero as expected and still wrote both artifact files, so hosted workflows should now upload preflight evidence through their existing `test-results/` artifact path.
- Recheck agents: QA Harness Reliability Agent, QA/Test Engineer, Release Verification Agent.
- Next run should verify: a real hosted preflight failure uploads `qa-target-preflight/summary.json` and `summary.txt`; then align `qa:env` enforcement between `E2E Smoke` deep shards and standalone Deep QA.

### 2026-06-08 - Recheck QA harness backlog after current-head deep shard success

- Trigger: Trusted Bums daily QA Harness Reliability automation revalidated the latest workflow state, harness helpers, env contract, and artifact behavior before refreshing the reliability backlog.
- Implementation branch: `main`.
- What changed: Rewrote `docs/qa-harness-reliability-backlog.md` so it no longer treats the Deep QA role split as unfinished work after GitHub `E2E Smoke` run `27110757594` passed smoke plus `Deep QA (admin|client|bum)` on commit `8fa0796`. The backlog now focuses on three harness defects: missing downloadable artifacts when `qa:target-preflight` fails before Playwright starts, inconsistent `qa:env` enforcement between `E2E Smoke` and standalone `Deep QA Hotfix Audit`, and hosted extension coverage being silently skipped when `QA_EXTENSION_API_BASE_URL` is unset.
- Main surfaces changed: `docs/qa-harness-reliability-backlog.md`, `docs/codex-edit-log.md`.
- Checks run: raw and sourced `corepack pnpm run qa:env`; sourced `corepack pnpm run qa:target-preflight`; `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 12 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27110757594 --json databaseId,headSha,status,conclusion,displayTitle,createdAt,updatedAt,jobs`; `/Users/macdaddy/bin/gh-trustedbums run view 27110095517 --json jobs`; `/Users/macdaddy/bin/gh-trustedbums run view 27110095517 --job 80006521915 --log-failed`; and `/Users/macdaddy/bin/gh-trustedbums run download` for runs `27110095517` and `27110757594`.
- Results: Current-head hosted E2E is green again, so the June 8 auth/bootstrap regression moved out of the active harness queue and remains only as a product-defect handoff history item. The remaining reliability gaps are workflow and evidence-contract issues, not a still-broken shard split.
- Recheck agents: QA Harness Reliability Agent, Release Verification Agent, QA/Test Engineer, Lead Developer.
- Next run should verify: a preflight-failed shard now uploads a downloadable summary artifact, `E2E Smoke` deep shards enforce the same env contract as standalone deep audit, and hosted extension coverage is reported as verified, intentionally skipped, or misconfigured instead of generic PASS.

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

### 2026-06-08 - Record hosted extension preflight evidence

- Trigger: Follow-up from the current-head hosted E2E failure after extension API required-mode classification landed.
- Implementation branch: `main`.
- What changed: Updated the QA harness reliability and release verification backlogs to cite GitHub `E2E Smoke` run `27111541454` on commit `fa1fdfb`. The docs now show that DNS, HTTPS, app shell, and Clerk passed, while hosted extension API preflight failed as intended because `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN` are absent under `QA_EXTENSION_API_EXPECTATION=required`.
- Main surfaces changed: `docs/qa-harness-reliability-backlog.md`, `docs/release-verification-backlog.md`.
- Checks run: GitHub run/job review for `27111541454`, downloaded preflight artifacts under `/private/tmp/trustedbums-e2e-27111541454`, and local documentation diff review.
- Next run should verify: once extension API base URL and token are configured, hosted `qa:env`, `qa:target-preflight`, and extension API smoke should move from preflight failure to authenticated allow/deny coverage.

### 2026-06-07 - Recheck UX backlog after finance regression narrowing

- Trigger: Daily UX consultant automation run.
- Implementation branch: Current local workspace with pre-existing unrelated documentation changes.
- What changed: Rewrote `docs/ux-optimization-backlog.md` for 2026-06-07 to keep only current evidence-backed UX recommendations. Preserved the signup company-name loss, public contact-form recovery, client blocked-route and agreement-recovery issue, and admin handoff triage gap. Downgraded the earlier finance payment-page issue from active backlog to watchlist because current source now includes regression coverage for updated signup copy, the single exact `Customer Payment Reports` heading, and page-title search prioritization in `src/test/e2eSmokeRegression.test.ts`, but this runner could not revalidate the deployed finance flow live. Updated `docs/consultant-access-needs.md` to capture the current QA env, local-preview, and GitHub-access blockers.
- Main surfaces changed: `docs/ux-optimization-backlog.md`, `docs/consultant-access-needs.md`.
- Checks run: `git status --short`; `git log --oneline -n 12 -- docs src tests .github package.json`; `git log --oneline -n 8 -- src/components/SignupIntentDialog.tsx src/pages/Index.tsx src/components/ClientAccessRoute.tsx src/pages/client/ClientDashboard.tsx src/components/PortalGlobalSearch.tsx src/pages/client/ClientPayments.tsx src/pages/admin/AdminHandoffs.tsx`; `corepack pnpm run qa:env`; `corepack pnpm run lint`; `corepack pnpm run build`; `corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts`; `gh run list --repo pidpoddev/trustedbums --limit 8`; `curl -I -L --max-time 15 https://rcdl.tplinkdns.com`.
- Recheck agents: UX Consultant, UI Consultant, Accessibility Specialist, QA/Test Engineer, Product Ops Workflow Analyst, Trust And Reputation Consultant, Lead Developer.
- Next run should verify: whether exported QA env variables are restored for consultant shells, whether GitHub-hosted `E2E Smoke` confirms the finance search path still lands on `/client/payments`, whether `/admin/handoffs` is added to visual audit coverage, whether local preview on `127.0.0.1:8080` is possible from the runner, and whether `rcdl.tplinkdns.com` is expected to present a publicly trusted TLS chain.

### 2026-06-08 - Recheck UI consultant backlog with current visual evidence

- Trigger: Trusted Bums daily UI consultant automation run.
- Implementation branch: `main`.
- What changed: Rewrote `docs/ui-optimization-backlog.md` to remove the stale `/admin/handoffs` coverage item, preserve the mobile chat/privacy collision and privacy-chip findings, add a new mobile reports-workspace scannability recommendation, and refresh Agent Inputs around the current GitHub visual-audit flow. Updated `docs/consultant-access-needs.md` so the GitHub Visual QA access request now reflects working repo-local `gh` controls and focuses on artifact freshness and retention instead of missing dispatch capability.
- Main surfaces changed: `docs/ui-optimization-backlog.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`.
- Checks run: `sed -n` review of agent prompts/rules/backlogs/access docs/workflow/spec/source files; `git log --oneline -n 12`; `git show --stat` for report surfaces; `/Users/macdaddy/bin/gh-trustedbums run list --workflow "Visual UI Audit"`; `/Users/macdaddy/bin/gh-trustedbums workflow run .github/workflows/visual-ui-audit.yml -f target_url=https://rcdl.tplinkdns.com -f roles=ADMIN,CLIENT_ADMIN,CLIENT_FINANCE,BUM`; repeated `/Users/macdaddy/bin/gh-trustedbums run view 27133730371`; `corepack pnpm run lint`; `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`; and hosted screenshot review from `/Users/macdaddy/tmp/trustedbums-visual-ui-27083467531`.
- Results: Local lint passed. Current UI recommendations stay grounded in the latest completed GitHub artifact plus current source. Fresh GitHub visual run `27133730371` was successfully dispatched against `https://rcdl.tplinkdns.com` but had not finished by doc update time. Local shell TLS verification for `https://rcdl.tplinkdns.com` still fails with `curl: (60) SSL certificate problem: unable to get local issuer certificate`.
- Recheck agents: UI Consultant, UX Consultant, Accessibility Specialist, QA/Test Engineer, Trust And Reputation Consultant, Lead Developer.
- Next run should verify: whether GitHub visual run `27133730371` completes cleanly with downloadable artifacts, whether the external DNS target presents a fully trusted certificate chain, and whether the mobile reports workspace or utility-rail issues change after the next shipped UI pass.

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

### 2026-06-08 - Refresh accessibility backlog with current local and hosted evidence

- Trigger: Trusted Bums daily Accessibility Specialist automation rechecked the current backlog, public routes, QA env contract, and standards guidance before refreshing accessibility recommendations.
- Implementation branch: Current local workspace with pre-existing unrelated documentation edits.
- What changed: Rewrote `docs/accessibility-backlog.md` for 2026-06-08, kept the four active accessibility findings, removed stale claims that `.env.qa` was absent and that local `127.0.0.1:8080` preview was unavailable, added current anonymous Playwright evidence from local `8080`, narrowed the remaining auth/browser gaps, and refreshed the matching accessibility access request in `docs/consultant-access-needs.md`.
- Main surfaces changed: `docs/accessibility-backlog.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`.
- Checks run: `git status --short`; `git log --since='2026-06-06 00:00' --name-only --pretty=format:'COMMIT %h %cs %s' -- docs/accessibility-backlog.md docs/consultant-access-needs.md src/components/ui/sidebar.tsx src/components/ui/sheet.tsx src/components/ui/dialog.tsx src/pages/Index.tsx src/components/SignupIntentDialog.tsx src/components/ConsentManager.tsx tests/e2e/staging-smoke.spec.ts tests/e2e/portal-interaction-audit.spec.ts tests/e2e/visual-ui-audit.spec.ts`; targeted `rg`, `sed`, and `nl`; `set -a; source .env.qa; set +a; QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:env`; `set -a; source .env.qa; set +a; QA_EXTENSION_API_EXPECTATION=skip corepack pnpm run qa:target-preflight`; `corepack pnpm run lint`; `set -a; source .env.qa; set +a; corepack pnpm run build`; `corepack pnpm exec vite preview --host 127.0.0.1 --port 8080`; `curl -I --max-time 20 http://127.0.0.1:8080`; `QA_BASE_URL=http://127.0.0.1:8080 QA_EXTENSION_API_EXPECTATION=skip corepack pnpm exec playwright test tests/e2e/staging-smoke.spec.ts --project=chromium --grep "loads public pages|lets anonymous visitors manage privacy choices|validates the signup intent dialog before Clerk handoff|redirects protected routes away from anonymous users"`; `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`; and current W3C WCAG/APG guidance review.
- Results: Local anonymous accessibility evidence is restored and current: the public landing page, privacy-choices flow, and sign-up intent dialog validation passed on local `8080`. The protected-route redirect check did not complete locally because anonymous `/admin` stayed on `Loading session...` instead of reaching `/login` within five seconds, so localhost still is not reliable evidence for authenticated portal accessibility. The required external DNS target `https://rcdl.tplinkdns.com` still fails TLS verification from this runner. The repo still lacks `@axe-core/playwright` or `axe-core`.
- Recheck agents: Accessibility Specialist, QA/Test Engineer, UI Consultant, UX Consultant, Lead Developer.
- Next run should verify: whether `rcdl.tplinkdns.com` regains TLS-valid browser reachability, whether authenticated portal routes can be exercised on a deployed target with fresh mobile screenshots, and whether automated axe coverage is finally wired into the repo.

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
