import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockStats, mockIntroClaims, mockPayouts, claimStatusConfig } from "@/data/mockData";
import { Users, Briefcase, Target, DollarSign, Handshake, TrendingUp, AlertCircle, CreditCard } from "lucide-react";

export default function AdminDashboard() {
  const s = mockStats.admin;
  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Overview of Trusted Bums marketplace" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Clients" value={s.totalClients} icon={Briefcase} />
        <StatCard title="Active Bums" value={s.totalBums} icon={Users} />
        <StatCard title="Open Opportunities" value={s.activeOpportunities} icon={Target} />
        <StatCard title="Meetings Held" value={s.meetingsHeld} icon={Handshake} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Intros" value={s.totalIntros} icon={TrendingUp} />
        <StatCard title="Client Revenue" value={`$${s.totalRevenue.toLocaleString()}`} icon={DollarSign} />
        <StatCard title="TB Revenue" value={`$${s.tbRevenue.toLocaleString()}`} icon={CreditCard} />
        <StatCard title="Pending Payouts" value={`$${s.pendingPayouts.toLocaleString()}`} icon={AlertCircle} subtitle="Needs approval" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-display">Recent Intro Claims</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockIntroClaims.slice(0, 4).map(claim => {
                const config = claimStatusConfig[claim.status as keyof typeof claimStatusConfig];
                return (
                  <div key={claim.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{claim.contact} @ {claim.company}</p>
                      <p className="text-xs text-muted-foreground">{claim.bumAlias} → {claim.opportunityTitle}</p>
                    </div>
                    <StatusBadge label={config.label} variant={config.variant} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display">Recent Payouts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPayouts.map(payout => (
                <div key={payout.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{payout.bum}</p>
                    <p className="text-xs text-muted-foreground">{payout.type.replace(/_/g, " ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-display">${payout.amount.toLocaleString()}</p>
                    <StatusBadge
                      label={payout.status}
                      variant={payout.status === "PAID" ? "success" : payout.status === "APPROVED" ? "info" : "warning"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
