# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Clerk

## Clerk setup

Create `.env.local` for local development:

```sh
VITE_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

The app is wrapped with Clerk in `src/main.tsx`:

```tsx
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

<ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl={import.meta.env.BASE_URL}>
  <App />
</ClerkProvider>
```

Auth controls use Clerk's React components:

```tsx
<SignedOut>
  <SignInButton mode="modal" />
  <SignupIntentDialog>
    <Button>Create account</Button>
  </SignupIntentDialog>
</SignedOut>
<SignedIn>
  <UserButton />
</SignedIn>
```

`SignupIntentDialog` collects whether the user is signing up as a Client or Bum before opening Clerk's embedded sign-up modal. Client sign-ups require a company name; known client email aliases and domains prefill the existing client workspace name.

For GitHub Pages, keep modal-based sign-in/sign-up buttons and redirect back through the Vite base path. In the Clerk Dashboard, use email verification codes rather than email verification links for this app; email links can fail with `__clerk_status=client_mismatch` when opened from a different browser or device than the one that started sign-up.

For the current setup steps, see the [Clerk React Quickstart](https://clerk.com/docs/react/getting-started/quickstart).

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
