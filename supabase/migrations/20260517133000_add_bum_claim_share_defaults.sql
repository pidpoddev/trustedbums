alter table public.opportunity_claims
  add column if not exists bum_share_percent numeric not null default 50
    check (bum_share_percent >= 0 and bum_share_percent <= 100),
  add column if not exists share_manually_set boolean not null default false;

alter table public.bum_payouts
  add column if not exists share_percent numeric not null default 50
    check (share_percent >= 0 and share_percent <= 100);

update public.opportunity_claims
set
  bum_share_percent = coalesce(bum_share_percent, 50),
  share_manually_set = coalesce(share_manually_set, false);

update public.bum_payouts
set share_percent = coalesce(share_percent, 50);
