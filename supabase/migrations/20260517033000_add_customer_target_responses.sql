create table if not exists public.customer_target_responses (
  id uuid primary key default gen_random_uuid(),
  customer_target_id uuid not null references public.customer_targets(id) on delete cascade,
  client_company_id uuid not null references public.companies(id) on delete cascade,
  bum_user_id text not null references public.profiles(id) on delete cascade,
  contact_name text not null,
  contact_email text,
  relationship_strength text not null default 'warm',
  note text,
  status text not null default 'PROPOSED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_target_responses_strength_check check (relationship_strength in ('warm', 'strong', 'advisor', 'unknown')),
  constraint customer_target_responses_status_check check (status in ('PROPOSED', 'ACCEPTED', 'DECLINED', 'CONTACTED', 'MEETING_SET'))
);

create index if not exists customer_target_responses_target_idx
  on public.customer_target_responses (customer_target_id, created_at desc);

create unique index if not exists customer_target_responses_unique_contact_idx
  on public.customer_target_responses (customer_target_id, bum_user_id, lower(contact_name));

drop trigger if exists set_customer_target_responses_updated_at on public.customer_target_responses;
create trigger set_customer_target_responses_updated_at
before update on public.customer_target_responses
for each row execute function public.set_updated_at();

grant select, insert, update on public.customer_target_responses to anon, authenticated;

alter table public.customer_target_responses enable row level security;

drop policy if exists "Users can read relevant customer target responses" on public.customer_target_responses;
create policy "Users can read relevant customer target responses"
on public.customer_target_responses for select
to authenticated
using (
  public.is_admin()
  or bum_user_id = public.current_user_id()
  or client_company_id = public.current_company_id()
);

drop policy if exists "Bums can create customer target responses" on public.customer_target_responses;
create policy "Bums can create customer target responses"
on public.customer_target_responses for insert
to authenticated
with check (
  bum_user_id = public.current_user_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'BUM'
  )
);

drop policy if exists "Admins can update customer target responses" on public.customer_target_responses;
create policy "Admins can update customer target responses"
on public.customer_target_responses for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
