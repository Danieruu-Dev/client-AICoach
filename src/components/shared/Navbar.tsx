import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ModeToggle from "../mode-toggle";
import { useAuth } from "@/context/AuthProviderContext";

// Sections on the landing page; add Pricing/Resources here once those pages exist
const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
];

export default function Navbar() {
  const auth = useAuth();
  const isSignedIn = auth?.isAuthenticated ?? false;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="Preparo home">
          <img src="/icon-preparo.png" alt="" className="h-8 w-11" />
          <img src="/preparo_typo_dark.png" alt="Preparo" className="h-9 dark:hidden" />
          <img src="/preparo_typo_light.png" alt="Preparo" className="hidden h-9 dark:block" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <ModeToggle />
          {/* Login and register go straight to Keycloak; signed-in users get a way back into the app instead */}
          {isSignedIn ? (
            <Button asChild className="h-9 rounded-[6px] px-4 text-sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden h-9 rounded-[6px] px-3 text-sm sm:inline-flex"
                onClick={() => auth?.login()}
              >
                Log in
              </Button>
              <Button
                className="h-9 rounded-[6px] px-4 text-sm"
                onClick={() => auth?.register()}
              >
                Get started
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="md:hidden" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <a href={link.href}>{link.label}</a>
                </DropdownMenuItem>
              ))}
              {!isSignedIn && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => auth?.login()}>Log in</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
