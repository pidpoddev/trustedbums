create or replace function private.can_manage_customer_targets()
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and profile.access_status = 'APPROVED'
      and profile.disabled_at is null
      and (
        profile.is_admin = true
        or upper(coalesce(profile.role, '')) = 'ADMIN'
        or (
          upper(coalesce(profile.role, '')) = 'CLIENT'
          and profile.client_access_role in ('CLIENT_ADMIN', 'CLIENT_MEMBER')
        )
      )
  )
$function$;

drop policy if exists "Clients can read own customer targets" on public.customer_targets;
create policy "Clients can read own customer targets"
on public.customer_targets for select
to anon, authenticated
using (
  private.is_admin()
  or (
    client_company_id = private.current_company_id()
    and private.can_manage_customer_targets()
  )
);

drop policy if exists "Clients can create own customer targets" on public.customer_targets;
create policy "Clients can create own customer targets"
on public.customer_targets for insert
to anon, authenticated
with check (
  private.is_admin()
  or (
    created_by = public.current_user_id()
    and client_company_id = private.current_company_id()
    and private.can_manage_customer_targets()
  )
);

drop policy if exists "Clients can update own customer targets" on public.customer_targets;
create policy "Clients can update own customer targets"
on public.customer_targets for update
to authenticated
using (
  private.is_admin()
  or (
    client_company_id = private.current_company_id()
    and private.can_manage_customer_targets()
  )
)
with check (
  private.is_admin()
  or (
    client_company_id = private.current_company_id()
    and private.can_manage_customer_targets()
  )
);
