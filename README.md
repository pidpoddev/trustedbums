# Trusted Bums

Trusted Bums is a Vite React app for managing trusted warm introductions between clients, bums, and administrators.

Deployed app: https://pidpoddev.github.io/trustedbums/

## Local Development

Install dependencies:

```sh
npm install
```

Create `.env.local` for local development:

```sh
VITE_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Start the development server:

```sh
npm run dev
```

The app is served from the Vite base path used by GitHub Pages:

```text
http://localhost:8080/trustedbums/
```

## Quality Checks

Run the same checks used before publishing:

```sh
npm run lint
npm run test
npm run build -- --base=/trustedbums/
```

## Clerk Setup

The app uses Clerk React components from `@clerk/clerk-react`. Clerk is initialized in `src/main.tsx`, and the publishable key is read from `VITE_CLERK_PUBLISHABLE_KEY`.

Auth controls use embedded modal sign-in and sign-up flows. `SignupIntentDialog` collects whether the user is signing up as a Client or Bum before opening Clerk's sign-up modal. Client sign-ups require a company name; known client email aliases and domains prefill the existing client workspace name.

For GitHub Pages, keep sign-in and sign-up modal-based so users return through `/trustedbums/`. In the Clerk Dashboard, prefer email verification codes for this app; verification links can fail with `__clerk_status=client_mismatch` when opened from a different browser or device than the one that started sign-up.

For current Clerk React setup details, see the [Clerk React Quickstart](https://clerk.com/docs/react/getting-started/quickstart).

## Deployment

GitHub Pages deployment is handled by the repository workflow in `.github/workflows/deploy-pages.yml`. Pushing to `main` builds the Vite app with the `/trustedbums/` base path and publishes the static site to GitHub Pages.

## Tech Stack

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS
- Clerk
