import { useSession } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getRequiredTermsForUser, hasTermsSessionDeferral } from "@/lib/portalApi";

export function useCurrentTermsState() {
  const { user } = useAuth();
  const { session } = useSession();

  const requiredTermsQuery = useQuery({
    queryKey: ["required-terms", user?.id, user?.clientId, user?.role],
    queryFn: () => getRequiredTermsForUser(user!),
    enabled: Boolean(user?.id && user?.role),
    retry: false,
  });
  const terms = requiredTermsQuery.data?.terms;
  const deferral = requiredTermsQuery.data?.deferral;
  const hasCurrentSessionDeferral = Boolean(user && terms && hasTermsSessionDeferral(user, terms.id, session?.id));
  const hasAcceptedCurrentTerms = Boolean(requiredTermsQuery.data?.acceptance && !requiredTermsQuery.data?.assignment);
  const hasVerifiedSessionDeferral = Boolean(
    hasCurrentSessionDeferral &&
      !requiredTermsQuery.data?.acceptance &&
      !requiredTermsQuery.data?.assignment &&
      deferral?.priorAcceptance &&
      deferral.used > 0,
  );

  return {
    terms,
    acceptance: requiredTermsQuery.data?.acceptance,
    requiredAssignment: requiredTermsQuery.data?.assignment ?? null,
    deferral,
    hasCurrentSessionDeferral,
    hasVerifiedSessionDeferral,
    canDeferCurrentTerms: Boolean(requiredTermsQuery.data?.deferral?.canDefer && !hasCurrentSessionDeferral),
    hasAcceptedCurrentTerms,
    canContinueWithCurrentTerms: hasAcceptedCurrentTerms || hasVerifiedSessionDeferral,
    isLoading: requiredTermsQuery.isLoading,
    error: requiredTermsQuery.error,
    refetch: async () => {
      await requiredTermsQuery.refetch();
    },
  };
}
