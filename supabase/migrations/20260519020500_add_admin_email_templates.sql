create table if not exists public.admin_email_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  recipient_group text not null,
  trigger_event text,
  subject text not null,
  body text not null,
  metadata_fields text[] not null default '{}',
  is_active boolean not null default true,
  created_by text references public.profiles(id) on delete set null,
  updated_by text references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_email_templates_recipient_group_check check (
    recipient_group in ('CLIENT_COMPANY', 'ALL_CLIENTS', 'ALL_BUMS', 'BUM_INDUSTRY_MATCH', 'ADMINS', 'CUSTOM')
  ),
  constraint admin_email_templates_trigger_event_check check (
    trigger_event is null or trigger_event in (
      'MANUAL',
      'OPPORTUNITY_CLAIM_CREATED',
      'OPPORTUNITY_CLAIM_STATUS_CHANGED',
      'CLIENT_CREATED',
      'CLIENT_TARGET_CREATED',
      'CONTACT_SUBMISSION_CREATED'
    )
  )
);

create table if not exists public.admin_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.admin_email_templates(id) on delete set null,
  template_slug text,
  recipient_group text not null,
  recipient_profile_id text references public.profiles(id) on delete set null,
  recipient_email text not null,
  subject text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'QUEUED',
  error text,
  sent_at timestamptz,
  triggered_by text not null default 'MANUAL',
  created_by text references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint admin_email_deliveries_recipient_group_check check (
    recipient_group in ('CLIENT_COMPANY', 'ALL_CLIENTS', 'ALL_BUMS', 'BUM_INDUSTRY_MATCH', 'ADMINS', 'CUSTOM')
  ),
  constraint admin_email_deliveries_status_check check (status in ('QUEUED', 'SENT', 'FAILED')),
  constraint admin_email_deliveries_email_check check (recipient_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

drop trigger if exists set_admin_email_templates_updated_at on public.admin_email_templates;
create trigger set_admin_email_templates_updated_at
before update on public.admin_email_templates
for each row execute function public.set_updated_at();

alter table public.admin_email_templates enable row level security;
alter table public.admin_email_deliveries enable row level security;

drop policy if exists "Admins can manage email templates" on public.admin_email_templates;
create policy "Admins can manage email templates"
on public.admin_email_templates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read email deliveries" on public.admin_email_deliveries;
create policy "Admins can read email deliveries"
on public.admin_email_deliveries
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert email deliveries" on public.admin_email_deliveries;
create policy "Admins can insert email deliveries"
on public.admin_email_deliveries
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update email deliveries" on public.admin_email_deliveries;
create policy "Admins can update email deliveries"
on public.admin_email_deliveries
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, insert, update, delete on public.admin_email_templates to authenticated;
grant select, insert, update on public.admin_email_deliveries to authenticated;

insert into public.admin_email_templates
  (slug, name, description, recipient_group, trigger_event, subject, body, metadata_fields)
values
  (
    'opportunity_claim_created_client',
    'Client notice: Bum submitted a claim',
    'Sent to client company users when a Bum enters a contact against one of their accepted opportunities.',
    'CLIENT_COMPANY',
    'OPPORTUNITY_CLAIM_CREATED',
    'New Bum claim for {{target_account_name}}',
    'Hi {{client_name}},\n\nA Trusted Bum submitted a claim for {{target_account_name}}.\n\nContact: {{contact_name}} at {{contact_company}}\nRelationship strength: {{relationship_strength}}\nSubmitted by: {{bum_name}}\n\nAdmin note:\n{{admin_note}}\n\nYou can review the claim details in the Trusted Bums portal.\n\nTrusted Bums',
    array['client_name', 'target_account_name', 'contact_name', 'contact_company', 'relationship_strength', 'bum_name', 'admin_note']
  ),
  (
    'opportunity_claim_status_bum',
    'Bum notice: claim status changed',
    'Sent to a Bum when an admin changes a claim status.',
    'CUSTOM',
    'OPPORTUNITY_CLAIM_STATUS_CHANGED',
    'Your Trusted Bums claim is now {{claim_status}}',
    'Hi {{bum_name}},\n\nYour claim for {{target_account_name}} is now {{claim_status}}.\n\nContact: {{contact_name}} at {{contact_company}}\n\n{{admin_note}}\n\nTrusted Bums',
    array['bum_name', 'target_account_name', 'claim_status', 'contact_name', 'contact_company', 'admin_note']
  ),
  (
    'new_client_industry_match_bums',
    'Bum notice: new matching client',
    'Sent to Bums whose industry coverage matches a new or newly active client.',
    'CLIENT_CREATED',
    'New client match: {{client_company_name}}',
    'Hi {{bum_name}},\n\n{{client_company_name}} is now active on Trusted Bums and matches your {{industry}} coverage.\n\nThey are looking for help with:\n{{client_pitch}}\n\nIf you know the right people, open the portal and review the opportunity details.\n\nTrusted Bums',
    array['bum_name', 'client_company_name', 'industry', 'client_pitch']
  ),
  (
    'general_admin_announcement',
    'General announcement',
    'Flexible admin-authored announcement for clients, Bums, admins, or a custom recipient list.',
    'CUSTOM',
    'MANUAL',
    '{{headline}}',
    'Hi {{recipient_name}},\n\n{{message}}\n\nTrusted Bums',
    array['headline', 'recipient_name', 'message']
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  recipient_group = excluded.recipient_group,
  trigger_event = excluded.trigger_event,
  subject = excluded.subject,
  body = excluded.body,
  metadata_fields = excluded.metadata_fields,
  is_active = true;
