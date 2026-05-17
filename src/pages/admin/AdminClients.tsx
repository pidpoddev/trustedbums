import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link2, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  listAdminProspectRecommendations,
  listCompanies,
  listOpportunityRegistrations,
  listProfiles,
  listProspectContacts,
  type CompanyRelationshipStage,
} from "@/lib/portalApi";

function stageVariant(stage: CompanyRelationshipStage) {
  if (stage === "CLIENT") {
    return "success" as const;
  }

  if (stage === "INACTIVE") {
    return "warning" as const;
  }

  return "info" as const;
}

export default function AdminClients() {
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
  const contactsQuery = useQuery({
    queryKey: ["admin-prospect-contacts"],
    queryFn: listProspectContacts,
  });

  const companySummaries = useMemo(() => {
    const profiles = profilesQuery.data ?? [];
    const opportunities = opportunitiesQuery.data ?? [];
    const recommendations = recommendationsQuery.data ?? [];
    const contacts = contactsQuery.data ?? [];

    return (companiesQuery.data ?? []).map((company) => {
      const users = profiles.filter((profile) => profile.company_id === company.id);
      const companyOpportunities = opportunities.filter((opportunity) => opportunity.company_id === company.id);
      const companyRecommendations = recommendations.filter((recommendation) => recommendation.company_id === company.id);
      const companyContacts = contacts.filter((contact) => contact.company_id === company.id);
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
        opportunityCount: companyOpportunities.length,
        introCount: companyOpportunities.filter((opportunity) => opportunity.status === "Accepted").length,
        recommenderNames,
        contactCount: uniqueKnownContacts,
        overlapCount,
        inviteOwners: Array.from(new Set(companyRecommendations.map((recommendation) => recommendation.invite_owner))),
        primaryContacts: companyContacts.filter((contact) => contact.is_primary).slice(0, 3),
      };
    });
  }, [companiesQuery.data, contactsQuery.data, opportunitiesQuery.data, profilesQuery.data, recommendationsQuery.data]);

  return (
    <div>
      <PageHeader title="Clients" description="Manage companies, prospect overlap, and who owns the path into each account.">
        <Button><Plus className="h-4 w-4 mr-2" /> Add Client</Button>
      </PageHeader>

      <div className="grid gap-4">
        {companySummaries.map((company) => {
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
        })}
        {!companySummaries.length && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No live client companies exist yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
