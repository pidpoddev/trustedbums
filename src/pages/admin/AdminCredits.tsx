import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { claimStatusConfig } from "@/lib/claimConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  buildTopLineShareSchedule,
  calculateTopLineSharePercent,
  listOpportunityClaims,
  updateOpportunityClaimShare,
  type OpportunityClaimRecord,
} from "@/lib/portalApi";

function ClaimShareRow({ claim }: { claim: OpportunityClaimRecord }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sharePercent, setSharePercent] = useState(String(claim.bum_share_percent ?? 0));
  const updateMutation = useMutation({
    mutationFn: () => updateOpportunityClaimShare(user!, claim.id, Number(sharePercent || 0)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-opportunity-claims"] });
      await queryClient.invalidateQueries({ queryKey: ["opportunity-claims"] });
      await queryClient.invalidateQueries({ queryKey: ["bum-payouts"] });
      toast({
        title: "Bum share updated",
        description: "The claim share and future payout defaults were updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to update Bum share",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const schedule = buildTopLineShareSchedule(
    claim.opportunity_registrations?.client_pay_programs,
    claim.bum_share_percent,
  );
  const yearOneTopLine =
    schedule[0]?.topLinePercent ??
    calculateTopLineSharePercent(claim.opportunity_registrations?.commission_rate, claim.bum_share_percent);

  return (
    <tr key={claim.id} className="border-b last:border-0 hover:bg-muted/50">
      <td className="py-3 font-medium">
        {claim.contact_name} <span className="text-muted-foreground">@ {claim.contact_company}</span>
      </td>
      <td className="py-3">{claim.opportunity_registrations?.target_account_name ?? "Opportunity pending"}</td>
      <td className="py-3">{claim.profiles?.full_name ?? claim.profiles?.email ?? "Trusted Bum"}</td>
      <td className="py-3">
        <StatusBadge label={claimStatusConfig[claim.status].label} variant={claimStatusConfig[claim.status].variant} />
      </td>
      <td className="py-3">
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">Door Opener</span>
      </td>
      <td className="py-3">
        <div className="space-y-1">
          <p className="font-display font-bold">{Number(claim.bum_share_percent ?? 0).toLocaleString()}%</p>
          <p className="text-xs text-muted-foreground">of Trusted Bums commission</p>
        </div>
      </td>
      <td className="py-3">
        <div className="space-y-1">
          <p className="font-display font-bold">{yearOneTopLine.toLocaleString()}%</p>
          <p className="text-xs text-muted-foreground">
            top-line equivalent
            {schedule.length ? ` · ${schedule.map((item) => `${item.label} ${item.topLinePercent}%`).join(", ")}` : ""}
          </p>
        </div>
      </td>
      <td className="py-3 min-w-[220px]">
        {claim.meeting_locked ? (
          <div className="text-sm text-muted-foreground">
            Locked after logged meeting
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={sharePercent}
              onChange={(event) => setSharePercent(event.target.value)}
            />
            <Button size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              Save
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function AdminCredits() {
  const claimsQuery = useQuery({
    queryKey: ["admin-opportunity-claims"],
    queryFn: () => listOpportunityClaims(),
  });
  const claims = claimsQuery.data ?? [];

  return (
    <div>
      <PageHeader title="Credits & Disputes" description="Manage door-opener/closer assignments and team splits" />

      <Card>
        <CardHeader><CardTitle className="font-display">Intro Claims with Credit Assignments</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Contact</th>
                  <th className="pb-3 font-medium text-muted-foreground">Opportunity</th>
                  <th className="pb-3 font-medium text-muted-foreground">Bum</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Credit Type</th>
                  <th className="pb-3 font-medium text-muted-foreground">Share of TB commission</th>
                  <th className="pb-3 font-medium text-muted-foreground">Top-line equivalent</th>
                  <th className="pb-3 font-medium text-muted-foreground">Admin control</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <ClaimShareRow key={claim.id} claim={claim} />
                ))}
              </tbody>
            </table>
            {!claimsQuery.isLoading && !claims.length ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No opportunity claims have been requested yet.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
