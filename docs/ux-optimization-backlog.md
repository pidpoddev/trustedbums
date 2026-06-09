# Trusted Bums UX Optimization Backlog

_Last updated: 2026-06-08 by Codex daily UX consultant automation._

## Executive Read

Current head `9f42bf4` is no longer carrying the older public/client recovery regressions that previously dominated this backlog. Hosted GitHub `E2E Smoke` run `27178530411` passed its smoke job plus all three `Deep QA (admin|client|bum)` shards, and current source now shows the earlier UX fixes in place: client signup preserves a typed company name while the email changes, the homepage contact form exposes inline recovery without clearing entered values, client denied-state recovery routes through `/client/agreements`, and admin handoff rows now surface priority, next action, stale state, and notification failures.

The current head still does not have a matching `Visual UI Audit` artifact, and the red GitHub `QA` run `27178512695` is a unit-test/doc drift issue rather than a new route-level UX failure. That leaves a narrower UX queue: the split public landing now uses mixed labels for the same client-only signup action, and the first-layer consent banner still occupies too much of the mobile first view even though the privacy-choice flow itself is functioning.

## Active Recommendations

### P1 - [TB-0064] Make the client-only signup CTA labels explicit across `/`
- Evidence: The public client landing now has a dedicated Bum route at `/bums` in `src/App.tsx`, but the same client-locked signup action is still labelled three different ways on `/`: the header button says `Sign up` in `src/pages/Index.tsx`, the hero card says `Create Client account`, and the contact section says `Client signup`, while each control opens `SignupIntentDialog` with `lockedRole="CLIENT"`. Current W3C and GOV.UK guidance still recommends clear visible labels and button text that describes the action a user is about to take: https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p06-clear-labels/ and https://design-system.service.gov.uk/components/button/
- Why it matters: After the public landing split, a generic `Sign up` label implies a universal account path even though the page now routes Bum prospects elsewhere. Mixed client CTA language adds hesitation at the exact point where a buyer or operator is deciding which path applies to them.
- Recommendation: Standardize the client-only signup action on `/` to one explicit label system such as `Create Client account`, and reserve Bum-application language for `/bums` and Bum-specific CTAs. If the header keeps a short label on mobile, add nearby context that still makes the client-only action obvious.
- Acceptance criteria: Every CTA on `/` that opens the client-locked signup dialog uses explicit client wording; no client-only control on `/` keeps the generic `Sign up` label; Bum application CTAs remain Bum-specific; smoke and visual tests are updated to the approved label set.

### P2 - [TB-0065] Reduce the first-layer consent banner footprint on mobile
- Evidence: `src/components/ConsentManager.tsx` still auto-opens the consent surface when no record exists and renders a first layer with `max-h-[78vh]`, two explanatory text blocks, and stacked actions before the user sees the rest of the page. Current-head GitHub `E2E Smoke` run `27178530411` proves the privacy-choice flow works, but this run could not capture fresh local screenshots because port `8080` was already occupied and the latest successful `Visual UI Audit` artifact is still older than the current public landing split. Current ICO guidance, finalized on 2026-04-29, still shows equally prominent `accept`, `reject`, and `customise` actions with the more detailed controls pushed into the second layer: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/
- Why it matters: The consent mechanism is still likely to dominate the first mobile impression before visitors can read the value proposition or reach the first CTA, turning a compliance step into the primary experience.
- Recommendation: Keep equally prominent consent choices, but shorten the first-layer copy and reduce its vertical footprint on small screens so the hero headline and first CTA remain visible. Keep the granular category descriptions and switches behind `Customize`, and record Trust/Legal review for the copy/layout change.
- Acceptance criteria: On first visit at mobile widths, the initial consent layer preserves equally prominent choices while leaving the hero headline and one primary CTA visible; detailed category explanations stay behind `Customize`; Trust/Legal review is recorded for the revised consent presentation.

## Watchlist

- Hosted route evidence is stronger again: GitHub `E2E Smoke` run `27178530411` on `9f42bf4` passed the smoke job plus all three deep shards, so the earlier signup, contact-recovery, client-access, and admin-handoff regressions are no longer active backlog items.
- Current-head `QA` run `27178512695` is still red because unit tests failed before the workflow reached its build or browser steps. That is not new route-level UX evidence, but it does mean current-head release confidence is not the same as a fully clean pipeline.
- The latest successful `Visual UI Audit` artifact is still run `27167324836` on `441fd92`, so the split public landing pages on `9f42bf4` still lack current-head screenshot evidence.
- Local visual rechecks could not run on `127.0.0.1:8080` in this session because an existing `node` process already held the required port.
- No analytics, session recordings, support-ticket exports, sales-objection notes, customer-feedback exports, or narrated role walkthroughs were available in this run, so prioritization still leans on current source and hosted route coverage rather than observed user behavior.

## Access Requests And Evidence Gaps

Material missing access, credentials, analytics, screenshots, customer data, or other evidence needed for a stronger UX review. Mirror durable requests in `docs/consultant-access-needs.md`.

- Trigger and retain a current-head GitHub `Visual UI Audit` artifact for commit `9f42bf4`, with emphasis on `/`, `/bums`, `/client/dashboard`, `/client/agreements`, and `/admin/handoffs`.
- Provide analytics, session recordings, support-ticket exports, sales-objection notes, customer-feedback exports, or narrated role walkthroughs so UX prioritization can move beyond source-backed inference.

## Agent Inputs

- Date of run: 2026-06-08
- Files, tests, routes, sources, and commands reviewed: `docs/agents/automation-prompts/daily-ux-consultant.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/company-wide-rules.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`, prior `docs/ux-optimization-backlog.md`, `git status --short`, `git log --since='2026-06-06 00:00' --name-only --pretty=format:'COMMIT %h %cs %s' -- src docs tests`, `src/App.tsx`, `src/components/SignupIntentDialog.tsx`, `src/components/ConsentManager.tsx`, `src/pages/Index.tsx`, `src/pages/BumLanding.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientTerms.tsx`, `src/pages/admin/AdminHandoffs.tsx`, `tests/e2e/staging-smoke.spec.ts`, `tests/e2e/visual-ui-audit.spec.ts`, `src/test/e2eSmokeRegression.test.ts`, `src/test/clientExportsAccess.test.ts`, `src/test/scrumQueueRegression.test.ts`, `corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts src/test/clientExportsAccess.test.ts src/test/scrumQueueRegression.test.ts`, sourced `corepack pnpm run build`, `lsof -nP -iTCP:8080 -sTCP:LISTEN`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 12 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Visual UI Audit" --limit 8 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27178530411 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27178512695 --json ...`, W3C clear-label guidance, GOV.UK button-text guidance, and ICO consent guidance.
- Checks that could not run and why: no current-head `Visual UI Audit` artifact exists yet for `9f42bf4`; local visual/screenshot checks on `127.0.0.1:8080` could not run because that required port was already occupied by an existing `node` process; no analytics, session recordings, support exports, or customer-feedback datasets were available in-session.
