export type DealRegistrationMethod = "EMAIL" | "API" | "MANUAL";
export type DealRegistrationProvider = "SALESFORCE" | "HUBSPOT" | "ZENDESK_SELL" | "PIPEDRIVE" | "CUSTOM_API" | "OTHER";
export type DealRegistrationApprovalMode = "MANUAL" | "WEBHOOK" | "POLLING";
export type DealRegistrationBetaStatus = "NOT_CONFIGURED" | "BETA_CONFIGURED" | "BETA_TESTING" | "READY_FOR_REPEATABLE_USE";

export interface DealRegistrationConfig {
  is_beta_enabled: boolean;
  beta_status: DealRegistrationBetaStatus;
  method: DealRegistrationMethod;
  provider: DealRegistrationProvider;
  external_portal_url: string;
  api_base_url: string;
  auth_method: string;
  credential_reference: string;
  approval_mode: DealRegistrationApprovalMode;
  webhook_url: string;
  polling_interval_minutes: number | null;
  required_fields: string[];
  field_mapping_notes: string;
  fallback_email: string;
  fallback_instructions: string;
}

export const dealRegistrationMethods: Array<{ value: DealRegistrationMethod; label: string; description: string }> = [
  { value: "EMAIL", label: "Email workflow", description: "Use Trusted Bums email/admin review workflow." },
  { value: "API", label: "API integration", description: "Submit deal registrations to the client portal API." },
  { value: "MANUAL", label: "Manual/admin handled", description: "Track the external registration process without automatic submission." },
];

export const dealRegistrationProviders: Array<{ value: DealRegistrationProvider; label: string }> = [
  { value: "SALESFORCE", label: "Salesforce" },
  { value: "HUBSPOT", label: "HubSpot" },
  { value: "ZENDESK_SELL", label: "Zendesk Sell" },
  { value: "PIPEDRIVE", label: "Pipedrive" },
  { value: "CUSTOM_API", label: "Custom API" },
  { value: "OTHER", label: "Other portal" },
];

export const dealRegistrationApprovalModes: Array<{ value: DealRegistrationApprovalMode; label: string }> = [
  { value: "MANUAL", label: "Manual status update" },
  { value: "WEBHOOK", label: "Webhook callback" },
  { value: "POLLING", label: "Scheduled API polling" },
];

export const dealRegistrationBetaStatuses: Array<{ value: DealRegistrationBetaStatus; label: string }> = [
  { value: "NOT_CONFIGURED", label: "Not configured" },
  { value: "BETA_CONFIGURED", label: "Beta configured" },
  { value: "BETA_TESTING", label: "Beta testing" },
  { value: "READY_FOR_REPEATABLE_USE", label: "Ready for repeatable use" },
];

export const defaultDealRegistrationConfig: DealRegistrationConfig = {
  is_beta_enabled: false,
  beta_status: "NOT_CONFIGURED",
  method: "EMAIL",
  provider: "CUSTOM_API",
  external_portal_url: "",
  api_base_url: "",
  auth_method: "",
  credential_reference: "",
  approval_mode: "MANUAL",
  webhook_url: "",
  polling_interval_minutes: null,
  required_fields: [],
  field_mapping_notes: "",
  fallback_email: "",
  fallback_instructions: "",
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function isDealRegistrationMethod(value: unknown): value is DealRegistrationMethod {
  return dealRegistrationMethods.some((method) => method.value === value);
}

function isDealRegistrationProvider(value: unknown): value is DealRegistrationProvider {
  return dealRegistrationProviders.some((provider) => provider.value === value);
}

function isDealRegistrationApprovalMode(value: unknown): value is DealRegistrationApprovalMode {
  return dealRegistrationApprovalModes.some((mode) => mode.value === value);
}

function isDealRegistrationBetaStatus(value: unknown): value is DealRegistrationBetaStatus {
  return dealRegistrationBetaStatuses.some((status) => status.value === value);
}

export function normalizeDealRegistrationConfig(value: unknown): DealRegistrationConfig {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const method = isDealRegistrationMethod(raw.method) ? raw.method : defaultDealRegistrationConfig.method;
  const betaStatus = isDealRegistrationBetaStatus(raw.beta_status) ? raw.beta_status : defaultDealRegistrationConfig.beta_status;
  const provider = isDealRegistrationProvider(raw.provider) ? raw.provider : defaultDealRegistrationConfig.provider;
  const approvalMode = isDealRegistrationApprovalMode(raw.approval_mode) ? raw.approval_mode : defaultDealRegistrationConfig.approval_mode;

  return {
    is_beta_enabled: raw.is_beta_enabled === true,
    beta_status: raw.is_beta_enabled === true ? betaStatus : "NOT_CONFIGURED",
    method,
    provider,
    external_portal_url: readString(raw.external_portal_url),
    api_base_url: readString(raw.api_base_url),
    auth_method: readString(raw.auth_method),
    credential_reference: readString(raw.credential_reference),
    approval_mode: approvalMode,
    webhook_url: readString(raw.webhook_url),
    polling_interval_minutes: readNumber(raw.polling_interval_minutes),
    required_fields: Array.isArray(raw.required_fields)
      ? Array.from(new Set(raw.required_fields.map(readString).filter(Boolean)))
      : [],
    field_mapping_notes: readString(raw.field_mapping_notes),
    fallback_email: readString(raw.fallback_email),
    fallback_instructions: readString(raw.fallback_instructions),
  };
}

export function dealRegistrationMethodLabel(value: DealRegistrationMethod) {
  return dealRegistrationMethods.find((method) => method.value === value)?.label ?? value;
}

export function dealRegistrationProviderLabel(value: DealRegistrationProvider) {
  return dealRegistrationProviders.find((provider) => provider.value === value)?.label ?? value;
}

export function dealRegistrationBetaStatusLabel(value: DealRegistrationBetaStatus) {
  return dealRegistrationBetaStatuses.find((status) => status.value === value)?.label ?? value;
}
