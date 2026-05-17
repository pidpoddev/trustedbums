alter table public.profiles
  add column if not exists last_sign_in_at timestamptz;

update public.profiles
set last_sign_in_at = coalesce(last_sign_in_at, created_at)
where last_sign_in_at is null;
