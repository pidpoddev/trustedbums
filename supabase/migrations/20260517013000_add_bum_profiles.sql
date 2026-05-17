create table if not exists public.bum_profiles (
  user_id text primary key references public.profiles(id) on delete cascade,
  headline text,
  bio text,
  linkedin_url text,
  years_experience integer,
  availability_status text not null default 'open' check (availability_status in ('open', 'selective', 'unavailable')),
  home_region text,
  industries text[] not null default '{}'::text[],
  regions text[] not null default '{}'::text[],
  products_sold text[] not null default '{}'::text[],
  buyer_personas text[] not null default '{}'::text[],
  worked_with_companies text[] not null default '{}'::text[],
  relationship_companies text[] not null default '{}'::text[],
  certifications text[] not null default '{}'::text[],
  skills text[] not null default '{}'::text[],
  notable_wins text,
  verification_status text not null default 'self_reported' check (verification_status in ('self_reported', 'reviewed', 'verified')),
  is_visible_to_clients boolean not null default true,
  last_linkedin_imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bum_profiles_years_experience_check check (years_experience is null or years_experience between 0 and 80)
);

create index if not exists bum_profiles_visible_updated_idx
  on public.bum_profiles (is_visible_to_clients, updated_at desc);

create index if not exists bum_profiles_industries_gin_idx
  on public.bum_profiles using gin (industries);

create index if not exists bum_profiles_relationship_companies_gin_idx
  on public.bum_profiles using gin (relationship_companies);

drop trigger if exists set_bum_profiles_updated_at on public.bum_profiles;
create trigger set_bum_profiles_updated_at
before update on public.bum_profiles
for each row execute function public.set_updated_at();

grant select, insert, update on public.bum_profiles to anon, authenticated;

alter table public.bum_profiles enable row level security;

drop policy if exists "Bums can read own profile" on public.bum_profiles;
create policy "Bums can read own profile"
on public.bum_profiles
for select
to anon, authenticated
using (user_id = public.current_user_id());

drop policy if exists "Bums can create own profile" on public.bum_profiles;
create policy "Bums can create own profile"
on public.bum_profiles
for insert
to anon, authenticated
with check (user_id = public.current_user_id());

drop policy if exists "Bums can update own profile" on public.bum_profiles;
create policy "Bums can update own profile"
on public.bum_profiles
for update
to anon, authenticated
using (user_id = public.current_user_id())
with check (user_id = public.current_user_id());

drop policy if exists "Admins can manage bum profiles" on public.bum_profiles;
create policy "Admins can manage bum profiles"
on public.bum_profiles
for all
to anon, authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Clients can read visible bum profiles" on public.bum_profiles;
create policy "Clients can read visible bum profiles"
on public.bum_profiles
for select
to anon, authenticated
using (
  is_visible_to_clients
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and profile.role = 'CLIENT'
  )
);
