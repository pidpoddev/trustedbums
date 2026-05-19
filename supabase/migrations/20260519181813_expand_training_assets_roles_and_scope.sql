alter table public.training_materials
  alter column company_id drop not null;

alter table public.training_material_attachments
  alter column company_id drop not null;

drop policy if exists "Clients can read own training materials" on public.training_materials;
create policy "Users can read relevant training materials"
on public.training_materials for select
to anon, authenticated
using (
  public.is_admin()
  or (is_published = true and company_id is null)
  or company_id = public.current_company_id()
  or (is_published = true and public.is_bum())
);

drop policy if exists "Clients can create own training materials" on public.training_materials;
create policy "Users can create relevant training materials"
on public.training_materials for insert
to anon, authenticated
with check (
  created_by = public.current_user_id()
  and (
    public.is_admin()
    or public.is_bum()
    or company_id = public.current_company_id()
  )
);

drop policy if exists "Clients can update own training materials" on public.training_materials;
create policy "Users can update own training materials"
on public.training_materials for update
to anon, authenticated
using (
  public.is_admin()
  or created_by = public.current_user_id()
  or company_id = public.current_company_id()
)
with check (
  public.is_admin()
  or created_by = public.current_user_id()
  or company_id = public.current_company_id()
);

drop policy if exists "Bums can read published training materials" on public.training_materials;
drop policy if exists "Admins can manage training materials" on public.training_materials;
create policy "Admins can manage training materials"
on public.training_materials for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

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
      and (material.company_id is null or public.is_bum())
  )
);

drop policy if exists "Clients can create own training attachments" on public.training_material_attachments;
create policy "Users can create own training attachments"
on public.training_material_attachments for insert
to anon, authenticated
with check (
  uploaded_by = public.current_user_id()
  and exists (
    select 1
    from public.training_materials material
    where material.id = training_material_id
      and material.created_by = public.current_user_id()
      and coalesce(material.company_id::text, '') = coalesce(company_id::text, '')
  )
);

drop policy if exists "Clients can delete own training attachments" on public.training_material_attachments;
create policy "Users can delete own training attachments"
on public.training_material_attachments for delete
to authenticated
using (
  public.is_admin()
  or uploaded_by = public.current_user_id()
  or company_id = public.current_company_id()
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
    or (storage.foldername(name))[1] = $folder$corporate$folder$
    or exists (
      select 1
      from public.training_material_attachments attachment
      join public.training_materials material on material.id = attachment.training_material_id
      where attachment.storage_bucket = storage.objects.bucket_id
        and attachment.storage_path = storage.objects.name
        and material.is_published = true
        and (material.company_id is null or public.is_bum())
    )
  )
);

drop policy if exists "Clients can upload own training attachment objects" on storage.objects;
create policy "Users can upload own training attachment objects"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = $bucket$training-material-attachments$bucket$
  and (
    (storage.foldername(name))[1] = public.current_company_id()::text
    or ((public.is_admin() or public.is_bum()) and (storage.foldername(name))[1] = $folder$corporate$folder$)
  )
);

drop policy if exists "Clients can delete own training attachment objects" on storage.objects;
create policy "Users can delete own training attachment objects"
on storage.objects for delete
to authenticated
using (
  bucket_id = $bucket$training-material-attachments$bucket$
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = public.current_company_id()::text
    or ((public.is_bum() or public.is_admin()) and (storage.foldername(name))[1] = $folder$corporate$folder$)
  )
);
