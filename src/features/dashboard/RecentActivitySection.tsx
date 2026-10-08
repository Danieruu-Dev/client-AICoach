import { Button } from "@/components/ui/button";
import { Activity, type LucideIcon } from "lucide-react";

interface RecentActivityItem {
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
}

interface RecentActivitySectionProps {
  recentActivity: RecentActivityItem[];
}

function RecentActivitySection({ recentActivity }: RecentActivitySectionProps) {
  return (
    <section
      className="rounded-[8px] border border-border bg-card p-5 shadow-sm sm:p-6"
      aria-labelledby="recent-activity-heading"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="recent-activity-heading" className="text-base font-semibold">
            Recent activity
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Your latest preparation updates
          </p>
        </div>
        <Activity className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <ul className="mt-5 divide-y divide-border">
        {recentActivity.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.title}
              className="flex items-center gap-3 py-4 first:pt-0"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {item.time}
              </span>
            </li>
          );
        })}
      </ul>
      <Button
        variant="outline"
        className="mt-3 w-full rounded-[6px] shadow-none"
      >
        View all activity
      </Button>
    </section>
  );
}

export default RecentActivitySection;
