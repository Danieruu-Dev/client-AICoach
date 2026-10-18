import { Check, Flag } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type RailStep = {
  title: string;
  // Short recap of the answers, shown once the step is done
  summary?: string;
};

type SetupRailProps = {
  steps: RailStep[];
  currentStep: number; // 1-based
  // Whether the user may jump to this step: earlier steps always, later ones only once everything before is filled in
  canGoTo: (step: number) => boolean;
  // Whether the step's answers are filled in; drives the check mark, independent of where the user is
  isComplete: (step: number) => boolean;
  // The step the user is working on; keeps "In progress" even while they look at earlier steps
  inProgressStep: number;
  onSelect: (step: number) => void;
};

/**
 * Onboarding progress: a clickable vertical path on large screens (continuing the welcome
 * page's "setup path"), and a compact bar on smaller ones.
 */
export default function SetupRail({
  steps,
  currentStep,
  canGoTo,
  isComplete,
  inProgressStep,
  onSelect,
}: SetupRailProps) {
  const current = steps[currentStep - 1];
  const completedCount = steps.filter((_, index) => isComplete(index + 1)).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <>
      {/* Small screens */}
      <div className="rounded-[8px] border bg-card px-4 py-3 shadow-sm lg:hidden">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-medium">
            Step {currentStep} of {steps.length}
            <span className="text-muted-foreground"> · {current?.title}</span>
          </span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <Progress
          className="mt-2.5 h-1.5 rounded-full *:data-[slot=progress-indicator]:bg-(--preparo-teal)"
          value={progress}
          aria-label="Setup progress"
        />
      </div>

      {/* Large screens */}
      <nav
        aria-label="Setup progress"
        className="hidden min-h-0 overflow-y-auto lg:block"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Your setup
          </p>
          <ol className="mt-6">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              // Three separate ideas: "in progress" is the step being worked on, "done" is a
              // filled-in step before it, and the highlighted row is the step being viewed
              const isInProgress = stepNumber === inProgressStep;
              const isDone = !isInProgress && isComplete(stepNumber);
              const isCurrent = stepNumber === currentStep;
              const isReachable = !isCurrent && canGoTo(stepNumber);

              return (
                <li key={step.title} className="relative pb-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-10 -bottom-2 left-6 z-10 w-px transition-colors",
                      isDone ? "bg-(--preparo-teal)" : "bg-border",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => onSelect(stepNumber)}
                    disabled={!isReachable}
                    aria-current={isCurrent ? "step" : undefined}
                    title={
                      !isCurrent && !isReachable
                        ? "Finish the current step first"
                        : undefined
                    }
                    className={cn(
                      "relative flex w-full gap-3 rounded-[8px] p-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                      isReachable && "cursor-pointer hover:bg-muted/60",
                      !isCurrent && !isReachable && "cursor-not-allowed",
                      isCurrent && "bg-card shadow-sm ring-1 ring-border",
                    )}
                  >
                    <span
                      className={cn(
                        "relative z-20 flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                        isDone &&
                          "border-(--preparo-teal) bg-(--preparo-teal) text-white",
                        isDone && isCurrent && "ring-4 ring-(--preparo-teal)/20",
                        isInProgress &&
                          "border-primary bg-primary text-primary-foreground ring-4 ring-primary/10",
                        !isDone &&
                          !isInProgress &&
                          "bg-card text-muted-foreground",
                      )}
                    >
                      {isDone ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : (
                        stepNumber
                      )}
                      <span className="sr-only">
                        {isDone ? " (done)" : ""}
                        {isInProgress ? " (in progress)" : ""}
                        {isCurrent ? " (open)" : ""}
                      </span>
                    </span>
                    <div className="min-w-0 pt-1.5">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          !isDone && !isInProgress && !isCurrent && "text-muted-foreground",
                        )}
                      >
                        {step.title}
                      </p>
                      {isDone && step.summary && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {step.summary}
                        </p>
                      )}
                      {isInProgress && (
                        <p className="mt-0.5 text-xs text-primary">
                          In progress
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}

            <li className="relative flex items-center gap-3 px-2 pt-1">
              <span
                aria-hidden="true"
                className="absolute -top-4 left-6 h-5 border-l border-dashed border-(--preparo-teal)/60"
              />
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-(--preparo-teal)/15 text-(--preparo-teal)">
                <Flag className="size-3.5" aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-muted-foreground">
                Your roadmap
              </p>
            </li>
          </ol>
        </div>
      </nav>
    </>
  );
}
