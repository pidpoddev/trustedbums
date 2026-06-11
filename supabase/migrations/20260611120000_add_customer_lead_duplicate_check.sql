create or replace function public.normalize_customer_domain(value text)
returns text
language sql
immutable
as $$
  select nullif(
    regexp_replace(
      regexp_replace(
        split_part(regexp_replace(lower(trim(coalesce(value, ''))), '^https?://', ''), '/', 1),
        '^www\.',
        ''
      ),
      '([?#].*)|(:\d+$)',
      ''
    ),
    ''
  )
$$;

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
  target_matches as (
    select
      'CUSTOMER_TARGET'::text as source_type,
      target.id as record_id,
      coalesce(target_company.name, target.target_account_name) as customer_name,
      target.status
    from public.customer_targets target
    join public.companies target_company on target_company.id = target.target_company_id
    cross join normalized_input input
    where target.client_company_id = p_vendor_company_id
      and input.domain is not null
      and public.normalize_customer_domain(target_company.website) = input.domain
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
    cross join normalized_input input
    where lead.vendor_company_id = p_vendor_company_id
      and input.domain is not null
      and lead.status <> 'CLOSED_LOST'
      and public.normalize_customer_domain(lead.customer_company_website) = input.domain
    order by lead.created_at desc
    limit 1
  )
  select * from target_matches
  union all
  select * from lead_matches
  limit 1
$$;

grant execute on function public.normalize_customer_domain(text) to anon, authenticated;
grant execute on function public.find_customer_lead_duplicate(uuid, text) to anon, authenticated;
