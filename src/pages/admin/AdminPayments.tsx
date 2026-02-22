import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { mockPayments } from "@/data/mockData";
import { Plus, Upload } from "lucide-react";

export default function AdminPayments() {
  return (
    <div>
      <PageHeader title="Payments" description="Track client payments and computed TB revenue">
        <Button variant="outline"><Upload className="h-4 w-4 mr-2" /> CSV Upload</Button>
        <Button><Plus className="h-4 w-4 mr-2" /> Manual Entry</Button>
      </PageHeader>

      <Card>
        <CardHeader><CardTitle className="font-display">Payment Events</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Client</th>
                  <th className="pb-3 font-medium text-muted-foreground">Customer</th>
                  <th className="pb-3 font-medium text-muted-foreground">Amount</th>
                  <th className="pb-3 font-medium text-muted-foreground">TB Revenue</th>
                  <th className="pb-3 font-medium text-muted-foreground">Source</th>
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {mockPayments.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 font-medium">{p.client}</td>
                    <td className="py-3">{p.customerKey}</td>
                    <td className="py-3 font-display font-bold">${p.amount.toLocaleString()}</td>
                    <td className="py-3 font-display font-bold text-primary">${p.tbRevenue.toLocaleString()}</td>
                    <td className="py-3"><StatusBadge label={p.source} variant={p.source === "MANUAL" ? "secondary" : "info"} /></td>
                    <td className="py-3 text-muted-foreground">{p.paidAt}</td>
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
