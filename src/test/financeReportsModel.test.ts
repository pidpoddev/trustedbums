import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { adminFinanceColumns, buildAdminFinanceRows } from "@/pages/admin/adminReportsModel";
import { buildBumEarningsRows, bumEarningsColumns } from "@/pages/bum/bumReportsModel";
import { buildClientCombinedFinanceRows, buildClientFinanceReports } from "@/pages/client/clientReportsModel";
import type { BumPayoutRecord, ClaimInvoiceRecord, CustomerPaymentReportRecord } from "@/lib/portalApi";

const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");

const paymentFixture = {
  id: "payment-1",
  opportunity_claim_id: "claim-1",
  opportunity_registration_id: "opportunity-1",
  company_id: "company-1",
  reported_by: "client-finance-1",
  source: "CLIENT",
  customer_name: "Acme",
  gross_amount: 100000,
  commissionable_amount: 80000,
  excluded_amount: 20000,
  currency: "USD",
  customer_payment_received_at: "2026-04-15T00:00:00.000Z",
  notes: "Finance note",
  status: "REPORTED",
  created_at: "2026-06-01T00:00:00.000Z",
  updated_at: "2026-06-01T00:00:00.000Z",
  opportunity_claims: null,
  opportunity_registrations: {
    id: "opportunity-1",
    target_account_name: "Acme",
    commission_rate: 10,
    commission_schedule_start_at: null,
  },
  companies: { id: "company-1", name: "ClientCo" },
  profiles: null,
} satisfies CustomerPaymentReportRecord;

const paidInvoiceFixture = {
  id: "invoice-1",
  customer_payment_report_id: "payment-1",
  opportunity_claim_id: "claim-1",
  opportunity_registration_id: "opportunity-1",
  company_id: "company-1",
  generated_by: "admin-1",
  invoice_number: "TB-1001",
  invoice_amount: 8000,
  commission_rate: 10,
  currency: "USD",
  status: "PAID",
  generated_at: "2026-05-01T00:00:00.000Z",
  sent_at: "2026-05-03T00:00:00.000Z",
  paid_at: "2026-05-20T00:00:00.000Z",
  notes: null,
  created_at: "2026-06-02T00:00:00.000Z",
  updated_at: "2026-06-02T00:00:00.000Z",
  customer_payment_reports: {
    id: "payment-1",
    customer_name: "Acme",
    commissionable_amount: 80000,
    customer_payment_received_at: "2026-04-15T00:00:00.000Z",
  },
  opportunity_claims: null,
  opportunity_registrations: { id: "opportunity-1", target_account_name: "Acme" },
  companies: { id: "company-1", name: "ClientCo" },
} satisfies ClaimInvoiceRecord;

const approvedPayoutFixture = {
  id: "payout-1",
  claim_invoice_id: "invoice-1",
  opportunity_claim_id: "claim-1",
  bum_user_id: "bum-1",
  payout_amount: 4000,
  share_percent: 50,
  currency: "USD",
  status: "APPROVED",
  approved_by: "admin-1",
  approved_at: "2026-05-25T00:00:00.000Z",
  paid_at: null,
  notes: null,
  created_at: "2026-06-03T00:00:00.000Z",
  updated_at: "2026-06-03T00:00:00.000Z",
  claim_invoices: {
    id: "invoice-1",
    invoice_number: "TB-1001",
    invoice_amount: 8000,
    status: "PAID",
    commission_rate: 10,
  },
  opportunity_claims: {
    id: "claim-1",
    contact_name: "Pat Buyer",
    contact_company: "Acme",
    bum_share_percent: 50,
  },
  profiles: { id: "bum-1", full_name: "Trusted Bum", email: "bum@example.com" },
} satisfies BumPayoutRecord;

describe("finance report business dates", () => {
  it("keeps Client Finance payment and invoice reads on finance-safe projections", () => {
    const paymentSelect = portalApiSource.match(/const CUSTOMER_PAYMENT_REPORT_FINANCE_SAFE_SELECT =\n\s{2}"([^"]+)";/)?.[1] ?? "";
    const invoiceSelect = portalApiSource.match(/const CLAIM_INVOICE_FINANCE_SAFE_SELECT =\n\s{2}"([^"]+)";/)?.[1] ?? "";

    expect(portalApiSource).toContain("shouldUseFinanceSafeProjection(user)");
    expect(portalApiSource).toContain('user.clientAccessRole === "CLIENT_FINANCE"');
    expect(paymentSelect).not.toContain("opportunity_claims");
    expect(paymentSelect).not.toContain("profiles(");
    expect(paymentSelect).not.toContain("bum_user_id");
    expect(paymentSelect).not.toContain("reported_by");
    expect(invoiceSelect).not.toContain("opportunity_claims");
    expect(invoiceSelect).not.toContain("profiles(");
    expect(invoiceSelect).not.toContain("bum_user_id");
    expect(invoiceSelect).not.toContain("generated_by");
  });

  it("keys Client Finance report filters to business dates while keeping created-at as audit metadata", () => {
    const reports = buildClientFinanceReports({
      payments: [paymentFixture],
      invoices: [paidInvoiceFixture],
    });
    const combined = buildClientCombinedFinanceRows({
      payments: [paymentFixture],
      invoices: [paidInvoiceFixture],
    });

    expect(reports.map((report) => [report.id, report.dateKey])).toEqual([
      ["customer-payment-ledger", "businessDate"],
      ["invoice-register", "businessDate"],
      ["revenue-by-customer", "businessDate"],
      ["invoice-aging", "businessDate"],
      ["finance-exceptions", "businessDate"],
    ]);
    expect(reports[0].rows[0]).toMatchObject({
      businessDate: "2026-04-15T00:00:00.000Z",
      createdAt: "2026-06-01T00:00:00.000Z",
    });
    expect(reports[1].rows[0]).toMatchObject({
      businessDate: "2026-05-20T00:00:00.000Z",
      createdAt: "2026-06-02T00:00:00.000Z",
    });
    expect(reports[0].columns.find((column) => column.key === "createdAt")).toMatchObject({ defaultVisible: false });
    expect(combined.rows.map((row) => row.businessDate)).toEqual([
      "2026-04-15T00:00:00.000Z",
      "2026-05-20T00:00:00.000Z",
    ]);
    expect(combined.columns.find((column) => column.key === "createdAt")).toMatchObject({ defaultVisible: false });
  });

  it("keys Admin finance operations to payment, invoice, and payout business dates", () => {
    const rows = buildAdminFinanceRows({
      payments: [paymentFixture],
      invoices: [paidInvoiceFixture],
      payouts: [approvedPayoutFixture],
    });

    expect(rows.map((row) => [row.type, row.businessDate, row.createdAt])).toEqual([
      ["Payment", "2026-04-15T00:00:00.000Z", "2026-06-01T00:00:00.000Z"],
      ["Invoice", "2026-05-20T00:00:00.000Z", "2026-06-02T00:00:00.000Z"],
      ["Payout", "2026-05-25T00:00:00.000Z", "2026-06-03T00:00:00.000Z"],
    ]);
    expect(adminFinanceColumns.find((column) => column.key === "createdAt")).toMatchObject({ defaultVisible: false });
  });

  it("keys Bum earnings reports to payout business dates", () => {
    const rows = buildBumEarningsRows([approvedPayoutFixture]);

    expect(rows[0]).toMatchObject({
      businessDate: "2026-05-25T00:00:00.000Z",
      createdAt: "2026-06-03T00:00:00.000Z",
    });
    expect(bumEarningsColumns.find((column) => column.key === "createdAt")).toMatchObject({ defaultVisible: false });
  });
});
