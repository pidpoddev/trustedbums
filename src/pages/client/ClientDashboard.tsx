import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentTermsState } from "@/hooks/use-current-terms";
import { listCustomerTargets, listOpportunityRegistrations, type RegistrationStatus } from "@/lib/portalApi";
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
  const targetsQuery = useQuery({
    queryKey: ["client-targets", user?.clientId],
    queryFn: () => listCustomerTargets(user),
    enabled: Boolean(user?.clientId),
  });
  const opportunities = opportunitiesQuery.data ?? [];
  const targets = targetsQuery.data ?? [];
  const activeCount = opportunities.filter((opportunity) =>
    ["Submitted", "Accepted", "Needs Clarification"].includes(opportunity.status),
  ).length;
  const acceptedCount = opportunities.filter((opportunity) => opportunity.status === "Accepted").length;
  const targetProspectCount = targets.filter((target) =>
    ["PROSPECT", "QUALIFYING", "INTRO_REQUESTED", "INTRO_IN_PROGRESS"].includes(target.status),
  ).length;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name ?? "Client"}`}
        description={`Manage terms and account registrations for ${user?.companyName ?? "your client workspace"}.`}
      >
        <Button asChild>
          <Link to="/client/targets">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Target Account
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Target Accounts" value={targets.length} icon={Target} />
        <StatCard title="Active Opportunities" value={activeCount} icon={Target} />
        <StatCard title="Accepted" value={acceptedCount} icon={FileCheck} />
        <StatCard title="Target Prospects" value={targetProspectCount} icon={Clock} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Target Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {targets.length ? (
              <div className="space-y-4">
                {targets.slice(0, 6).map((targetAccount) => (
                  <div key={targetAccount.id} className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
                    <div>
                      <p className="font-medium">{targetAccount.target_companies?.name ?? targetAccount.target_account_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {targetAccount.expected_product_service || "Target account"} · {targetAccount.priority} priority
                      </p>
                    </div>
                    <StatusBadge label={targetAccount.status.replaceAll("_", " ")} variant="info" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-6 text-center">
                <p className="font-medium">No target accounts yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add the customer companies you want to sell into before turning them into formal opportunity registrations.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/client/targets">Add Target Account</Link>
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
                <Link to="/client/targets">Add target account</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/client/opportunities/new">Register formal opportunity</Link>
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
