create table if not exists public.admin_email_schedules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  template_id uuid not null references public.admin_email_templates(id) on delete cascade,
  is_active boolean not null default true,
  cron_expression text not null,
  recipient_group text not null,
  recipient_emails text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  category text not null default 'admin_announcements',
  next_run_at timestamptz,
  last_run_at timestamptz,
  created_by text references public.profiles(id) on delete set null,
  updated_by text references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_email_schedules_recipient_group_check check (
    recipient_group in ('CLIENT_COMPANY', 'ALL_CLIENTS', 'ALL_BUMS', 'BUM_INDUSTRY_MATCH', 'ADMINS', 'CUSTOM')
  ),
  constraint admin_email_schedules_category_check check (
    category in ('transactional', 'opportunity_updates', 'client_alerts', 'bum_marketplace_alerts', 'admin_announcements', 'onboarding', 'marketing')
  ),
  constraint admin_email_schedules_cron_expression_check check (length(trim(cron_expression)) between 5 and 120)
);

create table if not exists public.admin_email_brand_settings (
  id boolean primary key default true,
  sender_name text not null default 'Trusted Bums',
  logo_url text not null default 'https://trustedbums.com/logo-mark.svg',
  accent_color text not null default '#ea580c',
  footer_text text not null default 'Trusted Bums connects relationship-led sellers with companies that need warm introductions.',
  physical_address text,
  updated_by text references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_email_brand_settings_singleton_check check (id = true),
  constraint admin_email_brand_settings_accent_color_check check (accent_color ~* '^#[0-9a-f]{6}$')
);

drop trigger if exists set_admin_email_schedules_updated_at on public.admin_email_schedules;
create trigger set_admin_email_schedules_updated_at
before update on public.admin_email_schedules
for each row execute function public.set_updated_at();

drop trigger if exists set_admin_email_brand_settings_updated_at on public.admin_email_brand_settings;
create trigger set_admin_email_brand_settings_updated_at
before update on public.admin_email_brand_settings
for each row execute function public.set_updated_at();

alter table public.admin_email_schedules enable row level security;
alter table public.admin_email_brand_settings enable row level security;

drop policy if exists "Admins can manage email schedules" on public.admin_email_schedules;
create policy "Admins can manage email schedules"
on public.admin_email_schedules for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage email brand settings" on public.admin_email_brand_settings;
create policy "Admins can manage email brand settings"
on public.admin_email_brand_settings for all to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, insert, update, delete on public.admin_email_schedules to authenticated;
grant select, insert, update on public.admin_email_brand_settings to authenticated;

insert into public.admin_email_brand_settings (id)
values (true)
on conflict (id) do nothing;
