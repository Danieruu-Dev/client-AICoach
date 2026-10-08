import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface PracticeInterviewSectionProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

interface PracticeInterviewSectionListProps {
  practiceOptions: PracticeInterviewSectionProps[];
}
function PracticeInterviewSection({
  practiceOptions,
}: PracticeInterviewSectionListProps) {
  return (
    <section
      className="rounded-[8px] border border-border bg-card p-5 shadow-sm sm:p-6"
      aria-labelledby="quick-practice-heading"
    >
      <div>
        <h2 id="quick-practice-heading" className="text-base font-semibold">
          Quick practice
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Practice a topic outside your roadmap
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
        {practiceOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.title}
              type="button"
              className="flex min-h-20 items-center gap-3 rounded-[6px] border border-border bg-background p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-muted text-foreground">
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  {option.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  {option.subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <Button
        variant="outline"
        className="mt-5 w-full rounded-[6px] shadow-none"
      >
        View all practice options
      </Button>
    </section>
  );
}

export default PracticeInterviewSection;
