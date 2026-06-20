create index if not exists audit_events_company_id_idx
  on public.audit_events (company_id);

create index if not exists bum_contacts_customer_target_id_idx
  on public.bum_contacts (customer_target_id);

create index if not exists bum_saved_items_client_company_id_idx
  on public.bum_saved_items (client_company_id);

create index if not exists bum_saved_items_customer_target_id_idx
  on public.bum_saved_items (customer_target_id);

create index if not exists bum_saved_items_opportunity_registration_id_idx
  on public.bum_saved_items (opportunity_registration_id);
