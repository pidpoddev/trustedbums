import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveTermsVersion, getCurrentTermsAcceptance, getTermsVersionByVersion } from "@/lib/portalApi";
import { BUM_FALLBACK_TERMS_VERSION, BUM_TERMS_VERSION } from "@/data/partnerTerms";

export function useCurrentTermsState() {
  const { user } = useAuth();
  const isBum = user?.role === "BUM";

  const termsQuery = useQuery({
    queryKey: ["current-terms-version", user?.role],
    queryFn: () =>
      isBum
        ? getTermsVersionByVersion(BUM_TERMS_VERSION, BUM_FALLBACK_TERMS_VERSION)
        : getActiveTermsVersion(),
    enabled: Boolean(user?.role),
  });

  const acceptanceQuery = useQuery({
    queryKey: ["terms-acceptance", user?.id, user?.clientId, termsQuery.data?.id],
    queryFn: () => getCurrentTermsAcceptance(user!.id, user?.clientId, termsQuery.data!.id),
    enabled: Boolean(user?.id && termsQuery.data?.id),
    retry: false,
  });

  return {
    terms: termsQuery.data,
    acceptance: acceptanceQuery.data,
    hasAcceptedCurrentTerms: Boolean(acceptanceQuery.data),
    isLoading: termsQuery.isLoading || acceptanceQuery.isLoading,
    error: termsQuery.error ?? acceptanceQuery.error,
    refetch: async () => {
      await termsQuery.refetch();
      await acceptanceQuery.refetch();
    },
  };
}
