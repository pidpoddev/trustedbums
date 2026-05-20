drop policy if exists "Users can upload own training attachment objects" on storage.objects;
create policy "Users can upload own training attachment objects"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = $bucket$training-material-attachments$bucket$
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = public.current_company_id()::text
    or (public.is_bum() and (storage.foldername(name))[1] = $folder$corporate$folder$)
  )
);
