import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentTermsState } from "@/hooks/use-current-terms";

export function ClientTermsGate() {
  const { user } = useAuth();
  const location = useLocation();
  const { hasAcceptedCurrentTerms, isLoading, terms } = useCurrentTermsState();
  const isTermsRoute =
    location.pathname === "/client/terms" || location.pathname === "/bum/terms" || location.pathname === "/terms";

  if (!user || user.role === "ADMIN" || isTermsRoute) {
    return <Outlet />;
  }

  if (isLoading || !terms) {
    return (
      <div className="rounded-md border bg-card p-6 text-sm text-muted-foreground">
        Checking partner terms...
      </div>
    );
  }

  if (!hasAcceptedCurrentTerms) {
    const termsPath = user.role === "BUM" ? "/bum/terms" : "/client/terms";

    return <Navigate to={termsPath} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
