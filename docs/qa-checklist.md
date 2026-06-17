# Trusted Bums QA Checklist

Use this checklist before production releases and after changes that touch auth, routing, Supabase data access, legal terms, or opportunity workflows.

## Automated Gate

Use GitHub Actions as the authoritative QA runner. Local commands are useful preflight checks while developing, but release QA evidence should come from GitHub workflow logs and uploaded artifacts.

For pull requests and `main`, confirm the `QA` workflow passed. It runs lint, unit tests, production build, and local browser configuration smoke in GitHub.

Use the `E2E Smoke` workflow from GitHub Actions for deployed staging or production validation. It runs public smoke, authenticated role smoke, portal interaction audit, and the deep workflow hotfix audit against the selected target URL. After the DreamHost deploy workflow succeeds on `main`, `E2E Smoke` also runs automatically against `https://trustedbums.com`.

Use the `Visual UI Audit` workflow from GitHub Actions for screenshot and responsive visual evidence. Use `Deep QA Hotfix Audit` directly only when you need a focused rerun of the deep page/control audit. A Deep QA pass is complete only when all three GitHub shards launch and finish: `admin`, `client`, and `bum`.

Run the local gate only as a developer preflight:

```sh
pnpm run qa
```

Run local browser smoke tests only to reproduce or prepare for the GitHub run:

```sh
QA_BASE_URL=https://your-staging-or-production-url.example pnpm run test:e2e
```

The browser suite includes a local configuration smoke test, deployed public-route checks, authenticated role checks, portal interaction checks, and workflow checks when `QA_BASE_URL` and the matching account variables are provided.

GitHub `E2E Smoke` always launches all three non-mutating deep workflow hotfix audit shards. For local reproduction of the full unsplit audit, run:

```sh
QA_BASE_URL=https://your-staging-or-production-url.example pnpm run qa:deep
```

To reproduce a single GitHub shard locally, add `QA_DEEP_SUITE=admin`, `QA_DEEP_SUITE=client`, or `QA_DEEP_SUITE=bum`.

The deep audit explores each role's routes, checks every visible enabled button for Playwright actionability, clicks safe non-destructive controls, captures runtime/network/user-visible failures, and attaches a Lead Dev hotfix report to the Playwright result. To run mutating workflow checks, use the GitHub workflow with `mutation_mode=true` or use a dedicated QA dataset locally and enable cleanup:

```sh
QA_DEEP_MUTATION=1 QA_SUPABASE_SERVICE_ROLE_KEY=... QA_BASE_URL=https://your-staging-or-production-url.example pnpm run qa:deep
```

Mutating deep QA tags created records with a unique `qa-deep-*` run id and attempts to delete them afterward. Do not run mutating deep QA against production unless the test accounts, data, and cleanup key are approved for that target.

Deep QA is not complete until the role-based business workflows in [business-workflow-qa-contract.md](./business-workflow-qa-contract.md) are covered or explicitly marked blocked. Page loads, route navigation, button actionability, and non-destructive clicks are necessary but not sufficient. For Admin, Client, Bum, and Managing Bum workflows, QA must prove the end-to-end business job: user action, data side effect, audit or notification effect, next-role visibility, duplicate/idempotency behavior, and cleanup.

Escaped defects from live founder, client, Bum, or admin testing must become durable QA coverage. When a defect such as an admin delete failure, claim request failure, or duplicate contact creation escapes, update the business workflow contract and add or recommend the executable regression before the QA item is closed.

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

- `CLERK_SECRET_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `QA_ADMIN_EMAIL`
- `QA_CLIENT_ADMIN_EMAIL`
- `QA_CLIENT_FINANCE_EMAIL`
- `QA_CLIENT_MEMBER_EMAIL`
- `QA_BUM_EMAIL`

The workflow accepts a `target_url` input and runs the public, authenticated, and workflow smoke tests against that deployed app.

The deep workflow hotfix audit is not optional in this workflow. It runs after smoke checks as three GitHub jobs named `Deep QA (admin)`, `Deep QA (client)`, and `Deep QA (bum)`, uploads shard-specific `playwright-report/` and `test-results/` artifacts, and should be reviewed for page-by-page button operability failures before a release is considered covered.

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
- Deep mutating QA either deletes all records tagged with the `qa-deep-*` run id or reports exact cleanup failures to Lead Dev.

## Business Workflow Checks

Use [business-workflow-qa-contract.md](./business-workflow-qa-contract.md) as the source of truth for role goals and release-blocking workflow scenarios. At minimum, prove these chains after opportunity, claim, contact, role, notification, or admin-operation changes:

- Admin can delete records that business rules say are deletable, and cannot delete claimed or locked records without an approved override.
- Client can create, edit, delete, and manage unclaimed opportunities, and sees clear locked-state behavior once a claim exists.
- Bum can open opportunity details, request a claim, add multiple stakeholders, retry safely, and avoid duplicate claim/contact side effects.
- Client receives or is eligible to receive claim-created notifications, and Claims shows a redacted sent-message preview without client recipient names or emails.
- Manual contacts can be deleted only when unattached, and claim-backed contacts remain protected.
- Duplicate form submits, refreshes, retries, and repeated clicks do not create duplicate records.

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

- The GitHub `QA` workflow passes for the commit.
- GitHub `E2E Smoke` passes against the deployed target, including authenticated role smoke, portal interaction audit, and deep workflow hotfix audit.
- Required business workflow scenarios are covered by executable QA or explicitly blocked with the missing seed, credential, cleanup, or environment requirement.
- GitHub `Visual UI Audit` passes or any visual findings are explicitly accepted.
- Any Supabase migrations have been applied and RLS checks pass.
- Test data created during QA is either clearly labeled or cleaned up.
- Production secrets are confirmed to use the live Clerk key and intended Supabase project.
