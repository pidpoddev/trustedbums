create table if not exists public.client_bum_intro_requests (
  id uuid primary key default gen_random_uuid(),
  client_company_id uuid not null references public.companies(id) on delete cascade,
  client_user_id text not null references public.profiles(id) on delete cascade,
  bum_user_id text not null references public.profiles(id) on delete cascade,
  target_company_name text not null,
  target_contact_name text,
  target_contact_title text,
  intro_context text not null,
  notes text,
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED', 'IN_REVIEW', 'INTRO_REQUESTED', 'CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_bum_intro_requests_company_created_idx
  on public.client_bum_intro_requests (client_company_id, created_at desc);

create index if not exists client_bum_intro_requests_bum_created_idx
  on public.client_bum_intro_requests (bum_user_id, created_at desc);

drop trigger if exists set_client_bum_intro_requests_updated_at on public.client_bum_intro_requests;
create trigger set_client_bum_intro_requests_updated_at
before update on public.client_bum_intro_requests
for each row execute function public.set_updated_at();

alter table public.client_bum_intro_requests enable row level security;

grant select, insert, update on public.client_bum_intro_requests to anon, authenticated;

drop policy if exists "Clients can create own Bum intro requests" on public.client_bum_intro_requests;
create policy "Clients can create own Bum intro requests"
on public.client_bum_intro_requests for insert
to anon, authenticated
with check (
  client_user_id = public.current_user_id()
  and client_company_id = public.current_company_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'CLIENT'
  )
  and exists (
    select 1
    from public.bum_profiles bum
    where bum.user_id = bum_user_id
      and bum.is_visible_to_clients = true
  )
);

drop policy if exists "Users can read relevant Bum intro requests" on public.client_bum_intro_requests;
create policy "Users can read relevant Bum intro requests"
on public.client_bum_intro_requests for select
to anon, authenticated
using (
  public.is_admin()
  or client_company_id = public.current_company_id()
  or bum_user_id = public.current_user_id()
);

drop policy if exists "Admins can manage Bum intro requests" on public.client_bum_intro_requests;
create policy "Admins can manage Bum intro requests"
on public.client_bum_intro_requests for all
to anon, authenticated
using (public.is_admin())
with check (public.is_admin());
