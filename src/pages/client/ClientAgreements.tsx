import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";

const agreements = [
  { type: "Client Agreement", version: "1.2", signed: true, signedAt: "2025-11-15T10:30:00Z" },
  { type: "Data Processing Agreement", version: "1.0", signed: false, signedAt: null },
];

export default function ClientAgreements() {
  return (
    <div>
      <PageHeader title="Agreements" description="Review and sign required agreements" />

      <div className="grid gap-4 md:grid-cols-2">
        {agreements.map(a => (
          <Card key={a.type} className={a.signed ? "" : "border-warning/50 shadow-warning/10 shadow-md"}>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                {a.signed ? <CheckCircle className="h-5 w-5 text-success" /> : <Clock className="h-5 w-5 text-warning" />}
                {a.type}
              </CardTitle>
              <p className="text-sm text-muted-foreground">Version {a.version}</p>
            </CardHeader>
            <CardContent>
              {a.signed ? (
                <p className="text-sm text-muted-foreground">
                  Signed on {new Date(a.signedAt!).toLocaleDateString()}
                </p>
              ) : (
                <div>
                  <p className="text-sm mb-3">Please review and accept this agreement to continue.</p>
                  <Button>Review & Sign</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
