alter table public.contact_submissions
  add column if not exists abuse_fingerprint text,
  add column if not exists turnstile_success boolean not null default false,
  add column if not exists turnstile_hostname text,
  add column if not exists turnstile_action text,
  add column if not exists turnstile_error_codes text[] not null default '{}'::text[],
  add column if not exists notification_sent_at timestamptz,
  add column if not exists notification_error text,
  add column if not exists admin_owner_id text references public.profiles(id) on delete set null,
  add column if not exists admin_next_action text,
  add column if not exists admin_priority text not null default 'NORMAL';

alter table public.customer_target_responses
  add column if not exists admin_owner_id text references public.profiles(id) on delete set null,
  add column if not exists admin_next_action text,
  add column if not exists admin_priority text not null default 'NORMAL';

alter table public.client_bum_intro_requests
  add column if not exists admin_owner_id text references public.profiles(id) on delete set null,
  add column if not exists admin_next_action text,
  add column if not exists admin_priority text not null default 'NORMAL';

do $$
begin
  alter table public.contact_submissions
    drop constraint if exists contact_submissions_admin_priority_check;
  alter table public.contact_submissions
    add constraint contact_submissions_admin_priority_check
    check (admin_priority in ('LOW', 'NORMAL', 'HIGH', 'URGENT'));

  alter table public.customer_target_responses
    drop constraint if exists customer_target_responses_admin_priority_check;
  alter table public.customer_target_responses
    add constraint customer_target_responses_admin_priority_check
    check (admin_priority in ('LOW', 'NORMAL', 'HIGH', 'URGENT'));

  alter table public.client_bum_intro_requests
    drop constraint if exists client_bum_intro_requests_admin_priority_check;
  alter table public.client_bum_intro_requests
    add constraint client_bum_intro_requests_admin_priority_check
    check (admin_priority in ('LOW', 'NORMAL', 'HIGH', 'URGENT'));
end
$$;

create index if not exists contact_submissions_abuse_fingerprint_created_idx
  on public.contact_submissions (abuse_fingerprint, created_at desc)
  where abuse_fingerprint is not null;

create index if not exists contact_submissions_email_created_idx
  on public.contact_submissions (lower(email), created_at desc);

create index if not exists contact_submissions_admin_owner_idx
  on public.contact_submissions (admin_owner_id, status, created_at desc);

create index if not exists customer_target_responses_admin_owner_idx
  on public.customer_target_responses (admin_owner_id, status, created_at desc);

create index if not exists client_bum_intro_requests_admin_owner_idx
  on public.client_bum_intro_requests (admin_owner_id, status, created_at desc);

drop policy if exists "Anyone can submit contact forms" on public.contact_submissions;
revoke insert on public.contact_submissions from anon, authenticated;
