create table if not exists public.training_materials (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by text not null,
  title text not null,
  description text,
  technology text,
  resource_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_materials_company_created_at_idx
  on public.training_materials (company_id, created_at desc);

create index if not exists training_materials_published_created_at_idx
  on public.training_materials (is_published, created_at desc);

alter table public.training_materials enable row level security;

grant select, insert, update on public.training_materials to anon, authenticated;

drop trigger if exists set_training_materials_updated_at on public.training_materials;
create trigger set_training_materials_updated_at
before update on public.training_materials
for each row execute function public.set_updated_at();

drop policy if exists "Clients can read own training materials" on public.training_materials;
create policy "Clients can read own training materials"
on public.training_materials for select
to anon, authenticated
using (
  company_id = current_company_id()
  or is_admin()
);

drop policy if exists "Clients can create own training materials" on public.training_materials;
create policy "Clients can create own training materials"
on public.training_materials for insert
to anon, authenticated
with check (
  company_id = current_company_id()
  and created_by = current_user_id()
);

drop policy if exists "Clients can update own training materials" on public.training_materials;
create policy "Clients can update own training materials"
on public.training_materials for update
to anon, authenticated
using (
  company_id = current_company_id()
  and created_by = current_user_id()
)
with check (
  company_id = current_company_id()
  and created_by = current_user_id()
);

drop policy if exists "Bums can read published training materials" on public.training_materials;
create policy "Bums can read published training materials"
on public.training_materials for select
to anon, authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'BUM'
  )
);

drop policy if exists "Admins can manage training materials" on public.training_materials;
create policy "Admins can manage training materials"
on public.training_materials for all
to authenticated
using (is_admin())
with check (is_admin());
