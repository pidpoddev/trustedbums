# BlackCurrant Client Criteria Workflow

_Created: 2026-06-09 by Codex._

## Purpose

BlackCurrant has active Trusted Bums opportunities, but the database does not yet contain enough client-approved criteria to safely email Bums with precise routing rules. This workflow asks BlackCurrant to clarify those rules first, then lets Codex read the client reply from the approved shared mailbox and prepare the BlackCurrant updates.

## Current Database Position

- Client: BlackCurrant.
- Website: `blackcurrant.ai`.
- Opportunity positioning: energy infrastructure design for data centers, especially AI data centers.
- Active pay program: BlackCurrant Introduced Account Program - 10% / 36 months.
- Current live opportunity shape reviewed on 2026-06-09:
  - 81 customer targets.
  - 81 accepted opportunity registrations.
  - 0 current claims, questions, target responses, saved opportunities, or saved targets.
- Current criteria gaps:
  - BlackCurrant has no `target_regions` populated.
  - Target and opportunity rows do not have a dedicated country field.
  - Bum region coverage is sparse, so geography should be treated as a client rule before it is treated as a targeting filter.

## Outbound Clarification Email

Use the admin email template `blackcurrant_client_criteria_clarification`.

Send mode:

- Recipient group: `CLIENT_COMPANY` if BlackCurrant client users are present and reviewed.
- Otherwise use `CUSTOM` with only reviewed BlackCurrant decision-maker addresses.
- Category: `client_alerts`.
- Reply-to: `bums@trustedbums.com`.

Required metadata:

- `company_id`
- `client_name`
- `client_company_name`
- `blackcurrant_portal_url`

Do not send the Bum campaign until BlackCurrant answers or Ryan explicitly approves a broad pilot without criteria.

## Reply Handling Contract

When BlackCurrant replies, Codex should read the response from `bums@trustedbums.com` only after Ryan asks it to process the reply or an admin-authorized intake workflow exists.

Mailbox constraints:

- Use the shared mailbox rules in `docs/shared-mailbox-operations.md`.
- Use mailbox-scoped Microsoft Graph access only.
- Do not read unrelated mailboxes.
- Do not store raw email bodies in durable docs unless Ryan explicitly asks.
- Summarize only the client-approved criteria needed for BlackCurrant routing.

Codex should extract these fields:

- `allow_outside_us`: `yes`, `no`, or `needs clarification`.
- `allowed_regions`: approved countries, regions, or `global`.
- `excluded_regions`: excluded countries or regions.
- `accepted_account_scope`: target list only, new accounts allowed, or both.
- `accepted_path_types`: direct buyers, investors, developers, utilities, site-selection firms, data center operators, infrastructure partners, advisors, or other approved path types.
- `minimum_relationship_quality`: direct relationship, second-degree warm intro, prior customer/vendor relationship, former coworker, investor/board path, or other approved standard.
- `maybe_policy`: whether Bums should mark maybe for uncertain routes.
- `notes_for_bums`: short wording that can be placed into the Bum-facing email and opportunity notes.
- `open_questions`: anything BlackCurrant did not answer clearly.

## Update Process

After reading the reply, Codex should prepare a short review for Ryan:

1. What BlackCurrant approved.
2. What remains ambiguous.
3. The exact database/docs changes proposed.
4. The proposed Bum outreach copy.

If the reply is clear enough and Ryan approves, update BlackCurrant in this order:

1. Update BlackCurrant company criteria metadata or `target_regions` if the approved rule maps cleanly to existing schema.
2. Update BlackCurrant opportunity/customer-target notes so Bums see the approved routing rules.
3. Add or update the Bum-facing BlackCurrant email template.
4. Send a small Bum campaign only after the criteria are reflected in the portal copy.

## Guardrails

- Do not infer country, account scope, or relationship-quality rules from the existing Crusoe addendum alone.
- Do not treat the 81 existing target accounts as the only approved scope unless BlackCurrant says so.
- Do not invite Bums to submit international or off-list opportunities until BlackCurrant approves that.
- Do not email all Bums with vague copy if the client response creates exclusions that the current schema cannot enforce.
- Preserve explicit Bum triage: `claim`, `maybe`, and `skip` are operationally better than silent non-response.

## Bum Campaign Readiness Checklist

- BlackCurrant has answered geography scope.
- BlackCurrant has answered whether off-list targets are acceptable.
- BlackCurrant has answered allowed path types.
- BlackCurrant has answered minimum relationship quality.
- Portal opportunity notes match the approved criteria.
- Email reply handling has been summarized without exposing unnecessary private content.
- Ryan has approved the Bum-facing copy.
