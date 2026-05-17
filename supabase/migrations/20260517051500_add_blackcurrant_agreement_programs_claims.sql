create table if not exists public.company_agreements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  agreement_type text not null check (agreement_type in ('MASTER_SERVICES_AGREEMENT', 'SERVICE_ADDENDUM', 'OTHER')),
  status text not null default 'ACTIVE' check (status in ('DRAFT', 'ACTIVE', 'SUPERSEDED', 'TERMINATED')),
  effective_date date,
  document_url text,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists company_agreements_company_title_idx
  on public.company_agreements (company_id, title);

drop trigger if exists set_company_agreements_updated_at on public.company_agreements;
create trigger set_company_agreements_updated_at
before update on public.company_agreements
for each row execute function public.set_updated_at();

alter table public.company_agreements enable row level security;

grant select, insert, update on public.company_agreements to anon, authenticated;

drop policy if exists "Users can read relevant company agreements" on public.company_agreements;
create policy "Users can read relevant company agreements"
on public.company_agreements for select
to anon, authenticated
using (company_id = public.current_company_id() or public.is_admin());

drop policy if exists "Admins can manage company agreements" on public.company_agreements;
create policy "Admins can manage company agreements"
on public.company_agreements for all
to anon, authenticated
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.client_pay_programs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  agreement_id uuid references public.company_agreements(id) on delete set null,
  name text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'PAUSED', 'SUPERSEDED')),
  commission_rate numeric not null,
  commission_period_months integer,
  payment_terms text,
  commission_basis text,
  exclusions text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists client_pay_programs_company_name_idx
  on public.client_pay_programs (company_id, name);

drop trigger if exists set_client_pay_programs_updated_at on public.client_pay_programs;
create trigger set_client_pay_programs_updated_at
before update on public.client_pay_programs
for each row execute function public.set_updated_at();

alter table public.client_pay_programs enable row level security;

grant select, insert, update on public.client_pay_programs to anon, authenticated;

drop policy if exists "Users can read relevant client pay programs" on public.client_pay_programs;
create policy "Users can read relevant client pay programs"
on public.client_pay_programs for select
to anon, authenticated
using (
  public.is_admin()
  or company_id = public.current_company_id()
  or exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'BUM'
  )
);

drop policy if exists "Admins can manage client pay programs" on public.client_pay_programs;
create policy "Admins can manage client pay programs"
on public.client_pay_programs for all
to anon, authenticated
using (public.is_admin())
with check (public.is_admin());

alter table public.customer_targets
  add column if not exists pay_program_id uuid references public.client_pay_programs(id) on delete set null;

alter table public.opportunity_registrations
  add column if not exists pay_program_id uuid references public.client_pay_programs(id) on delete set null;

create table if not exists public.opportunity_claims (
  id uuid primary key default gen_random_uuid(),
  opportunity_registration_id uuid not null references public.opportunity_registrations(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  bum_user_id text not null references public.profiles(id) on delete cascade,
  contact_name text not null,
  contact_company text not null,
  contact_email text,
  relationship_strength text not null default 'MODERATE' check (relationship_strength in ('STRONG', 'MODERATE', 'WEAK')),
  note text,
  status text not null default 'PROPOSED' check (status in ('PROPOSED', 'APPROVED', 'SCHEDULED', 'MEETING_HELD', 'EXPIRED', 'DISPUTED', 'CLOSED')),
  expires_at date not null default ((now() + interval '45 days')::date),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunity_claims_opportunity_created_at_idx
  on public.opportunity_claims (opportunity_registration_id, created_at desc);

create index if not exists opportunity_claims_bum_created_at_idx
  on public.opportunity_claims (bum_user_id, created_at desc);

create unique index if not exists opportunity_claims_opportunity_bum_contact_idx
  on public.opportunity_claims (opportunity_registration_id, bum_user_id, lower(contact_name), lower(contact_company));

drop trigger if exists set_opportunity_claims_updated_at on public.opportunity_claims;
create trigger set_opportunity_claims_updated_at
before update on public.opportunity_claims
for each row execute function public.set_updated_at();

alter table public.opportunity_claims enable row level security;

grant select, insert, update on public.opportunity_claims to anon, authenticated;

drop policy if exists "Users can read relevant opportunity claims" on public.opportunity_claims;
create policy "Users can read relevant opportunity claims"
on public.opportunity_claims for select
to anon, authenticated
using (
  public.is_admin()
  or bum_user_id = public.current_user_id()
  or company_id = public.current_company_id()
);

drop policy if exists "Bums can create own opportunity claims" on public.opportunity_claims;
create policy "Bums can create own opportunity claims"
on public.opportunity_claims for insert
to anon, authenticated
with check (
  bum_user_id = public.current_user_id()
  and exists (
    select 1
    from public.profiles profile
    where profile.id = public.current_user_id()
      and upper(coalesce(profile.role, '')) = 'BUM'
  )
);

drop policy if exists "Bums and admins can update opportunity claims" on public.opportunity_claims;
create policy "Bums and admins can update opportunity claims"
on public.opportunity_claims for update
to anon, authenticated
using (bum_user_id = public.current_user_id() or public.is_admin())
with check (bum_user_id = public.current_user_id() or public.is_admin());

with blackcurrant as (
  select id from public.companies where lower(name) = 'blackcurrant' limit 1
),
admin_user as (
  select id from public.profiles where is_admin = true order by created_at limit 1
),
master_agreement as (
  insert into public.company_agreements (
    company_id,
    title,
    agreement_type,
    status,
    effective_date,
    document_url,
    summary,
    metadata
  )
  select
    blackcurrant.id,
    'BlackCurrant Master Services Agreement',
    'MASTER_SERVICES_AGREEMENT',
    'ACTIVE',
    '2026-03-31'::date,
    '/agreements/trusted_bums_blackcurrant_master_agreement_20260331_FINAL.docx',
    'Accepted clean copy of the Trusted Bums / BlackCurrant master services agreement.',
    jsonb_build_object('source', 'trusted_bums_blackcurrant_master_agreement_20260331_REDLINED.docx', 'redlines_accepted', true)
  from blackcurrant
  on conflict (company_id, title) do update
    set status = excluded.status,
        effective_date = excluded.effective_date,
        document_url = excluded.document_url,
        summary = excluded.summary,
        metadata = excluded.metadata,
        updated_at = now()
  returning id, company_id
),
service_addendum as (
  insert into public.company_agreements (
    company_id,
    title,
    agreement_type,
    status,
    effective_date,
    document_url,
    summary,
    metadata
  )
  select
    blackcurrant.id,
    'BlackCurrant Exhibit A - Crusoe Service Addendum',
    'SERVICE_ADDENDUM',
    'ACTIVE',
    '2026-03-31'::date,
    '/agreements/trusted_bums_blackcurrant_master_agreement_Exhibit-A_crusoe_service_addendum-20260331_FINAL.docx',
    'Accepted clean copy of Exhibit A. Pay program: 10% of Commissionable Receipts during the 36-month Commission Period, payable within 14 days after actual collection, subject to the stated exclusions.',
    jsonb_build_object(
      'source', 'trusted_bums_blackcurrant_master_agreement_Exhibit-A_crusoe_service_addendum-20260331_REDLINED.docx',
      'redlines_accepted', true,
      'introduced_account', 'Crusoe',
      'commission_rate', 10,
      'commission_period_months', 36
    )
  from blackcurrant
  on conflict (company_id, title) do update
    set status = excluded.status,
        effective_date = excluded.effective_date,
        document_url = excluded.document_url,
        summary = excluded.summary,
        metadata = excluded.metadata,
        updated_at = now()
  returning id, company_id
),
pay_program as (
  insert into public.client_pay_programs (
    company_id,
    agreement_id,
    name,
    status,
    commission_rate,
    commission_period_months,
    payment_terms,
    commission_basis,
    exclusions,
    notes
  )
  select
    service_addendum.company_id,
    service_addendum.id,
    'BlackCurrant Introduced Account Program - 10% / 36 months',
    'ACTIVE',
    10,
    36,
    'Payable within fourteen (14) days after BlackCurrant actually receives applicable Commissionable Receipts.',
    'Ten percent (10%) of gross cash amounts actually received from the introduced account under the account agreement during the 36-month Commission Period.',
    'Excludes taxes, VAT, duties, credits, refunds, rebates, chargebacks, bad-debt write-offs, uncollected amounts, pass-through AI infrastructure/cloud/compute/GPU/hardware/storage/network/bandwidth/compliance costs, and professional services unless separately agreed.',
    'Loaded from accepted BlackCurrant Exhibit A. Applied to the imported BlackCurrant target-account list so Bums can request claims against marketplace opportunities.'
  from service_addendum
  on conflict (company_id, name) do update
    set agreement_id = excluded.agreement_id,
        status = excluded.status,
        commission_rate = excluded.commission_rate,
        commission_period_months = excluded.commission_period_months,
        payment_terms = excluded.payment_terms,
        commission_basis = excluded.commission_basis,
        exclusions = excluded.exclusions,
        notes = excluded.notes,
        updated_at = now()
  returning id, company_id, commission_rate, payment_terms, commission_basis, exclusions
),
updated_targets as (
  update public.customer_targets target
  set pay_program_id = pay_program.id,
      expected_product_service = coalesce(target.expected_product_service, 'BlackCurrant introduced account program'),
      updated_at = now()
  from pay_program
  where target.client_company_id = pay_program.company_id
  returning target.*
)
insert into public.opportunity_registrations (
  company_id,
  created_by,
  target_account_name,
  business_unit,
  opportunity_description,
  client_contact,
  trusted_bums_contact,
  expected_product_service,
  estimated_deal_value,
  expected_timeline,
  commission_rate,
  commission_duration,
  notes,
  status,
  pay_program_id
)
select
  target.client_company_id,
  coalesce((select id from admin_user), target.created_by),
  target.target_account_name,
  target.business_unit,
  'BlackCurrant is seeking qualified relationship paths into ' || target.target_account_name || '. Bums should request a claim when they can provide a real intro, warm path, or actionable account access.',
  target.key_contact_name,
  'Trusted Bums Scheduler',
  target.expected_product_service,
  target.estimated_deal_value,
  target.expected_timeline,
  pay_program.commission_rate,
  '10% of Commissionable Receipts during the 36-month Commission Period after the Account Agreement is executed; payable within 14 days after BlackCurrant receives applicable cash; exclusions apply.',
  concat_ws(
    E'\n',
    'Financial program: BlackCurrant Introduced Account Program - 10% / 36 months.',
    'Commission basis: ' || pay_program.commission_basis,
    'Payment terms: ' || pay_program.payment_terms,
    'Exclusions: ' || pay_program.exclusions,
    'Generated from imported BlackCurrant customer target list.'
  ),
  'Accepted',
  pay_program.id
from updated_targets target
join pay_program on pay_program.company_id = target.client_company_id
where not exists (
  select 1
  from public.opportunity_registrations existing
  where existing.company_id = target.client_company_id
    and lower(existing.target_account_name) = lower(target.target_account_name)
);
