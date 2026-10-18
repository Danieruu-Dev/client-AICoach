import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flag,
  MessageSquareText,
  Sparkles,
  Map,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import mascot from "@/assets/preparo_sprites/happy-raising-arms-preparo.png";

// Mirrors the onboarding stepper: Profile, Preparation, Skills, Review
const setupSteps = [
  { title: "Profile", description: "Career status and coding experience" },
  { title: "Preparation goal", description: "Target role, industry, and timeline" },
  { title: "Skills", description: "Technologies to focus your practice on" },
  { title: "Review", description: "Confirm your answers" },
];

const benefits: { label: string; icon: LucideIcon }[] = [
  { label: "Questions matched to your role and level", icon: MessageSquareText },
  { label: "AI feedback measured against the job you want", icon: Sparkles },
  { label: "A roadmap built around your skills and timeline", icon: Map },
];

type OnboardingWelcomeProps = {
  firstName?: string;
  onStart: () => void;
};

// First screen a new user sees after signing up: one focused card with the setup path on the side
export default function OnboardingWelcome({
  firstName,
  onStart,
}: OnboardingWelcomeProps) {
  const displayName = firstName?.trim();

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-5xl">
        <article className="grid overflow-hidden rounded-[8px] border bg-card shadow-sm md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* Greeting and call to action */}
          <div className="flex flex-col p-6 sm:p-10">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-(--preparo-teal)/10 px-2.5 py-1 text-xs font-medium text-(--preparo-teal)">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Account created
            </span>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome aboard{displayName ? `, ${displayName}` : ""}.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              One quick setup and Preparo will shape every practice session
              around the job you&apos;re going for.
            </p>

            <ul className="mt-7 space-y-3">
              {benefits.map(({ label, icon: Icon }) => (
                <li key={label} className="flex items-center gap-3 text-sm">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-9">
              <Button
                onClick={onStart}
                className="h-11 w-full rounded-[6px] px-6 text-sm sm:w-auto"
              >
                Start setup
                <ArrowRight className="size-4" />
              </Button>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" aria-hidden="true" />
                About 2 minutes · {setupSteps.length} short steps
              </p>
            </div>
          </div>

          {/* Setup path: the four steps leading to the roadmap */}
          <aside
            className="border-t bg-muted/30 p-6 sm:p-10 md:border-t-0 md:border-l"
            aria-labelledby="setup-path-heading"
          >
            <p
              id="setup-path-heading"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              Your setup path
            </p>

            <ol className="mt-6">
              {setupSteps.map((step, index) => {
                const isCurrent = index === 0;
                return (
                  <li key={step.title} className="relative flex gap-4 pb-6">
                    {/* Connector to the next node */}
                    <span
                      aria-hidden="true"
                      className="absolute top-8 bottom-0 left-4 w-px bg-border"
                    />
                    <span
                      className={cn(
                        "relative flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        isCurrent
                          ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/10"
                          : "bg-card text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 pt-1">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {step.title}
                        {isCurrent && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            Up next
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}

              {/* Destination */}
              <li className="relative flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="absolute -top-6 left-4 h-6 border-l border-dashed border-(--preparo-teal)/60"
                />
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-(--preparo-teal)/15 text-(--preparo-teal)">
                  <Flag className="size-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Your personalized roadmap</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Ready right after you submit
                  </p>
                </div>
                <img
                  src={mascot}
                  alt=""
                  aria-hidden="true"
                  className="h-16 shrink-0 object-contain"
                />
              </li>
            </ol>
          </aside>
        </article>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          You&apos;ll review how we use your information before you submit.
        </p>
      </div>
    </div>
  );
}
