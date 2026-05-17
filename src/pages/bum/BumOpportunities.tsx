import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  createCustomerTargetResponse,
  listCustomerTargets,
  listMarketplaceOpportunities,
  type CustomerTargetRecord,
  type CustomerTargetResponseStrength,
} from "@/lib/portalApi";
import { Search, Briefcase, Calendar, DollarSign, Target, Handshake } from "lucide-react";
import { Link } from "react-router-dom";

const responseFormInitial = {
  contactName: "",
  contactEmail: "",
  relationshipStrength: "warm" as CustomerTargetResponseStrength,
  note: "",
};

export default function BumOpportunities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<CustomerTargetRecord | null>(null);
  const [responseForm, setResponseForm] = useState(responseFormInitial);
  const opportunitiesQuery = useQuery({
    queryKey: ["bum-marketplace-opportunities"],
    queryFn: listMarketplaceOpportunities,
  });
  const targetsQuery = useQuery({
    queryKey: ["bum-customer-target-opportunities"],
    queryFn: () => listCustomerTargets(null),
  });
  const opportunities = opportunitiesQuery.data ?? [];
  const targets = targetsQuery.data ?? [];

  const responseMutation = useMutation({
    mutationFn: () =>
      createCustomerTargetResponse(user!, {
        customerTargetId: selectedTarget!.id,
        contactName: responseForm.contactName,
        contactEmail: responseForm.contactEmail,
        relationshipStrength: responseForm.relationshipStrength,
        note: responseForm.note,
      }),
    onSuccess: () => {
      toast({
        title: "Response sent",
        description: "Trusted Bums now has your relationship context for this client target.",
      });
      setSelectedTarget(null);
      setResponseForm(responseFormInitial);
    },
    onError: (error) => {
      toast({
        title: "Unable to send response",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const filtered = opportunities.filter((opportunity) => {
    const matchesQuery = `${opportunity.target_account_name} ${opportunity.companies?.name ?? ""} ${opportunity.opportunity_description ?? ""} ${opportunity.expected_product_service ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesQuery;
  });
  const filteredTargets = targets.filter((target) => {
    const matchesQuery = `${target.target_companies?.name ?? target.target_account_name} ${target.client_companies?.name ?? ""} ${target.expected_product_service ?? ""} ${target.notes ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesQuery;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities"
        description="Browse live client opportunities and recommend customers you know."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {(opportunitiesQuery.isLoading || targetsQuery.isLoading) && (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Loading live opportunities...
        </div>
      )}

      <div className="grid gap-4">
        {filteredTargets.map((targetAccount) => (
          <Card key={`target-${targetAccount.id}`} className="transition-shadow hover:shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold">
                      {targetAccount.target_companies?.name ?? targetAccount.target_account_name}
                    </h3>
                    <StatusBadge label={targetAccount.status.replaceAll("_", " ")} variant="info" />
                    <StatusBadge label="Client target" variant="warning" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {targetAccount.client_companies?.name ?? "Client pending"} • {targetAccount.priority} priority
                  </p>
                  <p className="mt-2 text-sm">
                    {targetAccount.notes ?? targetAccount.expected_product_service ?? "Client is looking for a path into this target account."}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {targetAccount.estimated_deal_value
                        ? `$${Number(targetAccount.estimated_deal_value).toLocaleString()} estimated`
                        : "Value pending"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {targetAccount.expected_timeline?.trim() || "Timeline to be confirmed"}
                    </span>
                  </div>
                </div>
                <div>
                  <Button size="sm" onClick={() => setSelectedTarget(targetAccount)}>
                    <Handshake className="mr-2 h-4 w-4" />
                    I know someone
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.map((opportunity) => (
          <Card key={opportunity.id} className="transition-shadow hover:shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-accent/10 p-3">
                  <Briefcase className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold">{opportunity.target_account_name}</h3>
                    <StatusBadge label="Open" variant="success" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {opportunity.companies?.name ?? "Client pending"} • {opportunity.commission_rate}% commission
                  </p>
                  <p className="mt-2 text-sm">{opportunity.opportunity_description ?? "No description provided yet."}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {opportunity.estimated_deal_value
                        ? `$${Number(opportunity.estimated_deal_value).toLocaleString()} estimated`
                        : "Estimated value pending"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {opportunity.expected_timeline?.trim() || "Timeline to be confirmed"}
                    </span>
                  </div>
                </div>
                <div>
                  <Link to={`/bum/opportunities/${opportunity.id}`}>
                    <Button size="sm">View opportunity</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!opportunitiesQuery.isLoading && !targetsQuery.isLoading && filtered.length === 0 && filteredTargets.length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
            {opportunities.length || targets.length
              ? "No live opportunities match your search."
              : "No live opportunities are available yet."}
          </div>
        )}
      </div>

      <Dialog open={Boolean(selectedTarget)} onOpenChange={(open) => !open && setSelectedTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Tell us who you know</DialogTitle>
            <DialogDescription>
              Share the person or path you have into {selectedTarget?.target_companies?.name ?? selectedTarget?.target_account_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-contact-name">Contact or path</Label>
              <Input
                id="target-contact-name"
                value={responseForm.contactName}
                onChange={(event) => setResponseForm((current) => ({ ...current, contactName: event.target.value }))}
                placeholder="Jane Doe, CIO or former colleague who can intro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-contact-email">Email if known</Label>
              <Input
                id="target-contact-email"
                type="email"
                value={responseForm.contactEmail}
                onChange={(event) => setResponseForm((current) => ({ ...current, contactEmail: event.target.value }))}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Relationship strength</Label>
              <Select
                value={responseForm.relationshipStrength}
                onValueChange={(value: CustomerTargetResponseStrength) =>
                  setResponseForm((current) => ({ ...current, relationshipStrength: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strong">Strong direct relationship</SelectItem>
                  <SelectItem value="warm">Warm path</SelectItem>
                  <SelectItem value="advisor">Can advise on account</SelectItem>
                  <SelectItem value="unknown">Unsure, but worth exploring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-response-note">Context</Label>
              <Textarea
                id="target-response-note"
                rows={4}
                value={responseForm.note}
                onChange={(event) => setResponseForm((current) => ({ ...current, note: event.target.value }))}
                placeholder="How you know them, whether an intro is appropriate, and any caveats."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={!responseForm.contactName.trim() || responseMutation.isPending}
              onClick={() => responseMutation.mutate()}
            >
              Send response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
