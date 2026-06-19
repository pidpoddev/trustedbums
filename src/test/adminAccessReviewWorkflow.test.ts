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
    expect(adminClientsSource).toContain("accessReviewPreview(selectedRequest)");
    expect(adminClientsSource).toContain("selectedRequestNeedsProof && !reviewProofCategory");
    expect(adminClientsSource).toContain("reviewNoteRequired && !reviewNote.trim()");
    expect(adminClientsSource).toContain("Required for public-email company, related-domain, and company identity reviews.");
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
    expect(adminAccessRequestsSource).toContain("\"COMPANY_IDENTITY_CHANGE\"");
    expect(adminAccessRequestsSource).toContain("requiresProofCategory(requestType) && !evidence.proofCategory");
    expect(adminAccessRequestsSource).toContain("(requiresProofCategory(requestType) || action === \"deny\") && !evidence.reviewNote");
    expect(adminAccessRequestsSource).toContain("Choose a proof category before reviewing this access request.");
    expect(adminAccessRequestsSource).toContain("Add a reviewer note before reviewing this access request.");
    expect(adminAccessRequestsSource).toContain("assertReviewEvidence(\"approve\"");
    expect(adminAccessRequestsSource).toContain("assertReviewEvidence(\"deny\"");
    expect(adminAccessRequestsSource).toContain("review_note: buildReviewNote(evidence)");
    expect(adminAccessRequestsSource).toContain("proofCategory: evidence.proofCategory");
    expect(adminAccessRequestsSource).toContain("reviewNote: evidence.reviewNote");
    expect(adminAccessRequestsSource).toContain("resultingState");
    expect(adminAccessRequestsSource).toContain("if (accessRequest.request_type === \"COMPANY_IDENTITY_CHANGE\")");
    expect(adminAccessRequestsSource).toContain(".from(\"company_domains\")");
    expect(portalApiSource).toContain("requestClientCompanyIdentityChange");
    expect(portalApiSource).toContain("request_identity_change");
  });
});
