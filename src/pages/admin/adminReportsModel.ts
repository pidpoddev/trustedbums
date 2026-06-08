import type { ReportColumn, ReportRow } from "@/components/reports/ReportsWorkspace";
import {
  bumPayoutBusinessDate,
  claimInvoiceBusinessDate,
  paymentReportBusinessDate,
  type BumPayoutRecord,
  type ClaimInvoiceRecord,
  type CustomerPaymentReportRecord,
} from "@/lib/portalApi";

function money(value?: number | null) {
  return Number(value ?? 0);
}

function statusLabel(value?: string | null) {
  return String(value ?? "").replace(/_/g, " ");
}

export const adminFinanceColumns: ReportColumn[] = [
  { key: "record", label: "Record" },
  { key: "type", label: "Type" },
  { key: "company", label: "Company / Bum" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount", align: "right" },
  { key: "businessDate", label: "Business date" },
  { key: "createdAt", label: "Created", defaultVisible: false },
];

export function buildAdminFinanceRows({
  payments,
  invoices,
  payouts,
}: {
  payments: CustomerPaymentReportRecord[];
  invoices: ClaimInvoiceRecord[];
  payouts: BumPayoutRecord[];
}): ReportRow[] {
  return [
    ...payments.map((payment) => ({
      record: payment.customer_name,
      type: "Payment",
      company: payment.companies?.name,
      status: statusLabel(payment.status),
      amount: money(payment.commissionable_amount),
      businessDate: paymentReportBusinessDate(payment),
      createdAt: payment.created_at,
    })),
    ...invoices.map((invoice) => ({
      record: invoice.invoice_number,
      type: "Invoice",
      company: invoice.companies?.name,
      status: invoice.status,
      amount: money(invoice.invoice_amount),
      businessDate: claimInvoiceBusinessDate(invoice),
      createdAt: invoice.created_at,
    })),
    ...payouts.map((payout) => ({
      record: payout.claim_invoices?.invoice_number,
      type: "Payout",
      company: payout.profiles?.full_name ?? payout.profiles?.email,
      status: statusLabel(payout.status),
      amount: money(payout.payout_amount),
      businessDate: bumPayoutBusinessDate(payout),
      createdAt: payout.created_at,
    })),
  ];
}
