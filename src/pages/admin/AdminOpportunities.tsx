import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { listOpportunityRegistrations, type RegistrationStatus } from "@/lib/portalApi";

function getStatusVariant(status: RegistrationStatus) {
  if (status === "Accepted" || status === "Closed Won") {
    return "success" as const;
  }
  if (status === "Disputed" || status === "Rejected" || status === "Closed Lost") {
    return "destructive" as const;
  }
  if (status === "Needs Clarification" || status === "Draft") {
    return "warning" as const;
  }
  return "info" as const;
}

export default function AdminOpportunities() {
  const registrationsQuery = useQuery({
    queryKey: ["admin-opportunities", "All"],
    queryFn: () => listOpportunityRegistrations("All"),
  });
  const registrations = registrationsQuery.data ?? [];

  return (
    <div>
      <PageHeader title="Opportunities" description="Review registered client opportunities and commission terms." />

      <div className="grid gap-4">
        {registrations.map((registration) => (
          <Card key={registration.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium font-display">{registration.target_account_name}</p>
                    <StatusBadge label={registration.status} variant={getStatusVariant(registration.status)} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {registration.companies?.name ?? "Company pending"} · {registration.commission_rate}% commission
                  </p>
                  <p className="mt-2 max-w-2xl text-sm">{registration.opportunity_description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold font-display">
                    {registration.estimated_deal_value
                      ? `$${Number(registration.estimated_deal_value).toLocaleString()}`
                      : "TBD"}
                  </p>
                  <p className="text-xs text-muted-foreground">Estimated value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!registrations.length && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No opportunity registrations have been submitted yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
