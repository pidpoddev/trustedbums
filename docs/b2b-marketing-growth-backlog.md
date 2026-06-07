# Trusted Bums B2B Marketing Growth Backlog

_Last updated: 2026-06-06 by Codex daily B2B growth marketer automation._

## Executive Growth Thesis

Client demand is still the tighter liquidity constraint. Trusted Bums already has meaningfully deeper Bum-side product activation than Client-side acquisition: Bums can complete profiles, submit Client Prospects, review opportunities, request Claims, and build contact context in-product, while public acquisition for Clients is still one homepage plus one shared contact form and one signup-intent modal. The safest path to more qualified marketplace liquidity is to sharpen Client intake, proof, referral asks, and founder-led conversion before expanding scale channels. Bum growth should stay invite-only and referral-scored so supply quality grows with real buyer demand instead of outrunning it.

## North Star And Guardrails

- Primary growth goal: Increase qualified marketplace liquidity by increasing active Client companies with live target-account demand and activated approved Bums with credible relationship access.
- Quality guardrail: Do not optimize for raw signups, email volume, ad clicks, or follower growth if target-account seriousness, approval quality, or approved-to-activated rates fall.
- Trust guardrail: Trusted Bums must read as a controlled B2B marketplace, not a lead-gen shop, affiliate loop, passive-income pitch, or spray-and-pray outbound engine.
- Legal and claims guardrail: No guaranteed meetings, guaranteed revenue, logo-dropping, partner claims, payout promises, or outcome claims without explicit approval.
- Marketplace liquidity guardrail: More Clients only matter if they bring named-account demand; more Bums only matter if they bring believable relationship access and can operate within the workflow.
- Channel constraints: Keep email, DMs, and referrals low-volume, manual, and high-intent until CRM, attribution, and deliverability evidence are available. No bought lists, scraped lists, or broad automated outreach.

## Active Growth Plays

### P0 - Split Client demand from the mixed public contact path
- Growth goal: Qualified Client acquisition.
- Audience: Founder, CRO, VP Sales, or GTM lead at a funded company with a live hard-account access problem.
- Channel: Website, founder-led sales, referral follow-up, LinkedIn organic.
- Evidence: The homepage still sends Client and Bum interest through one shared contact form with a generic interest selector, while signup still begins with a broad `Client Prospect` or `Bum Prospect` choice instead of a Client-specific qualification path ([`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/src/pages/Index.tsx`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/Index.tsx), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/src/components/SignupIntentDialog.tsx`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/SignupIntentDialog.tsx)). The intake backend already supports manual review, statusing, escalation, and admin ownership, so the ops side can handle a higher-signal path if the front-end intake is improved ([`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/src/lib/contactApi.ts`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/lib/contactApi.ts)).
- Message and offer: `Bring us the accounts your team cannot crack.` Offer an intro-strategy request for companies with named accounts, real deal stakes, and willingness to work inside a selective process.
- Activation path: Founder post, referral note, or homepage CTA -> Client-specific intake with role, account list, current blocker, and urgency -> manual seriousness review -> founder strategy call -> Client Prospect or company onboarding path.
- Metric: Primary success metric is qualified Client strategy requests that pass manual review. Quality metric is the share with named target accounts, credible company identity, and a clear internal owner.
- Trust and brand risk: If the page sounds like outsourced SDR or open-access lead gen, it will attract weak-fit demand and lower trust.
- Recommendation: Create a distinct Client acquisition surface or routed intake branch with explicit disqualifiers, manual-review expectations, and an account-seriousness prompt. Coordinate with UX/UI, Content, Product Ops, and Trust before shipping.
- Acceptance criteria: A distinct Client acquisition surface exists; it collects target-account and role context; it explains selectivity and review; and Product Ops can name the qualification owner and post-submit workflow.

### P0 - Build a claim-safe proof spine before scaling demand gen
- Growth goal: Proof, qualified Client acquisition, referral conversion, and sales enablement.
- Audience: Client buyers, investor or advisor referral sources, and high-quality Bum candidates evaluating marketplace seriousness.
- Channel: Founder-led sales, referral asks, one-pagers, sales calls, LinkedIn organic, nurture follow-up.
- Evidence: The operating model still supports a hard-account-access story, but there is still no approved proof library, case-study permission set, or public versus private claims checklist in repo evidence. `docs/brand-strategy.md` is still missing, so proof hierarchy and voice remain inferred rather than confirmed.
- Message and offer: `One trusted route can change the odds on a company-defining account.` Explain the hard-account problem, controlled warm-intro workflow, and commercial seriousness without unsupported outcome claims.
- Activation path: Founder, advisors, and operators reuse the same proof spine in posts, referral asks, one-pagers, and calls -> qualified prospect requests strategy conversation.
- Metric: Primary success metric is strategy-call conversion among prospects who receive the proof narrative. Quality metric is zero unapproved claims, logo leakage, or hype-based objections.
- Trust and brand risk: Overclaiming or implying unnamed customer outcomes would create immediate legal and credibility risk.
- Recommendation: Produce one approval-ready proof spine with variants for Client acquisition, Bum recruiting, and investor or advisor referrals, plus a simple public/private/do-not-say checklist.
- Acceptance criteria: One reusable proof narrative exists; it defines public versus private proof boundaries; and Content, founder, and sales users can apply it without improvising risky claims.

### P1 - Package investor and advisor referrals as a Client-demand motion
- Growth goal: Qualified Client acquisition.
- Audience: Investors, advisors, operators, and current marketplace insiders who know companies blocked on named-account access.
- Channel: Referral-led, founder-led direct asks, email, LinkedIn DM.
- Evidence: Trusted Bums is positioned as a high-trust marketplace for strategic access, which fits warm third-party referrals better than cold top-of-funnel scale. The current repo still lacks a referral ask pack, referral qualification rubric, or approved compensation and disclosure language, so the motion should stay tightly controlled and explicit ([`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/trusted-bums-operating-model.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/trusted-bums-operating-model.md), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/consultant-access-needs.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/consultant-access-needs.md)).
- Message and offer: `Do you know a founder or GTM lead with one or two accounts that really matter and no credible way in?`
- Activation path: Advisor or investor referral ask -> referred company intro -> Client strategy intake -> founder qualification -> company onboarding only if account seriousness is clear.
- Metric: Primary success metric is qualified referred companies per referral source. Quality metric is referral-to-strategy-call rate and pass-through to approved Client demand.
- Trust and brand risk: Public referral compensation or vague “send us anyone” language would feel promotional and undermine selectivity.
- Recommendation: Build one short referral ask, one screening rubric, and one operator-safe follow-up script. Keep compensated-referral and disclosure language pending legal review.
- Acceptance criteria: One referral ask pack exists; it names ideal company shape and disqualifiers; and any referral-compensation language is either legally approved or explicitly excluded from use.

### P1 - Launch founder-led LinkedIn around hard-account access, not generic growth
- Growth goal: Qualified Client acquisition and referral.
- Audience: Founders, GTM leaders, investors, advisors, and operators who influence strategic-account access.
- Channel: Founder LinkedIn organic.
- Evidence: LinkedIn B2B Institute guidance still supports memory-building and buyer-committee education via the 95-5 rule and hidden-buyer-gap framing, while Gartner reported on May 20, 2026 that 69% of B2B buyers validate AI-generated insights with sales reps. Current marketing graphics now support a more executive-proof visual direction, but there is still no documented founder post sequence in repo evidence ([`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/marketing-graphics-campaign-backlog.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/marketing-graphics-campaign-backlog.md)).
- Message and offer: Post around three themes: why cold fails in guarded accounts, why buyer trust changes response quality, and why one credible route beats more activity.
- Activation path: Founder post -> profile visit, comment, DM, or referral reply -> Client intake or referral conversation -> manual qualification.
- Metric: Primary success metric is qualified inbound conversations sourced from founder posts. Quality metric is the share that matches Client ICP or credible referral-source ICP.
- Trust and brand risk: Meme-heavy tone or aggressive CTA language would make the brand feel unserious or spammy.
- Recommendation: Draft a three-post founder sequence, one comment-to-DM follow-up, and rules for when to route to Client intake versus when to pause or disqualify.
- Acceptance criteria: Three founder posts, one follow-up script, CTA rules, and disqualifier rules are documented; Trust confirms no risky automation is required; Graphics has one approved overlay treatment ready if used.

### P1 - Keep Bum recruiting invite-only and referral-scored
- Growth goal: Qualified Bum acquisition.
- Audience: Existing Bums, trusted operators, former executives, investors, advisors, and senior sellers with credible buyer access.
- Channel: Founder-led referral asks, direct email, LinkedIn DMs, selective operator communities.
- Evidence: Bum-side product surfaces are materially deeper than Client-side acquisition surfaces today: the dashboard pushes profile completion, claims, customer leads, Client Prospects, and prospect activity, while the profile flow supports progressive completion and LinkedIn import ([`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/src/pages/bum/BumDashboard.tsx`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumDashboard.tsx), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/src/pages/bum/BumProfile.tsx`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumProfile.tsx)). That means the immediate supply risk is low-fit admissions, not missing activation mechanics.
- Message and offer: `We are looking for a small number of credible operators who can open real doors.` Emphasize selectivity, conduct, structured workflow, and transparent economics.
- Activation path: Referral or direct intro -> screening -> approval review -> profile completion -> first meaningful marketplace action such as claim, customer lead, or Client Prospect submission.
- Metric: Primary success metric is approved Bum candidates per referral source. Quality metric is approved-to-activated rate by source.
- Trust and brand risk: Open recruiting or “monetize your network” framing would attract weak-fit applicants and damage trust.
- Recommendation: Keep Bum recruiting closed-loop. Build the referral ask, screening rubric, and activation handoff before any broader recruiting surface.
- Acceptance criteria: A referral ask, screening rubric, and activation workflow are documented; passive-income framing is explicitly excluded; and Product Ops can process new Bum candidates consistently.

### P1 - Add a manual Client nurture path for qualified but not-yet-ready prospects
- Growth goal: Marketplace activation and sales enablement.
- Audience: Qualified Client Prospects who engage but do not book or convert immediately.
- Channel: Manual email follow-up, one-pager, founder follow-up, sales collateral.
- Evidence: The current public flow can capture contact data, but there is still no approved nurture sequence, one-pager, objection sheet, or proof asset bundle in repo evidence. Google’s sender guidance still reinforces low spam rates, authentication, and one-click unsubscribe obligations at bulk marketing scale, which supports manual, low-volume nurture until the stack is instrumented.
- Message and offer: Answer four questions in order: why cold fails here, how Trusted Bums controls claims and access, what proof can be shared safely, and what the next operational step looks like.
- Activation path: Qualified contact -> manual review -> one-pager plus short follow-up -> strategy call or paused nurture with explicit stop conditions.
- Metric: Primary success metric is qualified contact-to-call conversion rate. Quality metric is objection-resolution rate without spam complaints or sender-risk signals.
- Trust and brand risk: Premature automation could create domain and deliverability risk before suppression hygiene, reporting, and legal-safe proof are ready.
- Recommendation: Build one short manual nurture sequence and one one-pager before any lifecycle scaling. Track source, objections, and disposition manually if no CRM workflow exists yet.
- Acceptance criteria: The sequence has send triggers, CTA, stop conditions, and objection themes; Data/Analytics defines minimum tracking fields; and Trust confirms the send pattern stays low-risk.

## ICP And Offer Matrix

| Segment | Triggers | Disqualifiers | Value proposition | Proof | First CTA | Follow-up path |
| --- | --- | --- | --- | --- | --- | --- |
| Founder-led Seed to Series A or growth-stage company | Named target accounts blocked in cold channels; founder or GTM leader directly involved; one account materially affects growth | Wants generic lead volume; no named accounts; no internal owner; public-email ambiguity with no proof | Trusted, selective access into hard accounts through structured warm-intro workflows | Claim-safe hard-account narrative; workflow control; seriousness screening | Request intro strategy | Manual review -> founder call -> Client Prospect or company onboarding |
| VP Sales or CRO at a lean revenue team | Team knows targets but lacks a credible route in; prefers controlled introductions over meeting volume | Wants outsourced SDR volume; no account specificity; unclear deal stakes | More credible access motion for strategic accounts | Buyer-risk narrative plus controlled process | Request intro strategy | Strategy call -> account scoping -> agreement and first target submission |
| Investor, advisor, or operator referral source | Knows a portfolio or peer company with a strategic-account blockage | Broad low-fit referral list; weak urgency; no warm context | Trusted Bums helps the right company crack a few critical doors | Proof spine plus founder ask | Refer a company | Founder follow-up -> qualification |
| Former executive or senior operator Bum candidate | Deep buyer trust in specific sectors; willing to operate within review and payout rules | Generic networking interest; weak proof of access; passive-income framing | Structured way to turn trust capital into commercial outcomes | Selective recruiting narrative plus portal workflow depth | Refer or apply by invitation | Screening -> approval -> profile completion -> first action |
| Current Bum or advisor referring another Bum | Knows a credible operator with real buyer access | Candidate lacks relevance, conduct fit, or responsiveness | Marketplace expansion through trusted referral trees | Selective recruiting narrative | Refer a Bum | Screening -> approve or decline |

## Funnel Map

### Bum funnel

- Source: Founder network, current Bums, client referrals, investor or advisor referrals, selective operator outreach.
- Conversion points: Referral received -> Bum candidate submitted -> screening completed -> approved -> profile completed -> first claim, customer lead, or Client Prospect submission.
- Activation definition: Approved Bum completes profile and takes one meaningful marketplace action.
- Retention signals: Repeated claim activity, accepted work, customer-lead submissions, profile freshness, and payout trust.
- Drop-off questions: Which referral sources produce approved Bums? Where do candidates stall: screening, legal, profile completion, or first action?

### Client funnel

- Source: Founder network, investor or advisor referrals, founder LinkedIn, homepage CTA, later paid only after readiness.
- Conversion points: Visitor or referred prospect -> Client strategy request -> manual qualification -> founder strategy call -> Client Prospect or company setup -> Client Agreement accepted -> first target account submitted -> first intro request or accepted claim.
- Activation definition: Company is approved, current agreement is accepted, and at least one target-account workflow is live.
- Retention signals: Additional target accounts, repeated intro requests, accepted claims, payment-report activity, and finance clarity.
- Drop-off questions: How many public inquiries are true Client ICPs? Which objections block calls? How many qualified calls reach agreement and first target-account submission?

## Experiment Queue

1. Hypothesis: A dedicated Client intake will increase qualified strategy requests and reduce mixed low-intent submissions.
- Audience: Founder-led companies and GTM leaders with named target-account demand.
- Channel: Website and founder or referral traffic.
- Asset needs: New Client copy, qualification fields, source tagging, ops handoff.
- Measurement: Qualified submission rate and strategy-call rate.
- Owner: Growth + UX/UI + Product Ops.
- Stop or scale criteria: Scale only if qualified rate rises without raising trust risk or manual-review burden.

2. Hypothesis: A claim-safe proof spine will improve Client call conversion more than generic positioning alone.
- Audience: Qualified Client prospects and referral sources.
- Channel: Founder follow-up, one-pager, sales calls.
- Asset needs: Proof narrative, claims checklist, one-pager.
- Measurement: Strategy-call booking rate and objection mix.
- Owner: Founder + Content + Legal or Finance owner.
- Stop or scale criteria: Stop if proof language creates confusion or claim risk; scale if it consistently reduces trust objections.

3. Hypothesis: Founder posts focused on hard-account access will generate more qualified inbound than general brand posts.
- Audience: Founders, revenue leaders, investors, advisors.
- Channel: LinkedIn organic.
- Asset needs: Three posts, follow-up DM script, comment triage rules, one optional image treatment.
- Measurement: Qualified inbound conversations per post.
- Owner: Founder + Content + Graphics.
- Stop or scale criteria: Stop if replies skew low-fit; scale if repeated high-fit conversations emerge.

4. Hypothesis: Invite-only Bum referrals will produce better approved-to-activated quality than broader recruiting asks.
- Audience: Current Bums, trusted operators, investor or advisor network.
- Channel: Referral email, DM, direct ask.
- Asset needs: Referral ask, screening rubric, onboarding notes.
- Measurement: Approved Bum rate and activated Bum rate by source.
- Owner: Growth + Product Ops.
- Stop or scale criteria: Stop sources that generate weak-fit volume; scale sources that consistently produce approved operators.

5. Hypothesis: Manual nurture plus a one-pager will improve qualified contact-to-call conversion without creating sender risk.
- Audience: Qualified Client Prospects who do not schedule immediately.
- Channel: Manual email follow-up.
- Asset needs: One-pager, two to three email steps, objection FAQ, tracking sheet or CRM fields.
- Measurement: Call-booking rate, objection-resolution rate, and spam-risk signals.
- Owner: Founder + Content + Data/Analytics.
- Stop or scale criteria: Scale only if conversion improves with no trust or deliverability downside.

6. Hypothesis: A narrow LinkedIn paid pilot can work only after segmentation, proof, routing, and shutdown rules are ready.
- Audience: Narrow founder and revenue-leader segments in approved ICP slices.
- Channel: LinkedIn paid.
- Asset needs: Audience definitions, budget cap, approved creative, Client-specific landing, source tracking.
- Measurement: Qualified strategy requests per spend and accepted-founder-conversation rate.
- Owner: Growth + Graphics + Data/Analytics + Trust.
- Stop or scale criteria: Do not launch until intake, proof, tracking, and manual review are in place; stop immediately if low-fit volume or trust risk rises.

## Sales And Recruiting Enablement

- Client one-pager needed: hard-account problem, how trusted routes work, what selectivity means, workflow controls, and what Trusted Bums is not.
- Bum recruiting one-pager needed: who should be referred, expected conduct, why selectivity matters, and what activation looks like.
- Founder talk tracks needed: one for Client demand, one for investor or advisor referrals, and one for Bum recruiting.
- Objection handling needed: `Is this just lead gen?`, `How do you control claims and access?`, `How selective are Bums?`, `What proof can you actually share?`, and `How are commissions and payouts governed?`
- Referral asks needed: one investor or advisor ask for Client referrals and one operator-network ask for Bum referrals.
- Legal and finance review needed: proof language, commission language, payout language, referral-compensation disclosure rules, and any outcome-adjacent claim.

## Measurement Plan

- North-star metric: Active qualified liquidity = active Client companies with live target-account demand plus activated approved Bums with current credible access.
- Input metrics: Qualified Client strategy requests, qualified referred companies, qualified Bum referrals, approved Bum candidates, founder strategy calls, Client Agreements accepted, first target accounts submitted, and first claims or intro requests submitted.
- Quality metrics: Qualified-to-approved rate by source, approved-to-activated Bum rate, strategy-request-to-call rate, target-account seriousness rate, verified-company-domain rate, and spam or low-fit submission rate.
- Source tracking: Capture source, campaign, referring person, segment, manual qualification outcome, objection category, and next-step disposition for every Client Prospect and Bum candidate.
- Attribution limits: Current session still has no CRM or analytics evidence, so measurement should begin with simple source-of-truth logging before any multi-touch model.
- Reporting needs: Weekly marketplace-liquidity review covering Client demand, Bum supply, activation, source quality, and trust-risk signals.
- Data gaps: Missing CRM pipeline data, website analytics, campaign analytics, LinkedIn analytics, email performance, interview evidence, approved proof boundaries, and budget constraints materially limit prioritization confidence.

## Current Standards And Time-Sensitive Notes

- Google’s sender guidance still requires authenticated domains, accurate sender identity, low spam rates, and one-click unsubscribe for marketing or subscribed mail at bulk volume. Trusted Bums should keep nurture and referral email low-volume and high-intent until sender controls and instrumentation are stronger. Sources: [Google Email sender guidelines](https://support.google.com/mail/answer/81126?hl=en), [Google Email sender guidelines FAQ](https://support.google.com/a/answer/14229414?hl=en).
- LinkedIn still recommends concise ad copy, clear CTA, and multiple creative variants per campaign, while current single-image guidance supports landscape and square broadly and vertical selectively for mobile-heavy placements. That supports small, tested paid experiments later, not broad early spend. Sources: [LinkedIn Sponsored Content tips](https://business.linkedin.com/marketing-solutions/best-practices/ad-tips/sponsored-content-tips), [LinkedIn single image ad specs](https://business.linkedin.com/advertise/ads/sponsored-content/single-image-ads-specs).
- LinkedIn B2B Institute guidance on the 95-5 rule and the hidden-buyer gap still supports founder-led thought leadership and buyer-committee education rather than only bottom-funnel capture. Sources: [LinkedIn 95-5 rule](https://business.linkedin.com/marketing-solutions/b2b-institute/b2b-research/trends/95-5-rule), [LinkedIn hidden buyer gap](https://business.linkedin.com/marketing-solutions/b2b-institute/b2b-research/trends/the-hidden-buyer-gap).
- Gartner reported on May 20, 2026 that 69% of B2B buyers prefer to validate AI-generated insights with sales reps. Trusted Bums should therefore keep a human validation step in high-stakes Client acquisition instead of over-indexing on self-serve conversion. Source: [Gartner press release](https://www.gartner.com/en/newsroom/press-releases/2026-05-20-gartner-survey-finds-sixty-nine-percent-of-b-two-b-buyers-turn-to-sales-reps-to-validate-ai-generated-insights).
- The ICO updated its electronic-mail direct-marketing guidance on April 28, 2026. If Trusted Bums targets UK contacts, permission basis, suppression hygiene, and list-source discipline matter even more; bought lists and loosely permissioned nurture should stay out of scope. Source: [ICO guidance on direct marketing using electronic mail](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/).
- FTC endorsement guidance still requires clear disclosure of material connections. Trusted Bums should keep any compensated referral or advisor endorsement language explicit if public referral content ever ships. Source: [FTC Endorsement Guides FAQ](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking).

## Access Requests And Evidence Gaps

- `docs/brand-strategy.md` is still missing, so positioning, proof hierarchy, and voice decisions remain inferred rather than confirmed from a dedicated source-of-truth file.
- CRM and pipeline visibility for Client Prospects and Bum candidates is still missing: source, owner, stage, qualification status, disqualification reason, and conversion timing.
- Website analytics, source tracking, LinkedIn organic analytics, LinkedIn paid performance, email performance, and referral-source tracking are still missing.
- No approved case-study permissions, proof-claim boundaries, founder scripts, sales collateral, objection notes, or legal-safe commission and payout language were available in this run.
- No customer interviews, Bum interviews, call notes, or channel budget constraints were available in this run.
- Mirror durable access needs in [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/consultant-access-needs.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/consultant-access-needs.md), especially the GTM evidence request and missing brand-strategy source request.

## Agent Inputs

- Date of run: 2026-06-06.
- Files, routes, assets, and commands reviewed: [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/company-wide-rules.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/company-wide-rules.md), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/consultant-team-rules.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/consultant-team-rules.md), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/consultant-access-needs.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/consultant-access-needs.md), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/trusted-bums-operating-model.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/trusted-bums-operating-model.md), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/content-copyeditor-backlog.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/content-copyeditor-backlog.md), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/marketing-graphics-campaign-backlog.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/marketing-graphics-campaign-backlog.md), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/trust-reputation-backlog.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/trust-reputation-backlog.md), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/product-ops-workflow-backlog.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/product-ops-workflow-backlog.md), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/data-analytics-backlog.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/data-analytics-backlog.md), prior [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/b2b-marketing-growth-backlog.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/b2b-marketing-growth-backlog.md), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/codex-edit-log.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/codex-edit-log.md), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/src/pages/Index.tsx`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/Index.tsx), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/src/components/SignupIntentDialog.tsx`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/components/SignupIntentDialog.tsx), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/src/lib/contactApi.ts`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/lib/contactApi.ts), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/src/App.tsx`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/App.tsx), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/src/pages/client/ClientTerms.tsx`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientTerms.tsx), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/client/ClientDashboard.tsx), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/src/pages/bum/BumDashboard.tsx`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumDashboard.tsx), [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/src/pages/bum/BumProfile.tsx`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/src/pages/bum/BumProfile.tsx), `git status --short`, `git log --oneline --decorate -n 12`, targeted `rg`, and targeted `sed`.
- Internet sources reviewed: Google email sender guidance, LinkedIn Sponsored Content tips, LinkedIn single-image ad specs, LinkedIn 95-5 rule, LinkedIn hidden buyer gap, Gartner’s May 20, 2026 B2B buyer validation press release, ICO direct-marketing guidance updated April 28, 2026, and FTC endorsement guidance FAQ.
- Checks that could not run and why: `docs/brand-strategy.md` was not present in the repo; no CRM, analytics, LinkedIn account analytics, email platform, approved claims matrix, interview archive, case-study approval source, or budget source was available in repo or connected tools, so prioritization remains source-backed and standards-backed rather than performance-backed. No automation memory file existed at the start of this run, so continuity came from the current backlog and [`/Users/ryan.peterson/Documents/Trusted Bums LOCAL/trustedbums/docs/codex-edit-log.md`](/Users/ryan.peterson/Documents/Trusted%20Bums%20LOCAL/trustedbums/docs/codex-edit-log.md).
