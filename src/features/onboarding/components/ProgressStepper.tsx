import { Check } from "lucide-react";

type ProgressStepperProps = {
  steps?: string[];
  currentStep?: number;
};

function ProgressStepper({
  steps = ["Profile", "Skills", "Review"],
  currentStep = 1,
}: ProgressStepperProps) {
  const hasStarted = currentStep > 0;
  const completedSteps = Math.min(Math.max(currentStep - 1, 0), steps.length);
  const safeCurrentStep = Math.min(Math.max(currentStep, 1), steps.length);

  return (
    <div aria-label="Progress" className="w-full px-1 py-2">
      <ol className="relative flex items-start">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = hasStarted && stepNumber <= completedSteps;
          const isCurrent =
            hasStarted &&
            currentStep <= steps.length &&
            stepNumber === safeCurrentStep;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step}
              className="relative flex flex-1 flex-col items-center"
            >
              {!isLast && (
                <div className="absolute left-1/2 top-4 w-full h-0.5 -translate-y-1/2">
                  <div className="absolute inset-0 bg-gray-200 rounded-full" />
                  <div
                    className="absolute inset-0 rounded-full transition-transform origin-left"
                    style={{
                      backgroundColor: "#1DB88E",
                      transform: isComplete ? "scaleX(1)" : "scaleX(0)",
                    }}
                  />
                </div>
              )}

              <div
                className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[13px] font-medium transition-colors"
                style={
                  isComplete
                    ? {
                        background: "#1DB88E",
                        borderColor: "#1DB88E",
                        color: "#fff",
                      }
                    : isCurrent
                      ? {
                          background: "#fff",
                          borderColor: "#1DB88E",
                          color: "#1DB88E",
                        }
                      : {
                          background: "#fff",
                          borderColor: "#d1d5db",
                          color: "#9ca3af",
                        }
                }
              >
                {isComplete ? <Check size={16} strokeWidth={3} /> : stepNumber}
              </div>

              <span
                className="mt-2.5 text-[13px] font-medium"
                style={{
                  color: isComplete || isCurrent ? "#1DB88E" : "#9ca3af",
                }}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default ProgressStepper;
