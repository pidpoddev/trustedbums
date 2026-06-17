alter table public.admin_scrum_items
  add column if not exists owner text;

update public.admin_scrum_items
set owner = owner_label
where owner is null
  and owner_label is not null;

create or replace function public.sync_admin_scrum_item_owner_fields()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.owner is null and new.owner_label is not null then
      new.owner := new.owner_label;
    elsif new.owner_label is null and new.owner is not null then
      new.owner_label := new.owner;
    end if;

    return new;
  end if;

  if new.owner is null and new.owner_label is not null then
    new.owner := new.owner_label;
  elsif new.owner_label is null and new.owner is not null then
    new.owner_label := new.owner;
  elsif new.owner is distinct from old.owner and new.owner_label is not distinct from old.owner_label then
    new.owner_label := new.owner;
  elsif new.owner_label is distinct from old.owner_label and new.owner is not distinct from old.owner then
    new.owner := new.owner_label;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_admin_scrum_item_owner_fields on public.admin_scrum_items;

create trigger sync_admin_scrum_item_owner_fields
before insert or update on public.admin_scrum_items
for each row
execute function public.sync_admin_scrum_item_owner_fields();
