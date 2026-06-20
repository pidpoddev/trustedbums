create index if not exists admin_email_campaigns_template_id_idx
  on public.admin_email_campaigns (template_id);

create index if not exists admin_email_campaigns_created_by_idx
  on public.admin_email_campaigns (created_by);

create index if not exists admin_email_campaigns_created_at_idx
  on public.admin_email_campaigns (created_at desc);

create index if not exists admin_email_deliveries_campaign_id_idx
  on public.admin_email_deliveries (campaign_id);

create index if not exists admin_email_deliveries_template_id_idx
  on public.admin_email_deliveries (template_id);

create index if not exists admin_email_deliveries_recipient_profile_id_idx
  on public.admin_email_deliveries (recipient_profile_id);

create index if not exists admin_email_deliveries_created_by_idx
  on public.admin_email_deliveries (created_by);

create index if not exists admin_email_deliveries_created_at_idx
  on public.admin_email_deliveries (created_at desc);

create index if not exists admin_email_deliveries_engagement_score_idx
  on public.admin_email_deliveries (engagement_score desc, last_engaged_at desc);

create index if not exists admin_email_events_delivery_id_idx
  on public.admin_email_events (delivery_id);

create index if not exists admin_email_events_recipient_profile_id_idx
  on public.admin_email_events (recipient_profile_id);

create index if not exists admin_email_events_event_type_idx
  on public.admin_email_events (event_type);

create index if not exists admin_email_events_created_at_idx
  on public.admin_email_events (created_at desc);

create index if not exists admin_email_preferences_profile_id_idx
  on public.admin_email_preferences (profile_id);

create index if not exists admin_email_schedules_template_id_idx
  on public.admin_email_schedules (template_id);

create index if not exists admin_email_schedules_created_by_idx
  on public.admin_email_schedules (created_by);

create index if not exists admin_email_schedules_updated_by_idx
  on public.admin_email_schedules (updated_by);

create index if not exists admin_email_schedules_created_at_idx
  on public.admin_email_schedules (created_at desc);

create index if not exists admin_email_suppressions_created_by_idx
  on public.admin_email_suppressions (created_by);

create index if not exists admin_email_templates_created_by_idx
  on public.admin_email_templates (created_by);

create index if not exists admin_email_templates_updated_by_idx
  on public.admin_email_templates (updated_by);

create index if not exists admin_email_trigger_rules_template_id_idx
  on public.admin_email_trigger_rules (template_id);

create index if not exists admin_email_trigger_rules_created_by_idx
  on public.admin_email_trigger_rules (created_by);
