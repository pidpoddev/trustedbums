# Trusted Bums QA Authorization Fixtures

_Last updated: 2026-06-08 by Codex._

## Purpose

`supabase/qa_authorization_seed.sql` is an opt-in seed for local or staging authorization checks. It creates paired records so QA can prove both sides of access control:

- legitimate same-role and same-company access still works;
- foreign-company, wrong-role, disabled-user, pending-user, and non-owner access is denied.

Do not run this seed against production customer data.

## Fixture Shape

The fixture creates two client companies:

- `QA Alpha Client`: the positive-control company for the primary QA client users.
- `QA Beta Client`: the foreign-company denial control.

It creates deterministic profiles for Admin, Client Admin, Client Finance, Client Member, a Beta Client Admin, a disabled Client user, two pending users, and two Bums. The profile ids are synthetic JWT `sub` values for local RLS tests. If these rows are used with real Clerk QA accounts, update the ids to the real Clerk user ids before seeding.

It also creates paired opportunities, customer targets, claims, target responses, extension captures, Bum contacts, access-review requests, audit events, and a performance metric event.

## Minimum Checks

- Admin can see and review access requests, audit fixture rows, and admin-only performance telemetry across both companies.
- Alpha Client Admin can see Alpha opportunity, target, and same-domain request data, and cannot mutate or read Beta-only operational data.
- Alpha Client Finance can see finance-safe Alpha surfaces and cannot access operational/admin-only controls.
- Alpha Client Member can see member-visible Alpha surfaces and cannot access finance/admin-only controls.
- Beta Client Admin can see Beta data and cannot mutate Alpha-only records.
- Primary Bum can access own claims, captures, and contacts, and cannot access the secondary Bum's contacts or captures.
- Disabled and pending users cannot gain portal authority until an approved server path changes their status.

## Validation

The source-level fixture contract is covered by `src/test/qaAuthorizationFixtures.test.ts`. The next QA step is to add direct Supabase allow/deny checks that issue role-scoped JWTs using these deterministic profile ids, then run browser smoke against real Clerk QA users once their Clerk ids are mapped into the fixture.
