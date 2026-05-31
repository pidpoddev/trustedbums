drop policy if exists "Users can read own terms deferrals" on public.terms_acceptance_deferrals;
create policy "Users can read own terms deferrals"
on public.terms_acceptance_deferrals for select
to authenticated
using (
  user_id = public.current_user_id()
  or public.is_admin()
);
