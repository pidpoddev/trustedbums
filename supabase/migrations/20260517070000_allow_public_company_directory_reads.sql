drop policy if exists "Public can read company directory rows" on public.companies;
create policy "Public can read company directory rows"
on public.companies for select
to anon
using (true);
