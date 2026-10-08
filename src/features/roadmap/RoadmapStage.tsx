import { AlertCircle, Check, LoaderCircle, LockKeyhole } from "lucide-react";
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

function StageIcon({ status }: { status: string }) {
  if (status === "Generating") return <LoaderCircle className="size-4 animate-spin" />;
  if (status === "Feedback failed") return <AlertCircle className="size-4 text-destructive" />;
  if (status === "Completed") return <Check className="size-4" />;
  if (status === "In progress")
    return <span className="size-2.5 rounded-full bg-primary" />;
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

  return (
    <section className="rounded-md border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Your roadmap</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Complete each stage to unlock the next one.
      </p>
      <div className="relative mt-5 space-y-3 before:absolute before:bottom-8 before:left-4 before:top-8 before:w-px before:bg-border">
        {orderedStages.map((stage, index) => {
          const normalizedStatus = stage.stageStatus
            ?.trim()
            .toUpperCase()
            .replaceAll(" ", "_");
          const complete =
            stage.stageCompleted || normalizedStatus === "COMPLETED";
          const active =
            ["GENERATING", "FAILED", "AVAILABLE", "IN_PROGRESS", "ACTIVE", "CURRENT", "UNLOCKED"].includes(
              normalizedStatus,
            ) ||
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
            <div key={stage.stageId} className="relative flex gap-3">
              <span
                className={`z-10 mt-5 flex size-8 shrink-0 items-center justify-center rounded-full border ${complete ? "border-emerald-500 bg-emerald-500 text-white" : active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"}`}
              >
                <StageIcon status={status} />
              </span>
              <button
                type="button"
                disabled={status === "Locked"}
                onClick={() => onSelectStage(stage)}
                aria-pressed={selected}
                className={cn(
                  "relative flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-sm border p-4 text-left transition-colors",
                  complete &&
                    "border-emerald-500/60 bg-emerald-500/[0.04] hover:border-emerald-500",
                  active &&
                    !complete &&
                    "border-primary/60 bg-primary/[0.04] hover:border-primary",
                  !complete &&
                    !active &&
                    "border-border bg-background hover:border-foreground/30 hover:bg-muted/40",
                  selected && complete && "bg-emerald-500/12",
                  selected && !complete && "bg-primary/12",
                  "disabled:cursor-not-allowed disabled:border-border disabled:bg-muted/20 disabled:opacity-60",
                )}
              >
                <span className="text-sm font-semibold text-muted-foreground">
                  {stage.stageSortOrder}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {stage.stageName}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {stage.completedQuestionCount} of {stage.questionCount}{" "}
                    questions · {Math.round(stage.stageProgressPercentage ?? 0)}
                    %
                  </span>
                </span>
                <span
                  className={`rounded-sm px-2 py-1 text-[10px] font-semibold ${complete ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  {status}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default RoadmapStage;
