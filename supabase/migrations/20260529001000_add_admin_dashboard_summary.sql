create or replace function public.admin_dashboard_summary()
returns table (
  companies_count bigint,
  profiles_count bigint,
  prospect_recommendations_count bigint,
  customer_targets_count bigint,
  opportunity_registrations_count bigint,
  prospect_companies_count bigint,
  client_companies_count bigint
)
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if not public.is_admin() then
    raise exception 'Only admins can read admin dashboard summary.' using errcode = '42501';
  end if;

  return query
  select
    (select count(*) from public.companies) as companies_count,
    (select count(*) from public.profiles) as profiles_count,
    (select count(*) from public.prospect_recommendations) as prospect_recommendations_count,
    (select count(*) from public.customer_targets) as customer_targets_count,
    (select count(*) from public.opportunity_registrations) as opportunity_registrations_count,
    (select count(*) from public.companies where relationship_stage = 'PROSPECT') as prospect_companies_count,
    (select count(*) from public.companies where relationship_stage = 'CLIENT') as client_companies_count;
end;
$fn$;

revoke all on function public.admin_dashboard_summary() from public;
grant execute on function public.admin_dashboard_summary() to authenticated;
