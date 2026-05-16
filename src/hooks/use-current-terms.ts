import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveTermsVersion, getCurrentTermsAcceptance } from "@/lib/portalApi";

export function useCurrentTermsState() {
  const { user } = useAuth();

  const termsQuery = useQuery({
    queryKey: ["active-terms-version"],
    queryFn: getActiveTermsVersion,
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
