import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationSource = readFileSync("supabase/migrations/20260612103000_add_opportunity_claim_contacts.sql", "utf8");
const innerCircleMigrationSource = readFileSync("supabase/migrations/20260618100000_add_inner_circle_contacts.sql", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const portalContactsFunctionSource = readFileSync("supabase/functions/portal-contacts/index.ts", "utf8");
const bumOpportunityDetailSource = readFileSync("src/pages/bum/BumOpportunityDetail.tsx", "utf8");
const bumClaimsSource = readFileSync("src/pages/bum/BumClaims.tsx", "utf8");
const clientClaimsSource = readFileSync("src/pages/client/ClientClaims.tsx", "utf8");

describe("opportunity claim stakeholders", () => {
  it("adds a first-class claim contact table with Data API grants and RLS", () => {
    expect(migrationSource).toContain("create table if not exists public.opportunity_claim_contacts");
    expect(migrationSource).toContain("buying_role text not null default 'OTHER'");
    expect(migrationSource).toContain("'DECISION_MAKER', 'PURCHASING_LEADER', 'TECHNICAL_LEADER', 'CHAMPION', 'BLOCKER', 'INFLUENCER', 'OTHER'");
    expect(migrationSource).toContain("grant select, insert, update on public.opportunity_claim_contacts to anon, authenticated");
    expect(migrationSource).toContain("alter table public.opportunity_claim_contacts enable row level security");
    expect(migrationSource).toContain('"Users can read relevant opportunity claim contacts"');
    expect(migrationSource).toContain('"Bums can create own opportunity claim contacts"');
    expect(innerCircleMigrationSource).toContain("alter table public.opportunity_claim_contacts");
    expect(innerCircleMigrationSource).toContain("add column if not exists is_inner_circle boolean not null default false");
  });

  it("keeps the legacy claim contact while inserting the stakeholder bundle", () => {
    expect(portalApiSource).toContain("export type OpportunityClaimContactBuyingRole");
    expect(portalApiSource).toContain("opportunity_claim_contacts?: OpportunityClaimContactRecord[]");
    expect(portalApiSource).toContain("contacts?: Array<{");
    expect(portalApiSource).toContain("canSponsorCall: boolean");
    expect(portalApiSource).toContain("Must be able to sponsor a call in order to claim.");
    expect(portalApiSource).toContain("function normalizedClaimContacts");
    expect(portalApiSource).toContain("applyInnerCircleDesignations");
    expect(portalApiSource).toContain('.from("opportunity_claim_contacts")');
    expect(portalApiSource).toContain("is_inner_circle: contact.isInnerCircle");
    expect(portalApiSource).toContain("data.opportunity_claim_contacts = contactRows ?? []");
    expect(portalApiSource).toContain("introduced_contacts");
  });

  it("lets a Bum submit multiple named buying stakeholders on one claim", () => {
    expect(bumOpportunityDetailSource).toContain("People you can introduce");
    expect(bumOpportunityDetailSource).toContain("Add every important stakeholder you know");
    expect(bumOpportunityDetailSource).toContain('value: "DECISION_MAKER", label: "Decision Maker"');
    expect(bumOpportunityDetailSource).toContain('value: "PURCHASING_LEADER", label: "Purchasing Leader"');
    expect(bumOpportunityDetailSource).toContain('value: "TECHNICAL_LEADER", label: "Technical / Development Leader"');
    expect(bumOpportunityDetailSource).toContain('value: "BLOCKER", label: "Blocker"');
    expect(bumOpportunityDetailSource).toContain("Neil leads development and may prefer to self-develop instead of buying.");
    expect(bumOpportunityDetailSource).toContain("I can sponsor a call with this customer");
    expect(bumOpportunityDetailSource).toContain("setCanSponsorCall(value === \"yes\")");
    expect(bumOpportunityDetailSource).toContain("Inner Circle contact");
    expect(bumOpportunityDetailSource).toContain("isInnerCircle: claimContact.isInnerCircle");
    expect(bumOpportunityDetailSource).toContain("contacts: normalizedContacts.map");
  });

  it("does not create a separate manual My Contacts row after a detail-page claim", () => {
    expect(bumOpportunityDetailSource).not.toContain("createBumRepresentedContact");
    expect(bumOpportunityDetailSource).toContain('queryClient.invalidateQueries({ queryKey: ["bum-represented-contacts", user?.id] })');
    expect(portalContactsFunctionSource).toContain('source_type: "OPPORTUNITY_CLAIM"');
  });

  it("requires call sponsorship before a Bum can submit a claim", () => {
    const bumOpportunitiesSource = readFileSync("src/pages/bum/BumOpportunities.tsx", "utf8");

    expect(bumOpportunitiesSource).toContain("I can sponsor a call with this customer");
    expect(bumOpportunitiesSource).toContain("canSponsorCall: responseForm.canSponsorCall");
    expect(bumOpportunitiesSource).toContain("!responseForm.canSponsorCall");
    expect(bumOpportunityDetailSource).toContain("canSponsorCall,");
    expect(bumOpportunityDetailSource).toContain("!canSponsorCall");
  });

  it("shows stakeholder bundles back to Bums and Clients after submission", () => {
    expect(bumOpportunityDetailSource).toContain("Introductions included");
    expect(bumClaimsSource).toContain("Introductions included");
    expect(clientClaimsSource).toContain("Stakeholders included in this claim");
    expect(clientClaimsSource).toContain("buyingRoleLabels[claimContact.buying_role]");
    expect(bumOpportunityDetailSource).toContain('claimContact.is_inner_circle ? <StatusBadge label="Inner Circle"');
    expect(bumClaimsSource).toContain('claimContact.is_inner_circle ? <StatusBadge label="Inner Circle"');
    expect(clientClaimsSource).toContain('claimContact.is_inner_circle ? <StatusBadge label="Inner Circle"');
  });
});
