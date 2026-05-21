drop policy if exists "Client admins can read own company team invitations" on public.client_team_invitations;
drop policy if exists "Client admins can read own company profiles" on public.profiles;
drop function if exists public.is_client_admin();

drop policy if exists "No direct client team invitation reads" on public.client_team_invitations;
create policy "No direct client team invitation reads"
on public.client_team_invitations for select
to authenticated
using (false);
