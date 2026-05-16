import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveTermsVersion, getCurrentTermsAcceptance } from "@/lib/portalApi";
import { BUM_FALLBACK_TERMS_VERSION, getBumTermsAcceptanceStorageKey } from "@/data/partnerTerms";

export function useCurrentTermsState() {
  const { user } = useAuth();
  const [hasAcceptedBumTerms, setHasAcceptedBumTerms] = useState(false);
  const isBum = user?.role === "BUM";

  const termsQuery = useQuery({
    queryKey: ["active-terms-version"],
    queryFn: getActiveTermsVersion,
    enabled: !isBum,
  });

  const acceptanceQuery = useQuery({
    queryKey: ["terms-acceptance", user?.id, user?.clientId, termsQuery.data?.id],
    queryFn: () => getCurrentTermsAcceptance(user!.id, user?.clientId, termsQuery.data!.id),
    enabled: Boolean(user?.id && termsQuery.data?.id && !isBum),
    retry: false,
  });

  const terms = useMemo(
    () => (isBum ? BUM_FALLBACK_TERMS_VERSION : termsQuery.data),
    [isBum, termsQuery.data],
  );

  useEffect(() => {
    if (!isBum || !user?.id) {
      setHasAcceptedBumTerms(false);
      return;
    }

    const key = getBumTermsAcceptanceStorageKey(user.id, BUM_FALLBACK_TERMS_VERSION.version);
    setHasAcceptedBumTerms(window.localStorage.getItem(key) === "true");
  }, [isBum, user?.id]);

  return {
    terms,
    acceptance: acceptanceQuery.data,
    hasAcceptedCurrentTerms: isBum ? hasAcceptedBumTerms : Boolean(acceptanceQuery.data),
    isLoading: isBum ? false : termsQuery.isLoading || acceptanceQuery.isLoading,
    error: termsQuery.error ?? acceptanceQuery.error,
    refetch: async () => {
      if (isBum && user?.id) {
        const key = getBumTermsAcceptanceStorageKey(user.id, BUM_FALLBACK_TERMS_VERSION.version);
        setHasAcceptedBumTerms(window.localStorage.getItem(key) === "true");
        return;
      }

      await termsQuery.refetch();
      await acceptanceQuery.refetch();
    },
  };
}
