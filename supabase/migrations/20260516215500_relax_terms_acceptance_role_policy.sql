begin;

drop policy if exists "Users can read company acceptances" on public.terms_acceptances;
create policy "Users can read company acceptances"
on public.terms_acceptances for select
to anon, authenticated
using (
  user_id = (nullif(auth.jwt()->>'sub', ''))::uuid
  or exists (
    select 1
    from public.profiles
    where id = (nullif(auth.jwt()->>'sub', ''))::uuid
      and (is_admin = true or upper(coalesce(role, '')) = 'ADMIN')
  )
);

drop policy if exists "Users can accept terms for own company" on public.terms_acceptances;
create policy "Users can accept terms for own company"
on public.terms_acceptances for insert
to anon, authenticated
with check (user_id = (nullif(auth.jwt()->>'sub', ''))::uuid);

commit;
