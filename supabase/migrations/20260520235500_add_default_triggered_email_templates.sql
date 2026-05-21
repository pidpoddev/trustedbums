alter table public.admin_email_templates
  drop constraint if exists admin_email_templates_recipient_group_check;

alter table public.admin_email_templates
  add constraint admin_email_templates_recipient_group_check check (
    recipient_group in ('ALL_USERS', 'CLIENT_COMPANY', 'ALL_CLIENTS', 'ALL_BUMS', 'BUM_INDUSTRY_MATCH', 'ADMINS', 'CUSTOM')
  );

alter table public.admin_email_deliveries
  drop constraint if exists admin_email_deliveries_recipient_group_check;

alter table public.admin_email_deliveries
  add constraint admin_email_deliveries_recipient_group_check check (
    recipient_group in ('ALL_USERS', 'CLIENT_COMPANY', 'ALL_CLIENTS', 'ALL_BUMS', 'BUM_INDUSTRY_MATCH', 'ADMINS', 'CUSTOM')
  );

alter table public.admin_email_campaigns
  drop constraint if exists admin_email_campaigns_recipient_group_check;

alter table public.admin_email_campaigns
  add constraint admin_email_campaigns_recipient_group_check check (
    recipient_group in ('ALL_USERS', 'CLIENT_COMPANY', 'ALL_CLIENTS', 'ALL_BUMS', 'BUM_INDUSTRY_MATCH', 'ADMINS', 'CUSTOM')
  );

alter table public.admin_email_schedules
  drop constraint if exists admin_email_schedules_recipient_group_check;

alter table public.admin_email_schedules
  add constraint admin_email_schedules_recipient_group_check check (
    recipient_group in ('ALL_USERS', 'CLIENT_COMPANY', 'ALL_CLIENTS', 'ALL_BUMS', 'BUM_INDUSTRY_MATCH', 'ADMINS', 'CUSTOM')
  );

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
      'CLIENT_CREATED',
      'CLIENT_TARGET_CREATED',
      'CONTACT_SUBMISSION_CREATED'
    )
  );

insert into public.admin_email_templates
  (slug, name, description, recipient_group, trigger_event, subject, body, metadata_fields, category, reply_to, rate_limit_per_hour, is_active)
values
  (
    'client_signup_admin',
    'Admin notice: new Client signup',
    'Notifies admins when a new client company signs up for Trusted Bums.',
    'ADMINS',
    'CLIENT_SIGNUP_CREATED',
    'New Client signup: {{client_company_name}}',
    E'Hi team,\n\nA new Client signed up for Trusted Bums.\n\nCompany: {{client_company_name}}\nUser: {{user_name}}\nEmail: {{user_email}}\n\nRecommended next steps:\n- Review the company profile\n- Confirm terms acceptance and onboarding status\n- Help them publish their first opportunity or training asset\n\nTrusted Bums',
    array['client_company_name', 'user_name', 'user_email'],
    'onboarding',
    'bums@trustedbums.com',
    120,
    true
  ),
  (
    'bum_signup_admin',
    'Admin notice: new Bum signup',
    'Notifies admins when a new Bum joins Trusted Bums.',
    'ADMINS',
    'BUM_SIGNUP_CREATED',
    'New Bum signup: {{bum_name}}',
    E'Hi team,\n\nA new Bum signed up for Trusted Bums.\n\nName: {{bum_name}}\nEmail: {{user_email}}\n\nRecommended next steps:\n- Review their profile for completeness\n- Confirm industries, coverage, and visibility\n- Help them find the best active opportunities\n\nTrusted Bums',
    array['bum_name', 'user_email'],
    'onboarding',
    'bums@trustedbums.com',
    120,
    true
  ),
  (
    'client_user_created_admin',
    'Admin notice: new Client user',
    'Notifies admins when an additional user joins an existing client company.',
    'ADMINS',
    'CLIENT_USER_CREATED',
    'New user joined {{client_company_name}}',
    E'Hi team,\n\nA new user joined an existing Client account.\n\nCompany: {{client_company_name}}\nUser: {{user_name}}\nEmail: {{user_email}}\n\nRecommended next steps:\n- Confirm their access role is correct\n- Turn off customer introduction invites if this is a finance or operations contact\n- Make sure they know where to find opportunities, claims, and assets\n\nTrusted Bums',
    array['client_company_name', 'user_name', 'user_email'],
    'onboarding',
    'bums@trustedbums.com',
    120,
    true
  ),
  (
    'opportunity_claim_created_client',
    'Client notice: Bum requested a claim',
    'Sent to client company users when a Bum requests credit for a relationship against an opportunity.',
    'CLIENT_COMPANY',
    'OPPORTUNITY_CLAIM_CREATED',
    'New claim request for {{target_account_name}}',
    E'Hi {{client_name}},\n\nA Trusted Bum requested a claim for {{target_account_name}}.\n\nContact: {{contact_name}} at {{contact_company}}\nRelationship strength: {{relationship_strength}}\nSubmitted by: {{bum_name}}\n\nContext from the Bum:\n{{admin_note}}\n\nPlease review the claim in the Trusted Bums portal so the right person gets credit before an introduction moves forward.\n\nTrusted Bums',
    array['client_name', 'target_account_name', 'contact_name', 'contact_company', 'relationship_strength', 'bum_name', 'admin_note'],
    'client_alerts',
    'bums@trustedbums.com',
    120,
    true
  ),
  (
    'opportunity_claim_accepted_bum',
    'Bum notice: claim accepted',
    'Sent to a Bum when their claim is accepted by a client or admin.',
    'CUSTOM',
    'OPPORTUNITY_CLAIM_ACCEPTED',
    'Claim accepted: {{target_account_name}}',
    E'Hi {{bum_name}},\n\nGood news: your claim for {{target_account_name}} was accepted.\n\nContact: {{contact_name}} at {{contact_company}}\nClient: {{client_name}}\n\nNext step: watch for the customer introduction workflow and keep your relationship context ready so the meeting is easy for the prospect to accept.\n\n{{admin_note}}\n\nTrusted Bums',
    array['bum_name', 'target_account_name', 'contact_name', 'contact_company', 'client_name', 'admin_note'],
    'opportunity_updates',
    'bums@trustedbums.com',
    120,
    true
  ),
  (
    'general_admin_announcement',
    'General announcement',
    'Flexible admin-authored announcement for every account, clients, Bums, admins, or a custom recipient list.',
    'ALL_USERS',
    'MANUAL',
    '{{headline}}',
    E'Hi {{recipient_name}},\n\n{{message}}\n\nTrusted Bums',
    array['headline', 'recipient_name', 'message'],
    'admin_announcements',
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
where t.slug in (
  'client_signup_admin',
  'bum_signup_admin',
  'client_user_created_admin',
  'opportunity_claim_created_client',
  'opportunity_claim_accepted_bum'
)
and t.trigger_event is not null
and t.trigger_event <> 'MANUAL'
and not exists (
  select 1
  from public.admin_email_trigger_rules r
  where r.template_id = t.id
    and r.trigger_event = t.trigger_event
);

update public.admin_email_trigger_rules r
set name = t.name,
    is_active = true
from public.admin_email_templates t
where r.template_id = t.id
  and t.slug in (
    'client_signup_admin',
    'bum_signup_admin',
    'client_user_created_admin',
    'opportunity_claim_created_client',
    'opportunity_claim_accepted_bum'
  );
