import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { FilterPanel } from "@/components/FilterPanel";
import { PaginationControls } from "@/components/PaginationControls";
import { getPageItems } from "@/lib/pagination";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  createCustomerTargetResponse,
  listBumSavedItems,
  listCustomerTargets,
  listMarketplaceOpportunities,
  setBumSavedItem,
  type CustomerTargetRecord,
  type CustomerTargetResponseStrength,
  type BumSavedItemType,
} from "@/lib/portalApi";
import { cn } from "@/lib/utils";
import { Search, Briefcase, Calendar, DollarSign, Target, Handshake, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const MARKETPLACE_PAGE_SIZE = 12;

const responseFormInitial = {
  contactName: "",
  contactEmail: "",
  relationshipStrength: "warm" as CustomerTargetResponseStrength,
  note: "",
};

type ValueFilter = "ALL" | "UNDER_50K" | "50K_250K" | "250K_PLUS" | "UNKNOWN";
type TermFilter = "ALL" | "SHORT" | "MEDIUM" | "LONG" | "UNKNOWN";
type OpportunityTypeFilter = "ALL" | "TARGET_ACCOUNT" | "OPPORTUNITY";

const valueFilters: { value: ValueFilter; label: string }[] = [
  { value: "ALL", label: "All values" },
  { value: "UNDER_50K", label: "Under $50k" },
  { value: "50K_250K", label: "$50k-$250k" },
  { value: "250K_PLUS", label: "$250k+" },
  { value: "UNKNOWN", label: "Value pending" },
];

const termFilters: { value: TermFilter; label: string }[] = [
  { value: "ALL", label: "All terms" },
  { value: "SHORT", label: "Short / near-term" },
  { value: "MEDIUM", label: "Quarterly / medium" },
  { value: "LONG", label: "Annual / long" },
  { value: "UNKNOWN", label: "Term pending" },
];

const typeFilters: { value: OpportunityTypeFilter; label: string }[] = [
  { value: "ALL", label: "All opportunity types" },
  { value: "TARGET_ACCOUNT", label: "Client targets" },
  { value: "OPPORTUNITY", label: "Formal opportunities" },
];

function valueMatchesFilter(value: number | null, filter: ValueFilter) {
  if (filter === "ALL") return true;
  if (filter === "UNKNOWN") return value === null;
  if (value === null) return false;
  if (filter === "UNDER_50K") return value < 50000;
  if (filter === "50K_250K") return value >= 50000 && value < 250000;
  return value >= 250000;
}

function termMatchesFilter(term: string | null, filter: TermFilter) {
  if (filter === "ALL") return true;
  if (filter === "UNKNOWN") return !term?.trim();

  const normalized = term?.toLowerCase() ?? "";
  if (filter === "SHORT") return /now|asap|urgent|week|month|30|45|60|short|pilot|near/.test(normalized);
  if (filter === "MEDIUM") return /quarter|q[1-4]|90|medium|semester/.test(normalized);
  return /annual|year|12|long|multi|ongoing|duration|receives revenue/.test(normalized);
}

export default function BumOpportunities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [heartedOnly, setHeartedOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<OpportunityTypeFilter>("ALL");
  const [industry, setIndustry] = useState("ALL");
  const [valueFilter, setValueFilter] = useState<ValueFilter>("ALL");
  const [termFilter, setTermFilter] = useState<TermFilter>("ALL");
  const [selectedTarget, setSelectedTarget] = useState<CustomerTargetRecord | null>(null);
  const [marketplacePage, setMarketplacePage] = useState(1);
  const [responseForm, setResponseForm] = useState(responseFormInitial);
  const opportunitiesQuery = useQuery({
    queryKey: ["bum-marketplace-opportunities"],
    queryFn: listMarketplaceOpportunities,
  });
  const targetsQuery = useQuery({
    queryKey: ["bum-customer-target-opportunities"],
    queryFn: () => listCustomerTargets(null),
  });
  const savedItemsQuery = useQuery({
    queryKey: ["bum-saved-items", user?.id],
    queryFn: () => listBumSavedItems(user!.id),
    enabled: Boolean(user?.id),
  });
  const opportunities = opportunitiesQuery.data ?? [];
  const targets = targetsQuery.data ?? [];
  const savedOpportunityIds = new Set(
    (savedItemsQuery.data ?? [])
      .filter((item) => item.item_type === "OPPORTUNITY")
      .map((item) => item.opportunity_registration_id)
      .filter(Boolean),
  );
  const savedTargetIds = new Set(
    (savedItemsQuery.data ?? [])
      .filter((item) => item.item_type === "CUSTOMER_TARGET")
      .map((item) => item.customer_target_id)
      .filter(Boolean),
  );
  const allIndustries = Array.from(
    new Set(
      [
        ...opportunities.map((opportunity) => opportunity.expected_product_service?.trim()),
        ...targets.map((target) => target.expected_product_service?.trim()),
      ].filter(Boolean),
    ),
  );

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
  const saveMutation = useMutation({
    mutationFn: ({ itemType, itemId, saved }: { itemType: BumSavedItemType; itemId: string; saved: boolean }) =>
      setBumSavedItem(user!, { itemType, itemId }, saved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bum-saved-items", user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Unable to update heart",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const filtered = opportunities.filter((opportunity) => {
    const matchesType = typeFilter === "ALL" || typeFilter === "OPPORTUNITY";
    const matchesQuery = `${opportunity.target_account_name} ${opportunity.companies?.name ?? ""} ${opportunity.opportunity_description ?? ""} ${opportunity.expected_product_service ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesHeart = !heartedOnly || savedOpportunityIds.has(opportunity.id);
    const matchesIndustry = industry === "ALL" || opportunity.expected_product_service === industry;
    const matchesValue = valueMatchesFilter(opportunity.estimated_deal_value ? Number(opportunity.estimated_deal_value) : null, valueFilter);
    const matchesTerm = termMatchesFilter(`${opportunity.expected_timeline ?? ""} ${opportunity.commission_duration ?? ""}`.trim(), termFilter);
    return matchesType && matchesQuery && matchesHeart && matchesIndustry && matchesValue && matchesTerm;
  });
  const filteredTargets = targets.filter((target) => {
    const matchesType = typeFilter === "ALL" || typeFilter === "TARGET_ACCOUNT";
    const matchesQuery = `${target.target_companies?.name ?? target.target_account_name} ${target.client_companies?.name ?? ""} ${target.expected_product_service ?? ""} ${target.notes ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesHeart = !heartedOnly || savedTargetIds.has(target.id);
    const matchesIndustry = industry === "ALL" || target.expected_product_service === industry;
    const matchesValue = valueMatchesFilter(target.estimated_deal_value ? Number(target.estimated_deal_value) : null, valueFilter);
    const matchesTerm = termMatchesFilter(target.expected_timeline, termFilter);
    return matchesType && matchesQuery && matchesHeart && matchesIndustry && matchesValue && matchesTerm;
  });

  const marketplaceItems = useMemo(
    () => [
      ...filteredTargets.map((item) => ({ type: "target" as const, item })),
      ...filtered.map((item) => ({ type: "opportunity" as const, item })),
    ],
    [filtered, filteredTargets],
  );
  const visibleMarketplaceItems = getPageItems(marketplaceItems, marketplacePage, MARKETPLACE_PAGE_SIZE);
  const visibleTargets = visibleMarketplaceItems.filter((entry) => entry.type === "target").map((entry) => entry.item);
  const visibleOpportunities = visibleMarketplaceItems
    .filter((entry) => entry.type === "opportunity")
    .map((entry) => entry.item);
  const filterSummary = [typeFilter !== "ALL" ? typeFilters.find((filter) => filter.value === typeFilter)?.label : null, industry !== "ALL" ? industry : null, valueFilter !== "ALL" ? valueFilters.find((filter) => filter.value === valueFilter)?.label : null, termFilter !== "ALL" ? termFilters.find((filter) => filter.value === termFilter)?.label : null, heartedOnly ? "Hearted" : null]
    .filter(Boolean)
    .join(" · ") || "All opportunities";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities"
        description="Browse live client opportunities, add people you know, and try to claim the opportunity."
      />

      <FilterPanel summary={filterSummary}>
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_repeat(4,minmax(0,1fr))_auto]">
        <div className="relative min-w-0 xl:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={typeFilter} onValueChange={(value: OpportunityTypeFilter) => setTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              {allIndustries.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Anticipated value</Label>
          <Select value={valueFilter} onValueChange={(value: ValueFilter) => setValueFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {valueFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Term / timing</Label>
          <Select value={termFilter} onValueChange={(value: TermFilter) => setTermFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {termFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            variant={heartedOnly ? "default" : "outline"}
            className="w-full xl:w-auto"
            onClick={() => setHeartedOnly((current) => !current)}
          >
            <Heart className={cn("mr-2 h-4 w-4", heartedOnly && "fill-current")} />
            Hearted
          </Button>
        </div>
        </div>
      </FilterPanel>

      {(opportunitiesQuery.isLoading || targetsQuery.isLoading) && (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Loading live opportunities...
        </div>
      )}

      <div className="grid gap-4">
        {visibleTargets.map((targetAccount) => {
          const isHearted = savedTargetIds.has(targetAccount.id);

          return (
          <Card key={`target-${targetAccount.id}`} className="transition-shadow hover:shadow-md">
            <CardContent className="pt-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
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
                    {targetAccount.expected_product_service ? (
                      <Badge variant="secondary">{targetAccount.expected_product_service}</Badge>
                    ) : null}
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
                <div className="flex shrink-0 flex-row gap-2 md:flex-col md:items-end">
                  <Button
                    size="icon"
                    variant={isHearted ? "default" : "outline"}
                    aria-label={isHearted ? "Unheart target account" : "Heart target account"}
                    disabled={!user || saveMutation.isPending}
                    onClick={() => saveMutation.mutate({ itemType: "CUSTOMER_TARGET", itemId: targetAccount.id, saved: !isHearted })}
                  >
                    <Heart className={cn("h-4 w-4", isHearted && "fill-current")} />
                  </Button>
                  <Button size="sm" onClick={() => setSelectedTarget(targetAccount)}>
                    <Handshake className="mr-2 h-4 w-4" />
                    I know someone
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}

        {visibleOpportunities.map((opportunity) => {
          const isHearted = savedOpportunityIds.has(opportunity.id);

          return (
          <Card key={opportunity.id} className="transition-shadow hover:shadow-md">
            <CardContent className="pt-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
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
                    {opportunity.expected_product_service ? (
                      <Badge variant="secondary">{opportunity.expected_product_service}</Badge>
                    ) : null}
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
                <div className="flex shrink-0 flex-row gap-2 md:flex-col md:items-end">
                  <Button
                    size="icon"
                    variant={isHearted ? "default" : "outline"}
                    aria-label={isHearted ? "Unheart opportunity" : "Heart opportunity"}
                    disabled={!user || saveMutation.isPending}
                    onClick={() => saveMutation.mutate({ itemType: "OPPORTUNITY", itemId: opportunity.id, saved: !isHearted })}
                  >
                    <Heart className={cn("h-4 w-4", isHearted && "fill-current")} />
                  </Button>
                  <Link to={`/bum/opportunities/${opportunity.id}`}>
                    <Button size="sm">View opportunity</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
        {!opportunitiesQuery.isLoading && !targetsQuery.isLoading && filtered.length === 0 && filteredTargets.length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
            {opportunities.length || targets.length
              ? "No live opportunities match your search."
              : "No live opportunities are available yet."}
          </div>
        )}
        <PaginationControls
          page={marketplacePage}
          pageSize={MARKETPLACE_PAGE_SIZE}
          totalItems={marketplaceItems.length}
          onPageChange={setMarketplacePage}
        />
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
