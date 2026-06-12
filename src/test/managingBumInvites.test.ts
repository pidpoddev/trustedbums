import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const inviteBumFunctionSource = readFileSync("supabase/functions/invite-bum/index.ts", "utf8");
const profileBootstrapSource = readFileSync("supabase/functions/profile-bootstrap/index.ts", "utf8");
const dashboardSource = readFileSync("src/pages/bum/BumDashboard.tsx", "utf8");
const teamManagementSource = readFileSync("src/pages/bum/BumTeamManagement.tsx", "utf8");
const inviteMigrationSource = readFileSync("supabase/migrations/20260612170000_add_managing_bum_invite_attachment.sql", "utf8");
const emailTemplatesMigrationSource = readFileSync("supabase/migrations/20260612181500_add_managing_bum_email_templates.sql", "utf8");

describe("Managing Bum invites", () => {
  it("allows only Admins or Managing Bums to invite Bums", () => {
    expect(inviteBumFunctionSource).toContain("const isAdminInvite = currentProfile.is_admin || currentProfile.role === \"ADMIN\";");
    expect(inviteBumFunctionSource).toContain("const isManagingBumInvite = Boolean(managingBumProfile?.is_managing_bum);");
    expect(inviteBumFunctionSource).toContain("Only Admins and Managing Bums can invite Bums.");
  });

  it("stores pending team attachments by invite email", () => {
    expect(inviteMigrationSource).toContain("alter column member_bum_user_id drop not null");
    expect(inviteMigrationSource).toContain("bum_team_memberships_manager_invite_email_unique");
    expect(inviteMigrationSource).toContain("bum_team_memberships_invite_email_idx");
    expect(inviteBumFunctionSource).toContain("createPendingTeamMembership");
    expect(inviteBumFunctionSource).toContain("status: existingProfile?.role === \"BUM\" ? \"ACTIVE\" : \"INVITED\"");
    expect(inviteBumFunctionSource).toContain("clerk_invitation_id");
  });

  it("attaches the invited signup to the Managing Bum team during profile bootstrap", () => {
    expect(profileBootstrapSource).toContain("async function attachPendingManagingBumInvite");
    expect(profileBootstrapSource).toContain(".ilike(\"invite_email\", email)");
    expect(profileBootstrapSource).toContain("member_bum_user_id: userId");
    expect(profileBootstrapSource).toContain("status: \"ACTIVE\"");
    expect(profileBootstrapSource).toContain("managing_bum_invite_attached");
  });

  it("notifies the Managing Bum through the Microsoft-backed email function when an invite attaches", () => {
    expect(emailTemplatesMigrationSource).toContain("managing_bum_welcome");
    expect(emailTemplatesMigrationSource).toContain("managing_bum_team_signup");
    expect(emailTemplatesMigrationSource).toContain("MANAGING_BUM_TEAM_MEMBER_SIGNED_UP");
    expect(profileBootstrapSource).toContain("async function sendManagingBumTeamSignupNotice");
    expect(profileBootstrapSource).toContain("templateSlug: \"managing_bum_team_signup\"");
    expect(profileBootstrapSource).toContain("triggeredBy: \"MANAGING_BUM_TEAM_MEMBER_SIGNED_UP\"");
    expect(profileBootstrapSource).toContain("x-internal-email");
  });

  it("surfaces the invite action only in Managing Bum Team Management", () => {
    expect(dashboardSource).toContain("const isManagingBum = Boolean(profileQuery.data?.is_managing_bum);");
    expect(dashboardSource).toContain("{isManagingBum ? (");
    expect(dashboardSource).toContain("Managing Bum team");
    expect(dashboardSource).toContain("<Link to=\"/bum/team\">Team Management</Link>");
    expect(teamManagementSource).toContain("if (!profileQuery.isLoading && !isManagingBum)");
    expect(teamManagementSource).toContain("Invite Bum");
    expect(teamManagementSource).toContain("inviteBum({");
  });
});
