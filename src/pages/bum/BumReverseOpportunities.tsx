import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, DollarSign, ExternalLink, Plus, Sparkles, Users } from "lucide-react";
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
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  createReverseOpportunity,
  listCompanies,
  listOwnReverseOpportunities,
  type ReverseOpportunityClientMode,
  type ReverseOpportunityStatus,
} from "@/lib/portalApi";
import { opportunityOriginLabel, opportunityStageLabel, stageFromReverseOpportunityStatus } from "@/lib/opportunityModel";
import { formatDateForTimeZone } from "@/lib/timezone";

const initialForm = {
  client_mode: "EXISTING_CLIENT" as ReverseOpportunityClientMode,
  vendor_company_id: "",
  prospect_client_name: "",
  prospect_client_website: "",
  prospect_client_linkedin_url: "",
  vendor_contact_name: "",
  vendor_contact_title: "",
  vendor_contact_email: "",
  vendor_contact_linkedin_url: "",
  customer_company_name: "",
  customer_company_website: "",
  customer_contact_name: "",
  customer_contact_title: "",
  customer_contact_email: "",
  customer_need_summary: "",
  expected_product_service: "",
  estimated_deal_value: "",
  expected_timeline: "",
  notes: "",
};

function statusVariant(status: ReverseOpportunityStatus) {
  if (status === "CLIENT_INTERESTED" || status === "CONVERTED") {
    return "success" as const;
  }

  if (status === "CLOSED_LOST") {
    return "destructive" as const;
  }

  if (status === "OUTREACH_READY" || status === "CLIENT_CONTACTED") {
    return "info" as const;
  }

  return "warning" as const;
}

function statusLabel(status: ReverseOpportunityStatus) {
  return status.replaceAll("_", " ");
}

export default function BumReverseOpportunities() {
  const { user } = useAuth();
  const timeZone = useUserTimeZone();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: listCompanies,
  });
  const reverseOpportunitiesQuery = useQuery({
    queryKey: ["bum-reverse-opportunities", user?.id],
    queryFn: () => listOwnReverseOpportunities(user!.id),
    enabled: Boolean(user?.id),
  });

  const clientCompanies = useMemo(
    () => (companiesQuery.data ?? []).filter((company) => company.relationship_stage === "CLIENT"),
    [companiesQuery.data],
  );

  const createMutation = useMutation({
    mutationFn: () =>
      createReverseOpportunity(user!, {
        client_mode: form.client_mode,
        vendor_company_id: form.client_mode === "EXISTING_CLIENT" ? form.vendor_company_id : undefined,
        prospect_client_name: form.client_mode === "PROSPECT_CLIENT" ? form.prospect_client_name : undefined,
        prospect_client_website: form.client_mode === "PROSPECT_CLIENT" ? form.prospect_client_website : undefined,
        prospect_client_linkedin_url:
          form.client_mode === "PROSPECT_CLIENT" ? form.prospect_client_linkedin_url : undefined,
        vendor_contact_name: form.vendor_contact_name,
        vendor_contact_title: form.vendor_contact_title,
        vendor_contact_email: form.vendor_contact_email,
        vendor_contact_linkedin_url: form.vendor_contact_linkedin_url,
        customer_company_name: form.customer_company_name,
        customer_company_website: form.customer_company_website,
        customer_contact_name: form.customer_contact_name,
        customer_contact_title: form.customer_contact_title,
        customer_contact_email: form.customer_contact_email,
        customer_need_summary: form.customer_need_summary,
        expected_product_service: form.expected_product_service,
        estimated_deal_value: form.estimated_deal_value.trim() ? Number(form.estimated_deal_value) : null,
        expected_timeline: form.expected_timeline,
        notes: form.notes,
      }),
    onSuccess: async (record) => {
      await queryClient.invalidateQueries({ queryKey: ["bum-reverse-opportunities", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-reverse-opportunities"] });
      await queryClient.invalidateQueries({ queryKey: ["client-reverse-opportunities"] });
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Customer lead saved",
        description:
          record.client_mode === "EXISTING_CLIENT"
            ? "We logged this Customer Lead against the existing Client for review and outreach."
            : "We created the Client Prospect record and queued the Customer Lead for review and outreach.",
      });
      setForm(initialForm);
    },
    onError: (error) => {
      toast({
        title: "Unable to save customer lead",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Leads"
        description="Start with real Customer demand, then route it to an existing Client or a Client Prospect who could fulfill it."
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add customer lead
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
                <Label>Route this demand to</Label>
                <Select
                  value={form.client_mode}
                  onValueChange={(value: ReverseOpportunityClientMode) => updateField("client_mode", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXISTING_CLIENT">An existing Client</SelectItem>
                    <SelectItem value="PROSPECT_CLIENT">A Client Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.client_mode === "EXISTING_CLIENT" ? (
                <div className="space-y-2">
                  <Label>Existing Client</Label>
                  <Select value={form.vendor_company_id} onValueChange={(value) => updateField("vendor_company_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a Client company" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientCompanies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="prospect-client-name">Client Prospect company</Label>
                  <Input
                    id="prospect-client-name"
                    required={form.client_mode === "PROSPECT_CLIENT"}
                    value={form.prospect_client_name}
                    onChange={(event) => updateField("prospect_client_name", event.target.value)}
                    placeholder="K2View"
                  />
                </div>
              )}

              {form.client_mode === "PROSPECT_CLIENT" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="prospect-client-website">Client Prospect website</Label>
                    <Input
                      id="prospect-client-website"
                      value={form.prospect_client_website}
                      onChange={(event) => updateField("prospect_client_website", event.target.value)}
                      placeholder="k2view.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prospect-client-linkedin">Client Prospect LinkedIn</Label>
                    <Input
                      id="prospect-client-linkedin"
                      value={form.prospect_client_linkedin_url}
                      onChange={(event) => updateField("prospect_client_linkedin_url", event.target.value)}
                      placeholder="linkedin.com/company/k2view"
                    />
                  </div>
                </>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="vendor-contact-name">Client decision-maker</Label>
                <Input
                  id="vendor-contact-name"
                  value={form.vendor_contact_name}
                  onChange={(event) => updateField("vendor_contact_name", event.target.value)}
                  placeholder="Jane Buyer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-contact-title">Decision-maker title</Label>
                <Input
                  id="vendor-contact-title"
                  value={form.vendor_contact_title}
                  onChange={(event) => updateField("vendor_contact_title", event.target.value)}
                  placeholder="VP Product"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-contact-email">Decision-maker email</Label>
                <Input
                  id="vendor-contact-email"
                  type="email"
                  value={form.vendor_contact_email}
                  onChange={(event) => updateField("vendor_contact_email", event.target.value)}
                  placeholder="jane@vendor.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-contact-linkedin">Decision-maker LinkedIn</Label>
                <Input
                  id="vendor-contact-linkedin"
                  value={form.vendor_contact_linkedin_url}
                  onChange={(event) => updateField("vendor_contact_linkedin_url", event.target.value)}
                  placeholder="linkedin.com/in/jane-buyer"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer-company-name">End customer company</Label>
                <Input
                  id="customer-company-name"
                  required
                  value={form.customer_company_name}
                  onChange={(event) => updateField("customer_company_name", event.target.value)}
                  placeholder="Global Health System"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-company-website">End customer website</Label>
                <Input
                  id="customer-company-website"
                  value={form.customer_company_website}
                  onChange={(event) => updateField("customer_company_website", event.target.value)}
                  placeholder="globalhealth.org"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-contact-name">End customer contact</Label>
                <Input
                  id="customer-contact-name"
                  value={form.customer_contact_name}
                  onChange={(event) => updateField("customer_contact_name", event.target.value)}
                  placeholder="John Champion"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-contact-title">End customer title</Label>
                <Input
                  id="customer-contact-title"
                  value={form.customer_contact_title}
                  onChange={(event) => updateField("customer_contact_title", event.target.value)}
                  placeholder="Chief Data Officer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-contact-email">End customer email</Label>
                <Input
                  id="customer-contact-email"
                  type="email"
                  value={form.customer_contact_email}
                  onChange={(event) => updateField("customer_contact_email", event.target.value)}
                  placeholder="john@globalhealth.org"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected-deal-value">Expected deal value</Label>
                <Input
                  id="expected-deal-value"
                  type="number"
                  min="0"
                  value={form.estimated_deal_value}
                  onChange={(event) => updateField("estimated_deal_value", event.target.value)}
                  placeholder="150000"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expected-product-service">Suggested solution or product fit</Label>
                <Input
                  id="expected-product-service"
                  value={form.expected_product_service}
                  onChange={(event) => updateField("expected_product_service", event.target.value)}
                  placeholder="Microdatabase technology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected-timeline">Expected timeline</Label>
                <Input
                  id="expected-timeline"
                  value={form.expected_timeline}
                  onChange={(event) => updateField("expected_timeline", event.target.value)}
                  placeholder="Evaluation this quarter"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-need-summary">Customer need summary</Label>
              <Textarea
                id="customer-need-summary"
                required
                rows={4}
                value={form.customer_need_summary}
                onChange={(event) => updateField("customer_need_summary", event.target.value)}
                placeholder="This customer is actively looking for a microdatabase solution to simplify application-level data access..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reverse-opportunity-notes">Notes</Label>
              <Textarea
                id="reverse-opportunity-notes"
                rows={4}
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Why this vendor is a fit, how warm the customer need is, and any outreach guidance for admin."
              />
            </div>

            <div className="flex justify-end">
              <Button disabled={createMutation.isPending}>
                <Sparkles className="mr-2 h-4 w-4" />
                {createMutation.isPending ? "Saving..." : "Save customer lead"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {(reverseOpportunitiesQuery.data ?? []).map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold">
                      {record.companies?.name ?? "Client"} for {record.customer_company_name}
                    </h3>
                    <StatusBadge label={opportunityOriginLabel("CUSTOMER_ORIGINATED")} variant="secondary" />
                    <StatusBadge label={opportunityStageLabel(stageFromReverseOpportunityStatus(record.status))} variant="info" />
                    <StatusBadge label={statusLabel(record.status)} variant={statusVariant(record.status)} />
                    <StatusBadge
                      label={record.client_mode === "EXISTING_CLIENT" ? "Existing client" : "Prospect client"}
                      variant="secondary"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-3xl">{record.customer_need_summary}</p>
                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <p className="inline-flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      End customer: {record.customer_company_name}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Decision-maker: {record.vendor_contact_name ?? "Pending"}{record.vendor_contact_title ? ` · ${record.vendor_contact_title}` : ""}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {record.estimated_deal_value ? `$${Number(record.estimated_deal_value).toLocaleString()} expected` : "Value pending"}
                    </p>
                    <p>{record.expected_product_service ?? "Solution fit pending"}</p>
                  </div>
                  {record.notes ? <p className="text-sm">{record.notes}</p> : null}
                </div>
                <div className="text-sm text-muted-foreground space-y-2 lg:text-right">
                  <p>Added {formatDateForTimeZone(record.created_at, timeZone)}</p>
                  {record.companies?.website ? (
                    <a
                      href={`https://${record.companies.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      {record.companies.website} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!reverseOpportunitiesQuery.data?.length ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No Customer Leads yet. Add the first one above when you know a real Customer need and the right Client or Client Prospect to pursue it.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
