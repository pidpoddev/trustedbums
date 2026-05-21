drop policy if exists "Users can read relevant conversation threads" on public.conversation_threads;
create policy "Users can read relevant conversation threads"
on public.conversation_threads for select
to anon, authenticated
using (
  public.is_admin()
  or created_by = public.current_user_id()
  or company_id = public.current_company_id()
  or public.is_conversation_participant(id)
);

drop policy if exists "Users can update relevant conversation threads" on public.conversation_threads;
create policy "Users can update relevant conversation threads"
on public.conversation_threads for update
to anon, authenticated
using (
  public.is_admin()
  or created_by = public.current_user_id()
  or company_id = public.current_company_id()
  or public.is_conversation_participant(id)
)
with check (
  public.is_admin()
  or created_by = public.current_user_id()
  or company_id = public.current_company_id()
  or public.is_conversation_participant(id)
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
    select 1
    from public.conversation_threads existing
    where existing.customer_target_response_id = response.id
  );

insert into public.conversation_participants (conversation_id, user_id, added_by, joined_at)
select thread.id, thread.created_by, thread.created_by, thread.created_at
from public.conversation_threads thread
on conflict do nothing;

insert into public.conversation_participants (conversation_id, user_id, added_by, joined_at)
select thread.id, profile.id, thread.created_by, thread.created_at
from public.conversation_threads thread
join public.profiles profile
  on profile.company_id = thread.company_id
 and upper(coalesce(profile.role, '')) = 'CLIENT'
on conflict do nothing;

insert into public.conversation_messages (conversation_id, sender_user_id, body, created_at)
select thread.id, response.bum_user_id, coalesce(nullif(response.note, ''), response.contact_name), response.created_at
from public.conversation_threads thread
join public.customer_target_responses response on response.id = thread.customer_target_response_id
where not exists (
  select 1
  from public.conversation_messages message
  where message.conversation_id = thread.id
);
