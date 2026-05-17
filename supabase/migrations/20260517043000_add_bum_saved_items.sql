create table if not exists public.bum_saved_items (
  id uuid primary key default gen_random_uuid(),
  bum_user_id text not null references public.profiles(id) on delete cascade,
  item_type text not null check (item_type in ('CLIENT', 'OPPORTUNITY', 'CUSTOMER_TARGET')),
  client_company_id uuid references public.companies(id) on delete cascade,
  opportunity_registration_id uuid references public.opportunity_registrations(id) on delete cascade,
  customer_target_id uuid references public.customer_targets(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (
    (item_type = 'CLIENT' and client_company_id is not null and opportunity_registration_id is null and customer_target_id is null)
    or (item_type = 'OPPORTUNITY' and client_company_id is null and opportunity_registration_id is not null and customer_target_id is null)
    or (item_type = 'CUSTOMER_TARGET' and client_company_id is null and opportunity_registration_id is null and customer_target_id is not null)
  )
);

create unique index if not exists bum_saved_items_client_unique
  on public.bum_saved_items (bum_user_id, client_company_id)
  where item_type = 'CLIENT';

create unique index if not exists bum_saved_items_opportunity_unique
  on public.bum_saved_items (bum_user_id, opportunity_registration_id)
  where item_type = 'OPPORTUNITY';

create unique index if not exists bum_saved_items_customer_target_unique
  on public.bum_saved_items (bum_user_id, customer_target_id)
  where item_type = 'CUSTOMER_TARGET';

create index if not exists bum_saved_items_bum_created_at_idx
  on public.bum_saved_items (bum_user_id, created_at desc);

alter table public.bum_saved_items enable row level security;

grant select, insert, delete on public.bum_saved_items to anon, authenticated;

drop policy if exists "Bums can read own saved items" on public.bum_saved_items;
create policy "Bums can read own saved items"
on public.bum_saved_items for select
using (bum_user_id = public.current_user_id() or public.is_admin());

drop policy if exists "Bums can save own items" on public.bum_saved_items;
create policy "Bums can save own items"
on public.bum_saved_items for insert
with check (bum_user_id = public.current_user_id());

drop policy if exists "Bums can unsave own items" on public.bum_saved_items;
create policy "Bums can unsave own items"
on public.bum_saved_items for delete
using (bum_user_id = public.current_user_id() or public.is_admin());
