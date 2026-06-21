create table if not exists public.legal_agreement_reviews (
  id uuid primary key default gen_random_uuid(),
  scrum_item_id uuid not null references public.admin_scrum_items(id) on delete cascade,
  mailbox_message_id uuid references public.admin_shared_mailbox_messages(id) on delete set null,
  counterparty text not null default 'Unknown counterparty',
  agreement_subject text not null default 'Untitled agreement',
  review_status text not null default 'NEEDS_REVIEW',
  risk_posture text not null default 'SPEED_TO_MARKET',
  must_have_terms text[] not null default array[
    'Correct parties, authority, and signature block match who is actually committing Trusted Bums.',
    'Commission economics, revenue definition, payment timing, reporting access, exclusions, and survival/tail are clear enough to collect money.',
    'Confidentiality, data handling, and customer information obligations are reasonable for the actual relationship.',
    'Trusted Bums is not accepting broad delivery, product, employment, broker-dealer, or customer-performance obligations it does not control.',
    'Indemnity, liability, termination, and dispute terms do not create uncapped or one-way risk that is disproportionate to the deal.'
  ],
  recommended_changes text[] not null default '{}',
  acceptable_tradeoffs text[] not null default array[
    'Vendor template formatting, notice mechanics, governing-law preference, and minor boilerplate should not block signature by themselves.',
    'Use a short side letter, addendum, email confirmation, or opportunity-specific rider when that is faster than full paper redlines.',
    'Prefer concise redlines for must-have business terms over broad perfection passes.'
  ],
  owner_emails text[] not null default array[
    'ryanmp29@gmail.com',
    'bscott@ourcassell.com',
    'tomwatsonuscga@gmail.com',
    'cpetersonluv@gmail.com',
    'bums@trustedbums.com'
  ],
  owner_question text,
  next_owner_prompt_at timestamptz not null default now(),
  last_owner_ping_at timestamptz,
  reminder_count integer not null default 0,
  created_by text references public.profiles(id) on delete set null,
  updated_by text references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint legal_agreement_reviews_scrum_item_unique unique (scrum_item_id),
  constraint legal_agreement_reviews_review_status_check check (
    review_status in ('NEEDS_REVIEW', 'AWAITING_OWNER', 'REDLINES_REQUESTED', 'SIGNABLE_WITH_APPROVAL', 'SIGNED', 'DECLINED', 'SUPERSEDED')
  ),
  constraint legal_agreement_reviews_risk_posture_check check (
    risk_posture in ('SPEED_TO_MARKET', 'BALANCED', 'STRICT')
  ),
  constraint legal_agreement_reviews_owner_emails_check check (cardinality(owner_emails) > 0),
  constraint legal_agreement_reviews_must_have_terms_check check (cardinality(must_have_terms) > 0)
);

create table if not exists public.legal_agreement_review_events (
  id uuid primary key default gen_random_uuid(),
  legal_agreement_review_id uuid not null references public.legal_agreement_reviews(id) on delete cascade,
  event_type text not null,
  event_note text not null default '',
  recipient_emails text[] not null default '{}',
  created_by text references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint legal_agreement_review_events_event_type_check check (
    event_type in ('OWNER_REMINDER_SENT', 'OWNER_REMINDER_FAILED', 'STATUS_UPDATED', 'REVIEW_NOTE_ADDED')
  )
);

drop trigger if exists set_legal_agreement_reviews_updated_at on public.legal_agreement_reviews;
create trigger set_legal_agreement_reviews_updated_at
before update on public.legal_agreement_reviews
for each row execute function public.set_updated_at();

alter table public.legal_agreement_reviews enable row level security;
alter table public.legal_agreement_review_events enable row level security;

drop policy if exists "Admins can manage legal agreement reviews" on public.legal_agreement_reviews;
create policy "Admins can manage legal agreement reviews"
on public.legal_agreement_reviews for all to authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "Admins can read legal agreement review events" on public.legal_agreement_review_events;
create policy "Admins can read legal agreement review events"
on public.legal_agreement_review_events for select to authenticated
using (private.is_admin());

drop policy if exists "Admins can create legal agreement review events" on public.legal_agreement_review_events;
create policy "Admins can create legal agreement review events"
on public.legal_agreement_review_events for insert to authenticated
with check (private.is_admin());

grant select, insert, update, delete on public.legal_agreement_reviews to authenticated;
grant select, insert on public.legal_agreement_review_events to authenticated;

create index if not exists legal_agreement_reviews_status_next_prompt_idx
  on public.legal_agreement_reviews (review_status, next_owner_prompt_at)
  where review_status not in ('SIGNED', 'DECLINED', 'SUPERSEDED');

create index if not exists legal_agreement_reviews_mailbox_message_idx
  on public.legal_agreement_reviews (mailbox_message_id)
  where mailbox_message_id is not null;

create index if not exists legal_agreement_reviews_created_by_idx
  on public.legal_agreement_reviews (created_by)
  where created_by is not null;

create index if not exists legal_agreement_reviews_updated_by_idx
  on public.legal_agreement_reviews (updated_by)
  where updated_by is not null;

create index if not exists legal_agreement_review_events_review_created_idx
  on public.legal_agreement_review_events (legal_agreement_review_id, created_at desc);

create index if not exists legal_agreement_review_events_created_by_idx
  on public.legal_agreement_review_events (created_by)
  where created_by is not null;

insert into public.legal_agreement_reviews (
  scrum_item_id,
  mailbox_message_id,
  counterparty,
  agreement_subject,
  review_status,
  risk_posture,
  recommended_changes,
  owner_question,
  next_owner_prompt_at
)
select
  scrum.id,
  mailbox.id,
  'K2View / Concentrix',
  'Concentrix Agreement & Referral Agreement',
  'NEEDS_REVIEW',
  'SPEED_TO_MARKET',
  array[
    'Clean up entity and pronoun references so the signer and obligated Trusted Bums party are unambiguous.',
    'Confirm the Concentrix-specific agreement controls over any broader K2View partner template for that account.',
    'Tighten the commissionable revenue definition, reporting access, payment timing, execution window, and tail survival enough to collect without a later dispute.',
    'Narrow any one-way indemnity, uncapped liability, or obligations tied to K2View delivery or customer performance.',
    'Use a short redline or side letter instead of a full rewrite if K2View will accept the must-have business fixes quickly.'
  ],
  'Can an owner confirm whether this K2View / Concentrix paper should be redlined, signed with the must-have fixes, marked superseded, or declined?',
  now()
from public.admin_scrum_items scrum
left join public.admin_shared_mailbox_messages mailbox
  on mailbox.id = '1bf7bc39-f349-4a23-a7c9-d095ff79095a'
where scrum.source_key = 'shared-mailbox:k2view-concentrix-agreement-2026-06-17'
on conflict (scrum_item_id) do update
set
  mailbox_message_id = excluded.mailbox_message_id,
  counterparty = excluded.counterparty,
  agreement_subject = excluded.agreement_subject,
  risk_posture = excluded.risk_posture,
  recommended_changes = excluded.recommended_changes,
  owner_question = excluded.owner_question,
  updated_at = now();

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;
create extension if not exists supabase_vault with schema vault;

select cron.unschedule('legal-agreement-owner-reminders-daily')
where exists (
  select 1
  from cron.job
  where jobname = 'legal-agreement-owner-reminders-daily'
);

select cron.schedule(
  'legal-agreement-owner-reminders-daily',
  '0 13 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'trusted_bums_project_url') || '/functions/v1/legal-agreement-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'trusted_bums_anon_key'),
      'x-legal-queue-secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'trusted_bums_legal_queue_reminder_secret'), '')
    ),
    body := jsonb_build_object('source', 'pg_cron', 'scheduled_at', now())
  ) as request_id;
  $$
);
