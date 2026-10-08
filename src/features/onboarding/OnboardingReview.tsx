import {
  CheckCircle2,
  Briefcase,
  Info,
  Gauge,
  Globe2,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import type { PreparationState, ProfileState } from "@/page/Onboarding";
import { Badge } from "@/components/ui/badge";
import type { Skills } from "@/page/Onboarding";

function OnboardingReview({
  profile,
  preparation,
  skills,
}: {
  profile: ProfileState;
  preparation: PreparationState;
  skills: Skills[];
}) {
  const profileItems = [
    {
      label: "Current status",
      value: profile.currentStatus,
      icon: Info,
    },
    {
      label: "Experience level",
      value: profile.codingExperience,
      icon: Gauge,
    },
  ];

  const preparationItems = [
    {
      label: "Target role",
      value: preparation.targetRole,
      icon: Briefcase,
    },
    {
      label: "Target industry",
      value: preparation.targetIndustry,
      icon: Globe2,
    },
  ];

  const formatInterviewDate = (date?: Date) => {
    if (!date) return "Not provided";

    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm backdrop-blur-sm md:p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="rounded-full bg-emerald-500/15 p-3 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-primary md:text-2xl">
          Review your onboarding details
        </h1>

        <p className="text-sm text-muted-foreground md:text-[15px]">
          Please make sure everything looks correct before continuing.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <section className="rounded-xl border bg-background/60 p-4">
          <h2 className="mb-4 text-sm font-semibold text-primary">
            Profile information
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            {profileItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-lg border border-border/70 bg-card px-3 py-3"
                >
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <Icon className="size-4" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium">
                      {item.value?.name || "Not selected"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border bg-background/60 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-primary">
              Preparation goals
            </h2>
          </div>

          <div className="rounded-lg bg-card/70">
            <div className="grid gap-2 p-2 md:grid-cols-2">
              {preparationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-md bg-background/60 p-3"
                  >
                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                      <Icon className="size-4" />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {item.value?.name || "Not selected"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-4 pb-4 pt-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-background/80 p-2 text-muted-foreground">
                    <CalendarDays className="size-4" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Interview schedule
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {preparation.hasUpcomingInterview
                        ? "Interview scheduled"
                        : "No interview scheduled yet"}
                    </p>
                  </div>
                </div>

                {preparation.hasUpcomingInterview && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {formatInterviewDate(preparation.interviewDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <ClipboardList className="size-4" />
              <p className="text-sm font-semibold">Extra context</p>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
              {preparation.careerGoal.trim() ||
                "No extra preparation notes added."}
            </p>
          </div>
        </section>

        <section className="rounded-xl border bg-background/60 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-primary">
              Selected skills
            </h2>

            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {skills.length} selected
            </span>
          </div>

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill.id}
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-[13px]"
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No skills selected yet.
            </p>
          )}
        </section>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-emerald-800">
          <p className="text-sm">
            These details will help Preparo personalize your interview practice,
            questions, and recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OnboardingReview;
