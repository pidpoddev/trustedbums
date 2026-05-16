begin;

insert into public.terms_versions (id, version, title, body, faq_body, is_active)
values (
  '00000000-0000-0000-0000-000000000002',
  'bum-v1',
  'Trusted Bums Connector Agreement',
  $$Trusted Bums allows approved connectors, introducers, and relationship owners to participate in the platform as "Bums." By using the Bum Portal, joining opportunities, or making introductions, you agree to the terms below.

1. Role of a Bum

A Bum helps create access, warm introductions, relationship context, or meeting opportunities between Trusted Bums clients and relevant target accounts. A Bum does not represent that they are acting as an employee, legal agent, broker-dealer, or exclusive representative of Trusted Bums unless separately agreed in writing.

2. Accuracy and Good Faith

You agree to act in good faith, provide accurate relationship information to the best of your knowledge, and avoid knowingly making misleading claims about your access, influence, or relationship strength.

3. Confidentiality

You may receive non-public information about clients, opportunities, products, pricing, target accounts, or strategic plans. You agree to keep that information confidential and use it only for legitimate participation in the Trusted Bums platform.

4. Respectful Conduct

You agree to communicate professionally, treat prospects and clients respectfully, and avoid harassment, spam, deceptive outreach, or behavior that could damage Trusted Bums or its clients.

5. Platform Rules

Trusted Bums may approve, reject, pause, or remove opportunities, claims, or accounts at its discretion. Participation in one opportunity does not guarantee participation in future opportunities.

6. Eligibility for Earnings

Any earnings, commissions, or payouts are subject to the underlying opportunity rules, client payments actually received, platform approval, dispute review, fraud prevention checks, and any tax or payout requirements requested by Trusted Bums.

7. No Guaranteed Compensation

Creating an account, reviewing opportunities, or proposing introductions does not guarantee approval, compensation, payouts, or continued access to the platform.

8. Compliance

You are responsible for complying with applicable laws, contractual restrictions, employer obligations, and non-disclosure obligations that may apply to your activities. You should not share information or make introductions you are not permitted to share or make.

9. Termination

Trusted Bums may suspend or terminate access for inactivity, misuse, misconduct, risk, compliance concerns, inaccurate information, or any other business reason. Termination does not guarantee or eliminate any payout unless separately determined by Trusted Bums under the applicable opportunity rules.

10. Limitation of Liability

Trusted Bums is not liable for indirect, incidental, special, punitive, or consequential damages arising from your use of the platform. Access is provided on an as-available basis.

11. Updates

Trusted Bums may update this Connector Agreement from time to time. Continued use of the platform after acceptance of updated terms constitutes agreement to the updated version.$$,
  $$Q: What is a Bum in Trusted Bums?
A: A Bum is a connector or introduction partner who helps create access, context, or meetings between clients and target accounts.

Q: Am I guaranteed payouts if I create an account?
A: No. Payouts depend on approved participation, the underlying opportunity terms, and successful downstream commercial events or platform approvals.

Q: Can I share confidential client information?
A: No. You must protect non-public information and only use it for legitimate platform participation.

Q: What if I am unsure whether I can make an introduction?
A: If you are uncertain because of employer rules, contractual limits, or confidentiality restrictions, you should not proceed until you are confident you are allowed to do so.

Q: Can Trusted Bums remove my access?
A: Yes. Trusted Bums may suspend or terminate access for misuse, compliance concerns, inaccurate information, or other platform risk reasons.$$,
  false
)
on conflict (version) do update
set title = excluded.title,
    body = excluded.body,
    faq_body = excluded.faq_body;

with duplicate_user_acceptances as (
  select
    ctid,
    row_number() over (
      partition by user_id, terms_version_id
      order by accepted_at desc, id desc
    ) as row_number
  from public.terms_acceptances
  where company_id is null
)
delete from public.terms_acceptances acceptance
using duplicate_user_acceptances duplicate
where acceptance.ctid = duplicate.ctid
  and duplicate.row_number > 1;

create unique index if not exists terms_acceptances_user_null_company_version_idx
  on public.terms_acceptances (user_id, terms_version_id)
  where company_id is null;

commit;
