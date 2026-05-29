import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ExternalLink, HelpCircle, PlusCircle, Search, Sparkles, Target, Trash2, Users, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { FilterPanel } from "@/components/FilterPanel";
import { PaginationControls } from "@/components/PaginationControls";
import { buildLinkedInFirstConnectionsUrl } from "@/lib/linkedinSearch";
import { getPageItems } from "@/lib/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleTeamsMeetingDialog } from "@/components/ScheduleTeamsMeetingDialog";
import { MeetingTranscriptsSection } from "@/components/MeetingTranscriptsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  createOpportunityRegistration,
  listClientPayPrograms,
  listCompanies,
  listCustomerTargets,
  listAdminReverseOpportunities,
  listOpportunityRegistrations,
  updateOpportunityRegistration,
  updateReverseOpportunityStatus,
  type CustomerTargetStatus,
  type RegistrationStatus,
  type OpportunityRegistration,
  type ReverseOpportunityStatus,
} from "@/lib/portalApi";

const ADMIN_OPPORTUNITY_PAGE_SIZE = 6;

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
type ReverseOpportunityTypeFilter = "ALL" | "NEW" | "ACTIVE" | "CONVERTED" | "CLOSED";
type AdminOpportunityTab = "priority" | "targets" | "registrations" | "reverse-opportunities";

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

const reverseOpportunityTypeFilters: { value: ReverseOpportunityTypeFilter; label: string }[] = [
  { value: "ALL", label: "All customer leads" },
  { value: "NEW", label: "New" },
  { value: "ACTIVE", label: "Active outreach" },
  { value: "CONVERTED", label: "Converted" },
  { value: "CLOSED", label: "Closed lost" },
];

const adminOpportunityTabs: AdminOpportunityTab[] = ["priority", "targets", "registrations", "reverse-opportunities"];

function isAdminOpportunityTab(value: string | null): value is AdminOpportunityTab {
  return Boolean(value && adminOpportunityTabs.includes(value as AdminOpportunityTab));
}

function FieldLabel({ children, tooltip }: { children: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label>{children}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`${children} help`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 text-sm" align="start">{tooltip}</PopoverContent>
      </Popover>
    </div>
  );
}

function reverseOpportunityVariant(status: ReverseOpportunityStatus) {
  if (status === "CLIENT_INTERESTED" || status === "CONVERTED") {
    return "success" as const;
  }
  if (status === "CLOSED_LOST") {
    return "destructive" as const;
  }
  if (status === "OUTREACH_READY" || status === "CLIENT_CONTACTED") {
    return "info" as const;
  }
  return "warning" as const;
}

export default function AdminOpportunities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [targetQuery, setTargetQuery] = useState("");
  const [registrationQuery, setRegistrationQuery] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState<TargetTypeFilter>("ALL");
  const [registrationTypeFilter, setRegistrationTypeFilter] = useState<RegistrationTypeFilter>("ALL");
  const [reverseOpportunityQuery, setReverseOpportunityQuery] = useState("");
  const [targetPage, setTargetPage] = useState(1);
  const [registrationPage, setRegistrationPage] = useState(1);
  const [reversePage, setReversePage] = useState(1);
  const [reverseOpportunityTypeFilter, setReverseOpportunityTypeFilter] = useState<ReverseOpportunityTypeFilter>("ALL");
  const [isCreateOpportunityOpen, setIsCreateOpportunityOpen] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    company_id: "",
    pay_program_id: "",
    target_account_name: "",
    business_unit: "",
    opportunity_description: "",
    client_contact: "",
    trusted_bums_contact: "",
    expected_product_service: "",
    estimated_deal_value: "",
    expected_timeline: "",
    notes: "",
  });
  const companiesQuery = useQuery({ queryKey: ["admin-companies-for-opportunities"], queryFn: listCompanies });
  const payProgramsQuery = useQuery({ queryKey: ["admin-pay-programs-for-opportunities"], queryFn: () => listClientPayPrograms() });
  const registrationsQuery = useQuery({
    queryKey: ["admin-opportunities", "All"],
    queryFn: () => listOpportunityRegistrations("All"),
  });
  const targetsQuery = useQuery({
    queryKey: ["admin-customer-targets"],
    queryFn: () => listCustomerTargets(null),
  });
  const reverseOpportunitiesQuery = useQuery({
    queryKey: ["admin-reverse-opportunities"],
    queryFn: listAdminReverseOpportunities,
  });
  const createOpportunityMutation = useMutation({
    mutationFn: () => createOpportunityRegistration(user!, {
      company_id: newOpportunity.company_id,
      pay_program_id: newOpportunity.pay_program_id || null,
      target_account_name: newOpportunity.target_account_name,
      business_unit: newOpportunity.business_unit,
      opportunity_description: newOpportunity.opportunity_description,
      client_contact: newOpportunity.client_contact,
      trusted_bums_contact: newOpportunity.trusted_bums_contact,
      expected_product_service: newOpportunity.expected_product_service,
      estimated_deal_value: newOpportunity.estimated_deal_value ? Number(newOpportunity.estimated_deal_value) : null,
      expected_timeline: newOpportunity.expected_timeline,
      notes: newOpportunity.notes,
      status: "Accepted",
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-opportunities"] });
      setNewOpportunity({ company_id: "", pay_program_id: "", target_account_name: "", business_unit: "", opportunity_description: "", client_contact: "", trusted_bums_contact: "", expected_product_service: "", estimated_deal_value: "", expected_timeline: "", notes: "" });
      setIsCreateOpportunityOpen(false);
      toast({ title: "Opportunity created", description: "The client opportunity is active for Bum matching." });
    },
    onError: (error) => {
      toast({
        title: "Unable to create opportunity",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const reverseStatusMutation = useMutation({
    mutationFn: async ({
      reverseOpportunityId,
      status,
    }: {
      reverseOpportunityId: string;
      status: ReverseOpportunityStatus;
    }) => updateReverseOpportunityStatus(user!, reverseOpportunityId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-reverse-opportunities"] });
      await queryClient.invalidateQueries({ queryKey: ["client-reverse-opportunities"] });
      await queryClient.invalidateQueries({ queryKey: ["bum-reverse-opportunities"] });
      toast({
        title: "Customer lead updated",
        description: "The demand-sourced workflow status was saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to update customer lead",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const companies = (companiesQuery.data ?? []).filter((company) => company.relationship_stage === "CLIENT");
  const payPrograms = payProgramsQuery.data ?? [];
  const selectedCompanyPayPrograms = payPrograms.filter((program) => program.company_id === newOpportunity.company_id && program.status === "ACTIVE" && program.approval_status !== "DENIED");
  const registrations = useMemo(() => registrationsQuery.data ?? [], [registrationsQuery.data]);
  const targets = useMemo(() => targetsQuery.data ?? [], [targetsQuery.data]);
  const reverseOpportunities = useMemo(() => reverseOpportunitiesQuery.data ?? [], [reverseOpportunitiesQuery.data]);
  const selectedRegistrationCompanyId = searchParams.get("companyId") ?? "ALL";
  const requestedTab = searchParams.get("tab");
  const activeTab = isAdminOpportunityTab(requestedTab)
    ? requestedTab
    : selectedRegistrationCompanyId !== "ALL"
      ? "registrations"
      : "priority";

  function updateOpportunitySearchParams(updates: { tab?: AdminOpportunityTab; companyId?: string }) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      if (updates.tab) {
        next.set("tab", updates.tab);
      }

      if (updates.companyId !== undefined) {
        if (updates.companyId === "ALL") {
          next.delete("companyId");
        } else {
          next.set("companyId", updates.companyId);
          next.set("tab", "registrations");
        }
      }

      return next;
    });
  }
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
          registration.status === "Accepted") ||
        (registrationTypeFilter === "NEEDS_ATTENTION" &&
          ["Submitted", "Needs Clarification", "Disputed", "Draft"].includes(registration.status)) ||
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

      const matchesCompany =
        selectedRegistrationCompanyId === "ALL" ||
        registration.company_id === selectedRegistrationCompanyId;

      return matchesType && matchesQuery && matchesCompany;
    });
  }, [registrationQuery, registrationTypeFilter, registrations, selectedRegistrationCompanyId]);
  const removeOpportunityMutation = useMutation({
    mutationFn: (registration: OpportunityRegistration) =>
      updateOpportunityRegistration(user!, registration, { status: "Rejected" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-opportunities"] });
      await queryClient.invalidateQueries({ queryKey: ["bum-marketplace-opportunities"] });
      toast({
        title: "Opportunity removed",
        description: "The opportunity was removed from the active marketplace.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to remove opportunity",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredReverseOpportunities = useMemo(() => {
    return reverseOpportunities.filter((opportunity) => {
      const matchesType =
        reverseOpportunityTypeFilter === "ALL" ||
        (reverseOpportunityTypeFilter === "NEW" && opportunity.status === "SUBMITTED") ||
        (reverseOpportunityTypeFilter === "ACTIVE" &&
          ["OUTREACH_READY", "CLIENT_CONTACTED", "CLIENT_INTERESTED"].includes(opportunity.status)) ||
        (reverseOpportunityTypeFilter === "CONVERTED" && opportunity.status === "CONVERTED") ||
        (reverseOpportunityTypeFilter === "CLOSED" && opportunity.status === "CLOSED_LOST");

      const matchesQuery = [
        opportunity.companies?.name,
        opportunity.customer_company_name,
        opportunity.customer_need_summary,
        opportunity.expected_product_service,
        opportunity.vendor_contact_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(reverseOpportunityQuery.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [reverseOpportunities, reverseOpportunityQuery, reverseOpportunityTypeFilter]);

  const priorityItems = useMemo(() => {
    const registrationItems = registrations
      .filter((registration) => ["Needs Clarification", "Disputed", "Draft"].includes(registration.status))
      .map((item) => ({ type: "registration" as const, id: item.id, title: item.target_account_name, status: item.status, detail: item.companies?.name ?? "Company pending" }));
    const targetItems = targets
      .filter((target) => ["INTRO_REQUESTED", "INTRO_IN_PROGRESS", "MEETING_SET", "OPEN_OPPORTUNITY"].includes(target.status))
      .map((item) => ({ type: "target" as const, id: item.id, title: item.target_companies?.name ?? item.target_account_name, status: targetLabel(item.status), detail: item.client_companies?.name ?? "Client pending" }));
    const reverseItems = reverseOpportunities
      .filter((opportunity) => ["SUBMITTED", "CLIENT_INTERESTED"].includes(opportunity.status))
      .map((item) => ({ type: "reverse" as const, id: item.id, title: item.customer_company_name, status: item.status.replaceAll("_", " "), detail: item.companies?.name ?? "Vendor pending" }));

    return [...registrationItems, ...targetItems, ...reverseItems];
  }, [registrations, reverseOpportunities, targets]);

  const visibleTargets = getPageItems(filteredTargets, targetPage, ADMIN_OPPORTUNITY_PAGE_SIZE);
  const visibleRegistrations = getPageItems(filteredRegistrations, registrationPage, ADMIN_OPPORTUNITY_PAGE_SIZE);
  const visibleReverseOpportunities = getPageItems(filteredReverseOpportunities, reversePage, ADMIN_OPPORTUNITY_PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Opportunities"
        description="Review target accounts separately from formal opportunity registrations and commission records."
      />

      <>
        {!isCreateOpportunityOpen ? (
          <div className="mb-6 flex justify-end">
            <Button onClick={() => setIsCreateOpportunityOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create opportunity
            </Button>
          </div>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 font-display">
                  <PlusCircle className="h-5 w-5 text-primary" /> Create opportunity
                </CardTitle>
                <Button variant="secondary" onClick={() => setIsCreateOpportunityOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-2">
                  <FieldLabel tooltip="Choose the client company that owns this opportunity.">Client</FieldLabel>
                  <Select value={newOpportunity.company_id} onValueChange={(value) => setNewOpportunity((current) => ({ ...current, company_id: value, pay_program_id: "" }))}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <FieldLabel tooltip="Enter the prospect, customer, or target account the client wants to pursue.">Target account</FieldLabel>
                  <Input value={newOpportunity.target_account_name} onChange={(event) => setNewOpportunity((current) => ({ ...current, target_account_name: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <FieldLabel tooltip="Optionally attach an approved client commission plan to set the payout rules for this opportunity.">Commission plan</FieldLabel>
                  <Select value={newOpportunity.pay_program_id || "none"} onValueChange={(value) => setNewOpportunity((current) => ({ ...current, pay_program_id: value === "none" ? "" : value }))} disabled={!newOpportunity.company_id}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific plan</SelectItem>
                      {selectedCompanyPayPrograms.map((program) => (
                        <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <FieldLabel tooltip="Name the client division, region, or product group tied to this opportunity, if applicable.">Business unit</FieldLabel>
                  <Input value={newOpportunity.business_unit} onChange={(event) => setNewOpportunity((current) => ({ ...current, business_unit: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <FieldLabel tooltip="Describe the product or service the client hopes to sell into the target account.">Expected product / service</FieldLabel>
                  <Input value={newOpportunity.expected_product_service} onChange={(event) => setNewOpportunity((current) => ({ ...current, expected_product_service: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <FieldLabel tooltip="Enter the estimated contract value or revenue opportunity before commissions.">Estimated deal value</FieldLabel>
                  <Input type="number" value={newOpportunity.estimated_deal_value} onChange={(event) => setNewOpportunity((current) => ({ ...current, estimated_deal_value: event.target.value }))} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <FieldLabel tooltip="List the client-side owner or stakeholder for follow-up.">Client contact</FieldLabel>
                  <Input value={newOpportunity.client_contact} onChange={(event) => setNewOpportunity((current) => ({ ...current, client_contact: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <FieldLabel tooltip="Name the internal Trusted Bums owner coordinating the opportunity.">Trusted Bums contact</FieldLabel>
                  <Input value={newOpportunity.trusted_bums_contact} onChange={(event) => setNewOpportunity((current) => ({ ...current, trusted_bums_contact: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <FieldLabel tooltip="Capture the expected timing, such as this quarter, next fiscal year, or a target close date.">Expected timeline</FieldLabel>
                  <Input value={newOpportunity.expected_timeline} onChange={(event) => setNewOpportunity((current) => ({ ...current, expected_timeline: event.target.value }))} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel tooltip="Summarize why this opportunity exists, the customer need, and the desired intro or next step.">Description</FieldLabel>
                  <Textarea rows={3} value={newOpportunity.opportunity_description} onChange={(event) => setNewOpportunity((current) => ({ ...current, opportunity_description: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <FieldLabel tooltip="Add internal context, caveats, or admin-only details that help manage the opportunity.">Notes</FieldLabel>
                  <Textarea rows={3} value={newOpportunity.notes} onChange={(event) => setNewOpportunity((current) => ({ ...current, notes: event.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button disabled={!newOpportunity.company_id || !newOpportunity.target_account_name || createOpportunityMutation.isPending} onClick={() => createOpportunityMutation.mutate()}>
                  {createOpportunityMutation.isPending ? "Creating..." : "Create opportunity"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </>

      <Tabs
        value={activeTab}
        onValueChange={(value) => updateOpportunitySearchParams({ tab: value as AdminOpportunityTab })}
        className="space-y-6"
      >
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="priority">Priority Queue</TabsTrigger>
          <TabsTrigger value="targets">Target Accounts</TabsTrigger>
          <TabsTrigger value="registrations">Opportunity Registrations</TabsTrigger>
          <TabsTrigger value="reverse-opportunities">Customer Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="priority">
          <div className="grid gap-4">
            {priorityItems.slice(0, ADMIN_OPPORTUNITY_PAGE_SIZE).map((item) => (
              <Card key={item.type + "-" + item.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge label={item.type} variant="secondary" />
                      <p className="font-display font-medium">{item.title}</p>
                      <StatusBadge label={item.status} variant="warning" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!priorityItems.length ? (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">No priority items need attention right now.</CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="targets">
          <FilterPanel className="mb-6" summary="Search and type">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.8fr)] md:items-end">
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
          </FilterPanel>
          <div className="grid gap-4">
            {visibleTargets.map((targetAccount) => (
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
                    <div className="shrink-0 text-left lg:text-right">
                      <p className="text-lg font-bold font-display">
                        {targetAccount.estimated_deal_value
                          ? `$${Number(targetAccount.estimated_deal_value).toLocaleString()}`
                          : "TBD"}
                      </p>
                      <p className="text-xs text-muted-foreground">{targetAccount.expected_timeline ?? "Timeline pending"}</p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={buildLinkedInFirstConnectionsUrl(
                              targetAccount.target_companies?.name ?? targetAccount.target_account_name,
                              targetAccount.target_companies?.linkedin_company_url,
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Find connections
                          </a>
                        </Button>
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
                      compact
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <PaginationControls page={targetPage} pageSize={ADMIN_OPPORTUNITY_PAGE_SIZE} totalItems={filteredTargets.length} onPageChange={setTargetPage} />
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
          <FilterPanel className="mb-6" summary="Search and type">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.7fr)_minmax(220px,0.7fr)] lg:items-end">
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
            <div className="space-y-2">
              <Label>Client</Label>
              <Select
                value={selectedRegistrationCompanyId}
                onValueChange={(value) => {
                  setRegistrationPage(1);
                  updateOpportunitySearchParams({ companyId: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All clients</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            </div>
          </FilterPanel>
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Opportunity Registrations</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {visibleRegistrations.map((registration) => (
                <Card key={registration.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                        <Button size="sm" variant="outline" className="mt-3" asChild>
                          <a
                            href={buildLinkedInFirstConnectionsUrl(registration.target_account_name)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Find connections
                          </a>
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold font-display">
                          {registration.estimated_deal_value
                            ? `$${Number(registration.estimated_deal_value).toLocaleString()}`
                            : "TBD"}
                        </p>
                        <p className="text-xs text-muted-foreground">Estimated value</p>
                        {registration.status !== "Rejected" ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="mt-3"
                            disabled={removeOpportunityMutation.isPending}
                            onClick={() => {
                              if (window.confirm(`Remove ${registration.target_account_name} from active opportunities?`)) {
                                removeOpportunityMutation.mutate(registration);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-5">
                      <MeetingTranscriptsSection
                        title="Transcripts"
                        description="Teams transcripts and meeting notes attached to this opportunity."
                        filters={{ opportunityRegistrationId: registration.id }}
                        companyId={registration.company_id}
                        allowAdd
                        compact
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <PaginationControls page={registrationPage} pageSize={ADMIN_OPPORTUNITY_PAGE_SIZE} totalItems={filteredRegistrations.length} onPageChange={setRegistrationPage} />
              {!filteredRegistrations.length && (
                <div className="text-sm text-muted-foreground">
                  {registrations.length ? "No opportunity registrations match your current filters." : "No opportunity registrations have been submitted yet."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reverse-opportunities">
          <FilterPanel className="mb-6" summary="Search and type">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.8fr)] md:items-end">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors, customers, needs, or contacts…"
                value={reverseOpportunityQuery}
                onChange={(event) => setReverseOpportunityQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={reverseOpportunityTypeFilter}
                onValueChange={(value: ReverseOpportunityTypeFilter) => setReverseOpportunityTypeFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reverseOpportunityTypeFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            </div>
          </FilterPanel>

          <div className="grid gap-4">
            {visibleReverseOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <p className="font-medium font-display">
                          {opportunity.companies?.name ?? "Vendor"} for {opportunity.customer_company_name}
                        </p>
                        <StatusBadge
                          label={opportunity.status.replaceAll("_", " ")}
                          variant={reverseOpportunityVariant(opportunity.status)}
                        />
                        <StatusBadge
                          label={opportunity.client_mode === "EXISTING_CLIENT" ? "Existing client" : "Prospect client"}
                          variant="secondary"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground max-w-3xl">{opportunity.customer_need_summary}</p>
                      <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <p className="inline-flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Customer: {opportunity.customer_company_name}
                        </p>
                        <p className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Vendor contact: {opportunity.vendor_contact_name ?? "Pending"}
                          {opportunity.vendor_contact_title ? ` · ${opportunity.vendor_contact_title}` : ""}
                        </p>
                      </div>
                      {opportunity.notes ? <p className="text-sm">{opportunity.notes}</p> : null}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-display">
                        {opportunity.estimated_deal_value
                          ? `$${Number(opportunity.estimated_deal_value).toLocaleString()}`
                          : "TBD"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {opportunity.expected_product_service ?? "Solution fit pending"}
                      </p>
                      <div className="mt-3">
                        <Select
                          value={opportunity.status}
                          onValueChange={(value: ReverseOpportunityStatus) =>
                            reverseStatusMutation.mutate({
                              reverseOpportunityId: opportunity.id,
                              status: value,
                            })
                          }
                        >
                          <SelectTrigger className="min-w-[210px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUBMITTED">Submitted</SelectItem>
                            <SelectItem value="OUTREACH_READY">Outreach Ready</SelectItem>
                            <SelectItem value="CLIENT_CONTACTED">Client Contacted</SelectItem>
                            <SelectItem value="CLIENT_INTERESTED">Client Interested</SelectItem>
                            <SelectItem value="CONVERTED">Converted</SelectItem>
                            <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <PaginationControls page={reversePage} pageSize={ADMIN_OPPORTUNITY_PAGE_SIZE} totalItems={filteredReverseOpportunities.length} onPageChange={setReversePage} />
            {!filteredReverseOpportunities.length && (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  {reverseOpportunities.length
                    ? "No customer leads match your current filters."
                    : "No customer leads have been submitted yet."}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
