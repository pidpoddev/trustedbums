import { Navigate, Outlet, useLocation } from "react-router-dom";
import { type ClientAccessRole } from "@/data/authData";
import { useAuth } from "@/contexts/AuthContext";

interface ClientAccessRouteProps {
  allowedAccessRoles: ClientAccessRole[];
}

export function ClientAccessRoute({ allowedAccessRoles }: ClientAccessRouteProps) {
  const { user, hasClientAccessRole, isLoaded } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role !== "CLIENT") {
    return <Navigate to="/dashboard" replace />;
  }

  if (!hasClientAccessRole(allowedAccessRoles)) {
    return <Navigate to="/client/dashboard" replace state={{ deniedFrom: location.pathname }} />;
  }

  return <Outlet />;
}
