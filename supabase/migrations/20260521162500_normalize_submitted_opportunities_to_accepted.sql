create or replace function public.normalize_submitted_opportunity_status()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'Submitted' then
    new.status = 'Accepted';
  end if;

  return new;
end;
$$;

drop trigger if exists normalize_submitted_opportunity_status on public.opportunity_registrations;
create trigger normalize_submitted_opportunity_status
before insert or update of status on public.opportunity_registrations
for each row execute function public.normalize_submitted_opportunity_status();
