import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { openConversationDock } from "@/lib/conversationDock";
import { PageHeader } from "@/components/PageHeader";
import { FilterPanel } from "@/components/FilterPanel";
import { PaginationControls } from "@/components/PaginationControls";
import { buildLinkedInFirstConnectionsUrl } from "@/lib/linkedinSearch";
import { getPageItems } from "@/lib/pagination";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  createBumRepresentedContact,
  createCustomerTargetQuestion,
  createCustomerTargetResponse,
  createOpportunityClaim,
  listBumRepresentedContacts,
  listBumSavedItems,
  listCustomerTargets,
  listMarketplaceOpportunities,
  listOpportunityClaimSummaries,
  setBumSavedItem,
  updateBumRepresentedContact,
  type BumRepresentedContactRecord,
  type CustomerTargetRecord,
  type CustomerTargetResponseStrength,
  type BumSavedItemType,
  type OpportunityRegistration,
} from "@/lib/portalApi";
import type { RelationshipStrength } from "@/lib/claimConfig";
import { cn } from "@/lib/utils";
import { Search, Briefcase, Calendar, DollarSign, Target, Handshake, Heart, ChevronDown, ChevronUp, MessageSquare, ExternalLink, UserPlus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const MARKETPLACE_PAGE_SIZE = 6;

const responseFormInitial = {
  contactName: "",
  contactCompany: "",
  contactEmail: "",
  relationshipStrength: "warm" as CustomerTargetResponseStrength,
  note: "",
};

const quickAddInitial = {
  name: "",
  companyName: "",
  title: "",
  email: "",
  linkedinUrl: "",
};

type ValueFilter = "ALL" | "UNDER_50K" | "50K_250K" | "250K_PLUS" | "UNKNOWN";
type TermFilter = "ALL" | "SHORT" | "MEDIUM" | "LONG" | "UNKNOWN";
type OpportunityTypeFilter = "ALL" | "TARGET_ACCOUNT" | "OPPORTUNITY";
type TargetDialogMode = "connection" | "question";

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

function contactSearchText(contact: BumRepresentedContactRecord) {
  return [contact.name, contact.companyName, contact.email, contact.title, contact.contextLabel]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function claimStrengthFromTargetStrength(strength: CustomerTargetResponseStrength): RelationshipStrength {
  if (strength === "strong") return "STRONG";
  if (strength === "unknown") return "WEAK";
  return "MODERATE";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("search") ?? "");
  const [heartedOnly, setHeartedOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<OpportunityTypeFilter>("ALL");
  const [industry, setIndustry] = useState("ALL");
  const [valueFilter, setValueFilter] = useState<ValueFilter>("ALL");
  const [termFilter, setTermFilter] = useState<TermFilter>("ALL");
  const [selectedTarget, setSelectedTarget] = useState<CustomerTargetRecord | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityRegistration | null>(null);
  const [targetDialogMode, setTargetDialogMode] = useState<TargetDialogMode>("connection");
  const [marketplacePage, setMarketplacePage] = useState(1);
  const [responseForm, setResponseForm] = useState(responseFormInitial);
  const [contactSearch, setContactSearch] = useState("");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState(quickAddInitial);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [expandedOpportunityIds, setExpandedOpportunityIds] = useState<Set<string>>(new Set());
  const [expandedTargetIds, setExpandedTargetIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const searchQuery = searchParams.get("search") ?? "";
    setQuery(searchQuery);
    setMarketplacePage(1);
  }, [searchParams]);
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
  const contactsQuery = useQuery({
    queryKey: ["opportunity-contact-picker", user?.id],
    queryFn: () => listBumRepresentedContacts(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });
  const claimSummariesQuery = useQuery({
    queryKey: ["marketplace-claim-summaries"],
    queryFn: listOpportunityClaimSummaries,
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
  const filteredContacts = useMemo(() => {
    const normalized = contactSearch.trim().toLowerCase();
    const contacts = contactsQuery.data ?? [];
    if (!normalized) return contacts.slice(0, 8);
    return contacts.filter((contact) => contactSearchText(contact).includes(normalized)).slice(0, 12);
  }, [contactsQuery.data, contactSearch]);

  const activeClaimByOpportunityId = useMemo(() => {
    const map = new Map<string, string>();
    for (const claim of claimSummariesQuery.data ?? []) {
      if (["PROPOSED", "APPROVED", "SCHEDULED", "MEETING_HELD"].includes(claim.status) && !map.has(claim.opportunity_registration_id)) {
        map.set(claim.opportunity_registration_id, claim.bum_display_name);
      }
    }
    return map;
  }, [claimSummariesQuery.data]);
  const allIndustries = Array.from(
    new Set(
      [
        ...opportunities.map((opportunity) => opportunity.expected_product_service?.trim()),
        ...targets.map((target) => target.expected_product_service?.trim()),
      ].filter(Boolean),
    ),
  );

  function resetConnectionDialog() {
    setSelectedTarget(null);
    setSelectedOpportunity(null);
    setTargetDialogMode("connection");
    setResponseForm(responseFormInitial);
    setContactSearch("");
    setQuickAddOpen(false);
    setQuickAddForm(quickAddInitial);
    setSelectedContactId(null);
  }

  function applyContact(contact: BumRepresentedContactRecord) {
    setSelectedContactId(contact.id.includes(":") ? null : contact.id);
    setResponseForm((current) => ({
      ...current,
      contactName: contact.name,
      contactCompany: contact.companyName === "Unknown company" ? current.contactCompany : contact.companyName,
      contactEmail: contact.email ?? current.contactEmail,
      note: current.note || contact.note || "",
    }));
  }

  function openOpportunityConnection(opportunity: OpportunityRegistration) {
    setSelectedOpportunity(opportunity);
    setResponseForm({ ...responseFormInitial, contactCompany: opportunity.target_account_name });
    setContactSearch("");
    setQuickAddOpen(false);
    setQuickAddForm(quickAddInitial);
    setSelectedContactId(null);
  }

  function connectionAccountName() {
    return selectedOpportunity?.target_account_name
      ?? selectedTarget?.target_companies?.name
      ?? selectedTarget?.target_account_name
      ?? "this account";
  }

  const quickAddMutation = useMutation({
    mutationFn: () =>
      createBumRepresentedContact({
        name: quickAddForm.name,
        companyName: quickAddForm.companyName || selectedOpportunity?.target_account_name || selectedTarget?.target_companies?.name || selectedTarget?.target_account_name || null,
        title: quickAddForm.title,
        email: quickAddForm.email,
        linkedinUrl: quickAddForm.linkedinUrl,
        opportunityRegistrationId: selectedOpportunity?.id ?? null,
        customerTargetId: selectedTarget?.id ?? null,
      }),
    onSuccess: (result) => {
      applyContact(result.contact);
      setQuickAddOpen(false);
      setQuickAddForm(quickAddInitial);
      queryClient.invalidateQueries({ queryKey: ["opportunity-contact-picker", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["bum-represented-contacts", user?.id] });
      toast({ title: "Contact added", description: "The contact is ready to use." });
    },
    onError: (error) => {
      toast({ title: "Unable to add contact", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const opportunityClaimMutation = useMutation({
    mutationFn: async () => {
      const claim = await createOpportunityClaim(user!, {
        opportunityId: selectedOpportunity!.id,
        contactName: responseForm.contactName,
        contactCompany: responseForm.contactCompany || selectedOpportunity!.target_account_name,
        contactEmail: responseForm.contactEmail,
        relationshipStrength: claimStrengthFromTargetStrength(responseForm.relationshipStrength),
        note: responseForm.note,
      });
      if (selectedContactId) {
        await updateBumRepresentedContact(selectedContactId, { opportunityRegistrationId: selectedOpportunity!.id });
      }
      return claim;
    },
    onSuccess: (claim) => {
      toast({ title: "Claim requested", description: "Requested with " + claim.contact_name + " at " + claim.contact_company + "." });
      queryClient.invalidateQueries({ queryKey: ["marketplace-claim-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["opportunity-contact-picker", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["bum-represented-contacts", user?.id] });
      resetConnectionDialog();
    },
    onError: (error) => {
      toast({ title: "Unable to request claim", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const responseMutation = useMutation({
    mutationFn: () => {
      if (targetDialogMode === "question") {
        return createCustomerTargetQuestion(user!, {
          customerTargetId: selectedTarget!.id,
          question: responseForm.note,
        });
      }

      return createCustomerTargetResponse(user!, {
        customerTargetId: selectedTarget!.id,
        contactName: responseForm.contactName,
        contactEmail: responseForm.contactEmail,
        relationshipStrength: responseForm.relationshipStrength,
        note: responseForm.note,
      });
    },
    onSuccess: (result) => {
      const conversationId = result.conversation_thread_id ?? null;
      toast({
        title: targetDialogMode === "question" ? "Conversation started" : "Response sent",
        description: targetDialogMode === "question"
          ? "The client team can respond in chat."
          : "Trusted Bums now has your relationship context for this client target.",
      });
      resetConnectionDialog();
      queryClient.invalidateQueries({ queryKey: ["conversation-threads"] });
      if (conversationId) {
        openConversationDock(conversationId);
      }
    },
    onError: (error) => {
      toast({
        title: targetDialogMode === "question" ? "Unable to start conversation" : "Unable to send response",
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

  const renderContactPicker = () => (
    <div className="space-y-3 rounded-md border bg-muted/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label>Choose from your contacts</Label>
          <p className="text-xs text-muted-foreground">Search saved contacts, then select the person to connect.</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={quickAddOpen ? "secondary" : "outline"}
          onClick={() => setQuickAddOpen((current) => !current)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Quick add
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={contactSearch}
          onChange={(event) => setContactSearch(event.target.value)}
          placeholder="Search contacts, companies, emails, or context"
          className="pl-9"
        />
      </div>
      {quickAddOpen ? (
        <div className="grid gap-3 rounded-md border bg-background p-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quick-contact-name">Name</Label>
            <Input
              id="quick-contact-name"
              value={quickAddForm.name}
              onChange={(event) => setQuickAddForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-contact-company">Company</Label>
            <Input
              id="quick-contact-company"
              value={quickAddForm.companyName}
              onChange={(event) => setQuickAddForm((current) => ({ ...current, companyName: event.target.value }))}
              placeholder={connectionAccountName()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-contact-title">Title</Label>
            <Input
              id="quick-contact-title"
              value={quickAddForm.title}
              onChange={(event) => setQuickAddForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="VP Sales"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-contact-email">Email</Label>
            <Input
              id="quick-contact-email"
              type="email"
              value={quickAddForm.email}
              onChange={(event) => setQuickAddForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="jane@example.com"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="quick-contact-linkedin">LinkedIn URL</Label>
            <Input
              id="quick-contact-linkedin"
              value={quickAddForm.linkedinUrl}
              onChange={(event) => setQuickAddForm((current) => ({ ...current, linkedinUrl: event.target.value }))}
              placeholder="https://www.linkedin.com/in/janedoe"
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              type="button"
              size="sm"
              disabled={!quickAddForm.name.trim() || quickAddMutation.isPending}
              onClick={() => quickAddMutation.mutate()}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {quickAddMutation.isPending ? "Adding..." : "Add and select contact"}
            </Button>
          </div>
        </div>
      ) : null}
      <ScrollArea className="h-56 rounded-md border bg-background">
        <div className="space-y-2 p-2">
          {contactsQuery.isLoading ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Loading contacts...</p>
          ) : null}
          {!contactsQuery.isLoading && contactsQuery.isError ? (
            <p className="p-4 text-center text-sm text-destructive">Unable to load contacts right now.</p>
          ) : null}
          {!contactsQuery.isLoading && !contactsQuery.isError && !filteredContacts.length ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No contacts match that search. Use quick add to create one.</p>
          ) : null}
          {filteredContacts.map((contact) => {
            const isSelected = selectedContactId === contact.id;
            return (
              <button
                key={contact.id}
                type="button"
                className={cn(
                  "w-full rounded-md border bg-card p-3 text-left text-sm transition hover:border-primary/60 hover:bg-primary/5",
                  isSelected && "border-primary bg-primary/10",
                )}
                onClick={() => applyContact(contact)}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-medium">{contact.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[contact.title, contact.companyName, contact.email].filter(Boolean).join(" | ") || contact.contextLabel}
                    </span>
                  </span>
                  <Badge variant="outline" className="shrink-0">{contact.source.replaceAll("_", " ")}</Badge>
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

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
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_repeat(4,minmax(0,1fr))_auto] xl:items-end">
        <div className="relative min-w-0 xl:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities…"
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              setMarketplacePage(1);
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (value.trim()) {
                  next.set("search", value);
                } else {
                  next.delete("search");
                }
                return next;
              }, { replace: true });
            }}
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
          const isExpanded = expandedTargetIds.has(targetAccount.id);

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
                  <p className={cn("mt-2 text-sm", !isExpanded && "line-clamp-2")}>
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
                  {isExpanded ? (
                    <div className="mt-4 grid gap-3 rounded-md border bg-muted/20 p-4 text-sm md:grid-cols-2">
                      <div>
                        <p className="font-medium">Product or service</p>
                        <p className="text-muted-foreground">{targetAccount.expected_product_service ?? "Not specified"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Priority</p>
                        <p className="text-muted-foreground">{targetAccount.priority}</p>
                      </div>
                      <div>
                        <p className="font-medium">Timeline</p>
                        <p className="text-muted-foreground">{targetAccount.expected_timeline?.trim() || "To be confirmed"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Estimated value</p>
                        <p className="text-muted-foreground">
                          {targetAccount.estimated_deal_value ? `$${Number(targetAccount.estimated_deal_value).toLocaleString()}` : "Value pending"}
                        </p>
                      </div>
                      {targetAccount.key_contact_name || targetAccount.key_contact_title || targetAccount.key_contact_email ? (
                        <div className="md:col-span-2">
                          <p className="font-medium">Known target contact</p>
                          <p className="text-muted-foreground">
                            {[targetAccount.key_contact_name, targetAccount.key_contact_title, targetAccount.key_contact_email].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
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
                  <Button
                    size="sm"
                    variant="outline"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedTargetIds((current) => {
                        const next = new Set(current);
                        if (next.has(targetAccount.id)) {
                          next.delete(targetAccount.id);
                        } else {
                          next.add(targetAccount.id);
                        }
                        return next;
                      })
                    }
                  >
                    {isExpanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                    Details
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setTargetDialogMode("question");
                      setResponseForm(responseFormInitial);
                      setSelectedTarget(targetAccount);
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    I have a question
                  </Button>
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
                  <Button
                    size="sm"
                    onClick={() => {
                      setTargetDialogMode("connection");
                      setResponseForm(responseFormInitial);
                      setSelectedTarget(targetAccount);
                    }}
                  >
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
          const isExpanded = expandedOpportunityIds.has(opportunity.id);
          const claimedBy = activeClaimByOpportunityId.get(opportunity.id);

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
                    <StatusBadge label={claimedBy ? "Already claimed" : "Open"} variant={claimedBy ? "warning" : "success"} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {opportunity.companies?.name ?? "Client pending"} • {opportunity.commission_rate}% commission
                  </p>
                  {claimedBy ? (
                    <p className="mt-2 text-sm font-medium text-warning">Already claimed by {claimedBy}</p>
                  ) : null}
                  <p className={cn("mt-2 text-sm", !isExpanded && "line-clamp-2")}>{opportunity.opportunity_description ?? "No description provided yet."}</p>
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
                  {isExpanded ? (
                    <div className="mt-4 grid gap-3 rounded-md border bg-muted/20 p-4 text-sm md:grid-cols-2">
                      <div>
                        <p className="font-medium">Product or service</p>
                        <p className="text-muted-foreground">{opportunity.expected_product_service ?? "Not specified"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Business unit</p>
                        <p className="text-muted-foreground">{opportunity.business_unit ?? "Not specified"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Timeline</p>
                        <p className="text-muted-foreground">{opportunity.expected_timeline ?? "To be confirmed"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Commission duration</p>
                        <p className="text-muted-foreground">{opportunity.commission_duration}</p>
                      </div>
                      {opportunity.client_pay_programs ? (
                        <div className="md:col-span-2">
                          <p className="font-medium">Commission structure</p>
                          <p className="text-muted-foreground">
                            {opportunity.client_pay_programs.name}: {opportunity.client_pay_programs.commission_basis ?? `${opportunity.commission_rate}% commission`}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
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
                  <Button
                    size="sm"
                    variant="outline"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedOpportunityIds((current) => {
                        const next = new Set(current);
                        if (next.has(opportunity.id)) {
                          next.delete(opportunity.id);
                        } else {
                          next.add(opportunity.id);
                        }
                        return next;
                      })
                    }
                  >
                    {isExpanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                    Details
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={buildLinkedInFirstConnectionsUrl(opportunity.target_account_name)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Find connections
                    </a>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to={"/bum/opportunities/" + opportunity.id + "?ask=1"}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      I have a question
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openOpportunityConnection(opportunity)}
                  >
                    <Handshake className="mr-2 h-4 w-4" />
                    I know someone
                  </Button>
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

      <Dialog
        open={Boolean(selectedTarget)}
        onOpenChange={(open) => {
          if (!open) {
            resetConnectionDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{targetDialogMode === "question" ? "Ask a question" : "Tell us who you know"}</DialogTitle>
            <DialogDescription>
              {targetDialogMode === "question"
                ? `Ask what you need to know about ${selectedTarget?.target_companies?.name ?? selectedTarget?.target_account_name}.`
                : `Share the person or path you have into ${selectedTarget?.target_companies?.name ?? selectedTarget?.target_account_name}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {targetDialogMode === "connection" ? (
              <>
                {renderContactPicker()}
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
              </>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="target-response-note">{targetDialogMode === "question" ? "Question" : "Context"}</Label>
              <Textarea
                id="target-response-note"
                rows={4}
                value={responseForm.note}
                onChange={(event) => setResponseForm((current) => ({ ...current, note: event.target.value }))}
                placeholder={targetDialogMode === "question" ? "What would you like the client to clarify?" : "How you know them, whether an intro is appropriate, and any caveats."}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetConnectionDialog();
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={(targetDialogMode === "question" ? !responseForm.note.trim() : !responseForm.contactName.trim()) || responseMutation.isPending}
              onClick={() => responseMutation.mutate()}
            >
              {targetDialogMode === "question" ? "Send question" : "Send response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedOpportunity)}
        onOpenChange={(open) => {
          if (!open) {
            resetConnectionDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Connect a contact</DialogTitle>
            <DialogDescription>
              Choose someone you know for {selectedOpportunity?.target_account_name ?? "this opportunity"}, or add them if they are not in your contacts yet.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {renderContactPicker()}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="opportunity-contact-name">Contact name</Label>
                <Input
                  id="opportunity-contact-name"
                  value={responseForm.contactName}
                  onChange={(event) => setResponseForm((current) => ({ ...current, contactName: event.target.value }))}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opportunity-contact-company">Company</Label>
                <Input
                  id="opportunity-contact-company"
                  value={responseForm.contactCompany}
                  onChange={(event) => setResponseForm((current) => ({ ...current, contactCompany: event.target.value }))}
                  placeholder={selectedOpportunity?.target_account_name ?? "Company"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opportunity-contact-email">Email if known</Label>
                <Input
                  id="opportunity-contact-email"
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="opportunity-contact-note">Context</Label>
              <Textarea
                id="opportunity-contact-note"
                rows={4}
                value={responseForm.note}
                onChange={(event) => setResponseForm((current) => ({ ...current, note: event.target.value }))}
                placeholder="How you know them, whether an intro is appropriate, and any caveats."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetConnectionDialog}>
              Cancel
            </Button>
            <Button
              disabled={!responseForm.contactName.trim() || !responseForm.contactCompany.trim() || opportunityClaimMutation.isPending}
              onClick={() => opportunityClaimMutation.mutate()}
            >
              {opportunityClaimMutation.isPending ? "Requesting..." : "Request claim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
