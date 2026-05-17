import { parseCsv, type CsvRow } from "@/lib/csv";
import type { OpportunityClaimRecord } from "@/lib/portalApi";

export type PaymentImportMatchStatus = "matched" | "unmatched" | "ambiguous" | "invalid";

export interface PaymentImportRow {
  rowNumber: number;
  claimId: string;
  customerName: string;
  grossAmount: number;
  commissionableAmount: number;
  excludedAmount: number;
  customerPaymentReceivedAt: string;
  notes?: string;
  reference?: string;
  matchKey: string;
  matchStatus: PaymentImportMatchStatus;
  matchMessage: string;
  matchedClaim?: OpportunityClaimRecord;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function normalizeValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeRow(row: CsvRow) {
  return Object.entries(row).reduce<Record<string, string>>((record, [key, value]) => {
    record[normalizeHeader(key)] = value.trim();
    return record;
  }, {});
}

function getValue(row: Record<string, string>, aliases: string[]) {
  for (const alias of aliases) {
    const value = row[alias];
    if (value) {
      return value;
    }
  }

  return "";
}

function toNullableString(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function toNullableNumber(value: string) {
  const trimmed = value.trim().replace(/[$,]/g, "");

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIsoDate(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return new Date().toISOString().slice(0, 10);
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function buildClaimIndexes(claims: OpportunityClaimRecord[]) {
  const byId = new Map<string, OpportunityClaimRecord>();
  const byAccount = new Map<string, OpportunityClaimRecord[]>();

  for (const claim of claims) {
    byId.set(claim.id, claim);

    const candidateKeys = [
      claim.opportunity_registrations?.target_account_name ?? "",
      claim.contact_company ?? "",
    ]
      .map(normalizeValue)
      .filter(Boolean);

    for (const key of candidateKeys) {
      const existing = byAccount.get(key) ?? [];
      existing.push(claim);
      byAccount.set(key, existing);
    }
  }

  return { byId, byAccount };
}

function mapPaymentImportRow(row: CsvRow, index: number, claims: ReturnType<typeof buildClaimIndexes>): PaymentImportRow | null {
  const normalized = normalizeRow(row);
  const explicitClaimId = getValue(normalized, ["claim_id", "approved_claim_id", "opportunity_claim_id"]);
  const accountName = getValue(normalized, [
    "target_account_name",
    "target_account",
    "account_name",
    "account",
    "company_name",
    "company",
    "customer_name",
    "customer",
  ]);
  const customerName = toNullableString(
    getValue(normalized, ["customer_name", "customer", "account_name", "company_name", "account"]),
  );
  const grossAmount = toNullableNumber(
    getValue(normalized, ["gross_amount", "amount_received", "payment_amount", "amount", "cash_received"]),
  );
  const commissionableAmount = toNullableNumber(
    getValue(normalized, ["commissionable_amount", "eligible_amount", "net_commissionable_amount"]),
  );
  const excludedAmount = toNullableNumber(
    getValue(normalized, ["excluded_amount", "non_commissionable_amount", "excluded"]),
  );
  const customerPaymentReceivedAt = toIsoDate(
    getValue(normalized, ["payment_date", "received_at", "customer_payment_received_at", "paid_at", "date"]),
  );
  const notes = toNullableString(getValue(normalized, ["notes", "memo", "description", "comments"]));
  const reference = toNullableString(getValue(normalized, ["invoice_number", "payment_reference", "reference", "invoice"]));
  const rowNumber = index + 2;

  if (!explicitClaimId && !accountName.trim()) {
    return null;
  }

  if (grossAmount === null || grossAmount <= 0) {
    return {
      rowNumber,
      claimId: "",
      customerName: customerName ?? accountName.trim(),
      grossAmount: 0,
      commissionableAmount: 0,
      excludedAmount: 0,
      customerPaymentReceivedAt: customerPaymentReceivedAt || "",
      notes,
      reference,
      matchKey: accountName.trim() || explicitClaimId.trim(),
      matchStatus: "invalid",
      matchMessage: "Missing or invalid payment amount.",
    };
  }

  if (!customerPaymentReceivedAt) {
    return {
      rowNumber,
      claimId: "",
      customerName: customerName ?? accountName.trim(),
      grossAmount,
      commissionableAmount: commissionableAmount ?? grossAmount,
      excludedAmount: excludedAmount ?? Math.max(0, grossAmount - (commissionableAmount ?? grossAmount)),
      customerPaymentReceivedAt: "",
      notes,
      reference,
      matchKey: accountName.trim() || explicitClaimId.trim(),
      matchStatus: "invalid",
      matchMessage: "Missing or invalid payment date.",
    };
  }

  if (explicitClaimId.trim()) {
    const matchedClaim = claims.byId.get(explicitClaimId.trim());

    if (!matchedClaim) {
      return {
        rowNumber,
        claimId: "",
        customerName: customerName ?? accountName.trim(),
        grossAmount,
        commissionableAmount: commissionableAmount ?? grossAmount,
        excludedAmount: excludedAmount ?? Math.max(0, grossAmount - (commissionableAmount ?? grossAmount)),
        customerPaymentReceivedAt,
        notes,
        reference,
        matchKey: explicitClaimId.trim(),
        matchStatus: "unmatched",
        matchMessage: "Claim ID did not match an approved claim.",
      };
    }

    return {
      rowNumber,
      claimId: matchedClaim.id,
      customerName:
        customerName ??
        matchedClaim.opportunity_registrations?.target_account_name ??
        matchedClaim.contact_company,
      grossAmount,
      commissionableAmount: commissionableAmount ?? grossAmount,
      excludedAmount: excludedAmount ?? Math.max(0, grossAmount - (commissionableAmount ?? grossAmount)),
      customerPaymentReceivedAt,
      notes,
      reference,
      matchKey: explicitClaimId.trim(),
      matchStatus: "matched",
      matchMessage: "Matched by claim ID.",
      matchedClaim,
    };
  }

  const normalizedAccount = normalizeValue(accountName);
  const candidates = normalizedAccount ? claims.byAccount.get(normalizedAccount) ?? [] : [];

  if (!candidates.length) {
    return {
      rowNumber,
      claimId: "",
      customerName: customerName ?? accountName.trim(),
      grossAmount,
      commissionableAmount: commissionableAmount ?? grossAmount,
      excludedAmount: excludedAmount ?? Math.max(0, grossAmount - (commissionableAmount ?? grossAmount)),
      customerPaymentReceivedAt,
      notes,
      reference,
      matchKey: accountName.trim(),
      matchStatus: "unmatched",
      matchMessage: "Could not match this row to an approved claim.",
    };
  }

  if (candidates.length > 1) {
    return {
      rowNumber,
      claimId: "",
      customerName: customerName ?? accountName.trim(),
      grossAmount,
      commissionableAmount: commissionableAmount ?? grossAmount,
      excludedAmount: excludedAmount ?? Math.max(0, grossAmount - (commissionableAmount ?? grossAmount)),
      customerPaymentReceivedAt,
      notes,
      reference,
      matchKey: accountName.trim(),
      matchStatus: "ambiguous",
      matchMessage: "Matched multiple approved claims. Use a claim_id column to disambiguate.",
    };
  }

  const matchedClaim = candidates[0];
  return {
    rowNumber,
    claimId: matchedClaim.id,
    customerName:
      customerName ??
      matchedClaim.opportunity_registrations?.target_account_name ??
      matchedClaim.contact_company,
    grossAmount,
    commissionableAmount: commissionableAmount ?? grossAmount,
    excludedAmount: excludedAmount ?? Math.max(0, grossAmount - (commissionableAmount ?? grossAmount)),
    customerPaymentReceivedAt,
    notes,
    reference,
    matchKey: accountName.trim(),
    matchStatus: "matched",
    matchMessage: "Matched by target account name.",
    matchedClaim,
  };
}

export async function parsePaymentImportFile(file: File, claims: OpportunityClaimRecord[]) {
  const csvRows = parseCsv(await file.text());
  const claimIndexes = buildClaimIndexes(claims);

  return csvRows
    .map((row, index) => mapPaymentImportRow(row, index, claimIndexes))
    .filter((row): row is PaymentImportRow => Boolean(row));
}
