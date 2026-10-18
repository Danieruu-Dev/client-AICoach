import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthProviderContext";
import { cn } from "@/lib/utils";
import {
  FileText,
  BookOpen,
  Gauge,
  Gem,
  Home,
  LogOut,
  Menu,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  ShieldCheck,
  SquareUser,
  Sparkles,
  X,
  Users,
} from "lucide-react";
import { type MouseEvent, useState } from "react";
import { useTheme } from "@/context/ThemeProviderContext";
import { Link, useLocation } from "react-router-dom";

type SideBarProps = {
  userName?: string;
  email?: string;
  avatarUrl?: string;
  pageName: string;
  showPlan?: boolean;
  onNavigateAttempt?: (path: string) => void;
};
type NavItem = {
  label: string;
  icon: typeof Home;
  active?: boolean;
  path: string;
};
const navItems: NavItem[] = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Roadmap", icon: BookOpen, path: "/roadmap" },
  // { label: "Question Bank", icon: FileText, path: "/question-bank" },
  // { label: "Profile", icon: SquareUser, path: "/profile" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const COLLAPSED_STORAGE_KEY = "sidebar-collapsed";

function SideBar({
  userName,
  email,
  avatarUrl,
  pageName,
  showPlan = false,
  onNavigateAttempt,
}: SideBarProps) {
  const { theme } = useTheme();
  const auth = useAuth();
  const location = useLocation();
  // Each page mounts its own SideBar, so the collapsed state is persisted to
  // survive navigation.
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [mobileOpenPathname, setMobileOpenPathname] = useState<string | null>(
    null,
  );
  const [avatarFailed, setAvatarFailed] = useState(false);

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
    } catch {
      // Storage may be unavailable; the toggle still works for this page.
    }
  };

  const authUserName =
    `${auth?.user?.firstName ?? ""} ${auth?.user?.lastName ?? ""}`.trim();
  const resolvedUserName = userName?.trim() || authUserName || "shadcn";
  const resolvedEmail = email?.trim() || auth?.user?.email || "m@example.com";
  const resolvedAvatarUrl =
    avatarUrl || "/src/assets/preparo_sprites/happy-checklist-preparo.png";
  const isMobileOpen = mobileOpenPathname === location.pathname;

  const resolvedTheme =
    theme === "system"
      ? typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  const brandLogo =
    resolvedTheme === "dark"
      ? "/preparo_typo_light.png"
      : "/preparo_typo_dark.png";

  const initials =
    resolvedUserName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?";

  const navItemBaseClass = cn(
    "flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/40",
    isCollapsed && "lg:justify-center lg:gap-0 lg:px-0",
  );

  const labelClass = isCollapsed ? "lg:hidden" : "lg:block";

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    setMobileOpenPathname(null);

    if (!onNavigateAttempt || path === location.pathname) return;

    event.preventDefault();
    onNavigateAttempt(path);
  };

  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed left-4 top-4 z-40 inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar px-3 py-2 text-sm font-medium text-sidebar-foreground shadow-sm transition-all duration-200 lg:hidden",
          isMobileOpen
            ? "pointer-events-none -translate-y-2 opacity-0"
            : "translate-y-0 opacity-100",
        )}
        onClick={() => setMobileOpenPathname(location.pathname)}
        aria-label="Open sidebar"
      >
        <Menu className="size-4" />
        Menu
      </button>

      <div
        className={cn(
          "fixed inset-0 z-30 bg-background/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpenPathname(null)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen w-70 flex-col border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground shadow-lg transition-[width,translate] duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:shadow-none lg:shrink-0",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <button
          type="button"
          className="absolute -right-3 top-6 z-10 hidden size-6 cursor-pointer items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/70 shadow-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/40 lg:inline-flex"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>

        <div
          className={cn(
            "flex h-10 items-center justify-between gap-2 px-1",
            isCollapsed && "lg:justify-center lg:px-0",
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <img
              src="/icon-preparo.png"
              alt="Preparo logo"
              className="size-9 max-w-none shrink-0 object-contain"
            />
            <img
              src={brandLogo}
              alt="Preparo"
              className={cn(
                "h-8 w-auto select-none object-contain",
                isCollapsed && "lg:hidden",
              )}
            />
          </div>

          <button
            type="button"
            className="inline-flex rounded-md p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
            onClick={() => setMobileOpenPathname(null)}
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        <p
          className={cn(
            "mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50",
            isCollapsed && "lg:hidden",
          )}
        >
          Menu
        </p>
        <Separator
          className={cn(
            "my-4 hidden bg-sidebar-border",
            isCollapsed && "lg:block",
          )}
        />

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  navItemBaseClass,
                  item.label === pageName
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                aria-current={item.label === pageName ? "page" : undefined}
                title={isCollapsed ? item.label : undefined}
                onClick={(event) => handleNavClick(event, item.path)}
              >
                <Icon className="size-4 shrink-0" />
                <span className={cn("truncate", labelClass)}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border pt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/40",
                  isCollapsed && "lg:justify-center lg:p-0.5",
                )}
                title={isCollapsed ? resolvedUserName : undefined}
              >
                {avatarFailed ? (
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                    aria-hidden="true"
                  >
                    {initials}
                  </span>
                ) : (
                  <img
                    src={resolvedAvatarUrl}
                    alt=""
                    className="size-9 shrink-0 rounded-full border border-sidebar-border object-cover"
                    onError={() => setAvatarFailed(true)}
                  />
                )}
                <div className={cn("min-w-0 flex-1", labelClass)}>
                  <div className="truncate text-sm font-semibold leading-tight">
                    {resolvedUserName}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-sidebar-foreground/60">
                    {resolvedEmail}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-sidebar-foreground/60",
                    isCollapsed && "lg:hidden",
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" onClick={(event) => handleNavClick(event, "/settings")}>
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => auth?.logout()}
              >
                <LogOut className="size-3.5" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}

export default SideBar;
