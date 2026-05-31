create table if not exists public.terms_acceptance_deferrals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  terms_version_id uuid not null references public.terms_versions(id) on delete cascade,
  prior_terms_acceptance_id uuid references public.terms_acceptances(id) on delete set null,
  deferred_at timestamptz not null default now(),
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists terms_acceptance_deferrals_user_terms_idx
  on public.terms_acceptance_deferrals (user_id, terms_version_id, deferred_at desc);

create index if not exists terms_acceptance_deferrals_company_terms_idx
  on public.terms_acceptance_deferrals (company_id, terms_version_id, deferred_at desc)
  where company_id is not null;

create or replace function public.prevent_excess_terms_acceptance_deferrals()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (
    select count(*)
    from public.terms_acceptance_deferrals existing
    where existing.user_id = new.user_id
      and existing.terms_version_id = new.terms_version_id
  ) >= 3 then
    raise exception 'Updated terms can only be skipped three times before acceptance is required.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_excess_terms_acceptance_deferrals on public.terms_acceptance_deferrals;
create trigger prevent_excess_terms_acceptance_deferrals
before insert on public.terms_acceptance_deferrals
for each row execute function public.prevent_excess_terms_acceptance_deferrals();

grant select, insert on public.terms_acceptance_deferrals to authenticated;

alter table public.terms_acceptance_deferrals enable row level security;

drop policy if exists "Users can read own terms deferrals" on public.terms_acceptance_deferrals;
create policy "Users can read own terms deferrals"
on public.terms_acceptance_deferrals for select
to authenticated
using (
  user_id = public.current_user_id()
  or company_id = public.current_company_id()
  or public.is_admin()
);

drop policy if exists "Users can defer own updated terms" on public.terms_acceptance_deferrals;
create policy "Users can defer own updated terms"
on public.terms_acceptance_deferrals for insert
to authenticated
with check (
  user_id = public.current_user_id()
  and (company_id is null or company_id = public.current_company_id())
);
