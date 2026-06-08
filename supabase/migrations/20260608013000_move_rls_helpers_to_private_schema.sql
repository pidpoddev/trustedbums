create schema if not exists private;

grant usage on schema private to anon, authenticated;

alter function public.can_add_conversation_participant(uuid) set schema private;
alter function public.company_has_customer_targets(uuid) set schema private;
alter function public.conversation_company_id(uuid) set schema private;
alter function public.current_company_id() set schema private;
alter function public.is_admin() set schema private;
alter function public.is_bum() set schema private;
alter function public.is_conversation_participant(uuid) set schema private;

grant execute on function private.can_add_conversation_participant(uuid) to anon, authenticated;
grant execute on function private.company_has_customer_targets(uuid) to anon, authenticated;
grant execute on function private.conversation_company_id(uuid) to anon, authenticated;
grant execute on function private.current_company_id() to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.is_bum() to anon, authenticated;
grant execute on function private.is_conversation_participant(uuid) to anon, authenticated;
