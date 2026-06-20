# Trusted Bums UX Optimization Backlog

_Last updated: 2026-06-20 by Codex daily UX consultant automation._

## Executive Read

Exact head `e231cc0` now has clean hosted proof across the public UX lane: GitHub `QA` `27857690007`, DreamHost deploy `27857689995`, exact-head `Visual UI Audit` `27857691601`, and hosted `E2E Smoke` `27857708006` all completed `success` on 2026-06-20 UTC. `TB-0065` can come out of the active queue. [ConsentManager.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/ConsentManager.tsx:93) keeps the compact first-layer treatment in source, [scrumFiveBatch.test.ts](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/test/scrumFiveBatch.test.ts:24) still guards it, the exact-head GitHub visual workflow passed, and a fresh hosted Pixel 7 capture of `https://trustedbums.com/?consent=reset` shows a `388 x 218` first-layer banner with `Reject all`, `Accept all`, and `Customize` visible while the hero headline and the first `Create Client account` CTA remain in view.

The older public-route UX items stay closed on current head. `[TB-0082]` remains closed because the public `/bums` header did not regress and current public mobile evidence stays readable. `[TB-0064]` remains closed because the homepage still keeps the client-only CTA explicit. `[TB-0096]` remains closed because the client opportunity workflow still avoids sending non-finance users to a finance-only route. No sharper current-head UX defect surfaced in source review, exact-head hosted artifacts, or the deployed-site mobile capture.

## Active Recommendations

- No active UX recommendations on exact head `e231cc0`.

## Watchlist

- Shared authenticated-mobile support-zone overlap still belongs to the UI queue as `TB-0060`; this UX pass did not find a new public-route defect that should replace or duplicate it.
- The runner-side external DNS target `https://rcdl.tplinkdns.com` still fails TLS verification with `curl: (60)` and should stay separate from primary-host UX evidence on `https://trustedbums.com`.
- Public-funnel prioritization is still lighter than it should be because fresh GA, Bing, session-recording, support, and sales-objection evidence were not callable in this shell.

## Access Requests And Evidence Gaps

Material missing access, credentials, analytics, screenshots, customer data, or other evidence needed for a stronger UX review. Mirror durable requests in `docs/consultant-access-needs.md`.

- Restore a durable operator path for GA and Bing aggregates (`GA4_PROPERTY_ID`, GA impersonation, and `BING_WEBMASTER_API_KEY`) if the daily UX run should prioritize by current funnel evidence instead of route review plus screenshots.
- Provide session recordings, support-ticket exports, sales-objection notes, customer-feedback exports, or narrated role walkthroughs for Admin, Client Admin, Client Finance, Client Member, and Bum flows so UX prioritization can move beyond source plus visual evidence.
- Provide durable retained visual baselines or a longer-lived screenshot library for public plus authenticated role states so current-head UX review does not depend on short GitHub artifact retention.

## Agent Inputs

- Date of run: 2026-06-20.
- Files, tests, routes, screenshots, sources, and commands reviewed: `docs/agents/automation-prompts/trusted-bums-daily-ux-consultant.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/ux-optimization-backlog.md`, `docs/consultant-access-needs.md`, `docs/agents/consultant-access-needs.md`, `docs/codex-edit-log.md`, `git rev-parse HEAD`, `git status --short`, `git log --oneline --decorate -12`, exact-head source review of [ConsentManager.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/ConsentManager.tsx:93), [Index.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx:296), [BumLanding.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/BumLanding.tsx:57), and [ClientOpportunityNew.tsx](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientOpportunityNew.tsx:1494); `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 30 --json ...`; `/Users/macdaddy/bin/gh-trustedbums run view 27857691601 --repo Pidpoddev/trustedbums --json jobs,...`; focused Vitest `src/test/scrumFiveBatch.test.ts src/test/uiVisualCleanup.test.ts src/test/mobileSidebarAccessibility.test.ts` (`22/22` passed); `curl -I -L --max-time 20 https://trustedbums.com`; `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`; hosted Playwright Pixel 7 capture of `https://trustedbums.com/?consent=reset` written to [public-consent-first-layer-hosted-pixel7.png](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/test-results/ux-consultant-2026-06-20/public-consent-first-layer-hosted-pixel7.png) with metrics in [public-consent-first-layer-hosted-pixel7.json](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/test-results/ux-consultant-2026-06-20/public-consent-first-layer-hosted-pixel7.json); live tracker read for `TB-0065`; and current external guidance from the [ICO cookie guidance](https://ico.org.uk/media2/kz0doybw/guidance-on-the-use-of-cookies-and-similar-technologies-1-0.pdf), [W3C Reflow guidance](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html), and [W3C Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Checks that could not run and why: `GA4_PROPERTY_ID` and `BING_WEBMASTER_API_KEY` remained unset after sourcing `.env.qa`, so fresh GA and Bing aggregate reruns were not possible. A local `127.0.0.1:8080` preview was not usable as product evidence in this shell because both unsourced and sourced local previews rendered the `Trusted Bums configuration needed` fallback instead of the real public site, so deployed-site Playwright capture was used for the consent-first-layer proof. A narrow reuse of `tests/e2e/visual-ui-audit.spec.ts` against local preview also hit a stale homepage-heading expectation, so that local assertion failure was treated as test-preflight drift rather than a current hosted UX defect. No session recordings, support exports, customer-feedback datasets, sales-objection notes, or narrated role walkthroughs were available in-session, so prioritization remained route-, source-, screenshot-, tracker-, and hosted-run-backed rather than behavior-backed.
