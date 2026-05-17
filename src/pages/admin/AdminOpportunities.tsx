import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleTeamsMeetingDialog } from "@/components/ScheduleTeamsMeetingDialog";
import {
  listCustomerTargets,
  listOpportunityRegistrations,
  type CustomerTargetStatus,
  type RegistrationStatus,
} from "@/lib/portalApi";

function registrationVariant(status: RegistrationStatus) {
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

function targetVariant(status: CustomerTargetStatus) {
  if (status === "CLOSED_WON") {
    return "success" as const;
  }
  if (status === "CLOSED_LOST") {
    return "destructive" as const;
  }
  if (status === "PROSPECT" || status === "QUALIFYING") {
    return "warning" as const;
  }
  return "info" as const;
}

function targetLabel(status: CustomerTargetStatus) {
  return status.replaceAll("_", " ");
}

export default function AdminOpportunities() {
  const queryClient = useQueryClient();
  const registrationsQuery = useQuery({
    queryKey: ["admin-opportunities", "All"],
    queryFn: () => listOpportunityRegistrations("All"),
  });
  const targetsQuery = useQuery({
    queryKey: ["admin-customer-targets"],
    queryFn: () => listCustomerTargets(null),
  });

  const registrations = registrationsQuery.data ?? [];
  const targets = targetsQuery.data ?? [];

  return (
    <div>
      <PageHeader
        title="Pipelines"
        description="Keep customer target accounts separate from formal opportunity registrations and commission records."
      />

      <Tabs defaultValue="targets" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="targets">Target Accounts</TabsTrigger>
          <TabsTrigger value="registrations">Opportunity Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value="targets">
          <div className="grid gap-4">
            {targets.map((targetAccount) => (
              <Card key={targetAccount.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Target className="h-4 w-4 text-primary" />
                        <p className="font-medium font-display">
                          {targetAccount.target_companies?.name ?? targetAccount.target_account_name}
                        </p>
                        <StatusBadge label={targetLabel(targetAccount.status)} variant={targetVariant(targetAccount.status)} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Client: {targetAccount.client_companies?.name ?? "Unknown client"} · Priority: {targetAccount.priority}
                      </p>
                      <p className="mt-2 max-w-2xl text-sm">
                        {targetAccount.notes ?? targetAccount.expected_product_service ?? "No target account notes yet."}
                      </p>
                      {targetAccount.key_contact_name ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Key contact: {targetAccount.key_contact_name}
                          {targetAccount.key_contact_title ? ` · ${targetAccount.key_contact_title}` : ""}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-display">
                        {targetAccount.estimated_deal_value
                          ? `$${Number(targetAccount.estimated_deal_value).toLocaleString()}`
                          : "TBD"}
                      </p>
                      <p className="text-xs text-muted-foreground">{targetAccount.expected_timeline ?? "Timeline pending"}</p>
                      <div className="mt-3">
                        <ScheduleTeamsMeetingDialog
                          target={targetAccount}
                          onScheduled={() => {
                            void queryClient.invalidateQueries({ queryKey: ["admin-customer-targets"] });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!targets.length && (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  No customer target accounts have been submitted yet.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Opportunity Registrations</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {registrations.map((registration) => (
                <Card key={registration.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-primary" />
                          <p className="font-medium font-display">{registration.target_account_name}</p>
                          <StatusBadge label={registration.status} variant={registrationVariant(registration.status)} />
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
                <div className="text-sm text-muted-foreground">
                  No opportunity registrations have been submitted yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
