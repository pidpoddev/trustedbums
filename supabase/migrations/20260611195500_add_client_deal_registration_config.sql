alter table public.companies
  add column if not exists deal_registration_config jsonb not null default jsonb_build_object(
    'is_beta_enabled', false,
    'beta_status', 'NOT_CONFIGURED',
    'method', 'EMAIL',
    'provider', 'CUSTOM_API',
    'external_portal_url', '',
    'api_base_url', '',
    'auth_method', '',
    'credential_reference', '',
    'approval_mode', 'MANUAL',
    'webhook_url', '',
    'polling_interval_minutes', null,
    'required_fields', jsonb_build_array(),
    'field_mapping_notes', '',
    'fallback_email', '',
    'fallback_instructions', ''
  );

alter table public.companies
  drop constraint if exists companies_deal_registration_config_object_check,
  add constraint companies_deal_registration_config_object_check
    check (jsonb_typeof(deal_registration_config) = 'object');

comment on column public.companies.deal_registration_config is
  'Beta deal registration workflow settings. Store provider metadata and secret references only; raw API secrets belong in server-side secrets.';
