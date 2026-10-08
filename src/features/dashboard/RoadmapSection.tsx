import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProviderContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  Clock3,
  Map,
  Play,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

export interface UserRoadmapProgressResponse {
  userRoadmapId: number;
  userId: number;
  preparationGoalId: number;
  status: string;
  currentStageName: string;
  difficultyLevel: string;
  stageNumberCompleted: number;
  stageLength: number;
}

async function fetchRoadmapSummaryData(userId: string) {
  const response = await api.get(`/api/roadmap/progress/${userId}`);
  return response.data[0] as UserRoadmapProgressResponse;
}

function RoadmapSkeleton() {
  return (
    <article
      className="mt-7 overflow-hidden rounded-[8px] border bg-card shadow-sm"
      aria-label="Loading roadmap summary"
    >
      <div className="grid animate-pulse lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex gap-6 p-5 sm:p-7">
          <div className="h-36 w-30 shrink-0 rounded-xl bg-muted" />
          <div className="flex-1 py-2">
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="mt-4 h-7 w-52 rounded bg-muted" />
            <div className="mt-3 h-4 max-w-md rounded bg-muted" />
            <div className="mt-7 h-10 w-36 rounded bg-muted" />
          </div>
        </div>
        <div className="border-t bg-muted/20 p-7 lg:border-l lg:border-t-0">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="mt-4 h-9 w-28 rounded bg-muted" />
          <div className="mt-6 h-2 rounded-full bg-muted" />
        </div>
      </div>
    </article>
  );
}

function RoadmapSection() {
  const auth = useAuth();
  const userId = auth?.user?.id;
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["roadmap-summary", userId],
    queryFn: () => fetchRoadmapSummaryData(userId!),
    enabled: Boolean(userId),
    retry: 1,
  });

  if (isPending) return <RoadmapSkeleton />;

  const roadmapNotFound =
    axios.isAxiosError(error) && error.response?.status === 404;

  if (isError && !roadmapNotFound) {
    return (
      <article className="mt-7 rounded-[8px] border border-destructive/20 bg-card p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">We couldn’t load your roadmap</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your progress is safe. Check your connection and try loading the
              summary again.
            </p>
          </div>
          <Button
            variant="outline"
            className="h-9 px-4"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={isFetching ? "animate-spin" : ""} />
            {isFetching ? "Retrying…" : "Try again"}
          </Button>
        </div>
      </article>
    );
  }

  if (roadmapNotFound || !data) {
    return (
      <article className="mt-7 overflow-hidden rounded-[8px] border bg-card shadow-sm">
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Map className="size-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">
            Your roadmap is being prepared
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Once your preparation goal is ready, your personalized stages and
            progress will appear here.
          </p>
          <Button asChild className="mt-5 h-9 px-4">
            <Link to="/onboarding">
              Review preparation goal <ArrowRight />
            </Link>
          </Button>
        </div>
      </article>
    );
  }

  const completed = Math.min(
    Math.max(data.stageNumberCompleted ?? 0, 0),
    data.stageLength || 0,
  );
  const total = Math.max(data.stageLength ?? 0, 0);
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const hasStarted =
    completed > 0 ||
    !["NOT_STARTED", "PENDING"].includes(data.status?.toUpperCase());
  const difficulty = data.difficultyLevel
    ? `${data.difficultyLevel.charAt(0).toUpperCase()}${data.difficultyLevel.slice(1).toLowerCase()} level`
    : "Personalized difficulty";

  return (
    <article className="mt-7 overflow-hidden rounded-[8px] border border-border bg-card shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex flex-col gap-7 p-5 sm:flex-row sm:items-center sm:p-7">
          <div className="flex items-center justify-center">
            <img
              src="/src/assets/preparo_sprites/adventure-preparo.png"
              alt=""
              className="h-45 w-37"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {hasStarted ? "Continue your roadmap" : "Start your roadmap"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {data.currentStageName || "Your first stage"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasStarted
                ? "Keep building momentum with the next part of your personalized preparation plan."
                : "Your personalized interview preparation path is ready when you are."}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Button
                asChild
                className="h-10 rounded-[6px] bg-primary px-5 text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/roadmap">
                  <Play className="size-4 fill-current" />
                  {hasStarted ? "Continue practice" : "Start practice"}
                </Link>
              </Button>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-[var(--preparo-teal)]" />
                {difficulty}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-muted/25 p-5 sm:p-7 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Roadmap progress</p>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {data.status?.replaceAll("_", " ") || "Active"}
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {completed} / {total}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">stages completed</p>
          <div
            className="mt-5 h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Roadmap stage progress"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={completed}
          >
            <div
              className="h-full bg-[var(--preparo-teal)] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <Clock3 className="mt-0.5 size-3.5 shrink-0" />
            {progress === 100
              ? "Roadmap complete — excellent work."
              : `${progress}% complete · Resume whenever you’re ready.`}
          </p>
        </div>
      </div>
    </article>
  );
}

export default RoadmapSection;
