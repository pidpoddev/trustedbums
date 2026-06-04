import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentTermsState } from "@/hooks/use-current-terms";

export function ClientTermsGate() {
  const { user } = useAuth();
  const location = useLocation();
  const { canContinueWithCurrentTerms, isLoading, terms, error } = useCurrentTermsState();
  const isTermsRoute =
    location.pathname === "/client/terms" || location.pathname === "/bum/terms" || location.pathname === "/terms";

  if (!user || user.role === "ADMIN" || isTermsRoute) {
    return <Outlet />;
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
        Unable to check the current agreement: {error instanceof Error ? error.message : "Please try again."}
      </div>
    );
  }

  if (isLoading || !terms) {
    return (
      <div className="rounded-md border bg-card p-6 text-sm text-muted-foreground">
        Checking current agreement...
      </div>
    );
  }

  if (!canContinueWithCurrentTerms) {
    const termsPath = user.role === "BUM" ? "/bum/terms" : "/client/terms";

    return <Navigate to={termsPath} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
