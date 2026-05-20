import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getRequiredTermsForUser } from "@/lib/portalApi";

export function useCurrentTermsState() {
  const { user } = useAuth();

  const requiredTermsQuery = useQuery({
    queryKey: ["required-terms", user?.id, user?.clientId, user?.role],
    queryFn: () => getRequiredTermsForUser(user!),
    enabled: Boolean(user?.id && user?.role),
    retry: false,
  });

  return {
    terms: requiredTermsQuery.data?.terms,
    acceptance: requiredTermsQuery.data?.acceptance,
    requiredAssignment: requiredTermsQuery.data?.assignment ?? null,
    hasAcceptedCurrentTerms: Boolean(requiredTermsQuery.data?.acceptance && !requiredTermsQuery.data?.assignment),
    isLoading: requiredTermsQuery.isLoading,
    error: requiredTermsQuery.error,
    refetch: async () => {
      await requiredTermsQuery.refetch();
    },
  };
}
