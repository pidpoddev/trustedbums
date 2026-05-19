alter table public.profiles
  add column if not exists invited_to_customer_introductions boolean not null default true;

drop policy if exists "Bums can read client introduction invitees" on public.profiles;
create policy "Bums can read client introduction invitees"
on public.profiles for select
to anon, authenticated
using (
  upper(coalesce(role, '')) = 'CLIENT'
  and invited_to_customer_introductions = true
  and company_id is not null
  and exists (
    select 1
    from public.profiles requester
    where requester.id = public.current_user_id()
      and upper(coalesce(requester.role, '')) = 'BUM'
  )
  and exists (
    select 1
    from public.customer_targets target
    where target.client_company_id = public.profiles.company_id
  )
);
