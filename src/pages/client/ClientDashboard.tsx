import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentTermsState } from "@/hooks/use-current-terms";
import { listOpportunityRegistrations, type RegistrationStatus } from "@/lib/portalApi";
import { Target, FileCheck, Clock, PlusCircle, ArrowRight } from "lucide-react";

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

export default function ClientDashboard() {
  const { user } = useAuth();
  const { terms, acceptance } = useCurrentTermsState();
  const opportunitiesQuery = useQuery({
    queryKey: ["client-opportunity-registrations", user?.id],
    queryFn: () => listOpportunityRegistrations(),
    enabled: Boolean(user?.id),
  });
  const opportunities = opportunitiesQuery.data ?? [];
  const activeCount = opportunities.filter((opportunity) =>
    ["Submitted", "Accepted", "Needs Clarification"].includes(opportunity.status),
  ).length;
  const acceptedCount = opportunities.filter((opportunity) => opportunity.status === "Accepted").length;
  const pendingCount = opportunities.filter((opportunity) => opportunity.status === "Submitted").length;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name ?? "Client"}`}
        description={`Manage terms and account registrations for ${user?.companyName ?? "your client workspace"}.`}
      >
        <Button asChild>
          <Link to="/client/opportunities/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Register Opportunity
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Active Opportunities" value={activeCount} icon={Target} />
        <StatCard title="Accepted" value={acceptedCount} icon={FileCheck} />
        <StatCard title="Pending Review" value={pendingCount} icon={Clock} />
        <StatCard title="Terms Version" value={terms?.version ?? "v1"} icon={FileCheck} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Opportunity Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {opportunities.length ? (
              <div className="space-y-4">
                {opportunities.slice(0, 6).map((opportunity) => (
                  <div key={opportunity.id} className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
                    <div>
                      <p className="font-medium">{opportunity.target_account_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {opportunity.expected_product_service || "Opportunity"} · {opportunity.commission_rate}% commission
                      </p>
                    </div>
                    <StatusBadge label={opportunity.status} variant={getStatusVariant(opportunity.status)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-6 text-center">
                <p className="font-medium">No registered opportunities yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Register the target account before Trusted Bums starts opening doors.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/client/opportunities/new">Register Opportunity</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Partner Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md bg-success/10 p-4 text-sm">
                <p className="font-medium text-success">Current terms accepted</p>
                <p className="text-muted-foreground mt-1">
                  {acceptance ? new Date(acceptance.accepted_at).toLocaleString() : "Acceptance recorded"} · Version{" "}
                  {terms?.version ?? "v1"}
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link to="/client/terms">
                  Review terms <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild>
                <Link to="/client/opportunities/new">Register new opportunity</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/client/agreements">View acceptance records</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:bums@trustedbums.com?subject=Trusted%20Bums%20Client%20Portal">Contact Trusted Bums</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
