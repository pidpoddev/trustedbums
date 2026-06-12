import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  dealRegistrationApprovalModes,
  dealRegistrationBetaStatuses,
  dealRegistrationMethods,
  dealRegistrationProviders,
  type DealRegistrationApprovalMode,
  type DealRegistrationBetaStatus,
  type DealRegistrationConfig,
  type DealRegistrationMethod,
  type DealRegistrationProvider,
} from "@/lib/dealRegistration";

interface DealRegistrationBetaSettingsProps {
  value: DealRegistrationConfig;
  onChange: (value: DealRegistrationConfig) => void;
  disabled?: boolean;
}

function listToText(values: string[]) {
  return values.join("\n");
}

function textToList(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function DealRegistrationBetaSettings({ value, onChange, disabled = false }: DealRegistrationBetaSettingsProps) {
  const update = <K extends keyof DealRegistrationConfig>(field: K, nextValue: DealRegistrationConfig[K]) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">Deal Registration Automation</p>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Use this when a client wants Trusted Bums to submit claim or opportunity requests into an external deal registration portal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="deal-registration-beta-enabled" className="text-sm">Enabled</Label>
          <Switch
            id="deal-registration-beta-enabled"
            checked={value.is_beta_enabled}
            onCheckedChange={(checked) => {
              onChange({
                ...value,
                is_beta_enabled: checked,
                beta_status: checked && value.beta_status === "NOT_CONFIGURED" ? "BETA_CONFIGURED" : checked ? value.beta_status : "NOT_CONFIGURED",
              });
            }}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Workflow method</Label>
          <Select value={value.method} onValueChange={(nextValue: DealRegistrationMethod) => update("method", nextValue)} disabled={disabled}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {dealRegistrationMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            API can supersede email after the beta process proves repeatable for this client.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Beta status</Label>
          <Select value={value.beta_status} onValueChange={(nextValue: DealRegistrationBetaStatus) => update("beta_status", nextValue)} disabled={disabled || !value.is_beta_enabled}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {dealRegistrationBetaStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Provider</Label>
          <Select value={value.provider} onValueChange={(nextValue: DealRegistrationProvider) => update("provider", nextValue)} disabled={disabled}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {dealRegistrationProviders.map((provider) => (
                <SelectItem key={provider.value} value={provider.value}>{provider.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Common starting points are Salesforce partner/deal registration, HubSpot CRM, Zendesk Sell, Pipedrive, or a custom partner portal API.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deal-registration-portal-url">External portal URL</Label>
          <Input
            id="deal-registration-portal-url"
            value={value.external_portal_url}
            onChange={(event) => update("external_portal_url", event.target.value)}
            disabled={disabled}
            placeholder="https://partner.client.com/deal-registration"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="deal-registration-api-url">API base URL</Label>
          <Input
            id="deal-registration-api-url"
            value={value.api_base_url}
            onChange={(event) => update("api_base_url", event.target.value)}
            disabled={disabled || value.method !== "API"}
            placeholder="https://api.client.com/v1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deal-registration-auth-method">Auth method</Label>
          <Input
            id="deal-registration-auth-method"
            value={value.auth_method}
            onChange={(event) => update("auth_method", event.target.value)}
            disabled={disabled || value.method !== "API"}
            placeholder="OAuth 2.0, API key, JWT, private app token"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deal-registration-credential-reference">Credential reference</Label>
        <Input
          id="deal-registration-credential-reference"
          value={value.credential_reference}
          onChange={(event) => update("credential_reference", event.target.value)}
          disabled={disabled || value.method !== "API"}
          placeholder="Server-side secret name, vault item, or admin handoff reference"
        />
        <p className="text-xs text-muted-foreground">
          Do not paste API keys or passwords here. Store secrets server-side and reference the secret name.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Approval handling</Label>
          <Select value={value.approval_mode} onValueChange={(nextValue: DealRegistrationApprovalMode) => update("approval_mode", nextValue)} disabled={disabled}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {dealRegistrationApprovalModes.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deal-registration-webhook-url">Webhook URL</Label>
          <Input
            id="deal-registration-webhook-url"
            value={value.webhook_url}
            onChange={(event) => update("webhook_url", event.target.value)}
            disabled={disabled || value.approval_mode !== "WEBHOOK"}
            placeholder="Provided after connector setup"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deal-registration-polling">Polling minutes</Label>
          <Input
            id="deal-registration-polling"
            type="number"
            min="1"
            value={value.polling_interval_minutes ?? ""}
            onChange={(event) => update("polling_interval_minutes", event.target.value ? Number(event.target.value) : null)}
            disabled={disabled || value.approval_mode !== "POLLING"}
            placeholder="15"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deal-registration-required-fields">Required fields</Label>
        <Textarea
          id="deal-registration-required-fields"
          rows={4}
          value={listToText(value.required_fields)}
          onChange={(event) => update("required_fields", textToList(event.target.value))}
          disabled={disabled}
          placeholder={"Account name\nWebsite\nContact name\nContact email\nOpportunity summary\nEstimated value\nExpected close date"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deal-registration-field-mapping">Field mapping notes</Label>
        <Textarea
          id="deal-registration-field-mapping"
          rows={4}
          value={value.field_mapping_notes}
          onChange={(event) => update("field_mapping_notes", event.target.value)}
          disabled={disabled}
          placeholder="Map Trusted Bums opportunity and claim fields to the client portal fields. Include required enums, owner IDs, territory rules, or duplicate-check behavior."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="deal-registration-fallback-email">Fallback email</Label>
          <Input
            id="deal-registration-fallback-email"
            value={value.fallback_email}
            onChange={(event) => update("fallback_email", event.target.value)}
            disabled={disabled}
            placeholder="deals@client.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deal-registration-fallback-instructions">Fallback instructions</Label>
          <Textarea
            id="deal-registration-fallback-instructions"
            rows={3}
            value={value.fallback_instructions}
            onChange={(event) => update("fallback_instructions", event.target.value)}
            disabled={disabled}
            placeholder="Use email if API submission fails, then Client Admin updates status manually."
          />
        </div>
      </div>
    </div>
  );
}
