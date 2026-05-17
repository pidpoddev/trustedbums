import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Search, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  listClientPayPrograms,
  reviewClientPayProgram,
  type ClientPayProgramApprovalStatus,
} from "@/lib/portalApi";

type PlanTypeFilter = "ALL" | "PENDING" | "APPROVED" | "DENIED";

function approvalVariant(status: ClientPayProgramApprovalStatus) {
  if (status === "APPROVED") {
    return "success" as const;
  }
  if (status === "DENIED") {
    return "destructive" as const;
  }
  return "warning" as const;
}

export default function AdminCommissionPlans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<PlanTypeFilter>("ALL");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const plansQuery = useQuery({
    queryKey: ["admin-commission-plans"],
    queryFn: () => listClientPayPrograms(),
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
                {plan.companies?.name ?? "Unknown client"} · {plan.commission_rate}% commission
                {plan.commission_period_months ? ` · ${plan.commission_period_months} months` : ""}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
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
