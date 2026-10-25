import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL;
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM;
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

// Keycloak's own account console: password, email, active sessions
export const KEYCLOAK_ACCOUNT_URL = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/account`;

// Authorization Code + PKCE against the public Keycloak client.
// Tokens are refreshed automatically with the refresh token before they expire.
export const userManager = new UserManager({
  authority: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`,
  client_id: KEYCLOAK_CLIENT_ID,
  redirect_uri: `${window.location.origin}/auth/callback`,
  post_logout_redirect_uri: `${window.location.origin}/`,
  scope: "openid profile email",
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
});

// Removes ?code=...&state=... from the URL after Keycloak redirects back
export const onSigninCallback = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

// Tokens live in sessionStorage, so they're gone once the tab or browser closes,
// even though Keycloak's own session (its cookie) may still be valid.
// This flag remembers that the browser had a login, so the app knows to ask Keycloak
// on startup. It holds no token, just "1". Visitors who never logged in skip that
// round trip, so they don't wait on a sleeping Keycloak.
const HAD_SESSION_KEY = "preparo:hadSession";

export const hadSession = () => {
  try {
    return localStorage.getItem(HAD_SESSION_KEY) === "1";
  } catch {
    return false;
  }
};

export const setHadSession = (value: boolean) => {
  try {
    if (value) localStorage.setItem(HAD_SESSION_KEY, "1");
    else localStorage.removeItem(HAD_SESSION_KEY);
  } catch {
    // Storage blocked: the user just logs in by hand next time
  }
};

// Keycloak's answer to a prompt=none check when there's no session left
export const getNoSessionError = (error: { innerError?: unknown } | undefined) => {
  const inner = error?.innerError as
    | { error?: string; state?: { returnTo?: string } }
    | undefined;
  return inner?.error === "login_required" ? inner : undefined;
};
