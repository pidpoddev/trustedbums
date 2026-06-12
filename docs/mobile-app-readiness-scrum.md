# Trusted Bums Mobile App Readiness Scrum

_Last updated: 2026-06-12 by Codex Technology Architect Agent._

## Scrum Decision

Do not start by building a separate mobile app repo. The next step is a mobile-readiness hardening sprint for the existing platform, then a decision between three delivery paths:

1. Responsive web / PWA-first: lowest platform risk, fastest way to prove mobile workflows.
2. Capacitor shell: useful if Trusted Bums needs app-store presence while reusing the existing React portal.
3. Expo / React Native app: best if native auth, push notifications, device integrations, and mobile-first navigation become core product requirements.

The current recommended default is responsive web / PWA-first until `TB-0099` proves the app surface, auth model, API boundary, and mobile QA contract are ready for an app-store build.

## Scrum Board

### P1 - [TB-0099] Prepare Trusted Bums for a mobile app readiness decision

- Owner: Technology Architect / Lead Developer.
- Status: Open in Admin Scrum Tracker.
- Goal: Decide whether the first mobile product should be responsive web/PWA, Capacitor, or Expo/React Native after platform blockers are resolved.
- Evidence: Current platform is React/Vite + Clerk + Supabase + Edge Functions + Direct Data API + DreamHost. Mobile-specific risks already exist in authenticated portal UI, API boundaries, search fan-out, and accessibility.
- Acceptance criteria:
  - Mobile product scope is written for Admin, Client Admin, Client Finance, Client Member, and Bum users.
  - Delivery path decision is recorded: PWA-first, Capacitor, or Expo/React Native.
  - Auth/deep-link/session strategy is proven for the selected path.
  - API lane map exists for mobile workflows; raw Supabase table access is not treated as a mobile app contract.
  - Existing mobile blockers below are closed or explicitly waived.
  - QA has real mobile-device or emulated coverage for login, navigation, search, core portal workflows, and logout/session recovery.

## Existing Scrum Dependencies

- `TB-0029`: source-fixed; mobile portal sidebar now has an accessible title and visible dismiss control. Still needs hosted mobile and assistive-technology proof before closure.
- `TB-0048`: portal search should stop warming large multi-query datasets before committed search, especially important on mobile networks.
- `TB-0060`: admin mobile utility anchors need one intentional support zone.
- `TB-0061`: reports need progressive disclosure on mobile.
- `TB-0062`: privacy and legal controls need mobile trust navigation.
- `TB-0063`: admin scrum tracker setup stack needs mobile queue-first order.
- `TB-0065`: consent banner footprint needs to shrink on mobile.
- `TB-0087`: Supabase Data API exposure and helper grants need tightening before app clients depend on the backend boundary.
- `TB-0089`: Edge Functions need a service catalog and shared auth controls before they become a mobile service layer.
- `TB-0090`: partner/API tier rules should cover future mobile integrations and app-store-adjacent clients.
- `TB-0091`: extension API rate limits and negative-path contract tests are the pattern for mobile API abuse controls.
- `TB-0098`: mobile Client opportunities should enter through workflow context before the full long form.

## Discussion Notes

### Product Scope

The first mobile app should not mirror every desktop admin surface. The best first slice is likely:

- Bum: opportunities, claims, contacts, earnings, profile, and message follow-up.
- Client: dashboard, opportunities, claims, reports summary, payments/commission status, and team/profile basics.
- Admin: triage-only workflows, scrum/status visibility, urgent support, contact intake, and performance/error visibility.

Heavy admin configuration, long legal review, large reports, bulk exports, deep finance operations, and complex opportunity setup should stay web-first until mobile patterns are proven.

### Architecture Prep

- Keep Clerk as the identity provider, but prove the mobile SDK path before implementation. Clerk's Expo guidance supports native components, JS + native sign-in, and browser-based flows; the choice affects deep links, dev builds, and app-store QA.
- Keep Supabase as the data platform, but do not expose raw tables as the mobile app contract. Mobile should use the same lane model as `ADR 0001`: Direct Data API only for low-risk first-party reads, Portal Domain APIs for privileged/multi-table workflows, Internal Operations APIs for service jobs, and Partner APIs for external consumers.
- Treat the merged API access key surface as a client/partner integration dependency, not a shortcut for normal mobile auth. Mobile users should authenticate with Clerk sessions and mobile-safe Portal Domain APIs unless a separate approved client API use case is documented.
- Treat Edge Functions as the mobile service layer for privileged workflows. `TB-0089` should land before native app development so Clerk issuer/audience checks, CORS, rate limits, audit, owner, and rollback expectations are consistent.
- Decide whether the app needs push notifications, app links/universal links, offline drafts, local secure storage, file upload/camera access, or background sync. Each one changes scope, privacy review, and QA.

### UX Prep

- Finish the existing mobile portal cleanup before app-store work. The current mobile backlog is not cosmetic; it includes navigation accessibility, search performance, consent footprint, reports density, legal/trust navigation, and long-form entry issues.
- Design mobile flows by job, not by desktop route. The mobile app should answer "what do I need to act on now?" before exposing full configuration.
- Avoid a full Admin desktop clone in mobile v1. Use mobile admin for triage, status, and support actions.

### QA And Release Prep

- Add mobile route coverage for Admin, Client Admin, Client Finance, Client Member, and Bum.
- Add mobile auth/session tests for expired Clerk sessions, logout, invite redirects, role bootstrap, and denied-role routes.
- Add API contract tests for every mobile-used Portal Domain API.
- Add performance budgets for mobile route-start data fetches, especially global search and report screens.
- Add app-store privacy/security checklist before any native submission path.

## Delivery Path Tradeoff

| Path | Use when | Main blocker |
| --- | --- | --- |
| Responsive web / PWA-first | The goal is fast mobile workflow proof and no native-only features yet. | Existing mobile UX/accessibility/performance debt must be closed. |
| Capacitor shell | The goal is app-store presence while reusing the current React app. | Deep links, auth redirects, plugin needs, and webview QA must be proven. |
| Expo / React Native | The goal is a true native app with native auth, push, secure storage, and mobile-first navigation. | Requires shared API contracts and likely a separate mobile UI codebase. |

## Current Standards Checked

- Clerk Expo docs: https://clerk.com/docs/expo/getting-started/quickstart
- Supabase React Native auth docs: https://supabase.com/docs/guides/auth/quickstarts/react-native
- Expo EAS Build and Submit docs: https://docs.expo.dev/deploy/build-project/ and https://docs.expo.dev/deploy/submit-to-app-stores/
- Capacitor docs and deep-link guidance: https://capacitorjs.com/docs/ and https://capacitorjs.com/docs/guides/deep-links

## Recommended Next Sprint

1. Get hosted mobile and assistive-technology proof for the source-fixed `TB-0029` navigation drawer.
2. Close `TB-0048`, `TB-0061`, `TB-0065`, and `TB-0098` because they directly affect mobile usability and mobile route cost.
3. Advance `TB-0089` enough to define the mobile service/auth layer.
4. Write a one-page mobile product scope for Bum, Client, and Admin.
5. Decide PWA-first versus Capacitor versus Expo/React Native.
6. Add QA mobile smoke coverage for the chosen first mobile path.
