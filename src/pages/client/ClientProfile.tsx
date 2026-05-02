import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockClients } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientProfile() {
  const { user } = useAuth();
  const client = mockClients.find((mockClient) => mockClient.id === user?.clientId);

  return (
    <div>
      <PageHeader title="Company Profile" description="Manage your company positioning for Bums" />

      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="font-display">Profile Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Company Name</Label><Input defaultValue={client?.company ?? user?.companyName} /></div>
            <div><Label>Website</Label><Input defaultValue={client?.website} /></div>
          </div>
          <div><Label>Positioning Statement</Label><Textarea defaultValue={client?.pitch} rows={3} /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Target Industries</Label><Input defaultValue={client?.industries.join(", ")} /></div>
            <div><Label>Target Regions</Label><Input defaultValue={client?.regions.join(", ")} /></div>
          </div>
          <Button>Save Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
