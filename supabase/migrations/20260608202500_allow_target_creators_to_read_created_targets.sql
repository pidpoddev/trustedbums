drop policy if exists "Clients can read own customer targets" on public.customer_targets;
create policy "Clients can read own customer targets"
on public.customer_targets for select
to anon, authenticated
using (
  private.is_admin()
  or client_company_id = private.current_company_id()
  or created_by = public.current_user_id()
);
