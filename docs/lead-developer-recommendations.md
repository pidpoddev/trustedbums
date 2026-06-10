# Trusted Bums Lead Developer Recommendations

_Last updated: 2026-06-10 by Codex lead cleanup pass._

## Executive Read

Current release decision stays `HOTFIX-FORWARD` on current head `ff59d2c`, not `GO`.

- Completed work:
  - GitHub `QA` run `27244531408`, DreamHost deploy run `27244531370`, and `E2E Smoke` run `27244546687` passed on `ff59d2c`.
  - The old `9f42bf4` red-QA story is no longer current release truth.
  - `TB-0030` and `TB-0031` are satisfied in current source; `TB-0053` and `TB-0056` remain historically closed from the 2026-06-09 admin scrum hardening pass.
- Current priorities:
  - Fix or rebaseline current-head `Visual UI Audit` run `27247209520`, which failed waiting for `Accessibility settings` in the public visual audit after the signup dialog step.
  - Refresh exact-head Code Review for `ff59d2c` after visual evidence lands, or record a deliberate waiver.
  - Move to the next implementation item: `TB-0064` or `TB-0044`.
- Current blockers:
  - Current-head `Visual UI Audit` run `27247209520` failed in the public visual audit; 16 checks passed, but both desktop and mobile timed out waiting for `Accessibility settings`.
  - `.codex-review-decision.json` is stale at `e023694f`, not `ff59d2c`.
  - Broader GTM proof and some dashboard/control-plane evidence remain access-limited.
- Recommended next actions:
  1. Inspect the `27247209520` visual artifact/trace, fix or rebaseline the public `Accessibility settings` step, and update `TB-0018`.
  2. Run Code Review Agent or record an exact-head waiver for `ff59d2c`.
  3. Start `TB-0064`, then `TB-0044`.

## Recommendation Classification

- `TB-0017 Restore the QA backlog/test contract and rerun GitHub QA`: `CLOSED`.
  - Reason: current-head GitHub `QA` run `27244531408` passed on `ff59d2c`.
  - Next owner: none.
- `TB-0018 Pair current release heads with current visual evidence or explicit reuse rule`: `OPEN`.
  - Reason: exact-head `Visual UI Audit` run `27247209520` failed waiting for the public `Accessibility settings` control after the signup dialog step. The checked-in spec already retains `/bums` and `/admin/scrum`; the blocker is the failing exact-head hosted interaction.
  - Next owner: QA Harness Reliability, UI, Accessibility, Release Verification.
- `TB-0019 Refresh the exact-head Code Review marker`: `NEEDS REFRESH`.
  - Reason: prior tracker item closed for an older head, but `.codex-review-decision.json` currently records `e023694f`, not `ff59d2c`.
  - Next owner: Code Review Agent after visual evidence.
- `TB-0056 Move admin scrum tracker audit actors to a server-owned path`: `CLOSED`.
  - Reason: browser helpers no longer send actor IDs, live Supabase has `set_admin_scrum_item_audit_fields`, and targeted tests lock the server-owned actor contract.
  - Next owner: none.
- `TB-0053 Require proof-backed closeout and audit history in admin scrum`: `CLOSED`.
  - Reason: UI/API validation requires evidence plus closeout note, live Supabase has `admin_scrum_items_closeout_proof_check`, and audit-event triggers are live.
  - Next owner: none.
- `TB-0031 Give the admin scrum tracker controls programmatic labels`: `CLOSED`.
  - Reason: `AdminScrumTracker` now labels search, filters, and create controls, and targeted tests lock the pattern.
  - Next owner: none.
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

### P1 - Finish current-head release evidence
- Classification: `IN PROGRESS`.
- Source: GitHub `QA` run `27244531408`, deploy run `27244531370`, `E2E Smoke` run `27244546687`, failed `Visual UI Audit` run `27247209520`, and `.codex-review-decision.json`.
- Why now: QA/deploy/E2E are green on `ff59d2c`, but release verification still needs a passing exact-head visual artifact and exact-head Code Review marker or waiver.
- Recommended fix: inspect the uploaded `27247209520` artifact/trace, fix or rebaseline the public visual-audit step that expects `Accessibility settings`, keep the retained `/bums` and `/admin/scrum` visual coverage healthy, then run Code Review Agent or record an exact-head waiver for `ff59d2c`.
- Likely files and routes: [`tests/e2e/visual-ui-audit.spec.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/tests/e2e/visual-ui-audit.spec.ts), `.codex-review-decision.json`, and release handoff docs.
- Acceptance criteria: `TB-0018` has completed exact-head visual proof or an explicit reuse rule, and release handoff has exact-head Code Review evidence or waiver.
- Validation: GitHub `Visual UI Audit` artifact review plus Code Review Agent result.

### P1 - Keep admin scrum hardening closed and monitor only expansion risk
- Classification: `CLOSED / WATCH`.
- Source: [`src/pages/admin/AdminScrumTracker.tsx`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminScrumTracker.tsx), [`src/lib/portalApi.ts`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts), [`supabase/migrations/20260609100000_harden_admin_scrum_tracker_audit.sql`](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/supabase/migrations/20260609100000_harden_admin_scrum_tracker_audit.sql), live Supabase migration `20260609095404_harden_admin_scrum_tracker_audit`, Product Ops `TB-0053`, Security `TB-0056`, and Accessibility `TB-0031`.
- Why now: The implementation work is done; keeping it in the active queue creates false priority pressure.
- Recommended fix: leave `TB-0053`, `TB-0056`, and `TB-0031` closed unless the tracker expands beyond Admin-only operations or new visual/accessibility proof finds a real route issue.
- Acceptance criteria: closed tracker rows carry evidence and future scrum changes trigger Security/Product Ops review only when scope changes.
- Validation: live Supabase constraint/trigger checks and targeted `adminScrumTracker` tests.

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
- Current `QA`, deploy, and `E2E Smoke` are green on `ff59d2c`; do not reopen the old `9f42bf4` red-QA story.
- Fix the exact-head `Visual UI Audit` failure, then refresh exact-head Code Review or record a deliberate waiver before `GO`.

### Admin Scrum Hardening Playbook
- Treat `/admin/scrum` actor ownership, proof-backed closeout, audit history, and accessible-control labeling as closed in source and live Supabase.
- Keep performance and route-coverage improvements separate so they do not reopen already-satisfied audit and accessibility work.

### Trust Surface Playbook
- Separate blocked trust work from unblocked trust work.
- Do the route-metadata and extension-zip fixes now; leave DMARC enforcement and mailbox-backed review explicitly blocked on admin mailbox access.

## Cross-Backlog Dependencies

- The current visual-audit gap is retained exact-head evidence, not the old wrong-target failure. Shared rules still distinguish `trustedbums.com` as the hosted QA default and `rcdl.tplinkdns.com` as fallback DNS or TLS context only.
- The admin scrum audit/accessibility/Product Ops hardening is closed; only performance/index and retained visual coverage remain active around that route.
- Finance-safe reporting depends on Security and QA because the risk is hidden in payload shape and role boundary proof, not only in what the current UI displays.
- Growth `TB-0034` can move, but `TB-0035`, `TB-0057`, and broader GTM scaling remain blocked until CRM, brand, claims, and mailbox evidence return.
- Performance items `TB-0047`, `TB-0048`, and `TB-0050` remain important, but they should stay behind current release evidence cleanup, `TB-0064`, and `TB-0044`.

## Release Verification Handoff

- Current decision: `HOTFIX-FORWARD` on `ff59d2c`.
- Green evidence: QA `27244531408`, deploy `27244531370`, and E2E/deep `27244546687`.
- Red/pending evidence: Visual UI Audit `27247209520` failed waiting for `Accessibility settings`; `.codex-review-decision.json` is stale for `ff59d2c`.
- Hold triggers: failed exact-head visual run, missing exact-head Code Review marker or waiver, or any newly surfaced product regression.
- Rollback is not currently recommended because the deployed site and hosted smoke/deep evidence are healthy; fix-forward remains the safer path while the blockers are evidence scoped.

## Consultant Quality And Access Audit

- Security, Product Ops, and Accessibility have closed the admin-scrum integrity/accessibility items; Data and Performance still have separate active queue work.
- Release Verification and QA should now focus on the exact-head visual failure and Code Review freshness; the current truth is not a red QA workflow.
- Trust and Growth recommendations remain directionally strong, but they are still materially limited by missing mailbox, DNS, CRM, claims, and brand-source access.
- Supabase live access in this session was partial: project metadata, edge-function inventory, and logs were available, but read-only SQL, migrations, and advisors were not. Keep live-database claims labeled as blocked or historical until the callable surface returns.

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
  - GitHub runs `27244531408`, `27244531370`, `27244546687`, and `27247209520`
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
