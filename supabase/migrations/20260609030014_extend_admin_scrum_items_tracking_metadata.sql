alter table public.admin_scrum_items
  add column if not exists item_type text not null default 'TASK'
    check (item_type in ('BUG', 'TASK', 'QA', 'SECURITY', 'RELEASE', 'DOCS', 'INFRA')),
  add column if not exists added_by_agent text not null default 'Lead Developer',
  add column if not exists source_key text;

create unique index if not exists admin_scrum_items_source_key_idx
  on public.admin_scrum_items (source_key)
  nulls distinct;

create index if not exists admin_scrum_items_type_status_idx
  on public.admin_scrum_items (item_type, status, priority, created_at desc);
