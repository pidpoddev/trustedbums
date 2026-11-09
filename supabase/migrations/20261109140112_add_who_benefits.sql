-- Charity suggestions require explicit admin approval before selection.
create table public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 200),
  website text not null check (website ~ '^https://[^[:space:]]+$' and length(website) <= 500),
  registration_number text not null check (length(trim(registration_number)) between 1 and 200),
  suggestion_reason text not null check (length(trim(suggestion_reason)) between 1 and 2000),
  suggested_by text not null references public.profiles(id),
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  review_notes text check (length(review_notes) <= 4000),
  charitable_status_verified boolean not null default false,
  nonpolitical_verified boolean not null default false,
  ethos_verified boolean not null default false,
  reviewed_by text references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index charities_suggested_by_idx on public.charities(suggested_by);
create index charities_reviewed_by_idx on public.charities(reviewed_by);
create table public.charity_reviews (
  id uuid primary key default gen_random_uuid(),
  charity_id uuid not null references public.charities(id),
  status text not null,
  review_notes text not null,
  reviewed_by text not null references public.profiles(id),
  charitable_status_verified boolean not null,
  nonpolitical_verified boolean not null,
  ethos_verified boolean not null,
  created_at timestamptz not null default now()
);
create index charity_reviews_charity_idx on public.charity_reviews(charity_id);
create index charity_reviews_reviewer_idx on public.charity_reviews(reviewed_by);
create table public.bum_beneficiary_preferences (
  bum_user_id text primary key references public.profiles(id),
  charity_id uuid references public.charities(id),
  updated_at timestamptz not null default now()
);
create index bum_beneficiary_charity_idx on public.bum_beneficiary_preferences(charity_id);
alter table public.charities enable row level security;
alter table public.charity_reviews enable row level security;
alter table public.bum_beneficiary_preferences enable row level security;
revoke all on public.charities, public.charity_reviews, public.bum_beneficiary_preferences from anon, authenticated;
grant select on public.charities, public.charity_reviews, public.bum_beneficiary_preferences to anon, authenticated;
grant insert (name, website, registration_number, suggestion_reason, suggested_by) on public.charities to anon, authenticated;
grant update (status, review_notes, charitable_status_verified, nonpolitical_verified, ethos_verified) on public.charities to anon, authenticated;
grant insert on public.charity_reviews to anon, authenticated;
grant insert (bum_user_id, charity_id), update (bum_user_id, charity_id) on public.bum_beneficiary_preferences to anon, authenticated;
create policy charities_read on public.charities for select to anon, authenticated using (
  private.is_admin() or (private.is_bum() and (status = 'APPROVED' or suggested_by = public.current_user_id()))
);
create policy charities_suggest on public.charities for insert to anon, authenticated with check (
  private.is_bum() and suggested_by = public.current_user_id() and status = 'PENDING'
  and reviewed_by is null and reviewed_at is null and review_notes is null
  and not charitable_status_verified and not nonpolitical_verified and not ethos_verified
);
create policy charities_admin_review on public.charities for update to anon, authenticated using (private.is_admin()) with check (private.is_admin());
create policy charity_reviews_read on public.charity_reviews for select to anon, authenticated using (private.is_admin());
create policy charity_reviews_insert on public.charity_reviews for insert to anon, authenticated with check (private.is_admin() and reviewed_by = public.current_user_id());
create policy beneficiary_read on public.bum_beneficiary_preferences for select to anon, authenticated using (
  private.is_admin() or (private.is_bum() and bum_user_id = public.current_user_id())
);
create policy beneficiary_insert on public.bum_beneficiary_preferences for insert to anon, authenticated with check (private.is_bum() and bum_user_id = public.current_user_id());
create policy beneficiary_update on public.bum_beneficiary_preferences for update to anon, authenticated using (private.is_bum() and bum_user_id = public.current_user_id()) with check (private.is_bum() and bum_user_id = public.current_user_id());

create function private.review_charity() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'Only admins can review charities'; end if;
  if new.status = 'PENDING' or nullif(trim(new.review_notes), '') is null then raise exception 'A review decision and reason are required'; end if;
  if new.status = 'APPROVED' and not (new.charitable_status_verified and new.nonpolitical_verified and new.ethos_verified) then
    raise exception 'Complete all charity approval checks';
  end if;
  new.reviewed_by := public.current_user_id();
  new.reviewed_at := now();
  insert into public.charity_reviews (charity_id, status, review_notes, reviewed_by, charitable_status_verified, nonpolitical_verified, ethos_verified)
    values (new.id, new.status, new.review_notes, new.reviewed_by, new.charitable_status_verified, new.nonpolitical_verified, new.ethos_verified);
  return new;
end;
$$;
create trigger review_charity before update on public.charities for each row execute function private.review_charity();

-- Definer is needed only for the locked approval lookup: row locks otherwise apply
-- the admin-only charity UPDATE policy to Bum selections. Ownership is checked here.
create function private.validate_beneficiary() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.current_user_id() is null or not private.is_bum() or new.bum_user_id <> public.current_user_id() then
    raise exception 'Only Bums can set their own beneficiary';
  end if;
  if tg_op = 'UPDATE' and new.bum_user_id <> old.bum_user_id then raise exception 'Cannot reassign beneficiary preferences'; end if;
  if new.charity_id is not null then
    perform 1 from public.charities where id = new.charity_id and status = 'APPROVED' for share;
    if not found then raise exception 'Choose an approved charity'; end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger validate_beneficiary before insert or update on public.bum_beneficiary_preferences for each row execute function private.validate_beneficiary();

alter table public.bum_payouts add column beneficiary_charity_id uuid references public.charities(id), add column beneficiary_name text;
create index bum_payouts_beneficiary_charity_idx on public.bum_payouts(beneficiary_charity_id);
create function private.snapshot_payout_beneficiary() returns trigger language plpgsql security invoker set search_path = '' as $$
declare selected_charity uuid; charity_name text;
begin
  if tg_op = 'INSERT' then
    select charity_id into selected_charity from public.bum_beneficiary_preferences where bum_user_id = new.bum_user_id;
    new.beneficiary_charity_id := selected_charity;
    new.beneficiary_name := null;
    if selected_charity is not null then
      select name into charity_name from public.charities where id = selected_charity and status = 'APPROVED' for share;
      if not found then raise exception 'Beneficiary charity is no longer approved; ask the Bum to choose another beneficiary'; end if;
      new.beneficiary_name := charity_name;
    end if;
  elsif new.beneficiary_charity_id is distinct from old.beneficiary_charity_id or new.beneficiary_name is distinct from old.beneficiary_name or new.bum_user_id is distinct from old.bum_user_id then
    raise exception 'An existing payout beneficiary cannot be changed';
  end if;
  if new.beneficiary_charity_id is not null and new.status in ('APPROVED', 'PAID') then
    perform 1 from public.charities where id = new.beneficiary_charity_id and status = 'APPROVED' for share;
    if not found then raise exception 'Charity approval has been withdrawn; resolve with an admin before paying'; end if;
  end if;
  return new;
end;
$$;
create trigger snapshot_payout_beneficiary before insert or update on public.bum_payouts for each row execute function private.snapshot_payout_beneficiary();
revoke all on function private.review_charity(), private.validate_beneficiary(), private.snapshot_payout_beneficiary() from public, anon, authenticated;
