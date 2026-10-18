import {
  ArrowRight,
  AudioLines,
  ChartNoAxesColumn,
  CircleCheck,
  MessagesSquare,
  Route,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import mascot from "@/assets/preparo_sprites/happy-checklist-preparo.png";
import twinkle from "@/assets/bg_design/twinkle.png";

const steps = [
  {
    title: "Set your goal",
    description: "Tell us your target role, industry, and the skills you want to sharpen.",
  },
  {
    title: "Practice with AI",
    description: "Answer realistic interview questions by typing or speaking, at your own pace.",
  },
  {
    title: "Improve every round",
    description: "Get scored feedback and follow a roadmap that grows with you.",
  },
];

const features: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Realistic AI interviews",
    description: "Questions matched to your role, level, and chosen technologies.",
    icon: MessagesSquare,
  },
  {
    title: "Answer out loud",
    description: "Record your answer like a real interview. We transcribe it for you.",
    icon: AudioLines,
  },
  {
    title: "Scored feedback",
    description:
      "Technical depth, communication, structure, and confidence, with clear strengths and areas to improve.",
    icon: ChartNoAxesColumn,
  },
  {
    title: "A personal roadmap",
    description: "Stage-by-stage preparation built from your goals, so you always know what's next.",
    icon: Route,
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--preparo-teal)">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{description}</p>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-24">
      <SectionHeading
        eyebrow="How it works"
        title="From first question to interview-ready"
        description="Three steps, then you practice on your schedule."
      />

      <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
        {/* Connecting path between the steps on wide screens */}
        <span
          aria-hidden="true"
          className="absolute top-5 right-[16.66%] left-[16.66%] hidden h-px bg-linear-to-r from-primary/40 via-(--preparo-teal)/60 to-(--preparo-teal) md:block"
        />
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex flex-col items-center text-center">
            <span className="relative flex size-10 items-center justify-center rounded-full border bg-background text-sm font-semibold text-primary shadow-sm ring-4 ring-background">
              {index + 1}
            </span>
            <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-24">
      <SectionHeading
        eyebrow="Features"
        title="Everything you need to prepare"
        description="Practice that feels like the real thing, with feedback you can act on."
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        {features.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="group rounded-[8px] border bg-card p-6 shadow-sm transition-colors hover:border-primary/30"
          >
            <span className="flex size-10 items-center justify-center rounded-md bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const ctaPoints = ["Free to start", "Set up in about 2 minutes", "Feedback on your first answer"];

export function CtaSection({
  onStart,
  onLogin,
  isSignedIn,
}: {
  onStart: () => void;
  onLogin: () => void;
  isSignedIn: boolean;
}) {
  return (
    // Extra top padding leaves room for the mascot, which pops out above the band
    <section className="pt-28 pb-20 sm:pb-24 md:pt-24">
      <div className="relative">
        <div className="relative overflow-hidden rounded-[8px] bg-primary text-primary-foreground shadow-lg">
          {/* Texture: faint dot grid plus brand glows */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px]"
          />
          <div aria-hidden="true" className="absolute -top-24 -left-16 size-72 rounded-full bg-(--preparo-teal)/30 blur-3xl" />
          <div aria-hidden="true" className="absolute -right-10 -bottom-24 size-72 rounded-full bg-(--preparo-yellow)/20 blur-3xl" />

          <div className="relative px-6 pt-24 pb-10 text-center sm:px-12 md:max-w-[62%] md:py-14 md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--preparo-teal)">
              Ready when you are
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your next interview starts here.
            </h2>
            <p className="mt-3 text-primary-foreground/75">
              Practice today and walk into your interview knowing what to expect.
            </p>

            <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-primary-foreground/85 md:justify-start">
              {ctaPoints.map((point) => (
                <li key={point} className="flex items-center gap-1.5">
                  <CircleCheck className="size-4 text-(--preparo-teal)" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row md:items-center">
              <Button
                onClick={onStart}
                className="h-11 rounded-[6px] bg-primary-foreground px-6 text-sm text-primary hover:bg-primary-foreground/90"
              >
                {isSignedIn ? "Go to dashboard" : "Get started free"}
                <ArrowRight className="size-4" />
              </Button>
              {!isSignedIn && (
                <p className="text-sm text-primary-foreground/70">
                  Already practicing?{" "}
                  <button
                    type="button"
                    onClick={onLogin}
                    className="font-medium text-primary-foreground underline-offset-4 hover:underline"
                  >
                    Log in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mascot on a light stage, breaking out of the band's top edge */}
        <div
          aria-hidden="true"
          className="absolute -top-20 left-1/2 flex -translate-x-1/2 items-end justify-center md:-top-14 md:right-10 md:left-auto md:translate-x-0 lg:right-16"
        >
          <img src={twinkle} alt="" className="absolute -top-2 -left-8 h-7 w-9 object-contain" />
          <img src={twinkle} alt="" className="absolute top-1/3 -right-10 h-5 w-6 rotate-12 object-contain" />
          <div className="relative flex size-36 items-end justify-center rounded-full bg-white shadow-xl ring-8 ring-white/15 md:size-64">
            <img
              src={mascot}
              alt=""
              className="-mb-1 h-40 object-contain md:h-72"
            />
          </div>
          <span className="absolute -bottom-3 -left-6 hidden items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-md md:inline-flex">
            <span className="size-2 rounded-full bg-(--preparo-teal)" />
            84/100
          </span>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <img src="/icon-preparo.png" alt="" className="h-6 w-8" />
          <span className="font-medium text-foreground">Preparo</span>
        </div>
        <p>© {new Date().getFullYear()} Preparo. Practice smarter. Interview better.</p>
      </div>
    </footer>
  );
}
