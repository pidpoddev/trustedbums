create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;
create extension if not exists supabase_vault with schema vault;

select cron.unschedule('sync-teams-attendees-every-10-minutes')
where exists (
  select 1
  from cron.job
  where jobname = 'sync-teams-attendees-every-10-minutes'
);

select cron.schedule(
  'sync-teams-attendees-every-10-minutes',
  '*/10 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'trusted_bums_project_url') || '/functions/v1/sync-teams-attendees',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'trusted_bums_anon_key')
    ),
    body := jsonb_build_object('source', 'pg_cron', 'scheduled_at', now(), 'batchSize', 50)
  ) as request_id;
  $$
);
