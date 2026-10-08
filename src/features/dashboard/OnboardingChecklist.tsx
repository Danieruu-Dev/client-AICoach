import {
  ArrowRight,
  ClipboardCheck,
  Layers3,
  ListChecks,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const onboardingSteps = [
  {
    title: "Complete your profile",
    description:
      "Add your role, career status, experience, target industry, and interview preference.",
    icon: UserRound,
  },
  {
    title: "Choose your skills",
    description:
      "Select the technologies and skills you want your interview prep to focus on.",
    icon: Layers3,
  },
  {
    title: "Review and submit",
    description:
      "Check your answers, then submit onboarding to unlock your personalized dashboard.",
    icon: ClipboardCheck,
  },
];

export default function OnboardingChecklist() {
  return (
    <section className="rounded-lg border border-primary/15 bg-card p-4 text-card-foreground shadow-sm ring-1 ring-primary/5 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
            <span className="absolute -right-0.5 -top-0.5 size-2.5 animate-ping rounded-full bg-[var(--preparo-teal)]" />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[var(--preparo-teal)]" />
            <ListChecks className="size-4" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                First thing to do
              </h2>
              <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-primary/10">
                Setup task
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
              Start by finishing onboarding so your practice sessions can match
              your role, skills, and goals.
            </p>
          </div>
        </div>

        <Button
          asChild
          className="w-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 sm:w-fit xl:shrink-0"
        >
          <Link to="/onboarding">
            Continue onboarding
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <ol className="mt-4 grid gap-2 md:grid-cols-3">
        {onboardingSteps.map((step, index) => {
          const Icon = step.icon;

          return (
            <li
              key={step.title}
              className="rounded-md border border-border bg-background/60 p-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-primary">
                      {index + 1}
                    </span>
                    <h3 className="truncate text-xs font-semibold text-foreground">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
