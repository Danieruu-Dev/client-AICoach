import { CheckCircle2, Briefcase, Activity, Gauge, Globe2 } from "lucide-react";
import type { ProfileState } from "@/page/Onboarding";
import { Badge } from "@/components/ui/badge";
import type { Skills } from "@/page/Onboarding";

function OnboardingReview({
  profile,
  skills,
}: {
  profile: ProfileState;
  skills: Skills[];
}) {
  const profileItems = [
    {
      label: "Current role",
      value: profile.currentRole,
      icon: Briefcase,
    },
    {
      label: "Current status",
      value: profile.currentStatus,
      icon: Activity,
    },
    {
      label: "Experience level",
      value: profile.experience,
      icon: Gauge,
    },
    {
      label: "Target industry",
      value: profile.targetIndustry,
      icon: Globe2,
    },
  ];

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
