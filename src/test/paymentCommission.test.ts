import { describe, expect, it } from "vitest";
import {
  calculateTrustedBumsCommission,
  getCommissionPlanInvoiceBlockReason,
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
});
