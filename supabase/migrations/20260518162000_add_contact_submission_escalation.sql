alter table public.contact_submissions
  add column if not exists admin_notes text,
  add column if not exists escalated_to text,
  add column if not exists escalated_entity_id text,
  add column if not exists escalated_at timestamp with time zone,
  add column if not exists escalated_by text references public.profiles(id) on delete set null;

do $$
begin
  alter table public.contact_submissions
    drop constraint if exists contact_submissions_status_check;

  alter table public.contact_submissions
    add constraint contact_submissions_status_check
    check (status in ('NEW', 'REVIEWED', 'INVITED', 'REPLIED', 'ESCALATED', 'ARCHIVED'));

  alter table public.contact_submissions
    drop constraint if exists contact_submissions_escalated_to_check;

  alter table public.contact_submissions
    add constraint contact_submissions_escalated_to_check
    check (escalated_to is null or escalated_to in ('CLIENT_TARGET', 'BUM_PROFILE', 'BUM_INVITE'));
end
$$;

create index if not exists contact_submissions_status_created_idx
  on public.contact_submissions (status, created_at desc);
