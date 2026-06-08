import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const configSource = readFileSync("supabase/config.toml", "utf8");
const clientTeamSource = readFileSync("supabase/functions/client-team/index.ts", "utf8");
const profileBootstrapSource = readFileSync("supabase/functions/profile-bootstrap/index.ts", "utf8");
const adminAccessRequestsSource = readFileSync("supabase/functions/admin-access-requests/index.ts", "utf8");
const extensionApiSource = readFileSync("supabase/functions/extension-api-v1/index.ts", "utf8");
const sendAdminEmailSource = readFileSync("supabase/functions/send-admin-email/index.ts", "utf8");

function functionConfigBlock(slug: string) {
  const pattern = new RegExp(`\\[functions\\.${slug}\\][\\s\\S]*?(?=\\n\\[functions\\.|\\n\\[|$)`);
  return configSource.match(pattern)?.[0] ?? "";
}

describe("service-role edge function authorization contracts", () => {
  it("keeps service-role functions on explicit in-function Clerk verification", () => {
    for (const slug of [
      "client-team",
      "profile-bootstrap",
      "admin-access-requests",
      "extension-api-v1",
      "send-admin-email",
    ]) {
      expect(functionConfigBlock(slug)).toContain("verify_jwt = false");
    }

    for (const source of [
      clientTeamSource,
      profileBootstrapSource,
      adminAccessRequestsSource,
      extensionApiSource,
      sendAdminEmailSource,
    ]) {
      expect(source).toContain("jose.jwtVerify");
      expect(source).toContain("createRemoteJWKSet");
      expect(source).toContain("getBearerToken");
      expect(source).toContain("Missing bearer token.");
      expect(source).toContain(".from(\"profiles\")");
    }
  });

  it("requires client admins for client-team management and blocks cross-company escalation", () => {
    expect(clientTeamSource).toContain("function assertClientAdmin");
    expect(clientTeamSource).toContain("Only client admins can manage their company team.");
    expect(clientTeamSource).toContain("assertClientAdmin(currentProfile)");
    expect(clientTeamSource).toContain("That user already belongs to another client company.");
    expect(clientTeamSource).toContain("Choose a client team member from your company.");
    expect(clientTeamSource).toContain("You cannot remove your own client admin access.");
    expect(clientTeamSource).toContain("You cannot disable your own client admin access.");
    expect(clientTeamSource).toContain("Admin must review this type of company access request.");
    expect(clientTeamSource).toContain("client_team_role_updated");
    expect(clientTeamSource).toContain("client_team_member_disabled");
    expect(clientTeamSource).toContain("client_access_request_approved");
    expect(clientTeamSource).toContain("client_access_request_denied");
  });

  it("keeps profile bootstrap from trusting self-supplied authorization fields", () => {
    expect(profileBootstrapSource).toContain("readSignupIntent");
    expect(profileBootstrapSource).toContain("SAME_DOMAIN_ACCESS");
    expect(profileBootstrapSource).toContain("PUBLIC_EMAIL_COMPANY");
    expect(profileBootstrapSource).toContain("BUM_SIGNUP");
    expect(profileBootstrapSource).toContain("isSharedEmailDomain");
    expect(profileBootstrapSource).toContain("access_status: existing?.access_status ?? \"PENDING\"");
    expect(profileBootstrapSource).toContain("access_status: \"APPROVED\"");
    expect(profileBootstrapSource).toContain("client_access_role: \"CLIENT_ADMIN\"");
    expect(profileBootstrapSource).not.toContain("readClientAccessRole(publicMetadata");
    expect(profileBootstrapSource).not.toContain("readClientAccessRole(unsafeMetadata");
  });

  it("requires admins for admin access request review and records decisions", () => {
    expect(adminAccessRequestsSource).toContain("Only admins can review company access requests.");
    expect(adminAccessRequestsSource).toContain("PUBLIC_EMAIL_COMPANY");
    expect(adminAccessRequestsSource).toContain("RELATED_DOMAIN");
    expect(adminAccessRequestsSource).toContain("BUM_SIGNUP");
    expect(adminAccessRequestsSource).toContain("admin_access_request_approved");
    expect(adminAccessRequestsSource).toContain("admin_access_request_denied");
    expect(adminAccessRequestsSource).toContain("reviewed_by: admin.id");
    expect(adminAccessRequestsSource).toContain("reviewed_at: new Date().toISOString()");
    expect(adminAccessRequestsSource).toContain("assertReviewEvidence(\"approve\"");
    expect(adminAccessRequestsSource).toContain("assertReviewEvidence(\"deny\"");
    expect(adminAccessRequestsSource).toContain("proofCategory: evidence.proofCategory");
    expect(adminAccessRequestsSource).toContain("resultingState");
  });

  it("scopes extension context and captures by role and destination entitlement", () => {
    expect(extensionApiSource).toContain("function canAccessOpportunity");
    expect(extensionApiSource).toContain("function canAccessCustomerTarget");
    expect(extensionApiSource).toContain('normalizeRole(profile) === "CLIENT"');
    expect(extensionApiSource).toContain('normalizeRole(profile) === "BUM"');
    expect(extensionApiSource).toContain('opportunity.status === "Accepted"');
    expect(extensionApiSource).toContain("opportunity.company_id === profile.company_id");
    expect(extensionApiSource).toContain("target.client_company_id === profile.company_id");
    expect(extensionApiSource).toContain("You do not have access to that opportunity.");
    expect(extensionApiSource).toContain("You do not have access to that customer target.");
  });

  it("limits admin email operations to admins except self-only action emails", () => {
    expect(sendAdminEmailSource).toContain("function isAdmin");
    expect(sendAdminEmailSource).toContain("function isSelfOnlyCustomAction");
    expect(sendAdminEmailSource).toContain("Only admins can manage email tools.");
    expect(sendAdminEmailSource).toContain("Only admins can use manual messaging tools.");
    expect(sendAdminEmailSource).toContain("Manual-only templates cannot be action triggered.");
    expect(sendAdminEmailSource).toContain("Custom action-triggered email requires an admin.");
    expect(sendAdminEmailSource).toContain("Action-triggered email cannot override the template recipient group.");
    expect(sendAdminEmailSource).toContain("auditAdminEmailEvent");
  });
});
