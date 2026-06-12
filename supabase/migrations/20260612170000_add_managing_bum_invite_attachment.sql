alter table public.bum_team_memberships
  alter column member_bum_user_id drop not null,
  add column if not exists clerk_invitation_id text;

alter table public.bum_team_memberships
  drop constraint if exists bum_team_memberships_not_self_check;

alter table public.bum_team_memberships
  add constraint bum_team_memberships_not_self_check
  check (member_bum_user_id is null or managing_bum_user_id <> member_bum_user_id);

alter table public.bum_team_memberships
  drop constraint if exists bum_team_memberships_member_or_invite_check;

alter table public.bum_team_memberships
  add constraint bum_team_memberships_member_or_invite_check
  check (member_bum_user_id is not null or invite_email is not null);

drop index if exists public.bum_team_memberships_manager_member_unique;

create unique index if not exists bum_team_memberships_manager_member_unique
  on public.bum_team_memberships (managing_bum_user_id, member_bum_user_id)
  where member_bum_user_id is not null;

create unique index if not exists bum_team_memberships_manager_invite_email_unique
  on public.bum_team_memberships (managing_bum_user_id, lower(invite_email))
  where member_bum_user_id is null and invite_email is not null and status <> 'REMOVED';

create index if not exists bum_team_memberships_invite_email_idx
  on public.bum_team_memberships (lower(invite_email))
  where invite_email is not null;

create index if not exists bum_team_memberships_clerk_invitation_idx
  on public.bum_team_memberships (clerk_invitation_id)
  where clerk_invitation_id is not null;
