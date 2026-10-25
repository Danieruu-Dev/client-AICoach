import { Navigate } from "react-router-dom";
import { useAuth as useOidcAuth } from "react-oidc-context";
import { useAuth } from "../context/AuthProviderContext";
import { getNoSessionError } from "../api/keycloak";

/**
 * Keycloak redirects here after login. The token exchange is already done
 * by the time this renders, so we only send the user where they were going.
 */
function AuthCallback() {
  const auth = useAuth();
  const oidc = useOidcAuth();

  // The quiet session check found no session: go back to the page the user opened.
  // A protected page then sends them to the normal login.
  const noSession = getNoSessionError(oidc.error);
  if (noSession) return <Navigate to={noSession.state?.returnTo ?? "/"} replace />;

  if (!auth?.isAuthenticated) return <Navigate to="/" replace />;

  const returnTo = (oidc.user?.state as { returnTo?: string } | undefined)
    ?.returnTo;

  return <Navigate to={returnTo ?? "/dashboard"} replace />;
}

export default AuthCallback;
