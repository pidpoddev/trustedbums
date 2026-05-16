import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { BUM_TERMS_VERSION } from "@/data/partnerTerms";
import { listProfiles, listTermsAcceptances, listTermsVersions } from "@/lib/portalApi";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString();
}

export default function AdminBums() {
  const profilesQuery = useQuery({ queryKey: ["admin-profiles"], queryFn: listProfiles });
  const termsVersionsQuery = useQuery({ queryKey: ["admin-terms-versions"], queryFn: listTermsVersions });
  const acceptancesQuery = useQuery({ queryKey: ["admin-terms-acceptances"], queryFn: listTermsAcceptances });

  const bumSummaries = useMemo(() => {
    const bumTermsId = (termsVersionsQuery.data ?? []).find((terms) => terms.version === BUM_TERMS_VERSION)?.id;
    const acceptedUserIds = new Set(
      (acceptancesQuery.data ?? [])
        .filter((acceptance) => acceptance.terms_version_id === bumTermsId)
        .map((acceptance) => acceptance.user_id),
    );

    return (profilesQuery.data ?? [])
      .filter((profile) => profile.role === "BUM")
      .map((profile) => ({
        ...profile,
        hasAcceptedAgreement: bumTermsId ? acceptedUserIds.has(profile.id) : false,
      }))
      .sort((left, right) => (left.email ?? left.id).localeCompare(right.email ?? right.id));
  }, [acceptancesQuery.data, profilesQuery.data, termsVersionsQuery.data]);

  const isLoading = profilesQuery.isLoading || termsVersionsQuery.isLoading || acceptancesQuery.isLoading;
  const hasError = profilesQuery.isError || termsVersionsQuery.isError || acceptancesQuery.isError;

  return (
    <div>
      <PageHeader title="Bums" description="Manage synced connector accounts and agreement status">
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
          <Card key={bum.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center font-display font-bold text-accent-foreground">
                    {(bum.full_name ?? bum.email ?? "B").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{bum.full_name || bum.email || bum.id}</p>
                    <p className="text-sm text-muted-foreground">{bum.email || bum.id}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Synced {formatDate(bum.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold font-display">{bum.hasAcceptedAgreement ? "Yes" : "No"}</p>
                    <p className="text-xs text-muted-foreground">Agreement</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-display">Live</p>
                    <p className="text-xs text-muted-foreground">Profile</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge
                      label={bum.hasAcceptedAgreement ? "Active" : "Pending Agreement"}
                      variant={bum.hasAcceptedAgreement ? "success" : "warning"}
                    />
                    <StatusBadge
                      label="No payout data yet"
                      variant="secondary"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : null}
      </div>
    </div>
  );
}
