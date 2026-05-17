drop policy if exists "Users can read own opportunity registrations" on public.opportunity_registrations;
create policy "Users can read own company opportunity registrations"
on public.opportunity_registrations for select
to anon, authenticated
using (
  created_by = public.current_user_id()
  or company_id = public.current_company_id()
  or public.is_admin()
);

drop policy if exists "Client users can update own company opportunity registrations" on public.opportunity_registrations;
create policy "Client users can update own company opportunity registrations"
on public.opportunity_registrations for update
to anon, authenticated
using (
  company_id = public.current_company_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'CLIENT'
  )
)
with check (
  company_id = public.current_company_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'CLIENT'
  )
);
