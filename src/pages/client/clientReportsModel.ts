import type { RecommendedReport, ReportColumn, ReportRow } from "@/components/reports/ReportsWorkspace";
import {
  claimInvoiceBusinessDate,
  paymentReportBusinessDate,
  type ClaimInvoiceRecord,
  type CustomerPaymentReportRecord,
} from "@/lib/portalApi";

function date(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "";
}

function money(value?: number | null) {
  return Number(value ?? 0);
}

function statusLabel(value?: string | null) {
  return String(value ?? "").replace(/_/g, " ");
}

const paymentFinanceColumns: ReportColumn[] = [
  { key: "customer", label: "Customer" },
  { key: "opportunity", label: "Opportunity" },
  { key: "status", label: "Status" },
  { key: "grossAmount", label: "Gross amount", align: "right" },
  { key: "commissionableAmount", label: "Commissionable", align: "right" },
  { key: "excludedAmount", label: "Excluded", align: "right" },
  { key: "receivedAt", label: "Received" },
  { key: "createdAt", label: "Created", defaultVisible: false },
];

const invoiceFinanceColumns: ReportColumn[] = [
  { key: "invoice", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "opportunity", label: "Opportunity" },
  { key: "status", label: "Status" },
  { key: "invoiceAmount", label: "Invoice amount", align: "right" },
  { key: "commissionRate", label: "Commission rate", align: "right" },
  { key: "businessDate", label: "Business date" },
  { key: "paidAt", label: "Paid" },
  { key: "createdAt", label: "Created", defaultVisible: false },
];

const combinedFinanceColumns: ReportColumn[] = [
  { key: "record", label: "Record" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount", align: "right" },
  { key: "opportunity", label: "Opportunity" },
  { key: "businessDate", label: "Business date" },
  { key: "createdAt", label: "Created", defaultVisible: false },
];

function buildPaymentRows(payments: CustomerPaymentReportRecord[]): ReportRow[] {
  return payments.map((payment) => ({
    customer: payment.customer_name,
    opportunity: payment.opportunity_registrations?.target_account_name,
    status: statusLabel(payment.status),
    grossAmount: money(payment.gross_amount),
    commissionableAmount: money(payment.commissionable_amount),
    excludedAmount: money(payment.excluded_amount),
    receivedAt: date(payment.customer_payment_received_at),
    businessDate: paymentReportBusinessDate(payment),
    createdAt: payment.created_at,
  }));
}

function buildInvoiceRows(invoices: ClaimInvoiceRecord[]): ReportRow[] {
  return invoices.map((invoice) => ({
    invoice: invoice.invoice_number,
    customer: invoice.customer_payment_reports?.customer_name,
    opportunity: invoice.opportunity_registrations?.target_account_name,
    status: invoice.status,
    invoiceAmount: money(invoice.invoice_amount),
    commissionRate: Number(invoice.commission_rate ?? 0),
    generatedAt: invoice.generated_at,
    sentAt: date(invoice.sent_at),
    paidAt: date(invoice.paid_at),
    businessDate: claimInvoiceBusinessDate(invoice),
    createdAt: invoice.created_at,
  }));
}

export function buildClientFinanceReports({
  payments,
  invoices,
}: {
  payments: CustomerPaymentReportRecord[];
  invoices: ClaimInvoiceRecord[];
}): RecommendedReport[] {
  const paymentRows = buildPaymentRows(payments);
  const invoiceRows = buildInvoiceRows(invoices);

  return [
    {
      id: "customer-payment-ledger",
      title: "Customer Payment Report ledger",
      description: "Customer payments reported by the Client for commission calculation and invoice generation.",
      category: "Finance",
      dataLabel: "payment rows",
      rows: paymentRows,
      columns: paymentFinanceColumns,
      dateKey: "businessDate",
      groupByKey: "status",
      groupByLabel: "Customer Payment Report status",
      valueKey: "commissionableAmount",
      valueLabel: "Commissionable amount",
    },
    {
      id: "invoice-register",
      title: "Commission invoice register",
      description: "Generated Trusted Bums commission invoices by status, Customer, and Opportunity.",
      category: "Finance",
      dataLabel: "invoice rows",
      rows: invoiceRows,
      columns: invoiceFinanceColumns,
      dateKey: "businessDate",
      groupByKey: "status",
      groupByLabel: "invoice status",
      valueKey: "invoiceAmount",
      valueLabel: "Invoice amount",
    },
    {
      id: "revenue-by-customer",
      title: "Commissionable revenue by customer",
      description: "Roll up Client-reported commissionable revenue by Customer.",
      category: "Revenue",
      dataLabel: "customer rows",
      rows: payments.map((payment) => ({
        customer: payment.customer_name,
        opportunity: payment.opportunity_registrations?.target_account_name,
        commissionableAmount: money(payment.commissionable_amount),
        grossAmount: money(payment.gross_amount),
        source: payment.source,
        status: statusLabel(payment.status),
        businessDate: paymentReportBusinessDate(payment),
        createdAt: payment.created_at,
      })),
      columns: [
        { key: "customer", label: "Customer" },
        { key: "opportunity", label: "Opportunity" },
        { key: "commissionableAmount", label: "Commissionable", align: "right" },
        { key: "grossAmount", label: "Gross amount", align: "right" },
        { key: "source", label: "Source" },
        { key: "status", label: "Status" },
        { key: "businessDate", label: "Business date" },
        { key: "createdAt", label: "Created", defaultVisible: false },
      ],
      dateKey: "businessDate",
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
      rows: invoiceRows,
      columns: [
        { key: "invoice", label: "Invoice" },
        { key: "status", label: "Status" },
        { key: "invoiceAmount", label: "Amount", align: "right" },
        { key: "generatedAt", label: "Generated" },
        { key: "sentAt", label: "Sent" },
        { key: "paidAt", label: "Paid" },
        { key: "opportunity", label: "Opportunity" },
        { key: "createdAt", label: "Created", defaultVisible: false },
      ],
      dateKey: "businessDate",
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
          businessDate: paymentReportBusinessDate(payment),
          createdAt: payment.created_at,
        })),
      columns: [
        { key: "customer", label: "Customer" },
        { key: "opportunity", label: "Opportunity" },
        { key: "status", label: "Status" },
        { key: "commissionableAmount", label: "Commissionable", align: "right" },
        { key: "notes", label: "Notes" },
        { key: "businessDate", label: "Business date" },
        { key: "createdAt", label: "Created", defaultVisible: false },
      ],
      dateKey: "businessDate",
      groupByKey: "status",
      groupByLabel: "exception status",
      valueKey: "commissionableAmount",
      valueLabel: "Open amount",
    },
  ];
}

export function buildClientCombinedFinanceRows({
  payments,
  invoices,
}: {
  payments: CustomerPaymentReportRecord[];
  invoices: ClaimInvoiceRecord[];
}): { rows: ReportRow[]; columns: ReportColumn[] } {
  return {
    rows: [
      ...payments.map((payment) => ({
        record: payment.customer_name,
        type: "Payment",
        status: statusLabel(payment.status),
        amount: money(payment.commissionable_amount),
        opportunity: payment.opportunity_registrations?.target_account_name,
        businessDate: paymentReportBusinessDate(payment),
        createdAt: payment.created_at,
      })),
      ...invoices.map((invoice) => ({
        record: invoice.invoice_number,
        type: "Invoice",
        status: invoice.status,
        amount: money(invoice.invoice_amount),
        opportunity: invoice.opportunity_registrations?.target_account_name,
        businessDate: claimInvoiceBusinessDate(invoice),
        createdAt: invoice.created_at,
      })),
    ],
    columns: combinedFinanceColumns,
  };
}
