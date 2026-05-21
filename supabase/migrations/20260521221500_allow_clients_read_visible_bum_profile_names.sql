create schema if not exists private;

create or replace function private.is_visible_bum_profile(profile_id_input text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.bum_profiles bum
    where bum.user_id = profile_id_input
      and bum.is_visible_to_clients = true
  )
$$;

grant usage on schema private to anon, authenticated;
grant execute on function private.is_visible_bum_profile(text) to anon, authenticated;

drop policy if exists "Clients can read visible Bum directory profile identities" on public.profiles;
create policy "Clients can read visible Bum directory profile identities"
on public.profiles for select
to anon, authenticated
using (
  public.current_company_id() is not null
  and private.is_visible_bum_profile(id)
);

drop function if exists public.is_visible_bum_profile(text);
