alter table public.profiles
  add column if not exists time_zone text;
