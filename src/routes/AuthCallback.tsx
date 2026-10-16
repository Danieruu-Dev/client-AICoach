import { Navigate } from "react-router-dom";
import { useAuth as useOidcAuth } from "react-oidc-context";
import { useAuth } from "../context/AuthProviderContext";

/**
 * Keycloak redirects here after login. The token exchange is already done
 * by the time this renders, so we only send the user where they were going.
 */
function AuthCallback() {
  const auth = useAuth();
  const oidc = useOidcAuth();

  if (!auth?.isAuthenticated) return <Navigate to="/" replace />;

  const returnTo = (oidc.user?.state as { returnTo?: string } | undefined)
    ?.returnTo;

  return <Navigate to={returnTo ?? "/dashboard"} replace />;
}

export default AuthCallback;
