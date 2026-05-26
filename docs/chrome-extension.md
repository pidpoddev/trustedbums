# Trusted Bums Chrome Extension

The Trusted Bums Chrome extension is the browser companion for user-confirmed page captures. The first supported workflow grabs a LinkedIn profile or company page and sends it to the versioned Trusted Bums Extension API.

## Current workflow

1. Open a LinkedIn profile or company page.
2. Open the Trusted Bums extension popup.
3. Sign in with Clerk.
4. Confirm the captured name, headline, selected text, destination, and optional note.
5. Send the page to Trusted Bums as a draft `extension_page_captures` record.

The current LinkedIn workflow does not crawl LinkedIn directories, auto-navigate search results, or send background captures. It only sends the page the user is already viewing after they click Send.

## Files

- Source extension folder: `chrome-extension/trustedbums`
- Built extension folder: `dist/chrome-extension/trustedbums`
- Packaged zip: `dist/chrome-extension/trustedbums-extension.zip`
- OpenAPI contract: `docs/openapi.yaml`
- API implementation: `supabase/functions/extension-api-v1/index.ts`
- Browser QA: `tests/e2e/linkedin-extension.spec.ts`

## Build inputs

Set these before creating a real production package:

```sh
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_FRONTEND_API=https://your-clerk-frontend-api-host
```

Optional values:

```sh
TRUSTED_BUMS_EXTENSION_API_BASE_URL=https://vaoqvtxqvbptyxddpoju.supabase.co/functions/v1/extension-api-v1
CRX_PUBLIC_KEY=<stable Chrome extension public key>
```

`CRX_PUBLIC_KEY` is optional for a Web Store upload because the Chrome Developer Dashboard assigns the production extension ID. It is useful when you need a stable unpacked-extension ID for pre-store testing.

## Build and package

Build the folder Chrome can load:

```sh
npm run build:extension
```

Create the zip for another machine or the Chrome Web Store:

```sh
npm run package:extension
```

The zip contains the built files from `dist/chrome-extension/trustedbums`. Do not upload the source folder.

## Local loading on an unmanaged machine

In Chrome:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select `dist/chrome-extension/trustedbums`.

If that machine also blocks unpacked extensions, use the Chrome Web Store path instead.

## Production Clerk setup

Clerk requires Chrome extension origins to be allowed explicitly. After the extension has a stable ID, add this origin to the Clerk production instance:

```text
chrome-extension://<extension-id>
```

Also make sure the Clerk Native API is enabled and the production `CLERK_FRONTEND_API` value is included in the built manifest `host_permissions`.

## Chrome Web Store notes

Before submitting:

1. Build with live Clerk production values.
2. Upload `dist/chrome-extension/trustedbums-extension.zip`.
3. Use the Web Store extension ID as the stable production ID.
4. Add `chrome-extension://<extension-id>` to Clerk allowed origins.
5. Narrow `extension-api-v1` CORS to the final Chrome extension origin before public release.

## QA

Build a test bundle and run the extension popup flow test with:

```sh
CLERK_PUBLISHABLE_KEY=pk_test_placeholder \
CLERK_FRONTEND_API=https://example.clerk.accounts.dev \
npm run build:extension -- --allow-placeholders

QA_BASE_URL=http://127.0.0.1:4173 npx playwright test tests/e2e/linkedin-extension.spec.ts
```

The test simulates a LinkedIn page, loads the built popup, mocks Clerk and the Extension API, and verifies the draft capture payload sent to `/page-captures`.

## References

- Clerk Chrome Extension SDK: https://clerk.com/docs/reference/chrome-extension/overview
- Clerk JavaScript quickstart: https://clerk.com/docs/getting-started/quickstart/chrome-extension-js
- Clerk production deployment: https://clerk.com/docs/deployments/deploy-chrome-extension/
- Chrome manifest reference: https://developer.chrome.com/docs/extensions/reference/manifest
