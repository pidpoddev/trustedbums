import type { ReportColumn, ReportRow } from "@/components/reports/ReportsWorkspace";
import { bumPayoutBusinessDate, type BumPayoutRecord } from "@/lib/portalApi";

function money(value?: number | null) {
  return Number(value ?? 0);
}

function statusLabel(value?: string | null) {
  return String(value ?? "").replace(/_/g, " ");
}

export const bumEarningsColumns: ReportColumn[] = [
  { key: "invoice", label: "Invoice" },
  { key: "claim", label: "Claim" },
  { key: "status", label: "Status" },
  { key: "payoutAmount", label: "Payout", align: "right" },
  { key: "invoiceAmount", label: "Invoice amount", align: "right" },
  { key: "sharePercent", label: "Share %", align: "right" },
  { key: "businessDate", label: "Business date" },
  { key: "paidAt", label: "Paid" },
  { key: "createdAt", label: "Created", defaultVisible: false },
];

export function buildBumEarningsRows(payouts: BumPayoutRecord[]): ReportRow[] {
  return payouts.map((payout) => ({
    invoice: payout.claim_invoices?.invoice_number,
    claim: `${payout.opportunity_claims?.contact_name ?? "Contact"} @ ${payout.opportunity_claims?.contact_company ?? "Company"}`,
    status: statusLabel(payout.status),
    payoutAmount: money(payout.payout_amount),
    invoiceAmount: money(payout.claim_invoices?.invoice_amount),
    sharePercent: Number(payout.share_percent ?? 0),
    businessDate: bumPayoutBusinessDate(payout),
    createdAt: payout.created_at,
    paidAt: payout.paid_at ?? "",
  }));
}
