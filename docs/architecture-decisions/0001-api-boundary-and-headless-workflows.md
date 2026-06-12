# ADR 0001: API Boundary And Headless Workflow Lanes

- Status: Accepted
- Date: 2026-06-12
- Tracker: `TB-0088`

## Context

Trusted Bums currently has three data access shapes:

- The React portal calls Supabase directly through `src/lib/portalApi.ts` and `src/lib/contactApi.ts`.
- Supabase Edge Functions handle privileged, external-service, public-intake, extension, and service-role workflows.
- `docs/openapi.yaml` documents the stable extension API, but not the whole portal surface.

That means Trusted Bums is already headless at the Supabase data-platform level: callers with the right credentials can call the Data API or Edge Functions without the React UI. It is not yet headless as one stable product API. The missing decision is which workflows may stay as direct Data API calls, which need domain APIs, which are internal-only, and which are partner-facing contracts.

Supabase grants decide whether a table, view, or function is reachable through the Data API. RLS decides which rows are visible after the object is reachable. Trusted Bums must treat both as part of the API boundary.

## Decision

Every new data workflow must choose one API lane before implementation.

| Lane | Use For | Stable For Headless Callers | Contract |
| --- | --- | --- | --- |
| Public Intake API | Anonymous or semi-anonymous public submissions, telemetry, feedback, and abuse-controlled first-touch workflows | Yes, only for the documented public submission shape | Edge Function contract with origin/CORS, bot/abuse controls, rate limits, validation, and audit/log expectations |
| Direct Data API | Low-risk portal reads and simple single-owner writes already protected by RLS and explicit grants | No, unless the caller is the first-party portal or an approved internal tool | TypeScript helper plus RLS allow/deny coverage |
| Portal Domain API | Privileged, multi-table, auditable, role-sensitive, or workflow-orchestrating portal actions | Yes, for first-party authenticated clients with Clerk session tokens | Edge Function request/response shape plus role tests |
| Internal Operations API | Cron, mailbox sync, admin maintenance, Graph/Clerk/Teams/service-role jobs | Yes, but only for internal services and operators | Function runbook, caller credential, audit/log expectations |
| Partner API | Chrome extension, future client/vendor integrations, or any external non-portal consumer | Yes, for approved external consumers only | OpenAPI, versioning, auth, rate limit, idempotency, audit, deprecation policy |
| UI-Only Helper | Presentation transforms, filters, local state, and non-persistent calculations | No | Component/helper tests only |

New PRs and backlog items that add data workflows must name the lane. If a workflow is expected to run outside the React UI, it must not depend on browser-only state, component routing, or undocumented Supabase table access.

Raw Supabase table endpoints are not a partner API.

## Routing Rules

- Use a Public Intake API for unauthenticated or low-auth public workflows such as contact submissions, public feedback, and telemetry beacons. These endpoints must define origin/CORS posture, bot/abuse controls, validation, rate limits, and storage/audit behavior before launch.
- Use direct Data API only when the table access is intentionally exposed, RLS covers the role boundary, the operation is simple, and a partner should not depend on the table shape.
- Use a Portal Domain API when the workflow performs multiple writes, touches sensitive finance/admin/mailbox/team data, needs service-role or external-service credentials, or must create durable audit events.
- Use an Internal Operations API when the caller is a cron job, Edge Function, mailbox sync, GitHub/manual operator job, or another trusted service.
- Use a Partner API when the caller is a browser extension, customer integration, vendor, CRM connector, or any future system outside the first-party portal.
- Use UI-only helpers only for local presentation behavior that can be recomputed from existing data and does not create or mutate backend state.

## Current Workflow Classification

| Workflow Area | Current Shape | Headless Target | Lane Decision |
| --- | --- | --- | --- |
| Chrome extension page capture | `extension-api-v1` Edge Function with OpenAPI | Already supported | Partner API |
| Public contact form | `submit-contact` Edge Function plus direct contact-submission reads for admins | Supported for form submission; admin queue remains portal-scoped | Public Intake API, then Portal Domain API for queue operations when migrated |
| Profile bootstrap and access repair | `profile-bootstrap`, `client-team`, `admin-access-requests`, `clerk-user-tools` Edge Functions | Supported for first-party authenticated/admin callers | Portal Domain API and Internal Operations API |
| Client opportunities and marketplace reads | Mostly direct Data API through `portalApi.ts` | First-party headless can use Data API, but not a public contract | Direct Data API until high-risk mutations migrate |
| Bum saved, hidden, client, contact, and reverse-opportunity workflows | Mixed direct Data API and `portal-contacts` Edge Function | Partial; stable external API not defined | Direct Data API for simple owner-scoped state, Portal Domain API for multi-table contact/customer-lead orchestration |
| Conversations and opportunity questions | Direct Data API multi-table writes | Not stable as a product API | Portal Domain API candidate |
| Finance, commissions, invoices, and payouts | Direct Data API writes and admin/client role checks | Not stable as a product API | Portal Domain API candidate before real volume |
| Admin email, mailbox, Teams, DMARC, and scheduled sync | Edge Functions and cron jobs | Supported internally only | Internal Operations API |
| Admin Scrum Tracker | Direct Data API through the admin portal | Internal/headless operator support is allowed, but not partner-facing | Direct Data API for admins; consider Portal Domain API if external automation grows |
| Training materials and storage attachments | Direct Data API and signed storage URLs | First-party only | Direct Data API for reads, Portal Domain API for privileged attachment lifecycle if abuse or audit needs grow |
| Performance beacon and telemetry | `performance-beacon` Edge Function plus admin direct reads | Beacon supported; admin reporting is portal-scoped | Public Intake API and Direct Data API for admin reports |

## Migration Sequence

1. Keep `extension-api-v1` backward-compatible and continue treating it as the model for partner contracts.
2. Update `docs/api.md` whenever a workflow gains a stable headless contract.
3. Move new privileged or multi-table workflows behind Portal Domain APIs by default.
4. Migrate existing high-risk workflows in this order for app-readiness: public contact intake and admin contact-submission queue; cross-queue handoff parity for `customer_target_responses`, `client_bum_intro_requests`, and `reverse_opportunities`; conversations/questions; finance/commissions/invoices/payouts before live finance volume; admin scrum automation if external/headless automation grows; training attachment lifecycle if abuse or audit needs grow.
5. Pair each migration with role allow/deny tests and hosted smoke coverage.

## Consequences

- The React app can continue using direct Supabase calls where they are already simple and RLS-backed.
- Future partner or automation work has a clear answer: do not call raw tables unless explicitly approved as a first-party/internal lane.
- API documentation now covers the product API strategy, not just the Chrome extension.
- `TB-0087` remains responsible for narrowing Data API grants and helper execution exposure.
- `TB-0089` remains responsible for cataloging Edge Functions and shared auth controls.
