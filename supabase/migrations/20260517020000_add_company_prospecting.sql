alter table public.companies
  add column if not exists relationship_stage text not null default 'CLIENT',
  add column if not exists linkedin_company_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'companies_relationship_stage_check'
  ) then
    alter table public.companies
      add constraint companies_relationship_stage_check
      check (relationship_stage in ('PROSPECT', 'INVITED', 'CLIENT', 'INACTIVE'));
  end if;
end
$$;

create table if not exists public.company_domains (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  domain text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists company_domains_domain_key
  on public.company_domains (domain);

create unique index if not exists company_domains_primary_company_idx
  on public.company_domains (company_id)
  where is_primary;

create table if not exists public.prospect_recommendations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  bum_user_id text not null references public.profiles(id) on delete cascade,
  invite_owner text not null default 'BUM',
  status text not null default 'PROSPECT',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists prospect_recommendations_company_bum_idx
  on public.prospect_recommendations (company_id, bum_user_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'prospect_recommendations_invite_owner_check'
  ) then
    alter table public.prospect_recommendations
      add constraint prospect_recommendations_invite_owner_check
      check (invite_owner in ('BUM', 'TRUSTED_BUMS'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'prospect_recommendations_status_check'
  ) then
    alter table public.prospect_recommendations
      add constraint prospect_recommendations_status_check
      check (status in ('PROSPECT', 'INVITED', 'CLIENT', 'CLOSED_LOST'));
  end if;
end
$$;

drop trigger if exists set_prospect_recommendations_updated_at on public.prospect_recommendations;
create trigger set_prospect_recommendations_updated_at
before update on public.prospect_recommendations
for each row execute function public.set_updated_at();

create table if not exists public.prospect_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  recommendation_id uuid references public.prospect_recommendations(id) on delete cascade,
  full_name text not null,
  title text,
  email text,
  linkedin_url text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists prospect_contacts_company_idx
  on public.prospect_contacts (company_id, created_at desc);

create unique index if not exists prospect_contacts_recommendation_primary_idx
  on public.prospect_contacts (recommendation_id)
  where is_primary and recommendation_id is not null;

alter table public.company_domains enable row level security;
alter table public.prospect_recommendations enable row level security;
alter table public.prospect_contacts enable row level security;

drop policy if exists "Authenticated users can read companies for matching" on public.companies;
create policy "Authenticated users can read companies for matching"
on public.companies for select
to authenticated
using (true);

drop policy if exists "Users can update own company stage" on public.companies;
create policy "Users can update own company stage"
on public.companies for update
to authenticated
using (id = public.current_company_id() or public.is_admin())
with check (id = public.current_company_id() or public.is_admin());

drop policy if exists "Authenticated users can read company domains" on public.company_domains;
create policy "Authenticated users can read company domains"
on public.company_domains for select
to authenticated
using (true);

drop policy if exists "Authenticated users can manage company domains" on public.company_domains;
create policy "Authenticated users can manage company domains"
on public.company_domains for all
to authenticated
using (true)
with check (true);

drop policy if exists "Bums can read own prospect recommendations" on public.prospect_recommendations;
create policy "Bums can read own prospect recommendations"
on public.prospect_recommendations for select
to authenticated
using (
  public.is_admin()
  or bum_user_id = public.current_user_id()
);

drop policy if exists "Bums can create own prospect recommendations" on public.prospect_recommendations;
create policy "Bums can create own prospect recommendations"
on public.prospect_recommendations for insert
to authenticated
with check (
  public.is_admin()
  or bum_user_id = public.current_user_id()
);

drop policy if exists "Admins can update prospect recommendations" on public.prospect_recommendations;
create policy "Admins can update prospect recommendations"
on public.prospect_recommendations for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Bums can read relevant prospect contacts" on public.prospect_contacts;
create policy "Bums can read relevant prospect contacts"
on public.prospect_contacts for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.prospect_recommendations recommendation
    where recommendation.id = public.prospect_contacts.recommendation_id
      and recommendation.bum_user_id = public.current_user_id()
  )
);

drop policy if exists "Bums can create own prospect contacts" on public.prospect_contacts;
create policy "Bums can create own prospect contacts"
on public.prospect_contacts for insert
to authenticated
with check (
  public.is_admin()
  or exists (
    select 1
    from public.prospect_recommendations recommendation
    where recommendation.id = public.prospect_contacts.recommendation_id
      and recommendation.bum_user_id = public.current_user_id()
  )
);

drop policy if exists "Admins can update prospect contacts" on public.prospect_contacts;
create policy "Admins can update prospect contacts"
on public.prospect_contacts for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
