alter table public.bum_profiles
  add column if not exists is_managing_bum boolean not null default false,
  add column if not exists managing_bum_commission_percent numeric not null default 0 check (managing_bum_commission_percent between 0 and 100),
  add column if not exists managing_bum_enabled_at timestamptz,
  add column if not exists managing_bum_enabled_by text references public.profiles(id) on delete set null;

create index if not exists bum_profiles_managing_bum_idx
  on public.bum_profiles (is_managing_bum, updated_at desc)
  where is_managing_bum = true;

create index if not exists bum_profiles_managing_bum_enabled_by_idx
  on public.bum_profiles (managing_bum_enabled_by)
  where managing_bum_enabled_by is not null;

insert into public.terms_versions (
  version,
  title,
  body,
  faq_body,
  change_summary,
  audience,
  is_custom,
  custom_label,
  is_active
)
values (
  'managing-bum-1.0',
  'Trusted Bums Managing Bum Agreement',
  $tb$This Managing Bum Agreement supplements the Trusted Bums Bum Agreement. It applies only when Trusted Bums approves you as a Managing Bum.

1. Managing Bum Role

A Managing Bum may invite, organize, coach, or support other Bums who participate on a team approved by Trusted Bums. A Managing Bum is not an employee, legal agent, broker-dealer, or exclusive representative of Trusted Bums unless separately agreed in writing.

2. Team Membership

Trusted Bums may approve, reject, pause, or remove team members at its discretion. Team membership does not guarantee that any Bum will receive opportunities, claims, introductions, payouts, or continued access.

3. Manager Commission Share

When an approved team member creates a commissionable result, Trusted Bums may allocate the Managing Bum a percentage of the commission Trusted Bums actually receives for that team member's approved opportunity. The applicable percentage is the percentage approved by Trusted Bums in the platform or in a separate written agreement.

4. Payment Conditions

Managing Bum allocations are payable only after Trusted Bums receives the underlying commission from the client and approves the related payout allocation. Allocations may be adjusted for refunds, credits, disputes, fraud prevention, tax requirements, compliance holds, or payout processing limits.

5. No Guaranteed Earnings

Inviting a Bum, managing a team, supporting an opportunity, or being approved as a Managing Bum does not guarantee compensation, revenue, client payment, team activity, or continued Managing Bum status.

6. Team Conduct

You agree to act in good faith, coach team members toward accurate relationship information, avoid spam or deceptive outreach, and promptly raise compliance, confidentiality, conflict, or eligibility concerns to Trusted Bums.

7. Confidentiality and Compliance

You must protect non-public information about Trusted Bums, clients, opportunities, target accounts, team members, and payout terms. You are responsible for complying with applicable laws, contractual restrictions, employer obligations, and non-disclosure obligations that may apply to your activities.

8. Termination or Change

Trusted Bums may change, pause, or terminate Managing Bum status, team membership, commission percentages, or future team participation at any time. Termination does not automatically eliminate an allocation already approved by Trusted Bums unless the underlying payout is reversed, disputed, voided, or otherwise adjusted under the applicable platform rules.$tb$,
  $tb$Q: What is a Managing Bum?
A: A Managing Bum is an approved Bum who can build or support a team of other Bums.

Q: How does a Managing Bum earn?
A: Trusted Bums may allocate the Managing Bum an approved percentage of the commission Trusted Bums actually receives from a team member's approved opportunity.

Q: Is the manager share guaranteed?
A: No. The share depends on client payment, platform approval, payout review, and the applicable team terms.

Q: Can Trusted Bums remove a team member or change Managing Bum status?
A: Yes. Trusted Bums can approve, pause, remove, or change team participation to manage quality, compliance, and business risk.$tb$,
  'Adds Managing Bum team, commission-share, compliance, and payout-allocation terms.',
  'BUM',
  true,
  'Managing Bum addendum',
  false
)
on conflict (version) do update
set title = excluded.title,
    body = excluded.body,
    faq_body = excluded.faq_body,
    change_summary = excluded.change_summary,
    audience = excluded.audience,
    is_custom = excluded.is_custom,
    custom_label = excluded.custom_label,
    is_active = false;

create table if not exists public.bum_team_memberships (
  id uuid primary key default gen_random_uuid(),
  managing_bum_user_id text not null references public.profiles(id) on delete cascade,
  member_bum_user_id text not null references public.profiles(id) on delete cascade,
  status text not null default 'INVITED' check (status in ('INVITED', 'ACTIVE', 'REMOVED')),
  invited_by text references public.profiles(id) on delete set null,
  manager_commission_percent numeric check (manager_commission_percent is null or manager_commission_percent between 0 and 100),
  invite_email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bum_team_memberships_not_self_check check (managing_bum_user_id <> member_bum_user_id)
);

create unique index if not exists bum_team_memberships_manager_member_unique
  on public.bum_team_memberships (managing_bum_user_id, member_bum_user_id);

create index if not exists bum_team_memberships_manager_idx
  on public.bum_team_memberships (managing_bum_user_id, status, created_at desc);

create index if not exists bum_team_memberships_member_idx
  on public.bum_team_memberships (member_bum_user_id, status, created_at desc);

create index if not exists bum_team_memberships_invited_by_idx
  on public.bum_team_memberships (invited_by)
  where invited_by is not null;

drop trigger if exists set_bum_team_memberships_updated_at on public.bum_team_memberships;
create trigger set_bum_team_memberships_updated_at
before update on public.bum_team_memberships
for each row execute function public.set_updated_at();

alter table public.bum_team_memberships enable row level security;

grant select, insert, update on public.bum_team_memberships to anon, authenticated;

drop policy if exists "Admins can manage bum team memberships" on public.bum_team_memberships;
create policy "Admins can manage bum team memberships"
on public.bum_team_memberships for all
to anon, authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "Managing bums can read and invite team members" on public.bum_team_memberships;
create policy "Managing bums can read and invite team members"
on public.bum_team_memberships for all
to anon, authenticated
using (
  managing_bum_user_id = public.current_user_id()
  and exists (
    select 1
    from public.bum_profiles manager_profile
    where manager_profile.user_id = public.current_user_id()
      and manager_profile.is_managing_bum = true
  )
)
with check (
  managing_bum_user_id = public.current_user_id()
  and exists (
    select 1
    from public.bum_profiles manager_profile
    where manager_profile.user_id = public.current_user_id()
      and manager_profile.is_managing_bum = true
  )
);

drop policy if exists "Team members can read own memberships" on public.bum_team_memberships;
create policy "Team members can read own memberships"
on public.bum_team_memberships for select
to anon, authenticated
using (member_bum_user_id = public.current_user_id());

create table if not exists public.managing_bum_commission_allocations (
  id uuid primary key default gen_random_uuid(),
  bum_payout_id uuid not null references public.bum_payouts(id) on delete cascade,
  claim_invoice_id uuid not null references public.claim_invoices(id) on delete cascade,
  opportunity_claim_id uuid not null references public.opportunity_claims(id) on delete cascade,
  managing_bum_user_id text not null references public.profiles(id) on delete cascade,
  member_bum_user_id text not null references public.profiles(id) on delete cascade,
  manager_commission_percent numeric not null check (manager_commission_percent between 0 and 100),
  allocation_amount numeric not null default 0 check (allocation_amount >= 0),
  currency text not null default 'USD',
  status text not null default 'PENDING_ALLOCATION' check (status in ('PENDING_ALLOCATION', 'APPROVED', 'PAID', 'VOID')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists managing_bum_allocations_payout_unique
  on public.managing_bum_commission_allocations (bum_payout_id);

create index if not exists managing_bum_allocations_manager_idx
  on public.managing_bum_commission_allocations (managing_bum_user_id, created_at desc);

create index if not exists managing_bum_allocations_invoice_idx
  on public.managing_bum_commission_allocations (claim_invoice_id);

create index if not exists managing_bum_allocations_opportunity_claim_idx
  on public.managing_bum_commission_allocations (opportunity_claim_id);

create index if not exists managing_bum_allocations_member_idx
  on public.managing_bum_commission_allocations (member_bum_user_id, created_at desc);

drop trigger if exists set_managing_bum_commission_allocations_updated_at on public.managing_bum_commission_allocations;
create trigger set_managing_bum_commission_allocations_updated_at
before update on public.managing_bum_commission_allocations
for each row execute function public.set_updated_at();

alter table public.managing_bum_commission_allocations enable row level security;

grant select, insert, update on public.managing_bum_commission_allocations to anon, authenticated;

drop policy if exists "Admins can manage managing bum allocations" on public.managing_bum_commission_allocations;
create policy "Admins can manage managing bum allocations"
on public.managing_bum_commission_allocations for all
to anon, authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "Managing bums can read own allocations" on public.managing_bum_commission_allocations;
create policy "Managing bums can read own allocations"
on public.managing_bum_commission_allocations for select
to anon, authenticated
using (managing_bum_user_id = public.current_user_id());
