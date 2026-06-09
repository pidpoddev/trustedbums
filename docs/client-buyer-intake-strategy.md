# Trusted Bums Client Buyer Intake Strategy

_Created: 2026-06-08 by Codex._

## Purpose

This strategy turns the growth P0 `Separate buyer intake and remove public conversion friction` into an executable plan. The goal is to make the Client path feel like a serious buyer workflow, not a generic contact form shared with Bum recruiting and general inquiries.

## Strategic Bet

Trusted Bums' near-term marketplace constraint is qualified Client demand. More Bums only matter if Clients bring real target-account urgency. The public site should therefore route serious buyers into a Client-specific intake path that captures enough context for a fast human qualification step.

The Client path should answer four questions before follow-up:

- Who is asking?
- What company do they represent?
- Which target accounts or buyer types matter?
- Why is the current access path blocked?

## Target Audience

Primary buyer:

- Founder, CEO, CRO, VP Sales, or GTM lead.
- Has one to five named accounts that matter materially.
- Has a real product or offer, not just a broad prospecting wish.
- Can explain why cold outreach, ads, or normal sales channels are not working.
- Is willing to work inside a controlled warm-intro process.

Secondary buyer:

- Investor, advisor, board member, or operator referring a company with a hard-account access problem.

Poor-fit traffic:

- Generic lead-list buyers.
- Companies asking for broad SDR volume.
- People with no named accounts or commercial urgency.
- Prospective Bums trying to apply through the Client path.
- General vendor, partnership, press, or support messages.

## Public Experience Direction

The first public decision should be route-based:

- `Get help reaching target accounts` for Clients.
- `Refer a credible operator` or `Become a Bum` for Bum-side interest.
- `Contact Trusted Bums` for general questions.

The Client route should not ask the buyer to understand internal labels like `Client Prospect`. It should use plain language around target accounts, blocked access, referral routes, seriousness review, and next steps.

## Client Intake Form

Minimum required fields:

- Work email.
- Full name.
- Company name.
- Role or title.
- Target-account context.
- Current access blocker.
- Urgency.
- Consent to be contacted.

Recommended structured fields:

- `Target account count`: `1`, `2-5`, `6-10`, `10+`.
- `Buyer type`: `Founder/CEO`, `Sales/GTM leader`, `Investor/advisor referral`, `Other`.
- `Current blocker`: `No warm route`, `Cold outreach ignored`, `Procurement or executive access blocked`, `Need credibility with a specific buyer`, `Other`.
- `Urgency`: `This month`, `This quarter`, `Exploring`.

Recommended free-text fields:

- `Which accounts or buyer types are you trying to reach?`
- `What have you already tried?`
- `What would make this commercially meaningful if it worked?`

Do not require sensitive customer names if the buyer is not ready to share them publicly. Accept buyer categories or redacted target descriptions, then collect exact names during founder follow-up.

## Conversion Friction Fixes

The Client path needs these product changes:

- Preserve manually entered company names when email is edited.
- Replace toast-only failures with inline recovery text near the relevant field or submit button.
- Keep the submit button state clear while network requests are running.
- Show a confirmation state that names the next human step.
- Store enough source and qualification data for Product Ops to triage without reading raw notes first.
- Route Bum and general inquiries away from the Client form before submission.

## Qualification Rules

Mark as qualified when the submission has:

- A real company identity.
- A likely business buyer or credible referral source.
- A specific target-account, buyer-type, or strategic-access problem.
- A plausible commercial reason to pursue the account.
- No obvious spam, vendor solicitation, or broad lead-volume request.

Mark as needs review when:

- The target-account context is vague but the company looks real.
- The submitter is a referral source rather than the buyer.
- The email domain is generic but the explanation is credible.
- The company stage, budget, or urgency is unclear.

Mark as low fit when:

- The request is for broad lead generation or email volume.
- No named-account or strategic-access problem exists.
- The submitter appears to be a Bum candidate using the wrong path.
- The message is vendor, spam, press, or unrelated support traffic.

## Product Ops Handoff

Every qualified Client intake should create or update an admin-visible handoff with:

- Source path.
- Buyer role.
- Company name.
- Target-account count or description.
- Current blocker.
- Urgency.
- Qualification status.
- Owner.
- Next action.
- Follow-up deadline.

Default next actions:

- `Founder review`.
- `Schedule strategy call`.
- `Request target-account detail`.
- `Refer to Bum recruiting path`.
- `Archive as low fit`.

## Measurement

Primary metric:

- Qualified Client strategy requests that pass manual review.

Quality metrics:

- Client intake completion rate.
- Named-account seriousness rate.
- Verified-company-domain rate.
- Strategy-request-to-call rate.
- Low-fit submission rate.
- Wrong-path Bum submission rate.

Operational metrics:

- Median time to first review.
- Median time to founder follow-up.
- Open qualified requests older than two business days.
- Submissions missing owner or next action.

## Implementation Sequence

1. Add the Client-specific intake content and field model.
2. Split Client, Bum, and general inquiry routing in the public experience.
3. Add inline validation and recovery states.
4. Preserve manually entered company names across email edits.
5. Create Product Ops handoff fields and default triage statuses.
6. Add unit and E2E coverage for Client route, wrong-path routing, inline errors, and successful submission.
7. Run hosted smoke and visual audit for the public route changes.
8. Review the first ten real submissions manually and tune disqualifiers before adding automation.

## Acceptance Criteria

- Public visitors can choose a Client-specific path without internal role jargon.
- Client intake captures buyer role, company, target-account context, blocker, and urgency.
- Invalid or failed submissions show inline recovery.
- Typed company names do not disappear during email edits.
- Bum recruiting and general inquiries have separate paths.
- Product Ops can see owner, qualification status, next action, and urgency.
- QA covers the happy path, invalid states, wrong-path routing, and persistence of typed company names.

## Open Decisions

- Whether target-account names are required in the public form or requested only after founder review.
- Whether generic-email buyers can submit directly or must be manual-review only.
- Whether the first version should create a `Client Prospect` record immediately or only a contact/handoff until founder qualification.
- Which owner receives the default first-review assignment.
- Which CRM or tracking system becomes the source of truth once volume grows.
