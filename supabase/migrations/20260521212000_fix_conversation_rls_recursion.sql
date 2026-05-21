create or replace function public.is_conversation_participant(conversation_id_input uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.conversation_participants participant
    where participant.conversation_id = conversation_id_input
      and participant.user_id = public.current_user_id()
  )
$$;

create or replace function public.conversation_company_id(conversation_id_input uuid)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select thread.company_id
  from public.conversation_threads thread
  where thread.id = conversation_id_input
$$;

create or replace function public.can_add_conversation_participant(conversation_id_input uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.conversation_threads thread
    where thread.id = conversation_id_input
      and (
        thread.created_by = public.current_user_id()
        or thread.company_id = public.current_company_id()
        or exists (
          select 1
          from public.conversation_participants participant
          where participant.conversation_id = thread.id
            and participant.user_id = public.current_user_id()
        )
      )
  )
$$;

drop policy if exists "Users can read relevant conversation threads" on public.conversation_threads;
create policy "Users can read relevant conversation threads"
on public.conversation_threads for select
to anon, authenticated
using (
  public.is_admin()
  or company_id = public.current_company_id()
  or public.is_conversation_participant(id)
);

drop policy if exists "Users can update relevant conversation threads" on public.conversation_threads;
create policy "Users can update relevant conversation threads"
on public.conversation_threads for update
to anon, authenticated
using (
  public.is_admin()
  or company_id = public.current_company_id()
  or public.is_conversation_participant(id)
)
with check (
  public.is_admin()
  or company_id = public.current_company_id()
  or public.is_conversation_participant(id)
);

drop policy if exists "Users can read relevant conversation participants" on public.conversation_participants;
create policy "Users can read relevant conversation participants"
on public.conversation_participants for select
to anon, authenticated
using (
  public.is_admin()
  or user_id = public.current_user_id()
  or public.conversation_company_id(conversation_id) = public.current_company_id()
  or public.is_conversation_participant(conversation_id)
);

drop policy if exists "Users can add conversation participants" on public.conversation_participants;
create policy "Users can add conversation participants"
on public.conversation_participants for insert
to anon, authenticated
with check (
  public.is_admin()
  or user_id = public.current_user_id()
  or public.can_add_conversation_participant(conversation_id)
);

drop policy if exists "Users can read relevant conversation messages" on public.conversation_messages;
create policy "Users can read relevant conversation messages"
on public.conversation_messages for select
to anon, authenticated
using (
  public.is_admin()
  or public.conversation_company_id(conversation_id) = public.current_company_id()
  or public.is_conversation_participant(conversation_id)
);

drop policy if exists "Users can create relevant conversation messages" on public.conversation_messages;
create policy "Users can create relevant conversation messages"
on public.conversation_messages for insert
to anon, authenticated
with check (
  sender_user_id = public.current_user_id()
  and (
    public.is_admin()
    or public.conversation_company_id(conversation_id) = public.current_company_id()
    or public.is_conversation_participant(conversation_id)
  )
);
