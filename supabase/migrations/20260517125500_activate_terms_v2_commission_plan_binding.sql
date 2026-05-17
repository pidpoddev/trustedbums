update public.terms_versions
set is_active = false
where is_active = true
  and version <> 'v2';

insert into public.terms_versions (
  version,
  title,
  body,
  faq_body,
  is_active
)
values (
  'v2',
  'Trusted Bums Partner Terms',
  $$Trusted Bums provides business development support, strategic introductions, relationship facilitation, account access, and related services. By using the Client Portal, requesting introductions, registering opportunities, or accepting support from Trusted Bums, Client agrees that Trusted Bums’ introductions, account access, and relationship support create commercial value and may result in commission obligations as described below.

1. Services

Trusted Bums may assist Client with introductions, account strategy, relationship facilitation, opportunity support, meeting coordination, and business development activities. Trusted Bums does not guarantee that any customer will enter into an agreement, purchase services, or generate revenue.

2. Opportunity Registration

An opportunity may be registered when Trusted Bums introduces, identifies, facilitates, supports, or materially advances a relationship between Client and a target account. Registration may occur through the Client Portal, email, written notice, meeting notes, or other documented communication.

3. Introduced Accounts

An “Introduced Account” means any company, business unit, department, affiliate, subsidiary, channel, or related opportunity that Trusted Bums introduces to Client or materially helps Client pursue. Introduced Accounts include renewals, expansions, replacements, amendments, successor arrangements, and related business opportunities that substantially arise from the original introduction or support.

4. Commissionable Revenue

Client agrees to pay Trusted Bums the applicable commission percentage on amounts actually received by Client from an Introduced Account or related opportunity. Unless otherwise agreed in writing, commissionable revenue includes revenue from contracts, renewals, expansions, amendments, replacements, successor agreements, affiliates, related business units, and materially connected commercial arrangements.

Commissionable revenue excludes taxes, refunds, credits, chargebacks, and amounts not actually collected by Client.

5. Commission Rate and Period

The binding commission economics for a registered opportunity are the commission plan assigned to that Client and opportunity through the Trusted Bums platform, unless the parties sign a separate written agreement that expressly overrides that plan. The assigned commission plan controls the applicable commission percentages, tier schedule, duration, payment timing, exclusions, and related commercial mechanics for that opportunity.

If the assigned commission plan uses year-based commission tiers, the commission schedule starts on the date the first commission is paid to Trusted Bums for that opportunity. Later commissions are then calculated according to the applicable year of that schedule.

6. Payment and Reporting

Client will provide reasonable reporting sufficient to calculate commissions owed under the assigned commission plan. Unless the assigned commission plan or a separate signed agreement states otherwise, commissions are payable within fourteen (14) days after Client receives the applicable customer payment.

7. Non-Circumvention

Client agrees not to avoid, bypass, restructure, delay, reroute, or otherwise circumvent Trusted Bums’ commission rights. This includes routing business through affiliates, subsidiaries, alternative contracting entities, renamed projects, related business units, successor arrangements, or delayed transactions that substantially arise from a Trusted Bums introduction or support.

8. Client Responsibilities

Client remains responsible for its own products, services, pricing, proposals, contracts, delivery, customer success, legal compliance, and customer relationships. Trusted Bums is not responsible for Client’s delivery obligations to any customer.

9. Confidentiality

Each party may receive non-public business, customer, pricing, technical, strategic, or relationship information from the other. Each party agrees to use reasonable care to protect confidential information and to use it only for purposes related to the relationship.

10. No Guarantee

Trusted Bums does not guarantee customer meetings, contracts, revenue, customer approvals, procurement outcomes, or deal timing. Client acknowledges that Trusted Bums’ value is based on access, introductions, relationship leverage, and business development support.

11. Termination

Either party may stop future participation at any time. Termination does not eliminate commission obligations for Introduced Accounts, registered opportunities, or business relationships that arose before termination or substantially resulted from Trusted Bums’ introduction or support.

12. Limitation of Liability

Neither party will be liable for indirect, incidental, special, punitive, or consequential damages. Trusted Bums’ total liability will not exceed amounts paid to Trusted Bums by Client during the twelve months before the claim.

13. Governing Law

These terms are governed by the laws of the State of Delaware unless a separate signed agreement states otherwise.

14. Custom Terms

The parties may agree to custom commission plans, account-specific terms, enterprise schedules, or other written overrides. If an approved assigned commission plan or separate signed agreement conflicts with these Partner Terms, the approved assigned commission plan or separate signed agreement controls for that specific opportunity.$$,
  $$Q: Why does Trusted Bums receive commissions?
A: Trusted Bums creates value by helping clients access strategic accounts, build credibility, navigate relationships, and increase the likelihood of commercial success. When that support leads to revenue, Trusted Bums participates in the upside.

Q: What counts as an introduced opportunity?
A: An introduced opportunity includes any account, department, business unit, affiliate, or related opportunity that Trusted Bums introduces, identifies, facilitates, supports, or materially advances.

Q: What if we already knew the account?
A: If Client had a pre-existing active opportunity, Client should disclose that during registration. Trusted Bums and Client can then clarify whether Trusted Bums created new access, materially accelerated the opportunity, or should not receive commission rights.

Q: Why do commissions continue after the first introduction?
A: Enterprise relationships often grow over time. An initial introduction can lead to renewals, expansions, related business units, and successor arrangements. The terms are designed to keep incentives aligned as the account grows.

Q: What does non-circumvention mean?
A: It means Client cannot avoid commission obligations by moving the deal to another entity, delaying the transaction, renaming the opportunity, routing it through an affiliate, or closing substantially related business outside the original path.

Q: Does Trusted Bums guarantee deals?
A: No. Trusted Bums helps create access and improve opportunity quality, but customers make their own buying decisions.

Q: Can we negotiate custom terms?
A: Yes. Strategic accounts, enterprise clients, or unusual opportunities can use approved custom commission plans or separate written terms.

Q: What revenue is commissionable?
A: Revenue actually received by Client from an introduced or substantially related opportunity is commissionable, excluding taxes, refunds, credits, chargebacks, and uncollected amounts.

Q: What happens if we terminate our portal account?
A: Termination stops future participation but does not eliminate commission obligations for opportunities already introduced, registered, or materially supported by Trusted Bums.$$,
  true
)
on conflict (version) do update
set
  title = excluded.title,
  body = excluded.body,
  faq_body = excluded.faq_body,
  is_active = excluded.is_active;
