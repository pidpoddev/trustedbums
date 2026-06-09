alter table public.opportunity_claims
  drop constraint if exists opportunity_claims_status_check;

alter table public.opportunity_claims
  add constraint opportunity_claims_status_check
  check (status in ('PROPOSED', 'APPROVED', 'DECLINED', 'SCHEDULED', 'MEETING_HELD', 'EXPIRED', 'DISPUTED', 'CLOSED'));

alter table public.opportunity_claims
  add column if not exists decline_reason_code text,
  add column if not exists decline_reason_note text,
  add column if not exists client_decision_token text,
  add column if not exists client_decision_source text,
  add column if not exists client_decision_received_at timestamptz,
  add column if not exists client_decision_email_message_id text,
  add column if not exists client_decision_email_from text;

update public.opportunity_claims
set client_decision_token = encode(gen_random_bytes(16), 'hex')
where client_decision_token is null;

alter table public.opportunity_claims
  alter column client_decision_token set default encode(gen_random_bytes(16), 'hex');

alter table public.opportunity_claims
  drop constraint if exists opportunity_claims_decline_reason_code_check;

alter table public.opportunity_claims
  add constraint opportunity_claims_decline_reason_code_check
  check (
    decline_reason_code is null
    or decline_reason_code in (
      'ALREADY_CONNECTED',
      'NO_LONGER_OPPORTUNITY',
      'WRONG_CONTACT_LEVEL',
      'NOT_RELEVANT',
      'DUPLICATE',
      'OTHER'
    )
  );

create unique index if not exists opportunity_claims_client_decision_token_idx
  on public.opportunity_claims (client_decision_token)
  where client_decision_token is not null;

create index if not exists opportunity_claims_status_decision_idx
  on public.opportunity_claims (status, client_decision_received_at desc);

alter table public.opportunity_claim_public_summaries
  drop constraint if exists opportunity_claim_public_summaries_status_check;

alter table public.opportunity_claim_public_summaries
  add constraint opportunity_claim_public_summaries_status_check
  check (status in ('PROPOSED', 'APPROVED', 'DECLINED', 'SCHEDULED', 'MEETING_HELD', 'EXPIRED', 'DISPUTED', 'CLOSED'));

create table if not exists public.claim_decision_email_events (
  id uuid primary key default gen_random_uuid(),
  graph_message_id text not null unique,
  internet_message_id text,
  opportunity_claim_id uuid references public.opportunity_claims(id) on delete set null,
  decision text check (decision in ('APPROVED', 'DECLINED', 'IGNORED')),
  decline_reason_code text,
  decline_reason_note text,
  sender_email text,
  subject text,
  received_at timestamptz,
  processed_at timestamptz not null default now(),
  processing_status text not null default 'PROCESSED' check (processing_status in ('PROCESSED', 'SKIPPED', 'FAILED')),
  processing_note text
);

create index if not exists claim_decision_email_events_claim_idx
  on public.claim_decision_email_events (opportunity_claim_id, processed_at desc);

alter table public.claim_decision_email_events enable row level security;

drop policy if exists "Admins can read claim decision email events" on public.claim_decision_email_events;
create policy "Admins can read claim decision email events"
on public.claim_decision_email_events for select
to authenticated
using (private.is_admin());

grant select on public.claim_decision_email_events to authenticated;

insert into public.admin_email_templates
  (slug, name, description, recipient_group, trigger_event, subject, body, metadata_fields, category, reply_to, rate_limit_per_hour, is_active)
values
  (
    'opportunity_claim_created_client',
    'Client notice: Bum requested a claim',
    'Sent to client company users when a Bum requests credit for a relationship against an opportunity. Clients can reply with Approved or Declined plus a reason.',
    'CLIENT_COMPANY',
    'OPPORTUNITY_CLAIM_CREATED',
    'Claim review needed: {{target_account_name}}',
    E'Hi {{client_name}},\n\nA Trusted Bum requested a claim for {{target_account_name}}.\n\nContact: {{contact_name}} at {{contact_company}}\nRelationship strength: {{relationship_strength}}\nSubmitted by: {{bum_name}}\n\nContext from the Bum:\n{{admin_note}}\n\nReply to this email with:\nApproved\n\nor:\nDeclined\nWhy: Already Connected, No longer an Opportunity, Not the right level of contact, Not relevant, Duplicate, or Other.\n\nClaim decision token: {{claim_decision_token}}\nClaim ID: {{claim_id}}\n\nYou can also review the claim in the Trusted Bums portal.\n\nTrusted Bums',
    array['client_name', 'target_account_name', 'contact_name', 'contact_company', 'relationship_strength', 'bum_name', 'admin_note', 'claim_decision_token', 'claim_id'],
    'client_alerts',
    'bums@trustedbums.com',
    120,
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  recipient_group = excluded.recipient_group,
  trigger_event = excluded.trigger_event,
  subject = excluded.subject,
  body = excluded.body,
  metadata_fields = excluded.metadata_fields,
  category = excluded.category,
  reply_to = excluded.reply_to,
  rate_limit_per_hour = excluded.rate_limit_per_hour,
  is_active = excluded.is_active;

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;
create extension if not exists supabase_vault with schema vault;

select cron.unschedule('sync-claim-decision-replies-every-5-minutes')
where exists (
  select 1
  from cron.job
  where jobname = 'sync-claim-decision-replies-every-5-minutes'
);

select cron.schedule(
  'sync-claim-decision-replies-every-5-minutes',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'trusted_bums_project_url') || '/functions/v1/sync-claim-decision-replies',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'trusted_bums_anon_key'),
      'x-sync-secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'trusted_bums_claim_decision_sync_secret'), '')
    ),
    body := jsonb_build_object('source', 'pg_cron', 'scheduled_at', now(), 'top', 25)
  ) as request_id;
  $$
);
