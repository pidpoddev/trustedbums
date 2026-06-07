import { readFileSync } from "node:fs";

const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const customerTargetPolicySource = readFileSync(
  "supabase/migrations/20260607194500_remove_saved_target_read_entitlement.sql",
  "utf8",
);

describe("customer target company rules", () => {
  it("creates client target companies as prospects", () => {
    const createCustomerTargetBody = portalApiSource.match(/export async function createCustomerTarget[\s\S]*?return data;\n}/)?.[0] ?? "";

    expect(createCustomerTargetBody).toContain('relationshipStage: "PROSPECT"');
    expect(createCustomerTargetBody).not.toContain('relationshipStage: "INACTIVE"');
  });

  it("does not grant Bum customer target reads from saved items alone", () => {
    expect(customerTargetPolicySource).toContain('"Bums can read explicitly assigned customer targets"');
    expect(customerTargetPolicySource).toContain("public.customer_target_responses");
    expect(customerTargetPolicySource).toContain("response.status in ('ACCEPTED', 'CONTACTED', 'MEETING_SET')");
    expect(customerTargetPolicySource).toContain("public.teams_meetings");
    expect(customerTargetPolicySource).not.toContain("public.bum_saved_items");
  });
});
