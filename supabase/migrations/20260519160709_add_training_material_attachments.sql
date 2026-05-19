insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  $bucket$training-material-attachments$bucket$,
  $bucket$training-material-attachments$bucket$,
  false,
  52428800,
  array[
    $mime$application/pdf$mime$,
    $mime$application/msword$mime$,
    $mime$application/vnd.openxmlformats-officedocument.wordprocessingml.document$mime$,
    $mime$application/vnd.ms-powerpoint$mime$,
    $mime$application/vnd.openxmlformats-officedocument.presentationml.presentation$mime$,
    $mime$application/vnd.ms-excel$mime$,
    $mime$application/vnd.openxmlformats-officedocument.spreadsheetml.sheet$mime$,
    $mime$text/plain$mime$,
    $mime$text/csv$mime$,
    $mime$image/png$mime$,
    $mime$image/jpeg$mime$
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.training_material_attachments (
  id uuid primary key default gen_random_uuid(),
  training_material_id uuid not null references public.training_materials(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  uploaded_by text not null,
  file_name text not null,
  file_type text,
  file_size bigint not null default 0,
  storage_bucket text not null default $bucket$training-material-attachments$bucket$,
  storage_path text not null,
  created_at timestamptz not null default now(),
  constraint training_material_attachments_storage_path_key unique (storage_bucket, storage_path)
);

create index if not exists training_material_attachments_material_idx
  on public.training_material_attachments (training_material_id, created_at);

create index if not exists training_material_attachments_company_idx
  on public.training_material_attachments (company_id, created_at desc);

alter table public.training_material_attachments enable row level security;

grant select, insert, delete on public.training_material_attachments to anon, authenticated;

drop policy if exists "Users can read relevant training attachments" on public.training_material_attachments;
create policy "Users can read relevant training attachments"
on public.training_material_attachments for select
to anon, authenticated
using (
  public.is_admin()
  or company_id = public.current_company_id()
  or exists (
    select 1
    from public.training_materials material
    where material.id = training_material_id
      and material.is_published = true
      and public.is_bum()
  )
);

drop policy if exists "Clients can create own training attachments" on public.training_material_attachments;
create policy "Clients can create own training attachments"
on public.training_material_attachments for insert
to anon, authenticated
with check (
  company_id = public.current_company_id()
  and uploaded_by = public.current_user_id()
  and exists (
    select 1
    from public.training_materials material
    where material.id = training_material_id
      and material.company_id = public.current_company_id()
      and material.created_by = public.current_user_id()
  )
);

drop policy if exists "Clients can delete own training attachments" on public.training_material_attachments;
create policy "Clients can delete own training attachments"
on public.training_material_attachments for delete
to authenticated
using (
  public.is_admin()
  or (
    company_id = public.current_company_id()
    and uploaded_by = public.current_user_id()
  )
);

drop policy if exists "Users can read relevant training attachment objects" on storage.objects;
create policy "Users can read relevant training attachment objects"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = $bucket$training-material-attachments$bucket$
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = public.current_company_id()::text
    or exists (
      select 1
      from public.training_material_attachments attachment
      join public.training_materials material on material.id = attachment.training_material_id
      where attachment.storage_bucket = storage.objects.bucket_id
        and attachment.storage_path = storage.objects.name
        and material.is_published = true
        and public.is_bum()
    )
  )
);

drop policy if exists "Clients can upload own training attachment objects" on storage.objects;
create policy "Clients can upload own training attachment objects"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = $bucket$training-material-attachments$bucket$
  and (storage.foldername(name))[1] = public.current_company_id()::text
);

drop policy if exists "Clients can delete own training attachment objects" on storage.objects;
create policy "Clients can delete own training attachment objects"
on storage.objects for delete
to authenticated
using (
  bucket_id = $bucket$training-material-attachments$bucket$
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = public.current_company_id()::text
  )
);
