create table if not exists public.conversation_threads (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  context_type text not null default 'GENERAL' check (context_type in ('GENERAL', 'OPPORTUNITY', 'CUSTOMER_TARGET')),
  company_id uuid references public.companies(id) on delete cascade,
  opportunity_registration_id uuid references public.opportunity_registrations(id) on delete set null,
  customer_target_id uuid references public.customer_targets(id) on delete set null,
  opportunity_question_id uuid references public.opportunity_questions(id) on delete set null,
  customer_target_response_id uuid references public.customer_target_responses(id) on delete set null,
  created_by text not null references public.profiles(id) on delete cascade,
  status text not null default 'OPEN' check (status in ('OPEN', 'ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists conversation_threads_opportunity_question_idx
  on public.conversation_threads (opportunity_question_id)
  where opportunity_question_id is not null;

create unique index if not exists conversation_threads_customer_target_response_idx
  on public.conversation_threads (customer_target_response_id)
  where customer_target_response_id is not null;

create index if not exists conversation_threads_company_updated_idx
  on public.conversation_threads (company_id, updated_at desc);

drop trigger if exists set_conversation_threads_updated_at on public.conversation_threads;
create trigger set_conversation_threads_updated_at
before update on public.conversation_threads
for each row execute function public.set_updated_at();

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversation_threads(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  added_by text references public.profiles(id) on delete set null,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create index if not exists conversation_participants_user_idx
  on public.conversation_participants (user_id, joined_at desc);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversation_threads(id) on delete cascade,
  sender_user_id text not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index if not exists conversation_messages_conversation_created_idx
  on public.conversation_messages (conversation_id, created_at asc);

alter table public.conversation_threads enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.conversation_messages enable row level security;

grant select, insert, update on public.conversation_threads to anon, authenticated;
grant select, insert, update on public.conversation_participants to anon, authenticated;
grant select, insert on public.conversation_messages to anon, authenticated;

drop policy if exists "Users can read relevant conversation threads" on public.conversation_threads;
create policy "Users can read relevant conversation threads"
on public.conversation_threads for select
to anon, authenticated
using (
  public.is_admin()
  or company_id = public.current_company_id()
  or exists (
    select 1
    from public.conversation_participants participant
    where participant.conversation_id = conversation_threads.id
      and participant.user_id = public.current_user_id()
  )
);

drop policy if exists "Users can create conversation threads" on public.conversation_threads;
create policy "Users can create conversation threads"
on public.conversation_threads for insert
to anon, authenticated
with check (
  created_by = public.current_user_id()
  and (
    public.is_admin()
    or company_id = public.current_company_id()
    or exists (
      select 1
      from public.profiles profile
      where profile.id = public.current_user_id()
        and upper(coalesce(profile.role, '')) = 'BUM'
    )
  )
);

drop policy if exists "Users can update relevant conversation threads" on public.conversation_threads;
create policy "Users can update relevant conversation threads"
on public.conversation_threads for update
to anon, authenticated
using (
  public.is_admin()
  or company_id = public.current_company_id()
  or exists (
    select 1
    from public.conversation_participants participant
    where participant.conversation_id = conversation_threads.id
      and participant.user_id = public.current_user_id()
  )
)
with check (
  public.is_admin()
  or company_id = public.current_company_id()
  or exists (
    select 1
    from public.conversation_participants participant
    where participant.conversation_id = conversation_threads.id
      and participant.user_id = public.current_user_id()
  )
);

drop policy if exists "Users can read relevant conversation participants" on public.conversation_participants;
create policy "Users can read relevant conversation participants"
on public.conversation_participants for select
to anon, authenticated
using (
  public.is_admin()
  or user_id = public.current_user_id()
  or exists (
    select 1
    from public.conversation_threads thread
    where thread.id = conversation_participants.conversation_id
      and thread.company_id = public.current_company_id()
  )
  or exists (
    select 1
    from public.conversation_participants own_participant
    where own_participant.conversation_id = conversation_participants.conversation_id
      and own_participant.user_id = public.current_user_id()
  )
);

drop policy if exists "Users can add conversation participants" on public.conversation_participants;
create policy "Users can add conversation participants"
on public.conversation_participants for insert
to anon, authenticated
with check (
  public.is_admin()
  or user_id = public.current_user_id()
  or exists (
    select 1
    from public.conversation_threads thread
    where thread.id = conversation_participants.conversation_id
      and (
        thread.created_by = public.current_user_id()
        or thread.company_id = public.current_company_id()
        or exists (
          select 1
          from public.conversation_participants own_participant
          where own_participant.conversation_id = thread.id
            and own_participant.user_id = public.current_user_id()
        )
      )
  )
);

drop policy if exists "Users can update own conversation participant state" on public.conversation_participants;
create policy "Users can update own conversation participant state"
on public.conversation_participants for update
to anon, authenticated
using (public.is_admin() or user_id = public.current_user_id())
with check (public.is_admin() or user_id = public.current_user_id());

drop policy if exists "Users can read relevant conversation messages" on public.conversation_messages;
create policy "Users can read relevant conversation messages"
on public.conversation_messages for select
to anon, authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.conversation_threads thread
    where thread.id = conversation_messages.conversation_id
      and thread.company_id = public.current_company_id()
  )
  or exists (
    select 1
    from public.conversation_participants participant
    where participant.conversation_id = conversation_messages.conversation_id
      and participant.user_id = public.current_user_id()
  )
);

drop policy if exists "Users can create relevant conversation messages" on public.conversation_messages;
create policy "Users can create relevant conversation messages"
on public.conversation_messages for insert
to anon, authenticated
with check (
  sender_user_id = public.current_user_id()
  and (
    public.is_admin()
    or exists (
      select 1
      from public.conversation_threads thread
      where thread.id = conversation_messages.conversation_id
        and thread.company_id = public.current_company_id()
    )
    or exists (
      select 1
      from public.conversation_participants participant
      where participant.conversation_id = conversation_messages.conversation_id
        and participant.user_id = public.current_user_id()
    )
  )
);

insert into public.conversation_threads (
  subject,
  context_type,
  company_id,
  opportunity_registration_id,
  opportunity_question_id,
  created_by,
  created_at,
  updated_at
)
select
  'Question: ' || opportunity.target_account_name,
  'OPPORTUNITY',
  question.company_id,
  question.opportunity_registration_id,
  question.id,
  question.bum_user_id,
  question.created_at,
  question.updated_at
from public.opportunity_questions question
join public.opportunity_registrations opportunity on opportunity.id = question.opportunity_registration_id
where not exists (
  select 1 from public.conversation_threads existing where existing.opportunity_question_id = question.id
);

insert into public.conversation_threads (
  subject,
  context_type,
  company_id,
  customer_target_id,
  customer_target_response_id,
  created_by,
  created_at,
  updated_at
)
select
  'Question: ' || coalesce(target_company.name, target.target_account_name),
  'CUSTOMER_TARGET',
  response.client_company_id,
  response.customer_target_id,
  response.id,
  response.bum_user_id,
  response.created_at,
  response.updated_at
from public.customer_target_responses response
join public.customer_targets target on target.id = response.customer_target_id
left join public.companies target_company on target_company.id = target.target_company_id
where lower(response.contact_name) like 'question about %'
and not exists (
  select 1 from public.conversation_threads existing where existing.customer_target_response_id = response.id
);

insert into public.conversation_participants (conversation_id, user_id, added_by, joined_at)
select thread.id, thread.created_by, thread.created_by, thread.created_at
from public.conversation_threads thread
on conflict do nothing;

insert into public.conversation_participants (conversation_id, user_id, added_by, joined_at)
select thread.id, profile.id, thread.created_by, thread.created_at
from public.conversation_threads thread
join public.profiles profile on profile.company_id = thread.company_id and upper(coalesce(profile.role, '')) = 'CLIENT'
on conflict do nothing;

insert into public.conversation_messages (conversation_id, sender_user_id, body, created_at)
select thread.id, question.bum_user_id, question.question, question.created_at
from public.conversation_threads thread
join public.opportunity_questions question on question.id = thread.opportunity_question_id
where not exists (
  select 1 from public.conversation_messages message where message.conversation_id = thread.id
);

insert into public.conversation_messages (conversation_id, sender_user_id, body, created_at)
select thread.id, response.bum_user_id, coalesce(nullif(response.note, ''), response.contact_name), response.created_at
from public.conversation_threads thread
join public.customer_target_responses response on response.id = thread.customer_target_response_id
where not exists (
  select 1 from public.conversation_messages message where message.conversation_id = thread.id
);
