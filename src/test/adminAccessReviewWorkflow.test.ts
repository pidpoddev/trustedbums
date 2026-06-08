import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const adminClientsSource = readFileSync("src/pages/admin/AdminClients.tsx", "utf8");
const adminAccessRequestsSource = readFileSync("supabase/functions/admin-access-requests/index.ts", "utf8");
const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");

describe("admin access-request proof-backed workflow", () => {
  it("shows a mutation preview and evidence capture before admin review", () => {
    expect(adminClientsSource).toContain("Mutation preview");
    expect(adminClientsSource).toContain("Proof category");
    expect(adminClientsSource).toContain("Reviewer note");
    expect(adminClientsSource).toContain("Approve and audit");
    expect(adminClientsSource).toContain("Deny and audit");
    expect(adminClientsSource).toContain("requestNeedsProof(request.request_type)");
    expect(adminClientsSource).toContain("openReviewDialog(request, \"approve\")");
    expect(adminClientsSource).toContain("openReviewDialog(request, \"deny\")");
  });

  it("sends proof metadata through the admin access request API", () => {
    expect(portalApiSource).toContain("approveAdminCompanyAccessRequestWithProof");
    expect(portalApiSource).toContain("proofCategory: review.proofCategory");
    expect(portalApiSource).toContain("reviewNote: review.reviewNote");
    expect(portalApiSource).toContain("denyAdminCompanyAccessRequest(");
    expect(portalApiSource).toContain("proofCategory,");
  });

  it("enforces proof and note requirements in the service-role function", () => {
    expect(adminAccessRequestsSource).toContain("proofRequiredRequestTypes");
    expect(adminAccessRequestsSource).toContain("\"PUBLIC_EMAIL_COMPANY\"");
    expect(adminAccessRequestsSource).toContain("\"RELATED_DOMAIN\"");
    expect(adminAccessRequestsSource).toContain("Choose a proof category before reviewing this access request.");
    expect(adminAccessRequestsSource).toContain("Add a reviewer note before reviewing this access request.");
    expect(adminAccessRequestsSource).toContain("assertReviewEvidence(\"approve\"");
    expect(adminAccessRequestsSource).toContain("assertReviewEvidence(\"deny\"");
    expect(adminAccessRequestsSource).toContain("proofCategory: evidence.proofCategory");
    expect(adminAccessRequestsSource).toContain("resultingState");
  });
});
