# Trusted Bums Business Workflow QA Contract

_Last updated: 2026-06-17 by Codex._

## Purpose

This is the acceptance contract for role-based QA. A QA run is not thorough if it only proves pages load, buttons are clickable, or happy-path forms render. It must prove that each role can complete the business jobs Trusted Bums exists to support, and that the side effects are correct in the database and in the next role's workflow.

Any defect found during founder, client, Bum, or admin testing must be converted into a durable workflow scenario here before the next deep QA run is treated as complete.

## Required QA Mindset

- Test the role's job, not the route. Start from the business outcome the user expects.
- Verify the full chain: UI action, Supabase write/read, audit or notification side effect, next role visibility, and cleanup or reversal.
- Include negative proof. If a role should not perform an action, prove the UI blocks it and the backend rejects it.
- Check duplicate and retry behavior. Re-clicking after a partial success must not create duplicate records or generic failure loops.
- Treat "Unable to..." toasts, silent no-ops, stale data after refresh, and repeated loading-session loops as P1 candidates on primary workflows.
- When a new defect escaped QA, add the missing workflow scenario and update the responsible agent or gate so the same class of miss is not repeated.

## Role Business Goals

### Admin
- Operate the marketplace across all clients and Bums.
- Create, edit, approve, reject, hide, restore, and delete operational records when business rules allow.
- Troubleshoot failed workflows with enough logs, audit events, and email status to explain what happened.
- Manage credits, disputes, commission plans, payments, payouts, legal terms, team access, and support handoffs.

### Client Admin
- Publish, edit, delete, and manage unclaimed opportunities for their own company.
- Review, approve, decline, and track Bum claims against those opportunities.
- See the notification and status history needed to understand who was asked to review a claim, without exposing unnecessary recipient identity.
- Manage company profile, team access, trainings, targets, reports, and operational exports within the approved company boundary.

### Client Finance
- Review claims, payment reports, invoices, exports, and finance dashboards without receiving operational management authority by accident.

### Client Member
- Participate in assigned client workflows such as opportunity creation, trainings, targets, reports, and inbox activity without finance/admin-only powers.

### Bum
- Find open opportunities and open details.
- Claim an opportunity once with one or more stakeholder introductions.
- Retry a claim safely after transient failures without duplicate claims or duplicate My Contacts rows.
- Maintain contacts, prospects, customer leads, team membership, trainings, inbox, claims, and earnings.
- Delete only contacts that are not attached to a claim or other protected workflow.

### Managing Bum
- Invite Bums into their team and see team membership, claims, and earnings signals for that team.
- Receive team signup notifications without granting broader admin access.

## Always-Covered Critical Workflows

These are release-blocking workflow scenarios. Deep QA must prove them with real user actions or explicitly mark them blocked with the missing seed, credential, or cleanup requirement.

### Admin Operations
- Admin can delete an unclaimed opportunity when business rules allow.
- Admin cannot delete claimed or locked opportunities unless an approved admin-only override exists.
- Admin can see enough failure evidence for claim, contact, email, and opportunity errors to diagnose a live support call.

### Client Opportunity Lifecycle
- Client Admin or permitted Client Member can create an opportunity.
- Client can edit the opportunity while it is unclaimed.
- Client can delete the opportunity while it is unclaimed.
- Once a claim exists, restricted opportunity fields and delete actions are blocked with a clear explanation.
- Client sees claim details and the redacted client notification preview after a claim notification is sent.

### Client Profile And Beta Setup
- Client Admin can update ordinary same-company profile fields that are intended to be self-service.
- Legal company-name or approved-domain changes route through the Admin-reviewed identity-change path instead of applying silently.
- Only the intended elevated roles can update deal-registration beta setup, and unrelated same-company roles are denied in both UI and backend.
- Deal-registration beta setup persists after refresh, writes the expected audit event, and survives the current production schema rather than only working in source or local migrations.

### Bum Claim Lifecycle
- Bum can open the opportunities list and each opportunity detail.
- Bum can request a claim for an open opportunity.
- Bum can add multiple stakeholders to a claim with roles such as Decision Maker, Purchasing Leader, Development Leader, Blocker, Champion, Influencer, or Other.
- Claim creation produces exactly one claim and the expected stakeholder rows.
- Retrying the same claim after partial success returns or displays the existing claim instead of producing a generic "Unable to request claim" error.
- Claim creation does not create duplicate My Contacts rows when claim-backed contacts are already projected into contacts.
- A Bum can delete manual contacts that are not attached to a claim and cannot delete claim-backed contacts.

### Cross-Role Claim Handoff
- A Bum claim becomes visible to the correct client company.
- The correct client admin audience receives or is eligible to receive the claim-created notification.
- The Claims section shows the message that was sent while hiding client recipient names and emails.
- Client status changes update the Bum-facing claim state and do not bypass locked-meeting rules.

### Duplicate And Idempotency Checks
- Duplicate contact detection blocks or reuses existing records where intended.
- Repeated form submission, refresh, back/forward navigation, and a second click on the same primary action do not create duplicate records.
- Cleanup deletes every QA-created record or records a precise cleanup blocker.

## Evidence Required For A Workflow To Count

For each scenario above, QA evidence should include:

- Role and account used.
- Starting data condition, including whether the record is claimed, unclaimed, locked, or cleanup-safe.
- User action performed.
- Expected UI result.
- Expected database side effect or direct API result.
- Expected next-role visibility or notification effect where applicable.
- Negative proof for roles that must be denied.
- Cleanup result for any created data.

## Escaped Defect Rule

When a defect escapes and is found in live founder/client/Bum testing, QA must add or update a scenario in this contract and the executable suite before closing the issue. The report must identify:

- What the user was trying to accomplish.
- Which role goal was not protected by QA.
- Which QA layer should have caught it: unit, contract, role smoke, mutating deep QA, RLS/authorization, release verification, or code review.
- Which agent or gate needs updated acceptance criteria.
- The durable test or checklist item that will prevent the same class of miss.
