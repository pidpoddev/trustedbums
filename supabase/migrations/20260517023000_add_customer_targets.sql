create table if not exists public.customer_targets (
  id uuid primary key default gen_random_uuid(),
  client_company_id uuid not null references public.companies(id) on delete cascade,
  target_company_id uuid not null references public.companies(id) on delete cascade,
  created_by text not null references public.profiles(id) on delete cascade,
  status text not null default 'PROSPECT',
  priority text not null default 'MEDIUM',
  target_account_name text not null,
  business_unit text,
  key_contact_name text,
  key_contact_title text,
  key_contact_email text,
  expected_product_service text,
  estimated_deal_value numeric,
  expected_timeline text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customer_targets_client_target_company_idx
  on public.customer_targets (client_company_id, target_company_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customer_targets_status_check'
  ) then
    alter table public.customer_targets
      add constraint customer_targets_status_check
      check (status in ('PROSPECT', 'QUALIFYING', 'INTRO_REQUESTED', 'INTRO_IN_PROGRESS', 'MEETING_SET', 'OPEN_OPPORTUNITY', 'CLOSED_WON', 'CLOSED_LOST'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'customer_targets_priority_check'
  ) then
    alter table public.customer_targets
      add constraint customer_targets_priority_check
      check (priority in ('LOW', 'MEDIUM', 'HIGH'));
  end if;
end
$$;

drop trigger if exists set_customer_targets_updated_at on public.customer_targets;
create trigger set_customer_targets_updated_at
before update on public.customer_targets
for each row execute function public.set_updated_at();

alter table public.customer_targets enable row level security;

drop policy if exists "Clients can read own customer targets" on public.customer_targets;
create policy "Clients can read own customer targets"
on public.customer_targets for select
to authenticated
using (
  public.is_admin()
  or client_company_id = public.current_company_id()
);

drop policy if exists "Clients can create own customer targets" on public.customer_targets;
create policy "Clients can create own customer targets"
on public.customer_targets for insert
to authenticated
with check (
  public.is_admin()
  or (
    created_by = public.current_user_id()
    and client_company_id = public.current_company_id()
  )
);

drop policy if exists "Clients can update own customer targets" on public.customer_targets;
create policy "Clients can update own customer targets"
on public.customer_targets for update
to authenticated
using (
  public.is_admin()
  or client_company_id = public.current_company_id()
)
with check (
  public.is_admin()
  or client_company_id = public.current_company_id()
);
