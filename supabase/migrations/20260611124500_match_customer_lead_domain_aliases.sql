create or replace function public.find_customer_lead_duplicate(
  p_vendor_company_id uuid,
  p_customer_domain text
)
returns table (
  source_type text,
  record_id uuid,
  customer_name text,
  status text
)
language sql
security definer
set search_path = public
as $$
  with normalized_input as (
    select public.normalize_customer_domain(p_customer_domain) as domain
  ),
  input_company as (
    select domain.company_id
    from public.company_domains domain
    join normalized_input input on input.domain = domain.domain
    where input.domain is not null
    union
    select company.id
    from public.companies company
    join normalized_input input on input.domain = public.normalize_customer_domain(company.website)
    where input.domain is not null
    limit 1
  ),
  associated_domains as (
    select domain from normalized_input where domain is not null
    union
    select domain.domain
    from public.company_domains domain
    join input_company company on company.company_id = domain.company_id
    union
    select public.normalize_customer_domain(company.website)
    from public.companies company
    join input_company matched_company on matched_company.company_id = company.id
    where public.normalize_customer_domain(company.website) is not null
  ),
  target_matches as (
    select
      'CUSTOMER_TARGET'::text as source_type,
      target.id as record_id,
      coalesce(target_company.name, target.target_account_name) as customer_name,
      target.status
    from public.customer_targets target
    join public.companies target_company on target_company.id = target.target_company_id
    where target.client_company_id = p_vendor_company_id
      and (
        target.target_company_id in (select company_id from input_company)
        or public.normalize_customer_domain(target_company.website) in (select domain from associated_domains)
        or exists (
          select 1
          from public.company_domains target_domain
          where target_domain.company_id = target.target_company_id
            and target_domain.domain in (select domain from associated_domains)
        )
      )
    order by target.created_at desc
    limit 1
  ),
  lead_matches as (
    select
      'CUSTOMER_LEAD'::text as source_type,
      lead.id as record_id,
      lead.customer_company_name as customer_name,
      lead.status
    from public.reverse_opportunities lead
    where lead.vendor_company_id = p_vendor_company_id
      and lead.status <> 'CLOSED_LOST'
      and public.normalize_customer_domain(lead.customer_company_website) in (select domain from associated_domains)
    order by lead.created_at desc
    limit 1
  )
  select * from target_matches
  union all
  select * from lead_matches
  limit 1
$$;

grant execute on function public.find_customer_lead_duplicate(uuid, text) to anon, authenticated;
