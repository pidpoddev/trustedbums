insert into public.admin_email_templates
  (slug, name, description, recipient_group, trigger_event, subject, body, metadata_fields, category, reply_to, rate_limit_per_hour, is_active)
values
  (
    'blackcurrant_client_criteria_clarification',
    'BlackCurrant criteria clarification',
    'Manual client email asking BlackCurrant to confirm geography, account scope, relationship quality, and allowed path types before Bums are asked to submit introductions.',
    'CLIENT_COMPANY',
    'MANUAL',
    'Confirming BlackCurrant intro criteria before Bum outreach',
    E'Hi {{client_name}},\n\nBefore we ask Trusted Bums to surface BlackCurrant introductions, we want to confirm the criteria so Bums only submit useful paths.\n\nCould you reply with answers to these questions?\n\n1. Should Bums submit opportunities outside the U.S.?\n2. Are there countries, regions, or account types we should exclude?\n3. Should Bums only submit companies already on your target list, or can they suggest new accounts?\n4. Are you looking only for direct buyer introductions, or also paths through investors, developers, utilities, site-selection firms, data center operators, infrastructure partners, or advisors?\n5. What relationship quality should count: direct relationship only, second-degree warm intro, prior vendor/customer relationship, former coworker, investor/board path, or something else?\n6. Should Bums mark "maybe" if they may have a route, or only submit confirmed introducible contacts?\n\nOnce confirmed, we will use those rules in the Bum outreach and portal instructions for {{client_company_name}}.\n\nPortal reference: {{blackcurrant_portal_url}}\n\nTrusted Bums',
    array['company_id', 'client_name', 'client_company_name', 'blackcurrant_portal_url'],
    'client_alerts',
    'bums@trustedbums.com',
    60,
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
  is_active = excluded.is_active,
  updated_at = now();
