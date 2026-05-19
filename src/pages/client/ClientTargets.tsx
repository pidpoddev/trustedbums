import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Search, Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PaginationControls } from "@/components/PaginationControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MeetingTranscriptsSection } from "@/components/MeetingTranscriptsSection";
import { useAuth } from "@/contexts/AuthContext";
import { getPageItems } from "@/lib/pagination";
import { useToast } from "@/hooks/use-toast";
import {
  createCustomerTarget,
  listCustomerTargets,
  type CustomerTargetPriority,
  type CustomerTargetStatus,
} from "@/lib/portalApi";

const CLIENT_TARGETS_PAGE_SIZE = 6;

const initialForm = {
  target_account_name: "",
  company_website: "",
  linkedin_company_url: "",
  business_unit: "",
  key_contact_name: "",
  key_contact_title: "",
  key_contact_email: "",
  expected_product_service: "",
  estimated_deal_value: "",
  expected_timeline: "",
  notes: "",
  priority: "MEDIUM" as CustomerTargetPriority,
  status: "PROSPECT" as CustomerTargetStatus,
};

function statusLabel(status: CustomerTargetStatus) {
  return status.replaceAll("_", " ");
}

type CustomerTargetTypeFilter = "ALL" | "EARLY_PIPELINE" | "INTRO_ACTIVE" | "MEETING_OR_OPEN" | "CLOSED";

const customerTargetTypeFilters: { value: CustomerTargetTypeFilter; label: string }[] = [
  { value: "ALL", label: "All target types" },
  { value: "EARLY_PIPELINE", label: "Early pipeline" },
  { value: "INTRO_ACTIVE", label: "Intro active" },
  { value: "MEETING_OR_OPEN", label: "Meeting or open opportunity" },
  { value: "CLOSED", label: "Closed" },
];

export default function ClientTargets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<CustomerTargetTypeFilter>("ALL");
  const [targetPage, setTargetPage] = useState(1);
  const [form, setForm] = useState(initialForm);

  const targetsQuery = useQuery({
    queryKey: ["client-targets", user?.clientId],
    queryFn: () => listCustomerTargets(user),
    enabled: Boolean(user?.clientId),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createCustomerTarget(user!, {
        ...form,
        estimated_deal_value: form.estimated_deal_value ? Number(form.estimated_deal_value) : null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["client-targets", user?.clientId] });
      toast({
        title: "Target account saved",
        description: "Your customer prospect has been added to the target account pipeline.",
      });
      setForm(initialForm);
    },
    onError: (error) => {
      toast({
        title: "Unable to save target account",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const targets = targetsQuery.data ?? [];
  const filteredTargets = useMemo(() => {
    return targets.filter((targetAccount) => {
      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "EARLY_PIPELINE" &&
          ["PROSPECT", "QUALIFYING"].includes(targetAccount.status)) ||
        (typeFilter === "INTRO_ACTIVE" &&
          ["INTRO_REQUESTED", "INTRO_IN_PROGRESS"].includes(targetAccount.status)) ||
        (typeFilter === "MEETING_OR_OPEN" &&
          ["MEETING_SET", "OPEN_OPPORTUNITY"].includes(targetAccount.status)) ||
        (typeFilter === "CLOSED" &&
          ["CLOSED_WON", "CLOSED_LOST"].includes(targetAccount.status));

      const matchesQuery = [
        targetAccount.target_companies?.name,
        targetAccount.target_account_name,
        targetAccount.business_unit,
        targetAccount.key_contact_name,
        targetAccount.key_contact_title,
        targetAccount.expected_product_service,
        targetAccount.expected_timeline,
        targetAccount.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [query, targets, typeFilter]);

  const visibleTargets = getPageItems(filteredTargets, targetPage, CLIENT_TARGETS_PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Target Accounts"
        description="Track the customer companies you want to sell into without mixing them with Trusted Bums client prospects."
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Add target account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              createMutation.mutate();
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target-name">Target account name</Label>
                <Input
                  id="target-name"
                  required
                  value={form.target_account_name}
                  onChange={(event) => updateField("target_account_name", event.target.value)}
                  placeholder="Global Retail Bank"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-website">Company website</Label>
                <Input
                  id="target-website"
                  value={form.company_website}
                  onChange={(event) => updateField("company_website", event.target.value)}
                  placeholder="globalretailbank.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-linkedin">LinkedIn company page</Label>
                <Input
                  id="target-linkedin"
                  value={form.linkedin_company_url}
                  onChange={(event) => updateField("linkedin_company_url", event.target.value)}
                  placeholder="linkedin.com/company/global-retail-bank"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-priority">Priority</Label>
                <Select value={form.priority} onValueChange={(value) => updateField("priority", value)}>
                  <SelectTrigger id="target-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-status">Stage</Label>
                <Select value={form.status} onValueChange={(value) => updateField("status", value)}>
                  <SelectTrigger id="target-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROSPECT">Prospect</SelectItem>
                    <SelectItem value="QUALIFYING">Qualifying</SelectItem>
                    <SelectItem value="INTRO_REQUESTED">Intro requested</SelectItem>
                    <SelectItem value="INTRO_IN_PROGRESS">Intro in progress</SelectItem>
                    <SelectItem value="MEETING_SET">Meeting set</SelectItem>
                    <SelectItem value="OPEN_OPPORTUNITY">Open opportunity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-business-unit">Business unit</Label>
                <Input
                  id="target-business-unit"
                  value={form.business_unit}
                  onChange={(event) => updateField("business_unit", event.target.value)}
                  placeholder="North America security team"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-contact-name">Key contact</Label>
                <Input
                  id="target-contact-name"
                  value={form.key_contact_name}
                  onChange={(event) => updateField("key_contact_name", event.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-contact-title">Key contact title</Label>
                <Input
                  id="target-contact-title"
                  value={form.key_contact_title}
                  onChange={(event) => updateField("key_contact_title", event.target.value)}
                  placeholder="VP, Infrastructure"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-contact-email">Key contact email</Label>
                <Input
                  id="target-contact-email"
                  type="email"
                  value={form.key_contact_email}
                  onChange={(event) => updateField("key_contact_email", event.target.value)}
                  placeholder="jane@globalretailbank.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-product">Expected product/service</Label>
                <Input
                  id="target-product"
                  value={form.expected_product_service}
                  onChange={(event) => updateField("expected_product_service", event.target.value)}
                  placeholder="Cloud compliance platform"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-deal-value">Estimated deal value</Label>
                <Input
                  id="target-deal-value"
                  type="number"
                  min="0"
                  step="1000"
                  value={form.estimated_deal_value}
                  onChange={(event) => updateField("estimated_deal_value", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-timeline">Expected timeline</Label>
                <Input
                  id="target-timeline"
                  value={form.expected_timeline}
                  onChange={(event) => updateField("expected_timeline", event.target.value)}
                  placeholder="Q3 pilot"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-notes">Notes</Label>
              <Textarea
                id="target-notes"
                rows={4}
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Why this account matters, who should be engaged, and what context Bums should know."
              />
            </div>

            <div className="flex justify-end">
              <Button disabled={createMutation.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Save target account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(240px,0.8fr)] md:items-end">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search target accounts, contacts, products, or notes"
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={(value: CustomerTargetTypeFilter) => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customerTargetTypeFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {visibleTargets.map((targetAccount) => (
          <Card key={targetAccount.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-lg">{targetAccount.target_companies?.name ?? targetAccount.target_account_name}</h3>
                        <Badge variant="secondary">{statusLabel(targetAccount.status)}</Badge>
                        <Badge variant="outline">{targetAccount.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {targetAccount.business_unit ?? "No business unit specified"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-1 text-sm text-muted-foreground">
                    {targetAccount.key_contact_name ? (
                      <p className="inline-flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        {targetAccount.key_contact_name}
                        {targetAccount.key_contact_title ? ` · ${targetAccount.key_contact_title}` : ""}
                      </p>
                    ) : null}
                    {targetAccount.expected_product_service ? <p>Offering: {targetAccount.expected_product_service}</p> : null}
                    {targetAccount.notes ? <p>{targetAccount.notes}</p> : null}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold font-display">
                    {targetAccount.estimated_deal_value
                      ? `$${Number(targetAccount.estimated_deal_value).toLocaleString()}`
                      : "TBD"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {targetAccount.expected_timeline ?? "Timeline pending"}
                  </p>
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

        <PaginationControls page={targetPage} pageSize={CLIENT_TARGETS_PAGE_SIZE} totalItems={filteredTargets.length} onPageChange={setTargetPage} />

        {!targetsQuery.isLoading && !targets.length ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No target accounts yet. Add the customer companies you want to sell into above.
            </CardContent>
          </Card>
        ) : null}

        {!targetsQuery.isLoading && targets.length > 0 && !filteredTargets.length ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No target accounts match your current filters.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
