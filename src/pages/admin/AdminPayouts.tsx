import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { mockPayouts } from "@/data/mockData";
import { CheckCircle } from "lucide-react";

export default function AdminPayouts() {
  return (
    <div>
      <PageHeader title="Payouts" description="Approve and process bum payouts via Stripe Connect" />

      <Card>
        <CardHeader><CardTitle className="font-display">Payout Queue</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Bum</th>
                  <th className="pb-3 font-medium text-muted-foreground">Type</th>
                  <th className="pb-3 font-medium text-muted-foreground">Amount</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPayouts.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 font-medium">{p.bum}</td>
                    <td className="py-3 text-xs">{p.type.replace(/_/g, " ")}</td>
                    <td className="py-3 font-display font-bold">${p.amount.toLocaleString()}</td>
                    <td className="py-3">
                      <StatusBadge
                        label={p.status}
                        variant={p.status === "PAID" ? "success" : p.status === "APPROVED" ? "info" : "warning"}
                      />
                    </td>
                    <td className="py-3">
                      {p.status === "PENDING" && (
                        <Button size="sm" variant="outline"><CheckCircle className="h-3 w-3 mr-1" /> Approve</Button>
                      )}
                      {p.status === "APPROVED" && (
                        <Button size="sm"><CheckCircle className="h-3 w-3 mr-1" /> Pay Now</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
