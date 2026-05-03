insert into public.terms_versions (id, version, title, body, faq_body, is_active)
select
  id,
  version,
  title,
  body,
  faq_body,
  is_active
from public.terms_versions
where version = 'v1'
on conflict (version) do nothing;
