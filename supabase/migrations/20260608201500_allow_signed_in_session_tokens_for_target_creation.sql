drop policy if exists "Authenticated users can create companies" on public.companies;
drop policy if exists "Signed-in users can create companies" on public.companies;
create policy "Signed-in users can create companies"
on public.companies for insert
to anon, authenticated
with check (public.current_user_id() is not null);

drop policy if exists "Authenticated users can read company domains" on public.company_domains;
drop policy if exists "Signed-in users can read company domains" on public.company_domains;
create policy "Signed-in users can read company domains"
on public.company_domains for select
to anon, authenticated
using (public.current_user_id() is not null);

drop policy if exists "Authenticated users can create company domains" on public.company_domains;
drop policy if exists "Signed-in users can create company domains" on public.company_domains;
create policy "Signed-in users can create company domains"
on public.company_domains for insert
to anon, authenticated
with check (public.current_user_id() is not null);

drop policy if exists "Clients can create own customer targets" on public.customer_targets;
create policy "Clients can create own customer targets"
on public.customer_targets for insert
to anon, authenticated
with check (
  private.is_admin()
  or (
    created_by = public.current_user_id()
    and client_company_id = private.current_company_id()
  )
);
