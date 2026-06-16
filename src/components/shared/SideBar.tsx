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
  Gauge,
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
  { label: "Interviews", icon: Users, path: "/interviews" },
  { label: "Question Bank", icon: FileText, path: "/question-bank" },
  { label: "AI Feedback", icon: Sparkles, path: "/ai-feedback" },
  { label: "Performance", icon: Gauge, path: "/performance" },
  { label: "Resume", icon: FileText, path: "/resume" },
  { label: "Skill Gap", icon: ShieldCheck, path: "/skill-gap" },
  { label: "Profile", icon: SquareUser, path: "/profile" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

function SideBar({
  userName,
  email,
  avatarUrl,
  pageName,
  onNavigateAttempt,
}: SideBarProps) {
  const { theme } = useTheme();
  const auth = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpenPathname, setMobileOpenPathname] = useState<string | null>(
    null,
  );

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

  const navItemBaseClass = cn(
    "flex items-center gap-3 rounded-sm px-4 py-3 text-left text-[13px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-sidebar-ring/30",
    isCollapsed && "lg:justify-center lg:gap-0 lg:px-2",
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
          "fixed inset-y-0 left-0 z-40 flex h-screen w-70 flex-col border-r border-sidebar-border bg-sidebar px-3 py-3 text-sidebar-foreground shadow-lg transition-all duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:shadow-none lg:shrink-0",
          isCollapsed ? "lg:w-20 lg:px-2" : "lg:w-70",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between gap-3 px-1 relative">
          <div
            className={cn(
              "flex items-start gap-3 transition-all duration-200",
              isCollapsed && "lg:flex-col lg:items-center lg:gap-2 relative",
            )}
          >
            <img
              src="/icon-preparo.png"
              alt="Preparo logo"
              className={cn(
                "h-10 w-10 rounded-xl object-contain shrink-0 max-w-none",
                isCollapsed &&
                  "absolute left-0 top-4 -translate-x-1/2 lg:static lg:translate-x-0",
              )}
            />
            <img
              src={brandLogo}
              alt="Preparo"
              className={cn(
                "h-10 w-auto select-none object-contain transition-all duration-200",
                isCollapsed && "lg:hidden",
              )}
            />
          </div>

          <button
            type="button"
            className={cn(
              "hidden rounded-md p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:inline-flex bg-sidebar cursor-pointer",
              isCollapsed && "border border-sidebar-border ",
            )}
            onClick={() => setIsCollapsed((value) => !value)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>

          <button
            type="button"
            className="inline-flex rounded-md p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
            onClick={() => setMobileOpenPathname(null)}
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        <Separator className="mt-1 mb-4 bg-sidebar-border" />

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  navItemBaseClass,
                  item.label === pageName
                    ? "bg-primary text-sidebar-primary-foreground shadow-none"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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

        <div className="pt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-sm px-3 py-3 text-left text-sidebar-accent-foreground shadow-none transition-colors hover:bg-sidebar-accent/80",
                  isCollapsed && "lg:justify-center lg:px-2",
                )}
              >
                <img
                  src={resolvedAvatarUrl}
                  alt={resolvedUserName}
                  className="h-11 w-11 rounded-xl border border-sidebar-border object-cover"
                />
                <div className={cn("min-w-0 flex-1", labelClass)}>
                  <div className="truncate text-[15px] font-semibold leading-tight">
                    {resolvedUserName}
                  </div>
                  <div className="truncate text-[13px] text-sidebar-foreground/70">
                    {resolvedEmail}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 text-sidebar-foreground/70",
                    isCollapsed && "lg:hidden",
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
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
