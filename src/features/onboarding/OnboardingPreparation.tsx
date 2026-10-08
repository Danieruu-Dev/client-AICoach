import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/shared/SelectFields";
import { cn } from "@/lib/utils";
import type { PreparationState } from "@/page/Onboarding";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, CalendarDays, ClipboardList, Globe2 } from "lucide-react";
import React from "react";

interface OnboardingPreparationProps {
  preparation: PreparationState;
  setPreparation: React.Dispatch<React.SetStateAction<PreparationState>>;
  showValidationError: boolean;
}

function OnboardingPreparation({
  preparation,
  setPreparation,
  showValidationError,
}: OnboardingPreparationProps) {
  const preparationErrors = {
    targetRole: showValidationError && !preparation.targetRole,
    targetIndustry: showValidationError && !preparation.targetIndustry,
  };

  const updatePreparation = (updates: Partial<PreparationState>) => {
    setPreparation((prev) => ({ ...prev, ...updates }));
  };

  const handleUpcomingInterviewChange = (checked: boolean) => {
    updatePreparation({
      hasUpcomingInterview: checked,
      interviewDate: checked ? preparation.interviewDate : undefined,
    });
  };

  const formatDateInputValue = (date?: Date) => {
    if (!date) return "";

    return date.toISOString().split("T")[0];
  };

  const fetchTargetIndustries = async () => {
    const response = await api.get("/api/profile/target-industry");

    return response.data.map(({ id, name }: { id: number; name: string }) => ({
      id,
      name,
    }));
  };

  const fetchCareerRoles = async () => {
    const response = await api.get("/api/profile/career-role");

    return response.data.map(({ id, name }: { id: number; name: string }) => ({
      id,
      name,
    }));
  };

  const { data: targetIndustry } = useQuery({
    queryKey: ["target-industry"],
    queryFn: fetchTargetIndustries,
  });

  const { data: careerRole } = useQuery({
    queryKey: ["career-role"],
    queryFn: fetchCareerRoles,
  });
  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm backdrop-blur-sm md:p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-primary md:text-2xl">
          Tell us what you are preparing for
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-[15px]">
          These details help us shape your practice plan, question difficulty,
          and interview recommendations around your actual goal.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {showValidationError && (
          <p className="text-sm text-destructive">
            Select your target role and target industry to continue.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Target role"
            placeholder="Select role"
            icon={<Briefcase className="size-4" />}
            value={preparation.targetRole}
            onChange={(value) => updatePreparation({ targetRole: value })}
            options={careerRole || []}
            className={cn(
              preparationErrors.targetRole &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          <SelectField
            label="Target industry"
            placeholder="Select industry"
            icon={<Globe2 className="size-4" />}
            value={preparation.targetIndustry}
            onChange={(value) => updatePreparation({ targetIndustry: value })}
            options={targetIndustry || []}
            className={cn(
              preparationErrors.targetIndustry &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
        </div>

        <div className="space-y-3 border-t border-border/70 pt-4">
          <div className="space-y-3 rounded-sm bg-muted/25 p-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Label className="text-sm font-medium text-foreground">
                  Do you already have an interview scheduled?
                </Label>
                <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Optional
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                This only helps us prioritize your preparation timeline.{" "}
                <b>No</b> is a default answer.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button
                type="button"
                variant={
                  preparation.hasUpcomingInterview ? "default" : "outline"
                }
                size="sm"
                className="h-9 rounded-sm"
                onClick={() => handleUpcomingInterviewChange(true)}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={
                  preparation.hasUpcomingInterview ? "outline" : "default"
                }
                size="sm"
                className="h-9 rounded-sm"
                onClick={() => handleUpcomingInterviewChange(false)}
              >
                No
              </Button>
            </div>
          </div>

          {preparation.hasUpcomingInterview && (
            <div className="space-y-2">
              <Label
                htmlFor="interview-date"
                className="text-[12px] font-semibold text-slate-700"
              >
                Interview date
              </Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="interview-date"
                  type="date"
                  value={formatDateInputValue(preparation.interviewDate)}
                  onChange={(event) =>
                    updatePreparation({
                      interviewDate: event.target.value
                        ? new Date(`${event.target.value}T00:00:00`)
                        : undefined,
                    })
                  }
                  className="h-11 rounded-sm bg-white pl-9 text-[13px]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="career-goal"
            className="text-[12px] font-semibold text-slate-700"
          >
            Preparation goal or extra context
          </Label>
          <div className="relative">
            <ClipboardList className="pointer-events-none absolute left-3 top-3 size-4 text-slate-500" />
            <textarea
              id="career-goal"
              value={preparation.careerGoal}
              onChange={(event) =>
                updatePreparation({ careerGoal: event.target.value })
              }
              placeholder="Example: I want to prepare for frontend interviews, improve system design answers, and practice behavioral questions."
              className="min-h-28 w-full resize-none rounded-sm border border-slate-200 bg-white px-3 py-3 pl-9 text-[13px] text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Optional, but helpful if you want the practice plan to focus on
            specific companies, topics, or interview types.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPreparation;
