# Trusted Bums B2B Marketing Growth Backlog

_Last updated: 2026-06-07 by Codex daily B2B growth marketer automation._

## Executive Growth Thesis

Client demand is still the constraining side of marketplace liquidity. The repo shows materially deeper Bum-side activation than Client-side acquisition: Bums already have profile-completion, Client Prospect, Claim, Customer Lead, and contact-capture workflows, while Client acquisition is still one homepage, one mixed contact form, and one shared signup-intent modal. The safest current growth path is to make Client intake more selective and proof-rich, then support it with founder-led and referral-led demand capture. Bum growth should remain invite-only and referral-scored until Client demand, proof assets, and measurement are stronger.

## North Star And Guardrails

- Primary growth goal: Increase active qualified liquidity, meaning more approved Client companies with live named-account demand and more activated approved Bums with credible access.
- Quality guardrail: Do not optimize for raw signups, impressions, clicks, or list size if named-account seriousness, approval quality, or approved-to-activated rates weaken.
- Trust guardrail: Trusted Bums must read as a controlled B2B marketplace, not a generic lead-gen engine, affiliate loop, or passive-income pitch.
- Legal and claims guardrail: No guaranteed meetings, guaranteed revenue, payout promises, customer-logo claims, or compensation language beyond approved boundaries.
- Marketplace guardrail: More Clients only matter if they bring real hard-account demand; more Bums only matter if they add credible relationship access and operate inside review workflows.
- Channel guardrail: Keep outbound email, DMs, and referral asks low-volume and manual until CRM, attribution, sender reputation, and claims approval are available.
- Runner constraint: For consultant-runner local checks, use port `8080` only. For external DNS context, use `https://rcdl.tplinkdns.com` and treat local TLS or reachability failures as runner limitations unless corroborated independently.

## Active Growth Plays

### P0 - Split Client demand from the mixed public intake path
- Growth goal: Qualified Client acquisition.
- Audience: Founder, CRO, VP Sales, or GTM lead with one or two high-value target accounts blocked in cold channels.
- Channel: Website, founder-led follow-up, referral traffic, LinkedIn organic.
- Evidence: The public homepage still routes serious Client demand through the same contact form used for Bum and general interest. The form relies on one `interest` selector, optional company and target-account context, and a free-text message on the same page that also promotes Bum signup ([Index](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx), [contactApi](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts)). The shared signup modal still starts by asking users to choose `Client Prospect` or `Bum Prospect` instead of routing Client buyers into a dedicated qualification flow ([SignupIntentDialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx)). Admin intake already supports manual status, owner, escalation, and conversion, so the ops side can absorb a more selective Client path ([ContactSubmissionsPanel](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [product-ops backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md)).
- Message and offer: `Bring us the accounts your team cannot crack.` Offer a selective intro-strategy review for companies with named-account urgency, a clear internal owner, and willingness to work inside a controlled process.
- Activation path: Homepage or founder/referral traffic -> Client-specific intake branch with role, named-account count, current blocker, urgency, and disqualifiers -> manual seriousness review -> founder call -> Client Prospect or company setup.
- Metric: Primary metric is qualified Client strategy requests that pass manual review. Quality metric is the share with named accounts, verified company identity, and a clear commercial owner.
- Trust and brand risk: Weak qualification or mixed messaging will attract low-fit inquiries and make the brand look like outsourced SDR or open-access lead gen.
- Recommendation: Create a Client-specific intake surface or routed form branch. Require target-account seriousness signals, state the selective review process, and separate Bum recruiting from Client acquisition in the first public step.
- Acceptance criteria: A distinct Client path exists; it collects role and named-account context; it explains selectivity and manual review; and Product Ops can name the review owner and next-step workflow.

### P0 - Build a claim-safe proof spine before scaling demand generation
- Growth goal: Proof, qualified Client acquisition, referral conversion, and sales enablement.
- Audience: Client buyers, investor or advisor referral sources, and high-quality Bum candidates evaluating marketplace seriousness.
- Channel: Founder-led sales, one-pagers, referral asks, LinkedIn organic, manual follow-up.
- Evidence: The operating model strongly supports the hard-account-access story and the brand promise that trust opens doors strangers cannot ([operating model](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trusted-bums-operating-model.md), [Index](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx)). The marketing graphics backlog now supports a more executive proof-room visual language rather than generic network art ([marketing graphics backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/marketing-graphics-campaign-backlog.md)). But `docs/brand-strategy.md` is still missing, and no approved case-study permissions, public/private claims matrix, founder script source, or approved proof narrative exists in the repo ([consultant access needs](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md)).
- Message and offer: `One credible route can change the odds on a company-defining account.` Explain the hard-account problem, the controlled warm-intro workflow, and the commercial seriousness without drifting into unsupported outcomes.
- Activation path: Founder, advisor, and operator conversations reuse one proof spine -> qualified prospect requests strategy review -> founder call.
- Metric: Primary metric is strategy-call conversion after proof use. Quality metric is reduction in trust objections without any unapproved claims or logo leakage.
- Trust and brand risk: Without proof discipline, the brand can overclaim fast and look unserious or legally exposed.
- Recommendation: Produce one reusable proof spine with three variants: Client acquisition, investor/advisor referral ask, and Bum recruiting. Include a public/private/do-not-say checklist before scaling any campaign asset.
- Acceptance criteria: One reusable proof narrative exists; claim boundaries are explicit; founder, Content, and sales follow the same story; and any public proof stays inside approved limits.

### P1 - Package investor and advisor referrals as the primary Client-demand motion
- Growth goal: Qualified Client acquisition.
- Audience: Investors, advisors, operators, and current insiders who know companies blocked on named-account access.
- Channel: Referral-led, founder-led direct asks, email, LinkedIn DM.
- Evidence: Trusted Bums is structurally better suited to warm third-party introductions than to broad cold top-of-funnel motion ([operating model](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trusted-bums-operating-model.md)). The current repo still lacks a referral ask pack, a qualification rubric, and legal-approved compensation/disclosure language, so this motion should stay narrow and human-led ([consultant access needs](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md), [FTC endorsement guidance](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides)).
- Message and offer: `Do you know a founder or GTM lead with a small set of accounts that really matter and no credible way in?`
- Activation path: Referral ask -> referred company intro -> Client strategy intake -> founder qualification -> company onboarding only if named-account seriousness is clear.
- Metric: Primary metric is qualified referred companies per source. Quality metric is referral-to-call rate and pass-through to approved Client demand.
- Trust and brand risk: Public `send us anyone` language or vague compensation will feel promotional and weaken selectivity.
- Recommendation: Build one short referral ask, one screening rubric, and one founder follow-up script. Keep compensated-referral language out of circulation until legal-safe boundaries exist.
- Acceptance criteria: Referral ask pack exists; it names ideal company shape and disqualifiers; and referral-compensation language is either approved or intentionally excluded.

### P1 - Launch founder-led LinkedIn around hard-account access, not generic growth
- Growth goal: Qualified Client acquisition and referral.
- Audience: Founders, GTM leaders, investors, advisors, and operators who influence strategic-account access decisions.
- Channel: Founder LinkedIn organic.
- Evidence: Current LinkedIn guidance still supports clear single-message creative and disciplined testing for paid later, while LinkedIn B2B Institute still supports brand-led memory building via the 95-5 rule ([LinkedIn single image ads](https://business.linkedin.com/marketing-solutions/success/ads-guide/single-image-ads?src=bl-po), [LinkedIn Sponsored Content tips](https://business.linkedin.com/marketing-solutions/success/best-practices/sponsored-content-tips?src=bl-po), [LinkedIn 95-5 rule](https://business.linkedin.com/marketing-solutions/b2b-institute/b2b-research/trends/95-5-rule)). Gartner reported on May 20, 2026 that 69% of B2B buyers turn to sales reps to validate AI-generated insights, which supports a founder-led human-validation narrative instead of generic content volume ([Gartner press release](https://www.gartner.com/en/newsroom/press-releases/2026-05-20-gartner-survey-finds-sixty-nine-percent-of-b-two-b-buyers-turn-to-sales-reps-to-validate-ai-generated-insights)).
- Message and offer: Three themes: why cold fails in guarded accounts, why buyer trust changes response quality, and why one credible route beats more sales activity.
- Activation path: Founder post -> profile visit, comment, DM, or referral reply -> Client strategy intake or referral conversation -> manual qualification.
- Metric: Primary metric is qualified inbound conversations per post. Quality metric is the share that matches Client ICP or credible referral-source ICP.
- Trust and brand risk: Meme-heavy tone or aggressive CTA language will make a high-trust B2B brand look sloppy.
- Recommendation: Draft a three-post founder sequence, one comment-to-DM follow-up, and rules for when to route to intake versus when to pause or disqualify.
- Acceptance criteria: Three founder posts, one follow-up script, CTA rules, and disqualifier rules are documented; Graphics has one approved overlay-ready plate if needed; and Trust confirms no risky automation is required.

### P1 - Keep Bum recruiting invite-only and referral-scored
- Growth goal: Qualified Bum acquisition.
- Audience: Existing Bums, trusted operators, former executives, investors, advisors, and senior sellers with credible buyer access.
- Channel: Founder-led referral asks, direct email, LinkedIn DMs, selective operator communities.
- Evidence: Bum-side product depth is already stronger than Client-side acquisition depth. The Bum dashboard pushes profile completeness, Claims, Customer Leads, opportunities, and Client Prospect activity, and the profile flow supports structured completion plus LinkedIn import ([BumDashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumDashboard.tsx), [BumProfile](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProfile.tsx), [BumProspects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx)). The content backlog also shows recruiting terminology is still drifting between `Bum Prospect`, `Become a Bum`, and `Prospects`, which is another reason not to scale this publicly yet ([content copyeditor backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md)).
- Message and offer: `We are looking for a small number of credible operators who can open real doors.`
- Activation path: Referral or direct intro -> screening -> approval review -> profile completion -> first meaningful action such as Claim, Customer Lead, or Client Prospect submission.
- Metric: Primary metric is approved Bum candidates per source. Quality metric is approved-to-activated rate by source.
- Trust and brand risk: Open recruiting or `monetize your network` framing will damage trust and flood the marketplace with weak-fit supply.
- Recommendation: Keep Bum recruiting closed-loop. Build the referral ask, screening rubric, and activation handoff before any broader recruiting surface.
- Acceptance criteria: Referral ask, screening rubric, and activation workflow are documented; passive-income framing is explicitly excluded; and Product Ops can process new Bum candidates consistently.

### P1 - Add a manual Client nurture path for qualified but not-yet-ready prospects
- Growth goal: Marketplace activation and sales enablement.
- Audience: Qualified Client Prospects who engage but do not book or convert immediately.
- Channel: Manual email follow-up, founder follow-up, one-pager.
- Evidence: The public flow can capture contact data today, but no approved nurture sequence, objection sheet, one-pager, or founder follow-up pack exists in the repo. Trust risk is still material: the trust backlog shows the downstream `send-website-email` path remains an abuse-sensitive surface, and Google sender guidance plus ICO guidance both favor disciplined, permission-aware email rather than premature lifecycle scale ([trust backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trust-reputation-backlog.md), [Google sender guidelines](https://support.google.com/a/answer/81126?hl=en-na), [Google sender guidelines FAQ](https://support.google.com/a/answer/14229414?hl=en-EN), [ICO electronic mail guidance updated 2026-04-28](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/)).
- Message and offer: Answer four questions in sequence: why cold fails here, how Trusted Bums controls claims and access, what proof can be shared safely, and what the next operating step looks like.
- Activation path: Qualified contact -> manual review -> one-pager plus short founder follow-up -> strategy call or paused nurture with explicit stop conditions.
- Metric: Primary metric is qualified contact-to-call conversion. Quality metric is objection-resolution rate with no sender-risk or spam-signal regression.
- Trust and brand risk: Lifecycle automation before proof, suppression, and instrumentation are ready can create domain and deliverability risk.
- Recommendation: Build one short manual nurture sequence and one one-pager before any automation or broader lifecycle tooling. Track source, objections, and disposition manually if no CRM exists yet.
- Acceptance criteria: Sequence has send triggers, CTA, stop conditions, and objection themes; Data/Analytics defines minimum tracking fields; and Trust confirms the send pattern remains low-risk.

## ICP And Offer Matrix

| Segment | Triggers | Disqualifiers | Value proposition | Proof | First CTA | Follow-up path |
| --- | --- | --- | --- | --- | --- | --- |
| Founder-led Seed to Series A or growth-stage company | Named accounts blocked in cold channels; founder or GTM leader directly involved; one account materially affects growth | Wants broad lead volume; no named accounts; no internal owner; public-email ambiguity with no proof | Trusted, selective access into hard accounts through structured warm-intro workflows | Hard-account narrative, workflow control, seriousness screening | Request intro strategy | Manual review -> founder call -> Client Prospect or company setup |
| VP Sales or CRO at a lean revenue team | Team knows targets but lacks a credible route in; prefers controlled introductions over activity volume | Wants outsourced SDR volume; no account specificity; unclear deal stakes | A more credible access motion for strategic accounts | Buyer-risk narrative plus controlled process | Request intro strategy | Strategy call -> account scoping -> agreement and first target submission |
| Investor, advisor, or operator referral source | Knows a company with one or two strategic account blockages | Broad low-fit referral list; weak urgency; no warm context | Trusted Bums helps the right company crack a few critical doors | Proof spine plus founder ask | Refer a company | Founder follow-up -> qualification |
| Former executive or senior operator Bum candidate | Deep buyer trust in specific sectors; willing to operate inside review and payout rules | Generic networking interest; weak proof of access; passive-income framing | Structured way to convert trust capital into controlled commercial outcomes | Selective recruiting narrative plus portal workflow depth | Refer or apply by invitation | Screening -> approval -> profile completion -> first action |
| Current Bum or advisor referring another Bum | Knows a credible operator with real buyer access | Candidate lacks relevance, conduct fit, or responsiveness | Marketplace expansion through trusted referral trees | Selective recruiting narrative | Refer a Bum | Screening -> approve or decline |

## Funnel Map

### Bum funnel

- Source: Founder network, current Bums, client referrals, investor or advisor referrals, selective operator outreach.
- Conversion points: Referral received -> Bum candidate submitted -> screening completed -> approved -> profile completed -> first Claim, Customer Lead, or Client Prospect action.
- Activation definition: Approved Bum completes profile and takes one meaningful marketplace action.
- Retention signals: Repeated Claim activity, accepted work, Customer Lead submissions, profile freshness, and payout trust.
- Drop-off questions: Which referral sources produce approved Bums? Where do candidates stall: screening, legal, profile completion, or first action?

### Client funnel

- Source: Founder network, investor or advisor referrals, founder LinkedIn, homepage CTA, and only later paid once routing and proof are stronger.
- Conversion points: Visitor or referred prospect -> Client strategy request -> manual qualification -> founder strategy call -> Client Prospect or company setup -> Client Agreement accepted -> first target account submitted -> first intro request or accepted Claim.
- Activation definition: Company is approved, current agreement is accepted, and at least one target-account workflow is live.
- Retention signals: Additional target accounts, repeated intro requests, accepted Claims, Customer Payment Report activity, and finance clarity.
- Drop-off questions: How many public inquiries are true Client ICPs? Which objections block calls? How many qualified calls reach agreement and first target-account submission?

## Experiment Queue

1. Hypothesis: A dedicated Client intake branch will increase qualified strategy requests and reduce mixed low-intent submissions.
- Audience: Founder-led companies and GTM leaders with named-account demand.
- Channel: Website and founder or referral traffic.
- Asset needs: Client-specific copy, qualification fields, source tagging, ops handoff.
- Measurement: Qualified submission rate, strategy-call rate, and low-fit submission rate.
- Owner: Growth + UX/UI + Product Ops.
- Stop or scale criteria: Scale only if qualified rate rises without increasing trust risk or manual-review burden.

2. Hypothesis: A claim-safe proof spine will improve Client call conversion more than generic positioning alone.
- Audience: Qualified Client prospects and referral sources.
- Channel: Founder follow-up, one-pager, sales calls.
- Asset needs: Proof narrative, claims checklist, one-pager.
- Measurement: Strategy-call booking rate and objection mix.
- Owner: Founder + Content + Legal/Finance owner.
- Stop or scale criteria: Stop if proof language creates claim risk or confusion; scale if it consistently reduces trust objections.

3. Hypothesis: Founder posts focused on hard-account access will generate more qualified inbound than general brand posts.
- Audience: Founders, revenue leaders, investors, advisors.
- Channel: LinkedIn organic.
- Asset needs: Three posts, one DM follow-up script, one optional visual treatment.
- Measurement: Qualified inbound conversations per post.
- Owner: Founder + Content + Graphics.
- Stop or scale criteria: Stop if replies skew low-fit; scale if repeated high-fit conversations emerge.

4. Hypothesis: Invite-only Bum referrals will produce better approved-to-activated quality than broader recruiting asks.
- Audience: Current Bums, trusted operators, investor or advisor network.
- Channel: Referral email, DM, direct ask.
- Asset needs: Referral ask, screening rubric, activation notes.
- Measurement: Approved Bum rate and activated Bum rate by source.
- Owner: Growth + Product Ops.
- Stop or scale criteria: Stop sources that generate weak-fit volume; scale sources that consistently produce approved operators.

5. Hypothesis: Manual nurture plus a one-pager will improve qualified contact-to-call conversion without creating sender-risk regression.
- Audience: Qualified Client Prospects who do not schedule immediately.
- Channel: Manual email follow-up.
- Asset needs: One-pager, short sequence, objection FAQ, tracking sheet or CRM fields.
- Measurement: Call-booking rate, objection-resolution rate, and sender-risk signals.
- Owner: Founder + Content + Data/Analytics.
- Stop or scale criteria: Scale only if conversion improves with no trust or deliverability downside.

6. Hypothesis: A narrow LinkedIn paid pilot can work only after intake, proof, tracking, and shutdown rules are ready.
- Audience: Narrow founder and revenue-leader segments in approved ICP slices.
- Channel: LinkedIn paid.
- Asset needs: Audience definitions, budget cap, approved creative, Client-specific landing, source tracking.
- Measurement: Qualified strategy requests per spend and accepted-founder-conversation rate.
- Owner: Growth + Graphics + Data/Analytics + Trust.
- Stop or scale criteria: Do not launch until routing, proof, tracking, and manual review are in place; stop immediately if low-fit volume or trust risk rises.

## Sales And Recruiting Enablement

- Client one-pager needed: hard-account problem, how trusted routes work, what selectivity means, workflow controls, and what Trusted Bums is not.
- Bum recruiting one-pager needed: who should be referred, expected conduct, why selectivity matters, and what activation looks like.
- Founder talk tracks needed: one for Client demand, one for investor/advisor referrals, and one for Bum recruiting.
- Objection handling needed: `Is this just lead gen?`, `How do you control claims and access?`, `How selective are Bums?`, `What proof can you actually share?`, and `How are commissions and payouts governed?`
- Referral asks needed: one investor/advisor ask for Client referrals and one operator-network ask for Bum referrals.
- Legal and finance review needed: proof language, commission language, payout language, referral-compensation disclosure, and any outcome-adjacent claim.

## Measurement Plan

- North-star metric: Active qualified liquidity = active Client companies with live target-account demand plus activated approved Bums with current credible access.
- Input metrics: Qualified Client strategy requests, qualified referred companies, qualified Bum referrals, approved Bum candidates, founder strategy calls, Client Agreements accepted, first target accounts submitted, and first Claims or intro requests submitted.
- Quality metrics: Qualified-to-approved rate by source, approved-to-activated Bum rate, strategy-request-to-call rate, named-account seriousness rate, verified-company-domain rate, and low-fit or spammy intake rate.
- Source tracking: Capture source, campaign, referring person, segment, manual qualification outcome, objection category, and next-step disposition for every Client Prospect and Bum candidate.
- Attribution limits: This session still had no CRM, analytics, or campaign data, so measurement should start with simple source-of-truth logging before any multi-touch model.
- Reporting needs: Weekly liquidity review covering Client demand, Bum supply, activation, source quality, and trust-risk signals.
- Data gaps: Missing CRM pipeline data, website analytics, LinkedIn analytics, email performance, interview evidence, approved proof boundaries, and budget constraints still limit prioritization confidence.

## Current Standards And Time-Sensitive Notes

- Google’s email sender guidance still requires authenticated domains, accurate sender identity, low spam rates, and one-click unsubscribe for marketing or subscribed bulk mail. Trusted Bums should keep nurture and referral email low-volume and high-intent until sender controls and instrumentation are stronger. Sources: [Google sender guidelines](https://support.google.com/a/answer/81126?hl=en-na), [Google sender FAQ](https://support.google.com/a/answer/14229414?hl=en-EN).
- LinkedIn still recommends clear creative, focused CTA, and disciplined format use, while the current single-image guidance supports careful paid testing later rather than premature broad spend. Sources: [LinkedIn single image ads](https://business.linkedin.com/marketing-solutions/success/ads-guide/single-image-ads?src=bl-po), [LinkedIn Sponsored Content tips](https://business.linkedin.com/marketing-solutions/success/best-practices/sponsored-content-tips?src=bl-po).
- LinkedIn B2B Institute still supports the 95-5 rule, which fits founder-led thought leadership and category memory before heavy bottom-funnel optimization. Source: [LinkedIn 95-5 rule](https://business.linkedin.com/marketing-solutions/b2b-institute/b2b-research/trends/95-5-rule).
- Gartner reported on May 20, 2026 that 69% of B2B buyers validate AI-generated insights with sales reps. Trusted Bums should keep a human validation step in high-stakes Client acquisition. Source: [Gartner press release](https://www.gartner.com/en/newsroom/press-releases/2026-05-20-gartner-survey-finds-sixty-nine-percent-of-b-two-b-buyers-turn-to-sales-reps-to-validate-ai-generated-insights).
- The ICO updated its electronic-mail direct-marketing guidance on April 28, 2026. If Trusted Bums targets UK contacts, permission basis, suppression hygiene, and list-source discipline matter even more. Bought lists and loosely permissioned nurture should stay out of scope. Source: [ICO guidance on direct marketing using electronic mail](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/).
- FTC endorsement guidance still requires clear disclosure of material connections. Trusted Bums should keep any compensated referral or advisor endorsement language explicit if that motion ever ships publicly. Source: [FTC Endorsement Guides FAQ](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides).

## Access Requests And Evidence Gaps

- `docs/brand-strategy.md` is still missing, so positioning, proof hierarchy, and voice decisions remain inferred rather than confirmed from a dedicated source of truth.
- CRM and pipeline visibility for Client Prospects and Bum candidates is still missing: source, owner, stage, qualification status, disqualification reason, and conversion timing.
- Website analytics, source tracking, LinkedIn organic analytics, LinkedIn paid performance, email performance, and referral-source tracking are still missing.
- No approved case-study permissions, proof-claim boundaries, founder scripts, sales collateral, objection notes, or legal-safe commission, payout, and referral-disclosure language were available in this run.
- No customer interviews, Bum interviews, call notes, or channel budget constraints were available in this run.
- Mirror durable GTM evidence requests in [consultant-access-needs.md](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/consultant-access-needs.md).

## Agent Inputs

- Date of run: 2026-06-07.
- Files, routes, assets, and commands reviewed: [growth marketer prompt](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/automation-prompts/trusted-bums-daily-b2b-growth-marketer.toml), [consultant team rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-team-rules.md), [company-wide rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/company-wide-rules.md), [consultant access needs](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/consultant-access-needs.md), [business access rules](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/agents/business-access-rules.md), [codex edit log](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/codex-edit-log.md), [operating model](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trusted-bums-operating-model.md), [content copyeditor backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/content-copyeditor-backlog.md), [marketing graphics backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/marketing-graphics-campaign-backlog.md), [trust backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/trust-reputation-backlog.md), [product ops backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/product-ops-workflow-backlog.md), [data analytics backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/data-analytics-backlog.md), prior [growth backlog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/docs/b2b-marketing-growth-backlog.md), [Index](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/Index.tsx), [SignupIntentDialog](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/SignupIntentDialog.tsx), [contactApi](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/lib/contactApi.ts), [ContactSubmissionsPanel](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/components/admin/ContactSubmissionsPanel.tsx), [ClientDashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/client/ClientDashboard.tsx), [BumDashboard](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumDashboard.tsx), [BumProfile](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProfile.tsx), [BumProspects](/Users/macdaddy/CodexWork/TrustedBums/trustedbums/src/pages/bum/BumProspects.tsx), `git status --short`, targeted `git log`, targeted `rg`, targeted `sed`, `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run lint`, `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm exec vitest run src/test/e2eSmokeRegression.test.ts src/test/termsContractRules.test.ts`, `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm run build`, `curl -I -L --max-time 15 https://rcdl.tplinkdns.com`, and `/Users/macdaddy/.local/share/codex-node/node-v24.16.0-darwin-arm64/bin/corepack pnpm exec vite preview --host 127.0.0.1 --port 8080`.
- Internet sources reviewed: Google sender guidance, LinkedIn single-image ads guidance, LinkedIn Sponsored Content tips, LinkedIn B2B Institute 95-5 rule, Gartner’s May 20, 2026 B2B buyer validation press release, ICO direct-marketing guidance updated April 28, 2026, and FTC endorsement guidance FAQ.
- Checks that could not run and why: `docs/brand-strategy.md` is still absent; no CRM, analytics, LinkedIn account analytics, email platform, approved claims matrix, interview archive, case-study approval source, or channel budget source was available in repo or connected tools. The external DNS target check against `https://rcdl.tplinkdns.com` failed with `curl: (60) SSL certificate problem: unable to get local issuer certificate`, so this run has no fresh external rendered-site proof. Local preview on `127.0.0.1:8080` could not start because the runner returned `listen EPERM`, so rendered local route checks were unavailable. `pnpm run lint` completed with seven pre-existing `react-hooks/exhaustive-deps` warnings and no errors; targeted vitest checks passed; and `pnpm run build` passed with the existing large shared JS chunk warning.
