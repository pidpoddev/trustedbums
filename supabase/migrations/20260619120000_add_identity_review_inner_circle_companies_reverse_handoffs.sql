alter table public.client_company_access_requests
  drop constraint if exists client_company_access_requests_type_check;

alter table public.client_company_access_requests
  add constraint client_company_access_requests_type_check
  check (request_type in ('AUTO_DOMAIN_CLAIM', 'SAME_DOMAIN_ACCESS', 'PUBLIC_EMAIL_COMPANY', 'RELATED_DOMAIN', 'BUM_SIGNUP', 'COMPANY_IDENTITY_CHANGE'));

alter table public.bum_contacts
  add column if not exists is_inner_circle boolean not null default false;

alter table public.opportunity_claim_contacts
  add column if not exists is_inner_circle boolean not null default false;

create index if not exists bum_contacts_bum_inner_circle_idx
  on public.bum_contacts (bum_user_id, created_at desc)
  where is_inner_circle and source_type <> 'OPPORTUNITY_CLAIM';

create index if not exists opportunity_claim_contacts_inner_circle_idx
  on public.opportunity_claim_contacts (opportunity_claim_id, sort_order)
  where is_inner_circle;

create or replace function public.enforce_bum_inner_circle_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  inner_circle_count integer;
begin
  if new.is_inner_circle is not true or new.source_type = 'OPPORTUNITY_CLAIM' then
    return new;
  end if;

  select count(*)
  into inner_circle_count
  from public.bum_contacts contact
  where contact.bum_user_id = new.bum_user_id
    and contact.is_inner_circle is true
    and contact.source_type <> 'OPPORTUNITY_CLAIM'
    and (tg_op = 'INSERT' or contact.id <> new.id);

  if inner_circle_count >= 20 then
    raise exception 'Inner Circle is limited to 20 contacts.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_bum_inner_circle_limit on public.bum_contacts;
create trigger enforce_bum_inner_circle_limit
before insert or update of is_inner_circle, bum_user_id, source_type
on public.bum_contacts
for each row execute function public.enforce_bum_inner_circle_limit();

create table if not exists public.bum_inner_circle_companies (
  id uuid primary key default gen_random_uuid(),
  bum_user_id text not null references public.profiles(id) on delete cascade,
  company_name text not null,
  company_website text,
  linkedin_company_url text,
  relationship_context text not null,
  notes text,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bum_inner_circle_companies_status_check
    check (status in ('ACTIVE', 'ARCHIVED')),
  constraint bum_inner_circle_companies_name_check
    check (length(trim(company_name)) > 0),
  constraint bum_inner_circle_companies_context_check
    check (length(trim(relationship_context)) > 0)
);

create index if not exists bum_inner_circle_companies_bum_status_idx
  on public.bum_inner_circle_companies (bum_user_id, status, created_at desc);

drop trigger if exists set_bum_inner_circle_companies_updated_at on public.bum_inner_circle_companies;
create trigger set_bum_inner_circle_companies_updated_at
before update on public.bum_inner_circle_companies
for each row execute function public.set_updated_at();

create or replace function public.enforce_bum_inner_circle_company_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  active_company_count integer;
begin
  if new.status <> 'ACTIVE' then
    return new;
  end if;

  select count(*)
  into active_company_count
  from public.bum_inner_circle_companies company
  where company.bum_user_id = new.bum_user_id
    and company.status = 'ACTIVE'
    and (tg_op = 'INSERT' or company.id <> new.id);

  if active_company_count >= 3 then
    raise exception 'Inner Circle companies are limited to 3 active companies.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_bum_inner_circle_company_limit on public.bum_inner_circle_companies;
create trigger enforce_bum_inner_circle_company_limit
before insert or update of status, bum_user_id
on public.bum_inner_circle_companies
for each row execute function public.enforce_bum_inner_circle_company_limit();

grant select, insert, update, delete on public.bum_inner_circle_companies to authenticated;

alter table public.bum_inner_circle_companies enable row level security;

drop policy if exists "Bums can manage own inner circle companies" on public.bum_inner_circle_companies;
create policy "Bums can manage own inner circle companies"
on public.bum_inner_circle_companies for all
to authenticated
using (bum_user_id = public.current_user_id())
with check (bum_user_id = public.current_user_id());

drop policy if exists "Admins can manage inner circle companies" on public.bum_inner_circle_companies;
create policy "Admins can manage inner circle companies"
on public.bum_inner_circle_companies for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

alter table public.reverse_opportunities
  add column if not exists admin_owner_id text references public.profiles(id) on delete set null,
  add column if not exists admin_next_action text,
  add column if not exists admin_priority text not null default 'NORMAL',
  add column if not exists follow_up_deadline timestamptz;

alter table public.reverse_opportunities
  drop constraint if exists reverse_opportunities_admin_priority_check;

alter table public.reverse_opportunities
  add constraint reverse_opportunities_admin_priority_check
  check (admin_priority in ('LOW', 'NORMAL', 'HIGH', 'URGENT'));

create index if not exists reverse_opportunities_admin_owner_idx
  on public.reverse_opportunities (admin_owner_id, status, updated_at desc);

create index if not exists reverse_opportunities_admin_priority_idx
  on public.reverse_opportunities (admin_priority, status, updated_at desc);

create or replace function public.prevent_reverse_opportunity_admin_field_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if private.is_admin() then
    return new;
  end if;

  if old.admin_owner_id is distinct from new.admin_owner_id
    or old.admin_next_action is distinct from new.admin_next_action
    or old.admin_priority is distinct from new.admin_priority
    or old.follow_up_deadline is distinct from new.follow_up_deadline then
    raise exception 'Reverse opportunity handoff fields require Trusted Bums Admin review.';
  end if;

  return new;
end;
$$;

revoke execute on function public.prevent_reverse_opportunity_admin_field_self_update()
  from public, anon, authenticated;

drop trigger if exists prevent_reverse_opportunity_admin_field_self_update on public.reverse_opportunities;
create trigger prevent_reverse_opportunity_admin_field_self_update
before update on public.reverse_opportunities
for each row execute function public.prevent_reverse_opportunity_admin_field_self_update();

create index if not exists admin_shared_mailbox_messages_assigned_to_fk_idx
  on public.admin_shared_mailbox_messages (assigned_to);

create index if not exists admin_shared_mailbox_messages_handled_by_fk_idx
  on public.admin_shared_mailbox_messages (handled_by);
