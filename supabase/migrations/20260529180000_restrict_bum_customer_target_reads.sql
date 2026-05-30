drop policy if exists "Bums can read customer targets for scheduling" on public.customer_targets;

create policy "Bums can read explicitly assigned customer targets"
on public.customer_targets for select
to authenticated
using (
  exists (
    select 1
    from public.customer_target_responses response
    where response.customer_target_id = public.customer_targets.id
      and response.bum_user_id = public.current_user_id()
      and response.status in ('ACCEPTED', 'CONTACTED', 'MEETING_SET')
  )
  or exists (
    select 1
    from public.teams_meetings meeting
    where meeting.customer_target_id = public.customer_targets.id
      and meeting.scheduled_by = public.current_user_id()
      and meeting.status in ('SCHEDULED', 'COMPLETED')
  )
  or exists (
    select 1
    from public.bum_saved_items saved
    where saved.customer_target_id = public.customer_targets.id
      and saved.bum_user_id = public.current_user_id()
      and saved.item_type = 'CUSTOMER_TARGET'
  )
);
