import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Handshake, Lock, Mail, UserRound } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { claimStatusConfig } from "@/lib/claimConfig";
import {
  buildTopLineShareSchedule,
  calculateTopLineSharePercent,
  listOpportunityClaims,
  updateOpportunityClaimStatus,
  type OpportunityClaimRecord,
  type OpportunityClaimStatus,
  type OpportunityClaimContactBuyingRole,
} from "@/lib/portalApi";
import { opportunityOriginLabel, opportunityStageLabel, stageFromClaimStatus } from "@/lib/opportunityModel";
import { formatDateForTimeZone, formatDateTimeForTimeZone } from "@/lib/timezone";

const currentClaimStatuses: OpportunityClaimStatus[] = ["APPROVED", "SCHEDULED", "MEETING_HELD"];
const clientEditableClaimStatuses: OpportunityClaimStatus[] = ["APPROVED", "SCHEDULED", "MEETING_HELD"];

function formatDate(value: string | null | undefined, timeZone: string) {
  if (!value) {
    return "Not set";
  }

  return formatDateForTimeZone(value, timeZone, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function addMonths(value: string, months: number) {
  const date = new Date(value);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

function termEndLabel(claim: OpportunityClaimRecord, timeZone: string) {
  const termStart = claim.opportunity_registrations?.commission_schedule_start_at;
  const termMonths = claim.opportunity_registrations?.client_pay_programs?.commission_period_months;
  if (!termStart || !termMonths) {
    return "Term end not set";
  }

  return formatDate(addMonths(termStart, termMonths), timeZone);
}

const buyingRoleLabels: Record<OpportunityClaimContactBuyingRole, string> = {
  DECISION_MAKER: "Decision Maker",
  PURCHASING_LEADER: "Purchasing Leader",
  TECHNICAL_LEADER: "Technical / Development Leader",
  CHAMPION: "Champion",
  BLOCKER: "Blocker",
  INFLUENCER: "Influencer",
  OTHER: "Other stakeholder",
};

export default function ClientClaims() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timeZone = useUserTimeZone();
  const [statusDrafts, setStatusDrafts] = useState<Record<string, OpportunityClaimStatus>>({});
  const canUpdateClaims = user?.role === "CLIENT" && user.clientAccessRole !== "CLIENT_FINANCE";

  const claimsQuery = useQuery({
    queryKey: ["client-claims", user?.clientId],
    queryFn: () => listOpportunityClaims(undefined, { includeDisabled: true }),
    enabled: Boolean(user?.clientId),
  });

  const claims = useMemo(
    () => (claimsQuery.data ?? []).filter((claim) => currentClaimStatuses.includes(claim.status)),
    [claimsQuery.data],
  );

  const updateStatusMutation = useMutation({
    mutationFn: ({ claim, status }: { claim: OpportunityClaimRecord; status: OpportunityClaimStatus }) =>
      updateOpportunityClaimStatus(user!, claim.id, status),
    onSuccess: async (claim) => {
      await queryClient.invalidateQueries({ queryKey: ["client-claims", user?.clientId] });
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-claims", user?.clientId] });
      setStatusDrafts((current) => {
        const next = { ...current };
        delete next[claim.id];
        return next;
      });
      toast({
        title: claim.status === "MEETING_HELD" ? "Introduction made" : "Claim status updated",
        description:
          claim.status === "MEETING_HELD"
            ? "The claim is now locked for the commission term."
            : "The claim status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to update claim",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claims"
        description="Track accepted Claims, update introduction status, and see when commission terms are locked."
      />

      {claimsQuery.isLoading ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">Loading Claims...</div>
      ) : null}

      {!claimsQuery.isLoading && claimsQuery.isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
          Unable to load Claims right now.
        </div>
      ) : null}

      {!claimsQuery.isLoading && !claimsQuery.isError && !claims.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <Handshake className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No accepted Claims yet</p>
              <p className="text-sm text-muted-foreground">
                Accepted Bum Claims will appear here after your team approves them.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {claims.map((claim) => {
          const opportunityName = claim.opportunity_registrations?.target_account_name ?? claim.contact_company;
          const statusConfig = claimStatusConfig[claim.status];
          const selectedStatus = statusDrafts[claim.id] ?? claim.status;
          const isLocked = claim.status === "MEETING_HELD";
          const shareSchedule = buildTopLineShareSchedule(
            claim.opportunity_registrations?.client_pay_programs,
            claim.bum_share_percent,
          );
          const fallbackTopLine = calculateTopLineSharePercent(
            claim.opportunity_registrations?.commission_rate,
            claim.bum_share_percent,
          );

          return (
            <Card key={claim.id}>
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="font-display text-xl">{opportunityName}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {claim.contact_name} at {claim.contact_company}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Bum: {claim.profiles?.full_name ?? claim.profiles?.email ?? "Assigned Bum"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge label={opportunityOriginLabel("BUM_ORIGINATED")} variant="secondary" />
                  <StatusBadge label={opportunityStageLabel(stageFromClaimStatus(claim.status))} variant="info" />
                  <StatusBadge {...statusConfig} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      <UserRound className="h-4 w-4" />
                      Relationship
                    </p>
                    <p className="mt-1 capitalize">{claim.relationship_strength.toLowerCase()}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      <CalendarClock className="h-4 w-4" />
                      Request accepted
                    </p>
                    <p className="mt-1">{formatDate(claim.client_decision_received_at ?? claim.updated_at, timeZone)}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      <Mail className="h-4 w-4" />
                      Contact email
                    </p>
                    <p className="mt-1 break-all">{claim.contact_email ?? "Not provided"}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3 md:col-span-3">
                    <p className="font-medium text-foreground">Commission term</p>
                    <p className="mt-1">
                      {Number(claim.bum_share_percent ?? 0).toLocaleString()}% of the Trusted Bums commission
                    </p>
                    <p className="mt-1 text-xs">
                      {shareSchedule.length
                        ? shareSchedule.map((item) => `${item.label}: ${item.topLinePercent}% top line`).join(" · ")
                        : `Current top-line equivalent: ${fallbackTopLine}%`}
                    </p>
                  </div>
                </div>

                {claim.opportunity_claim_contacts?.length ? (
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <p className="text-sm font-medium text-foreground">Stakeholders included in this claim</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {claim.opportunity_claim_contacts
                        .slice()
                        .sort((left, right) => left.sort_order - right.sort_order)
                        .map((claimContact) => (
                          <div key={claimContact.id} className="rounded-lg border bg-background p-3 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-foreground">{claimContact.contact_name}</span>
                              {claimContact.is_inner_circle ? <StatusBadge label="Inner Circle" variant="success" /> : null}
                              <StatusBadge
                                label={buyingRoleLabels[claimContact.buying_role]}
                                variant={claimContact.buying_role === "BLOCKER" ? "warning" : "secondary"}
                              />
                            </div>
                            <p className="mt-1 text-muted-foreground">
                              {[claimContact.contact_title, claimContact.contact_company].filter(Boolean).join(" · ")}
                            </p>
                            {claimContact.note ? <p className="mt-2 text-muted-foreground">{claimContact.note}</p> : null}
                          </div>
                        ))}
                    </div>
                  </div>
                ) : null}

                {claim.client_notification_preview ? (
                  <div className="rounded-xl border bg-muted/20 p-4 text-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="flex items-center gap-2 font-medium text-foreground">
                          <Mail className="h-4 w-4" />
                          Message sent to client team
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {claim.client_notification_preview.sent_at
                            ? formatDateTimeForTimeZone(claim.client_notification_preview.sent_at, timeZone)
                            : formatDateTimeForTimeZone(claim.client_notification_preview.created_at, timeZone)}
                        </p>
                      </div>
                      <StatusBadge
                        label={claim.client_notification_preview.status}
                        variant={claim.client_notification_preview.status === "FAILED" ? "destructive" : "secondary"}
                      />
                    </div>
                    <div className="mt-3 rounded-lg border bg-background p-3">
                      <p className="font-medium text-foreground">{claim.client_notification_preview.subject}</p>
                      <p className="mt-3 whitespace-pre-wrap break-words leading-6 text-muted-foreground">
                        {claim.client_notification_preview.body}
                      </p>
                    </div>
                  </div>
                ) : null}

                {isLocked ? (
                  <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm">
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      <Lock className="h-4 w-4" />
                      Locked for term period
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Introduction made on {formatDate(claim.opportunity_registrations?.commission_schedule_start_at, timeZone)}.
                      Term end: {termEndLabel(claim, timeZone)}.
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">Client status</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Mark Introduction made once the Bum has made the customer introduction. That locks the claim for the commission term.
                    </p>
                  </div>
                  {canUpdateClaims && !isLocked ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Select
                        value={selectedStatus}
                        onValueChange={(value: OpportunityClaimStatus) =>
                          setStatusDrafts((current) => ({ ...current, [claim.id]: value }))
                        }
                      >
                        <SelectTrigger className="w-full sm:w-56">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {clientEditableClaimStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {claimStatusConfig[status].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        disabled={updateStatusMutation.isPending || selectedStatus === claim.status}
                        onClick={() => updateStatusMutation.mutate({ claim, status: selectedStatus })}
                      >
                        Update status
                      </Button>
                    </div>
                  ) : (
                    <StatusBadge
                      label={isLocked ? "Locked" : claimStatusConfig[claim.status].label}
                      variant={isLocked ? "success" : claimStatusConfig[claim.status].variant}
                    />
                  )}
                </div>

                {claim.note ? (
                  <div className="rounded-xl border bg-card p-3 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Claim note</p>
                    <p className="mt-1">{claim.note}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
