revoke all on public.claim_client_notification_previews from public;
revoke all on public.claim_client_notification_previews from anon;
revoke all on public.claim_client_notification_previews from authenticated;
grant select on public.claim_client_notification_previews to authenticated;
