# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-09 by Codex daily lead developer automation._

## Executive Read

Current release decision stays `HOTFIX-FORWARD` on deployed head `9f42bf4`, not `GO`.

- Completed work:
  - Specialist backlog refreshes narrowed the queue to concrete release, admin-scrum, finance-access, trust, and terminology items.
  - GitHub `Deploy TrustedBums to DreamHost` run `27178512660` passed on `9f42bf4`.
  - GitHub `E2E Smoke` run `27178530411` passed on `9f42bf4`, including `smoke`, `admin`, `client`, and `bum`.
  - `https://trustedbums.com` returned `HTTP/2 200` from this runner on 2026-06-09 with HSTS, CSP, and the expected baseline headers.
- Current priorities:
  - Publish the docs-only `QA` contract repair already present in the dirty worktree and rerun GitHub `QA`.
  - Rerun `Visual UI Audit` against `https://trustedbums.com`, not `https://rcdl.tplinkdns.com`.
  - Keep the new local `/admin/scrum` rollout out of merge-ready status until audit integrity, closeout proof, accessibility, and index debt are fixed together.
- Current blockers:
  - GitHub `QA` run `27178512695` is still red on the exact deployed head.
  - GitHub `Visual UI Audit` run `27181180658` failed before route capture because auth bootstrap targeted `https://rcdl.tplinkdns.com` and timed out in [`tests/e2e/helpers/auth.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/auth.ts).
  - `.codex-review-decision.json` is still stale at `c9b7b07`.
  - DMARC review, live Supabase read-only SQL, and GTM evidence remain blocked by missing access.
- Recommended next actions:
  1. Commit and push the `docs/qa-test-backlog.md` repair already sitting in the local worktree, then rerun GitHub `QA`.
  2. Dispatch `Visual UI Audit` again with `target_url=https://trustedbums.com`; treat `rcdl.tplinkdns.com` as DNS or TLS context only.
  3. If `QA` and `Visual UI Audit` are both green, run Code Review Agent on the resulting exact head.

## Recommendation Classification

- `TB-0017 Restore the QA backlog/test contract and rerun GitHub QA`: `READY`.
  - Reason: the current deployed head is blocked by GitHub `QA` run `27178512695`, but the required seeded-proof headings are already restored in the local dirty worktree and local follow-up evidence says the regression is narrow.
  - Next owner: Lead Developer, then Release Verification.
- `TB-0018 Run a current-head Visual UI Audit`: `BLOCKED BY ACCESS`.
  - Reason: current-head run `27181180658` failed before auth bootstrap because it targeted `https://rcdl.tplinkdns.com`, not because the public route diff itself is confirmed broken.
  - Next owner: Lead Developer plus QA Harness Reliability.
- `TB-0019 Refresh the exact-head Code Review marker`: `BLOCKED BY ANOTHER SPECIALIST`.
  - Reason: Code Review should run on the post-`QA` and post-visual candidate head, not the currently incomplete evidence set.
  - Next owner: Code Review Agent.
- `TB-0056 Move admin scrum tracker audit actors to a server-owned path`: `READY`.
  - Reason: the new local tracker writes `created_by` and `updated_by` from browser-supplied `currentUserId` through [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), so audit actors are still forgeable.
  - Next owner: Lead Developer with Security review.
- `TB-0053 Require proof-backed closeout and audit history in admin scrum`: `READY`.
  - Reason: the local tracker UI can close items without evidence links or a closeout note, and the current persistence path does not emit audit events.
  - Next owner: Lead Developer with Product Ops review.
- `TB-0031 Give the admin scrum tracker controls programmatic labels`: `READY`.
  - Reason: the local tracker introduces unlabeled search and select controls and should be fixed in the same pass as the rest of the route hardening.
  - Next owner: Lead Developer with Accessibility review.
- `TB-0049 Clear advisor-backed admin-table index debt`: `READY`.
  - Reason: the local `admin_scrum_items` rollout already adds advisor-backed index debt and currently relies on full-table client filtering.
  - Next owner: Lead Developer with Performance review.
- `TB-0044 Split Client Finance reporting into a finance-safe read model`: `READY`.
  - Reason: visible Client Finance cards are safer now, but the browser payload still hydrates richer operational fields than the business rule allows.
  - Next owner: Lead Developer with Data and Security review.
- `TB-0045 Add an explicit admin-email reporting access rule`: `READY`.
  - Reason: admin-only RLS exists, but the business rule is still implicit rather than documented and QA-testable.
  - Next owner: Lead Developer with Data and Security review.
- `TB-0022 Finish seeded allow and deny proof for service-role authorization paths`: `BLOCKED BY ACCESS`.
  - Reason: source fixtures and contract tests exist, but the protected QA database, seeded records, and Clerk-to-fixture mapping are still not live for real allow or deny runs.
  - Next owner: QA/Test Engineer with Security review.
- `TB-0058 Serve route-specific metadata in initial HTML`: `READY`.
  - Reason: public trust routes still deliver generic shell metadata before React runs, which is a trust and indexing problem on real public pages.
  - Next owner: Lead Developer with Trust review.
- `TB-0059 Remove the public pre-store extension zip`: `READY`.
  - Reason: the download still returns `HTTP/2 200` publicly and the manifest still carries broad permissions, which keeps avoidable trust and review risk on the main domain.
  - Next owner: Lead Developer with Trust and Security review.
- `TB-0057 Run mailbox-backed DMARC review and enforcement prep`: `BLOCKED BY ACCESS`.
  - Reason: the code path exists, but there is still no authenticated admin path or mailbox-backed review evidence in-session.
  - Next owner: Trust and Reputation plus mailbox access owner.
- `TB-0034 Enrich the Client intake path and operationalize qualification`: `READY`.
  - Reason: the public Client route is now split cleanly, but the intake still captures shallow data and the admin workflow still lacks durable qualification discipline.
  - Next owner: Product Ops and Growth with Lead Developer support.
- `TB-0035 Build a claim-safe proof spine before scaling demand`: `BLOCKED BY ACCESS`.
  - Reason: the engineering and content direction is clear, but approved claims, CRM evidence, and founder proof sources are still missing.
  - Next owner: Growth with Trust, Content, and GTM evidence owners.
- `TB-0040`, `TB-0041`, and `TB-0042` terminology cleanup`: `READY`.
  - Reason: the current source still mixes `Prospects`, `Client Prospect`, `Bum Prospect`, `Client Agreement`, and legacy `Partner Terms` across real routes and tests.
  - Next owner: Lead Developer with Content review.

## Recommended Implementation Queue

### P0 - Publish the local QA-contract repair and rerun GitHub QA
- Classification: `READY`.
- Source: GitHub `QA` run `27178512695`, [`src/test/scrumQueueRegression.test.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/scrumQueueRegression.test.ts), and the locally modified [`docs/qa-test-backlog.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md).
- Why now: This is the narrowest release blocker on the deployed head and appears to be a docs-only hotfix already staged in the worktree, not a reproduced product regression.
- Recommended fix: Publish the restored seeded-proof backlog sections without mixing in unrelated dirty files, then rerun GitHub `QA`.
- Likely files and routes: [`docs/qa-test-backlog.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/qa-test-backlog.md), [`docs/release-verification-backlog.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/release-verification-backlog.md), and possibly [`docs/lead-developer-recommendations.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/lead-developer-recommendations.md).
- Dependencies and risks: The worktree is already dirty; stage only the intended release-doc files. Do not declare `GO` until `QA`, current-head visual proof, and Code Review all reconcile.
- Acceptance criteria: GitHub `QA` on the exact candidate head passes lint, unit tests, build, and smoke again.
- Validation: targeted local `vitest` on `src/test/scrumQueueRegression.test.ts`, then GitHub `QA`.

### P0 - Rerun `Visual UI Audit` on `https://trustedbums.com` and stop using `rcdl` as the default hosted QA target
- Classification: `BLOCKED BY ACCESS`.
- Source: GitHub `Visual UI Audit` run `27181180658`, [`.github/workflows/visual-ui-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/visual-ui-audit.yml), and [`tests/e2e/helpers/auth.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/helpers/auth.ts).
- Why now: Visual proof is now red, not merely missing, and the failure is procedural. Until the target discipline is corrected, UI, UX, Accessibility, QA, and Release Verification will keep reading false negatives from the wrong deployed host.
- Recommended fix: Dispatch the workflow against `https://trustedbums.com`; reserve `https://rcdl.tplinkdns.com` for explicit DNS or TLS validation only. Keep the shared rule update in place so future automations do not drift back.
- Likely files and routes: [`.github/workflows/visual-ui-audit.yml`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.github/workflows/visual-ui-audit.yml), [`docs/consultant-team-rules.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-team-rules.md), [`docs/company-wide-rules.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/company-wide-rules.md), and the public routes changed in [`src/App.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/App.tsx), [`src/pages/Index.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx), and [`src/pages/BumLanding.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/BumLanding.tsx).
- Dependencies and risks: if `trustedbums.com` fails the rerun, reclassify the item from access-blocked to a real UI or auth defect immediately.
- Acceptance criteria: current-head `Visual UI Audit` completes against `https://trustedbums.com` and yields actionable screenshots instead of base-target timeouts.
- Validation: GitHub `Visual UI Audit` rerun plus artifact review.

### P1 - Harden the local admin scrum rollout before merge
- Classification: `READY`.
- Source: [`src/pages/admin/AdminScrumTracker.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminScrumTracker.tsx), [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [`supabase/migrations/20260609025228_add_admin_scrum_items.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260609025228_add_admin_scrum_items.sql), [`supabase/migrations/20260609030014_extend_admin_scrum_items_tracking_metadata.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260609030014_extend_admin_scrum_items_tracking_metadata.sql), Product Ops `TB-0053`, Security `TB-0056`, Accessibility `TB-0031`, and Performance `TB-0049`.
- Why now: This local-only rollout is about to become the coordination plane for QA, release, and specialist work. Shipping it without trusted actors, proof-backed closeout, labels, and index cleanup would create an unreliable operations system.
- Recommended fix: move actor ownership server-side or DB-side, require evidence plus closeout note for `CLOSED` and `WONT_FIX`, emit audit events, add programmatic labels, and clear the first advisor-backed index debt before merge.
- Likely files and routes: [`src/pages/admin/AdminScrumTracker.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminScrumTracker.tsx), [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [`src/layouts/AdminLayout.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/AdminLayout.tsx), [`src/App.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/App.tsx), and the `20260609*admin_scrum*` migrations.
- Dependencies and risks: this is an auth, audit, accessibility, and performance bundle. Do not merge only the UI shell without the integrity work.
- Acceptance criteria: actor spoofing is closed, closeout proof is mandatory, audit history is durable, controls are labeled, and targeted admin-table warnings are cleared or explicitly waived.
- Validation: targeted `vitest`, Security review, Accessibility check, and post-DDL advisor review.

### P1 - Split Client Finance reads into a finance-safe model and document admin-email reporting boundaries
- Classification: `READY`.
- Source: Data `TB-0044` and `TB-0045`, current [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), and [`docs/business-access-rules.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md).
- Why now: This is the highest-value remaining data-access tightening that is not blocked on missing QA fixtures. It reduces real least-privilege risk and gives QA a clearer contract.
- Recommended fix: add a finance-safe projection for Client Finance payment and invoice views, and add an explicit admin-email operations and reporting rule before future sharing exceptions are discussed.
- Likely files and routes: [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [`src/pages/client/ClientPayments.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientPayments.tsx), [`src/pages/client/ClientReports.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientReports.tsx), [`src/pages/client/ClientExports.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientExports.tsx), and [`docs/business-access-rules.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/business-access-rules.md).
- Dependencies and risks: coordinate with Security and QA because the visible UI may remain stable while the payload shape changes underneath.
- Acceptance criteria: Client Finance payloads no longer include operational relationship fields, and raw admin-email reporting remains admin-only in the documented business rule.
- Validation: response-shape tests, negative-role QA, and business-rule review.

### P1 - Fix public trust surfaces that do not require blocked external access
- Classification: `READY`.
- Source: Trust `TB-0058` and `TB-0059`, [`index.html`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/index.html), [`src/components/RouteMetadata.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/RouteMetadata.tsx), and the public extension asset path.
- Why now: these are engineering-owned trust improvements that do not need mailbox or dashboard access first.
- Recommended fix: move public route metadata into initial HTML delivery and remove the public extension zip until permissions and distribution are final.
- Likely files and routes: [`index.html`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/index.html), [`src/components/RouteMetadata.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/RouteMetadata.tsx), public-route rendering surfaces, and [`public/downloads/trustedbums-extension.zip`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/public/downloads/trustedbums-extension.zip).
- Dependencies and risks: metadata delivery should stay content-equivalent for users and crawlers; extension-distribution changes should coordinate with Security and Trust.
- Acceptance criteria: initial HTML returns route-specific metadata on public trust routes, and the extension zip is no longer publicly downloadable by default.
- Validation: `curl -sL` on `/`, `/privacy-policy`, and `/legal/:slug`, plus `curl -I` on the extension path.

### P2 - Ship the terminology cleanup bundle once release blockers are cleared
- Classification: `READY`.
- Source: Content `TB-0040`, `TB-0041`, and `TB-0042`.
- Why now: the issues are still live in source and tests, but they are lower priority than the release truth and admin-scrum integrity work.
- Recommended fix: standardize `Client Prospects`, replace `Bum Prospect`, and finish the `Client Agreement` naming pass in one code-doc-test bundle.
- Likely files and routes: Bum nav and reports, signup chooser, admin contact intake, client agreement routes, and matching Playwright assertions.
- Dependencies and risks: coordinate with Content so the public recruiting noun and legal workspace noun are finalized together.
- Acceptance criteria: the visible product, docs, and tests stop mixing the legacy nouns.
- Validation: targeted route assertions, content review, and current-head visual audit after the rerun is healthy.

## Fix Playbooks

### Release Truth Playbook
- Publish the local `QA`-contract repair, rerun GitHub `QA`, rerun `Visual UI Audit` against `https://trustedbums.com`, then refresh exact-head Code Review on the surviving candidate head.
- Do not let green deploy plus green `E2E Smoke` override a red `QA`, a red visual run, or a stale Code Review marker.

### Admin Scrum Hardening Playbook
- Treat the local `/admin/scrum` rollout as one merge unit across Security, Product Ops, Accessibility, and Performance.
- If the tracker ships, it must ship with trusted actor ownership, proof-backed closeout, audit history, accessible controls, and bounded list performance.

### Trust Surface Playbook
- Separate blocked trust work from unblocked trust work.
- Do the route-metadata and extension-zip fixes now; leave DMARC enforcement and mailbox-backed review explicitly blocked on admin mailbox access.

## Cross-Backlog Dependencies

- The visual-audit target issue is a shared process defect, not only a UI or QA problem. Shared rules now distinguish `trustedbums.com` as the hosted QA default and `rcdl.tplinkdns.com` as fallback DNS or TLS context only.
- The admin scrum rollout touches Security, Product Ops, Accessibility, and Performance at the same time; do not treat it as a UI-only admin page.
- Finance-safe reporting depends on Security and QA because the risk is hidden in payload shape and role boundary proof, not only in what the current UI displays.
- Growth `TB-0034` can move, but `TB-0035`, `TB-0057`, and broader GTM scaling remain blocked until CRM, brand, claims, and mailbox evidence return.
- Performance items `TB-0047`, `TB-0048`, and `TB-0050` remain important, but they should stay behind the release and admin-scrum integrity queue until current release proof is green again.

## Release Verification Handoff

- Current decision: `HOTFIX-FORWARD` on `9f42bf4`.
- Green evidence: deploy `27178512660`, smoke and deep `27178530411`, public `trustedbums.com` headers on 2026-06-09.
- Red evidence: `QA` `27178512695`, `Visual UI Audit` `27181180658`, and stale `.codex-review-decision.json`.
- Hold triggers: any failed rerun against `https://trustedbums.com`, any newly surfaced visual regression once the target is corrected, or any Code Review `NO-GO` on the candidate head.
- Rollback is not currently recommended because the deployed site and hosted smoke are healthy; fix-forward remains the safer path while the blockers are evidence and process scoped.

## Consultant Quality And Access Audit

- Security, Product Ops, Data, and Accessibility correctly converged on the local admin-scrum rollout as the highest-risk new engineering work.
- Release Verification and QA correctly kept the deployed head out of `GO`, but yesterday’s handoff was already stale on visual evidence; the current truth is a failed hosted visual run, not a missing one.
- Trust and Growth recommendations remain directionally strong, but they are still materially limited by missing mailbox, DNS, CRM, claims, and brand-source access.
- Supabase live access in this session was partial: URL, advisors, and logs were available, but read-only SQL was not. Keep live-SQL-dependent claims labeled as blocked or historical until the callable surface returns.

## Team Rule Updates

- Updated [`docs/company-wide-rules.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/company-wide-rules.md), [`docs/consultant-team-rules.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-team-rules.md), and their mirrored `docs/agents/` copies so GitHub-hosted `QA`, `E2E Smoke`, `Visual UI Audit`, and `Deep QA Hotfix Audit` default to `https://trustedbums.com`. `https://rcdl.tplinkdns.com` now stays explicitly scoped to fallback DNS or TLS context unless Ryan asks otherwise.
- Updated [`docs/consultant-access-needs.md`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md) and its mirrored agent copy so the visual-QA access gap records the actual 2026-06-09 failure mode.
- Publication status: left local only. The worktree already contains unrelated dirty files and uncommitted product-code and migration work, so this run did not stage or push anything.

## Agent Inputs

- Date of run: 2026-06-09.
- Specialist backlogs reviewed: accessibility, B2B growth, content, data analytics, performance, product ops, QA, QA harness, release verification, security, trust and reputation, UI, UX, and the current lead handoff.
- Current repo and workflow evidence reviewed:
  - `git status --short`
  - `git log --since='2026-06-08 03:00' --name-only --pretty=format:'COMMIT %H %ad %s' --date=iso -- docs`
  - `git rev-parse --abbrev-ref HEAD`
  - `git rev-parse HEAD`
  - GitHub runs `27178512660`, `27178512695`, `27178530411`, and `27181180658`
  - `curl -I -L --max-time 20 https://trustedbums.com`
  - `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`
  - source review of the local admin scrum route, tests, and migrations
- Current external guidance rechecked:
  - [Google email sender guidelines](https://support.google.com/a/answer/81126?hl=en-na)
  - [Chrome permission warning guidelines](https://developer.chrome.com/docs/extensions/develop/concepts/permission-warnings)
  - [web.dev LCP guidance](https://web.dev/articles/lcp?hl=en)
  - [Google Search Central rendering guidance](https://developers.google.com/search/docs/guides/rendering)
- Checks that could not run and why:
  - No mailbox-backed DMARC review because there was still no authenticated admin mailbox path in-session.
  - No current-session Supabase read-only SQL because the callable connector surface did not expose the earlier execute-SQL path.
  - No meaningful local visual QA because GitHub-hosted visual evidence is the required source and the current local worktree contains unmerged tracker code.
