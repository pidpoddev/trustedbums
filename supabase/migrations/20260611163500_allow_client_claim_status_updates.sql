drop policy if exists "Clients can update own company claim statuses before introduction made" on public.opportunity_claims;
create policy "Clients can update own company claim statuses before introduction made"
on public.opportunity_claims for update
to anon, authenticated
using (
  company_id = public.current_company_id()
  and status <> 'MEETING_HELD'
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'CLIENT'
      and profile.client_access_role in ('CLIENT_ADMIN', 'CLIENT_MEMBER')
  )
)
with check (
  company_id = public.current_company_id()
  and status in ('APPROVED', 'DECLINED', 'SCHEDULED', 'MEETING_HELD')
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'CLIENT'
      and profile.client_access_role in ('CLIENT_ADMIN', 'CLIENT_MEMBER')
  )
);
