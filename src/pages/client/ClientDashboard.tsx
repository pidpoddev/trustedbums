import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockClients, mockOpportunities, mockStats, opportunityStatusConfig, claimStatusConfig } from "@/data/mockData";
import { useIntroClaims } from "@/hooks/use-intro-claims";
import { useAuth } from "@/contexts/AuthContext";
import { Target, Handshake, Calendar, AlertCircle } from "lucide-react";

export default function ClientDashboard() {
  const s = mockStats.client;
  const { user } = useAuth();
  const { introClaims } = useIntroClaims();
  const client = mockClients.find((mockClient) => mockClient.id === user?.clientId);
  const clientOpportunities = mockOpportunities.filter((opportunity) => opportunity.clientId === user?.clientId);
  const clientOpportunityIds = new Set(clientOpportunities.map((opportunity) => opportunity.id));
  const clientIntroClaims = introClaims.filter((claim) => clientOpportunityIds.has(claim.opportunityId));

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name ?? "Client"} 👋`}
        description={`Here's what's happening with ${client?.company ?? "your client workspace"}`}
      />

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
              {clientOpportunities.map(opp => {
                const config = opportunityStatusConfig[opp.status];
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
              {clientIntroClaims.slice(0, 3).map(claim => {
                const config = claimStatusConfig[claim.status];
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
