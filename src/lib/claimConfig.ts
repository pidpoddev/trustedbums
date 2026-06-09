import type { OpportunityClaimStatus, OpportunityClaimStrength } from "@/lib/portalApi";

type StatusVariant = "success" | "warning" | "destructive" | "info" | "default";

export type ClaimStatus = OpportunityClaimStatus;
export type RelationshipStrength = OpportunityClaimStrength;
export type ClaimDeclineReason = "ALREADY_CONNECTED" | "NO_LONGER_OPPORTUNITY" | "WRONG_CONTACT_LEVEL" | "NOT_RELEVANT" | "DUPLICATE" | "OTHER";

export const claimStatuses: ClaimStatus[] = [
  "PROPOSED",
  "APPROVED",
  "DECLINED",
  "SCHEDULED",
  "MEETING_HELD",
  "EXPIRED",
  "DISPUTED",
  "CLOSED",
];

export const relationshipStrengths: RelationshipStrength[] = ["STRONG", "MODERATE", "WEAK"];

export const claimDeclineReasons: Array<{ value: ClaimDeclineReason; label: string }> = [
  { value: "ALREADY_CONNECTED", label: "Already Connected" },
  { value: "NO_LONGER_OPPORTUNITY", label: "No longer an Opportunity" },
  { value: "WRONG_CONTACT_LEVEL", label: "Not the right level of contact" },
  { value: "NOT_RELEVANT", label: "Not relevant" },
  { value: "DUPLICATE", label: "Duplicate" },
  { value: "OTHER", label: "Other" },
];

export function claimDeclineReasonLabel(value?: ClaimDeclineReason | null) {
  return claimDeclineReasons.find((reason) => reason.value === value)?.label ?? null;
}

export const claimStatusConfig: Record<ClaimStatus, { label: string; variant: StatusVariant }> = {
  PROPOSED: { label: "Proposed", variant: "info" },
  APPROVED: { label: "Approved", variant: "success" },
  DECLINED: { label: "Declined", variant: "destructive" },
  SCHEDULED: { label: "Scheduled", variant: "warning" },
  MEETING_HELD: { label: "Meeting Held", variant: "success" },
  EXPIRED: { label: "Expired", variant: "destructive" },
  DISPUTED: { label: "Disputed", variant: "destructive" },
  CLOSED: { label: "Closed", variant: "default" },
};

export function isClaimStatus(value: string): value is ClaimStatus {
  return claimStatuses.includes(value as ClaimStatus);
}

export function isRelationshipStrength(value: string): value is RelationshipStrength {
  return relationshipStrengths.includes(value as RelationshipStrength);
}
