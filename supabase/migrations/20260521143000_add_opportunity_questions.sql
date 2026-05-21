create table if not exists public.opportunity_questions (
  id uuid primary key default gen_random_uuid(),
  opportunity_registration_id uuid not null references public.opportunity_registrations(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  bum_user_id text not null references public.profiles(id) on delete cascade,
  question text not null,
  status text not null default 'OPEN' check (status in ('OPEN', 'ANSWERED', 'CLOSED')),
  response text,
  response_visibility text check (response_visibility in ('BUM_ONLY', 'PUBLIC')),
  responded_by text references public.profiles(id) on delete set null,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunity_questions_opportunity_created_at_idx
  on public.opportunity_questions (opportunity_registration_id, created_at desc);

create index if not exists opportunity_questions_company_status_idx
  on public.opportunity_questions (company_id, status, created_at desc);

create index if not exists opportunity_questions_bum_created_at_idx
  on public.opportunity_questions (bum_user_id, created_at desc);

drop trigger if exists set_opportunity_questions_updated_at on public.opportunity_questions;
create trigger set_opportunity_questions_updated_at
before update on public.opportunity_questions
for each row execute function public.set_updated_at();

alter table public.opportunity_questions enable row level security;

grant select, insert, update on public.opportunity_questions to anon, authenticated;

drop policy if exists "Users can read relevant opportunity questions" on public.opportunity_questions;
create policy "Users can read relevant opportunity questions"
on public.opportunity_questions for select
to anon, authenticated
using (
  public.is_admin()
  or company_id = public.current_company_id()
  or bum_user_id = public.current_user_id()
  or (
    response_visibility = 'PUBLIC'
    and response is not null
    and exists (
      select 1
      from public.profiles profile
      where profile.id = public.current_user_id()
        and upper(coalesce(profile.role, '')) = 'BUM'
    )
    and exists (
      select 1
      from public.opportunity_registrations opportunity
      where opportunity.id = opportunity_questions.opportunity_registration_id
        and opportunity.status = 'Accepted'
    )
  )
);

drop policy if exists "Bums can create opportunity questions" on public.opportunity_questions;
create policy "Bums can create opportunity questions"
on public.opportunity_questions for insert
to anon, authenticated
with check (
  bum_user_id = public.current_user_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'BUM'
  )
  and exists (
    select 1
    from public.opportunity_registrations opportunity
    where opportunity.id = opportunity_registration_id
      and opportunity.company_id = company_id
      and opportunity.status = 'Accepted'
  )
);

drop policy if exists "Clients can answer own company opportunity questions" on public.opportunity_questions;
create policy "Clients can answer own company opportunity questions"
on public.opportunity_questions for update
to anon, authenticated
using (
  company_id = public.current_company_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'CLIENT'
  )
)
with check (
  company_id = public.current_company_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'CLIENT'
  )
);

drop policy if exists "Admins can manage opportunity questions" on public.opportunity_questions;
create policy "Admins can manage opportunity questions"
on public.opportunity_questions for all
to anon, authenticated
using (public.is_admin())
with check (public.is_admin());

alter table public.admin_email_templates
  drop constraint if exists admin_email_templates_trigger_event_check;

alter table public.admin_email_templates
  add constraint admin_email_templates_trigger_event_check check (
    trigger_event is null or trigger_event in (
      'MANUAL',
      'CLIENT_SIGNUP_CREATED',
      'BUM_SIGNUP_CREATED',
      'CLIENT_USER_CREATED',
      'OPPORTUNITY_CLAIM_CREATED',
      'OPPORTUNITY_CLAIM_ACCEPTED',
      'OPPORTUNITY_CLAIM_STATUS_CHANGED',
      'OPPORTUNITY_QUESTION_CREATED',
      'CLIENT_CREATED',
      'CLIENT_TARGET_CREATED',
      'CONTACT_SUBMISSION_CREATED'
    )
  );

alter table public.admin_email_trigger_rules
  drop constraint if exists admin_email_trigger_rules_event_check;

alter table public.admin_email_trigger_rules
  add constraint admin_email_trigger_rules_event_check check (
    trigger_event in (
      'CLIENT_SIGNUP_CREATED',
      'BUM_SIGNUP_CREATED',
      'CLIENT_USER_CREATED',
      'OPPORTUNITY_CLAIM_CREATED',
      'OPPORTUNITY_CLAIM_ACCEPTED',
      'OPPORTUNITY_CLAIM_STATUS_CHANGED',
      'OPPORTUNITY_QUESTION_CREATED',
      'CLIENT_CREATED',
      'CLIENT_TARGET_CREATED',
      'CONTACT_SUBMISSION_CREATED'
    )
  );

insert into public.admin_email_templates
  (slug, name, description, recipient_group, trigger_event, subject, body, metadata_fields, category, reply_to, rate_limit_per_hour, is_active)
values
  (
    'opportunity_question_created_client',
    'Client notice: Bum asked an opportunity question',
    'Sent to client company users when a Bum requests more information about an accepted opportunity.',
    'CLIENT_COMPANY',
    'OPPORTUNITY_QUESTION_CREATED',
    'Question waiting for {{target_account_name}}',
    E'Hi {{client_name}},\n\nA Trusted Bum requested more information about {{target_account_name}}.\n\nAsked by: {{bum_name}}\n\nQuestion:\n{{question}}\n\nOpen the opportunity questions page to answer:\n{{opportunity_url}}\n\nYou can reply only to this Bum or add the answer permanently to the opportunity for every Bum to see.\n\nTrusted Bums',
    array['client_name', 'target_account_name', 'bum_name', 'question', 'opportunity_url'],
    'client_alerts',
    'bums@trustedbums.com',
    120,
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  recipient_group = excluded.recipient_group,
  trigger_event = excluded.trigger_event,
  subject = excluded.subject,
  body = excluded.body,
  metadata_fields = excluded.metadata_fields,
  category = excluded.category,
  reply_to = excluded.reply_to,
  rate_limit_per_hour = excluded.rate_limit_per_hour,
  is_active = excluded.is_active;

insert into public.admin_email_trigger_rules (name, trigger_event, template_id, is_active)
select t.name, t.trigger_event, t.id, true
from public.admin_email_templates t
where t.slug = 'opportunity_question_created_client'
and t.trigger_event is not null
and not exists (
  select 1
  from public.admin_email_trigger_rules r
  where r.template_id = t.id
    and r.trigger_event = t.trigger_event
);
