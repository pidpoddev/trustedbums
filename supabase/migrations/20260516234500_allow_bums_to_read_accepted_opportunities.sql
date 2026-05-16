drop policy if exists "Bums can read accepted opportunities" on public.opportunity_registrations;

create policy "Bums can read accepted opportunities"
on public.opportunity_registrations for select
to anon, authenticated
using (
  status = 'Accepted'
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'BUM'
  )
);
