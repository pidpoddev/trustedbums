alter table public.bum_saved_items
  add column if not exists is_saved boolean not null default true,
  add column if not exists is_hidden boolean not null default false,
  add column if not exists hidden_reason text,
  add column if not exists updated_at timestamptz not null default now();

update public.bum_saved_items
set is_saved = true
where is_saved is distinct from true;

drop trigger if exists set_bum_saved_items_updated_at on public.bum_saved_items;
create trigger set_bum_saved_items_updated_at
before update on public.bum_saved_items
for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.bum_saved_items to anon, authenticated;

drop policy if exists "Bums can update own saved items" on public.bum_saved_items;
create policy "Bums can update own saved items"
on public.bum_saved_items for update
using (bum_user_id = public.current_user_id() or public.is_admin())
with check (bum_user_id = public.current_user_id() or public.is_admin());
