import { useTheme } from "@/context/ThemeProviderContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ModeToggle from "../mode-toggle";

export default function Navbar() {
  const { theme } = useTheme();
  const isDarkTheme =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <nav className="fixed top-0 right-0 left-0 flex h-20 items-center justify-between border-b border-border bg-background px-4 text-foreground z-100">
      <div className="flex items-start gap-3">
        <div className="cursor-pointer text-primary">
          <img src="/icon-preparo.png" alt="logo" className="w-14 h-10" />
        </div>
        <div className="cursor-pointer">
          <img
            src={
              isDarkTheme ? "/preparo_typo_light.png" : "/preparo_typo_dark.png"
            }
            alt="typography title"
            className="w-37.5 h-12.25"
          />
        </div>
      </div>
      <div className="flex items-start gap-8 text-[15px] font-medium text-muted-foreground">
        <button className="cursor-pointer transition-colors hover:text-foreground">
          Features
        </button>
        <button className="cursor-pointer transition-colors hover:text-foreground">
          How it Works
        </button>
        <button className="cursor-pointer transition-colors hover:text-foreground">
          Pricing
        </button>
        <button className="cursor-pointer transition-colors hover:text-foreground">
          Resources
        </button>
      </div>
      <div className="flex items-start gap-2 text-[15px] font-medium">
        <ModeToggle />
        <Link to="/authentication">
          <Button
            variant="outline"
            className="h-10 rounded-sm border-border bg-background px-5 text-sm font-semibold text-primary shadow-none hover:bg-muted/50 cursor-pointer"
            onClick={() => localStorage.setItem("activePage", "login")}
          >
            Login
          </Button>
        </Link>
        <Link to="/authentication">
          <Button
            className="h-10 rounded-sm bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-none hover:bg-primary/90 cursor-pointer"
            onClick={() => localStorage.setItem("activePage", "register")}
          >
            Get Started
          </Button>
        </Link>
      </div>
    </nav>
  );
}
