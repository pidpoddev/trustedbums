import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, FileUp, PlusCircle, Send, Sparkles, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PaginationControls } from "@/components/PaginationControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { getPageItems } from "@/lib/pagination";
import {
  createClientPayProgramRequest,
  createOpportunityRegistration,
  listOpportunityClaims,
  listOwnOpportunityRegistrations,
  listSelectableClientPayPrograms,
  updateOwnOpportunityRegistration,
  type ClientPayProgramApprovalStatus,
  type OpportunityClaimRecord,
  type OpportunityRegistration,
} from "@/lib/portalApi";
import { formatDateForTimeZone } from "@/lib/timezone";
import { parseOpportunityImportFile, toOpportunityInput, type OpportunityImportRow } from "@/lib/opportunityImport";

const REGISTERED_OPPORTUNITIES_PAGE_SIZE = 6;

const initialForm = {
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
};

const initialRequestForm = {
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
  request_reason: "",
};

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

function registrationVariant(status: string) {
  if (["Accepted", "Closed Won"].includes(status)) {
    return "success" as const;
  }

  if (["Rejected", "Closed Lost"].includes(status)) {
    return "destructive" as const;
  }

  if (["Needs Clarification", "Disputed"].includes(status)) {
    return "warning" as const;
  }

  return "info" as const;
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "TBD";
  }

  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value));
}

function getAssignedClaim(claims: OpportunityClaimRecord[]) {
  return (
    claims.find((claim) => ["APPROVED", "SCHEDULED", "MEETING_HELD", "CLOSED"].includes(claim.status)) ??
    claims.find((claim) => claim.status === "PROPOSED") ??
    null
  );
}

function connectorName(claim: OpportunityClaimRecord | null) {
  if (!claim) {
    return "Unassigned";
  }

  return claim.profiles?.full_name ?? claim.profiles?.email ?? "Connector assigned";
}

function nextStepForOpportunity(opportunity: OpportunityRegistration, assignedClaim: OpportunityClaimRecord | null) {
  if (opportunity.status === "Submitted") {
    return "Trusted Bums review";
  }

  if (opportunity.status === "Needs Clarification") {
    return "Clarify details";
  }

  if (opportunity.status === "Accepted") {
    if (!assignedClaim) {
      return "Assign connector";
    }

    if (assignedClaim.status === "SCHEDULED") {
      return "Hold meeting";
    }

    if (assignedClaim.status === "MEETING_HELD") {
      return "Track outcome";
    }

    return "Connector outreach";
  }

  if (opportunity.status === "Disputed") {
    return "Resolve dispute";
  }

  if (opportunity.status === "Closed Won") {
    return "Report payment";
  }

  if (opportunity.status === "Closed Lost" || opportunity.status === "Rejected") {
    return "Closed";
  }

  return opportunity.expected_timeline ?? "Set next step";
}

export default function ClientOpportunityNew() {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const timeZone = useUserTimeZone();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [requestForm, setRequestForm] = useState(initialRequestForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [importRows, setImportRows] = useState<OpportunityImportRow[]>([]);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [editingOpportunityId, setEditingOpportunityId] = useState<string | null>(null);
  const [editEstimatedDealValue, setEditEstimatedDealValue] = useState("");
  const [editPayProgramId, setEditPayProgramId] = useState("");
  const [editExpectedTimeline, setEditExpectedTimeline] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isRequestingPlan, setIsRequestingPlan] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [registeredPage, setRegisteredPage] = useState(1);
  const [activeTab, setActiveTab] = useState(location.pathname.endsWith("/new") ? "register" : "pipeline");
  const [isRegisterOpen, setIsRegisterOpen] = useState(location.pathname.endsWith("/new"));
  const [isRequestPlanOpen, setIsRequestPlanOpen] = useState(false);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };
  const updateRequestField = (field: keyof typeof initialRequestForm, value: string) => {
    setRequestForm((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    if (location.pathname.endsWith("/new")) {
      setActiveTab("register");
      setIsRegisterOpen(true);
    }
  }, [location.pathname]);

  const importPreviewRows = useMemo(() => importRows.slice(0, 5), [importRows]);
  const payProgramsQuery = useQuery({
    queryKey: ["client-pay-programs", user?.clientId],
    queryFn: () => listSelectableClientPayPrograms(user!),
    enabled: Boolean(user?.clientId),
  });
  const opportunitiesQuery = useQuery({
    queryKey: ["client-opportunity-registrations", user?.clientId],
    queryFn: () => listOwnOpportunityRegistrations(user!),
    enabled: Boolean(user?.clientId),
  });
  const claimsQuery = useQuery({
    queryKey: ["client-opportunity-claims", user?.clientId],
    queryFn: () => listOpportunityClaims(),
    enabled: Boolean(user?.clientId),
  });

  const loadImportFile = async (file: File | null) => {
    if (!file) {
      setImportRows([]);
      setImportFileName(null);
      return;
    }

    try {
      const rows = await parseOpportunityImportFile(file);
      setImportRows(rows);
      setImportFileName(file.name);
      toast({
        title: "Import file ready",
        description: `${rows.length} ${rows.length === 1 ? "opportunity" : "opportunities"} parsed for review.`,
      });
    } catch (error) {
      setImportRows([]);
      setImportFileName(null);
      toast({
        title: "Unable to read import file",
        description: error instanceof Error ? error.message : "Please check the CSV and try again.",
        variant: "destructive",
      });
    }
  };

  const importOpportunities = async () => {
    if (!user || !importRows.length) {
      return;
    }

    setIsImporting(true);

    try {
      for (const row of importRows) {
        await createOpportunityRegistration(user, toOpportunityInput(row));
      }

      toast({
        title: "Opportunities imported",
        description: `${importRows.length} ${importRows.length === 1 ? "opportunity was" : "opportunities were"} submitted from ${importFileName ?? "your CSV"}.`,
      });
      setImportRows([]);
      setImportFileName(null);
    } catch (error) {
      toast({
        title: "Unable to import opportunities",
        description: error instanceof Error ? error.message : "Please fix the CSV and try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const requestCommissionPlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    setIsRequestingPlan(true);
    try {
      const plan = await createClientPayProgramRequest(user, {
        name: requestForm.name,
        commission_rate: Number(requestForm.year_1_rate || 0),
        year_1_rate: Number(requestForm.year_1_rate || 0),
        year_2_rate: Number(requestForm.year_2_rate || 0),
        year_3_rate: Number(requestForm.year_3_rate || 0),
        year_4_rate: Number(requestForm.year_4_rate || 0),
        year_5_rate: Number(requestForm.year_5_rate || 0),
        year_6_plus_rate: Number(requestForm.year_6_plus_rate || 0),
        commission_period_months: requestForm.commission_period_months
          ? Number(requestForm.commission_period_months)
          : null,
        commission_basis: requestForm.commission_basis,
        payment_terms: requestForm.payment_terms,
        exclusions: requestForm.exclusions,
        notes: requestForm.notes,
        request_reason: requestForm.request_reason,
      });

      await queryClient.invalidateQueries({ queryKey: ["client-pay-programs", user?.clientId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-commission-plans"] });
      setRequestForm(initialRequestForm);
      setForm((current) => ({ ...current, pay_program_id: plan.id }));
      setIsRequestPlanOpen(false);
      toast({
        title: "Commission plan request submitted",
        description: "The requested plan is now pending admin approval and has been attached to this opportunity draft.",
      });
    } catch (error) {
      toast({
        title: "Unable to request commission plan",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRequestingPlan(false);
    }
  };

  const startEditing = (opportunity: OpportunityRegistration) => {
    setEditingOpportunityId(opportunity.id);
    setEditEstimatedDealValue(
      opportunity.estimated_deal_value !== null && opportunity.estimated_deal_value !== undefined
        ? String(opportunity.estimated_deal_value)
        : "",
    );
    setEditPayProgramId(opportunity.pay_program_id ?? "");
    setEditExpectedTimeline(opportunity.expected_timeline ?? "");
    setEditNotes(opportunity.notes ?? "");
  };

  const saveOpportunityEdit = async () => {
    if (!user || !editingOpportunityId) {
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateOwnOpportunityRegistration(user, editingOpportunityId, {
        estimated_deal_value: editEstimatedDealValue.trim() ? Number(editEstimatedDealValue) : null,
        expected_timeline: editExpectedTimeline,
        notes: editNotes,
        pay_program_id: editPayProgramId || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-registrations", user?.clientId] });
      toast({
        title: "Opportunity updated",
        description: "Estimated value and commission plan were saved.",
      });
      setEditingOpportunityId(null);
    } catch (error) {
      toast({
        title: "Unable to update opportunity",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const submitOpportunity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    setIsSubmitting(true);
    try {
      const opportunity = await createOpportunityRegistration(user, {
        ...form,
        pay_program_id: form.pay_program_id || null,
        estimated_deal_value: form.estimated_deal_value ? Number(form.estimated_deal_value) : null,
        status: "Submitted",
      });
      setSubmittedId(opportunity.id);
      setForm(initialForm);
      setIsRegisterOpen(false);
      setActiveTab("pipeline");
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-registrations", user?.clientId] });
      toast({
        title: "Opportunity submitted",
        description: "Trusted Bums admin has been notified for review.",
      });
    } catch (error) {
      toast({
        title: "Unable to register opportunity",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const payPrograms = payProgramsQuery.data ?? [];
  const opportunities = opportunitiesQuery.data ?? [];
  const claimsByOpportunity = useMemo(() => {
    const grouped = new Map<string, OpportunityClaimRecord[]>();

    for (const claim of claimsQuery.data ?? []) {
      const current = grouped.get(claim.opportunity_registration_id) ?? [];
      current.push(claim);
      grouped.set(claim.opportunity_registration_id, current);
    }

    return grouped;
  }, [claimsQuery.data]);
  const visibleOpportunities = getPageItems(opportunities, registeredPage, REGISTERED_OPPORTUNITIES_PAGE_SIZE);
  const openPipelineCount = opportunities.filter((opportunity) => !["Closed Won", "Closed Lost", "Rejected"].includes(opportunity.status)).length;
  const totalPipelineValue = opportunities.reduce((sum, opportunity) => sum + Number(opportunity.estimated_deal_value ?? 0), 0);
  const acceptedCount = opportunities.filter((opportunity) => opportunity.status === "Accepted").length;

  return (
    <div>
      <PageHeader
        title="Opportunities"
        description="Manage the client opportunity pipeline, registration status, connector assignment, value, next step, and commission plan."
      >
        <Button
          type="button"
          onClick={() => {
            setActiveTab("register");
            setIsRegisterOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Register Opportunity
        </Button>
      </PageHeader>

      {submittedId && (
        <Card className="mb-6 border-success/40 bg-success/5">
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium">Registration submitted</p>
                <p className="text-sm text-muted-foreground">Audit record created. Admin review is now pending.</p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/client/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="commission-plan">Commission Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <FileUp className="h-5 w-5 text-primary" />
                Import opportunity list
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How this works</p>
            <p className="mt-2">
              Upload a CSV from your prospecting list and we’ll turn each valid row into a submitted opportunity
              registration. Good header names include:
            </p>
            <p className="mt-2 font-mono text-xs break-all">
              target_account_name, account_name, company_name, business_unit, expected_product_service,
              estimated_deal_value, expected_timeline, client_contact, notes
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opportunityImportFile">CSV file</Label>
            <Input
              id="opportunityImportFile"
              type="file"
              accept=".csv"
              onChange={(event) => void loadImportFile(event.target.files?.[0] ?? null)}
            />
          </div>

          {importFileName ? (
            <div className="rounded-xl border p-4">
              <p className="font-medium">{importFileName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {importRows.length} {importRows.length === 1 ? "row" : "rows"} ready to import
              </p>
            </div>
          ) : null}

          {importPreviewRows.length ? (
            <div className="rounded-xl border">
              <div className="border-b px-4 py-3">
                <p className="font-medium">Preview</p>
                <p className="text-sm text-muted-foreground">Showing the first {importPreviewRows.length} rows.</p>
              </div>
              <div className="divide-y">
                {importPreviewRows.map((row) => (
                  <div key={`${row.rowNumber}-${row.target_account_name}`} className="grid gap-1 px-4 py-3 md:grid-cols-[1.2fr_1fr_0.8fr]">
                    <div>
                      <p className="font-medium">{row.target_account_name}</p>
                      <p className="text-xs text-muted-foreground">CSV row {row.rowNumber}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {row.expected_product_service ?? row.business_unit ?? "No product or business unit provided"}
                    </div>
                    <div className="text-sm text-muted-foreground md:text-right">
                      {row.estimated_deal_value !== null && row.estimated_deal_value !== undefined
                        ? `$${row.estimated_deal_value.toLocaleString()}`
                        : "Deal value TBD"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Rows without a target account name are skipped automatically.
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={!importRows.length || isImporting}
              onClick={() => void importOpportunities()}
            >
              <FileUp className="mr-2 h-4 w-4" />
              {isImporting
                ? "Importing..."
                : `Import ${importRows.length} ${importRows.length === 1 ? "opportunity" : "opportunities"}`}
            </Button>
          </div>
        </CardContent>
      </Card>

        </TabsContent>

        <TabsContent value="register">
          {!isRegisterOpen ? (
            <div className="flex justify-end">
              <Button onClick={() => setIsRegisterOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create opportunity
              </Button>
            </div>
          ) : (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="font-display">Opportunity details</CardTitle>
                <Button type="button" variant="secondary" onClick={() => setIsRegisterOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={submitOpportunity}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="targetAccount">Target account name</Label>
                <Input
                  id="targetAccount"
                  required
                  value={form.target_account_name}
                  onChange={(event) => updateField("target_account_name", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessUnit">Business unit / department</Label>
                <Input
                  id="businessUnit"
                  value={form.business_unit}
                  onChange={(event) => updateField("business_unit", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientContact">Client contact</Label>
                <Input
                  id="clientContact"
                  value={form.client_contact}
                  onChange={(event) => updateField("client_contact", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tbContact">Trusted Bums contact</Label>
                <Input
                  id="tbContact"
                  value={form.trusted_bums_contact}
                  onChange={(event) => updateField("trusted_bums_contact", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Expected product/service</Label>
                <Input
                  id="product"
                  value={form.expected_product_service}
                  onChange={(event) => updateField("expected_product_service", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealValue">Estimated deal value</Label>
                <Input
                  id="dealValue"
                  type="number"
                  min="0"
                  step="1000"
                  value={form.estimated_deal_value}
                  onChange={(event) => updateField("estimated_deal_value", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Expected timeline</Label>
                <Input
                  id="timeline"
                  value={form.expected_timeline}
                  onChange={(event) => updateField("expected_timeline", event.target.value)}
                  placeholder="Example: Q3 pilot, Q4 close"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payProgram">Commission plan</Label>
                <Select value={form.pay_program_id} onValueChange={(value) => updateField("pay_program_id", value)}>
                  <SelectTrigger id="payProgram">
                    <SelectValue placeholder="Select a commission plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {payPrograms.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} · {commissionScheduleSummary(plan)} · {plan.approval_status.toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Clients only see commission plans assigned to their own company. Pending requests can be attached now and approved by Admin afterward.
                </p>
                <p className="text-xs text-muted-foreground">
                  The commission schedule starts when the first commission is paid to Trusted Bums. Until then, the system treats payments as Year 1.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opportunity description</Label>
              <Textarea
                id="description"
                rows={4}
                value={form.opportunity_description}
                onChange={(event) => updateField("opportunity_description", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={4} value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
            </div>

            <div className="sticky bottom-3 z-10 flex justify-end rounded-lg border bg-background/95 p-3 shadow-sm backdrop-blur">
              <Button disabled={isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                Submit Registration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
          )}

        </TabsContent>

        <TabsContent value="commission-plan">
          {!isRequestPlanOpen ? (
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsRequestPlanOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Request commission plan
              </Button>
            </div>
          ) : (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="font-display flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Request a new commission plan
                </CardTitle>
                <Button type="button" variant="secondary" onClick={() => setIsRequestPlanOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={requestCommissionPlan}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="request-name">Plan name</Label>
                <Input
                  id="request-name"
                  required
                  value={requestForm.name}
                  onChange={(event) => updateRequestField("name", event.target.value)}
                  placeholder="Dell Enterprise Program - 1%"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-year-1-rate">Year 1 commission %</Label>
                <Input
                  id="request-year-1-rate"
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  value={requestForm.year_1_rate}
                  onChange={(event) => updateRequestField("year_1_rate", event.target.value)}
                  placeholder="25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-year-2-rate">Year 2 commission %</Label>
                <Input
                  id="request-year-2-rate"
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  value={requestForm.year_2_rate}
                  onChange={(event) => updateRequestField("year_2_rate", event.target.value)}
                  placeholder="20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-year-3-rate">Year 3 commission %</Label>
                <Input
                  id="request-year-3-rate"
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  value={requestForm.year_3_rate}
                  onChange={(event) => updateRequestField("year_3_rate", event.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-year-4-rate">Year 4 commission %</Label>
                <Input
                  id="request-year-4-rate"
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  value={requestForm.year_4_rate}
                  onChange={(event) => updateRequestField("year_4_rate", event.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-year-5-rate">Year 5 commission %</Label>
                <Input
                  id="request-year-5-rate"
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  value={requestForm.year_5_rate}
                  onChange={(event) => updateRequestField("year_5_rate", event.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-year-6-plus-rate">Year 6+ commission %</Label>
                <Input
                  id="request-year-6-plus-rate"
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  value={requestForm.year_6_plus_rate}
                  onChange={(event) => updateRequestField("year_6_plus_rate", event.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-period">Commission period (months)</Label>
                <Input
                  id="request-period"
                  type="number"
                  min="1"
                  value={requestForm.commission_period_months}
                  onChange={(event) => updateRequestField("commission_period_months", event.target.value)}
                  placeholder="36"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-basis">Commission basis</Label>
                <Input
                  id="request-basis"
                  value={requestForm.commission_basis}
                  onChange={(event) => updateRequestField("commission_basis", event.target.value)}
                  placeholder="1% of collected license revenue"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="request-why">Why do you need this plan?</Label>
              <Textarea
                id="request-why"
                required
                rows={3}
                value={requestForm.request_reason}
                onChange={(event) => updateRequestField("request_reason", event.target.value)}
                placeholder="Dell-sized account, lower blended rate, but a much larger expected deal value."
              />
            </div>

            <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
              The commission schedule start date is the date the first commission is paid to Trusted Bums. That first paid commission locks the Year 1 start, and later payouts roll into Years 2, 3, 4, 5, and 6+ automatically from that date.
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="request-payment-terms">Payment terms</Label>
                <Textarea
                  id="request-payment-terms"
                  rows={3}
                  value={requestForm.payment_terms}
                  onChange={(event) => updateRequestField("payment_terms", event.target.value)}
                  placeholder="Payable within 30 days after collection."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-exclusions">Exclusions</Label>
                <Textarea
                  id="request-exclusions"
                  rows={3}
                  value={requestForm.exclusions}
                  onChange={(event) => updateRequestField("exclusions", event.target.value)}
                  placeholder="Taxes, refunds, pass-through cloud costs."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="request-notes">Internal notes</Label>
              <Textarea
                id="request-notes"
                rows={3}
                value={requestForm.notes}
                onChange={(event) => updateRequestField("notes", event.target.value)}
                placeholder="Anything Admin should know before approving or denying this plan."
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={isRequestingPlan}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isRequestingPlan ? "Submitting request..." : "Request new plan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
          )}

        </TabsContent>

        <TabsContent value="pipeline">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Open pipeline</p>
                <p className="font-display mt-1 text-3xl font-bold">{openPipelineCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Estimated value</p>
                <p className="font-display mt-1 text-3xl font-bold">{formatMoney(totalPipelineValue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="font-display mt-1 text-3xl font-bold">{acceptedCount}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="font-display">Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Next Step</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Assigned Connector</TableHead>
                    <TableHead>Commission Plan</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleOpportunities.map((opportunity) => {
                    const opportunityClaims = claimsByOpportunity.get(opportunity.id) ?? [];
                    const assignedClaim = getAssignedClaim(opportunityClaims);
                    const plan = opportunity.client_pay_programs;

                    return (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{opportunity.target_account_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {opportunity.expected_product_service ?? opportunity.business_unit ?? "No product or business unit set"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge label={opportunity.status} variant={registrationVariant(opportunity.status)} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDateForTimeZone(opportunity.updated_at ?? opportunity.created_at, timeZone)}
                        </TableCell>
                        <TableCell>{nextStepForOpportunity(opportunity, assignedClaim)}</TableCell>
                        <TableCell className="font-medium">{formatMoney(opportunity.estimated_deal_value)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p>{connectorName(assignedClaim)}</p>
                            {assignedClaim ? <p className="text-xs text-muted-foreground">{assignedClaim.status.replaceAll("_", " ").toLowerCase()}</p> : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p>{plan?.name ?? "No plan"}</p>
                            {plan ? <StatusBadge label={plan.approval_status.toLowerCase()} variant={approvalVariant(plan.approval_status)} /> : null}
                          </div>
                        </TableCell>
                        <TableCell>{opportunity.client_contact ?? opportunity.trusted_bums_contact ?? "Client team"}</TableCell>
                        <TableCell className="text-right">
                          <Button type="button" variant="outline" size="sm" onClick={() => startEditing(opportunity)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {editingOpportunityId ? (
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Edit opportunity</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pipeline-edit-value">Estimated value</Label>
                      <Input
                        id="pipeline-edit-value"
                        type="number"
                        min="0"
                        step="1000"
                        value={editEstimatedDealValue}
                        onChange={(event) => setEditEstimatedDealValue(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pipeline-edit-plan">Commission plan</Label>
                      <Select value={editPayProgramId} onValueChange={setEditPayProgramId}>
                        <SelectTrigger id="pipeline-edit-plan">
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {payPrograms.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} · {commissionScheduleSummary(plan)} · {plan.approval_status.toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pipeline-edit-timeline">Expected timeline</Label>
                      <Input id="pipeline-edit-timeline" value={editExpectedTimeline} onChange={(event) => setEditExpectedTimeline(event.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pipeline-edit-notes">Notes</Label>
                      <Textarea id="pipeline-edit-notes" rows={3} value={editNotes} onChange={(event) => setEditNotes(event.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 md:col-span-2">
                      <Button type="button" variant="outline" onClick={() => setEditingOpportunityId(null)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={() => void saveOpportunityEdit()} disabled={isSavingEdit}>
                        {isSavingEdit ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <PaginationControls page={registeredPage} pageSize={REGISTERED_OPPORTUNITIES_PAGE_SIZE} totalItems={opportunities.length} onPageChange={setRegisteredPage} />

              {!opportunities.length ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No opportunities are registered yet. Use Register Opportunity when a target account becomes an active deal pursuit.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
