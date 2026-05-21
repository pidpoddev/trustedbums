insert into public.admin_email_templates
  (slug, name, description, recipient_group, trigger_event, subject, body, metadata_fields, category, reply_to, rate_limit_per_hour, is_active)
values
  (
    'client_signup_welcome',
    'Client welcome: thanks for signing up',
    'Sent to a new Client user after signup with the fastest next steps for getting value from Trusted Bums.',
    'CUSTOM',
    'CLIENT_SIGNUP_CREATED',
    'Welcome to Trusted Bums, {{client_company_name}}',
    E'Hi {{recipient_name}},\n\nThanks for signing up for Trusted Bums. The fastest way to get value is to give Bums a clear target and enough context to make warm introductions that prospects actually accept.\n\nRecommended next actions:\n- Add your highest-priority target accounts so Bums know where relationships matter most.\n- Register your first opportunity with the customer fit, expected value, timing, and commission plan.\n- Add Training & Assets so Bums can explain your company accurately before they introduce you.\n- Review incoming claims quickly so the right Bum can move a real relationship forward.\n\nStart here: https://trustedbums.com/client/dashboard\n\nIf you want help shaping your first opportunity, reply to this email and we will help you get it ready.\n\nTrusted Bums',
    array['recipient_name', 'client_company_name'],
    'onboarding',
    'bums@trustedbums.com',
    120,
    true
  ),
  (
    'bum_signup_welcome',
    'Bum welcome: thanks for signing up',
    'Sent to a new Bum after signup with the fastest next steps for finding useful opportunities and earning from trusted relationships.',
    'CUSTOM',
    'BUM_SIGNUP_CREATED',
    'Welcome to Trusted Bums, {{recipient_name}}',
    E'Hi {{recipient_name}},\n\nThanks for signing up for Trusted Bums. The fastest way to benefit is to make your relationship map easy to match with active client opportunities.\n\nRecommended next actions:\n- Complete your profile with industries, regions, buyer relationships, and notable wins.\n- Review Training & Assets for clients you understand so your intros are credible.\n- Browse open opportunities and claim only the relationships where you can make a warm, useful introduction.\n- Add prospected clients or reverse opportunities when you know a company that should be working with Trusted Bums.\n- Keep claims and meetings current so commissions can be tied back to your work.\n\nStart here: https://trustedbums.com/bum/dashboard\n\nIf you are not sure where to start, reply with the industries or accounts where you have the strongest relationships and we will point you toward the best matches.\n\nTrusted Bums',
    array['recipient_name'],
    'onboarding',
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
