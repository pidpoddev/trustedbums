create or replace view public.claim_client_notification_previews
as
with claim_deliveries as (
  select
    delivery.*,
    (delivery.metadata->>'claim_id')::uuid as opportunity_claim_id
  from public.admin_email_deliveries delivery
  where delivery.template_slug = 'opportunity_claim_created_client'
    and delivery.metadata ? 'claim_id'
    and (delivery.metadata->>'claim_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
)
select distinct on (delivery.opportunity_claim_id)
  delivery.opportunity_claim_id,
  delivery.template_slug,
  delivery.subject,
  regexp_replace(
    replace(
      case
        when nullif(trim(coalesce(recipient.full_name, '')), '') is not null
          then replace(delivery.body, recipient.full_name, 'client team')
        else delivery.body
      end,
      delivery.recipient_email,
      'client team'
    ),
    '^Hi[[:space:]]+[^,]+,',
    'Hi client team,',
    'i'
  ) as body,
  delivery.status,
  delivery.sent_at,
  delivery.created_at
from claim_deliveries delivery
join public.opportunity_claims claim
  on claim.id = delivery.opportunity_claim_id
left join public.profiles recipient
  on recipient.id = delivery.recipient_profile_id
where (
    exists (
      select 1
      from public.profiles profile
      where profile.id = public.current_user_id()
        and (
          coalesce(profile.is_admin, false)
          or upper(coalesce(profile.role, '')) = 'ADMIN'
          or profile.company_id = claim.company_id
        )
    )
  )
order by delivery.opportunity_claim_id, delivery.created_at desc;

grant select on public.claim_client_notification_previews to authenticated;
