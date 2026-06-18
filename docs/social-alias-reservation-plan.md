# Trusted Bums Social Alias Reservation Plan

_Created: 2026-06-17 by Codex AI CMO setup._

## Executive Read

Trusted Bums should reserve the core `trustedbums` social and platform aliases now, before broader marketing work increases public exposure. Use `bums@trustedbums.com` as the username or recovery email wherever each platform allows it. Store generated passwords only in the local Codex secrets file, not in this repo.

Private credential file created for Ryan:

`/Users/macdaddy/.codex/secrets/trustedbums/alias-reservations-2026-06-17.md`

That file is local-only, chmod `600`, and outside the TrustedBums repo/NAS.

## Reservation Rules

- Preferred handle: `trustedbums`
- Preferred display name: `Trusted Bums`
- Username/email where allowed: `bums@trustedbums.com`
- Preferred 2FA method: authenticator/TOTP using local `oathtool` on Ryan's Mac when the platform supports it.
- Human approval required for public posting, paid campaigns, customer/reference claims, platform verification, phone verification, and any legal/compliance-sensitive profile copy.
- Do not publish profile copy that implies guaranteed meetings, guaranteed introductions, guaranteed revenue, bought access, passive income, verified relationship claims, or customer relationships without approval.
- Do not commit passwords, TOTP shared secrets, backup codes, raw recovery keys, phone numbers, or private mailbox content.
- Do not use address-bar bookmarklets or search-bar scripts to fill signup forms that include passwords or other secrets. If Chrome page scripting is blocked, switch to manual entry or a confirmed-safe UI path.

## Priority Alias Queue

| Priority | Platform | Preferred alias | Status | Notes |
| --- | --- | --- | --- | --- |
| P0 | X / Twitter | `@trustedbums` | Reserved 2026-06-17 | Created in the `Trusted Bums` Chrome profile with `bums@trustedbums.com` Google auth. Profile photo, bio, 2FA, and backup codes still need cleanup. |
| P0 | LinkedIn company page | `trustedbums` | Existing page needs completion; admin context blocked | Public profile exists but the Chrome profile hit LinkedIn auth wall and attempted Ryan personal Google sign-in, not a confirmed Trusted Bums admin session. |
| P0 | Facebook / Meta page | `trustedbums` | Blocked by Facebook login/admin requirement | Facebook requires a human/admin Facebook account before a Page can be created. |
| P0 | Instagram | `@trustedbums` | Retry needed after failed UI attempt | Prior attempt did not create an account; rotated local-only password and avoid address-bar scripts. |
| P0 | YouTube | `@trustedbums` | Reserved 2026-06-17 | Created as the Trusted Bums YouTube channel under `bums@trustedbums.com`. Profile image, channel description, links, 2FA, and backup-code review still need cleanup. |
| P1 | TikTok | `@trustedbums` | Blocked on birthday input | TikTok requires a birth date before email verification; retry after Ryan enters or authorizes the date. |
| P1 | Threads | `@trustedbums` | Blocked by Instagram dependency | Threads login/signup requires an Instagram identity; retry after Instagram is created or recovered. |
| P1 | Bluesky | `@trustedbums` or `trustedbums.com` handle | Blocked on birthday input | Bluesky requires a birth date before account setup can continue; default date should not be accepted without Ryan approval. |
| P1 | Reddit | `u/trustedbums` or community hold | Blocked by web UI input issue | Reddit showed an email signup path, but the email field did not accept focus through available UI controls. |
| P1 | Pinterest | `trustedbums` | Blocked by existing Bumfuzzle session | Pinterest opened into `Bumfuzzle Boutique` Business Hub; do not alter that account while reserving Trusted Bums. |
| P2 | GitHub org | `trustedbums` | Blocked by owner/CAPTCHA step | GitHub free org setup opened under `petersonryanm`; creation requires owner decision and CAPTCHA completion. |
| P2 | Product Hunt | `trustedbums` | Blocked by OAuth chooser input | Product Hunt opened Google sign-in, but the chooser did not accept selection of `bums@trustedbums.com` through available UI controls. |
| P2 | Crunchbase | `trustedbums` company profile | Draft filled 2026-06-17; save pending | Ryan opened the correct Organization form. Codex filled proof-safe basics; final Save All Edits is pending confirmation. |

## Reservation Activity Log

| Date | Platform | Action | Result | Next step |
| --- | --- | --- | --- | --- |
| 2026-06-17 | X / Twitter | Started signup in the `Trusted Bums` Chrome profile using `bums@trustedbums.com` Google auth; Ryan provided the birthday; Codex entered `Trusted Bums` and `trustedbums`; Ryan approved Continue. | `@trustedbums` reserved and onboarding reached X Home. Generated password was not set because X treated password as optional in the Google-auth signup flow. | Finish profile image, header, bio, authenticator/TOTP, backup codes, and recovery review. |
| 2026-06-17 | Instagram | Opened signup in the `Trusted Bums` Chrome profile and attempted to fill `bums@trustedbums.com`, `Trusted Bums`, and `trustedbums`. | Not created. Coordinate-based input clicked the Instagram help link, and a later address-bar script attempt was treated as a Google search instead of an in-page fill. The old generated Instagram password was rotated in the local-only secrets file. | Retry only with reliable form control: manual user entry, enabled Chrome JavaScript-from-Apple-Events, or another confirmed-safe UI path. Do not use address-bar bookmarklet fills for signup secrets. |
| 2026-06-17 | Instagram remediation | Closed the failed address-bar script tab after it remained visible in Chrome with the rotated old password in the tab title. | Local browser exposure reduced. The old password remains retired and should not be reused. | Keep using the rotated Instagram password from the local-only secrets file for any future retry. |
| 2026-06-17 | Facebook / Meta page | Opened Facebook Page creation in the `Trusted Bums` Chrome profile. | Blocked. Facebook requires a Facebook account login/admin session before a Page can be created. | Ryan must choose or create the human/admin Facebook account that should own the Page; then retry Page creation for `Trusted Bums`. |
| 2026-06-17 | YouTube | Opened channel creation in the `Trusted Bums` Chrome profile under `bums@trustedbums.com`; set name to `Trusted Bums`; corrected handle to `trustedbums`; Ryan approved the final Create channel step. | `@trustedbums` reserved. Channel URL observed after creation: `youtube.com/channel/UCGIraH08qaMZ2GIl_qExdSQ`; YouTube sidebar links the handle as `youtube.com/@trustedbums`. | Finish profile image, channel description, external links, authenticator/TOTP, backup codes, and recovery review. |
| 2026-06-17 | TikTok | Opened email signup in the `Trusted Bums` Chrome profile and reached the birthday/email/password/code form. | Blocked before credential entry. TikTok requires a birthday before email verification; Codex should not invent a birthday for a platform account. | Ryan should enter or authorize the birthday to use, then retry email signup with `bums@trustedbums.com` and `trustedbums`. |
| 2026-06-17 | Threads | Opened Threads signup/login in the `Trusted Bums` Chrome profile. | Blocked. Threads requires login with an Instagram account or an existing Instagram username/password; no standalone reservation path was visible. | Retry after Instagram `@trustedbums` is successfully created or recovered. |
| 2026-06-17 | Bluesky | Opened Bluesky account creation in the `Trusted Bums` Chrome profile. | Blocked before credential entry. Bluesky requires a birth date on step 1; the page prefilled `06/17/2006`, but Codex should not accept or submit a default birth date without Ryan approval. | Ryan should enter or authorize the birth date to use, then retry with `bums@trustedbums.com` and either `trustedbums.bsky.social` or a later `trustedbums.com` domain handle. |
| 2026-06-17 | Reddit | Opened Reddit registration in the `Trusted Bums` Chrome profile. | Blocked before credential entry. Reddit displayed an email signup field, but it would not accept focus/input via direct click, double-click, keyboard navigation, CUA setter, or macOS accessibility. | Retry manually in Chrome, or retry after enabling a reliable browser automation path; reserve `u/trustedbums` and avoid creating a promotional subreddit until there is a clear community plan. |
| 2026-06-17 | Pinterest | Opened Pinterest Business account creation URL in the `Trusted Bums` Chrome profile. | Blocked. Pinterest loaded an existing `Bumfuzzle Boutique` Business Hub session instead of a Trusted Bums signup flow. | Use a clean Pinterest session or explicitly switch/create a Trusted Bums business account; do not modify Bumfuzzle while reserving Trusted Bums aliases. |
| 2026-06-17 | GitHub org | Opened GitHub free organization setup for `trustedbums`. | Blocked before credential or organization submission. The form is under GitHub user `petersonryanm`, requires selecting whether the org belongs to a personal account or business/institution, and requires CAPTCHA completion. | Ryan should confirm the owning GitHub account/business choice and complete CAPTCHA; then reserve `trustedbums` if available. |
| 2026-06-17 | Product Hunt | Opened Product Hunt in the `Trusted Bums` Chrome profile and reached Google sign-in chooser. | Blocked before account/profile creation. The chooser displayed `bums@trustedbums.com`, but it did not accept selection through direct click, keyboard confirmation, or CUA click. | Retry manually or through a reliable OAuth-capable browser path; do not publish a Product Hunt launch until launch timing and copy are approved. |
| 2026-06-17 | Crunchbase | Opened Crunchbase and then the create-profile route at `/add-new`. | Blocked before profile submission. Crunchbase requires Cloudflare human verification before the add-new flow can continue. | Ryan should complete verification if a Crunchbase company profile is worth creating now; otherwise defer until the public credibility packet is more complete. |
| 2026-06-17 | Crunchbase account | Ryan created a Crunchbase account using Google auth for `bums@trustedbums.com`. | Account created. Company profile creation/claim for Trusted Bums is still pending. | Create or claim the Trusted Bums company profile, then fill proof-safe basics from the AI CMO profile copy packet. |
| 2026-06-17 | Crunchbase company profile retry | Reopened `/add-new` after account creation; attempted to select the Company profile type. | Not created. Direct coordinate click and double-click did not activate Company. Keyboard navigation accidentally opened an `Edit New Person` draft, which was not saved; the add-profile selector was reopened. A direct `/new/organization` route returned Page not found. | Ryan should manually click Company from `/add-new`, or enable a reliable browser-control path. Fill only proof-safe basics: name `Trusted Bums`, website `https://trustedbums.com`, and conservative description from this file. |
| 2026-06-17 | Crunchbase company profile draft | Ryan opened the correct `Edit New Organization` form. Codex filled proof-safe overview fields: name, short description, website, LinkedIn URL, X URL, contact email, and full description. Ryan then confirmed legal name `Trusted Bums Inc`, founded date `February 5, 2026`, employee count `3`, and company type `For Profit`. | Draft filled; not saved yet. Confirmed facts should be added to Crunchbase when access resumes. Unknown or unconfirmed fields remain blank, including phone, headquarters, founders, funding, and press. | Add legal name, founded date, employee count, and company type to Crunchbase; then confirm whether to click `Save All Edits` to submit/create the company profile. |
| 2026-06-17 | LinkedIn company page | Opened `linkedin.com/company/trustedbums/` in the `Trusted Bums` Chrome profile. | Blocked before profile update. LinkedIn showed an auth wall and a Google sign-in prompt for Ryan's personal account (`ryanmp29@gmail.com`), not a confirmed Trusted Bums page admin session. | Ryan should sign in with the LinkedIn account that owns/admins the Trusted Bums company page, then update the profile from the LinkedIn draft packet. |

## First Account-Creation Packet

Use this order:

1. X / Twitter `@trustedbums` - reserved 2026-06-17; finish profile, authenticator/backup codes, and brand copy.
2. Instagram `@trustedbums` - retry with reliable form control; use only the rotated local-only password.
3. Facebook / Meta `Trusted Bums` - blocked until Ryan chooses or creates the human/admin Facebook account.
4. YouTube `@trustedbums` - reserved 2026-06-17; finish profile, channel description, links, authenticator/backup codes, and recovery review.
5. TikTok `@trustedbums` - blocked until Ryan enters or authorizes the birth date.
6. Threads `@trustedbums` - blocked until Instagram is created or recovered.
7. Bluesky `trustedbums` - blocked until Ryan enters or authorizes the birth date.

For each platform, update:

- Account created: yes/no
- Exact handle secured
- Login email used
- Verification method used
- Recovery email/phone owner
- Two-factor status, with authenticator/TOTP preferred over SMS where available
- Backup codes location
- Public profile status
- Publishing owner
- Notes/blockers

## Local Authenticator Setup

`oath-toolkit` is installed locally on this Mac so Codex can generate authenticator codes with `oathtool` after Ryan provides a platform's TOTP setup secret during account setup.

Operating rule:

- Store each TOTP shared secret only in `/Users/macdaddy/.codex/secrets/trustedbums/alias-reservations-2026-06-17.md` or a future local-only secrets file.
- Keep the repo docs limited to non-secret status and ownership notes.
- Prefer authenticator/TOTP over SMS when available.
- Keep a Ryan-controlled phone number as the recovery method when a platform requires one.
- Save backup codes in the same local-only secrets folder, not in the repo.

## Profile Copy Guardrails

Use the AI CMO backlog for the current proof-safe public description:

`docs/ai-cmo-agent-backlog.md`

Short bio option:

Trusted Bums helps companies work hard-to-reach B2B accounts through reviewed, relationship-led access workflows.

Longer bio option:

Trusted Bums helps companies work the accounts they cannot reach cold by routing serious Client demand through reviewed, relationship-led access workflows. We do not guarantee meetings, introductions, revenue, buyer responses, or payouts. We provide a serious process for testing whether credible routes exist.

## Agent Inputs

- Date: 2026-06-17.
- Triggering request: Ryan asked to start grabbing future TrustedBums aliases and specifically called out the X/Twitter account name.
- Username preference: `bums@trustedbums.com`.
- Secrets path: `/Users/macdaddy/.codex/secrets/trustedbums/alias-reservations-2026-06-17.md`.
- Local TOTP tool: `oathtool` from Homebrew `oath-toolkit`, installed on this Mac on 2026-06-17.
- Public availability caveat: Logged-out social URL checks can be unreliable because platforms throttle, redirect, or hide availability behind signup flows. Treat every status as pending until account creation succeeds or the platform confirms the handle is unavailable.
