import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Webhook } from "lucide-react";

export default function ClientExports() {
  return (
    <div>
      <PageHeader title="Exports & Integrations" description="Export data and configure webhook integrations" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-display">Export Data</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start"><Download className="h-4 w-4 mr-2" /> Export Intros (CSV)</Button>
            <Button variant="outline" className="w-full justify-start"><Download className="h-4 w-4 mr-2" /> Export Meetings (CSV)</Button>
            <Button variant="outline" className="w-full justify-start"><Download className="h-4 w-4 mr-2" /> Export Outcomes (CSV)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Webhook className="h-5 w-5" /> Webhook Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Connect to Zapier or Make to automate workflows.</p>
            <div>
              <Label>Webhook URL</Label>
              <Input placeholder="https://hooks.zapier.com/..." />
            </div>
            <Button>Save Webhook</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
