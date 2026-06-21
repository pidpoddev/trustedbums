create index if not exists legal_agreement_reviews_created_by_idx
  on public.legal_agreement_reviews (created_by)
  where created_by is not null;

create index if not exists legal_agreement_reviews_updated_by_idx
  on public.legal_agreement_reviews (updated_by)
  where updated_by is not null;

create index if not exists legal_agreement_review_events_created_by_idx
  on public.legal_agreement_review_events (created_by)
  where created_by is not null;
