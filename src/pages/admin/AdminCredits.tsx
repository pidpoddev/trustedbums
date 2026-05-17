import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { claimStatusConfig } from "@/data/mockData";
import { listOpportunityClaims } from "@/lib/portalApi";

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
                  <th className="pb-3 font-medium text-muted-foreground">Split</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => {
                  const config = claimStatusConfig[claim.status];
                  return (
                    <tr key={claim.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 font-medium">
                        {claim.contact_name} <span className="text-muted-foreground">@ {claim.contact_company}</span>
                      </td>
                      <td className="py-3">{claim.opportunity_registrations?.target_account_name ?? "Opportunity pending"}</td>
                      <td className="py-3">{claim.profiles?.full_name ?? claim.profiles?.email ?? "Trusted Bum"}</td>
                      <td className="py-3"><StatusBadge label={config.label} variant={config.variant} /></td>
                      <td className="py-3"><span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">Door Opener</span></td>
                      <td className="py-3 font-display font-bold">100%</td>
                    </tr>
                  );
                })}
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
