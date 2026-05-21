alter table public.opportunity_registrations
  alter column status set default 'Accepted';

with auto_accepted as (
  update public.opportunity_registrations
  set status = 'Accepted',
      updated_at = now()
  where status = 'Submitted'
  returning id
)
insert into public.opportunity_status_history (opportunity_id, old_status, new_status, changed_by)
select id, 'Submitted', 'Accepted', null
from auto_accepted;
