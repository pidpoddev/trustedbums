drop policy if exists "Bums can read customer targets for scheduling" on public.customer_targets;
create policy "Bums can read customer targets for scheduling"
on public.customer_targets for select
to anon, authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'BUM'
  )
);
