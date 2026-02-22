import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { mockOpportunities, opportunityStatusConfig } from "@/data/mockData";
import { Plus } from "lucide-react";

export default function AdminOpportunities() {
  return (
    <div>
      <PageHeader title="Opportunities" description="Create and manage introduction opportunities">
        <Button><Plus className="h-4 w-4 mr-2" /> New Opportunity</Button>
      </PageHeader>

      <div className="grid gap-4">
        {mockOpportunities.map(opp => {
          const config = opportunityStatusConfig[opp.status as keyof typeof opportunityStatusConfig];
          return (
            <Card key={opp.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium font-display">{opp.title}</p>
                      <StatusBadge label={config.label} variant={config.variant} />
                    </div>
                    <p className="text-sm text-muted-foreground">{opp.client}</p>
                    <div className="flex gap-2 mt-2">
                      {opp.industries.map(i => (
                        <span key={i} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{i}</span>
                      ))}
                      {opp.regions.map(r => (
                        <span key={r} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{r}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold font-display">{opp.claims}</p>
                      <p className="text-xs text-muted-foreground">Claims</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-display">{opp.meetings}</p>
                      <p className="text-xs text-muted-foreground">Meetings</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
