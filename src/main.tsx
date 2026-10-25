import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProviderContext.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { AuthProvider } from "./context/AuthProviderContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider as OidcProvider } from "react-oidc-context";
import { onSigninCallback, userManager } from "./api/keycloak.ts";
import { wakeServers } from "./api/wakeServers.ts";

// Start booting the sleeping servers before the user even clicks Login
wakeServers();

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <OidcProvider
            userManager={userManager}
            onSigninCallback={onSigninCallback}
          >
            <AuthProvider>
              <App />
            </AuthProvider>
          </OidcProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  </BrowserRouter>,
);
