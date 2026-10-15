import {
  ArrowRight,
  Bookmark,
  ChevronRight,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getRoadmapStageDetails } from "./roadmapStageDetails";
import { fetchCompletedAttempts } from "./api/attemptsApi";

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
  const showFeedbackLink = (generating || failed) && latestSessionPublicId;
  const actionDisabled = generating && !latestSessionPublicId;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
        <div className="max-w-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Stage {stageNumber ?? 1} of {totalStages ?? 1}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {stageName || "Current stage"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {stageDetails.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-lg"
              className="text-muted-foreground"
              aria-label="Bookmark stage"
            >
              <Bookmark />
            </Button>
          </div>

          {hasAttempts ? (
            <div className="mt-7">
              <h3 className="text-sm font-semibold">Completed attempts</h3>
              <div className="mt-3 divide-y overflow-hidden rounded-md border">
                {attempts.map((attempt) => (
                  <Link
                    key={attempt.sessionPublicId}
                    to={`/interview/evaluation/${attempt.sessionPublicId}`}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        Attempt {attempt.attemptNumber}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {attempt.completedAt
                          ? new Date(attempt.completedAt).toLocaleString()
                          : "Completed"}{" "}
                        · {attempt.answeredCount}/{attempt.questionCount}{" "}
                        answered
                      </span>
                    </span>
                    <span className="text-sm font-semibold">
                      {attempt.averageScore ?? "—"}
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6 flex gap-3 rounded-md bg-primary/5 p-4">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold">Stage goal</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {stageDetails.goal}
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <h3 className="text-sm font-semibold">Preparation tips</h3>
                <ol className="mt-3 space-y-3">
                  {stageDetails.tips.map((tip, index) => (
                    <li key={tip} className="flex items-start gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-6">{tip}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p role="status" className="text-xs leading-5 text-muted-foreground">
          {generating
            ? "Your answers are submitted. Feedback is being generated. This stage will update automatically."
            : failed
              ? "Feedback generation failed. Your answers have been saved."
              : stageCompleted
                ? "Stage completed. Retake it any time to improve your score."
                : "Pick up where you left off whenever you’re ready."}
        </p>
        <Button
          asChild
          className="h-10 rounded-[6px] px-5 text-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        >
          <Link
            to={
              showFeedbackLink
                ? `/interview/evaluation/${latestSessionPublicId}`
                : interviewPreflightPath
            }
            aria-disabled={actionDisabled}
            onClick={(event) => {
              if (actionDisabled) event.preventDefault();
            }}
          >
            {showFeedbackLink
              ? "View feedback"
              : generating
                ? "Generating feedback…"
                : stageCompleted
                  ? "Retake stage"
                  : "Continue stage"}
            {stageCompleted ? <RotateCcw /> : <ArrowRight />}
          </Link>
        </Button>
      </div>
    </section>
  );
}

export default RoadmapStageContent;
