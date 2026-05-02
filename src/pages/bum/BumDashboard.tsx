import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Briefcase, Handshake, Wallet, TrendingUp } from "lucide-react";

export default function BumDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back 👋"
        description="Browse opportunities, track your claims, and watch your earnings grow."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Open Opportunities" value="24" icon={Briefcase} />
        <StatCard title="Active Claims" value="6" icon={Handshake} />
        <StatCard title="Pending Earnings" value="$3,250" icon={TrendingUp} />
        <StatCard title="Lifetime Payouts" value="$18,420" icon={Wallet} />
      </div>
      <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
        Bum portal is coming online — more modules ship next.
      </div>
    </div>
  );
}
