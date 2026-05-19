import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckCircle, FileUp, Send, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  createClientPayProgramRequest,
  createOpportunityRegistration,
  listOwnOpportunityRegistrations,
  listSelectableClientPayPrograms,
  updateOwnOpportunityRegistration,
  type ClientPayProgramApprovalStatus,
  type OpportunityRegistration,
} from "@/lib/portalApi";
import { parseOpportunityImportFile, toOpportunityInput, type OpportunityImportRow } from "@/lib/opportunityImport";

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

export default function ClientOpportunityNew() {
  const { user } = useAuth();
  const { toast } = useToast();
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

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };
  const updateRequestField = (field: keyof typeof initialRequestForm, value: string) => {
    setRequestForm((current) => ({ ...current, [field]: value }));
  };

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

  return (
    <div>
      <PageHeader
        title="Register Opportunity"
        description="Use this after a target account becomes a real deal pursuit and you need a formal registration with commission terms."
      />

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

      <Card className="mb-6">
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

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Opportunity details</CardTitle>
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

            <div className="flex justify-end">
              <Button disabled={isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                Submit Registration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Request a new commission plan
          </CardTitle>
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-display">Registered opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="border-border/70">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg font-bold">{opportunity.target_account_name}</p>
                      <StatusBadge label={opportunity.status} variant="info" />
                      {opportunity.client_pay_programs ? (
                        <StatusBadge
                          label={`${opportunity.client_pay_programs.name} · ${opportunity.client_pay_programs.approval_status.toLowerCase()}`}
                          variant={approvalVariant(opportunity.client_pay_programs.approval_status)}
                        />
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Estimated value:{" "}
                      {opportunity.estimated_deal_value
                        ? `$${Number(opportunity.estimated_deal_value).toLocaleString()}`
                        : "Not set"}
                      {" · "}
                      Timeline: {opportunity.expected_timeline ?? "Not set"}
                    </p>
                    {opportunity.notes ? <p className="text-sm">{opportunity.notes}</p> : null}
                  </div>
                  <Button type="button" variant="outline" onClick={() => startEditing(opportunity)}>
                    Edit
                  </Button>
                </div>

                {editingOpportunityId === opportunity.id ? (
                  <div className="mt-5 grid gap-4 rounded-xl border bg-muted/20 p-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-value-${opportunity.id}`}>Estimated value</Label>
                      <Input
                        id={`edit-value-${opportunity.id}`}
                        type="number"
                        min="0"
                        step="1000"
                        value={editEstimatedDealValue}
                        onChange={(event) => setEditEstimatedDealValue(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-plan-${opportunity.id}`}>Commission plan</Label>
                      <Select value={editPayProgramId} onValueChange={setEditPayProgramId}>
                        <SelectTrigger id={`edit-plan-${opportunity.id}`}>
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
                      <Label htmlFor={`edit-timeline-${opportunity.id}`}>Expected timeline</Label>
                      <Input
                        id={`edit-timeline-${opportunity.id}`}
                        value={editExpectedTimeline}
                        onChange={(event) => setEditExpectedTimeline(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`edit-notes-${opportunity.id}`}>Notes</Label>
                      <Textarea
                        id={`edit-notes-${opportunity.id}`}
                        rows={3}
                        value={editNotes}
                        onChange={(event) => setEditNotes(event.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2 md:col-span-2">
                      <Button type="button" variant="outline" onClick={() => setEditingOpportunityId(null)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={() => void saveOpportunityEdit()} disabled={isSavingEdit || !editPayProgramId}>
                        {isSavingEdit ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}

          {!opportunities.length ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No opportunity registrations yet. Submit one above, then come back here any time to adjust estimated
              value and commission plan.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
