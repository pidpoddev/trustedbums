# Trusted Bums B2B Marketing Growth Backlog

_Last updated: 2026-06-17 by Codex daily B2B growth marketer automation._

## Executive Growth Thesis

Current production-backed evidence is still strong enough to keep pushing qualified Client demand. `main` head is now `af944fe`, and the live host is serving that bundle: GitHub `QA` run `27653495600` passed on `af944fe`, DreamHost deploy run `27653495695` failed only after rsync because Bing Webmaster URL submission hit its daily quota, `E2E Smoke` run `27653527364` was skipped, and `Visual UI Audit` run `27671724557` is still in progress as of 2026-06-17. Fresh runner checks on 2026-06-17 still show `https://trustedbums.com` returning `HTTP/2 200` with the expected security headers, while the fallback DNS target `https://rcdl.tplinkdns.com` still fails TLS verification from this runner.

The marketplace constraint is still Client demand, not Bum supply. The latest shipped changes after `c89db03` focused on claim workflow hardening and Bing deploy quota handling, not on the public offer or Client funnel. The growth priority therefore does not move. The public and Client product path is credible enough to support more referral-led and founder-led demand capture, and the public sitemap/canonical cleanup is now live, but the operating system around demand is still thin. Exact-head source on `/` still splits the same buyer action across `Sign up`, `Create Client account`, `Client signup`, `Request an intro strategy`, and `Request strategy review`, while the recruiting path still drifts between `Apply as a Bum` and `Bum Prospect`. That means the next leverage is not broad paid scale. It is a tighter referral ask, a founder-led LinkedIn motion, legitimate search and citation coverage, a manual nurture and objection system, and explicit CTA language that routes serious buyers into one clear strategy-review path.

## North Star And Guardrails

- Primary growth goal: increase qualified marketplace liquidity by adding approved Client companies with real named-account demand and approved Bums with credible access that actually activates.
- Quality guardrail: do not optimize for raw signups, clicks, impressions, or booked calls if named-account seriousness, approval quality, or approved-to-activated rates weaken.
- Trust guardrail: keep Trusted Bums reading like a selective B2B marketplace, not a generic lead-gen shop, referral hustle loop, scraped-list motion, or passive-income scheme.
- Legal and claims guardrail: no guaranteed meetings, guaranteed revenue, customer-logo claims, referral compensation claims, or payout promises outside approved proof boundaries.
- Marketplace guardrail: keep Bum recruiting invite-only until Client demand, recruiting terminology, and activation tracking are stronger.
- Channel guardrail: keep outbound email, DMs, referral asks, and any paid pilot low-volume and human-reviewed until CRM truth, suppression handling, and objection logging are in place.
- Search and citation guardrail: use search engines for clean discovery and reputation proof, not volume hacks. The current sitemap and canonical trailing-slash cleanup is live on production, so the next step is clean Search Console and Bing resubmission plus legitimate company and editorial citations. Do not buy backlinks, trade links, use mass directories, or publish thin guest posts for ranking.
- Analytics guardrail: GA and Bing plumbing are farther along than operator access. This recurring shell still could not rerun `pnpm ga4:report` or `pnpm bing:webmaster traffic` because `GA4_PROPERTY_ID` and `BING_WEBMASTER_API_KEY` were absent locally, so treat analytics as partially deployed infrastructure rather than current recurring evidence.
- Runner constraint: use port `8080` only for local testing. When external DNS context is needed, use `https://rcdl.tplinkdns.com` and treat runner-local failures as partial evidence only.

## Active Growth Plays

### P1 - [TB-0036] Make investor, advisor, and operator referrals the primary Client-demand motion
- Growth goal: qualified Client acquisition.
- Audience: investors, advisors, operators, founders, and senior sellers who know companies blocked on a small number of named accounts.
- Channel: referral-led and founder-led asks over email, warm introductions, and direct DM.
- Evidence: current production is serving `af944fe`, GitHub `QA` `27653495600` passed on that head, and the public Client path is still credible after the latest claim-workflow and search-hygiene changes. `docs/client-buyer-intake-strategy.md` still defines the seriousness screen; `docs/claim-safe-proof-spine.md` still gives the safest reusable proof; `src/pages/client/ClientDashboard.tsx` and `src/pages/client/ClientLiveConversations.tsx` keep the post-intake Client story credible; and `src/pages/Index.tsx` still splits the same buyer action across several CTA labels, so warm referrals should route to one strategy-review ask instead of generic signup language.
- Message and offer: `Who do you know that has one or two accounts that matter and no credible way in?`
- Activation path: warm referral -> `Request strategy review` or direct founder reply -> founder qualification -> agreement review -> first opportunity or target-account workflow.
- Metric: primary metric is qualified referred companies per source. Quality metrics are referral-to-call rate, qualified-to-approved rate, and first opportunity or first target-account creation rate by source.
- Trust and brand risk: vague referral economics, broad `send anyone` language, or routing referred buyers into generic signup copy will make the brand feel promotional instead of selective.
- Recommendation: build one referral ask pack with a short ask, a qualification rubric, and a founder reply script that sends qualified companies to `Request strategy review` and disqualifies weak-fit referrals quickly.
- Acceptance criteria: one referral ask pack exists, it names target company shape and disqualifiers, it points to a single strategy-review CTA, and referral-compensation language is either explicitly approved or intentionally excluded.

### P1 - [TB-0037] Run founder-led LinkedIn around hard-account access and trust validation
- Growth goal: qualified Client acquisition and referral.
- Audience: founders, GTM leaders, investors, advisors, and operators with strategic-account context.
- Channel: founder LinkedIn organic first, with any paid pilot kept tightly scoped and short-form.
- Evidence: exact-head public proof is current on `af944fe`, `src/pages/Index.tsx` still carries the serious hard-account narrative, and the strongest public CTA remains the strategy-review path. Current LinkedIn help still recommends short forms, caps Lead Gen Forms at 12 visible fields, allows up to 20 hidden fields for attribution, and lets work-email validation block common free domains. That all fits a low-friction, work-email-first, attribution-aware pilot rather than a bloated generic form.
- Message and offer: use three themes only: why cold fails in guarded accounts, why trust changes response quality, and why one credible route beats generic volume for strategic accounts.
- Activation path: founder post -> comment, profile visit, or DM -> strategy-review request or founder conversation -> manual qualification.
- Metric: primary metric is qualified inbound conversations per post. Quality metrics are fit rate by ICP, strategy-review submissions attributable to LinkedIn, and referral-quality conversations created from comments or DMs.
- Trust and brand risk: meme-heavy tone, over-detailed forms, personal-email capture, or routing traffic into unclear CTA language will make the brand look conversion-hungry instead of selective.
- Recommendation: draft a three-post sequence, one comment-to-DM follow-up, and one optional paid pilot spec. If a paid pilot runs, keep the form to work-email-first plus one seriousness filter, use hidden fields for attribution, and send qualified leads into the richer founder-review flow instead of cloning the full website form.
- Acceptance criteria: three founder posts exist, one DM follow-up exists, CTA routing is explicit, any paid pilot spec stays short-form and proof-safe, and LinkedIn traffic is routed to strategy review rather than generic signup.

### P2 - [TB-0109] Build legitimate search and company citation coverage
- Growth goal: make the public site easier to discover and verify without weakening trust.
- Audience: search engines, prospective Clients checking legitimacy, Bums checking the company before joining, and referral sources who need a credible public page to share.
- Channel: Google Search Console, Bing Webmaster Tools, IndexNow, LinkedIn company profile, approved founder/company profiles, partner or customer announcements, and selective industry listings where Trusted Bums truly belongs.
- Evidence: `12d777f` added Bing Webmaster quota handling, the public sitemap/canonical trailing-slash alignment is now live on production `af944fe`, and `https://trustedbums.com` still returns `HTTP/2 200`. The `2026-06-16` DreamHost deploy job failed only after rsync because Bing Webmaster URL submission hit quota, which means the live site moved forward but search-console follow-through is still incomplete. The local growth shell still lacks `BING_WEBMASTER_API_KEY`, so recurring Bing report pulls remain blocked even though deploy automation has a configured Bing secret.
- Message and offer: point citations to useful public pages that explain the marketplace and the serious strategy-review path, not to generic signup.
- Activation path: search or citation visit -> public trust/content page -> strategy-review request or founder conversation -> manual qualification.
- Metric: sitemap processing status, indexed public pages, brand-query impressions, qualified strategy-review visits from organic/referral sources, and referral source quality.
- Trust and brand risk: paid backlinks, reciprocal links, low-quality directories, and thin guest posts would make Trusted Bums look like a search-manipulation project instead of a trust marketplace.
- Recommendation: resubmit `https://trustedbums.com/sitemap.xml` through Google Search Console, keep Bing feed submission and IndexNow active, wait for the daily Bing URL-submission quota to reset before re-running the full URL batch, then create an approved citation list with 3 to 5 high-quality external profiles or editorial links. Pair this with one strong public explainer page before chasing broader backlinks.
- Acceptance criteria: Google Search Console and Bing show the sitemap submitted/read against the deployed canonical URLs; Bing health stays green and URL submission is retried cleanly once quota resets; at least three approved external citations point to useful public Trusted Bums pages; and no paid, exchanged, mass-directory, or unapproved guest-post links are used.

### P1 - [TB-0038] Keep Bum recruiting invite-only and referral-scored
- Growth goal: qualified Bum acquisition.
- Audience: current Bums, trusted operators, former executives, investors, advisors, and senior sellers with credible buyer access.
- Channel: founder-led referral asks, direct email, LinkedIn DM, and selective operator communities.
- Evidence: exact-head hosted truth is strong enough to keep this queued behind Client demand: production is serving `af944fe`, GitHub `QA` `27653495600` passed on that head, and the recruiting-language drift is still real in source. `src/pages/BumLanding.tsx` says `Apply as a Bum`, while `src/components/SignupIntentDialog.tsx`, `src/components/admin/ContactSubmissionsPanel.tsx`, and `src/lib/contactApi.ts` still use `Bum Prospect`. The Content backlog keeps this open as `TB-0041`, so growth should not widen recruiting before the recruiting noun and admin intake language are aligned.
- Message and offer: `We are looking for a small number of credible operators who can open real doors.`
- Activation path: warm referral or direct intro -> screening -> approval review -> profile completion -> first meaningful action such as saving a Client, adding a represented contact, submitting a Customer Lead, or claiming work.
- Metric: primary metric is approved Bum candidates per source. Quality metrics are approved-to-activated rate, time-to-first-meaningful-action, and later accepted-work quality by source.
- Trust and brand risk: open recruiting, `monetize your network` framing, or person-versus-company terminology drift will lower marketplace quality and make the brand feel opportunistic.
- Recommendation: keep recruiting closed-loop. Build one recruiting ask, one screening rubric, and one activation handoff. Treat the terminology cleanup in `TB-0041` as a dependency before any broader public Bum acquisition.
- Acceptance criteria: the recruiting ask, screening rubric, and activation workflow are documented; passive-income framing is explicitly excluded; Product Ops can process a referred Bum consistently from review through first action; and the public recruiting path no longer mixes `Apply as a Bum` with `Bum Prospect`.

### P1 - [TB-0039] Build manual nurture and objection logging before any lifecycle automation
- Growth goal: marketplace activation and sales enablement.
- Audience: qualified Client prospects who show intent but do not convert immediately.
- Channel: founder follow-up, manual email, one-pager, and call recap.
- Evidence: `src/pages/Index.tsx` still captures seriousness fields for Client demand, production is serving `af944fe`, and the current Client product path remains stronger than the GTM operating layer around it. But this run still had no live CRM or pipeline export, no LinkedIn analytics, no email-platform access, and no rerunnable local GA or Bing report path because `GA4_PROPERTY_ID` and `BING_WEBMASTER_API_KEY` were missing in the shell. Google’s current sender guidance still keeps authentication, PTR, TLS, spam-rate control, and one-click unsubscribe requirements in force, and current ICO guidance still requires clear identity plus simple opt-out handling for B2B email marketing.
- Message and offer: answer four questions in sequence: why cold fails here, how Trusted Bums controls claims and access, what proof can be shared safely, and what the next operating step looks like.
- Activation path: qualified strategy request -> manual review -> short founder follow-up plus one-pager -> strategy call or paused nurture with explicit stop conditions and objection logging.
- Metric: primary metric is qualified contact-to-call conversion. Quality metrics are objection-resolution rate, follow-up response rate, and no sender-risk regression.
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

- Source: founder network, investor and advisor referrals, founder LinkedIn, and the homepage strategy-review path.
- Conversion points: visitor or referred prospect -> strategy-review request -> manual qualification -> founder call -> agreement review -> first opportunity or target-account workflow -> first Bum response, Claim, or live conversation.
- Activation definition: approved Client company with an accepted agreement and at least one opportunity, target-account, or Bum-originated opportunity workflow live.
- Retention signals: repeated opportunities, repeated Bum responses, accepted Claims, Customer Payment Report activity, and Inbox follow-up continuity.
- Drop-off questions: which sources create qualified strategy requests, which objections block calls, and how many qualified calls reach first live workflow activation?

### Bum funnel

- Source: founder network, current Bums, client referrals, investor and advisor referrals, and selective direct outreach.
- Conversion points: referral received -> candidate submitted -> screening completed -> approved -> profile completed -> first meaningful action.
- Activation definition: approved Bum completes profile and takes one meaningful marketplace action.
- Retention signals: repeated Claim activity, accepted work, Customer Lead submissions, represented-contact upkeep, and payout trust.
- Drop-off questions: which sources create approved Bums, where referred candidates stall, and whether recruiting terminology drift is lowering trust before review?

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
- Attribution limits: this run had no live CRM, LinkedIn, or email-platform dashboards, and the recurring shell could not rerun GA or Bing reports because `GA4_PROPERTY_ID` and `BING_WEBMASTER_API_KEY` were missing locally. Measurement guidance is therefore still implementation-ready but not yet recurring-performance-verified.

## Current Standards And Time-Sensitive Notes

- LinkedIn’s current Lead Gen Form specs still recommend 3 to 4 visible fields as best practice and cap visible fields at 12, which fits a short, high-intent Client pilot rather than a long qualification clone. Source: [Lead Gen Form specifications](https://business.linkedin.com/advertise/ads/sponsored-content/lead-gen-ads/specs).
- LinkedIn still allows up to 20 hidden fields on each Lead Gen Form, which supports attribution and source routing without adding buyer friction. Source: [Lead Gen Form hidden fields](https://www.linkedin.com/help/lms/answer/a421421).
- LinkedIn’s work-email validation still blocks common free domains such as Hotmail, Yahoo, and Gmail, but LinkedIn explicitly warns that submission rates can drop when members will not provide a work address. That fits Trusted Bums using work-email filtering only for a narrow B2B-quality motion. Source: [Lead Gen Form fields](https://www.linkedin.com/help/linkedin/answer/a425337).
- Google’s current sender guidance still requires SPF or DKIM for all senders, valid PTR and TLS, spam rates below `0.3%`, and for bulk senders SPF plus DKIM plus DMARC alignment plus one-click unsubscribe. Source: [Email sender guidelines](https://support.google.com/mail/answer/81126?hl=en).
- ICO guidance still allows unsolicited electronic-mail marketing to corporate subscribers without consent or soft opt-in, but it requires clear identity and a simple opt-out path in each message. Source: [How do we comply with the PECR electronic mail marketing rules?](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/how-do-we-comply-with-the-pecr-electronic-mail-marketing-rules/).

## Access Requests And Evidence Gaps

- `docs/brand-strategy.md` is still missing, so positioning, proof hierarchy, voice, and visual guardrails are still inferred from shipped copy, consultant rules, and `docs/claim-safe-proof-spine.md`.
- This run still had no live CRM or pipeline view for Client prospects or Bum candidates, so there is still no source-of-truth evidence for stage conversion, disqualification reasons, objection trends, or owner follow-through.
- This run still had no live LinkedIn organic, LinkedIn paid, or email-platform dashboard access, and the recurring shell could not rerun GA or Bing reports because `GA4_PROPERTY_ID` and `BING_WEBMASTER_API_KEY` were missing locally. Channel recommendations therefore remain source-backed and conservative rather than performance-verified.
- This run still had no approved case-study permissions, founder scripts beyond the proof spine, objection-note archive, or claims matrix for logos, outcomes, commissions, payouts, and referral disclosures.
- Keep durable GTM evidence gaps mirrored in `docs/consultant-access-needs.md`.

## Agent Inputs

- Date of run: 2026-06-17.
- Files and docs reviewed: `docs/agents/automation-prompts/trusted-bums-daily-b2b-growth-marketer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/consultant-access-needs.md`, `docs/business-access-rules.md`, `docs/codex-edit-log.md`, `docs/content-copyeditor-backlog.md`, `docs/marketing-graphics-campaign-backlog.md`, `docs/trust-reputation-backlog.md`, `docs/product-ops-workflow-backlog.md`, `docs/data-analytics-backlog.md`, `docs/client-buyer-intake-strategy.md`, `docs/claim-safe-proof-spine.md`, `docs/b2b-marketing-growth-backlog.md`, `src/pages/Index.tsx`, `src/pages/BumLanding.tsx`, `src/components/SignupIntentDialog.tsx`, `src/components/admin/ContactSubmissionsPanel.tsx`, `src/lib/contactApi.ts`, `src/pages/client/ClientDashboard.tsx`, and `src/pages/client/ClientLiveConversations.tsx`.
- Hosted and external evidence reviewed: `git rev-parse --short HEAD`, `git status --short`, `git log --oneline --decorate -12`, `git diff --stat c89db03..HEAD -- src docs public tests .github`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 25 --json ...`, `gh run view 27653495695 --repo pidpoddev/trustedbums --log-failed`, `curl -I -L --max-time 20 https://trustedbums.com`, `curl -I -L --max-time 20 https://trustedbums.com/bums`, `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`, and `curl -sL --max-time 20 https://trustedbums.com`.
- Live tracker evidence reviewed: Supabase project `vaoqvtxqvbptyxddpoju` metadata, URL confirmation, current `public.admin_scrum_items` rows `TB-0036` through `TB-0039`, the new row `TB-0109`, and direct tracker updates for those same rows.
- External guidance reviewed: [Lead Gen Form hidden fields](https://www.linkedin.com/help/lms/answer/a421421), [Lead Gen Form fields](https://www.linkedin.com/help/linkedin/answer/a425337), [Lead Gen Form specifications](https://business.linkedin.com/advertise/ads/sponsored-content/lead-gen-ads/specs), [Email sender guidelines](https://support.google.com/mail/answer/81126?hl=en), and [How do we comply with the PECR electronic mail marketing rules?](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/how-do-we-comply-with-the-pecr-electronic-mail-marketing-rules/).
- Checks that could not run and why: `pnpm ga4:report -- --preset=overview --start-date=7daysAgo --end-date=today` failed because `GA4_PROPERTY_ID` was missing after sourcing `.env.qa`; `pnpm bing:webmaster traffic` failed because `BING_WEBMASTER_API_KEY` was missing after sourcing `.env.qa`; this run still had no CRM or pipeline export, no LinkedIn analytics export, no email-platform dashboard, and no approved `docs/brand-strategy.md` source.
