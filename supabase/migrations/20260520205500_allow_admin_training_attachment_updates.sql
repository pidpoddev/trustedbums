grant update on public.training_material_attachments to authenticated;

drop policy if exists "Admins can update training attachments" on public.training_material_attachments;
create policy "Admins can update training attachments"
on public.training_material_attachments for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
