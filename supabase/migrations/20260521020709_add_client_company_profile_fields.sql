alter table public.companies
  add column if not exists description text,
  add column if not exists target_industries text[] not null default '{}',
  add column if not exists target_regions text[] not null default '{}',
  add column if not exists ideal_customer_profile text;
