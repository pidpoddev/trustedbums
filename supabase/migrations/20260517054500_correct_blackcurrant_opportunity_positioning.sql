with blackcurrant as (
  select id
  from public.companies
  where lower(name) = 'blackcurrant'
  limit 1
),
updated_targets as (
  update public.customer_targets target
  set expected_product_service = 'Energy infrastructure design for AI data centers',
      notes = 'BlackCurrant is looking for customers that need help designing energy infrastructure for data centers, especially AI data centers. Bums should surface warm paths to organizations planning, building, expanding, financing, or operating power-intensive data center infrastructure.',
      updated_at = now()
  from blackcurrant
  where target.client_company_id = blackcurrant.id
    and (
      target.expected_product_service = '566 Partner Target'
      or target.notes ilike '%566%'
      or target.notes ilike '%Partner Targets%'
    )
  returning target.client_company_id, target.target_account_name
)
update public.opportunity_registrations opportunity
set expected_product_service = 'Energy infrastructure design for AI data centers',
    opportunity_description = 'BlackCurrant is looking for customers that need help designing energy infrastructure for data centers, especially AI data centers. This target account may be a fit if they are planning, building, expanding, financing, or operating power-intensive data center infrastructure and need credible design or infrastructure support.',
    notes = concat_ws(
      E'\n',
      'Customer need: energy infrastructure design for data centers, especially AI data centers.',
      'Ideal paths: leaders involved in data center development, energy strategy, power procurement, infrastructure design, site selection, operations, finance, or executive sponsorship.',
      'Bums should request a claim only when they can provide a real intro, warm path, or actionable relationship context.',
      'Financial program: BlackCurrant Introduced Account Program - 10% / 36 months.',
      'Commission duration: 10% of Commissionable Receipts during the 36-month Commission Period after the Account Agreement is executed; payable within 14 days after BlackCurrant receives applicable cash; exclusions apply.'
    ),
    updated_at = now()
from blackcurrant
where opportunity.company_id = blackcurrant.id
  and (
    opportunity.expected_product_service = '566 Partner Target'
    or opportunity.notes ilike '%Generated from imported%'
    or opportunity.opportunity_description ilike 'BlackCurrant is seeking qualified relationship paths into%'
  );
