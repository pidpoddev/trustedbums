# Shared Mailbox Operations

_Last updated: 2026-05-29 by Codex._

## Mailbox

`bums@trustedbums.com` is the Trusted Bums shared operations mailbox.

Approved uses:

- DMARC aggregate reports and domain-trust monitoring.
- Legal document requests and legal follow-ups.
- Public visitor questions.
- Client, Bum, and partner questions that come through the site.
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

## Implementation Queue

1. Store parsed DMARC aggregate results in an admin-only table for trend review.
2. Extend the current DMARC reader into a shared inbox intake service.
3. Add categories for DMARC, legal, question, complaint, privacy, abuse, support, and uncategorized.
4. Add an Admin Portal shared inbox/reputation intake surface.
5. Add retention and redaction rules before storing message bodies or attachments.

## Evidence Status

- Product-side function exists for DMARC metadata review and aggregate XML parsing: `supabase/functions/dmarc-reports/index.ts`.
- Supabase Edge Function `dmarc-reports` version 2 is deployed and active with XML, gzip, and zip attachment parsing.
- Microsoft Graph `Mail.Read` application permission has admin consent on the Trusted Bums Scheduler app registration.
- Exchange application access policy was created for app ID `06a570a0-06f4-432a-8b3b-709d6cf762dc` with `RestrictAccess` scoped to `bums@trustedbums.com`.
- Positive access check completed: `Test-ApplicationAccessPolicy` returned `Granted` for `bums@trustedbums.com`.
- No unrelated-mailbox negative test is required while the tenant has only one operational mailbox. If another mailbox is added later, rerun `Test-ApplicationAccessPolicy` against it and expect denial unless that mailbox is intentionally added to the scope.
