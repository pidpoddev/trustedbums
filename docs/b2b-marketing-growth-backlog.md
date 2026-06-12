# Trusted Bums B2B Marketing Growth Backlog

_Last updated: 2026-06-12 by Codex daily B2B growth marketer automation._

## Executive Growth Thesis

Current `main` head `d360570` is deployed on the primary host. GitHub `QA` run `27371736190`, DreamHost deploy run `27371736211`, and hosted `E2E Smoke` run `27371773276` all succeeded on 2026-06-11 UTC. The latest exact-head standard `Visual UI Audit` run `27395701277` failed, but current release and harness backlogs classify that run as the known `TB-0092` false positive caused by the audit treating legitimate `404` text inside `/admin/scrum` as a broken page. Fresh runner checks still show `https://trustedbums.com` returning `HTTP/2 200`, the homepage metadata `Warm introduction strategy for hard-to-reach target accounts.`, and the `/bums` redirect plus deployed Bum metadata working on the live host.

The marketplace constraint is still Client demand, not Bum supply. Product readiness on the Client side improved again between `349bbe0` and exact head `d360570`: the Client workspace now centers on Opportunities, Bum responses, Bum-originated opportunities, and Inbox-style follow-up rather than older fragmented request pages. That means growth no longer needs to wait on basic post-intake workflow credibility before pushing warm demand. The sharper gap is the operating system around that product: explicit referral asks, founder follow-up assets, objection handling, source tracking, and consistent public CTA language.

The remaining growth risk is still funnel clarity plus weak GTM evidence, not missing public or portal surfaces. Exact-head source on `/` still uses three labels for the same client-only signup path: `Sign up`, `Create Client account`, and `Client signup`. The Bum recruiting path still drifts between `Apply as a Bum` and `Bum Prospect`. The mobile Bum-header clipping and oversized first-layer consent evidence remain historical or source-backed rather than freshly exact-head screenshot-backed because the last hosted public screenshots were captured on `349bbe0`, not `d360570`, and the standard exact-head visual path is currently blocked by `TB-0092`. Growth should therefore keep Client acquisition pointed at `Request strategy review`, keep Bum recruiting invite-only, and avoid scaling paid or lifecycle motion until CTA language, CRM truth, live analytics access, and brand source material are stronger.

## North Star And Guardrails

- Primary growth goal: increase active qualified liquidity, meaning more approved Client companies with live named-account demand and more activated approved Bums with credible access.
- Quality guardrail: do not optimize for raw signups, clicks, impressions, or booked calls if named-account seriousness, approval quality, or approved-to-activated rates weaken.
- Trust guardrail: Trusted Bums must read as a controlled B2B marketplace, not a generic lead-gen shop, affiliate loop, scraped-list engine, or passive-income scheme.
- Legal and claims guardrail: no guaranteed meetings, guaranteed revenue, customer-logo claims, referral-compensation promises, or implied endorsements outside approved boundaries.
- Marketplace guardrail: more Clients matter only when they bring real hard-account demand; more Bums matter only when they add credible relationship access and operate inside reviewed workflows.
- Channel guardrail: keep outbound email, DMs, referral asks, and paid pilots low-volume and human-reviewed until tracking, suppression, objection logging, and claims discipline are stronger.
- Runner constraint: use port `8080` only for local testing. When external DNS context is needed, use `https://rcdl.tplinkdns.com` and treat runner-side failures as partial evidence, not full production truth.

## Active Growth Plays

### P1 - [TB-0036] Make investor, advisor, and operator referrals the primary Client-demand motion
- Growth goal: qualified Client acquisition.
- Audience: investors, advisors, operators, founders, and insiders who know companies blocked on named-account access.
- Channel: referral-led, founder-led direct asks, email, and LinkedIn DM.
- Evidence: `docs/client-buyer-intake-strategy.md` still defines the seriousness screen, `docs/claim-safe-proof-spine.md` still provides the safest reusable proof boundary, and exact head `d360570` is deployed with green hosted QA, deploy, and E2E evidence. Exact-head source now makes the post-intake story more credible than it was on `23edb24`: `src/pages/client/ClientDashboard.tsx` drives the Client role into live opportunities, draft publishing, Bum responses, Bum-originated opportunities, and payment follow-up, while `src/pages/client/ClientLiveConversations.tsx` gives the client one Inbox for Bum replies and opportunity questions. The public weak spot is still the top-of-funnel label drift on `/`, so warm referrals should land on `Request strategy review` or a founder reply, not on the generic header `Sign up` path.
- Message and offer: `Who do you know that has one or two accounts that matter and no credible way in?`
- Activation path: referral ask -> referred company submits `Request strategy review` or replies directly to founder -> founder qualification -> Client Agreement review -> first opportunity or target-account workflow.
- Metric: primary metric is qualified referred companies per source. Quality metrics are referral-to-call rate, qualified-to-approved rate, and first opportunity or first target-account creation rate by source.
- Trust and brand risk: broad `send us anyone` language, vague referral economics, or routing referred buyers into ambiguous signup labels will make the brand feel promotional instead of selective.
- Recommendation: build one referral ask pack with three parts: a short investor or advisor ask, a screening rubric for who qualifies, and a founder reply script that routes the company into `Request strategy review` or disqualifies it quickly. Keep compensated-referral language out until Legal approves an explicit disclosure boundary.
- Acceptance criteria: one referral ask pack exists; it names target company shape, disqualifiers, and next step; it points to `Request strategy review` rather than generic signup copy; and referral-compensation language is either approved explicitly or excluded intentionally.

### P1 - [TB-0037] Run founder-led LinkedIn around hard-account access and trust validation
- Growth goal: qualified Client acquisition and referral.
- Audience: founders, GTM leaders, investors, advisors, operators, and strategic-account sellers.
- Channel: founder LinkedIn organic first, tightly scoped LinkedIn paid only after message proof and tracking exist.
- Evidence: exact-head public source still supports a serious buyer narrative. `src/pages/Index.tsx` keeps the hero promise on hard-to-reach decision makers, preserves the primary CTA `Request an intro strategy`, and keeps the contact form centered on named accounts, blockers, urgency, and commercial reason. Exact-head GitHub runs kept QA, deploy, and E2E green on `d360570`. LinkedIn’s current Help and Marketing Solutions docs still allow up to 12 informational fields and up to 3 custom questions on Lead Gen Forms, while LinkedIn’s own guidance still positions hidden fields as the safer place for tracking context. LinkedIn B2B Institute still argues that 95% of category buyers are out-market. Gartner reported on 2026-03-09 that 67% of B2B buyers prefer a rep-free experience, then reported on 2026-05-20 that 69% still turn to sales reps to validate AI-generated insights. That combination still fits a founder-led motion: low-friction demand capture first, then human proof at the trust step.
- Message and offer: three recurring themes should drive the sequence: why cold fails in guarded accounts, why trust changes response quality, and why one credible route beats more generic outbound on strategic accounts.
- Activation path: founder post -> profile visit, comment, DM, or referred conversation -> `Request strategy review` or founder conversation -> manual qualification.
- Metric: primary metric is qualified inbound conversations per post. Quality metrics are fit rate by ICP, strategy-review submissions attributable to posts, and referral-quality conversations created from comments or DMs.
- Trust and brand risk: meme-heavy tone, hustle framing, over-detailed lead-gen forms, or routing LinkedIn traffic into unclear CTA labels will make the brand look conversion-hungry instead of selective.
- Recommendation: draft a three-post founder sequence, one comment-to-DM follow-up, and one optional LinkedIn paid pilot spec. If a paid pilot runs, keep the form short, use hidden tracking fields plus one seriousness filter, and route qualified leads into the richer founder-review flow instead of cloning the full website intake.
- Acceptance criteria: three founder posts exist; one DM follow-up script exists; the CTA routing rule is explicit; any paid pilot spec stays short-form and proof-safe; and external traffic is pointed to strategy review or an explicit client CTA rather than generic signup language.

### P1 - [TB-0038] Keep Bum recruiting invite-only and referral-scored
- Growth goal: qualified Bum acquisition.
- Audience: existing Bums, trusted operators, former executives, investors, advisors, and senior sellers with credible buyer access.
- Channel: founder-led referral asks, direct email, LinkedIn DM, and selective operator communities.
- Evidence: the Bum path is already strong enough for selective recruiting, but not for scale. `src/pages/BumLanding.tsx` still explains the reviewed Bum path clearly, and the prior `349bbe0` client-side and Bum-side workflow deepening remains deployed under current head. Exact-head source still shows trust-eroding recruiting drift: `src/components/SignupIntentDialog.tsx`, `src/components/admin/ContactSubmissionsPanel.tsx`, and `src/lib/contactApi.ts` still use `Bum Prospect`, while the public route says `Apply as a Bum`. The mobile Bum-header clipping remains historical or source-backed from hosted exact-head screenshots on `349bbe0`, and current source still matches the same one-row header structure. That means the correct GTM stance is still closed-loop recruiting, not broader top-of-funnel volume.
- Message and offer: `We are looking for a small number of credible operators who can open real doors.`
- Activation path: referral or direct intro -> screening -> approval review -> profile completion -> first meaningful action such as saving a Client, adding a represented contact, submitting a Customer Lead, or claiming work.
- Metric: primary metric is approved Bum candidates per source. Quality metrics are approved-to-activated rate, time-to-first-meaningful-action, and source quality by accepted work later on.
- Trust and brand risk: open recruiting, marketplace hype, broken mobile CTA presentation, or `monetize your network` framing will damage trust and flood the marketplace with weak-fit supply.
- Recommendation: keep Bum recruiting closed-loop. Build one recruiting ask, one screening rubric, and one activation handoff that uses the deeper current Bum workflow as the proof point. Do not broaden the public recruiting motion until the recruiting noun is aligned, the mobile CTA presentation is fixed with fresh hosted proof, and Client demand is strong enough to support new supply.
- Acceptance criteria: the recruiting ask, screening rubric, and activation workflow are documented; passive-income framing is explicitly excluded; Product Ops can process a referred Bum consistently from review through first action; and the public recruiting path no longer depends on clipped mobile CTA presentation to convert.

### P1 - [TB-0039] Build manual nurture and objection logging before any lifecycle automation
- Growth goal: marketplace activation and sales enablement.
- Audience: qualified Client prospects who engage but do not book or convert immediately.
- Channel: manual email follow-up, founder follow-up, one-pager, and call recap.
- Evidence: exact-head public source still captures qualified contact data with seriousness fields, and exact-head Client source now has a cleaner post-intake operating path through opportunities plus Inbox. The exact-head Google Analytics component is also better than it was on `349bbe0`: `git show HEAD:src/components/GoogleAnalytics.tsx` now defaults analytics storage to denied and only grants it after analytics consent, which removes the stale blocker from the earlier analytics backlog. But growth still does not have live GA property access, CRM pipeline truth, email platform analytics, or objection logging in-session, so those stronger mechanics are not yet usable as evidence. Google’s current sender guidance still requires authentication and low spam rates, and the current FAQ says enforcement is ramping further in late 2025 and beyond for non-compliant traffic. The ICO’s current electronic-mail and B2B marketing guidance still reinforces consent basis, suppression hygiene, and disciplined list-source handling. That still makes premature lifecycle automation a reputation risk rather than a speed win.
- Message and offer: answer four questions in sequence: why cold fails here, how Trusted Bums controls claims and access, what proof can be shared safely, and what the next operating step looks like.
- Activation path: qualified strategy request -> manual review -> short founder follow-up plus one-pager -> strategy call or paused nurture with explicit stop conditions and objection logging.
- Metric: primary metric is qualified contact-to-call conversion. Quality metrics are objection-resolution rate, follow-up response rate, and no sender-risk regression.
- Trust and brand risk: automation before suppression, instrumentation, objection logging, and approved copy are ready can create domain and deliverability risk quickly.
- Recommendation: create one short manual nurture sequence, one objection log schema, and one claim-safe founder one-pager before any lifecycle automation or higher-volume outbound. Start with manual source tracking and objection categories if no CRM is live yet.
- Acceptance criteria: the sequence has send triggers, CTA, stop conditions, and objection themes; Data and Analytics defines minimum tracking fields; Trust confirms the send pattern remains low-risk; and the asset references the current proof spine instead of inventing new claims.

## ICP And Offer Matrix

| Segment | Triggers | Disqualifiers | Value proposition | Proof | First CTA | Follow-up path |
| --- | --- | --- | --- | --- | --- | --- |
| Founder-led Seed to Series A or lean growth-stage company | Named accounts blocked in cold channels; founder or GTM leader directly involved; one account materially affects growth | Wants broad lead volume; no named accounts; no internal owner; unclear commercial stakes | Trusted, selective access into hard accounts through structured warm-intro workflows | Client strategy-review flow, proof spine, and deployed Client opportunity workflow | Request strategy review | Manual review -> founder call -> agreement review -> first opportunity |
| VP Sales or CRO at a lean revenue team | Team knows targets but lacks a credible route in; prefers controlled introductions over activity volume | Wants outsourced SDR volume; no account specificity; unclear deal stakes | A more credible access motion for strategic accounts | Buyer-risk narrative plus current opportunity and Inbox workflow | Request strategy review | Founder call -> account scoping -> first published opportunity |
| Investor, advisor, or operator referral source | Knows a company with one or two strategic-account blockages | Broad low-fit referral list; weak urgency; no warm context | Trusted Bums helps the right company crack a few critical doors | Proof spine referral variant plus serious intake workflow | Refer a company | Founder follow-up -> qualification |
| Former executive or senior operator Bum candidate | Deep buyer trust in specific sectors; willing to operate inside review and payout rules | Generic networking interest; weak proof of access; passive-income framing | Structured way to convert trust capital into controlled commercial outcomes | Selective recruiting narrative plus existing Bum workflow depth | Refer or apply by invitation | Screening -> approval -> profile completion -> first action |
| Current Bum or advisor referring another Bum | Knows a credible operator with real buyer access | Candidate lacks relevance, conduct fit, or responsiveness | Marketplace expansion through trusted referral trees | Selective recruiting narrative | Refer a Bum | Screening -> approve or decline |

## Funnel Map

### Client funnel

- Source: founder network, investor or advisor referrals, founder LinkedIn, homepage CTA, and only later paid once tracking and proof are stronger.
- Conversion points: visitor or referred prospect -> Client strategy request -> manual qualification -> founder strategy call -> Client Agreement review -> first opportunity or target-account workflow -> first Bum response, Claim, or intro activity.
- Activation definition: company is approved, the current agreement is accepted, and at least one opportunity, target-account, or Bum-originated opportunity workflow is live.
- Retention signals: additional opportunities, repeated Bum responses, accepted Claims, Customer Payment Report activity, Inbox follow-up continuity, and finance clarity.
- Drop-off questions: which sources create the highest rate of qualified strategy requests, which objections block calls, and how many qualified calls reach agreement review and first opportunity creation?

### Bum funnel

- Source: founder network, current Bums, client referrals, investor or advisor referrals, and selective operator outreach.
- Conversion points: referral received -> Bum candidate submitted -> screening completed -> approved -> profile completed -> first saved Client, represented contact, Claim, or Customer Lead action.
- Activation definition: approved Bum completes profile and takes one meaningful marketplace action.
- Retention signals: repeated Claim activity, accepted work, Customer Lead submissions, client browsing or save activity, contact freshness, and payout trust.
- Drop-off questions: which referral sources produce approved Bums, where candidates stall, and whether the public `/bums` recruiting-language drift or still-unrechecked mobile header presentation is depressing high-quality applications before review?

## Experiment Queue

1. Hypothesis: investor, advisor, and operator referrals will outperform any early outbound motion for Client demand.
- Audience: existing warm-network sources with company visibility.
- Channel: referral ask, direct email, direct DM.
- Asset needs: referral ask pack, screening rubric, founder follow-up script.
- Measurement: qualified referred companies per source, referral-to-call rate, and first opportunity rate.
- Owner: Founder + Growth.
- Stop or scale criteria: stop sources that generate weak-fit volume; scale sources that repeatedly produce qualified named-account conversations.

2. Hypothesis: founder posts focused on hard-account access will generate more qualified inbound than generic brand posts.
- Audience: founders, revenue leaders, investors, advisors, operators.
- Channel: LinkedIn organic.
- Asset needs: three posts, one DM follow-up script, one optional visual treatment.
- Measurement: qualified inbound conversations per post and strategy-review submissions attributable to the sequence.
- Owner: Founder + Content + Graphics.
- Stop or scale criteria: stop if replies skew low-fit; scale if repeated high-fit conversations emerge.

3. Hypothesis: a tightly scoped LinkedIn paid pilot using a short lead form will create qualified conversations without cloning the full site intake.
- Audience: founders and GTM leaders in the current ICP.
- Channel: LinkedIn paid.
- Asset needs: one creative, short form, hidden tracking fields, one seriousness question, and founder follow-up rule.
- Measurement: qualified lead rate, cost per qualified conversation, and low-fit rate.
- Owner: Founder + Growth + Data.
- Stop or scale criteria: stop if low-fit volume is high or form friction is too low-quality; scale only if qualification rate holds.

4. Hypothesis: invite-only Bum referrals will produce better approved-to-activated quality than any broader recruiting ask.
- Audience: current Bums, trusted operators, investor or advisor network.
- Channel: referral email, DM, direct ask.
- Asset needs: recruiting ask, screening rubric, activation notes.
- Measurement: approved Bum rate and activated Bum rate by source.
- Owner: Growth + Product Ops.
- Stop or scale criteria: stop sources that generate weak-fit volume; scale sources that consistently produce approved operators.

5. Hypothesis: manual nurture plus objection logging will improve qualified contact-to-call conversion without sender-risk regression.
- Audience: qualified Client prospects who do not schedule immediately.
- Channel: manual email follow-up.
- Asset needs: one-pager, short sequence, objection FAQ, tracking sheet or CRM fields.
- Measurement: call-booking rate, objection-resolution rate, and sender-risk signals.
- Owner: Founder + Content + Data.
- Stop or scale criteria: scale only if conversion improves with no trust or deliverability downside.

## Sales And Recruiting Enablement

- Client referral ask needed: one investor or advisor ask that points to the current strategy-review path and screens for named-account urgency.
- Founder LinkedIn kit needed: three posts, one DM follow-up, and one short-form paid pilot spec if paid is tested.
- Client one-pager needed: hard-account problem, how trusted routes work, what selectivity means, what happens after intake in the opportunity and Inbox workflow, and what Trusted Bums is not.
- Bum recruiting one-pager needed: who should be referred, expected conduct, why selectivity matters, and what activation looks like.
- Objection handling needed: `Is this just lead gen?`, `How do you control claims and access?`, `How selective are Bums?`, `What proof can you actually share?`, and `How are commissions and payouts governed?`
- Legal and finance review needed: proof language, commission language, payout language, referral-compensation disclosure, and any outcome-adjacent claim.

## Measurement Plan

- North-star metric: active qualified liquidity = active Client companies with live target-account or opportunity demand plus activated approved Bums with current credible access.
- Input metrics: qualified Client strategy requests, qualified referred companies, qualified Bum referrals, approved Bum candidates, founder strategy calls, Client Agreements reviewed or accepted, first opportunities created, and first Claims or Bum responses submitted.
- Quality metrics: qualified-to-approved rate by source, approved-to-activated Bum rate, strategy-request-to-call rate, named-account seriousness rate, verified-company-domain rate, and low-fit intake rate.
- Source tracking: capture source, campaign, referring person, segment, manual qualification outcome, objection category, and next-step disposition for every Client prospect and Bum candidate.
- Attribution limits: this run had live tracker access and current hosted run evidence, but it still had no CRM pipeline view, no live GA property access, no LinkedIn account analytics, no email performance data, and no interview evidence. Measurement should therefore stay manual and source-of-truth-driven before any multi-touch model or automation claim.
- Reporting needs: weekly liquidity review covering Client demand, Bum supply, activation, source quality, and trust-risk signals.
- Current data gaps: missing CRM pipeline data, GA property access and data-received proof, LinkedIn analytics, email performance, interview evidence, approved proof boundaries beyond the proof spine, and channel budget constraints still limit prioritization confidence.

## Current Standards And Time-Sensitive Notes

- LinkedIn Help and Marketing Solutions still allow up to 12 informational fields and up to 3 custom questions on Lead Gen Forms, and LinkedIn still supports hidden fields for attribution context. Trusted Bums should therefore keep any paid LinkedIn pilot short and push richer qualification back to the website or founder follow-up. Sources: [LinkedIn Lead Gen Forms](https://www.linkedin.com/help/lms/answer/a423447), [LinkedIn Lead Gen Form fields](https://www.linkedin.com/help/lms/answer/a425337), [LinkedIn Lead Gen form specifications](https://www.linkedin.com/help/lms/answer/a423364), [LinkedIn hidden fields](https://www.linkedin.com/help/lms/answer/a421421).
- LinkedIn B2B Institute still argues that 95% of category buyers are out-market today. That supports founder credibility and memory-building work before heavier demand-capture spend. Source: [LinkedIn 95-5 rule](https://business.linkedin.com/advertise/resources/b2b-institute/b2b-research/trends/95-5-rule).
- Gartner reported on 2026-03-09 that 67% of B2B buyers prefer a rep-free experience, then reported on 2026-05-20 that 69% still turn to sales reps to validate AI-generated insights. Trusted Bums should keep the first interaction low-friction and self-directed, then make the follow-up human and trust-rich. Sources: [Gartner 67% rep-free press release](https://www.gartner.com/en/newsroom/press-releases/2026-03-09-gartner-sales-survey-finds-67-percent-of-b2b-buyers-prefer-a-rep-free-experience), [Gartner 69% validation press release](https://www.gartner.com/en/newsroom/press-releases/2026-05-20-gartner-survey-finds-sixty-nine-percent-of-b-two-b-buyers-turn-to-sales-reps-to-validate-ai-generated-insights).
- Google’s current sender guidance still requires SPF, DKIM, and DMARC plus low spam rates, and the current FAQ says Gmail enforcement continues ramping for non-compliant traffic. Trusted Bums should keep nurture and referral email low-volume, high-intent, and easy to stop. Sources: [Google sender guidelines](https://support.google.com/a/answer/81126?hl=en), [Google sender guidelines FAQ](https://support.google.com/a/answer/14229414?hl=en-GB).
- The ICO’s current business-to-business marketing and electronic-mail guidance still reinforces consent basis, suppression hygiene, and disciplined list-source handling. If Trusted Bums targets UK contacts, bought lists and loosely permissioned nurture should stay out of scope. Sources: [ICO business-to-business marketing](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/), [ICO electronic mail guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/).
- The FTC still requires clear disclosure of material connections in endorsements. Trusted Bums should keep any compensated referral or advisor endorsement language explicit if that motion ever ships publicly. Sources: [FTC endorsement FAQ](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking), [FTC disclosures for social media influencers](https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers).

## Access Requests And Evidence Gaps

- `docs/brand-strategy.md` is still missing, so positioning, proof hierarchy, audience priorities, and voice decisions remain inferred rather than confirmed from a dedicated source of truth.
- CRM and pipeline visibility for Client prospects and Bum candidates is still missing: source, owner, stage, qualification status, disqualification reason, and conversion timing.
- Live website analytics evidence is still missing. Exact-head source now ships a consent-gated Google Analytics path, but this run still had no property access or aggregate report proving live production collection.
- LinkedIn organic analytics, LinkedIn paid performance, email performance, and referral-source tracking are still missing.
- No approved case-study permissions, founder scripts beyond the proof spine, objection notes, or legal-safe referral-disclosure language were available in this run.
- No customer interviews, Bum interviews, call notes, or channel budget constraints were available in this run.
- Fresh exact-head public screenshot evidence for the mobile Bum CTA and mobile consent footprint is still missing because the latest exact-head standard visual run is blocked by `TB-0092`, and no exact-head replacement public visual artifact was available in this session. Those public-mobile findings therefore remain historical or source-backed, not freshly exact-head screenshot-backed.
- Mirror durable GTM evidence requests in `docs/consultant-access-needs.md`.

## Agent Inputs

- Date of run: 2026-06-12.
- Files, routes, and commands reviewed: `docs/agents/automation-prompts/trusted-bums-daily-b2b-growth-marketer.toml`, `docs/agents/consultant-team-rules.md`, `docs/agents/company-wide-rules.md`, `docs/agents/consultant-access-needs.md`, `docs/agents/business-access-rules.md`, `docs/codex-edit-log.md`, `docs/trusted-bums-operating-model.md`, `docs/content-copyeditor-backlog.md`, `docs/marketing-graphics-campaign-backlog.md`, `docs/trust-reputation-backlog.md`, `docs/product-ops-workflow-backlog.md`, `docs/data-analytics-backlog.md`, `docs/ux-optimization-backlog.md`, prior `docs/b2b-marketing-growth-backlog.md`, `docs/client-buyer-intake-strategy.md`, `docs/claim-safe-proof-spine.md`, `git status --short`, `git rev-parse --short HEAD`, `git log --oneline -5`, `git diff --stat 349bbe0..d360570 -- src docs public tests .github`, `git show --stat --summary --name-only d79f604`, `git show --stat --summary --name-only ea5a710`, `git show --stat --summary --name-only d360570`, `git show HEAD:src/pages/Index.tsx`, `git show HEAD:src/pages/client/ClientDashboard.tsx`, `git show HEAD:src/pages/client/ClientLiveConversations.tsx`, `git show HEAD:src/components/PortalGlobalSearch.tsx`, `git show HEAD:src/components/FirstLoginWalkthrough.tsx`, `git show HEAD:src/components/GoogleAnalytics.tsx`, `src/pages/BumLanding.tsx`, `src/components/SignupIntentDialog.tsx`, `src/components/admin/ContactSubmissionsPanel.tsx`, `src/lib/contactApi.ts`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 20 --json ...`, `curl -I -L --max-time 20 https://trustedbums.com`, `curl -sL --max-time 20 https://trustedbums.com`, `curl -I -L --max-time 20 https://trustedbums.com/bums`, `curl -sL --max-time 20 https://trustedbums.com/bums`, and `curl -I -L --max-time 20 https://rcdl.tplinkdns.com`.
- Live tracker inputs reviewed: Supabase SQL against `public.admin_scrum_items` for `TB-0036`, `TB-0037`, `TB-0038`, and `TB-0039`, including current descriptions and stale commit or run metadata before this refresh.
- Internet sources reviewed: LinkedIn Lead Gen Forms Help and hidden-fields docs, LinkedIn 95-5 rule, Gartner’s 2026-03-09 and 2026-05-20 B2B buyer behavior press releases, Google sender guidelines and FAQ, ICO business-to-business and electronic-mail guidance, and FTC endorsement guidance.
- Checks that could not run and why: `docs/brand-strategy.md` is still absent; no CRM, live GA property access path, LinkedIn account analytics, email platform analytics, approved case-study source, interview archive, or channel budget source was available in repo or connected tools; no local preview was started because this run was documentation-focused and local testing is reserved for port `8080` only; and `https://rcdl.tplinkdns.com` still failed TLS verification from this runner.
