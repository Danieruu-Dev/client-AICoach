import {
  BarChart3,
  // Braces,
  CheckCircle2,
  // CircleUserRound,
  Flame,
  // GitBranch,
  // Layers3,
  // MessageCircleMore,
  // ServerCog,
  Trophy,
} from "lucide-react";

// import ModeToggle from "@/components/mode-toggle";

import RoadmapSection from "./RoadmapSection";
import MetricCard from "@/features/dashboard/components/MetricCard";
// import PracticeInterviewSection from "./PracticeInterviewSection";
import RecentActivitySection from "./RecentActivitySection";
// import RoadmapSwitcher from "@/components/shared/RoadmapSwitcher";

type RoadmapOverviewProps = {
  firstName?: string;
};

// const practiceOptions = [
//   { title: "React", subtitle: "Frontend", icon: Braces },
//   { title: "Git", subtitle: "Core skills", icon: GitBranch },
//   { title: "HTTP & APIs", subtitle: "Web concepts", icon: ServerCog },
//   { title: "Behavioral", subtitle: "Soft skills", icon: CircleUserRound },
//   { title: "Project review", subtitle: "Deep dive", icon: Layers3 },
//   {
//     title: "Mock interview",
//     subtitle: "Full practice",
//     icon: MessageCircleMore,
//   },
// ];

export default function RoadmapOverview({ firstName }: RoadmapOverviewProps) {
  const displayName = firstName?.trim() || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <section className="min-h-screen flex-1 bg-muted/20 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8 xl:pb-6 xl:pt-6">
      <div className="mx-auto max-w-360">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight xl:text-2xl">
              {greeting}, {displayName}!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground xl:mt-1">
              Let&apos;s practice and get better every day.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* <RoadmapSwitcher /> */}
            {/* <ModeToggle /> */}
          </div>
        </header>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0 space-y-5">
            <RoadmapSection />

            {/* Roadmap Metrics */}
            <div className="grid gap-px overflow-hidden rounded-[8px] border bg-border shadow-sm sm:grid-cols-2 2xl:grid-cols-4">
              <MetricCard
                icon={BarChart3}
                label="Overall progress"
                value="0%"
                detail="0 of 25 questions"
                progress={0}
              />
              <MetricCard
                icon={CheckCircle2}
                label="Questions answered"
                value="0"
                detail="Across all stages"
              />
              <MetricCard
                icon={Trophy}
                label="Average score"
                value="—"
                detail="Complete a question to begin"
              />
              <MetricCard
                icon={Flame}
                label="Current streak"
                value="0 days"
                detail="Start practicing today"
              />
            </div>

            {/* <div className="overflow-hidden rounded-[8px] border bg-card shadow-sm">
              <PracticeInterviewSection practiceOptions={practiceOptions} />
            </div> */}
          </div>

          <div className="overflow-hidden rounded-[8px] border bg-card shadow-sm">
            <RecentActivitySection />
          </div>
        </div>
      </div>
    </section>
  );
}
