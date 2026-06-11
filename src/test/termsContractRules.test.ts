import { readFileSync } from "node:fs";
import { footerLegalLinks, getLegalDocument } from "@/data/legalDocuments";
import { PARTNER_FAQ_BODY, parseFaq } from "@/data/partnerTerms";
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

  it("requires a current auth session before the UI can spend a terms skip", () => {
    const clientTermsSource = readFileSync("src/pages/client/ClientTerms.tsx", "utf8");

    expect(clientTermsSource).toContain("const canSkipThisLogin = canDeferCurrentTerms && Boolean(session?.id);");
    expect(clientTermsSource).toContain("if (!session?.id)");
    expect(clientTermsSource).toContain("await deferPartnerTerms(user, terms, navigator.userAgent ?? null, session.id);");
  });

  it("keeps the client agreement FAQ useful for legal review", () => {
    const faqItems = parseFaq(PARTNER_FAQ_BODY);
    const questions = faqItems.map((item) => item.question);
    const publicFaq = getLegalDocument("client-agreement-faq");

    expect(faqItems).toHaveLength(18);
    expect(questions).toContain("What is the purpose of this Client Agreement?");
    expect(questions).toContain("Why are opportunity registration rules broad?");
    expect(questions).toContain("Why does the client keep responsibility for products, pricing, proposals, contracts, and delivery?");
    expect(questions).toContain("Why is liability limited?");
    expect(PARTNER_FAQ_BODY).toContain("legal reviewers");
    expect(PARTNER_FAQ_BODY).toContain("more specific approved document controls");
    expect(publicFaq?.sections).toHaveLength(faqItems.length);
    expect(footerLegalLinks).toContainEqual({ to: "/legal/client-agreement-faq", label: "Client Agreement FAQ" });
  });
});
