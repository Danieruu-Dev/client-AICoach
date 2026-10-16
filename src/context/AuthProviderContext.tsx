/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";
import api from "@/api/axios";

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
interface LoadedProfile {
  keycloakId: string;
  user: User | null;
  error: boolean;
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
  // App user from /api/users/me, tagged with the Keycloak `sub` it was loaded for
  const [profile, setProfile] = useState<LoadedProfile | null>(null);
  // Guards against double redirects (StrictMode runs effects twice)
  const redirecting = useRef(false);

  const keycloakId = oidc.isAuthenticated ? oidc.user?.profile.sub : undefined;
  const current = keycloakId && profile?.keycloakId === keycloakId ? profile : null;
  const user = current?.user ?? null;
  const profileError = current?.error ?? false;

  useEffect(() => {
    if (!keycloakId) return;

    let cancelled = false;
    api
      .get<CurrentUserResponse>("/api/users/me")
      .then((res) => {
        if (cancelled) return;
        setProfile({
          keycloakId,
          error: false,
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
        if (cancelled) return;
        console.error("Loading current user failed:", error);
        setProfile({ keycloakId, error: true, user: null });
      });

    return () => {
      cancelled = true;
    };
  }, [keycloakId]);

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

  const isAuthenticated = !!user;
  const isLoading = oidc.isLoading || (!!keycloakId && !current);

  // Lets the Keycloak login theme match the app's light/dark mode
  const themeParams = () => ({
    kc_theme_mode: document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  });

  const login = (returnTo = "/dashboard") => {
    if (redirecting.current) return;
    redirecting.current = true;
    oidc.signinRedirect({
      state: { returnTo },
      extraQueryParams: themeParams(),
    });
  };

  const register = () => {
    if (redirecting.current) return;
    redirecting.current = true;
    // prompt=create opens Keycloak's registration page instead of the login page
    oidc.signinRedirect({
      prompt: "create",
      state: { returnTo: "/dashboard" },
      extraQueryParams: themeParams(),
    });
  };

  const logout = () => {
    setProfile(null);
    oidc.signoutRedirect();
  };

  if (isLoading) return <div>Loading...</div>;

  // Without this, a failed login or /me call would bounce between the app and Keycloak forever
  if (oidc.error || profileError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <p>We couldn&apos;t sign you in. Please try again.</p>
        <div className="flex gap-2">
          <button className="underline" onClick={() => window.location.assign("/")}>
            Retry
          </button>
          <button className="underline" onClick={logout}>
            Log out
          </button>
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
