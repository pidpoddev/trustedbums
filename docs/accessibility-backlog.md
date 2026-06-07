# Trusted Bums Accessibility Backlog

_Last updated: 2026-06-07 by Codex daily accessibility specialist automation._

## Executive Read

Current source review, current W3C guidance, and the narrow checks this session could actually run still support four implementation-ready accessibility issues: the mobile portal sidebar still hides its only visible close control and has no accessible dialog name, the public contact form still reports submit errors only through toasts, the collapsed site-wide `Privacy choices` launcher is undersized for WCAG 2.2 target-size expectations, and the public sign-up intent dialog still shows visible validation text without programmatic error wiring. Evidence quality is weaker than the 2026-06-06 backlog implied: `corepack pnpm run build` passed and `corepack pnpm run lint` finished with warnings only, but `.env.qa` is absent in this checkout, `corepack pnpm run qa:env` failed immediately on missing QA variables, the runner still cannot bind `127.0.0.1:8080` for local preview, `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` currently fails TLS verification, and the repo still has no axe dependency.

## Active Recommendations

### P1 - Give the mobile portal sidebar an accessible name and a visible dismiss control
- Evidence: `src/components/ui/sidebar.tsx` still renders the mobile portal navigation inside `SheetContent` and hides the default close button with `[&>button]:hidden` at line 159, while `src/components/ui/sheet.tsx` still only provides the close control inside `SheetContent` at lines 58-63. The sidebar wrapper still adds no `SheetTitle`, `aria-label`, or equivalent dialog name.
- Why it matters: On mobile, the portal navigation is a modal dialog. Current WAI-ARIA APG guidance still expects the dialog to have an accessible name and strongly recommends a visible close button in the tab sequence.
- Recommendation: Keep the in-sheet close button visible and add a stable dialog name such as `Portal navigation` through `SheetTitle` or `aria-label` for the Admin, Client, and Bum mobile sidebars.
- Acceptance criteria: On mobile widths, opening the sidebar exposes a visible dismiss control, the dialog is announced with a clear name, `Escape` and the dismiss control both close it, and focus returns to the `Toggle Sidebar` trigger.

### P1 - Add field-level errors and verification messaging to the public contact form
- Evidence: `src/pages/Index.tsx` still rejects invalid name, email, and message values only through a destructive toast at lines 151-157 and still reports missing Turnstile completion only through a second toast at lines 160-166. The rendered fields at lines 549-649 still have no inline error text, `aria-invalid`, or error-message `aria-describedby` wiring.
- Why it matters: Toast-only validation forces users to infer which field failed and can disappear before screen-reader, keyboard, or magnification users recover. This remains the main public error-identification and recovery gap.
- Recommendation: Add persistent inline error text for each invalid field and the Turnstile block, mark invalid fields with `aria-invalid`, and move focus to the first invalid field or a concise error summary after submit.
- Acceptance criteria: Invalid submission keeps the user on the form, exposes visible error text next to every failing field, wires each message with `aria-describedby`, marks failing fields with `aria-invalid`, and does not rely on toast timing as the only error signal.

### P2 - Enlarge the collapsed `Privacy choices` launcher to meet WCAG 2.2 target-size expectations
- Evidence: After the banner closes, `src/components/ConsentManager.tsx` still renders the persistent launcher as a fixed `Button` with `h-5`, `px-2`, and `text-[10px]` at lines 141-156. That leaves the control below the 24 by 24 CSS pixel target-size baseline unless spacing exceptions are deliberately proven, and this run had no live mobile screenshot evidence to support an exception claim.
- Why it matters: The privacy launcher is a site-wide legal and consent control. Small fixed targets are harder to activate for touch and motor-impaired users, especially on mobile.
- Recommendation: Increase the launcher hit area to at least 24 by 24 CSS pixels, or replace it with an equivalently reachable same-page control that already meets the target-size expectation.
- Acceptance criteria: The collapsed `Privacy choices` control exposes at least a 24 by 24 CSS pixel hit area on public and portal pages, remains visually discoverable, and does not rely on a separate page to provide the only adequately sized control.

### P2 - Add programmatic error state to the public sign-up intent dialog
- Evidence: `src/components/SignupIntentDialog.tsx` still renders visible inline validation messages for missing account type, invalid email, and missing company name at lines 137, 149, and 167, but the radio group and inputs at lines 105-167 still do not add `aria-invalid` or `aria-describedby`. `tests/e2e/staging-smoke.spec.ts` still treats visible error text as the complete validation proof at lines 36-52.
- Why it matters: Visible error text is better than toast-only validation, but screen-reader users still do not get a reliable programmatic link between the failing control and its error state during a public account-creation flow.
- Recommendation: Keep the inline messages, then add stable IDs plus `aria-describedby` and `aria-invalid` to the role, email, and company controls when validation fails. If the role group remains custom, add one group-level error target that assistive technology can announce reliably.
- Acceptance criteria: After an invalid submit, each failing sign-up control exposes `aria-invalid="true"`, its visible error message is linked with `aria-describedby`, and keyboard or screen-reader users can determine which field failed without relying on surrounding visual context.

## Watchlist

- No additional watchlist items should stay active until live browser evidence returns. The earlier privacy-launcher overlap concern is now partly narrowed by the portal bottom-padding change in `850e507`, but this session still lacked fresh desktop and mobile screenshots to clear or re-promote it.

## Current Standards And Time-Sensitive Notes

- WCAG 2.2 remains the current W3C recommendation. The W3C WCAG overview page was updated on 2026-05-26, and the WCAG 2.2 errata page was last modified on 2026-06-04. Those updates do not change the current backlog priorities, but they confirm WCAG 2.2 is still the live baseline to target. Sources: https://www.w3.org/WAI/standards-guidelines/wcag/ and https://www.w3.org/WAI/WCAG22/errata/
- Current WAI-ARIA APG modal dialog guidance still says the dialog needs either `aria-labelledby` or `aria-label` and strongly recommends a visible close button in the tab order. That remains directly applicable to the mobile sidebar sheet. Source: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- Current WCAG 2.2 error-identification guidance still expects input errors to be identified in text, and W3C's current form-error examples still pair visible error text with explicit control associations. That remains the right implementation model for the public contact form and sign-up intent dialog. Sources: https://www.w3.org/WAI/WCAG22/Understanding/error-identification and https://design-system.w3.org/styles/form-errors.html
- Current WCAG 2.2 target-size guidance still says pointer targets should be at least 24 by 24 CSS pixels unless a defined exception applies. That now matters for the collapsed site-wide `Privacy choices` launcher. Source: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

## Access Requests And Evidence Gaps

- Authenticated browser-routable QA sessions, fresh desktop and mobile screenshots, keyboard walkthrough notes, screen-reader notes, and axe coverage are still missing for current Admin, Client Admin, Client Finance, Client Member, and Bum flows.
- `.env.qa` is absent in this checkout, so `corepack pnpm run qa:env` failed immediately on missing `QA_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `QA_ADMIN_EMAIL`, `QA_CLIENT_ADMIN_EMAIL`, `QA_CLIENT_FINANCE_EMAIL`, `QA_CLIENT_MEMBER_EMAIL`, and `QA_BUM_EMAIL`. That blocked authenticated Playwright route checks before first navigation.
- The runner still cannot provide local public-route browser evidence because `corepack pnpm exec vite preview --host 127.0.0.1 --port 8080` failed with `listen EPERM: operation not permitted 127.0.0.1:8080`.
- The required external DNS target also could not provide page-level evidence in this session because `curl -I -L --max-time 20 https://rcdl.tplinkdns.com` failed with `curl: (60) SSL certificate problem: unable to get local issuer certificate`.
- The repo still lacks `@axe-core/playwright` or `axe-core`, so this run could not add automated axe findings.

Material missing access, credentials, browser or AT validation, screenshots, axe output, or other evidence needed for a stronger accessibility review. Mirror durable requests in `docs/consultant-access-needs.md`.

## Agent Inputs

- Date of run: 2026-06-07
- Files, tests, and docs reviewed: `docs/agents/automation-prompts/trusted-bums-daily-accessibility-specialist.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/consultant-team-rules.md`, `docs/company-wide-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, `docs/accessibility-backlog.md`, `docs/codex-edit-log.md`, `src/components/ui/sidebar.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/dialog.tsx`, `src/layouts/AdminLayout.tsx`, `src/layouts/ClientLayout.tsx`, `src/layouts/BumLayout.tsx`, `src/pages/Index.tsx`, `src/components/SignupIntentDialog.tsx`, `src/components/ConsentManager.tsx`, `src/components/AccessibilityMenu.tsx`, `src/contexts/AccessibilityContext.tsx`, `src/pages/PrivacyPolicy.tsx`, `tests/e2e/staging-smoke.spec.ts`, `tests/e2e/portal-interaction-audit.spec.ts`, `tests/e2e/visual-ui-audit.spec.ts`, `scripts/verify-qa-env.mjs`, and `package.json`.
- Checks and commands reviewed: `git status --short`, `git log --since='2026-06-04 00:00' --name-only --pretty=format:'COMMIT %h %cs %s' -- docs/accessibility-backlog.md docs/consultant-access-needs.md src/components/ui/sidebar.tsx src/components/ui/sheet.tsx src/pages/Index.tsx src/components/SignupIntentDialog.tsx src/components/ConsentManager.tsx src/layouts/AdminLayout.tsx src/layouts/ClientLayout.tsx src/layouts/BumLayout.tsx tests/e2e/staging-smoke.spec.ts tests/e2e/portal-interaction-audit.spec.ts tests/e2e/visual-ui-audit.spec.ts`, targeted `rg`, `sed`, and `nl`, `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run qa:env`, `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run lint`, `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run build`, `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm exec vite preview --host 127.0.0.1 --port 8080`, and `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`.
- Live connector checks reviewed: `mcp__supabase_trustedbums.get_project_url` returned `https://vaoqvtxqvbptyxddpoju.supabase.co`, and `mcp__supabase_trustedbums.list_edge_functions` returned the current Trusted Bums edge-function inventory including `send-website-email`, `submit-contact`, and `submit-feedback`.
- Internet sources reviewed: https://www.w3.org/WAI/standards-guidelines/wcag/, https://www.w3.org/WAI/WCAG22/errata/, https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/, https://www.w3.org/WAI/WCAG22/Understanding/error-identification, https://design-system.w3.org/styles/form-errors.html, and https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Checks that could not run and why: no authenticated route browser validation because the QA env contract is not present in this checkout; no local public Playwright validation because the runner cannot bind a preview server on `127.0.0.1:8080`; no external page-level route validation because the required DNS target currently fails TLS verification from this runner; no axe scans because the repo has no axe dependency or configured accessibility spec; no screen-reader validation because no AT notes or live assistive-technology session access were available.
