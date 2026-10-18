import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProviderContext";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  // ArrowRight,
  CirclePlay,
  Flag,
  MessageSquareText,
  RefreshCw,
  RotateCcw,
  Route,
  Send,
  Trophy,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import {
  fetchRecentActivity,
  type ActivityType,
} from "./api/activityApi";

const RECENT_ACTIVITY_LIMIT = 5;

const activityIcons: Record<ActivityType, LucideIcon> = {
  ACCOUNT_CREATED: UserPlus,
  ONBOARDING_COMPLETED: Flag,
  ROADMAP_GENERATED: Route,
  ROADMAP_RESET: RotateCcw,
  INTERVIEW_STARTED: CirclePlay,
  INTERVIEW_SUBMITTED: Send,
  FEEDBACK_READY: MessageSquareText,
  STAGE_COMPLETED: Trophy,
};

const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

// "Just now", "5 minutes ago", "Yesterday", then a plain date after a week
function formatActivityTime(occurredAt: string) {
  const date = new Date(occurredAt);
  const minutes = Math.round((date.getTime() - Date.now()) / 60_000);

  if (Math.abs(minutes) < 1) return "Just now";
  if (Math.abs(minutes) < 60) return relativeTime.format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relativeTime.format(hours, "hour");

  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return relativeTime.format(days, "day");

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ActivitySkeleton() {
  return (
    <ol className="mt-5 animate-pulse" aria-label="Loading recent activity">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex items-start gap-3 pb-5 last:pb-0">
          <span className="size-8 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 pt-1">
            <div className="h-3.5 w-32 rounded bg-muted" />
            <div className="mt-2 h-3 w-24 rounded bg-muted" />
          </div>
        </li>
      ))}
    </ol>
  );
}

function RecentActivitySection() {
  const auth = useAuth();
  const userId = auth?.user?.id;
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["recent-activity", userId],
    queryFn: () => fetchRecentActivity(RECENT_ACTIVITY_LIMIT),
    enabled: Boolean(userId),
    retry: 1,
  });

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
        {/* Hidden until there is a full activity page to link to
        <Button variant="ghost" size="lg" className="text-muted-foreground">
          View all
          <ArrowRight />
        </Button> */}
      </div>

      {isPending ? (
        <ActivitySkeleton />
      ) : isError ? (
        <div className="mt-5 flex items-start gap-3 rounded-[8px] border border-destructive/20 p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">We couldn’t load your activity</p>
            <Button
              variant="outline"
              className="mt-3 h-8 px-3"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={isFetching ? "animate-spin" : ""} />
              {isFetching ? "Retrying…" : "Try again"}
            </Button>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="mt-5 flex flex-col items-center py-6 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Activity className="size-4" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-medium">No activity yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your milestones will show up here as you practice.
          </p>
        </div>
      ) : (
        <ol className="mt-5">
          {data.map((item) => {
            const Icon = activityIcons[item.type] ?? Activity;
            return (
              <li
                key={item.id}
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
                <time
                  dateTime={item.occurredAt}
                  title={new Date(item.occurredAt).toLocaleString()}
                  className="shrink-0 pt-1 text-xs text-muted-foreground"
                >
                  {formatActivityTime(item.occurredAt)}
                </time>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default RecentActivitySection;
