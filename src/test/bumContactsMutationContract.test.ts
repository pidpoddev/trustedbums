import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const bumContactsSource = readFileSync("src/pages/bum/BumContacts.tsx", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const portalContactsFunctionSource = readFileSync("supabase/functions/portal-contacts/index.ts", "utf8");
const qaAuthorizationCleanup = readFileSync("supabase/qa_authorization_cleanup.sql", "utf8");

describe("Bum manual contact mutation contract", () => {
  it("keeps Add contact validation, mutation, cache update, and analytics wired from the Bum page", () => {
    expect(bumContactsSource).toContain('if (!contactForm.name.trim()) throw new Error("Contact name is required.");');
    expect(bumContactsSource).toContain("createBumRepresentedContact({");
    expect(bumContactsSource).toContain('trackAnalyticsEvent("trustedbums_contact_added"');
    expect(bumContactsSource).toContain('queryClient.setQueryData<BumRepresentedContactRecord[]>(["bum-represented-contacts", user?.id]');
    expect(bumContactsSource).toContain('queryClient.invalidateQueries({ queryKey: ["bum-represented-contacts", user?.id] })');
    expect(bumContactsSource).toContain('queryClient.invalidateQueries({ queryKey: ["portal-search", "bum-contacts", user?.id] })');
    expect(bumContactsSource).toContain('disabled={!contactForm.name.trim() || addContactMutation.isPending}');
  });

  it("routes manual contact creation through the signed-in portal contacts Edge Function", () => {
    expect(portalApiSource).toContain('invokePortalContacts<BumContactDetailResponse>({ action: "create", patch: input })');
    expect(portalApiSource).toContain('throw new Error("Sign in again to add this contact.")');
    expect(portalContactsFunctionSource).toContain("async function createContact(userId: string, patch: Record<string, unknown>)");
    expect(portalContactsFunctionSource).toContain('if (!payload.full_name) throw new Error("Contact name is required.");');
    expect(portalContactsFunctionSource).toContain('.from("bum_contacts")');
    expect(portalContactsFunctionSource).toContain('source_type: "MANUAL"');
    expect(portalContactsFunctionSource).toContain("bum_user_id: userId");
    expect(portalContactsFunctionSource).toContain('status: "ACTIVE"');
    expect(portalContactsFunctionSource).toContain('return getContactDetail(userId, data.id)');
  });

  it("fails closed unless the portal contacts token issuer matches configured Clerk issuer", () => {
    expect(portalContactsFunctionSource).toContain('const expectedIssuer = clerkFrontendApiUrl?.trim();');
    expect(portalContactsFunctionSource).toContain('if (!expectedIssuer) throw new Error("The portal contacts Clerk issuer is not configured.");');
    expect(portalContactsFunctionSource).toContain('if (!issuer || issuer.trim() !== expectedIssuer) throw new Error("The current session token issuer is not trusted.");');
    expect(portalContactsFunctionSource).toContain('jose.createRemoteJWKSet(new URL(resolveClerkJwksUrl(payload.iss)))');
    expect(portalContactsFunctionSource).toContain("{ issuer: payload.iss }");
  });

  it("keeps manual contact mutation cleanup-safe for seeded QA runs", () => {
    expect(qaAuthorizationCleanup).toContain("delete from public.bum_contacts");
    expect(qaAuthorizationCleanup).toContain("metadata->>'fixture' = 'qa_authorization'");
    expect(qaAuthorizationCleanup).toContain("select 'bum_contacts', count(*)");
    expect(qaAuthorizationCleanup).toContain("All counts should be zero after cleanup.");
  });
});
