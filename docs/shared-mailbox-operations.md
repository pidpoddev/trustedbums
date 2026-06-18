# Shared Mailbox Operations

_Last updated: 2026-06-18 by Codex._

## Mailbox

`bums@trustedbums.com` is the Trusted Bums shared operations mailbox.

Approved uses:

- DMARC aggregate reports and domain-trust monitoring.
- Legal document requests and legal follow-ups.
- Public visitor questions.
- Client, Bum, and partner questions that come through the site.
- Client criteria replies that define routing rules for Trusted Bums opportunities, such as BlackCurrant outreach criteria.
- Claim decision replies where a Client Admin replies `Approved` or `Declined` to a claim-review email, provided the reply includes enough token or claim context to bind it to the intended claim.
- Complaints, abuse reports, privacy requests, and escalation intake.
- Support triage where the message belongs to Trusted Bums operations.

## Access Position

The site may read from this mailbox through Microsoft Graph when the workflow is admin-authorized, auditable, and scoped to a defined product purpose.

The Microsoft app should not have practical read access to unrelated employee or user mailboxes. If Microsoft Graph `Mail.Read` application permission is granted, it must be constrained with Exchange application RBAC or an application access policy so routine access is limited to `bums@trustedbums.com`.

## Product Rules

- Admins may review shared mailbox metadata and operational messages.
- The Trust Agent may use DMARC report metadata and parsed DMARC aggregate XML results.
- Raw email bodies and attachments should not be stored unless a specific workflow requires them.
- Legal, complaint, privacy, and abuse messages should be classified before broad display in the portal.
- Sensitive messages should be visible only to admins or a future explicitly authorized operations/legal role.
- Every mailbox-reading workflow should log who initiated the read, what category was handled, and whether any durable app record was created.
- Client criteria replies may be summarized into structured opportunity-routing fields, but raw reply bodies should stay out of durable product docs unless a founder/admin explicitly approves storing the text.
- Claim decision replies should not be treated as final product state until the reply-sync or admin review path verifies the decision token or claim ID and records the resulting claim status. A user-reported reply of `Approved` is an operations signal, not database proof by itself. The 2026-06-18 CoreWeave reply is the proof pattern: live product state showed `APPROVED` via `email_reply`, and the corresponding Bum notification delivery was `SENT`.

## Implementation Queue

1. Store parsed DMARC aggregate results in an admin-only table for trend review.
2. Extend the current DMARC reader into a shared inbox intake service. `20260612143000_add_admin_shared_mailbox_inbox.sql` adds admin-only shared mailbox messages and send-event tables, and `admin-shared-mailbox` syncs `bums@trustedbums.com` through mailbox-scoped Microsoft Graph access.
3. Add categories for DMARC, legal, question, complaint, privacy, abuse, support, client criteria, and uncategorized. The shared mailbox sync now assigns these first-pass categories for admin triage.
4. Add an Admin Portal shared inbox/reputation intake surface. `/admin/inbox` now gives admins a shared Inbox with an External mail switch, mailbox sync, compose, reply, reply-all, and handled/in-progress status actions.
5. Add retention and redaction rules before storing attachments. Message bodies are stored only for the admin shared-mailbox workflow; attachments remain metadata-only in this slice.
6. Add a client-criteria intake path that can turn approved client replies into structured opportunity-routing rules.
7. Keep claim-decision reply handling observable after client-side junk-folder delivery. On 2026-06-18, Ryan relayed that Akshay found the CoreWeave test claim email in junk, did not see an accept/decline prompt in the Trusted Bums account, and replied `approved` by email. Follow-up live reads confirmed `sync-claim-decision-replies` processed the reply and sent the Bum next-step email. The remaining work is to retain safe header diagnostics for future decision replies and verify the local portal-link fix after release.

## Evidence Status

- Product-side function exists for DMARC metadata review and aggregate XML parsing: `supabase/functions/dmarc-reports/index.ts`.
- Supabase Edge Function `dmarc-reports` version 3 is deployed and active with XML, gzip, and zip attachment parsing.
- Microsoft Graph `Mail.Read` application permission has admin consent on the Trusted Bums Scheduler app registration.
- Exchange application access policy was created for app ID `06a570a0-06f4-432a-8b3b-709d6cf762dc` with `RestrictAccess` scoped to `bums@trustedbums.com`.
- Positive access check completed: `Test-ApplicationAccessPolicy` returned `Granted` for `bums@trustedbums.com`.
- No unrelated-mailbox negative test is required while the tenant has only one operational mailbox. If another mailbox is added later, rerun `Test-ApplicationAccessPolicy` against it and expect denial unless that mailbox is intentionally added to the scope.
- Current mailbox-backed DMARC review completed on 2026-06-09 through deployed function version 3: 100 messages scanned, 17 likely DMARC reports found, 17 reports parsed, 44 reported messages summarized, 44 aligned passes, and 0 full alignment failures in parsed reports.
- Microsoft/Yahoo `.xml.gz` attachments now parse cleanly in production after the gzip-before-ZIP fix. `_dmarc.trustedbums.com` now resolves as `v=DMARC1; p=quarantine; rua=mailto:bums@trustedbums.com; pct=100;`; the prior rollback record was `v=DMARC1; p=none; rua=mailto:bums@trustedbums.com; pct=100;`.
