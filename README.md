# Trusted Bums

Trusted Bums is a Vite React app for managing warm introductions, client legal onboarding, opportunity registration, and admin audit workflows.

Deployed app: https://pidpoddev.github.io/trustedbums/

## Local Development

Install dependencies:

```sh
npm install
```

Create `.env.local` for local development:

```sh
VITE_SUPABASE_URL=https://vaoqvtxqvbptyxddpoju.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Start the development server:

```sh
npm run dev
```

The app is served from the Vite base path used by GitHub Pages:

```text
http://localhost:8080/trustedbums/
```

## Supabase

The frontend uses `@supabase/supabase-js` from `src/lib/supabase.ts`. Do not expose service role keys in frontend code.

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

It also enables RLS, creates profile provisioning for new Supabase auth users, and seeds active Partner Terms version `v1`.

## Portal Flow

Client users must accept the current active Partner Terms at `/client/terms` before accessing client dashboard features. When a new active terms version is created, client users are redirected back to the terms page until they accept the latest version.

Client opportunity registration lives at `/client/opportunities/new`. Submissions create the registration, status history, audit event, and admin notification audit event.

Admin management lives at `/admin` and includes companies, users, terms versions, acceptance logs, opportunity registrations, status changes, commission overrides, CSV export, and audit event review.

## Deployment

GitHub Pages deployment is handled by `.github/workflows/deploy-pages.yml`. Configure the repository secret:

```text
VITE_SUPABASE_ANON_KEY
```

Vercel deployments should define both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in project environment variables.

## Quality Checks

Run the same checks used before publishing:

```sh
npm run lint
npm run test
npm run build -- --base=/trustedbums/
```

## Tech Stack

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS
- Supabase Auth and Database
