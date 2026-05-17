import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { BumProfileCard } from "@/components/BumProfileCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BUM_TERMS_VERSION } from "@/data/partnerTerms";
import { listAdminBumProfiles, listProfiles, listTermsAcceptances, listTermsVersions } from "@/lib/portalApi";

type BumTypeFilter = "ALL" | "VISIBLE_TO_CLIENTS" | "AGREEMENT_ACCEPTED" | "PROFILE_READY" | "HIDDEN";

const bumTypeFilters: { value: BumTypeFilter; label: string }[] = [
  { value: "ALL", label: "All Bum types" },
  { value: "VISIBLE_TO_CLIENTS", label: "Visible to clients" },
  { value: "AGREEMENT_ACCEPTED", label: "Agreement accepted" },
  { value: "PROFILE_READY", label: "Profile ready" },
  { value: "HIDDEN", label: "Hidden from clients" },
];

export default function AdminBums() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<BumTypeFilter>("ALL");
  const bumProfilesQuery = useQuery({ queryKey: ["admin-bum-profiles"], queryFn: listAdminBumProfiles });
  const profilesQuery = useQuery({ queryKey: ["admin-profiles"], queryFn: listProfiles });
  const termsVersionsQuery = useQuery({ queryKey: ["admin-terms-versions"], queryFn: listTermsVersions });
  const acceptancesQuery = useQuery({ queryKey: ["admin-terms-acceptances"], queryFn: listTermsAcceptances });

  const bumSummaries = useMemo(() => {
    const bumTermsId = (termsVersionsQuery.data ?? []).find((terms) => terms.version === BUM_TERMS_VERSION)?.id;
    const bumProfilesByUserId = new Map((bumProfilesQuery.data ?? []).map((profile) => [profile.user_id, profile]));
    const profilesById = new Map((profilesQuery.data ?? []).map((profile) => [profile.id, profile]));
    const acceptedTermsByUserId = new Map<
      string,
      Array<{
        version: string;
        title: string;
        acceptedAt: string;
      }>
    >();

    for (const acceptance of acceptancesQuery.data ?? []) {
      const current = acceptedTermsByUserId.get(acceptance.user_id) ?? [];
      current.push({
        version: acceptance.terms_versions?.version ?? acceptance.terms_version_id,
        title: acceptance.terms_versions?.title ?? "Terms",
        acceptedAt: acceptance.accepted_at,
      });
      acceptedTermsByUserId.set(acceptance.user_id, current);
    }

    const acceptedUserIds = new Set(
      (acceptancesQuery.data ?? [])
        .filter((acceptance) => acceptance.terms_version_id === bumTermsId)
        .map((acceptance) => acceptance.user_id),
    );

    return (profilesQuery.data ?? [])
      .filter((profile) => profile.role === "BUM")
      .map((profile) => {
        const bumProfile = bumProfilesByUserId.get(profile.id);
        const hasAcceptedAgreement = bumTermsId ? acceptedUserIds.has(profile.id) : false;

        if (bumProfile) {
          return {
            ...bumProfile,
            hasAcceptedAgreement,
            acceptedTerms: acceptedTermsByUserId.get(profile.id) ?? [],
            profiles: bumProfile.profiles ?? {
              full_name: profilesById.get(profile.id)?.full_name ?? profile.full_name,
              email: profilesById.get(profile.id)?.email ?? profile.email,
              created_at: profilesById.get(profile.id)?.created_at ?? profile.created_at,
            },
          };
        }

        return {
          user_id: profile.id,
          profiles: {
            full_name: profile.full_name,
            email: profile.email,
            created_at: profile.created_at,
          },
          hasAcceptedAgreement,
          acceptedTerms: acceptedTermsByUserId.get(profile.id) ?? [],
          is_visible_to_clients: false,
        };
      })
      .sort((left, right) =>
        (left.profiles?.full_name ?? left.profiles?.email ?? left.user_id).localeCompare(
          right.profiles?.full_name ?? right.profiles?.email ?? right.user_id,
        ),
      );
  }, [acceptancesQuery.data, bumProfilesQuery.data, profilesQuery.data, termsVersionsQuery.data]);

  const isLoading =
    bumProfilesQuery.isLoading || profilesQuery.isLoading || termsVersionsQuery.isLoading || acceptancesQuery.isLoading;
  const hasError =
    bumProfilesQuery.isError || profilesQuery.isError || termsVersionsQuery.isError || acceptancesQuery.isError;
  const filteredBums = useMemo(() => {
    return bumSummaries.filter((bum) => {
      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "VISIBLE_TO_CLIENTS" && Boolean(bum.is_visible_to_clients)) ||
        (typeFilter === "AGREEMENT_ACCEPTED" && Boolean(bum.hasAcceptedAgreement)) ||
        (typeFilter === "PROFILE_READY" &&
          Boolean(
            bum.headline ||
              bum.bio ||
              bum.industries?.length ||
              bum.relationship_companies?.length ||
              bum.worked_with_companies?.length,
          )) ||
        (typeFilter === "HIDDEN" && !bum.is_visible_to_clients);

      const matchesQuery = [
        bum.profiles?.full_name,
        bum.profiles?.email,
        bum.headline,
        bum.bio,
        ...(bum.industries ?? []),
        ...(bum.relationship_companies ?? []),
        ...(bum.worked_with_companies ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [bumSummaries, query, typeFilter]);

  return (
    <div>
      <PageHeader title="Bums" description="Review connector background, coverage, and agreement status">
        <Button><Plus className="h-4 w-4 mr-2" /> Invite Bum</Button>
      </PageHeader>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(240px,0.8fr)] mb-6">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Bums, emails, industries, or relationship companies…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={typeFilter} onValueChange={(value: BumTypeFilter) => setTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bumTypeFilters.map((filter) => (
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
              Loading live bum accounts...
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && hasError ? (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">
              Unable to load live bum accounts from Supabase.
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !hasError && !filteredBums.length ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              {bumSummaries.length ? "No Bum profiles match your current filters." : "No synced bum users exist yet."}
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !hasError ? filteredBums.map((bum) => (
          <BumProfileCard key={bum.user_id} profile={bum} showAdminMeta />
        )) : null}
      </div>
    </div>
  );
}
