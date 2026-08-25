import { useContext } from "react";

import { AuthContext } from "./AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  // Require auth consumers to be rendered inside AuthProvider.
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};