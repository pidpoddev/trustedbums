# Shared Mailbox And DMARC Review

_Last updated: 2026-06-09 by Codex._

## Goal

Use the existing Microsoft Graph application path to review operational email sent to `bums@trustedbums.com`, including DMARC aggregate reports, legal document requests, product questions, complaints, support needs, and other inbound site-handling workflows.

`bums@trustedbums.com` should be treated as a shared operations mailbox. The app can use it for multiple site purposes, but access should still be scoped to that mailbox rather than tenant-wide mailbox read.

## What Was Added

- Supabase Edge Function: `dmarc-reports`
- Default mailbox: `bums@trustedbums.com`
- Admin-only access: the function verifies the current Clerk session and requires a Trusted Bums admin profile.
- Data returned: message metadata, attachment metadata, and parsed DMARC aggregate summaries from `.xml`, `.xml.gz`, and `.zip` attachments.
- Data not returned: email body content and attachment contents.

## Required Microsoft Access

The current Microsoft Graph setup is documented for sending mail. Reading shared mailbox emails requires a mailbox-read permission.

Preferred setup:

1. Grant Microsoft Graph mailbox-read access to the existing Trusted Bums app registration.
2. Scope the Exchange application access to `bums@trustedbums.com`.
3. Confirm the app can read `bums@trustedbums.com`.
4. Confirm the app cannot read unrelated mailboxes.
5. Use the shared mailbox for site workflows only after the allow/deny checks pass.

Fallback setup:

1. Run `scripts/add-graph-mail-read-permission.ps1`.
2. Confirm Microsoft Graph `Mail.Read` application permission has admin consent.
3. Restrict the app to `bums@trustedbums.com` with Exchange application RBAC or an application access policy before routine use.

Current setup note: Microsoft Graph `Mail.Read` application permission has admin consent on the Trusted Bums Scheduler app registration, and an Exchange application access policy now restricts practical mailbox read access to `bums@trustedbums.com`. `Test-ApplicationAccessPolicy` returned `Granted` for `bums@trustedbums.com`. The tenant currently has only one operational mailbox, so no unrelated-mailbox negative test is required at this stage.

## Supabase Secrets

The function uses the existing Microsoft Graph secrets:

- `MICROSOFT_TENANT_ID`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_ORGANIZER_EMAIL`

Optional:

- `DMARC_REPORT_MAILBOX=bums@trustedbums.com`

## Use

Call the function as an authenticated admin with:

```json
{
  "mailbox": "bums@trustedbums.com",
  "days": 14,
  "top": 50
}
```

The response lists likely DMARC report emails by sender, subject, received date, attachment names/sizes, parsed report counts, source IPs, DMARC policy disposition, SPF/DKIM alignment results, and aggregate pass/fail counts. If the response says Graph is unauthorized, check the Microsoft client secret/runtime config first, because tenant consent and the positive mailbox-scope check are now complete.

## Current Review Evidence

Codex invoked the live `dmarc-reports` function as an authenticated admin on 2026-06-09 with:

```json
{
  "mailbox": "bums@trustedbums.com",
  "days": 90,
  "top": 100
}
```

Result summary:

- Messages scanned: 100.
- Likely DMARC report messages found: 17.
- Parsed reports: 8.
- Parsed reported message count: 19.
- Aligned pass count: 19.
- Full SPF/DKIM alignment failures: 0.
- Current `_dmarc.trustedbums.com`: `v=DMARC1; p=none; rua=mailto:bums@trustedbums.com; pct=100;`.
- Current root SPF: `v=spf1 include:spf.protection.outlook.com -all`.
- Current aligned senders seen in parsed reports: Microsoft 365/Outlook using `trustedbums.com` SPF/DKIM and Clerk/SendGrid using `clkmail.trustedbums.com` SPF plus `trustedbums.com` DKIM selector `clk`.

The live version still returned parse errors for Microsoft/Yahoo `.xml.gz` reports because `application/gzip` was classified as ZIP. The source fix in `supabase/functions/dmarc-reports/index.ts` handles gzip before ZIP and is covered by `src/test/dmarcReportsFunction.test.ts`; deploy that function before using Microsoft/Yahoo aggregate output as final enforcement evidence.

## Site Workflow Uses

Once mailbox access is verified, the same shared-mailbox permission can support:

- Legal document requests and follow-ups.
- Product questions submitted through public or authenticated forms.
- Complaints, abuse reports, privacy requests, and escalation intake.
- Trust-agent DMARC review and spoofing/deliverability monitoring.
- Support triage where the source email belongs in the company operations mailbox.

Each new workflow should define what it can read, what it can store, who can see it in the portal, retention expectations, and whether the message body or attachments are truly needed.

## Enforcement Plan

1. Deploy the `dmarc-reports` gzip parser fix to Supabase project `vaoqvtxqvbptyxddpoju`.
2. Rerun the mailbox review until Google ZIP reports plus Microsoft/Yahoo GZIP reports parse without gzip/zip classification errors.
3. Confirm all legitimate sender rows align through SPF or DKIM for `trustedbums.com`; remediate or explicitly accept any unexplained full failures.
4. Change `_dmarc.trustedbums.com` from monitor-only to `v=DMARC1; p=quarantine; rua=mailto:bums@trustedbums.com; pct=100;`.
5. Treat Ryan as rollback owner and preserve the previous monitor-only record in the change note.
6. After at least one clean reporting window under quarantine, consider `p=reject; pct=100`.

## Next Improvement

Store parsed aggregate results in an admin-only table so the Trust Agent can trend sender drift, repeated failing IPs, and policy disposition changes over time instead of re-reading mailbox history each run.
