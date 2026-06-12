create table if not exists public.api_access_keys (
  id uuid primary key default gen_random_uuid(),
  clerk_api_key_id text not null unique,
  subject_user_id text not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  description text,
  scopes text[] not null default '{}',
  claims jsonb not null default '{}'::jsonb,
  token_prefix text,
  status text not null default 'ACTIVE',
  expires_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  created_by text references public.profiles(id) on delete set null,
  refreshed_from_id uuid references public.api_access_keys(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint api_access_keys_status_check check (status in ('ACTIVE', 'REVOKED', 'EXPIRED')),
  constraint api_access_keys_client_owner_check check (company_id is not null)
);

drop trigger if exists set_api_access_keys_updated_at on public.api_access_keys;
create trigger set_api_access_keys_updated_at
before update on public.api_access_keys
for each row execute function public.set_updated_at();

alter table public.api_access_keys enable row level security;

drop policy if exists "Admins can manage API access keys" on public.api_access_keys;
create policy "Admins can manage API access keys"
on public.api_access_keys for all to authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "Client API managers can read company API keys" on public.api_access_keys;
create policy "Client API managers can read company API keys"
on public.api_access_keys for select to authenticated
using (
  company_id = private.current_company_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'CLIENT'
      and profile.company_id = public.api_access_keys.company_id
      and profile.client_access_role in ('CLIENT_ADMIN', 'CLIENT_IT')
      and profile.disabled_at is null
  )
);

grant select on public.api_access_keys to authenticated;

create index if not exists api_access_keys_company_status_idx
  on public.api_access_keys (company_id, status, created_at desc);

create index if not exists api_access_keys_subject_status_idx
  on public.api_access_keys (subject_user_id, status, created_at desc);
