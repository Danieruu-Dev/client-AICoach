import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock3,
  Lightbulb,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getRoadmapStageDetails } from "./roadmapStageDetails";
import { fetchCompletedAttempts } from "./attemptsApi";

interface RoadmapStageContentProps {
  stageName?: string;
  stageCode?: string;
  stageNumber?: number;
  totalStages?: number;
  stageId?: number;
  userRoadmapPublicId?: string;
  stageCompleted?: boolean;
  stageStatus?: string;
  latestSessionPublicId?: string | null;
}

function RoadmapStageContent({
  stageName,
  stageCode,
  stageNumber,
  totalStages,
  stageId,
  userRoadmapPublicId,
  stageCompleted = false,
  stageStatus,
  latestSessionPublicId,
}: RoadmapStageContentProps) {
  const attemptsQuery = useQuery({
    queryKey: ["completed-attempts", userRoadmapPublicId, stageId],
    queryFn: () => fetchCompletedAttempts(userRoadmapPublicId!, stageId!),
    enabled: Boolean(userRoadmapPublicId && stageId),
  });
  const { refetch: refetchAttempts } = attemptsQuery;
  useEffect(() => {
    if (stageStatus && userRoadmapPublicId && stageId) void refetchAttempts();
  }, [stageStatus, userRoadmapPublicId, stageId, refetchAttempts]);
  const generating = stageStatus === "GENERATING";
  const failed = stageStatus === "FAILED";
  const stageDetails = getRoadmapStageDetails(stageCode, stageNumber);
  const attempts = attemptsQuery.data ?? [];
  const hasAttempts = attempts.length > 0;
  const interviewSearchParams = new URLSearchParams();

  if (stageId !== undefined)
    interviewSearchParams.set("stageId", String(stageId));
  if (userRoadmapPublicId !== undefined) {
    interviewSearchParams.set(
      "userRoadmapPublicId",
      String(userRoadmapPublicId),
    );
  }

  const interviewPreflightPath = `/interview/preflight${
    interviewSearchParams.size > 0 ? `?${interviewSearchParams.toString()}` : ""
  }`;

  return (
    <section className="flex flex-col rounded-md border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">
              {stageName || "Current stage"}
            </h2>
            <span className="rounded-sm bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
              Stage {stageNumber ?? 1} of {totalStages ?? 1}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {stageDetails.description}
          </p>
        </div>
        <button
          type="button"
          className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Bookmark stage"
        >
          <Bookmark className="size-5" />
        </button>
      </div>

      {!hasAttempts && (
        <div className="mt-6 rounded-sm border bg-muted/20 p-5">
          <div className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <Lightbulb className="size-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Stage goal
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {stageDetails.goal}
              </p>
              <div className="mt-4">
                <p className="text-xs font-semibold text-foreground">
                  Preparation tips
                </p>
                <ul className="mt-2 space-y-2">
                  {stageDetails.tips.map((tip) => (
                    <li
                      key={tip}
                      className="flex gap-2 text-xs leading-5 text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 border-y py-3">
        <div className="hidden">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              <span>
                <strong className="font-semibold text-foreground">
                  {attempts.length} attempts
                </strong>{" "}
                recorded for this stage
              </span>
            </h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3.5" />
              {attempts[0]?.averageScore != null
                ? `Latest score: ${attempts[0].averageScore}`
                : "Completed attempts and feedback"}
            </p>
            <p className="hidden">You’ve practiced this stage 2 times.</p>
          </div>
        </div>
        {hasAttempts && (
          <div className="mt-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Completed attempts</h3>
            </div>
            <div className="mt-3 space-y-2">
              {attempts.map((attempt) => (
                <Link
                  key={attempt.sessionPublicId}
                  to={`/interview/evaluation/${attempt.sessionPublicId}`}
                  className="flex w-full items-center justify-between gap-3 rounded-sm border p-3 text-left hover:bg-muted"
                >
                  <span>
                    <span className="block text-sm font-semibold">
                      Attempt {attempt.attemptNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {attempt.completedAt
                        ? new Date(attempt.completedAt).toLocaleString()
                        : "Completed"}{" "}
                      · {attempt.answeredCount}/{attempt.questionCount} answered
                    </span>
                  </span>
                  <span className="text-sm font-semibold">
                    {attempt.averageScore ?? "—"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="hidden">
          <div className="flex items-center gap-3 p-4">
            <TrendingUp className="size-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Latest score</p>
              <p className="text-xl font-semibold">73%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <CheckCircle2 className="size-5 text-primary" />
            <div>
              <p className="text-xl font-semibold">3 / 5</p>
              <p className="text-xs text-muted-foreground">
                Questions answered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Clock3 className="size-5 text-primary" />
            <div>
              <p className="text-xl font-semibold">15 min</p>
              <p className="text-xs text-muted-foreground">Time taken</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-11">
        {(generating || failed) && (
          <p role="status" className="mb-3 text-sm text-muted-foreground">
            {generating
              ? "Your answers are submitted. Feedback is being generated. This stage will update automatically."
              : "Feedback generation failed. Your answers have been saved."}
          </p>
        )}
        <Link to={(generating || failed) && latestSessionPublicId
          ? `/interview/evaluation/${latestSessionPublicId}`
          : interviewPreflightPath}
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
          aria-disabled={generating && !latestSessionPublicId}
          onClick={(event) => { if (generating && !latestSessionPublicId) event.preventDefault(); }}>
            {(generating || failed) && latestSessionPublicId ? "View feedback" : generating ? "Generating feedback…" : stageCompleted ? "Retake stage" : "Continue stage"}
            {stageCompleted ? (
              <RotateCcw className="size-4" />
            ) : (
              <ArrowRight className="size-4" />
            )}
        </Link>
      </div>
    </section>
  );
}

export default RoadmapStageContent;
