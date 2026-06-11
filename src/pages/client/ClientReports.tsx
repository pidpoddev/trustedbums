import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportsWorkspace, type RecommendedReport } from "@/components/reports/ReportsWorkspace";
import { useAuth } from "@/contexts/AuthContext";
import { buildClientCombinedFinanceRows, buildClientFinanceReports } from "@/pages/client/clientReportsModel";
import {
  listClaimInvoices,
  listClientReverseOpportunities,
  listCustomerPaymentReports,
  listCustomerTargets,
  listOwnOpportunityRegistrations,
} from "@/lib/portalApi";

function money(value?: number | null) {
  return Number(value ?? 0);
}

function statusLabel(value?: string | null) {
  return String(value ?? "").replace(/_/g, " " );
}

const pipelineColumns = [
  { key: "account", label: "Account" },
  { key: "source", label: "Source" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "estimatedValue", label: "Estimated value", align: "right" as const },
  { key: "product", label: "Product / service" },
  { key: "createdAt", label: "Created" },
];

export default function ClientReports() {
  const { user } = useAuth();
  const accessRole = user?.role === "CLIENT" ? user.clientAccessRole ?? "CLIENT_ADMIN" : undefined;
  const canReadPipeline = accessRole === "CLIENT_ADMIN" || accessRole === "CLIENT_MEMBER";
  const canReadFinance = accessRole === "CLIENT_ADMIN" || accessRole === "CLIENT_FINANCE";

  const targetsQuery = useQuery({
    queryKey: ["client-reports-targets", user?.clientId],
    queryFn: () => listCustomerTargets(user),
    enabled: Boolean(user?.clientId) && canReadPipeline,
  });
  const opportunitiesQuery = useQuery({
    queryKey: ["client-reports-opportunities", user?.clientId],
    queryFn: () => listOwnOpportunityRegistrations(user!),
    enabled: Boolean(user?.clientId) && canReadPipeline,
  });
  const reverseOpportunitiesQuery = useQuery({
    queryKey: ["client-reports-reverse-opportunities", user?.clientId],
    queryFn: () => listClientReverseOpportunities(user!),
    enabled: Boolean(user?.clientId) && canReadPipeline,
  });
  const paymentsQuery = useQuery({
    queryKey: ["client-reports-payment-reports", user?.clientId],
    queryFn: () => listCustomerPaymentReports(user!),
    enabled: Boolean(user?.clientId) && canReadFinance,
  });
  const invoicesQuery = useQuery({
    queryKey: ["client-reports-invoices", user?.clientId],
    queryFn: () => listClaimInvoices(user!),
    enabled: Boolean(user?.clientId) && canReadFinance,
  });

  const recommendations = useMemo<RecommendedReport[]>(() => {
    const targets = targetsQuery.data ?? [];
    const opportunities = opportunitiesQuery.data ?? [];
    const reverseOpportunities = reverseOpportunitiesQuery.data ?? [];
    const payments = paymentsQuery.data ?? [];
    const invoices = invoicesQuery.data ?? [];

    if (accessRole === "CLIENT_FINANCE") {
      return buildClientFinanceReports({ payments, invoices });
    }

    const pipelineRows = [
      ...targets.map((target) => ({
        account: target.target_companies?.name ?? target.target_account_name,
        source: "Target account",
        status: statusLabel(target.status),
        priority: target.priority,
        estimatedValue: money(target.estimated_deal_value),
        product: target.expected_product_service,
        createdAt: target.created_at,
      })),
      ...opportunities.map((opportunity) => ({
        account: opportunity.target_account_name,
        source: "Registered opportunity",
        status: opportunity.status,
        priority: "—",
        estimatedValue: money(opportunity.estimated_deal_value),
        product: opportunity.expected_product_service,
        createdAt: opportunity.created_at,
      })),
    ];

    const reports: RecommendedReport[] = [
      {
        id: "target-account-pipeline",
        title: "Target account pipeline",
        description: "Target accounts by stage, priority, owner, and estimated deal value.",
        category: "Pipeline",
        dataLabel: "target rows",
        rows: targets.map((target) => ({
          account: target.target_companies?.name ?? target.target_account_name,
          status: statusLabel(target.status),
          priority: target.priority,
          estimatedValue: money(target.estimated_deal_value),
          product: target.expected_product_service,
          contact: target.key_contact_name,
          createdAt: target.created_at,
        })),
        columns: [
          { key: "account", label: "Account" },
          { key: "status", label: "Status" },
          { key: "priority", label: "Priority" },
          { key: "estimatedValue", label: "Estimated value", align: "right" },
          { key: "product", label: "Product / service" },
          { key: "contact", label: "Contact" },
          { key: "createdAt", label: "Created" },
        ],
        dateKey: "createdAt",
        groupByKey: "status",
        groupByLabel: "target status",
        valueKey: "estimatedValue",
        valueLabel: "Estimated value",
      },
      {
        id: "opportunity-registration-status",
        title: "Opportunity registration status",
        description: "Registered opportunities with terms, estimated value, and current admin status.",
        category: "Opportunities",
        dataLabel: "opportunity rows",
        rows: opportunities.map((opportunity) => ({
          account: opportunity.target_account_name,
          status: opportunity.status,
          estimatedValue: money(opportunity.estimated_deal_value),
          commissionRate: Number(opportunity.commission_rate ?? 0),
          product: opportunity.expected_product_service,
          contact: opportunity.client_contact,
          createdAt: opportunity.created_at,
        })),
        columns: [
          { key: "account", label: "Account" },
          { key: "status", label: "Status" },
          { key: "estimatedValue", label: "Estimated value", align: "right" },
          { key: "commissionRate", label: "Commission rate", align: "right" },
          { key: "product", label: "Product / service" },
          { key: "contact", label: "Contact" },
        ],
        dateKey: "createdAt",
        groupByKey: "status",
        groupByLabel: "registration status",
        valueKey: "estimatedValue",
        valueLabel: "Estimated value",
      },
      {
        id: "inbound-reverse-opportunities",
        title: "Inbound customer leads",
        description: "Customer needs submitted by Bums that point back to your company.",
        category: "Demand",
        dataLabel: "request rows",
        rows: reverseOpportunities.map((opportunity) => ({
          customer: opportunity.customer_company_name,
          status: statusLabel(opportunity.status),
          expectedValue: money(opportunity.estimated_deal_value),
          product: opportunity.expected_product_service,
          submittedBy: opportunity.profiles?.full_name ?? opportunity.profiles?.email,
          createdAt: opportunity.created_at,
        })),
        columns: [
          { key: "customer", label: "Customer" },
          { key: "status", label: "Status" },
          { key: "expectedValue", label: "Expected value", align: "right" },
          { key: "product", label: "Product / service" },
          { key: "submittedBy", label: "Submitted by" },
        ],
        dateKey: "createdAt",
        groupByKey: "status",
        groupByLabel: "customer lead status",
        valueKey: "expectedValue",
        valueLabel: "Expected value",
      },
      {
        id: "combined-marketplace-pipeline",
        title: "Combined marketplace pipeline",
        description: "Targets and registered opportunities in one pipeline view.",
        category: "Executive",
        dataLabel: "pipeline rows",
        rows: pipelineRows,
        columns: pipelineColumns,
        dateKey: "createdAt",
        groupByKey: "source",
        groupByLabel: "pipeline source",
        valueKey: "estimatedValue",
        valueLabel: "Estimated value",
      },
    ];

    if (canReadFinance) {
      const financeReport = buildClientCombinedFinanceRows({ payments, invoices });
      reports[3] = {
        id: "commission-and-invoices",
        title: "Customer Payment Reports and commission invoices",
        description: "Client-reported commissionable revenue alongside generated commission invoice amounts.",
        category: "Finance",
        dataLabel: "finance rows",
        rows: financeReport.rows,
        columns: financeReport.columns,
        dateKey: "businessDate",
        groupByKey: "type",
        groupByLabel: "record type",
        valueKey: "amount",
        valueLabel: "Amount",
      };
    }

    return reports;
  }, [
    accessRole,
    canReadFinance,
    invoicesQuery.data,
    opportunitiesQuery.data,
    paymentsQuery.data,
    reverseOpportunitiesQuery.data,
    targetsQuery.data,
  ]);

  const isLoading =
    targetsQuery.isLoading ||
    opportunitiesQuery.isLoading ||
    reverseOpportunitiesQuery.isLoading ||
    paymentsQuery.isLoading ||
    invoicesQuery.isLoading;

  return (
    <ReportsWorkspace
      title="Client Reports"
      description={`Create client-scoped reports for ${user?.companyName ?? "your workspace"} using the records your role can access.`}
      recommendations={recommendations}
      isLoading={isLoading}
    />
  );
}
