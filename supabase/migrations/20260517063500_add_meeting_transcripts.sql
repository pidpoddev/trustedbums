alter table public.teams_meetings
  add column if not exists opportunity_registration_id uuid references public.opportunity_registrations(id) on delete set null,
  add column if not exists opportunity_claim_id uuid references public.opportunity_claims(id) on delete set null;

create index if not exists teams_meetings_opportunity_registration_idx
  on public.teams_meetings (opportunity_registration_id, start_time desc);

create table if not exists public.meeting_transcripts (
  id uuid primary key default gen_random_uuid(),
  teams_meeting_id uuid references public.teams_meetings(id) on delete set null,
  customer_target_id uuid references public.customer_targets(id) on delete set null,
  opportunity_registration_id uuid references public.opportunity_registrations(id) on delete set null,
  opportunity_claim_id uuid references public.opportunity_claims(id) on delete set null,
  company_id uuid references public.companies(id) on delete cascade,
  created_by text references public.profiles(id) on delete set null,
  source text not null default 'GRAPH' check (source in ('GRAPH', 'MANUAL', 'UPLOAD')),
  status text not null default 'AVAILABLE' check (status in ('PENDING', 'AVAILABLE', 'FAILED')),
  title text not null default 'Teams meeting transcript',
  transcript_text text,
  transcript_url text,
  content_type text not null default 'text/vtt',
  graph_transcript_id text,
  captured_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (transcript_text is not null or transcript_url is not null or status <> 'AVAILABLE')
);

create index if not exists meeting_transcripts_opportunity_created_at_idx
  on public.meeting_transcripts (opportunity_registration_id, created_at desc);

create index if not exists meeting_transcripts_target_created_at_idx
  on public.meeting_transcripts (customer_target_id, created_at desc);

create index if not exists meeting_transcripts_meeting_created_at_idx
  on public.meeting_transcripts (teams_meeting_id, created_at desc);

create unique index if not exists meeting_transcripts_graph_transcript_unique
  on public.meeting_transcripts (graph_transcript_id)
  where graph_transcript_id is not null;

drop trigger if exists set_meeting_transcripts_updated_at on public.meeting_transcripts;
create trigger set_meeting_transcripts_updated_at
before update on public.meeting_transcripts
for each row execute function public.set_updated_at();

alter table public.meeting_transcripts enable row level security;

grant select, insert, update on public.meeting_transcripts to anon, authenticated;

drop policy if exists "Users can read relevant meeting transcripts" on public.meeting_transcripts;
create policy "Users can read relevant meeting transcripts"
on public.meeting_transcripts for select
to anon, authenticated
using (
  public.is_admin()
  or company_id = public.current_company_id()
  or exists (
    select 1
    from public.opportunity_claims claim
    where claim.id = meeting_transcripts.opportunity_claim_id
      and claim.bum_user_id = public.current_user_id()
  )
  or exists (
    select 1
    from public.opportunity_registrations opportunity
    join public.profiles profile on profile.id = public.current_user_id()
    where opportunity.id = meeting_transcripts.opportunity_registration_id
      and opportunity.status = 'Accepted'
      and upper(coalesce(profile.role, '')) = 'BUM'
  )
);

drop policy if exists "Clients and admins can create meeting transcripts" on public.meeting_transcripts;
create policy "Clients and admins can create meeting transcripts"
on public.meeting_transcripts for insert
to anon, authenticated
with check (
  public.is_admin()
  or (
    company_id = public.current_company_id()
    and exists (
      select 1
      from public.profiles profile
      where profile.id = public.current_user_id()
        and upper(coalesce(profile.role, '')) = 'CLIENT'
    )
  )
);

drop policy if exists "Clients and admins can update meeting transcripts" on public.meeting_transcripts;
create policy "Clients and admins can update meeting transcripts"
on public.meeting_transcripts for update
to anon, authenticated
using (public.is_admin() or company_id = public.current_company_id())
with check (public.is_admin() or company_id = public.current_company_id());
