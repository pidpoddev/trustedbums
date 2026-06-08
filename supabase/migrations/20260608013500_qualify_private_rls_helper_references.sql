create or replace function private.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $function$
  select company_id from public.profiles where id = public.current_user_id()
$function$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.profiles
    where id = public.current_user_id()
      and (is_admin = true or upper(coalesce(role, '')) = 'ADMIN')
  )
$function$;

create or replace function private.is_bum()
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.profiles
    where id = public.current_user_id()
      and upper(coalesce(role, '')) = 'BUM'
  )
$function$;

create or replace function private.company_has_customer_targets(company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.customer_targets target
    where target.client_company_id = company_id
  )
$function$;

create or replace function private.conversation_company_id(conversation_id_input uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $function$
  select thread.company_id
  from public.conversation_threads thread
  where thread.id = conversation_id_input
$function$;

create or replace function private.is_conversation_participant(conversation_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.conversation_participants participant
    where participant.conversation_id = conversation_id_input
      and participant.user_id = public.current_user_id()
  )
$function$;

create or replace function private.can_add_conversation_participant(conversation_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.conversation_threads thread
    where thread.id = conversation_id_input
      and (
        thread.created_by = public.current_user_id()
        or thread.company_id = private.current_company_id()
        or exists (
          select 1
          from public.conversation_participants participant
          where participant.conversation_id = thread.id
            and participant.user_id = public.current_user_id()
        )
      )
  )
$function$;

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
set search_path = public
as $function$
begin
  if not private.is_admin() then
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
$function$;

create or replace function public.admin_performance_metric_summary(
  days_window integer default 7,
  metric_name_filter text default null,
  rating_filter text default null
)
returns table (
  metric_name text,
  sample_count bigint,
  poor_count bigint,
  needs_improvement_count bigint,
  p75_value numeric,
  route_count bigint
)
language plpgsql
set search_path = public
as $function$
declare
  safe_days integer := least(greatest(coalesce(days_window, 7), 1), 90);
begin
  if not private.is_admin() then
    raise exception 'Only admins can read performance metric summaries.' using errcode = '42501';
  end if;

  return query
  with filtered_events as (
    select event.metric_name, event.metric_value, event.metric_rating, event.page_path
    from public.performance_metric_events event
    where event.created_at >= now() - make_interval(days => safe_days)
      and (metric_name_filter is null or event.metric_name = metric_name_filter)
      and (rating_filter is null or event.metric_rating = rating_filter)
  )
  select
    event.metric_name,
    count(*) as sample_count,
    count(*) filter (where event.metric_rating = 'poor') as poor_count,
    count(*) filter (where event.metric_rating = 'needs-improvement') as needs_improvement_count,
    percentile_cont(0.75) within group (order by event.metric_value)::numeric as p75_value,
    count(distinct event.page_path) as route_count
  from filtered_events event
  group by event.metric_name
  order by event.metric_name;
end;
$function$;

create or replace function public.prevent_profile_self_authorization_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  current_profile_id text := public.current_user_id();
  current_is_admin boolean := private.is_admin();
begin
  if current_profile_id is null or current_is_admin then
    return new;
  end if;

  if old.id = current_profile_id and (
    new.role is distinct from old.role
    or new.is_admin is distinct from old.is_admin
    or new.company_id is distinct from old.company_id
    or new.client_access_role is distinct from old.client_access_role
    or new.access_status is distinct from old.access_status
    or new.disabled_at is distinct from old.disabled_at
    or new.disabled_by is distinct from old.disabled_by
  ) then
    raise exception 'Authorization-bearing profile fields require an approved server path.';
  end if;

  return new;
end;
$function$;

do $$
declare
  policy_record record;
  updated_using text;
  updated_check text;
  alter_sql text;
begin
  for policy_record in
    select
      policy.schemaname,
      policy.tablename,
      policy.policyname,
      pg_get_expr(pg_policy.polqual, pg_policy.polrelid) as using_expression,
      pg_get_expr(pg_policy.polwithcheck, pg_policy.polrelid) as check_expression
    from pg_policies policy
    join pg_class table_class
      on table_class.relname = policy.tablename
    join pg_namespace table_schema
      on table_schema.oid = table_class.relnamespace
      and table_schema.nspname = policy.schemaname
    join pg_policy
      on pg_policy.polrelid = table_class.oid
      and pg_policy.polname = policy.policyname
    where policy.schemaname in ('public', 'storage')
  loop
    updated_using := policy_record.using_expression;
    updated_check := policy_record.check_expression;

    if updated_using is not null then
      updated_using := regexp_replace(updated_using, '(^|[^.[:alnum:]_])is_admin\(\)', '\1private.is_admin()', 'g');
      updated_using := regexp_replace(updated_using, '(^|[^.[:alnum:]_])current_company_id\(\)', '\1private.current_company_id()', 'g');
      updated_using := regexp_replace(updated_using, '(^|[^.[:alnum:]_])is_bum\(\)', '\1private.is_bum()', 'g');
      updated_using := regexp_replace(updated_using, '(^|[^.[:alnum:]_])company_has_customer_targets\(', '\1private.company_has_customer_targets(', 'g');
      updated_using := regexp_replace(updated_using, '(^|[^.[:alnum:]_])conversation_company_id\(', '\1private.conversation_company_id(', 'g');
      updated_using := regexp_replace(updated_using, '(^|[^.[:alnum:]_])is_conversation_participant\(', '\1private.is_conversation_participant(', 'g');
      updated_using := regexp_replace(updated_using, '(^|[^.[:alnum:]_])can_add_conversation_participant\(', '\1private.can_add_conversation_participant(', 'g');
    end if;

    if updated_check is not null then
      updated_check := regexp_replace(updated_check, '(^|[^.[:alnum:]_])is_admin\(\)', '\1private.is_admin()', 'g');
      updated_check := regexp_replace(updated_check, '(^|[^.[:alnum:]_])current_company_id\(\)', '\1private.current_company_id()', 'g');
      updated_check := regexp_replace(updated_check, '(^|[^.[:alnum:]_])is_bum\(\)', '\1private.is_bum()', 'g');
      updated_check := regexp_replace(updated_check, '(^|[^.[:alnum:]_])company_has_customer_targets\(', '\1private.company_has_customer_targets(', 'g');
      updated_check := regexp_replace(updated_check, '(^|[^.[:alnum:]_])conversation_company_id\(', '\1private.conversation_company_id(', 'g');
      updated_check := regexp_replace(updated_check, '(^|[^.[:alnum:]_])is_conversation_participant\(', '\1private.is_conversation_participant(', 'g');
      updated_check := regexp_replace(updated_check, '(^|[^.[:alnum:]_])can_add_conversation_participant\(', '\1private.can_add_conversation_participant(', 'g');
    end if;

    if updated_using is distinct from policy_record.using_expression
      or updated_check is distinct from policy_record.check_expression
    then
      alter_sql := format('alter policy %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
      if updated_using is not null then
        alter_sql := alter_sql || format(' using (%s)', updated_using);
      end if;
      if updated_check is not null then
        alter_sql := alter_sql || format(' with check (%s)', updated_check);
      end if;
      execute alter_sql;
    end if;
  end loop;
end $$;
