import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { mockBums } from "@/data/mockData";
import { Briefcase, Handshake, Wallet, TrendingUp } from "lucide-react";

export default function BumDashboard() {
  const { user } = useAuth();
  const bum = mockBums.find((mockBum) => mockBum.id === user?.bumId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${bum?.alias ?? user?.name ?? "Trusted Bum"} 👋`}
        description="Browse opportunities, track your claims, and watch your earnings grow."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Open Opportunities" value="24" icon={Briefcase} />
        <StatCard title="Active Claims" value={bum?.intros ?? 0} icon={Handshake} />
        <StatCard title="Pending Earnings" value="$3,250" icon={TrendingUp} />
        <StatCard title="Lifetime Payouts" value={`$${(bum?.earnings ?? 0).toLocaleString()}`} icon={Wallet} />
      </div>
      <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
        Bum portal is coming online — more modules ship next.
      </div>
    </div>
  );
}
