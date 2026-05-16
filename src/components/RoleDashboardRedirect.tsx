import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultPathForRole } from "@/data/authData";

export function RoleDashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={getDefaultPathForRole(user.role)} replace />;
}
