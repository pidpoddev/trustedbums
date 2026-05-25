create table if not exists public.extension_page_captures (
  id uuid primary key default gen_random_uuid(),
  api_version text not null default 'v1',
  created_by text not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  opportunity_registration_id uuid references public.opportunity_registrations(id) on delete cascade,
  customer_target_id uuid references public.customer_targets(id) on delete cascade,
  client_request_id text,
  capture_type text not null default 'WEB_PAGE',
  source_url text not null,
  page_title text,
  selected_text text,
  note text,
  status text not null default 'DRAFT',
  metadata jsonb not null default '{}'::jsonb,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint extension_page_captures_destination_check check (
    num_nonnulls(opportunity_registration_id, customer_target_id) = 1
  ),
  constraint extension_page_captures_capture_type_check check (
    capture_type in ('LINKEDIN_PROFILE', 'LINKEDIN_COMPANY', 'WEB_PAGE', 'OTHER')
  ),
  constraint extension_page_captures_status_check check (
    status in ('DRAFT', 'REVIEWED', 'ARCHIVED', 'CONVERTED')
  )
);

create index if not exists extension_page_captures_created_by_created_at_idx
  on public.extension_page_captures (created_by, created_at desc);

create index if not exists extension_page_captures_company_created_at_idx
  on public.extension_page_captures (company_id, created_at desc);

create index if not exists extension_page_captures_opportunity_idx
  on public.extension_page_captures (opportunity_registration_id, created_at desc)
  where opportunity_registration_id is not null;

create index if not exists extension_page_captures_customer_target_idx
  on public.extension_page_captures (customer_target_id, created_at desc)
  where customer_target_id is not null;

create unique index if not exists extension_page_captures_client_request_idx
  on public.extension_page_captures (created_by, client_request_id)
  where client_request_id is not null;

drop trigger if exists set_extension_page_captures_updated_at on public.extension_page_captures;
create trigger set_extension_page_captures_updated_at
before update on public.extension_page_captures
for each row execute function public.set_updated_at();

alter table public.extension_page_captures enable row level security;

grant select on public.extension_page_captures to authenticated;
grant all on public.extension_page_captures to service_role;

drop policy if exists "Users can read relevant extension captures" on public.extension_page_captures;
create policy "Users can read relevant extension captures"
on public.extension_page_captures for select
to authenticated
using (
  public.is_admin()
  or created_by = public.current_user_id()
  or company_id = public.current_company_id()
);
