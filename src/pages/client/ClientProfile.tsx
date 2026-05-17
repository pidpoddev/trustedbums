import { PageHeader } from "@/components/PageHeader";
import { UserTimeZoneCard } from "@/components/UserTimeZoneCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader title="Company Profile" description="Manage your company positioning for Bums" />

      <div className="max-w-2xl">
        <UserTimeZoneCard description="Pick the time zone that should be used for meeting scheduling and timestamp display throughout the client portal." />
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="font-display">Profile Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Company Name</Label><Input defaultValue={user?.companyName ?? ""} /></div>
            <div><Label>Website</Label><Input placeholder="https://yourcompany.com" /></div>
          </div>
          <div><Label>Positioning Statement</Label><Textarea placeholder="How should Trusted Bums describe your company?" rows={3} /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Target Industries</Label><Input placeholder="SaaS, Healthcare, FinTech" /></div>
            <div><Label>Target Regions</Label><Input placeholder="North America, EMEA" /></div>
          </div>
          <Button>Save Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
