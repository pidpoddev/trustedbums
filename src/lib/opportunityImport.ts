import { parseCsv, type CsvRow } from "@/lib/csv";
import { DEFAULT_COMMISSION_DURATION } from "@/data/partnerTerms";
import type { OpportunityInput } from "@/lib/portalApi";

export interface OpportunityImportRow {
  rowNumber: number;
  target_account_name: string;
  business_unit?: string;
  opportunity_description?: string;
  client_contact?: string;
  trusted_bums_contact?: string;
  expected_product_service?: string;
  estimated_deal_value?: number | null;
  expected_timeline?: string;
  commission_rate?: number;
  commission_duration?: string;
  notes?: string;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
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

function toNullableRate(value: string) {
  const parsed = toNullableNumber(value);
  return parsed === null ? undefined : parsed;
}

function mapOpportunityRow(row: CsvRow, index: number): OpportunityImportRow | null {
  const normalized = normalizeRow(row);
  const targetAccountName = getValue(normalized, [
    "target_account_name",
    "target_account",
    "account_name",
    "account",
    "company_name",
    "company",
    "prospect",
  ]);

  if (!targetAccountName.trim()) {
    return null;
  }

  return {
    rowNumber: index + 2,
    target_account_name: targetAccountName.trim(),
    business_unit: toNullableString(getValue(normalized, ["business_unit", "department", "team"])),
    opportunity_description: toNullableString(
      getValue(normalized, ["opportunity_description", "description", "use_case", "context"]),
    ),
    client_contact: toNullableString(
      getValue(normalized, ["client_contact", "owner", "account_owner", "sales_owner"]),
    ),
    trusted_bums_contact: toNullableString(
      getValue(normalized, ["trusted_bums_contact", "bum_contact", "connector", "connector_name"]),
    ),
    expected_product_service: toNullableString(
      getValue(normalized, ["expected_product_service", "product", "service", "offering"]),
    ),
    estimated_deal_value: toNullableNumber(
      getValue(normalized, ["estimated_deal_value", "deal_value", "amount", "acv", "value"]),
    ),
    expected_timeline: toNullableString(
      getValue(normalized, ["expected_timeline", "timeline", "close_timeline"]),
    ),
    commission_rate: toNullableRate(getValue(normalized, ["commission_rate", "commission", "rate"])),
    commission_duration:
      toNullableString(
        getValue(normalized, ["commission_duration", "commission_term", "commission_period"]),
      ) ?? DEFAULT_COMMISSION_DURATION,
    notes: toNullableString(getValue(normalized, ["notes", "note", "comments"])),
  };
}

export async function parseOpportunityImportFile(file: File) {
  const csvRows = parseCsv(await file.text());
  const parsedRows = csvRows
    .map((row, index) => mapOpportunityRow(row, index))
    .filter((row): row is OpportunityImportRow => Boolean(row));

  return parsedRows;
}

export function toOpportunityInput(row: OpportunityImportRow): OpportunityInput {
  return {
    target_account_name: row.target_account_name,
    business_unit: row.business_unit,
    opportunity_description: row.opportunity_description,
    client_contact: row.client_contact,
    trusted_bums_contact: row.trusted_bums_contact,
    expected_product_service: row.expected_product_service,
    estimated_deal_value: row.estimated_deal_value,
    expected_timeline: row.expected_timeline,
    commission_rate: row.commission_rate,
    commission_duration: row.commission_duration,
    notes: row.notes,
    status: "Submitted",
  };
}
