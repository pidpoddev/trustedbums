import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const functionSource = readFileSync("supabase/functions/api-access-keys/index.ts", "utf8");
const migrationSource = readFileSync("supabase/migrations/20260612154500_add_api_access_key_metadata.sql", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const supabaseConfigSource = readFileSync("supabase/config.toml", "utf8");

describe("API access key management", () => {
  it("creates a client-owned API access key metadata model with admin and client-manager RLS", () => {
    expect(migrationSource).toContain("create table if not exists public.api_access_keys");
    expect(migrationSource).toContain("clerk_api_key_id text not null unique");
    expect(migrationSource).toContain("subject_user_id text not null references public.profiles(id)");
    expect(migrationSource).toContain("constraint api_access_keys_client_owner_check check (company_id is not null)");
    expect(migrationSource).toContain("alter table public.api_access_keys enable row level security");
    expect(migrationSource).toContain("using (private.is_admin())");
    expect(migrationSource).toContain("Client API managers can read company API keys");
    expect(migrationSource).toContain("profile.client_access_role in ('CLIENT_ADMIN', 'CLIENT_IT')");
  });

  it("keeps Clerk key lifecycle operations behind an authenticated Edge Function", () => {
    expect(supabaseConfigSource).toContain("[functions.api-access-keys]");
    expect(functionSource).toContain("resolveAllowedClerkIssuer");
    expect(functionSource).toContain("This Clerk session was issued by an unapproved tenant.");
    expect(functionSource).toContain("CLERK_SECRET_KEY is not configured for API key management.");
    expect(functionSource).toContain('"/api_keys"');
    expect(functionSource).toContain("/revoke");
    expect(functionSource).toContain("trustedbums:client:read");
    expect(functionSource).toContain("trustedbums:inbox:send");
    expect(functionSource).toContain("api_access_key_created");
    expect(functionSource).toContain("api_access_key_revoked");
  });

  it("exposes self-service and admin API access key helpers", () => {
    expect(portalApiSource).toContain('functions/v1/api-access-keys');
    expect(portalApiSource).toContain("API_ACCESS_SCOPES");
    expect(portalApiSource).toContain("listOwnApiAccessKeys");
    expect(portalApiSource).toContain("createOwnApiAccessKey");
    expect(portalApiSource).toContain("refreshOwnApiAccessKey");
    expect(portalApiSource).toContain("revokeOwnApiAccessKey");
    expect(portalApiSource).toContain("listAdminApiAccessKeys");
    expect(portalApiSource).toContain("createAdminApiAccessKeyForProfile");
    expect(portalApiSource).toContain("refreshAdminApiAccessKey");
    expect(portalApiSource).toContain("revokeAdminApiAccessKey");
  });
});
