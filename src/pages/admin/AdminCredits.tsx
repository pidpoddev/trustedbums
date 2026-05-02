import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { claimStatusConfig } from "@/data/mockData";
import { useIntroClaims } from "@/hooks/use-intro-claims";

export default function AdminCredits() {
  const { introClaims } = useIntroClaims();

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
                {introClaims.map(claim => {
                  const config = claimStatusConfig[claim.status];
                  return (
                    <tr key={claim.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 font-medium">{claim.contact} <span className="text-muted-foreground">@ {claim.company}</span></td>
                      <td className="py-3">{claim.opportunityTitle}</td>
                      <td className="py-3">{claim.bumAlias}</td>
                      <td className="py-3"><StatusBadge label={config.label} variant={config.variant} /></td>
                      <td className="py-3"><span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Door Opener</span></td>
                      <td className="py-3 font-display font-bold">100%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
