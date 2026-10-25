/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";
import { useLocation } from "react-router-dom";
import axios from "axios";
import api from "@/api/axios";
import { wakeServers } from "@/api/wakeServers";
import { getNoSessionError, hadSession, setHadSession } from "@/api/keycloak";
import PreparoLoader from "@/components/shared/PreparoLoader";
import { Button } from "@/components/ui/button";

// The API sleeps when idle on free hosting and can take about a minute to wake.
// Past this, assume the request is lost instead of showing the loader forever.
const PROFILE_TIMEOUT_MS = 90000;

interface AuthContextType {
  isAuthenticated: boolean;
  login: (returnTo?: string) => void;
  register: () => void;
  logout: () => void;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  onboardingCompleted: boolean;
}
// "unreachable": no answer from the API (timeout or network); "failed": the API answered with an error
type ProfileError = "unreachable" | "failed";
interface LoadedProfile {
  keycloakId: string;
  user: User | null;
  error: ProfileError | null;
}
interface CurrentUserResponse {
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  onboardingCompleted: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const oidc = useOidcAuth();
  const location = useLocation();
  // What the user just clicked, so the loader can say what's happening
  const [pendingAction, setPendingAction] = useState<"login" | "register" | "logout" | null>(null);
  // App user from /api/users/me, tagged with the Keycloak `sub` it was loaded for
  const [profile, setProfile] = useState<LoadedProfile | null>(null);
  // Bumped by "Try again" to re-run the /me request
  const [profileAttempt, setProfileAttempt] = useState(0);
  // Guards against double redirects (StrictMode runs effects twice)
  const redirecting = useRef(false);

  const keycloakId = oidc.isAuthenticated ? oidc.user?.profile.sub : undefined;
  const current = keycloakId && profile?.keycloakId === keycloakId ? profile : null;
  const user = current?.user ?? null;
  const profileError = current?.error ?? null;

  useEffect(() => {
    if (!keycloakId) return;

    const controller = new AbortController();
    api
      .get<CurrentUserResponse>("/api/users/me", {
        timeout: PROFILE_TIMEOUT_MS,
        signal: controller.signal,
      })
      .then((res) => {
        if (controller.signal.aborted) return;
        setProfile({
          keycloakId,
          error: null,
          user: {
            id: res.data.publicId,
            email: res.data.email,
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            onboardingCompleted: res.data.onboardingCompleted,
          },
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Loading current user failed:", error);
        const unreachable = axios.isAxiosError(error) && !error.response;
        setProfile({ keycloakId, error: unreachable ? "unreachable" : "failed", user: null });
      });

    // Cancels a request still in flight when the user retries or logs out
    return () => controller.abort();
  }, [keycloakId, profileAttempt]);

  const retryProfile = () => {
    setProfile(null);
    setProfileAttempt((n) => n + 1);
  };

  // Same signature as useState's setter so callers like Onboarding keep working
  const setUser: React.Dispatch<React.SetStateAction<User | null>> = (action) =>
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            user: typeof action === "function" ? action(prev.user) : action,
          }
        : prev,
    );

  // A failed quiet session check isn't an error: the user is just logged out
  const sessionGone = !!getNoSessionError(oidc.error);
  const oidcError = sessionGone ? undefined : oidc.error;

  // Browser reopened after a login: the tokens are gone, so ask Keycloak whether
  // its session is still alive (prompt=none never shows the login page)
  const shouldCheckSession =
    !oidc.isLoading &&
    !oidc.isAuthenticated &&
    !oidc.error &&
    location.pathname !== "/auth/callback" &&
    hadSession();

  useEffect(() => {
    if (oidc.isAuthenticated) setHadSession(true);
  }, [oidc.isAuthenticated]);

  useEffect(() => {
    if (!sessionGone) return;
    setHadSession(false);
    // Let a protected page start the normal login after the failed check
    redirecting.current = false;
  }, [sessionGone]);

  useEffect(() => {
    if (!shouldCheckSession || redirecting.current) return;
    redirecting.current = true;
    oidc.signinRedirect({
      prompt: "none",
      state: { returnTo: location.pathname + location.search },
    });
  }, [shouldCheckSession, oidc, location.pathname, location.search]);

  const isAuthenticated = !!user;
  const isLoading = oidc.isLoading || (!!keycloakId && !current) || shouldCheckSession;

  // Lets the Keycloak login theme match the app's light/dark mode
  const themeParams = () => ({
    kc_theme_mode: document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  });

  const login = (returnTo = "/dashboard") => {
    if (redirecting.current) return;
    redirecting.current = true;
    // No-op if the app already pinged on load; covers a tab left open past the sleep timer
    wakeServers();
    setPendingAction("login");
    oidc.signinRedirect({
      state: { returnTo },
      extraQueryParams: themeParams(),
    });
  };

  const register = () => {
    if (redirecting.current) return;
    redirecting.current = true;
    setPendingAction("register");
    wakeServers();
    // prompt=create opens Keycloak's registration page instead of the login page
    oidc.signinRedirect({
      prompt: "create",
      state: { returnTo: "/dashboard" },
      extraQueryParams: themeParams(),
    });
  };

  const logout = () => {
    setPendingAction("logout");
    setProfile(null);
    setHadSession(false);
    oidc.signoutRedirect();
  };

  const loadingMessage = () => {
    if (pendingAction === "logout" || oidc.activeNavigator === "signoutRedirect") {
      return "Logging you out...";
    }
    if (pendingAction === "register") return "Taking you to sign up...";
    if (pendingAction === "login") return "Taking you to sign in...";
    // A redirect nobody clicked is the quiet session check
    if (shouldCheckSession || oidc.activeNavigator === "signinRedirect") {
      return "Loading your account...";
    }
    // Keycloak just sent the user back after logging in
    if (location.pathname === "/auth/callback") return "Signing you in...";
    // Returning visitor with a saved session
    if (keycloakId) return "Loading your account...";
    return "Loading Preparo...";
  };

  // An error wins so a failed redirect doesn't leave the loader up forever
  if ((isLoading || pendingAction === "logout") && !oidcError) {
    // Only the /me request can be retried in place; Keycloak redirects can't
    const loadingProfile = !oidc.isLoading && !pendingAction && !shouldCheckSession;
    return (
      <PreparoLoader
        // Remount on retry so the slow/retry hints start over
        key={profileAttempt}
        message={loadingMessage()}
        onRetry={loadingProfile ? retryProfile : undefined}
      />
    );
  }

  // Without this, a failed login or /me call would bounce between the app and Keycloak forever
  if (oidcError || profileError) {
    const message =
      !oidcError && profileError === "unreachable"
        ? "Preparo's server isn't responding. It may still be waking up, so give it a moment and try again."
        : "We couldn't sign you in. Please try again.";
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="max-w-sm">{message}</p>
        <div className="flex gap-2">
          {/* A failed /me call is retried in place so the user keeps the page they were going to */}
          <Button onClick={oidcError ? () => window.location.assign("/") : retryProfile}>
            Try again
          </Button>
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, register, logout, user, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
