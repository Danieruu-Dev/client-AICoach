import { AlertCircle, Check, LoaderCircle, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface UserRoadmapStageProgressResponse {
  userPublicId: string;
  userRoadmapPublicId: string;
  preparationGoalPublicId: string;
  stageId: number;
  stageCode: string;
  stageName: string;
  stageStatus: string;
  latestSessionPublicId?: string | null;
  stageSortOrder: number;
  questionCount: number;
  completedQuestionCount: number;
  stageProgressPercentage: number;
  stageCompleted: boolean;
}

interface RoadmapStageProps {
  stages: UserRoadmapStageProgressResponse[];
  selectedStageId?: number;
  onSelectStage: (stage: UserRoadmapStageProgressResponse) => void;
}

function StageIcon({ status, order }: { status: string; order: number }) {
  if (status === "Generating")
    return <LoaderCircle className="size-4 animate-spin" />;
  if (status === "Feedback failed")
    return <AlertCircle className="size-4 text-destructive" />;
  if (status === "Completed") return <Check className="size-4" />;
  if (status === "In progress")
    return <span className="text-xs font-semibold">{order}</span>;
  return <LockKeyhole className="size-3.5" />;
}

function RoadmapStage({
  stages,
  selectedStageId,
  onSelectStage,
}: RoadmapStageProps) {
  const orderedStages = [...stages].sort(
    (first, second) => first.stageSortOrder - second.stageSortOrder,
  );
  const currentStageIndex = orderedStages.findIndex(
    (stage) => !stage.stageCompleted,
  );
  const isComplete = (stage: UserRoadmapStageProgressResponse) =>
    stage.stageCompleted ||
    stage.stageStatus?.trim().toUpperCase() === "COMPLETED";
  const completedCount = orderedStages.filter(isComplete).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold">Your roadmap</h2>
          <span className="text-xs text-muted-foreground">
            {completedCount} of {orderedStages.length} stages
          </span>
        </div>
        <Progress
          className="mt-3 h-1.5 rounded-full"
          value={
            orderedStages.length > 0
              ? (completedCount / orderedStages.length) * 100
              : 0
          }
          aria-label="Roadmap stage progress"
        />
      </div>

      <ol className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {orderedStages.map((stage, index) => {
          const normalizedStatus = stage.stageStatus
            ?.trim()
            .toUpperCase()
            .replaceAll(" ", "_");
          const complete = isComplete(stage);
          const active =
            [
              "GENERATING",
              "FAILED",
              "AVAILABLE",
              "IN_PROGRESS",
              "ACTIVE",
              "CURRENT",
              "UNLOCKED",
            ].includes(normalizedStatus) ||
            (!normalizedStatus && index === currentStageIndex);
          const status = complete
            ? "Completed"
            : normalizedStatus === "GENERATING"
              ? "Generating"
              : normalizedStatus === "FAILED"
                ? "Feedback failed"
                : active
                  ? "In progress"
                  : "Locked";
          const selected = stage.stageId === selectedStageId;

          return (
            <li
              key={stage.stageId}
              className={cn(
                "relative not-last:before:absolute not-last:before:left-6 not-last:before:top-[calc(50%+1rem)] not-last:before:h-[calc(100%-2rem)] not-last:before:w-px",
                complete ? "before:bg-emerald-500" : "before:bg-border",
              )}
            >
              <button
                type="button"
                disabled={status === "Locked"}
                onClick={() => onSelectStage(stage)}
                aria-current={selected ? "step" : undefined}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:hover:bg-transparent",
                  selected && "bg-primary/8 hover:bg-primary/8",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border bg-card text-muted-foreground",
                    complete && "border-emerald-500 bg-emerald-500 text-white",
                    active &&
                      !complete &&
                      "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  <StageIcon status={status} order={stage.stageSortOrder} />
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1",
                    status === "Locked" && "opacity-60",
                  )}
                >
                  <span className="block truncate text-sm font-medium">
                    {stage.stageName}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {stage.completedQuestionCount} of {stage.questionCount}{" "}
                    questions
                  </span>
                </span>
                {complete ? (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {Math.round(stage.stageProgressPercentage ?? 0)}%
                  </span>
                ) : (
                  status !== "Locked" && (
                    <Badge
                      variant={
                        status === "Feedback failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {status}
                    </Badge>
                  )
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default RoadmapStage;
