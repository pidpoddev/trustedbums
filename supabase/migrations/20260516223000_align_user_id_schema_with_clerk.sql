begin;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can create own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can read company acceptances" on public.terms_acceptances;
drop policy if exists "Users can accept terms for own company" on public.terms_acceptances;
drop policy if exists "Users can read own opportunity registrations" on public.opportunity_registrations;
drop policy if exists "Users can create own opportunity registrations" on public.opportunity_registrations;
drop policy if exists "Users can read visible status history" on public.opportunity_status_history;
drop policy if exists "Users can create status history" on public.opportunity_status_history;
drop policy if exists "Users can read own audit events" on public.audit_events;
drop policy if exists "Users can create audit events" on public.audit_events;

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.terms_acceptances
  drop constraint if exists terms_acceptances_user_id_fkey;

alter table public.audit_events
  drop constraint if exists audit_events_user_id_fkey;

alter table public.opportunity_registrations
  drop constraint if exists opportunity_registrations_created_by_fkey;

alter table public.opportunity_status_history
  drop constraint if exists opportunity_status_history_changed_by_fkey;

alter table public.profiles
  alter column id type text using id::text;

alter table public.terms_acceptances
  alter column user_id type text using user_id::text;

alter table public.audit_events
  alter column user_id type text using user_id::text;

alter table public.opportunity_registrations
  alter column created_by type text using created_by::text;

alter table public.opportunity_status_history
  alter column changed_by type text using changed_by::text;

create or replace function public.current_user_id()
returns text
language sql
stable
as $$
  select nullif(auth.jwt()->>'sub', '')
$$;

create or replace function public.current_company_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select company_id from public.profiles where id = public.current_user_id()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = public.current_user_id()
      and (is_admin = true or upper(coalesce(role, '')) = 'ADMIN')
  )
$$;

create policy "Users can read own profile"
on public.profiles for select
to anon, authenticated
using (id = public.current_user_id() or public.is_admin());

create policy "Users can create own profile"
on public.profiles for insert
to anon, authenticated
with check (id = public.current_user_id());

create policy "Users can update own profile"
on public.profiles for update
to anon, authenticated
using (id = public.current_user_id() or public.is_admin())
with check (id = public.current_user_id() or public.is_admin());

create policy "Users can read company acceptances"
on public.terms_acceptances for select
to anon, authenticated
using (user_id = public.current_user_id() or company_id = public.current_company_id() or public.is_admin());

create policy "Users can accept terms for own company"
on public.terms_acceptances for insert
to anon, authenticated
with check (
  user_id = public.current_user_id()
  and (company_id = public.current_company_id() or company_id is null)
);

create policy "Users can read own opportunity registrations"
on public.opportunity_registrations for select
to anon, authenticated
using (created_by = public.current_user_id() or public.is_admin());

create policy "Users can create own opportunity registrations"
on public.opportunity_registrations for insert
to anon, authenticated
with check (
  created_by = public.current_user_id()
  and (company_id = public.current_company_id() or company_id is null)
);

create policy "Users can read visible status history"
on public.opportunity_status_history for select
to anon, authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.opportunity_registrations opportunity
    where opportunity.id = public.opportunity_status_history.opportunity_id
      and opportunity.created_by = public.current_user_id()
  )
);

create policy "Users can create status history"
on public.opportunity_status_history for insert
to anon, authenticated
with check (changed_by = public.current_user_id() or public.is_admin());

create policy "Users can read own audit events"
on public.audit_events for select
to anon, authenticated
using (user_id = public.current_user_id() or company_id = public.current_company_id() or public.is_admin());

create policy "Users can create audit events"
on public.audit_events for insert
to anon, authenticated
with check (
  user_id = public.current_user_id()
  and (company_id = public.current_company_id() or company_id is null or public.is_admin())
);

commit;
