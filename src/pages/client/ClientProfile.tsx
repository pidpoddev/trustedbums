import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ClientProfile() {
  return (
    <div>
      <PageHeader title="Company Profile" description="Manage your company positioning for Bums" />

      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="font-display">Profile Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Company Name</Label><Input defaultValue="AcmeCorp" /></div>
            <div><Label>Website</Label><Input defaultValue="acmecorp.com" /></div>
          </div>
          <div><Label>Positioning Statement</Label><Textarea defaultValue="We help enterprise teams automate their sales pipeline with AI-powered insights." rows={3} /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Target Industries</Label><Input defaultValue="SaaS, Enterprise, FinTech" /></div>
            <div><Label>Target Regions</Label><Input defaultValue="North America, EMEA" /></div>
          </div>
          <Button>Save Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
