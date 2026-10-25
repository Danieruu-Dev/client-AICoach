import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Target } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import SettingsCard from "./components/SettingsCard";
import {
  settingsErrorMessage,
  updateInterviewDate,
  type SettingsPreparationGoal,
} from "./api/settingsApi";

// yyyy-mm-dd in the browser's own time zone (toISOString would use UTC)
function todayInputValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function daysUntil(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function countdown(date: string) {
  const days = daysUntil(date);
  if (days < 0) return "This date has passed";
  if (days === 0) return "Today — good luck!";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function ReadOnlyItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{children}</dd>
    </div>
  );
}

// Remounted (via key) whenever saved data changes
function PreparationGoalSection({
  goal,
  queryKey,
}: {
  goal: SettingsPreparationGoal;
  queryKey: unknown[];
}) {
  const queryClient = useQueryClient();
  const [hasUpcomingInterview, setHasUpcomingInterview] = useState(goal.hasUpcomingInterview);
  const [interviewDate, setInterviewDate] = useState(goal.interviewDate ?? "");

  const isDirty =
    hasUpcomingInterview !== goal.hasUpcomingInterview ||
    (hasUpcomingInterview && interviewDate !== (goal.interviewDate ?? ""));
  const isValid = !hasUpcomingInterview || Boolean(interviewDate);

  const mutation = useMutation({
    mutationFn: updateInterviewDate,
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKey, settings);
      toast.success("Interview date saved");
    },
    onError: (error) => toast.error(settingsErrorMessage(error, "Couldn’t save your interview date")),
  });

  return (
    <SettingsCard
      id="preparation-goal"
      icon={Target}
      title="Preparation goal"
      description="What your roadmap was built around."
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <ReadOnlyItem label="Target role">{goal.careerRole ?? "—"}</ReadOnlyItem>
        <ReadOnlyItem label="Industry">{goal.targetIndustry ?? "—"}</ReadOnlyItem>
        <div className="sm:col-span-2">
          <ReadOnlyItem label="Technologies">
            {goal.technologies.length > 0 ? (
              <span className="mt-0.5 flex flex-wrap gap-1.5">
                {goal.technologies.map((technology) => (
                  <Badge key={technology} variant="secondary">
                    {technology}
                  </Badge>
                ))}
              </span>
            ) : (
              "—"
            )}
          </ReadOnlyItem>
        </div>
        {goal.careerGoal && (
          <div className="sm:col-span-2">
            <ReadOnlyItem label="Career goal">
              <span className="font-normal text-muted-foreground">{goal.careerGoal}</span>
            </ReadOnlyItem>
          </div>
        )}
      </dl>
      <p className="mt-4 text-xs text-muted-foreground">
        Changing your role or technologies is coming soon. It will rebuild your roadmap around your new picks.
      </p>

      <form
        className="mt-5 grid gap-3 border-t pt-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (isDirty && isValid) {
            mutation.mutate({
              hasUpcomingInterview,
              interviewDate: hasUpcomingInterview ? interviewDate : null,
            });
          }
        }}
      >
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={hasUpcomingInterview}
            onChange={(event) => setHasUpcomingInterview(event.target.checked)}
          />
          I have an upcoming interview
        </label>

        {hasUpcomingInterview && (
          <div className="grid gap-1.5 sm:max-w-xs">
            <Label htmlFor="interviewDate">Interview date</Label>
            <Input
              id="interviewDate"
              type="date"
              className="h-8"
              min={todayInputValue()}
              value={interviewDate}
              onChange={(event) => setInterviewDate(event.target.value)}
            />
            {interviewDate && (
              <p className="text-xs text-muted-foreground">{countdown(interviewDate)}</p>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            className="h-8 px-4"
            disabled={!isDirty || !isValid || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="animate-spin" />}
            {mutation.isPending ? "Saving…" : "Save date"}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

export default PreparationGoalSection;
