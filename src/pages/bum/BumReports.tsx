import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportsWorkspace, type RecommendedReport } from "@/components/reports/ReportsWorkspace";
import { useAuth } from "@/contexts/AuthContext";
import {
  calculateTopLineSharePercent,
  listBumPayouts,
  listMarketplaceOpportunities,
  listOpportunityClaims,
  listOwnProspectRecommendations,
  listOwnReverseOpportunities,
} from "@/lib/portalApi";

function money(value?: number | null) {
  return Number(value ?? 0);
}

function statusLabel(value?: string | null) {
  return String(value ?? "").replace(/_/g, " " );
}

export default function BumReports() {
  const { user } = useAuth();
  const prospectsQuery = useQuery({
    queryKey: ["bum-reports-prospects", user?.id],
    queryFn: () => listOwnProspectRecommendations(user!.id),
    enabled: Boolean(user?.id),
  });
  const reverseOpportunitiesQuery = useQuery({
    queryKey: ["bum-reports-reverse-opportunities", user?.id],
    queryFn: () => listOwnReverseOpportunities(user!.id),
    enabled: Boolean(user?.id),
  });
  const marketplaceQuery = useQuery({
    queryKey: ["bum-reports-marketplace-opportunities"],
    queryFn: listMarketplaceOpportunities,
  });
  const claimsQuery = useQuery({
    queryKey: ["bum-reports-claims"],
    queryFn: () => listOpportunityClaims(),
  });
  const payoutsQuery = useQuery({
    queryKey: ["bum-reports-payouts"],
    queryFn: listBumPayouts,
  });

  const recommendations = useMemo<RecommendedReport[]>(() => {
    const prospects = prospectsQuery.data ?? [];
    const reverseOpportunities = reverseOpportunitiesQuery.data ?? [];
    const marketplace = marketplaceQuery.data ?? [];
    const claims = (claimsQuery.data ?? []).filter((claim) => claim.bum_user_id === user?.id);
    const payouts = (payoutsQuery.data ?? []).filter((payout) => payout.bum_user_id === user?.id);

    return [
      {
        id: "my-claim-pipeline",
        title: "My claim pipeline",
        description: "Claims you submitted, their current status, share, and contact coverage.",
        category: "Claims",
        dataLabel: "claim rows",
        rows: claims.map((claim) => ({
          opportunity: claim.opportunity_registrations?.target_account_name,
          contact: claim.contact_name,
          company: claim.contact_company,
          strength: claim.relationship_strength,
          status: statusLabel(claim.status),
          sharePercent: Number(claim.bum_share_percent ?? 0),
          topLinePercent: calculateTopLineSharePercent(
            claim.opportunity_registrations?.commission_rate,
            claim.bum_share_percent,
          ),
          createdAt: claim.created_at,
          expiresAt: claim.expires_at,
        })),
        columns: [
          { key: "opportunity", label: "Opportunity" },
          { key: "contact", label: "Contact" },
          { key: "company", label: "Company" },
          { key: "strength", label: "Strength" },
          { key: "status", label: "Status" },
          { key: "sharePercent", label: "Share %", align: "right" },
          { key: "topLinePercent", label: "Top-line %", align: "right" },
          { key: "expiresAt", label: "Expires" },
        ],
        dateKey: "createdAt",
        groupByKey: "status",
        groupByLabel: "claim status",
        valueLabel: "Claims",
      },
      {
        id: "earnings-and-payouts",
        title: "Earnings and payouts",
        description: "Payouts connected to your approved claims and paid Trusted Bums invoices.",
        category: "Earnings",
        dataLabel: "payout rows",
        rows: payouts.map((payout) => ({
          invoice: payout.claim_invoices?.invoice_number,
          claim: `${payout.opportunity_claims?.contact_name ?? "Contact"} @ ${payout.opportunity_claims?.contact_company ?? "Company"}`,
          status: statusLabel(payout.status),
          payoutAmount: money(payout.payout_amount),
          invoiceAmount: money(payout.claim_invoices?.invoice_amount),
          sharePercent: Number(payout.share_percent ?? 0),
          createdAt: payout.created_at,
          paidAt: payout.paid_at ?? "",
        })),
        columns: [
          { key: "invoice", label: "Invoice" },
          { key: "claim", label: "Claim" },
          { key: "status", label: "Status" },
          { key: "payoutAmount", label: "Payout", align: "right" },
          { key: "invoiceAmount", label: "Invoice amount", align: "right" },
          { key: "sharePercent", label: "Share %", align: "right" },
          { key: "paidAt", label: "Paid" },
        ],
        dateKey: "createdAt",
        groupByKey: "status",
        groupByLabel: "payout status",
        valueKey: "payoutAmount",
        valueLabel: "Payout amount",
      },
      {
        id: "marketplace-opportunity-watchlist",
        title: "Marketplace opportunity watchlist",
        description: "Accepted opportunities available for Bums to review and claim.",
        category: "Marketplace",
        dataLabel: "opportunity rows",
        rows: marketplace.map((opportunity) => ({
          opportunity: opportunity.target_account_name,
          client: opportunity.companies?.name,
          product: opportunity.expected_product_service,
          expectedValue: money(opportunity.estimated_deal_value),
          commissionRate: Number(opportunity.commission_rate ?? 0),
          timeline: opportunity.expected_timeline,
          createdAt: opportunity.created_at,
        })),
        columns: [
          { key: "opportunity", label: "Opportunity" },
          { key: "client", label: "Client" },
          { key: "product", label: "Product / service" },
          { key: "expectedValue", label: "Expected value", align: "right" },
          { key: "commissionRate", label: "Commission rate", align: "right" },
          { key: "timeline", label: "Timeline" },
        ],
        dateKey: "createdAt",
        groupByKey: "client",
        groupByLabel: "client",
        valueKey: "expectedValue",
        valueLabel: "Expected value",
      },
      {
        id: "prospect-client-submissions",
        title: "Prospect client submissions",
        description: "Companies you recommended as potential Trusted Bums clients.",
        category: "Prospecting",
        dataLabel: "prospect rows",
        rows: prospects.map((prospect) => ({
          company: prospect.companies?.name,
          website: prospect.companies?.website,
          status: statusLabel(prospect.status),
          inviteOwner: statusLabel(prospect.invite_owner),
          notes: prospect.notes,
          createdAt: prospect.created_at,
        })),
        columns: [
          { key: "company", label: "Company" },
          { key: "website", label: "Website" },
          { key: "status", label: "Status" },
          { key: "inviteOwner", label: "Invite owner" },
          { key: "notes", label: "Notes" },
        ],
        dateKey: "createdAt",
        groupByKey: "status",
        groupByLabel: "prospect status",
        valueLabel: "Prospects",
      },
      {
        id: "reverse-opportunity-submissions",
        title: "Customer lead submissions",
        description: "Customer demand you submitted for existing or prospective clients.",
        category: "Customer leads",
        dataLabel: "customer lead rows",
        rows: reverseOpportunities.map((opportunity) => ({
          client: opportunity.companies?.name,
          customer: opportunity.customer_company_name,
          status: statusLabel(opportunity.status),
          expectedValue: money(opportunity.estimated_deal_value),
          product: opportunity.expected_product_service,
          timeline: opportunity.expected_timeline,
          createdAt: opportunity.created_at,
        })),
        columns: [
          { key: "client", label: "Client" },
          { key: "customer", label: "Customer" },
          { key: "status", label: "Status" },
          { key: "expectedValue", label: "Expected value", align: "right" },
          { key: "product", label: "Product / service" },
          { key: "timeline", label: "Timeline" },
        ],
        dateKey: "createdAt",
        groupByKey: "status",
        groupByLabel: "customer lead status",
        valueKey: "expectedValue",
        valueLabel: "Expected value",
      },
    ];
  }, [
    claimsQuery.data,
    marketplaceQuery.data,
    payoutsQuery.data,
    prospectsQuery.data,
    reverseOpportunitiesQuery.data,
    user?.id,
  ]);

  return (
    <ReportsWorkspace
      title="Bum Reports"
      description="Create reports from your prospecting, claims, marketplace, and payout activity."
      recommendations={recommendations}
      isLoading={
        prospectsQuery.isLoading ||
        reverseOpportunitiesQuery.isLoading ||
        marketplaceQuery.isLoading ||
        claimsQuery.isLoading ||
        payoutsQuery.isLoading
      }
    />
  );
}
