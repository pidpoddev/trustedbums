# Trusted Bums B2B Marketing Growth Backlog

_Last updated: 2026-06-21 by Codex._

## Executive Growth Thesis

Exact head `b33b9c5a2b9cf93c7dac6e0dfca9a80248bcf96e` is current on `main`, and the authoritative hosted product lane is green: GitHub `QA` `27910814598`, DreamHost deploy `27910814601`, hosted `Visual UI Audit` `27910818729`, hosted `Deep QA Hotfix Audit` `27910818723`, and hosted `E2E Smoke` `27910834074` all completed successfully on 2026-06-21 UTC. Fresh runner checks still show `https://trustedbums.com`, `/sitemap.xml`, and `/robots.txt` returning `HTTP/2 200`.

The current growth constraint is still qualified Client demand, and the live gap is conversion truth plus operator follow-through, not missing public product surface area. The public site still routes buyer demand through a Client-first homepage while Bum recruiting stays isolated on `/bums`, and the homepage form already captures buyer role, target-account count, target-account context, blocker, urgency, referral source, and commercial reason. What the live evidence shows is that traffic is not yet turning into enough trusted demand signals to justify more scale:

- GA `events` for `7daysAgo..today` now shows `988` `form_start` events, while GA `portal` shows `2,593` consented public home route views in the same rolling window.
- GA `outcomes` now shows two live business-event families: `trustedbums_opportunity_created = 15` and `trustedbums_claim_requested = 1`, but it still shows no `generate_lead` or `trustedbums_client_lead_submitted` rows.
- Supabase aggregate reads show only one `CLIENT` contact submission in the last 30 days, still `NEW` and `NEEDS_REVIEW`, against a marketplace base of `8` client companies, `9` approved client profiles, and `9` approved Bum profiles.

That means the safest next move is still not paid scale or broader Bum acquisition. It is tightening the public-demand handoff, qualifying referrals better, using the new approved brand direction to keep founder-led LinkedIn narrow, and improving search or citation trust proof while the GTM operating layer catches up.

## North Star And Guardrails

- Primary growth goal: increase qualified marketplace liquidity by adding approved Client companies with real named-account demand and approved Bums with credible access that actually activates.
- Current operating priority: improve public-demand conversion truth, review speed, and founder follow-up quality before increasing traffic volume.
- Quality guardrail: do not optimize for raw signups, impressions, or booked calls if named-account seriousness, approval quality, or first-workflow activation weakens.
- Trust guardrail: keep Trusted Bums reading like a selective B2B warm-introduction marketplace, not a generic lead-gen shop, scraped-list motion, passive-income scheme, or broad affiliate offer.
- Legal and claims guardrail: no guaranteed meetings, guaranteed revenue, customer-logo claims, payout promises, or referral-compensation claims outside approved proof boundaries.
- Marketplace guardrail: keep Bum recruiting invite-only and referral-scored while Client demand remains the current constraint.
- Channel guardrail: keep email, DMs, referral asks, and any paid pilot low-volume and human-reviewed until CRM truth, suppression handling, objection logging, and qualification ownership are durable.
- Analytics guardrail: the documented keyless GA path works from this checkout when this shell exports `GA4_PROPERTY_ID`, `GOOGLE_CLOUD_PROJECT`, and `GA4_IMPERSONATE_SERVICE_ACCOUNT`, but `.env.qa` still does not export those values and `BING_WEBMASTER_API_KEY` is still missing after sourcing `.env.qa`.
- Search guardrail: use Search Console, Bing Webmaster Tools, IndexNow, and legitimate citations to improve discovery and trust. Do not buy backlinks, exchange links, mass-submit directories, or publish thin guest posts.
- Runner constraint: use port `8080` only for local testing. Use `https://trustedbums.com` as the default public proof target; the old `https://rcdl.tplinkdns.com` external DNS path is retired under `TB-0024`.

## Active Growth Plays

### P0 - [TB-0039] Close the public-demand handoff gap before adding more traffic
- Growth goal: qualified Client acquisition and marketplace activation.
- Audience: prospective Client buyers, founders, GTM leaders, and referral sources already willing to start a strategy conversation.
- Channel: public homepage, admin handoff queue, founder follow-up, and manual nurture.
- Evidence: exact head `5af32ed` is green on hosted QA, deploy, and E2E, and the latest commit changed only workflow-QA docs and tests rather than public growth surfaces. `src/pages/Index.tsx` still collects seriousness and blocker fields, `src/lib/contactApi.ts` still writes through `submit-contact`, and admin review surfaces already expose qualification status, owner claim, priority, next action, and follow-up deadline. Live GA now shows meaningful top-of-funnel behavior (`2,593` consented public home route views and `988` `form_start` events in the current rolling window), but GA `outcomes` still has no public lead-submission rows even though it now shows `trustedbums_opportunity_created = 15`, and Supabase aggregate reads still show only one `CLIENT` submission in the last 30 days, still `NEW` and `NEEDS_REVIEW`.
- Message and offer: keep the current serious buyer promise: `Request an intro strategy` and explain that Trusted Bums reviews named-account access problems rather than selling generic outbound volume.
- Activation path: public visit or referral -> strategy request -> same-day admin review -> founder follow-up -> strategy call -> agreement review -> first target, opportunity, or Bum-led workflow.
- Metric: submission-to-reviewed rate, qualified submission count, qualified-to-founder-call rate, first-workflow activation rate, and reconciliation between `contact_submissions` and consent-gated GA lead events.
- Trust and brand risk: adding more traffic before review ownership, objection handling, and measurement reconciliation are stable will create noisy demand, slower follow-up, and weaker trust.
- Recommendation: keep the public CTA structure, but tighten the operating layer around it. Define an owner and SLA for every new Client submission, reconcile `contact_submissions` against GA `generate_lead` and `trustedbums_client_lead_submitted` counts weekly, document why consent-gated analytics may undercount versus actual submissions, and create one approved founder follow-up plus one objection taxonomy before any traffic expansion.
- Acceptance criteria: every new Client submission gets an owner, priority, next action, and follow-up deadline; the weekly reconciliation explains DB submissions versus GA lead events; one founder reply template and one objection taxonomy exist; and Data/Analytics plus Trust sign off on the minimum fields and review cadence.

### P1 - [TB-0036] Make investor, advisor, and operator referrals the primary Client-demand motion
- Growth goal: qualified Client acquisition.
- Audience: investors, advisors, operators, founders, and senior sellers who know companies blocked on one to five named accounts.
- Channel: referral-led and founder-led asks over email, warm introductions, and direct DM.
- Evidence: the public Client path is already serious enough to receive referred traffic, and `docs/brand-strategy.md` now confirms the selective hard-account-access posture. `docs/client-buyer-intake-strategy.md` still defines the seriousness screen, `docs/claim-safe-proof-spine.md` still gives the safest reusable proof, and the live marketplace base remains small enough that high-fit referred companies matter more than broad awareness.
- Message and offer: `Who do you know that has one or two accounts that matter and no credible way in?`
- Activation path: warm referral -> strategy request or founder reply -> qualification -> agreement review -> first target or opportunity workflow.
- Metric: qualified referred companies per source, referral-to-call rate, qualified-to-approved rate, and first-workflow activation rate.
- Trust and brand risk: broad `send anyone` language, vague compensation language, or routing referred buyers into generic signup behavior weakens the selective-marketplace posture.
- Recommendation: prepare the referral ask pack before broadening reach. It should name the target company shape, disqualifiers, what `Request strategy review` means operationally, what happens to weak-fit referrals, and whether compensation language is intentionally excluded.
- Acceptance criteria: founder-approved referral ask pack exists, it names target company shape and disqualifiers, it points to an approved buyer CTA, and referral-compensation language is either explicitly approved or intentionally excluded.

### P1 - [TB-0037] Run founder-led LinkedIn around hard-account access and trust validation
- Growth goal: qualified Client acquisition and referral.
- Audience: founders, GTM leaders, investors, advisors, and operators with strategic-account context.
- Channel: founder LinkedIn organic first, with any paid pilot kept tightly scoped and short-form.
- Evidence: `src/pages/Index.tsx` still carries the hard-account narrative, `docs/brand-strategy.md` now locks the high-trust positioning, and `docs/linkedin-company-approval-packet.md` provides the first owner-reviewable company-page copy. Current LinkedIn guidance still supports short high-intent forms, a required privacy-policy URL, and image formats that work cleanly across desktop and mobile. The live conversion gap means LinkedIn should not scale ahead of `TB-0039`; it should feed a reviewable manual lane, not a broad automation stack.
- Message and offer: use three themes only: why cold fails in guarded accounts, why trust changes response quality, and why one credible route beats generic volume for strategic accounts.
- Activation path: founder post -> comment, profile visit, or DM -> strategy request or founder conversation -> manual qualification.
- Metric: qualified inbound conversations per post, attributable strategy requests, work-email rate, and fit rate by ICP.
- Trust and brand risk: meme-heavy tone, long forms, personal-email capture, or CTA drift toward generic signup makes the brand look conversion-hungry instead of selective.
- Recommendation: keep LinkedIn organic-first until the public demand handoff is reconciled. Use the existing approval packet as the owner-review draft, and require the next paid or gated spec to show the exact post themes, exact form fields, privacy URL, image ratio, attribution plan, and follow-up behavior after a response or form completion.
- Acceptance criteria: founder-approved three-post sequence exists, one DM follow-up exists, CTA routing is explicit, any paid pilot spec stays short-form and proof-safe, and LinkedIn traffic is routed to the same reviewed buyer path rather than a parallel lead sink.

### P2 - [TB-0109] Build legitimate search and company citation coverage
- Growth goal: make the public site easier to discover and verify without weakening trust.
- Audience: search engines, prospective Clients checking legitimacy, Bums checking the company before joining, and referral sources who need a credible public page to share.
- Channel: Google Search Console, Bing Webmaster Tools, IndexNow, LinkedIn company profile, approved founder or company profiles, partner or customer announcements, and selective industry listings where Trusted Bums truly belongs.
- Evidence: current runner checks confirm the homepage, `robots.txt`, and XML sitemap are live on `https://trustedbums.com`; hosted QA, deploy, Visual UI Audit, Deep QA, and E2E Smoke are green on `b33b9c5`; and [search-citation-coverage.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/search-citation-coverage.md) now defines the approved citation targets, copy boundaries, and closure evidence checklist. Current Google and Bing guidance still supports sitemap submission, Search Console or Webmaster Tools follow-up, IndexNow, and real citation quality over manipulative link tactics.
- Message and offer: point citations to useful public pages that explain the marketplace and the strategy-review path, not to generic signup.
- Activation path: search or citation visit -> trust or explainer page -> strategy request or founder conversation -> manual qualification.
- Metric: sitemap processing status, indexed public pages, brand-query impressions, organic or referral strategy requests, and citation quality.
- Trust and brand risk: paid backlinks, reciprocal links, low-quality directories, and thin guest posts would make Trusted Bums look like a search-manipulation project instead of a trust marketplace.
- Recommendation: use the approved packet to publish or verify three to five citations through owner-controlled channels: LinkedIn company page, Google or Bing owner-console surfaces, founder or operator profiles, and genuine customer, partner, or advisor mentions. Do not treat the packet itself as publication proof.
- Acceptance criteria: Google Search Console and Bing show the sitemap submitted or read against deployed canonical URLs; at least three approved external citations point to useful public Trusted Bums pages; no paid, exchanged, mass-directory, or unapproved guest-post links are used; and each citation has a published URL or owner-console proof entry.
- Current closure status: implementation packet complete; external publication proof still pending owner access or owner-provided published URLs. Keep `TB-0109` open or blocked-on-owner-proof until three citations are verified.

## ICP And Offer Matrix

| Segment | Trigger | Disqualifier | Value proposition | First CTA | Follow-up path |
| --- | --- | --- | --- | --- | --- |
| Founder, CEO, CRO, or lean GTM leader | One to five accounts matter materially and cold is failing | Wants generic lead volume instead of named-account access | Trusted, selective warm-route workflow for hard accounts | Request strategy review | Founder qualification -> agreement review -> first target or opportunity |
| Investor, advisor, or operator referral source | Knows a company with a specific access blockage | Broad low-fit list or weak urgency | Trusted Bums screens for seriousness before treating demand as active | Refer a company | Founder review -> qualification |
| Former executive or senior operator Bum candidate | Real buyer trust in a relevant market | Generic networking interest or passive-income framing | Reviewed path to turn relationship access into controlled intro work | Apply by referral | Screening -> approval -> `Inner Circle` intake -> first meaningful action |
| Current Bum or advisor referring another Bum | Knows a credible operator with real buyer access | Weak conduct fit or weak relationship proof | Trusted referral tree without opening the floodgates | Refer a Bum | Screening -> approve or decline |

## Funnel Map

### Client funnel

- Source: founder network, investor and advisor referrals, founder LinkedIn, organic search or citation discovery, and the homepage strategy-review path.
- Conversion points: visit or referral -> form start -> submission -> manual review -> founder follow-up -> strategy call -> agreement review -> first target, opportunity, or Bum-led workflow.
- Activation definition: approved Client company with an accepted agreement and at least one live target, opportunity, claim, or conversation workflow.
- Retention signals: repeated opportunities, repeated Bum responses, accepted Claims, Customer Payment Report activity, and Inbox follow-up continuity.
- Current drop-off signal: the current rolling GA window shows real top-of-funnel behavior plus some existing in-product opportunity creation, but still no public lead-submission outcome events, so the immediate question is where form starts and referred conversations stall before review or follow-up.

### Bum funnel

- Source: founder network, current Bums, client referrals, investor and advisor referrals, and selective direct outreach.
- Conversion points: referral received -> candidate submitted -> screening completed -> approved -> profile completed -> `Inner Circle` intake -> first meaningful action.
- Activation definition: approved Bum completes profile, logs the first `Inner Circle` contact set, and takes one meaningful marketplace action.
- Retention signals: repeated Claim activity, accepted work, `Inner Circle` upkeep, Customer Lead submissions, represented-contact upkeep, and payout trust.
- Current operating note: Bum recruiting is not the current bottleneck. Keep it closed-loop and quality-scored while Client demand and Client activation remain thinner than supply.

## Experiment Queue

1. Hypothesis: weekly reconciliation between `contact_submissions` and consent-gated GA lead events will expose the real public-demand leak faster than adding more traffic.
- Audience: existing public-site visitors and referred prospects.
- Channel: homepage, admin review queue, founder follow-up.
- Asset needs: review SLA, owner rule, objection taxonomy, and reconciliation template.
- Measurement: submission-to-reviewed rate, qualified submission count, DB-to-GA variance, founder follow-up completion rate.
- Owner: Growth + Data/Analytics + Founder.
- Stop or scale criteria: stop blaming traffic volume until review ownership and measurement variance are explained; scale traffic only after the handoff is stable.

2. Hypothesis: investor, advisor, and operator referrals will outperform any early outbound motion for Client demand.
- Audience: existing warm-network sources with company visibility.
- Channel: referral ask, direct email, direct DM.
- Asset needs: referral ask pack, screening rubric, founder follow-up script.
- Measurement: qualified referred companies per source, referral-to-call rate, first-workflow activation rate.
- Owner: Founder + Growth.
- Stop or scale criteria: stop sources that generate weak-fit volume; scale sources that repeatedly produce qualified named-account conversations.

3. Hypothesis: founder LinkedIn posts on hard-account access will create more qualified demand than broad product promotion.
- Audience: founders, GTM leaders, investors, advisors, operators.
- Channel: LinkedIn organic, then optional short-form lead form pilot.
- Asset needs: three-post sequence, one DM follow-up, hidden-field attribution plan.
- Measurement: qualified conversations per post, strategy-request volume, work-email rate, and fit rate.
- Owner: Founder + Growth.
- Stop or scale criteria: stop if traffic skews generic or low-fit; scale only after the public review lane is stable.

4. Hypothesis: clean search submission plus legitimate company citations will improve discoverability and trust verification more safely than generic backlink building.
- Audience: search engines, prospective Clients, referred Bums, and referral sources.
- Channel: Google Search Console, Bing Webmaster Tools, IndexNow, LinkedIn or company profiles, partner or customer citations.
- Asset needs: deployed sitemap, approved citation list, and one strong explainer page.
- Measurement: indexed-page count, brand-query impressions, organic or referral strategy requests, citation quality, and crawler errors.
- Owner: Growth + Trust + Founder.
- Stop or scale criteria: stop any source that requires payment for followed links, reciprocal placement, low-quality directory submission, or unapproved claims; scale only sources that improve real buyer trust.

## Sales And Recruiting Enablement

- Build one founder referral ask pack for investors, advisors, and operators.
- Build one approved founder follow-up for new strategy requests and one follow-up for referred but not-yet-submitted companies.
- Build one objection taxonomy covering source, ICP fit, blocker, proof concern, legal or payout concern, and next step.
- Build one claim-safe one-pager anchored to `docs/claim-safe-proof-spine.md`.
- Keep Bum recruiting enablement limited to a referral ask, screening rubric, and `Inner Circle`-first activation handoff rather than public-scale recruiting.

## Measurement Plan

- North-star metric: approved Client companies with live demand plus approved Bums with real activation.
- Client input metrics: qualified strategy requests, submission-to-reviewed rate, qualified-to-founder-call rate, qualified-to-approved rate, and first target or opportunity activation rate.
- Bum input metrics: approved candidates per source, approved-to-activated rate, `Inner Circle` completion rate, and time to first meaningful action.
- Quality metrics: work-email rate, named-account seriousness rate, low-fit submission rate, objection themes, unsubscribe or sender-risk signals, and referral-source quality.
- Current live baseline: current GA `events` shows `988` `form_start` events; GA `portal` shows `2,593` public home route views; GA `outcomes` shows `trustedbums_opportunity_created = 15` and `trustedbums_claim_requested = 1` but still no public lead-submission rows; Supabase aggregate reads still show one `CLIENT` submission in the last 30 days, still `NEW` and `NEEDS_REVIEW`.
- Source tracking needs: referral source, founder LinkedIn source, CTA path, work-email versus generic-email mix, reviewer, qualification status, next action, and first activated workflow.
- Attribution limits: GA is consent-gated and the recurring shell still depends on manual env exports for GA access. Bing report access is still blocked locally by the missing `BING_WEBMASTER_API_KEY`, and there is still no live CRM, LinkedIn, or email-platform dashboard in this run.

## Current Standards And Time-Sensitive Notes

- LinkedIn Lead Gen Forms still support pre-filled professional data, short high-intent capture, and a required privacy-policy URL, and current field guidance still caps custom questions inside a `12`-question maximum. Source: [Lead Gen Forms](https://business.linkedin.com/advertise/ads/sponsored-content/lead-gen-ads), [Lead Gen Form fields](https://www.linkedin.com/help/lms/answer/a425337), and [Lead Gen Forms privacy policy](https://www.linkedin.com/help/linkedin/answer/a420012).
- LinkedIn single-image guidance still recommends square `1200 x 1200` creative for clean desktop and mobile delivery, with `1200 x 628` as the standard landscape option. Source: [Single Image Ads Specifications](https://business.linkedin.com/advertise/ads/sponsored-content/single-image-ads-specs).
- Google's current sender guidance still requires SPF or DKIM, valid forward and reverse DNS, TLS, low spam rates, and one-click unsubscribe for bulk marketing senders. Source: [Email sender guidelines](https://support.google.com/mail/answer/81126?hl=en).
- Google Search still treats sitemap submission as a discovery hint rather than an indexing guarantee, so search-follow-through should be measured by crawl and indexing reports rather than by submission alone. Source: [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- Bing still treats IndexNow and webmaster submissions as faster discovery inputs rather than ranking guarantees, which fits keeping Bing submission active even while recurring report access is still blocked. Source: [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) and [IndexNow](https://www.bing.com/indexnow).

## Access Requests And Evidence Gaps

- `docs/brand-strategy.md` and `docs/linkedin-company-approval-packet.md` now exist, so positioning and draft LinkedIn copy are no longer the primary GTM blocker. What is still missing is owner-approved publishing proof plus channel-performance evidence.
- This run still had no live CRM or pipeline view for Client prospects or Bum candidates, so there is still no source-of-truth evidence for stage conversion, disqualification reasons, objection trends, or owner follow-through.
- This run still had no live LinkedIn organic, LinkedIn paid, or email-platform dashboard access.
- The manual GA impersonation path worked in this run, but `.env.qa` still does not export `GA4_PROPERTY_ID`, `GOOGLE_CLOUD_PROJECT`, or `GA4_IMPERSONATE_SERVICE_ACCOUNT`, and `BING_WEBMASTER_API_KEY` is still missing after sourcing `.env.qa`.
- Live Supabase tracker and GTM aggregate reads worked in this run, so the remaining access blocker is evidence depth rather than base tracker reachability.
- Keep durable GTM evidence gaps mirrored in `docs/consultant-access-needs.md`.

## Agent Inputs

- Date of run: 2026-06-21.
- Files and docs reviewed: `docs/agents/automation-prompts/trusted-bums-daily-b2b-growth-marketer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, `docs/codex-edit-log.md`, `docs/brand-strategy.md`, `docs/linkedin-company-approval-packet.md`, `docs/content-copyeditor-backlog.md`, `docs/marketing-graphics-campaign-backlog.md`, `docs/trust-reputation-backlog.md`, `docs/product-ops-workflow-backlog.md`, `docs/data-analytics-backlog.md`, `docs/trusted-bums-operating-model.md`, `docs/client-buyer-intake-strategy.md`, `docs/claim-safe-proof-spine.md`, `docs/google-analytics-api.md`, `docs/bing-webmaster-api.md`, `src/pages/Index.tsx`, `src/pages/BumLanding.tsx`, `src/components/admin/ContactSubmissionsPanel.tsx`, `src/lib/contactApi.ts`, and `tests/e2e/deep-workflow-hotfix-audit.spec.ts`.
- Hosted and live evidence reviewed: `git rev-parse HEAD`, `git status --short`, `git diff --stat e231cc0..HEAD -- src docs public tests .github supabase`, `git show --stat --summary --name-only HEAD -- src docs public tests .github supabase`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 40 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27894244168 --repo Pidpoddev/trustedbums --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27894244168 --repo Pidpoddev/trustedbums --log-failed`, `curl -I -L --max-time 20 https://trustedbums.com`, `curl -I -L --max-time 20 https://trustedbums.com/bums`, `curl -I -L --max-time 20 https://trustedbums.com/sitemap.xml`, `curl -k -I -L --max-time 20 https://rcdl.tplinkdns.com`, `export GA4_PROPERTY_ID=540873763 GOOGLE_CLOUD_PROJECT=project-d45d35fc-184a-43c2-889 GA4_IMPERSONATE_SERVICE_ACCOUNT=trusted-bums-ga4-agent@project-d45d35fc-184a-43c2-889.iam.gserviceaccount.com; gcloud auth list --filter=status:ACTIVE --format='value(account)'`, `corepack pnpm ga4:report -- --preset=overview --start-date=7daysAgo --end-date=today`, `corepack pnpm ga4:report -- --preset=events --start-date=7daysAgo --end-date=today --limit=40`, `corepack pnpm ga4:report -- --preset=portal --start-date=7daysAgo --end-date=today --limit=30`, `corepack pnpm ga4:report -- --preset=outcomes --start-date=7daysAgo --end-date=today --limit=30`, `source .env.qa >/dev/null 2>&1; corepack pnpm bing:health`, Supabase project metadata read, Supabase tracker row reads for `TB-0036`, `TB-0037`, `TB-0038`, `TB-0039`, and `TB-0109`, plus aggregate Supabase reads for `contact_submissions`, `profiles`, and `companies`.
- External guidance reviewed: [Lead Gen Forms](https://business.linkedin.com/advertise/ads/sponsored-content/lead-gen-ads), [Lead Gen Form fields](https://www.linkedin.com/help/lms/answer/a425337), [Lead Gen Forms privacy policy](https://www.linkedin.com/help/linkedin/answer/a420012), [Single Image Ads Specifications](https://business.linkedin.com/advertise/ads/sponsored-content/single-image-ads-specs), [Email sender guidelines](https://support.google.com/mail/answer/81126?hl=en), [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a), [IndexNow](https://www.bing.com/indexnow), and the current [Supabase changelog](https://supabase.com/changelog).
- Checks that could not run and why: `corepack pnpm bing:webmaster traffic` still could not run because `BING_WEBMASTER_API_KEY` was missing after sourcing `.env.qa`; recurring-shell GA access still depends on manual env exports because `.env.qa` does not export the GA variables; this run still had no CRM or pipeline export, no LinkedIn organic or paid analytics export, no email-platform dashboard, and no owner-approved publish proof for the LinkedIn packet; exact-head `Visual UI Audit` `27896715845` is still in progress, so this backlog relied on unchanged public growth sources plus current hosted headers and current QA, deploy, and E2E proof while that artifact finishes.
