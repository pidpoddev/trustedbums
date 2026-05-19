import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Plus, Search, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  createClientCompany,
  listAdminProspectRecommendations,
  listCompanies,
  listOpportunityRegistrations,
  listProfiles,
  listProspectContacts,
  listTermsAcceptances,
  type CompanyRelationshipStage,
} from "@/lib/portalApi";
import { formatDateForTimeZone, formatDateTimeForTimeZone } from "@/lib/timezone";

function stageVariant(stage: CompanyRelationshipStage) {
  if (stage === "CLIENT") {
    return "success" as const;
  }

  if (stage === "INACTIVE") {
    return "warning" as const;
  }

  return "info" as const;
}

type ClientTypeFilter = "ALL" | "ACTIVE_CLIENT" | "HAS_OPPORTUNITIES" | "BUM_CONNECTED" | "INACTIVE";

const clientTypeFilters: { value: ClientTypeFilter; label: string }[] = [
  { value: "ALL", label: "All client types" },
  { value: "ACTIVE_CLIENT", label: "Active clients" },
  { value: "HAS_OPPORTUNITIES", label: "With opportunities" },
  { value: "BUM_CONNECTED", label: "With Bum connections" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function AdminClients() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ClientTypeFilter>("ALL");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientWebsite, setNewClientWebsite] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timeZone = useUserTimeZone();
  const companiesQuery = useQuery({ queryKey: ["admin-companies"], queryFn: listCompanies });
  const profilesQuery = useQuery({ queryKey: ["admin-profiles"], queryFn: listProfiles });
  const opportunitiesQuery = useQuery({
    queryKey: ["admin-opportunities", "All"],
    queryFn: () => listOpportunityRegistrations("All"),
  });
  const recommendationsQuery = useQuery({
    queryKey: ["admin-prospect-recommendations"],
    queryFn: listAdminProspectRecommendations,
  });
  const acceptancesQuery = useQuery({
    queryKey: ["admin-terms-acceptances"],
    queryFn: listTermsAcceptances,
  });
  const contactsQuery = useQuery({
    queryKey: ["admin-prospect-contacts"],
    queryFn: listProspectContacts,
  });
  const createClientMutation = useMutation({
    mutationFn: () => createClientCompany(user!, { name: newClientName, website: newClientWebsite }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      setCreateDialogOpen(false);
      setNewClientName("");
      setNewClientWebsite("");
      toast({ title: "Client created", description: "The company was added as a live client record." });
    },
    onError: (error) => {
      toast({
        title: "Unable to create client",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const companySummaries = useMemo(() => {
    const profiles = profilesQuery.data ?? [];
    const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
    const opportunities = opportunitiesQuery.data ?? [];
    const recommendations = recommendationsQuery.data ?? [];
    const contacts = contactsQuery.data ?? [];
    const acceptances = acceptancesQuery.data ?? [];

    const summaries = (companiesQuery.data ?? []).map((company) => {
      const users = profiles.filter((profile) => profile.company_id === company.id);
      const companyOpportunities = opportunities.filter((opportunity) => opportunity.company_id === company.id);
      const companyRecommendations = recommendations.filter((recommendation) => recommendation.company_id === company.id);
      const companyContacts = contacts.filter((contact) => contact.company_id === company.id);
      const companyAcceptances = acceptances
        .filter((acceptance) => acceptance.company_id === company.id)
        .map((acceptance) => ({
          version: acceptance.terms_versions?.version ?? acceptance.terms_version_id,
          title: acceptance.terms_versions?.title ?? "Terms",
          acceptedAt: acceptance.accepted_at,
          acceptedBy:
            profilesById.get(acceptance.user_id)?.full_name ??
            profilesById.get(acceptance.user_id)?.email ??
            acceptance.user_id,
        }))
        .sort((left, right) => right.acceptedAt.localeCompare(left.acceptedAt));
      const recommenderNames = Array.from(
        new Set(
          companyRecommendations.map(
            (recommendation) => recommendation.profiles?.full_name ?? recommendation.profiles?.email ?? recommendation.bum_user_id,
          ),
        ),
      );
      const uniqueKnownContacts = Array.from(new Set(companyContacts.map((contact) => contact.full_name.trim().toLowerCase()))).length;
      const overlapCount = Math.max(0, recommenderNames.length - 1);

      return {
        ...company,
        userCount: users.length,
        primaryEmail: users[0]?.email ?? "No users yet",
        latestUserLoginAt: users
          .map((profile) => profile.last_sign_in_at)
          .filter(Boolean)
          .sort((left, right) => new Date(right!).getTime() - new Date(left!).getTime())[0] ?? null,
        users: users
          .map((profile) => ({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
            last_sign_in_at: profile.last_sign_in_at,
          }))
          .sort((left, right) => {
            const rightTime = right.last_sign_in_at ? new Date(right.last_sign_in_at).getTime() : 0;
            const leftTime = left.last_sign_in_at ? new Date(left.last_sign_in_at).getTime() : 0;
            return rightTime - leftTime || (left.full_name ?? left.email ?? left.id).localeCompare(right.full_name ?? right.email ?? right.id);
          }),
        opportunityCount: companyOpportunities.length,
        introCount: companyOpportunities.filter((opportunity) => opportunity.status === "Accepted").length,
        recommenderNames,
        contactCount: uniqueKnownContacts,
        overlapCount,
        inviteOwners: Array.from(new Set(companyRecommendations.map((recommendation) => recommendation.invite_owner))),
        primaryContacts: companyContacts.filter((contact) => contact.is_primary).slice(0, 3),
        acceptedTerms: companyAcceptances,
      };
    });
    const clientSummaries = summaries.filter((company) =>
      company.relationship_stage === "CLIENT" ||
      company.userCount > 0 ||
      company.opportunityCount > 0 ||
      company.acceptedTerms.length > 0,
    );

    return (clientSummaries.length ? clientSummaries : summaries)
      .sort((left, right) => right.opportunityCount - left.opportunityCount || left.name.localeCompare(right.name));
  }, [acceptancesQuery.data, companiesQuery.data, contactsQuery.data, opportunitiesQuery.data, profilesQuery.data, recommendationsQuery.data]);

  const isLoading =
    companiesQuery.isLoading ||
    profilesQuery.isLoading ||
    opportunitiesQuery.isLoading ||
    recommendationsQuery.isLoading ||
    acceptancesQuery.isLoading ||
    contactsQuery.isLoading;
  const hasError =
    companiesQuery.isError ||
    profilesQuery.isError ||
    opportunitiesQuery.isError ||
    recommendationsQuery.isError ||
    acceptancesQuery.isError ||
    contactsQuery.isError;
  const filteredCompanies = useMemo(() => {
    return companySummaries.filter((company) => {
      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "ACTIVE_CLIENT" && company.relationship_stage === "CLIENT") ||
        (typeFilter === "HAS_OPPORTUNITIES" && company.opportunityCount > 0) ||
        (typeFilter === "BUM_CONNECTED" && company.recommenderNames.length > 0) ||
        (typeFilter === "INACTIVE" && company.relationship_stage === "INACTIVE");

      const matchesQuery = [
        company.name,
        company.primaryEmail,
        company.recommenderNames.join(" "),
        company.primaryContacts.map((contact) => contact.full_name).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [companySummaries, query, typeFilter]);

  return (
    <div>
      <PageHeader title="Clients" description="Manage companies, prospect overlap, and who owns the path into each account.">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Client</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Add client company</DialogTitle>
              <DialogDescription>Create a live client company record in Supabase.</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                createClientMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="new-client-name">Company Name</Label>
                <Input id="new-client-name" value={newClientName} onChange={(event) => setNewClientName(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-client-website">Website</Label>
                <Input id="new-client-website" value={newClientWebsite} onChange={(event) => setNewClientWebsite(event.target.value)} placeholder="https://company.com" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createClientMutation.isPending || !newClientName.trim()}>
                  {createClientMutation.isPending ? "Creating..." : "Create Client"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(240px,0.8fr)] mb-6">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients, emails, Bums, or contacts…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
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
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Loading live client companies...
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && hasError ? (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">
              Unable to load client companies from Supabase.
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !hasError ? filteredCompanies.map((company) => {
          return (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
                      {company.name[0]}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{company.name}</p>
                          <StatusBadge label={company.relationship_stage} variant={stageVariant(company.relationship_stage)} />
                          {company.linkedin_company_url ? (
                            <Badge variant="outline" className="inline-flex items-center gap-1">
                              <Link2 className="h-3 w-3" /> LinkedIn keyed
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {company.userCount} user{company.userCount === 1 ? "" : "s"} · Primary: {company.primaryEmail}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last login: {company.latestUserLoginAt ? formatDateTimeForTimeZone(company.latestUserLoginAt, timeZone) : "Never recorded"}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-wrap text-xs">
                        {company.inviteOwners.includes("BUM") ? <Badge variant="secondary">Bum-led path</Badge> : null}
                        {company.inviteOwners.includes("TRUSTED_BUMS") ? <Badge variant="secondary">Trusted Bums invite</Badge> : null}
                        {!company.inviteOwners.length ? <Badge variant="outline">No prospect recommendations yet</Badge> : null}
                      </div>

                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <p className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Recommended by {company.recommenderNames.length ? company.recommenderNames.join(", ") : "nobody yet"}
                        </p>
                        <p>
                          {company.contactCount} known contact{company.contactCount === 1 ? "" : "s"}
                          {company.overlapCount > 0 ? ` · ${company.overlapCount} overlapping Bum connection${company.overlapCount === 1 ? "" : "s"}` : ""}
                        </p>
                        {company.primaryContacts.length ? (
                          <p>
                            Key contacts:{" "}
                            {company.primaryContacts
                              .map((contact) => [contact.full_name, contact.title].filter(Boolean).join(" · "))
                              .join(", ")}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {company.users.length ? (
                            company.users.map((profile) => (
                              <Badge key={profile.id} variant="outline">
                                {(profile.full_name ?? profile.email ?? profile.id)} · {profile.last_sign_in_at ? formatDateForTimeZone(profile.last_sign_in_at, timeZone) : "Never"}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">No user profiles recorded</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {company.acceptedTerms.length ? (
                            company.acceptedTerms.map((terms) => (
                              <Badge key={`${terms.version}-${terms.acceptedAt}-${terms.acceptedBy}`} variant="outline">
                                {terms.version} by {terms.acceptedBy} on {formatDateForTimeZone(terms.acceptedAt, timeZone)}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">No accepted terms recorded</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold font-display">{company.opportunityCount}</p>
                      <p className="text-xs text-muted-foreground">Opportunities</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-display">{company.introCount}</p>
                      <p className="text-xs text-muted-foreground">Accepted</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-display">{company.recommenderNames.length}</p>
                      <p className="text-xs text-muted-foreground">Bums Connected</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }) : null}
        {!isLoading && !hasError && !filteredCompanies.length && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              {companySummaries.length ? "No clients match your current filters." : "No live client companies are available yet."}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
