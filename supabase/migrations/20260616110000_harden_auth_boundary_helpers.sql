alter function public.normalize_customer_domain(text) set search_path = public, pg_temp;

revoke execute on function public.record_admin_scrum_item_audit_event() from public;
revoke execute on function public.record_admin_scrum_item_audit_event() from anon;
revoke execute on function public.record_admin_scrum_item_audit_event() from authenticated;
grant execute on function public.record_admin_scrum_item_audit_event() to service_role;

revoke execute on function public.set_admin_scrum_item_audit_fields() from public;
revoke execute on function public.set_admin_scrum_item_audit_fields() from anon;
revoke execute on function public.set_admin_scrum_item_audit_fields() from authenticated;
grant execute on function public.set_admin_scrum_item_audit_fields() to service_role;

revoke execute on function public.find_customer_lead_duplicate(uuid, text) from public;
revoke execute on function public.find_customer_lead_duplicate(uuid, text) from anon;
revoke execute on function public.find_customer_lead_duplicate(uuid, text) from authenticated;
grant execute on function public.find_customer_lead_duplicate(uuid, text) to service_role;

revoke execute on function public.normalize_customer_domain(text) from public;
revoke execute on function public.normalize_customer_domain(text) from anon;
revoke execute on function public.normalize_customer_domain(text) from authenticated;
grant execute on function public.normalize_customer_domain(text) to service_role;
