revoke execute on function public.admin_dashboard_summary() from anon;

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
security definer
set search_path = public
as $fn$
declare
  safe_days integer := least(greatest(coalesce(days_window, 7), 1), 90);
begin
  if not public.is_admin() then
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
$fn$;

revoke all on function public.admin_performance_metric_summary(integer, text, text) from public;
revoke execute on function public.admin_performance_metric_summary(integer, text, text) from anon;
grant execute on function public.admin_performance_metric_summary(integer, text, text) to authenticated;
