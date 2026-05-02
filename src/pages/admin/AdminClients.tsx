import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { mockClients } from "@/data/mockData";
import { authorizationProfiles } from "@/data/authData";
import { Plus } from "lucide-react";

export default function AdminClients() {
  return (
    <div>
      <PageHeader title="Clients" description="Manage client accounts and opportunities">
        <Button><Plus className="h-4 w-4 mr-2" /> Add Client</Button>
      </PageHeader>

      <div className="grid gap-4">
        {mockClients.map(client => {
          const users = authorizationProfiles.filter((account) => account.role === "CLIENT" && account.clientId === client.id);

          return (
            <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
                      {client.company[0]}
                    </div>
                    <div>
                      <p className="font-medium">{client.company}</p>
                      <p className="text-sm text-muted-foreground">{users.length} user{users.length === 1 ? "" : "s"} · Primary: {client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold font-display">{client.opportunities}</p>
                      <p className="text-xs text-muted-foreground">Opportunities</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-display">{client.intros}</p>
                      <p className="text-xs text-muted-foreground">Intros</p>
                    </div>
                    <StatusBadge
                      label={client.status === "active" ? "Active" : "Pending Agreement"}
                      variant={client.status === "active" ? "success" : "warning"}
                    />
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
