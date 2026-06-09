alter table public.admin_scrum_items
  drop constraint if exists admin_scrum_items_closeout_proof_check;

alter table public.admin_scrum_items
  add constraint admin_scrum_items_closeout_proof_check
  check (
    status not in ('CLOSED', 'WONT_FIX')
    or (
      closure_note is not null
      and length(trim(closure_note)) > 0
      and cardinality(evidence_links) > 0
    )
  );

create index if not exists admin_scrum_items_created_by_idx
  on public.admin_scrum_items (created_by);

create index if not exists admin_scrum_items_updated_by_idx
  on public.admin_scrum_items (updated_by);

create index if not exists admin_scrum_items_active_priority_idx
  on public.admin_scrum_items (priority, item_type, created_at desc)
  where status in ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'FIXED');

create or replace function public.set_admin_scrum_item_audit_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id text := public.current_user_id();
begin
  if tg_op = 'INSERT' then
    new.created_by := actor_id;
    new.updated_by := actor_id;
    return new;
  end if;

  new.created_by := old.created_by;
  new.updated_by := actor_id;
  return new;
end;
$$;

drop trigger if exists set_admin_scrum_item_audit_fields on public.admin_scrum_items;
create trigger set_admin_scrum_item_audit_fields
before insert or update on public.admin_scrum_items
for each row execute function public.set_admin_scrum_item_audit_fields();

create or replace function public.record_admin_scrum_item_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id text := public.current_user_id();
  event_name text := 'admin_scrum_item_updated';
begin
  if tg_op = 'INSERT' then
    event_name := 'admin_scrum_item_created';
  elsif new.status in ('CLOSED', 'WONT_FIX') and old.status is distinct from new.status then
    event_name := 'admin_scrum_item_closed';
  end if;

  insert into public.audit_events (
    user_id,
    event_type,
    entity_type,
    entity_id,
    event_data
  ) values (
    actor_id,
    event_name,
    'admin_scrum_item',
    new.id,
    jsonb_build_object(
      'tracking_id', new.tracking_id,
      'status', new.status,
      'priority', new.priority,
      'item_type', new.item_type,
      'source_key', new.source_key,
      'previous_status', case when tg_op = 'UPDATE' then old.status else null end
    )
  );

  return new;
end;
$$;

drop trigger if exists record_admin_scrum_item_audit_event on public.admin_scrum_items;
create trigger record_admin_scrum_item_audit_event
after insert or update on public.admin_scrum_items
for each row execute function public.record_admin_scrum_item_audit_event();
