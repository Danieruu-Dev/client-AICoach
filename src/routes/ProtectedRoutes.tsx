import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProviderContext";

/**
 * Protects routes that require authentication. If not authenticated,
 * sends the user to the Keycloak login page and returns them here afterwards.
 */
function ProtectedRoutes() {
  const auth = useAuth();
  const location = useLocation();
  const isAuthenticated = auth?.isAuthenticated ?? false;

  useEffect(() => {
    if (!isAuthenticated) {
      auth?.login(location.pathname + location.search);
    }
  }, [auth, isAuthenticated, location.pathname, location.search]);

  return isAuthenticated ? <Outlet /> : <div>Redirecting to login...</div>;
}

/**
 * PublicRoute prevents authenticated users from accessing public pages
 * like the login/register pages by redirecting them to the dashboard.
 */
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <>{children}</>
  );
}

export default ProtectedRoutes;
