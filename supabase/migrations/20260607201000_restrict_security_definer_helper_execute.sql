revoke execute on function public.can_add_conversation_participant(uuid) from public;
revoke execute on function public.can_add_conversation_participant(uuid) from anon;
revoke execute on function public.can_add_conversation_participant(uuid) from authenticated;

revoke execute on function public.company_has_customer_targets(uuid) from public;
revoke execute on function public.company_has_customer_targets(uuid) from anon;
revoke execute on function public.company_has_customer_targets(uuid) from authenticated;

revoke execute on function public.conversation_company_id(uuid) from public;
revoke execute on function public.conversation_company_id(uuid) from anon;
revoke execute on function public.conversation_company_id(uuid) from authenticated;

revoke execute on function public.current_company_id() from public;
revoke execute on function public.current_company_id() from anon;
revoke execute on function public.current_company_id() from authenticated;

revoke execute on function public.is_admin() from public;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.is_admin() from authenticated;

revoke execute on function public.is_bum() from public;
revoke execute on function public.is_bum() from anon;
revoke execute on function public.is_bum() from authenticated;

revoke execute on function public.is_conversation_participant(uuid) from public;
revoke execute on function public.is_conversation_participant(uuid) from anon;
revoke execute on function public.is_conversation_participant(uuid) from authenticated;

revoke execute on function public.prevent_profile_self_authorization_mutation() from public;
revoke execute on function public.prevent_profile_self_authorization_mutation() from anon;
revoke execute on function public.prevent_profile_self_authorization_mutation() from authenticated;

alter function public.normalize_submitted_opportunity_status() set search_path = public;
