alter table public.performance_metric_events
  add column if not exists metric_id text,
  add column if not exists navigation_type text;

alter table public.performance_metric_events
  drop constraint if exists performance_metric_events_metric_id_length_check,
  add constraint performance_metric_events_metric_id_length_check
    check (metric_id is null or char_length(metric_id) <= 128);

alter table public.performance_metric_events
  drop constraint if exists performance_metric_events_navigation_type_length_check,
  add constraint performance_metric_events_navigation_type_length_check
    check (navigation_type is null or char_length(navigation_type) <= 40);

create index if not exists performance_metric_events_metric_id_idx
  on public.performance_metric_events (metric_id)
  where metric_id is not null;
