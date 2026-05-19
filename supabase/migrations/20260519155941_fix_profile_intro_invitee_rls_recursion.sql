create or replace function public.is_bum()
returns boolean
language sql
security definer
set search_path = public
stable
as $function$
  select exists (
    select 1
    from public.profiles
    where id = public.current_user_id()
      and upper(coalesce(role, $empty$$empty$)) = $role$BUM$role$
  )
$function$;

create or replace function public.company_has_customer_targets(company_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $function$
  select exists (
    select 1
    from public.customer_targets target
    where target.client_company_id = company_id
  )
$function$;

drop policy if exists "Bums can read client introduction invitees" on public.profiles;
create policy "Bums can read client introduction invitees"
on public.profiles for select
to anon, authenticated
using (
  upper(coalesce(role, $empty$$empty$)) = $role$CLIENT$role$
  and invited_to_customer_introductions = true
  and company_id is not null
  and public.is_bum()
  and public.company_has_customer_targets(company_id)
);
