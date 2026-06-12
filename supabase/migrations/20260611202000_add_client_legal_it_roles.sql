alter table public.profiles
  drop constraint if exists profiles_client_access_role_check;

alter table public.profiles
  add constraint profiles_client_access_role_check
  check (client_access_role in ('CLIENT_ADMIN', 'CLIENT_FINANCE', 'CLIENT_LEGAL', 'CLIENT_IT', 'CLIENT_MEMBER'));

alter table public.client_team_invitations
  drop constraint if exists client_team_invitations_access_role_check;

alter table public.client_team_invitations
  add constraint client_team_invitations_access_role_check
  check (client_access_role in ('CLIENT_ADMIN', 'CLIENT_FINANCE', 'CLIENT_LEGAL', 'CLIENT_IT', 'CLIENT_MEMBER'));

alter table public.client_company_access_requests
  drop constraint if exists client_company_access_requests_role_check;

alter table public.client_company_access_requests
  add constraint client_company_access_requests_role_check
  check (requested_role is null or requested_role in ('CLIENT_ADMIN', 'CLIENT_FINANCE', 'CLIENT_LEGAL', 'CLIENT_IT', 'CLIENT_MEMBER', 'BUM'));
