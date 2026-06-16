import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type StepId = "profile" | "skills" | "tech" | "preferences";

type Step = {
  id: StepId;
  label: string;
  completed: boolean;
  badge?: number;
};

const steps: Step[] = [
  { id: "profile", label: "Profile", completed: true },
  { id: "skills", label: "Skills", completed: true },
  { id: "tech", label: "Tech Stack", completed: false, badge: 3 },
  { id: "preferences", label: "Preferences", completed: false, badge: 4 },
];

export default function OnboardingChecklist() {
  const [activeStep, setActiveStep] = useState<StepId>("tech");

  return (
    <section className="overflow-hidden rounded-[16px] border border-[#D9DDF8] bg-[#F4F7FE] text-[#18224A] shadow-[0_8px_24px_rgba(99,110,255,0.07)]">
      <header className="border-b border-[#DDE1FA] px-3 py-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex items-center justify-center">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    className="fill-none stroke-[#D9E1FF]"
                    strokeWidth="7"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    className="fill-none stroke-[#3F63E9]"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray="314"
                    strokeDashoffset="79"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-[18px] font-semibold tracking-tight text-[#1B2559] sm:text-[20px]">
                    75%
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-[#7E87AA] sm:text-[12px]">
                    Complete
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-0 pt-0.5">
              <h2 className="text-[18px] font-semibold tracking-tight text-[#1B2559] sm:text-[20px]">
                Complete Your Interview Profile
              </h2>
              <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-[#7E87AA] sm:text-[14px]">
                Finish these steps to get a personalized interview experience.
              </p>

              <div className="mt-3 flex flex-wrap gap-2.5 sm:gap-3">
                {steps.map((step) => {
                  const isActive = activeStep === step.id;
                  const isCompleted = step.completed;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      className={`flex h-10 items-center gap-2.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors ${
                        isActive
                          ? "border-[#BAC5FF] bg-white text-[#3552D9] shadow-[0_8px_20px_rgba(63,99,233,0.10)]"
                          : "border-transparent bg-white/75 text-[#1B2559] shadow-[0_6px_16px_rgba(15,23,42,0.04)] hover:bg-white"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                          isCompleted
                            ? "bg-[#16B8A6] text-white"
                            : isActive
                              ? "bg-[#3457E8] text-white"
                              : "bg-[#E7EAF7] text-[#8490B9]"
                        }`}
                      >
                        {isCompleted ? "✓" : step.badge}
                      </span>
                      <span>{step.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center gap-2 text-[12px] text-[#7E87AA]">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#A8B0D6] text-[10px] leading-none">
                  i
                </span>
                <span>1 step remaining</span>
                <span>•</span>
                <span>~30 seconds</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 self-stretch lg:flex-col lg:items-end lg:justify-start">
            <Button
              type="button"
              className="h-10 rounded-[11px] bg-[#3C57E9] px-4.5 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(60,87,233,0.22)] hover:bg-[#314BDE]"
            >
              Continue Setup
              <ChevronRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>
    </section>
  );
}
