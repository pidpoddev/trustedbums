# Trusted Bums API

Trusted Bums exposes a small, versioned API layer for integrations that should not call Supabase tables directly. The first supported integration surface is the Chrome extension workflow.

## Source of truth

- OpenAPI contract: [`docs/openapi.yaml`](openapi.yaml)
- Supabase Edge Function: `supabase/functions/extension-api-v1/index.ts`
- Database storage: `public.extension_page_captures`
- Migration: `supabase/migrations/20260525160000_add_extension_api_page_captures.sql`

The OpenAPI file is the public contract. Update it in the same pull request as any endpoint, request, or response change.

## Versioning rules

The extension API is versioned in the Edge Function name:

```text
/functions/v1/extension-api-v1
```

Rules for managing this API:

- Keep `extension-api-v1` backward compatible.
- Additive changes are allowed: new optional request fields, new response fields, new enum values when clients can safely ignore them, and new endpoints.
- Breaking changes require a new function namespace such as `extension-api-v2`.
- Do not rename or remove v1 fields once an extension build depends on them.
- Do not expose raw Supabase table endpoints to browser extensions.
- Keep extension-created records draft-first unless a human explicitly confirms a workflow action.

## Authentication

Clients send the signed-in Clerk session JWT:

```http
Authorization: Bearer <clerk-session-jwt>
Content-Type: application/json
```

The Edge Function verifies the Clerk token, resolves the matching Trusted Bums `profiles` row, and enforces role/destination access server-side.

The function uses `verify_jwt = false` in `supabase/config.toml` because these are Clerk JWTs, not Supabase Auth JWTs. Do not remove the in-function Clerk verification.

## Endpoints

Base URL:

```text
https://vaoqvtxqvbptyxddpoju.supabase.co/functions/v1/extension-api-v1
```

### GET `/context`

Returns the current user profile and destinations the extension can attach captures to.

Use this when the extension opens or when it needs to populate a destination picker.

```http
GET /functions/v1/extension-api-v1/context
Authorization: Bearer <clerk-session-jwt>
```

Response shape:

```json
{
  "apiVersion": "v1",
  "profile": {
    "id": "user_...",
    "name": "Example User",
    "email": "user@example.com",
    "role": "BUM",
    "companyId": null,
    "clientAccessRole": null
  },
  "destinations": {
    "opportunities": [],
    "customerTargets": []
  }
}
```

### POST `/page-captures`

Creates a draft source artifact from a user-confirmed browser page. The capture must attach to exactly one opportunity registration or customer target.

```http
POST /functions/v1/extension-api-v1/page-captures
Authorization: Bearer <clerk-session-jwt>
Content-Type: application/json
```

Opportunity example:

```json
{
  "destinationType": "OPPORTUNITY_REGISTRATION",
  "opportunityId": "5ab7f4ba-5f12-49be-9ef0-c5bd2393b59a",
  "clientRequestId": "extension-generated-idempotency-key",
  "captureType": "LINKEDIN_PROFILE",
  "sourceUrl": "https://www.linkedin.com/in/example-person/",
  "pageTitle": "Example Person | LinkedIn",
  "selectedText": "VP of Finance at Example Co",
  "note": "I know them from a prior project.",
  "metadata": {
    "extensionVersion": "1.1.0"
  }
}
```

Response:

```json
{
  "apiVersion": "v1",
  "capture": {
    "id": "6fdd9e42-0195-4b40-8e95-9bfc1d7c7236",
    "status": "DRAFT",
    "captureType": "LINKEDIN_PROFILE",
    "sourceUrl": "https://www.linkedin.com/in/example-person/",
    "pageTitle": "Example Person | LinkedIn",
    "selectedText": "VP of Finance at Example Co",
    "note": "I know them from a prior project.",
    "companyId": "9fedb2b8-...",
    "opportunityId": "5ab7f4ba-5f12-49be-9ef0-c5bd2393b59a",
    "customerTargetId": null,
    "clientRequestId": "extension-generated-idempotency-key",
    "createdAt": "2026-05-25T16:00:00.000Z",
    "updatedAt": "2026-05-25T16:00:00.000Z"
  }
}
```

If `clientRequestId` is reused by the same user, the API returns the existing capture with HTTP `200` and `idempotent: true`.

## Data model

`extension_page_captures` stores user-confirmed source artifacts. It intentionally does not create claims, contacts, outreach, or messages. Future app workflows should review these draft captures before converting them into another business object.

Important columns:

- `api_version`: API namespace that created the record.
- `created_by`: Trusted Bums profile / Clerk user id.
- `company_id`: owning client company derived from the destination.
- `opportunity_registration_id` or `customer_target_id`: exactly one must be present.
- `client_request_id`: optional idempotency key from the extension.
- `capture_type`: `LINKEDIN_PROFILE`, `LINKEDIN_COMPANY`, `WEB_PAGE`, or `OTHER`.
- `status`: starts as `DRAFT`.
- `metadata`: small extension metadata only; avoid storing large scraped payloads.

## Security expectations

- Never put `SUPABASE_SERVICE_ROLE_KEY` or Clerk secret keys in an extension.
- Keep CORS narrow before public release by replacing `*` with the Chrome extension origin once the extension ID is fixed.
- Keep all authorization checks in the Edge Function, even when the frontend already hides a button.
- Store page captures as user-confirmed artifacts. Do not add background scraping, auto-navigation, or bulk LinkedIn harvesting behavior.
- Add an audit event for every mutating endpoint.

## Smoke tests

Run the deployed API smoke test with:

```sh
QA_EXTENSION_API_BASE_URL=https://vaoqvtxqvbptyxddpoju.supabase.co/functions/v1/extension-api-v1 pnpm run test:e2e -- tests/e2e/extension-api.spec.ts
```

That verifies anonymous requests are rejected with the stable v1 error envelope. Add `QA_EXTENSION_API_TOKEN` with a current Clerk session JWT to also verify the authenticated `/context` response. Clerk session JWTs expire, so refresh this value immediately before a release run or use an automation flow that creates a fresh QA session.

## Change checklist

When changing the API layer:

1. Update `docs/openapi.yaml` first or in the same commit.
2. Update this page if behavior, auth, versioning, or workflow changes.
3. Add/update the Edge Function implementation.
4. Add a migration for any schema changes.
5. Run `npm test`, `npm run lint`, and `npm run build`.
6. Deploy the Edge Function and apply migrations through the normal Supabase release process.
7. Keep v1 backward-compatible; create v2 for breaking changes.
