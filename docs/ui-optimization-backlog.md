# Trusted Bums UI Optimization Backlog

_Last updated: 2026-06-07 by Codex daily UI consultant automation._

## Executive Read

GitHub Actions `Visual UI Audit` run `27083467531` passed on 2026-06-07 for current commit `30661c86bfb5c4b843651c7adfcf6f3cd5974680` against `https://trustedbums.com`. The run produced fresh desktop and Mobile Chrome screenshots for public pages plus Admin, Client Admin, Client Finance, and Bum portal routes.

The strongest current UI issue remains mobile utility-control collision. Fresh mobile screenshots still show the fixed `Chat` launcher and tiny `Privacy` reopen chip covering cards, filters, tabs, and form content across Admin, Client Finance, and Bum surfaces. Public privacy/legal screens also still read as compressed mobile legal fine print: the consent reopen control is too small and the related legal links render as a dense inline cluster. Source review confirms two additional open gaps: Bum dashboard earnings cards remain hardcoded to `$0`, and `/admin/handoffs` still has no Visual UI Audit route coverage even though the Admin shell exposes it.

## Active Recommendations

### P1 - Reserve a mobile-safe zone for floating privacy and chat controls
- Evidence: Current GitHub Visual UI Audit run `27083467531` passed but still shows live overlap in Mobile Chrome. `mobile-chrome-admin-admin-dashboard.png` shows `Chat (4)` covering the `Priority queues` tabs while the tiny `Privacy` chip sits on the same card edge. `mobile-chrome-client_finance-client-finance-payments.png` shows `Chat (4)` and `Privacy` covering the commission-invoice filter area. `mobile-chrome-bum-bum-dashboard.png` shows `Chat` and `Privacy` covering the profile-completeness questionnaire. Source still fixes `ConversationDock` at `bottom-4 right-4` in `src/components/ConversationDock.tsx` and the consent reopen chip at `bottom-0 left-3` in `src/components/ConsentManager.tsx`.
- Why it matters: Persistent utilities should remain available without competing with primary workflows. The current mobile placement makes important portal controls look obstructed and lowers perceived polish on high-trust authenticated surfaces.
- Recommendation: Create a coordinated mobile utility pattern for `Chat` and `Privacy choices`: a shared bottom rail, stacked safe-area-aware offsets, or route-level reserved bottom inset with collision rules. Keep desktop placement unchanged unless desktop evidence shows a similar collision.
- Acceptance criteria: In the next GitHub Visual UI Audit mobile screenshots for Admin dashboard, Client Finance payments, Bum dashboard, Client Admin dashboard, and public privacy/home pages, persistent utility controls are visible, tappable, and do not overlap tabs, filters, form fields, card text, or primary actions. The pattern respects safe-area spacing through `env(safe-area-inset-bottom)` or an equivalent reserved inset.

### P1 - Replace the tiny consent reopen chip and validate privacy-page open state
- Evidence: Current `mobile-chrome-public-privacy-policy.png` still shows a very small left-edge `Privacy` chip beside the `Related Legal Links` card. Source still renders the dismissed-state control as `h-5` with `text-[10px]` in `src/components/ConsentManager.tsx`. The visual suite covers `/?consent=reset`, but not `/privacy-policy?consent=reset`, so the privacy-page open consent state still has no screenshot evidence.
- Why it matters: Consent controls are a visible trust mechanism. A tiny reopen affordance makes privacy management feel patched on rather than deliberately designed.
- Recommendation: Replace the closed-state chip with a larger mobile `Privacy choices` button or pill, coordinated with the chat control. Add Visual UI Audit coverage for opening the consent manager from `/privacy-policy`.
- Acceptance criteria: The dismissed consent entry point is visibly tappable on mobile without precision aiming; GitHub Visual UI Audit includes a privacy-page consent-open screenshot; the opened state does not cover the `Manage Consent` card or legal-link module.

### P1 - Turn public legal links into grouped mobile trust navigation
- Evidence: Current `mobile-chrome-public-privacy-policy.png` still renders `Related Legal Links` as a dense wrapped link cluster. Source still uses wrap-style legal navigation in `src/pages/PrivacyPolicy.tsx` and similar footer-style legal links on the homepage in `src/pages/Index.tsx`.
- Why it matters: Legal navigation is part of buyer trust. On phones, compressed inline legal links read like fine print instead of a deliberate trust surface.
- Recommendation: Reframe legal destinations into clearer mobile groups such as `Privacy`, `Terms`, and `Operations`, then render them as stacked rows, roomy pills, or short accordions with consistent ordering on the homepage and privacy page.
- Acceptance criteria: On mobile, legal links read as grouped navigation rather than wrapped inline text; each item has a comfortable tap area; the homepage and privacy page use the same grouping model and order.

### P1 - Replace hardcoded Bum earnings dashboard metrics with live payout logic or explicit pending state
- Evidence: Current `mobile-chrome-bum-bum-dashboard.png` still shows `Pending Earnings` and `Lifetime Payouts` as `$0` on a populated Bum account with 97 open opportunities and one claim. Source confirms `src/pages/bum/BumDashboard.tsx` still hardcodes those two dashboard values to `$0`, while `src/pages/bum/BumEarnings.tsx` already computes pending and paid totals from payout records.
- Why it matters: Placeholder-looking finance metrics reduce payout trust on a credibility-sensitive Bum surface, even when the downstream earnings page has live-total logic.
- Recommendation: Feed the dashboard cards from the same payout totals used on `/bum/earnings`, or replace those cards with a clearly labeled pending/unavailable earnings module until live totals are intentionally supported there.
- Acceptance criteria: Bum dashboard finance cards match the totals logic on `/bum/earnings`, or they explicitly communicate that payout totals are not yet available. Loading, empty, and true-zero states are visually distinct.

### P2 - Add responsive treatment and GitHub Visual QA coverage for Admin handoff queues
- Evidence: Current Visual UI Audit run `27083467531` produced no `/admin/handoffs` screenshots. Source still exposes `/admin/handoffs` in `src/App.tsx` and the Admin nav in `src/layouts/AdminLayout.tsx`, while `tests/e2e/visual-ui-audit.spec.ts` still omits that route. `src/pages/admin/AdminHandoffs.tsx` still renders dense queue/table sections for handoff work.
- Why it matters: Handoffs are an operational queue, not a hidden edge case. A queue with ownership, status, age, and claim actions needs responsive proof before it can be treated as visually release-safe.
- Recommendation: Add `/admin/handoffs` to Visual UI Audit for desktop and Mobile Chrome, then tune the mobile presentation if screenshots show cramped tables or hard-to-scan actions.
- Acceptance criteria: `/admin/handoffs` appears in the next `visual-ui-audit` artifact on desktop and Mobile Chrome. Narrow layouts keep owner, status, age, and claim/action controls visible without uncontrolled horizontal scrolling.

## Watchlist

- Current run `27083467531` passed screenshot capture and basic visual assertions, but it is not a visual-diff gate. Keep the QA backlog item about baseline screenshot assertions separate from this UI backlog.
- Recheck whether the current finance heading fix remains stable after E2E Smoke completes. Source now includes `src/test/e2eSmokeRegression.test.ts` for the single exact `Customer Payment Reports` heading expectation, and the current visual screenshot no longer shows the older duplicate card title pattern.
- If the mobile utility-control pattern changes, re-run Visual UI Audit before removing the related privacy, chat, or consent-chip recommendations.

## Access Requests And Evidence Gaps

Material missing access, screenshots, design files, brand guidance, visual baselines, or other evidence needed for a stronger UI review. Mirror durable requests in `docs/consultant-access-needs.md`.

- P1: Provide approved brand/design sources, component-library references, and a baseline screenshot set for the public site plus each authenticated role shell. Current recommendations are implementation-ready, but they still rely on shipped UI evidence rather than an approved visual source of truth.
- P1: Keep GitHub `Visual UI Audit` evidence durable enough for consultant review. Run `27083467531` is current, but the `visual-ui-audit` artifact is short-lived and should not be the only long-term visual baseline.

## Agent Inputs

- Date of run: 2026-06-07
- Files, tests, routes, GitHub Visual QA runs/artifacts, screenshots, internet sources, access sources, or commands reviewed: `docs/agents/automation-prompts/trusted-bums-daily-ui-consultant.toml`, `docs/consultant-team-rules.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`, previous `docs/ui-optimization-backlog.md`, `.github/workflows/visual-ui-audit.yml`, `tests/e2e/visual-ui-audit.spec.ts`, `src/components/ConsentManager.tsx`, `src/components/ConversationDock.tsx`, `src/pages/PrivacyPolicy.tsx`, `src/pages/Index.tsx`, `src/pages/bum/BumDashboard.tsx`, `src/pages/bum/BumEarnings.tsx`, `src/pages/admin/AdminHandoffs.tsx`, `src/App.tsx`, `src/layouts/AdminLayout.tsx`, `src/test/e2eSmokeRegression.test.ts`, GitHub Visual UI Audit run `27083467531`, downloaded artifact at `/Users/macdaddy/tmp/trustedbums-visual-ui-27083467531`, screenshots `mobile-chrome-admin-admin-dashboard.png`, `mobile-chrome-client_finance-client-finance-payments.png`, `mobile-chrome-bum-bum-dashboard.png`, and `mobile-chrome-public-privacy-policy.png`, current WCAG 2.2 target-size guidance from W3C, MDN `env()` safe-area guidance, and Android touch target guidance.
- Checks that could not run and why: Local Vite, local browser visual QA, and local Playwright visual checks were intentionally not used because the UI consultant prompt requires GitHub Visual QA as the visual evidence source. No approved brand strategy, design files, component references, or durable screenshot baseline library were available in-session.
