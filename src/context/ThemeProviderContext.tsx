/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

const ThemeProviderContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({
  theme: "system",
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    const applied =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    root.classList.add(applied);
  }, [theme]);

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme: (t) => {
          localStorage.setItem(storageKey, t);
          setTheme(t);
        },
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeProviderContext);
