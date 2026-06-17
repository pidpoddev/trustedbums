# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-17 by Codex daily lead developer automation._

## Executive Read

Current release status remains `HOLD-DEPLOY` for `main` head `af944fe27b0ed851ce2b85dae99304a5b0c3a0bd`.

- Completed work:
  - Reconciled the 2026-06-17 specialist wave against actual current head `af944fe`, current local worktree state, and the latest hosted evidence.
  - Independently confirmed exact-head hosted `Visual UI Audit` run `27671724557` completed `success` on `af944fe`, so the older release-verification note that no exact-head visual run existed is already stale.
  - Confirmed the real current release blockers are `TB-0105`, `TB-0106`, `TB-0019`, and `TB-0108`, not the older `TB-0054` or the older Supabase helper-exposure batch.
  - Confirmed current live security backlog narrowed to `TB-0108`, `TB-0089`, and access-blocked `TB-0023`; `TB-0081`, `TB-0085`, and `TB-0087` are already closed live and should not stay in the lead implementation queue.
- Current priorities:
  1. Fix `TB-0105` so the post-publish Bing Webmaster quota path cannot fail deploy completion or skip exact-head smoke.
  2. Land the already-started `TB-0106` follow-up from the pending local changes and rerun focused QA on the shipped head or its successor.
  3. Refresh exact-head Code Review under `TB-0019` once the next reviewable head is stable.
  4. Clear the remaining auth-boundary work under `TB-0108` and `TB-0089`, while keeping `TB-0023` blocked on missing Auth dashboard access.
  5. Then resume the workflow-ownership stack: `TB-0051`, `TB-0102`, `TB-0097`, `TB-0096`, `TB-0052`.
- Current blockers:
  - DreamHost deploy `27653495695` published the site, then failed on Bing Webmaster daily quota exhaustion, which caused exact-head `E2E Smoke` `27653527364` to skip.
  - [`.codex-review-decision.json`](.codex-review-decision.json) is stale on `f0996c5`, not `af944fe`.
  - Exact-head source still duplicates My Contacts rows after a detail-page claim, although a narrow local fix is already present in the working tree.
  - `public.claim_client_notification_previews` still lacks release-ready authorization proof and remains a live `SECURITY DEFINER` exposure concern under `TB-0108`.
- Recommended next actions:
  1. Make Bing Webmaster URL submission quota-aware best-effort after publish, then rerun deploy plus smoke.
  2. Isolate and commit the `TB-0106` local diff, then rerun the focused contacts or claims regression pack.
  3. Refresh Code Review for `af944fe` or its direct successor.
  4. Harden or replace the claim-notification preview view and continue the broader issuer-pinning sweep before reopening lower-priority workflow or UI work.

## Recommendation Classification

- `TB-0105 Keep Bing Webmaster quota from failing deploy after publish`: `READY`.
  - Reason: deploy `27653495695` failed only after rsync, Bing health, and IndexNow succeeded; the failing step is the Bing Webmaster URL batch quota branch, not the site publish.
  - Next owner: Lead Developer with Release Verification follow-through.
  - Implementation queue: yes.
- `TB-0106 Stop detail-page claims from duplicating My Contacts rows`: `READY`.
  - Reason: exact-head source still creates an extra manual represented-contact row after a suggested decision-maker-match claim, but the current worktree already contains the narrow follow-up to remove that side effect.
  - Next owner: Lead Developer with QA/Test review.
  - Implementation queue: yes.
- `TB-0019 Refresh exact-head Code Review for af944fe`: `READY`.
  - Reason: `main` advanced to `af944fe`, but [`.codex-review-decision.json`](.codex-review-decision.json) still records `GO` for `f0996c5`.
  - Next owner: Code Review Agent with Release Verification follow-through.
  - Implementation queue: yes, after the release path is coherent again.
- `TB-0108 Remove security definer from claim notification preview view and prove exact allow or deny behavior`: `READY`.
  - Reason: live security advisors still flag `public.claim_client_notification_previews`, current source keeps it in `public`, and this run still had no exact-head role matrix proving the view matches the business-access rule.
  - Next owner: Lead Developer with Security and Product Ops review.
  - Implementation queue: yes.
- `TB-0089 Pin Clerk issuer and JWKS resolution in remaining verify_jwt=false service-role Edge Functions`: `READY`.
  - Reason: current source still uses the token-supplied `iss` fallback in multiple active service-role functions even though newer functions already pin the expected Clerk issuer.
  - Next owner: Lead Developer with Security review.
  - Implementation queue: yes, after `TB-0108`.
- `TB-0023 Make an explicit leaked-password-protection decision`: `BLOCKED BY ACCESS`.
  - Reason: live Security Advisor still flags leaked-password protection disabled, but this run still had no Auth dashboard visibility to confirm enablement or record an explicit accepted-risk decision.
  - Next owner: Security Engineer plus the Auth dashboard owner.
  - Implementation queue: no.
- `TB-0055 Keep raw-shell, sourced, and hosted QA env states separate`: `READY`.
  - Reason: current specialists are now treating this correctly as a harness-contract reporting rule, not as a product defect.
  - Next owner: QA Harness Reliability Agent.
  - Implementation queue: no.
- `TB-0051 Make handoff aging reflect operator action and finish triage parity`: `READY`.
  - Reason: Product Ops still sees one live unowned `NEW` contact submission and still lacks due-date or last-touch parity across the other admin queues.
  - Next owner: Lead Developer with Product Ops review.
  - Implementation queue: yes, after release and auth cleanup.
- `TB-0102 Define the shared mailbox operating contract before first live inbox volume`: `READY`.
  - Reason: the schema and admin route are already deployed, but assignment, SLA, body-retention, and category-specific handling are still implicit.
  - Next owner: Lead Developer with Product Ops, Security, and Legal/Compliance review.
  - Implementation queue: yes, after release and auth cleanup.
- `TB-0097 Gate company profile ownership and beta role launch`: `READY`.
  - Reason: current source still lets generic client users update broad company-profile fields while live production still has no `CLIENT_IT` or `CLIENT_LEGAL` role traffic.
  - Next owner: Lead Developer with Product Ops and Security review.
  - Implementation queue: yes, after release and auth cleanup.
- `TB-0096 Do not send Client Members to an inaccessible commission-plan route`: `READY`.
  - Reason: same-day UX evidence still shows the role dead-end, and the local auth-bootstrap failure remains a harness issue, not closure proof.
  - Next owner: Lead Developer with UX and Product Ops review.
  - Implementation queue: yes, after release and auth cleanup.
- `TB-0052 Land finance and Managing Bum exception lanes before first live volume`: `READY`.
  - Reason: production now has Managing Bums and terms assignments, but the first finance or manager-allocation exception would still land in an interface without dedicated rescue lanes.
  - Next owner: Lead Developer with Product Ops and Finance review.
  - Implementation queue: yes, after `TB-0051`, `TB-0102`, and `TB-0097`.
- `TB-0044 Split Client Finance reporting into a finance-safe read model`: `READY`.
  - Reason: finance routes still hydrate operational relationship and reporter fields through shared client-report paths.
  - Next owner: Lead Developer with Data and Security review.
  - Implementation queue: yes.
- `TB-0047 Move high-traffic client routes off whole-list hydration and broad list helpers`: `READY`.
  - Reason: performance telemetry still clusters around shared list-heavy client routes and overlaps directly with the `TB-0044` data-shape problem.
  - Next owner: Lead Developer with Performance and Data review.
  - Implementation queue: yes, with `TB-0044`.
- `TB-0046 Make admin email metrics aggregate-first`: `READY`.
  - Reason: current admin-email reporting still leans on recipient-level reads and open-heavy headline metrics.
  - Next owner: Lead Developer with Data review.
  - Implementation queue: yes, after `TB-0044` and `TB-0047`.
- `TB-0032 Enlarge the collapsed Privacy choices launcher`: `READY`.
  - Reason: same-day accessibility proof still measures the dismissed launcher at approximately `53.58 by 20` CSS pixels.
  - Next owner: Lead Developer with Accessibility and UI review.
  - Implementation queue: yes, but below release, auth, workflow, and finance-safe data work.
- `TB-0024 Resolve or retire rcdl.tplinkdns.com`: `READY`.
  - Reason: `https://trustedbums.com` is healthy, but the required fallback target still fails TLS from this runner and should not be treated as healthy release context.
  - Next owner: Trust & Reputation Consultant plus the infrastructure owner.
  - Implementation queue: no.
- UI and UX route-level polish (`TB-0060`, `TB-0061`, `TB-0062`, `TB-0063`, `TB-0064`, `TB-0065`, `TB-0082`, `TB-0098`, `TB-0110`): `READY`.
  - Reason: exact-head visual and source evidence are current, but these remain behind release, auth, workflow, and finance-safe data work.
  - Next owner: Lead Developer with UI, UX, Accessibility, and QA review.
  - Implementation queue: yes, later.
- Content, graphics, and GTM wording or scale items (`TB-0036` through `TB-0042`, `TB-0080`, `TB-0100`, `TB-0101`, `TB-0109`): `BLOCKED BY ACCESS`.
  - Reason: same-day backlog refreshes are current, but approved language, brand strategy, CRM, and durable channel evidence are still missing.
  - Next owner: Founder and functional owners.
  - Implementation queue: no.

## Recommended Implementation Queue

### P0 - Fix the post-publish Bing quota path so exact-head hosted smoke can run
- Classification: `READY`.
- Source: [docs/release-verification-backlog.md](docs/release-verification-backlog.md), [docs/qa-test-backlog.md](docs/qa-test-backlog.md), [docs/qa-harness-reliability-backlog.md](docs/qa-harness-reliability-backlog.md), DreamHost deploy `27653495695`, exact-head `E2E Smoke` `27653527364`, and current Bing URL submission guidance on daily quotas and quota checks.
- Why now: this is the narrowest blocker preventing exact-head hosted smoke and deep interaction proof even though the site publish itself succeeded.
- Recommended fix: broaden the quota parser in the Bing submission path or make the post-publish Bing URL batch step fail soft once the publish and health checks are complete. Keep the quota signal in logs and summaries, but do not let it abort deploy-triggered smoke.
- Likely files/routes: `scripts/bing-webmaster-api.mjs`, `.github/workflows/deploy_dreamhost.yaml`, release workflow summaries, and any deploy wrapper that decides workflow success.
- Dependencies/risks: Release Verification needs a clean rerun afterward; avoid suppressing non-quota Bing failures that should still stop the workflow.
- Acceptance criteria: the next exact-head deploy can publish, log Bing quota exhaustion as non-blocking when applicable, and still allow smoke and downstream release evidence to run.
- Validation: rerun deploy and smoke on the next head, inspect the failed or warning branch logs, and confirm the workflow conclusion stays non-fatal for quota exhaustion.

### P0 - Land the exact-head duplicate-contact fix already present in the local worktree
- Classification: `READY`.
- Source: [docs/qa-test-backlog.md](docs/qa-test-backlog.md), [docs/release-verification-backlog.md](docs/release-verification-backlog.md), [src/pages/bum/BumOpportunityDetail.tsx](src/pages/bum/BumOpportunityDetail.tsx), and the current local diff in [src/test/opportunityClaimStakeholders.test.ts](src/test/opportunityClaimStakeholders.test.ts).
- Why now: `af944fe` introduced visible Bum contact deletion controls, so duplicate claim-backed versus manual contact rows now create obvious inconsistent behavior.
- Recommended fix: keep the current narrow diff: remove the detail-page `createBumRepresentedContact()` side effect for suggested decision-maker claims, retain cache invalidation for `bum-represented-contacts`, and keep one focused contract proving claim-backed rows remain the single source of truth.
- Likely files/routes: `src/pages/bum/BumOpportunityDetail.tsx`, `src/test/opportunityClaimStakeholders.test.ts`, and the related claim or contacts regression pack.
- Dependencies/risks: QA should verify this does not regress the intended post-claim refresh or the represented-contact list for non-claim sources.
- Acceptance criteria: a detail-page claim yields only the claim-backed My Contacts row, no extra manual `bum_contacts` row is created, and the regression remains covered by focused contract or browser proof.
- Validation: focused Vitest pack, hosted QA on the successor head, and one populated-state My Contacts proof after a detail-page claim.

### P0 - Refresh exact-head Code Review once the next reviewable head is stable
- Classification: `READY`.
- Source: [`.codex-review-decision.json`](.codex-review-decision.json), [docs/release-verification-backlog.md](docs/release-verification-backlog.md), and [docs/qa-test-backlog.md](docs/qa-test-backlog.md).
- Why now: current release notes cannot claim a valid exact-head Code Review decision while the marker remains pinned to `f0996c5`.
- Recommended fix: rerun Code Review immediately after the `TB-0105` and `TB-0106` work settles onto the next reviewable head, then let Release Verification update the release ledger against that same SHA.
- Likely files/routes: [`.codex-review-decision.json`](.codex-review-decision.json), release or QA handoff docs, and the related tracker row.
- Dependencies/risks: any new push invalidates the current marker again; do not treat the old `GO` as reusable evidence for `af944fe`.
- Acceptance criteria: the review marker points at `af944fe` or its direct successor, and `TB-0019` can close with matching exact-head review evidence.
- Validation: fresh Code Review output, updated marker file, and matching tracker closeout.

### P1 - Replace the old auth-boundary batch with the real current security queue
- Classification: `READY`.
- Source: [docs/security-review-backlog.md](docs/security-review-backlog.md), [docs/release-verification-backlog.md](docs/release-verification-backlog.md), current claim-preview migration in [supabase/migrations/20260616124500_add_claim_client_notification_previews.sql](supabase/migrations/20260616124500_add_claim_client_notification_previews.sql), live portal read path in [src/lib/portalApi.ts](src/lib/portalApi.ts), and current Clerk verification guidance.
- Why now: the older helper and claim-sync items are already closed live, so the real remaining security work is now a narrower but still release-relevant queue: `TB-0108`, `TB-0089`, then access-blocked `TB-0023`.
- Recommended fix: move the claim preview read path to a security-invoker or private-schema or server-owned pattern that matches the business rule, then finish issuer pinning across the remaining `verify_jwt = false` service-role Edge Functions.
- Likely files/routes: `supabase/migrations/20260616124500_add_claim_client_notification_previews.sql`, `src/lib/portalApi.ts`, the affected Supabase Edge Functions using issuer fallback, and the related auth tests.
- Dependencies/risks: Product Ops and Security need exact allow or deny expectations for Admin, same-company client users, foreign-company users, Bums, and public callers; release validation must recheck live advisors after deploy.
- Acceptance criteria: `claim_client_notification_previews` no longer trips the security-definer warning or has explicit exact-head allow or deny proof, remaining service-role functions stop deriving JWKS trust from token-supplied issuer data, and live security advisors narrow to the access-blocked `TB-0023` item or better.
- Validation: live Security Advisor rerun, direct role-matrix proof where callable, focused auth tests, and hosted release verification on the exact head.

### P1 - Finish the workflow-ownership and operator-contract stack
- Classification: `READY`.
- Source: [docs/product-ops-workflow-backlog.md](docs/product-ops-workflow-backlog.md), [docs/ux-optimization-backlog.md](docs/ux-optimization-backlog.md), [docs/ui-optimization-backlog.md](docs/ui-optimization-backlog.md), and current source in the admin handoff, inbox, client profile, and opportunity flows.
- Why now: this stack remains the highest-value non-release work because it resolves live queue ambiguity, route dead-ends, mailbox readiness, and over-broad client write authority together.
- Recommended fix: add last-touch or due-date semantics across admin queues, make the shared mailbox contract explicit before first live volume, narrow company-profile write authority to approved roles and fields, remove the Client Member commission-plan dead-end, and define the first finance or Managing Bum exception lanes before volume arrives.
- Likely files/routes: `src/pages/admin/AdminHandoffs.tsx`, `src/components/admin/ContactSubmissionsPanel.tsx`, `src/pages/admin/AdminInbox.tsx`, `src/layouts/ClientLayout.tsx`, `src/pages/client/ClientOpportunityNew.tsx`, `src/pages/client/ClientProfile.tsx`, `src/lib/portalApi.ts`, and [docs/business-access-rules.md](docs/business-access-rules.md).
- Dependencies/risks: Product Ops, Security, UX, and Legal/Compliance all have real stakes here; do not land route or auth changes without allow or deny proof for the affected roles.
- Acceptance criteria: operator queues show actionable next-step state, Client Members are not sent to inaccessible finance routes, generic client roles cannot mutate broad company identity fields by default, and mailbox or finance exceptions have an explicit operating contract before live volume depends on them.
- Validation: targeted role smoke, direct data-path allow or deny checks, updated business-access rules where needed, and Product Ops live queue review.

### P2 - Sequence the finance-safe reporting and route-shape stack
- Classification: `READY`.
- Source: [docs/data-analytics-backlog.md](docs/data-analytics-backlog.md), [docs/performance-engineering-backlog.md](docs/performance-engineering-backlog.md), and current client-report or admin-email source paths.
- Why now: `TB-0044` and `TB-0047` still share the same route-shape problem, and `TB-0046` should not be solved on top of a recipient-level read model.
- Recommended fix: split Client Finance onto a finance-safe read model, reduce high-traffic client routes that still hydrate broad lists, then move admin-email reporting toward aggregate-first KPIs.
- Likely files/routes: `src/lib/portalApi.ts`, `src/pages/client/clientReportsModel.ts`, `src/pages/client/clientExportsModel.ts`, `src/pages/client/ClientReports.tsx`, `src/pages/client/ClientExports.tsx`, `src/pages/client/ClientPayments.tsx`, `src/pages/admin/AdminEmails.tsx`, and the related Supabase query surfaces.
- Dependencies/risks: Security and Data need to lock the finance-safe contract first; Performance should validate route-specific improvements rather than bundle-level assumptions alone.
- Acceptance criteria: Client Finance no longer hydrates operational relationship or reporter fields, high-traffic client routes stop loading broad lists by default, and admin-email headline metrics no longer depend on recipient-level open rows.
- Validation: targeted data-access tests, performance rechecks on the affected routes, and live advisor or telemetry re-review.

### P2 - Batch the deferred mobile readability and accessibility stack after higher-risk work clears
- Classification: `READY`.
- Source: [docs/accessibility-backlog.md](docs/accessibility-backlog.md), [docs/ux-optimization-backlog.md](docs/ux-optimization-backlog.md), and [docs/ui-optimization-backlog.md](docs/ui-optimization-backlog.md).
- Why now: these issues are still current and evidence-backed, but they are not stronger business or release risks than the release, auth, workflow, or finance-safe work above.
- Recommended fix: batch route-level mobile fixes by shared surface, including the privacy launcher, reports workspace, client opportunity flows, and the public marketing headers.
- Likely files/routes: `src/components/ConsentManager.tsx`, `src/pages/PrivacyPolicy.tsx`, reports workspace surfaces, `src/pages/client/ClientOpportunityNew.tsx`, `src/pages/BumLanding.tsx`, and `src/pages/Index.tsx`.
- Dependencies/risks: UI, UX, and Accessibility should review the same implementation; do not treat `TB-0032` as closed until rendered proof shows a compliant hit area.
- Acceptance criteria: the targeted mobile route issues close without reopening broader density or trust concerns.
- Validation: exact-head visual reruns, targeted mobile screenshots, and focused accessibility proof.

## Fix Playbooks

- Release proof playbook:
  - Fix `TB-0105` first so deploy-triggered smoke can run again on the same head.
  - Land `TB-0106` immediately after, because the local diff is already narrow and ready for isolated validation.
  - Refresh Code Review on the direct successor head once the release path is stable.
- Security playbook:
  - Treat `TB-0108` as the first release-relevant auth item because it is both live-advisor-backed and business-rule-sensitive.
  - Fold `TB-0089` behind it as the broader service-role issuer-pinning sweep.
  - Keep `TB-0023` visible as blocked-by-access until the dashboard owner can make or document the decision.
- Workflow playbook:
  - Land `TB-0051` and `TB-0102` as the operator-contract pair.
  - Then narrow `TB-0097` plus `TB-0096` with shared Product Ops, Security, and UX sign-off.
  - Stage `TB-0052` only after the queue-ownership and profile-write boundaries are explicit.

## Cross-Backlog Dependencies

- `TB-0105`, `TB-0106`, and `TB-0019` now form the exact-head release proof chain. Fixing one without the others still leaves the release ledger incomplete.
- `TB-0108` and `TB-0089` should move as one narrowed auth-boundary review because both touch exposed or privileged Supabase read paths and require role-accurate allow or deny proof.
- `TB-0051`, `TB-0102`, `TB-0097`, and `TB-0096` define who is allowed to act, who owns follow-up, and which routes are safe for each role. They should stay sequenced together.
- `TB-0044` and `TB-0047` still share the same client-route payload shape and should be designed together before `TB-0046`.
- `TB-0032` and the broader mobile UI or UX stack should be fixed in the same route passes, but only after higher-risk release, security, workflow, and data work clears.

## Release Verification Handoff

- Current verdict: `HOLD-DEPLOY`.
- Current exact-head hosted evidence on `af944fe`:
  - GitHub `QA` `27653495600`: passed.
  - DreamHost deploy `27653495695`: published successfully, then failed on Bing Webmaster daily quota exhaustion.
  - `E2E Smoke` `27653527364`: skipped because deploy concluded `failure`.
  - `Visual UI Audit` `27671724557`: completed `success` on `af944fe`.
- Current exact-head release blockers:
  - `TB-0105`: post-publish Bing quota handling still aborts deploy conclusion and skips smoke.
  - `TB-0106`: exact-head source still duplicates My Contacts rows after a detail-page claim, although a local fix is already in progress.
  - `TB-0019`: Code Review marker is stale on `f0996c5`.
  - `TB-0108`: claim-notification preview view still lacks release-ready authorization proof.
- Current non-blocking but still active follow-up:
  - `TB-0089`: remaining service-role issuer pinning.
  - `TB-0023`: leaked-password protection decision remains blocked on dashboard access.
  - `TB-0024`: `rcdl.tplinkdns.com` still fails TLS and should not be treated as healthy hosted release context.

## Consultant Quality And Access Audit

- Release Verification did the important tracker and live-state reconciliation work, but its checked-in backlog is already stale on one point: exact-head `Visual UI Audit` `27671724557` later completed successfully and should be rebased in the next release pass. The blocker mix is still correct after that rebasing.
- QA and QA Harness quality is strong. They kept the queue narrow, confirmed `TB-0054` is closed, separated raw-shell versus sourced QA env state correctly, and isolated the two real current issues: `TB-0105` and `TB-0106`.
- Security quality is strong and materially improved over the older lead snapshot. The current queue is narrower, live-advisor-backed, and should replace the older carry-forward auth batch in the lead queue.
- Product Ops, UX, UI, Accessibility, Data, Content, Growth, Trust, and Marketing Graphics all refreshed current-head evidence without creating queue churn. The access-blocked GTM and content stack should remain out of the engineering implementation queue until the approved-language and analytics gaps close.

## Team Rule Updates

- No lead-developer rule, access, business-access, or trust-rule doc changes were required in this run.
- Same-day specialists already refreshed [docs/consultant-access-needs.md](docs/consultant-access-needs.md) where the access story changed materially.
- No commit or push was attempted from this run because the worktree already contains broad pre-existing specialist doc edits plus a local product fix in progress; this pass only refreshed the lead handoff and edit log.

## Agent Inputs

- Date of run: 2026-06-17.
- Specialist backlog files reviewed:
  - `docs/release-verification-backlog.md`
  - `docs/qa-test-backlog.md`
  - `docs/qa-harness-reliability-backlog.md`
  - `docs/security-review-backlog.md`
  - `docs/trust-reputation-backlog.md`
  - `docs/data-analytics-backlog.md`
  - `docs/performance-engineering-backlog.md`
  - `docs/product-ops-workflow-backlog.md`
  - `docs/ux-optimization-backlog.md`
  - `docs/ui-optimization-backlog.md`
  - `docs/accessibility-backlog.md`
  - `docs/content-copyeditor-backlog.md`
  - `docs/b2b-marketing-growth-backlog.md`
  - `docs/marketing-graphics-campaign-backlog.md`
  - `docs/consultant-access-needs.md`
  - `docs/business-access-rules.md`
  - `docs/company-wide-rules.md`
  - `docs/codex-edit-log.md`
- Lead-level checks run in this session:
  - `git rev-parse --short HEAD`
  - `git status --short`
  - `git log --oneline --decorate -10`
  - `cat .codex-review-decision.json`
  - `git diff -- src/pages/bum/BumOpportunityDetail.tsx src/test/opportunityClaimStakeholders.test.ts`
  - `/Users/macdaddy/bin/gh-trustedbums run view 27671724557 --json databaseId,workflowName,headSha,status,conclusion,updatedAt,url,displayTitle`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`
  - `curl -I -L --max-time 20 http://rcdl.tplinkdns.com`
- Current internet sources reviewed:
  - [Bing URL Submission](https://www.bing.com/webmasters/help/URL-Submission-62f2860b)
  - [Bing SubmitUrlBatch quota remarks](https://learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api.interfaces.iwebmasterapi.submiturlbatch?view=bing-webmaster-dotnet)
  - [Bing GetUrlSubmissionQuota](https://learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api.interfaces.iwebmasterapi.geturlsubmissionquota?view=bing-webmaster-dotnet)
  - [Supabase RLS and view security guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
  - [Supabase security-definer view advisor](https://supabase.com/docs/guides/database/database-advisors?lint=0010_security_definer_view)
  - [Supabase tables and view security](https://supabase.com/docs/guides/database/tables)
  - [Clerk manual JWT verification](https://clerk.com/docs/guides/sessions/manual-jwt-verification)
- Checks not run and why:
  - No new local authenticated browser sweep was run from the lead pass because same-day QA and UX already established the current Clerk-bootstrap limitation on `127.0.0.1:8080`, and this role only needed the narrower release and handoff reconciliation.
  - No new live tracker write was required from the lead pass because same-day specialists already refreshed or created the affected tracker rows, and this run did not newly close an additional `TB-` item.
