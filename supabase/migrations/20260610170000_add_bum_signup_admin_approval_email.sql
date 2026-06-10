create table if not exists public.bum_signup_approval_email_events (
  id uuid primary key default gen_random_uuid(),
  graph_message_id text not null unique,
  internet_message_id text,
  access_request_id uuid references public.client_company_access_requests(id) on delete set null,
  admin_profile_id text references public.profiles(id) on delete set null,
  decision text check (decision in ('APPROVED', 'IGNORED')),
  sender_email text,
  subject text,
  received_at timestamptz,
  processed_at timestamptz not null default now(),
  processing_status text not null default 'PROCESSED' check (processing_status in ('PROCESSED', 'SKIPPED', 'FAILED')),
  processing_note text
);

create index if not exists bum_signup_approval_email_events_request_idx
  on public.bum_signup_approval_email_events (access_request_id, processed_at desc);

alter table public.bum_signup_approval_email_events enable row level security;

drop policy if exists "Admins can read Bum signup approval email events" on public.bum_signup_approval_email_events;
create policy "Admins can read Bum signup approval email events"
on public.bum_signup_approval_email_events for select
to authenticated
using (private.is_admin());

grant select on public.bum_signup_approval_email_events to authenticated;

insert into public.admin_email_templates
  (slug, name, description, recipient_group, trigger_event, subject, body, metadata_fields, category, reply_to, rate_limit_per_hour, is_active)
values
  (
    'bum_signup_admin_review',
    'Admin notice: Bum signup needs approval',
    'Sent to bums@trustedbums.com when a new Bum signs up and needs Admin approval. Admins can approve in the portal or reply Approve.',
    'CUSTOM',
    'BUM_SIGNUP_CREATED',
    'New Bum signup awaiting approval: {{bum_name}}',
    E'A new Bum signed up and is waiting for approval.\n\nName: {{bum_name}}\nEmail: {{bum_email}}\nEmail domain: {{email_domain}}\n\nApprove in Admin:\n{{approve_url}}\n\nOr reply to this email with:\nApprove\n\nApproval request ID: {{request_id}}\n\nTrusted Bums',
    array['bum_name', 'bum_email', 'email_domain', 'approve_url', 'request_id'],
    'transactional',
    'bums@trustedbums.com',
    120,
    true
  )
on conflict (slug) do update set
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
select 'Bum signup admin approval notice', t.trigger_event, t.id, true
from public.admin_email_templates t
where t.slug = 'bum_signup_admin_review'
and not exists (
  select 1
  from public.admin_email_trigger_rules r
  where r.template_id = t.id
    and r.trigger_event = t.trigger_event
);
