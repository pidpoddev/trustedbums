alter table public.bum_contacts
  add column if not exists is_inner_circle boolean not null default false;

alter table public.opportunity_claim_contacts
  add column if not exists is_inner_circle boolean not null default false;

create index if not exists bum_contacts_inner_circle_idx
  on public.bum_contacts (bum_user_id, created_at desc)
  where is_inner_circle and source_type <> 'OPPORTUNITY_CLAIM';

create index if not exists opportunity_claim_contacts_inner_circle_idx
  on public.opportunity_claim_contacts (opportunity_claim_id, sort_order, created_at)
  where is_inner_circle;

create or replace function public.enforce_bum_inner_circle_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  inner_circle_count integer;
begin
  if new.is_inner_circle is not true or new.source_type = 'OPPORTUNITY_CLAIM' then
    return new;
  end if;

  select count(*)
    into inner_circle_count
  from public.bum_contacts contact
  where contact.bum_user_id = new.bum_user_id
    and contact.is_inner_circle is true
    and contact.source_type <> 'OPPORTUNITY_CLAIM'
    and contact.id <> new.id;

  if inner_circle_count >= 20 then
    raise exception 'Inner Circle is limited to 20 contacts.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_bum_inner_circle_limit on public.bum_contacts;
create trigger enforce_bum_inner_circle_limit
before insert or update of is_inner_circle, bum_user_id, source_type
on public.bum_contacts
for each row execute function public.enforce_bum_inner_circle_limit();
