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

  it("allows three audited skips only for updated standard terms with a prior acceptance", () => {
    expect(portalApiSource).toContain("const TERMS_DEFERRAL_LIMIT = 3;");
    expect(portalApiSource).toContain("function noTermsDeferral()");
    expect(portalApiSource).toContain("function scopePriorAcceptanceQuery");
    expect(portalApiSource).toContain("query.eq(\"company_id\", user.clientId)");
    expect(portalApiSource).toContain("export async function deferPartnerTerms");
    expect(portalApiSource).toContain("if (terms.is_custom)");
    expect(portalApiSource).toContain("async function getPriorStandardTermsAcceptance(user: AuthUser, terms: TermsVersion)");
    expect(portalApiSource).toContain(".eq(\"terms_versions.audience\", terms.audience)");
    expect(portalApiSource).toContain(".eq(\"terms_versions.is_custom\", false)");
    expect(portalApiSource).toContain("const priorAcceptance = await getPriorStandardTermsAcceptance(user, terms);");
    expect(portalApiSource).toContain("return { terms: assignedTerms, acceptance: null, assignment, deferral: noTermsDeferral() };");
    expect(portalApiSource).toContain("terms_acceptance_deferred");
  });
});
