import { readFileSync } from "node:fs";

const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");

describe("customer target company rules", () => {
  it("creates client target companies as prospects", () => {
    const createCustomerTargetBody = portalApiSource.match(/export async function createCustomerTarget[\s\S]*?return data;\n}/)?.[0] ?? "";

    expect(createCustomerTargetBody).toContain('relationshipStage: "PROSPECT"');
    expect(createCustomerTargetBody).not.toContain('relationshipStage: "INACTIVE"');
  });
});
