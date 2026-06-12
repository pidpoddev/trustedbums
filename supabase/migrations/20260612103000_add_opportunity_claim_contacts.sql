create table if not exists public.opportunity_claim_contacts (
  id uuid primary key default gen_random_uuid(),
  opportunity_claim_id uuid not null references public.opportunity_claims(id) on delete cascade,
  opportunity_registration_id uuid not null references public.opportunity_registrations(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  bum_user_id text not null references public.profiles(id) on delete cascade,
  contact_name text not null,
  contact_company text not null,
  contact_title text,
  contact_email text,
  linkedin_url text,
  buying_role text not null default 'OTHER' check (buying_role in ('DECISION_MAKER', 'PURCHASING_LEADER', 'TECHNICAL_LEADER', 'CHAMPION', 'BLOCKER', 'INFLUENCER', 'OTHER')),
  relationship_strength text not null default 'MODERATE' check (relationship_strength in ('STRONG', 'MODERATE', 'WEAK')),
  note text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunity_claim_contacts_claim_sort_idx
  on public.opportunity_claim_contacts (opportunity_claim_id, sort_order, created_at);

create index if not exists opportunity_claim_contacts_opportunity_idx
  on public.opportunity_claim_contacts (opportunity_registration_id, created_at desc);

create index if not exists opportunity_claim_contacts_bum_idx
  on public.opportunity_claim_contacts (bum_user_id, created_at desc);

create unique index if not exists opportunity_claim_contacts_claim_contact_idx
  on public.opportunity_claim_contacts (opportunity_claim_id, lower(contact_name), lower(contact_company));

drop trigger if exists set_opportunity_claim_contacts_updated_at on public.opportunity_claim_contacts;
create trigger set_opportunity_claim_contacts_updated_at
before update on public.opportunity_claim_contacts
for each row execute function public.set_updated_at();

alter table public.opportunity_claim_contacts enable row level security;

grant select, insert, update on public.opportunity_claim_contacts to anon, authenticated;

drop policy if exists "Users can read relevant opportunity claim contacts" on public.opportunity_claim_contacts;
create policy "Users can read relevant opportunity claim contacts"
on public.opportunity_claim_contacts for select
to anon, authenticated
using (
  public.is_admin()
  or bum_user_id = public.current_user_id()
  or company_id = public.current_company_id()
);

drop policy if exists "Bums can create own opportunity claim contacts" on public.opportunity_claim_contacts;
create policy "Bums can create own opportunity claim contacts"
on public.opportunity_claim_contacts for insert
to anon, authenticated
with check (
  bum_user_id = public.current_user_id()
  and exists (
    select 1
    from public.opportunity_claims claim
    where claim.id = opportunity_claim_contacts.opportunity_claim_id
      and claim.bum_user_id = public.current_user_id()
      and claim.opportunity_registration_id = opportunity_claim_contacts.opportunity_registration_id
  )
);

drop policy if exists "Bums and admins can update opportunity claim contacts" on public.opportunity_claim_contacts;
create policy "Bums and admins can update opportunity claim contacts"
on public.opportunity_claim_contacts for update
to anon, authenticated
using (bum_user_id = public.current_user_id() or public.is_admin())
with check (bum_user_id = public.current_user_id() or public.is_admin());
