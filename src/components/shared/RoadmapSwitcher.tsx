import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { BookOpen, CheckCircle2, ChevronDown } from "lucide-react";

function RoadmapSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-xl border bg-card p-2 pr-3.5 text-left transition-colors hover:border-primary/30 focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/10 aria-expanded:border-primary/40 aria-expanded:ring-3 aria-expanded:ring-primary/10 sm:w-80 sm:shrink-0"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
            <BookOpen className="size-4.5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] text-muted-foreground">
              Current roadmap
            </span>
            <span className="block truncate text-sm font-semibold">
              Full Stack Developer
            </span>
          </span>
          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded:rotate-180"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl p-1.5"
      >
        <DropdownMenuItem className="gap-3 rounded-lg p-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
            <BookOpen className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              Full Stack Developer
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Active · 0% complete
            </span>
          </span>
          <CheckCircle2 className="size-4 text-primary" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="rounded-lg p-2 text-xs">
          Free plan includes one roadmap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default RoadmapSwitcher;
