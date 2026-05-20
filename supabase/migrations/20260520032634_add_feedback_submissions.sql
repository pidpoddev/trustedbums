create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  created_by text not null constraint feedback_submissions_created_by_fkey references public.profiles(id) on delete cascade,
  company_id uuid constraint feedback_submissions_company_id_fkey references public.companies(id) on delete set null,
  role text,
  client_access_role text,
  submitter_name text,
  submitter_email text,
  type text not null,
  title text not null,
  description text not null,
  page_url text not null,
  page_path text not null,
  user_agent text,
  status text not null default 'OPEN',
  admin_notes text,
  completed_at timestamptz,
  completed_by text constraint feedback_submissions_completed_by_fkey references public.profiles(id) on delete set null,
  notification_sent_at timestamptz,
  notification_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint feedback_submissions_type_check check (type in ('BUG', 'FEATURE', 'QUESTION', 'OTHER')),
  constraint feedback_submissions_status_check check (status in ('OPEN', 'IN_REVIEW', 'COMPLETE'))
);

create index if not exists feedback_submissions_status_created_at_idx
  on public.feedback_submissions (status, created_at desc);

create index if not exists feedback_submissions_created_by_created_at_idx
  on public.feedback_submissions (created_by, created_at desc);

drop trigger if exists set_feedback_submissions_updated_at on public.feedback_submissions;
create trigger set_feedback_submissions_updated_at
before update on public.feedback_submissions
for each row execute function public.set_updated_at();

alter table public.feedback_submissions enable row level security;

grant select, insert, update on public.feedback_submissions to authenticated;
grant all on public.feedback_submissions to service_role;

drop policy if exists "Users can read own feedback" on public.feedback_submissions;
create policy "Users can read own feedback"
on public.feedback_submissions for select
to authenticated
using (created_by = public.current_user_id() or public.is_admin());

drop policy if exists "Users can create own feedback" on public.feedback_submissions;
create policy "Users can create own feedback"
on public.feedback_submissions for insert
to authenticated
with check (created_by = public.current_user_id());

drop policy if exists "Admins can update feedback" on public.feedback_submissions;
create policy "Admins can update feedback"
on public.feedback_submissions for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
