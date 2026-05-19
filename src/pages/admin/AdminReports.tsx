import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportsWorkspace, type RecommendedReport } from "@/components/reports/ReportsWorkspace";
import {
  listAdminBumProfiles,
  listAdminEmailDeliveries,
  listAdminProspectRecommendations,
  listAdminReverseOpportunities,
  listAuditEvents,
  listBumPayouts,
  listClaimInvoices,
  listCompanies,
  listCustomerPaymentReports,
  listCustomerTargets,
  listOpportunityClaims,
  listOpportunityRegistrations,
  listProfiles,
  listTermsAcceptances,
} from "@/lib/portalApi";

function money(value?: number | null) {
  return Number(value ?? 0);
}

function statusLabel(value?: string | null) {
  return String(value ?? "").replace(/_/g, " " );
}

export default function AdminReports() {
  const companiesQuery = useQuery({ queryKey: ["admin-reports-companies"], queryFn: listCompanies });
  const profilesQuery = useQuery({ queryKey: ["admin-reports-profiles"], queryFn: listProfiles });
  const bumProfilesQuery = useQuery({ queryKey: ["admin-reports-bum-profiles"], queryFn: listAdminBumProfiles });
  const targetsQuery = useQuery({ queryKey: ["admin-reports-targets"], queryFn: () => listCustomerTargets(null) });
  const opportunitiesQuery = useQuery({ queryKey: ["admin-reports-opportunities"], queryFn: () => listOpportunityRegistrations() });
  const claimsQuery = useQuery({ queryKey: ["admin-reports-claims"], queryFn: () => listOpportunityClaims() });
  const paymentsQuery = useQuery({ queryKey: ["admin-reports-payment-reports"], queryFn: () => listCustomerPaymentReports() });
  const invoicesQuery = useQuery({ queryKey: ["admin-reports-invoices"], queryFn: () => listClaimInvoices() });
  const payoutsQuery = useQuery({ queryKey: ["admin-reports-payouts"], queryFn: listBumPayouts });
  const prospectsQuery = useQuery({ queryKey: ["admin-reports-prospects"], queryFn: listAdminProspectRecommendations });
  const reverseOpportunitiesQuery = useQuery({ queryKey: ["admin-reports-reverse-opportunities"], queryFn: listAdminReverseOpportunities });
  const termsAcceptancesQuery = useQuery({ queryKey: ["admin-reports-terms-acceptances"], queryFn: listTermsAcceptances });
  const auditQuery = useQuery({ queryKey: ["admin-reports-audit-events"], queryFn: listAuditEvents });
  const emailDeliveriesQuery = useQuery({ queryKey: ["admin-reports-email-deliveries"], queryFn: listAdminEmailDeliveries });

  const recommendations = useMemo<RecommendedReport[]>(() => {
    const companies = companiesQuery.data ?? [];
    const profiles = profilesQuery.data ?? [];
    const bumProfiles = bumProfilesQuery.data ?? [];
    const targets = targetsQuery.data ?? [];
    const opportunities = opportunitiesQuery.data ?? [];
    const claims = claimsQuery.data ?? [];
    const payments = paymentsQuery.data ?? [];
    const invoices = invoicesQuery.data ?? [];
    const payouts = payoutsQuery.data ?? [];
    const prospects = prospectsQuery.data ?? [];
    const reverseOpportunities = reverseOpportunitiesQuery.data ?? [];
    const termsAcceptances = termsAcceptancesQuery.data ?? [];
    const auditEvents = auditQuery.data ?? [];
    const emailDeliveries = emailDeliveriesQuery.data ?? [];

    return [
      {
        id: "marketplace-health",
        title: "Marketplace health",
        description: "Top-level operating report across companies, users, targets, opportunities, and claims.",
        category: "Executive",
        dataLabel: "health rows",
        rows: [
          ...companies.map((company) => ({
            record: company.name,
            type: "Company",
            status: company.relationship_stage,
            value: 1,
            owner: "",
            createdAt: company.created_at,
          })),
          ...profiles.map((profile) => ({
            record: profile.full_name ?? profile.email,
            type: "User",
            status: profile.role ?? "UNKNOWN",
            value: 1,
            owner: profile.companies?.name,
            createdAt: profile.created_at,
          })),
          ...targets.map((target) => ({
            record: target.target_companies?.name ?? target.target_account_name,
            type: "Target",
            status: statusLabel(target.status),
            value: money(target.estimated_deal_value),
            owner: target.client_companies?.name,
            createdAt: target.created_at,
          })),
          ...opportunities.map((opportunity) => ({
            record: opportunity.target_account_name,
            type: "Opportunity",
            status: opportunity.status,
            value: money(opportunity.estimated_deal_value),
            owner: opportunity.companies?.name,
            createdAt: opportunity.created_at,
          })),
          ...claims.map((claim) => ({
            record: claim.contact_company,
            type: "Claim",
            status: statusLabel(claim.status),
            value: Number(claim.bum_share_percent ?? 0),
            owner: claim.profiles?.full_name ?? claim.profiles?.email,
            createdAt: claim.created_at,
          })),
        ],
        columns: [
          { key: "record", label: "Record" },
          { key: "type", label: "Type" },
          { key: "status", label: "Status" },
          { key: "owner", label: "Owner" },
          { key: "value", label: "Value", align: "right" },
          { key: "createdAt", label: "Created" },
        ],
        dateKey: "createdAt",
        groupByKey: "type",
        groupByLabel: "record type",
        valueLabel: "Records",
      },
      {
        id: "client-pipeline",
        title: "Client pipeline",
        description: "Client target accounts and opportunity registrations by company, stage, and estimated value.",
        category: "Pipeline",
        dataLabel: "pipeline rows",
        rows: [
          ...targets.map((target) => ({
            client: target.client_companies?.name,
            account: target.target_companies?.name ?? target.target_account_name,
            source: "Target",
            status: statusLabel(target.status),
            priority: target.priority,
            estimatedValue: money(target.estimated_deal_value),
            createdAt: target.created_at,
          })),
          ...opportunities.map((opportunity) => ({
            client: opportunity.companies?.name,
            account: opportunity.target_account_name,
            source: "Opportunity",
            status: opportunity.status,
            priority: "—",
            estimatedValue: money(opportunity.estimated_deal_value),
            createdAt: opportunity.created_at,
          })),
        ],
        columns: [
          { key: "client", label: "Client" },
          { key: "account", label: "Account" },
          { key: "source", label: "Source" },
          { key: "status", label: "Status" },
          { key: "priority", label: "Priority" },
          { key: "estimatedValue", label: "Estimated value", align: "right" },
          { key: "createdAt", label: "Created" },
        ],
        dateKey: "createdAt",
        groupByKey: "status",
        groupByLabel: "pipeline status",
        valueKey: "estimatedValue",
        valueLabel: "Estimated value",
      },
      {
        id: "bum-performance",
        title: "Bum performance",
        description: "Bum profile readiness, prospecting, claims, and payout signals.",
        category: "Bums",
        dataLabel: "Bum rows",
        rows: [
          ...bumProfiles.map((profile) => ({
            bum: profile.profiles?.full_name ?? profile.profiles?.email,
            type: "Profile",
            status: profile.verification_status,
            availability: profile.availability_status,
            value: Number(profile.years_experience ?? 0),
            createdAt: profile.created_at,
          })),
          ...prospects.map((prospect) => ({
            bum: prospect.profiles?.full_name ?? prospect.profiles?.email,
            type: "Prospect",
            status: statusLabel(prospect.status),
            availability: "",
            value: 1,
            createdAt: prospect.created_at,
          })),
          ...claims.map((claim) => ({
            bum: claim.profiles?.full_name ?? claim.profiles?.email,
            type: "Claim",
            status: statusLabel(claim.status),
            availability: claim.relationship_strength,
            value: Number(claim.bum_share_percent ?? 0),
            createdAt: claim.created_at,
          })),
          ...payouts.map((payout) => ({
            bum: payout.profiles?.full_name ?? payout.profiles?.email,
            type: "Payout",
            status: statusLabel(payout.status),
            availability: "",
            value: money(payout.payout_amount),
            createdAt: payout.created_at,
          })),
        ],
        columns: [
          { key: "bum", label: "Bum" },
          { key: "type", label: "Type" },
          { key: "status", label: "Status" },
          { key: "availability", label: "Signal" },
          { key: "value", label: "Value", align: "right" },
          { key: "createdAt", label: "Created" },
        ],
        dateKey: "createdAt",
        groupByKey: "type",
        groupByLabel: "Bum signal",
        valueLabel: "Rows",
      },
      {
        id: "finance-operations",
        title: "Finance operations",
        description: "Payment reports, claim invoices, and Bum payouts in one finance queue.",
        category: "Finance",
        dataLabel: "finance rows",
        rows: [
          ...payments.map((payment) => ({
            record: payment.customer_name,
            type: "Payment",
            company: payment.companies?.name,
            status: statusLabel(payment.status),
            amount: money(payment.commissionable_amount),
            createdAt: payment.created_at,
          })),
          ...invoices.map((invoice) => ({
            record: invoice.invoice_number,
            type: "Invoice",
            company: invoice.companies?.name,
            status: invoice.status,
            amount: money(invoice.invoice_amount),
            createdAt: invoice.created_at,
          })),
          ...payouts.map((payout) => ({
            record: payout.claim_invoices?.invoice_number,
            type: "Payout",
            company: payout.profiles?.full_name ?? payout.profiles?.email,
            status: statusLabel(payout.status),
            amount: money(payout.payout_amount),
            createdAt: payout.created_at,
          })),
        ],
        columns: [
          { key: "record", label: "Record" },
          { key: "type", label: "Type" },
          { key: "company", label: "Company / Bum" },
          { key: "status", label: "Status" },
          { key: "amount", label: "Amount", align: "right" },
          { key: "createdAt", label: "Created" },
        ],
        dateKey: "createdAt",
        groupByKey: "type",
        groupByLabel: "finance record type",
        valueKey: "amount",
        valueLabel: "Amount",
      },
      {
        id: "compliance-and-engagement",
        title: "Compliance and engagement",
        description: "Terms acceptance, audit activity, reverse opportunities, and email delivery records.",
        category: "Governance",
        dataLabel: "governance rows",
        rows: [
          ...termsAcceptances.map((acceptance) => ({
            record: acceptance.profiles?.full_name ?? acceptance.profiles?.email,
            type: "Terms",
            status: acceptance.terms_versions?.version,
            owner: acceptance.companies?.name,
            value: 1,
            createdAt: acceptance.accepted_at,
          })),
          ...auditEvents.map((event) => ({
            record: event.event_type,
            type: "Audit",
            status: event.entity_type,
            owner: event.profiles?.full_name ?? event.profiles?.email,
            value: 1,
            createdAt: event.created_at,
          })),
          ...reverseOpportunities.map((opportunity) => ({
            record: opportunity.customer_company_name,
            type: "Reverse opportunity",
            status: statusLabel(opportunity.status),
            owner: opportunity.profiles?.full_name ?? opportunity.profiles?.email,
            value: money(opportunity.estimated_deal_value),
            createdAt: opportunity.created_at,
          })),
          ...emailDeliveries.map((delivery) => ({
            record: delivery.subject,
            type: "Email",
            status: delivery.status,
            owner: delivery.recipient_email,
            value: delivery.engagement_score,
            createdAt: delivery.created_at,
          })),
        ],
        columns: [
          { key: "record", label: "Record" },
          { key: "type", label: "Type" },
          { key: "status", label: "Status" },
          { key: "owner", label: "Owner" },
          { key: "value", label: "Value", align: "right" },
          { key: "createdAt", label: "Created" },
        ],
        dateKey: "createdAt",
        groupByKey: "type",
        groupByLabel: "governance type",
        valueLabel: "Records",
      },
    ];
  }, [
    auditQuery.data,
    bumProfilesQuery.data,
    claimsQuery.data,
    companiesQuery.data,
    emailDeliveriesQuery.data,
    invoicesQuery.data,
    opportunitiesQuery.data,
    paymentsQuery.data,
    payoutsQuery.data,
    profilesQuery.data,
    prospectsQuery.data,
    reverseOpportunitiesQuery.data,
    targetsQuery.data,
    termsAcceptancesQuery.data,
  ]);

  const isLoading = [
    companiesQuery,
    profilesQuery,
    bumProfilesQuery,
    targetsQuery,
    opportunitiesQuery,
    claimsQuery,
    paymentsQuery,
    invoicesQuery,
    payoutsQuery,
    prospectsQuery,
    reverseOpportunitiesQuery,
    termsAcceptancesQuery,
    auditQuery,
    emailDeliveriesQuery,
  ].some((query) => query.isLoading);

  return (
    <ReportsWorkspace
      title="Admin Reports"
      description="Create marketplace-wide reports across clients, Bums, pipeline, finance, and governance."
      recommendations={recommendations}
      isLoading={isLoading}
    />
  );
}
