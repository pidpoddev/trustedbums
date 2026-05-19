import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportsWorkspace, type RecommendedReport } from "@/components/reports/ReportsWorkspace";
import { useAuth } from "@/contexts/AuthContext";
import {
  listClaimInvoices,
  listClientReverseOpportunities,
  listCustomerPaymentReports,
  listCustomerTargets,
  listOwnOpportunityRegistrations,
  listVisibleBumProfiles,
} from "@/lib/portalApi";

function date(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "";
}

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
  const bumProfilesQuery = useQuery({
    queryKey: ["client-reports-bum-profiles"],
    queryFn: listVisibleBumProfiles,
    enabled: canReadPipeline,
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
    const profiles = bumProfilesQuery.data ?? [];
    const payments = paymentsQuery.data ?? [];
    const invoices = invoicesQuery.data ?? [];

    if (accessRole === "CLIENT_FINANCE") {
      return [
        {
          id: "customer-payment-ledger",
          title: "Customer payment ledger",
          description: "Customer payments reported for commission calculation and invoice generation.",
          category: "Finance",
          dataLabel: "payment rows",
          rows: payments.map((payment) => ({
            customer: payment.customer_name,
            opportunity: payment.opportunity_registrations?.target_account_name,
            status: statusLabel(payment.status),
            grossAmount: money(payment.gross_amount),
            commissionableAmount: money(payment.commissionable_amount),
            excludedAmount: money(payment.excluded_amount),
            receivedAt: date(payment.customer_payment_received_at),
            createdAt: payment.created_at,
          })),
          columns: [
            { key: "customer", label: "Customer" },
            { key: "opportunity", label: "Opportunity" },
            { key: "status", label: "Status" },
            { key: "grossAmount", label: "Gross amount", align: "right" },
            { key: "commissionableAmount", label: "Commissionable", align: "right" },
            { key: "excludedAmount", label: "Excluded", align: "right" },
            { key: "receivedAt", label: "Received" },
          ],
          dateKey: "createdAt",
          groupByKey: "status",
          groupByLabel: "payment status",
          valueKey: "commissionableAmount",
          valueLabel: "Commissionable amount",
        },
        {
          id: "invoice-register",
          title: "Invoice register",
          description: "Generated Trusted Bums invoices by status, customer, and opportunity.",
          category: "Finance",
          dataLabel: "invoice rows",
          rows: invoices.map((invoice) => ({
            invoice: invoice.invoice_number,
            customer: invoice.customer_payment_reports?.customer_name,
            opportunity: invoice.opportunity_registrations?.target_account_name,
            status: invoice.status,
            invoiceAmount: money(invoice.invoice_amount),
            commissionRate: Number(invoice.commission_rate ?? 0),
            generatedAt: invoice.generated_at,
            paidAt: date(invoice.paid_at),
          })),
          columns: [
            { key: "invoice", label: "Invoice" },
            { key: "customer", label: "Customer" },
            { key: "opportunity", label: "Opportunity" },
            { key: "status", label: "Status" },
            { key: "invoiceAmount", label: "Invoice amount", align: "right" },
            { key: "commissionRate", label: "Commission rate", align: "right" },
            { key: "paidAt", label: "Paid" },
          ],
          dateKey: "generatedAt",
          groupByKey: "status",
          groupByLabel: "invoice status",
          valueKey: "invoiceAmount",
          valueLabel: "Invoice amount",
        },
        {
          id: "revenue-by-customer",
          title: "Commissionable revenue by customer",
          description: "Roll up commissionable payments by end customer.",
          category: "Revenue",
          dataLabel: "customer rows",
          rows: payments.map((payment) => ({
            customer: payment.customer_name,
            opportunity: payment.opportunity_registrations?.target_account_name,
            commissionableAmount: money(payment.commissionable_amount),
            grossAmount: money(payment.gross_amount),
            source: payment.source,
            status: statusLabel(payment.status),
            createdAt: payment.created_at,
          })),
          columns: [
            { key: "customer", label: "Customer" },
            { key: "opportunity", label: "Opportunity" },
            { key: "commissionableAmount", label: "Commissionable", align: "right" },
            { key: "grossAmount", label: "Gross amount", align: "right" },
            { key: "source", label: "Source" },
            { key: "status", label: "Status" },
          ],
          dateKey: "createdAt",
          groupByKey: "customer",
          groupByLabel: "customer",
          valueKey: "commissionableAmount",
          valueLabel: "Commissionable amount",
        },
        {
          id: "invoice-aging",
          title: "Invoice status aging",
          description: "Invoices grouped by status so finance can spot items needing follow-up.",
          category: "Operations",
          dataLabel: "invoice rows",
          rows: invoices.map((invoice) => ({
            invoice: invoice.invoice_number,
            status: invoice.status,
            invoiceAmount: money(invoice.invoice_amount),
            generatedAt: invoice.generated_at,
            sentAt: date(invoice.sent_at),
            paidAt: date(invoice.paid_at),
            opportunity: invoice.opportunity_registrations?.target_account_name,
          })),
          columns: [
            { key: "invoice", label: "Invoice" },
            { key: "status", label: "Status" },
            { key: "invoiceAmount", label: "Amount", align: "right" },
            { key: "generatedAt", label: "Generated" },
            { key: "sentAt", label: "Sent" },
            { key: "paidAt", label: "Paid" },
            { key: "opportunity", label: "Opportunity" },
          ],
          dateKey: "generatedAt",
          groupByKey: "status",
          groupByLabel: "invoice status",
          valueKey: "invoiceAmount",
          valueLabel: "Invoice amount",
        },
        {
          id: "finance-exceptions",
          title: "Finance exceptions",
          description: "Disputed, void, or still-uninvoiced payment activity that may need review.",
          category: "Exceptions",
          dataLabel: "exception rows",
          rows: payments
            .filter((payment) => payment.status !== "INVOICE_GENERATED")
            .map((payment) => ({
              customer: payment.customer_name,
              opportunity: payment.opportunity_registrations?.target_account_name,
              status: statusLabel(payment.status),
              commissionableAmount: money(payment.commissionable_amount),
              notes: payment.notes,
              createdAt: payment.created_at,
            })),
          columns: [
            { key: "customer", label: "Customer" },
            { key: "opportunity", label: "Opportunity" },
            { key: "status", label: "Status" },
            { key: "commissionableAmount", label: "Commissionable", align: "right" },
            { key: "notes", label: "Notes" },
          ],
          dateKey: "createdAt",
          groupByKey: "status",
          groupByLabel: "exception status",
          valueKey: "commissionableAmount",
          valueLabel: "Open amount",
        },
      ];
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
        title: "Inbound reverse opportunities",
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
        groupByLabel: "reverse opportunity status",
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
      {
        id: "connector-coverage",
        title: "Connector coverage",
        description: "Visible Bums by availability, region, industries, and buyer coverage.",
        category: "Coverage",
        dataLabel: "profile rows",
        rows: profiles.map((profile) => ({
          name: profile.profiles?.full_name ?? profile.profiles?.email ?? "Trusted Bum",
          availability: profile.availability_status,
          verification: profile.verification_status,
          homeRegion: profile.home_region,
          industries: profile.industries.join(", "),
          buyerPersonas: profile.buyer_personas.join(", "),
          updatedAt: profile.updated_at,
        })),
        columns: [
          { key: "name", label: "Name" },
          { key: "availability", label: "Availability" },
          { key: "verification", label: "Verification" },
          { key: "homeRegion", label: "Home region" },
          { key: "industries", label: "Industries" },
          { key: "buyerPersonas", label: "Buyer personas" },
        ],
        dateKey: "updatedAt",
        groupByKey: "availability",
        groupByLabel: "availability",
        valueLabel: "Profiles",
      },
    ];

    if (canReadFinance) {
      reports[3] = {
        id: "commission-and-invoices",
        title: "Commission and invoices",
        description: "Reported commissionable revenue alongside generated invoice amounts.",
        category: "Finance",
        dataLabel: "finance rows",
        rows: [
          ...payments.map((payment) => ({
            record: payment.customer_name,
            type: "Payment",
            status: statusLabel(payment.status),
            amount: money(payment.commissionable_amount),
            opportunity: payment.opportunity_registrations?.target_account_name,
            createdAt: payment.created_at,
          })),
          ...invoices.map((invoice) => ({
            record: invoice.invoice_number,
            type: "Invoice",
            status: invoice.status,
            amount: money(invoice.invoice_amount),
            opportunity: invoice.opportunity_registrations?.target_account_name,
            createdAt: invoice.created_at,
          })),
        ],
        columns: [
          { key: "record", label: "Record" },
          { key: "type", label: "Type" },
          { key: "status", label: "Status" },
          { key: "amount", label: "Amount", align: "right" },
          { key: "opportunity", label: "Opportunity" },
        ],
        dateKey: "createdAt",
        groupByKey: "type",
        groupByLabel: "record type",
        valueKey: "amount",
        valueLabel: "Amount",
      };
    }

    return reports;
  }, [
    accessRole,
    bumProfilesQuery.data,
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
    bumProfilesQuery.isLoading ||
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
