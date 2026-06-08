-- Cleanup for supabase/qa_authorization_seed.sql.
--
-- Intended for local/staging QA databases, or tightly controlled beta/prod smoke
-- runs where synthetic rows are removed immediately after verification.

begin;

delete from public.audit_events
where id in (
  '00000000-0000-4000-8000-00000000ae01',
  '00000000-0000-4000-8000-00000000ae02',
  '00000000-0000-4000-8000-00000000ae03'
)
or event_type = 'qa_authorization_fixture_seeded'
or event_data->>'fixture' = 'qa_authorization';

delete from public.performance_metric_events
where metric_id like 'qa-authz-%'
or raw_payload->>'fixture' = 'qa_authorization';

delete from public.bum_contacts
where id in (
  '00000000-0000-4000-8000-00000000b001',
  '00000000-0000-4000-8000-00000000b002',
  '00000000-0000-4000-8000-00000000b003',
  '00000000-0000-4000-8000-00000000b004'
)
or metadata->>'fixture' = 'qa_authorization';

delete from public.extension_page_captures
where id in (
  '00000000-0000-4000-8000-00000000e001',
  '00000000-0000-4000-8000-00000000e002'
)
or metadata->>'fixture' = 'qa_authorization'
or client_request_id like 'qa-authz-%';

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
)
or evidence->>'fixture' = 'qa_authorization';

delete from public.customer_targets
where id in (
  '00000000-0000-4000-8000-00000000c101',
  '00000000-0000-4000-8000-00000000c102'
)
or notes like 'qa_authorization%';

delete from public.opportunity_registrations
where id in (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000102'
)
or notes like 'qa_authorization%';

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
)
or notification_preferences->>'fixture' = 'qa_authorization';

delete from public.companies
where id in (
  '00000000-0000-4000-8000-0000000000a1',
  '00000000-0000-4000-8000-0000000000b2',
  '00000000-0000-4000-8000-0000000000f1',
  '00000000-0000-4000-8000-0000000000f2'
)
or name like 'QA Alpha%'
or name like 'QA Beta%';

commit;

-- Verification query. All counts should be zero after cleanup.
select 'audit_events' as table_name, count(*) as fixture_rows
from public.audit_events
where event_type = 'qa_authorization_fixture_seeded'
or event_data->>'fixture' = 'qa_authorization'
union all
select 'performance_metric_events', count(*)
from public.performance_metric_events
where metric_id like 'qa-authz-%'
or raw_payload->>'fixture' = 'qa_authorization'
union all
select 'bum_contacts', count(*)
from public.bum_contacts
where metadata->>'fixture' = 'qa_authorization'
union all
select 'extension_page_captures', count(*)
from public.extension_page_captures
where metadata->>'fixture' = 'qa_authorization'
or client_request_id like 'qa-authz-%'
union all
select 'client_company_access_requests', count(*)
from public.client_company_access_requests
where evidence->>'fixture' = 'qa_authorization'
union all
select 'customer_targets', count(*)
from public.customer_targets
where notes like 'qa_authorization%'
union all
select 'opportunity_registrations', count(*)
from public.opportunity_registrations
where notes like 'qa_authorization%'
union all
select 'profiles', count(*)
from public.profiles
where notification_preferences->>'fixture' = 'qa_authorization'
union all
select 'companies', count(*)
from public.companies
where name like 'QA Alpha%'
or name like 'QA Beta%';
