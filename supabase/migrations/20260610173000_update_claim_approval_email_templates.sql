insert into public.admin_email_templates
  (slug, name, description, recipient_group, trigger_event, subject, body, metadata_fields, category, reply_to, rate_limit_per_hour, is_active)
values
  (
    'opportunity_claim_created_client',
    'Client Admin notice: Bum claim needs review',
    'Sent to Client Admin users when a Bum requests credit for a relationship against an opportunity. Client Admins can approve in the portal or reply Approved.',
    'CLIENT_COMPANY',
    'OPPORTUNITY_CLAIM_CREATED',
    'Claim review needed: {{target_account_name}}',
    E'Hi {{client_name}},\n\nA Trusted Bum requested a claim for {{target_account_name}}.\n\nClaim details:\n- Submitted by: {{bum_name}}\n- Contact: {{contact_name}}\n- Contact company: {{contact_company}}\n- Contact email: {{contact_email}}\n- Relationship strength: {{relationship_strength}}\n- Context from the Bum: {{admin_note}}\n\nApprove or decline in the portal:\n{{claim_review_url}}\n\nOr reply to this email with:\nApproved\n\nor:\nDeclined\nWhy: Already Connected, No longer an Opportunity, Not the right level of contact, Not relevant, Duplicate, or Other.\n\nClaim decision token: {{claim_decision_token}}\nClaim ID: {{claim_id}}\n\nOnce approved, the claim is locked in and the Bum will be asked to log in and set up the introduction call.\n\nTrusted Bums',
    array['client_name', 'target_account_name', 'contact_name', 'contact_company', 'contact_email', 'relationship_strength', 'bum_name', 'admin_note', 'claim_review_url', 'claim_decision_token', 'claim_id'],
    'client_alerts',
    'bums@trustedbums.com',
    120,
    true
  ),
  (
    'opportunity_claim_accepted_bum',
    'Bum notice: claim accepted',
    'Sent to a Bum when their claim is accepted by a client or admin and they should set up the introduction call.',
    'CUSTOM',
    'OPPORTUNITY_CLAIM_ACCEPTED',
    'Claim approved: set up the intro for {{target_account_name}}',
    E'Hi {{bum_name}},\n\nGood news: your claim for {{target_account_name}} was approved.\n\nContact: {{contact_name}} at {{contact_company}}\nClient: {{client_name}}\n\nPlease log in and set up the introduction call:\n{{intro_setup_url}}\n\n{{admin_note}}\n\nTrusted Bums',
    array['bum_name', 'target_account_name', 'contact_name', 'contact_company', 'client_name', 'intro_setup_url', 'admin_note'],
    'opportunity_updates',
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
