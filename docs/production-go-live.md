# Trusted Bums Production Go-Live

This app is set up to run as:

- DreamHost: static frontend hosting
- Clerk: authentication
- Supabase: database and API

## What stays the same

- Frontend code continues to call Supabase directly from the browser.
- Clerk remains the identity provider.
- Supabase Row Level Security remains the authorization layer for database access.

## Required production values

- `VITE_CLERK_PUBLISHABLE_KEY`
  - Use the Clerk production publishable key.
  - Expected format: `pk_live_...`
- `VITE_SUPABASE_URL`
  - Your live Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`
  - Your live Supabase anon key.

## Clerk production tasks

1. Create the Clerk production instance.
2. Add the production domain in Clerk.
3. Complete Clerk DNS and certificate setup.
4. Recreate any production-only settings that do not copy automatically.
   - OAuth providers
   - Webhooks
   - Integrations
   - Redirect/path settings, if applicable

## Supabase production tasks

1. Open the live Supabase project.
2. Add Clerk using Supabase Third-Party Auth.
3. Register the Clerk production domain there.
4. Verify the app can access Supabase with Clerk session tokens.

## GitHub Actions secrets

Set these repository secrets before deploying:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `DREAMHOST_SSH_KEY`
- `DREAMHOST_HOST`
- `DREAMHOST_USER`
- `DREAMHOST_TARGET`
- `CLERK_SECRET_KEY`
- `QA_ADMIN_EMAIL`
- `QA_CLIENT_ADMIN_EMAIL`
- `QA_CLIENT_FINANCE_EMAIL`
- `QA_CLIENT_MEMBER_EMAIL`
- `QA_BUM_EMAIL`

Set these optional QA secrets for mutating deep-QA cleanup and extension coverage:

- `QA_SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `QA_EXTENSION_API_TOKEN`

## Deploy

Push to `main` to run the DreamHost deployment workflow:

- `.github/workflows/deploy_dreamhost.yaml`

After a successful DreamHost deploy, GitHub automatically runs the `E2E Smoke` workflow against `https://trustedbums.com`. Treat that GitHub run as the release QA source of truth. It includes public smoke, authenticated role smoke, portal interaction audit, and deep workflow hotfix audit. Also run or inspect `Visual UI Audit` for screenshot evidence before calling a production release complete.

## Important warning

Do not ship development Clerk keys to production.
Do not point production Supabase auth at the Clerk development `.accounts.dev` domain.
