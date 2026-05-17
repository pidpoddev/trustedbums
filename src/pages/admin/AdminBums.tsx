import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { BumProfileCard } from "@/components/BumProfileCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BUM_TERMS_VERSION } from "@/data/partnerTerms";
import { listAdminBumProfiles, listProfiles, listTermsAcceptances, listTermsVersions } from "@/lib/portalApi";

export default function AdminBums() {
  const bumProfilesQuery = useQuery({ queryKey: ["admin-bum-profiles"], queryFn: listAdminBumProfiles });
  const profilesQuery = useQuery({ queryKey: ["admin-profiles"], queryFn: listProfiles });
  const termsVersionsQuery = useQuery({ queryKey: ["admin-terms-versions"], queryFn: listTermsVersions });
  const acceptancesQuery = useQuery({ queryKey: ["admin-terms-acceptances"], queryFn: listTermsAcceptances });

  const bumSummaries = useMemo(() => {
    const bumTermsId = (termsVersionsQuery.data ?? []).find((terms) => terms.version === BUM_TERMS_VERSION)?.id;
    const bumProfilesByUserId = new Map((bumProfilesQuery.data ?? []).map((profile) => [profile.user_id, profile]));
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
              full_name: profile.full_name,
              email: profile.email,
              created_at: profile.created_at,
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

  return (
    <div>
      <PageHeader title="Bums" description="Review connector background, coverage, and agreement status">
        <Button><Plus className="h-4 w-4 mr-2" /> Invite Bum</Button>
      </PageHeader>

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

        {!isLoading && !hasError && !bumSummaries.length ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No synced bum users exist yet.
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !hasError ? bumSummaries.map((bum) => (
          <BumProfileCard key={bum.user_id} profile={bum} showAdminMeta />
        )) : null}
      </div>
    </div>
  );
}
