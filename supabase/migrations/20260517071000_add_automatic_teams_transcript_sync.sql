alter table public.teams_meetings
  add column if not exists microsoft_online_meeting_id text,
  add column if not exists transcript_sync_status text not null default 'PENDING',
  add column if not exists transcript_sync_attempted_at timestamptz,
  add column if not exists transcript_sync_error text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'teams_meetings_transcript_sync_status_check'
      and conrelid = 'public.teams_meetings'::regclass
  ) then
    alter table public.teams_meetings
      add constraint teams_meetings_transcript_sync_status_check
        check (transcript_sync_status in ('PENDING', 'AVAILABLE', 'FAILED', 'SKIPPED'));
  end if;
end $$;

create index if not exists teams_meetings_transcript_sync_idx
  on public.teams_meetings (transcript_sync_status, end_time)
  where transcript_sync_status in ('PENDING', 'FAILED');

create index if not exists teams_meetings_microsoft_online_meeting_idx
  on public.teams_meetings (microsoft_online_meeting_id)
  where microsoft_online_meeting_id is not null;

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;
create extension if not exists supabase_vault with schema vault;

do $$
declare
  project_url_secret_id uuid;
  anon_key_secret_id uuid;
begin
  select id into project_url_secret_id
  from vault.decrypted_secrets
  where name = 'trusted_bums_project_url'
  limit 1;

  if project_url_secret_id is null then
    perform vault.create_secret(
      'https://vaoqvtxqvbptyxddpoju.supabase.co',
      'trusted_bums_project_url',
      'Trusted Bums Supabase project URL for scheduled Edge Function calls.'
    );
  else
    perform vault.update_secret(
      project_url_secret_id,
      'https://vaoqvtxqvbptyxddpoju.supabase.co',
      'trusted_bums_project_url',
      'Trusted Bums Supabase project URL for scheduled Edge Function calls.'
    );
  end if;

  select id into anon_key_secret_id
  from vault.decrypted_secrets
  where name = 'trusted_bums_anon_key'
  limit 1;

  if anon_key_secret_id is null then
    perform vault.create_secret(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb3F2dHhxdmJwdHl4ZGRwb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTg1OTAsImV4cCI6MjA5MzMzNDU5MH0.kfIlyJ_nDfSwzTjUZ7gL5GX1qCvvg1qwqz2cWBGaaQg',
      'trusted_bums_anon_key',
      'Trusted Bums legacy anon JWT used by Supabase Cron to invoke transcript sync.'
    );
  else
    perform vault.update_secret(
      anon_key_secret_id,
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb3F2dHhxdmJwdHl4ZGRwb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTg1OTAsImV4cCI6MjA5MzMzNDU5MH0.kfIlyJ_nDfSwzTjUZ7gL5GX1qCvvg1qwqz2cWBGaaQg',
      'trusted_bums_anon_key',
      'Trusted Bums legacy anon JWT used by Supabase Cron to invoke transcript sync.'
    );
  end if;
end $$;

select cron.unschedule('sync-teams-transcripts-every-15-minutes')
where exists (
  select 1
  from cron.job
  where jobname = 'sync-teams-transcripts-every-15-minutes'
);

select cron.schedule(
  'sync-teams-transcripts-every-15-minutes',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'trusted_bums_project_url') || '/functions/v1/sync-teams-transcripts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'trusted_bums_anon_key')
    ),
    body := jsonb_build_object('source', 'pg_cron', 'scheduled_at', now())
  ) as request_id;
  $$
);
