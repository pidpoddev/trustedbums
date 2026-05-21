alter table public.profiles
  add column if not exists client_access_role text not null default 'CLIENT_ADMIN';

alter table public.profiles
  drop constraint if exists profiles_client_access_role_check;

alter table public.profiles
  add constraint profiles_client_access_role_check
  check (client_access_role in ('CLIENT_ADMIN', 'CLIENT_FINANCE', 'CLIENT_MEMBER'));

update public.profiles
set client_access_role = 'CLIENT_ADMIN'
where client_access_role is null;

create table if not exists public.client_team_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  full_name text,
  client_access_role text not null default 'CLIENT_MEMBER'
    constraint client_team_invitations_access_role_check
    check (client_access_role in ('CLIENT_ADMIN', 'CLIENT_FINANCE', 'CLIENT_MEMBER')),
  status text not null default 'pending'
    constraint client_team_invitations_status_check
    check (status in ('pending', 'accepted', 'revoked', 'failed')),
  invited_by text references public.profiles(id) on delete set null,
  clerk_invitation_id text,
  error_message text,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists client_team_invitations_pending_email_idx
  on public.client_team_invitations (company_id, lower(email))
  where status = 'pending';

create index if not exists client_team_invitations_company_created_idx
  on public.client_team_invitations (company_id, created_at desc);

drop trigger if exists set_client_team_invitations_updated_at on public.client_team_invitations;
create trigger set_client_team_invitations_updated_at
before update on public.client_team_invitations
for each row execute function public.set_updated_at();

grant select, update on public.profiles to authenticated;
grant select on public.client_team_invitations to authenticated;

alter table public.client_team_invitations enable row level security;
