import { Navigate, Outlet, useLocation } from "react-router-dom";
import { type UserRole, getDefaultPathForRole } from "@/data/authData";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, hasRole, isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isLoaded && !isSignedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate to={getDefaultPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
