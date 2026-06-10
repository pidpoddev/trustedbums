alter table public.admin_email_templates
  drop constraint if exists admin_email_templates_trigger_event_check;

alter table public.admin_email_templates
  add constraint admin_email_templates_trigger_event_check check (
    trigger_event is null or trigger_event in (
      'MANUAL',
      'CLIENT_SIGNUP_CREATED',
      'BUM_SIGNUP_CREATED',
      'BUM_APPROVED',
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
      'BUM_APPROVED',
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
    'bum_approved_login',
    'Bum approved: login access',
    'Sent to a Bum when Admin approves their signup and grants portal access.',
    'CUSTOM',
    'BUM_APPROVED',
    'Your Trusted Bums account has been approved',
    E'Hi {{recipient_name}},\n\nYour Trusted Bums account has been approved. You can now log in and access the Bum workspace.\n\nLog in here: {{login_url}}\n\nOnce you are in, you can complete your profile, review opportunities, and start using the platform.\n\nWelcome to Trusted Bums,\n\nThe Trusted Bums Team',
    array['recipient_name', 'login_url'],
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
select 'Bum approved login notice', t.trigger_event, t.id, true
from public.admin_email_templates t
where t.slug = 'bum_approved_login'
and not exists (
  select 1
  from public.admin_email_trigger_rules r
  where r.template_id = t.id
    and r.trigger_event = t.trigger_event
);
