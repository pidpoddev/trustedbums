alter table public.terms_versions
  add column if not exists audience text not null default 'CLIENT',
  add column if not exists is_custom boolean not null default false,
  add column if not exists custom_label text,
  add column if not exists created_by text;

alter table public.terms_versions
  drop constraint if exists terms_versions_audience_check;

alter table public.terms_versions
  add constraint terms_versions_audience_check check (audience in ('CLIENT', 'BUM'));

update public.terms_versions
set audience = case when version like 'bum%' then 'BUM' else audience end,
    is_custom = coalesce(is_custom, false);

create table if not exists public.terms_assignments (
  id uuid primary key default gen_random_uuid(),
  terms_version_id uuid not null references public.terms_versions(id) on delete cascade,
  audience text not null check (audience in ('CLIENT', 'BUM')),
  assigned_company_id uuid references public.companies(id) on delete cascade,
  assigned_user_id text references public.profiles(id) on delete cascade,
  is_required boolean not null default true,
  notes text,
  assigned_by text references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  due_at timestamptz,
  constraint terms_assignments_target_check check (
    (assigned_company_id is not null and assigned_user_id is null)
    or (assigned_company_id is null and assigned_user_id is not null)
  )
);

create unique index if not exists terms_assignments_company_unique_idx
  on public.terms_assignments (terms_version_id, assigned_company_id)
  where assigned_company_id is not null;

create unique index if not exists terms_assignments_user_unique_idx
  on public.terms_assignments (terms_version_id, assigned_user_id)
  where assigned_user_id is not null;

create table if not exists public.legal_documents (
  slug text primary key,
  title text not null,
  description text not null,
  effective_date date not null default current_date,
  sections jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  draft_title text,
  draft_description text,
  draft_effective_date date,
  draft_sections jsonb,
  change_summary text,
  created_by text references public.profiles(id) on delete set null,
  updated_by text references public.profiles(id) on delete set null,
  published_by text references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

drop trigger if exists set_legal_documents_updated_at on public.legal_documents;
create trigger set_legal_documents_updated_at
before update on public.legal_documents
for each row execute function public.set_updated_at();

alter table public.terms_assignments enable row level security;
alter table public.legal_documents enable row level security;

grant select, insert, update, delete on public.terms_assignments to authenticated;
grant select on public.legal_documents to anon, authenticated;
grant insert, update, delete on public.legal_documents to authenticated;

drop policy if exists "Admins can manage terms assignments" on public.terms_assignments;
create policy "Admins can manage terms assignments"
on public.terms_assignments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Assigned users can read terms assignments" on public.terms_assignments;
create policy "Assigned users can read terms assignments"
on public.terms_assignments for select
to authenticated
using (
  public.is_admin()
  or assigned_user_id = public.current_user_id()
  or assigned_company_id = public.current_company_id()
);

drop policy if exists "Published legal documents are public" on public.legal_documents;
create policy "Published legal documents are public"
on public.legal_documents for select
to anon, authenticated
using (is_published = true or public.is_admin());

drop policy if exists "Admins can create legal documents" on public.legal_documents;
create policy "Admins can create legal documents"
on public.legal_documents for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update legal documents" on public.legal_documents;
create policy "Admins can update legal documents"
on public.legal_documents for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
