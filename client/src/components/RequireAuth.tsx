import { Navigate } from "react-router-dom";

import { useAuth } from "../state/useAuth";

type RequireAuthProps = {
  children: React.ReactNode;
};

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <main className="page-status">Loading session...</main>;
  }

  return user ? children : <Navigate to="/auth" replace />;
};