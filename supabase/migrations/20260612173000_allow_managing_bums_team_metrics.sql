drop policy if exists "Managing bums can read team opportunity claims" on public.opportunity_claims;
create policy "Managing bums can read team opportunity claims"
on public.opportunity_claims for select
to anon, authenticated
using (
  exists (
    select 1
    from public.bum_team_memberships membership
    join public.bum_profiles manager_profile
      on manager_profile.user_id = membership.managing_bum_user_id
    where membership.managing_bum_user_id = public.current_user_id()
      and membership.member_bum_user_id = opportunity_claims.bum_user_id
      and membership.status = 'ACTIVE'
      and manager_profile.is_managing_bum = true
  )
);

drop policy if exists "Managing bums can read team payouts" on public.bum_payouts;
create policy "Managing bums can read team payouts"
on public.bum_payouts for select
to anon, authenticated
using (
  exists (
    select 1
    from public.bum_team_memberships membership
    join public.bum_profiles manager_profile
      on manager_profile.user_id = membership.managing_bum_user_id
    where membership.managing_bum_user_id = public.current_user_id()
      and membership.member_bum_user_id = bum_payouts.bum_user_id
      and membership.status = 'ACTIVE'
      and manager_profile.is_managing_bum = true
  )
);
