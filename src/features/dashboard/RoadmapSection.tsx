import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProviderContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, ArrowRight, Map, Play, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import adventureIllustration from "@/assets/preparo_sprites/adventure-preparo.png";

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
      className="overflow-hidden rounded-[8px] border bg-card shadow-sm"
      aria-label="Loading roadmap summary"
    >
      <div className="animate-pulse">
        <div className="flex gap-6 p-5 sm:p-6">
          <div className="h-32 w-26 shrink-0 rounded-xl bg-muted" />
          <div className="flex-1 py-2">
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="mt-4 h-7 w-52 rounded bg-muted" />
            <div className="mt-3 h-4 max-w-md rounded bg-muted" />
            <div className="mt-6 h-10 w-36 rounded bg-muted" />
          </div>
        </div>
        <div className="border-t bg-muted/20 px-5 py-4 sm:px-6">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="mt-3 h-2 rounded-full bg-muted" />
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
      <article className="rounded-[8px] border border-destructive/20 bg-card p-6 shadow-sm sm:p-7">
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
      <article className="overflow-hidden rounded-[8px] border bg-card shadow-sm">
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

  return (
    <article className="overflow-hidden rounded-[8px] border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-6">
        <img
          src={adventureIllustration}
          alt=""
          className="h-36 w-30 shrink-0 self-center object-contain"
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {hasStarted ? "Continue your roadmap" : "Start your roadmap"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {data.currentStageName || "Your first stage"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {hasStarted
              ? "Keep building momentum with the next part of your personalized preparation plan."
              : "Your personalized interview preparation path is ready when you are."}
          </p>
          <Button
            asChild
            className="mt-5 h-10 rounded-[6px] bg-primary px-5 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/roadmap">
              <Play className="size-4 fill-current" />
              {hasStarted ? "Continue practice" : "Start practice"}
            </Link>
          </Button>
        </div>
      </div>

      <div className="border-t border-border bg-muted/25 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Roadmap progress</p>
            <Badge
              variant="secondary"
              className="bg-primary/10 uppercase tracking-wide text-primary"
            >
              {data.status?.replaceAll("_", " ") || "Active"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {progress === 100
              ? "Roadmap complete — excellent work."
              : `${completed} of ${total} stages completed · ${progress}%`}
          </p>
        </div>
        <Progress
          className="mt-3 h-2 rounded-full *:data-[slot=progress-indicator]:bg-(--preparo-teal)"
          value={progress}
          aria-label="Roadmap stage progress"
        />
      </div>
    </article>
  );
}

export default RoadmapSection;
