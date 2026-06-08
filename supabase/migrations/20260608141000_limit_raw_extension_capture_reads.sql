drop policy if exists "Users can read relevant extension captures" on public.extension_page_captures;

create policy "Users can read own or admin extension captures"
on public.extension_page_captures for select
to authenticated
using (
  private.is_admin()
  or created_by = public.current_user_id()
);
