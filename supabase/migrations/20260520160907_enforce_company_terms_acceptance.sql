with duplicate_company_acceptances as (
  select
    ctid,
    row_number() over (
      partition by company_id, terms_version_id
      order by accepted_at asc, id asc
    ) as row_number
  from public.terms_acceptances
  where company_id is not null
)
delete from public.terms_acceptances acceptance
using duplicate_company_acceptances duplicate
where acceptance.ctid = duplicate.ctid
  and duplicate.row_number > 1;

create unique index if not exists terms_acceptances_company_version_idx
  on public.terms_acceptances (company_id, terms_version_id)
  where company_id is not null;
