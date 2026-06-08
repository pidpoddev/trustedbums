grant execute on function public.can_add_conversation_participant(uuid) to anon, authenticated;
grant execute on function public.company_has_customer_targets(uuid) to anon, authenticated;
grant execute on function public.conversation_company_id(uuid) to anon, authenticated;
grant execute on function public.current_company_id() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_bum() to anon, authenticated;
grant execute on function public.is_conversation_participant(uuid) to anon, authenticated;

revoke execute on function public.prevent_profile_self_authorization_mutation() from public;
revoke execute on function public.prevent_profile_self_authorization_mutation() from anon;
revoke execute on function public.prevent_profile_self_authorization_mutation() from authenticated;
