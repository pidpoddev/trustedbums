# Trusted Bums QA Checklist

Use this checklist before production releases and after changes that touch auth, routing, Supabase data access, legal terms, or opportunity workflows.

## Automated Gate

Run the full local QA gate before merging:

```sh
pnpm run qa
```

Run browser smoke tests when validating a deployed target:

```sh
QA_BASE_URL=https://your-staging-or-production-url.example pnpm run test:e2e
```

The automated gate covers linting, unit tests, and a production build. The browser suite includes a local configuration smoke test, deployed public-route checks, authenticated role checks, and a client-to-admin opportunity workflow when `QA_BASE_URL` and the matching account variables are provided.

For local authenticated smoke testing, copy `.env.qa.example` to `.env.qa`, fill the dedicated QA account credentials, then run:

```sh
set -a
source .env.qa
set +a
pnpm run test:e2e
```

## Required Test Accounts

Keep these Clerk users available in staging and production:

- Admin: `ADMIN`
- Client admin: `CLIENT` with `clientAccessRole=CLIENT_ADMIN`
- Client finance: `CLIENT` with `clientAccessRole=CLIENT_FINANCE`
- Client member: `CLIENT` with `clientAccessRole=CLIENT_MEMBER`
- Client with no current terms acceptance
- Bum: `BUM`
- Bum with incomplete profile, if profile completeness is enforced
- User with no Trusted Bums role metadata

See [test-accounts.md](./test-accounts.md) for starter metadata.

## GitHub E2E Smoke Workflow

Use the `E2E Smoke` workflow from GitHub Actions to validate staging or production after a deploy.

Required repository secrets:

- `QA_ADMIN_EMAIL`
- `QA_ADMIN_PASSWORD`
- `QA_CLIENT_ADMIN_EMAIL`
- `QA_CLIENT_ADMIN_PASSWORD`
- `QA_CLIENT_FINANCE_EMAIL`
- `QA_CLIENT_FINANCE_PASSWORD`
- `QA_CLIENT_MEMBER_EMAIL`
- `QA_CLIENT_MEMBER_PASSWORD`
- `QA_BUM_EMAIL`
- `QA_BUM_PASSWORD`

The workflow accepts a `target_url` input and runs the public, authenticated, and workflow smoke tests against that deployed app.

## Release Smoke Script

1. Open the public homepage and confirm the primary sign-in/sign-up actions render.
2. Open `/privacy-policy` and confirm the policy renders.
3. Sign in as admin and confirm `/dashboard` redirects to `/admin`.
4. Confirm admin can open clients, bums, opportunities, credits, commission plans, payments, payouts, and live conversations.
5. Sign in as client admin and confirm `/dashboard` redirects to `/client/dashboard`.
6. If prompted, accept the current Partner Terms and confirm the user returns to the expected portal path.
7. Create a test opportunity as client admin/member and record the opportunity name.
8. Confirm client finance can open payments and exports.
9. Confirm client member cannot open payments or exports and is returned to the client dashboard.
10. Sign in as Bum and confirm `/dashboard` redirects to `/bum/dashboard`.
11. Confirm Bum can open prospects, clients, opportunities, claims, trainings, live conversations, earnings, and profile.
12. Confirm the new test opportunity appears in the appropriate admin opportunity view.
13. Confirm protected URLs redirect anonymous users away from `/admin`, `/client/dashboard`, and `/bum/dashboard`.
14. Repeat homepage, dashboards, opportunity form, and tables on a mobile viewport.

## Supabase And RLS Checks

Run these checks after migrations, policy edits, or changes to `src/lib/portalApi.ts`:

- Anonymous requests cannot read protected business tables.
- Client users only see their own company data.
- Client finance can access payments/exports but not client-admin-only workflows.
- Client member can access operational workflows but not payments/exports.
- Bum users only see allowed opportunities, clients, claims, and profile data.
- Admin users can read and update admin-level records.
- Terms acceptance writes the correct user id, company id where applicable, and terms version id.
- Opportunity creation writes the registration, status history, and audit event.
- Admin-visible audit events are created for opportunity submissions and sensitive status changes.

## Regression Matrix

Use this matrix when deciding what to retest for a change:

| Area | Retest when changing |
| --- | --- |
| Auth and redirects | Clerk metadata, auth context, protected routes, `/dashboard`, sign-in handoff |
| Terms gate | Terms version data, acceptance writes, client/bum routing |
| Client portal | Opportunities, targets, requests, bum directory, trainings, profile |
| Client finance | Payments and exports |
| Bum portal | Prospects, opportunities, claims, earnings, profile completeness |
| Admin portal | Companies, bums, opportunities, credits, payouts, live conversations |
| Agreements | Generated docs, accepted docs, download links, public assets |
| Data imports | LinkedIn CSV, payment import, opportunity import |
| Deployment | Vite base, DreamHost rewrite rules, Clerk/Supabase env vars |
| Accessibility/responsive | Header actions, dialogs, tables, mobile nav, keyboard focus |

## Exit Criteria

A release is ready when:

- `pnpm run qa` passes.
- Staging or production E2E smoke tests pass, or the manual release smoke script has been completed.
- Any Supabase migrations have been applied and RLS checks pass.
- Test data created during QA is either clearly labeled or cleaned up.
- Production secrets are confirmed to use the live Clerk key and intended Supabase project.
