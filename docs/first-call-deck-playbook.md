# Trusted Bums First Call Deck Playbook

_Last updated: 2026-06-11 by Codex._

## Purpose

This playbook defines how the Chief Marketing Officer Agent creates customized First Call Decks for potential Trusted Bums Clients. The deck should help a buyer understand the strategic-account access problem, trust-led route building, marketplace controls, and the recommended first step before a traditional salesperson has to carry the explanation.

The output can be a deck brief, a slide-by-slide script, or a generated presentation artifact when a presentation tool is available.

## Buyer-Led Principles

- Let buyers self-educate before and after the first call. The deck should be understandable when forwarded internally.
- Personalize around the buyer's situation, target-account pressure, likely buying committee, current route constraints, and trust risk. Do not stop at logo/name replacement.
- Use a hybrid journey. The deck should answer basic fit questions without a salesperson, then make the human validation point clear for trust, economics, compliance, and relationship quality.
- Protect the brand. Avoid guaranteed meetings, guaranteed revenue, affiliate-style framing, passive-income language, scraped-list language, fake urgency, and unsupported proof.
- Make the next step operational: strategy review, target-account shortlist, route hypothesis, pilot boundaries, owner, date, and decision criteria.

## Source Notes

Current B2B buying behavior supports a self-directed, buyer-enablement approach. Gartner reported on 2026-03-09 that 67% of B2B buyers prefer a rep-free experience, while Gartner's B2B buying journey guidance also warns that fully self-service purchases can increase regret when buyers cannot get the right human validation. Forrester's self-service buying guidance similarly frames self-service as a permanent shift driven by digital buying practices and buying groups. Trusted Bums should therefore make the first-call deck a buyer-support asset, not a salesperson-centered pitch.

## Minimum Inputs

Ryan should be able to provide only a few details and still get a useful first draft:

- Prospect company name
- Prospect website or industry
- Buyer name or role
- Business problem, target-account goal, or reason for the conversation
- Meeting objective

## Optional Inputs

- Target accounts or account segments the prospect wants to reach
- Known warm routes, possible Bums, advisors, investors, partners, or operators
- Current outbound, referral, partner, channel, or strategic-account motion
- Current blockers, objections, or prior failed attempts
- Buying committee roles
- Competitors or alternatives under consideration
- Approved proof points, screenshots, testimonials, pilot notes, or workflow evidence
- Legal, finance, commission, privacy, or disclosure boundaries
- Desired call-to-action
- Tone preference

## Deck Builder Input Schema

```json
{
  "prospect_company": "",
  "prospect_website": "",
  "industry": "",
  "buyer_name": "",
  "buyer_role": "",
  "meeting_objective": "",
  "business_problem": "",
  "target_accounts": [],
  "known_warm_routes": [],
  "current_motion": "",
  "known_objections": [],
  "buying_committee": [],
  "approved_proof": [],
  "legal_or_claim_limits": [],
  "desired_next_step": "",
  "tone": "direct, warm, commercially serious"
}
```

## Default Slide Structure

Use 8 to 10 slides unless the user requests a different length.

1. Title tailored to the prospect's business problem
2. Why hard-account access is difficult now
3. Trusted Bums point of view: trust opens doors that cold outreach cannot
4. Prospect-specific route hypothesis
5. How the Trusted Bums workflow works
6. Controls: why this is not spam, scraped lead-gen, or uncontrolled referral chaos
7. Proof-safe evidence and product workflow confidence
8. Proposed first pilot or strategy-review path
9. Mutual action plan
10. Appendix for definitions, compliance, terms, or deeper proof when needed

## Slide Output Contract

For each slide, return:

- Slide number
- Slide title
- Buyer-facing headline
- Key points
- Speaker note
- Visual direction
- Data or proof source
- Trust, legal, or claim caveat
- `NEEDS RYAN INPUT` fields if required

Also return a compact JSON object using the same slide fields so a presentation builder can convert the plan into PowerPoint, Google Slides, or PDF.

## Personalization Rules

- Use the prospect's real business context when supported by public sources or Ryan-provided input.
- Separate known facts from hypotheses.
- If the prospect's target accounts are unknown, frame the target-account section as a hypothesis and ask for the shortlist.
- If proof is missing, use product workflow evidence and a proof-gap slide note rather than invented results.
- If the buying committee is unknown, infer likely roles only as a hypothesis and label them clearly.

## Review Checklist

- The deck can be forwarded internally without Ryan narrating every slide.
- The first three slides speak to the buyer's problem before Trusted Bums explains itself.
- Every claim is sourced, user-provided, product-evidenced, or marked as a hypothesis.
- The deck explains what Trusted Bums is not: not cold outbound, not appointment setting, not scraped lead lists, not uncontrolled referral buying.
- The next step is clear, low-pressure, and operationally specific.
- Legal/finance/trust-sensitive wording is either approved, avoided, or marked for Legal/Compliance review.
