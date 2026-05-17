drop policy if exists "Clients can read own customer targets" on public.customer_targets;
create policy "Clients can read own customer targets"
on public.customer_targets for select
to anon, authenticated
using (
  public.is_admin()
  or client_company_id = public.current_company_id()
);
