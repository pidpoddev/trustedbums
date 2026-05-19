alter table public.admin_email_templates
  add column if not exists category text not null default 'transactional',
  add column if not exists reply_to text,
  add column if not exists rate_limit_per_hour integer not null default 120;

alter table public.admin_email_templates
  drop constraint if exists admin_email_templates_category_check;

alter table public.admin_email_templates
  add constraint admin_email_templates_category_check check (
    category in ('transactional', 'opportunity_updates', 'client_alerts', 'bum_marketplace_alerts', 'admin_announcements', 'onboarding', 'marketing')
  );

alter table public.admin_email_deliveries
  add column if not exists campaign_id uuid,
  add column if not exists category text not null default 'transactional',
  add column if not exists opened_at timestamptz,
  add column if not exists clicked_at timestamptz,
  add column if not exists last_engaged_at timestamptz,
  add column if not exists engagement_score integer not null default 0,
  add column if not exists is_test boolean not null default false;

create table if not exists public.admin_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.admin_email_templates(id) on delete set null,
  template_slug text,
  name text not null,
  status text not null default 'DRAFT',
  recipient_group text not null,
  recipient_count integer not null default 0,
  category text not null default 'transactional',
  subject_snapshot text not null,
  body_snapshot text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by text references public.profiles(id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_email_campaigns_status_check check (status in ('DRAFT', 'SENT', 'FAILED', 'CANCELLED')),
  constraint admin_email_campaigns_recipient_group_check check (
    recipient_group in ('CLIENT_COMPANY', 'ALL_CLIENTS', 'ALL_BUMS', 'BUM_INDUSTRY_MATCH', 'ADMINS', 'CUSTOM')
  ),
  constraint admin_email_campaigns_category_check check (
    category in ('transactional', 'opportunity_updates', 'client_alerts', 'bum_marketplace_alerts', 'admin_announcements', 'onboarding', 'marketing')
  )
);

alter table public.admin_email_deliveries
  drop constraint if exists admin_email_deliveries_campaign_id_fkey;

alter table public.admin_email_deliveries
  add constraint admin_email_deliveries_campaign_id_fkey
  foreign key (campaign_id) references public.admin_email_campaigns(id) on delete set null;

create table if not exists public.admin_email_events (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid references public.admin_email_deliveries(id) on delete cascade,
  event_type text not null,
  recipient_email text not null,
  recipient_profile_id text references public.profiles(id) on delete set null,
  clicked_url text,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now(),
  constraint admin_email_events_type_check check (event_type in ('OPEN', 'CLICK', 'BOUNCE', 'COMPLAINT', 'REPLY', 'PORTAL_VISIT'))
);

create table if not exists public.admin_email_preferences (
  id uuid primary key default gen_random_uuid(),
  profile_id text references public.profiles(id) on delete cascade,
  email text not null,
  category text not null,
  opted_out boolean not null default false,
  source text not null default 'ADMIN',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint admin_email_preferences_category_check check (
    category in ('opportunity_updates', 'client_alerts', 'bum_marketplace_alerts', 'admin_announcements', 'onboarding', 'marketing')
  ),
  constraint admin_email_preferences_email_check check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create unique index if not exists admin_email_preferences_email_category_idx
  on public.admin_email_preferences (lower(email), category);

create table if not exists public.admin_email_suppressions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  reason text not null,
  details text,
  created_by text references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint admin_email_suppressions_reason_check check (reason in ('BOUNCE', 'COMPLAINT', 'UNSUBSCRIBE', 'MANUAL', 'INVALID')),
  constraint admin_email_suppressions_email_check check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create table if not exists public.admin_email_trigger_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger_event text not null,
  template_id uuid references public.admin_email_templates(id) on delete cascade,
  is_active boolean not null default true,
  delay_minutes integer not null default 0,
  conditions jsonb not null default '{}'::jsonb,
  created_by text references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_email_trigger_rules_event_check check (
    trigger_event in (
      'OPPORTUNITY_CLAIM_CREATED',
      'OPPORTUNITY_CLAIM_STATUS_CHANGED',
      'CLIENT_CREATED',
      'CLIENT_TARGET_CREATED',
      'CONTACT_SUBMISSION_CREATED'
    )
  )
);

drop trigger if exists set_admin_email_campaigns_updated_at on public.admin_email_campaigns;
create trigger set_admin_email_campaigns_updated_at
before update on public.admin_email_campaigns
for each row execute function public.set_updated_at();

drop trigger if exists set_admin_email_preferences_updated_at on public.admin_email_preferences;
create trigger set_admin_email_preferences_updated_at
before update on public.admin_email_preferences
for each row execute function public.set_updated_at();

drop trigger if exists set_admin_email_trigger_rules_updated_at on public.admin_email_trigger_rules;
create trigger set_admin_email_trigger_rules_updated_at
before update on public.admin_email_trigger_rules
for each row execute function public.set_updated_at();

alter table public.admin_email_campaigns enable row level security;
alter table public.admin_email_events enable row level security;
alter table public.admin_email_preferences enable row level security;
alter table public.admin_email_suppressions enable row level security;
alter table public.admin_email_trigger_rules enable row level security;

drop policy if exists "Admins can manage email campaigns" on public.admin_email_campaigns;
create policy "Admins can manage email campaigns"
on public.admin_email_campaigns for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read email events" on public.admin_email_events;
create policy "Admins can read email events"
on public.admin_email_events for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can manage email preferences" on public.admin_email_preferences;
create policy "Admins can manage email preferences"
on public.admin_email_preferences for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage email suppressions" on public.admin_email_suppressions;
create policy "Admins can manage email suppressions"
on public.admin_email_suppressions for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage email trigger rules" on public.admin_email_trigger_rules;
create policy "Admins can manage email trigger rules"
on public.admin_email_trigger_rules for all to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, insert, update on public.admin_email_campaigns to authenticated;
grant select on public.admin_email_events to authenticated;
grant select, insert, update, delete on public.admin_email_preferences to authenticated;
grant select, insert, update, delete on public.admin_email_suppressions to authenticated;
grant select, insert, update, delete on public.admin_email_trigger_rules to authenticated;

create or replace view public.admin_email_engagement_summary
with (security_invoker = true)
as
select
  d.recipient_email,
  d.recipient_profile_id,
  p.full_name,
  p.role,
  p.company_id,
  c.name as company_name,
  count(*) filter (where d.status = 'SENT') as sent_count,
  count(*) filter (where d.opened_at is not null) as opened_count,
  count(*) filter (where d.clicked_at is not null) as clicked_count,
  coalesce(sum(d.engagement_score), 0)::integer as engagement_score,
  max(d.last_engaged_at) as last_engaged_at
from public.admin_email_deliveries d
left join public.profiles p on p.id = d.recipient_profile_id
left join public.companies c on c.id = p.company_id
group by d.recipient_email, d.recipient_profile_id, p.full_name, p.role, p.company_id, c.name;

grant select on public.admin_email_engagement_summary to authenticated;

update public.admin_email_templates
set category = case
  when slug = 'general_admin_announcement' then 'admin_announcements'
  when slug = 'new_client_industry_match_bums' then 'bum_marketplace_alerts'
  when slug = 'opportunity_claim_created_client' then 'client_alerts'
  when slug = 'opportunity_claim_status_bum' then 'opportunity_updates'
  else category
end;

insert into public.admin_email_trigger_rules (name, trigger_event, template_id)
select name, trigger_event, id
from public.admin_email_templates
where trigger_event is not null and trigger_event <> 'MANUAL'
on conflict do nothing;
