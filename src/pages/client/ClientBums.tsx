import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import { BumProfileCard } from "@/components/BumProfileCard";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listVisibleBumProfiles } from "@/lib/portalApi";

function searchableText(values: Array<string | null | undefined>) {
  return values.filter(Boolean).join(" ").toLowerCase();
}

type BumDirectoryTypeFilter =
  | "ALL"
  | "VERIFIED"
  | "REVIEWED_OR_BETTER"
  | "HAS_RELATIONSHIPS"
  | "HAS_CLIENT_HISTORY";

const bumDirectoryTypeFilters: { value: BumDirectoryTypeFilter; label: string }[] = [
  { value: "ALL", label: "All profiles" },
  { value: "VERIFIED", label: "Verified only" },
  { value: "REVIEWED_OR_BETTER", label: "Reviewed or verified" },
  { value: "HAS_RELATIONSHIPS", label: "Has relationship companies" },
  { value: "HAS_CLIENT_HISTORY", label: "Has worked-with companies" },
];

export default function ClientBums() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<BumDirectoryTypeFilter>("ALL");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const bumProfilesQuery = useQuery({
    queryKey: ["client-visible-bum-profiles"],
    queryFn: listVisibleBumProfiles,
  });

  const filteredProfiles = useMemo(() => {
    const profiles = bumProfilesQuery.data ?? [];

    return profiles.filter((profile) => {
      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "VERIFIED" && profile.verification_status === "verified") ||
        (typeFilter === "REVIEWED_OR_BETTER" &&
          (profile.verification_status === "reviewed" || profile.verification_status === "verified")) ||
        (typeFilter === "HAS_RELATIONSHIPS" && profile.relationship_companies.length > 0) ||
        (typeFilter === "HAS_CLIENT_HISTORY" && profile.worked_with_companies.length > 0);

      const matchesSearch =
        !deferredSearch ||
        searchableText([
          profile.profiles?.full_name,
          profile.profiles?.email,
          profile.headline,
          profile.bio,
          profile.home_region,
          profile.industries.join(" "),
          profile.regions.join(" "),
          profile.products_sold.join(" "),
          profile.buyer_personas.join(" "),
          profile.worked_with_companies.join(" "),
          profile.relationship_companies.join(" "),
          profile.skills.join(" "),
          profile.certifications.join(" "),
        ]).includes(deferredSearch);

      return matchesType && matchesSearch;
    });
  }, [bumProfilesQuery.data, deferredSearch, typeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bum Directory"
        description="Review connector backgrounds, industries, and relationship coverage before you assign outreach."
      />

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(240px,0.8fr)]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by industry, company, buyer persona, region, or name"
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={(value: BumDirectoryTypeFilter) => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bumDirectoryTypeFilters.map((filter) => (
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

      {bumProfilesQuery.isLoading ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Loading visible Bum profiles from Supabase...
          </CardContent>
        </Card>
      ) : null}

      {bumProfilesQuery.isError ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            Unable to load the Bum directory right now.
          </CardContent>
        </Card>
      ) : null}

      {!bumProfilesQuery.isLoading && !bumProfilesQuery.isError && !filteredProfiles.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="rounded-full bg-secondary p-3">
              <Users className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-medium">
                {search.trim() || typeFilter !== "ALL" ? "No Bums matched your current filters" : "No Bum profiles are visible yet"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {search.trim() || typeFilter !== "ALL"
                  ? "Try a broader search or switch to a wider profile type."
                  : "Profiles will appear here once Bums complete their profile and choose to make it client-visible."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {filteredProfiles.map((profile) => (
          <BumProfileCard key={profile.user_id} profile={profile} />
        ))}
      </div>
    </div>
  );
}
