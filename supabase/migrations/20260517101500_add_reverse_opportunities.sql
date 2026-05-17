create table if not exists public.reverse_opportunities (
  id uuid primary key default gen_random_uuid(),
  bum_user_id text not null references public.profiles(id) on delete cascade,
  vendor_company_id uuid not null references public.companies(id) on delete cascade,
  client_mode text not null check (client_mode in ('EXISTING_CLIENT', 'PROSPECT_CLIENT')),
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED', 'OUTREACH_READY', 'CLIENT_CONTACTED', 'CLIENT_INTERESTED', 'CONVERTED', 'CLOSED_LOST')),
  vendor_contact_name text,
  vendor_contact_title text,
  vendor_contact_email text,
  vendor_contact_linkedin_url text,
  customer_company_name text not null,
  customer_company_website text,
  customer_contact_name text,
  customer_contact_title text,
  customer_contact_email text,
  customer_need_summary text not null,
  expected_product_service text,
  estimated_deal_value numeric,
  expected_timeline text,
  notes text,
  converted_opportunity_registration_id uuid references public.opportunity_registrations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reverse_opportunities_bum_idx
  on public.reverse_opportunities (bum_user_id, created_at desc);

create index if not exists reverse_opportunities_vendor_idx
  on public.reverse_opportunities (vendor_company_id, created_at desc);

drop trigger if exists set_reverse_opportunities_updated_at on public.reverse_opportunities;
create trigger set_reverse_opportunities_updated_at
before update on public.reverse_opportunities
for each row execute function public.set_updated_at();

grant select, insert, update on public.reverse_opportunities to anon, authenticated;

alter table public.reverse_opportunities enable row level security;

drop policy if exists "Bums can read own reverse opportunities" on public.reverse_opportunities;
create policy "Bums can read own reverse opportunities"
on public.reverse_opportunities for select
to anon, authenticated
using (bum_user_id = public.current_user_id());

drop policy if exists "Bums can create own reverse opportunities" on public.reverse_opportunities;
create policy "Bums can create own reverse opportunities"
on public.reverse_opportunities for insert
to anon, authenticated
with check (bum_user_id = public.current_user_id());

drop policy if exists "Bums can update own reverse opportunities" on public.reverse_opportunities;
create policy "Bums can update own reverse opportunities"
on public.reverse_opportunities for update
to anon, authenticated
using (bum_user_id = public.current_user_id())
with check (bum_user_id = public.current_user_id());

drop policy if exists "Admins can manage reverse opportunities" on public.reverse_opportunities;
create policy "Admins can manage reverse opportunities"
on public.reverse_opportunities for all
to anon, authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Clients can read own reverse opportunities" on public.reverse_opportunities;
create policy "Clients can read own reverse opportunities"
on public.reverse_opportunities for select
to anon, authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and profile.role = 'CLIENT'
      and profile.company_id = public.reverse_opportunities.vendor_company_id
  )
);
