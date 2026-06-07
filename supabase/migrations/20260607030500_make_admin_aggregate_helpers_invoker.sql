alter function public.admin_dashboard_summary() security invoker;
alter function public.admin_performance_metric_summary(integer, text, text) security invoker;

revoke execute on function public.admin_dashboard_summary() from anon;
revoke execute on function public.admin_performance_metric_summary(integer, text, text) from anon;
grant execute on function public.admin_dashboard_summary() to authenticated;
grant execute on function public.admin_performance_metric_summary(integer, text, text) to authenticated;
