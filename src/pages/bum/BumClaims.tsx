import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ExternalLink, Handshake, Mail, UserRound } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { claimDeclineReasonLabel, claimStatusConfig } from "@/lib/claimConfig";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  buildTopLineShareSchedule,
  calculateTopLineSharePercent,
  listOpportunityClaims,
} from "@/lib/portalApi";
import { opportunityOriginLabel, opportunityStageLabel, stageFromClaimStatus } from "@/lib/opportunityModel";
import { formatDateForTimeZone } from "@/lib/timezone";

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

export default function BumClaims() {
  const timeZone = useUserTimeZone();
  const claimsQuery = useQuery({
    queryKey: ["bum-my-claims"],
    queryFn: () => listOpportunityClaims(),
  });
  const claims = claimsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claims"
        description="Track the Claims you requested on Opportunities and jump back in when it's time to schedule or update."
      />

      {claimsQuery.isLoading ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">Loading your Claims...</div>
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
              <p className="font-medium">No Claims yet</p>
              <p className="text-sm text-muted-foreground">
                When you request a Claim on an Opportunity or receive an accepted Claim, it will show up here.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/bum/opportunities">Browse opportunities</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {claims.map((claim) => {
          const statusConfig = claimStatusConfig[claim.status];
          const opportunityName = claim.opportunity_registrations?.target_account_name ?? claim.contact_company;
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
                      Request expires
                    </p>
                    <p className="mt-1">{formatDate(claim.expires_at, timeZone)}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      <Mail className="h-4 w-4" />
                      Contact email
                    </p>
                    <p className="mt-1 break-all">{claim.contact_email ?? "Not provided"}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3 md:col-span-3">
                    <p className="font-medium text-foreground">Your share</p>
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

                {claim.note ? (
                  <div className="rounded-xl border bg-card p-3 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Request note</p>
                    <p className="mt-1">{claim.note}</p>
                  </div>
                ) : null}

                {claim.status === "DECLINED" ? (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    <p className="font-medium">Why this Claim was declined</p>
                    <p className="mt-1">
                      {claimDeclineReasonLabel(claim.decline_reason_code) ?? "Other"}
                      {claim.decline_reason_note ? `: ${claim.decline_reason_note}` : ""}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {claim.opportunity_registration_id ? (
                    <Button size="sm" asChild>
                      <Link to={`/bum/opportunities/${claim.opportunity_registration_id}`}>
                        Open opportunity
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
