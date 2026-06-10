insert into public.admin_email_templates
  (slug, name, description, recipient_group, trigger_event, subject, body, metadata_fields, category, reply_to, rate_limit_per_hour, is_active)
values
  (
    'blackcurrant_asset_request',
    'BlackCurrant enablement asset request',
    'Manual client email asking BlackCurrant for Bum-facing enablement assets before outreach.',
    'CLIENT_COMPANY',
    'MANUAL',
    'BlackCurrant materials for Trusted Bums outreach',
    E'Hi {{client_name}},\n\nOne more helpful item before we ask Bums to surface BlackCurrant introductions: do you have any enablement materials we can use to help Bums understand the story and recognize the right relationships?\n\nAnything you already have is useful. For example:\n\n- FCD, internal deal brief, or founder/client document\n- One-pager for BlackCurrant or the specific offer\n- Short explainer video or demo\n- Training deck or talking-points doc\n- ICP, buyer personas, target-account criteria, or disqualifiers\n- Approved warm-intro messaging Bums can use\n- Customer proof, case studies, logos, public outcomes, press, or reference links\n- FAQ, objection handling, or \"do not say\" legal/compliance boundaries\n\nIf you have files, you can reply with attachments or links. If some of this does not exist yet, that is fine; we can work from whatever you already have.\n\nOnce we have the criteria and any available materials, we will use them to tighten the Bum outreach and portal instructions for {{client_company_name}}.\n\nTrusted Bums',
    array['company_id', 'client_name', 'client_company_name'],
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
