import { Button } from "@/components/ui/button";
import { ArrowRight, type LucideIcon } from "lucide-react";

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
    <section className="p-5 sm:p-6" aria-labelledby="recent-activity-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="recent-activity-heading" className="text-sm font-semibold">
            Recent activity
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Your latest preparation updates
          </p>
        </div>
        <Button variant="ghost" size="lg" className="text-muted-foreground">
          View all
          <ArrowRight />
        </Button>
      </div>
      <ol className="mt-5">
        {recentActivity.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.title}
              className="relative flex items-start gap-3 pb-5 last:pb-0 not-last:before:absolute not-last:before:bottom-0 not-last:before:left-4 not-last:before:top-8 not-last:before:w-px not-last:before:bg-border"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-card text-muted-foreground">
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <span className="shrink-0 pt-1 text-xs text-muted-foreground">
                {item.time}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default RecentActivitySection;
