alter table public.contact_submissions
  add column if not exists buyer_role text,
  add column if not exists target_account_count text,
  add column if not exists current_blocker text,
  add column if not exists urgency text,
  add column if not exists referral_source text,
  add column if not exists qualification_status text not null default 'NEEDS_REVIEW',
  add column if not exists follow_up_deadline timestamptz,
  add column if not exists disqualification_reason text;

do $$
begin
  alter table public.contact_submissions
    drop constraint if exists contact_submissions_target_account_count_check;
  alter table public.contact_submissions
    add constraint contact_submissions_target_account_count_check
    check (target_account_count is null or target_account_count in ('ONE', 'TWO_TO_FIVE', 'SIX_TO_TEN', 'MORE_THAN_TEN'));

  alter table public.contact_submissions
    drop constraint if exists contact_submissions_urgency_check;
  alter table public.contact_submissions
    add constraint contact_submissions_urgency_check
    check (urgency is null or urgency in ('THIS_MONTH', 'THIS_QUARTER', 'EXPLORING'));

  alter table public.contact_submissions
    drop constraint if exists contact_submissions_qualification_status_check;
  alter table public.contact_submissions
    add constraint contact_submissions_qualification_status_check
    check (qualification_status in ('QUALIFIED', 'NEEDS_REVIEW', 'LOW_FIT', 'WRONG_PATH'));
end $$;

create index if not exists contact_submissions_qualification_idx
  on public.contact_submissions (qualification_status, urgency, created_at desc);
