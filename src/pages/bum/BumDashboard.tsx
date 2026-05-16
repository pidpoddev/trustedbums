import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useIntroClaims } from "@/hooks/use-intro-claims";
import { listMarketplaceOpportunities } from "@/lib/portalApi";
import { Briefcase, Handshake, Wallet, TrendingUp } from "lucide-react";

export default function BumDashboard() {
  const { user } = useAuth();
  const opportunitiesQuery = useQuery({
    queryKey: ["bum-marketplace-opportunities"],
    queryFn: listMarketplaceOpportunities,
  });
  const { introClaims } = useIntroClaims();
  const myClaims = introClaims.filter((claim) => claim.bumAlias === (user?.name ?? "Trusted Bum"));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name ?? "Trusted Bum"} 👋`}
        description="Browse opportunities, track your claims, and watch your earnings grow."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Open Opportunities" value={opportunitiesQuery.data?.length ?? 0} icon={Briefcase} />
        <StatCard title="Active Claims" value={myClaims.length} icon={Handshake} />
        <StatCard title="Pending Earnings" value="$0" icon={TrendingUp} />
        <StatCard title="Lifetime Payouts" value="$0" icon={Wallet} />
      </div>
      <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
        Bum portal is coming online — more modules ship next.
      </div>
    </div>
  );
}
