import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, type LucideIcon } from "lucide-react";

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
    <section className="p-5 sm:p-6" aria-labelledby="quick-practice-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="quick-practice-heading" className="text-sm font-semibold">
            Quick practice
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Practice a topic outside your roadmap
          </p>
        </div>
        <Button variant="ghost" size="lg" className="text-muted-foreground">
          View all
          <ArrowRight />
        </Button>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {practiceOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.title}
              type="button"
              className="group flex cursor-pointer items-center gap-3 rounded-md border p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {option.title}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {option.subtitle}
                </span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default PracticeInterviewSection;
