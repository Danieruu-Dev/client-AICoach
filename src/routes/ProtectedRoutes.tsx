import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProviderContext";

/**
 * Protects routes that require authentication. If not authenticated,
 * redirects to the authentication page.
 */
function ProtectedRoutes() {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/authentication" replace />
  );
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
