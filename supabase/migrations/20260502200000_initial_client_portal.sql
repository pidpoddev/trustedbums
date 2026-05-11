create extension if not exists pgcrypto;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id text primary key,
  company_id uuid references public.companies(id) on delete set null,
  full_name text,
  email text,
  role text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.terms_versions (
  id uuid primary key default gen_random_uuid(),
  version text unique not null,
  title text not null,
  body text not null,
  faq_body text,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists terms_versions_one_active_idx
  on public.terms_versions (is_active)
  where is_active;

create table if not exists public.terms_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  company_id uuid references public.companies(id) on delete set null,
  terms_version_id uuid references public.terms_versions(id) on delete restrict,
  accepted_at timestamptz not null default now(),
  ip_address text,
  user_agent text
);

create unique index if not exists terms_acceptances_user_company_version_idx
  on public.terms_acceptances (user_id, company_id, terms_version_id);

create table if not exists public.opportunity_registrations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  created_by text not null,
  target_account_name text not null,
  business_unit text,
  opportunity_description text,
  client_contact text,
  trusted_bums_contact text,
  expected_product_service text,
  estimated_deal_value numeric,
  expected_timeline text,
  commission_rate numeric not null default 10,
  commission_duration text not null default 'For so long as Client receives revenue from the Introduced Account or substantially related opportunity',
  notes text,
  status text not null default 'Submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunity_status_history (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunity_registrations(id) on delete cascade,
  old_status text,
  new_status text,
  changed_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  user_id text,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  event_data jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_user_id()
returns text
language sql
stable
as $$
  select nullif(auth.jwt()->>'sub', '')
$$;

create or replace function public.current_company_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select company_id from public.profiles where id = public.current_user_id()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = public.current_user_id()
      and (is_admin = true or upper(coalesce(role, '')) = 'ADMIN')
  )
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_opportunity_registrations_updated_at on public.opportunity_registrations;
create trigger set_opportunity_registrations_updated_at
before update on public.opportunity_registrations
for each row execute function public.set_updated_at();

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.terms_versions enable row level security;
alter table public.terms_acceptances enable row level security;
alter table public.opportunity_registrations enable row level security;
alter table public.opportunity_status_history enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists "Users can read own company" on public.companies;
create policy "Users can read own company"
on public.companies for select
to authenticated
using (id = public.current_company_id() or public.is_admin());

drop policy if exists "Authenticated users can create companies" on public.companies;
create policy "Authenticated users can create companies"
on public.companies for insert
to authenticated
with check (true);

drop policy if exists "Admins can manage companies" on public.companies;
create policy "Admins can manage companies"
on public.companies for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = public.current_user_id() or public.is_admin());

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
on public.profiles for insert
to authenticated
with check (id = public.current_user_id());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (id = public.current_user_id() or public.is_admin())
with check (id = public.current_user_id() or public.is_admin());

drop policy if exists "Authenticated users can read terms" on public.terms_versions;
create policy "Authenticated users can read terms"
on public.terms_versions for select
to authenticated
using (true);

drop policy if exists "Admins can create terms" on public.terms_versions;
create policy "Admins can create terms"
on public.terms_versions for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update terms" on public.terms_versions;
create policy "Admins can update terms"
on public.terms_versions for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read company acceptances" on public.terms_acceptances;
create policy "Users can read company acceptances"
on public.terms_acceptances for select
to authenticated
using (user_id = public.current_user_id() or company_id = public.current_company_id() or public.is_admin());

drop policy if exists "Users can accept terms for own company" on public.terms_acceptances;
create policy "Users can accept terms for own company"
on public.terms_acceptances for insert
to authenticated
with check (
  user_id = public.current_user_id()
  and (company_id = public.current_company_id() or company_id is null)
);

drop policy if exists "Users can read own opportunity registrations" on public.opportunity_registrations;
create policy "Users can read own opportunity registrations"
on public.opportunity_registrations for select
to authenticated
using (created_by = public.current_user_id() or public.is_admin());

drop policy if exists "Users can create own opportunity registrations" on public.opportunity_registrations;
create policy "Users can create own opportunity registrations"
on public.opportunity_registrations for insert
to authenticated
with check (
  created_by = public.current_user_id()
  and (company_id = public.current_company_id() or company_id is null)
);

drop policy if exists "Admins can update opportunity registrations" on public.opportunity_registrations;
create policy "Admins can update opportunity registrations"
on public.opportunity_registrations for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read visible status history" on public.opportunity_status_history;
create policy "Users can read visible status history"
on public.opportunity_status_history for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.opportunity_registrations opportunity
    where opportunity.id = public.opportunity_status_history.opportunity_id
      and opportunity.created_by = public.current_user_id()
  )
);

drop policy if exists "Users can create status history" on public.opportunity_status_history;
create policy "Users can create status history"
on public.opportunity_status_history for insert
to authenticated
with check (changed_by = public.current_user_id() or public.is_admin());

drop policy if exists "Users can read own audit events" on public.audit_events;
create policy "Users can read own audit events"
on public.audit_events for select
to authenticated
using (user_id = public.current_user_id() or company_id = public.current_company_id() or public.is_admin());

drop policy if exists "Users can create audit events" on public.audit_events;
create policy "Users can create audit events"
on public.audit_events for insert
to authenticated
with check (
  user_id = public.current_user_id()
  and (company_id = public.current_company_id() or company_id is null or public.is_admin())
);

insert into public.terms_versions (id, version, title, body, faq_body, is_active)
values (
  '00000000-0000-0000-0000-000000000001',
  'v1',
  'Trusted Bums Partner Terms',
  $$Trusted Bums provides business development support, strategic introductions, relationship facilitation, account access, and related services. By using the Client Portal, requesting introductions, registering opportunities, or accepting support from Trusted Bums, Client agrees that Trusted Bums’ introductions, account access, and relationship support create commercial value and may result in commission obligations as described below.

1. Services

Trusted Bums may assist Client with introductions, account strategy, relationship facilitation, opportunity support, meeting coordination, and business development activities. Trusted Bums does not guarantee that any customer will enter into an agreement, purchase services, or generate revenue.

2. Opportunity Registration

An opportunity may be registered when Trusted Bums introduces, identifies, facilitates, supports, or materially advances a relationship between Client and a target account. Registration may occur through the Client Portal, email, written notice, meeting notes, or other documented communication.

3. Introduced Accounts

An “Introduced Account” means any company, business unit, department, affiliate, subsidiary, channel, or related opportunity that Trusted Bums introduces to Client or materially helps Client pursue. Introduced Accounts include renewals, expansions, replacements, amendments, successor arrangements, and related business opportunities that substantially arise from the original introduction or support.

4. Commissionable Revenue

Client agrees to pay Trusted Bums the applicable commission percentage on amounts actually received by Client from an Introduced Account or related opportunity. Unless otherwise agreed in writing, commissionable revenue includes revenue from contracts, renewals, expansions, amendments, replacements, successor agreements, affiliates, related business units, and materially connected commercial arrangements.

Commissionable revenue excludes taxes, refunds, credits, chargebacks, and amounts not actually collected by Client.

5. Commission Rate and Period

Unless a separate written opportunity agreement states otherwise, the default commission rate is ten percent (10%) of commissionable revenue. Commission obligations continue for so long as Client receives revenue from the Introduced Account or substantially related opportunity, unless the parties agree to a different duration in writing.

6. Payment and Reporting

Client will provide reasonable reporting sufficient to calculate commissions owed. Commissions are payable within fourteen (14) days after Client receives the applicable customer payment.

7. Non-Circumvention

Client agrees not to avoid, bypass, restructure, delay, reroute, or otherwise circumvent Trusted Bums’ commission rights. This includes routing business through affiliates, subsidiaries, alternative contracting entities, renamed projects, related business units, successor arrangements, or delayed transactions that substantially arise from a Trusted Bums introduction or support.

8. Client Responsibilities

Client remains responsible for its own products, services, pricing, proposals, contracts, delivery, customer success, legal compliance, and customer relationships. Trusted Bums is not responsible for Client’s delivery obligations to any customer.

9. Confidentiality

Each party may receive non-public business, customer, pricing, technical, strategic, or relationship information from the other. Each party agrees to use reasonable care to protect confidential information and to use it only for purposes related to the relationship.

10. No Guarantee

Trusted Bums does not guarantee customer meetings, contracts, revenue, customer approvals, procurement outcomes, or deal timing. Client acknowledges that Trusted Bums’ value is based on access, introductions, relationship leverage, and business development support.

11. Termination

Either party may stop future participation at any time. Termination does not eliminate commission obligations for Introduced Accounts, registered opportunities, or business relationships that arose before termination or substantially resulted from Trusted Bums’ introduction or support.

12. Limitation of Liability

Neither party will be liable for indirect, incidental, special, punitive, or consequential damages. Trusted Bums’ total liability will not exceed amounts paid to Trusted Bums by Client during the twelve months before the claim.

13. Governing Law

These terms are governed by the laws of the State of Delaware unless a separate signed agreement states otherwise.

14. Custom Terms

The parties may agree to custom commission rates, durations, account-specific terms, or enterprise agreements in writing. If custom written terms conflict with these Partner Terms, the custom written terms control for that specific opportunity.$$,
  $$Q: Why does Trusted Bums receive commissions?
A: Trusted Bums creates value by helping clients access strategic accounts, build credibility, navigate relationships, and increase the likelihood of commercial success. When that support leads to revenue, Trusted Bums participates in the upside.

Q: What counts as an introduced opportunity?
A: An introduced opportunity includes any account, department, business unit, affiliate, or related opportunity that Trusted Bums introduces, identifies, facilitates, supports, or materially advances.

Q: What if we already knew the account?
A: If Client had a pre-existing active opportunity, Client should disclose that during registration. Trusted Bums and Client can then clarify whether Trusted Bums created new access, materially accelerated the opportunity, or should not receive commission rights.

Q: Why do commissions continue after the first introduction?
A: Enterprise relationships often grow over time. An initial introduction can lead to renewals, expansions, related business units, and successor arrangements. The terms are designed to keep incentives aligned as the account grows.

Q: What does non-circumvention mean?
A: It means Client cannot avoid commission obligations by moving the deal to another entity, delaying the transaction, renaming the opportunity, routing it through an affiliate, or closing substantially related business outside the original path.

Q: Does Trusted Bums guarantee deals?
A: No. Trusted Bums helps create access and improve opportunity quality, but customers make their own buying decisions.

Q: Can we negotiate custom terms?
A: Yes. Strategic accounts, enterprise clients, or unusual opportunities can use custom written terms.

Q: What revenue is commissionable?
A: Revenue actually received by Client from an introduced or substantially related opportunity is commissionable, excluding taxes, refunds, credits, chargebacks, and uncollected amounts.

Q: What happens if we terminate our portal account?
A: Termination stops future participation but does not eliminate commission obligations for opportunities already introduced, registered, or materially supported by Trusted Bums.$$,
  true
)
on conflict (version) do update
set title = excluded.title,
    body = excluded.body,
    faq_body = excluded.faq_body,
    is_active = excluded.is_active;
