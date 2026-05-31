alter table public.profiles
  add column if not exists access_status text not null default 'APPROVED',
  add column if not exists disabled_at timestamptz,
  add column if not exists disabled_by text references public.profiles(id) on delete set null,
  add column if not exists notification_preferences jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_access_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_access_status_check
      check (access_status in ('PENDING', 'APPROVED', 'DENIED', 'DISABLED'));
  end if;
end
$$;

update public.profiles
set access_status = case
  when disabled_at is not null then 'DISABLED'
  when role is null then 'PENDING'
  else 'APPROVED'
end
where access_status is null
   or access_status = 'APPROVED';

create table if not exists public.client_company_access_requests (
  id uuid primary key default gen_random_uuid(),
  requester_profile_id text references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  email text not null,
  email_domain text,
  requested_company_name text,
  requested_domain text,
  requested_role text,
  request_type text not null,
  status text not null default 'pending',
  evidence jsonb not null default '{}'::jsonb,
  requested_by text references public.profiles(id) on delete set null,
  reviewed_by text references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_company_access_requests_type_check
    check (request_type in ('AUTO_DOMAIN_CLAIM', 'SAME_DOMAIN_ACCESS', 'PUBLIC_EMAIL_COMPANY', 'RELATED_DOMAIN', 'BUM_SIGNUP')),
  constraint client_company_access_requests_status_check
    check (status in ('pending', 'approved', 'denied', 'cancelled')),
  constraint client_company_access_requests_role_check
    check (requested_role is null or requested_role in ('CLIENT_ADMIN', 'CLIENT_FINANCE', 'CLIENT_MEMBER', 'BUM'))
);

create index if not exists client_company_access_requests_company_status_idx
  on public.client_company_access_requests (company_id, status, created_at desc);

create index if not exists client_company_access_requests_requester_status_idx
  on public.client_company_access_requests (requester_profile_id, status, created_at desc);

create unique index if not exists client_company_access_requests_pending_request_idx
  on public.client_company_access_requests (
    coalesce(requester_profile_id, ''),
    coalesce(company_id::text, ''),
    coalesce(requested_domain, ''),
    request_type
  )
  where status = 'pending';

drop trigger if exists set_client_company_access_requests_updated_at on public.client_company_access_requests;
create trigger set_client_company_access_requests_updated_at
before update on public.client_company_access_requests
for each row execute function public.set_updated_at();

grant select on public.client_company_access_requests to authenticated;

alter table public.client_company_access_requests enable row level security;

drop policy if exists "Users can read own company access requests" on public.client_company_access_requests;
create policy "Users can read own company access requests"
on public.client_company_access_requests for select
to authenticated
using (
  requester_profile_id = public.current_user_id()
  or requested_by = public.current_user_id()
  or public.is_admin()
);

drop policy if exists "Users can create own profile" on public.profiles;

drop policy if exists "Authenticated users can manage company domains" on public.company_domains;
drop policy if exists "Admins can manage company domains" on public.company_domains;
create policy "Admins can manage company domains"
on public.company_domains for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.prevent_profile_self_authorization_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id text := public.current_user_id();
  current_is_admin boolean := public.is_admin();
begin
  if current_profile_id is null or current_is_admin then
    return new;
  end if;

  if old.id = current_profile_id and (
    new.role is distinct from old.role
    or new.is_admin is distinct from old.is_admin
    or new.company_id is distinct from old.company_id
    or new.client_access_role is distinct from old.client_access_role
    or new.access_status is distinct from old.access_status
    or new.disabled_at is distinct from old.disabled_at
    or new.disabled_by is distinct from old.disabled_by
  ) then
    raise exception 'Authorization-bearing profile fields require an approved server path.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_self_authorization_mutation on public.profiles;
create trigger prevent_profile_self_authorization_mutation
before update on public.profiles
for each row execute function public.prevent_profile_self_authorization_mutation();
