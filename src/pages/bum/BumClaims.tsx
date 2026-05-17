import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ExternalLink, Handshake, Mail, UserRound } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { claimStatusConfig } from "@/data/mockData";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { listOpportunityClaims } from "@/lib/portalApi";
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
        title="My Claims"
        description="Track the intros you've claimed and jump back into the opportunity when it's time to schedule or update."
      />

      {claimsQuery.isLoading ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">Loading your claims...</div>
      ) : null}

      {!claimsQuery.isLoading && claimsQuery.isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
          Unable to load claims right now.
        </div>
      ) : null}

      {!claimsQuery.isLoading && !claimsQuery.isError && !claims.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <Handshake className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No claims yet</p>
              <p className="text-sm text-muted-foreground">
                When you request or receive an approved claim, it will show up here.
              </p>
            </div>
            <Link to="/bum/opportunities">
              <Button variant="outline">Browse opportunities</Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {claims.map((claim) => {
          const statusConfig = claimStatusConfig[claim.status];
          const opportunityName = claim.opportunity_registrations?.target_account_name ?? claim.contact_company;

          return (
            <Card key={claim.id}>
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="font-display text-xl">{opportunityName}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {claim.contact_name} at {claim.contact_company}
                  </p>
                </div>
                <StatusBadge {...statusConfig} />
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
                      Claim expires
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
                </div>

                {claim.note ? (
                  <div className="rounded-xl border bg-card p-3 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Claim note</p>
                    <p className="mt-1">{claim.note}</p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {claim.opportunity_registration_id ? (
                    <Link to={`/bum/opportunities/${claim.opportunity_registration_id}`}>
                      <Button size="sm">
                        Open opportunity
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
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
