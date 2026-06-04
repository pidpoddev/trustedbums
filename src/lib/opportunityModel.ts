import type {
  ClientBumIntroRequestStatus,
  CustomerTargetResponseRecord,
  CustomerTargetStatus,
  OpportunityClaimStatus,
  RegistrationStatus,
  ReverseOpportunityStatus,
} from "@/lib/portalApi";

export type OpportunityOrigin =
  | "CLIENT_ORIGINATED"
  | "BUM_ORIGINATED"
  | "CUSTOMER_ORIGINATED"
  | "ADMIN_ORIGINATED"
  | "IMPORTED";

export type OpportunityStage =
  | "INTAKE"
  | "QUALIFYING"
  | "INTRO_REQUESTED"
  | "INTRO_IN_PROGRESS"
  | "MEETING_SET"
  | "OPEN_OPPORTUNITY"
  | "NEEDS_CLARIFICATION"
  | "ACCEPTED_CLAIM"
  | "REVENUE_CONFIRMED"
  | "CLOSED_LOST";

export const opportunityOriginLabels: Record<OpportunityOrigin, string> = {
  CLIENT_ORIGINATED: "Client-Originated",
  BUM_ORIGINATED: "Bum-Originated",
  CUSTOMER_ORIGINATED: "Customer-Originated",
  ADMIN_ORIGINATED: "Admin-Originated",
  IMPORTED: "Imported",
};

export const opportunityStageLabels: Record<OpportunityStage, string> = {
  INTAKE: "Intake",
  QUALIFYING: "Qualifying",
  INTRO_REQUESTED: "Intro Requested",
  INTRO_IN_PROGRESS: "Intro In Progress",
  MEETING_SET: "Meeting Set",
  OPEN_OPPORTUNITY: "Open Opportunity",
  NEEDS_CLARIFICATION: "Needs Clarification",
  ACCEPTED_CLAIM: "Accepted Claim",
  REVENUE_CONFIRMED: "Revenue Confirmed",
  CLOSED_LOST: "Closed Lost",
};

export function opportunityOriginLabel(origin: OpportunityOrigin) {
  return opportunityOriginLabels[origin];
}

export function opportunityStageLabel(stage: OpportunityStage) {
  return opportunityStageLabels[stage];
}

export function stageFromRegistrationStatus(status: RegistrationStatus): OpportunityStage {
  if (status === "Draft" || status === "Submitted") return "INTAKE";
  if (status === "Needs Clarification" || status === "Disputed") return "NEEDS_CLARIFICATION";
  if (status === "Accepted") return "OPEN_OPPORTUNITY";
  if (status === "Closed Won") return "REVENUE_CONFIRMED";
  return "CLOSED_LOST";
}

export function stageFromTargetStatus(status: CustomerTargetStatus): OpportunityStage {
  if (status === "PROSPECT") return "INTAKE";
  if (status === "QUALIFYING") return "QUALIFYING";
  if (status === "INTRO_REQUESTED") return "INTRO_REQUESTED";
  if (status === "INTRO_IN_PROGRESS") return "INTRO_IN_PROGRESS";
  if (status === "MEETING_SET") return "MEETING_SET";
  if (status === "OPEN_OPPORTUNITY") return "OPEN_OPPORTUNITY";
  if (status === "CLOSED_WON") return "REVENUE_CONFIRMED";
  return "CLOSED_LOST";
}

export function stageFromReverseOpportunityStatus(status: ReverseOpportunityStatus): OpportunityStage {
  if (status === "SUBMITTED") return "INTAKE";
  if (status === "OUTREACH_READY" || status === "CLIENT_CONTACTED") return "QUALIFYING";
  if (status === "CLIENT_INTERESTED" || status === "CONVERTED") return "OPEN_OPPORTUNITY";
  return "CLOSED_LOST";
}

export function stageFromTargetResponseStatus(status: CustomerTargetResponseRecord["status"]): OpportunityStage {
  if (status === "PROPOSED") return "INTRO_REQUESTED";
  if (status === "ACCEPTED" || status === "CONTACTED") return "INTRO_IN_PROGRESS";
  if (status === "MEETING_SET") return "MEETING_SET";
  return "CLOSED_LOST";
}

export function stageFromClaimStatus(status: OpportunityClaimStatus): OpportunityStage {
  if (status === "PROPOSED") return "INTRO_REQUESTED";
  if (status === "APPROVED") return "ACCEPTED_CLAIM";
  if (status === "SCHEDULED") return "MEETING_SET";
  if (status === "MEETING_HELD" || status === "CLOSED") return "REVENUE_CONFIRMED";
  return status === "DISPUTED" ? "NEEDS_CLARIFICATION" : "CLOSED_LOST";
}

export function stageFromIntroRequestStatus(status: ClientBumIntroRequestStatus): OpportunityStage {
  if (status === "SUBMITTED" || status === "IN_REVIEW") return "INTAKE";
  if (status === "INTRO_REQUESTED") return "INTRO_REQUESTED";
  return "CLOSED_LOST";
}
