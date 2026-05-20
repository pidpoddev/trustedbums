grant select on public.terms_versions to anon, authenticated;

drop policy if exists "Authenticated users can read terms" on public.terms_versions;
create policy "Signed in users can read terms"
on public.terms_versions for select
to anon, authenticated
using (true);
