grant delete on public.opportunity_registrations to anon, authenticated;

drop policy if exists "Client users can delete unclaimed company opportunity registrations" on public.opportunity_registrations;
create policy "Client users can delete unclaimed company opportunity registrations"
on public.opportunity_registrations for delete
to anon, authenticated
using (
  company_id = public.current_company_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'CLIENT'
  )
  and not exists (
    select 1
    from public.opportunity_claims claim
    where claim.opportunity_registration_id = opportunity_registrations.id
  )
);
