drop policy if exists "Users can create own opportunity registrations" on public.opportunity_registrations;
create policy "Users can create own opportunity registrations"
on public.opportunity_registrations for insert
to anon, authenticated
with check (
  (
    created_by = public.current_user_id()
    and (company_id = public.current_company_id() or company_id is null)
  )
  or public.is_admin()
);

drop policy if exists "Client users can request own company pay programs" on public.client_pay_programs;
create policy "Client users can request own company pay programs"
on public.client_pay_programs for insert
to anon, authenticated
with check (
  public.is_admin()
  or (
    company_id = public.current_company_id()
    and exists (
      select 1
      from public.profiles profile
      where profile.id = public.current_user_id()
        and upper(coalesce(profile.role, '')) = 'CLIENT'
    )
  )
);
