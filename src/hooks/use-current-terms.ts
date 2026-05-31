import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getRequiredTermsForUser, hasTermsSessionDeferral } from "@/lib/portalApi";

export function useCurrentTermsState() {
  const { user } = useAuth();

  const requiredTermsQuery = useQuery({
    queryKey: ["required-terms", user?.id, user?.clientId, user?.role],
    queryFn: () => getRequiredTermsForUser(user!),
    enabled: Boolean(user?.id && user?.role),
    retry: false,
  });
  const terms = requiredTermsQuery.data?.terms;
  const hasCurrentSessionDeferral = Boolean(user && terms && hasTermsSessionDeferral(user, terms.id));
  const hasAcceptedCurrentTerms = Boolean(requiredTermsQuery.data?.acceptance && !requiredTermsQuery.data?.assignment);

  return {
    terms,
    acceptance: requiredTermsQuery.data?.acceptance,
    requiredAssignment: requiredTermsQuery.data?.assignment ?? null,
    deferral: requiredTermsQuery.data?.deferral,
    hasCurrentSessionDeferral,
    canDeferCurrentTerms: Boolean(requiredTermsQuery.data?.deferral?.canDefer && !hasCurrentSessionDeferral),
    hasAcceptedCurrentTerms,
    canContinueWithCurrentTerms: hasAcceptedCurrentTerms || hasCurrentSessionDeferral,
    isLoading: requiredTermsQuery.isLoading,
    error: requiredTermsQuery.error,
    refetch: async () => {
      await requiredTermsQuery.refetch();
    },
  };
}
