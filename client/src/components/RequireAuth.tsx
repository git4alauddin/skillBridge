import { Navigate } from "react-router-dom";

import type { Role } from "../types";
import { useAuth } from "../state/useAuth";

type RequireAuthProps = {
  allowedRoles?: Role[];
  children: React.ReactNode;
};

export const RequireAuth = ({ allowedRoles, children }: RequireAuthProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <main className="page-status">Loading session...</main>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
