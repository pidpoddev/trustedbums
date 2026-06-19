import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ExternalLink, Mail, Phone, Plus, Search, Sparkles, Trash2, UserRound } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { trackAnalyticsEvent } from "@/lib/analyticsEvents";
import { formatDateForTimeZone } from "@/lib/timezone";
import {
  archiveBumInnerCircleCompany,
  createBumInnerCircleCompany,
  createBumRepresentedContact,
  deleteBumRepresentedContact,
  listBumInnerCircleCompanies,
  listBumRepresentedContacts,
  type BumInnerCircleCompanyRecord,
  type BumRepresentedContactRecord,
  type BumRepresentedContactSource,
} from "@/lib/portalApi";

const sourceLabels: Record<BumRepresentedContactSource, string> = {
  OPPORTUNITY_CLAIM: "Claim",
  PROSPECT: "Prospect",
  TARGET_RESPONSE: "Target response",
  EXTENSION_CAPTURE: "LinkedIn capture",
  MANUAL: "Contact",
};

const relationshipOptions = [
  { value: "ACQUAINTANCE", label: "Acquaintance" },
  { value: "TRUSTED_BUSINESS_ASSOCIATE", label: "Trusted business associate" },
  { value: "TRUSTED_FRIEND", label: "Trusted friend" },
] as const;

const relationshipLabels: Record<string, string> = {
  ACQUAINTANCE: "Acquaintance",
  TRUSTED_BUSINESS_ASSOCIATE: "Trusted business associate",
  TRUSTED_FRIEND: "Trusted friend",
  STRONG: "Trusted business associate",
  MODERATE: "Acquaintance",
  WEAK: "Acquaintance",
  unknown: "Not specified",
};

const emptyContactForm = {
  name: "",
  companyName: "",
  title: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  relationshipStrength: "",
  isInnerCircle: false,
  note: "",
};

const emptyInnerCircleCompanyForm = {
  companyName: "",
  companyWebsite: "",
  linkedinCompanyUrl: "",
  relationshipContext: "",
  notes: "",
};

function formatDate(value: string, timeZone: string) {
  return formatDateForTimeZone(value, timeZone, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function searchableText(contact: BumRepresentedContactRecord) {
  return [
    contact.name,
    contact.title,
    contact.email,
    ...(contact.phoneNumbers ?? []),
    contact.companyName,
    contact.contextLabel,
    contact.status,
    contact.relationshipStrength,
    contact.isInnerCircle ? "inner circle" : "",
    contact.note,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function relationshipLabel(value: string | null | undefined) {
  if (!value) return "";
  return relationshipLabels[value] ?? value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function BumContacts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timeZone = useUserTimeZone();
  const [query, setQuery] = useState("");
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [contactForm, setContactForm] = useState(emptyContactForm);
  const [innerCircleCompanyForm, setInnerCircleCompanyForm] = useState(emptyInnerCircleCompanyForm);
  const contactsQuery = useQuery({
    queryKey: ["bum-represented-contacts", user?.id],
    queryFn: () => listBumRepresentedContacts(user!.id),
    enabled: Boolean(user?.id),
  });
  const innerCircleCompaniesQuery = useQuery({
    queryKey: ["bum-inner-circle-companies", user?.id],
    queryFn: () => listBumInnerCircleCompanies(user!.id),
    enabled: Boolean(user?.id && user?.role === "BUM"),
  });
  const contacts = useMemo(() => contactsQuery.data ?? [], [contactsQuery.data]);
  const innerCircleCompanies = useMemo(() => innerCircleCompaniesQuery.data ?? [], [innerCircleCompaniesQuery.data]);
  const filteredContacts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return contacts;
    return contacts.filter((contact) => searchableText(contact).includes(normalizedQuery));
  }, [contacts, query]);

  const countsBySource = useMemo(() => {
    return contacts.reduce<Record<BumRepresentedContactSource, number>>(
      (counts, contact) => ({ ...counts, [contact.source]: counts[contact.source] + 1 }),
      { OPPORTUNITY_CLAIM: 0, PROSPECT: 0, TARGET_RESPONSE: 0, EXTENSION_CAPTURE: 0, MANUAL: 0 },
    );
  }, [contacts]);
  const innerCircleCount = useMemo(() => contacts.filter((contact) => contact.isInnerCircle).length, [contacts]);

  const addInnerCircleCompanyMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Sign in before adding an Inner Circle company.");
      if (!innerCircleCompanyForm.companyName.trim()) throw new Error("Company name is required.");
      if (!innerCircleCompanyForm.relationshipContext.trim()) throw new Error("Explain why this company belongs in your Inner Circle.");
      return createBumInnerCircleCompany(user, {
        companyName: innerCircleCompanyForm.companyName,
        companyWebsite: innerCircleCompanyForm.companyWebsite,
        linkedinCompanyUrl: innerCircleCompanyForm.linkedinCompanyUrl,
        relationshipContext: innerCircleCompanyForm.relationshipContext,
        notes: innerCircleCompanyForm.notes,
      });
    },
    onSuccess: (company) => {
      trackAnalyticsEvent("trustedbums_inner_circle_company_added", {
        company_source: "bum_contacts",
        has_website: Boolean(innerCircleCompanyForm.companyWebsite.trim()),
        has_linkedin: Boolean(innerCircleCompanyForm.linkedinCompanyUrl.trim()),
      });
      queryClient.setQueryData<BumInnerCircleCompanyRecord[]>(["bum-inner-circle-companies", user?.id], (current) => {
        if (!current?.length) return [company];
        return [company, ...current.filter((item) => item.id !== company.id)];
      });
      queryClient.invalidateQueries({ queryKey: ["bum-inner-circle-companies", user?.id] });
      setInnerCircleCompanyForm(emptyInnerCircleCompanyForm);
      setAddCompanyOpen(false);
      toast({ title: "Inner Circle company added", description: "The company is separate from your 20 named Inner Circle contacts." });
    },
    onError: (error) => {
      toast({ title: "Unable to add Inner Circle company", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const archiveInnerCircleCompanyMutation = useMutation({
    mutationFn: (company: BumInnerCircleCompanyRecord) => {
      if (!user) throw new Error("Sign in before removing an Inner Circle company.");
      return archiveBumInnerCircleCompany(user, company.id);
    },
    onSuccess: (company) => {
      queryClient.setQueryData<BumInnerCircleCompanyRecord[]>(["bum-inner-circle-companies", user?.id], (current) =>
        (current ?? []).filter((item) => item.id !== company.id),
      );
      queryClient.invalidateQueries({ queryKey: ["bum-inner-circle-companies", user?.id] });
      toast({ title: "Inner Circle company removed", description: "The company was removed from your active Inner Circle companies." });
    },
    onError: (error) => {
      toast({ title: "Unable to remove Inner Circle company", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const addContactMutation = useMutation({
    mutationFn: () => {
      if (!contactForm.name.trim()) throw new Error("Contact name is required.");
      return createBumRepresentedContact({
        name: contactForm.name.trim(),
        companyName: contactForm.companyName.trim(),
        title: contactForm.title.trim(),
        email: contactForm.email.trim(),
        phoneNumbers: contactForm.phone.trim() ? [contactForm.phone.trim()] : [],
        linkedinUrl: contactForm.linkedinUrl.trim(),
        relationshipStrength: contactForm.relationshipStrength,
        isInnerCircle: contactForm.isInnerCircle,
        note: contactForm.note.trim(),
      });
    },
    onSuccess: (result) => {
      trackAnalyticsEvent("trustedbums_contact_added", {
        contact_source: "bum_contacts",
        relationship_strength: contactForm.relationshipStrength || "not_specified",
        inner_circle: contactForm.isInnerCircle,
        has_email: Boolean(contactForm.email.trim()),
        has_phone: Boolean(contactForm.phone.trim()),
        has_linkedin: Boolean(contactForm.linkedinUrl.trim()),
      });
      queryClient.setQueryData<BumRepresentedContactRecord[]>(["bum-represented-contacts", user?.id], (current) => {
        if (!current?.length) return [result.contact];
        return [result.contact, ...current.filter((contact) => contact.id !== result.contact.id)];
      });
      queryClient.invalidateQueries({ queryKey: ["bum-represented-contacts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["portal-search", "bum-contacts", user?.id] });
      setContactForm(emptyContactForm);
      setAddContactOpen(false);
      toast({ title: "Contact added", description: "The contact is now in My Contacts." });
    },
    onError: (error) => {
      toast({ title: "Unable to add contact", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contact: BumRepresentedContactRecord) => {
      if (contact.source === "OPPORTUNITY_CLAIM") {
        throw new Error("Contacts attached to a Claim cannot be deleted.");
      }
      return deleteBumRepresentedContact(contact.id);
    },
    onSuccess: (result) => {
      queryClient.setQueryData<BumRepresentedContactRecord[]>(["bum-represented-contacts", user?.id], (current) =>
        (current ?? []).filter((contact) => contact.id !== result.contactId),
      );
      queryClient.invalidateQueries({ queryKey: ["bum-represented-contacts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["portal-search", "bum-contacts", user?.id] });
      toast({ title: "Contact deleted", description: "The contact was removed from My Contacts." });
    },
    onError: (error) => {
      toast({ title: "Unable to delete contact", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  function updateContactForm<K extends keyof typeof emptyContactForm>(field: K, value: (typeof emptyContactForm)[K]) {
    setContactForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="See the people you represent across claims, prospect recommendations, client target responses, LinkedIn captures, and your Inner Circle."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setAddCompanyOpen(true)} disabled={innerCircleCompanies.length >= 3}>
            <Building2 className="mr-2 h-4 w-4" />
            Add company
          </Button>
          <Button onClick={() => setAddContactOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add contact
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-3 md:grid-cols-6">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total contacts</p>
          <p className="mt-1 text-2xl font-semibold">{contacts.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Inner Circle</p>
          <p className="mt-1 text-2xl font-semibold">{innerCircleCount}/20</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Claim contacts</p>
          <p className="mt-1 text-2xl font-semibold">{countsBySource.OPPORTUNITY_CLAIM}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Prospect contacts</p>
          <p className="mt-1 text-2xl font-semibold">{countsBySource.PROSPECT}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Target responses</p>
          <p className="mt-1 text-2xl font-semibold">{countsBySource.TARGET_RESPONSE}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">LinkedIn captures</p>
          <p className="mt-1 text-2xl font-semibold">{countsBySource.EXTENSION_CAPTURE}</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-semibold">Inner Circle Companies</h2>
                <Badge variant="secondary">{innerCircleCompanies.length}/3</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Account-level company context stays separate from the 20 named Inner Circle contacts.
              </p>
            </div>
            <Button variant="outline" onClick={() => setAddCompanyOpen(true)} disabled={innerCircleCompanies.length >= 3}>
              <Building2 className="mr-2 h-4 w-4" />
              Add company
            </Button>
          </div>
          {innerCircleCompaniesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading Inner Circle companies...</p>
          ) : null}
          {!innerCircleCompaniesQuery.isLoading && !innerCircleCompanies.length ? (
            <p className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
              Add up to 3 companies where you understand the people, politics, decision process, or internal context well enough to help route opportunities.
            </p>
          ) : null}
          {innerCircleCompanies.length ? (
            <div className="grid gap-3 md:grid-cols-3">
              {innerCircleCompanies.map((company) => (
                <div key={company.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{company.company_name}</p>
                      {company.company_website ? <p className="truncate text-sm text-muted-foreground">{company.company_website}</p> : null}
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      disabled={archiveInnerCircleCompanyMutation.isPending}
                      onClick={() => archiveInnerCircleCompanyMutation.mutate(company)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove Inner Circle company</span>
                    </Button>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{company.relationship_context}</p>
                  {company.linkedin_company_url ? (
                    <Button className="mt-3" variant="outline" size="sm" asChild>
                      <a href={company.linkedin_company_url} target="_blank" rel="noreferrer">
                        LinkedIn
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="relative max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search contacts"
          className="pl-9"
        />
      </div>

      {contactsQuery.isLoading ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Loading represented contacts...</div>
      ) : null}

      {!contactsQuery.isLoading && contactsQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
          Unable to load contacts right now.
        </div>
      ) : null}

      {!contactsQuery.isLoading && !contactsQuery.isError && !contacts.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <UserRound className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No represented contacts yet</p>
              <p className="text-sm text-muted-foreground">
                Add up to 20 Inner Circle contacts first, then add prospects, target responses, claims, or LinkedIn captures as your network grows.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => setAddContactOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add contact
              </Button>
              <Button variant="outline" asChild>
                <Link to="/bum/opportunities">Browse opportunities</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!contactsQuery.isLoading && !contactsQuery.isError && contacts.length && !filteredContacts.length ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">No contacts match that search.</div>
      ) : null}

      <div className="grid gap-3">
        {filteredContacts.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold leading-tight">{contact.name}</h3>
                    {contact.isInnerCircle ? (
                      <Badge className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        Inner Circle
                      </Badge>
                    ) : null}
                    <Badge variant="secondary">{sourceLabels[contact.source]}</Badge>
                    <Badge variant="outline">{contact.status.replaceAll("_", " ")}</Badge>
                  </div>
                  <div className="grid gap-1 text-sm text-muted-foreground">
                    {contact.title ? <p>{contact.title}</p> : null}
                    <p className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {contact.companyName}
                    </p>
                    {contact.email ? (
                      <a className="flex items-center gap-2 hover:text-primary" href={"mailto:" + contact.email}>
                        <Mail className="h-4 w-4" />
                        {contact.email}
                      </a>
                    ) : null}
                    {contact.phoneNumbers?.length ? (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {contact.phoneNumbers[0]}
                      </p>
                    ) : null}
                    <p>{contact.contextLabel}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {contact.relationshipStrength ? <Badge variant="outline">{relationshipLabel(contact.relationshipStrength)}</Badge> : null}
                    <span>Added {formatDate(contact.created_at, timeZone)}</span>
                  </div>
                  {contact.note ? <p className="max-w-3xl text-sm text-muted-foreground line-clamp-2">{contact.note}</p> : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {contact.linkedinUrl ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={contact.linkedinUrl} target="_blank" rel="noreferrer">
                        LinkedIn
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  ) : null}
                  <Button size="sm" asChild>
                    <Link to={contact.detailUrl}>Edit contact</Link>
                  </Button>
                  {contact.source === "OPPORTUNITY_CLAIM" ? (
                    <Button size="sm" variant="outline" disabled title="Contacts attached to a Claim cannot be deleted.">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={deleteContactMutation.isPending}
                      onClick={() => {
                        if (window.confirm(`Delete ${contact.name} from My Contacts?`)) {
                          deleteContactMutation.mutate(contact);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={addCompanyOpen}
        onOpenChange={(open) => {
          setAddCompanyOpen(open);
          if (!open && !addInnerCircleCompanyMutation.isPending) {
            setInnerCircleCompanyForm(emptyInnerCircleCompanyForm);
          }
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Add Inner Circle company</DialogTitle>
            <DialogDescription>Add a company where your context is credible even when no named contact is ready yet.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inner-circle-company-name">Company</Label>
                <Input
                  id="inner-circle-company-name"
                  value={innerCircleCompanyForm.companyName}
                  onChange={(event) => setInnerCircleCompanyForm((current) => ({ ...current, companyName: event.target.value }))}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inner-circle-company-website">Website</Label>
                <Input
                  id="inner-circle-company-website"
                  value={innerCircleCompanyForm.companyWebsite}
                  onChange={(event) => setInnerCircleCompanyForm((current) => ({ ...current, companyWebsite: event.target.value }))}
                  placeholder="https://company.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inner-circle-company-linkedin">LinkedIn company page</Label>
              <Input
                id="inner-circle-company-linkedin"
                value={innerCircleCompanyForm.linkedinCompanyUrl}
                onChange={(event) => setInnerCircleCompanyForm((current) => ({ ...current, linkedinCompanyUrl: event.target.value }))}
                placeholder="https://www.linkedin.com/company/acme"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inner-circle-company-context">Relationship context</Label>
              <Textarea
                id="inner-circle-company-context"
                rows={4}
                value={innerCircleCompanyForm.relationshipContext}
                onChange={(event) => setInnerCircleCompanyForm((current) => ({ ...current, relationshipContext: event.target.value }))}
                placeholder="Why you understand this company, its politics, decision process, or people."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inner-circle-company-notes">Notes</Label>
              <Textarea
                id="inner-circle-company-notes"
                rows={3}
                value={innerCircleCompanyForm.notes}
                onChange={(event) => setInnerCircleCompanyForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Optional context for future claims or route review."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddCompanyOpen(false)} disabled={addInnerCircleCompanyMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => addInnerCircleCompanyMutation.mutate()}
              disabled={
                innerCircleCompanies.length >= 3 ||
                !innerCircleCompanyForm.companyName.trim() ||
                !innerCircleCompanyForm.relationshipContext.trim() ||
                addInnerCircleCompanyMutation.isPending
              }
            >
              Add company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={addContactOpen}
        onOpenChange={(open) => {
          setAddContactOpen(open);
          if (!open && !addContactMutation.isPending) {
            setContactForm(emptyContactForm);
          }
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Add contact</DialogTitle>
            <DialogDescription>Add someone you know so they are available when you claim or respond to opportunities.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-contact-name">Name</Label>
                <Input
                  id="new-contact-name"
                  value={contactForm.name}
                  onChange={(event) => updateContactForm("name", event.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-contact-company">Company</Label>
                <Input
                  id="new-contact-company"
                  value={contactForm.companyName}
                  onChange={(event) => updateContactForm("companyName", event.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-contact-title">Title</Label>
                <Input
                  id="new-contact-title"
                  value={contactForm.title}
                  onChange={(event) => updateContactForm("title", event.target.value)}
                  placeholder="VP Operations"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-contact-email">Email</Label>
                <Input
                  id="new-contact-email"
                  type="email"
                  value={contactForm.email}
                  onChange={(event) => updateContactForm("email", event.target.value)}
                  placeholder="jane@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-contact-phone">Phone</Label>
                <Input
                  id="new-contact-phone"
                  value={contactForm.phone}
                  onChange={(event) => updateContactForm("phone", event.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-contact-relationship">Relationship</Label>
                <Select value={contactForm.relationshipStrength || "UNKNOWN"} onValueChange={(value) => updateContactForm("relationshipStrength", value === "UNKNOWN" ? "" : value)}>
                  <SelectTrigger id="new-contact-relationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNKNOWN">Not specified</SelectItem>
                    {relationshipOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="new-contact-inner-circle"
                  checked={contactForm.isInnerCircle}
                  onCheckedChange={(checked) => updateContactForm("isInnerCircle", checked === true)}
                />
                <div className="space-y-1">
                  <Label htmlFor="new-contact-inner-circle">Add to Inner Circle</Label>
                  <p className="text-sm text-muted-foreground">
                    Inner Circle is your private set of strongest trusted relationships. Keep it focused: maximum 20 contacts for now.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-contact-linkedin">LinkedIn</Label>
              <Input
                id="new-contact-linkedin"
                value={contactForm.linkedinUrl}
                onChange={(event) => updateContactForm("linkedinUrl", event.target.value)}
                placeholder="https://www.linkedin.com/in/jane-doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-contact-note">Notes</Label>
              <Textarea
                id="new-contact-note"
                rows={4}
                value={contactForm.note}
                onChange={(event) => updateContactForm("note", event.target.value)}
                placeholder="How you know them and when an introduction would make sense."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddContactOpen(false)} disabled={addContactMutation.isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={() => addContactMutation.mutate()} disabled={!contactForm.name.trim() || addContactMutation.isPending}>
              Add contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
