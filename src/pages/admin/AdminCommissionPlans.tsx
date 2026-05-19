import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, HelpCircle, PlusCircle, Search, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  createClientPayProgramRequest,
  listClientPayPrograms,
  listCompanies,
  reviewClientPayProgram,
  type ClientPayProgramApprovalStatus,
} from "@/lib/portalApi";

type PlanTypeFilter = "ALL" | "PENDING" | "APPROVED" | "DENIED";

function FieldLabel({ children, tooltip }: { children: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label>{children}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-muted-foreground transition-colors hover:text-foreground" aria-label={`${children} help`}>
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
      </Tooltip>
    </div>
  );
}

function approvalVariant(status: ClientPayProgramApprovalStatus) {
  if (status === "APPROVED") {
    return "success" as const;
  }
  if (status === "DENIED") {
    return "destructive" as const;
  }
  return "warning" as const;
}

function commissionScheduleSummary(plan: {
  year_1_rate: number;
  year_2_rate: number;
  year_3_rate: number;
  year_4_rate: number;
  year_5_rate: number;
  year_6_plus_rate: number;
}) {
  return `Y1 ${plan.year_1_rate}% · Y2 ${plan.year_2_rate}% · Y3 ${plan.year_3_rate}% · Y4 ${plan.year_4_rate}% · Y5 ${plan.year_5_rate}% · Y6+ ${plan.year_6_plus_rate}%`;
}

export default function AdminCommissionPlans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<PlanTypeFilter>("ALL");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    company_id: "",
    name: "",
    year_1_rate: "",
    year_2_rate: "",
    year_3_rate: "",
    year_4_rate: "",
    year_5_rate: "",
    year_6_plus_rate: "",
    commission_period_months: "",
    commission_basis: "",
    payment_terms: "",
    exclusions: "",
    notes: "",
  });

  const companiesQuery = useQuery({ queryKey: ["admin-companies-for-commission-plans"], queryFn: listCompanies });
  const plansQuery = useQuery({
    queryKey: ["admin-commission-plans"],
    queryFn: () => listClientPayPrograms(),
  });

  const createPlanMutation = useMutation({
    mutationFn: () => createClientPayProgramRequest(user!, {
      company_id: newPlan.company_id,
      approval_status: "APPROVED",
      name: newPlan.name,
      commission_rate: Number(newPlan.year_1_rate || 0),
      year_1_rate: Number(newPlan.year_1_rate || 0),
      year_2_rate: Number(newPlan.year_2_rate || 0),
      year_3_rate: Number(newPlan.year_3_rate || 0),
      year_4_rate: Number(newPlan.year_4_rate || 0),
      year_5_rate: Number(newPlan.year_5_rate || 0),
      year_6_plus_rate: Number(newPlan.year_6_plus_rate || 0),
      commission_period_months: newPlan.commission_period_months ? Number(newPlan.commission_period_months) : null,
      commission_basis: newPlan.commission_basis,
      payment_terms: newPlan.payment_terms,
      exclusions: newPlan.exclusions,
      notes: newPlan.notes,
      request_reason: "Created by admin",
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-commission-plans"] });
      await queryClient.invalidateQueries({ queryKey: ["client-pay-programs"] });
      setNewPlan({ company_id: "", name: "", year_1_rate: "", year_2_rate: "", year_3_rate: "", year_4_rate: "", year_5_rate: "", year_6_plus_rate: "", commission_period_months: "", commission_basis: "", payment_terms: "", exclusions: "", notes: "" });
      setIsCreatePlanOpen(false);
      toast({ title: "Commission plan created", description: "The plan is active and approved for the selected client." });
    },
    onError: (error) => {
      toast({
        title: "Unable to create commission plan",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      planId,
      approvalStatus,
    }: {
      planId: string;
      approvalStatus: ClientPayProgramApprovalStatus;
    }) => reviewClientPayProgram(user!, planId, approvalStatus, reviewNotes[planId]),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-commission-plans"] });
      await queryClient.invalidateQueries({ queryKey: ["client-pay-programs"] });
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-registrations"] });
      toast({
        title: variables.approvalStatus === "APPROVED" ? "Commission plan approved" : "Commission plan denied",
        description: "The client-specific plan review was saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to review commission plan",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const companies = (companiesQuery.data ?? []).filter((company) => company.relationship_stage === "CLIENT");
  const plans = plansQuery.data ?? [];
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesType = typeFilter === "ALL" || plan.approval_status === typeFilter;
      const matchesQuery = [
        plan.name,
        plan.companies?.name,
        plan.request_reason,
        plan.commission_basis,
        plan.payment_terms,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [plans, query, typeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commission Plans"
        description="Review company-specific commission plans, approve client requests, and keep plan visibility scoped to the assigned client."
      />

      <TooltipProvider>
        {!isCreatePlanOpen ? (
          <div className="flex justify-end">
            <Button onClick={() => setIsCreatePlanOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create commission plan
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 font-display">
                  <PlusCircle className="h-5 w-5 text-primary" /> Create commission plan
                </CardTitle>
                <Button variant="secondary" onClick={() => setIsCreatePlanOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-2">
                  <FieldLabel tooltip="Choose the client company this commission plan belongs to.">Client</FieldLabel>
                  <Select value={newPlan.company_id} onValueChange={(value) => setNewPlan((current) => ({ ...current, company_id: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <FieldLabel tooltip="Use a recognizable name admins and clients can identify later, such as Standard Intro Commission.">Plan name</FieldLabel>
                  <Input value={newPlan.name} onChange={(event) => setNewPlan((current) => ({ ...current, name: event.target.value }))} placeholder="Standard intro commission" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {([
                  ["year_1_rate", "Year 1 %"],
                  ["year_2_rate", "Year 2 %"],
                  ["year_3_rate", "Year 3 %"],
                  ["year_4_rate", "Year 4 %"],
                  ["year_5_rate", "Year 5 %"],
                  ["year_6_plus_rate", "Year 6+ %"],
                ] as const).map(([key, label], index) => (
                  <div key={key} className="space-y-2">
                    <FieldLabel tooltip={index === 5 ? "Enter the commission percentage paid from year 6 onward." : `Enter the commission percentage paid during ${label.replace(" %", "").toLowerCase()}.`}>{label}</FieldLabel>
                    <Input type="number" value={newPlan[key]} onChange={(event) => setNewPlan((current) => ({ ...current, [key]: event.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <FieldLabel tooltip="Optionally limit how many months commissions are payable for this plan.">Commission period months</FieldLabel>
                  <Input type="number" value={newPlan.commission_period_months} onChange={(event) => setNewPlan((current) => ({ ...current, commission_period_months: event.target.value }))} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <FieldLabel tooltip="Describe what commission is calculated from, such as net revenue, gross margin, or first-year ARR.">Commission basis</FieldLabel>
                  <Input value={newPlan.commission_basis} onChange={(event) => setNewPlan((current) => ({ ...current, commission_basis: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <FieldLabel tooltip="Define when Trusted Bums is paid, for example net 30 after client payment is received.">Payment terms</FieldLabel>
                  <Input value={newPlan.payment_terms} onChange={(event) => setNewPlan((current) => ({ ...current, payment_terms: event.target.value }))} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel tooltip="List any products, accounts, services, geographies, or deal types that do not earn commission.">Exclusions</FieldLabel>
                  <Textarea rows={3} value={newPlan.exclusions} onChange={(event) => setNewPlan((current) => ({ ...current, exclusions: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <FieldLabel tooltip="Add internal context or approval notes about why this plan exists.">Notes</FieldLabel>
                  <Textarea rows={3} value={newPlan.notes} onChange={(event) => setNewPlan((current) => ({ ...current, notes: event.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button disabled={!newPlan.company_id || !newPlan.name || !newPlan.year_1_rate || createPlanMutation.isPending} onClick={() => createPlanMutation.mutate()}>
                  {createPlanMutation.isPending ? "Creating..." : "Create commission plan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </TooltipProvider>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.8fr)]">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search plans, companies, or request reasons..."
            className="pl-9"
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={typeFilter} onValueChange={(value: PlanTypeFilter) => setTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All plans</SelectItem>
              <SelectItem value="PENDING">Pending approval</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="DENIED">Denied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
                <StatusBadge label={plan.approval_status} variant={approvalVariant(plan.approval_status)} />
                <StatusBadge label={plan.status} variant="secondary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.companies?.name ?? "Unknown client"} · {commissionScheduleSummary(plan)}
                {plan.commission_period_months ? ` · ${plan.commission_period_months} months` : ""}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                <div>
                  <p className="font-medium text-foreground">Schedule start</p>
                  <p>Starts when the first commission is paid to Trusted Bums.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Commission basis</p>
                  <p>{plan.commission_basis ?? "Not specified"}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Payment terms</p>
                  <p>{plan.payment_terms ?? "Not specified"}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Exclusions</p>
                  <p>{plan.exclusions ?? "No exclusions listed"}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Requested by</p>
                  <p>{plan.requested_by_profile?.full_name ?? plan.requested_by_profile?.email ?? "System / Admin seeded"}</p>
                </div>
              </div>

              {plan.request_reason ? (
                <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                  <p className="font-medium">Why the client requested this plan</p>
                  <p className="mt-1 text-muted-foreground">{plan.request_reason}</p>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor={`review-note-${plan.id}`}>Review note</Label>
                <Textarea
                  id={`review-note-${plan.id}`}
                  rows={3}
                  value={reviewNotes[plan.id] ?? ""}
                  onChange={(event) =>
                    setReviewNotes((current) => ({ ...current, [plan.id]: event.target.value }))
                  }
                  placeholder="Optional note for approval, denial, or follow-up..."
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => reviewMutation.mutate({ planId: plan.id, approvalStatus: "DENIED" })}
                  disabled={reviewMutation.isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Deny
                </Button>
                <Button
                  onClick={() => reviewMutation.mutate({ planId: plan.id, approvalStatus: "APPROVED" })}
                  disabled={reviewMutation.isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!filteredPlans.length ? (
          <Card className="xl:col-span-2">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              {plans.length ? "No commission plans match your current filters." : "No commission plans have been created yet."}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
