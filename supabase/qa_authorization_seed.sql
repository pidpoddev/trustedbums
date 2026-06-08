-- Trusted Bums QA authorization fixtures.
--
-- This file is opt-in and intended for local/staging QA databases only.
-- Do not run it against production customer data.
--
-- The profile ids below are deterministic JWT `sub` values for local RLS tests.
-- If using real Clerk QA accounts, update these ids to the Clerk user ids before
-- seeding so browser-authenticated checks exercise the same rows.

begin;

delete from public.audit_events
where entity_id in (
  '00000000-0000-4000-8000-00000000a301',
  '00000000-0000-4000-8000-00000000a302',
  '00000000-0000-4000-8000-00000000a303'
);

delete from public.performance_metric_events
where metric_id like 'qa-authz-%';

delete from public.bum_contacts
where id in (
  '00000000-0000-4000-8000-00000000b001',
  '00000000-0000-4000-8000-00000000b002',
  '00000000-0000-4000-8000-00000000b003',
  '00000000-0000-4000-8000-00000000b004'
);

delete from public.extension_page_captures
where id in (
  '00000000-0000-4000-8000-00000000e001',
  '00000000-0000-4000-8000-00000000e002'
);

delete from public.customer_target_responses
where id in (
  '00000000-0000-4000-8000-000000007001',
  '00000000-0000-4000-8000-000000007002'
);

delete from public.opportunity_claim_public_summaries
where id in (
  '00000000-0000-4000-8000-00000000d101',
  '00000000-0000-4000-8000-00000000d102'
);

delete from public.opportunity_claims
where id in (
  '00000000-0000-4000-8000-00000000d101',
  '00000000-0000-4000-8000-00000000d102'
);

delete from public.client_company_access_requests
where id in (
  '00000000-0000-4000-8000-00000000a301',
  '00000000-0000-4000-8000-00000000a302',
  '00000000-0000-4000-8000-00000000a303'
);

delete from public.customer_targets
where id in (
  '00000000-0000-4000-8000-00000000c101',
  '00000000-0000-4000-8000-00000000c102'
);

delete from public.opportunity_registrations
where id in (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000102'
);

delete from public.bum_profiles
where user_id in (
  'qa_bum_primary_auth_user',
  'qa_bum_secondary_auth_user'
);

delete from public.company_domains
where domain in (
  'qa-alpha.example',
  'qa-beta.example',
  'qa-alpha-alias.example'
);

delete from public.profiles
where id in (
  'qa_admin_auth_user',
  'qa_client_alpha_admin',
  'qa_client_alpha_finance',
  'qa_client_alpha_member',
  'qa_client_beta_admin',
  'qa_client_disabled_user',
  'qa_pending_public_email',
  'qa_pending_same_domain',
  'qa_bum_primary_auth_user',
  'qa_bum_secondary_auth_user'
);

delete from public.companies
where id in (
  '00000000-0000-4000-8000-0000000000a1',
  '00000000-0000-4000-8000-0000000000b2',
  '00000000-0000-4000-8000-0000000000f1',
  '00000000-0000-4000-8000-0000000000f2'
);

insert into public.companies (
  id,
  name,
  website,
  relationship_stage,
  linkedin_company_url,
  description,
  target_industries,
  target_regions,
  ideal_customer_profile
) values
  (
    '00000000-0000-4000-8000-0000000000a1',
    'QA Alpha Client',
    'https://qa-alpha.example',
    'CLIENT',
    'https://linkedin.com/company/qa-alpha-client',
    'QA company used for positive same-company access checks.',
    array['Infrastructure', 'Enterprise Software'],
    array['North America'],
    'Large enterprise buyers with named-account access needs.'
  ),
  (
    '00000000-0000-4000-8000-0000000000b2',
    'QA Beta Client',
    'https://qa-beta.example',
    'CLIENT',
    'https://linkedin.com/company/qa-beta-client',
    'QA company used as the foreign-company denial control.',
    array['Industrial', 'Data Centers'],
    array['North America'],
    'Strategic accounts requiring controlled introductions.'
  ),
  (
    '00000000-0000-4000-8000-0000000000f1',
    'QA Alpha Target Account',
    'https://qa-alpha-target.example',
    'PROSPECT',
    null,
    'Target company owned by QA Alpha Client.',
    array['Enterprise Software'],
    array['North America'],
    null
  ),
  (
    '00000000-0000-4000-8000-0000000000f2',
    'QA Beta Target Account',
    'https://qa-beta-target.example',
    'PROSPECT',
    null,
    'Target company owned by QA Beta Client.',
    array['Industrial'],
    array['North America'],
    null
  );

insert into public.company_domains (company_id, domain, is_primary)
values
  ('00000000-0000-4000-8000-0000000000a1', 'qa-alpha.example', true),
  ('00000000-0000-4000-8000-0000000000a1', 'qa-alpha-alias.example', false),
  ('00000000-0000-4000-8000-0000000000b2', 'qa-beta.example', true);

insert into public.profiles (
  id,
  company_id,
  full_name,
  email,
  role,
  is_admin,
  client_access_role,
  access_status,
  disabled_at,
  notification_preferences,
  invited_to_customer_introductions,
  time_zone
) values
  (
    'qa_admin_auth_user',
    null,
    'QA Admin',
    'qa_admin@qa.com',
    'ADMIN',
    true,
    'CLIENT_ADMIN',
    'APPROVED',
    null,
    '{"fixture":"qa_authorization"}'::jsonb,
    false,
    'America/New_York'
  ),
  (
    'qa_client_alpha_admin',
    '00000000-0000-4000-8000-0000000000a1',
    'QA Alpha Client Admin',
    'qa_client_admin@qa.com',
    'CLIENT',
    false,
    'CLIENT_ADMIN',
    'APPROVED',
    null,
    '{"fixture":"qa_authorization"}'::jsonb,
    true,
    'America/New_York'
  ),
  (
    'qa_client_alpha_finance',
    '00000000-0000-4000-8000-0000000000a1',
    'QA Alpha Finance',
    'qa_finance@qa.com',
    'CLIENT',
    false,
    'CLIENT_FINANCE',
    'APPROVED',
    null,
    '{"fixture":"qa_authorization"}'::jsonb,
    false,
    'America/New_York'
  ),
  (
    'qa_client_alpha_member',
    '00000000-0000-4000-8000-0000000000a1',
    'QA Alpha Member',
    'qa_clientmember@qa.com',
    'CLIENT',
    false,
    'CLIENT_MEMBER',
    'APPROVED',
    null,
    '{"fixture":"qa_authorization"}'::jsonb,
    true,
    'America/New_York'
  ),
  (
    'qa_client_beta_admin',
    '00000000-0000-4000-8000-0000000000b2',
    'QA Beta Client Admin',
    'qa_client_beta_admin@qa.com',
    'CLIENT',
    false,
    'CLIENT_ADMIN',
    'APPROVED',
    null,
    '{"fixture":"qa_authorization"}'::jsonb,
    true,
    'America/New_York'
  ),
  (
    'qa_client_disabled_user',
    '00000000-0000-4000-8000-0000000000a1',
    'QA Disabled Client',
    'qa_disabled_client@qa.com',
    'CLIENT',
    false,
    'CLIENT_MEMBER',
    'DISABLED',
    now(),
    '{"fixture":"qa_authorization"}'::jsonb,
    false,
    'America/New_York'
  ),
  (
    'qa_pending_public_email',
    null,
    'QA Pending Public Email',
    'qa_pending_public@gmail.example',
    null,
    false,
    'CLIENT_MEMBER',
    'PENDING',
    null,
    '{"fixture":"qa_authorization"}'::jsonb,
    false,
    'America/New_York'
  ),
  (
    'qa_pending_same_domain',
    null,
    'QA Pending Same Domain',
    'qa_pending_same_domain@qa-alpha.example',
    null,
    false,
    'CLIENT_MEMBER',
    'PENDING',
    null,
    '{"fixture":"qa_authorization"}'::jsonb,
    false,
    'America/New_York'
  ),
  (
    'qa_bum_primary_auth_user',
    null,
    'QA Primary Bum',
    'qa_bum@qabum.com',
    'BUM',
    false,
    'CLIENT_MEMBER',
    'APPROVED',
    null,
    '{"fixture":"qa_authorization"}'::jsonb,
    false,
    'America/New_York'
  ),
  (
    'qa_bum_secondary_auth_user',
    null,
    'QA Secondary Bum',
    'qa_bum_secondary@qabum.com',
    'BUM',
    false,
    'CLIENT_MEMBER',
    'APPROVED',
    null,
    '{"fixture":"qa_authorization"}'::jsonb,
    false,
    'America/New_York'
  );

insert into public.bum_profiles (
  user_id,
  headline,
  bio,
  linkedin_url,
  years_experience,
  availability_status,
  home_region,
  industries,
  regions,
  products_sold,
  buyer_personas,
  relationship_companies,
  skills,
  verification_status,
  is_visible_to_clients
) values
  (
    'qa_bum_primary_auth_user',
    'QA enterprise relationship path',
    'Primary QA Bum used for allowed accepted-opportunity and target-response checks.',
    'https://linkedin.com/in/qa-primary-bum',
    12,
    'open',
    'US',
    array['Infrastructure', 'Enterprise Software'],
    array['North America'],
    array['Data platforms'],
    array['CIO', 'VP Sales'],
    array['QA Alpha Target Account'],
    array['Warm introductions', 'Executive access'],
    'verified',
    true
  ),
  (
    'qa_bum_secondary_auth_user',
    'QA denial-control relationship path',
    'Secondary QA Bum used to prove own-contact and own-capture boundaries.',
    'https://linkedin.com/in/qa-secondary-bum',
    8,
    'selective',
    'US',
    array['Industrial'],
    array['North America'],
    array['Energy infrastructure'],
    array['COO', 'VP Operations'],
    array['QA Beta Target Account'],
    array['Account mapping'],
    'reviewed',
    true
  );

insert into public.opportunity_registrations (
  id,
  company_id,
  created_by,
  target_account_name,
  business_unit,
  opportunity_description,
  client_contact,
  trusted_bums_contact,
  expected_product_service,
  estimated_deal_value,
  expected_timeline,
  commission_rate,
  notes,
  status
) values
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-0000000000a1',
    'qa_client_alpha_admin',
    'QA Alpha Allowed Opportunity',
    'Enterprise',
    'Positive fixture: Alpha users and accepted Bums should reach this opportunity.',
    'alpha.client@example.invalid',
    'QA Primary Bum',
    'Executive introduction',
    250000,
    'Q3',
    10,
    'qa_authorization allow opportunity',
    'Accepted'
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-0000000000b2',
    'qa_client_beta_admin',
    'QA Beta Denied Opportunity',
    'Industrial',
    'Negative fixture: Alpha users should not reach this Beta opportunity.',
    'beta.client@example.invalid',
    'QA Secondary Bum',
    'Executive introduction',
    180000,
    'Q4',
    10,
    'qa_authorization deny opportunity',
    'Accepted'
  );

insert into public.customer_targets (
  id,
  client_company_id,
  target_company_id,
  created_by,
  status,
  priority,
  target_account_name,
  business_unit,
  key_contact_name,
  key_contact_title,
  key_contact_email,
  expected_product_service,
  estimated_deal_value,
  expected_timeline,
  notes
) values
  (
    '00000000-0000-4000-8000-00000000c101',
    '00000000-0000-4000-8000-0000000000a1',
    '00000000-0000-4000-8000-0000000000f1',
    'qa_client_alpha_admin',
    'INTRO_REQUESTED',
    'HIGH',
    'QA Alpha Target Account',
    'Enterprise',
    'Avery Alpha',
    'CIO',
    'avery.alpha@example.invalid',
    'Named-account access',
    250000,
    'Q3',
    'qa_authorization allow customer target'
  ),
  (
    '00000000-0000-4000-8000-00000000c102',
    '00000000-0000-4000-8000-0000000000b2',
    '00000000-0000-4000-8000-0000000000f2',
    'qa_client_beta_admin',
    'INTRO_REQUESTED',
    'HIGH',
    'QA Beta Target Account',
    'Industrial',
    'Blake Beta',
    'COO',
    'blake.beta@example.invalid',
    'Named-account access',
    180000,
    'Q4',
    'qa_authorization deny customer target for Alpha'
  );

insert into public.client_company_access_requests (
  id,
  requester_profile_id,
  company_id,
  email,
  email_domain,
  requested_company_name,
  requested_domain,
  requested_role,
  request_type,
  status,
  evidence,
  requested_by
) values
  (
    '00000000-0000-4000-8000-00000000a301',
    'qa_pending_public_email',
    null,
    'qa_pending_public@gmail.example',
    'gmail.example',
    'QA Public Email Company',
    null,
    'CLIENT_ADMIN',
    'PUBLIC_EMAIL_COMPANY',
    'pending',
    '{"fixture":"qa_authorization","expectation":"admin proof required"}'::jsonb,
    'qa_pending_public_email'
  ),
  (
    '00000000-0000-4000-8000-00000000a302',
    'qa_client_alpha_admin',
    '00000000-0000-4000-8000-0000000000a1',
    'qa_client_admin@qa.com',
    'qa-alpha.example',
    'QA Alpha Client',
    'qa-alpha-alias.example',
    null,
    'RELATED_DOMAIN',
    'pending',
    '{"fixture":"qa_authorization","expectation":"admin proof required"}'::jsonb,
    'qa_client_alpha_admin'
  ),
  (
    '00000000-0000-4000-8000-00000000a303',
    'qa_pending_same_domain',
    '00000000-0000-4000-8000-0000000000a1',
    'qa_pending_same_domain@qa-alpha.example',
    'qa-alpha.example',
    'QA Alpha Client',
    null,
    'CLIENT_MEMBER',
    'SAME_DOMAIN_ACCESS',
    'pending',
    '{"fixture":"qa_authorization","expectation":"client admin same-company approval"}'::jsonb,
    'qa_pending_same_domain'
  );

insert into public.opportunity_claims (
  id,
  opportunity_registration_id,
  company_id,
  bum_user_id,
  contact_name,
  contact_company,
  contact_email,
  relationship_strength,
  note,
  status
) values
  (
    '00000000-0000-4000-8000-00000000d101',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-0000000000a1',
    'qa_bum_primary_auth_user',
    'Avery Alpha',
    'QA Alpha Target Account',
    'avery.alpha@example.invalid',
    'STRONG',
    'qa_authorization allowed claim',
    'APPROVED'
  ),
  (
    '00000000-0000-4000-8000-00000000d102',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-0000000000b2',
    'qa_bum_secondary_auth_user',
    'Blake Beta',
    'QA Beta Target Account',
    'blake.beta@example.invalid',
    'STRONG',
    'qa_authorization foreign-company claim for Alpha denial',
    'APPROVED'
  );

insert into public.opportunity_claim_public_summaries (
  id,
  opportunity_registration_id,
  company_id,
  bum_user_id,
  bum_display_name,
  status
) values
  (
    '00000000-0000-4000-8000-00000000d101',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-0000000000a1',
    'qa_bum_primary_auth_user',
    'QA Primary Bum',
    'APPROVED'
  ),
  (
    '00000000-0000-4000-8000-00000000d102',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-0000000000b2',
    'qa_bum_secondary_auth_user',
    'QA Secondary Bum',
    'APPROVED'
  );

insert into public.customer_target_responses (
  id,
  customer_target_id,
  client_company_id,
  bum_user_id,
  contact_name,
  contact_email,
  relationship_strength,
  note,
  status,
  opportunity_registration_id,
  opportunity_claim_id
) values
  (
    '00000000-0000-4000-8000-000000007001',
    '00000000-0000-4000-8000-00000000c101',
    '00000000-0000-4000-8000-0000000000a1',
    'qa_bum_primary_auth_user',
    'Avery Alpha',
    'avery.alpha@example.invalid',
    'strong',
    'qa_authorization allowed target response',
    'ACCEPTED',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-00000000d101'
  ),
  (
    '00000000-0000-4000-8000-000000007002',
    '00000000-0000-4000-8000-00000000c102',
    '00000000-0000-4000-8000-0000000000b2',
    'qa_bum_secondary_auth_user',
    'Blake Beta',
    'blake.beta@example.invalid',
    'strong',
    'qa_authorization foreign-company target response for Alpha denial',
    'ACCEPTED',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-00000000d102'
  );

insert into public.extension_page_captures (
  id,
  api_version,
  created_by,
  company_id,
  opportunity_registration_id,
  customer_target_id,
  client_request_id,
  capture_type,
  source_url,
  page_title,
  selected_text,
  note,
  status,
  metadata,
  user_agent
) values
  (
    '00000000-0000-4000-8000-00000000e001',
    'v1',
    'qa_bum_primary_auth_user',
    '00000000-0000-4000-8000-0000000000a1',
    '00000000-0000-4000-8000-000000000101',
    null,
    'qa-authz-alpha-opportunity-capture',
    'LINKEDIN_PROFILE',
    'https://www.linkedin.com/in/qa-alpha-contact',
    'QA Alpha Contact',
    'Selected text for Alpha allow fixture.',
    'qa_authorization allowed extension capture',
    'DRAFT',
    '{"fixture":"qa_authorization","expectation":"Bum owner allowed, Alpha company projection check"}'::jsonb,
    'qa-authorization-seed'
  ),
  (
    '00000000-0000-4000-8000-00000000e002',
    'v1',
    'qa_bum_secondary_auth_user',
    '00000000-0000-4000-8000-0000000000b2',
    null,
    '00000000-0000-4000-8000-00000000c102',
    'qa-authz-beta-target-capture',
    'LINKEDIN_PROFILE',
    'https://www.linkedin.com/in/qa-beta-contact',
    'QA Beta Contact',
    'Selected text for Beta denial-control fixture.',
    'qa_authorization denied extension capture for Alpha and primary Bum',
    'DRAFT',
    '{"fixture":"qa_authorization","expectation":"foreign company and non-owner denial"}'::jsonb,
    'qa-authorization-seed'
  );

insert into public.bum_contacts (
  id,
  bum_user_id,
  source_type,
  source_id,
  extension_page_capture_id,
  opportunity_registration_id,
  customer_target_id,
  full_name,
  title,
  company_name,
  email,
  linkedin_url,
  relationship_strength,
  status,
  notes,
  metadata
) values
  (
    '00000000-0000-4000-8000-00000000b001',
    'qa_bum_primary_auth_user',
    'OPPORTUNITY_CLAIM',
    '00000000-0000-4000-8000-00000000d101',
    null,
    '00000000-0000-4000-8000-000000000101',
    null,
    'Avery Alpha',
    'CIO',
    'QA Alpha Target Account',
    'avery.alpha@example.invalid',
    'https://www.linkedin.com/in/qa-alpha-contact',
    'STRONG',
    'ACTIVE',
    'qa_authorization own contact from allowed opportunity claim',
    '{"fixture":"qa_authorization","allow":"qa_bum_primary_auth_user"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-00000000b002',
    'qa_bum_primary_auth_user',
    'EXTENSION_CAPTURE',
    '00000000-0000-4000-8000-00000000e001',
    '00000000-0000-4000-8000-00000000e001',
    '00000000-0000-4000-8000-000000000101',
    null,
    'Avery Alpha Extension',
    'CIO',
    'QA Alpha Target Account',
    'avery.alpha.extension@example.invalid',
    'https://www.linkedin.com/in/qa-alpha-contact',
    'STRONG',
    'ACTIVE',
    'qa_authorization own contact from extension capture',
    '{"fixture":"qa_authorization","allow":"qa_bum_primary_auth_user"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-00000000b003',
    'qa_bum_secondary_auth_user',
    'TARGET_RESPONSE',
    '00000000-0000-4000-8000-000000007002',
    null,
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-00000000c102',
    'Blake Beta',
    'COO',
    'QA Beta Target Account',
    'blake.beta@example.invalid',
    'https://www.linkedin.com/in/qa-beta-contact',
    'STRONG',
    'ACTIVE',
    'qa_authorization foreign Bum contact denial-control for primary Bum',
    '{"fixture":"qa_authorization","deny":"qa_bum_primary_auth_user"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-00000000b004',
    'qa_bum_secondary_auth_user',
    'MANUAL',
    'qa-authz-secondary-manual',
    null,
    null,
    null,
    'Manual Beta Contact',
    'Advisor',
    'QA Beta Target Account',
    'manual.beta@example.invalid',
    'https://www.linkedin.com/in/qa-beta-manual-contact',
    'MODERATE',
    'ACTIVE',
    'qa_authorization manual foreign Bum contact denial-control',
    '{"fixture":"qa_authorization","deny":"qa_bum_primary_auth_user"}'::jsonb
  );

insert into public.performance_metric_events (
  id,
  metric_name,
  metric_value,
  metric_rating,
  metric_id,
  navigation_type,
  page_path,
  connection_type,
  deployment_origin,
  user_agent_hash,
  raw_payload
) values
  (
    '00000000-0000-4000-8000-00000000f001',
    'LCP',
    1600.000,
    'good',
    'qa-authz-admin-performance',
    'navigate',
    '/admin/performance',
    '4g',
    'qa_authorization_seed',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    '{"fixture":"qa_authorization","expectation":"admin-only read"}'::jsonb
  );

insert into public.audit_events (
  id,
  company_id,
  user_id,
  event_type,
  entity_type,
  entity_id,
  event_data
) values
  (
    '00000000-0000-4000-8000-00000000ae01',
    null,
    'qa_admin_auth_user',
    'qa_authorization_fixture_seeded',
    'client_company_access_requests',
    '00000000-0000-4000-8000-00000000a301',
    '{"fixture":"qa_authorization","requestType":"PUBLIC_EMAIL_COMPANY","expectation":"approval requires proof category and review note"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-00000000ae02',
    '00000000-0000-4000-8000-0000000000a1',
    'qa_admin_auth_user',
    'qa_authorization_fixture_seeded',
    'client_company_access_requests',
    '00000000-0000-4000-8000-00000000a302',
    '{"fixture":"qa_authorization","requestType":"RELATED_DOMAIN","expectation":"approval requires proof category and review note"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-00000000ae03',
    '00000000-0000-4000-8000-0000000000a1',
    'qa_client_alpha_admin',
    'qa_authorization_fixture_seeded',
    'client_company_access_requests',
    '00000000-0000-4000-8000-00000000a303',
    '{"fixture":"qa_authorization","requestType":"SAME_DOMAIN_ACCESS","expectation":"same-company client admin allow, foreign-company client admin deny"}'::jsonb
  );

commit;

-- Minimum matrix this fixture is meant to support:
-- qa_client_alpha_admin: allow Alpha opportunity/target/team request, deny Beta opportunity/target.
-- qa_client_alpha_finance: allow finance-safe Alpha surfaces, deny operational/admin-only changes.
-- qa_client_alpha_member: allow member-visible Alpha surfaces, deny finance/admin-only changes.
-- qa_client_beta_admin: allow Beta opportunity/target/team request, deny Alpha-only mutation.
-- qa_bum_primary_auth_user: allow own claims/captures/contacts, deny secondary Bum contacts/captures.
-- qa_admin_auth_user: allow admin review/performance/audit surfaces across both companies.
-- qa_client_disabled_user and pending profiles: deny authenticated portal authority until approved.
