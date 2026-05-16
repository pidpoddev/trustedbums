begin;

-- Clear operational data so production can start clean.
delete from public.audit_events;
delete from public.opportunity_status_history;
delete from public.opportunity_registrations;
delete from public.terms_acceptances;
delete from public.profiles;
delete from public.companies;

commit;
