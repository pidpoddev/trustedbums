import { useQuery } from "@tanstack/react-query";
import { listOpportunityClaims } from "@/lib/portalApi";

export function useIntroClaims() {
  const claimsQuery = useQuery({
    queryKey: ["opportunity-claims"],
    queryFn: () => listOpportunityClaims(),
  });

  return { introClaims: claimsQuery.data ?? [], claimsQuery };
}
