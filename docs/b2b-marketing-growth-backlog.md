# Trusted Bums B2B Marketing Growth Backlog

_Last updated: 2026-06-08 by Codex daily B2B growth marketer automation._

## Executive Growth Thesis

Current-state postscript: current public-route head `9f42bf4` is live. DreamHost deploy run `27178512660` succeeded and hosted `E2E Smoke` run `27178530411` passed, so the split Client/Bum landing change is no longer just a source plan. GitHub `QA` run `27178512695` is still red, but the failure is a backlog-contract regression rather than a public-route outage. There is still no current-head `Visual UI Audit` artifact for the new landing copy, so visual proof for `9f42bf4` remains an evidence gap.

Client demand is still the constraint on marketplace liquidity. The public path is better separated now: `src/pages/Index.tsx` is Client-first and `src/pages/BumLanding.tsx` owns Bum recruiting. The remaining growth bottleneck is qualification depth. The Client page still routes demand into one contact form that only captures name, email, company, interest, optional target-account notes, and a free-text message, while the shared signup flow still captures only email plus company name for Client setup.

The safest near-term growth path is not broader top-of-funnel volume. It is a sharper Client-demand capture and follow-up motion: keep the split public routing, deepen Client seriousness capture, operationalize owner and next-step discipline in admin follow-up, and give founder-led/referral-led traffic a proof-safe story that matches the operating model. Bum acquisition should stay invite-only and referral-scored until Client demand capture, approved proof, and measurement are stronger.

## North Star And Guardrails

- Primary growth goal: increase active qualified liquidity, meaning more approved Client companies with live named-account demand and more activated approved Bums with credible access.
- Quality guardrail: do not optimize for raw signups, clicks, impressions, or list size if named-account seriousness, approval quality, or approved-to-activated rates weaken.
- Trust guardrail: Trusted Bums must read as a controlled B2B marketplace, not an outsourced SDR shop, affiliate loop, or passive-income offer.
- Legal and claims guardrail: no guaranteed meetings, guaranteed revenue, customer-logo claims, payout promises, or compensated-referral language outside approved boundaries.
- Marketplace guardrail: more Clients only matter when they bring real hard-account demand; more Bums only matter when they add credible relationship access and operate inside review workflows.
- Channel guardrail: keep outbound email, DMs, and referral asks low-volume and manual until approved claims, sender controls, source tracking, and objection logging exist.
- Runner constraint: use port `8080` only for local testing. When external DNS context is needed, use `https://rcdl.tplinkdns.com` and treat runner-side TLS or reachability failures as runner limitations unless corroborated elsewhere.

## Active Growth Plays

### P0 - [TB-0034] Enrich the Client intake path and operationalize qualification
- Current implementation note: v1 is now being shipped as a Client strategy-request workflow instead of a generic contact form. The public form captures buyer role, target-account count, target context, blocker, urgency, referral source, and commercial reason. Admin review exposes qualification status, owner claim, priority, next action, follow-up deadline, disqualification reason, and blocks Client Target creation until the request is marked qualified.
- Growth goal: qualified Client acquisition.
- Audience: founder, CRO, VP Sales, or GTM lead with one or two high-value target accounts blocked in cold channels.
- Channel: website, founder-led follow-up, referral traffic, LinkedIn organic.
- Evidence: `src/pages/Index.tsx` now gives Clients their own landing page and routes Bum recruiting to `/bums`, but the Client contact block still presents three competing CTAs (`Talk to Trusted Bums`, `Become a Bum`, and `Client signup`) and a form with only `name`, `email`, `companyName`, `interest`, `targetAccounts`, and `message`. `src/components/SignupIntentDialog.tsx` still keeps the generic unlocked labels `Client Prospect` and `Bum Prospect`, while `src/components/admin/ContactSubmissionsPanel.tsx` still frames the work as converting `Client Prospect` requests into targets. `src/lib/contactApi.ts` already has `admin_owner_id`, `admin_next_action`, and `claimContactSubmission`, but the admin intake panel does not expose that discipline yet. Hosted `E2E Smoke` run `27178530411` passed on `9f42bf4`, so this is now a live product-shape issue rather than a blocked-release hypothesis.
- Message and offer: `Bring us the accounts your team cannot crack.` Offer a selective intro-strategy review for companies with named-account urgency, a clear internal owner, and willingness to work inside a controlled warm-intro process.
- Activation path: Client landing or referral traffic -> strategy-request form with buyer role, named-account count, blocker, urgency, referral source, and disqualifiers -> owner claimed in admin queue -> founder strategy call or disqualification -> Client Prospect or company setup.
- Metric: primary metric is qualified Client strategy requests that pass manual review. Quality metrics are form-completion rate, named-account seriousness rate, verified-company-domain rate, strategy-request-to-call rate, and submissions with owner plus next action assigned inside one business day.
- Trust and brand risk: if the Client page still behaves like a generic contact form with cross-traffic to Bum recruiting and no visible seriousness logic, buyers will read the brand as interesting but operationally loose.
- Recommendation: keep the split landing pages, but turn the Client form into a strategy-request workflow. Add structured seriousness fields, keep the Bum CTA secondary on the Client page, wire `admin_owner_id` and `admin_next_action` into the admin queue, and require a qualification status before any escalation into targets. Use `docs/client-buyer-intake-strategy.md` as the execution strategy.
- Acceptance criteria: the Client landing keeps a clearly primary buyer CTA; Client intake captures buyer role, urgency, blocker, and target-account context; the admin queue exposes owner, next action, and qualification state; and Product Ops can distinguish qualified strategy requests from general inquiries before escalation.

### P0 - [TB-0035] Build a claim-safe proof spine before scaling demand
- Growth goal: proof, qualified Client acquisition, referral conversion, and sales enablement.
- Audience: Client buyers, investor or advisor referral sources, and high-quality Bum candidates evaluating marketplace seriousness.
- Channel: founder-led sales, one-pagers, referral asks, LinkedIn organic, manual follow-up.
- Evidence: `docs/trusted-bums-operating-model.md` and `src/pages/Index.tsx` support the hard-account-access thesis and the line that the name is playful but the access motion is serious. `docs/marketing-graphics-campaign-backlog.md` already points creative in an executive proof-room direction. But `docs/brand-strategy.md` is still missing, and the repo still has no approved claims matrix, founder script source, case-study permissions, or reusable proof narrative.
- Message and offer: `One credible route can change the odds on a company-defining account.` Explain the hard-account problem, the controlled warm-intro workflow, and the seriousness of the process without drifting into unsupported outcomes.
- Activation path: founder, advisor, and operator conversations reuse one proof spine -> qualified prospect requests strategy review -> founder call -> next-step decision.
- Metric: primary metric is strategy-call conversion after proof use. Quality metric is reduced trust objections without any unapproved claims or proof leakage.
- Trust and brand risk: without claim discipline, the brand can overpromise fast and create legal, trust, and reputation risk before growth compounds.
- Recommendation: produce one reusable proof spine with three variants: Client acquisition, investor/advisor referral ask, and Bum recruiting. Pair it with a public/private/do-not-say checklist before scaling any campaign asset or founder script.
- Acceptance criteria: one reusable proof narrative exists; approved, private, and forbidden proof categories are explicit; founder, Content, and sales use the same story; and public proof stays inside approved boundaries.

### P1 - [TB-0036] Make investor, advisor, and operator referrals the primary Client-demand motion
- Growth goal: qualified Client acquisition.
- Audience: investors, advisors, operators, and insiders who know companies blocked on named-account access.
- Channel: referral-led, founder-led direct asks, email, LinkedIn DM.
- Evidence: the operating model is structurally better suited to warm third-party introductions than to broad cold top-of-funnel motion. The repo still lacks a referral ask pack, screening rubric, and approved referral-disclosure language, so this motion should stay narrow and human-led instead of programmatic.
- Message and offer: `Who do you know that has a short list of accounts that matter and no credible way in?`
- Activation path: referral ask -> referred company intro -> Client strategy intake -> founder qualification -> company onboarding only if named-account seriousness is clear.
- Metric: primary metric is qualified referred companies per source. Quality metric is referral-to-call rate and pass-through to approved Client demand.
- Trust and brand risk: broad `send us anyone` language or vague referral economics will make the brand feel promotional instead of selective.
- Recommendation: build one short referral ask, one screening rubric, and one founder follow-up script. Keep compensated-referral language out of circulation until the legal-safe boundary is approved.
- Acceptance criteria: referral ask pack exists; it names ideal company shape and disqualifiers; and referral-compensation language is either approved or intentionally excluded.

### P1 - [TB-0037] Run founder-led LinkedIn around hard-account access and trust validation
- Growth goal: qualified Client acquisition and referral.
- Audience: founders, GTM leaders, investors, advisors, and operators who influence strategic-account access decisions.
- Channel: founder LinkedIn organic.
- Evidence: LinkedIn still recommends focused creative, clear CTA, disciplined targeting, and multiple ads per campaign before scaling paid distribution, while LinkedIn B2B Institute still argues that most category buyers are out-market today. Gartner reported on March 9, 2026 that 67% of B2B buyers prefer a rep-free experience, and on May 19, 2026 highlighted that 69% still turn to sales reps to validate AI-generated insights. That combination fits a founder-led narrative that is self-serve first and human-proofed at the point of trust.
- Message and offer: three recurring themes: why cold fails in guarded accounts, why buyer trust changes response quality, and why one credible route beats more sales activity on strategic accounts.
- Activation path: founder post -> profile visit, comment, DM, or referral reply -> Client strategy intake or referral conversation -> manual qualification.
- Metric: primary metric is qualified inbound conversations per post. Quality metric is the share that matches Client ICP or credible referral-source ICP.
- Trust and brand risk: meme-heavy tone, generic hustle language, or weak CTA discipline will make a high-trust B2B brand look sloppy.
- Recommendation: draft a three-post founder sequence, one comment-to-DM follow-up, and explicit rules for when to route someone to intake versus when to pause or disqualify.
- Acceptance criteria: three founder posts, one follow-up script, CTA rules, and disqualifier rules are documented; Graphics has one approved overlay-ready plate if needed; and Trust confirms no risky automation is required.

### P1 - [TB-0038] Keep Bum recruiting invite-only and referral-scored
- Growth goal: qualified Bum acquisition.
- Audience: existing Bums, trusted operators, former executives, investors, advisors, and senior sellers with credible buyer access.
- Channel: founder-led referral asks, direct email, LinkedIn DMs, selective operator communities.
- Evidence: `src/App.tsx` and the Bum route set still show much richer activation depth than the buyer side. `src/pages/bum/BumDashboard.tsx`, `src/pages/bum/BumProspects.tsx`, `src/pages/bum/BumReverseOpportunities.tsx`, and `src/pages/bum/BumOpportunities.tsx` already push profile completion, client prospecting, customer-lead submission, and claims. `docs/content-copyeditor-backlog.md` also shows recruiting terminology is still drifting between `Bum Prospect`, `Become a Bum`, and generic `Prospects`, which is another reason not to scale this publicly yet.
- Message and offer: `We are looking for a small number of credible operators who can open real doors.`
- Activation path: referral or direct intro -> screening -> approval review -> profile completion -> first meaningful action such as Claim, Customer Lead, or Client Prospect submission.
- Metric: primary metric is approved Bum candidates per source. Quality metric is approved-to-activated rate by source.
- Trust and brand risk: open recruiting or `monetize your network` framing will damage trust and flood the marketplace with weak-fit supply.
- Recommendation: keep Bum recruiting closed-loop. Build the referral ask, screening rubric, and activation handoff before any broader recruiting surface or paid experiment.
- Acceptance criteria: referral ask, screening rubric, and activation workflow are documented; passive-income framing is explicitly excluded; and Product Ops can process new Bum candidates consistently.

### P1 - [TB-0039] Build manual nurture and objection logging before any lifecycle automation
- Growth goal: marketplace activation and sales enablement.
- Audience: qualified Client prospects who engage but do not book or convert immediately.
- Channel: manual email follow-up, founder follow-up, one-pager.
- Evidence: the public flow can capture contact data today, but no approved nurture sequence, objection sheet, one-pager, or founder follow-up pack exists in the repo. `docs/trust-reputation-backlog.md` still treats public email flows as trust-sensitive, and current Google sender guidance plus the ICO’s updated 2026 electronic-mail guidance both favor disciplined, permission-aware sends over premature automation.
- Message and offer: answer four questions in sequence: why cold fails here, how Trusted Bums controls claims and access, what proof can be shared safely, and what the next operating step looks like.
- Activation path: qualified contact -> manual review -> one-pager plus short founder follow-up -> strategy call or paused nurture with explicit stop conditions.
- Metric: primary metric is qualified contact-to-call conversion. Quality metric is objection-resolution rate with no sender-risk or spam-signal regression.
- Trust and brand risk: lifecycle automation before proof, suppression, and instrumentation are ready can create domain and deliverability risk.
- Recommendation: build one short manual nurture sequence and one one-pager before any automation or broader lifecycle tooling. Track source, objections, and disposition manually if no CRM exists yet.
- Acceptance criteria: the sequence has send triggers, CTA, stop conditions, and objection themes; Data/Analytics defines minimum tracking fields; and Trust confirms the send pattern remains low-risk.

## ICP And Offer Matrix

| Segment | Triggers | Disqualifiers | Value proposition | Proof | First CTA | Follow-up path |
| --- | --- | --- | --- | --- | --- | --- |
| Founder-led Seed to Series A or lean growth-stage company | Named accounts blocked in cold channels; founder or GTM leader directly involved; one account materially affects growth | Wants broad lead volume; no named accounts; no internal owner; unclear commercial stakes | Trusted, selective access into hard accounts through structured warm-intro workflows | Hard-account narrative, workflow control, seriousness screening | Request intro strategy | Manual review -> founder call -> Client Prospect or company setup |
| VP Sales or CRO at a lean revenue team | Team knows targets but lacks a credible route in; prefers controlled introductions over activity volume | Wants outsourced SDR volume; no account specificity; unclear deal stakes | A more credible access motion for strategic accounts | Buyer-risk narrative plus controlled process | Request intro strategy | Strategy call -> account scoping -> agreement and first target submission |
| Investor, advisor, or operator referral source | Knows a company with one or two strategic-account blockages | Broad low-fit referral list; weak urgency; no warm context | Trusted Bums helps the right company crack a few critical doors | Proof spine plus founder ask | Refer a company | Founder follow-up -> qualification |
| Former executive or senior operator Bum candidate | Deep buyer trust in specific sectors; willing to operate inside review and payout rules | Generic networking interest; weak proof of access; passive-income framing | Structured way to convert trust capital into controlled commercial outcomes | Selective recruiting narrative plus portal workflow depth | Refer or apply by invitation | Screening -> approval -> profile completion -> first action |
| Current Bum or advisor referring another Bum | Knows a credible operator with real buyer access | Candidate lacks relevance, conduct fit, or responsiveness | Marketplace expansion through trusted referral trees | Selective recruiting narrative | Refer a Bum | Screening -> approve or decline |

## Funnel Map

### Bum funnel

- Source: founder network, current Bums, client referrals, investor or advisor referrals, selective operator outreach.
- Conversion points: referral received -> Bum candidate submitted -> screening completed -> approved -> profile completed -> first Claim, Customer Lead, or Client Prospect action.
- Activation definition: approved Bum completes profile and takes one meaningful marketplace action.
- Retention signals: repeated Claim activity, accepted work, Customer Lead submissions, profile freshness, and payout trust.
- Drop-off questions: which referral sources produce approved Bums, and where do candidates stall: screening, legal, profile completion, or first action?

### Client funnel

- Source: founder network, investor or advisor referrals, founder LinkedIn, homepage CTA, and only later paid once routing, proof, and tracking are stronger.
- Conversion points: visitor or referred prospect -> Client strategy request -> manual qualification -> founder strategy call -> Client Prospect or company setup -> Client Agreement accepted -> first target account submitted -> first intro request or accepted Claim.
- Activation definition: company is approved, the current agreement is accepted, and at least one target-account workflow is live.
- Retention signals: additional target accounts, repeated intro requests, accepted Claims, Customer Payment Report activity, and finance clarity.
- Drop-off questions: how many public inquiries are true Client ICPs, which objections block calls, and how many qualified calls reach agreement and first target-account submission?

## Experiment Queue

1. Hypothesis: a dedicated Client intake branch with inline recovery will increase qualified strategy requests and reduce low-intent submissions.
- Audience: founder-led companies and GTM leaders with named-account demand.
- Channel: website and founder or referral traffic.
- Asset needs: Client-specific copy, qualification fields, inline validation, reassurance note, source tagging, ops handoff.
- Measurement: qualified submission rate, completion rate, strategy-call rate, and low-fit submission rate.
- Owner: Growth + UX/UI + Product Ops.
- Stop or scale criteria: scale only if qualified rate rises without increasing trust risk or manual-review burden.

2. Hypothesis: a claim-safe proof spine and one-pager will improve Client call conversion more than generic positioning alone.
- Audience: qualified Client prospects and referral sources.
- Channel: founder follow-up, one-pager, sales calls.
- Asset needs: proof narrative, claims checklist, one-pager.
- Measurement: strategy-call booking rate and objection mix.
- Owner: Founder + Content + Legal/Finance owner.
- Stop or scale criteria: stop if proof language creates claim risk or confusion; scale if it consistently reduces trust objections.

3. Hypothesis: founder posts focused on hard-account access will generate more qualified inbound than general brand posts.
- Audience: founders, revenue leaders, investors, advisors.
- Channel: LinkedIn organic.
- Asset needs: three posts, one DM follow-up script, one optional visual treatment.
- Measurement: qualified inbound conversations per post.
- Owner: Founder + Content + Graphics.
- Stop or scale criteria: stop if replies skew low-fit; scale if repeated high-fit conversations emerge.

4. Hypothesis: investor, advisor, and operator referrals will outperform broad outbound for early Client demand.
- Audience: existing warm-network sources with company visibility.
- Channel: referral ask, direct email, direct DM.
- Asset needs: referral ask, screening rubric, founder follow-up script.
- Measurement: qualified referred companies per source and referral-to-call rate.
- Owner: Founder + Growth.
- Stop or scale criteria: stop sources that generate weak-fit volume; scale sources that repeatedly produce qualified named-account conversations.

5. Hypothesis: invite-only Bum referrals will produce better approved-to-activated quality than any broader recruiting ask.
- Audience: current Bums, trusted operators, investor or advisor network.
- Channel: referral email, DM, direct ask.
- Asset needs: recruiting ask, screening rubric, activation notes.
- Measurement: approved Bum rate and activated Bum rate by source.
- Owner: Growth + Product Ops.
- Stop or scale criteria: stop sources that generate weak-fit volume; scale sources that consistently produce approved operators.

6. Hypothesis: manual nurture plus objection logging will improve qualified contact-to-call conversion without sender-risk regression.
- Audience: qualified Client prospects who do not schedule immediately.
- Channel: manual email follow-up.
- Asset needs: one-pager, short sequence, objection FAQ, tracking sheet or CRM fields.
- Measurement: call-booking rate, objection-resolution rate, and sender-risk signals.
- Owner: Founder + Content + Data/Analytics.
- Stop or scale criteria: scale only if conversion improves with no trust or deliverability downside.

## Sales And Recruiting Enablement

- Client one-pager needed: hard-account problem, how trusted routes work, what selectivity means, workflow controls, and what Trusted Bums is not.
- Bum recruiting one-pager needed: who should be referred, expected conduct, why selectivity matters, and what activation looks like.
- Founder talk tracks needed: one for Client demand, one for investor/advisor referrals, and one for Bum recruiting.
- Objection handling needed: `Is this just lead gen?`, `How do you control claims and access?`, `How selective are Bums?`, `What proof can you actually share?`, and `How are commissions and payouts governed?`
- Referral asks needed: one investor/advisor ask for Client referrals and one operator-network ask for Bum referrals.
- Legal and finance review needed: proof language, commission language, payout language, referral-compensation disclosure, and any outcome-adjacent claim.

## Measurement Plan

- North-star metric: active qualified liquidity = active Client companies with live target-account demand plus activated approved Bums with current credible access.
- Input metrics: qualified Client strategy requests, qualified referred companies, qualified Bum referrals, approved Bum candidates, founder strategy calls, Client Agreements accepted, first target accounts submitted, and first Claims or intro requests submitted.
- Quality metrics: qualified-to-approved rate by source, approved-to-activated Bum rate, strategy-request-to-call rate, named-account seriousness rate, verified-company-domain rate, and low-fit or spammy intake rate.
- Source tracking: capture source, campaign, referring person, segment, manual qualification outcome, objection category, and next-step disposition for every Client prospect and Bum candidate.
- Attribution limits: this session still had no CRM, analytics, or campaign data, so measurement should start with simple source-of-truth logging before any multi-touch model.
- Reporting needs: weekly liquidity review covering Client demand, Bum supply, activation, source quality, and trust-risk signals.
- Data gaps: missing CRM pipeline data, website analytics, LinkedIn analytics, email performance, interview evidence, approved proof boundaries, and budget constraints still limit prioritization confidence.

## Current Standards And Time-Sensitive Notes

- LinkedIn’s current Lead Gen Forms guidance still positions pre-filled forms as a low-friction B2B capture tool and recommends `3-4` fields as best practice, with up to `3` custom questions. If Trusted Bums tests paid capture later, the form should stay short and use custom questions only for seriousness signals such as blocker, urgency, or target-account count. Sources: [LinkedIn Lead Gen Forms specs](https://business.linkedin.com/marketing-solutions/success/ads-guide/lead-gen-forms?ss=1), [LinkedIn Lead Gen Forms overview](https://business.linkedin.com/marketing-solutions/native-advertising/lead-gen-ads).
- LinkedIn’s Sponsored Content guidance still favors clear CTA discipline, concise copy, and deliberate testing before scaling. Trusted Bums should keep any paid pilot tightly scoped and proof-safe instead of launching broad creative volume. Source: [LinkedIn Sponsored Content tips](https://business.linkedin.com/marketing-solutions/best-practices/ad-tips/sponsored-content-tips).
- LinkedIn B2B Institute still argues that 95% of category buyers are out-market today. That supports memory-building and founder credibility work before heavier demand-capture spend. Source: [LinkedIn 95-5 rule](https://business.linkedin.com/marketing-solutions/b2b-institute/b2b-research/trends/95-5-rule/).
- Gartner reported on March 9, 2026 that 67% of B2B buyers prefer a rep-free experience, and on May 19, 2026 highlighted that 69% still turn to sales reps to validate AI-generated insights. Trusted Bums should therefore keep the first interaction self-directed and low-friction, but make the follow-up human and trust-rich. Sources: [Gartner rep-free experience](https://www.gartner.com/en/newsroom/press-releases/2026-03-09-gartner-sales-survey-finds-67-percent-of-b2b-buyers-prefer-a-rep-free-experience), [Gartner day-1 highlights](https://www.gartner.com/en/newsroom/press-releases/2026-05-19-gartner-cso-and-sales-leader-conference-day-1-highlights).
- Google’s sender guidance still requires authentication, low spam rates, accurate sender identity, and easy unsubscribe behavior for bulk mail. Trusted Bums should keep nurture and referral email low-volume and high-intent until sender controls and instrumentation are stronger. Sources: [Google sender guidelines](https://support.google.com/a/answer/81126?hl=en-na), [Google sender guidelines FAQ](https://support.google.com/a/answer/14229414?hl=en-EN).
- The ICO updated its electronic-mail direct-marketing guidance on April 28, 2026. If Trusted Bums targets UK contacts, permission basis, suppression hygiene, and list-source discipline matter even more. Bought lists and loosely permissioned nurture should stay out of scope. Source: [ICO guidance on direct marketing using electronic mail](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/).
- FTC endorsement guidance still requires clear disclosure of material connections. Trusted Bums should keep any compensated referral or advisor endorsement language explicit if that motion ever ships publicly. Source: [FTC endorsement guides FAQ](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides).

## Access Requests And Evidence Gaps

- `docs/brand-strategy.md` is still missing, so positioning, proof hierarchy, and voice decisions remain inferred rather than confirmed from a dedicated source of truth.
- CRM and pipeline visibility for Client prospects and Bum candidates is still missing: source, owner, stage, qualification status, disqualification reason, and conversion timing.
- Website analytics, source tracking, LinkedIn organic analytics, LinkedIn paid performance, email performance, and referral-source tracking are still missing.
- No approved case-study permissions, proof-claim boundaries, founder scripts, sales collateral, objection notes, or legal-safe commission, payout, and referral-disclosure language were available in this run.
- No customer interviews, Bum interviews, call notes, or channel budget constraints were available in this run.
- Mirror durable GTM evidence requests in `docs/consultant-access-needs.md`.

## Agent Inputs

- Date of run: 2026-06-08.
- Files, routes, screenshots, and commands reviewed: `docs/agents/automation-prompts/trusted-bums-daily-b2b-growth-marketer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/codex-edit-log.md`, `docs/trusted-bums-operating-model.md`, `docs/content-copyeditor-backlog.md`, `docs/marketing-graphics-campaign-backlog.md`, `docs/trust-reputation-backlog.md`, `docs/product-ops-workflow-backlog.md`, `docs/data-analytics-backlog.md`, prior `docs/b2b-marketing-growth-backlog.md`, `docs/client-buyer-intake-strategy.md`, `src/App.tsx`, `src/pages/Index.tsx`, `src/pages/BumLanding.tsx`, `src/components/SignupIntentDialog.tsx`, `src/lib/contactApi.ts`, `src/components/admin/ContactSubmissionsPanel.tsx`, `git status --short`, `git log --since='2026-06-07 00:00' --name-only --pretty=format:'COMMIT %h %cs %s' -- docs src`, `git log --oneline -n 8 --decorate`, `git rev-parse --short HEAD`, targeted `rg`, `sed`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 12 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --workflow "Visual UI Audit" --limit 8 --json ...`, `curl -I -L --max-time 20 https://trustedbums.com`, `curl -sL --max-time 20 https://trustedbums.com`, `curl -I -L --max-time 20 https://trustedbums.com/become-a-bum`, and `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`.
- Internet sources reviewed: LinkedIn Lead Gen Forms specs, LinkedIn Lead Gen Forms overview, LinkedIn Sponsored Content tips, LinkedIn 95-5 rule, Gartner’s March 9, 2026 rep-free buying press release, Gartner’s May 19, 2026 sales-conference highlights, Google sender guidance, ICO electronic-mail guidance updated April 28, 2026, and FTC endorsement guidance FAQ.
- Checks that could not run and why: `docs/brand-strategy.md` is still absent; no CRM, analytics, LinkedIn account analytics, email platform, approved claims matrix, interview archive, case-study approval source, or channel budget source was available in repo or connected tools; current-head `Visual UI Audit` evidence for `9f42bf4` was not available in GitHub workflow history yet. No local preview was started because this run was documentation-focused and local testing is reserved for port `8080` only; `https://rcdl.tplinkdns.com` still failed TLS verification from this runner.
