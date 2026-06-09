create table if not exists public.potential_decision_maker_matches (
  id uuid primary key default gen_random_uuid(),
  client_company_id uuid not null references public.companies(id) on delete cascade,
  opportunity_registration_id uuid references public.opportunity_registrations(id) on delete cascade,
  customer_target_id uuid references public.customer_targets(id) on delete cascade,
  target_account_name text not null,
  person_name text not null,
  title text,
  company text,
  decision_maker_type text not null,
  primary_function text not null,
  score integer not null default 0,
  rating text not null,
  role_fit_score integer not null default 0,
  current_company_confidence_score integer not null default 0,
  opportunity_relevance_score integer not null default 0,
  seniority_access_score integer not null default 0,
  source_quality_score integer not null default 0,
  warm_path_potential_score integer not null default 0,
  evidence_summary text,
  source_urls text[] not null default '{}',
  linkedin_url_candidate text,
  linkedin_manual_check text not null default 'not_checked',
  current_company_verified text not null default 'uncertain',
  recommended_bum_ask text,
  outreach_risk text not null default 'medium',
  research_status text not null default 'RESEARCHED',
  source_label text not null default 'Research Bot',
  notes text,
  created_by text references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint potential_decision_maker_matches_score_check check (score between 0 and 100),
  constraint potential_decision_maker_matches_role_fit_score_check check (role_fit_score between 0 and 30),
  constraint potential_decision_maker_matches_current_company_confidence_score_check check (current_company_confidence_score between 0 and 20),
  constraint potential_decision_maker_matches_opportunity_relevance_score_check check (opportunity_relevance_score between 0 and 20),
  constraint potential_decision_maker_matches_seniority_access_score_check check (seniority_access_score between 0 and 10),
  constraint potential_decision_maker_matches_source_quality_score_check check (source_quality_score between 0 and 10),
  constraint potential_decision_maker_matches_warm_path_potential_score_check check (warm_path_potential_score between 0 and 10),
  constraint potential_decision_maker_matches_rating_check check (rating in ('Priority A', 'Priority B', 'Watchlist', 'Low confidence', 'Do not pursue')),
  constraint potential_decision_maker_matches_linkedin_manual_check_check check (linkedin_manual_check in ('not_checked', 'user_verified_current', 'user_verified_not_current', 'user_unsure')),
  constraint potential_decision_maker_matches_current_company_verified_check check (current_company_verified in ('yes', 'no', 'uncertain')),
  constraint potential_decision_maker_matches_outreach_risk_check check (outreach_risk in ('low', 'medium', 'high')),
  constraint potential_decision_maker_matches_research_status_check check (research_status in ('RESEARCHED', 'NEEDS_VERIFICATION', 'APPROVED', 'ARCHIVED'))
);

create index if not exists potential_decision_maker_matches_client_company_idx
  on public.potential_decision_maker_matches (client_company_id, rating, score desc);

create index if not exists potential_decision_maker_matches_opportunity_idx
  on public.potential_decision_maker_matches (opportunity_registration_id, score desc)
  where opportunity_registration_id is not null;

create index if not exists potential_decision_maker_matches_customer_target_idx
  on public.potential_decision_maker_matches (customer_target_id, score desc)
  where customer_target_id is not null;

create unique index if not exists potential_decision_maker_matches_unique_opportunity_person_idx
  on public.potential_decision_maker_matches (
    opportunity_registration_id,
    (lower(person_name)),
    (lower(coalesce(company, '')))
  )
  where opportunity_registration_id is not null;

drop trigger if exists set_potential_decision_maker_matches_updated_at on public.potential_decision_maker_matches;
create trigger set_potential_decision_maker_matches_updated_at
before update on public.potential_decision_maker_matches
for each row execute function public.set_updated_at();

alter table public.potential_decision_maker_matches enable row level security;

grant select, insert, update, delete on public.potential_decision_maker_matches to anon, authenticated;

drop policy if exists "Admins can manage potential decision maker matches" on public.potential_decision_maker_matches;
create policy "Admins can manage potential decision maker matches"
on public.potential_decision_maker_matches for all
to anon, authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "Clients can read own potential decision maker matches" on public.potential_decision_maker_matches;
create policy "Clients can read own potential decision maker matches"
on public.potential_decision_maker_matches for select
to anon, authenticated
using (client_company_id = private.current_company_id());

drop policy if exists "Bums can read accepted opportunity decision maker matches" on public.potential_decision_maker_matches;
create policy "Bums can read accepted opportunity decision maker matches"
on public.potential_decision_maker_matches for select
to anon, authenticated
using (
  private.is_bum()
  and exists (
    select 1
    from public.opportunity_registrations opportunity
    where opportunity.id = public.potential_decision_maker_matches.opportunity_registration_id
      and opportunity.status = 'Accepted'
  )
);

with blackcurrant as (
  select id
  from public.companies
  where lower(name) = 'blackcurrant'
), researched_matches as (
  select *
  from (
    values
      ('Crusoe', 'John Adams', 'SVP, Power Infrastructure', 'Crusoe', 'technical buyer', 'energy', 98, 'Priority A', 30, 20, 20, 8, 10, 10, 'Crusoe lists John Adams as SVP, Power Infrastructure; Crusoe also announced the role to accelerate on-site energy development for AI data centers.', array['https://www.crusoe.ai/about/leadership', 'https://www.crusoe.ai/'], 'https://www.linkedin.com/in/johnmadams1', 'yes', 'Energy development, on-site generation, utility, project finance, or former Crusoe/energy-infrastructure paths.', 'low', 'Research Bot', 'Public-search LinkedIn URL candidate; manual LinkedIn verification not performed.'),
      ('Coreweave (Oracle)', 'Sachin Jain', 'Chief Operating Officer', 'CoreWeave', 'economic buyer | technical buyer', 'operations', 98, 'Priority A', 30, 20, 20, 10, 10, 8, 'CoreWeave lists Sachin Jain as COO since August 2024 and notes prior Oracle Cloud responsibility for AI infrastructure, data center capacity, and infrastructure product teams.', array['https://www.coreweave.com/leadership/sachin-jain', 'https://www.coreweave.com/ai-data-centers'], 'https://www.linkedin.com/in/jainsachin', 'yes', 'Oracle Cloud, Google Cloud, AI infrastructure, data-center capacity planning, and executive operations routes.', 'medium', 'Research Bot', 'Public-search LinkedIn URL candidate; manual LinkedIn verification not performed.'),
      ('QTS (see Blackstone)', 'David Robey', 'Co-Chief Executive Officer', 'QTS', 'economic buyer | executive sponsor', 'operations', 96, 'Priority A', 28, 20, 20, 10, 10, 8, 'QTS lists David Robey as Co-CEO and says he previously oversaw development and facility operations as COO; QTS reports 75 data centers in operation or development and more than 3GW of contracted power capacity.', array['https://q.com/our-leadership/'], 'https://www.linkedin.com/in/david-robey-qts', 'yes', 'QTS facilities, engineering, hyperscale customer delivery, Blackstone, or data-center operations routes.', 'medium', 'Research Bot', 'Public-search LinkedIn URL candidate; manual LinkedIn verification not performed.'),
      ('Crusoe', 'Chris Dolan', 'Chief Data Center Officer', 'Crusoe', 'technical buyer', 'data center development', 96, 'Priority A', 30, 20, 20, 8, 10, 8, 'Crusoe lists Chris Dolan as Chief Data Center Officer; Crusoe emphasizes energy-first AI data centers and power-to-deployment control.', array['https://www.crusoe.ai/about/leadership', 'https://www.crusoe.ai/data-centers'], 'https://www.linkedin.com/in/chris-dolan-a8b5922bb', 'yes', 'Data-center development, operations, construction, AI factory, or former Crusoe/customer/vendor paths.', 'low', 'Research Bot', 'Public-search LinkedIn URL candidate; manual LinkedIn verification not performed.'),
      ('Vantage Data Centers', 'Dana Adams', 'President, North America', 'Vantage Data Centers', 'economic buyer | executive sponsor', 'data center development', 96, 'Priority A', 30, 20, 20, 8, 10, 8, 'Vantage lists Dana Adams as president of North America overseeing market development, sales, construction, and operations; Vantage quoted Adams on scalable power as critical for hyperscale growth.', array['https://vantage-dc.com/company/leadership/', 'https://vantage-dc.com/news/vantage-data-centers-and-liberty-energy-announce-strategic-partnership-to-develop-and-operate-one-gigawatt-of-power-solutions-for-next-generation-data-centers/'], 'https://www.linkedin.com/in/dana-adams-dcs', 'yes', 'Vantage North America, Liberty Energy, utility-scale power, hyperscale campus development, or data-center construction routes.', 'low', 'Research Bot', 'Public-search LinkedIn URL candidate; manual LinkedIn verification not performed.'),
      ('Coreweave (Oracle)', 'Brian Venturo', 'Chief Strategy Officer, Co-founder', 'CoreWeave', 'executive sponsor | route-builder', 'strategy', 94, 'Priority A', 28, 20, 18, 10, 10, 8, 'CoreWeave lists Brian Venturo as CSO and co-founder; his bio includes prior CTO role and energy/emissions investing experience.', array['https://www.coreweave.com/leadership/brian-venturo', 'https://www.coreweave.com/ai-data-centers'], 'https://www.linkedin.com/in/brian-venturo-6719b812', 'yes', 'Founder, strategy, GPU cloud, energy finance, natural gas, or AI-infrastructure investor routes.', 'medium', 'Research Bot', 'Public-search LinkedIn URL candidate; manual LinkedIn verification not performed.'),
      ('Crusoe', 'Matt Field', 'Chief Real Estate Officer', 'Crusoe', 'technical buyer | route-builder', 'site selection', 92, 'Priority A', 28, 20, 18, 8, 10, 8, 'Crusoe lists Matt Field as Chief Real Estate Officer; Crusoe stresses site footprint, power, and independent power solutions.', array['https://www.crusoe.ai/about/leadership', 'https://www.crusoe.ai/data-centers'], 'https://www.linkedin.com/in/matt-field-b124b6b', 'yes', 'Land, site acquisition, development, project finance, and local utility/economic-development routes.', 'low', 'Research Bot', 'Public-search LinkedIn URL candidate; manual LinkedIn verification not performed.'),
      ('Vantage Data Centers', 'Jeff Tench', 'Global EVP', 'Vantage Data Centers', 'executive sponsor | influencer', 'global growth', 84, 'Priority B', 22, 20, 16, 8, 10, 8, 'Vantage lists Jeff Tench as global EVP responsible for accelerating growth in EMEA and APAC and overseeing global functions including product development and public policy.', array['https://vantage-dc.com/company/leadership/'], 'https://www.linkedin.com/in/jeff-tench-41a1541', 'yes', 'EMEA/APAC expansion, public policy, product development, hyperscale growth, or regional development routes.', 'medium', 'Research Bot', 'Public-search LinkedIn URL candidate is lower confidence than official Vantage source; manual LinkedIn verification not performed.'),
      ('Crusoe', 'Michael Gordon', 'Chief Operating Officer and Chief Financial Officer', 'Crusoe', 'economic buyer | executive sponsor', 'operations', 82, 'Priority B', 22, 20, 16, 10, 10, 4, 'Crusoe lists Michael Gordon as COO and CFO; Crusoe''s data center model is capital- and energy-infrastructure intensive.', array['https://www.crusoe.ai/about/leadership', 'https://www.crusoe.ai/data-centers'], 'https://www.linkedin.com/in/mgnyc', 'yes', 'Finance, infrastructure funding, operational scaling, or executive routes.', 'medium', 'Research Bot', 'Public-search LinkedIn URL candidate; manual LinkedIn verification not performed.'),
      ('QTS (see Blackstone)', 'Tag Greason', 'Co-Chief Executive Officer', 'QTS', 'economic buyer | executive sponsor', 'growth', 82, 'Priority B', 22, 20, 16, 10, 10, 4, 'QTS lists Tag Greason as Co-CEO with prior Chief Growth Officer responsibility for external activities, customer engagement, and European expansion.', array['https://q.com/our-leadership/'], 'https://www.linkedin.com/in/tag-greason', 'yes', 'Blackstone/QTS executive routes, customer growth, European expansion, or hyperscale customer relationships.', 'medium', 'Research Bot', 'Public-search LinkedIn URL candidate; manual LinkedIn verification not performed.'),
      ('Vantage Data Centers', 'Sureel Choksi', 'President and CEO', 'Vantage Data Centers', 'economic buyer | executive sponsor', 'corporate strategy', 80, 'Priority B', 20, 20, 14, 10, 10, 6, 'Vantage lists Sureel Choksi as president and CEO responsible for vision, strategy, and overall leadership.', array['https://vantage-dc.com/company/leadership/'], 'https://www.linkedin.com/in/sureelchoksi', 'yes', 'Board, investor, executive, or long-standing Vantage leadership routes.', 'medium', 'Research Bot', 'Public-search LinkedIn URL candidate; manual LinkedIn verification not performed.')
  ) as match_data (
    target_account_name,
    person_name,
    title,
    company,
    decision_maker_type,
    primary_function,
    score,
    rating,
    role_fit_score,
    current_company_confidence_score,
    opportunity_relevance_score,
    seniority_access_score,
    source_quality_score,
    warm_path_potential_score,
    evidence_summary,
    source_urls,
    linkedin_url_candidate,
    current_company_verified,
    recommended_bum_ask,
    outreach_risk,
    source_label,
    notes
  )
), matched_rows as (
  select
    blackcurrant.id as client_company_id,
    opportunity.id as opportunity_registration_id,
    target.id as customer_target_id,
    researched_matches.*
  from researched_matches
  cross join blackcurrant
  left join public.opportunity_registrations opportunity
    on opportunity.company_id = blackcurrant.id
   and opportunity.target_account_name = researched_matches.target_account_name
  left join public.customer_targets target
    on target.client_company_id = blackcurrant.id
   and target.target_account_name = researched_matches.target_account_name
)
insert into public.potential_decision_maker_matches (
  client_company_id,
  opportunity_registration_id,
  customer_target_id,
  target_account_name,
  person_name,
  title,
  company,
  decision_maker_type,
  primary_function,
  score,
  rating,
  role_fit_score,
  current_company_confidence_score,
  opportunity_relevance_score,
  seniority_access_score,
  source_quality_score,
  warm_path_potential_score,
  evidence_summary,
  source_urls,
  linkedin_url_candidate,
  linkedin_manual_check,
  current_company_verified,
  recommended_bum_ask,
  outreach_risk,
  research_status,
  source_label,
  notes
)
select
  client_company_id,
  opportunity_registration_id,
  customer_target_id,
  target_account_name,
  person_name,
  title,
  company,
  decision_maker_type,
  primary_function,
  score,
  rating,
  role_fit_score,
  current_company_confidence_score,
  opportunity_relevance_score,
  seniority_access_score,
  source_quality_score,
  warm_path_potential_score,
  evidence_summary,
  source_urls,
  linkedin_url_candidate,
  'not_checked',
  current_company_verified,
  recommended_bum_ask,
  outreach_risk,
  'RESEARCHED',
  source_label,
  notes
from matched_rows
where opportunity_registration_id is not null
  and not exists (
    select 1
    from public.potential_decision_maker_matches existing
    where existing.opportunity_registration_id = matched_rows.opportunity_registration_id
      and lower(existing.person_name) = lower(matched_rows.person_name)
      and lower(coalesce(existing.company, '')) = lower(coalesce(matched_rows.company, ''))
  );
