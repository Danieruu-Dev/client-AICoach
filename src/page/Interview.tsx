import { ArrowLeft, Clock3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  Navigate,
  Outlet,
  useMatch,
  useSearchParams,
} from "react-router-dom";
import api from "@/api/axios";

interface InterviewDetails {
  stageId: number;
  stageName: string;
  description: string | null;
  estimatedMinutes?: number;
  userRoadmapPublicId: string;
}

function Interview() {
  const isEvaluationRoute = Boolean(useMatch("/interview/evaluation/:interviewSessionPublicId"));
  const isQuestionRoute = Boolean(useMatch("/interview/question/:interviewSessionPublicId"));
  const [searchParams] = useSearchParams();

  const stageId = searchParams.get("stageId");
  const userRoadmapPublicId = searchParams.get("userRoadmapPublicId");
  const hasPreflightParams = Boolean(stageId && userRoadmapPublicId);
  const isSessionRoute = isQuestionRoute || isEvaluationRoute;
  const needsPreflightDetails = hasPreflightParams && !isSessionRoute;

  const {
    data: interview,
    isPending,
    isError,
    error,
  } = useQuery<InterviewDetails>({
    queryKey: ["interviewDetails", userRoadmapPublicId, stageId],
    queryFn: async () => {
      if (!stageId || !userRoadmapPublicId) {
        throw new Error("Missing interview parameters");
      }

      const response = await api.get<InterviewDetails>(
        `/api/roadmap/${userRoadmapPublicId}/stage/${stageId}`,
      );

      return response.data;
    },
    enabled: needsPreflightDetails,
    retry: 1,
  });

  if (!hasPreflightParams && !isSessionRoute) {
    return <Navigate to="/roadmap" replace />;
  }

  if (needsPreflightDetails && isPending) {
    return (
      <main className="flex h-dvh items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading interview details...
          </p>
        </div>
      </main>
    );
  }

  if (needsPreflightDetails && isError) {
    console.error("Failed to load interview:", error);

    return (
      <main className="flex h-dvh items-center justify-center bg-muted/20 p-4">
        <div className="max-w-md rounded-md border bg-card p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold">Interview unavailable</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            This interview stage could not be loaded or you do not have access
            to it.
          </p>

          <Link
            to="/roadmap"
            className="mt-5 inline-flex rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Return to roadmap
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="h-dvh overflow-y-auto bg-muted/20 p-4 text-foreground lg:overflow-hidden">
      <div className="mx-auto flex min-h-full max-w-6xl flex-col lg:h-full lg:min-h-0">
        <header className="grid min-h-17 shrink-0 items-center gap-3 rounded-md border bg-card px-4 py-3 shadow-sm sm:grid-cols-[1fr_auto_1fr] sm:px-6">
          <Link
            to="/roadmap"
            className="flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {isEvaluationRoute ? "Back to roadmap" : "Exit interview"}
          </Link>

          <div className="text-left sm:text-center">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              {isEvaluationRoute ? "Interview evaluation" : interview?.stageName ?? "Interview"}
            </h1>

            {interview?.description && (
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {interview.description}
              </p>
            )}
          </div>

          {isEvaluationRoute ? <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 sm:justify-self-end">Answers submitted</span> : <div className="flex items-center gap-3 sm:justify-self-end">
            <span className="flex size-9 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <Clock3 className="size-4" />
            </span>

            <div>
              <p className="text-sm font-semibold">
                {interview?.estimatedMinutes ?? 15} minutes
              </p>
              <p className="text-[11px] text-muted-foreground">
                Estimated time
              </p>
            </div>
          </div>}
        </header>

        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          <Outlet context={{ interview }} />
        </div>
      </div>
    </main>
  );
}

export default Interview;
