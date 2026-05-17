create table if not exists public.teams_meetings (
  id uuid primary key default gen_random_uuid(),
  customer_target_id uuid not null references public.customer_targets(id) on delete cascade,
  client_company_id uuid not null references public.companies(id) on delete cascade,
  target_company_id uuid not null references public.companies(id) on delete cascade,
  scheduled_by text not null references public.profiles(id) on delete cascade,
  subject text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  attendees jsonb not null default '[]'::jsonb,
  teams_join_url text,
  microsoft_event_id text,
  microsoft_event_web_link text,
  status text not null default 'SCHEDULED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teams_meetings_status_check check (status in ('SCHEDULED', 'CANCELLED', 'COMPLETED')),
  constraint teams_meetings_time_check check (end_time > start_time)
);

create index if not exists teams_meetings_customer_target_idx
  on public.teams_meetings (customer_target_id, start_time desc);

create index if not exists teams_meetings_scheduled_by_idx
  on public.teams_meetings (scheduled_by, start_time desc);

drop trigger if exists set_teams_meetings_updated_at on public.teams_meetings;
create trigger set_teams_meetings_updated_at
before update on public.teams_meetings
for each row execute function public.set_updated_at();

grant select, insert, update on public.teams_meetings to anon, authenticated;

alter table public.teams_meetings enable row level security;

drop policy if exists "Users can read relevant Teams meetings" on public.teams_meetings;
create policy "Users can read relevant Teams meetings"
on public.teams_meetings for select
to anon, authenticated
using (
  public.is_admin()
  or scheduled_by = public.current_user_id()
  or client_company_id = public.current_company_id()
);

drop policy if exists "Admins can manage Teams meetings" on public.teams_meetings;
create policy "Admins can manage Teams meetings"
on public.teams_meetings for all
to anon, authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Bums can read customer targets for scheduling" on public.customer_targets;
create policy "Bums can read customer targets for scheduling"
on public.customer_targets for select
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'BUM'
  )
);
