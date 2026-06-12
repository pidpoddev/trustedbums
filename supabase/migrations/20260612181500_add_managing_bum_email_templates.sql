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
      'CONTACT_SUBMISSION_CREATED',
      'MANAGING_BUM_ENABLED',
      'MANAGING_BUM_TEAM_MEMBER_SIGNED_UP'
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
      'CONTACT_SUBMISSION_CREATED',
      'MANAGING_BUM_ENABLED',
      'MANAGING_BUM_TEAM_MEMBER_SIGNED_UP'
    )
  );

insert into public.admin_email_templates
  (slug, name, description, recipient_group, trigger_event, subject, body, metadata_fields, category, reply_to, rate_limit_per_hour, is_active)
values
  (
    'managing_bum_welcome',
    'Managing Bum welcome',
    'Sent to a Bum when Admin promotes them to Managing Bum.',
    'CUSTOM',
    'MANAGING_BUM_ENABLED',
    'Congratulations on becoming a Managing Bum',
    E'Hi {{recipient_name}},\n\nCongratulations on becoming a Managing Bum with Trusted Bums.\n\nYou can now build your own team of invited Bums. When someone joins through your team invite, they will be attached to you automatically, and you can track team members, claims, earnings, and your Managing Bum share in Team Management.\n\nOpen Team Management:\n{{team_management_url}}\n\nWe are excited to have you helping grow the Trusted Bums network.\n\nThe Trusted Bums Team',
    array['recipient_name', 'team_management_url'],
    'transactional',
    'bums@trustedbums.com',
    120,
    true
  ),
  (
    'managing_bum_team_signup',
    'Managing Bum team signup notice',
    'Sent to a Managing Bum when an invited Bum signs up and attaches to their team.',
    'CUSTOM',
    'MANAGING_BUM_TEAM_MEMBER_SIGNED_UP',
    '{{team_member_name}} joined your Trusted Bums team',
    E'Hi {{manager_name}},\n\n{{team_member_name}} has signed up and is now attached to your Managing Bum team.\n\nTeam member: {{team_member_name}}\nEmail: {{team_member_email}}\n\nYou can review your team, claims, earnings, and manager share here:\n{{team_management_url}}\n\nThe Trusted Bums Team',
    array['manager_name', 'team_member_name', 'team_member_email', 'team_management_url'],
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
