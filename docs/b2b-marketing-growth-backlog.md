# Trusted Bums B2B Marketing Growth Backlog

_Last updated: 2026-06-19 by Codex daily B2B growth marketer automation._

## Executive Growth Thesis

Current production-backed evidence supports continued qualified Client-demand work on exact head `a17a85639a1b24dfda36da87d763eb4ecd3457af`. GitHub `QA` run `27798687806`, DreamHost deploy run `27798687708`, and hosted `E2E Smoke` run `27798711531` all completed successfully on 2026-06-19 UTC for that head, and fresh runner checks still show `https://trustedbums.com` returning `HTTP/2 200` with `Last-Modified: Fri, 19 Jun 2026 00:55:16 GMT`. Exact-head `Visual UI Audit` run `27810878263` is currently `in_progress` on 2026-06-19 UTC. The required external DNS target `https://rcdl.tplinkdns.com` still fails TLS verification from this runner, so runner-side external DNS evidence remains partial outside the primary host.

The operating constraint is still Client demand, not Bum supply. The shipped terminology and product split are materially cleaner than the prior `af944fe` snapshot: public source now routes buyer demand through `Request an intro strategy`, `Create Client account`, and `Request strategy review`, while the recruiting side has its own `/bums` flow. The old broad `Bum Prospect` blocker is no longer current-head truth. Internal and admin surfaces now consistently use `Prospective Bum`; the remaining seam is narrower and public-facing: `Apply as a Bum` still differs from the internal `Prospective Bum` noun, so recruiting should stay selective and referral-scored rather than broadened. The newest source movement reinforces that posture rather than widening it: current Bum activation is now more structured around `Inner Circle` intake capped at `20` trusted direct relationships, which is useful for quality activation after approval but not a reason to open the top of the funnel. Founder decision on 2026-06-19 confirms recruiting should stay invite-only and referral-sourced because Trusted Bums needs Bums who are trusted by someone already trusted. That means the next growth leverage is still low-volume, trust-safe demand capture: referral asks, founder-led LinkedIn, legitimate search and citation coverage, and manual nurture with objection logging. It is not broad paid scale or lifecycle automation.

## North Star And Guardrails

- Primary growth goal: increase qualified marketplace liquidity by adding approved Client companies with real named-account demand and approved Bums with credible access that actually activates.
- Quality guardrail: do not optimize for raw signups, clicks, impressions, or booked calls if named-account seriousness, approval quality, or approved-to-activated rates weaken.
- Trust guardrail: keep Trusted Bums reading like a selective B2B marketplace, not a generic lead-gen shop, scraped-list motion, passive-income scheme, or broad affiliate offer.
- Legal and claims guardrail: no guaranteed meetings, guaranteed revenue, customer-logo claims, payout promises, or referral-compensation claims outside approved proof boundaries.
- Marketplace guardrail: keep Bum recruiting invite-only until Client demand, recruiting language, and activation tracking are stronger.
- Channel guardrail: keep outbound email, DMs, referral asks, and any paid pilot low-volume and human-reviewed until CRM truth, suppression handling, and objection logging are in place.
- Search and citation guardrail: use search engines for clean discovery and reputation proof, not volume hacks. The live sitemap and canonical cleanup is already deployed, so the next step is Search Console and Bing resubmission plus legitimate company/editorial citations. Do not buy backlinks, trade links, use mass directories, or publish thin guest posts.
- Analytics guardrail: GA and Bing instrumentation are farther along than the `.env.qa` shortcut in this shell. Source-side events now exist for `generate_lead`, `trustedbums_client_lead_submitted`, and consent-gated `trustedbums_route_view`. On 2026-06-19, the documented GA impersonation path worked when this run exported `GA4_PROPERTY_ID=540873763`, `GOOGLE_CLOUD_PROJECT=project-d45d35fc-184a-43c2-889`, and `GA4_IMPERSONATE_SERVICE_ACCOUNT=trusted-bums-ga4-agent@project-d45d35fc-184a-43c2-889.iam.gserviceaccount.com`, but `BING_WEBMASTER_API_KEY` is still absent after sourcing `.env.qa`, so Bing report access remains the live blocker.
- Runner constraint: use port `8080` only for local testing. When external DNS context is needed, use `https://rcdl.tplinkdns.com` and treat runner-local failures there as partial evidence only.

## Active Growth Plays

### P1 - [TB-0036] Make investor, advisor, and operator referrals the primary Client-demand motion
- Growth goal: qualified Client acquisition.
- Audience: investors, advisors, operators, founders, and senior sellers who know companies blocked on a small number of named accounts.
- Channel: referral-led and founder-led asks over email, warm introductions, and direct DM.
- Evidence: current production is serving `a17a856`, exact-head hosted `QA`, deploy, and `E2E Smoke` all passed, and the public Client path is still credible after the latest routing and terminology cleanup. `docs/client-buyer-intake-strategy.md` still defines the seriousness screen, `docs/claim-safe-proof-spine.md` still gives the safest reusable proof, and `src/pages/Index.tsx` still routes serious buyer demand toward the strategy-review path rather than a generic list-building offer.
- Message and offer: `Who do you know that has one or two accounts that matter and no credible way in?`
- Activation path: warm referral -> `Request strategy review` or direct founder reply -> founder qualification -> agreement review -> first opportunity or target-account workflow.
- Metric: qualified referred companies per source, plus referral-to-call, qualified-to-approved, and first workflow activation rates.
- Trust and brand risk: broad `send anyone` language, unclear compensation language, or routing referred buyers into generic signup copy weakens the selective-marketplace posture.
- Recommendation: prepare more detail for founder review before changing the primary buyer motion. The next version should explain what the referral ask pack would contain, who receives it, what the Strategy Review path means operationally, and what happens to weak-fit referrals.
- Acceptance criteria: founder-approved referral ask pack exists, it names target company shape and disqualifiers, it points to an approved buyer CTA, and referral-compensation language is either explicitly approved or intentionally excluded.

### P1 - [TB-0037] Run founder-led LinkedIn around hard-account access and trust validation
- Growth goal: qualified Client acquisition and referral.
- Audience: founders, GTM leaders, investors, advisors, and operators with strategic-account context.
- Channel: founder LinkedIn organic first, with any paid pilot kept tightly scoped and short-form.
- Evidence: exact-head public proof is current on `a17a856`, `src/pages/Index.tsx` still carries the hard-account narrative, and current LinkedIn guidance still favors low-friction forms. LinkedIn's current Lead Gen Form documentation allows up to `12` informational fields, up to `3` custom questions, up to `5` disclosure checkboxes, and up to `20` hidden fields for attribution. That supports a short, work-email-first, attribution-aware pilot rather than a cloned site form.
- Message and offer: use three themes only: why cold fails in guarded accounts, why trust changes response quality, and why one credible route beats generic volume for strategic accounts.
- Activation path: founder post -> comment, profile visit, or DM -> strategy-review request or founder conversation -> manual qualification.
- Metric: qualified inbound conversations per post, attributable strategy-review requests, and fit rate by ICP.
- Trust and brand risk: meme-heavy tone, long forms, personal-email capture, or CTA drift toward generic signup makes the brand look conversion-hungry instead of selective.
- Recommendation: prepare more detail for founder review before launching the LinkedIn test. The next version should show the actual post themes, the exact form fields, the follow-up behavior, and how proof-safe language avoids sounding like generic lead generation.
- Acceptance criteria: founder-approved three-post sequence exists, one DM follow-up exists, CTA routing is explicit, any paid pilot spec stays short-form and proof-safe, and LinkedIn traffic is routed to an approved buyer path rather than generic signup.

### P2 - [TB-0109] Build legitimate search and company citation coverage
- Growth goal: make the public site easier to discover and verify without weakening trust.
- Audience: search engines, prospective Clients checking legitimacy, Bums checking the company before joining, and referral sources who need a credible public page to share.
- Channel: Google Search Console, Bing Webmaster Tools, IndexNow, LinkedIn company profile, approved founder/company profiles, partner or customer announcements, and selective industry listings where Trusted Bums truly belongs.
- Evidence: the live sitemap/canonical cleanup is now on `a17a856`, `https://trustedbums.com` returns `HTTP/2 200`, and exact-head hosted `QA`, deploy, and `E2E Smoke` all passed. The stale `af944fe` quota-reset story is no longer the current blocker. The live gap is operator access and follow-through: this shell still lacks `BING_WEBMASTER_API_KEY`, and `corepack pnpm -s bing:webmaster traffic` still fails locally even after sourcing `.env.qa`. Google Search documentation continues to treat sitemap submission as a hint rather than a guarantee, while Bing still supports IndexNow for faster discovery.
- Message and offer: point citations to useful public pages that explain the marketplace and the serious strategy-review path, not to generic signup.
- Activation path: search or citation visit -> public trust/content page -> strategy-review request or founder conversation -> manual qualification.
- Metric: sitemap processing status, indexed public pages, brand-query impressions, qualified strategy-review visits from organic/referral sources, and citation quality.
- Trust and brand risk: paid backlinks, reciprocal links, low-quality directories, and thin guest posts would make Trusted Bums look like a search-manipulation project instead of a trust marketplace.
- Recommendation: resubmit `https://trustedbums.com/sitemap.xml` through Google Search Console, keep Bing feed submission and IndexNow active through the existing deploy-capable path, and create an approved citation list with `3` to `5` high-quality external profiles or editorial links. Pair this with one strong public explainer page before chasing broader backlinks.
- Acceptance criteria: Google Search Console and Bing show the sitemap submitted/read against deployed canonical URLs; at least three approved external citations point to useful public Trusted Bums pages; and no paid, exchanged, mass-directory, or unapproved guest-post links are used.

### P1 - [TB-0038] Keep Bum recruiting invite-only and referral-scored
- Closeout update: closed on 2026-06-19 after the invite flows began requiring referral source plus explicit trust confirmation, and the deployed `invite-bum` function now preserves that referral/trust metadata in Clerk invitations, pending membership notes, and audit events.
- Growth goal: qualified Bum acquisition.
- Audience: current Bums, trusted operators, former executives, investors, advisors, and senior sellers with credible buyer access.
- Channel: founder-led referral asks, direct email, LinkedIn DM, and selective operator communities.
- Evidence: exact-head hosted truth is strong enough to keep this queued behind Client demand. Production is serving `a17a856`, the recruiting route still lives separately in `src/pages/BumLanding.tsx`, internal/admin source now consistently uses `Prospective Bum`, and current Bum activation source adds a clearer quality gate: approved Bums are now guided to start with an `Inner Circle` of up to `20` strongest trusted direct relationships before broader prospecting. The remaining recruiting-language seam is narrower than the prior backlog stated: public copy still says `Apply as a Bum`, while internal/admin flows refer to `Prospective Bum`. That is a wording polish issue, not a hard blocker to all recruiting, but it still supports keeping recruiting closed-loop.
- Message and offer: `We are looking for a small number of credible operators who can open real doors.`
- Activation path: warm referral or direct intro -> screening -> approval review -> profile completion -> `Inner Circle` intake -> first meaningful action such as saving a Client, adding a represented contact, submitting a Customer Lead, or claiming work.
- Metric: approved Bum candidates per source, approved-to-activated rate, `Inner Circle` completion rate, time-to-first-meaningful-action, and later accepted-work quality by source.
- Trust and brand risk: open recruiting, `monetize your network` framing, or expanding the top-of-funnel before demand evidence strengthens will lower marketplace quality.
- Recommendation: keep recruiting closed-loop and require the referral source to be known. Build one recruiting ask, one screening rubric, and one activation handoff that explicitly starts approved Bums with `Inner Circle` intake before wider prospecting. When an existing Bum refers another Bum, the invite flow should remind the referrer that the invitation reflects on them as a Bum and ask whether they truly trust the candidate. Treat the remaining public-versus-internal recruiting noun mismatch as wording cleanup, not as a reason to widen acquisition now.
- Acceptance criteria: the recruiting ask, screening rubric, and activation workflow are documented; passive-income framing is explicitly excluded; every invite records or preserves the referral source; the invite/referral copy asks the referrer to confirm trust before sending; Product Ops can process a referred Bum consistently from review through `Inner Circle` setup and first action; and the public recruiting path is still selective rather than broad.

### P1 - [TB-0039] Build manual nurture and objection logging before any lifecycle automation
- Growth goal: marketplace activation and sales enablement.
- Audience: qualified Client prospects who show intent but do not convert immediately.
- Channel: founder follow-up, manual email, one-pager, and call recap.
- Evidence: `src/pages/Index.tsx` still captures seriousness fields for Client demand, production is serving `a17a856`, and the current Client product path remains stronger than the GTM operating layer around it. This run verified the documented GA impersonation path and pulled current aggregates, but it still had no live CRM or pipeline export, no LinkedIn analytics, no email-platform access, and no Bing Webmaster report path because `BING_WEBMASTER_API_KEY` was missing after sourcing `.env.qa`. Google's current sender guidance still keeps authentication, PTR, TLS, spam-rate control, and one-click unsubscribe requirements in force for bulk senders, and current ICO guidance still requires clear identity plus simple opt-out handling for B2B email marketing.
- Message and offer: answer four questions in sequence: why cold fails here, how Trusted Bums controls claims and access, what proof can be shared safely, and what the next operating step looks like.
- Activation path: qualified strategy request -> manual review -> short founder follow-up plus one-pager -> strategy call or paused nurture with explicit stop conditions and objection logging.
- Metric: qualified contact-to-call conversion, objection-resolution rate, follow-up response rate, and no sender-risk regression.
- Trust and brand risk: lifecycle automation before suppression, instrumentation, objection categories, and approved copy exist will create deliverability and reputation risk faster than it creates value.
- Recommendation: prepare more detail for founder review before choosing the nurture system of record. The next version should compare TrustedBums admin, Attio/CRM, and manual spreadsheet logging, including who owns it, what fields are captured, and what would later migrate into automation.
- Acceptance criteria: founder-approved nurture location exists; the sequence has send triggers, CTA, stop conditions, and objection themes; Data and Analytics defines minimum tracking fields; Trust confirms the send pattern stays low-risk; and the asset references the current proof spine instead of inventing new claims.

## ICP And Offer Matrix

| Segment | Trigger | Disqualifier | Value proposition | First CTA | Follow-up path |
| --- | --- | --- | --- | --- | --- |
| Founder, CEO, CRO, or lean GTM leader | One to five accounts matter materially and cold is failing | Wants generic lead volume instead of named-account access | Trusted, selective warm-route workflow for hard accounts | Request strategy review | Founder qualification -> agreement review -> first opportunity |
| Investor, advisor, or operator referral source | Knows a company with a specific access blockage | Broad low-fit list or weak urgency | Trusted Bums screens for seriousness before treating demand as active | Refer a company | Founder review -> qualification |
| Former executive or senior operator Bum candidate | Real buyer trust in a relevant market | Generic networking interest or passive-income framing | Reviewed path to turn relationship access into controlled intro work, starting with Inner Circle proof | Apply by referral | Screening -> approval -> `Inner Circle` intake -> first meaningful action |
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
- Conversion points: referral received -> candidate submitted -> screening completed -> approved -> profile completed -> `Inner Circle` intake -> first meaningful action.
- Activation definition: approved Bum completes profile, logs the first `Inner Circle` contact set, and takes one meaningful marketplace action.
- Retention signals: repeated Claim activity, accepted work, `Inner Circle` upkeep, Customer Lead submissions, represented-contact upkeep, and payout trust.
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
- Measurement: approved Bums per source, approved-to-activated rate, `Inner Circle` completion rate, early accepted-work quality.
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
- Build one Bum recruiting ask, screening rubric, and `Inner Circle`-first activation handoff that explicitly excludes passive-income framing.
- Build one objection log schema covering source, ICP fit, blocker, claim concern, legal or payout concern, and next step.

## Measurement Plan

- North-star metric: active qualified marketplace liquidity, measured as approved Client companies with live demand plus approved Bums with real activation.
- Client input metrics: qualified strategy-review requests, referral-to-call rate, qualified-to-approved rate, first opportunity or target-account creation rate.
- Bum input metrics: approved candidates per source, approved-to-activated rate, `Inner Circle` completion rate, time-to-first-meaningful-action.
- Quality metrics: work-email rate, named-account seriousness rate, low-fit submission rate, objection themes, unsubscribe or sender-risk signals.
- Source tracking needs: referral source, founder-led LinkedIn source, CTA path, work-email versus generic-email mix, reviewer, qualification status, next action, and first activated workflow.
- Attribution limits: this run had no live CRM, LinkedIn, or email-platform dashboards. The documented GA impersonation path did rerun current aggregate reports, but the `.env.qa` shortcut still does not export the GA variables and Bing report access remains blocked because `BING_WEBMASTER_API_KEY` is missing locally. Measurement guidance is stronger than source-only review, but it is not yet recurring channel-performance truth.

## Current Standards And Time-Sensitive Notes

- LinkedIn's current Lead Gen Form documentation allows up to `12` informational fields, up to `3` custom questions, and up to `5` disclosure checkboxes, which supports a short high-intent Client pilot rather than a long qualification clone. Source: [Lead Gen Form fields](https://www.linkedin.com/help/linkedin/answer/a425337).
- LinkedIn still allows up to `20` hidden fields on each Lead Gen Form, which supports attribution and source routing without adding buyer friction. Source: [Lead Gen Form hidden fields](https://www.linkedin.com/help/lms/answer/a421421).
- Google's current sender guidance still requires SPF or DKIM for all senders, valid PTR and TLS, spam rates below `0.3%`, and for bulk senders SPF plus DKIM plus DMARC alignment plus one-click unsubscribe. Source: [Email sender guidelines](https://support.google.com/mail/answer/81126?hl=en).
- ICO guidance still allows unsolicited electronic-mail marketing to corporate subscribers without consent, but it requires clear identity and a simple opt-out path in each message, with stricter rules for sole traders and some partnerships. Source: [Business-to-business marketing](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/).
- Google's current sitemap documentation still treats sitemap submission as a discovery hint rather than an indexing guarantee. Source: [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- Bing still positions IndexNow as a faster discovery path that reduces dependence on slower exploratory crawls, which fits keeping Bing submission active through the existing deploy-capable path while local report access is restored. Source: [IndexNow](https://www.bing.com/indexnow).
- Gartner's March 9, 2026 B2B sales guidance reinforces self-directed buying: `67%` of buyers said they prefer a rep-free experience and `45%` reported using AI during a recent purchase. That favors low-friction proof, modular enablement, and relevance-first follow-up rather than heavy early sales pressure. Source: [Gartner Sales Survey Finds 67% of B2B Buyers Prefer a Rep-Free Experience](https://www.gartner.com/en/newsroom/press-releases/2026-03-09-gartner-sales-survey-finds-67-percent-of-b2b-buyers-prefer-a-rep-free-experience).

## Access Requests And Evidence Gaps

- `docs/brand-strategy.md` is still missing, so positioning, proof hierarchy, voice, and visual guardrails are still inferred from shipped copy, consultant rules, and `docs/claim-safe-proof-spine.md`.
- This run still had no live CRM or pipeline view for Client prospects or Bum candidates, so there is still no source-of-truth evidence for stage conversion, disqualification reasons, objection trends, or owner follow-through.
- This run still had no live LinkedIn organic, LinkedIn paid, or email-platform dashboard access. It did rerun GA through the documented impersonation path, but the `.env.qa` shortcut still lacks the GA exports and Bing report access remains blocked because `BING_WEBMASTER_API_KEY` is missing locally after sourcing `.env.qa`. Channel recommendations therefore remain conservative and only partly performance-verified.
- This run still had no approved case-study permissions, founder scripts beyond the proof spine, objection-note archive, or claims matrix for logos, outcomes, commissions, payouts, and referral disclosures.
- Keep durable GTM evidence gaps mirrored in `docs/consultant-access-needs.md`.

## Agent Inputs

- Date of run: 2026-06-19.
- Files and docs reviewed: `docs/agents/automation-prompts/trusted-bums-daily-b2b-growth-marketer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, `docs/codex-edit-log.md`, `docs/content-copyeditor-backlog.md`, `docs/marketing-graphics-campaign-backlog.md`, `docs/trust-reputation-backlog.md`, `docs/product-ops-workflow-backlog.md`, `docs/data-analytics-backlog.md`, `docs/trusted-bums-operating-model.md`, `docs/client-buyer-intake-strategy.md`, `docs/claim-safe-proof-spine.md`, `docs/bum-supply-leader-backlog.md`, `docs/b2b-marketing-growth-backlog.md`, `docs/google-analytics-api.md`, `src/pages/Index.tsx`, `src/pages/BumLanding.tsx`, `src/components/SignupIntentDialog.tsx`, `src/components/admin/ContactSubmissionsPanel.tsx`, `src/components/FirstLoginWalkthrough.tsx`, `src/lib/contactApi.ts`, `src/lib/portalApi.ts`, `src/pages/bum/BumContacts.tsx`, and `src/components/GoogleAnalytics.tsx`.
- Hosted and external evidence reviewed: `git rev-parse --short HEAD`, `git status --short`, `git log --oneline --decorate -12`, `git diff --stat 57231bf..HEAD -- src docs supabase .github`, targeted `git diff 57231bf..HEAD` across current GTM source surfaces, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json ...`, `curl -I -L --max-time 20 https://trustedbums.com`, `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`, `curl -sL --max-time 20 https://trustedbums.com`, `curl -fsSL https://supabase.com/changelog.md`, `export GA4_PROPERTY_ID=540873763 GOOGLE_CLOUD_PROJECT=project-d45d35fc-184a-43c2-889 GA4_IMPERSONATE_SERVICE_ACCOUNT=trusted-bums-ga4-agent@project-d45d35fc-184a-43c2-889.iam.gserviceaccount.com; gcloud auth list --filter=status:ACTIVE --format='value(account)'`, `export GA4_PROPERTY_ID=540873763 GOOGLE_CLOUD_PROJECT=project-d45d35fc-184a-43c2-889 GA4_IMPERSONATE_SERVICE_ACCOUNT=trusted-bums-ga4-agent@project-d45d35fc-184a-43c2-889.iam.gserviceaccount.com; corepack pnpm -s ga4:report -- --preset=outcomes --start-date=7daysAgo --end-date=today --limit=20`, `export GA4_PROPERTY_ID=540873763 GOOGLE_CLOUD_PROJECT=project-d45d35fc-184a-43c2-889 GA4_IMPERSONATE_SERVICE_ACCOUNT=trusted-bums-ga4-agent@project-d45d35fc-184a-43c2-889.iam.gserviceaccount.com; corepack pnpm -s ga4:report -- --preset=overview --start-date=7daysAgo --end-date=today`, and `corepack pnpm -s bing:webmaster traffic`.
- Live tracker evidence reviewed: Supabase project `vaoqvtxqvbptyxddpoju` metadata, current `public.admin_scrum_items` rows `TB-0036` through `TB-0039` plus `TB-0109`, and direct tracker refreshes for those same rows.
- External guidance reviewed: [Lead Gen Form fields](https://www.linkedin.com/help/linkedin/answer/a425337), [Lead Gen Form hidden fields](https://www.linkedin.com/help/lms/answer/a421421), [Email sender guidelines](https://support.google.com/mail/answer/81126?hl=en), [Business-to-business marketing](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/), [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [IndexNow](https://www.bing.com/indexnow), [Gartner Sales Survey Finds 67% of B2B Buyers Prefer a Rep-Free Experience](https://www.gartner.com/en/newsroom/press-releases/2026-03-09-gartner-sales-survey-finds-67-percent-of-b2b-buyers-prefer-a-rep-free-experience), and the current [Supabase changelog](https://supabase.com/changelog).
- Checks that could not run and why: `corepack pnpm -s ga4:report -- --preset=outcomes --start-date=7daysAgo --end-date=today --limit=20` still fails if this shell relies only on sourced `.env.qa` because `GA4_PROPERTY_ID` is missing there; `corepack pnpm -s bing:webmaster traffic` failed because `BING_WEBMASTER_API_KEY` was missing after sourcing `.env.qa`; this run still had no CRM or pipeline export, no LinkedIn analytics export, no email-platform dashboard, no approved `docs/brand-strategy.md` source, and no completed exact-head `Visual UI Audit` artifact yet because run `27810878263` is still in progress.
