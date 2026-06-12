import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationSource = readFileSync("supabase/migrations/20260612154500_add_api_access_key_metadata.sql", "utf8");
const functionSource = readFileSync("supabase/functions/api-access-keys/index.ts", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const clientProfileSource = readFileSync("src/pages/client/ClientProfile.tsx", "utf8");
const adminPageSource = readFileSync("src/pages/admin/AdminApiAccess.tsx", "utf8");
const adminLayoutSource = readFileSync("src/layouts/AdminLayout.tsx", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const configSource = readFileSync("supabase/config.toml", "utf8");

describe("API access key management", () => {
  it("stores only API key metadata with admin and Client IT/Admin read policy", () => {
    expect(migrationSource).toContain("create table if not exists public.api_access_keys");
    expect(migrationSource).toContain("clerk_api_key_id text not null unique");
    expect(migrationSource).toContain("token_prefix text");
    expect(migrationSource).not.toContain("secret text");
    expect(migrationSource).toContain("private.is_admin()");
    expect(migrationSource).toContain("CLIENT_ADMIN");
    expect(migrationSource).toContain("CLIENT_IT");
    expect(migrationSource).toContain("grant select on public.api_access_keys to authenticated");
  });

  it("creates and revokes Clerk API keys from a pinned-issuer Edge Function", () => {
    expect(functionSource).toContain("CLERK_SECRET_KEY");
    expect(functionSource).toContain("https://api.clerk.com/v1");
    expect(functionSource).toContain('"/api_keys"');
    expect(functionSource).toContain("`/api_keys/${encodeURIComponent(clerkApiKeyId)}/revoke`");
    expect(functionSource).toContain("resolveAllowedClerkIssuer");
    expect(functionSource).toContain("CLIENT_ADMIN");
    expect(functionSource).toContain("CLIENT_IT");
    expect(functionSource).toContain("api_access_key_refreshed");
    expect(configSource).toContain("[functions.api-access-keys]");
  });

  it("exposes typed portal operations for client and admin token management", () => {
    expect(portalApiSource).toContain("export async function listOwnApiAccessKeys");
    expect(portalApiSource).toContain("export async function createOwnApiAccessKey");
    expect(portalApiSource).toContain("export async function refreshOwnApiAccessKey");
    expect(portalApiSource).toContain("export async function revokeOwnApiAccessKey");
    expect(portalApiSource).toContain("export async function listAdminApiAccessKeys");
    expect(portalApiSource).toContain("functions/v1/api-access-keys");
  });

  it("adds client self-service and admin management UI", () => {
    expect(clientProfileSource).toContain("API Access");
    expect(clientProfileSource).toContain("Client Admin and Client IT users");
    expect(clientProfileSource).toContain("refreshOwnApiAccessKey");
    expect(clientProfileSource).toContain("revokeOwnApiAccessKey");
    expect(adminPageSource).toContain("Generate Client Token");
    expect(adminPageSource).toContain("createAdminApiAccessKeyForProfile");
    expect(adminPageSource).toContain("refreshAdminApiAccessKey");
    expect(adminLayoutSource).toContain("API Access");
    expect(appSource).toContain('path="api-access"');
  });
});
