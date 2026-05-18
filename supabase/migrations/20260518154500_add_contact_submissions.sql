create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company_name text,
  interest text not null default 'CLIENT',
  target_accounts text,
  message text not null,
  source text not null default 'homepage',
  user_agent text,
  status text not null default 'NEW',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint contact_submissions_interest_check check (interest in ('CLIENT', 'BUM', 'GENERAL')),
  constraint contact_submissions_status_check check (status in ('NEW', 'REVIEWED', 'REPLIED', 'ARCHIVED')),
  constraint contact_submissions_email_check check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint contact_submissions_name_check check (length(trim(name)) between 2 and 160),
  constraint contact_submissions_message_check check (length(trim(message)) between 10 and 4000)
);

alter table public.contact_submissions enable row level security;

drop trigger if exists set_contact_submissions_updated_at on public.contact_submissions;
create trigger set_contact_submissions_updated_at
before update on public.contact_submissions
for each row execute function public.set_updated_at();

drop policy if exists "Anyone can submit contact forms" on public.contact_submissions;
create policy "Anyone can submit contact forms"
on public.contact_submissions
for insert
to anon, authenticated
with check (
  status = 'NEW'
  and source = 'homepage'
  and length(trim(name)) between 2 and 160
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and length(trim(message)) between 10 and 4000
);

drop policy if exists "Admins can read contact submissions" on public.contact_submissions;
create policy "Admins can read contact submissions"
on public.contact_submissions
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update contact submissions" on public.contact_submissions;
create policy "Admins can update contact submissions"
on public.contact_submissions
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant insert on public.contact_submissions to anon, authenticated;
grant select, update on public.contact_submissions to authenticated;
