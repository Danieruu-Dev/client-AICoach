import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProviderContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  RefreshCw,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toProperCase, formatExperience } from "@/utils/textFormatter";

export interface UserRoadmapProfileResponse {
  userPublicId: string;
  preparationGoalPublicId: string;
  codingExperienceLevel: string;
  role: string;
  currentStatus: string;
  targetIndustry: string;
  preparationGoalTech: string;
}

function getTechnologyNames(value: string): string[] {
  if (!value?.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((technology) => {
          if (typeof technology === "string") return technology;
          if (
            typeof technology === "object" &&
            technology !== null &&
            "name" in technology &&
            typeof technology.name === "string"
          ) {
            return technology.name;
          }
          return "";
        })
        .map((name) => name.trim())
        .filter(Boolean);
    }
  } catch {
    // The API may return a plain comma-separated list rather than JSON.
  }

  return value
    .split(",")
    .map((technology) => technology.trim())
    .filter(Boolean);
}

async function fetchRoadmapProfile(publicId: string) {
  const response = await api.get<
    UserRoadmapProfileResponse | UserRoadmapProfileResponse[]
  >(`/api/roadmap/profile/${publicId}`);
  return Array.isArray(response.data) ? response.data[0] : response.data;
}

function RoadmapInfoSection() {
  const auth = useAuth();
  const publicId = auth?.user?.id;
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["roadmap-profile", publicId],
    queryFn: () => fetchRoadmapProfile(publicId!),
    enabled: Boolean(publicId),
    retry: 1,
  });

  if (isPending) {
    return (
      <section
        className="mt-6 animate-pulse rounded-md border bg-card p-6 shadow-sm"
        aria-label="Loading roadmap profile"
      >
        <div className="flex gap-5">
          <div className="size-20 shrink-0 rounded-md bg-muted" />
          <div className="flex-1">
            <div className="h-6 w-52 rounded-sm bg-muted" />
            <div className="mt-4 h-4 max-w-xl rounded-sm bg-muted" />
            <div className="mt-3 h-4 max-w-md rounded-sm bg-muted" />
          </div>
        </div>
      </section>
    );
  }

  const notFound = axios.isAxiosError(error) && error.response?.status === 404;

  if (isError && !notFound) {
    return (
      <section className="mt-6 rounded-md border border-destructive/20 bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <AlertCircle className="size-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold">
              Couldn’t load roadmap information
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Check your connection and try again.
            </p>
          </div>
          <Button
            variant="outline"
            className="h-8"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={isFetching ? "animate-spin" : ""} />
            Try again
          </Button>
        </div>
      </section>
    );
  }

  if (notFound || !data) {
    return (
      <section className="mt-6 rounded-md border bg-card p-6 text-center shadow-sm">
        <Target className="mx-auto size-6 text-muted-foreground" />
        <h2 className="mt-3 text-sm font-semibold">No roadmap profile yet</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Complete your preparation goal to generate this information.
        </p>
      </section>
    );
  }

  const technologies = getTechnologyNames(data.preparationGoalTech);

  return (
    <section className="mt-6 overflow-hidden rounded-md border bg-card shadow-sm">
      <div className="grid gap-6 py-4 px-5 sm:py-5 sm:px-6 xl:grid-cols-[1fr_auto] xl:items-center">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
            <Target className="size-11" strokeWidth={1.6} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">
                {data.role || "Target role"}
              </h2>
              <span className="rounded-sm bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                Primary hard coded
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {technologies.map((item) => (
                <span
                  key={item}
                  className="rounded-md border bg-background px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 bg-muted/15 p-4 sm:grid-cols-3 xl:min-w-150 xl:border-l">
          <div>
            <p className="text-xs text-muted-foreground">Experience level</p>
            <p className="mt-1 text-sm font-medium">
              {formatExperience(
                data.codingExperienceLevel || "Not specified",
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current status</p>
            <p className="mt-1 text-sm font-medium">
              {toProperCase(data.currentStatus || "Not specified")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target Industry</p>
            <p className="mt-1 text-sm font-medium">
              {data.targetIndustry || "Not specified"}
            </p>
          </div>
          <Link
            to="/performance"
            className="group flex items-center justify-center gap-2 rounded-sm bg-foreground px-4 py-2.5 text-xs font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-span-3"
          >
            <BarChart3 className="size-4" />
            Go to Performance
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default RoadmapInfoSection;
