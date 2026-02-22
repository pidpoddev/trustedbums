import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const mockPlans = [
  { id: "cp1", name: "Standard 20%", client: "AcmeCorp", rules: "20% of all payments, no tiers", instances: 2 },
  { id: "cp2", name: "Tiered Growth", client: "BlueWave Solutions", rules: "15% months 1-6, 10% months 7-12, 5% ongoing", instances: 1 },
  { id: "cp3", name: "First Payment Only", client: "AcmeCorp", rules: "30% of first payment only", instances: 1 },
];

export default function AdminCommissionPlans() {
  return (
    <div>
      <PageHeader title="Commission Plans" description="Build and manage commission plan templates">
        <Button><Plus className="h-4 w-4 mr-2" /> New Plan</Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockPlans.map(plan => (
          <Card key={plan.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.client}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">{plan.rules}</p>
              <p className="text-xs text-muted-foreground">{plan.instances} active instance{plan.instances !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
