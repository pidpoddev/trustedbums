create table if not exists public.customer_payment_reports (
  id uuid primary key default gen_random_uuid(),
  opportunity_claim_id uuid not null references public.opportunity_claims(id) on delete cascade,
  opportunity_registration_id uuid not null references public.opportunity_registrations(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  reported_by text not null references public.profiles(id) on delete cascade,
  source text not null default 'CLIENT' check (source in ('CLIENT', 'ADMIN')),
  customer_name text not null,
  gross_amount numeric not null check (gross_amount >= 0),
  commissionable_amount numeric not null check (commissionable_amount >= 0),
  excluded_amount numeric not null default 0 check (excluded_amount >= 0),
  currency text not null default 'USD',
  customer_payment_received_at date not null,
  notes text,
  status text not null default 'REPORTED' check (status in ('REPORTED', 'INVOICE_GENERATED', 'DISPUTED', 'VOID')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_payment_reports_company_created_at_idx
  on public.customer_payment_reports (company_id, created_at desc);

create index if not exists customer_payment_reports_claim_created_at_idx
  on public.customer_payment_reports (opportunity_claim_id, created_at desc);

drop trigger if exists set_customer_payment_reports_updated_at on public.customer_payment_reports;
create trigger set_customer_payment_reports_updated_at
before update on public.customer_payment_reports
for each row execute function public.set_updated_at();

alter table public.customer_payment_reports enable row level security;

grant select, insert, update on public.customer_payment_reports to anon, authenticated;

drop policy if exists "Users can read relevant customer payment reports" on public.customer_payment_reports;
create policy "Users can read relevant customer payment reports"
on public.customer_payment_reports for select
to anon, authenticated
using (
  public.is_admin()
  or company_id = public.current_company_id()
  or exists (
    select 1
    from public.opportunity_claims claim
    where claim.id = customer_payment_reports.opportunity_claim_id
      and claim.bum_user_id = public.current_user_id()
  )
);

drop policy if exists "Clients and admins can create customer payment reports" on public.customer_payment_reports;
create policy "Clients and admins can create customer payment reports"
on public.customer_payment_reports for insert
to anon, authenticated
with check (
  public.is_admin()
  or (
    company_id = public.current_company_id()
    and exists (
      select 1
      from public.profiles profile
      where profile.id = public.current_user_id()
        and upper(coalesce(profile.role, '')) = 'CLIENT'
    )
  )
);

drop policy if exists "Clients and admins can update customer payment reports" on public.customer_payment_reports;
create policy "Clients and admins can update customer payment reports"
on public.customer_payment_reports for update
to anon, authenticated
using (public.is_admin() or company_id = public.current_company_id())
with check (public.is_admin() or company_id = public.current_company_id());

create table if not exists public.claim_invoices (
  id uuid primary key default gen_random_uuid(),
  customer_payment_report_id uuid not null references public.customer_payment_reports(id) on delete cascade,
  opportunity_claim_id uuid not null references public.opportunity_claims(id) on delete cascade,
  opportunity_registration_id uuid not null references public.opportunity_registrations(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  generated_by text not null references public.profiles(id) on delete cascade,
  invoice_number text not null unique,
  invoice_amount numeric not null check (invoice_amount >= 0),
  commission_rate numeric not null check (commission_rate >= 0),
  currency text not null default 'USD',
  status text not null default 'GENERATED' check (status in ('GENERATED', 'SENT', 'PAID', 'VOID')),
  generated_at timestamptz not null default now(),
  sent_at timestamptz,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists claim_invoices_company_created_at_idx
  on public.claim_invoices (company_id, created_at desc);

create index if not exists claim_invoices_claim_created_at_idx
  on public.claim_invoices (opportunity_claim_id, created_at desc);

drop trigger if exists set_claim_invoices_updated_at on public.claim_invoices;
create trigger set_claim_invoices_updated_at
before update on public.claim_invoices
for each row execute function public.set_updated_at();

alter table public.claim_invoices enable row level security;

grant select, insert, update on public.claim_invoices to anon, authenticated;

drop policy if exists "Users can read relevant claim invoices" on public.claim_invoices;
create policy "Users can read relevant claim invoices"
on public.claim_invoices for select
to anon, authenticated
using (
  public.is_admin()
  or company_id = public.current_company_id()
  or exists (
    select 1
    from public.opportunity_claims claim
    where claim.id = claim_invoices.opportunity_claim_id
      and claim.bum_user_id = public.current_user_id()
  )
);

drop policy if exists "Clients and admins can create claim invoices" on public.claim_invoices;
create policy "Clients and admins can create claim invoices"
on public.claim_invoices for insert
to anon, authenticated
with check (
  public.is_admin()
  or (
    company_id = public.current_company_id()
    and exists (
      select 1
      from public.profiles profile
      where profile.id = public.current_user_id()
        and upper(coalesce(profile.role, '')) = 'CLIENT'
    )
  )
);

drop policy if exists "Clients and admins can update claim invoices" on public.claim_invoices;
create policy "Clients and admins can update claim invoices"
on public.claim_invoices for update
to anon, authenticated
using (public.is_admin() or company_id = public.current_company_id())
with check (public.is_admin() or company_id = public.current_company_id());

create table if not exists public.bum_payouts (
  id uuid primary key default gen_random_uuid(),
  claim_invoice_id uuid not null references public.claim_invoices(id) on delete cascade,
  opportunity_claim_id uuid not null references public.opportunity_claims(id) on delete cascade,
  bum_user_id text not null references public.profiles(id) on delete cascade,
  payout_amount numeric not null default 0 check (payout_amount >= 0),
  currency text not null default 'USD',
  status text not null default 'PENDING_ALLOCATION' check (status in ('PENDING_ALLOCATION', 'APPROVED', 'PAID', 'VOID')),
  approved_by text references public.profiles(id) on delete set null,
  approved_at timestamptz,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists bum_payouts_invoice_claim_unique
  on public.bum_payouts (claim_invoice_id, opportunity_claim_id);

create index if not exists bum_payouts_bum_created_at_idx
  on public.bum_payouts (bum_user_id, created_at desc);

drop trigger if exists set_bum_payouts_updated_at on public.bum_payouts;
create trigger set_bum_payouts_updated_at
before update on public.bum_payouts
for each row execute function public.set_updated_at();

alter table public.bum_payouts enable row level security;

grant select, insert, update on public.bum_payouts to anon, authenticated;

drop policy if exists "Users can read relevant bum payouts" on public.bum_payouts;
create policy "Users can read relevant bum payouts"
on public.bum_payouts for select
to anon, authenticated
using (public.is_admin() or bum_user_id = public.current_user_id());

drop policy if exists "Admins can manage bum payouts" on public.bum_payouts;
create policy "Admins can manage bum payouts"
on public.bum_payouts for all
to anon, authenticated
using (public.is_admin())
with check (public.is_admin());
