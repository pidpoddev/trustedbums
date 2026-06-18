# Trusted Bums B2B Marketing Growth Backlog

_Last updated: 2026-06-18 by Codex daily B2B growth marketer automation._

## Executive Growth Thesis

Current production-backed evidence supports continued qualified Client-demand work on exact head `57231bf75e9900c11aea964ec9999517a831d1ca`. GitHub `QA` run `27710960865`, DreamHost deploy run `27710961582`, and hosted `E2E Smoke` run `27711014094` all completed successfully on 2026-06-17 UTC for that head, and fresh runner checks still show `https://trustedbums.com` returning `HTTP/2 200` with `Last-Modified: Wed, 17 Jun 2026 18:30:08 GMT`. The required fallback DNS target `https://rcdl.tplinkdns.com` still fails TLS verification from this runner, so external DNS evidence remains partial outside the primary host.

The operating constraint is still Client demand, not Bum supply. The shipped terminology and product split are materially cleaner than the prior `af944fe` snapshot: public source now routes buyer demand through `Request an intro strategy`, `Create Client account`, and `Request strategy review`, while the recruiting side has its own `/bums` flow. The old broad `Bum Prospect` blocker is no longer current-head truth. Internal and admin surfaces now consistently use `Prospective Bum`; the remaining seam is narrower and public-facing: `Apply as a Bum` still differs from the internal `Prospective Bum` noun, so recruiting should stay selective and referral-scored rather than broadened. That means the next growth leverage is still low-volume, trust-safe demand capture: referral asks, founder-led LinkedIn, legitimate search and citation coverage, and manual nurture with objection logging. It is not broad paid scale or lifecycle automation.

## North Star And Guardrails

- Primary growth goal: increase qualified marketplace liquidity by adding approved Client companies with real named-account demand and approved Bums with credible access that actually activates.
- Quality guardrail: do not optimize for raw signups, clicks, impressions, or booked calls if named-account seriousness, approval quality, or approved-to-activated rates weaken.
- Trust guardrail: keep Trusted Bums reading like a selective B2B marketplace, not a generic lead-gen shop, scraped-list motion, passive-income scheme, or broad affiliate offer.
- Legal and claims guardrail: no guaranteed meetings, guaranteed revenue, customer-logo claims, payout promises, or referral-compensation claims outside approved proof boundaries.
- Marketplace guardrail: keep Bum recruiting invite-only until Client demand, recruiting language, and activation tracking are stronger.
- Channel guardrail: keep outbound email, DMs, referral asks, and any paid pilot low-volume and human-reviewed until CRM truth, suppression handling, and objection logging are in place.
- Search and citation guardrail: use search engines for clean discovery and reputation proof, not volume hacks. The live sitemap and canonical cleanup is already deployed, so the next step is Search Console and Bing resubmission plus legitimate company/editorial citations. Do not buy backlinks, trade links, use mass directories, or publish thin guest posts.
- Analytics guardrail: GA and Bing instrumentation are farther along than this shell's recurring access. Source-side events now exist for `generate_lead`, `trustedbums_client_lead_submitted`, and consent-gated `trustedbums_route_view`, but this run still could not rerun local GA or Bing reports because `GA4_PROPERTY_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, and `BING_WEBMASTER_API_KEY` were absent after sourcing `.env.qa`.
- Runner constraint: use port `8080` only for local testing. When external DNS context is needed, use `https://rcdl.tplinkdns.com` and treat runner-local failures there as partial evidence only.

## Active Growth Plays

### P1 - [TB-0036] Make investor, advisor, and operator referrals the primary Client-demand motion
- Growth goal: qualified Client acquisition.
- Audience: investors, advisors, operators, founders, and senior sellers who know companies blocked on a small number of named accounts.
- Channel: referral-led and founder-led asks over email, warm introductions, and direct DM.
- Evidence: current production is serving `57231bf`, exact-head hosted `QA`, deploy, and `E2E Smoke` all passed, and the public Client path is still credible after the latest routing and terminology cleanup. `docs/client-buyer-intake-strategy.md` still defines the seriousness screen, `docs/claim-safe-proof-spine.md` still gives the safest reusable proof, and `src/pages/Index.tsx` still routes serious buyer demand toward the strategy-review path rather than a generic list-building offer.
- Message and offer: `Who do you know that has one or two accounts that matter and no credible way in?`
- Activation path: warm referral -> `Request strategy review` or direct founder reply -> founder qualification -> agreement review -> first opportunity or target-account workflow.
- Metric: qualified referred companies per source, plus referral-to-call, qualified-to-approved, and first workflow activation rates.
- Trust and brand risk: broad `send anyone` language, unclear compensation language, or routing referred buyers into generic signup copy weakens the selective-marketplace posture.
- Recommendation: build one referral ask pack with a short ask, a qualification rubric, and a founder reply script that sends serious companies to `Request strategy review` and disqualifies weak-fit referrals quickly.
- Acceptance criteria: one referral ask pack exists, it names target company shape and disqualifiers, it points to a single strategy-review CTA, and referral-compensation language is either explicitly approved or intentionally excluded.

### P1 - [TB-0037] Run founder-led LinkedIn around hard-account access and trust validation
- Growth goal: qualified Client acquisition and referral.
- Audience: founders, GTM leaders, investors, advisors, and operators with strategic-account context.
- Channel: founder LinkedIn organic first, with any paid pilot kept tightly scoped and short-form.
- Evidence: exact-head public proof is current on `57231bf`, `src/pages/Index.tsx` still carries the hard-account narrative, and current LinkedIn guidance still favors low-friction forms. LinkedIn's current Lead Gen Form guidance recommends `3` to `4` visible fields as best practice, allows up to `12` visible fields, permits up to `20` hidden fields for attribution, and supports work-email validation that blocks common free domains while warning that submission rates may drop. That fits a low-friction, work-email-first, attribution-aware pilot rather than a cloned site form.
- Message and offer: use three themes only: why cold fails in guarded accounts, why trust changes response quality, and why one credible route beats generic volume for strategic accounts.
- Activation path: founder post -> comment, profile visit, or DM -> strategy-review request or founder conversation -> manual qualification.
- Metric: qualified inbound conversations per post, attributable strategy-review requests, and fit rate by ICP.
- Trust and brand risk: meme-heavy tone, long forms, personal-email capture, or CTA drift toward generic signup makes the brand look conversion-hungry instead of selective.
- Recommendation: draft a three-post sequence, one comment-to-DM follow-up, and one optional paid pilot spec. If a paid pilot runs, keep the form to work-email-first plus one seriousness filter, use hidden fields for attribution, and send qualified leads into the richer founder-review flow.
- Acceptance criteria: three founder posts exist, one DM follow-up exists, CTA routing is explicit, any paid pilot spec stays short-form and proof-safe, and LinkedIn traffic is routed to strategy review rather than generic signup.

### P2 - [TB-0109] Build legitimate search and company citation coverage
- Growth goal: make the public site easier to discover and verify without weakening trust.
- Audience: search engines, prospective Clients checking legitimacy, Bums checking the company before joining, and referral sources who need a credible public page to share.
- Channel: Google Search Console, Bing Webmaster Tools, IndexNow, LinkedIn company profile, approved founder/company profiles, partner or customer announcements, and selective industry listings where Trusted Bums truly belongs.
- Evidence: the live sitemap/canonical cleanup is now on `57231bf`, `https://trustedbums.com` returns `HTTP/2 200`, and exact-head hosted `QA`, deploy, and `E2E Smoke` all passed. The stale `af944fe` quota-reset story is no longer the current blocker. The live gap is operator access and follow-through: this shell still lacks `BING_WEBMASTER_API_KEY`, and `corepack pnpm -s bing:webmaster traffic` still fails locally even after sourcing `.env.qa`. Google Search documentation continues to treat sitemap submission as a hint rather than a guarantee, while Bing still supports both URL submission and IndexNow for faster discovery.
- Message and offer: point citations to useful public pages that explain the marketplace and the serious strategy-review path, not to generic signup.
- Activation path: search or citation visit -> public trust/content page -> strategy-review request or founder conversation -> manual qualification.
- Metric: sitemap processing status, indexed public pages, brand-query impressions, qualified strategy-review visits from organic/referral sources, and citation quality.
- Trust and brand risk: paid backlinks, reciprocal links, low-quality directories, and thin guest posts would make Trusted Bums look like a search-manipulation project instead of a trust marketplace.
- Recommendation: resubmit `https://trustedbums.com/sitemap.xml` through Google Search Console, keep Bing feed submission and IndexNow active through the existing deploy-capable path, and create an approved citation list with `3` to `5` high-quality external profiles or editorial links. Pair this with one strong public explainer page before chasing broader backlinks.
- Acceptance criteria: Google Search Console and Bing show the sitemap submitted/read against deployed canonical URLs; at least three approved external citations point to useful public Trusted Bums pages; and no paid, exchanged, mass-directory, or unapproved guest-post links are used.

### P1 - [TB-0038] Keep Bum recruiting invite-only and referral-scored
- Growth goal: qualified Bum acquisition.
- Audience: current Bums, trusted operators, former executives, investors, advisors, and senior sellers with credible buyer access.
- Channel: founder-led referral asks, direct email, LinkedIn DM, and selective operator communities.
- Evidence: exact-head hosted truth is strong enough to keep this queued behind Client demand. Production is serving `57231bf`, the recruiting route still lives separately in `src/pages/BumLanding.tsx`, and internal/admin source now consistently uses `Prospective Bum`. The remaining recruiting-language seam is narrower than the prior backlog stated: public copy still says `Apply as a Bum`, while internal/admin flows refer to `Prospective Bum`. That is a wording polish issue, not a hard blocker to all recruiting, but it still supports keeping recruiting closed-loop.
- Message and offer: `We are looking for a small number of credible operators who can open real doors.`
- Activation path: warm referral or direct intro -> screening -> approval review -> profile completion -> first meaningful action such as saving a Client, adding a represented contact, submitting a Customer Lead, or claiming work.
- Metric: approved Bum candidates per source, approved-to-activated rate, time-to-first-meaningful-action, and later accepted-work quality by source.
- Trust and brand risk: open recruiting, `monetize your network` framing, or expanding the top-of-funnel before demand evidence strengthens will lower marketplace quality.
- Recommendation: keep recruiting closed-loop. Build one recruiting ask, one screening rubric, and one activation handoff. Treat the remaining public-versus-internal recruiting noun mismatch as wording cleanup, not as a reason to widen acquisition now.
- Acceptance criteria: the recruiting ask, screening rubric, and activation workflow are documented; passive-income framing is explicitly excluded; Product Ops can process a referred Bum consistently from review through first action; and the public recruiting path is still selective rather than broad.

### P1 - [TB-0039] Build manual nurture and objection logging before any lifecycle automation
- Growth goal: marketplace activation and sales enablement.
- Audience: qualified Client prospects who show intent but do not convert immediately.
- Channel: founder follow-up, manual email, one-pager, and call recap.
- Evidence: `src/pages/Index.tsx` still captures seriousness fields for Client demand, production is serving `57231bf`, and the current Client product path remains stronger than the GTM operating layer around it. But this run still had no live CRM or pipeline export, no LinkedIn analytics, no email-platform access, and no rerunnable local GA or Bing report path because `GA4_PROPERTY_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, and `BING_WEBMASTER_API_KEY` were missing after sourcing `.env.qa`. Google's current sender guidance still keeps authentication, PTR, TLS, spam-rate control, and one-click unsubscribe requirements in force for bulk senders, and current ICO guidance still requires clear identity plus simple opt-out handling for B2B email marketing.
- Message and offer: answer four questions in sequence: why cold fails here, how Trusted Bums controls claims and access, what proof can be shared safely, and what the next operating step looks like.
- Activation path: qualified strategy request -> manual review -> short founder follow-up plus one-pager -> strategy call or paused nurture with explicit stop conditions and objection logging.
- Metric: qualified contact-to-call conversion, objection-resolution rate, follow-up response rate, and no sender-risk regression.
- Trust and brand risk: lifecycle automation before suppression, instrumentation, objection categories, and approved copy exist will create deliverability and reputation risk faster than it creates value.
- Recommendation: create one short manual nurture sequence, one objection log schema, and one claim-safe founder one-pager before any lifecycle automation or higher-volume outbound.
- Acceptance criteria: the sequence has send triggers, CTA, stop conditions, and objection themes; Data and Analytics defines minimum tracking fields; Trust confirms the send pattern stays low-risk; and the asset references the current proof spine instead of inventing new claims.

## ICP And Offer Matrix

| Segment | Trigger | Disqualifier | Value proposition | First CTA | Follow-up path |
| --- | --- | --- | --- | --- | --- |
| Founder, CEO, CRO, or lean GTM leader | One to five accounts matter materially and cold is failing | Wants generic lead volume instead of named-account access | Trusted, selective warm-route workflow for hard accounts | Request strategy review | Founder qualification -> agreement review -> first opportunity |
| Investor, advisor, or operator referral source | Knows a company with a specific access blockage | Broad low-fit list or weak urgency | Trusted Bums screens for seriousness before treating demand as active | Refer a company | Founder review -> qualification |
| Former executive or senior operator Bum candidate | Real buyer trust in a relevant market | Generic networking interest or passive-income framing | Reviewed path to turn relationship access into controlled intro work | Apply by referral | Screening -> approval -> first meaningful action |
| Current Bum or advisor referring another Bum | Knows a credible operator with real buyer access | Weak conduct fit or weak relationship proof | Trusted referral tree without opening the floodgates | Refer a Bum | Screening -> approve or decline |

## Funnel Map

### Client funnel

- Source: founder network, investor and advisor referrals, founder LinkedIn, organic search/citation discovery, and the homepage strategy-review path.
- Conversion points: visitor or referred prospect -> strategy-review request -> manual qualification -> founder call -> agreement review -> first opportunity or target-account workflow -> first Bum response, Claim, or live conversation.
- Activation definition: approved Client company with an accepted agreement and at least one opportunity, target-account, or Bum-originated opportunity workflow live.
- Retention signals: repeated opportunities, repeated Bum responses, accepted Claims, Customer Payment Report activity, and Inbox follow-up continuity.
- Drop-off questions: which sources create qualified strategy requests, which objections block calls, and how many qualified calls reach first live workflow activation?

### Bum funnel

- Source: founder network, current Bums, client referrals, investor and advisor referrals, and selective direct outreach.
- Conversion points: referral received -> candidate submitted -> screening completed -> approved -> profile completed -> first meaningful action.
- Activation definition: approved Bum completes profile and takes one meaningful marketplace action.
- Retention signals: repeated Claim activity, accepted work, Customer Lead submissions, represented-contact upkeep, and payout trust.
- Drop-off questions: which sources create approved Bums, where referred candidates stall, and whether the public recruiting language still lowers trust before review?

## Experiment Queue

1. Hypothesis: investor, advisor, and operator referrals will outperform any early outbound motion for Client demand.
- Audience: existing warm-network sources with company visibility.
- Channel: referral ask, direct email, direct DM.
- Asset needs: referral ask pack, screening rubric, founder follow-up script.
- Measurement: qualified referred companies per source, referral-to-call rate, first workflow activation rate.
- Owner: Founder + Growth.
- Stop or scale criteria: stop sources that generate weak-fit volume; scale sources that repeatedly produce qualified named-account conversations.

2. Hypothesis: founder LinkedIn posts on hard-account access will create more qualified demand than broad product promotion.
- Audience: founders, GTM leaders, investors, advisors, operators.
- Channel: LinkedIn organic, then optional short-form lead form pilot.
- Asset needs: three-post sequence, one DM follow-up, hidden-field attribution plan.
- Measurement: qualified conversations per post, strategy-review submissions, work-email share.
- Owner: Founder + Growth.
- Stop or scale criteria: stop if traffic skews generic or low-fit; scale if strategy-review quality stays high.

3. Hypothesis: clean search submission plus legitimate company citations will improve discoverability and trust verification more safely than generic backlink building.
- Audience: search engines, prospective Clients, referred Bums, referral sources.
- Channel: Google Search Console, Bing Webmaster Tools, IndexNow, LinkedIn/company profiles, partner/customer/editorial citations.
- Asset needs: deployed canonical sitemap, approved citation/source list, one useful public explainer page.
- Measurement: indexed page count, brand-query impressions, organic/referral strategy-review visits, citation quality, crawler errors.
- Owner: Growth + Trust + Founder.
- Stop or scale criteria: stop any citation source that requires payment for followed links, reciprocal placement, low-quality directory submission, or unapproved claims; scale only sources that make the company more credible to real buyers and operators.

4. Hypothesis: keeping Bum recruiting invite-only will preserve marketplace quality while Client demand is still the main constraint.
- Audience: current Bums and trusted referrers.
- Channel: referral ask and selective direct outreach.
- Asset needs: recruiting ask, screening rubric, activation handoff.
- Measurement: approved Bums per source, approved-to-activated rate, early accepted-work quality.
- Owner: Founder + Product Ops.
- Stop or scale criteria: stop any source that brings weak-fit supply; scale only when Client demand and activation rates justify it.

5. Hypothesis: a short manual nurture sequence plus objection logging will improve qualified contact-to-call conversion without raising sender risk.
- Audience: qualified Client prospects who do not convert immediately.
- Channel: founder follow-up and manual email.
- Asset needs: nurture sequence, founder one-pager, objection taxonomy, minimum tracking schema.
- Measurement: qualified contact-to-call rate, follow-up response rate, objection-resolution rate.
- Owner: Founder + Growth + Data + Trust.
- Stop or scale criteria: pause if unsubscribe or trust signals worsen; scale only after manual cadence and suppression handling are stable.

## Sales And Recruiting Enablement

- Build one referral ask pack for investors, advisors, and operators.
- Build one founder LinkedIn sequence plus one comment-to-DM follow-up.
- Build one claim-safe founder one-pager anchored to `docs/claim-safe-proof-spine.md`.
- Build one Bum recruiting ask and screening rubric that explicitly excludes passive-income framing.
- Build one objection log schema covering source, ICP fit, blocker, claim concern, legal or payout concern, and next step.

## Measurement Plan

- North-star metric: active qualified marketplace liquidity, measured as approved Client companies with live demand plus approved Bums with real activation.
- Client input metrics: qualified strategy-review requests, referral-to-call rate, qualified-to-approved rate, first opportunity or target-account creation rate.
- Bum input metrics: approved candidates per source, approved-to-activated rate, time-to-first-meaningful-action.
- Quality metrics: work-email rate, named-account seriousness rate, low-fit submission rate, objection themes, unsubscribe or sender-risk signals.
- Source tracking needs: referral source, founder-led LinkedIn source, CTA path, work-email versus generic-email mix, reviewer, qualification status, next action, and first activated workflow.
- Attribution limits: this run had no live CRM, LinkedIn, or email-platform dashboards, and the recurring shell could not rerun GA or Bing reports because `GA4_PROPERTY_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, and `BING_WEBMASTER_API_KEY` were missing locally. Measurement guidance is implementation-ready but not yet recurring-performance-verified.

## Current Standards And Time-Sensitive Notes

- LinkedIn's current Lead Gen Form specs recommend `3` to `4` visible fields as best practice and cap visible fields at `12`, which fits a short, high-intent Client pilot rather than a long qualification clone. Source: [Lead Gen Form specifications](https://business.linkedin.com/advertise/ads/sponsored-content/lead-gen-ads/specs).
- LinkedIn still allows up to `20` hidden fields on each Lead Gen Form, which supports attribution and source routing without adding buyer friction. Source: [Lead Gen Form hidden fields](https://www.linkedin.com/help/lms/answer/a421421).
- LinkedIn's work-email validation still blocks common free domains such as Hotmail, Yahoo, and Gmail, but LinkedIn explicitly warns that submission rates can drop when members will not provide a work address. Source: [Lead Gen Form fields](https://www.linkedin.com/help/linkedin/answer/a425337).
- Google's current sender guidance still requires SPF or DKIM for all senders, valid PTR and TLS, spam rates below `0.3%`, and for bulk senders SPF plus DKIM plus DMARC alignment plus one-click unsubscribe. Source: [Email sender guidelines](https://support.google.com/mail/answer/81126?hl=en).
- ICO guidance still allows unsolicited electronic-mail marketing to corporate subscribers without consent, but it requires clear identity and a simple opt-out path in each message, with stricter rules for sole traders and some partnerships. Source: [Business-to-business marketing](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/).
- Google's current sitemap documentation still treats sitemap submission as a discovery hint rather than an indexing guarantee. Source: [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- Bing still supports both IndexNow and URL submission for faster discovery, which fits keeping Bing feed submission active through the existing deploy-capable path while local report access is restored. Sources: [IndexNow](https://www.bing.com/indexnow) and [Submit URLs using Bing Webmaster Tools](https://www.bing.com/webmasters/help/URL-Submission-62f2860b).
- Gartner's current B2B guidance continues to support self-directed and relevance-first motions: the buying journey is nonlinear, `61%` of B2B buyers prefer a rep-free experience, and `73%` avoid outreach that is not relevant to their needs. Sources: [The B2B Buying Journey](https://www.gartner.com/en/sales/insights/b2b-buying-journey) and [Gartner Sales Survey Finds 61% of B2B Buyers Prefer a Rep-Free Buying Experience](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-sales-survey-finds-61-percent-of-b2b-buyers-prefer-a-rep-free-buying-experience).

## Access Requests And Evidence Gaps

- `docs/brand-strategy.md` is still missing, so positioning, proof hierarchy, voice, and visual guardrails are still inferred from shipped copy, consultant rules, and `docs/claim-safe-proof-spine.md`.
- This run still had no live CRM or pipeline view for Client prospects or Bum candidates, so there is still no source-of-truth evidence for stage conversion, disqualification reasons, objection trends, or owner follow-through.
- This run still had no live LinkedIn organic, LinkedIn paid, or email-platform dashboard access, and the recurring shell could not rerun GA or Bing reports because `GA4_PROPERTY_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, and `BING_WEBMASTER_API_KEY` were missing locally after sourcing `.env.qa`. Channel recommendations therefore remain source-backed and conservative rather than performance-verified.
- This run still had no approved case-study permissions, founder scripts beyond the proof spine, objection-note archive, or claims matrix for logos, outcomes, commissions, payouts, and referral disclosures.
- Keep durable GTM evidence gaps mirrored in `docs/consultant-access-needs.md`.

## Agent Inputs

- Date of run: 2026-06-18.
- Files and docs reviewed: `docs/agents/automation-prompts/trusted-bums-daily-b2b-growth-marketer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, `docs/codex-edit-log.md`, `docs/content-copyeditor-backlog.md`, `docs/marketing-graphics-campaign-backlog.md`, `docs/trust-reputation-backlog.md`, `docs/product-ops-workflow-backlog.md`, `docs/data-analytics-backlog.md`, `docs/client-buyer-intake-strategy.md`, `docs/claim-safe-proof-spine.md`, `docs/b2b-marketing-growth-backlog.md`, `docs/google-analytics-api.md`, `src/pages/Index.tsx`, `src/pages/BumLanding.tsx`, `src/components/SignupIntentDialog.tsx`, `src/components/admin/ContactSubmissionsPanel.tsx`, `src/lib/contactApi.ts`, `src/components/GoogleAnalytics.tsx`, `src/pages/client/ClientDashboard.tsx`, and `src/pages/client/ClientLiveConversations.tsx`.
- Hosted and external evidence reviewed: `git rev-parse --short HEAD`, `git status --short`, `git log --oneline --decorate -12`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 15 --json ...`, `curl -I -L --max-time 20 https://trustedbums.com`, `curl -I -L --max-time 20 https://trustedbums.com/bums`, `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`, `curl -sL --max-time 20 https://trustedbums.com`, `corepack pnpm -s ga4:report -- --preset=outcomes --start-date=7daysAgo --end-date=today`, and `corepack pnpm -s bing:webmaster traffic`.
- Live tracker evidence reviewed: Supabase project `vaoqvtxqvbptyxddpoju` metadata, current `public.admin_scrum_items` rows `TB-0036` through `TB-0039` plus `TB-0109`, and direct tracker refreshes for those same rows.
- External guidance reviewed: [Lead Gen Form specifications](https://business.linkedin.com/advertise/ads/sponsored-content/lead-gen-ads/specs), [Lead Gen Form hidden fields](https://www.linkedin.com/help/lms/answer/a421421), [Lead Gen Form fields](https://www.linkedin.com/help/linkedin/answer/a425337), [Email sender guidelines](https://support.google.com/mail/answer/81126?hl=en), [Business-to-business marketing](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/), [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [IndexNow](https://www.bing.com/indexnow), [Submit URLs using Bing Webmaster Tools](https://www.bing.com/webmasters/help/URL-Submission-62f2860b), [The B2B Buying Journey](https://www.gartner.com/en/sales/insights/b2b-buying-journey), and [Gartner Sales Survey Finds 61% of B2B Buyers Prefer a Rep-Free Buying Experience](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-sales-survey-finds-61-percent-of-b2b-buyers-prefer-a-rep-free-buying-experience).
- Checks that could not run and why: `corepack pnpm -s ga4:report -- --preset=outcomes --start-date=7daysAgo --end-date=today` failed because `GA4_PROPERTY_ID` was missing after sourcing `.env.qa`; `corepack pnpm -s bing:webmaster traffic` failed because `BING_WEBMASTER_API_KEY` was missing after sourcing `.env.qa`; this run still had no CRM or pipeline export, no LinkedIn analytics export, no email-platform dashboard, and no approved `docs/brand-strategy.md` source.
