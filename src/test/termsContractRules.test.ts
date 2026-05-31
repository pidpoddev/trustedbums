import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");

describe("terms contract rules", () => {
  it("lets assigned custom contracts replace standard terms requirements", () => {
    expect(portalApiSource).toContain("const customAssignments = assignments.filter((assignment) => assignment.terms_versions?.is_custom);");
    expect(portalApiSource).toContain("if (customAssignments.length)");
    expect(portalApiSource.indexOf("if (customAssignments.length)")).toBeLessThan(
      portalApiSource.indexOf("const defaultTerms = user.role === \"BUM\""),
    );
    expect(portalApiSource).toContain("assignments.filter((item) => !item.terms_versions?.is_custom)");
  });
});
