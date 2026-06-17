import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilterPanel } from "@/components/FilterPanel";
import { PageHeader } from "@/components/PageHeader";
import { PaginationControls } from "@/components/PaginationControls";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getPageItems } from "@/lib/pagination";
import { listBumSavedItems, listCompanies, listCustomerTargets, listMarketplaceOpportunities, setBumHiddenItem, setBumSavedItem } from "@/lib/portalApi";
import { cn } from "@/lib/utils";
import { Search, Building2, ExternalLink, Briefcase, Target, Heart, DollarSign, Clock, UserPlus, Sparkles, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

const CLIENTS_PAGE_SIZE = 8;

interface MarketplaceClientSummary {
  id: string;
  canHeart: boolean;
  company: string;
  website: string | null;
  pitch: string;
  industries: string[];
  openCount: number;
  targetCount: number;
  maxDealValue: number | null;
  termHints: string[];
}

type ValueFilter = "ALL" | "UNDER_50K" | "50K_250K" | "250K_PLUS" | "UNKNOWN";
type TermFilter = "ALL" | "SHORT" | "MEDIUM" | "LONG" | "UNKNOWN";
type ClientTypeFilter = "ALL" | "OPEN_OPPORTUNITIES" | "TARGET_ONLY" | "FULL_PIPELINE";

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

const clientTypeFilters: { value: ClientTypeFilter; label: string }[] = [
  { value: "ALL", label: "All client types" },
  { value: "OPEN_OPPORTUNITIES", label: "With open opportunities" },
  { value: "TARGET_ONLY", label: "Target-account only" },
  { value: "FULL_PIPELINE", label: "Full pipeline" },
];

function valueMatchesFilter(value: number | null, filter: ValueFilter) {
  if (filter === "ALL") return true;
  if (filter === "UNKNOWN") return value === null;
  if (value === null) return false;
  if (filter === "UNDER_50K") return value < 50000;
  if (filter === "50K_250K") return value >= 50000 && value < 250000;
  return value >= 250000;
}

function termMatchesFilter(terms: string[], filter: TermFilter) {
  if (filter === "ALL") return true;
  if (filter === "UNKNOWN") return terms.length === 0;

  const normalized = terms.join(" ").toLowerCase();
  if (filter === "SHORT") return /now|asap|urgent|week|month|30|45|60|short|pilot|near/.test(normalized);
  if (filter === "MEDIUM") return /quarter|q[1-4]|90|medium|semester/.test(normalized);
  return /annual|year|12|long|multi|ongoing|duration|receives revenue/.test(normalized);
}

export default function BumClients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [heartedOnly, setHeartedOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ClientTypeFilter>("ALL");
  const [valueFilter, setValueFilter] = useState<ValueFilter>("ALL");
  const [termFilter, setTermFilter] = useState<TermFilter>("ALL");
  const [showHidden, setShowHidden] = useState(false);
  const [clientPage, setClientPage] = useState(1);
  const opportunitiesQuery = useQuery({
    queryKey: ["bum-marketplace-opportunities"],
    queryFn: listMarketplaceOpportunities,
  });
  const companiesQuery = useQuery({
    queryKey: ["bum-client-companies"],
    queryFn: listCompanies,
  });
  const targetsQuery = useQuery({
    queryKey: ["bum-customer-targets"],
    queryFn: () => listCustomerTargets(null),
  });
  const savedItemsQuery = useQuery({
    queryKey: ["bum-saved-items", user?.id],
    queryFn: () => listBumSavedItems(user!.id),
    enabled: Boolean(user?.id),
  });

  const savedClientIds = useMemo(
    () => new Set((savedItemsQuery.data ?? []).filter((item) => item.item_type === "CLIENT" && item.is_saved).map((item) => item.client_company_id).filter(Boolean)),
    [savedItemsQuery.data],
  );
  const hiddenClientIds = useMemo(
    () => new Set((savedItemsQuery.data ?? []).filter((item) => item.item_type === "CLIENT" && item.is_hidden).map((item) => item.client_company_id).filter(Boolean)),
    [savedItemsQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: ({ itemId, saved }: { itemId: string; saved: boolean }) =>
      setBumSavedItem(user!, { itemType: "CLIENT", itemId }, saved),
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
  const hideMutation = useMutation({
    mutationFn: ({ itemId, hidden }: { itemId: string; hidden: boolean }) =>
      setBumHiddenItem(user!, { itemType: "CLIENT", itemId }, hidden, "skip"),
    onSuccess: (_result, input) => {
      queryClient.invalidateQueries({ queryKey: ["bum-saved-items", user?.id] });
      toast({
        title: input.hidden ? "Client hidden" : "Client restored",
        description: input.hidden ? "Hidden clients stay out of your default list." : "This client is visible in your default list again.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to update hidden clients",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const marketplaceClients = useMemo<MarketplaceClientSummary[]>(() => {
    const opportunities = opportunitiesQuery.data ?? [];
    const targetCounts = new Map<string, number>();
    const targetValues = new Map<string, number>();
    const targetTerms = new Map<string, string[]>();
    const targetIndustries = new Map<string, string[]>();
    const summaries = new Map<string, MarketplaceClientSummary>();

    for (const target of targetsQuery.data ?? []) {
      targetCounts.set(target.client_company_id, (targetCounts.get(target.client_company_id) ?? 0) + 1);
      if (target.estimated_deal_value) {
        targetValues.set(target.client_company_id, Math.max(targetValues.get(target.client_company_id) ?? 0, Number(target.estimated_deal_value)));
      }
      if (target.expected_timeline?.trim()) {
        targetTerms.set(target.client_company_id, [...(targetTerms.get(target.client_company_id) ?? []), target.expected_timeline]);
      }
      if (target.expected_product_service?.trim()) {
        targetIndustries.set(target.client_company_id, [
          ...(targetIndustries.get(target.client_company_id) ?? []),
          target.expected_product_service,
        ]);
      }
    }

    for (const company of companiesQuery.data ?? []) {
      if (company.relationship_stage !== "CLIENT") {
        continue;
      }

      summaries.set(company.name, {
        id: company.id,
        canHeart: true,
        company: company.name,
        website: company.website,
        pitch: "Trusted Bums client with customer target accounts available for warm intros.",
        industries: Array.from(new Set(targetIndustries.get(company.id) ?? [])),
        openCount: 0,
        targetCount: targetCounts.get(company.id) ?? 0,
        maxDealValue: targetValues.get(company.id) ?? null,
        termHints: targetTerms.get(company.id) ?? [],
      });
    }

    for (const opportunity of opportunities) {
      const company = opportunity.companies?.name ?? "Trusted Bums Client";
      const existing = summaries.get(company);
      const productHint = opportunity.expected_product_service?.trim();

      if (existing) {
        existing.openCount += 1;
        if (productHint && !existing.industries.includes(productHint)) {
          existing.industries.push(productHint);
        }
        if (opportunity.estimated_deal_value) {
          existing.maxDealValue = Math.max(existing.maxDealValue ?? 0, Number(opportunity.estimated_deal_value));
        }
        if (opportunity.commission_duration?.trim()) {
          existing.termHints.push(opportunity.commission_duration);
        }
        if (opportunity.expected_timeline?.trim()) {
          existing.termHints.push(opportunity.expected_timeline);
        }
        existing.pitch = opportunity.opportunity_description ?? existing.pitch;
        continue;
      }

      summaries.set(company, {
        id: opportunity.company_id ?? opportunity.id,
        canHeart: Boolean(opportunity.company_id),
        company,
        website: null,
        pitch: opportunity.opportunity_description ?? "Live client opportunity available in the marketplace.",
        industries: productHint ? [productHint] : [],
        openCount: 1,
        targetCount: 0,
        maxDealValue: opportunity.estimated_deal_value ? Number(opportunity.estimated_deal_value) : null,
        termHints: [opportunity.expected_timeline, opportunity.commission_duration].filter(Boolean) as string[],
      });
    }

    return Array.from(summaries.values()).sort((left, right) => left.company.localeCompare(right.company));
  }, [companiesQuery.data, opportunitiesQuery.data, targetsQuery.data]);

  const allIndustries = useMemo(
    () => Array.from(new Set(marketplaceClients.flatMap((client) => client.industries))).filter(Boolean),
    [marketplaceClients],
  );
  const [industry, setIndustry] = useState<string>("ALL");

  const filtered = marketplaceClients.filter((client) => {
    const matchesType =
      typeFilter === "ALL" ||
      (typeFilter === "OPEN_OPPORTUNITIES" && client.openCount > 0) ||
      (typeFilter === "TARGET_ONLY" && client.openCount === 0 && client.targetCount > 0) ||
      (typeFilter === "FULL_PIPELINE" && client.openCount > 0 && client.targetCount > 0);
    const matchesQuery = `${client.company} ${client.pitch} ${client.industries.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesIndustry = industry === "ALL" || client.industries.includes(industry);
    const matchesHeart = !heartedOnly || savedClientIds.has(client.id);
    const matchesHidden = showHidden || !hiddenClientIds.has(client.id);
    const matchesValue = valueMatchesFilter(client.maxDealValue, valueFilter);
    const matchesTerm = termMatchesFilter(client.termHints, termFilter);
    return matchesType && matchesQuery && matchesIndustry && matchesHeart && matchesHidden && matchesValue && matchesTerm;
  });

  const visibleClients = getPageItems(filtered, clientPage, CLIENTS_PAGE_SIZE);
  const filterSummary = [
    typeFilter !== "ALL" ? clientTypeFilters.find((filter) => filter.value === typeFilter)?.label : null,
    industry !== "ALL" ? industry : null,
    valueFilter !== "ALL" ? valueFilters.find((filter) => filter.value === valueFilter)?.label : null,
    termFilter !== "ALL" ? termFilters.find((filter) => filter.value === termFilter)?.label : null,
    heartedOnly ? "Hearted" : null,
    showHidden ? "Hidden visible" : null,
  ].filter(Boolean).join(" · ") || "All clients";
  const hiddenCount = hiddenClientIds.size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Represented Clients"
        description="Search live client companies, target-account pipelines, and formal marketplace opportunities."
      >
        <Button asChild>
          <Link to="/bum/prospects">
            <UserPlus className="mr-2 h-4 w-4" />
            Recommend New Client
          </Link>
        </Button>
      </PageHeader>

      <FilterPanel summary={filterSummary}>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_repeat(4,minmax(0,1fr))_repeat(2,auto)] xl:items-end">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, pitch, or ICP…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={typeFilter} onValueChange={(value: ClientTypeFilter) => setTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {clientTypeFilters.map((filter) => (
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
              {allIndustries.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
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
        <div className="flex items-end">
          <Button
            variant={showHidden ? "default" : "outline"}
            className="w-full xl:w-auto"
            onClick={() => setShowHidden((current) => !current)}
          >
            {showHidden ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
            Hidden{hiddenCount ? ` (${hiddenCount})` : ""}
          </Button>
        </div>
      </div>
      </FilterPanel>

      <div className="grid gap-4">
        {visibleClients.map((client) => {
          const isHearted = savedClientIds.has(client.id);
          const isHidden = hiddenClientIds.has(client.id);

          return (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-lg">{client.company}</h3>
                      {client.website ? (
                        <a
                          href={`https://${client.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                        >
                          {client.website} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                    <p className="text-sm mt-2">{client.pitch}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {client.industries.length ? client.industries.map((i) => (
                        <Badge key={i} variant="secondary">{i}</Badge>
                      )) : (
                        <Badge variant="outline">{client.targetCount} target accounts</Badge>
                      )}
                      <Badge variant="outline">
                        <DollarSign className="mr-1 h-3 w-3" />
                        {client.maxDealValue ? `$${client.maxDealValue.toLocaleString()} max` : "Value pending"}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" />
                        {client.termHints.length ? "Term details available" : "Term pending"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-row flex-wrap gap-2 sm:flex-col sm:items-end">
                    <Button
                      size="icon"
                      variant={isHearted ? "default" : "outline"}
                      aria-label={isHearted ? `Unheart ${client.company}` : `Heart ${client.company}`}
                      disabled={!user || !client.canHeart || saveMutation.isPending}
                      onClick={() => saveMutation.mutate({ itemId: client.id, saved: !isHearted })}
                    >
                      <Heart className={cn("h-4 w-4", isHearted && "fill-current")} />
                    </Button>
                    {client.openCount ? (
                      <Badge className="bg-success text-success-foreground hover:bg-success/90">{client.openCount} open</Badge>
                    ) : (
                      <Badge variant="secondary">{client.targetCount} targets</Badge>
                    )}
                    {isHidden ? <Badge variant="outline">Skipped</Badge> : null}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!user || !client.canHeart || hideMutation.isPending}
                      onClick={() => hideMutation.mutate({ itemId: client.id, hidden: !isHidden })}
                    >
                      {isHidden ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
                      {isHidden ? "Unhide" : "Hide"}
                    </Button>
                    {client.openCount ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/bum/opportunities">
                          <Briefcase className="mr-2 h-4 w-4" /> View opps
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/bum/opportunities">
                          <Target className="mr-2 h-4 w-4" /> View targets
                        </Link>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/bum/clients/${encodeURIComponent(client.id)}`}>
                        <Building2 className="mr-2 h-4 w-4" />
                        Details
                      </Link>
                    </Button>
                    {client.canHeart ? (
                      <Button size="sm" asChild>
                        <Link to={`/bum/reverse-opportunities?clientId=${encodeURIComponent(client.id)}`}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Recommend customer
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <PaginationControls page={clientPage} pageSize={CLIENTS_PAGE_SIZE} totalItems={filtered.length} onPageChange={setClientPage} />

        {filtered.length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
            {marketplaceClients.length ? "No clients match your search." : "No live clients are available yet."}
          </div>
        )}
      </div>
    </div>
  );
}
