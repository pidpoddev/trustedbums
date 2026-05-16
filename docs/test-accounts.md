# Trusted Bums Production Test Accounts

Pushing this repo does not create or activate your Clerk production instance by itself.
It only makes the app ready to use production secrets and the production Clerk/Supabase setup.

## Recommended first three test accounts

Use one admin, one client, and one Bum account.
That gives you coverage of all three portal roles right away.

### 1. Admin test account

- Email: `admin@yourdomain.com`
- Clerk role metadata: `ADMIN`

Suggested Clerk metadata:

```json
{
  "role": "ADMIN"
}
```

### 2. Client test account

- Email: `client-test@yourdomain.com`
- Clerk role metadata: `CLIENT`
- Clerk company metadata: your test company name

Suggested Clerk metadata:

```json
{
  "role": "CLIENT",
  "clientCompanyName": "Trusted Bums Test Company"
}
```

### 3. Bum test account

- Email: `bum-test@yourdomain.com`
- Clerk role metadata: `BUM`
- Clerk bum metadata: a stable bum identifier

Suggested Clerk metadata:

```json
{
  "role": "BUM",
  "bumId": "test-bum-1"
}
```

## Why these three work well

- The admin account can review users, opportunities, and audit data.
- The client account can accept terms and submit a new opportunity.
- The Bum account can validate the Bum portal and role-specific routing.
- The client company row and profile row will be created automatically when the client signs in.

## Important note

This app reads role metadata from Clerk and then upserts the matching Supabase profile on sign-in.
So the Clerk user setup matters more than adding static demo users to the repo.
