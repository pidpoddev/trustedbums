import { describe, expect, it } from "vitest";
import {
  bumPayoutBusinessDate,
  calculateManagingBumCommission,
  calculateTrustedBumsCommission,
  claimInvoiceBusinessDate,
  getCommissionPlanInvoiceBlockReason,
  paymentReportBusinessDate,
  resolveTieredCommissionRate,
} from "@/lib/portalApi";

const tieredProgram = {
  year_1_rate: 10,
  year_2_rate: 8,
  year_3_rate: 6,
  year_4_rate: 4,
  year_5_rate: 2,
  year_6_plus_rate: 1,
};

describe("payment commission helpers", () => {
  it("resolves the commission tier from the deal schedule start date", () => {
    expect(resolveTieredCommissionRate(tieredProgram, null, "2026-02-01")).toBe(10);
    expect(resolveTieredCommissionRate(tieredProgram, "2024-01-15", "2024-12-14")).toBe(10);
    expect(resolveTieredCommissionRate(tieredProgram, "2024-01-15", "2025-01-15")).toBe(8);
    expect(resolveTieredCommissionRate(tieredProgram, "2024-01-15", "2029-02-01")).toBe(1);
  });

  it("calculates the Trusted Bums invoice amount from commissionable revenue", () => {
    expect(calculateTrustedBumsCommission(tieredProgram, "2024-01-15", "2025-01-15", 1250)).toEqual({
      commissionRate: 8,
      invoiceAmount: 100,
    });
  });

  it("calculates Managing Bum commission from the commission Trusted Bums receives", () => {
    expect(calculateManagingBumCommission(1000, 10)).toBe(100);
    expect(calculateManagingBumCommission(333.33, 7.5)).toBe(25);
  });

  it("blocks invoice generation until the deal has an approved active commission plan", () => {
    expect(getCommissionPlanInvoiceBlockReason(null)).toBe("This deal does not have a commission plan assigned.");
    expect(getCommissionPlanInvoiceBlockReason({ status: "ACTIVE", approval_status: "PENDING" })).toBe(
      "This deal's commission plan is not approved yet.",
    );
    expect(getCommissionPlanInvoiceBlockReason({ status: "PAUSED", approval_status: "APPROVED" })).toBe(
      "This deal's commission plan is not active.",
    );
    expect(getCommissionPlanInvoiceBlockReason({ status: "ACTIVE", approval_status: "APPROVED" })).toBeNull();
  });

  it("uses business dates, not record creation dates, for finance activity sorting", () => {
    expect(paymentReportBusinessDate({ customer_payment_received_at: "2026-04-01", created_at: "2026-05-01" })).toBe("2026-04-01");
    expect(claimInvoiceBusinessDate({
      paid_at: null,
      sent_at: "2026-04-03",
      generated_at: "2026-04-02",
      created_at: "2026-05-01",
      customer_payment_reports: { id: "payment-1", customer_name: "Acme", commissionable_amount: 1000, customer_payment_received_at: "2026-04-01" },
    })).toBe("2026-04-03");
    expect(bumPayoutBusinessDate({ paid_at: null, approved_at: "2026-04-04", created_at: "2026-05-01" })).toBe("2026-04-04");
  });
});
