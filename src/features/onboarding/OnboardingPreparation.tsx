import api from "@/api/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PreparationState } from "@/pages/Onboarding";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Bug,
  CalendarDays,
  Cloud,
  Layers3,
  Monitor,
  Server,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import React from "react";
import { ChoiceCards, ChoicePills, type Choice } from "./components/ChoiceGroups";

const CAREER_GOAL_MAX_LENGTH = 500;

const interviewOptions = [
  { id: "no", name: "Not yet" },
  { id: "yes", name: "Yes, it's scheduled" },
];

// Roles come from the server, so match on the name and fall back to a generic icon
function getRoleIcon(name: string): LucideIcon {
  const role = name.toLowerCase();
  if (role.includes("full")) return Layers3;
  if (role.includes("front")) return Monitor;
  if (role.includes("back")) return Server;
  if (role.includes("devops") || role.includes("cloud")) return Cloud;
  if (role.includes("qa") || role.includes("test")) return Bug;
  if (role.includes("mobile")) return Smartphone;
  return Briefcase;
}

const fetchChoices = (url: string) => async (): Promise<Choice[]> => {
  const response = await api.get(url);
  return response.data.map(({ id, name }: Choice) => ({ id, name }));
};

function ChoiceSkeleton({ count, className }: { count: number; className: string }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn("animate-pulse rounded-[8px] bg-muted", className)} />
      ))}
    </div>
  );
}

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
  const updatePreparation = (updates: Partial<PreparationState>) => {
    setPreparation((prev) => ({ ...prev, ...updates }));
  };

  const { data: careerRoles, isPending: rolesPending } = useQuery({
    queryKey: ["career-role"],
    queryFn: fetchChoices("/api/profile/career-role"),
  });

  const { data: industries, isPending: industriesPending } = useQuery({
    queryKey: ["target-industry"],
    queryFn: fetchChoices("/api/profile/target-industry"),
  });

  const formatDateInputValue = (date?: Date) => {
    if (!date) return "";
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().split("T")[0];
  };

  const today = formatDateInputValue(new Date());

  return (
    <div className="space-y-8">
      {rolesPending ? (
        <ChoiceSkeleton count={6} className="h-15.5" />
      ) : (
        <ChoiceCards
          label="Which role are you aiming for?"
          options={careerRoles ?? []}
          value={preparation.targetRole}
          onChange={(value) => updatePreparation({ targetRole: value })}
          getMeta={(option) => ({ icon: getRoleIcon(option.name) })}
          invalid={showValidationError}
          errorMessage="Choose your target role."
        />
      )}

      {industriesPending ? (
        <ChoiceSkeleton count={6} className="h-9" />
      ) : (
        <ChoicePills
          label="Which industry?"
          hint="Questions and scenarios will lean toward this field."
          options={industries ?? []}
          value={preparation.targetIndustry}
          onChange={(value) => updatePreparation({ targetIndustry: value })}
          invalid={showValidationError}
          errorMessage="Choose your target industry."
        />
      )}

      <div className="space-y-4 border-t pt-8">
        <ChoicePills
          label="Do you have an interview coming up?"
          hint="Optional. It helps us pace your roadmap."
          options={interviewOptions}
          value={preparation.hasUpcomingInterview ? interviewOptions[1] : interviewOptions[0]}
          onChange={(value) => {
            const hasUpcomingInterview = value.id === "yes";
            updatePreparation({
              hasUpcomingInterview,
              interviewDate: hasUpcomingInterview ? preparation.interviewDate : undefined,
            });
          }}
        />

        {preparation.hasUpcomingInterview && (
          <div className="max-w-xs space-y-2">
            <Label htmlFor="interview-date" className="text-xs font-medium">
              Interview date
            </Label>
            <div className="relative">
              <CalendarDays
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="interview-date"
                type="date"
                min={today}
                value={formatDateInputValue(preparation.interviewDate)}
                onChange={(event) =>
                  updatePreparation({
                    interviewDate: event.target.value
                      ? new Date(`${event.target.value}T00:00:00`)
                      : undefined,
                  })
                }
                className="h-10 pl-9"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor="career-goal" className="text-sm font-medium">
            Anything specific you want to focus on?
          </Label>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>
        <textarea
          id="career-goal"
          value={preparation.careerGoal}
          maxLength={CAREER_GOAL_MAX_LENGTH}
          onChange={(event) => updatePreparation({ careerGoal: event.target.value })}
          placeholder="e.g. Frontend interviews at product companies, system design basics, and behavioral questions."
          className="min-h-28 w-full resize-none rounded-[8px] border border-input bg-transparent px-3 py-2.5 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
        />
        <p className="text-right text-xs text-muted-foreground">
          {preparation.careerGoal.length}/{CAREER_GOAL_MAX_LENGTH}
        </p>
      </div>
    </div>
  );
}

export default OnboardingPreparation;
