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
          className="flex min-w-0 flex-1 items-center gap-3 rounded-[8px] border border-border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-80"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
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
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-1.5">
        <DropdownMenuItem className="gap-3 rounded-[6px] p-3">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
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
        <DropdownMenuItem disabled className="rounded-[6px] p-3 text-xs">
          Free plan includes one roadmap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default RoadmapSwitcher;
