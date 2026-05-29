# Google Search And Safe Browsing Setup

_Last updated: 2026-05-29 by Codex._

## Goal

Make `trustedbums.com` visible to Google as an owned, monitored, healthy domain, and create a repeatable path to detect or clear Google Search and Safe Browsing trust issues.

## Current Status

- 2026-05-29: Added a Google Search Console Domain property for `trustedbums.com` under the `bums@trustedbums.com` Google account.
- 2026-05-29: Added the root DNS TXT verification record at DreamHost: `google-site-verification=c0QlpNiq3lPjTn3_e4q_FCiF9yZADM7BnJEIzswQoAo`.
- 2026-05-29: Confirmed the TXT record resolves from DreamHost authoritative DNS, Google Public DNS, Cloudflare DNS, and Quad9 DNS.
- 2026-05-29: Search Console ownership verified successfully by DNS TXT record.
- 2026-05-29: Search Console Manual Actions showed "No issues detected."
- 2026-05-29: Search Console Security Issues showed "No issues detected."
- 2026-05-29: Google Safe Browsing Site Status for `trustedbums.com` showed "No unsafe content found." The Google report said its site info was last updated on May 16, 2026.
- 2026-05-29: Local terminal HTTP checks for `https://trustedbums.com`, `https://www.trustedbums.com`, `/robots.txt`, and `/sitemap.xml` still timed out during DNS resolution from this machine. Treat that as a local/network evidence gap until another monitor confirms live fetch behavior.
- 2026-05-29: Added `public/sitemap.xml` to the local app and added `Sitemap: https://trustedbums.com/sitemap.xml` to `public/robots.txt`.
- 2026-05-29: Validated the sitemap XML locally with `xmllint --noout public/sitemap.xml` and confirmed `pnpm exec vite build --base=/` includes the static public files.
- 2026-05-29: Submitted `https://trustedbums.com/sitemap.xml` in Google Search Console. Search Console accepted the submission, then reported "Sitemap can be read, but has errors" and "Sitemap is HTML." This means the live host currently serves the SPA HTML fallback at `/sitemap.xml`; deploy the new static `public/sitemap.xml` file, then resubmit or wait for Google to reread it.

## Setup Steps

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add a new property for `trustedbums.com`.
3. Choose a Domain property so Google covers `trustedbums.com`, `www.trustedbums.com`, subdomains, and both HTTP and HTTPS.
4. Copy the DNS TXT verification value from Search Console.
5. Add that TXT record at the active DNS host for `trustedbums.com`.
6. Return to Search Console and click Verify. DNS propagation can take time, so retry if Google cannot see the record immediately.
7. Open the Security Issues report and confirm there are no malware, hacked-content, phishing, social-engineering, or unwanted-software findings.
8. Open Manual Actions and confirm there are no search-policy actions.
9. Use URL Inspection for:
   - `https://trustedbums.com/`
   - `https://www.trustedbums.com/`
   - `https://trustedbums.com/robots.txt`
   - `https://trustedbums.com/sitemap.xml`
10. Check [Google Safe Browsing Site Status](https://transparencyreport.google.com/safe-browsing/search) for `trustedbums.com`.

## If Google Shows A Warning

1. Review the exact affected URLs in Search Console.
2. Fix the underlying issue first. Common causes are compromised pages, deceptive login flows, suspicious redirects, unsafe downloads, infected third-party embeds, or hacked spam pages.
3. Recheck the affected URLs with URL Inspection.
4. Request a security review from the Search Console Security Issues report.
5. Record the issue, fix, review date, and outcome in `docs/trust-reputation-backlog.md`.

## Ongoing Checks

- Review Search Console Security Issues and Manual Actions weekly, and daily during launch or after reputation incidents.
- Keep DNS verification in place permanently; removing it can remove ownership.
- Watch for unexpected indexed spam by searching Google for spammy site-restricted terms such as `site:trustedbums.com pharmacy`, `site:trustedbums.com casino`, or other unrelated phrases.
- Mirror unresolved trust findings into `docs/trust-reputation-backlog.md` so the Lead Developer can prioritize fixes.

## Notes

- Google Search Console is the owner-facing control plane for Search and Safe Browsing findings.
- The Safe Browsing API is mainly for checking URLs programmatically. It does not replace Search Console ownership, Security Issues, Manual Actions, URL Inspection, or review requests.
