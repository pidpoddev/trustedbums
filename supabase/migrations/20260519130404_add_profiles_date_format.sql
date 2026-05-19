alter table public.profiles
  add column if not exists date_format text not null default 'MM/DD/YYYY'
  check (date_format in ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'));

update public.profiles
set date_format = 'MM/DD/YYYY'
where date_format is null;
