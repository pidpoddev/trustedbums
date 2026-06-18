# Trusted Bums Bum Supply Leader Backlog

_Last updated: 2026-06-18 by Codex._

## Executive Read

The Bum Supply Leader is the `Supply` ELT seat for Trusted Bums. Its job is to build opportunity-specific trusted relationship supply, not generic Bum recruiting volume. The immediate P0 is BlackCurrant: Ryan has identified roughly 80 opportunities that cannot move unless Trusted Bums finds Bums or trusted referrer paths credible enough for the relevant decision makers.

The first operating goal is a BlackCurrant top-10 relationship-supply sprint. Each priority account needs a desired relationship profile, decision-maker or champion hypothesis, candidate Bum/referrer path, classification, next action, owner, due date, and approval boundary.

## BlackCurrant Supply Map

Current setup status: first-pass supply map created from the existing BlackCurrant decision-maker research pilot and live Supabase roster checks. The full research run says BlackCurrant has 81 target accounts and 117 loaded Research Bot records, but this backlog currently has source-backed supply asks for the four pilot accounts with explicit opportunity IDs: Vantage Data Centers, QTS (see Blackstone), Crusoe, and CoreWeave (Oracle). Live checks found one actual CoreWeave opportunity-claim contact and several self-reported Bum profile keyword matches for the four pilot accounts. On 2026-06-18, Ryan relayed that Akshay found the CoreWeave test claim email in junk, could receive it, did not see an accept/decline prompt in the Trusted Bums account, and replied `approved` by email. Follow-up live Supabase reads verified the CoreWeave claim is now `APPROVED` via `email_reply` and the `opportunity_claim_accepted_bum` next-step email to Jason was sent. The remaining product fix is the portal landing path: claim-review email links must open the claim details and decision controls directly instead of only highlighting a pipeline row. The next Supply run should expand this structure across the remaining high-priority accounts from live data or the imported research table.

For each priority opportunity or account:

- Priority:
- Desired relationship profile:
- Decision-maker/champion hypothesis:
- Candidate Bum/referrer path:
- Classification: Managing Bum, Opportunity Scout, direct active Bum recruit, no-economic referrer, or no-route-yet.
- Current status:
- Next action:
- Owner:
- Due date:
- Risk or approval needed:

### Priority 1 - Crusoe
- Opportunity ID: `5544c234-7c60-441c-8630-558d71502cd9`
- Desired relationship profile: energy development, on-site generation, utility, project finance, data-center development, construction, operations, real estate, AI factory, or former Crusoe/customer/vendor path.
- Decision-maker/champion hypothesis: John Adams, SVP Power Infrastructure; Chris Dolan, Chief Data Center Officer; Matt Field, Chief Real Estate Officer; Michael Gordon, COO/CFO.
- Candidate Bum/referrer path: live roster keyword matches show two open self-reported Bums with `energy` / `data center` or `data center` profile evidence and one construction-profile match. No direct Crusoe contact or claim was found.
- Classification: direct active Bum screening path; no confirmed route yet.
- Current status: `candidate_referrer_identified`.
- Next action: ask the matched Bums whether they have a real Crusoe, energy infrastructure, on-site power, utility, project finance, data-center construction, real estate, or customer/vendor route. If no real route exists, classify as `no_route_found` and move to targeted scout sourcing.
- Owner: `Supply Agent`; human review by Ryan or named BlackCurrant Account Operator before external outreach.
- Due date: 2026-06-19.
- Risk or approval needed: no compensation promise; human review before relationship-sensitive outreach.

### Priority 2 - Vantage Data Centers
- Opportunity ID: `4519e057-cc68-4e8c-b30f-965805db343a`
- Desired relationship profile: Vantage North America, utility-scale power, Liberty Energy, hyperscale campus development, data-center construction, market development, sales, construction, operations, or public-policy route.
- Decision-maker/champion hypothesis: Dana Adams, President North America; Jeff Tench, Global EVP; Sureel Choksi, President and CEO.
- Candidate Bum/referrer path: live roster keyword matches show one Managing Bum with `data center` profile evidence, one Bum with construction evidence, and one Bum with data-center evidence. No direct Vantage, Liberty Energy, or claim contact was found.
- Classification: Managing Bum screening path plus direct active Bum screening path; no confirmed route yet.
- Current status: `candidate_referrer_identified`.
- Next action: ask the matched Managing Bum and matched Bums whether they can credibly reach Vantage North America, Liberty Energy, utility-scale power, hyperscale campus development, construction, operations, investor, board, or executive routes.
- Owner: `Supply Agent`; human review by Ryan or named BlackCurrant Account Operator before external outreach.
- Due date: 2026-06-19.
- Risk or approval needed: no compensation promise; regional fit should be checked because Dana Adams is strongest for North America.

### Priority 3 - QTS (see Blackstone)
- Opportunity ID: `4fd0c7fe-68c7-4e7a-8de6-8700118591f9`
- Desired relationship profile: QTS facilities, engineering, hyperscale customer delivery, Blackstone, data-center operations, development/facilities, or customer growth route.
- Decision-maker/champion hypothesis: David Robey, Co-CEO; Tag Greason, Co-CEO.
- Candidate Bum/referrer path: live roster keyword matches show one Managing Bum and one Bum with `data center` / `infrastructure` profile evidence. No direct QTS or Blackstone claim contact was found.
- Classification: Managing Bum screening path plus direct active Bum screening path; no confirmed route yet.
- Current status: `candidate_referrer_identified`.
- Next action: ask the matched Managing Bum and matched Bum whether they can credibly reach QTS facilities, engineering, hyperscale delivery, development, operations, or Blackstone infrastructure portfolio contacts.
- Owner: `Supply Agent`; human review by Ryan or named BlackCurrant Account Operator before external outreach.
- Due date: 2026-06-19.
- Risk or approval needed: QTS likely needs a stronger sub-CEO energy/facilities route if available; Decision-Maker Researcher should fill named energy/facilities owners if public evidence exists.

### Priority 4 - CoreWeave (Oracle)
- Opportunity ID: `57c0d016-4357-4b66-8496-c615dcde7c8b`
- Desired relationship profile: Oracle Cloud, Google Cloud, AI infrastructure, data-center capacity planning, executive operations, GPU cloud, energy finance, natural gas, AI-infrastructure investor, or capacity-development route.
- Decision-maker/champion hypothesis: Sachin Jain, COO; Brian Venturo, CSO/co-founder.
- Candidate Bum/referrer path: live data shows one Managing Bum created the CoreWeave opportunity-claim contact with relationship strength marked `WEAK`; the claim is now `APPROVED` via Akshay's email reply. Roster keyword matches also show one open Bum with `cloud` / `data center` profile evidence and one Managing Bum with `data center` evidence.
- Classification: existing Managing Bum claim path plus direct active Bum screening path.
- Current status: `client_email_reply_approved_intro_email_sent`.
- Next action: treat the CoreWeave claim as accepted product state, then move to intro setup and Managing Bum relationship screening. Keep a Product Ops follow-up on the portal review URL because live edge logs showed the tracked link was clicked, but the old client page only switched to the pipeline and highlighted the row rather than opening the claim details decision panel. Then ask matched Bums for Oracle Cloud, Google Cloud, AI infrastructure, data-center capacity, GPU cloud, energy finance, founder, or investor routes.
- Owner: `Supply Agent`; human review by Ryan or named BlackCurrant Account Operator before external outreach.
- Due date: 2026-06-19.
- Risk or approval needed: user-reported junk placement means the email path has deliverability friction; likely needs high-credibility executive or former-cloud-infrastructure route; do not use generic BD outreach.

## Active Supply Actions

### P0 - Evaluate The Org API for BlackCurrant decision-maker mapping
- Evidence: Ryan said on 2026-06-17 that someone suggested getting access to TheOrg.com APIs, especially for customer research to find the decision maker. Current public The Org documentation says the official API can return company org charts and manager relationships using credits.
- Why it matters: BlackCurrant supply cannot scale if Supply only knows account names. Org-chart data can sharpen the buyer hypothesis, identify the right function below generic executives, and give Inner Circle / Second Circle matching a better target.
- Doing work completed this run: Added The Org as an approved evaluation candidate for Decision-Maker Researcher and Supply, with official-API-only, credit-control, and privacy guardrails.
- Next action: Run a constrained four-account pilot once an API key is available: Crusoe, Vantage Data Centers, QTS/Blackstone, and CoreWeave/Oracle. For each account, pull the org chart or board section where available, identify the highest-relevance energy/data-center/infrastructure roles, compare against current Research Bot candidates, and turn gaps into Supply asks.
- Owner: `Decision-Maker Researcher` for source-backed org mapping; `Supply Agent` for Inner Circle / Second Circle route matching; `CEO` for approving a paid plan if the free test is insufficient.
- Due date: 24 hours after The Org API key is available.
- Human approval needed: approval to create the account, buy credits or subscribe, and store any contact-enrichment fields beyond name/title/company/reporting context.
- Acceptance criteria: The pilot shows whether The Org improves at least two of four BlackCurrant account maps with better buyer functions, reporting lines, or board/investor routes; records credit spend; and recommends buy, defer, or reject.

### P0 - Build the BlackCurrant top-10 relationship-supply map
- Evidence: Ryan clarified on 2026-06-17 that BlackCurrant execution requires Bums who know the opportunities and decision makers well enough to be trusted. The CEO backlog now treats BlackCurrant relationship supply as the top marketplace proof focus.
- Why it matters: Opportunity assignment alone will not prove the platform. Trusted Bums must show it can find credible trusted routes for hard accounts.
- Doing work completed this run: Created the Bum Supply Leader agent prompt and this operating backlog. Defined the map fields, classifications, ask-pack expectation, scorecard, and approval-packet structure. Populated the first four BlackCurrant pilot accounts from existing Decision-Maker Researcher evidence. Queried live Supabase roster and contact data, found one weak CoreWeave claim path and candidate profile matches for the four mapped accounts.
- Next action: Screen the matched Bums and Managing Bums for real relationship strength on the four mapped accounts, then expand from the four pilot accounts to the full top 10 using live opportunity data or the imported Research Bot records.
- Owner: `Supply Agent`, with Ryan or a named BlackCurrant Account Operator as human owner for relationship-sensitive judgment.
- Due date: 48 hours after current BlackCurrant opportunity data is available.
- Human approval needed: Human review for external outreach, relationship credibility, and any compensation language.
- Acceptance criteria: Top-10 BlackCurrant accounts each have a relationship profile, candidate path or no-route reason, classification, owner, next action, due date, and approval boundary. Current progress: 4 of 10 mapped from repo evidence; 4 of 4 have candidate screening paths; 1 of 4 has an existing weak claim path.

### P0 - Draft non-promissory candidate Bum/referrer asks
- Evidence: The new supply construct must allow "I know Bob, and Bob knows the decision maker" without making unsupported payout promises.
- Why it matters: Trusted Bums can start relationship discovery immediately while legal/economics approval is pending.
- Doing work completed this run: Defined the ask-pack section and quality bar for non-promissory outreach drafts.
- Next action: Draft account-specific asks once the BlackCurrant top-10 list is available.
- Owner: `Supply Agent`, with `Growth` support for tone and `Risk` support for claims boundaries.
- Due date: Same day as the top-10 supply map.
- Human approval needed: Human review before external relationship-sensitive outreach.
- Acceptance criteria: Each top-10 account has a short ask for existing Bums/trusted operators and a separate candidate-Bum invitation draft when needed, both without compensation promises.

### P0 - Prepare Managing Bum / Opportunity Scout economics review packet
- Evidence: CEO backlog says no named legal/economics approver is currently proven for scout or Managing Bum compensation language.
- Why it matters: The marketplace needs an economically aligned way to reward the person who brings in the right Bum, but vague approval gates stall execution.
- Doing work completed this run: Defined the approval-packet fields the Supply Agent must prepare.
- Next action: Coordinate with `Finance Agent` and `Risk` to draft three options: Managing Bum team override, opportunity-specific scout award, and no-economic referral path.
- Owner: `Supply Agent` plus `Finance Agent`; Ryan is interim business approver until a named legal/economics owner exists.
- Due date: 72 hours after Ryan confirms the review owner or asks for the packet.
- Human approval needed: Named human legal/economics owner before any external compensation promise.
- Acceptance criteria: Review packet includes eligibility, trigger event, payout source, cap, dispute rule, disclosure rule, termination rule, and payment timing for each option.

## Ask Packs

Initial reusable non-promissory ask:

> We are mapping credible relationship paths for a specific account. Who knows the decision maker or a trusted advisor well enough that their note would actually be read? We are not asking for a cold lead. We are looking for the right person to evaluate whether a real trusted route exists.

Use account-specific versions only after the top-10 list is available. Do not include referral, scout, Managing Bum, or active-Bum compensation language until named human legal/economics owners approve the exact language and economics.

### Crusoe Ask

We are mapping credible relationship paths into Crusoe for BlackCurrant's AI data-center energy infrastructure work. Who knows Crusoe's power infrastructure, data-center development, real estate, on-site generation, utility, project finance, construction, operations, or AI factory teams well enough that their note would be read? We are especially looking for paths around John Adams, Chris Dolan, Matt Field, or their teams. This is not a cold lead request; we need to know whether a real trusted route exists.

### Vantage Data Centers Ask

We are mapping credible relationship paths into Vantage Data Centers, especially North America power delivery, hyperscale campus development, construction, operations, Liberty Energy, and utility-scale power. Who knows Dana Adams, Jeff Tench, Sureel Choksi, or their operating teams well enough to create a trusted route? We are not asking for generic introductions; we need a real relationship path or an honest no-route answer.

### QTS / Blackstone Ask

We are mapping credible relationship paths into QTS and Blackstone-connected data-center operations for BlackCurrant. Who knows QTS facilities, engineering, hyperscale delivery, development, operations, or Blackstone infrastructure portfolio contacts well enough to be heard? The likely executive routes include David Robey and Tag Greason, but a stronger facilities, engineering, or Blackstone route may be better if one exists.

### CoreWeave / Oracle Ask

We are mapping credible relationship paths into CoreWeave and related Oracle Cloud / AI infrastructure routes. Who knows Sachin Jain, Brian Venturo, or their data-center capacity, cloud infrastructure, GPU cloud, energy finance, or executive operations network well enough to create a trusted route? This likely requires a high-credibility cloud infrastructure, former Oracle/Google, investor, or energy-infrastructure relationship.

## Managing Bum And Opportunity Scout Pipeline

Initial statuses:

- `needs_bum`
- `candidate_referrer_identified`
- `screening_requested`
- `screening_received`
- `screening_passed`
- `screening_needs_human_verification`
- `screening_failed`
- `candidate_bum_invited`
- `candidate_bum_approved`
- `route_claimed`
- `route_claimed_weak`
- `route_disqualified`
- `no_route_found`
- `conflict_or_compliance_hold`
- `approval_blocked_compensation`

## Relationship Screening System

Supply screens relationships before asking for external outreach or treating a route as credible. The goal is to separate true trusted access from profile-keyword matches, weak acquaintances, stale contacts, and generic networking.

### Inner Circle Intake

Jason's Managing Bum interview surfaced the right starting question: ask each new Bum or Managing Bum for the people closest to them in real business life before asking account-by-account questions. The durable term is `Inner Circle`. Based on Dunbar-style relationship layers, use `15 recommended / 20 maximum`: ask for the first 15 people by default, then allow up to 5 stretch entries only if the Bum says those people would still take the call seriously. Avoid saying "private business dinner" in product copy unless Ryan approves it, because it may sound too social or exclusive. Better wording:

> List the 15 people whose call you would take immediately and whose call to you would be taken seriously. If there are a few more who clearly meet that same standard, you can add up to 5 more. These should be the people you are closest to in professional life: trusted former coworkers, customers, vendors, advisors, investors, operators, founders, executives, or close personal contacts with real business credibility.

Purpose:

- Build a trusted-first relationship graph before matching opportunities.
- Discover direct matches where an Inner Circle person is the decision maker, influencer, buyer, sponsor, or employee at a target account.
- Discover `Second Circle` routes where the Inner Circle person knows the decision maker, investor, board member, founder, or sponsor who can open the opportunity.
- Give Managing Bums a concrete recruiting task: invite the close person as a Bum when that person, not the original Bum, owns the trusted route.

Intake fields:

- `inner_circle_person_name`
- `inner_circle_rank`: 1-20.
- `current_company`
- `current_role_or_context`
- `relationship_type`: former coworker, customer, vendor, investor, advisor, founder, executive peer, close personal contact, family/friend with business credibility, other.
- `closeness_tier`: `inner_circle`, `trusted`, `warm`, or `weak`.
- `would_take_my_call`: yes/no/unsure.
- `would_take_action_for_me`: yes/no/unsure.
- `last_meaningful_contact_bucket`: last 30 days, last 6 months, last year, 1-3 years, more than 3 years, unknown.
- `known_industries_or_domains`
- `known_companies_or_accounts`
- `known_investors_funds_boards_or_founders`
- `can_invite_as_bum`: yes/no/unsure.
- `safe_notes`: relationship context that can be stored without exposing unnecessary private details.

Sizing rule:

- Recommended default: 15 people. This maps to the commonly cited close "sympathy group" layer in Dunbar-style social network research.
- Maximum: 20 people. Treat entries 16-20 as stretch entries, not a second full list.
- Product behavior: require no minimum beyond what the Bum can honestly provide; encourage quality over filling all slots.
- Screening behavior: rank 1-5 as likely highest-confidence routes, 6-15 as trusted close network, and 16-20 as stretch routes that need slightly more verification.

Systemic matching rule:

- First-degree match: Inner Circle person works at, leads, advises, invests in, sells to, buys from, or has direct influence at a target account. Screen as a direct route.
- Second Circle match: public evidence or Bum-provided context shows the Inner Circle person is close to, funded by, funds, co-founded with, worked with, sits on a board with, advises, or can recruit the decision maker. Classify the original Bum as Managing Bum or Opportunity Scout depending on role and economics approval, then invite the Inner Circle person as the active Bum if appropriate.
- No match yet: keep the person in the trusted graph for future opportunities, but do not treat them as a route until an account fit appears.

Second Circle discovery:

- Use public, permission-friendly evidence only: company bios, press releases, board pages, investor portfolio pages, fund partner pages, founder announcements, conference bios, podcast transcripts, SEC filings, reputable news, public company blogs, and user-provided context.
- Do not automate LinkedIn browsing, connection-graph extraction, profile scraping, screenshots, or private social graph review.
- Treat public Second Circle findings as `inferred_second_circle` until the Bum or Inner Circle person verifies the route.
- Store source URLs and a short reason for the inferred connection, not private speculation.
- Example pattern: if Rob Bearden is in Ryan's Inner Circle, and Ryan states Rob is close with Peter Fenton at Benchmark, then any founder funded by Peter may be a possible Second Circle route through Rob. The route still needs human verification before outreach: Rob would need to confirm willingness and whether the founder path is appropriate.

Guardrails:

- Do not request private contact exports, scraped social graphs, raw LinkedIn data, or personal details that do not need to be stored.
- Do not imply that listing a person creates an obligation to contact them.
- Do not promise referral, scout, Managing Bum, or active-Bum compensation from this intake.
- Treat family/friend entries as allowed only when they have real business relevance and the route would be appropriate to use.
- Store only enough context to match opportunities and decide whether a human should verify the route.

### Screening Questions

Ask the candidate Bum, Managing Bum, Opportunity Scout, or referrer these questions for the specific target account and decision-maker path:

1. Who exactly do you know, and what is their current role or likely connection to the target decision maker?
2. How do you know them: former coworker, customer/vendor, investor/board, advisor, project partner, utility/energy partner, peer executive, close personal relationship, or other?
3. When did you last have meaningful contact?
4. Would they recognize your name and likely respond to a short note?
5. Can you credibly explain why BlackCurrant is relevant to them without overstating the opportunity?
6. Are there conflicts, employer restrictions, confidentiality issues, non-solicit concerns, or reputational reasons not to use this route?
7. Are you willing to make the intro, recruit the right Bum, or only suggest who might know them?
8. What proof can be recorded safely: relationship type, approximate recency, route notes, source of confidence, and manual verification status?

Do not ask for private LinkedIn scraping, private contact exports, raw inbox content, or confidential relationship details that do not need to be stored.

### Screening Score

Use a 0-100 score:

- Relationship directness, 0-25: direct decision maker or direct trusted path is strongest; broad industry familiarity is weakest.
- Recency, 0-15: meaningful contact in the last 6 months is strongest; more than 3 years or unknown is weak.
- Influence fit, 0-20: route reaches the actual BlackCurrant buyer/champion function, not just someone at the company.
- Credibility to act, 0-15: contact would recognize the Bum/referrer and likely read or respond.
- Relevance narrative, 0-10: Bum/referrer can explain the BlackCurrant relevance clearly and truthfully.
- Clean-risk check, 0-10: no obvious conflict, confidentiality, employer, legal, or trust problem.
- Willingness, 0-5: willing to introduce or recruit the right active Bum; lower if they only provide a name.

### Screening Thresholds

- `qualified_route`: 80-100. Ready for human-reviewed next step or claim strengthening.
- `verify_first`: 60-79. Needs human verification or better route evidence before outreach.
- `weak_route`: 40-59. Keep as fallback only; do not treat as credible route.
- `disqualify`: 0-39. Mark `route_disqualified` or `no_route_found` for that path.

The current product claim strength values map only after screening:

- `STRONG`: usually `qualified_route`.
- `MODERATE`: usually `verify_first`.
- `WEAK`: usually `weak_route` unless a human upgrades it with credible evidence.

### Minimum System Fields

Supply should maintain these fields in backlog/tracker/product design until Product Ops creates first-class fields:

- `inner_circle_intake_status`
- `inner_circle_count`
- `inner_circle_recommended_count`
- `inner_circle_stretch_count`
- `inner_circle_company_matches`
- `inner_circle_second_degree_routes`
- `second_circle_source_urls`
- `second_circle_verification_status`
- `supply_screening_status`
- `relationship_route_type`
- `relationship_directness`
- `last_meaningful_contact_bucket`
- `influence_fit`
- `credibility_to_act`
- `clean_risk_check`
- `willingness_to_act`
- `screening_score`
- `screening_decision`
- `human_verifier`
- `verification_date`
- `safe_route_notes`

### Immediate Application To BlackCurrant Pilot

- Supply should run `Inner Circle` intake with the current Managing Bums and strongest matched Bums before broad recruiting. First target: identify whether any listed Inner Circle person works at, advises, invests in, sells to, buys from, or can credibly reach Crusoe, Vantage, QTS/Blackstone, CoreWeave/Oracle, or their priority decision makers. Second target: use public evidence to identify whether those Inner Circle people create Second Circle routes through investors, board members, founders, former companies, portfolio companies, or project partners.
- CoreWeave / Oracle: existing weak claim path must now be screened as an accepted route. Live product state verified Akshay's email reply moved the claim to `APPROVED`, and the next-step email to Jason was sent. The remaining product defect is the email-link landing behavior, not the claim state.
- Crusoe: candidate profile matches must receive account-specific screening questions before any route is counted as credible.
- Vantage Data Centers: Managing Bum and direct Bum profile matches must be screened for Vantage/Liberty Energy/North America power delivery specificity.
- QTS / Blackstone: Managing Bum and direct Bum profile matches must be screened for QTS operations/facilities/engineering or Blackstone infrastructure specificity.

## Supply Scorecard

Track:

- `inner_circle_intakes_requested`: 0
- `inner_circle_intakes_received`: 0
- `inner_circle_people_mapped`: 0
- `inner_circle_account_matches`: 0
- `inner_circle_second_degree_routes`: 0
- `second_circle_inferred_routes`: 0
- `second_circle_verified_routes`: 0
- `priority_accounts_reviewed`: 4
- `accounts_with_named_candidate_bum`: 4
- `accounts_with_referrer_path`: 1 weak existing claim path
- `screening_requested`: 0
- `screening_received`: 0
- `qualified_routes`: 0
- `verify_first_routes`: 0
- `weak_routes`: 1
- `candidate_bums_invited`: 0
- `candidate_bums_approved`: 0
- `routes_claimed`: 1 CoreWeave path with live email-reply approval verified and Jason next-step email sent
- `routes_disqualified`: 0
- `no_route_reason_count`: 0 for the four mapped accounts after live roster screening; relationship strength still unverified.
- `approval_blocked_compensation_paths`: 0

## Approval Packets

The Supply Agent should prepare, but not approve, compensation review packets. Required fields:

- Option name.
- Eligible participant.
- Trigger event.
- Payout source.
- Cap or ceiling.
- Dispute rule.
- Disclosure rule.
- Termination rule.
- Payment timing.
- Legal/economics owner.
- Current approval status.

## Access Requests And Evidence Gaps

- The Org API access for a constrained decision-maker research pilot: API key, plan/credit budget, and permission to use the official API for BlackCurrant customer org-chart research. Start with the free account if possible; upgrade only if the first org-chart test is useful and the credit budget is approved.
- Current BlackCurrant opportunity export or live queue access for the remaining top-six accounts and the full 81-account prioritization.
- Human-verifiable Bum relationship strength for the matched Bums and Managing Bums. Live roster matching only proves keyword/profile overlap, not trusted access.
- Product follow-up for the CoreWeave claim-review link landing behavior: local code now opens the linked claim details and decision controls, but release and browser proof are still pending.
- Mail-deliverability evidence for the CoreWeave claim email that landed in Akshay's junk folder, ideally message trace or recipient headers before treating this as systemic deliverability failure. The current live decision event did not retain raw headers.
- Current CRM/account-plan notes, if any.
- Named BlackCurrant Account Operator.
- Named legal/economics approval owner for compensation constructs.
- Approved external outreach channel and sender for relationship-sensitive asks.

## Agent Inputs

- Date of run: 2026-06-17.
- 2026-06-18 user update reviewed: Ryan relayed Akshay's CoreWeave test claim email result, including junk-folder delivery, no visible in-account accept/decline prompt, and an email reply of `approved`. Follow-up live Supabase reads verified the approval and Jason notification were processed.
- Files reviewed: `docs/ceo-agent-operating-backlog.md`, `docs/agents/README.md`, `docs/company-wide-rules.md`, `docs/consultant-team-rules.md`, `docs/decision-maker-research/blackcurrant-2026-06-09-pilot.md`, `docs/decision-maker-research/blackcurrant-2026-06-09-full.md`, `docs/blackcurrant-client-criteria-workflow.md`, `supabase/migrations/20260517054500_correct_blackcurrant_opportunity_positioning.sql`, and existing automation prompt patterns.
- Live evidence reviewed: Supabase schema for `bum_profiles`, `profiles`, `bum_contacts`, `bum_team_memberships`, `opportunity_registrations`, `customer_targets`, `potential_decision_maker_matches`, and `opportunity_claims`; live Bum profile keyword matches against Crusoe, Vantage, QTS/Blackstone, and CoreWeave/Oracle; and live Bum contact/opportunity-claim search for those accounts.
- Changes made: Created the Bum Supply Leader prompt snapshot and this operating backlog; populated first-pass supply map and ask packs for Crusoe, Vantage Data Centers, QTS/Blackstone, and CoreWeave/Oracle; updated the map with live candidate screening paths and the existing weak CoreWeave claim path.
- Checks that could not run and why: No CRM/account list, private relationship notes, or human LinkedIn verification was available. Live roster keyword matching identifies candidate screening paths, not confirmed trusted access.
