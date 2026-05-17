alter table public.client_pay_programs
  add column if not exists year_1_rate numeric,
  add column if not exists year_2_rate numeric,
  add column if not exists year_3_rate numeric,
  add column if not exists year_4_rate numeric,
  add column if not exists year_5_rate numeric,
  add column if not exists year_6_plus_rate numeric;

update public.client_pay_programs
set
  year_1_rate = coalesce(year_1_rate, commission_rate),
  year_2_rate = coalesce(year_2_rate, commission_rate),
  year_3_rate = coalesce(year_3_rate, commission_rate),
  year_4_rate = coalesce(year_4_rate, commission_rate),
  year_5_rate = coalesce(year_5_rate, commission_rate),
  year_6_plus_rate = coalesce(year_6_plus_rate, commission_rate);

alter table public.client_pay_programs
  alter column year_1_rate set not null,
  alter column year_2_rate set not null,
  alter column year_3_rate set not null,
  alter column year_4_rate set not null,
  alter column year_5_rate set not null,
  alter column year_6_plus_rate set not null;

alter table public.client_pay_programs
  alter column year_1_rate set default 10,
  alter column year_2_rate set default 10,
  alter column year_3_rate set default 10,
  alter column year_4_rate set default 10,
  alter column year_5_rate set default 10,
  alter column year_6_plus_rate set default 10;

alter table public.opportunity_registrations
  add column if not exists commission_schedule_start_at timestamptz;
