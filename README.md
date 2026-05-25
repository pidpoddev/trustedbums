# Trusted Bums

Trusted Bums is a Vite React app for managing warm introductions, client legal onboarding, opportunity registration, and admin audit workflows.

Deployed app: hosted at the site root.

## Local Development

Install dependencies:

```sh
pnpm install
```

Create `.env.local` for local development:

```sh
VITE_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
VITE_SUPABASE_URL=https://vaoqvtxqvbptyxddpoju.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Start the development server:

```sh
pnpm run dev
```

The app is served from the site root:

```text
http://localhost:8080/
```

## Auth And Database

Clerk owns authentication and sign-in/sign-up UI. Supabase is used as the database only.

The frontend uses `@clerk/react` for auth and `@supabase/supabase-js` from `src/lib/supabase.ts` for data access. Do not expose service role keys in frontend code.

Supabase database requests receive the current Clerk session token through the Supabase client `accessToken` option. Supabase RLS policies use `auth.jwt()->>'sub'` as the Clerk user ID.

Supabase project URL:

```text
https://vaoqvtxqvbptyxddpoju.supabase.co
```

Apply the database schema and seed data with the Supabase CLI:

```sh
npx supabase login
npx supabase link --project-ref vaoqvtxqvbptyxddpoju
npx supabase db push
```

The initial migration creates:

- `companies`
- `profiles`
- `terms_versions`
- `terms_acceptances`
- `opportunity_registrations`
- `opportunity_status_history`
- `audit_events`

It also enables RLS for Clerk-authenticated requests and seeds active Partner Terms version `v1`.

Supabase must be configured with Clerk as a third-party auth provider. For local Supabase CLI use, `supabase/config.toml` includes:

```toml
[auth.third_party.clerk]
enabled = true
domain = "gorgeous-kit-53.accounts.dev"
```

For production, configure the live Clerk instance in the Supabase dashboard using Clerk third-party auth. Do not reuse the development `.accounts.dev` domain in production.

### Clerk Metadata Admin Tools

The app derives portal access from Clerk user metadata before syncing the user into Supabase. Supported metadata fields include:

```json
{ "role": "ADMIN" }
{ "role": "CLIENT", "clientAccessRole": "CLIENT_ADMIN", "companyName": "Example Co" }
{ "role": "BUM", "bumId": "example-bum" }
```

The frontend reads these values from Clerk `publicMetadata` first and falls back to `unsafeMetadata` for older repaired accounts. Admin-only metadata repair is handled by the deployed Supabase Edge Function `admin-user-tools`, which uses `CLERK_SECRET_KEY` from Supabase Edge Function secrets to call the Clerk Backend API and update both Clerk metadata and the matching Supabase `profiles` row.

Required Supabase Edge Function secrets for Clerk admin tooling:

```text
CLERK_SECRET_KEY
CLERK_FRONTEND_API_URL
SUPABASE_SERVICE_ROLE_KEY
```

Verification: the live Supabase project has an active Clerk metadata repair path. Edge Function logs show a successful `one-off-clerk-role-fix` Clerk metadata update before that one-off function was disabled, and the reusable `admin-user-tools` function is currently deployed with Clerk API support.


## API Layer

Trusted Bums now has a small, versioned API layer for integrations that should not call Supabase tables directly. The initial surface is the Chrome extension API:

```text
/functions/v1/extension-api-v1
```

API documentation lives in [`docs/api.md`](docs/api.md), and the OpenAPI contract lives in [`docs/openapi.yaml`](docs/openapi.yaml). Treat `docs/openapi.yaml` as the source of truth for request/response contracts. Any API behavior change must update the OpenAPI file and the API docs in the same change.

Versioning policy: keep `extension-api-v1` backward-compatible with additive changes only. Breaking changes require a new Edge Function namespace such as `extension-api-v2`. Browser extensions must authenticate with a Clerk session token and must never receive Supabase service-role keys.

## Website Email

Website contact notifications are sent by the deployed Supabase Edge Function `send-website-email`. The homepage contact form saves the submission to `contact_submissions`, then invokes this function as a best-effort notification. The function uses the existing Microsoft Graph client-credentials setup and sends from `MICROSOFT_ORGANIZER_EMAIL` with replies directed to the submitter.

Required Supabase Edge Function secrets for website email:

```text
MICROSOFT_TENANT_ID
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
MICROSOFT_ORGANIZER_EMAIL
WEBSITE_CONTACT_NOTIFY_TO # optional; defaults to MICROSOFT_ORGANIZER_EMAIL
```

The Azure app must have Microsoft Graph `Mail.Send` as an Application permission with admin consent. The helper script `scripts/add-graph-mail-send-permission.ps1` grants that permission for the Trusted Bums app registration. Live verification on May 19, 2026 returned `200 {"sent":true}` from `send-website-email`.

## Portal Flow

Client users must accept the current active Partner Terms at `/client/terms` before accessing client dashboard features. When a new active terms version is created, client users are redirected back to the terms page until they accept the latest version.

Client opportunity registration lives at `/client/opportunities/new`. Submissions create the registration, status history, audit event, and admin notification audit event.

Admin management lives at `/admin` and includes companies, users, terms versions, acceptance logs, opportunity registrations, status changes, commission overrides, CSV export, and audit event review.

## Deployment

Hosted deployment is handled by `.github/workflows/deploy_dreamhost.yaml`. Configure these repository secrets:

```text
VITE_CLERK_PUBLISHABLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
DREAMHOST_SSH_KEY
DREAMHOST_HOST
DREAMHOST_USER
DREAMHOST_TARGET
```

Use the production Clerk publishable key here. It should start with `pk_live_`.

GitHub Pages deployment remains available in `.github/workflows/deploy-pages.yml`, but the Vite base is now `/` for root-hosted deployments. Vercel deployments should define `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` in project environment variables.

## Production Checklist

For production, keep DreamHost for static hosting and keep Supabase as the database/API layer.

1. Create and activate a Clerk production instance.
2. Add your production domain in Clerk and complete the DNS/certificate steps there.
3. Replace development Clerk keys with production keys in your deployment secrets.
4. In Supabase, add Clerk using Third-Party Auth for the production Clerk domain.
5. Set these GitHub repository secrets before deploying from Actions:

```text
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
DREAMHOST_SSH_KEY
DREAMHOST_HOST
DREAMHOST_USER
DREAMHOST_TARGET
```

6. Push to `main` to trigger `.github/workflows/deploy_dreamhost.yaml`.

Notes:
The local `supabase/config.toml` file is for Supabase CLI and local development. Your live Supabase Clerk integration is configured in the Supabase dashboard, not by deploying that file to DreamHost.

## Quality Checks

Run the same checks used before publishing:

```sh
pnpm run qa
pnpm run test:e2e
```

For authenticated deployed smoke tests, copy `.env.qa.example` to `.env.qa`, fill the dedicated QA account credentials, export the variables, and run `pnpm run test:e2e`.

## Tech Stack

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS
- Clerk Auth
- Supabase Database
