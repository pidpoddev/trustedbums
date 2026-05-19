import type { OpportunityClaimStatus, OpportunityClaimStrength } from "@/lib/portalApi";

type StatusVariant = "success" | "warning" | "destructive" | "info" | "default";

export type ClaimStatus = OpportunityClaimStatus;
export type RelationshipStrength = OpportunityClaimStrength;

export const claimStatuses: ClaimStatus[] = [
  "PROPOSED",
  "APPROVED",
  "SCHEDULED",
  "MEETING_HELD",
  "EXPIRED",
  "DISPUTED",
  "CLOSED",
];

export const relationshipStrengths: RelationshipStrength[] = ["STRONG", "MODERATE", "WEAK"];

export const claimStatusConfig: Record<ClaimStatus, { label: string; variant: StatusVariant }> = {
  PROPOSED: { label: "Proposed", variant: "info" },
  APPROVED: { label: "Approved", variant: "success" },
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
