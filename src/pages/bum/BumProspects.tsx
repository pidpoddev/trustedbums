import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ExternalLink, Handshake, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  createProspectRecommendation,
  listOwnProspectRecommendations,
  listProspectContacts,
  type ProspectContactRecord,
  type ProspectInviteOwner,
} from "@/lib/portalApi";
import { formatDateForTimeZone } from "@/lib/timezone";

const initialForm = {
  company_name: "",
  company_website: "",
  linkedin_company_url: "",
  key_contact_name: "",
  key_contact_title: "",
  key_contact_email: "",
  key_contact_linkedin_url: "",
  invite_owner: "BUM" as ProspectInviteOwner,
  notes: "",
};

function inviteOwnerLabel(value: ProspectInviteOwner) {
  return value === "TRUSTED_BUMS" ? "Trusted Bums invite" : "Bum-led invite";
}

export default function BumProspects() {
  const { user } = useAuth();
  const timeZone = useUserTimeZone();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);

  const recommendationsQuery = useQuery({
    queryKey: ["bum-prospects", user?.id],
    queryFn: () => listOwnProspectRecommendations(user!.id),
    enabled: Boolean(user?.id),
  });
  const contactsQuery = useQuery({
    queryKey: ["bum-prospect-contacts", user?.id],
    queryFn: listProspectContacts,
    enabled: Boolean(user?.id),
  });

  const createMutation = useMutation({
    mutationFn: () => createProspectRecommendation(user!, form),
    onSuccess: async (recommendation) => {
      await queryClient.invalidateQueries({ queryKey: ["bum-prospects", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["bum-prospect-contacts", user?.id] });
      toast({
        title: "Prospect saved",
        description:
          recommendation.companies?.relationship_stage === "CLIENT"
            ? "This company already exists as a client, so your relationship was added to the existing company."
            : "Your prospect and key contact were added for admin review.",
      });
      setForm(initialForm);
    },
    onError: (error) => {
      toast({
        title: "Unable to save prospect",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const recommendationContacts = useMemo(() => {
    const byRecommendation = new Map<string, ProspectContactRecord[]>();

    for (const contact of contactsQuery.data ?? []) {
      if (!contact.recommendation_id) {
        continue;
      }

      const current = byRecommendation.get(contact.recommendation_id) ?? [];
      current.push(contact);
      byRecommendation.set(contact.recommendation_id, current);
    }

    return byRecommendation;
  }, [contactsQuery.data]);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospects"
        description="Add target companies once, anchor them to a key contact, and tell admin who should own the invite."
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Add prospected client
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
                <Label htmlFor="prospect-company-name">Company name</Label>
                <Input
                  id="prospect-company-name"
                  required
                  value={form.company_name}
                  onChange={(event) => updateField("company_name", event.target.value)}
                  placeholder="Acme"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospect-company-website">Company website</Label>
                <Input
                  id="prospect-company-website"
                  value={form.company_website}
                  onChange={(event) => updateField("company_website", event.target.value)}
                  placeholder="acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospect-company-linkedin">LinkedIn company page</Label>
                <Input
                  id="prospect-company-linkedin"
                  value={form.linkedin_company_url}
                  onChange={(event) => updateField("linkedin_company_url", event.target.value)}
                  placeholder="linkedin.com/company/acme"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospect-invite-owner">Invite owner</Label>
                <Select value={form.invite_owner} onValueChange={(value) => updateField("invite_owner", value)}>
                  <SelectTrigger id="prospect-invite-owner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUM">I will invite them personally</SelectItem>
                    <SelectItem value="TRUSTED_BUMS">Trusted Bums should invite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospect-contact-name">Key contact name</Label>
                <Input
                  id="prospect-contact-name"
                  required
                  value={form.key_contact_name}
                  onChange={(event) => updateField("key_contact_name", event.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospect-contact-title">Key contact title</Label>
                <Input
                  id="prospect-contact-title"
                  value={form.key_contact_title}
                  onChange={(event) => updateField("key_contact_title", event.target.value)}
                  placeholder="VP of Sales"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospect-contact-email">Key contact email</Label>
                <Input
                  id="prospect-contact-email"
                  type="email"
                  value={form.key_contact_email}
                  onChange={(event) => updateField("key_contact_email", event.target.value)}
                  placeholder="jane@acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospect-contact-linkedin">Key contact LinkedIn</Label>
                <Input
                  id="prospect-contact-linkedin"
                  value={form.key_contact_linkedin_url}
                  onChange={(event) => updateField("key_contact_linkedin_url", event.target.value)}
                  placeholder="linkedin.com/in/jane-doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prospect-notes">Notes</Label>
              <Textarea
                id="prospect-notes"
                rows={4}
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Why this company matters, what relationship context you have, and any invite guidance."
              />
            </div>

            <div className="flex justify-end">
              <Button disabled={createMutation.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Save prospect
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {(recommendationsQuery.data ?? []).map((recommendation) => {
          const contacts = recommendationContacts.get(recommendation.id) ?? [];
          const primaryContact = contacts.find((contact) => contact.is_primary) ?? contacts[0];

          return (
            <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-3">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-lg">{recommendation.companies?.name ?? "Company"}</h3>
                          <Badge variant={recommendation.status === "CLIENT" ? "default" : "secondary"}>
                            {recommendation.companies?.relationship_stage ?? recommendation.status}
                          </Badge>
                          <Badge variant="outline">{inviteOwnerLabel(recommendation.invite_owner)}</Badge>
                        </div>
                        {recommendation.companies?.website ? (
                          <a
                            href={`https://${recommendation.companies.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                          >
                            {recommendation.companies.website} <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                    {primaryContact ? (
                      <div className="grid gap-1 text-sm">
                        <p className="font-medium inline-flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {primaryContact.full_name}
                        </p>
                        <p className="text-muted-foreground">
                          {primaryContact.title ?? "Title not provided"}
                          {primaryContact.email ? ` • ${primaryContact.email}` : ""}
                        </p>
                      </div>
                    ) : null}
                    {recommendation.notes ? (
                      <p className="text-sm text-muted-foreground">{recommendation.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Handshake className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Added {formatDateForTimeZone(recommendation.created_at, timeZone)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!recommendationsQuery.isLoading && !(recommendationsQuery.data ?? []).length ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No prospects submitted yet. Add the first target company above.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
