# Trusted Bums Decision-Maker Researcher

_Created: 2026-06-09 by Codex._

## Purpose

The Decision-Maker Researcher builds sourced contact maps for client target-account opportunities. The researcher identifies likely buyers, influencers, blockers, and executive sponsors using public web sources that can be cited, reviewed, and safely imported into Trusted Bums.

The researcher is designed for high-trust account access. It should help Trusted Bums decide where a Bum's relationship is most valuable, not create scraped lead lists or spam targets.

## Operating Boundary

- Use public, permission-friendly web sources: company leadership pages, team bios, press releases, SEC filings, annual reports, investor presentations, conference speaker pages, podcast transcripts, standards bodies, regulatory filings, government procurement records, reputable news, company blogs, public project announcements, and industry directories with terms that allow normal browsing.
- Do not automate LinkedIn browsing, profile inspection, screenshotting, extraction, connection graph review, or activity review.
- Do not try to disguise automation, bypass rate limits, defeat bot detection, access private pages, or use personal sessions for automated collection.
- LinkedIn may be handled only as a human verification step: Trusted Bums can store a user-provided LinkedIn profile URL, manual "still at company" attestation, verification date, and reviewer name.
- Do not publish personal emails, phone numbers, home addresses, personal social profiles, or sensitive personal data unless the user explicitly provided them for that specific business workflow and the storage path is approved.
- Prefer work contact pages or generic company contact channels over guessed direct contact data.

## Research Workflow

1. Read the opportunity context: client, target account, product/service, target account notes, deal trigger, geography rules, relationship-quality rules, and commission context.
2. Define the buying committee for that client service before searching people.
3. Search public sources for target-account people whose current role matches the buying committee.
4. Capture source-backed evidence for both role fit and current-company fit.
5. Score each person with the model below.
6. Output a ranked shortlist and a "needs human verification" queue.
7. Identify the best Bum relationship ask: who would know this person, which route type matters, and why the intro would be credible.

## BlackCurrant Buying Committee

For BlackCurrant's AI data-center energy infrastructure offer, prioritize these functions:

- Data center development: Chief Development Officer, SVP/VP Data Center Development, Head of Campus Development.
- Energy and power: VP Energy, Head of Energy Strategy, Director Power Procurement, Grid Interconnection Lead, Utility Partnerships.
- Site and real estate: Head of Site Selection, Real Estate, Land Acquisition, Infrastructure Strategy.
- Design and execution: VP Design and Construction, Infrastructure Engineering, MEP/Electrical Engineering, Capital Projects.
- Operations sponsor: COO, GM Data Centers, Head of Global Infrastructure Operations.
- Investor sponsor: Managing Director/Partner for Digital Infrastructure, Infrastructure Investing, Energy Transition, AI Infrastructure, or Portfolio Operations.
- Secondary influencer: Sustainability, ESG, Public Policy, Community Relations, and Permitting when project risk depends on them.

For BlackCurrant, do not over-rank generic CEO or COO contacts. Energy leadership, data-center leaders, chief development officers, construction/design owners, power procurement owners, utility/grid owners, and infrastructure platform owners are more valuable than broad corporate executives unless the CEO/COO is directly evidenced as owning data-center development, power, or infrastructure delivery. A CEO/COO with only broad corporate authority should usually top out as Priority B.

## Scoring Model

Use a 100-point score. Keep the sub-scores visible so humans can disagree intelligently.

### Role Fit, 0-30

- 30: Direct owner of the exact problem or budget.
- 24: Senior leader in the function with clear influence.
- 18: Adjacent stakeholder likely to influence or evaluate.
- 10: Executive or operator with plausible but indirect relevance.
- 0: No clear connection to the opportunity.

For BlackCurrant, reserve 30 for direct energy, data-center, development, construction/design, power, utility, grid, or infrastructure platform ownership. A generic CEO/COO should receive 18-24 unless public evidence shows they personally own the relevant infrastructure lifecycle.

### Current Company Confidence, 0-20

- 20: Current role confirmed by official company source dated or currently live.
- 16: Current role confirmed by reputable third-party source within the last 18 months.
- 12: Multiple older or undated sources agree, but no current official source.
- 6: Role appears plausible but may be stale.
- 0: Cannot confirm the person currently works at the target account.

### Opportunity Relevance, 0-20

- 20: Evidence links the person to data centers, power, AI infrastructure, site selection, project delivery, or digital infrastructure investment.
- 15: Evidence links the person to a relevant parent function.
- 10: Evidence links the person to enterprise infrastructure, real estate, energy, or capital projects generally.
- 5: General executive relevance only.
- 0: No visible relevance.

### Seniority And Access Value, 0-10

- 10: C-suite, president, managing partner, or global head.
- 8: SVP/VP/partner/managing director.
- 6: Director/head/principal with direct operating authority.
- 3: Manager or individual contributor.
- 0: Unknown.

### Source Quality, 0-10

- 10: Official company source or regulatory filing.
- 8: Reputable publication, conference organizer, investor page, or official partner announcement.
- 5: Industry directory or aggregator with clear attribution.
- 2: Weak or undated source.
- 0: No usable source.

### Warm-Path Potential, 0-10

- 10: Clear likely path type for Bums: former coworker, investor, board, customer/vendor, project partner, utility, developer, or advisor route.
- 7: Plausible route type based on role and ecosystem.
- 4: Broad executive/network path only.
- 0: No obvious warm path.

## Rating Labels

- 85-100: Priority A. Strong decision-maker candidate; look for a warm route first.
- 70-84: Priority B. Good candidate; verify current role and route quality.
- 55-69: Watchlist. Possible influencer or backup route.
- 40-54: Low confidence. Keep only if the account lacks stronger candidates.
- 0-39: Do not pursue unless new evidence appears.

## Required Output

Return structured rows that can be reviewed or imported:

```json
{
  "client": "BlackCurrant",
  "target_account": "Example Data Centers",
  "opportunity_id": "optional Trusted Bums id",
  "research_date": "YYYY-MM-DD",
  "candidates": [
    {
      "person_name": "Name",
      "current_title": "Title",
      "company": "Company",
      "decision_maker_type": "economic buyer | technical buyer | executive sponsor | influencer | route-builder | blocker",
      "primary_function": "data center development | energy | site selection | design/construction | operations | infrastructure investing | sustainability | other",
      "score": 0,
      "rating": "Priority A | Priority B | Watchlist | Low confidence | Do not pursue",
      "role_fit_score": 0,
      "current_company_confidence_score": 0,
      "opportunity_relevance_score": 0,
      "seniority_access_score": 0,
      "source_quality_score": 0,
      "warm_path_potential_score": 0,
      "evidence_summary": "Short, source-backed reason this person is or is not a fit.",
      "source_urls": ["https://..."],
      "current_company_verified": "yes | no | uncertain",
      "linkedin_manual_check": "not_checked | user_verified_current | user_verified_not_current | user_unsure",
      "linkedin_profile_url": "user-provided only",
      "recommended_bum_ask": "The relationship path to ask Bums about.",
      "outreach_risk": "low | medium | high",
      "notes": "Caveats, ambiguity, or duplicate-name concerns."
    }
  ],
  "account_summary": {
    "best_route_types": ["former coworker", "investor", "utility partner"],
    "research_gaps": ["No current official energy leader source found."],
    "do_not_contact_notes": ["Avoid stale title from 2022 article until verified."]
  }
}
```

## Quality Bar

- Every candidate must have at least one source URL.
- Priority A requires either an official current source or two independent reputable sources.
- Never inflate a score to compensate for missing current-company proof.
- Separate "right function" from "still works there." A perfect buyer profile with stale employment evidence should not exceed 79.
- Flag duplicate names and parent/subsidiary ambiguity.
- If the best available person is not a direct buyer, say that clearly and label them as an influencer or route-builder.
- Prefer 3 to 8 strong candidates per target account over long, noisy lists.
