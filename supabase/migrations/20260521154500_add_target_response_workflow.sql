alter table public.customer_target_responses
  add column if not exists opportunity_registration_id uuid references public.opportunity_registrations(id) on delete set null,
  add column if not exists opportunity_claim_id uuid references public.opportunity_claims(id) on delete set null;

create index if not exists customer_target_responses_client_status_idx
  on public.customer_target_responses (client_company_id, status, created_at desc);

create index if not exists customer_target_responses_opportunity_claim_idx
  on public.customer_target_responses (opportunity_claim_id)
  where opportunity_claim_id is not null;

drop policy if exists "Clients can update own customer target responses" on public.customer_target_responses;
create policy "Clients can update own customer target responses"
on public.customer_target_responses for update
to anon, authenticated
using (
  client_company_id = public.current_company_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'CLIENT'
  )
)
with check (
  client_company_id = public.current_company_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'CLIENT'
  )
);

drop policy if exists "Clients can create approved opportunity claims" on public.opportunity_claims;
create policy "Clients can create approved opportunity claims"
on public.opportunity_claims for insert
to anon, authenticated
with check (
  company_id = public.current_company_id()
  and status in ('PROPOSED', 'APPROVED')
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'CLIENT'
  )
);

create table if not exists public.opportunity_claim_public_summaries (
  id uuid primary key references public.opportunity_claims(id) on delete cascade,
  opportunity_registration_id uuid not null references public.opportunity_registrations(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  bum_user_id text not null references public.profiles(id) on delete cascade,
  bum_display_name text not null,
  status text not null check (status in ('PROPOSED', 'APPROVED', 'SCHEDULED', 'MEETING_HELD', 'EXPIRED', 'DISPUTED', 'CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunity_claim_public_summaries_opportunity_idx
  on public.opportunity_claim_public_summaries (opportunity_registration_id, status, created_at desc);

alter table public.opportunity_claim_public_summaries enable row level security;

grant select, insert, update on public.opportunity_claim_public_summaries to anon, authenticated;

drop policy if exists "Users can read opportunity claim public summaries" on public.opportunity_claim_public_summaries;
create policy "Users can read opportunity claim public summaries"
on public.opportunity_claim_public_summaries for select
to anon, authenticated
using (
  public.is_admin()
  or company_id = public.current_company_id()
  or exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'BUM'
  )
);

drop policy if exists "Users can write opportunity claim public summaries" on public.opportunity_claim_public_summaries;
create policy "Users can write opportunity claim public summaries"
on public.opportunity_claim_public_summaries for insert
to anon, authenticated
with check (
  public.is_admin()
  or bum_user_id = public.current_user_id()
  or company_id = public.current_company_id()
);

drop policy if exists "Users can update opportunity claim public summaries" on public.opportunity_claim_public_summaries;
create policy "Users can update opportunity claim public summaries"
on public.opportunity_claim_public_summaries for update
to anon, authenticated
using (
  public.is_admin()
  or bum_user_id = public.current_user_id()
  or company_id = public.current_company_id()
)
with check (
  public.is_admin()
  or bum_user_id = public.current_user_id()
  or company_id = public.current_company_id()
);

insert into public.opportunity_claim_public_summaries (
  id,
  opportunity_registration_id,
  company_id,
  bum_user_id,
  bum_display_name,
  status,
  created_at,
  updated_at
)
select
  claim.id,
  claim.opportunity_registration_id,
  claim.company_id,
  claim.bum_user_id,
  coalesce(nullif(profile.full_name, ''), nullif(profile.email, ''), 'Trusted Bum') as bum_display_name,
  claim.status,
  claim.created_at,
  claim.updated_at
from public.opportunity_claims claim
left join public.profiles profile on profile.id = claim.bum_user_id
on conflict (id) do update
set
  opportunity_registration_id = excluded.opportunity_registration_id,
  company_id = excluded.company_id,
  bum_user_id = excluded.bum_user_id,
  bum_display_name = excluded.bum_display_name,
  status = excluded.status,
  updated_at = excluded.updated_at;

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
      'CUSTOMER_TARGET_RESPONSE_CREATED',
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
      'CUSTOMER_TARGET_RESPONSE_CREATED',
      'CLIENT_CREATED',
      'CLIENT_TARGET_CREATED',
      'CONTACT_SUBMISSION_CREATED'
    )
  );

insert into public.admin_email_templates
  (slug, name, description, recipient_group, trigger_event, subject, body, metadata_fields, category, reply_to, rate_limit_per_hour, is_active)
values
  (
    'customer_target_response_created_client',
    'Client notice: Bum knows someone at target account',
    'Sent to client company users when a Bum submits relationship context for a client target account.',
    'CLIENT_COMPANY',
    'CUSTOMER_TARGET_RESPONSE_CREATED',
    'A Bum knows someone at {{target_account_name}}',
    E'Hi {{client_name}},

{{bum_name}} says they know someone connected to {{target_account_name}}.

Contact or path: {{contact_name}}
Relationship: {{relationship_strength}}

Context:
{{response_note}}

Review the response, choose a commission plan, and either formalize the opportunity for this Bum or reject it here:
{{response_url}}

Trusted Bums',
    array['client_name', 'bum_name', 'target_account_name', 'contact_name', 'relationship_strength', 'response_note', 'response_url'],
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
where t.slug = 'customer_target_response_created_client'
and t.trigger_event is not null
and not exists (
  select 1
  from public.admin_email_trigger_rules r
  where r.template_id = t.id
    and r.trigger_event = t.trigger_event
);
