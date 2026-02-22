import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { mockBums } from "@/data/mockData";
import { Plus, Link2 } from "lucide-react";

export default function AdminBums() {
  return (
    <div>
      <PageHeader title="Bums" description="Manage trusted bum accounts, sponsors, and payouts">
        <Button><Plus className="h-4 w-4 mr-2" /> Invite Bum</Button>
      </PageHeader>

      <div className="grid gap-4">
        {mockBums.map(bum => (
          <Card key={bum.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-lg">🤝</div>
                  <div>
                    <p className="font-medium">{bum.alias}</p>
                    <p className="text-sm text-muted-foreground">{bum.name} · {bum.email}</p>
                    {bum.sponsor && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Link2 className="h-3 w-3" /> Sponsor: {bum.sponsor}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold font-display">{bum.intros}</p>
                    <p className="text-xs text-muted-foreground">Intros</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-display">${bum.earnings.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Earnings</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge
                      label={bum.status === "active" ? "Active" : "Pending NDA"}
                      variant={bum.status === "active" ? "success" : "warning"}
                    />
                    <StatusBadge
                      label={bum.stripeConnected ? "Stripe ✓" : "No Stripe"}
                      variant={bum.stripeConnected ? "info" : "secondary"}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
