import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { listCompanies, listOpportunityRegistrations, listProfiles } from "@/lib/portalApi";
import { Plus } from "lucide-react";

export default function AdminClients() {
  const companiesQuery = useQuery({ queryKey: ["admin-companies"], queryFn: listCompanies });
  const profilesQuery = useQuery({ queryKey: ["admin-profiles"], queryFn: listProfiles });
  const opportunitiesQuery = useQuery({
    queryKey: ["admin-opportunities", "All"],
    queryFn: () => listOpportunityRegistrations("All"),
  });

  const companySummaries = useMemo(() => {
    const profiles = profilesQuery.data ?? [];
    const opportunities = opportunitiesQuery.data ?? [];

    return (companiesQuery.data ?? []).map((company) => {
      const users = profiles.filter((profile) => profile.company_id === company.id);
      const companyOpportunities = opportunities.filter((opportunity) => opportunity.company_id === company.id);

      return {
        ...company,
        userCount: users.length,
        primaryEmail: users[0]?.email ?? "No users yet",
        opportunityCount: companyOpportunities.length,
        introCount: companyOpportunities.filter((opportunity) => opportunity.status === "Accepted").length,
      };
    });
  }, [companiesQuery.data, opportunitiesQuery.data, profilesQuery.data]);

  return (
    <div>
      <PageHeader title="Clients" description="Manage client accounts and opportunities">
        <Button><Plus className="h-4 w-4 mr-2" /> Add Client</Button>
      </PageHeader>

      <div className="grid gap-4">
        {companySummaries.map((company) => {
          return (
            <Card key={company.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
                      {company.name[0]}
                    </div>
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {company.userCount} user{company.userCount === 1 ? "" : "s"} · Primary: {company.primaryEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold font-display">{company.opportunityCount}</p>
                      <p className="text-xs text-muted-foreground">Opportunities</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-display">{company.introCount}</p>
                      <p className="text-xs text-muted-foreground">Accepted</p>
                    </div>
                    <StatusBadge
                      label={company.userCount ? "Active" : "Pending Setup"}
                      variant={company.userCount ? "success" : "warning"}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!companySummaries.length && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No live client companies exist yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
