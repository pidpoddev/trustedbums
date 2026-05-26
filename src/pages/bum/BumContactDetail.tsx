import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Link2Off, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  getBumRepresentedContact,
  resyncBumRepresentedContact,
  updateBumRepresentedContact,
  type BumContactUpdateInput,
  type BumRepresentedContactRecord,
} from "@/lib/portalApi";

const NO_OPPORTUNITY = "__none__";

interface ContactFormState {
  name: string;
  title: string;
  companyName: string;
  email: string;
  linkedinUrl: string;
  relationshipStrength: string;
  note: string;
  opportunityRegistrationId: string;
  phoneNumbers: string[];
}

function toFormState(contact?: BumRepresentedContactRecord | null): ContactFormState {
  return {
    name: contact?.name ?? "",
    title: contact?.title ?? "",
    companyName: contact?.companyName ?? "",
    email: contact?.email ?? "",
    linkedinUrl: contact?.linkedinUrl ?? "",
    relationshipStrength: contact?.relationshipStrength ?? "",
    note: contact?.note ?? "",
    opportunityRegistrationId: contact?.opportunityRegistrationId ?? NO_OPPORTUNITY,
    phoneNumbers: contact?.phoneNumbers?.length ? contact.phoneNumbers : [""],
  };
}

function cleanPhones(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function opportunityLabel(opportunity: { target_account_name: string; companies?: { name: string | null } | null; status: string }) {
  const company = opportunity.companies?.name;
  return company ? opportunity.target_account_name + " - " + company : opportunity.target_account_name;
}

export default function BumContactDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const contactId = id ?? "";
  const [form, setForm] = useState<ContactFormState>(() => toFormState(null));

  const detailQuery = useQuery({
    queryKey: ["bum-contact", contactId],
    queryFn: () => getBumRepresentedContact(contactId),
    enabled: Boolean(contactId),
  });

  useEffect(() => {
    if (detailQuery.data?.contact) {
      setForm(toFormState(detailQuery.data.contact));
    }
  }, [detailQuery.data?.contact]);

  const selectedOpportunity = useMemo(() => {
    if (form.opportunityRegistrationId === NO_OPPORTUNITY) return null;
    return detailQuery.data?.opportunities.find((opportunity) => opportunity.id === form.opportunityRegistrationId) ?? null;
  }, [detailQuery.data?.opportunities, form.opportunityRegistrationId]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!form.name.trim()) throw new Error("Contact name is required.");
      const patch: BumContactUpdateInput = {
        name: form.name,
        title: form.title,
        companyName: form.companyName,
        email: form.email,
        linkedinUrl: form.linkedinUrl,
        relationshipStrength: form.relationshipStrength,
        note: form.note,
        phoneNumbers: cleanPhones(form.phoneNumbers),
        opportunityRegistrationId: form.opportunityRegistrationId === NO_OPPORTUNITY ? null : form.opportunityRegistrationId,
      };
      return updateBumRepresentedContact(contactId, patch);
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["bum-contact", contactId], result);
      queryClient.invalidateQueries({ queryKey: ["bum-represented-contacts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["portal-search", "bum-contacts", user?.id] });
      toast({ title: "Contact saved", description: "The contact record was updated." });
    },
    onError: (error) => {
      toast({ title: "Unable to save contact", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: () => updateBumRepresentedContact(contactId, { opportunityRegistrationId: null }),
    onSuccess: (result) => {
      queryClient.setQueryData(["bum-contact", contactId], result);
      queryClient.invalidateQueries({ queryKey: ["bum-represented-contacts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["portal-search", "bum-contacts", user?.id] });
      setForm((current) => ({ ...current, opportunityRegistrationId: NO_OPPORTUNITY }));
      toast({ title: "Opportunity unlinked", description: "The contact is no longer tied to that opportunity." });
    },
    onError: (error) => {
      toast({ title: "Unable to unlink opportunity", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const resyncMutation = useMutation({
    mutationFn: () => resyncBumRepresentedContact(contactId),
    onSuccess: (result) => {
      queryClient.setQueryData(["bum-contact", contactId], result);
      queryClient.invalidateQueries({ queryKey: ["bum-represented-contacts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["portal-search", "bum-contacts", user?.id] });
      toast({ title: "LinkedIn capture synced", description: "The latest saved LinkedIn capture was applied." });
    },
    onError: (error) => {
      toast({ title: "Unable to re-sync LinkedIn", description: error instanceof Error ? error.message : "Open the profile and send it again from the extension.", variant: "destructive" });
    },
  });

  const contact = detailQuery.data?.contact;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/bum/contacts">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Contacts
        </Link>
      </Button>

      <PageHeader title={contact?.name ?? "Contact"} description={contact?.companyName ?? "Manage contact details"} />

      {detailQuery.isLoading ? <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Loading contact...</div> : null}

      {!detailQuery.isLoading && detailQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
          Unable to load this contact right now.
        </div>
      ) : null}

      {!detailQuery.isLoading && !detailQuery.isError ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Contact details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input id="contact-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-title">Title</Label>
                  <Input id="contact-title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-company">Company</Label>
                  <Input id="contact-company" value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="contact-linkedin">LinkedIn</Label>
                  <Input id="contact-linkedin" value={form.linkedinUrl} onChange={(event) => setForm((current) => ({ ...current, linkedinUrl: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-relationship">Relationship</Label>
                  <Input id="contact-relationship" value={form.relationshipStrength} onChange={(event) => setForm((current) => ({ ...current, relationshipStrength: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Opportunity</Label>
                  <div className="flex gap-2">
                    <Select value={form.opportunityRegistrationId} onValueChange={(value) => setForm((current) => ({ ...current, opportunityRegistrationId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="No linked opportunity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_OPPORTUNITY}>No linked opportunity</SelectItem>
                        {(detailQuery.data?.opportunities ?? []).map((opportunity) => (
                          <SelectItem key={opportunity.id} value={opportunity.id}>
                            {opportunityLabel(opportunity)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {contact?.opportunityRegistrationId ? (
                      <Button type="button" variant="outline" size="icon" aria-label="Unlink opportunity" onClick={() => unlinkMutation.mutate()} disabled={unlinkMutation.isPending}>
                        <Link2Off className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label>Phone numbers</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setForm((current) => ({ ...current, phoneNumbers: [...current.phoneNumbers, ""] }))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add phone
                  </Button>
                </div>
                <div className="grid gap-2">
                  {form.phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={phone}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            phoneNumbers: current.phoneNumbers.map((value, phoneIndex) => (phoneIndex === index ? event.target.value : value)),
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Remove phone number"
                        onClick={() => setForm((current) => ({ ...current, phoneNumbers: current.phoneNumbers.filter((_, phoneIndex) => phoneIndex !== index) }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-notes">Notes</Label>
                <Textarea id="contact-notes" rows={5} value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || unlinkMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Save changes
                </Button>
                {form.linkedinUrl ? (
                  <Button variant="outline" asChild>
                    <a href={form.linkedinUrl} target="_blank" rel="noreferrer">
                      LinkedIn
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : null}
                <Button variant="outline" onClick={() => resyncMutation.mutate()} disabled={resyncMutation.isPending}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-sync LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Linked record</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  {contact?.source ? <Badge variant="secondary">{contact.source.replaceAll("_", " ")}</Badge> : null}
                  {contact?.status ? <Badge variant="outline">{contact.status.replaceAll("_", " ")}</Badge> : null}
                </div>
                <p className="text-muted-foreground">{contact?.contextLabel}</p>
                {selectedOpportunity ? (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={"/bum/opportunities/" + selectedOpportunity.id}>Open opportunity</Link>
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => unlinkMutation.mutate()} disabled={unlinkMutation.isPending}>
                      <Link2Off className="mr-2 h-4 w-4" />
                      Unlink opportunity
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
