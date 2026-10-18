import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProviderContext";

/**
 * Protects routes that require authentication. If not authenticated,
 * sends the user to the Keycloak login page and returns them here afterwards.
 * Users who haven't finished onboarding are kept on /onboarding until they do.
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

  if (!isAuthenticated) return <div>Redirecting to login...</div>;

  if (!auth?.user?.onboardingCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;
