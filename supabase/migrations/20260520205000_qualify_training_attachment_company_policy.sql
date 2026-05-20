drop policy if exists "Users can create own training attachments" on public.training_material_attachments;
create policy "Users can create own training attachments"
on public.training_material_attachments for insert
to anon, authenticated
with check (
  public.is_admin()
  or (
    uploaded_by = public.current_user_id()
    and exists (
      select 1
      from public.training_materials material
      where material.id = training_material_attachments.training_material_id
        and material.created_by = public.current_user_id()
        and coalesce(material.company_id::text, '') = coalesce(training_material_attachments.company_id::text, '')
    )
  )
);
