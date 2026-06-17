import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, PlusCircle, Sparkles, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  createClientPayProgramRequest,
  listSelectableClientPayPrograms,
  type ClientPayProgramApprovalStatus,
  type ClientPayProgramRecord,
} from "@/lib/portalApi";

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

function statusVariant(status: ClientPayProgramRecord["status"]) {
  if (status === "ACTIVE") {
    return "success" as const;
  }
  if (status === "PAUSED") {
    return "warning" as const;
  }
  return "info" as const;
}

function commissionScheduleSummary(plan: {
  year_1_rate: number;
  year_2_rate: number;
  year_3_rate: number;
  year_4_rate: number;
  year_5_rate: number;
  year_6_plus_rate: number;
}) {
  return `Y1 ${plan.year_1_rate}% / Y2 ${plan.year_2_rate}% / Y3 ${plan.year_3_rate}% / Y4 ${plan.year_4_rate}% / Y5 ${plan.year_5_rate}% / Y6+ ${plan.year_6_plus_rate}%`;
}

export default function ClientCommissionPlans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [requestForm, setRequestForm] = useState(initialRequestForm);
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const plansQuery = useQuery({
    queryKey: ["client-pay-programs", user?.clientId],
    queryFn: () => listSelectableClientPayPrograms(user!),
    enabled: Boolean(user?.clientId),
  });

  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const approvedCount = plans.filter((plan) => plan.approval_status === "APPROVED").length;
  const pendingCount = plans.filter((plan) => plan.approval_status === "PENDING").length;

  const updateRequestField = (field: keyof typeof initialRequestForm, value: string) => {
    setRequestForm((current) => ({ ...current, [field]: value }));
  };

  const requestMutation = useMutation({
    mutationFn: () =>
      createClientPayProgramRequest(user!, {
        name: requestForm.name,
        commission_rate: Number(requestForm.year_1_rate || 0),
        year_1_rate: Number(requestForm.year_1_rate || 0),
        year_2_rate: Number(requestForm.year_2_rate || 0),
        year_3_rate: Number(requestForm.year_3_rate || 0),
        year_4_rate: Number(requestForm.year_4_rate || 0),
        year_5_rate: Number(requestForm.year_5_rate || 0),
        year_6_plus_rate: Number(requestForm.year_6_plus_rate || 0),
        commission_period_months: requestForm.commission_period_months ? Number(requestForm.commission_period_months) : null,
        commission_basis: requestForm.commission_basis,
        payment_terms: requestForm.payment_terms,
        exclusions: requestForm.exclusions,
        notes: requestForm.notes,
        request_reason: requestForm.request_reason,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["client-pay-programs", user?.clientId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-commission-plans"] });
      setRequestForm(initialRequestForm);
      setIsRequestOpen(false);
      toast({
        title: "Commission plan request submitted",
        description: "The plan is pending Admin approval and will be available for opportunities after review.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to request commission plan",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const requestCommissionPlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    requestMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Commission Plans" description="Review available commission plans and request new plans for Admin approval.">
        <Button type="button" onClick={() => setIsRequestOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Request Plan
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Available plans</p>
            <p className="font-display mt-1 text-3xl font-bold">{plans.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="font-display mt-1 text-3xl font-bold">{approvedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending review</p>
            <p className="font-display mt-1 text-3xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      {isRequestOpen ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="font-display flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Request new plan
              </CardTitle>
              <Button type="button" variant="secondary" onClick={() => setIsRequestOpen(false)}>
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
                    placeholder="Enterprise software referral - 1%"
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
                <div className="space-y-2 md:col-span-2">
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
                  placeholder="Lower blended rate for a larger expected deal value."
                />
              </div>

              <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                The commission schedule starts when the first commission is paid to Trusted Bums. That first paid commission locks Year 1, and later payouts roll into Years 2, 3, 4, 5, and 6+ from that date.
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
                <Button type="submit" disabled={requestMutation.isPending}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {requestMutation.isPending ? "Submitting request..." : "Request new plan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Current commission plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {plansQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading commission plans...</p> : null}

          {plans.map((plan) => (
            <div key={plan.id} className="rounded-lg border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{commissionScheduleSummary(plan)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge label={plan.approval_status.toLowerCase()} variant={approvalVariant(plan.approval_status)} />
                  <StatusBadge label={plan.status.toLowerCase()} variant={statusVariant(plan.status)} />
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Term</p>
                  <p className="font-medium">{plan.commission_period_months ? `${plan.commission_period_months} months` : "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Basis</p>
                  <p className="font-medium">{plan.commission_basis || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment terms</p>
                  <p className="font-medium">{plan.payment_terms || "Not specified"}</p>
                </div>
              </div>
              {plan.request_reason || plan.exclusions || plan.notes ? (
                <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                  {plan.request_reason ? (
                    <div>
                      <p className="text-muted-foreground">Request reason</p>
                      <p>{plan.request_reason}</p>
                    </div>
                  ) : null}
                  {plan.exclusions ? (
                    <div>
                      <p className="text-muted-foreground">Exclusions</p>
                      <p>{plan.exclusions}</p>
                    </div>
                  ) : null}
                  {plan.notes ? (
                    <div>
                      <p className="text-muted-foreground">Notes</p>
                      <p>{plan.notes}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}

          {!plansQuery.isLoading && !plans.length ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No commission plans are available yet. Request a plan to send it to Admin for review.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
