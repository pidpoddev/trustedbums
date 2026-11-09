# Who Benefits

Bums choose Me (default) or an approved charity from their profile. They can suggest a charity using its name, HTTPS website, EIN/registration number, and reason for alignment. Submitting does not select it. Pending and rejected suggestions cannot be selected.

Admins review suggestions under Finance → Charity Reviews. Approval requires verification of charitable status/identity, review of political activity and affiliations against Trusted Bums’ nonpolitical standard, and alignment with its ethos. A reason with verification sources is required and shared with the suggester. Reviews record the admin, timestamp, decision, checklist, and append-only history. Approval can be withdrawn with a reason. Precise political/ethos eligibility criteria remain an admin policy decision; no automated determination is implied.

Preferences apply to newly created payouts. Existing payouts preserve the beneficiary ID and charity name; historical payouts retain the Bum as beneficiary. Withdrawing approval blocks selection, new charity payouts, and approval/payment of outstanding charity payouts. Resolve those manually without silently redirecting funds. Payouts remain manually recorded; this feature does not move money, issue donation receipts, or promise tax deductions or employer-conflict clearance.

## Release and verification

Apply `supabase/migrations/20261109140112_add_who_benefits.sql` before deploying the frontend. The migration uses existing Clerk-compatible `public.current_user_id()` and `private.is_admin()` / `private.is_bum()` helpers. No live database or frontend deployment is implied by local validation.

Run `pnpm exec vitest run src/test/whoBenefits.test.tsx` for UI checks. `scripts/verify-who-benefits.mjs` runs the actual migration against isolated PostgreSQL with stubbed identity helpers, exercises RLS as both authenticated and signed-in Clerk anon-role users, and checks review, selection, and immutable payout behavior. Install `@electric-sql/pglite` outside the NAS and set `PGLITE_MODULE` to its module URL when running that script. Run it again with `TEST_DB_ROLE=anon` to exercise the legacy Clerk database role. Do not install executable dependencies on the NAS.
