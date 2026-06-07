# Trusted Bums UX Optimization Backlog

_Last updated: 2026-06-07 by Codex daily UX consultant automation._

## Executive Read

The highest-leverage UX gaps are still in the public trust and recovery paths that source review can confirm today: public signup still clears a manually entered company name when the email no longer matches a known workspace, the homepage contact form still relies on destructive toasts instead of field-level recovery, and blocked client users still get redirected without explanation or a direct agreement-recovery path.

The earlier client-finance payment-page issue has narrowed materially in current source. `src/test/e2eSmokeRegression.test.ts` now guards the updated signup copy, prevents duplicate exact `Customer Payment Reports` headings, and asserts that global search scoring prioritizes page and title matches. Because this runner lacked exported QA env variables, could not reach GitHub Actions, and could not bind a local preview server on `127.0.0.1:8080`, that finance flow now belongs in watchlist revalidation rather than the active backlog.

## Active Recommendations

### P1 - Preserve typed company names in the public signup flow
- Evidence: `src/components/SignupIntentDialog.tsx` still calls `setCompanyName("")` whenever the selected role is `CLIENT` and `getKnownClientForEmail(email)` returns no match, so editing the email can erase a manually entered company name before signup is complete. Baymard still treats loss of entered form data as a major source of form friction: https://baymard.com/learn/form-design
- Why it matters: This is an early trust moment for prospective clients. Silent data loss makes the workflow feel brittle before the visitor has committed any time or information.
- Recommendation: Preserve manually entered `companyName` unless the user explicitly accepts a matched workspace or switches away from the client flow. Keep workspace-match guidance, but separate existing-workspace behavior from first-time workspace requests.
- Acceptance criteria: Editing the email no longer clears a manually entered company name when no workspace match exists; matched workspaces still prefill clearly; first-time workspace requests retain the typed company name unless the user intentionally replaces it.

### P1 - Add inline validation and reassurance copy to the homepage contact form
- Evidence: `src/pages/Index.tsx` still validates only `name`, `email`, and `message` inside `submitContactForm` and responds with destructive toasts, while the rendered form still has no inline errors, linked error summary, or `aria-invalid` wiring. Current W3C and GOV.UK guidance still recommends field-level errors plus a linked summary for invalid submit states: https://design-system.w3.org/styles/form-errors.html and https://design-system.service.gov.uk/components/error-summary/
- Why it matters: This is the main public handoff for buyers and future Bums. Toast-only validation forces users to guess which field failed and weakens trust exactly when they are deciding whether to share contact details.
- Recommendation: Add field-level validation messages, a linked error summary on submit, `aria-invalid` and `aria-describedby` wiring, and a short expectation-setting note near submit that explains reply timing or handling.
- Acceptance criteria: Invalid submit shows inline errors and a linked summary; invalid fields expose accessible error state; users can recover without guessing; the submit area includes a short reassurance message about follow-up timing or handling.

### P1 - Make blocked-route recovery and agreement recovery explicit on the client dashboard
- Evidence: `src/components/ClientAccessRoute.tsx` still redirects blocked client users to `/client/dashboard` with `state={{ deniedFrom: location.pathname }}`, but `src/pages/client/ClientDashboard.tsx` still does not read `deniedFrom` or explain the redirect. The finance and non-finance next-action cards still send agreement recovery to `/client/profile`, even though dedicated agreement flows live at `src/pages/client/ClientAgreements.tsx` and `src/pages/client/ClientTerms.tsx`. W3C guidance still recommends telling users what happened and what to do next after blocked actions: https://www.w3.org/WAI/tutorials/forms/notifications/
- Why it matters: Silent redirects and misdirected legal recovery links make role boundaries and agreement requirements feel arbitrary, which increases support load and lowers confidence in the client portal.
- Recommendation: Surface a dismissible dashboard notice when `deniedFrom` is present, name the current client role, explain the blocked destination, and route agreement actions to `/client/agreements` or `/client/terms` instead of `Company Profile`.
- Acceptance criteria: A redirected user sees a visible notice naming the blocked page, current role, and next allowed action; outdated-terms prompts route to the agreement flow; ordinary dashboard visits do not show the notice.

### P2 - Add urgency and next-step cues to the admin handoff queues
- Evidence: `src/pages/admin/AdminHandoffs.tsx` still sorts target responses, intro requests, and public contact conversions by age, but the queue tables still expose only status, owner, created time, update, and actions. Underlying data already includes `admin_next_action`, `admin_priority`, and `notification_error` in `src/lib/portalApi.ts`, while notification failure is still surfaced separately in `src/pages/admin/AdminTroubleshooting.tsx`. USWDS table guidance still favors scannable summaries for dense operational tables: https://designsystem.digital.gov/components/table/
- Why it matters: This is the admin rescue queue for leads, target responses, and intro requests. Without urgency and next-step context, admins must infer what is actually stuck and what to do next.
- Recommendation: Surface priority, next action, stale or SLA state, and notification failure directly in each queue row or responsive summary so admins can triage without leaving the page.
- Acceptance criteria: Open items older than the chosen SLA threshold are visually distinct; each row shows the next required action; contact submissions with failed notifications are visible in the handoff queue; admins can distinguish fresh, stale, and unowned work at a glance.

## Watchlist

- Finance smoke should be revalidated in the next GitHub-hosted `E2E Smoke` run, not carried as an active source-backed bug today. Current source now has regression coverage in `src/test/e2eSmokeRegression.test.ts` for the updated signup copy, the single exact `Customer Payment Reports` heading, and search-score prioritization for page and title matches, but this runner could not re-check deployed client-finance behavior live.
- `tests/e2e/visual-ui-audit.spec.ts` still does not capture `/admin/handoffs`, so responsive judgments about the queue layout remain source-backed rather than screenshot-backed.
- `tests/e2e/portal-interaction-audit.spec.ts` still treats some hash-link patterns as broken internal links. Keep skip-link and same-page-anchor UX conclusions provisional until that audit is reconciled with the shared `#main-content` pattern.
- External DNS fallback evidence is still incomplete. `curl -I -L --max-time 15 https://rcdl.tplinkdns.com` reached the host but failed certificate validation with `curl: (60) SSL certificate problem: unable to get local issuer certificate`, so this run did not use that endpoint as trusted route proof.

## Access Requests And Evidence Gaps

Material missing access, credentials, analytics, screenshots, customer data, or other evidence needed for a stronger UX review. Mirror durable requests in `docs/consultant-access-needs.md`.

- Authenticated QA evidence was unavailable in this session because `corepack pnpm run qa:env` reported missing `QA_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `QA_ADMIN_EMAIL`, `QA_CLIENT_ADMIN_EMAIL`, `QA_CLIENT_FINANCE_EMAIL`, `QA_CLIENT_MEMBER_EMAIL`, and `QA_BUM_EMAIL`.
- Fresh GitHub-hosted workflow evidence was unavailable because `gh run list --repo pidpoddev/trustedbums --limit 8` failed with `error connecting to api.github.com`.
- Fresh local route screenshots were unavailable because the sandbox rejected binding a local preview server on `127.0.0.1:8080` with `listen EPERM`, and the external DNS fallback target `https://rcdl.tplinkdns.com` failed TLS verification on this runner.
- No analytics, session recordings, support-ticket exports, sales-objection notes, customer-feedback exports, or narrated role walkthroughs were available in this run. Priority remains inferred from current source, tests, and external UX guidance rather than observed user behavior.

## Agent Inputs

- Date of run: 2026-06-07
- Files, tests, routes, sources, and commands reviewed: `docs/agents/automation-prompts/daily-ux-consultant.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/consultant-access-needs.md`, `docs/codex-edit-log.md`, prior `docs/ux-optimization-backlog.md`, `git status --short`, `git log --oneline -n 12 -- docs src tests .github package.json`, `git log --oneline -n 8 -- src/components/SignupIntentDialog.tsx src/pages/Index.tsx src/components/ClientAccessRoute.tsx src/pages/client/ClientDashboard.tsx src/components/PortalGlobalSearch.tsx src/pages/client/ClientPayments.tsx src/pages/admin/AdminHandoffs.tsx`, `src/components/SignupIntentDialog.tsx`, `src/pages/Index.tsx`, `src/components/ClientAccessRoute.tsx`, `src/pages/client/ClientDashboard.tsx`, `src/pages/client/ClientAgreements.tsx`, `src/pages/client/ClientTerms.tsx`, `src/components/PortalGlobalSearch.tsx`, `src/pages/client/ClientPayments.tsx`, `src/pages/admin/AdminHandoffs.tsx`, `src/pages/admin/AdminTroubleshooting.tsx`, `src/lib/portalApi.ts`, `tests/e2e/staging-smoke.spec.ts`, `tests/e2e/authenticated-role-smoke.spec.ts`, `tests/e2e/contact-intake.spec.ts`, `tests/e2e/visual-ui-audit.spec.ts`, `tests/e2e/helpers/auth.ts`, `src/test/e2eSmokeRegression.test.ts`, `corepack pnpm run qa:env`, `corepack pnpm run lint`, `corepack pnpm run build`, `corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts`, `gh run list --repo pidpoddev/trustedbums --limit 8`, `curl -I -L --max-time 15 https://rcdl.tplinkdns.com`, W3C form-error guidance, GOV.UK error-summary guidance, W3C notifications guidance, Baymard form guidance, and USWDS table guidance.
- Checks that could not run and why: `corepack pnpm run qa:env` failed because the required `QA_*` and Clerk variables were absent in this shell; GitHub workflow access was unavailable because outbound `gh` API access failed; local browser preview on `127.0.0.1:8080` could not start because the sandbox rejected the listen call with `EPERM`; the external DNS fallback target did not provide trustworthy route evidence because TLS verification failed on `https://rcdl.tplinkdns.com`.
