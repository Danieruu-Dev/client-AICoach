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
