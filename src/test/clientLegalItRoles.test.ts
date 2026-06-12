import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const authDataSource = readFileSync("src/data/authData.ts", "utf8");
const clientTeamSource = readFileSync("src/pages/client/ClientTeam.tsx", "utf8");
const clientDashboardSource = readFileSync("src/pages/client/ClientDashboard.tsx", "utf8");
const clientAgreementsSource = readFileSync("src/pages/client/ClientAgreements.tsx", "utf8");
const clientProfileSource = readFileSync("src/pages/client/ClientProfile.tsx", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const clientTeamFunctionSource = readFileSync("supabase/functions/client-team/index.ts", "utf8");
const profileBootstrapSource = readFileSync("supabase/functions/profile-bootstrap/index.ts", "utf8");
const rolesMigrationSource = readFileSync("supabase/migrations/20260611202000_add_client_legal_it_roles.sql", "utf8");

describe("client legal and IT access roles", () => {
  it("defines and labels Client Legal and Client IT roles across auth and team management", () => {
    expect(authDataSource).toContain('"CLIENT_LEGAL"');
    expect(authDataSource).toContain('"CLIENT_IT"');
    expect(authDataSource).toContain("Client Legal");
    expect(authDataSource).toContain("Client IT");
    expect(clientTeamSource).toContain("Client Legal");
    expect(clientTeamSource).toContain("Client IT");
    expect(clientTeamFunctionSource).toContain('"CLIENT_LEGAL"');
    expect(clientTeamFunctionSource).toContain('"CLIENT_IT"');
    expect(profileBootstrapSource).toContain('"CLIENT_LEGAL"');
    expect(profileBootstrapSource).toContain('"CLIENT_IT"');
    expect(rolesMigrationSource).toContain("'CLIENT_LEGAL'");
    expect(rolesMigrationSource).toContain("'CLIENT_IT'");
  });

  it("routes Legal users to agreement redlines and IT users to integration setup", () => {
    expect(clientDashboardSource).toContain('clientAccessRole === "CLIENT_LEGAL"');
    expect(clientDashboardSource).toContain('clientAccessRole === "CLIENT_IT"');
    expect(clientAgreementsSource).toContain("Legal redlines and amendments");
    expect(clientAgreementsSource).toContain("createConversationThread");
    expect(clientProfileSource).toContain('user?.clientAccessRole === "CLIENT_IT"');
    expect(clientProfileSource).toContain("API Access");
    expect(clientProfileSource).toContain("listOwnApiAccessKeys");
    expect(clientProfileSource).toContain("createOwnApiAccessKey");
    expect(clientProfileSource).toContain("refreshOwnApiAccessKey");
    expect(clientProfileSource).toContain("revokeOwnApiAccessKey");
    expect(portalApiSource).toContain('user.clientAccessRole !== "CLIENT_ADMIN" && user.clientAccessRole !== "CLIENT_IT"');
  });
});
