import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dealRegistrationModelSource = readFileSync("src/lib/dealRegistration.ts", "utf8");
const dealRegistrationSettingsSource = readFileSync("src/components/DealRegistrationBetaSettings.tsx", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const clientProfileSource = readFileSync("src/pages/client/ClientProfile.tsx", "utf8");
const adminClientsSource = readFileSync("src/pages/admin/AdminClients.tsx", "utf8");
const migrationSource = readFileSync("supabase/migrations/20260611195500_add_client_deal_registration_config.sql", "utf8");

describe("deal registration beta workflow", () => {
  it("stores beta deal registration setup on client companies", () => {
    expect(migrationSource).toContain("deal_registration_config jsonb");
    expect(migrationSource).toContain("Store provider metadata and secret references only");
    expect(portalApiSource).toContain("deal_registration_config: DealRegistrationConfig");
    expect(portalApiSource).toContain("updateOwnClientDealRegistrationConfig");
    expect(portalApiSource).toContain('user.clientAccessRole !== "CLIENT_ADMIN" && user.clientAccessRole !== "CLIENT_IT"');
  });

  it("supports API providers without storing raw credentials in the UI", () => {
    expect(dealRegistrationModelSource).toContain('"SALESFORCE"');
    expect(dealRegistrationModelSource).toContain('"ZENDESK_SELL"');
    expect(dealRegistrationModelSource).toContain('"CUSTOM_API"');
    expect(dealRegistrationSettingsSource).toContain("Do not paste API keys or passwords here");
    expect(dealRegistrationSettingsSource).toContain("Credential reference");
  });

  it("surfaces the beta setup for Client Admins and Trusted Bums Admins", () => {
    expect(clientProfileSource).toContain("Deal Registration Beta Setup");
    expect(clientProfileSource).toContain("Save Deal Registration Beta Setup");
    expect(adminClientsSource).toContain("DealRegistrationBetaSettings");
    expect(adminClientsSource).toContain("Deal Reg");
    expect(adminClientsSource).toContain("dealRegistrationConfig");
  });
});
