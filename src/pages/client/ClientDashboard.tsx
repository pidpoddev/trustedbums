import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockStats, mockOpportunities, mockIntroClaims, opportunityStatusConfig, claimStatusConfig } from "@/data/mockData";
import { Target, Handshake, Calendar, AlertCircle } from "lucide-react";

export default function ClientDashboard() {
  const s = mockStats.client;
  return (
    <div>
      <PageHeader title="Welcome back, Sarah 👋" description="Here's what's happening with your opportunities" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Active Opportunities" value={s.activeOpportunities} icon={Target} />
        <StatCard title="Total Intros" value={s.totalIntros} icon={Handshake} />
        <StatCard title="Meetings Scheduled" value={s.meetingsScheduled} icon={Calendar} />
        <StatCard title="Pending Terms" value={s.pendingTerms} icon={AlertCircle} subtitle="Needs your action" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-display">Your Opportunities</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOpportunities.filter(o => o.clientId === "c1").map(opp => {
                const config = opportunityStatusConfig[opp.status as keyof typeof opportunityStatusConfig];
                return (
                  <div key={opp.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{opp.title}</p>
                      <p className="text-xs text-muted-foreground">{opp.claims} claims · {opp.meetings} meetings</p>
                    </div>
                    <StatusBadge label={config.label} variant={config.variant} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display">Recent Intros</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockIntroClaims.slice(0, 3).map(claim => {
                const config = claimStatusConfig[claim.status as keyof typeof claimStatusConfig];
                return (
                  <div key={claim.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{claim.contact} @ {claim.company}</p>
                      <p className="text-xs text-muted-foreground">{claim.bumAlias}</p>
                    </div>
                    <StatusBadge label={config.label} variant={config.variant} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
