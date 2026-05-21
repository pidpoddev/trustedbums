drop policy if exists "Bums can create customer target responses" on public.customer_target_responses;
create policy "Bums can create customer target responses"
on public.customer_target_responses for insert
to anon, authenticated
with check (
  bum_user_id = public.current_user_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'BUM'
  )
);

drop policy if exists "Users can read relevant customer target responses" on public.customer_target_responses;
create policy "Users can read relevant customer target responses"
on public.customer_target_responses for select
to anon, authenticated
using (
  public.is_admin()
  or bum_user_id = public.current_user_id()
  or client_company_id = public.current_company_id()
);
