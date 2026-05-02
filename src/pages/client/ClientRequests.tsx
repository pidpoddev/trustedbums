import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquarePlus } from "lucide-react";

const mockRequests = [
  { id: "r1", title: "Need intros to Head of IT at hospital systems", status: "submitted", createdAt: "2026-02-10" },
  { id: "r2", title: "Looking for CIO contacts in retail banking", status: "converted", createdAt: "2026-01-28" },
];

export default function ClientRequests() {
  return (
    <div>
      <PageHeader title="Intro Requests" description="Submit requests that Admin can convert into opportunities">
        <Button><Plus className="h-4 w-4 mr-2" /> New Request</Button>
      </PageHeader>

      <div className="grid gap-4 mb-8">
        {mockRequests.map(r => (
          <Card key={r.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquarePlus className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">Submitted {r.createdAt}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${r.status === "converted" ? "bg-success/10 text-success" : "bg-secondary text-secondary-foreground"}`}>
                  {r.status === "converted" ? "Converted to Opportunity" : "Submitted"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
