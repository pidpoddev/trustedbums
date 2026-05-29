create table if not exists public.performance_metric_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  metric_name text not null,
  metric_value numeric(12, 3) not null,
  metric_rating text not null,
  metric_id text,
  navigation_type text,
  page_path text not null default '/',
  connection_type text,
  deployment_origin text,
  user_agent_hash text,
  raw_payload jsonb not null default '{}'::jsonb,
  constraint performance_metric_events_name_check
    check (metric_name in ('LCP', 'FCP', 'INP', 'CLS', 'TTFB')),
  constraint performance_metric_events_value_check
    check (metric_value >= 0 and metric_value < 600000),
  constraint performance_metric_events_rating_check
    check (metric_rating in ('good', 'needs-improvement', 'poor')),
  constraint performance_metric_events_metric_id_length_check
    check (metric_id is null or char_length(metric_id) <= 128),
  constraint performance_metric_events_navigation_type_length_check
    check (navigation_type is null or char_length(navigation_type) <= 40),
  constraint performance_metric_events_path_length_check
    check (char_length(page_path) <= 300),
  constraint performance_metric_events_connection_length_check
    check (connection_type is null or char_length(connection_type) <= 40),
  constraint performance_metric_events_origin_length_check
    check (deployment_origin is null or char_length(deployment_origin) <= 200),
  constraint performance_metric_events_user_agent_hash_check
    check (user_agent_hash is null or char_length(user_agent_hash) = 64)
);

create index if not exists performance_metric_events_created_at_idx
  on public.performance_metric_events (created_at desc);

create index if not exists performance_metric_events_name_created_at_idx
  on public.performance_metric_events (metric_name, created_at desc);

create index if not exists performance_metric_events_rating_created_at_idx
  on public.performance_metric_events (metric_rating, created_at desc);

create index if not exists performance_metric_events_metric_id_idx
  on public.performance_metric_events (metric_id)
  where metric_id is not null;

create index if not exists performance_metric_events_path_created_at_idx
  on public.performance_metric_events (page_path, created_at desc);

alter table public.performance_metric_events enable row level security;

grant select on public.performance_metric_events to authenticated;
grant all on public.performance_metric_events to service_role;

drop policy if exists "Admins can read performance metric events" on public.performance_metric_events;
create policy "Admins can read performance metric events"
on public.performance_metric_events for select
to authenticated
using (public.is_admin());
