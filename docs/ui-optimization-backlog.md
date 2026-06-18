# Trusted Bums UI Optimization Backlog

_Last updated: 2026-06-18 by Codex daily UI consultant automation._

## Executive Read

Current head is `57231bf75e9900c11aea964ec9999517a831d1ca`. Exact-head hosted proof is now stronger than the older `af944fe` snapshot: GitHub `QA` run `27710960865`, DreamHost deploy `27710961582`, and exact-head `E2E Smoke` `27711014094` all completed `success` on 2026-06-17 UTC, and the exact-head `Visual UI Audit` run `27742677438` produced usable route screenshots on 2026-06-18 even though the job finished `failure`.

That failure does not currently indicate broad UI collapse. Three checks failed because the visual harness is stale against shipped behavior: the public CTA selector for `Create Client account` now matches three valid buttons, and the mobile client-admin interaction still expects the older direct-to-form `/client/opportunities/new` flow. The artifact still captured enough current-head evidence to close stale carried-forward UI items and narrow the queue.

The old active set is no longer accurate on current head:

- `TB-0061` is already fixed and closed: mobile reports now collapse controls behind progressive disclosure, and the first result view is reachable without the old full-stack opener.
- `TB-0062` is already fixed and closed: the privacy reopen control is now a normal-size `Privacy choices` button, and the privacy/legal route now reads like trust navigation rather than a wrapped utility row.
- `TB-0063` is now fixed and closed: the mobile scrum tracker starts with tracked work before the add-item form.
- `TB-0098` is already fixed and closed: mobile `/client/opportunities/new` now starts in workflow context instead of dropping straight into the long registration form.
- `TB-0110` stays closed on source plus targeted tests: the sponsor-call gate now includes visible helper text and disabled-state explanation, but this run did not capture a fresh hosted screenshot because the stale mobile client-admin harness path failed earlier in the flow.

The remaining UI item on exact head is `TB-0060`.

## Active Recommendations

### P1 - [TB-0060] Resolve the remaining lower-right utility overlap on admin mobile
- Evidence: The exact-head screenshot set from `Visual UI Audit` run `27742677438` still shows the privacy launcher and chat launcher sharing the same lower-right area on admin mobile, with the stack overlapping live content on the dashboard card region. The clearest proof is the retained screenshot `mobile-chrome-admin-admin-dashboard.png` from the downloaded artifact in `/tmp/trustedbums-visual-27742677438`, and current source still mounts those controls independently in [ConsentManager.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/ConsentManager.tsx) and [AdminLayout.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/layouts/AdminLayout.tsx). CSS safe-area insets remain the standard edge-aware placement primitive: [MDN `env()`](https://developer.mozilla.org/en-US/docs/Web/CSS/env).
- Why it matters: The remaining problem is no longer “two separate admin utilities exist.” It is that the surviving support controls still sit in the same visual zone and can cover live queue content on mobile, which makes the shell feel improvised even after the other route-level fixes landed.
- Recommendation: Reserve a single bottom-right support zone for admin mobile and explicitly manage stacked offsets, or dock the privacy shortcut into the same coordinated support surface as chat so the shell owns one intentional affordance instead of two overlapping anchors.
- Acceptance criteria: Fresh mobile screenshots for `/admin`, `/admin/scrum`, and `/admin/live-conversations` show no overlap between support utilities and live action surfaces. The shared support anchor respects `env(safe-area-inset-bottom)` and does not cover queue cards, buttons, or chat-related controls.

## Watchlist

- `TB-0079` remains the broader authenticated-mobile density umbrella, but it should stay umbrella-only while the concrete remaining route-level issue is just `TB-0060`.
- Exact-head `Visual UI Audit` run `27742677438` failed 3 of 18 checks because of harness drift, not because the current head regressed on the public trust routes, reports layout, scrum tracker order, or mobile client-opportunity entry flow. That follow-up belongs with QA Harness Reliability and QA/Test, not as a reopened UI recommendation.
- `TB-0110` remains closed, but a future hosted artifact should still capture the lower sponsor-call helper state directly so the closure is backed by current rendered proof in addition to source and tests.

## Access Requests And Evidence Gaps

Material missing access, screenshots, design files, brand guidance, visual baselines, GitHub Visual QA artifacts, or other evidence needed for a stronger UI review. Mirror durable requests in `docs/agents/consultant-access-needs.md`.

- P1: Provide approved brand/design sources, component references, and a durable screenshot baseline set for the public site plus each authenticated role shell. Current recommendations are implementation-ready, but they are still judged against shipped UI rather than approved visual intent.
- P1: Retain or mirror current-head `Visual UI Audit` artifacts longer than GitHub’s default retention window. The exact-head `27742677438` artifact was sufficient to close stale UI items even though the run failed, which makes durability of those screenshots more important than a binary workflow conclusion.
- P2: Provide production-safe populated-state screenshots or seeded fixtures for accepted-claim client routes and contact-heavy Bum routes. The current artifact still leaves `/client/claims` and `/bum/contacts` too sparse for a stronger density review, and the failed harness interaction sequence prevented fresh hosted capture of the sponsor-call helper and public signup-intent dialog states.

## Agent Inputs

- Date of run: 2026-06-18
- Files, tests, routes, GitHub runs, screenshots, sources, and commands reviewed: `docs/agents/automation-prompts/trusted-bums-daily-ui-consultant.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/ui-optimization-backlog.md`, `docs/codex-edit-log.md`, `.github/workflows/visual-ui-audit.yml`, `git rev-parse HEAD`, `git log --oneline --decorate -n 16`, `git diff --stat af944fe..57231bf -- src docs .github/workflows/visual-ui-audit.yml`, targeted `git diff af944fe..57231bf` review for [ConsentManager.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/ConsentManager.tsx), [PrivacyPolicy.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/PrivacyPolicy.tsx), [ReportsWorkspace.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/reports/ReportsWorkspace.tsx), [ClientOpportunityNew.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientOpportunityNew.tsx), [AdminScrumTracker.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/admin/AdminScrumTracker.tsx), [BumOpportunities.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumOpportunities.tsx), [BumOpportunityDetail.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumOpportunityDetail.tsx), and [portalApi.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/portalApi.ts); `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Visual UI Audit" --limit 10 --json databaseId,displayTitle,headSha,status,conclusion,createdAt,updatedAt,url`; `/Users/macdaddy/bin/gh-trustedbums workflow run .github/workflows/visual-ui-audit.yml --ref main -f target_url='https://trustedbums.com' -f roles='ADMIN,CLIENT_ADMIN,CLIENT_FINANCE,BUM'`; repeated `run view` status checks; failed-job log review for run `27742677438`; `run download` for artifact `visual-ui-audit` into `/tmp/trustedbums-visual-27742677438`; screenshot review of `mobile-chrome-admin-admin-dashboard.png`, `mobile-chrome-admin-admin-scrum-tracker.png`, `mobile-chrome-client_finance-client-finance-reports.png`, `mobile-chrome-public-privacy-policy.png`, and `mobile-chrome-client_admin-client-register-opportunity.png`; local targeted validation `corepack pnpm exec vitest run src/test/uiVisualCleanup.test.ts src/test/opportunityClaimStakeholders.test.ts src/test/clientCommissionPlans.test.ts src/test/adminScrumTracker.test.ts src/test/mobileSidebarAccessibility.test.ts` (`33/33` passed); Supabase project verification plus live tracker reads and writes for `TB-0060`, `TB-0061`, `TB-0062`, `TB-0063`, `TB-0079`, `TB-0098`, and `TB-0110`; and current W3C/WAI/MDN guidance review.
- Checks that could not fully close and why: The exact-head visual workflow produced usable screenshots, but the run still failed because the public CTA selector was not scoped to the intended button and the mobile client-admin interaction still assumes the pre-`57231bf` direct-form flow. The artifact also did not capture a fresh hosted sponsor-call helper state because that stale interaction sequence failed earlier in the role journey. Local browser-driven visual reruns were intentionally not used as the primary proof because this role relies on GitHub-hosted visual evidence first.
