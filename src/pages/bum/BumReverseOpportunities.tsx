import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, DollarSign, ExternalLink, Plus, Search, Sparkles, Users } from "lucide-react";
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
  createBumRepresentedContact,
  createReverseOpportunity,
  findCustomerLeadDuplicate,
  listBumRepresentedContacts,
  listCompanies,
  listOwnReverseOpportunities,
  normalizeCustomerDomain,
  type BumRepresentedContactRecord,
  type CustomerLeadDuplicateRecord,
  type ReverseOpportunityClientMode,
  type ReverseOpportunityStatus,
} from "@/lib/portalApi";
import { opportunityOriginLabel, opportunityStageLabel, stageFromReverseOpportunityStatus } from "@/lib/opportunityModel";
import { formatDateForTimeZone } from "@/lib/timezone";
import { useSearchParams } from "react-router-dom";

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

const emptyKnownContactForm = {
  name: "",
  title: "",
  email: "",
  linkedinUrl: "",
  note: "",
};

interface LeadContactDraft {
  id: string;
  source: "existing" | "new";
  contactId?: string;
  name: string;
  title: string;
  email: string;
  linkedinUrl: string;
  note: string;
}

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

function contactSearchText(contact: BumRepresentedContactRecord) {
  return [contact.name, contact.title, contact.email, contact.companyName, contact.note]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function makeDraftId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `contact-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function BumReverseOpportunities() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const timeZone = useUserTimeZone();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => ({
    ...initialForm,
    vendor_company_id: searchParams.get("clientId") ?? "",
    expected_product_service: searchParams.get("product") ?? "",
  }));
  const [duplicate, setDuplicate] = useState<CustomerLeadDuplicateRecord | null>(null);
  const [domainChecked, setDomainChecked] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [selectedExistingContactId, setSelectedExistingContactId] = useState("none");
  const [knownContactForm, setKnownContactForm] = useState(emptyKnownContactForm);
  const [leadContacts, setLeadContacts] = useState<LeadContactDraft[]>([]);

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: listCompanies,
  });
  const reverseOpportunitiesQuery = useQuery({
    queryKey: ["bum-reverse-opportunities", user?.id],
    queryFn: () => listOwnReverseOpportunities(user!.id),
    enabled: Boolean(user?.id),
  });
  const contactsQuery = useQuery({
    queryKey: ["bum-represented-contacts", user?.id],
    queryFn: () => listBumRepresentedContacts(user!.id),
    enabled: Boolean(user?.id),
  });

  const clientCompanies = useMemo(
    () => (companiesQuery.data ?? []).filter((company) => company.relationship_stage === "CLIENT"),
    [companiesQuery.data],
  );
  const availableContacts = useMemo(() => {
    const contacts = contactsQuery.data ?? [];
    const alreadySelected = new Set(leadContacts.map((contact) => contact.contactId).filter(Boolean));
    const normalizedSearch = contactSearch.trim().toLowerCase();
    return contacts
      .filter((contact) => !alreadySelected.has(contact.id))
      .filter((contact) => !normalizedSearch || contactSearchText(contact).includes(normalizedSearch))
      .slice(0, 20);
  }, [contactSearch, contactsQuery.data, leadContacts]);
  const normalizedCustomerDomain = normalizeCustomerDomain(form.customer_company_website);
  const canCheckDomain = form.client_mode === "EXISTING_CLIENT" && Boolean(form.vendor_company_id && normalizedCustomerDomain);

  useEffect(() => {
    const clientId = searchParams.get("clientId");
    const product = searchParams.get("product");
    if (!clientId && !product) return;
    setForm((current) => ({
      ...current,
      client_mode: clientId ? "EXISTING_CLIENT" : current.client_mode,
      vendor_company_id: clientId ?? current.vendor_company_id,
      expected_product_service: product ?? current.expected_product_service,
    }));
  }, [searchParams]);

  const duplicateCheckMutation = useMutation({
    mutationFn: () => {
      if (!form.vendor_company_id) throw new Error("Choose the Client first.");
      if (!normalizedCustomerDomain) throw new Error("Add the customer domain first.");
      return findCustomerLeadDuplicate(form.vendor_company_id, normalizedCustomerDomain);
    },
    onSuccess: (record) => {
      setDuplicate(record);
      setDomainChecked(true);
      if (record) {
        toast({
          title: "Customer Opportunity already exists",
          description: `${record.customer_name} is already listed for this Client.`,
          variant: "destructive",
        });
      } else {
        toast({ title: "Domain checked", description: "No existing Customer Opportunity was found for this Client." });
      }
    },
    onError: (error) => {
      toast({
        title: "Unable to check customer domain",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  function updatePrimaryCustomerContact(contact: LeadContactDraft) {
    setForm((current) => ({
      ...current,
      customer_contact_name: current.customer_contact_name || contact.name,
      customer_contact_title: current.customer_contact_title || contact.title,
      customer_contact_email: current.customer_contact_email || contact.email,
    }));
  }

  function addExistingContact(contactId: string) {
    const contact = (contactsQuery.data ?? []).find((item) => item.id === contactId);
    if (!contact) return;
    const draft: LeadContactDraft = {
      id: `existing-${contact.id}`,
      source: "existing",
      contactId: contact.id,
      name: contact.name,
      title: contact.title ?? "",
      email: contact.email ?? "",
      linkedinUrl: contact.linkedinUrl ?? "",
      note: contact.note ?? "",
    };
    setLeadContacts((current) => [...current, draft]);
    setSelectedExistingContactId("none");
    setContactSearch("");
    updatePrimaryCustomerContact(draft);
  }

  function addNewKnownContact() {
    const name = knownContactForm.name.trim();
    if (!name) {
      toast({ title: "Contact name required", description: "Add a name before adding this contact.", variant: "destructive" });
      return;
    }

    const draft: LeadContactDraft = {
      id: makeDraftId(),
      source: "new",
      name,
      title: knownContactForm.title.trim(),
      email: knownContactForm.email.trim(),
      linkedinUrl: knownContactForm.linkedinUrl.trim(),
      note: knownContactForm.note.trim(),
    };
    setLeadContacts((current) => [...current, draft]);
    setKnownContactForm(emptyKnownContactForm);
    updatePrimaryCustomerContact(draft);
  }

  function removeLeadContact(contactId: string) {
    setLeadContacts((current) => current.filter((contact) => contact.id !== contactId));
  }

  function primaryCustomerContactDraft(): LeadContactDraft | null {
    if (!form.customer_contact_name.trim()) return null;
    return {
      id: "primary-customer-contact",
      source: "new",
      name: form.customer_contact_name.trim(),
      title: form.customer_contact_title.trim(),
      email: form.customer_contact_email.trim(),
      linkedinUrl: "",
      note: "",
    };
  }

  function dedupeContactsForMyContacts() {
    const existingKeys = new Set(
      leadContacts
        .filter((contact) => contact.source === "existing")
        .map((contact) => (contact.email || contact.name).trim().toLowerCase()),
    );
    const newContacts = [...leadContacts.filter((contact) => contact.source === "new")];
    const primary = primaryCustomerContactDraft();
    if (primary) newContacts.unshift(primary);

    const seen = new Set(existingKeys);
    return newContacts.filter((contact) => {
      const key = (contact.email || contact.name).trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const record = await createReverseOpportunity(user!, {
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
      });

      const contactsToCreate = dedupeContactsForMyContacts();
      const contactResults = await Promise.allSettled(
        contactsToCreate.map((contact) =>
          createBumRepresentedContact({
            name: contact.name,
            companyName: form.customer_company_name,
            title: contact.title,
            email: contact.email,
            linkedinUrl: contact.linkedinUrl,
            relationshipStrength: "unknown",
            note: [
              contact.note,
              `Added from Customer Lead for ${form.customer_company_name}.`,
              form.expected_product_service ? `Suggested fit: ${form.expected_product_service}.` : null,
            ].filter(Boolean).join("\n\n"),
          }),
        ),
      );

      return {
        record,
        contactsAdded: contactResults.filter((result) => result.status === "fulfilled").length,
        contactsFailed: contactResults.filter((result) => result.status === "rejected").length,
      };
    },
    onSuccess: async ({ record, contactsAdded, contactsFailed }) => {
      await queryClient.invalidateQueries({ queryKey: ["bum-reverse-opportunities", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-reverse-opportunities"] });
      await queryClient.invalidateQueries({ queryKey: ["client-reverse-opportunities"] });
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      await queryClient.invalidateQueries({ queryKey: ["bum-represented-contacts", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["portal-search", "bum-contacts", user?.id] });
      toast({
        title: "Customer lead saved",
        description:
          contactsFailed > 0
            ? "The lead was saved, but at least one contact could not be added to My Contacts."
            : contactsAdded > 0
              ? `The lead was saved and ${contactsAdded} contact${contactsAdded === 1 ? " was" : "s were"} added to My Contacts.`
              : record.client_mode === "EXISTING_CLIENT"
                ? "We logged this Customer Lead against the existing Client for review and outreach."
                : "We created the Prospective Client record and queued the Customer Lead for review and outreach.",
        variant: contactsFailed > 0 ? "destructive" : "default",
      });
      setForm(initialForm);
      setLeadContacts([]);
      setKnownContactForm(emptyKnownContactForm);
      setSelectedExistingContactId("none");
      setContactSearch("");
      setDuplicate(null);
      setDomainChecked(false);
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
    if (field === "vendor_company_id" || field === "customer_company_website" || field === "client_mode") {
      setDuplicate(null);
      setDomainChecked(false);
    }
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Leads"
        description="Start with real Customer demand, then route it to an existing Client or a Prospective Client who could fulfill it."
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
                    <SelectItem value="PROSPECT_CLIENT">A Prospective Client</SelectItem>
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
                  <Label htmlFor="prospect-client-name">Prospective Client company</Label>
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
                    <Label htmlFor="prospect-client-website">Prospective Client website</Label>
                    <Input
                      id="prospect-client-website"
                      value={form.prospect_client_website}
                      onChange={(event) => updateField("prospect_client_website", event.target.value)}
                      placeholder="k2view.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prospect-client-linkedin">Prospective Client LinkedIn</Label>
                    <Input
                      id="prospect-client-linkedin"
                      value={form.prospect_client_linkedin_url}
                      onChange={(event) => updateField("prospect_client_linkedin_url", event.target.value)}
                      placeholder="linkedin.com/company/k2view"
                    />
                  </div>
                </>
              ) : null}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customer-company-website">Customer domain</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="customer-company-website"
                    required
                    value={form.customer_company_website}
                    onChange={(event) => updateField("customer_company_website", event.target.value)}
                    placeholder="dell.com"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canCheckDomain || duplicateCheckMutation.isPending}
                    onClick={() => duplicateCheckMutation.mutate()}
                  >
                    {domainChecked && !duplicate ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Search className="mr-2 h-4 w-4" />}
                    {duplicateCheckMutation.isPending ? "Checking..." : "Check domain"}
                  </Button>
                </div>
                {duplicate ? (
                  <p className="text-sm font-medium text-destructive">
                    Customer Opportunity already exists for this Client: {duplicate.customer_name}.
                  </p>
                ) : domainChecked ? (
                  <p className="text-sm text-emerald-700">No existing Customer Opportunity found for this Client.</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Enter the customer domain first so we can catch duplicates, including associated domains already tied to the same company.
                  </p>
                )}
              </div>

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
                <Label htmlFor="customer-company-name">Customer company</Label>
                <Input
                  id="customer-company-name"
                  required
                  value={form.customer_company_name}
                  onChange={(event) => updateField("customer_company_name", event.target.value)}
                  placeholder="Global Health System"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-contact-name">Customer contact</Label>
                <Input
                  id="customer-contact-name"
                  value={form.customer_contact_name}
                  onChange={(event) => updateField("customer_contact_name", event.target.value)}
                  placeholder="John Champion"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-contact-title">Customer title</Label>
                <Input
                  id="customer-contact-title"
                  value={form.customer_contact_title}
                  onChange={(event) => updateField("customer_contact_title", event.target.value)}
                  placeholder="Chief Data Officer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-contact-email">Customer email</Label>
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

            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-medium">Known contacts at the Customer</h3>
                <p className="text-sm text-muted-foreground">
                  Add everyone you know at this Customer. New contacts are saved to My Contacts when the lead is saved.
                </p>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="existing-contact-search">Pull from My Contacts</Label>
                    <Input
                      id="existing-contact-search"
                      value={contactSearch}
                      onChange={(event) => setContactSearch(event.target.value)}
                      placeholder="Search contacts"
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select value={selectedExistingContactId} onValueChange={setSelectedExistingContactId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an existing contact" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Choose an existing contact</SelectItem>
                        {availableContacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name} · {contact.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={selectedExistingContactId === "none"}
                      onClick={() => addExistingContact(selectedExistingContactId)}
                    >
                      Add existing
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="known-contact-name">Add new contact</Label>
                    <Input
                      id="known-contact-name"
                      value={knownContactForm.name}
                      onChange={(event) => setKnownContactForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Customer contact name"
                    />
                  </div>
                  <Input
                    value={knownContactForm.title}
                    onChange={(event) => setKnownContactForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Title"
                    aria-label="New customer contact title"
                  />
                  <Input
                    type="email"
                    value={knownContactForm.email}
                    onChange={(event) => setKnownContactForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="Email"
                    aria-label="New customer contact email"
                  />
                  <Input
                    value={knownContactForm.linkedinUrl}
                    onChange={(event) => setKnownContactForm((current) => ({ ...current, linkedinUrl: event.target.value }))}
                    placeholder="LinkedIn URL"
                    aria-label="New customer contact LinkedIn URL"
                  />
                  <Input
                    value={knownContactForm.note}
                    onChange={(event) => setKnownContactForm((current) => ({ ...current, note: event.target.value }))}
                    placeholder="Relationship note"
                    aria-label="New customer contact relationship note"
                  />
                  <div className="sm:col-span-2">
                    <Button type="button" variant="outline" onClick={addNewKnownContact}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add contact to lead
                    </Button>
                  </div>
                </div>
              </div>

              {leadContacts.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {leadContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {contact.name}
                        {contact.title ? ` · ${contact.title}` : ""}
                        {contact.source === "existing" ? " · My Contacts" : ""}
                      </span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLeadContact(contact.id)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
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
              <Button disabled={createMutation.isPending || (form.client_mode === "EXISTING_CLIENT" && (!domainChecked || Boolean(duplicate)))}>
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
                      label={record.client_mode === "EXISTING_CLIENT" ? "Existing client" : "Prospective Client"}
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
              No Customer Leads yet. Add the first one above when you know a real Customer need and the right Client or Prospective Client to pursue it.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
