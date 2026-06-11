import { parseCsv, type CsvRow } from "@/lib/csv";
import { DEFAULT_COMMISSION_DURATION } from "@/data/partnerTerms";
import type { OpportunityInput, RegistrationStatus } from "@/lib/portalApi";

export const OPPORTUNITY_IMPORT_TEMPLATE_HEADERS = [
  "opportunity_id",
  "customer_name",
  "status",
  "commission_plan",
  "business_unit",
  "expected_product_service",
  "estimated_deal_value",
  "expected_timeline",
  "client_contact",
  "trusted_bums_contact",
  "opportunity_description",
  "notes",
];

export const OPPORTUNITY_IMPORT_TEMPLATE_EXAMPLE = [
  "",
  "Acme Corp",
  "Published",
  "Standard 10%",
  "Enterprise IT",
  "Security platform",
  "75000",
  "Q4 pilot",
  "Jane Client",
  "Trusted Bums team",
  "Acme is evaluating vendors for the security renewal.",
  "Use Draft instead of Published to keep the opportunity private.",
];

export interface OpportunityImportRow {
  rowNumber: number;
  opportunity_id?: string;
  target_account_name: string;
  status?: RegistrationStatus;
  pay_program_id?: string;
  commission_plan?: string;
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

function toOpportunityStatus(value: string): RegistrationStatus | undefined {
  const normalized = value.trim().toLowerCase().replace(/[_-]+/g, " ");
  if (!normalized) {
    return undefined;
  }

  if (["published", "publish", "accepted", "live", "public"].includes(normalized)) {
    return "Accepted";
  }

  if (["draft", "private"].includes(normalized)) {
    return "Draft";
  }

  if (normalized === "closed won") {
    return "Closed Won";
  }

  if (normalized === "closed lost") {
    return "Closed Lost";
  }

  return undefined;
}

function mapOpportunityRow(row: CsvRow, index: number): OpportunityImportRow | null {
  const normalized = normalizeRow(row);
  const targetAccountName = getValue(normalized, [
    "customer_name",
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
    opportunity_id: toNullableString(getValue(normalized, ["opportunity_id", "id"])),
    target_account_name: targetAccountName.trim(),
    status: toOpportunityStatus(getValue(normalized, ["status", "publish_status", "draft_or_published"])),
    pay_program_id: toNullableString(getValue(normalized, ["pay_program_id", "commission_plan_id"])),
    commission_plan: toNullableString(getValue(normalized, ["commission_plan", "commission_structure", "plan"])),
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
    status: row.status ?? "Accepted",
  };
}

export function buildOpportunityImportTemplateCsv() {
  return [
    OPPORTUNITY_IMPORT_TEMPLATE_HEADERS.join(","),
    OPPORTUNITY_IMPORT_TEMPLATE_EXAMPLE.map((value) => `"${value.replace(/"/g, "\"\"")}"`).join(","),
  ].join("\n");
}
