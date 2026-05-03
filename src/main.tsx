import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProviderContext.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { AuthProvider } from "./context/AuthProviderContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <App />
        </AuthProvider>
        <Toaster position="top-right" />
      </ThemeProvider>
    </StrictMode>
  </BrowserRouter>,
);
