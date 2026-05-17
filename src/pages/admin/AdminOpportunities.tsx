import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Search, Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleTeamsMeetingDialog } from "@/components/ScheduleTeamsMeetingDialog";
import { MeetingTranscriptsSection } from "@/components/MeetingTranscriptsSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

type TargetTypeFilter = "ALL" | "EARLY_PIPELINE" | "INTRO_ACTIVE" | "CLOSED";
type RegistrationTypeFilter = "ALL" | "OPEN" | "NEEDS_ATTENTION" | "CLOSED";

const targetTypeFilters: { value: TargetTypeFilter; label: string }[] = [
  { value: "ALL", label: "All target account types" },
  { value: "EARLY_PIPELINE", label: "Early pipeline" },
  { value: "INTRO_ACTIVE", label: "Intro active" },
  { value: "CLOSED", label: "Closed" },
];

const registrationTypeFilters: { value: RegistrationTypeFilter; label: string }[] = [
  { value: "ALL", label: "All registration types" },
  { value: "OPEN", label: "Open" },
  { value: "NEEDS_ATTENTION", label: "Needs attention" },
  { value: "CLOSED", label: "Closed" },
];

export default function AdminOpportunities() {
  const queryClient = useQueryClient();
  const [targetQuery, setTargetQuery] = useState("");
  const [registrationQuery, setRegistrationQuery] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState<TargetTypeFilter>("ALL");
  const [registrationTypeFilter, setRegistrationTypeFilter] = useState<RegistrationTypeFilter>("ALL");
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
  const filteredTargets = useMemo(() => {
    return targets.filter((targetAccount) => {
      const matchesType =
        targetTypeFilter === "ALL" ||
        (targetTypeFilter === "EARLY_PIPELINE" &&
          ["PROSPECT", "QUALIFYING"].includes(targetAccount.status)) ||
        (targetTypeFilter === "INTRO_ACTIVE" &&
          ["INTRO_REQUESTED", "INTRO_IN_PROGRESS", "MEETING_SET", "OPEN_OPPORTUNITY"].includes(targetAccount.status)) ||
        (targetTypeFilter === "CLOSED" && ["CLOSED_WON", "CLOSED_LOST"].includes(targetAccount.status));

      const matchesQuery = [
        targetAccount.target_companies?.name ?? targetAccount.target_account_name,
        targetAccount.client_companies?.name,
        targetAccount.expected_product_service,
        targetAccount.notes,
        targetAccount.key_contact_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(targetQuery.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [targetQuery, targetTypeFilter, targets]);
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((registration) => {
      const matchesType =
        registrationTypeFilter === "ALL" ||
        (registrationTypeFilter === "OPEN" &&
          ["Submitted", "Accepted"].includes(registration.status)) ||
        (registrationTypeFilter === "NEEDS_ATTENTION" &&
          ["Needs Clarification", "Disputed", "Draft"].includes(registration.status)) ||
        (registrationTypeFilter === "CLOSED" &&
          ["Closed Won", "Closed Lost", "Rejected"].includes(registration.status));

      const matchesQuery = [
        registration.target_account_name,
        registration.companies?.name,
        registration.opportunity_description,
        registration.expected_product_service,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(registrationQuery.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [registrationQuery, registrationTypeFilter, registrations]);

  return (
    <div>
      <PageHeader
        title="Opportunities"
        description="Review target accounts separately from formal opportunity registrations and commission records."
      />

      <Tabs defaultValue="targets" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="targets">Target Accounts</TabsTrigger>
          <TabsTrigger value="registrations">Opportunity Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value="targets">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.8fr)] mb-6">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search target accounts, clients, contacts, or notes…"
                value={targetQuery}
                onChange={(event) => setTargetQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={targetTypeFilter} onValueChange={(value: TargetTypeFilter) => setTargetTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {targetTypeFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4">
            {filteredTargets.map((targetAccount) => (
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
                  <div className="mt-5">
                    <MeetingTranscriptsSection
                      title="Transcripts"
                      description="Teams transcripts and meeting notes attached to this target account."
                      filters={{ customerTargetId: targetAccount.id }}
                      companyId={targetAccount.client_company_id}
                      allowAdd
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {!filteredTargets.length && (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  {targets.length ? "No target accounts match your current filters." : "No customer target accounts have been submitted yet."}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="registrations">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.8fr)] mb-6">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search opportunities, companies, or descriptions…"
                value={registrationQuery}
                onChange={(event) => setRegistrationQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={registrationTypeFilter}
                onValueChange={(value: RegistrationTypeFilter) => setRegistrationTypeFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {registrationTypeFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Opportunity Registrations</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {filteredRegistrations.map((registration) => (
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
                    <div className="mt-5">
                      <MeetingTranscriptsSection
                        title="Transcripts"
                        description="Teams transcripts and meeting notes attached to this opportunity."
                        filters={{ opportunityRegistrationId: registration.id }}
                        companyId={registration.company_id}
                        allowAdd
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!filteredRegistrations.length && (
                <div className="text-sm text-muted-foreground">
                  {registrations.length ? "No opportunity registrations match your current filters." : "No opportunity registrations have been submitted yet."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
