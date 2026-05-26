create table if not exists public.bum_contacts (
  id uuid primary key default gen_random_uuid(),
  bum_user_id text not null references public.profiles(id) on delete cascade,
  source_type text not null default 'MANUAL',
  source_id text,
  extension_page_capture_id uuid references public.extension_page_captures(id) on delete set null,
  opportunity_registration_id uuid references public.opportunity_registrations(id) on delete set null,
  customer_target_id uuid references public.customer_targets(id) on delete set null,
  full_name text not null,
  title text,
  company_name text,
  email text,
  phone_numbers jsonb not null default '[]'::jsonb,
  linkedin_url text,
  relationship_strength text,
  status text not null default 'ACTIVE',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bum_contacts_source_type_check check (source_type in ('OPPORTUNITY_CLAIM', 'PROSPECT', 'TARGET_RESPONSE', 'EXTENSION_CAPTURE', 'MANUAL')),
  constraint bum_contacts_phone_numbers_array_check check (jsonb_typeof(phone_numbers) = 'array')
);

create unique index if not exists bum_contacts_source_unique_idx
  on public.bum_contacts (bum_user_id, source_type, source_id)
  where source_id is not null;

create index if not exists bum_contacts_bum_created_idx
  on public.bum_contacts (bum_user_id, created_at desc);

create index if not exists bum_contacts_opportunity_idx
  on public.bum_contacts (opportunity_registration_id, created_at desc)
  where opportunity_registration_id is not null;

create index if not exists bum_contacts_extension_capture_idx
  on public.bum_contacts (extension_page_capture_id)
  where extension_page_capture_id is not null;

create index if not exists bum_contacts_linkedin_idx
  on public.bum_contacts (bum_user_id, lower(linkedin_url))
  where linkedin_url is not null;

drop trigger if exists set_bum_contacts_updated_at on public.bum_contacts;
create trigger set_bum_contacts_updated_at
before update on public.bum_contacts
for each row execute function public.set_updated_at();

alter table public.bum_contacts enable row level security;

grant select, insert, update on public.bum_contacts to authenticated;
grant all on public.bum_contacts to service_role;

drop policy if exists "Bums can read own contacts" on public.bum_contacts;
create policy "Bums can read own contacts"
on public.bum_contacts for select
to authenticated
using (public.is_admin() or bum_user_id = public.current_user_id());

drop policy if exists "Bums can create own contacts" on public.bum_contacts;
create policy "Bums can create own contacts"
on public.bum_contacts for insert
to authenticated
with check (public.is_admin() or bum_user_id = public.current_user_id());

drop policy if exists "Bums can update own contacts" on public.bum_contacts;
create policy "Bums can update own contacts"
on public.bum_contacts for update
to authenticated
using (public.is_admin() or bum_user_id = public.current_user_id())
with check (public.is_admin() or bum_user_id = public.current_user_id());
