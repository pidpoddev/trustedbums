import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const bumContactsSource = readFileSync("src/pages/bum/BumContacts.tsx", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const portalContactsFunctionSource = readFileSync("supabase/functions/portal-contacts/index.ts", "utf8");
const innerCircleMigrationSource = readFileSync("supabase/migrations/20260618100000_add_inner_circle_contacts.sql", "utf8");
const qaAuthorizationCleanup = readFileSync("supabase/qa_authorization_cleanup.sql", "utf8");

describe("Bum manual contact mutation contract", () => {
  it("keeps Add contact validation, mutation, cache update, and analytics wired from the Bum page", () => {
    expect(bumContactsSource).toContain('if (!contactForm.name.trim()) throw new Error("Contact name is required.");');
    expect(bumContactsSource).toContain("createBumRepresentedContact({");
    expect(bumContactsSource).toContain('trackAnalyticsEvent("trustedbums_contact_added"');
    expect(bumContactsSource).toContain("isInnerCircle: contactForm.isInnerCircle");
    expect(bumContactsSource).toContain("inner_circle: contactForm.isInnerCircle");
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
    expect(portalContactsFunctionSource).toContain("is_inner_circle: payload.is_inner_circle ?? false");
    expect(portalContactsFunctionSource).toContain('status: "ACTIVE"');
    expect(portalContactsFunctionSource).toContain('return getContactDetail(userId, data.id)');
  });

  it("adds a capped Inner Circle designation to My Contacts", () => {
    expect(innerCircleMigrationSource).toContain("add column if not exists is_inner_circle boolean not null default false");
    expect(innerCircleMigrationSource).toContain("enforce_bum_inner_circle_limit");
    expect(innerCircleMigrationSource).toContain("Inner Circle is limited to 20 contacts.");
    expect(innerCircleMigrationSource).toContain("where is_inner_circle and source_type <> 'OPPORTUNITY_CLAIM'");
    expect(bumContactsSource).toContain("Inner Circle is your private set of strongest trusted relationships.");
    expect(bumContactsSource).toContain("maximum 20 contacts for now");
    expect(bumContactsSource).toContain("{innerCircleCount}/20");
    expect(bumContactsSource).toContain("contact.isInnerCircle");
    expect(portalApiSource).toContain("isInnerCircle: boolean");
    expect(portalContactsFunctionSource).toContain("isInnerCircle: Boolean(row.is_inner_circle)");
    expect(portalContactsFunctionSource).toContain("if (\"isInnerCircle\" in patch) payload.is_inner_circle = patch.isInnerCircle === true;");
  });

  it("lets Bums delete contacts unless they are already attached to a Claim", () => {
    expect(bumContactsSource).toContain("deleteBumRepresentedContact(contact.id)");
    expect(bumContactsSource).toContain('contact.source === "OPPORTUNITY_CLAIM"');
    expect(bumContactsSource).toContain("Contacts attached to a Claim cannot be deleted.");
    expect(bumContactsSource).toContain("Delete");
    expect(portalApiSource).toContain('invokePortalContacts<{ deleted: boolean; contactId: string }>({ action: "delete", contactId })');
    expect(portalContactsFunctionSource).toContain("async function deleteContact(userId: string, contactId: string)");
    expect(portalContactsFunctionSource).toContain('if (contact.source_type === "OPPORTUNITY_CLAIM")');
    expect(portalContactsFunctionSource).toContain('throw new Error("Contacts attached to a Claim cannot be deleted.");');
    expect(portalContactsFunctionSource).toContain('.from("bum_contacts")');
    expect(portalContactsFunctionSource).toContain(".delete()");
    expect(portalContactsFunctionSource).toContain('if (action === "delete") return json(200, await deleteContact(profile.id, contactId));');
  });

  it("fails closed unless the portal contacts token issuer matches configured Clerk issuer", () => {
    expect(portalContactsFunctionSource).toContain("resolveAllowedClerkIssuer");
    expect(portalContactsFunctionSource).toContain('throw new Error("The portal contacts Clerk issuer is not configured.")');
    expect(portalContactsFunctionSource).toContain('throw new Error("This Clerk session was issued by an unapproved tenant.")');
    expect(portalContactsFunctionSource).toContain('const jwksUrl = new URL("/.well-known/jwks.json", allowedIssuer).toString();');
    expect(portalContactsFunctionSource).toContain("{ issuer: allowedIssuer }");
    expect(portalContactsFunctionSource).not.toContain("issuer?.trim() || clerkFrontendApiUrl?.trim()");
    expect(portalContactsFunctionSource).not.toContain("{ issuer: payload.iss }");
  });

  it("keeps manual contact mutation cleanup-safe for seeded QA runs", () => {
    expect(qaAuthorizationCleanup).toContain("delete from public.bum_contacts");
    expect(qaAuthorizationCleanup).toContain("metadata->>'fixture' = 'qa_authorization'");
    expect(qaAuthorizationCleanup).toContain("select 'bum_contacts', count(*)");
    expect(qaAuthorizationCleanup).toContain("All counts should be zero after cleanup.");
  });
});
