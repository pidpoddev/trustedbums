import { describe, expect, it } from "vitest";
import {
  opportunityOriginLabel,
  opportunityStageLabel,
  stageFromClaimStatus,
  stageFromIntroRequestStatus,
  stageFromRegistrationStatus,
  stageFromReverseOpportunityStatus,
  stageFromTargetResponseStatus,
  stageFromTargetStatus,
} from "@/lib/opportunityModel";

describe("opportunity model labels", () => {
  it("keeps approved origin labels stable", () => {
    expect(opportunityOriginLabel("CLIENT_ORIGINATED")).toBe("Client-Originated");
    expect(opportunityOriginLabel("BUM_ORIGINATED")).toBe("Bum-Originated");
    expect(opportunityOriginLabel("CUSTOMER_ORIGINATED")).toBe("Customer-Originated");
    expect(opportunityOriginLabel("ADMIN_ORIGINATED")).toBe("Admin-Originated");
    expect(opportunityOriginLabel("IMPORTED")).toBe("Imported");
  });

  it("maps Client-Originated registration statuses into canonical stages", () => {
    expect(opportunityStageLabel(stageFromRegistrationStatus("Submitted"))).toBe("Intake");
    expect(opportunityStageLabel(stageFromRegistrationStatus("Needs Clarification"))).toBe("Needs Clarification");
    expect(opportunityStageLabel(stageFromRegistrationStatus("Accepted"))).toBe("Open Opportunity");
    expect(opportunityStageLabel(stageFromRegistrationStatus("Closed Won"))).toBe("Revenue Confirmed");
    expect(opportunityStageLabel(stageFromRegistrationStatus("Closed Lost"))).toBe("Closed Lost");
  });

  it("maps target, response, claim, intro-request, and Customer Lead statuses", () => {
    expect(opportunityStageLabel(stageFromTargetStatus("INTRO_IN_PROGRESS"))).toBe("Intro In Progress");
    expect(opportunityStageLabel(stageFromTargetResponseStatus("PROPOSED"))).toBe("Intro Requested");
    expect(opportunityStageLabel(stageFromClaimStatus("APPROVED"))).toBe("Accepted Claim");
    expect(opportunityStageLabel(stageFromIntroRequestStatus("INTRO_REQUESTED"))).toBe("Intro Requested");
    expect(opportunityStageLabel(stageFromReverseOpportunityStatus("CLIENT_INTERESTED"))).toBe("Open Opportunity");
  });
});
