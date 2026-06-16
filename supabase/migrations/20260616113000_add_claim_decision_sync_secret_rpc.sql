create or replace function public.claim_decision_sync_secret()
returns text
language sql
security definer
set search_path = vault, public
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = 'trusted_bums_claim_decision_sync_secret'
  limit 1
$$;

revoke execute on function public.claim_decision_sync_secret() from public;
revoke execute on function public.claim_decision_sync_secret() from anon;
revoke execute on function public.claim_decision_sync_secret() from authenticated;
grant execute on function public.claim_decision_sync_secret() to service_role;
