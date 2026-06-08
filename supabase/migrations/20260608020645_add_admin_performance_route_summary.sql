create or replace function public.admin_performance_route_summary(
  days_window integer default 7,
  metric_name_filter text default null,
  rating_filter text default null,
  row_limit integer default 50
)
returns table (
  page_path text,
  metric_name text,
  sample_count bigint,
  poor_count bigint,
  needs_improvement_count bigint,
  p75_value numeric,
  last_seen_at timestamptz
)
language plpgsql
set search_path = public
as $function$
declare
  safe_days integer := least(greatest(coalesce(days_window, 7), 1), 90);
  safe_limit integer := least(greatest(coalesce(row_limit, 50), 10), 100);
begin
  if not private.is_admin() then
    raise exception 'Only admins can read performance route summaries.' using errcode = '42501';
  end if;

  return query
  with filtered_events as (
    select
      event.page_path,
      event.metric_name,
      event.metric_value,
      event.metric_rating,
      event.created_at
    from public.performance_metric_events event
    where event.created_at >= now() - make_interval(days => safe_days)
      and (metric_name_filter is null or event.metric_name = metric_name_filter)
      and (rating_filter is null or event.metric_rating = rating_filter)
  )
  select
    event.page_path,
    event.metric_name,
    count(*) as sample_count,
    count(*) filter (where event.metric_rating = 'poor') as poor_count,
    count(*) filter (where event.metric_rating = 'needs-improvement') as needs_improvement_count,
    percentile_cont(0.75) within group (order by event.metric_value)::numeric as p75_value,
    max(event.created_at) as last_seen_at
  from filtered_events event
  group by event.page_path, event.metric_name
  order by poor_count desc, needs_improvement_count desc, sample_count desc, last_seen_at desc
  limit safe_limit;
end;
$function$;

revoke all on function public.admin_performance_route_summary(integer, text, text, integer) from public;
revoke execute on function public.admin_performance_route_summary(integer, text, text, integer) from anon;
grant execute on function public.admin_performance_route_summary(integer, text, text, integer) to authenticated;
